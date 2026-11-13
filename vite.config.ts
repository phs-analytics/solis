import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `tauri android dev` sets TAURI_DEV_HOST so the phone can reach the dev server
const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  root: 'src/web',
  plugins: [react()],
  clearScreen: false,
  envPrefix: ['VITE_', 'TAURI_ENV_'],
  build: { outDir: '../../dist/web', emptyOutDir: true, target: 'es2022' },
  server: {
    host: host ?? '127.0.0.1',
    port: 5173,
    strictPort: true,
    ...(host ? { hmr: { protocol: 'ws', host, port: 5183 } } : {}),
    watch: { ignored: ['**/src-tauri/**'] },
  },
});
