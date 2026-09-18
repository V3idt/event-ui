# UI · local alpha

React components for cards, buttons, forms, menus, panels, and animated backgrounds. Includes event layouts from the original Luma recreation.

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
import { Button, Card, SidePanel } from '@event-ui/react'
```

ES modules and TypeScript declarations are included. React and React DOM are peer dependencies. Modern browsers with native `<dialog>`, ResizeObserver, and IntersectionObserver are required. Animated themes use Canvas or WebGL.

## What's included

| Use | Components |
| --- | --- |
| Actions | `Button`, `IconButton`, `Icon` |
| Surfaces and identity | `Card` and its slots, `Badge`, `Avatar`, `AvatarGroup`, `Separator` |
| Forms | `Field`, `Input`, `Textarea`, `Checkbox`, `Switch`, `Select` |
| Navigation | `Tabs`, `DropdownMenu` |
| Panels and backgrounds | `SidePanel`, `EventBackground` |
| Event layouts | `EventCard`, `EventDetails`, `RegistrationCard`, `EventPreview` |

The component catalog uses these same exports.

## Everyday components

| Component | Main props |
| --- | --- |
| `Button` | `variant`: `primary`, `secondary` (default), `ghost`, `destructive`; `size`: `sm` or `md`; `loading`, `loadingLabel` |
| `IconButton` | Button props, plus a required `aria-label` |
| `Icon` | Typed `name` such as `calendar`, `pin`, `search`, `copy`, `check`; `size` defaults to 18 |
| `Card` | `padding`: `none`, `sm`, `md`; children compose the content |
| `Badge` | `variant`: `neutral`, `success`, `warning` |
| `Avatar` | Required `alt`; optional `src`, `fallback`, `size`: `sm`/`md`/`lg`, `shape`: `circle`/`rounded` |
| `AvatarGroup` | Avatar children; shared `size` |
| `Separator` | `orientation`: `horizontal` or `vertical`; `decorative` defaults to true |

These foundations accept native HTML props, `className`, `style`, and React 19 refs. Loading buttons disable clicks. Avatars fall back to initials when an image fails.

```tsx
<Card>
  <CardHeader>
    <CardTitle>Design workspace</CardTitle>
    <CardDescription>Share drafts and collect feedback.</CardDescription>
  </CardHeader>
  <CardFooter>
    <Button variant="primary">Open workspace</Button>
    <IconButton aria-label="Share workspace"><Icon name="share" /></IconButton>
  </CardFooter>
</Card>
```

Card slots: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.

## Forms and tabs

`Field` generates IDs and connects its label, description, and error to an `Input` or `Textarea`. Use `htmlFor` when supplying your own input ID.

```tsx
<Field label="Email address" description="We'll send updates here." required>
  <Input name="email" type="email" placeholder="you@example.com" />
</Field>
<Field label="Message" error={messageError}>
  <Textarea name="message" />
</Field>
<Checkbox name="updates" label="Email updates" defaultChecked />
<Switch label="Notifications" checked={notifications} onChange={event => setNotifications(event.target.checked)} />
```

`Input` and `Textarea` accept native input props plus `invalid`. `Checkbox` and `Switch` use native checkbox state, keyboard interaction, and form submission; both accept `label` and `description`.

`Tabs` is controlled. Supply `value`, `onValueChange`, `aria-label`, and `items`:

```tsx
<Tabs aria-label="Workspace" value={tab} onValueChange={setTab} items={[
  { value: 'projects', label: 'Projects', content: <ProjectList /> },
  { value: 'members', label: 'Members', content: <MemberList /> },
]} />
```

Items accept `disabled`. Omit `content` when your app renders the selected view elsewhere. Arrow keys and Home/End move between enabled tabs. `orientation="vertical"` enables vertical navigation.

## Select and menus

```tsx
<Select label="Location" value={location} onValueChange={setLocation} name="location" options={[
  { value: 'all', label: 'All locations' },
  { value: 'online', label: 'Online', description: 'Join from anywhere' },
]} />
<DropdownMenu label="More" align="end" items={[
  { id: 'share', label: 'Share project', icon: <Icon name="share" />, onSelect: shareProject },
  { id: 'remove', label: 'Remove project', danger: true, onSelect: removeProject },
]} />
```

Both support disabled options, keyboard navigation, typeahead, and Escape dismissal. `Select` keeps selection in your app; `name` adds its value to native form submission. Give it `label` or `aria-label`. Menu items require unique `id` values and an `onSelect` handler.

## Animated backgrounds

```tsx
<div style={{ position: 'relative', isolation: 'isolate', minHeight: 420 }}>
  <EventBackground
    theme="warp"
    tint="#545454"
    mode="contained"
    paused={false}
  />
  <h1>Your next idea</h1>
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

## Side panel

```tsx
<SidePanel
  open={open}
  onClose={() => setOpen(false)}
  label="Workspace settings"
  toolbar={<button onClick={() => setOpen(false)}>Close</button>}
  style={{ '--event-ui-panel-width': '440px' }}
>
  <YourSettings />
</SidePanel>
```

Desktop drawer; mobile bottom sheet at 450px and below. Includes a native modal dialog, Escape/backdrop dismissal, focus restoration, and nested scroll locking.

Optional props: `className`, `style`, `toolbarClassName`, `contentClassName`, `portalContainer`. The portal defaults to `document.body`; supply a container in the current document when needed.

## Optional event layouts

```tsx
<EventCard
  title="An evening of good ideas"
  href="/events/good-ideas"
  coverUrl="/images/good-ideas.jpg"
  time="6:00 PM"
  hostName="Design Circle"
  location="San Francisco"
  badges={[{ label: 'Waitlist', tone: 'warning' }]}
/>
```

- `EventCard`: `variant="timeline"` or `"compact"`; supports host avatars, attendance, and badges. Use `renderLink` to connect your router or preview controller; forward its supplied link props.
- `EventDetails`: the shared full-page and preview layout. Requires `title`, `coverUrl`, and `date={{ month, day, label, time }}`. Set `presentation="preview"` inside an `EventPreview`.
- Detail slots: `host`, `location`, `registration`, `about`, `featured`, `actions`, `sidebar`, `locationDetails`. Use `labels` for translations and `titleStyle` for event typography.
- `RegistrationCard`: registration presentation with a required `action` element. Optional `title`, `description`, `status`, and `price`. Your app handles submission.

### Event preview

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
- All `SidePanel` props above are available except `label` and `toolbar`.

## Fonts and customization

The demo loads Inter. The package does not include font files: load your chosen font in your application and set `--event-ui-font-family`.

CSS variables work globally or on a containing element. Panels portal to `document.body` by default, so use global variables or panel `style` for their overrides.

```css
:root {
  --event-ui-font-family: Inter, system-ui, sans-serif;
  --event-ui-color: #ffffff;
  --event-ui-card-background: #ffffff05;
  --event-ui-panel-background: #232323;
  --event-ui-panel-color: #ffffff;
  --event-ui-focus: #ffffffa6;
  --event-ui-focus-color: #ffffffa6;
}
```

Useful tokens:

- Foundations: `--event-ui-border`, `--event-ui-muted-color`, `--event-ui-primary-{background,color,hover}`, `--event-ui-input-{background,border}`.
- Menus: `--event-ui-menu-background`, `--event-ui-border`, `--event-ui-focus`.
- Panels: `--event-ui-panel-{width,radius,mobile-radius,border,backdrop}`, `--event-ui-motion-duration`, `--event-ui-motion-easing`.
- Preview toolbar: `--event-ui-control-{background,color,hover-background,hover-color,radius}`.

## Imports and rendering

| Import | Includes |
| --- | --- |
| `@event-ui/react` | All components |
| `@event-ui/react/components` | Foundations, dropdowns, and event cards/details; no animated background renderers |
| `@event-ui/react/panels` | `SidePanel`, `EventPreview` |
| `@event-ui/react/backgrounds` | Background component, helpers, and types |

Always import `@event-ui/react/styles.css` separately.

SSR imports are safe. Panels render nothing on the server and mount a portal after hydration. Backgrounds render their static surface first, then initialize animation on the client. JavaScript entries preserve `"use client"` for React server-component frameworks; framework-specific integration is not yet tested.

No router, event fixtures, downloaded fonts, logos, or event photos are included. Your application supplies them.

## Validation

From the repository root:

```sh
npm test                # keyboard, forms, lifecycle, and SSR checks
npm run verify:package  # fresh tarball install + TS/build/SSR checks
npm run example:install
npm run example:dev     # http://localhost:5174/playground/
```

Five background variants are available. The Luma example remains a work in progress.
