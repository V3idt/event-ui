import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Deliberately mounted below a prefix: package assets must work here too.
  base: '/playground/',
})
