// Words the page needs that src/data/plugbay.ts does not spell out on their
// own. Where the data holds the fact inside a sentence, it is read from there.
import { facts, hero, links, steps } from "../data/plugbay";

const AGENTS = / in (?<first>.+) and (?<second>[^.]+)\./;
const LICENCE = /, (?<licence>[A-Za-z]+-[\d.]+)$/;

function found<T>(value: T | undefined, what: string): T {
  if (value === undefined) {
    throw new Error(`The page data no longer holds ${what}`);
  }
  return value;
}

const [, owner, name] = new URL(links.repo).pathname.split("/");
const [setup] = steps;
const agentNames = found(AGENTS.exec(setup.body)?.groups, "the two agents");

// The two agents `plugbay setup` registers itself in, from the first step.
export const agents = [agentNames.first, agentNames.second];

// Title block: only the fields a sheet may carry while plugbay has no release
// (docs/research/directions-brief.md, "Content rules").
export const titleBlock = {
  creator: owner,
  licence: found(
    facts.map((fact) => LICENCE.exec(fact)?.groups?.licence).find(Boolean),
    "the licence"
  ),
  repository: links.repo.replace("https://", ""),
  sheet: "1 / 1",
  subtitle: hero.eyebrow.replace(".", ""),
  title: name,
};

// Zone titles. C and D come from the page brief; E and F are the README's own
// section names (AGENTS.md, "Source of truth").
export const zoneTitles = {
  detail:
    "Same server, different account, depending on where the agent starts.",
  howItWorks: "How it works",
  install: "Install",
  oneFilePerTree: "One file per tree",
};

// Key to the elevation's own marks.
export const legend = {
  elsewhere: "applies elsewhere",
  here: "applies here",
  off: "switched off",
  offHere: "off here",
  plugged: "plugged in",
};
