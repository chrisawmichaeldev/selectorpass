import { chromium, BrowserContext, Page } from '@playwright/test';
import path from 'path';

export async function setupExtensionContext(): Promise<{ context: BrowserContext; page: Page }> {
  const extensionPath = path.resolve(__dirname, '../../..');
  console.log('Extension path:', extensionPath);
  
  const context = await chromium.launchPersistentContext('', {
    headless: false,
    viewport: { width: 1932, height: 2053 },
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    ],
  });
  
  const page = await context.newPage();
  
  // Wait for service worker with retries
  let attempts = 0;
  while (attempts < 10) {
    await page.waitForTimeout(500);
    const serviceWorkers = context.serviceWorkers();
    if (serviceWorkers.length > 0) {
      console.log('Extension service worker loaded');
      return { context, page };
    }
    attempts++;
  }
  
  throw new Error('Extension service worker failed to load');
}