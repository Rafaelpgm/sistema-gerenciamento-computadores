import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite' // <--- 1. ADICIONE ESTA LINHA

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react( ),
    tailwindcss(), // <--- 2. ADICIONE ESTA LINHA
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // 3. (RECOMENDADO PARA DOCKER) Adicione esta seção para o live-reload funcionar bem
  server: {
    watch: {
      usePolling: true,
    },
  },
})