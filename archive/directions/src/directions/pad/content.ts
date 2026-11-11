// Facts the pad needs that src/data/plugbay.ts does not carry. Each one names its source.
import { configFiles, resolved } from "../../data/plugbay";

// Title block fields allowed by docs/research/directions-brief.md, "Content rules".
export const titleBlock = {
  creator: "mihaicrisan04",
  licence: "Apache-2.0",
  platforms: "macOS and Linux",
  project: "plugbay",
  repoLabel: "github.com/mihaicrisan04/plugbay",
  subject: "mise for MCP servers",
} as const;

export const sheetCount = 2;

// Balloon numbers key each plugbay.toml to its scope dimension, its panel and its term in the sums.
export const files = configFiles.map((file, index) => ({
  ...file,
  balloon: index + 1,
  lines: file.source.split("\n"),
}));

// Every account the example world is logged in to, in the order `plugbay ls` resolves them.
export const accounts = [
  ...new Set(resolved.flatMap((directory) => directory.servers)),
];

type TreeGuide = "blank" | "ell" | "pipe" | "tee";

interface TreeRow {
  // Balloon of the plugbay.toml on this row, when the row is one.
  file?: number;
  guides: TreeGuide[];
  name: string;
}

// The canonical world: docs/research/canonical-world.md, "The files" and "Directories".
export const tree: TreeRow[] = [
  { guides: [], name: "~/work" },
  { file: 1, guides: ["tee"], name: "plugbay.toml" },
  { guides: ["tee"], name: "acme" },
  { file: 2, guides: ["pipe", "tee"], name: "plugbay.toml" },
  { guides: ["pipe", "ell"], name: "api" },
  { guides: ["ell"], name: "globex" },
  { file: 3, guides: ["blank", "tee"], name: "plugbay.toml" },
  { guides: ["blank", "ell"], name: "web" },
];

// Which files merge for each directory, in merge order, as `plugbay ls` lists them
// (src/data/plugbay.ts, terminal.lsAcme and terminal.lsGlobex, "Config files (merge order)").
export const sums = [
  { cancelled: [], result: resolved[0], terms: [files[0], files[1]] },
  {
    cancelled: ['linear = "agency"', "linear = false"],
    result: resolved[1],
    terms: [files[0], files[2]],
  },
] as const;

const codePattern =
  /(~\/[\w./]+|\.mcp\.json|plugbay setup|plugbay migrate|--undo|sentry = "acme"|plugbay\.toml|server__tool|false)/;

// Splits a sentence so paths, commands and config lines can be set in the mono, in their own case.
export function withCode(sentence: string) {
  return sentence
    .split(codePattern)
    .filter((part) => part !== "")
    .map((text) => ({ isCode: codePattern.test(text), text }));
}
