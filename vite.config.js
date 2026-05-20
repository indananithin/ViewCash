import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'ViewCash',
        short_name: 'ViewCash',
        description: 'Watch. Win. Redeem.',
        theme_color: '#FF8008',
        background_color: '#FF8008',
        display: 'standalone',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
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
