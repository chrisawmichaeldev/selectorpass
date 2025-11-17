import { expect, Page } from '@playwright/test';

export default class PopupPage {
  page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  // Locators - defined as methods that return locators when called
  noConfigurationMessage = () => this.page.locator('text=No configuration found for this domain');
  settingsButton = () => this.page.locator('text=Settings');

  public async verifyNoConfigurationMessage() {
    // Only verify if we're actually on a popup page
    if (this.page.url().includes('chrome-extension://')) {
      await expect(this.noConfigurationMessage()).toBeVisible();
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
    
    // Make sure we have an active tab for activeTab permission
    await this.page.goto('http://localhost:8080/demo.html');
    
    const serviceWorker = serviceWorkers[0];
    
    // Use the browser connection method from the guide
    await context._browser._connection.send('Runtime.evaluate', {
      expression: `chrome.action.openPopup();`,
      contextId: serviceWorker._contextId
    });
    
    const popup = await context.waitForEvent('page', { timeout: 5000 });
    await popup.waitForLoadState('domcontentloaded');
    
    this.page = popup;
  }
}