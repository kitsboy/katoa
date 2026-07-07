import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/btcmap-api-proxy': {
        target: 'https://api.btcmap.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/btcmap-api-proxy/, ''),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          nostr: ['nostr-tools'],
          ui: ['lucide-react'],
          leaflet: ['leaflet'],
        },
      },
    },
  },
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
