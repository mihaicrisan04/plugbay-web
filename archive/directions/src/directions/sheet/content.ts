// Words this direction needs that src/data/plugbay.ts does not hold.
import { hero, links } from "../../data/plugbay";

// Title block. Source: docs/research/directions-brief.md, "Content rules":
// the only fields a title block may carry while plugbay has no release.
export const titleBlock = {
  creator: "mihaicrisan04",
  licence: "Apache-2.0",
  repository: links.repo.replace("https://", ""),
  sheet: "1 / 1",
  subtitle: hero.eyebrow.replace(".", ""),
  title: "plugbay",
};

// Section name from docs/research/directions-brief.md, "What to build".
export const oneFilePerTree = "One file per tree";

// Source: docs/research/canonical-world.md, "How it was captured": output is
// copied byte for byte.
export const captureNote = "Captures at 1:1 are real plugbay output.";
