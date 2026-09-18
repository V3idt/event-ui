import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Vite combines component CSS into the explicit styles.css export. Declarations
// must not refer to source-only CSS files that are absent from the distribution.
const dist = fileURLToPath(new URL('../dist/', import.meta.url))
for (const file of readdirSync(dist, { recursive: true })) {
  if (!file.endsWith('.d.ts')) continue
  const path = resolve(dist, file)
  const text = readFileSync(path, 'utf8')
  writeFileSync(path, text.replace(/^import\s+['"][^'"]+\.css['"];?\s*$/gm, ''))
}
