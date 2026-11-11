# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro 7 (static output), Tailwind v4, no client framework (the page is CSS plus small inline scripts). Bun, mise, Ultracite/Biome, Playwright. Deployed with the Vercel CLI to `plugbay.mihaicrisan.com`. Chosen by Mihai in `AGENTS.md`, mirroring `../alesiabaicu.com`.

## Users

Developers who work across several clients or accounts: agency engineers and freelancers who touch multiple client repos in a day, each client with its own Sentry, PostHog, Linear and so on. They run AI coding agents (Claude Code, Codex, T3 Code) in a terminal and already know tools like mise. They land here from a launch post or the GitHub repo and decide in seconds whether to install.

## Product Purpose

plugbay is a CLI, "mise for MCP servers". Small committable `plugbay.toml` files say which MCP servers a directory tree needs, and which account of each. Every agent gets exactly those. This site is one page that makes that reader understand plugbay in ten seconds and install it.

Success: the reader copies `brew install mihaicrisan04/tap/plugbay`, or opens the GitHub repo.

## Positioning

- Hierarchical, committable config: files merge from `/` down to where the agent started, deeper wins field by field
- Accounts are first-class: `sentry = "acme"` in one tree, `sentry = "globex"` in another
- One router shared by every agent: `plugbay setup` registers a single MCP entry in Claude Code and Codex, and you never edit their MCP config again
- Tokens stay in the OS keychain, bound to the server's URL and the account. Config files never hold secrets

## Operating Context

- The terminal and the `plugbay.toml` file are the whole product surface. There is no GUI
- Commands the reader will run first: `brew install mihaicrisan04/tap/plugbay`, `plugbay setup`, `plugbay use sentry:acme posthog:acme`, `plugbay login`, then `plugbay ls`, `plugbay why <server>`, `plugbay doctor`
- Existing setups move over with `plugbay migrate` (`--undo` rolls back)
- Tools reach the agent as `server__tool`; the agent is told which account it is talking to

## Capabilities and Constraints

- Source of truth is the product repo (`../plugbay/README.md`, `docs/plan.md`, `docs/config-schema.md`). `docs/research/content-inventory.md` holds the sourced inventory with verbatim commands, configs and terminal output, plus a DO NOT CLAIM list. Every claim, command and output on the page must trace to it
- Works with Claude Code and Codex, and T3 Code through them. macOS and Linux (stated plainly, confirmed by Mihai)
- Open source, Apache-2.0. No telemetry (confirmed by Mihai)
- Example world for the whole page: an agency under `~/work` with clients `acme` and `globex`, as in the README and demo
- Not to be claimed: tools on demand or token savings, signed binaries, Windows, Figma, live updates in Codex, hosted or team features, a GUI, a stable config format, release numbers or badges, the "used daily" status line, any invented anecdote or number
- Config resolution is a merge of every file on the path, not "nearest file wins"
- Open: plugbay has no tagged release yet, so the brew command does not work today. Mihai ships a release and the tap formula before the production deploy. `cargo install --locked --git https://github.com/mihaicrisan04/plugbay` is the secondary install and works now

## Brand Commitments

- Name: plugbay, lowercase. Category line: "mise for MCP servers."
- Logo: `../plugbay/docs/assets/logo-light.svg` and `logo-dark.svg` (a rounded rectangle patch bay with a 3x2 grid of sockets, two filled in violet, plus an outlined wordmark). Being reworked in that repo; read the current files, never redraw the mark
- Visual direction, binding, set by Mihai: blueprint grids. Minimal and clean, drawn like a technical drawing. Details in `AGENTS.md`
- Voice: short and plain, lead with the point, no hype, no em dashes

## Evidence on Hand

- Real commands, configs and terminal output: `docs/research/content-inventory.md` section 4
- `../plugbay/docs/assets/demo.tape` and `demo.gif` (960x640, dark Catppuccin). The page rebuilds the session in HTML rather than embedding the GIF
- No testimonials, user counts, stars, benchmarks or customer logos exist. Do not fabricate any

## Product Principles

- Show the real thing: the file and the terminal, verbatim, are the argument
- One idea per view: the right servers and the right account, per directory
- Say less. A reader who knows mise should get it from the hero alone
- Nothing on the page that the product repo cannot back
- Every decoration has to explain something or go

## Accessibility & Inclusion

- WCAG AA contrast for text in both themes, including small annotation text
- `prefers-reduced-motion` respected: every animation has a static final state
- Code and terminal content is real, selectable text, not images
- Works from 390px to wide desktop with no horizontal scroll and no layout shift
