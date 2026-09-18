import { mkdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = fileURLToPath(new URL('../', import.meta.url))
export const artifacts = resolve(root, 'artifacts')

export function packLibrary() {
  mkdirSync(artifacts, { recursive: true })
  const result = spawnSync('npm', ['pack', '--pack-destination', artifacts], {
    cwd: resolve(root, 'packages/react'), stdio: 'inherit',
  })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error('Package build or pack failed')
  const manifest = JSON.parse(readFileSync(resolve(root, 'packages/react/package.json'), 'utf8'))
  const filename = `${manifest.name.replace(/^@/, '').replace('/', '-')}-${manifest.version}.tgz`
  return resolve(artifacts, filename)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(`\nInstallable package: ${packLibrary()}`)
}
