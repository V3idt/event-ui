import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import ts from 'typescript'

const root = fileURLToPath(new URL('../', import.meta.url))
const packageRoot = resolve(root, 'packages/react')
const dist = resolve(packageRoot, 'dist')
const output = resolve(root, 'public')
const pkg = JSON.parse(readFileSync(resolve(packageRoot, 'package.json'), 'utf8'))
const guide = readFileSync(resolve(root, 'docs/agent-guide.md'), 'utf8').trim()
const configPath = resolve(root, 'site.config.json')
const config = existsSync(configPath) ? JSON.parse(readFileSync(configPath, 'utf8')) : {}
const site = String(config.siteUrl ?? 'https://ui.wtw.quest').replace(/\/$/, '')
const repositoryInput = (process.env.EVENT_UI_REPOSITORY_URL ?? config.repositoryUrl)?.trim()
let repository = null
if (repositoryInput) {
  const parsed = new URL(repositoryInput)
  if (parsed.origin !== 'https://github.com' || !/^\/[\w.-]+\/[\w.-]+\/?$/.test(parsed.pathname) || parsed.search || parsed.hash || parsed.username || parsed.password) {
    throw new Error('EVENT_UI_REPOSITORY_URL must be an https://github.com/owner/repository URL.')
  }
  repository = `${parsed.origin}${parsed.pathname.replace(/\/$/, '')}`
}

const entries = Object.entries(pkg.exports)
  .filter(([, value]) => typeof value === 'object' && value.types)
  .map(([key, value]) => ({
    import: key === '.' ? pkg.name : `${pkg.name}${key.slice(1)}`,
    path: resolve(packageRoot, value.types),
  }))
for (const entry of entries) {
  try { readFileSync(entry.path) } catch {
    throw new Error(`Missing ${relative(root, entry.path)}. Run npm run build:lib first.`)
  }
}

const program = ts.createProgram(entries.map(entry => entry.path), {
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  target: ts.ScriptTarget.ES2022,
  strict: true,
  skipLibCheck: true,
  noEmit: true,
})
const checker = program.getTypeChecker()
const packagePath = path => relative(dist, path).split(sep).join('/')
const declarations = program.getSourceFiles()
  .filter(source => source.isDeclarationFile && source.fileName.startsWith(`${dist}${sep}`))
  .sort((a, b) => packagePath(a.fileName).localeCompare(packagePath(b.fileName)))

const publicEntries = entries.map(entry => {
  const source = program.getSourceFile(entry.path)
  const symbol = source && checker.getSymbolAtLocation(source)
  if (!symbol) throw new Error(`Cannot inspect public exports in ${entry.path}`)
  return {
    import: entry.import,
    declaration: packagePath(entry.path),
    exports: checker.getExportsOfModule(symbol).map(exported => {
      const target = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported
      const declaration = target.declarations?.[0]
      if (!declaration) throw new Error(`Unresolved export: ${entry.import}.${exported.name}`)
      return {
        name: exported.name,
        kind: target.flags & ts.SymbolFlags.Value ? 'value' : 'type',
        declaration: packagePath(declaration.getSourceFile().fileName),
      }
    }).sort((a, b) => a.name.localeCompare(b.name)),
  }
})

const css = readFileSync(resolve(dist, 'styles.css'), 'utf8')
const tokens = new Map()
for (const match of css.matchAll(/var\((--event-ui-[\w-]+)/g)) {
  let cursor = match.index + match[0].length
  let depth = 1
  const start = cursor
  for (; cursor < css.length && depth > 0; cursor++) {
    if (css[cursor] === '(') depth++
    if (css[cursor] === ')') depth--
  }
  if (depth) throw new Error(`Unbalanced CSS variable reference: ${match[1]}`)
  const fallback = css.slice(start, cursor - 1).replace(/^\s*,\s*/, '').trim() || null
  const defaults = tokens.get(match[1]) ?? new Set()
  defaults.add(fallback)
  tokens.set(match[1], defaults)
}
const cssVariables = [...tokens].sort(([a], [b]) => a.localeCompare(b)).map(([name, defaults]) => ({
  name,
  fallbacks: [...defaults].sort(),
}))
const fingerprint = createHash('sha256')
  .update(JSON.stringify(pkg.exports))
  .update(JSON.stringify(pkg.peerDependencies))
  .update(css)
for (const source of declarations) fingerprint.update(packagePath(source.fileName)).update(source.text)
const manifest = {
  schemaVersion: 1,
  name: pkg.name,
  version: pkg.version,
  private: pkg.private === true,
  license: pkg.license,
  repository,
  documentation: `${site}/llms-full.txt`,
  catalog: `${site}/ui`,
  stylesheet: `${pkg.name}/styles.css`,
  peerDependencies: pkg.peerDependencies,
  engines: pkg.engines,
  apiSha256: fingerprint.digest('hex'),
  entries: publicEntries,
  cssVariables,
}

const sourceLocation = repository
  ? `Source repository: ${repository}. Follow its release status before redistribution.`
  : 'Source access is required. No public repository is configured; obtain a checkout from the maintainer before installation.'
const exportTable = publicEntries.map(entry => {
  const values = entry.exports.filter(item => item.kind === 'value').map(item => `\`${item.name}\``).join(', ')
  return `| \`${entry.import}\` | ${values} |`
}).join('\n')
const tokenTable = cssVariables.map(token => `| \`${token.name}\` | ${token.fallbacks.map(value => value === null ? 'Inherited value required' : `\`${value}\``).join('; ')} |`).join('\n')
const api = declarations.map(source => `### ${packagePath(source.fileName)}\n\n\`\`\`ts\n${source.text.trim()}\n\`\`\``).join('\n\n')

const index = `# UI\n\n> React 19 components for cards, buttons, forms, menus, panels, and animated backgrounds.\n\nPackage: \`${pkg.name}\` ${pkg.version}. Private alpha, ${pkg.license}. Not published to npm. Source and asset review is unfinished.\n\n${sourceLocation}\n\n## Start here\n\n- [Integration guide and exact TypeScript API](${site}/llms-full.txt): install from a source checkout, examples, accessibility, CSS variables, and generated package declarations.\n- [Export manifest](${site}/components.json): machine-readable imports, types, peer dependencies, CSS variables, and API fingerprint.\n- [Component catalog](${site}/ui): interactive examples.\n- [Luma example](${site}/demo): an optional event-site recipe with discovery, pages, and previews.\n${repository ? `- [Source repository](${repository}): code and release status.\n` : ''}\nUse the integration guide before editing a project. Read the manifest to confirm exact exports. Do not assume that an npm package or a public redistribution license exists.\n`
const full = `<!-- Generated by scripts/build-agent-docs.mjs from docs/agent-guide.md and the built package. -->\n\n${guide}\n\n## Source and package\n\n${sourceLocation}\n\nPackage: \`${pkg.name}\` ${pkg.version}. License: \`${pkg.license}\`. Private: ${manifest.private}.\n\nPeers: ${Object.entries(pkg.peerDependencies).map(([name, range]) => `\`${name}@${range}\``).join(', ')}. Package Node requirement: \`${pkg.engines.node}\`.\n\nAPI fingerprint: \`${manifest.apiSha256}\`. Regenerate with \`npm run build:lib && node scripts/build-agent-docs.mjs\`.\n\n## Public runtime exports\n\n| Import | Exports |\n| --- | --- |\n${exportTable}\n\nStylesheet: \`${manifest.stylesheet}\`. Type-only exports are listed in [the manifest](${site}/components.json). Declarations below also contain supporting internal types; only names listed for a public entry point can be imported from that entry point.\n\n## CSS variables\n\nExtracted from the built stylesheet. Multiple fallbacks mean different components supply different defaults.\n\n| Variable | CSS fallback values |\n| --- | --- |\n${tokenTable}\n\n## TypeScript declarations\n\nThese files are copied from the built package, including inherited React prop types. React's own types resolve through the consuming project's \`@types/react\` installation.\n\n${api}\n`

mkdirSync(output, { recursive: true })
for (const [filename, contents] of [
  ['llms.txt', index],
  ['llms-full.txt', full],
  ['components.json', `${JSON.stringify(manifest, null, 2)}\n`],
]) {
  writeFileSync(resolve(output, filename), contents)
}
console.log(`Agent docs generated: ${declarations.length} declaration files, ${publicEntries[0].exports.length} root exports, ${cssVariables.length} CSS variables.`)
