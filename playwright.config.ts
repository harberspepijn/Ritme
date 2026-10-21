import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';
const appURL = `http://127.0.0.1:4175${process.env.RITME_BASE_PATH || '/'}`;
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 2,
  timeout: 30000,
  expect: { timeout: 7000 },
  use: {
    baseURL: appURL,
    locale: 'nl-NL',
    timezoneId: 'Europe/Amsterdam',
    launchOptions: {
      executablePath:
        process.env.CHROMIUM_PATH ||
        (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined),
      args: ['--no-sandbox'],
    },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } },
    },
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4175 --strictPort',
    url: appURL,
    reuseExistingServer: false,
    timeout: 60000,
  },
});
