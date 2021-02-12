import { AppConstants } from '../app.constants';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { SetProgress } from '../app.actions';
import { AppState } from '../app.reducer';
import * as OSD from 'openseadragon';
import * as JSZip from 'jszip';
import * as JSZipUtils from 'jszip-utils/dist/jszip-utils.js';
import * as XMLJS from 'xml-js';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit, OnChanges {
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
  private view: OSD.Viewer;
  constructor(private store: Store<AppState>) {
    this.zipVMIC = new JSZip();
  }

  @Input() brightness: number;
  @Input() contrast: number;
  @Input() saturation: number;
  ngOnInit(): void {
    this.loadView();
  }
  ngOnChanges(): void {
    if (this.view != null) {
      this.updateFilters(this.view.drawer.canvas, this.contrast, this.brightness, this.saturation);
    }
  }

  private loadView(): void {
    const vmicPath = this.VMIC_LOCATION + this.DEFAULT_VMIC;
    let TSOptionsAttributes: object;
    let TSOptionsSizeAttributes: object;
    let xmlObject: XMLJS.Element | XMLJS.ElementCompact;
    this.unzipBase(vmicPath, this.zipVMIC, (VMICI) => {
      this.unzipNested(VMICI, this.DEFAULT_ZIP_DATA_TYPE, this.DZC_OUTPUT_DIR, (contents) => {
        this.getDzcOutput(contents, this.PYRAMID_FILE, (file, outputBlobs) => {
          this.store.dispatch(new SetProgress(100));
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
    let percent;
    let newPercent;
    zipObject.file(path).async(dataType, (progress) => {
      percent = Math.round(progress.percent * 0.99);
      if (percent !== newPercent) {
        newPercent = percent;
        this.store.dispatch(new SetProgress(newPercent));
      }
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
      navigatorOpacity: 1,
      visibilityRatio: 0.7,
      zoomPerScroll: 1.55,
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
    this.view['navigator'].element.classList.add('mat-elevation-z6', 'card-border-radius');
  }
  // setProgress(value) {
  //   this.store.dispatch();
  // }
  private getFileNameFromPath(path: string): string {
    return path.split('\\').pop().split('/').pop();
  }
  private removeFileExtension(file: string): string {
    return file.replace(/\.[^/.]+$/, '');
  }
  private getCoords(X_Y: string): string[] {
    return X_Y.split('_');
  }
  private updateFilters(element: HTMLElement, contrast: number, brightness: number, saturation: number): void {
    element.style.filter = 'contrast(' + (100 + contrast) + '%) ' +
      'brightness(' + (100 + brightness) + '%) ' +
      'saturate(' + (100 + saturation) + '%)';
  }
}
