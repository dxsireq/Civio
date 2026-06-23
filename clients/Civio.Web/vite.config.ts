import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy({
      // Legacy bundle (nomodule) for browsers without ES module support.
      targets: ['defaults', 'not IE 11'],
      // Polyfills for modern browsers below Vite's default baseline
      // (e.g. Safari 14/15) that support modules but lack newer APIs.
      modernTargets: ['since 2021', 'not dead'],
      modernPolyfills: true,
    }),
  ],
})
