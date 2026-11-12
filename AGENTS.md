# plugbay-web

Landing page for [plugbay](https://github.com/mihaicrisan04/plugbay), "mise for MCP servers". Deploys to `plugbay.mihaicrisan.com`.

Status: live at `https://plugbay.mihaicrisan.com` (Vercel project `plugbay-web`). Mihai picked direction A, "Sheet", out of four prototypes, then "S1 Distilled sheet" out of three Swiss-minimal passes on it: the same drawing sheet with far less text, zones A to D (hero, problem, one file per tree, install). The full page is built at `/`; the brief and copy deck for the pass are in `docs/research/swiss-pass-brief.md`. `DESIGN.md` records its system and `.impeccable/surfaces/src-pages-index-astro.md` its direction contract. plugbay has no tagged release yet, so the brew command on the page does not work until one ships.

## Goal

One page that makes an agency or multi-client developer understand plugbay in ten seconds and install it.

- **Pain:** agents get every MCP server you ever configured, logged in to whichever account you used last (client A's Sentry inside client B's repo)
- **Fix:** small committable `plugbay.toml` files say which servers, and which account of each, a directory tree needs. One global MCP entry per agent, tokens in the keychain
- **Primary action:** `brew install mihaicrisan04/tap/plugbay`, then the GitHub repo. `cargo install --locked --git https://github.com/mihaicrisan04/plugbay` is the secondary install
- The page may say: open source, Apache-2.0; no telemetry; macOS and Linux (confirmed by Mihai). No version numbers, release claims or "used daily" line
- Works with Claude Code and Codex, and T3 Code through them. macOS and Linux

## Source of truth

Read from the product repo, never restate from memory or invent features:

- `../plugbay/README.md`: positioning, before/after, how it works, install
- `../plugbay/docs/plan.md`: vision and settled decisions
- `../plugbay/docs/assets/`: logos (`logo-light.svg`, `logo-dark.svg`), `demo.gif`, `demo.tape`
- `../plugbay-launch/drafts.md`: launch copy and angles

Already extracted, with sources (`docs/research/` is gitignored, so these exist only on Mihai's machine): `docs/research/content-inventory.md` (claims, commands, a DO NOT CLAIM list) and `docs/research/canonical-world.md` (real output of the one example world: `~/work`, clients `acme` and `globex`). `src/data/plugbay.ts` holds the page's copy and terminal output; nothing goes on the page that those files cannot back. `PRODUCT.md` is the impeccable product record.

## Stack

- Astro 7 (static output), Tailwind v4. No client framework: the page is CSS and small inline scripts, so React and `motion` were removed. Add them back only if a real island is needed. Same tooling shape as `../alesiabaicu.com`
- Bun, mise for versions, Ultracite/Biome, Playwright

## Commands

- `bun run dev` (agents: `astro dev --background`, then `astro dev stop`)
- `bun run verify`: lint, types, build, then Playwright against the production build on port 4322 (smoke, directory switch on the elevation, copy buttons, JS off). Run it before calling anything done
- `bun scripts/shot.ts <route> [--out dir] [--full] [--motion]`: desktop and mobile, light and dark screenshots of a route against the running server, with console errors and overflow reported
- `bun run fix`: auto-fix lint and format
- `sh scripts/dark-masks/build.sh` (needs `uv`): rebuilds the patch bay's dark-theme stipple mask (`patch-bay-dark.png`) from its light mask. Rerun after resizing or replacing the light mask; `patch-bay.json` holds cable traces in the patch bay's pixel coordinates, so scale it if that image changes size

## Deploy

- Vercel CLI (`vercel`, logged in as `mihaicrisan`, team `mihai-crisans-projects`). `mihaicrisan.com` is registered and served by Vercel, so `plugbay.mihaicrisan.com` is a `vercel domains add` on this project, no external DNS
- Live since 2026-11-11 at `https://plugbay.mihaicrisan.com` (production, `vercel deploy --prod`). The domain is attached to the project; DNS is the zone's Vercel wildcard ALIAS, so there is no record to maintain
- GitHub repo `mihaicrisan04/plugbay-web` (public) is connected to the Vercel project: a push to `main` deploys to production, a push to any other branch makes a preview. Pushes wait for Mihai's go-ahead
- `vercel deploy` from the CLI still makes a preview and is fine any time
- `.vercelignore` keeps `archive/` off the deployed site
- Trap, for new projects: Vercel assigns a project's first deployment to production even with `--target=preview`

## Design direction: blueprint grids

Minimal and clean, drawn like a technical drawing. Decided by Mihai; variants explore inside it, not around it.

- Reference, named by Mihai: [sutera.ch](https://www.sutera.ch/) in its blueprint mode (the "change reality" button). Captures, extracted values and guidelines are in `docs/research/reference/sutera/`. Match its richness and discipline (one ink on white, 1px lines, large light display type against small mono caps, instrument-window panels, stippled illustrations in the same ink); do not copy its brand, layout or fake readouts
- Chosen build: direction A, "Sheet", distilled (S1). One violet ink on white (dark: one light ink on a deep ground), every line 1px, Big Shoulders light caps against Commit Mono, views as instrument windows, stippled illustrations generated in Paper and masked to the ink. One red, used only for the correction in the problem zone. Swiss discipline on top: flush left, say it once, a title replaces the paragraph under it. The four prototypes are archived in `archive/directions/` (not built, linted or deployed; its README says how to restore them)
- Workflow finding: code-first with Paper generating the illustrations beat comp-first (fewer generations, no invented wiring to correct). Use comps only when a composition is stuck
- The grid is structure, not wallpaper: content sits on it, and its lines, ticks, registration marks, dimension lines and callouts carry meaning
- The terminal and the `plugbay.toml` file are the product. Show them for real, annotated like a drawing, not as decoration
- Few colours, thin lines, generous space. No gradients-and-glow dev-tool template
- One drawing moves: the elevation draws in and answers the directory chosen on its tab. Anything else must explain something or be cut. Respect `prefers-reduced-motion`
- Light and dark, both designed. Static HTML, no layout shift
- Logos live in `../plugbay/docs/assets/` and are being reworked there (uncommitted edits); read the current files, don't redraw the mark

## Paper

Paper file `plugbay-web`: https://app.paper.design/file/01M73K4HZSZX13DKRHA2EWA506 (id `01M73K4HZSZX13DKRHA2EWA506`), through the `paper__*` MCP tools.

- Paper is the asset pipeline, not just a mirror: it generates images (`paper-gen://` URLs, see `get_guide` topic `image-generation`) and SVGs. Use it for illustrations, diagrams, grid and annotation pieces, textures and the OG image before hand-drawing anything. Export into `src/assets/`
- Read `get_guide` topic `paper-mcp-instructions` before the first Paper call
- The shipped page is artboard "S1 Distilled sheet" (page `p-7-0`, id `12I-0`); the pre-distilled page is on "Landing page". If Mihai edits the S1 artboard, the Paper file wins over the code for that element
- Mihai is on Paper Pro, so there is no weekly tool-call cap to budget for (the 100-call note in `../alesiabaicu.com/AGENTS.md` is outdated)

## Agents

- Design work (directions, prototypes, UI code, assets, motion): Claude Fable 5.2
- Research and context gathering: Claude Opus 5.5
- Use impeccable and the `prototype` skill to build several versions of the same thing and compare them before committing to one
- No commits, pushes or PRs without Mihai's go-ahead. Variants live side by side in this checkout (routes or folders), not in worktrees

## Skills

In `.agents/skills/` (Claude sees them through `.claude/skills/`). Load before UI work:

- `impeccable`: design direction, critique, audit, polish. Its hook checks every UI edit
- `emil-design-eng`: Emil Kowalski's design engineering rules, the default for any UI code
- Motion: `animate`, `choreograph`, `review-animations`, `improve-animations`, `find-animation-opportunities`, `remove-animations`, `animation-performance`, `animation-vocabulary`, `gestures`
- `apple-design`, `mobile-native`, `break-ui`, `prototype`, `pick-ui-library`

Update with `npx skills@latest update -p` and `npx impeccable update`.

## Working rules

- Readable first, then fast. Reuse a library before writing an abstraction
- Copy is short and plain, no em dashes, no invented claims or numbers
- Done means verified in a browser at mobile and desktop widths, in light and dark
