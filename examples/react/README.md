# Component catalog and independent consumer

**One catalog, two entry points:**

- `http://localhost:5174/playground/` tests the installed tarball.
- `http://localhost:5173/ui` uses the same catalog with the workspace package.

From the repository root:

```sh
npm run example:install
npm run example:dev
```

Open **[localhost:5174/playground/](http://localhost:5174/playground/)**.

Try:

- Buttons, cards, badges, avatars, fields, checkboxes, switches, and tabs.
- Selects and action menus, including keyboard navigation.
- Timeline and compact event cards → preview → full event page.
- Registration cards and the local registration form.
- All five backgrounds, tint settings, pause, and side panels.

The side panel becomes a bottom sheet at 450px and below. Each component page includes a usage example.

**Appearance comes from the clone.** The catalog loads its Inter, Roc Grotesk, and Geist Mono fonts, four event covers, available host avatars, and wordmark from `src/assets`.

Those files are demo assets. They are excluded from `@event-ui/react`; consumers supply their own fonts, artwork, data, and actions. Review [provenance](../../packages/react/PROVENANCE.md) before sharing them publicly.

The footer photo follows `@abelasfaw0` through [Unavatar](https://unavatar.io). Its free endpoint currently caches photos for 28 days. Keep the visible provider credit while using the free service; image failures show initials.

`Catalog.tsx` imports package components. It does not import the clone's app components or fixture modules. The root `/ui` route imports this catalog; its Vite and TypeScript settings resolve one workspace package and React instance.

`npm run verify:package` copies this app to a temporary directory outside the repository, installs the tarball, checks TypeScript, builds under `/playground/`, and verifies server rendering. This checks portability; full visual parity with Luma remains unfinished.
