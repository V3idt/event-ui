import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        panels: fileURLToPath(new URL('./src/panels.ts', import.meta.url)),
        components: fileURLToPath(new URL('./src/components.ts', import.meta.url)),
        backgrounds: fileURLToPath(new URL('./src/backgrounds/index.ts', import.meta.url)),
      },
      formats: ['es'],
      fileName: (_format, entry) => `${entry}.js`,
      cssFileName: 'styles',
    },
    rollupOptions: {
      external: id => /^(react|react-dom)(\/|$)/.test(id),
      output: { banner: '"use client";' },
      onwarn(warning, warn) {
        // Rollup strips source directives; the banner preserves the public boundary.
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('use client')) return
        warn(warning)
      },
    },
  },
})
