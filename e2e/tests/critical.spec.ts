import { expect, chromium, BrowserContext, Page } from '@playwright/test';
import { test } from './fixtures/basePage';
import path from 'path';

test.describe('CRITICAL: Core Functionality', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async () => {
    const extensionPath = path.resolve(__dirname, '../..');
    console.log('Extension path:', extensionPath);
    
    context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`
      ],
    });
    
    page = await context.newPage();
    
    // Wait for service worker with retries
    let attempts = 0;
    while (attempts < 10) {
      await page.waitForTimeout(500);
      const serviceWorkers = context.serviceWorkers();
      if (serviceWorkers.length > 0) {
        console.log('Extension service worker loaded');
        return;
      }
      attempts++;
    }
    
    throw new Error('Extension service worker failed to load');
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

  test('Add first credential to domain', async ({ optionsPage }) => {
    await optionsPage.gotoExtensionPage(context);
    await optionsPage.addDomainConfiguration(
      'chrisawmichaeldev.github.io',
      '#username',
      '#password'
    );
    await optionsPage.addCredential(
      'chrisawmichaeldev.github.io',
      'testuser1',
      'testpass1'
    );
    await optionsPage.verifyCredentialExists('chrisawmichaeldev.github.io', 'testuser1');
    await optionsPage.verifyCredentialFormCleared('chrisawmichaeldev.github.io');
  });
});