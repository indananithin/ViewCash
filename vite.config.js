import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Force SW to activate immediately and claim all clients — no second launch needed
      injectManifest: false,
      includeAssets: ['favicon.svg', 'icons.svg'],
      workbox: {
        // Always fetch fresh HTML from network — prevents serving old cached white-screen HTML
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        runtimeCaching: [
          {
            // StaleWhileRevalidate for HTML navigation — instantly serve cached HTML, update in background
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'html-cache-v3',
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
        // Activate the new SW immediately without waiting for old tabs to close
        skipWaiting: true,
        clientsClaim: true,
      },
      manifest: {
        name: 'ViewCash',
        short_name: 'ViewCash',
        description: 'Watch. Win. Redeem.',
        theme_color: '#FF8008',
        background_color: '#FF8008',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
    }
  }
})

