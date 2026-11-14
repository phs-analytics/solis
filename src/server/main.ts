import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildApp } from './app.ts';

const dataDir = process.env.SOLIS_DATA_DIR ?? fileURLToPath(new URL('../../data', import.meta.url));
const webDir = fileURLToPath(new URL('../../dist/web', import.meta.url));
mkdirSync(dataDir, { recursive: true });

const app = buildApp({ dataDir, webDir });
// SEC: loopback only; remote access goes through `tailscale serve` (etapa 4)
await app.listen({ host: '127.0.0.1', port: Number(process.env.PORT ?? 3000) });
console.log(`Solis em http://127.0.0.1:${process.env.PORT ?? 3000}`);
