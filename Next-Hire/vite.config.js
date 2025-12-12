import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Ensure Vite resolves to the single copy of React in this project
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Dedupe React so libraries don't pull in a second copy
    dedupe: ['react', 'react-dom'],
    alias: {
      react: path.resolve(__dirname, 'node_modules', 'react'),
      'react-dom': path.resolve(__dirname, 'node_modules', 'react-dom')
    }
  },
  optimizeDeps: {
    // 1. Force Vite to not cache these heavy UI libraries aggressively
    exclude: ['@mediapipe/pose', '@mediapipe/camera_utils'],
    // 2. Ensure these are pre-bundled correctly
    include: ['react', 'react-dom', 'react-router-dom', '@mui/material', '@emotion/react', '@emotion/styled'],
  },
  server: {
    // 3. Prevent the server from timing out if bundling takes long
    watch: {
      usePolling: true,
    },
  }
  ,
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    globals: true,
    pool: 'forks',
  }
})
