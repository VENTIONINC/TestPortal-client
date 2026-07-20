import path from 'path';

import { defineConfig, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
const config = {
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.ts',
  },
} satisfies UserConfig & { test: { environment: string; setupFiles: string } };

export default defineConfig(config);
