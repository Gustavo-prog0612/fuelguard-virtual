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
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three') || id.includes('node_modules/@react-three') || id.includes('node_modules/three-mesh-bvh')) return 'three-vendor';
          if (id.includes('node_modules/chart.js') || id.includes('node_modules/react-chartjs-2')) return 'charts-vendor';
          if (id.includes('node_modules/@xyflow')) return 'flow-vendor';
          if (id.includes('node_modules/')) return 'vendor';
          return undefined;
        },
      },
    },
  },
});
