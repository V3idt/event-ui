# Source and release status

**Unreleased alpha.** The package is `private: true` and `UNLICENSED` while provenance is reviewed. Hosting a demo or packaging source code does not grant redistribution rights.

| Material | Origin | Before public release |
| --- | --- | --- |
| Foundations, dropdowns, icons, event cards, event details, registration card | Extracted or implemented in this project using the clone's styles and observed UI; interaction behavior written for the package | Review implementation, reference measurements, and source provenance; choose a license |
| Panel and preview implementation | Written in this project from observed interactions | Review implementation and choose a license |
| Background renderers and color equations | Written or adapted from inspected Luma behavior and public client code | Audit source-derived portions; obtain permission or replace where needed |
| Grain noise texture | Copied from the reference assets used by the demo | Verify license or replace with an independently generated texture |
| Event artwork, fonts, branding, fixtures | Reference assets in `public/assets` and the catalog's `examples/react/src/assets` | Excluded from this package; review separately before sharing either demo or the full repository |

Reference: [Luma](https://luma.com/), inspected September 18, 2026. Detailed observations remain in the repository's `src/ui/backgrounds/REFERENCE.md` and `reference/QA.md`.

The catalog includes the clone's **Inter, Geist Mono, and Roc Grotesk font files**, four event covers, available host avatars, and wordmark. Copying them into the independent consumer does not make them package assets or change their release status. Asset permissions and required license notices still need review.

The installable tarball contains component code, scoped CSS, declarations, documentation, and the documented grain texture. It does not contain those demo fonts, event images, logos, or fixtures.

## Release checklist

- Resolve each source-derived file and asset above.
- Choose the public package/repository name and license.
- Review the full Git history before making the current repository public; old commits contain demo assets.
- Publish a clean source repository or keep unresolved demo material private.
- Remove `private` and set the approved license only when ready to release.

No affiliation with Luma is implied.
