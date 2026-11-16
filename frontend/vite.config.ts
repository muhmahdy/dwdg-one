/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type UserConfig } from 'vite';

/* `test` is Vitest's part of this file. Vitest types it against its own copy of Vite, which is not always the copy the
   frontend installs, so the config is typed here and handed over as a variable (no excess-property check on `test`). */
const config: UserConfig & { test: Record<string, unknown> } = {
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  // `VITE_DATA_MODE=bff`: /api goes to the server (npm run dev -w server).
  server: { port: 5173, strictPort: true, proxy: { '/api': 'http://127.0.0.1:8787' } },
  // The prototype stays in frontend/prototype as the parity reference (decision M16); keep it out of this app's dev server.
  optimizeDeps: { entries: ['index.html'] },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/unit/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'tests/unit/**/*.test.{ts,tsx}'],
  },
};

export default defineConfig(config);