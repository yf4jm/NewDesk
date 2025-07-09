import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base : './',
  plugins: [react(),tailwindcss()],
  build: {
    rollupOptions: {
      input: './index.html',
      output: {
        entryFileNames: 'bundle.js',
      },
      treeshake: false, // Disable tree shaking temporarily
    },
    outDir: 'dist', // default
    emptyOutDir: true,
  },
})
