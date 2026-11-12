// The drawings are computed from the page data, never typed by hand: every
// dimension and port below comes out of src/data/plugbay.ts.
import { configFiles, resolved } from "../data/plugbay";

const SETTING = /^(?<server>[a-z0-9-]+) = (?<literal>.+)$/;
const DETAIL_IDS = ["a", "b", "c", "d"] as const;

export type DetailId = (typeof DETAIL_IDS)[number];
export type Connector = "blank" | "elbow" | "pipe" | "tee";
export type PortState = "off" | "on";

interface Setting {
  // The line as the file spells it, then its two halves.
  line: string;
  literal: string;
  server: string;
}

const parentOf = (path: string) => path.slice(0, path.lastIndexOf("/"));
const nameOf = (path: string) => path.slice(path.lastIndexOf("/") + 1);
const isWithin = (path: string, ancestor: string) =>
  path === ancestor || path.startsWith(`${ancestor}/`);

function parseSettings(source: string): Setting[] {
  return source.split("\n").flatMap((line) => {
    const groups = SETTING.exec(line)?.groups;
    return groups
      ? [{ line, literal: groups.literal, server: groups.server }]
      : [];
  });
}

export const files = configFiles.map((file) => ({
  ...file,
  directory: parentOf(file.path),
  lines: file.source.split("\n"),
  settings: parseSettings(file.source),
}));

export type ConfigFile = (typeof files)[number];

export const servers = [
  ...new Set(files.flatMap((file) => file.settings.map((s) => s.server))),
];

const directories = [
  ...new Set([
    ...files.map((file) => file.directory),
    ...resolved.map((entry) => entry.directory),
  ]),
].toSorted();

export const [root] = directories;

// Each directory an agent can start in, keyed by a letter.
export const details = resolved.map((entry, index) => ({
  ...entry,
  id: DETAIL_IDS[index],
  letter: DETAIL_IDS[index].toUpperCase(),
}));

export type Detail = (typeof details)[number];

// Files on the way from / down to `directory`, shallowest first (merge order).
export const filesOnPath = (directory: string) =>
  files
    .filter((file) => isWithin(directory, file.directory))
    .toSorted((a, b) => a.directory.length - b.directory.length);

// Deeper wins, field by field: the last file on the path that names the server.
// Every drawing on the page that merges files does it through this.
export function settingAt(directory: string, server: string) {
  const file = filesOnPath(directory).findLast((candidate) =>
    candidate.settings.some((entry) => entry.server === server)
  );
  const setting = file?.settings.find((entry) => entry.server === server);
  return file && setting ? { ...setting, setBy: file } : null;
}

function connectorsFor(path: string): Connector[] {
  const ancestors = directories.filter(
    (candidate) => candidate !== root && isWithin(path, candidate)
  );
  return ancestors.map((ancestor, index) => {
    const hasLaterSibling = directories.some(
      (candidate) =>
        parentOf(candidate) === parentOf(ancestor) && candidate > ancestor
    );
    if (index === ancestors.length - 1) {
      return hasLaterSibling ? "tee" : "elbow";
    }
    return hasLaterSibling ? "pipe" : "blank";
  });
}

export const rows = directories.map((path) => ({
  connectors: connectorsFor(path),
  detail: details.find((detail) => detail.directory === path),
  file: files.find((file) => file.directory === path),
  hasChildren: directories.some((candidate) => parentOf(candidate) === path),
  label: path === root ? path : nameOf(path),
  path,
}));

export interface Span {
  // Detail ids of the directories this setting reaches.
  covers: DetailId[];
  enabled: boolean;
  end: number;
  literal: string;
  server: string;
  setBy: ConfigFile;
  start: number;
}

// One dimension per setting: the run of rows a single line of a file governs.
function spansFor(server: string): Span[] {
  const spans: Span[] = [];
  for (const [index, row] of rows.entries()) {
    const setting = settingAt(row.path, server);
    const open = spans.at(-1);
    if (!setting) {
      continue;
    }
    if (open && open.end === index - 1 && open.setBy === setting.setBy) {
      open.end = index;
      if (row.detail) {
        open.covers.push(row.detail.id);
      }
      continue;
    }
    spans.push({
      covers: row.detail ? [row.detail.id] : [],
      enabled: setting.literal !== "false",
      end: index,
      literal: setting.literal,
      server,
      setBy: setting.setBy,
      start: index,
    });
  }
  return spans;
}

export const spans = servers.flatMap(spansFor);

export interface Port {
  detail: Detail;
  // The value as the file spells it: "acme" or false.
  literal: string;
  row: number;
  server: string;
  state: PortState;
}

export const ports: Port[] = details.flatMap((detail) =>
  servers.flatMap((server) => {
    const setting = settingAt(detail.directory, server);
    if (!setting) {
      return [];
    }
    return [
      {
        detail,
        literal: setting.literal,
        row: rows.findIndex((row) => row.path === detail.directory),
        server,
        state: setting.literal === "false" ? "off" : "on",
      } satisfies Port,
    ];
  })
);

// The drawing must agree with what plugbay really resolves. Fail the build if
// the merge above and the captured result in src/data ever disagree.
for (const detail of details) {
  const drawn = ports
    .filter((port) => port.detail === detail && port.state === "on")
    .map((port) => `${port.server}:${port.literal.replaceAll('"', "")}`)
    .toSorted();
  const expected = [...detail.servers].toSorted();
  if (drawn.join() !== expected.join()) {
    throw new Error(
      `Elevation shows ${drawn.join()} for ${detail.directory}, data says ${expected.join()}`
    );
  }
}
