# Luma UI recreation

A React + TypeScript recreation of the public [Luma](https://luma.com/) homepage, discovery experience, and event detail pages, inspected on September 18, 2026. Built with Vite.

## Run locally

```sh
npm install
npm run dev
```

Open the localhost URL printed by Vite (normally `http://localhost:5173`).

```sh
npm run build    # TypeScript checks and production bundle
npm run preview  # Serve the production build
```

## What is included

- Reference typography with locally hosted Inter and Roc Grotesk fonts.
- Original poster artwork, responsive poster positioning, glass frames, entrance animations, and floating motion.
- Circular hover reveals on “Create Your First Event,” cycling through Stellar, Lovely, and Vivid themes.
- Mobile poster collage, responsive event and community grids, category cards, and a searchable city picker.
- Animated Game of Life footer with the reference's colors, dot spacing, and layout.
- Keyboard focus styles, reduced-motion handling, and offscreen canvas pausing.
- Discovery directory with event rows, 12 category pages, 85 city destinations, and calendar follow state.
- City timelines and event search, with date, city, free-entry, and saved-event filters persisted in the URL.
- Nine event detail pages with captured cover images, host information, dates, registration status, descriptions, and location links.
- Local saved events, share links, downloadable calendar files, cover previews, and registration/waitlist preview dialogs.

The visual effects use lightweight canvas/CSS recreations of the original WebGL effects. Poster ordering is fixed to the captured reference, while Luma randomizes it. The city picker is simplified, event descriptions are excerpts, and location cards link to Google Maps rather than embedding it. The result is a close visual recreation, not a pixel-identical implementation of every interaction.

## Scope and data

This is a frontend implementation with a static nine-event dataset (six featured Tokyo events and three events linked from the homepage). City and category pages filter that dataset; destinations without matching fixtures show an empty state. Counts reflect the captured local dataset, not Luma's live global inventory. Dates and upcoming/past status use the browser's current clock.

Registration and subscription forms are explicitly labeled previews. They validate locally and never submit data, send emails, take payments, or create a real RSVP. Saved events and followed calendars persist on the current device using localStorage. No name or email is persisted.

Homepage event links, discovery, categories, and cities stay in the local app. Authentication, event creation, community calendars, and original-event links still open Luma. A backend is needed for live event inventory, authentication, purchases, and real registrations.

## Routes

- `/`: homepage.
- `/discover`: discovery directory.
- `/discover/search`: event search and filters; accepts `q`, `city`, `date`, `free`, and `saved` query parameters.
- `/tokyo`, `/nyc`, and other captured city slugs: city browsing.
- `/tech`, `/running`, `/ai`, and other category slugs: category browsing.
- `/z6y1x5zv` and the other captured event slugs: event details.
- Unknown routes: a local not-found page.

Vite serves these routes during development. A static production host must fall back to `index.html` for app routes.

## Source organization

- `src/Hero.tsx`, `src/hero.css`, `src/hero-layout.ts`: hero, artwork layout, and hover effects.
- `src/Discovery.tsx`, `src/discovery-data.ts`, `src/discovery.css`: event discovery and city picker.
- `src/Footer.tsx`, `src/footer.css`: footer and dot animation.
- `src/fonts.css`, `src/styles.css`: typography and shared styles.
- `src/DiscoverPage.tsx`, `src/BrowsePage.tsx`: discovery, categories, cities, and filtering.
- `src/EventPage.tsx`: event details, saved events, calendar download, and registration previews.
- `src/PageUI.tsx`, `src/pages.css`: shared navigation, dialogs, controls, and page styling.
- `src/event-fixtures.json`, `src/directory-fixtures.json`: captured public fixture data.
- `scripts/capture-events.py`: optional refresh script for public event metadata and artwork; requires Python 3 and curl.

Reference assets are stored under `public/assets`. Poster/photo originals came from `https://images.lumacdn.com/landing/{c,e}01.webp` through `{c,e}21.webp`; discovery, category, and event artwork came from the public image URLs rendered by Luma. Tokyo's backdrop is local; other city backdrops load from the captured Luma image URLs. The wordmark is the reference SVG. Fonts were sourced from the stylesheets served by the reference.
