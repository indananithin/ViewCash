import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Set VITE_CAPACITOR=true when building the Android APK.
// This switches asset paths to relative (./) and strips the PWA service worker
// which conflicts with Capacitor's WebView loader.
const isCapacitor = process.env.VITE_CAPACITOR === 'true';

// PWA plugin config — only used for web (non-Capacitor) builds.
// We CANNOT include the service worker in the APK:
//   - SW registers on https://localhost (Capacitor's origin)
//   - SW intercepts all fetches and caches them
//   - On next cold start SW serves stale cached responses
//   - This breaks Capacitor's asset pipeline and causes black/blank screens
const pwaPlugin = VitePWA({
  registerType: 'autoUpdate',
  injectManifest: false,
  includeAssets: ['favicon.svg', 'icons.svg', 'logo.png'],
  workbox: {
    navigateFallback: 'index.html',
    navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
    runtimeCaching: [
      {
        urlPattern: ({ request }) => request.mode === 'navigate',
        handler: 'NetworkFirst',
        options: {
          networkTimeoutSeconds: 2,
          cacheName: 'html-cache-v5',
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-v1',
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        urlPattern: /\.(?:js|css)$/,
        handler: 'StaleWhileRevalidate',
        options: { cacheName: 'static-assets-v1' },
      },
      {
        urlPattern: /\.(?:png|svg|jpg|jpeg|webp|gif|ico)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'image-assets-v1',
          expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
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
      { src: 'favicon.svg', sizes: '192x192', type: 'image/svg+xml' },
      { src: 'logo.png',    sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
    ]
  },
  devOptions: { enabled: false }
});

export default defineConfig({
  // CRITICAL: base must be './' for Capacitor so asset paths are relative.
  // Capacitor loads from file:///android_asset/public/ — absolute paths (/assets/...)
  // resolve to the device root and return 404. Relative paths (./assets/...) work correctly.
  // For web PWA builds, base stays as '/' (default CDN-friendly absolute paths).
  base: isCapacitor ? './' : '/',

  plugins: [
    react(),
    // Completely exclude PWA plugin for Capacitor APK builds.
    // Service workers CANNOT run inside Capacitor's WebView and cause black screens.
    ...(isCapacitor ? [] : [pwaPlugin]),
  ],

  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
    }
  }
})
