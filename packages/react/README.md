# Event UI · local alpha

Three configurable React components, extracted from the Luma recreation.

**Status:** installable locally. Not published or licensed for public redistribution yet. Read [PROVENANCE.md](./PROVENANCE.md) before releasing it.

## Install

From the repository root:

```sh
npm install
npm run pack:lib
```

In another React 19 project:

```sh
npm install /absolute/path/to/artifacts/event-ui-react-0.1.0-alpha.0.tgz
```

Import the stylesheet once:

```tsx
import '@event-ui/react/styles.css'
import { EventBackground, EventPreview, SidePanel } from '@event-ui/react'
```

ES modules and TypeScript declarations are included. React and React DOM are peer dependencies. Modern browsers with native `<dialog>`, ResizeObserver, and IntersectionObserver are required. Animated themes use Canvas or WebGL.

## EventBackground

```tsx
<div style={{ position: 'relative', isolation: 'isolate', minHeight: 420 }}>
  <EventBackground
    theme="warp"
    tint="#7357d6"
    mode="contained"
    paused={false}
  />
  <h1>Your event</h1>
</div>
```

| Prop | Default / options |
| --- | --- |
| `theme` | Required: `legacy`, `warp`, `life`, `grain-dark`, `grain-light` |
| `tint` | `#151515`; 3- or 6-digit hex |
| `mode` | `fixed` or `contained` |
| `appearance` | `dark` or `light`; controls Legacy and Life |
| `legacyStyle` | `one-to-one` or `classic` |
| `seed` | `1729`; reproducible particle placement |
| `paused` | `false` |
| `reducedMotion` | Follows the OS when omitted |
| `noiseTextureUrl` | Bundled Grain texture; custom remote textures need CORS |
| `className`, `style` | Additional styling |

Animations pause when hidden, offscreen, or reduced motion is requested. Unknown themes show a static tint and a console warning. Grain Light is implemented but still lacks a captured reference comparison.

## EventPreview

```tsx
const [open, setOpen] = useState(false)

<button onClick={() => setOpen(true)}>Preview event</button>
<EventPreview
  open={open}
  onClose={() => setOpen(false)}
  title="An evening of good ideas"
  href="/events/good-ideas"
  labels={{ eventPage: 'View event', copyLink: 'Copy link' }}
  onNext={() => selectNextEvent()}
>
  <YourEventContent />
</EventPreview>
```

Your app owns event data, navigation, registration, and open state. Keep the component mounted while changing `open` so its exit animation can finish.

- `onPrevious` / `onNext`: omitted controls are disabled.
- `labels`: translate `dialog`, `close`, `copyLink`, `copied`, `copyFailed`, `eventPage`, `previous`, `next`.
- `onCopyLink(url)`: replace the Clipboard API with your own adapter.
- `copyFallback(url, error)` / `onCopyError(error)`: handle clipboard failures.
- `eventLinkTarget`: `_blank` by default; `eventLinkRel` is configurable.
- All `SidePanel` props below are available except `label` and `toolbar`.

## SidePanel

```tsx
<SidePanel
  open={open}
  onClose={() => setOpen(false)}
  label="Event settings"
  toolbar={<button onClick={() => setOpen(false)}>Close</button>}
  style={{ '--event-ui-panel-width': '440px' }}
>
  <YourSettings />
</SidePanel>
```

Desktop drawer; mobile bottom sheet at 450px and below. Includes a native modal dialog, Escape/backdrop dismissal, focus restoration, and nested scroll locking.

Optional props: `className`, `style`, `toolbarClassName`, `contentClassName`, `portalContainer`. The portal defaults to `document.body`; supply a container in the current document when needed.

CSS variables work globally or through `style`:

```css
:root {
  --event-ui-font-family: system-ui, sans-serif;
  --event-ui-panel-background: #232323;
  --event-ui-panel-color: #ffffff;
  --event-ui-focus-color: #cbbafd;
}
```

Other tokens: `--event-ui-panel-width`, `--event-ui-panel-radius`, `--event-ui-panel-mobile-radius`, `--event-ui-panel-border`, `--event-ui-panel-backdrop`, `--event-ui-color-scheme`, `--event-ui-motion-duration`, `--event-ui-motion-easing`, and `--event-ui-control-{background,color,hover-background,hover-color,radius}`.

## Imports and rendering

Use `@event-ui/react/panels` when only overlays are needed, or `@event-ui/react/backgrounds` for themes. The main entry exports both. Always import `@event-ui/react/styles.css` separately.

SSR imports are safe. Panels render nothing on the server and mount a portal after hydration. Backgrounds render their static surface first, then initialize animation on the client. JavaScript entries preserve `"use client"` for React server-component frameworks; framework-specific integration is not yet tested.

No router, event fixtures, downloaded fonts, logos, or event photos are included. Your application supplies them.

## Validation

From the repository root:

```sh
npm test                # component lifecycle and SSR contracts
npm run verify:package  # fresh tarball install + TS/build/SSR checks
npm run example:install
npm run example:dev     # http://localhost:5174/playground/
```

This alpha covers three components and five theme variants. It does not claim complete Luma coverage or pixel-perfect fidelity.
