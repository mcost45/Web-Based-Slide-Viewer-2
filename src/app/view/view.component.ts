import { AppConstants } from '../app.constants';
import {Component, Input, OnInit, OnChanges, NgZone} from '@angular/core';
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
  // import component constants
  readonly DEFAULT_VMIC = AppConstants.DEFAULT_VMIC;
  readonly DZC_OUTPUT_DIR = AppConstants.DZC_OUTPUT_DIR;
  readonly DEFAULT_ZIP_DATA_TYPE = AppConstants.DEFAULT_ZIP_DATA_TYPE;
  readonly VMIC_LOCATION = AppConstants.VMIC_LOCATION;
  readonly PYRAMID_FILE = AppConstants.PYRAMID_FILE;
  readonly XML_ELEMENT = AppConstants.XML_ELEMENT;
  readonly XML_ELEMENT_SIZE = AppConstants.XML_ELEMENT_SIZE;
  readonly XML_ATTRIBUTES = AppConstants.XML_ATTRIBUTES;
  readonly OSD_SETTINGS = AppConstants.OSD_SETTINGS;
  // store zip object
  private zipVMIC: JSZip;
  // store OSD view object
  private view: OSD.Viewer;

  // inputs for adjustment filter values
  @Input() brightness = 0;
  @Input() contrast = 0;
  @Input() saturation = 0;

  // initialise store and JSZip
  constructor(private store: Store<AppState>, private zone: NgZone) {
    this.zipVMIC = new JSZip();
  }

  // static utility functions
  private static getFileNameFromPath(path: string): string {
    return path.split('\\').pop().split('/').pop();
  }
  private static removeFileExtension(file: string): string {
    return file.replace(/\.[^/.]+$/, '');
  }
  private static getCoords(X_Y: string): string[] {
    return X_Y.split('_');
  }
  private static updateFilters(element: HTMLElement, contrast: number, brightness: number, saturation: number): void {
    element.style.filter = 'brightness(' + (100 + brightness) + '%) ' +
      'contrast(' + (100 + contrast) + '%) ' +
      'saturate(' + (100 + saturation) + '%)';
  }

  ngOnInit(): void {
    // begin unzipping .vmic & loading OSD view with the tiles
    this.loadView();
  }

  // update adjustment filters on input changes
  ngOnChanges(): void {
    if (this.view != null) {
      ViewComponent.updateFilters(this.view.drawer.canvas, this.contrast, this.brightness, this.saturation);
    }
  }

  // main component function - goes through the process of loading the default .vmic, then initialising OSD to show it
  // it is structured using callback functions rather than awaits/thens, helps display the nested nature of the unzip
  private loadView(): void {
    // run the loading process outside of the angular zone - it is mainly long-running async unzipping/looking through
    // files which will prevent the zone from stabilising to be used in e2e tests - only run store dispatches or code
    // that needs to update component visuals back within the zone again
    this.zone.runOutsideAngular(() => {
      const vmicPath = this.VMIC_LOCATION + this.DEFAULT_VMIC;
      // unzip the .vmic file, then run callback
      this.unzipBase(vmicPath, this.zipVMIC, (VMICI) => {
        // unzip the Image/.vmici file, then run callback
        this.unzipNested(VMICI, this.DEFAULT_ZIP_DATA_TYPE, this.DZC_OUTPUT_DIR, (contents) => {
          // retrieve the dzc output xml settings & all tiles in an array, stored as blob URLs, then run callback
          this.getDzcOutput(contents, this.PYRAMID_FILE, (file, outputBlobs) => {
            // runs very minimal checks for missing content; needs expanding on
            this.validateResults(file, outputBlobs);
            // loading has completed, loading state: 100
            this.zone.run(() => {
              this.store.dispatch(new SetProgress(100));
            });
            // no longer need to keep zip object in memory
            this.zipVMIC = null;
            // get OSD settings from DZC Output XML
            file.text().then((text) => {
              const XMLSettings = this.processXMLFile(text);
              const imageOptionAttributes = XMLSettings[0];
              const imageSizeOptionAttributes = XMLSettings[1];
              // load OSD with the tiles
              this.initiateOSD(imageOptionAttributes, imageSizeOptionAttributes, outputBlobs);
            });
          });
        });
      });
    });
  }

  // unzip a zip file in path
  private unzipBase(file: string, zipObject: JSZip, onComplete: (unzipped: JSZip) => void): void {
    // convert zip to binary first then load content asynchronously
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

  // unzip a nested zip file within an unzipped zip file (contents stored in memory)
  private unzipNested(zipObject: JSZip, dataType: any, path: string, onComplete: (unzipped: JSZip) => void): void {
    let percent;
    let newPercent;
    zipObject.file(path).async(dataType, (progress) => {
      // update new loading percentage states
      percent = Math.round(progress.percent * 0.99);
      if (percent !== newPercent) {
        newPercent = percent;
        this.zone.run(() => {
          this.store.dispatch(new SetProgress(newPercent));
        });
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
    // set up vars to retrieve tiles from zip files
    let zoomLevel = 0;
    let fileSearch: RegExp = new RegExp('dzc_output_files\\\\' + zoomLevel);
    let fileSearchResults: JSZip.JSZipObject[] = contents.file(fileSearch);
    let len: number = fileSearchResults.length;
    // 3D array to contain tile blob URLs: [level][x][y]
    const blobUrls: URL[][][] = [];
    // iterate through tiles at different zoom levels, generating blob URLS to be stored in array[level][x][y]
    // stop once no results are returned -> all existing zoom level directories have been processed
    while (len !== 0) {
      // closure with trackVars to maintain loop vars within asynchronous functions
      (trackVars => {
        // initialise empty array at current zoom level
        blobUrls[trackVars.zoomLevel] = [];
        // process each of the tile files at current zoom level
        fileSearchResults.forEach((value, index) => {
          const resultFilePath = value.name;
          const resultFileName = ViewComponent.removeFileExtension(ViewComponent.getFileNameFromPath(resultFilePath));
          const xPos = ViewComponent.getCoords(resultFileName)[0];
          const yPos = ViewComponent.getCoords(resultFileName)[1];
          if (blobUrls[trackVars.zoomLevel][xPos] === undefined) {
            blobUrls[trackVars.zoomLevel][xPos] = [];
          }
          // generate a blob for the tile then its URL, store in array
          value.async('blob').then((file) => {
            blobUrls[trackVars.zoomLevel][xPos][yPos] = URL.createObjectURL(file);
            contents.file(filename).async('blob').then((filePyramid) => {
              if (index === (trackVars.len - 1) && trackVars.zoomLevel === this.OSD_SETTINGS.MAX_LEVEL) {
                onComplete(filePyramid, blobUrls);
              }
            });
          });
        });
      })({zoomLevel, len});
      // update search vars for next iteration of loop at incrementing zoom levels
      fileSearch = new RegExp('dzc_output_files\\\\' + ++zoomLevel + '\\\\');
      fileSearchResults = contents.file(fileSearch);
      len = fileSearchResults.length;
    }
  }

  private validateResults(file: Blob, outputBlobs: URL[][][]): void {
    if (!file) {
      console.log('Could not find ' + this.PYRAMID_FILE);
      process.exit(1);
    }
    if (outputBlobs.length === 0) {
      console.log('Could not load output files');
      process.exit(1);
    }
  }

  private processXMLFile(contents: string): XMLJS.Element | XMLJS.ElementCompact {
    const xmlObject = XMLJS.xml2js(contents, {
      compact: true,
      ignoreDeclaration: true,
      nativeType: true
    });
    const imageOptionAttributes = xmlObject[this.XML_ELEMENT][this.XML_ATTRIBUTES];
    const imageSizeOptionAttributes = xmlObject[this.XML_ELEMENT][this.XML_ELEMENT_SIZE][this.XML_ATTRIBUTES];
    return [imageOptionAttributes, imageSizeOptionAttributes];
  }

  private initiateOSD(imageOptions, sizeOptions, blobs): void {
    // initiate OpenSeadragon with options and loaded tiles
    this.view = OSD({
      id: this.OSD_SETTINGS.WRAPPER_ID,
      showNavigationControl: this.OSD_SETTINGS.SHOW_NAVIGATION_CONTROL,
      showNavigator: this.OSD_SETTINGS.SHOW_NAVIGATOR,
      navigatorPosition: this.OSD_SETTINGS.NAVIGATOR_POSITION,
      navigatorLeft: this.OSD_SETTINGS.NAVIGATOR_LEFT,
      navigatorTop: this.OSD_SETTINGS.NAVIGATOR_TOP,
      navigatorWidth: this.OSD_SETTINGS.NAVIGATOR_WIDTH,
      navigatorHeight: this.OSD_SETTINGS.NAVIGATOR_HEIGHT,
      navigatorAutoResize: this.OSD_SETTINGS.NAVIGATOR_AUTO_RESIZE,
      navigatorAutoFade: this.OSD_SETTINGS.NAVIGATOR_AUTO_FADE,
      navigatorMaintainSizeRatio: this.OSD_SETTINGS.NAVIGATOR_MAINTAIN_SIZE_RATIO,
      navigatorBorderColor: this.OSD_SETTINGS.NAVIGATOR_BORDER_COLOR,
      navigatorOpacity: this.OSD_SETTINGS.NAVIGATOR_OPACITY,
      visibilityRatio: this.OSD_SETTINGS.VISIBILITY_RATIO,
      zoomPerScroll: this.OSD_SETTINGS.ZOOM_PER_SCROLL,
      gestureSettingsMouse: this.OSD_SETTINGS.GESTURE_SETTINGS_MOUSE,
      tileSources: {
        height: parseInt(sizeOptions.Height, 10),
        width: parseInt(sizeOptions.Width, 10),
        tileSize: parseInt(imageOptions.TileSize, 10),
        tileOverlap: parseInt(imageOptions.Overlap, 10),
        maxLevel: this.OSD_SETTINGS.MAX_LEVEL,
        minLevel: this.OSD_SETTINGS.MIN_LEVEL,
        getTileUrl: (level, x, y) => {
          return blobs[level][x][y];
        }
      }
    });
    // making adjustments to some OSD elements
    this.view.navigator.element.classList.add('mat-elevation-z6', 'card-border-radius');
    this.view.drawer.canvas.id = 'osd-main-canvas';
    // initialise the canvas with no filters (useful for testing)
    ViewComponent.updateFilters(this.view.drawer.canvas, 0, 0, 0);
  }
}
