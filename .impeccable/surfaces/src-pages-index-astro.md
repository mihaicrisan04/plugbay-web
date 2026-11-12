---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: []
---

# plugbay landing page (direction A, "Sheet 1 of 1", distilled)

Mode: persuade. Audience: developers who work across several clients and run AI coding agents. Job: understand plugbay in ten seconds and install it. Action: copy `brew install mihaicrisan04/tap/plugbay`, or open the GitHub repo. Proof: the real `plugbay.toml` files and commands from `src/data/plugbay.ts`. Constraints: no release, version, date or revision anywhere; every label a real plugbay value.

## Direction contract

THESIS: the page is one drawing sheet and the drawing is the argument: a setting in a `plugbay.toml` has a scope, and scope is read as a length. It refuses the dev-tool template of a centred headline over a glowing terminal and a row of feature cards.

OWN-WORLD: one violet ink on white, every line 1px; dark is one light ink on one deep violet ground. Three voices: Big Shoulders light caps state, Commit Mono is literal (code, paths, values, labels), Barlow speaks in sentences. Views are instrument windows with solid title bars and cut corners. Imagery is single-ink stipple of plugbay's own metaphor: a patch bay and a hand with a plug. One red, used once, for the correction. Swiss discipline: flush left, few sizes, each thing said once.

STORY: the visitor sees what it is and how to get it (A), recognises the mix-up (B), sees that one small file per tree fixes it and tries both directories on the elevation (C), reads the three steps and installs (D). Four zones, each a title, at most one line, and its drawing or list.

FIRST VIEWPORT: statement at display scale top left, the one-line what (`plugbay.toml` in mono) and the brew command with copy and a GitHub link under it, the stippled patch bay with a hand at full scale on the right, with no grid lines: the real servers named over their columns of sockets, the two example directories lettered A and B on their rows and keyed to their paths. Nothing else.

SIGNATURE INTERACTION: choose where the agent starts (`~/work/acme/api` or `~/work/globex/web`) on the tab that stands on the elevation in zone C. The elevation follows, from one radio group, CSS first. Motion: one explaining motion per zone (B the correction drawing in, C the dimensions drawing in merge order, then the response to the choice).

FORM: an engineering drawing sheet (frame, zone letters that are anchors, title block with real fields). Position on the list: direction A of four built prototypes (sheet, exploded assembly, CAD model space, engineering pad). No seed: the concept-seed roll was not run. It was skipped on purpose: the owner pinned the visual world ("blueprint grids", then sutera.ch in blueprint mode as the reference) and picked this direction himself from the four prototypes: "i like a the most but there is a bit too much text on the bottom, and also this can be a longer page, we dont have to fill every text and detail on the hero". After the first build he asked for less text and Swiss minimalism, and picked "S1 Distilled sheet" from three passes (`docs/research/swiss-pass-brief.md`; Paper artboard `12I-0`). Build path: code-led; the sutera captures in `docs/research/reference/sutera/` are the critique reference.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- plugbay has no tagged release, so the brew command fails until one ships (owner ships it before the production deploy)
- The logo's near-black wordmark is the one thing off the single ink; an ink variant would have to come from the product repo
