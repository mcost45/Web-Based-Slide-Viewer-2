import { browser, logging } from 'protractor';
import { AppPage } from './app.po';

describe('Viewer App', () => {
  let page: AppPage;
  const second = 1000;
  // run before every test
  beforeEach(() => {
    page = new AppPage();
  });
  // tests
  it('loads initial elements', async () => {
    browser.waitForAngularEnabled(false);
    await page.navigateTo();
    expect(await page.getElementClasses('header')).toContain('mat-elevation-z6 elevate-z-2');
    expect(await page.getElementClasses('page-content')).toContain('flex-fill pos-relative');
    expect(await (await page.getElement('loading-card')).isPresent()).toBe(true);
    expect(await (await page.getElement('viewer-settings')).isPresent()).toBe(true);
    expect(await (await page.getElement('viewer')).isPresent()).toBe(true);
    expect(await (await page.getElement('osd-wrapper')).isPresent()).toBe(true);
  });
  it('loads default vmic within 30 seconds', async () => {
    browser.waitForAngularEnabled(true);
    await page.navigateTo();
    browser.wait(async () => {
      await page.getElementValue('loading-card', 'loadingProgress').then((value) => {
        return value === 100;
      }, () => {
      });
    }, 30 * second, '.vmic took too long to load!');
    expect(await (await page.getElement('loading-card')).isDisplayed()).toBe(false);
    expect(await (await page.getElement('viewer-settings')).isDisplayed()).toBe(true);
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
