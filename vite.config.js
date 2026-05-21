import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectManifest: false,
      includeAssets: ['favicon.svg', 'icons.svg', 'logo.png'],
      workbox: {
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        runtimeCaching: [
          {
            // NetworkFirst for HTML — always try to get fresh index.html.
            // Falls back to cache instantly if network is slow/offline.
            // 2s timeout means: if network responds in <2s use fresh;
            // otherwise serve cached immediately (no 4-5s blank wait).
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              networkTimeoutSeconds: 2,
              cacheName: 'html-cache-v4',
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // CacheFirst for Google Fonts CSS — loaded from CDN, long-lived
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-v1',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // StaleWhileRevalidate for JS/CSS assets (hashed filenames = safe)
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-assets-v1',
            },
          },
          {
            // CacheFirst for images
            urlPattern: /\.(?:png|svg|jpg|jpeg|webp|gif|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-assets-v1',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
        // Activate new SW immediately — no stale white screen from old SW
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
        enabled: false  // Disable SW in dev to avoid caching issues during development
      }
    })
  ],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
    }
  }
})
