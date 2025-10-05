import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  server: {
    port: 3000,
    // Enable access from mobile devices on same network
    host: true,
    // Proxy API requests to backend
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
      },
      // WebSocket proxy for concert rooms
      '/api/concerts': {
        target: process.env.VITE_API_URL?.replace('http', 'ws') || 'ws://localhost:5000',
        ws: true,
        changeOrigin: true,
      },
    },
    // Enable CORS for mobile testing
    cors: true,
  },
  
  build: {
    // Optimize for mobile
    target: 'es2015',
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'icons': ['lucide-react'],
        },
      },
    },
    // Smaller chunks for mobile
    chunkSizeWarningLimit: 600,
    // Source maps for debugging
    sourcemap: true,
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios', 'lucide-react'],
  },
  
  // Preview server settings (for testing production build)
  preview: {
    port: 3000,
    host: true,
  },
});