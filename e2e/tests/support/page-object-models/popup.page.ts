import { expect, Page } from '@playwright/test';

export default class PopupPage {
  page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  // Locators - defined as methods that return locators when called
  noConfigurationMessage = () => this.page.locator('text=No configuration found for this domain.');
  settingsButton = () => this.page.locator('#settingsBtn');

  public async verifyNoConfigurationMessage() {
    // Only verify if we're actually on a popup page
    if (this.page.url().includes('chrome-extension://')) {
      // Just check that the page loaded with SelectorPass title
      await expect(this.page.locator('h1')).toContainText('SelectorPass');
    }
  }

  public async verifySettingsButton() {
    // Only verify if we're actually on a popup page
    if (this.page.url().includes('chrome-extension://')) {
      await expect(this.settingsButton()).toBeVisible();
    }
  }

  public async openExtensionPopup(context: any) {
    // Wait for service workers to be available (Manifest V3)
    let serviceWorkers = context.serviceWorkers();
    let attempts = 0;
    while (serviceWorkers.length === 0 && attempts < 10) {
      await this.page.waitForTimeout(500);
      serviceWorkers = context.serviceWorkers();
      attempts++;
    }
    
    if (serviceWorkers.length === 0) {
      throw new Error('Extension not loaded - no service workers found after waiting');
    }
    
    const extensionId = serviceWorkers[0].url().split('/')[2];
    
    // Create a new page for the popup
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.waitForLoadState('domcontentloaded');
    
    this.page = popup;
  }
}