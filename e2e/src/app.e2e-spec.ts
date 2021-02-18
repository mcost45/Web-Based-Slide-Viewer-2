import { browser, by, element, logging, protractor, $ } from 'protractor';
import { AppPage } from './app.po';
import { performance } from 'perf_hooks';

describe('Viewer App', () => {
  const SECOND = 1000;
  const VMIC_WAIT_LIMIT = 30 * SECOND;
  const EC = protractor.ExpectedConditions;
  let page: AppPage;
  let startLoadTime: DOMHighResTimeStamp;

  // run once before all the tests
  beforeAll(async () => {
    page = new AppPage();
    await browser.waitForAngularEnabled(true);
    await page.navigateTo();
    startLoadTime = performance.now();
  });

  // tests
  it('loads initial elements', async () => {
    expect(await page.getElementClasses('#header')).toContain('mat-elevation-z6 elevate-z-2');
    expect(await page.getElementClasses('#page-content')).toContain('flex-fill pos-relative');
    expect(await (await page.getElement('#loading-card')).isPresent()).toBe(true);
    expect(await (await page.getElement('#viewer-settings')).isPresent()).toBe(true);
    expect(await (await page.getElement('#viewer')).isPresent()).toBe(true);
    expect(await (await page.getElement('#osd-wrapper')).isPresent()).toBe(true);
  });
  it('loads default vmic within ' + (vmicWaitLimit / 1000) + 's', async (done) => {
    let finishedLoadTime;
    // browser.waitForAngularEnabled(false);
    const target = await page.getElement('#loading-card-inner');
    browser.wait(
      () => {
        return target.getAttribute('class').then((classes) => {
          return classes.includes('hidden');
         });
      }, vmicWaitLimit, '.vmic took over ' + (vmicWaitLimit / second) + 's to load!'
    ).then(() => {
        finishedLoadTime = performance.now();
        console.log('Loaded .vmic in ' + ((finishedLoadTime - startLoadTime) / 1000).toPrecision(4) + 's');
        done();
    }, (error) => {
      console.log(error);
    });
    // expect(await (await page.getElement('#viewer-settings')).isDisplayed()).toBe(true);
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
