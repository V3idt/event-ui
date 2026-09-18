# Component catalog and independent consumer

The catalog shows general React components with working previews and code examples.

- `http://localhost:5174/playground/` tests the installed tarball.
- `http://localhost:5173/ui` uses the same catalog with the workspace package.

From the repository root:

```sh
npm run example:install
npm run example:dev
```

Open [localhost:5174/playground/](http://localhost:5174/playground/).

Try cards, buttons, forms, menus, tabs, profile images, and status badges. Explore all five backgrounds, tint settings, pause, and side panels. Panels become bottom sheets at 450px and below. Event layouts remain optional reference recipes.

`Catalog.tsx` imports the package components. The root `/ui` route uses the same file. Vite and TypeScript resolve one package and React instance.

## Assets and verification

Demo fonts, photos, and reference artwork live in `src/assets`. They stay outside `@event-ui/react`; consumers supply their own content and fonts. Review [provenance](../../packages/react/PROVENANCE.md) before redistributing demo assets.

The footer photo uses [Unavatar](https://unavatar.io). The free endpoint caches photos and requires visible provider credit. Image failures show initials.

`npm run verify:package` installs a fresh tarball outside the repository, checks TypeScript, builds under `/playground/`, and verifies server rendering. Visual comparisons for the original Luma demo remain separate, unfinished work.
