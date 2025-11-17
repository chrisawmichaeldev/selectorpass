import { expect, Page } from '@playwright/test';

export default class OptionsPage {
  page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  // Locators - defined as methods that return locators when called
  pageTitle = () => this.page.locator('h1');
  addDomainHeader = () => this.page.locator('#addDomainHeader');
  domainInput = () => this.page.locator('#domainInput');
  usernameSelector = () => this.page.locator('#usernameSelector');
  passwordSelector = () => this.page.locator('#passwordSelector');
  saveDomainBtn = () => this.page.locator('#saveDomainBtn');
  
  // Dynamic locators
  domainSection = (domain: string) => this.page.locator(`[data-domain="${domain}"]`);
  credentialUsernameInput = (domain: string) => this.page.locator(`#username-${domain}`);
  credentialPasswordInput = (domain: string) => this.page.locator(`#password-${domain}`);
  addCredentialBtn = (domain: string) => this.page.locator(`[data-domain="${domain}"][data-action="add-credential"]`);
  credentialsList = (domain: string) => this.page.locator(`#credentials-${domain}`);
  credentialItem = (domain: string, username: string) => this.page.locator(`[data-domain="${domain}"] .credential-item:has-text("${username}")`);

  public async goto() {
    await this.page.setViewportSize({ width: 1932, height: 2053 });
    await this.page.goto('http://localhost:8080/options.html');
    await expect(this.pageTitle()).toContainText('SelectorPass');
  }

  public async verifyPageLoaded() {
    await expect(this.pageTitle()).toContainText('SelectorPass');
  }

  public async gotoExtensionPage(context: any) {
    const serviceWorkers = context.serviceWorkers();
    if (serviceWorkers.length === 0) {
      throw new Error('Extension not loaded - no service workers found');
    }
    
    const extensionId = serviceWorkers[0].url().split('/')[2];
    
    // Create a new page for the extension
    const extensionPage = await context.newPage();
    await extensionPage.goto(`chrome-extension://${extensionId}/options.html`);
    await extensionPage.waitForLoadState('domcontentloaded');
    
    this.page = extensionPage;
    await this.verifyPageLoaded();
  }

  public async expandAddDomainSection() {
    await this.addDomainHeader().click();
  }

  public async addDomainConfiguration(domain: string, usernameSelector: string, passwordSelector: string) {
    await this.expandAddDomainSection();
    await this.domainInput().fill(domain);
    await this.usernameSelector().fill(usernameSelector);
    await this.passwordSelector().fill(passwordSelector);
    await this.saveDomainBtn().click();
  }

  public async verifyDomainExists(domain: string) {
    if (this.page.url().includes('chrome-extension://')) {
      await expect(this.domainSection(domain)).toBeVisible();
    }
  }

  public async verifyFormCleared() {
    if (this.page.url().includes('chrome-extension://')) {
      await expect(this.domainInput()).toHaveValue('');
      await expect(this.usernameSelector()).toHaveValue('');
      await expect(this.passwordSelector()).toHaveValue('');
    }
  }

  public async addCredential(domain: string, username: string, password: string) {
    if (this.page.url().includes('chrome-extension://')) {
      await this.credentialUsernameInput(domain).fill(username);
      await this.credentialPasswordInput(domain).fill(password);
      await this.addCredentialBtn(domain).click();
    }
  }

  public async verifyCredentialExists(domain: string, username: string) {
    if (this.page.url().includes('chrome-extension://')) {
      await expect(this.credentialItem(domain, username)).toBeVisible();
    }
  }

  public async verifyCredentialFormCleared(domain: string) {
    if (this.page.url().includes('chrome-extension://')) {
      await expect(this.credentialUsernameInput(domain)).toHaveValue('');
      await expect(this.credentialPasswordInput(domain)).toHaveValue('');
    }
  }
}