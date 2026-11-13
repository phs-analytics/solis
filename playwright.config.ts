import { defineConfig, devices } from '@playwright/test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PORT = 3100;
const DEV_PORT = 5174;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  workers: 1,
  projects: [
    {
      name: 'app',
      testMatch: 'login.spec.ts',
      use: { ...devices['Desktop Chrome'], baseURL: `http://127.0.0.1:${PORT}` },
    },
    {
      // the catalog is dev-only, so it runs against the Vite dev server
      name: 'catalogo',
      testMatch: 'catalogo.spec.ts',
      use: { ...devices['Desktop Chrome'], baseURL: `http://127.0.0.1:${DEV_PORT}` },
    },
  ],
  webServer: [
    {
      command: 'pnpm build && node src/server/main.ts',
      url: `http://127.0.0.1:${PORT}/api/status`,
      reuseExistingServer: false,
      env: { PORT: String(PORT), SOLIS_DATA_DIR: mkdtempSync(join(tmpdir(), 'solis-e2e-')) },
    },
    {
      command: `pnpm vite --port ${DEV_PORT} --strictPort`,
      url: `http://127.0.0.1:${DEV_PORT}`,
      reuseExistingServer: false,
    },
  ],
});
