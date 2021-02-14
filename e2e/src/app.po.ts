import { browser, by, element, ElementFinder } from 'protractor';

export class AppPage {
  async navigateTo(): Promise<unknown> {
    return browser.get(browser.baseUrl);
  }
  async getElement(id: string): Promise<ElementFinder> {
    return element(by.id(id));
  }
  async getElementClasses(id: string): Promise<string> {
    return element(by.id(id)).getAttribute('class');
  }
  async getElementValue(id: string, value: string): Promise<string | number> {
    return element(by.id(id)).getAttribute(value);
  }
}
