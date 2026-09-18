# Use UI in a project

UI provides React components for cards, buttons, forms, menus, panels, and animated backgrounds. Build the user's product with these general components and their own content. Follow the project's visual direction, typography, and layout needs.

Use the exported components before writing substitutes. `@event-ui/react`, `EventBackground`, and `--event-ui-*` are retained technical names. They work in general UI; they do not require an event site.

## Read first

- Target React 19 and React DOM 19. The package uses ES modules and ships TypeScript declarations.
- TypeScript projects need matching React 19 types, `@types/react` and `@types/react-dom`.
- This is a private alpha. It is not on npm and is marked `UNLICENSED`. Source and asset review is unfinished. Public documentation does not grant redistribution rights.
- Use the source repository or checkout supplied by the user. If neither is accessible, request it before attempting installation. Do not invent an npm package, GitHub URL, or download endpoint.
- Inspect the target project's router, build tool, styles, and package manager. Keep its existing conventions.

## Install from source

In the UI checkout, use Node.js 24:

```sh
npm ci
npm run pack:lib
```

`pack:lib` prints the absolute path to the generated `.tgz` in `artifacts/`. Install that file in the target React project with its package manager:

```sh
npm install /absolute/path/printed/by/pack-library.tgz
```

Use the actual printed path. Do not copy the placeholder above unchanged. Keep React and React DOM in the consuming app; the library declares them as peer dependencies.

Import the stylesheet once in the application's entry point:

```tsx
import '@event-ui/react/styles.css'
```

Use the export table and declarations below as the API reference. Import from documented package entry points only. The component catalog at <https://ui.wtw.quest/ui> shows the same components.

## Start with a component

This complete example uses the package's warp background, form, and button:

```tsx
import { useState, type FormEvent } from 'react'
import { Button, Card, EventBackground, Field, Input } from '@event-ui/react'
import '@event-ui/react/styles.css'

export function NewsletterSignup({ onJoin }: { onJoin: (email: string) => Promise<void> }) {
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = String(new FormData(event.currentTarget).get('email') ?? '')
    setPending(true)
    setMessage('')
    try {
      await onJoin(email)
      setMessage('You are on the list.')
    } catch {
      setMessage('Could not join. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <section style={{ position: 'relative', isolation: 'isolate', minHeight: 420, padding: 32, color: '#fff' }}>
      <EventBackground theme="warp" tint="#737373" mode="contained" />
      <Card style={{ maxWidth: 360, margin: '0 auto' }}>
        <h1>Notes on design</h1>
        <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
          <Field label="Email" required>
            <Input name="email" type="email" autoComplete="email" />
          </Field>
          <Button type="submit" variant="primary" loading={pending} loadingLabel="Joining...">Join the list</Button>
          <p role="status">{message}</p>
        </form>
      </Card>
    </section>
  )
}
```

Pass a real `onJoin` handler when using this form. The package supplies presentation; your app supplies authentication, persistence, payments, and submission behavior.

## Style it

The package includes scoped CSS. It does not bundle demo fonts, logos, or photography. Load fonts and provide images from the consuming app.

```css
:root {
  --event-ui-font-family: Inter, system-ui, sans-serif;
  --event-ui-color: #fff;
  --event-ui-card-background: #ffffff05;
  --event-ui-panel-background: #232323;
  --event-ui-panel-color: #fff;
  --event-ui-focus: #ffffffa6;
  --event-ui-focus-color: #ffffffa6;
}
```

Variables inherit from their containing element. Panels portal to `document.body` by default, so put their overrides on `:root`, use panel `style`, or supply `portalContainer`. The generated token list below includes the CSS fallback values.

## Interaction rules

- Give `IconButton` an `aria-label`, `Avatar` an `alt`, and `Tabs` an `aria-label`. Give `Select` a `label`, `aria-label`, or `aria-labelledby`.
- Wrap `Input` and `Textarea` in `Field` to connect labels and errors. For an explicit input ID, pass the same ID to `Field.htmlFor`.
- `Select` and `Tabs` are controlled. Supply `value` and `onValueChange`. Checkbox and Switch use native `checked`, `defaultChecked`, and `onChange`.
- Keep menu item IDs and option values unique. Preserve keyboard navigation, visible focus, Escape dismissal, and the overlay's return focus.
- Put contained backgrounds inside an element with `position: relative`, `isolation: isolate`, and a nonzero height. Leave `reducedMotion` unset so it follows the operating system.
- Modern browsers need native `dialog`, ResizeObserver, and IntersectionObserver. Animated backgrounds use Canvas or WebGL and can fall back to a static tint.
- Server imports are supported. Panels mount after hydration. Background animations start on the client. Interactive use in a React server-component app requires a client component; framework-specific integration is not yet verified.

## Verify the integration

Run the consuming project's typecheck and build. Test the added UI at desktop and mobile widths. Check keyboard focus, Escape, reduced motion, form feedback, images, and links relevant to the change.

The source checkout also provides:

```sh
npm test
npm run verify:package
```

`verify:package` installs a fresh tarball outside the workspace, then checks TypeScript, a production build, package exports, bundled assets, and server rendering. It does not verify the consuming project's backend or framework integration.

## Optional recipes

For an event feature, use the [event preview recipe](https://ui.wtw.quest/ui#event-preview) and its exact API declarations below. Keep `EventPreview` mounted while toggling `open`; preserve modified clicks and native links when connecting a preview. Use `SidePanel` for general drawers and settings panels.
