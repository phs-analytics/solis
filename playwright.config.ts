import { defineConfig, devices } from '@playwright/test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PORT = 3100;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  workers: 1,
  use: { baseURL: `http://127.0.0.1:${PORT}` },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm build && node src/server/main.ts',
    url: `http://127.0.0.1:${PORT}/api/status`,
    reuseExistingServer: false,
    env: { PORT: String(PORT), SOLIS_DATA_DIR: mkdtempSync(join(tmpdir(), 'solis-e2e-')) },
  },
});
