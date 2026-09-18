# UI library and reference-demo ledger

Updated: September 18, 2026.

UI is a general React component library for cards, buttons, forms, menus, panels, and animated backgrounds. Its homepage and catalog serve people building their own products. The original Luma recreation remains an optional integration example.

The package remains a private alpha with unfinished provenance and licensing work. Start with the [package guide](../packages/react/README.md), [agent guide](agent-guide.md), or [catalog](https://ui.wtw.quest/ui). Retain current package imports and CSS tokens for compatibility; their historical names do not define the product's scope.

This document records current components and the original reference-demo research. Fidelity requirements below apply to that recorded demo and any components claiming reference parity. They do not make an event site the default for new consumers or commit the general library to every proposed extraction.

## Current implementation

The shared catalog uses the exported cards, controls, forms, menus, panels, and backgrounds. It also includes optional event compositions from the reference demo. [Recorded browser checks](../reference/QA.md) cover selected reference layouts and interactions; full reference parity remains open.

| Alpha component | Implementation | Configuration |
| --- | --- | --- |
| `Button`, `IconButton`, `Badge`, `Icon` | `packages/react/src/foundations/` | Native attributes, variants, sizes, loading and disabled states |
| `Card` and header/title/description/content/footer slots | `packages/react/src/foundations/` | Content, padding, native attributes, scoped styles |
| `Avatar`, `AvatarGroup`, `Separator` | `packages/react/src/foundations/` | Images/fallbacks, sizes, shape, grouping, orientation |
| `Field`, `Input`, `Textarea`, `Checkbox`, `Switch` | `packages/react/src/foundations/` | Labels, hints, errors, native forms, refs, controlled or native state |
| `Tabs`, `Select`, `DropdownMenu` | `packages/react/src/foundations/`, `dropdowns/` | Controlled values/actions, options, disabled states, keyboard interaction |
| `EventCard` | `packages/react/src/events/EventCard.tsx` | Timeline/compact variants, cover, host, badges, native link adapter |
| `EventDetails`, `RegistrationCard` | `packages/react/src/events/EventDetails.tsx` | Page/preview presentation; supplied data, content, fonts, and actions |
| `SidePanel` | `packages/react/src/SidePanel.tsx` | Controlled open/close, toolbar/content slots, styling, portal container |
| `EventPreview` | `packages/react/src/events/EventPreview.tsx` | Content, links, translated labels, previous/next callbacks, copy adapter |
| `EventBackground` | `packages/react/src/backgrounds/` | Theme, tint, appearance, seed, pause/reduced motion, optional grain texture |

The package builds ESM, TypeScript declarations, and an explicit stylesheet. React 19 and React DOM are peer dependencies.

- `examples/react` installs the tarball and serves at `/playground/`.
- The site's `/ui` route imports the same `Catalog.tsx`. Root Vite deduplication and TypeScript paths resolve the workspace package and one React instance.
- `npm run verify:package` checks a fresh installation outside the repository, TypeScript, production build, exports/assets, and Node SSR.
- `npm test` covers form semantics, keyboard interaction, controlled behavior, SSR/hydration, overlay cleanup, and animation lifecycle.

These checks establish functional behavior and portability. Visual comparison remains separate work.

In the reference demo, timeline and discovery rows use `EventCard`; `PageUI` imports the package's `Icon`. Existing `src/ui` adapters continue to expose panels and backgrounds. `EventPreviewProvider`/`EventLink` own selection and URL/history handling.

The shared catalog uses `EventDetails` for its full pages and previews. The original `EventPage.tsx` still owns its app-specific layout and local actions. A full migration to the package presentation remains work to do.

The catalog's `src/assets` contains demo fonts, four captured covers, available profile photos, and reference branding. These are **demo-only assets**, excluded from the component package. Package consumers provide their own fonts, data, and URLs. Source-derived renderers and the grain texture remain covered by the [provenance review](../packages/react/PROVENANCE.md).

The reference demo's nine fixtures contain six `legacy` events and one each of `warp`, `life`, and `grain-dark`. Theme configuration is larger than a background name: the inspected reference registry also defines title fonts, light/dark behavior, high-contrast surfaces, cover treatment, liquid glass, and tint behavior. For example, its defaults specify Roc Grotesk for Warp, Geist Mono for Life, and Futura for Grain. An event's own explicit settings may override defaults. Applying Roc Grotesk and a dark palette to every event loses these details.

Reference directory tiles, timelines, dialogs, maps, headers, footers, and marketing sections remain app-specific. Any future extraction needs explicit data, routing, clock, asset, and storage boundaries.

## Reference-demo evidence

For reference comparisons, maintain a manifest with one row per route, theme, component variant, and interaction state. Each row records:

- Stable ID, reference URL, capture timestamp, viewport, DPR, browser/OS, locale, timezone, current clock, motion preference, and whether fonts/images have finished loading.
- Exact fixture/theme configuration, source asset URL and content hash, reference screenshot, a short recording for motion, and important computed styles or bounding boxes.
- State entry steps and exit steps, including pointer position, scroll position, keyboard focus, and URL/history behavior.
- Status: `uncaptured`, `captured`, `implemented`, `verified`, or `known-difference`; owner and evidence links. A build or a self-comparison cannot promote a row to `verified`.
- Any permitted difference with a concrete reason. An unknown duration, spring, radius, or breakpoint is recorded as unknown instead of filled with an arbitrary value.

Reference entry points are [the homepage](https://luma.com/), [discovery](https://luma.com/discover), [Tokyo](https://luma.com/tokyo), and the event URLs listed below. Durable selected screenshots and measurements are in [`reference/QA.md`](../reference/QA.md) and `reference/qa/`; theme observations are in [`src/ui/backgrounds/REFERENCE.md`](../src/ui/backgrounds/REFERENCE.md). These records predate package extraction and do not cover every state. Extend them into a complete manifest before declaring parity.

The original inspection also used `/tmp/luma-reference/` for HTML, metadata, layout notes, and public JavaScript/CSS. Temporary files are not a durable evidence dependency; preserve permitted measurements and provenance in the repository before relying on them for a release.

The inspected theme registry is in the captured `2vrnqe5_1qozw.js` (`let b={legacy:...}`). It establishes available theme IDs/defaults, not proof that all variants have been visually inspected. Preserve extracted configuration and provenance rather than shipping the reference application's compiled bundle as the library.

### Initial route fixtures

| Local/reference path | Theme captured in the fixture | Coverage role |
| --- | --- | --- |
| `/z6y1x5zv` | Warp | Dark animation, private address, waitlist |
| `/l2tdcs1e` | Life | Cellular animation, theme-specific typography |
| `/july4-brooklyn` | Grain dark | Grain/color motion, past event, New York timezone |
| `/dhq3kyhy` | Legacy | Red tint and long title |
| `/23p9j1fs` | Legacy | Running event and blue tint |
| `/io051sf7` | Legacy | Very dark tint and institutional event |
| `/z0zqovpu` | Legacy | Tech event and blue tint |
| `/jlnifjub` | Legacy | Past paid event, JPY formatting |
| `/5.5` | Legacy | Online event and light cover colors |

Registration state is not permanently determined by an event's date on the live site. Pin fixture clock and state explicitly for repeatable stories.

## Component boundaries

General components accept user content, styling, and callbacks. The tarball consumer checks portability; the reference demo is one integration example. The table records current exports and candidate extractions from the original demo.

| Layer | Public components/modules | Current extraction source | Required responsibility |
| --- | --- | --- | --- |
| Foundations | `Icon` and scoped tokens now; full theme resolver, font configuration, and motion clock planned | Package `foundations/`; app fonts/theme metadata | Preserve measured styles; keep fonts opt-in; supply locale and clock |
| Primitives | Buttons, badges, avatars/groups, fields, inputs, textarea, checkbox, switch, select, menus, tabs, separator now; link and skeleton planned | Package `foundations/`, `dropdowns/` | Visual states, native forms, keyboard behavior; no fixture imports |
| Surfaces | `SidePanel` and `Card`/slots now; centered dialog, glass surface, popover, tooltip, toast planned | Package panels/foundations; app `Modal` | Portal order, focus, dismissal, scrolling, animation lifecycle |
| Event summaries | `EventCard` timeline/compact now; timeline grouping and homepage variants planned | Package `EventCard`; app discovery/timeline | Preserve each presentation and native link behavior |
| Event presentation | `EventDetails` page/preview and `RegistrationCard` now; granular cover/facts/hosts/guests/location/actions exports planned | Package `EventDetails`; app `EventPage` | Supplied content and actions; preserve page/preview layouts |
| Event navigation | `EventPreview` now; provider/link/layout adapters remain app-specific | Package preview; app `EventPreviewProvider` and `EventPage` | Open/close/expand; preserve origin route, scroll, focus, and native link semantics |
| Event themes | `EventBackground` now; `EventTheme` and full configuration resolver planned | Package renderers; app font/theme metadata | Typed configuration; tint/fonts/surfaces/cover treatment plus animation |
| Discovery | `CategoryTile`, `CalendarCard`, `CityTile`, `CityPicker`, `ContinentTabs`, `BrowseFilters`, `DirectorySection` | `Discovery.tsx`, `DiscoverPage.tsx`, `BrowsePage.tsx` | Controlled filters and selection; explicit loading/empty/error states |
| Site composition | `SiteHeader`, `SiteFooter`, `LandingHero`, `PosterField`, `ThemeReveal`, `FooterLife` | `Hero.tsx`, `Footer.tsx`, `PageUI.tsx` | Marketing-specific layout remains separate from event primitives |

Two components can look different while sharing behavior. In particular, a centered dialog and an event preview drawer should share accessibility/lifecycle code without being forced into the same dimensions or transition.

### Public API rules

- Presentational components receive normalized data and callbacks. They do not fetch Luma data or import `event-fixtures.json`.
- `EventLink` retains a real `href`. A normal primary click can open a preview; modified clicks, middle-click, copied links, and direct navigation preserve expected link behavior.
- Navigation is an adapter (`navigate`, `getHref`, preview URL policy), so consumers can use their own router. Opening a preview, expanding it, closing it, and browser Back/Forward must have separately defined outcomes verified against the reference.
- Saved/followed/registered state is controlled through props. The demo may supply a localStorage adapter; the component package must work without storage, window globals at import time, or a network.
- Dates receive an explicit locale/timezone and an injectable `now`. Currency formatting uses the currency's minor-unit precision. City assignment comes from data rather than event-slug special cases.
- An asset resolver or explicit URLs replace fixed `/assets/` paths. Images provide dimensions/aspect ratios, loading and failure states. Fonts are opt-in assets with documented fallbacks.
- Theme names use a discriminated union with validated parameters. Unknown IDs produce an explicit development warning and documented fallback, not silent “verified” support.
- Portal containers, stacking order, and body scroll locking support nested overlays. Only the uppermost dismissible overlay consumes Escape.

**Current card API:** the application owns navigation and event data.

```tsx
<EventCard
  title={event.name}
  href={`/events/${event.id}`}
  coverUrl={event.image}
  time={formattedTime}
  location={event.location}
  variant="timeline"
/>
```

Use `variant="compact"` for discovery rows. `renderLink` receives the native anchor props and children so a router or preview controller can wrap them without nested links. `EventDetails` accepts already-formatted date labels, host/location data, content slots, and registration actions. See the [package API guide](../packages/react/README.md).

## Tokens and reference-theme research

The alpha uses scoped component CSS and configurable `--event-ui-*` tokens for panels and controls. It does not import the app's universal reset. Consumers choose their fonts, colors, and composition. The original reference-theme proposal separates:

1. Foundation values: reference color ramps, spacing, radii, typography metrics, shadows, borders, blur, z-index, and motion curves.
2. Semantic roles: page/surface/raised surface; text/secondary/tertiary; border/hover/focus; primary action/destructive/disabled.
3. Component values: preview width and inset, cover radius, registration panel glass opacity, timeline gap, header height.
4. Theme overrides: font, color mode, tint, background renderer and parameters, cover frame, glass/high-contrast treatment.

For reference-demo fidelity, the proposed resolution order is: defaults → selected theme defaults → event-specific settings → explicit consumer overrides. Record the origin of each measured value. Color mode can be explicit light/dark or reference-derived; it cannot be inferred solely from the cover's average color unless the reference does so.

Recorded values from the reference homepage include its `#151515` base, 960px content width, 80px/500 title at desktop with `.92` line height, and title sizes 70/60/48/40px at the inspected 1000/820/650/450px breakpoints. The reference hero reveal uses a 200ms hover dwell and 500ms transitions; its entrance curve is `cubic-bezier(.55,1.42,.34,1)` and exit curve is `cubic-bezier(.22,1,.36,1)`. These are homepage measurements, not a license to reuse those values for every drawer, modal, or event animation.

The reference-demo homepage CSS uses a 600ms reveal with a shared curve; that difference belongs in the ledger. Its CSS poster float is also an approximation of the reference's continuous x/y functions. Record exact motion parameters before extracting those effects as stable library APIs.

## Reference theme coverage

The captured registry contains **43 theme IDs**. The alpha renders **five variants across four families**: `legacy`, `warp`, `life`, `grain-dark`, and `grain-light`. Four IDs occur in captured event fixtures; Grain Light is implemented from inspected configuration but lacks a captured event comparison. Finding a name in source does not establish visual support. A library claiming the full catalog must close every row below, including each family's configuration variants.

| Family | Captured IDs | Additional configuration/verification |
| --- | --- | --- |
| Minimal | `legacy` | Light/dark, event font, tint, supplied image, blur and overlay behavior |
| Warp | `warp` | Radial motion, trail density/speed/color, focal point, camera/pointer response, glass surfaces |
| Life | `life` | Cellular rules, grid size, update cadence, fading/persistence, palette, seed, title font |
| Grain | `grain-dark`, `grain-light` | Grain scale, color field, temporal noise/speed, contrast, Futura typography |
| Quantum | `shader-dark`, `shader-light` | Shader name and three-color configuration, each shader variant |
| Emoji | `emoji-dark`, `emoji-light` | Emoji-name variants, asset style, distribution, depth and pointer response |
| Confetti | `confetti-dark`, `confetti-light` | Circle/heart/party/star variants, particle physics, surface treatment |
| Patterns | `cross`, `hypnotic`, `plus`, `polkadot`, `wave`, `zigzag`, `grid`, `diamond` | Pattern spacing, phase, scale, tint, scrolling/motion where observed |
| Video-based seasonal | `iridescent-light`, `iridescent-dark`, `matrix`, `falling-leaves`, `bats`, `snow-light`, `snow-dark` | Source video timing/crop/blend; Polaroid cover frame; reduced-motion still |
| Other shader scenes | `fireworks`, `pool-light`, `pool-dark`, `sunny-shades`, `particles-champagne`, `particles-bokeh`, `space-war` | Scene-specific dynamics, palettes, cover/background relationships |
| Illustrated/holiday | `floral`, `holiday-diwali`, `holiday-pie`, `holiday-foliage`, `holiday-turkey`, `holiday-santa`, `holiday-sweater`, `holiday-hanukkah` | Artwork composition, font, cover frame, tint constraints |
| Games | `tamagotchi`, `snake` | Game state/input if publicly exposed, typography, animation and fallback |

Families without an alpha renderer remain inventory items until their behavior is captured and implemented. Verify the existing families before filling additional names with guessed effects.

## Reference-demo state matrix

This records the original reference capture and implementation scope. “Verify” below denotes required work, not a completed test. Every visual component also needs default, hover, active, focus-visible, and disabled states where meaningful.

| Surface | Visual/data variants | Interaction and transition states to verify |
| --- | --- | --- |
| Homepage hero | Desktop poster field; tablet; mobile collage; each reveal theme | Initial load and staged text/poster entrance; hover dwell; reveal open/close/interruption; repeated hover cycling; pointer movement; touch behavior; reduced motion |
| Homepage discovery | Popular/major cards, calendars, categories, city picker | Card hover/focus; city picker open/search/selection/empty/dismissal; event click → preview; keyboard activation |
| Directory | Event row, category grid, calendar cards, all continent panels | Follow/unfollow and busy/error if exposed; tab keyboard navigation; overflow; preview from each event entry |
| City/category browsing | Hero artwork, counts, filters, timeline, long titles | Search expand/collapse; query changes; filter menus; clear/reset; zero results; loading/error; next-page loading if reference exposes it; URL restoration |
| Event preview | Every supported theme; short/long content; mobile/desktop; normal/paid/waitlist/past | Closed → entering → open → closing; backdrop and close button; internal scrolling; expand to page; browser Back/Forward; direct event URL; modifier click; focus and scroll restoration; nested share/register overlay |
| Event page | Light/dark and each theme; long names; multiline hosts; online/public/private location; no/many guests | Cover lightbox, host interaction, guest list behavior, description expansion/links, location interaction, share/save, calendar menu/download, page scroll/sticky actions if present |
| Registration | Free, paid, approval required, full, waitlist, closed, past; ticket options/quantity where exposed | Signed-out form/auth boundary; validation; loading; server error; success; waitlist; payment boundary. Preview-only adapters must stay explicit |
| Overlay primitives | Dialog, popover, drawer, nested overlay; short/overflowing content | Escape, outside click, Tab/Shift+Tab, focus return, scroll lock, layer order, viewport resize, interrupted entrance/exit, reduced motion |
| Theme renderers | Each supported configuration, light/dark, mobile/desktop, DPR 1/2 | Start; t=0/250/500/1000/3000/10000ms; pointer center/corners/leave; resize; tab hidden/resume; offscreen/resume; reduced motion; missing GPU/context loss |
| Header/footer | Marketing and compact variants, mobile/desktop | Clock formatting; search open/close; footer animation; navigation destinations and focus/hover |
| Shared controls | Button variants, inputs, select, badges, avatar stacks | Empty/filled/error/disabled/loading; keyboard focus; long labels; missing images; high zoom and text wrapping |

Use explicit stories for combinations that alter composition rather than taking the complete Cartesian product. Every theme receives its own motion story; every registration state receives a story; each composite page receives desktop and mobile reference captures. Then add pairwise coverage for the remaining independent variations.

### Event preview contract

The intermediate preview is part of the navigation model, not just a different card style. Its evidence row must specify:

- Which entry points open it, whether the address bar changes, and what browser Back does.
- Opening edge/direction, viewport inset, width, backdrop opacity/blur, duration, easing or spring values, and any origin-card transform.
- What remains visible/interactable behind it, where scrolling occurs, and whether a scrollbar changes page width.
- Exact preview header/actions and the control that opens the full event page.
- Whether expansion shares state, preserves background animation time, and restores the originating page when dismissed/backed out.
- Mobile layout and gesture behavior only when observed; do not add a swipe gesture merely because it seems appropriate.

## Reference visual and motion verification

The shared catalog at `/ui` and `/playground/` provides interactive controls, usage examples, event compositions, and theme settings. Both entry points use the same catalog source; the standalone app tests the packed package. Expand state coverage and evidence links before treating this as a complete reference-backed catalog.

For repeatable captures, inject fixture time (`2026-09-18T06:00:00Z` is a useful initial baseline), locale/timezone, a seeded random source, and a manual animation clock. Motion components should support `seek(ms)`, pause/resume, and disposal in the test harness without making production animations global. Wait for `document.fonts.ready`, image decode, and stable layout before capture. Do not hide the actual effect in order to make screenshot tests pass.

Capture the existing reference viewports (1440px desktop, 1028px compact desktop, 768px tablet, 390px mobile), a 320px narrow case, and one pixel on either side of every actual component breakpoint. Record heights as well as widths. Compare in the same browser/OS/DPR first; verify Firefox/WebKit behavior separately rather than accepting cross-engine rasterization noise as a design change.

Use three complementary checks:

1. **Geometry and typography:** exact layout bounds, line breaks, font family/weight, baseline spacing, border/radius, and image crop. Overlays at 50% opacity and difference images make drift visible. A one-pixel position error or an incorrect line break is actionable even if a global image similarity score is high.
2. **Deterministic frames:** compare reference-backed still states and local seeded animation frames at defined times. Proposed initial static tolerance is at most 0.1% differing pixels after an explicit small anti-aliasing threshold; establish it on repeated unchanged captures and inspect every failure. Never mask an entire animation, title, preview, or registration panel.
3. **Motion recordings:** compare trajectories, density, speed, acceleration, fade/trail persistence, palette, interaction response, and transition duration. Unseeded live reference motion may not permit frame-for-frame comparison; use measured parameters and side-by-side recordings, and label that evidence as perceptual motion verification rather than exact pixel equality.

Interaction checks must cover event-card → preview → full page → Back, close by button/backdrop/Escape, scroll/focus restoration, modifier-click navigation, nested overlay dismissal, reduced motion, saved/follow state adapters, filtering and URL restoration. Accessibility checks include tab order, dialog naming, focus confinement, semantics, and text zoom. Performance checks include repeated mount/unmount with no orphaned animation frames/listeners/GPU resources, no drawing while hidden, resize correctness, and a stable frame budget on the agreed device profile.

Store reviewed baselines, overlays/diffs, short motion clips, and a machine-readable coverage report as build artifacts. A reviewer should be able to see exactly which row changed; avoid a single blanket “looks close” approval. Browser checks performed during development remain useful evidence, but no automated reference comparison suite currently exists in this repository.

## Remaining reference-demo fidelity gaps

These remain open until evidence closes them, even if the app builds:

- Selected preview geometry, interactions, and animation behavior have recorded checks. Full transition comparisons, mobile variants, and package-extraction visual regression baselines remain incomplete.
- The demo applies captured event title fonts, while the package leaves fonts to its consumer. Full theme mode, glass, cover treatment, and override resolution remain incomplete. Four fixture theme IDs do not establish support for the 43-theme catalog.
- Homepage WebGL, emoji styling, poster randomization, continuous float equations, reveal timing, and material/refraction remain approximations or require re-verification.
- Event descriptions are excerpts; maps are illustrative links rather than the reference map; guest faces/lists and host interactions are simplified. Those substitutions change both layout and interactions.
- Registration and subscriptions are explicit local previews. Authentication, ticket/payment states, real RSVP results, and backend error/loading states are not implemented.
- Nine events do not reproduce live counts or inventory. Category descriptions and most city behavior are generic; many destinations have no local events. City grouping currently uses event-specific shortcuts.
- Header/search, compact footer icons, city picker, filters, tabs, and dialogs need state-by-state reference audits. Native HTML controls alone do not establish reference styling or keyboard parity.
- Some routes intentionally navigate to the original site. Calendar/community pages, account screens, creation flows, and native apps are outside the selected page scope; crossing that boundary must be visible in the catalog.
- The package components accept demo assets, fonts, data, and actions through explicit props or CSS configuration. More app components still need these dependencies separated; the original event page has not yet migrated to `EventDetails`.
- Selected durable screenshots, local galleries, and package-consumer tests exist. A complete reference-state manifest, reviewed screenshot/motion baseline corpus, and automated reference comparison suite do not.
- Public release is blocked on provenance and license decisions. Source-derived renderers and the bundled grain texture require review or replacement; demo reference assets require a separate review.

## Delivery and release scope

Keep commits atomic, as required by the global `AGENTS.md`. Each commit should have one reviewable purpose and its relevant evidence.

1. Keep general controls, forms, panels, and backgrounds usable through explicit props, scoped styles, and documented imports. Run applicable build, interaction, and package-consumer checks after changes.
2. Review source-derived code and the grain texture before selecting a redistribution license. Review demo assets separately. The package remains an unlicensed alpha.
3. Treat further reference extraction, event-page migration, discovery layouts, and additional theme families as optional work. Preserve the measurements and gaps above without presenting them as implemented features.

Current imports: `@event-ui/react`, `@event-ui/react/components`, `@event-ui/react/panels`, `@event-ui/react/backgrounds`, and `@event-ui/react/styles.css`. The package name is provisional. Fonts, sample content, branding, and event artwork stay in the demos. Grain texture provenance is documented separately. A dedicated landing-page export does not exist yet.

Mark an initial release as preview/experimental until its declared component/state matrix is verified. A stable release needs zero untriaged discrepancies in its declared scope, a published supported-theme list, complete controlled-state APIs, keyboard/mobile verification, package-consumer checks, and visual/motion baselines. Additional Luma states discovered later become new manifest rows and cannot inherit a verified badge from a similar-looking component.
