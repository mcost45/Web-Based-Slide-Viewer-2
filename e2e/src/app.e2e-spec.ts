import { browser, logging } from 'protractor';
import { AppPage } from './app.po';
import { performance } from 'perf_hooks';

const SECOND = 1000;
const VMIC_WAIT_LIMIT = 26 * SECOND;
let page: AppPage;
let startLoadTime: DOMHighResTimeStamp;

describe('Viewer App', () => {
  // run once before all the tests
  beforeAll(async () => {
    page = await new AppPage();
    await browser.waitForAngularEnabled(true);
    await page.navigateTo();
    startLoadTime = await performance.now();
  });

  // tests
  it('loads initial elements', async () => {
    await expect(await page.getElementClasses('#header')).toContain('mat-elevation-z6 elevate-z-2');
    await expect(await page.getElementClasses('#page-content')).toContain('flex-fill pos-relative');
    await expect(await (await page.getElement('#loading-card')).isPresent()).toBe(true);
    await expect(await (await page.getElement('#viewer-settings')).isPresent()).toBe(true);
    await expect(await (await page.getElement('#viewer')).isPresent()).toBe(true);
    await expect(await (await page.getElement('#osd-wrapper')).isPresent()).toBe(true);
  });

  it('loads default vmic within ' + (VMIC_WAIT_LIMIT / 1000) + 's and sliders work', async () => {
    let finishedLoadTime: DOMHighResTimeStamp;
    const waitForElementTag = '#loading-card-inner';
    browser.waitForAngularEnabled(false);
    await browser.wait(
      async () => {
        const classes = await page.getElementClasses(waitForElementTag);
        return classes.includes('hidden');
      }, VMIC_WAIT_LIMIT, '.vmic took over ' + (VMIC_WAIT_LIMIT / SECOND) + 's to load!');
    finishedLoadTime = await performance.now();
    console.log('    Loaded .vmic in ' + ((finishedLoadTime - startLoadTime) / 1000).toPrecision(4) + 's');
  });

  it('has sliders that adjust filters correctly', async () => {
    await expect(await (await page.getElement('#viewer-settings')).isDisplayed()).toBe(true);
    const brightnessSlider = await page.getElement('#brightness-slider');
    await browser.actions().dragAndDrop(
      brightnessSlider,
      {x: 300, y: 0}
    ).perform();
    const canvasFilters = (await (await page.getElement('#osd-main-canvas')).getCssValue('filter')).split(';');
    console.log(canvasFilters);
    // await expect(await ().isDisplayed()).toBe(true);
  });

  // run after each test
  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
