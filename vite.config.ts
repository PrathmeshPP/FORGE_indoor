import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Production configuration for Vercel static deployment
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 3000,
    assetsInlineLimit: 0,
  },
  server: {
    port: 5174,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
});
