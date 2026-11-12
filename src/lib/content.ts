// Words the page needs that src/data/plugbay.ts does not spell out on their own.
import { hero, licence, links } from "../data/plugbay";

const [, owner, name] = new URL(links.repo).pathname.split("/");

// Title block: only the fields a sheet may carry while plugbay has no release
// (docs/research/directions-brief.md, "Content rules").
export const titleBlock = {
  creator: owner,
  licence,
  repository: links.repo.replace("https://", ""),
  sheet: "1 / 1",
  subtitle: hero.eyebrow.replace(".", ""),
  title: name,
};
// Zone titles. C comes from the page brief; D is the README's own section
// name (AGENTS.md, "Source of truth").
export const zoneTitles = {
  install: "Install",
  oneFilePerTree: "One file per tree",
};
