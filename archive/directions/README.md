# Archived direction prototypes

Four prototypes of the landing page, built side by side before one was chosen. Each is a hero plus one section.

- `sheet`: direction A, picked by Mihai. The live page at `/` grew out of it and lives in `src/components/`
- `assembly`, `model-space`, `pad`: not picked

They are kept for reference and are not built, linted, type-checked or deployed.

## Running one again

The folders here mirror the repo root, so moving them back restores the routes at `/directions/<slug>`:

```sh
mv archive/directions/src/directions src/directions
mv archive/directions/src/pages/directions src/pages/directions
mv archive/directions/src/assets/directions src/assets/directions
mv archive/directions/public/fonts/pad public/fonts/pad
```

They import copy from `src/data/plugbay.ts` and use these font packages, which are still in `package.json`: `@fontsource/ibm-plex-sans`, `@fontsource/ibm-plex-sans-condensed`, `@fontsource/ibm-plex-mono`, `@fontsource/barlow-condensed`, `@fontsource-variable/azeret-mono`, `@fontsource-variable/atkinson-hyperlegible-next`.

The brief they were built from is `docs/research/directions-brief.md`.
