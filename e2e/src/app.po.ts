import { browser, by, element, ElementFinder } from 'protractor';
import { WebdriverWebElement } from 'protractor/built/element';

export class AppPage {
  async navigateTo(): Promise<unknown> {
    return browser.get(browser.baseUrl);
  }
  async getElement(tag: string): Promise<ElementFinder> {
    return element(by.css(tag));
  }
  async getElementClasses(tag: string): Promise<string> {
    return element(by.css(tag)).getAttribute('class');
  }
}
