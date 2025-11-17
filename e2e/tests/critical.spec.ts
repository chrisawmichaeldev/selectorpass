import { expect, BrowserContext, Page } from '@playwright/test';
import { test } from './fixtures/basePage';
import { setupExtensionContext } from './utils/extension-setup';

test.describe('CRITICAL: Core Functionality', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async () => {
    const result = await setupExtensionContext();
    context = result.context;
    page = result.page;
  }, 10000);

  test.afterAll(async () => {
    if (context) {
      await context.close();
    }
  });

  test('Demo page loads and extension is available', async ({ demoPage }) => {
    await demoPage.goto();
    await demoPage.verifyFormFieldsVisible();
    await demoPage.verifyExtensionLoaded(context);
  });

  test('Extension popup opens', async ({ demoPage, popupPage }) => {
    await demoPage.goto();
    await popupPage.openExtensionPopup(context);
    await popupPage.verifyNoConfigurationMessage();
    await popupPage.verifySettingsButton();
  });

  test('Add domain configuration', async ({ optionsPage }) => {
    await optionsPage.gotoExtensionPage(context);
    await optionsPage.addDomainConfiguration(
      'chrisawmichaeldev.github.io',
      '#username',
      '#password'
    );
    await optionsPage.verifyDomainExists('chrisawmichaeldev.github.io');
    await optionsPage.verifyFormCleared();
  });

  test('Extension options page loads', async ({ optionsPage }) => {
    await optionsPage.gotoExtensionPage(context);
    await optionsPage.verifyPageLoaded();
  });
});