import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import assert from 'node:assert/strict'
import { packLibrary } from './pack-library.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const example = resolve(root, 'examples/react')
packLibrary()

// npm otherwise keeps the old tarball when its path and alpha version are unchanged.
// Refresh only our generated package; leave the consumer's other dependencies alone.
rmSync(resolve(example, 'node_modules/@event-ui/react'), { recursive: true, force: true })
for (const name of ['package-lock.json', 'node_modules/.package-lock.json']) {
  const path = resolve(example, name)
  if (!existsSync(path)) continue
  const lock = JSON.parse(readFileSync(path, 'utf8'))
  if (lock.packages) delete lock.packages['node_modules/@event-ui/react']
  writeFileSync(path, JSON.stringify(lock, null, 2) + '\n')
}
const result = spawnSync('npm', ['install'], { cwd: example, stdio: 'inherit' })
if (result.error) throw result.error
assert.equal(result.status, 0, 'Example install failed')
for (const file of ['index.js', 'index.d.ts', 'styles.css']) {
  assert.equal(
    readFileSync(resolve(example, 'node_modules/@event-ui/react/dist', file), 'utf8'),
    readFileSync(resolve(root, 'packages/react/dist', file), 'utf8'),
    `Consumer has a stale ${file}`,
  )
}
console.log('\nConsumer installed the current tarball. Run npm run example:dev.')
