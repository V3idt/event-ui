# Independent consumer

This app installs the **packed tarball**, not the workspace source.

From the repository root:

```sh
npm run example:install
npm run example:dev
```

Open **http://localhost:5174/playground/**.

Try all five backgrounds, pause motion, open the event preview, switch events, and open the side panel. Resize below 450px to see the bottom sheet.

Only synthetic event content and CSS artwork are used. No original app assets or source imports are needed.

`npm run verify:package` goes further: it copies this app to a temporary directory outside the repository, installs the tarball there, checks TypeScript, builds under `/playground/`, and verifies server rendering.
