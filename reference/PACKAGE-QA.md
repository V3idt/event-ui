# Local package alpha checks

Checked September 18, 2026. Package: `@event-ui/react@0.1.0-alpha.0`.

## Automated

- `npm run build`: library and original demo compile.
- `npm test`: 26 tests across 7 files pass.
- `npm run verify:package`: tarball installs outside the repository; strict TypeScript, production build under `/playground/`, public exports, assets, and SSR imports/rendering pass.
- `npm run example:install`: refreshes the packed dependency even when the alpha version stays unchanged.

Tests also cover form-label associations, checkbox/switch keyboard interaction, controlled tabs, dropdown typeahead/selection, native link behavior, unique registration labels, icon-only menus, hydration, StrictMode cleanup, nested scroll locks, focus restoration, custom animation duration, translated labels, copy adapters, event-change scrolling, reduced motion, and unavailable-canvas fallback.

## Chrome browser checks

- The clone and standalone consumer share a neutral component catalog.
- Catalog examples use captured clone artwork, event content, and locally loaded Inter/Geist Mono/Roc Grotesk fonts. These assets remain outside the library package.
- Chrome reports Inter as the actual custom font rendering the catalog heading.
- Warp and both Grain variants initialize WebGL; Life initializes Canvas 2D; Legacy renders without a canvas.
- Pause control stops animation; the OS reduced-motion setting also pauses it.
- Event preview opens; Next changes the event and full-page URL.
- At 390 × 844, the preview becomes a full-width bottom sheet with its top at 32px.
- Escape closes the preview; after the exit transition, focus returns to the trigger and page scroll is restored.
- SidePanel opens with the configured width and package form controls.
- Custom Select opens inside the native panel; Escape closes only its listbox.
- Select commits a new location, and disabled options/menu items are covered by keyboard tests.
- Mobile navigation closes when selecting either the current page or a different page; no horizontal overflow at 390px.
- `/ui` now renders the same catalog as `/playground/`. Discovery and city timelines use the package EventCard; clone icons use the package Icon.
- No console errors or warnings were observed in these checks.

## Still open

- Full keyboard, accessibility, Firefox, and WebKit coverage.
- Automated screenshot and motion comparisons against Luma.
- Grain Light reference capture and the remaining theme catalog.
- Source and asset provenance review before public redistribution.

These checks establish local package usability. They do not establish a perfect copy of every Luma state.
