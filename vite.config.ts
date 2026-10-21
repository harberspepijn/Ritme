import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub project Pages uses /Ritme/; other hosts can keep the root default.
const base = process.env.RITME_BASE_PATH || '/';
if (!/^\/(?:[A-Za-z0-9_-]+\/)*$/.test(base)) {
  throw new Error('RITME_BASE_PATH must be a path with leading and trailing slashes.');
}

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        id: base,
        name: 'Ritme — jouw dagelijkse gewoontes',
        short_name: 'Ritme',
        description: 'Kleine stappen, op jouw tempo. Persoonlijke gewoontes, lokaal bewaard.',
        lang: 'nl',
        start_url: base,
        scope: base,
        display: 'standalone',
        theme_color: '#f7f8f2',
        background_color: '#f7f8f2',
        icons: [
          { src: `${base}icon-192.png`, sizes: '192x192', type: 'image/png' },
          { src: `${base}icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: `${base}icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        navigateFallback: `${base}index.html`,
      },
    }),
  ],
  server: { host: '0.0.0.0' },
});
