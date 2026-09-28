import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@fuelguard': path.resolve(__dirname, './fuelguard'),
    },
  },
  worker: {
    format: 'es',
  },
  server: {
    port: 3000,
    open: false,
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
});
