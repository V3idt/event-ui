# Event backgrounds

**Private alpha. Redistribution review is still pending.**

- Themes: `legacy`, `warp`, `life`, `grain-dark`, `grain-light`.
- Configure `tint`, `appearance`, `mode`, `seed`, `paused`, `reducedMotion`, `className`, and `style`.
- `noiseTextureUrl` replaces Grain's bundled texture. Remote URLs need CORS permission.
- Unknown theme names warn and show a static tint.
- The surface is decorative and hidden from assistive technology.
- Contained backgrounds need a parent with `position: relative`, `isolation: isolate`, and a defined height.
- Animations pause offscreen and in hidden tabs. Reduced motion shows a still frame.

**Provenance:** extracted from the local clone's background implementation. Warp/Grain shader equations and palette behavior derive from public Luma reference bundles. `assets/grain-noise.png` is the original captured 128 × 128 texture. Life's configuration was measured from the reference. These files make no new licensing claim. Review permissions or replace affected parts before public distribution.

The original reference evidence remains in the demo app's `src/ui/backgrounds/REFERENCE.md`. Fonts and event fixtures are deliberately outside this package.
