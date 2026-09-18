import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import assert from 'node:assert/strict'
import { packLibrary } from './pack-library.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const tarball = packLibrary()
const consumer = mkdtempSync(join(tmpdir(), 'event-ui-consumer-'))

function run(command, args) {
  const result = spawnSync(command, args, { cwd: consumer, stdio: 'inherit' })
  if (result.error) throw result.error
  assert.equal(result.status, 0, `${command} ${args.join(' ')} failed`)
}

try {
  cpSync(resolve(root, 'examples/react'), consumer, {
    recursive: true,
    filter: source => !source.split('/').some(part => ['node_modules', 'dist', 'package-lock.json'].includes(part)),
  })
  const manifestPath = join(consumer, 'package.json')
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  manifest.dependencies['@event-ui/react'] = `file:${tarball}`
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
  run('npm', ['install', '--no-audit', '--no-fund'])
  run('npm', ['run', 'build'])

  const installed = join(consumer, 'node_modules/@event-ui/react')
  const pkg = JSON.parse(readFileSync(join(installed, 'package.json'), 'utf8'))
  for (const value of Object.values(pkg.exports)) {
    for (const target of typeof value === 'string' ? [value] : Object.values(value)) {
      assert.ok(readFileSync(join(installed, target)).length, `Missing export ${target}`)
    }
  }
  const files = readdirSync(installed, { recursive: true }).filter(file => /\.(js|css|json|png)$/.test(file))
  assert.ok(files.every(file => !/fixtures|event-fonts|public\/|src\//.test(file)), 'Demo files leaked into package')
  const source = files.filter(file => /\.js$/.test(file)).map(file => readFileSync(join(installed, file), 'utf8')).join('\n')
  assert.ok(!/["'(]\/assets\//.test(source), 'Package depends on root-relative assets')
  assert.ok(!/react\.production\.js|react\.development\.js/.test(source), 'React was bundled')

  // Plain Node import proves exports do not require a browser or CSS loader.
  writeFileSync(join(consumer, 'ssr.mjs'), `
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { SidePanel, EventPreview, EventBackground, Button, Select, EventCard } from '@event-ui/react'
import * as panels from '@event-ui/react/panels'
import * as backgrounds from '@event-ui/react/backgrounds'
import * as components from '@event-ui/react/components'
assert.equal(SidePanel, panels.SidePanel)
assert.equal(Button, components.Button)
assert.equal(EventCard, components.EventCard)
assert.match(renderToString(createElement(Select, {label:'Location',value:'tokyo',onValueChange(){},options:[{value:'tokyo',label:'Tokyo'}]})), /combobox/)
assert.equal(EventBackground, backgrounds.EventBackground)
assert.equal(renderToString(createElement(EventPreview, {open:true,title:'SSR',href:'/event',onClose(){},children:'Hello'})), '')
assert.match(renderToString(createElement(EventBackground, {theme:'life'})), /data-event-ui="background"/)
console.log('SSR imports and rendering passed for all public entries.')
`)
  run('node', ['ssr.mjs'])
  console.log('\nPackage verified: fresh tarball install, TypeScript, nested-base production build, exports, bundled assets, and SSR.')
} finally {
  rmSync(consumer, { recursive: true, force: true })
}
