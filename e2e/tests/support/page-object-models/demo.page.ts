import { expect, Page } from '@playwright/test';

export default class DemoPage {
  page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  // Locators - defined as methods that return locators when called
  usernameField = () => this.page.locator('#username');
  passwordField = () => this.page.locator('#password');
  pageTitle = () => this.page.locator('h1');

  public async goto() {
    await this.page.setViewportSize({ width: 1932, height: 2053 });
    await this.page.goto('http://localhost:8080/demo.html');
    await expect(this.pageTitle()).toContainText('Demo Login');
  }

  public async verifyFormFieldsVisible() {
    await expect(this.usernameField()).toBeVisible();
    await expect(this.passwordField()).toBeVisible();
  }

  public async verifyCredentialsFilled(username: string, password: string) {
    await expect(this.usernameField()).toHaveValue(username);
    await expect(this.passwordField()).toHaveValue(password);
  }

  public async verifyExtensionLoaded(context: any) {
    const serviceWorkers = context.serviceWorkers();
    expect(serviceWorkers.length).toBeGreaterThan(0);
  }
}