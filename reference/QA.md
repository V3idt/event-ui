# Event UI verification — September 18, 2026

This records functional and visual checks of the current implementation. It does **not** certify pixel identity across Luma's full interface. The theme inventory and remaining extraction work are in [the library plan](../docs/UI-LIBRARY.md).

## Captured evidence

| State | Reference | Local evidence | Result |
| --- | --- | --- | --- |
| Desktop event preview | [Tokyo / XR event](https://luma.com/tokyo?e=evt-5vRHmhyOVABL90x), [crop](qa/preview-reference-desktop.jpg) | [crop](qa/preview-local-desktop.jpg) | Both panels measured 550 × 710.4 CSS px in a 1028 × 726 viewport, top inset 8px. Cover is 280px. Right gutter differs because the source reserves additional scrollbar space. |
| Mobile event preview | Live Tokyo preview inspected at 390px | [screenshot](qa/preview-local-mobile.jpg) | Bottom sheet starts at 32px, height 812px at 390 × 844. Previous/next move left; close moves right. No horizontal page overflow. |
| Component gallery | Local inspection surface | [desktop](qa/gallery-desktop.jpg) | Uses the production components, not separate visual mockups. Desktop 1440 × 960 and mobile 390 × 844 checked. |
| Explicit pause | Warp in the gallery | [frame A](qa/warp-paused-a.jpg), [frame B](qa/warp-paused-b.jpg) | Pixel-identical screenshots taken in separate calls after settling; HDR half-float renderer active. |
| System reduced motion | Warp with `prefers-reduced-motion: reduce` | [frame A](qa/warp-reduced-a.jpg), [frame B](qa/warp-reduced-b.jpg) | Pixel-identical screenshots; renderer reports paused and gallery pause control is disabled. Preference reset after testing. |

Warp, Life, and Grain were also viewed beside their live event references: [Warp](https://luma.com/z6y1x5zv), [Life](https://luma.com/l2tdcs1e), and [Grain](https://luma.com/july4-brooklyn). Warp and Grain use working WebGL renderers; Life uses Canvas 2D. None fell back to a static error surface. Live and local frames have independent random seeds and clocks, so those comparisons are qualitative, not pixel-diff approvals. Captured source parameters and rendering differences are documented in [background evidence](../src/ui/backgrounds/REFERENCE.md).

## Functional checks

- Clicking discovery and timeline cards opens the preview and retains the browsing route. Event links keep real detail-page URLs.
- Previous/next replace the selected event and reset the actual scroll container to the top.
- A one-result `SHONAN` search still has previous/next disabled after browser Back and Forward; it does not navigate into unrelated fixtures.
- Closing restores page scroll, releases the body lock, and returns focus to the event link.
- Native Escape closes a nested registration dialog while retaining the preview.
- Browser Back with registration open closes both dialogs, clears the preview query, restores the trigger, and leaves no body scroll lock.
- The Copy Link button confirms `Copied!`; Event Page retains `target="_blank"`, matching the reference.
- The preview remains neutral; full-page animated themes are not mounted inside it.
- Switching the gallery from Warp to Life leaves one canvas. Pause/resume and theme tint changes use the shared renderer.
- Local browser console had no application warnings or errors in the final reviewed gallery state.
- `npm run build` and `git diff --check` passed.

## Remaining differences

The source's exact panel spring has not been captured; the local transition uses the measured shared 300ms easing. The default body/scrollbar geometry differs slightly. Map cards, guest avatars, calendar presentation, registration variants, and descriptions remain simplified. Some homepage motion is still approximated. Only four theme families have live event fixtures; Grain Light is implemented from source but lacks a captured event, and the remaining catalog is unimplemented. The library is internal source exports, not a published package.
