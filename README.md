# Event UI + Luma recreation

**Two things live here:** a Luma-style demo app and a locally installable React 19 component package.

**Start with [the component catalog](http://localhost:5173/ui).** It includes the clone's event cards, previews, backgrounds, and a growing set of basic controls.

The package is a **local private alpha**. Public release still needs the [provenance review](packages/react/PROVENANCE.md).

| Use | Components |
| --- | --- |
| Actions and surfaces | `Button`, `IconButton`, `Card` and its slots, `Badge`, `Icon`, `Separator` |
| Forms | `Field`, `Input`, `Textarea`, `Checkbox`, `Switch`, `Select` |
| Navigation and people | `DropdownMenu`, `Tabs`, `Avatar`, `AvatarGroup` |
| Event UI | `EventCard`, `EventDetails`, `RegistrationCard`, `EventPreview`, `SidePanel`, `EventBackground` |

## Run the original demo

Use Node 24 and npm.

```sh
npm ci
npm run dev
```

Open **[localhost:5173](http://localhost:5173/)**. The dev command builds the component package first.

Useful pages:

- [Homepage](http://localhost:5173/)
- [Discovery](http://localhost:5173/discover)
- [Event preview](http://localhost:5173/tokyo?e=z6y1x5zv)
- [Event page](http://localhost:5173/z6y1x5zv)
- [Component gallery](http://localhost:5173/ui)

## Try the package in a separate app

From the repository root:

```sh
npm run example:install
npm run example:dev
```

Open **[localhost:5174/playground/](http://localhost:5174/playground/)**. This app installs the packed tarball. It shows the **same catalog** as `/ui`, with working controls, code examples, event previews, and theme settings.

The catalog uses the clone's Inter, Roc Grotesk, and Geist Mono files plus four captured event covers and available host avatars. Those reference assets stay in the demo. They are excluded from the component package.

For installation in another React 19 project, props, CSS tokens, and examples, read the **[package README](packages/react/README.md)**.

```tsx
import '@event-ui/react/styles.css'
import { Button, Card, EventCard, EventPreview, Select } from '@event-ui/react'
```

The package includes ESM, TypeScript declarations, and scoped component styles. It does not include the demo's router, fixtures, downloaded fonts, logos, or event photos. Applications supply their own data and actions.

## Check the work

```sh
npm run build           # package + demo production builds
npm test                # component lifecycle, SSR, and hydration contracts
npm run verify:package  # fresh tarball install + TypeScript/build/SSR checks
```

GitHub Actions runs these checks. See the [package QA record](reference/PACKAGE-QA.md) for browser coverage. These checks do not establish complete visual parity with Luma.

## Demo features

- **Homepage:** poster artwork, glass frames, hover reveals, mobile collage, city picker, and animated footer.
- **Discovery:** event rows, 12 categories, 85 city destinations, search, and date/city/free/saved filters.
- **Nine event pages:** covers, host details, calendar downloads, share/save actions, and registration/waitlist previews.
- **Event previews:** desktop drawer, mobile sheet, copy link, previous/next controls, and browsing-history support.
- **Backgrounds:** Legacy tint, Warp, Life, Grain Dark, and Grain Light. Animations support pause and reduced motion.

The timeline and discovery rows use the package's `EventCard`. Shared icons also come from the package. Event preview routing, fixtures, and local actions remain in the app.

The demo uses captured public Luma content from September 18, 2026. The [fidelity ledger](docs/UI-LIBRARY.md) tracks remaining work; [reference QA](reference/QA.md) records earlier browser checks.

## Routes

| Route | Page |
| --- | --- |
| `/` | Homepage |
| `/ui` | Shared component catalog |
| `/discover` | Discovery directory |
| `/discover/search` | Search; accepts `q`, `city`, `date`, `free`, `saved` |
| `/tokyo`, `/nyc`, other captured city slugs | City browsing |
| `/tech`, `/running`, `/ai`, other category slugs | Category browsing |
| `/z6y1x5zv`, other captured event slugs | Event details |
| `?e=<event-slug>` on browsing routes | Event preview |

Unknown routes show a local not-found page. Static production hosts must fall back to `index.html` for app routes.

## Limits

- Data is static. City/category pages filter nine fixtures; some destinations are empty. Upcoming/past status follows the browser clock.
- Registration and subscriptions are local previews. No RSVP, email, authentication, or payment is submitted. Saved/followed state uses localStorage; names and emails are not stored.
- Authentication, creation, community calendars, and original-event links still open Luma.
- Some motion, maps, descriptions, guest lists, and controls remain simplified. Grain Light lacks a captured event comparison. The full 43-theme inventory is not implemented.
- Source-derived renderers and the bundled grain texture require provenance review before public release. Demo assets require a separate review.

## Where to work

| Path | Purpose |
| --- | --- |
| `packages/react/src` | Reusable components, scoped styles, background renderers |
| `packages/react/test` | Component contract tests |
| `examples/react/src/Catalog.tsx` | Shared catalog at `/ui` and standalone `/playground/` |
| `examples/react/src/assets` | Catalog reference fonts, covers, avatars, and branding; demo only |
| `examples/react` | Independent tarball consumer |
| `src/ui` | Demo re-exports, event fonts, reference metadata, and content styling |
| `src/EventPreviewProvider.tsx` | Demo navigation and preview selection |
| `src/EventPage.tsx` | Demo event content and local actions |
| `src/Hero.tsx`, `src/Discovery.tsx`, `src/Footer.tsx` | Homepage |
| `src/DiscoverPage.tsx`, `src/BrowsePage.tsx` | Discovery and filtering |
| `src/*-fixtures.json`, `public/assets` | Captured demo data and assets |
| `docs/UI-LIBRARY.md` | Expansion plan and fidelity ledger |

Reference imagery, branding, and fonts came from the public pages and asset URLs served by [Luma](https://luma.com/). `scripts/capture-events.py` can refresh the nine public event fixtures; it requires Python 3 and curl.
