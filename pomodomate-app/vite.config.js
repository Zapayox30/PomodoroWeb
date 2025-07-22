// https://vite.dev/config/
import { defineConfig } from 'vite'
import react       from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'   // ← línea nueva

export default defineConfig({
  plugins: [
    react(),          // ← ya estaba
    tailwindcss()     // ← esta es la segunda línea nueva
  ],
})
