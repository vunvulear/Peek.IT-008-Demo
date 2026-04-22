import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: 0,
  workers: 1,
  globalSetup: './tests/e2e/global-setup.ts',
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
  },
  webServer: [
    {
      command: 'npx tsx src/backend/index.ts',
      port: 3000,
      reuseExistingServer: false,
    },
    {
      command: 'npx vite',
      port: 5173,
      reuseExistingServer: false,
    },
  ],
});
