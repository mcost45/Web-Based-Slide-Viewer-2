import { browser, ElementFinder, logging, ExpectedConditions } from 'protractor';
import { AppPage } from './app.po';
import { performance } from 'perf_hooks';

// TEST SETTINGS
// defining milliseconds as second
const SECOND = 1000;
// max time test will wait for the .vmic to load
const VMIC_WAIT_LIMIT = 26 * SECOND;
// preciseness of the output of the .vmic load time
const TIMING_LOG_PRECISION = 4;
// whether the loading time is logged or not
const LOG_VMIC_LOADING_TIME = true;
// options for controlling a drag and drop gesture
const SLIDER_MOVE_X_DIST = 100;
const SLIDER_MOVE_Y_DIST = 0;
// for an issue where protractor wasn't positioning the mouse on sliders correctly
// before a slider drag and drop it will change its y position by this amount
const CORRECT_SLIDER_Y_AMOUNT = -10;
// set to test for which filter value is set initially and after the drag and drop
// by default, the drag and drop will take the slider from unchanged to its max
// 1 -> 100%, unchanged
const BEFORE_FILTER_VALUE = 1;
// 2 -> 200%, max filter value
const AFTER_FILTER_VALUE = 2;

let page: AppPage;
let startLoadTime: DOMHighResTimeStamp;
let endLoadTime: DOMHighResTimeStamp;
let sliders: Array<ElementFinder>;

describe('Viewer App', () => {
  // run once before all the tests
  beforeAll(async () => {
    page = await new AppPage();
    await browser.waitForAngularEnabled(true);
    await page.navigateTo();
    await browser.manage().window().maximize();
    sliders = await page.getAllSliders();
    startLoadTime = performance.now();
  });

  // TESTS
  // make sure the initial elements load with proper classes
  it('loads initial elements', async () => {
    expect(await page.getClassesOfEl(await page.getHeaderEl())).toContain(page.getHeaderExpectedClass());
    expect(await page.getClassesOfEl(await page.getPageContentEl())).toContain(page.getPageContentExpectedClass());
    expect(await (await page.getLoadingCardEl()).isPresent()).toBe(true);
    expect(await (await page.getViewerCardEl()).isPresent()).toBe(true);
    expect(await (await page.getViewerEl()).isPresent()).toBe(true);
    expect(await (await page.getOSDWrapperEl()).isPresent()).toBe(true);
  });
  // wait for/make sure the default .vmic is able to load
  it('loads default vmic within ' + (VMIC_WAIT_LIMIT / 1000) + 's and sliders work', async () => {
    await browser.wait(
      ExpectedConditions.invisibilityOf((await page.getLoadingCardInnerEl()))
      , VMIC_WAIT_LIMIT, '.vmic took over ' + (VMIC_WAIT_LIMIT / SECOND) + 's to load!');
    endLoadTime = performance.now();
    if (LOG_VMIC_LOADING_TIME) {
      console.log('Loaded .vmic in ' + ((endLoadTime - startLoadTime) / SECOND).toPrecision(TIMING_LOG_PRECISION) + 's');
    }
  });
  // make sure using a slider actually sets that filter on the OSD canvas
  it('has sliders that adjust filters correctly', async () => {
    expect(await (await page.getViewerSettingsEl()).isDisplayed()).toBe(true);
    let current;
    let slider;
    let canvasFilters;
    // in order, test each slider
    let i = 0;
    const len = sliders.length;
    while (i < len) {
      slider = sliders[i];
      // check before filters are not set
      canvasFilters = await getFiltersSplit(await page.getOSDMainCanvasEl());
      current = canvasFilters[i];
      await expect(current.slice(current.length - 3)).toBe('(' + BEFORE_FILTER_VALUE + ')');
      // perform the drag and drop
      await dragAndDropSlider(slider);
      // check after if filters are set
      canvasFilters = await getFiltersSplit(await page.getOSDMainCanvasEl());
      current = canvasFilters[i];
      await expect(current.slice(current.length - 3)).toBe('(' + AFTER_FILTER_VALUE + ')');
      ++i;
    }
  });

  // run after each test
  afterEach(async () => {
    // assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});

// DEFINED ACTIONS
// function to imitate a drag and drop on a slider element
async function dragAndDropSlider(el: ElementFinder): Promise<void> {
  // putting these actions into one sequence would not work - but when separate they do
  await browser.actions().mouseMove(el).perform();
  await browser.actions().mouseMove({x: 0, y: CORRECT_SLIDER_Y_AMOUNT}).perform();
  await browser.actions().mouseDown().perform();
  await browser.actions().mouseMove({x: SLIDER_MOVE_X_DIST, y: SLIDER_MOVE_Y_DIST}).perform();
  await browser.actions().mouseUp().perform();
  await browser.sleep(300);
}

// EXTRA UTILITY FUNCTIONS
async function getFiltersSplit(el: ElementFinder): Promise<Array<string>> {
  return (await el.getCssValue('filter')).split(' ');
}
