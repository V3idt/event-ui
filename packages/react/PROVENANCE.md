# Source and release status

**Local alpha only.** The package is `private: true` and `UNLICENSED` while provenance is reviewed. Packaging source code does not grant redistribution rights.

| Material | Origin | Before public release |
| --- | --- | --- |
| Panel and preview implementation | Written in this project from observed interactions | Review implementation and choose a license |
| Background renderers and color equations | Written or adapted from inspected Luma behavior and public client code | Audit source-derived portions; obtain permission or replace where needed |
| Grain noise texture | Copied from the reference assets used by the demo | Verify license or replace with an independently generated texture |
| Event artwork, fonts, branding, fixtures | Reference demo only | Excluded from this package; review separately before sharing the full repository |

Reference: [Luma](https://luma.com/), inspected September 18, 2026. Detailed observations remain in the repository's `src/ui/backgrounds/REFERENCE.md` and `reference/QA.md`.

## Release checklist

- Resolve each source-derived file and asset above.
- Choose the public package/repository name and license.
- Review the full Git history before making the current repository public; old commits contain demo assets.
- Publish a clean source repository or keep unresolved demo material private.
- Remove `private` and set the approved license only when ready to release.

No affiliation with Luma is implied.
