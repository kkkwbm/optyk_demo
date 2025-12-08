import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],

          // React Router
          'router': ['react-router-dom'],

          // State management
          'redux': ['@reduxjs/toolkit', 'react-redux'],

          // UI library
          'mui-core': [
            '@mui/material',
            '@mui/system',
            '@emotion/react',
            '@emotion/styled'
          ],

          // Form handling
          'forms': ['react-hook-form', 'yup'],

          // Data table
          'table': ['@tanstack/react-table', '@tanstack/react-virtual'],

          // Utilities
          'utils': ['axios', 'date-fns'],

          // Icons
          'icons': ['lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false
  }
})
