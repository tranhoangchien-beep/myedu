import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    headers: {
      'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate, noai, noimageai',
      'Referrer-Policy': 'no-referrer'
    }
  },
  preview: {
    port: 4173,
    host: true,
    headers: {
      'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate, noai, noimageai',
      'Referrer-Policy': 'no-referrer'
    }
  }
});
