import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Detect if we're building for Capacitor (native APK) or web (PWA)
// Set VITE_CAPACITOR=true in env to build for Android APK
const isCapacitor = process.env.VITE_CAPACITOR === 'true';

// https://vite.dev/config/
export default defineConfig({
  // CRITICAL for Capacitor: assets must use relative paths (./assets/...)
  // because Capacitor loads from file:///android_asset/public/
  // Without this, /assets/... paths resolve to device root = blank screen.
  // For web PWA builds this is overridden to '/' via the build script.
  base: isCapacitor ? './' : '/',

  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectManifest: false,
      includeAssets: ['favicon.svg', 'icons.svg', 'logo.png'],
      // Disable SW entirely when building for Capacitor.
      // The PWA service worker intercepts fetch requests and conflicts
      // with Capacitor's file:// WebView asset loading, causing blank screens.
      selfDestroying: isCapacitor,
      workbox: {
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        runtimeCaching: [
          {
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
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-v1',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-assets-v1',
            },
          },
          {
            urlPattern: /\.(?:png|svg|jpg|jpeg|webp|gif|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-assets-v1',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
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
        enabled: false
      }
    })
  ],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
    }
  }
})
