// Words the page needs that src/data/plugbay.ts does not spell out on their own.
import { hero, licence, links } from "../data/plugbay";

const [, owner, name] = new URL(links.repo).pathname.split("/");

export const privacyPath = "/privacy";

// Every route is one sheet of the set, in this order.
const sheets = ["/", privacyPath];
const TRAILING_SLASH = /(.)\/$/;

// Title block: only the fields a sheet may carry while plugbay has no release
// (docs/research/directions-brief.md, "Content rules").
export const titleBlock = {
  creator: owner,
  licence,
  privacy: "Privacy policy",
  repository: links.repo.replace("https://", ""),
  subtitle: hero.eyebrow.replace(".", ""),
  title: name,
};

// The build serves /privacy/ for /privacy; the site links without the slash.
export const routeOf = (pathname: string) =>
  pathname.replace(TRAILING_SLASH, "$1");

export function sheetOf(pathname: string) {
  const route = routeOf(pathname);
  const index = sheets.indexOf(route);
  if (index === -1) {
    throw new Error(
      `${route} is not a sheet: add it to sheets in src/lib/content.ts`
    );
  }
  return { number: `${index + 1} / ${sheets.length}`, route };
}

// Zone titles. C comes from the page brief; D is the README's own section
// name (AGENTS.md, "Source of truth").
export const zoneTitles = {
  install: "Install",
  oneFilePerTree: "One file per tree",
};
