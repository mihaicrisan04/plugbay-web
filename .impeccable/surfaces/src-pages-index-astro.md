---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: []
---

# plugbay landing page (direction A, "Sheet 1 of 1")

Mode: persuade. Audience: developers who work across several clients and run AI coding agents. Job: understand plugbay in ten seconds and install it. Action: copy `brew install mihaicrisan04/tap/plugbay`, or open the GitHub repo. Proof: the real `plugbay.toml` files and real terminal output from `src/data/plugbay.ts`. Constraints: no release, version, date or revision anywhere; every label a real plugbay value.

## Direction contract

THESIS: the page is one drawing sheet and the drawing is the argument: a setting in a `plugbay.toml` has a scope, and scope is read as a length. It refuses the dev-tool template of a centred headline over a glowing terminal and a row of feature cards.

OWN-WORLD: one violet ink on white, every line 1px; dark is one light ink on one deep violet ground. Three voices: Big Shoulders light caps state, Commit Mono is literal (code, paths, values, labels), Barlow speaks in sentences. Views are instrument windows with solid title bars and cut corners. Imagery is single-ink stipple of plugbay's own metaphor: a patch bay, plugs, a key ring. One red, used once, for the correction.

STORY: the visitor sees what it is and how to get it (A), recognises the mix-up (B), sees that one small file per tree fixes it (C), checks the real output for two directories (D), learns the three steps (E), installs (F).

FIRST VIEWPORT: statement at display scale top left, subhead and the brew command with copy and a GitHub link under it, the stippled patch bay with a hand at full scale on the right, on faint lines labelled with the real servers (columns) and the two example directories (rows A and B). Nothing else.

SIGNATURE INTERACTION: choose where the agent starts in zone D (`~/work/acme/api` or `~/work/globex/web`). The elevation in C, the terminals in D and the stack in E follow together, from one radio group, CSS first. Motion: at most one explaining motion per zone (B the correction, C the dimensions drawing in merge order, D and E the response to the choice).

FORM: an engineering drawing sheet (frame, zone letters that are anchors, title block with real fields). Position on the list: direction A of four built prototypes (sheet, exploded assembly, CAD model space, engineering pad). No seed: the concept-seed roll was not run. It was skipped on purpose: the owner pinned the visual world ("blueprint grids", then sutera.ch in blueprint mode as the reference) and picked this direction himself from the four prototypes: "i like a the most but there is a bit too much text on the bottom, and also this can be a longer page, we dont have to fill every text and detail on the hero". Build path: code-led; the sutera captures in `docs/research/reference/sutera/` are the critique reference.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- plugbay has no tagged release, so the brew command fails until one ships (owner ships it before the production deploy)
- The logo's near-black wordmark is the one thing off the single ink; an ink variant would have to come from the product repo
