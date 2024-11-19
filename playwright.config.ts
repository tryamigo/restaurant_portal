import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './playwright_tests',
  
  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',

  /* Shared settings for all the projects below. */
  use: {
    baseURL: 'http://127.0.0.1:3000',
    headless: false, // Automatically switch to headless in CI
    trace: 'on-first-retry',
    video: 'on',
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }, // Use Desktop Chrome
    },

    // // Uncomment these if you want to test on Firefox and Webkit
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] }, // Use Desktop Firefox
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] }, // Use Desktop Safari (WebKit)
    // },

    // /* Test against mobile viewports */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] }, // Test on Pixel 5 (Mobile Chrome)
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] }, // Test on iPhone 12 (Mobile Safari)
    // },

    // /* Test against branded browsers */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' }, // Test on Edge (Microsoft)
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' }, // Test on Chrome
    // },
  ],

  webServer: {
    command: 'npm run start', // or 'npm run dev' for development mode
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // Increase timeout to 120 seconds (2 minutes)
  }
});
