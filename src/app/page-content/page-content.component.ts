import {AppConstants} from '../app.constants';
import {Component, OnInit, AfterViewInit} from '@angular/core';
import * as OSD from 'openseadragon';
import * as JSZip from 'jszip';
import * as JSZipUtils from 'jszip-utils/dist/jszip-utils.js';
import * as XMLJS from 'xml-js';

@Component({
  selector: 'app-page-content',
  templateUrl: './page-content.component.html',
  styleUrls: ['./page-content.component.scss']
})
export class PageContentComponent implements OnInit, AfterViewInit {
  progressValue: number;
  readonly DEFAULT_VMIC = AppConstants.DEFAULT_VMIC;
  readonly DZC_OUTPUT_DIR = AppConstants.DZC_OUTPUT_DIR;
  readonly DEFAULT_ZIP_DATA_TYPE = AppConstants.DEFAULT_ZIP_DATA_TYPE;
  readonly VMIC_LOCATION = AppConstants.VMIC_LOCATION;
  readonly PYRAMID_FILE = AppConstants.PYRAMID_FILE;
  readonly XML_ELEMENT = AppConstants.XML_ELEMENT;
  readonly XML_ELEMENT_SIZE = AppConstants.XML_ELEMENT_SIZE;
  readonly XML_ATTRIBUTES = AppConstants.XML_ATTRIBUTES;
  readonly VMIC_MAX_ZOOM = AppConstants.VMIC_MAX_ZOOM;
  private zipVMIC: JSZip;
  private view: object;
  constructor() {
    this.zipVMIC = new JSZip();
    this.progressValue = 0;
  }
  ngOnInit(): void {
    this.loadView();
  }
  ngAfterViewInit(): void {
    document.getElementById('loading-text').innerHTML = 'Loading ' + this.DEFAULT_VMIC.toUpperCase() + '...';
  }

  private loadView(): void {
    const vmicPath = this.VMIC_LOCATION + this.DEFAULT_VMIC;
    let TSOptionsAttributes: object;
    let TSOptionsSizeAttributes: object;
    let xmlObject: XMLJS.Element | XMLJS.ElementCompact;
    this.unzipBase(vmicPath, this.zipVMIC, (VMICI) => {
      this.unzipNested(VMICI, this.DEFAULT_ZIP_DATA_TYPE, this.DZC_OUTPUT_DIR, (contents) => {
        this.getDzcOutput(contents, this.PYRAMID_FILE, (file, outputBlobs) => {
          this.progressValue = 100;
          if (!file) {
            console.log('Could not find ' + this.PYRAMID_FILE);
            return 0;
          }
          if (outputBlobs.length === 0) {
            console.log('Could not load output files');
            return 0;
          }
          this.zipVMIC = null;
          file.text().then(text => {
            xmlObject = XMLJS.xml2js(text, {
              compact: true,
              ignoreDeclaration: true,
              nativeType: true
            });
            TSOptionsAttributes = xmlObject[this.XML_ELEMENT][this.XML_ATTRIBUTES];
            TSOptionsSizeAttributes = xmlObject[this.XML_ELEMENT][this.XML_ELEMENT_SIZE][this.XML_ATTRIBUTES];
            this.initiateOSD(TSOptionsAttributes, TSOptionsSizeAttributes, outputBlobs);
          });
        });
      });
    });
  }
  private unzipBase(file: string, zipObject: JSZip, onComplete: (unzipped: JSZip) => void): void {
    JSZipUtils.getBinaryContent(file, (err, data) => {
      if (err) {
        throw err;
      }
      zipObject.loadAsync(data, {
        createFolders: true
      }).then((unzipped) => {
        onComplete(unzipped);
      });
    });
  }
  private unzipNested(zipObject: JSZip, dataType: any, path: string, onComplete: (unzipped: JSZip) => void): void {
    zipObject.file(path).async(dataType, (progress) => {
      this.progressValue = progress.percent * 0.99;
    }).then((unzipped) => {
      zipObject.loadAsync(unzipped).then((contents) => {
        onComplete(contents);
      });
    }, (err) => {
      throw err;
    });
  }
  private getDzcOutput(contents: JSZip, filename: string, onComplete: (file: Blob, outputBlobs: URL[][][]) => void): void {
    let zoomLevel = 0;
    let fileSearch: RegExp = new RegExp('dzc_output_files\\\\' + zoomLevel);
    let fileSearchResults: JSZip.JSZipObject[] = contents.file(fileSearch);
    let len: number = fileSearchResults.length;
    const blobUrls: URL[][][] = [];
    const totalFileCount: number = contents.file(new RegExp('dzc_output_files\\\\[0-9]+')).length;
    const progressPerFile: number = 0.05 / totalFileCount;
    while (len !== 0) {
      (trackVars => {
        blobUrls[trackVars.zoomLevel] = [];
        fileSearchResults.forEach((value, index) => {
          const resultFilePath = value.name;
          const resultFileName = this.removeFileExtension(this.getFileNameFromPath(resultFilePath));
          const xPos = this.getCoords(resultFileName)[0];
          const yPos = this.getCoords(resultFileName)[1];
          if (blobUrls[trackVars.zoomLevel][xPos] === undefined) {
            blobUrls[trackVars.zoomLevel][xPos] = [];
          }
          value.async('blob').then((file) => {
            blobUrls[trackVars.zoomLevel][xPos][yPos] = URL.createObjectURL(file);
            contents.file(filename).async('blob').then((filePyramid) => {
              if (index === (trackVars.len - 1) && trackVars.zoomLevel === this.VMIC_MAX_ZOOM) {
                onComplete(filePyramid, blobUrls);
              }
            });
          });
        });
      })({zoomLevel, len});
      fileSearch = new RegExp('dzc_output_files\\\\' + ++zoomLevel + '\\\\');
      fileSearchResults = contents.file(fileSearch);
      len = fileSearchResults.length;
    }
  }
  private initiateOSD(imageOptions, sizeOptions, blobs): void {
    this.view = OSD({
      id: 'osd-wrapper',
      showNavigationControl: false,
      showNavigator: true,
      navigatorPosition: 'ABSOLUTE',
      navigatorLeft: '16px',
      navigatorTop: '16px',
      navigatorWidth: '124px',
      navigatorHeight: '100px',
      navigatorAutoResize: false,
      navigatorAutoFade: false,
      navigatorMaintainSizeRatio: false,
      navigatorBorderColor: 'none',
      navigatorDisplayRegionColor: '#0000FF',
      navigatorOpacity: 0.65,
      gestureSettingsMouse: {
        clickToZoom: false,
        dblClickToZoom: true
      },
      tileSources: {
        height: parseInt(sizeOptions['Height'], 10),
        width: parseInt(sizeOptions['Width'], 10),
        tileSize: parseInt(imageOptions['TileSize'], 10),
        tileOverlap: parseInt(imageOptions['Overlap'], 10),
        maxLevel: this.VMIC_MAX_ZOOM,
        minLevel: 10,
        getTileUrl: (level, x, y) => {
          return blobs[level][x][y];
        }
      }
    });
    this.view['navigator'].element.classList.add('mat-elevation-z6');
  }
  private getFileNameFromPath(path: string): string {
    return path.split('\\').pop().split('/').pop();
  }
  private removeFileExtension(file: string): string {
    return file.replace(/\.[^/.]+$/, '');
  }
  private getCoords(X_Y: string): string[] {
    return X_Y.split('_');
  }

}
