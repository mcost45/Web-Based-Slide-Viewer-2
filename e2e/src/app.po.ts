import { browser, by, element, ElementFinder } from 'protractor';

// set the css selectors used to select individual elements
const HEADER_HANDLE = '#header';
const PAGE_CONTENT_HANDLE = '#page-content';
const LOADING_CARD_HANDLE = '#loading-card';
const LOADING_CARD_INNER_HANDLE = '#loading-card-inner';
const VIEWER_CARD_HANDLE = '#viewer-settings';
const VIEWER_HANDLE = '#viewer';
const OSD_WRAPPER_HANDLE = '#osd-wrapper';
const VIEWER_SETTINGS_HANDLE = '#viewer-settings';
const BRIGHTNESS_SLIDER_HANDLE = '#brightness-slider';
const CONTRAST_SLIDER_HANDLE = '#contrast-slider';
const SATURATION_SLIDER_HANDLE = '#saturation-slider';
const OSD_MAIN_CANVAS_HANDLE = '#osd-main-canvas';

// set values to be used in tests for individual elements
const HEADER_EXPECTED_CLASS = 'mat-elevation-z6 elevate-z-2';
const PAGE_CONTENT_EXPECTED_CLASS = 'flex-fill pos-relative';

export class AppPage {
  // loads the baseUrl
  async navigateTo(): Promise<unknown> {
    return browser.get(browser.baseUrl);
  }

  // functions for getting individual elements for testing
  async getHeaderEl(): Promise<ElementFinder> {
    return await this.getElement(HEADER_HANDLE);
  }
  async getPageContentEl(): Promise<ElementFinder> {
    return await this.getElement(PAGE_CONTENT_HANDLE);
  }
  async getLoadingCardEl(): Promise<ElementFinder> {
    return await this.getElement(LOADING_CARD_HANDLE);
  }
  async getLoadingCardInnerEl(): Promise<ElementFinder> {
    return await this.getElement(LOADING_CARD_INNER_HANDLE);
  }
  async getViewerCardEl(): Promise<ElementFinder> {
    return await this.getElement(VIEWER_CARD_HANDLE);
  }
  async getViewerEl(): Promise<ElementFinder> {
    return await this.getElement(VIEWER_HANDLE);
  }
  async getOSDMainCanvasEl(): Promise<ElementFinder> {
    return await this.getElement(OSD_MAIN_CANVAS_HANDLE);
  }
  async getOSDWrapperEl(): Promise<ElementFinder> {
    return await this.getElement(OSD_WRAPPER_HANDLE);
  }
  async getViewerSettingsEl(): Promise<ElementFinder> {
    return await this.getElement(VIEWER_SETTINGS_HANDLE);
  }
  async getBrightnessSliderEl(): Promise<ElementFinder> {
    return await this.getElement(BRIGHTNESS_SLIDER_HANDLE);
  }
  async getContrastSliderEl(): Promise<ElementFinder> {
    return await this.getElement(CONTRAST_SLIDER_HANDLE);
  }
  async getSaturationSliderEl(): Promise<ElementFinder> {
    return await this.getElement(SATURATION_SLIDER_HANDLE);
  }
  // returns an array of all adjustment sliders
  async getAllSliders(): Promise<Array<ElementFinder>> {
    return [
      await this.getBrightnessSliderEl(),
      await this.getContrastSliderEl(),
      await this.getSaturationSliderEl()
    ];
  }

  // functions for getting expected testing values
  getHeaderExpectedClass(): string {
    return HEADER_EXPECTED_CLASS;
  }
  getPageContentExpectedClass(): string {
    return PAGE_CONTENT_EXPECTED_CLASS;
  }

  // general functions used to implement the more specific functions above
  async getElement(tag: string): Promise<ElementFinder> {
    return element(by.css(tag));
  }
  async getClassesBySelector(tag: string): Promise<string> {
    return element(by.css(tag)).getAttribute('class');
  }
  async getClassesOfEl(el: ElementFinder): Promise<string> {
    return el.getAttribute('class');
  }
}
