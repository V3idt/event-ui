# Event background implementation evidence

Captured 2026-09-18 from public event pages. `event-theme-fixtures.json` keeps each of the nine events' actual theme metadata, tint and title font. Theme defaults do not override an event's explicit font or a null font.

## Implemented surfaces

- **Warp** (`/z6y1x5zv`): 848 perspective prisms, 80° camera FOV, camera Z 15, particle volume 30 × 30 × 80, 0.01–0.07 widths, 3.7–22.83 lengths, exponential speed pulse, 0.05 alpha, brightness 6, trail power 2, glow 4. The renderer uses an HDR half-float target when supported, 0.001 red/blue offsets, a 16-sample radial spectrum smear at intensity 30, and animated grain at intensity 0.05. A compatible 8-bit target is a reduced-fidelity fallback.
- **Life** (`/l2tdcs1e`): Conway simulation on a wrapping 10px grid, 160ms steps, six-step dying fade, 14 seed patterns, 3% initial random cells, additional patterns every 60 generations. Dot radii: 1.2px idle, 1.8px young, 1.4px mature. Dot opacity: 0.12 / 0.75 / 0.55 in dark appearance. The neutral event tint resolves to a `#222222` page surface.
- **Grain dark** (`/july4-brooklyn`): source flow and simplex/value-noise shader equations, original 128 × 128 noise texture, source OKLCH palette construction, 1° rotation, 1.8 scale, 0.7 softness, speed 2, source foreground/background grain strengths. The two original shader passes are mathematically combined in one local pass; small GPU precision differences are possible. **Grain light** uses the observed source variant but has no event fixture in this capture.
- **Legacy** (six fixtures): static source OKLCH tint surface. The one-to-one page layout uses dark brand stop 70; classic layout uses stop 80. A blurred event cover is not part of these observed legacy surfaces.

All animated surfaces use the observed two-second entry fade. Local additions are reproducible seeds, actual pause/resume, reduced-motion support, offscreen/document-hidden suspension, explicit WebGL resource cleanup, and contained layout for component review. The source uses random particle placement, so comparing two arbitrary frames cannot yield a pixel-identical result.

## Source modules

Downloaded references are in `/tmp/luma-reference` during development:

| Detail | Public source chunk |
| --- | --- |
| Theme registry and font metadata | `2vrnqe5_1qozw.js` |
| Theme wrapper, layering, two-second fade, panel background suppression | `3389bz0hgoh0k.js` |
| Warp settings, geometry and shaders | `3mf9xfwst-d0-.js` |
| Warp chromatic aberration, motion chroma and grain | `3n05tq_m2m2ed.js` |
| Life grid and drawing | `10yvegan6a7aa.js` |
| Grain shaders, palettes and embedded noise image | `2o44basc4z2-u.js` |
| OKLCH tint stops and gamut reduction | `1tcy6tjf5ailb.js` / `279u_a5ade7p8.js` |
| Event title size thresholds | `17msznt-q4e_g.js` |
| Static theme surface rules | `event-3_ia0c45t98-a.css` |

These are reference evidence, not production dependencies. The reusable implementation is local and does not load Luma's JavaScript bundles.

## Remaining scope

This module covers the four distinct themes in the nine event fixtures plus the source Grain light variant. The broader registry also includes Quantum, emoji, confetti, patterns, pool, seasonal effects and games. Those variants are not implemented here. Unsupported theme names report `data-supported="false"`, warn in the console and show their tint surface; they are not silently presented as a completed animation.

Exact layout, liquid-glass event cards, all unobserved themes, font coverage outside the downloaded character sets, arbitrary data and every interactive state require their own reference/verification matrix. Google Sans Flex is included for Latin and Latin Extended; Japanese text uses the same system fallback behavior as the reference face.
