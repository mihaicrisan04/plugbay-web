---
name: plugbay-web
description: One drawing sheet for plugbay, mise for MCP servers. One violet ink on white, every line 1px.
colors:
  paper: "#fff"
  ink: "oklch(42% 0.24 284)"
  ink-muted: "color-mix(in srgb, oklch(42% 0.24 284) 72%, #fff)"
  ink-soft: "color-mix(in srgb, oklch(42% 0.24 284) 54%, #fff)"
  ink-grid: "color-mix(in srgb, oklch(42% 0.24 284) 12%, #fff)"
  red: "oklch(55% 0.2 27)"
  paper-dark: "oklch(15% 0.045 283)"
  ink-dark: "oklch(82% 0.115 290)"
  ink-muted-dark: "color-mix(in srgb, oklch(82% 0.115 290) 70%, oklch(15% 0.045 283))"
  ink-soft-dark: "color-mix(in srgb, oklch(82% 0.115 290) 54%, oklch(15% 0.045 283))"
  ink-grid-dark: "color-mix(in srgb, oklch(82% 0.115 290) 15%, oklch(15% 0.045 283))"
  red-dark: "oklch(72% 0.17 30)"
typography:
  display:
    fontFamily: "Big Shoulders, Big Shoulders Fallback Narrow, Big Shoulders Fallback, sans-serif"
    fontSize: "clamp(68px, 9.4vw, 136px)"
    fontWeight: 300
    lineHeight: 0.88
  headline:
    fontFamily: "Big Shoulders, Big Shoulders Fallback Narrow, Big Shoulders Fallback, sans-serif"
    fontSize: "clamp(44px, 6vw, 88px)"
    fontWeight: 300
    lineHeight: 0.9
  title:
    fontFamily: "Big Shoulders, Big Shoulders Fallback Narrow, Big Shoulders Fallback, sans-serif"
    fontSize: "clamp(32px, 3.2vw, 44px)"
    fontWeight: 300
    lineHeight: 0.95
  body:
    fontFamily: "Barlow, Barlow Fallback, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.5
  code:
    fontFamily: "Commit Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Commit Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.04em"
  label-title-block:
    fontFamily: "Commit Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.06em"
rounded:
  none: "0"
  full: "50%"
spacing:
  strip: "20px"
  strip-wide: "28px"
  pad: "14px"
  pad-wide: "32px"
  bar: "28px"
  balloon: "20px"
components:
  window-bar:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    height: "{spacing.bar}"
    padding: "0 10px"
  button-copy:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    height: "44px"
    width: "84px"
  box-link:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    height: "44px"
    padding: "0 18px"
  box-link-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  command:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.code}"
    rounded: "{rounded.none}"
    padding: "10px 12px"
  choice:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.code}"
    rounded: "{rounded.none}"
    height: "48px"
    padding: "0 18px"
  choice-hover:
    backgroundColor: "{colors.ink-grid}"
  choice-checked:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  balloon:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    size: "{spacing.balloon}"
---

# Design System: plugbay-web

## Overview

**Creative North Star: "The Drawing Sheet"**

The page is one engineering drawing sheet, and the drawing is the argument. It has a frame, zone letters on the border, instrument windows, dimension lines, leaders and a title block. One violet ink prints everything on white paper. Dark mode is the night print: one light ink on one deep violet ground.

Hierarchy comes from size, solid fills and three tints of the same ink. It never comes from a second colour, a shadow or a heavier line. The product is a terminal and a `plugbay.toml` file, so the files and the commands are shown as real, selectable text at 1:1. Imagery is single-ink stipple of plugbay's own metaphor: a patch bay and a hand with a plug.

The sheet says each thing once. A heading that states the point replaces the paragraph under it, and a drawing carries no caption it does not need.

The system refuses the dev-tool template: a centred headline over a glowing terminal and a row of feature cards.

**Key Characteristics:**
- One ink, one paper, three tints of the ink, one red with one job
- Every line 1px, square corners, no shadows
- Three type voices with fixed jobs: display states, mono is literal, sans speaks
- Drawings are computed from the page data and fail the build if they disagree with it
- Stipple art ships as masks and prints in the theme's ink
- Two drawings move once, the correction and the elevation; without script or with reduced motion the sheet is simply drawn

**The Truth Rule.** Every product value on the sheet (server, account, path, setting, command) comes from `src/data/plugbay.ts`, through `src/lib/model.ts` and `src/lib/content.ts`. Nothing is typed by hand into a drawing. The build throws when a drawing and the data disagree: the elevation against the resolved result, the hero's socket marks against the counts of servers and directories, the correction against the resolved accounts, the merge and the `plugbay ls` capture, the one-line what against the file name it sets in mono. Drawing labels (view names, "Not to scale") are the sheet's own and say only what is true of the view.

## Colors

One violet ink on white, with the tints mixed from that ink and the paper. The dark theme swaps the two base values and remixes the tints; it follows `prefers-color-scheme`, with no toggle.

### Primary
- **Ink** (`ink`, `ink-dark`): all text, all lines, every solid fill (title bars, the copy button, the chosen directory, filled ports). Text on a solid ink fill is paper.

### Tertiary
- **Red pencil** (`red`, `red-dark`): the correction in zone B. It draws the cross over the wrong account and writes the right account name in. Nothing else.

### Neutral
- **Paper** (`paper`, `paper-dark`): the ground. Also the fill that lets one part pass in front of another (a balloon over a line, a plate over a cable).
- **Ink muted** (`ink-muted`, 72% ink in light, 70% in dark): the lightest tint allowed as text. The tagline, prompts, title block labels, values of settings that do not apply to the directory on show.
- **Ink soft** (`ink-soft`, 54% ink): lines only. Phantom lines, hatching, the old cable under the cross, the scrollbar. The one text use is the pressed state of a link.
- **Ink grid** (`ink-grid`, 12% ink in light, 15% in dark): grid lines behind a drawing, the hover and pressed fill of an unchosen directory.

Contrast, computed from the token values: ink on paper 9.6:1 light and 10.9:1 dark; ink muted 5.2:1 and 5.7:1; red 5.4:1 and 7.4:1. Ink soft is 3.3:1 and 3.8:1, which is why it carries lines and not reading text.

### Named Rules
**The One Ink Rule.** One hue prints the sheet. A new level of emphasis is a size, a solid fill or one of the three tints. It is never a new colour.

**The One Red Rule.** Red marks the correction in zone B and nothing else. No red links, errors, badges or highlights.

## Typography

**Display Font:** Big Shoulders (weight 300, self-hosted variable file instanced to 200 to 500, with metric-matched Arial Narrow and Arial fallbacks)
**Body Font:** Barlow 400 (with a metric-matched Arial fallback)
**Label/Mono Font:** Commit Mono 400 (with ui-monospace, SF Mono, Menlo)

**Character:** Tall light caps that state, a plain mono that quotes, a quiet sans that explains. One weight per face. Ligatures are off on the mono so code reads as typed.

### Hierarchy
- **Display** (300, clamp(68px, 9.4vw, 136px), 0.88, caps): the hero statement, set on three lines.
- **Headline** (300, clamp(44px, 6vw, 88px), 0.9, caps, balanced): one title per zone. The title block name uses the same voice at 40px.
- **Title** (300, clamp(32px, 3.2vw, 44px), 0.95, caps): step titles in zone D, each after its number (01, 02, 03) in mono.
- **Body** (Barlow 400, 18px, 1.5, max 46ch): the one line under a zone title. The hero's one-line what is 19px at 380px, with `plugbay.toml` in mono 16px.
- **Code** (Commit Mono 400, 13px, 14px from 1560px): files, commands, tree names, paths, the facts line. The page base is mono 14px at 1.55.
- **Label** (Commit Mono 400, 13px, line-height 1, caps, 0.04em): every label on the sheet: bar titles, scale notes, button text, step numbers.

### Named Rules
**The Three Voices Rule.** Display states. Mono is literal: code, paths, values and labels. Sans speaks in sentences. A literal quoted inside a sentence stays in mono, and code inside a caps caption keeps its own case.

**The 13px Floor Rule.** No text under 13px. The one exception is the 11px caps label in the title block.

## Layout

The page is one sheet, max 1560px wide, with four zones A to D and a title block: A hero, B problem, C one file per tree, D install. One idea per zone, with generous space around it. Everything starts on the left edge of the sheet, ragged right; nothing is centred.

The privacy policy at `/privacy` is sheet 2 of the set (`sheets` in `src/lib/content.ts` numbers them): one zone, the masthead with the mark linking home, the title, and a ruled list of plain answers whose text starts on the centre line from 1024px, as the steps do.

- **Frame.** From 720px the sheet has a 1px border on all sides and a margin equal to the strip (28px). On a phone the frame is its left edge only, with a 20px strip. From 1616px the sheet centres.
- **Zone letters.** Each zone has its letter in the strip. The letter is a link to the zone and rides the edge (sticky at mid-viewport) while its zone is on screen. A 9px tick crosses the frame where one zone ends and the next begins.
- **Zone rhythm.** Zone padding is 56px above and 72px below on a phone, 96px above and below from 720px. Inside a zone the parts sit 64px apart (48px on a phone), a title and its line 28px. Side padding is 14px, then 32px from 720px. The hero is the exception: it fills the first viewport from 960px, and its drawing stands on a 1px ground line at the bottom of the zone. The tick after the hero sits on that line.
- **Labels, not grid lines.** The hero's patch bay has no grid: each server is named over its column of sockets, each directory lettered on its row (balloons A and B), and the key to the right of the plate spells out the paths (above the names when the drawing is under 520px wide). There is no page-wide grid wallpaper.
- **Title block.** Bottom of the sheet, real fields only: mark, title, sheet, creator, licence, repository, privacy. From 1024px it sits in the bottom right corner with its top left corner cut.
- **Ruled list.** The steps in zone D are a list ruled in 1px ink, 88px a row from 1024px: the number in a 72px column, the title, and the command starting on the sheet's centre line. Below 1024px the command sits under its title.
- **Placed drawings.** The correction is drawn twice, a narrow drawing and a wide one, in their own units, and switches by container width at 640px. Lettering stays in CSS pixels while the lines scale.

Breakpoints in use: 480px (command and actions go inline, the chooser's boxes go side by side), 720px (full frame, wider pad, facts on one line), 960px (hero side by side), 1024px (step commands on the centre line, title block corner), 1280px (taller elevation rows), 1560px (code at 14px), 1616px (sheet centres). Container queries: 640px on the correction, 520px on the patch bay (its key moves right of the plate).

Supported from 390px with no horizontal scroll. A command too long for the screen wraps; it never hides its end.

## Elevation & Depth

Flat. There are no shadows, no blur as depth and no tonal layering. Order is shown the way a drawing shows it: a part in front is filled with paper so the line behind it stops at its edge. ("Elevation" as a word on the sheet means the drawing view in zone C, not depth.)

### Named Rules
**The Flat Sheet Rule.** Nothing lifts off the paper. State is shown by a solid fill, a line type or a tint.

## Shapes

Square corners everywhere (radius 0). Circles are the only curves, and each has a meaning: a balloon keys one thing to another, a filled dot is plugged in, a ring is not. A cut corner (12px on a file panel's bar, 10px on the correction's bay, 16px on the title block) is the fold of the file mark or the corner of the block, never a card style.

**The 1px Line Rule.** Every line is 1px, including borders, underlines, the focus outline and SVG strokes (non-scaling). The one exception has one job: the red pencil strokes of the correction's cross are 1.75px with round caps.

**Line types and marks.** The elevation carries no legend, so each of these keeps one meaning:
- **Solid line:** the setting applies to the directory on show.
- **Phantom line** (long dash and two dots, ink soft): it applies somewhere else.
- **Hatching** (1px at 135 degrees every 6px, ink soft): switched off by this file.
- **Filled dot:** plugged in. **Ring:** off here. Same code as the logo's sockets.
- **Square node** (7px, 6px on a leader): a directory, or the subject end of a leader.
- **Oblique tick on a short extension line:** each end of a dimension. One dimension per setting, as long as the run of directories it governs.
- **Projection line:** reads the directory on show across every lane.
- **Balloon:** solid ring normally, filled when it is the directory on show.
- **File glyph** (11 by 14 with a folded corner): a `plugbay.toml` lives in this directory.

## Components

Parts are drawn, not styled: 1px boxes, solid bars, mono labels.

### Buttons
- **Shape:** square (radius 0), min 44px high, 48px from 480px or 720px.
- **Primary (Copy):** a solid block of ink with a paper caps label, min 84px wide, joined to the command it copies. The label crossfades to "Copied" for 1.6s (150ms, with a 2px blur) and a live region announces it. Without clipboard access the command is selected instead.
- **Outlined box link (GitHub):** 1px ink box, caps label, 18px side padding. Hover on fine pointers inverts to solid ink (150ms).
- **Pressed:** both scale to 0.97 (160ms, ease-out).
- **Focus:** 1px ink outline, 3px offset. On a solid fill the outline is paper, inset 5px.

### Command
- **Style:** a 1px box holding the command as selectable mono text with a muted `$` prompt from 480px, and the Copy button on its right. A command too long for the screen stacks the button under it and wraps; it never hides its end. The brew command in zone D is the primary: 17px in a 60px box from 720px.
- **Step command:** in the ruled list a command is plain mono text after its muted `$`, with no box and no button.

### Directory chooser
- **Style:** one radio group, drawn as a tab standing on the elevation's bar in zone C: boxes sharing an edge (stacked on a phone, side by side from 480px), 48px high, each led by a lettered balloon. The chosen one is solid ink and runs into the bar. Hover and pressed on the other are ink grid. Its legend ("Agent starts in") is for screen readers only.
- **Behaviour:** CSS first. `main:has(#detail-b:checked)` sets `--sel-a` and `--sel-b`, and the elevation under the tab reads them. The two directory rows of the elevation are click targets for the same radios when script runs.

### Instrument window
- **Style:** a 1px ink box under a solid 28px ink bar. The bar carries a caps label for the kind of view, the subject in its own case (ellipsis if too long), and a note at the far end ("Not to scale").
- **Variants:** file panel (bar with a 12px cut corner, the file at 1:1, nothing under it), elevation, the agent's window in the correction.

### Annotation
- **Leader:** a square node on the subject, one 45 degree kink, a short shoulder, a caption. The sheet has one: the file and the line that fix the mix-up, on the cable in zone B.
- **Narrow screens:** the leader goes and its caption sits under the figure.

**The One Leader Rule.** One annotation system: square node, one 45 degree kink, shoulder, caption. No arrows, no curved callouts, no second style.

### Stipple figure
- **Technique:** artwork is drawn as stipple and shipped as a mask. A box filled with ink is masked by it, so the art prints in the theme's ink. Where a tonal negative would read wrong (an empty socket turning into a lit one), a `name-dark.png` mask beside `name.png` is used on the dark ground, and only one of the two loads.
- **Layering:** a paper-coloured shape mask under the ink mask lets a line pass behind the art (the hand in zone B).
- **Accessibility:** each figure has a text label naming the real things on it.

**The Mask Rule.** Raster art is never shown as an image with its own colours. It is a mask printed in the ink.

### Motion
Two drawings move: the correction and the elevation. Everything else on the sheet is still, apart from the feedback of a control (press, hover, the Copy label).

- **Draw-in, once.** The correction (B) and the elevation (C) draw themselves the first time 40% of the figure is in view. A shared inline helper arms the figure before it paints (`data-draw="armed"`), then releases it (`data-draw="drawn"`). The correction runs cable, cross, hand, written name, then its caption. The elevation's dimensions run down in merge order, shallowest file first, then the projection line runs across.
- **Response to the choice.** Changing the directory swaps solid and phantom lines (200ms), fills the other balloon (150ms) and runs the projection line across (150ms out, 400ms in).
- **Tokens.** `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` for press feedback. `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)` for lines being drawn. Plain `ease` for fades of 150 to 200ms. Colour and fill changes are 150ms.
- **Fallbacks.** With reduced motion the helper never arms, so the elevation is in its final state; fades stay, travelling lines go, smooth scroll is off. With no script the elevation is drawn and the choice still works.
- **Layout.** Motion never moves layout.

**The Explain Or Cut Rule.** At most one explaining motion per zone. An animation that does not show how plugbay works is removed.

### Hit targets
Every control is at least 44px in both directions, including the zone letters, which are 44px squares centred on a narrower strip. Controls do not select as text; content does. The tap highlight is off because every control has its own pressed state.

## Do's and Don'ts

### Do:
- **Do** print everything in the one ink and build emphasis from size, solid fills and the three tints.
- **Do** keep every line 1px. A new exception needs one job and a name next to the red pencil.
- **Do** use ink muted as the lightest text tint and keep ink soft and ink grid for lines and fills.
- **Do** set literals in mono, sentences in Barlow and statements in Big Shoulders 300 caps.
- **Do** derive every product value from `src/data/plugbay.ts` and add a build-time check when a drawing depends on a count or a merge.
- **Do** say it once: a zone gets a title, at most one line, and its drawing.
- **Do** annotate with the one leader on wide screens and a plain caption under the figure on narrow ones.
- **Do** ship stipple art as a mask, with a `-dark` mask where the negative reads wrong.
- **Do** keep each line type and mark to its meaning: solid applies here, phantom applies elsewhere, hatch is off, filled dot is plugged in, ring is not.
- **Do** give every animation a drawn final state that shows with reduced motion and with no script.
- **Do** design both themes and check 390px and wide desktop.

### Don't:
- **Don't** add glow, shadows or blur to lift anything off the paper.
- **Don't** use a gradient as a colour or a surface. `linear-gradient` is a drawing tool here: hard-stop lines and hatching.
- **Don't** add a second accent, and don't use the red outside the correction in zone B.
- **Don't** round a box or build feature cards. Circles are balloons and ports; cut corners are folds.
- **Don't** invent readouts: no coordinates, drawing numbers, dates, revisions or measurements that are not real plugbay values.
- **Don't** state a version, release, badge, star count or any number the product repo cannot back.
- **Don't** set text under 13px, apart from the 11px title block labels.
- **Don't** add back a paragraph, a legend or a caption that a title or a drawing already says.
- **Don't** draw grid lines over the stipple art or as wallpaper. Name the parts of a drawing instead.
- **Don't** redraw the logo. Read the current files from the product repo.
