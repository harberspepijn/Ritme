import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Ritme — jouw dagelijkse gewoontes',
        short_name: 'Ritme',
        description: 'Kleine stappen, op jouw tempo. Persoonlijke gewoontes, lokaal bewaard.',
        lang: 'nl',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#f7f8f2',
        background_color: '#f7f8f2',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        navigateFallback: '/index.html',
      },
    }),
  ],
  server: { host: '0.0.0.0' },
});
