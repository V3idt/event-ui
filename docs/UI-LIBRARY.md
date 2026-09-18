# UI library and fidelity plan

Audit date: September 18, 2026. Scope: the public homepage, discovery directory, city/category browsing, event previews, and event detail pages. This is an implementation plan and coverage ledger, not a claim that every item below is implemented or visually verified.

The library should reproduce a **versioned, recorded set of Luma states**. “Perfect copy” is an acceptance criterion for that set, not something a homepage screenshot or successful build proves. The live reference changes its events, dates, randomized artwork, and themes. Unknown states remain visible in the ledger until captured; they must not quietly become generic substitutes.

## What the audit found

The original event implementation had two specific omissions: `WarpBackdrop` drew one static frame, and every other theme used the same tinted, blurred cover. Event links navigated directly to a page instead of opening the intermediate event preview. Those are separate motion and interaction defects. Corrections to those two areas are being developed alongside this document; they need their own reference comparisons before being marked verified.

The first library extraction now exists in code: `src/ui/SidePanel.tsx` provides a controlled native-dialog panel with desktop/mobile transitions, focus restoration, and page scroll locking; `src/ui/events/EventPreview.tsx` composes its toolbar and content. The app-level `EventPreviewProvider`/`EventLink` adapter owns selection and URL handling, and `EventPage` supports a preview presentation. Background renderer modules are being added under `src/ui/backgrounds/`. These pieces are **implemented/in progress**, not published package exports or proof of complete reference parity. History restoration, filtered event sequences, nested dialogs, and exit cleanup require integration checks.

The existing nine fixtures contain six `legacy` events and one each of `warp`, `life`, and `grain-dark`. Theme configuration is larger than a background name: the inspected reference registry also defines title fonts, light/dark behavior, high-contrast surfaces, cover treatment, liquid glass, and tint behavior. For example, its defaults specify Roc Grotesk for Warp, Geist Mono for Life, and Futura for Grain. An event's own explicit settings may override defaults. Applying Roc Grotesk and a dark palette to every event loses these details.

The current application is a good extraction starting point, but is not yet a distributable component library. Components read global `location`, `history`, the current clock, and localStorage; event formatting and examples are tied to a nine-event fixture set; CSS uses global element selectors; assets use `/assets/...` root paths. A reusable library must make those dependencies explicit.

## Source of truth and evidence

Maintain a reference manifest with one row per route, theme, component variant, and interaction state. Each row records:

- Stable ID, reference URL, capture timestamp, viewport, DPR, browser/OS, locale, timezone, current clock, motion preference, and whether fonts/images have finished loading.
- Exact fixture/theme configuration, source asset URL and content hash, reference screenshot, a short recording for motion, and important computed styles or bounding boxes.
- State entry steps and exit steps, including pointer position, scroll position, keyboard focus, and URL/history behavior.
- Status: `uncaptured`, `captured`, `implemented`, `verified`, or `known-difference`; owner and evidence links. A build or a self-comparison cannot promote a row to `verified`.
- Any permitted difference with a concrete reason. An unknown duration, spring, radius, or breakpoint is recorded as unknown instead of filled with an arbitrary value.

Reference entry points are [the homepage](https://luma.com/), [discovery](https://luma.com/discover), [Tokyo](https://luma.com/tokyo), and the event URLs listed below. The first inspection's temporary evidence lives in `/tmp/luma-reference/`: `home.html`, `discover.html`, `event.html`, `event-data.json`, `browser-details.json`, `hero-layout-notes.md`, and the public JavaScript/CSS files. That directory is temporary; preserve a small durable evidence manifest and permitted screenshots/measurements in `reference/` before relying on it for future releases.

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

Continue the extraction started under `src/ui/`, keeping the working app as the integration example. Extract one verified component at a time. Move to a workspace package after the public interfaces stabilize; a monorepo migration is not required to fix fidelity.

| Layer | Public components/modules | Current extraction source | Required responsibility |
| --- | --- | --- | --- |
| Foundations | `ThemeProvider`, tokens, typography, icons, motion clock | `fonts.css`, `styles.css`, `PageUI.tsx` | Scope styles; resolve event theme; supply asset URLs, locale, and clock |
| Primitives | `Button`, `IconButton`, `Link`, `Badge`, `Avatar`, `AvatarStack`, `Input`, `Select`, `Tabs`, `Divider`, `Skeleton` | `PageUI.tsx`, `pages.css`, `discovery.css` | Visual variants, state styling, keyboard behavior; no fixture imports |
| Surfaces | `Card`, `GlassSurface`, `Dialog`, `Popover`, `Drawer`, `Tooltip`, `Toast` | `Modal` and card styles | Portal/layer order, focus, dismissal, scrolling, animation lifecycle |
| Event summaries | `EventCard`, `CompactEventRow`, `TimelineEventCard`, `EventTimeline` | `Discovery.tsx`, `DiscoverPage.tsx`, `BrowsePage.tsx` | Share data model; preserve each reference presentation rather than forcing one card layout |
| Event presentation | `EventCover`, `EventHeader`, `EventFacts`, `HostList`, `GuestPreview`, `RegistrationPanel`, `EventDescription`, `EventLocation`, `EventActions` | `EventPage.tsx` | Same content in full page and preview; explicit density/layout variants |
| Event navigation | `EventPreviewProvider`, `EventLink`, `EventPreview`, `EventPageLayout` | Event links and the preview implementation | Open/close/expand; preserve origin route, scroll, focus, and native link semantics |
| Event themes | `EventTheme`, `EventBackground`, theme renderer registry | Event background implementation | Typed configuration; tint/fonts/surfaces/cover treatment plus animation |
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

Illustrative interface, to refine after the preview behavior is measured:

```tsx
<UiProvider assets={assets} locale="en-US" now={clock.now}>
  <EventPreviewProvider navigation={navigation}>
    <EventLink event={event} href={`/events/${event.id}`}>
      <EventCard event={event} />
    </EventLink>
  </EventPreviewProvider>
</UiProvider>

<EventTheme config={event.theme}>
  <EventBackground clock={motionClock} seed={42} />
  <EventPageLayout event={event} actions={actions} />
</EventTheme>
```

The example describes the proposed package API. The app already has an `EventPreviewProvider`; its current props are not the proposed adapter-based interface shown here.

## Tokens and theme resolution

Use semantic CSS custom properties under `[data-luma-ui]` plus TypeScript types generated from the same token source. Do not ship the app's universal reset on import. Separate:

1. Foundation values: reference color ramps, spacing, radii, typography metrics, shadows, borders, blur, z-index, and motion curves.
2. Semantic roles: page/surface/raised surface; text/secondary/tertiary; border/hover/focus; primary action/destructive/disabled.
3. Component values: preview width and inset, cover radius, registration panel glass opacity, timeline gap, header height.
4. Theme overrides: font, color mode, tint, background renderer and parameters, cover frame, glass/high-contrast treatment.

Resolution order should preserve reference semantics: defaults → selected theme defaults → event-specific settings → explicit consumer overrides. Record the origin of each measured value. Color mode can be explicit light/dark or reference-derived; it cannot be inferred solely from the cover's average color unless the reference does so.

Initial measured values worth preserving include the homepage's `#151515` base, 960px content width, 80px/500 title at desktop with `.92` line height, and title sizes 70/60/48/40px at the inspected 1000/820/650/450px breakpoints. The reference hero reveal uses a 200ms hover dwell and 500ms transitions; its entrance curve is `cubic-bezier(.55,1.42,.34,1)` and exit curve is `cubic-bezier(.22,1,.36,1)`. These are homepage measurements, not a license to reuse those values for every drawer, modal, or event animation.

The present homepage CSS uses a 600ms reveal with a shared curve; that difference belongs in the ledger. Its CSS poster float is also an approximation of the reference's continuous x/y functions. Record exact motion parameters before extracting those effects as stable library APIs.

## Theme coverage

The captured registry contains 43 theme IDs. Only four IDs occur in the current event fixtures; finding a name in source does not count as rendering it correctly. The initial supported event-theme milestone is those four. A library claiming the full captured Luma theme catalog must close every row below, including parameters within each family.

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

All additional families are inventory items until their rendered behavior is captured. Do not spend time recreating every name by guesswork before verifying the four themes already present on the requested pages.

## State matrix

This is the minimum capture/implementation matrix. “Verify” below denotes required work, not a completed test. Every visual component also needs default, hover, active, focus-visible, and disabled states where meaningful.

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

## Visual and motion verification

Add a local component catalog before publishing. It should show every supported variant and state, include controls for long content and theme settings, and link every reference-backed story to its evidence row. A small route inside this Vite app is sufficient initially; a dedicated documentation tool can follow after the API stabilizes.

For repeatable captures, inject fixture time (`2026-09-18T06:00:00Z` is a useful initial baseline), locale/timezone, a seeded random source, and a manual animation clock. Motion components should support `seek(ms)`, pause/resume, and disposal in the test harness without making production animations global. Wait for `document.fonts.ready`, image decode, and stable layout before capture. Do not hide the actual effect in order to make screenshot tests pass.

Capture the existing reference viewports (1440px desktop, 1028px compact desktop, 768px tablet, 390px mobile), a 320px narrow case, and one pixel on either side of every actual component breakpoint. Record heights as well as widths. Compare in the same browser/OS/DPR first; verify Firefox/WebKit behavior separately rather than accepting cross-engine rasterization noise as a design change.

Use three complementary checks:

1. **Geometry and typography:** exact layout bounds, line breaks, font family/weight, baseline spacing, border/radius, and image crop. Overlays at 50% opacity and difference images make drift visible. A one-pixel position error or an incorrect line break is actionable even if a global image similarity score is high.
2. **Deterministic frames:** compare reference-backed still states and local seeded animation frames at defined times. Proposed initial static tolerance is at most 0.1% differing pixels after an explicit small anti-aliasing threshold; establish it on repeated unchanged captures and inspect every failure. Never mask an entire animation, title, preview, or registration panel.
3. **Motion recordings:** compare trajectories, density, speed, acceleration, fade/trail persistence, palette, interaction response, and transition duration. Unseeded live reference motion may not permit frame-for-frame comparison; use measured parameters and side-by-side recordings, and label that evidence as perceptual motion verification rather than exact pixel equality.

Interaction checks must cover event-card → preview → full page → Back, close by button/backdrop/Escape, scroll/focus restoration, modifier-click navigation, nested overlay dismissal, reduced motion, saved/follow state adapters, filtering and URL restoration. Accessibility checks include tab order, dialog naming, focus confinement, semantics, and text zoom. Performance checks include repeated mount/unmount with no orphaned animation frames/listeners/GPU resources, no drawing while hidden, resize correctness, and a stable frame budget on the agreed device profile.

Store reviewed baselines, overlays/diffs, short motion clips, and a machine-readable coverage report as build artifacts. A reviewer should be able to see exactly which row changed; avoid a single blanket “looks close” approval. Browser checks performed during development remain useful evidence, but no automated reference comparison suite currently exists in this repository.

## Remaining fidelity gaps

These remain open until evidence closes them, even if the app builds:

- Preview and event-theme corrections need reference comparisons across their transitions and mobile variants; the original implementation omitted them.
- Theme-specific font/mode/glass/cover settings are not fully represented by the original `theme`/`tint` fixtures. Four fixture theme IDs do not establish support for the 43-theme catalog.
- Homepage WebGL, emoji styling, poster randomization, continuous float equations, reveal timing, and material/refraction remain approximations or require re-verification.
- Event descriptions are excerpts; maps are illustrative links rather than the reference map; guest faces/lists and host interactions are simplified. Those substitutions change both layout and interactions.
- Registration and subscriptions are explicit local previews. Authentication, ticket/payment states, real RSVP results, and backend error/loading states are not implemented.
- Nine events do not reproduce live counts or inventory. Category descriptions and most city behavior are generic; many destinations have no local events. City grouping currently uses event-specific shortcuts.
- Header/search, compact footer icons, city picker, filters, tabs, and dialogs need state-by-state reference audits. Native HTML controls alone do not establish reference styling or keyboard parity.
- Some routes intentionally navigate to the original site. Calendar/community pages, account screens, creation flows, and native apps are outside the selected page scope; crossing that boundary must be visible in the catalog.
- Asset URLs, root-relative fonts, global CSS, storage coupling, and global clock/router usage prevent a clean package consumer contract today.
- No durable screenshot/motion baseline corpus, full state manifest, component catalog, or package-consumer test exists yet. “No missing details” cannot be verified until these are in place.

## Delivery sequence and release gates

Keep commits atomic, as required by the global `AGENTS.md`. Each commit should have one reviewable purpose and its relevant evidence.

1. **Repair the observed omissions:** distinct backgrounds for the four fixture themes and faithful event preview navigation. Verify each against reference motion and layout. This is the immediate product correction.
2. **Lock reference fixtures:** preserve theme settings, font choices, relevant content and assets; create the manifest, missing-state ledger, and deterministic clock/seed harness. Resolve initial comparison drift before extraction.
3. **Extract foundations and overlays:** scoped tokens, icons, typography, buttons, surfaces, dialog/drawer lifecycle. Keep existing pages rendering through the new primitives and compare after each extraction.
4. **Extract event components:** use the same event content and theme rendering in preview and full-page layouts; move navigation/storage/registration actions to adapters. Add all supported theme and registration stories.
5. **Extract discovery and marketing:** shared cards/timeline/filters and the landing components. Preserve their distinct visual variants. Add responsive and motion evidence for each.
6. **Expand theme coverage deliberately:** capture and implement the additional catalog families. A family remains experimental until its variants, settings, font/cover treatment, and lifecycle pass review.
7. **Package and verify consumption:** produce ESM, TypeScript declarations, explicit CSS exports, and separate optional theme chunks. React/ReactDOM become peer dependencies. Import a built package into a clean consumer, serve under a non-root base path, test SSR import safety, and verify fonts/assets and tree-shaking.

Suggested export boundaries are `@project/luma-ui`, `@project/luma-ui/styles.css`, `@project/luma-ui/themes`, and `@project/luma-ui/landing`; the package name is a placeholder. Keep sample content and reference branding/assets in the demo or a separate asset bundle with a provenance/license manifest. Avoid implicitly bundling the entire poster gallery and every animation when a consumer imports a button.

Mark an initial release as preview/experimental until its declared component/state matrix is verified. A stable release needs zero untriaged discrepancies in its declared scope, a published supported-theme list, complete controlled-state APIs, keyboard/mobile verification, package-consumer checks, and visual/motion baselines. Additional Luma states discovered later become new manifest rows and cannot inherit a verified badge from a similar-looking component.
