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
          leaflet: ['leaflet'],
        },
      },
    },
  },
  plugins: [
    react(),
    {
      name: 'css-first',
      transformIndexHtml(html) {
        const css = html.match(/<link rel="stylesheet" crossorigin href="\/assets\/[^"]+\.css">/);
        if (!css) return html;
        return html
          .replace(css[0], '')
          .replace('</style>', `</style>\n    ${css[0]}`);
      },
    },
  ],

});
