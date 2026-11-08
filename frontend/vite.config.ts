import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration with backend API reverse proxy
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});