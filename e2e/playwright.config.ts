import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Chrome extensions need sequential testing
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for extension testing
  reporter: 'html',
  timeout: 10000, // Fast timeout
  use: {
    headless: false, // Extensions require headed mode
    viewport: { width: 1932, height: 2053 },
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium-extension',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  webServer: {
    command: 'python3 -m http.server 8080',
    port: 8080,
    cwd: path.resolve(__dirname, '..'),
    reuseExistingServer: true,
  },
});