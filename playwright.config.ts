import { defineConfig, devices } from '@playwright/test';

const DEV_PORT = 5174;

// UI only: the Rust core is covered by `cargo test`; e2e tests stub Tauri's IPC.
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  workers: 1,
  use: { ...devices['Desktop Chrome'], baseURL: `http://127.0.0.1:${DEV_PORT}` },
  webServer: {
    command: `pnpm vite --port ${DEV_PORT}`,
    url: `http://127.0.0.1:${DEV_PORT}`,
    reuseExistingServer: false,
  },
});
