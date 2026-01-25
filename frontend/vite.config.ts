import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Configuration du serveur de dev
  server: {
    host: '0.0.0.0', // Important pour Docker
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // Nécessaire pour hot reload dans Docker
    },
    
    // Proxy pour les appels API
    proxy: {
      '/api': {
        target: 'http://backend:3000', // Nom du service Docker
        changeOrigin: true,
        secure: false,
      }
    }
  },
  
  // Alias pour imports absolus (optionnel)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})