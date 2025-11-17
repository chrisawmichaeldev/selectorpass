import { test as base, Page, BrowserContext } from '@playwright/test';
import OptionsPage from '../support/page-object-models/options.page';
import DemoPage from '../support/page-object-models/demo.page';
import PopupPage from '../support/page-object-models/popup.page';

/**
 * Creates a page object fixture
 * @template T The type of page object to create
 * @param {new (page: Page) => T} PageClass The page class constructor
 * @returns A fixture function that creates and provides the page object
 */
function createPageFixture<T>(PageClass: new (page: Page) => T) {
  return async ({ page }: { page: Page }, use: (instance: T) => Promise<void>) => {
    await use(new PageClass(page));
  };
}

/**
 * Extended test fixture for SelectorPass extension testing
 */
export const test = base.extend<{
  /**
   * Options page object for managing extension settings
   */
  optionsPage: OptionsPage;
  
  /**
   * Demo page object for testing form filling
   */
  demoPage: DemoPage;
  
  /**
   * Popup page object for extension popup interactions
   */
  popupPage: PopupPage;
}>({
  // Page object fixtures
  optionsPage: createPageFixture(OptionsPage),
  demoPage: createPageFixture(DemoPage),
  popupPage: createPageFixture(PopupPage),
});