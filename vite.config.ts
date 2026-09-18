import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // The /ui route shares the standalone catalog; keep one React/package instance.
  resolve: { dedupe: ['react', 'react-dom', '@event-ui/react'] },
})
