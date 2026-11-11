// The drawing is computed from the page data, never typed by hand: every
// dimension, port and capture below comes out of src/data/plugbay.ts.
import { configFiles, resolved, terminal } from "../../data/plugbay";

const SETTING = /^(?<server>[a-z0-9-]+) = (?<literal>.+)$/;
const DETAIL_IDS = ["a", "b", "c", "d"] as const;

export type DetailId = (typeof DETAIL_IDS)[number];
export type Connector = "blank" | "elbow" | "pipe" | "tee";
export type PortState = "off" | "on";

interface Setting {
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
    return groups ? [{ literal: groups.literal, server: groups.server }] : [];
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

interface Session {
  command: string;
  cwd: string;
  output: string;
}

export const promptOf = (session: Session) =>
  `${session.cwd} $ ${session.command}`;

// Width of a capture in characters, so its panel can be sized before it renders.
export const columnsOf = (sessions: readonly Session[]) =>
  Math.max(
    ...sessions.flatMap((session) => [
      promptOf(session).length,
      ...session.output.split("\n").map((line) => line.length),
    ])
  );

function captureFor(directory: string, command: string) {
  const capture = Object.values(terminal).find(
    (entry) => entry.cwd === directory && entry.command === command
  );
  if (!capture) {
    throw new Error(`No "${command}" capture for ${directory}`);
  }
  return capture;
}

// Each directory an agent starts in gets a detail view: its real `plugbay ls`.
export const details = resolved.map((entry, index) => ({
  ...entry,
  capture: captureFor(entry.directory, "plugbay ls"),
  id: DETAIL_IDS[index],
  letter: DETAIL_IDS[index].toUpperCase(),
}));

export type Detail = (typeof details)[number];

// Every server and account pair in use: one login, one keychain token each.
export const accounts = [
  ...new Set(resolved.flatMap((entry) => entry.servers)),
].toSorted();

export const detailColumns = columnsOf(details.map((detail) => detail.capture));

// Files on the way from / down to `directory`, shallowest first (merge order).
export const filesOnPath = (directory: string) =>
  files
    .filter((file) => isWithin(directory, file.directory))
    .toSorted((a, b) => a.directory.length - b.directory.length);

// Deeper wins, field by field: the last file on the path that names the server.
function settingAt(directory: string, server: string) {
  const file = filesOnPath(directory).findLast((candidate) =>
    candidate.settings.some((entry) => entry.server === server)
  );
  const setting = file?.settings.find((entry) => entry.server === server);
  return file && setting ? { literal: setting.literal, setBy: file } : null;
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

// The walk in zone B: files every directory shares form the trunk, the rest
// hang off one branch per directory.
export const trunk = files.filter((file) =>
  details.every((detail) => isWithin(detail.directory, file.directory))
);

export const branches = details.map((detail) => ({
  detail,
  files: filesOnPath(detail.directory).filter((file) => !trunk.includes(file)),
  // Every `plugbay why` captured there, the server that is on before the one
  // that is off.
  why: Object.values(terminal)
    .filter(
      (entry) =>
        entry.cwd === detail.directory &&
        entry.command.startsWith("plugbay why")
    )
    .toSorted((a, b) => b.output.length - a.output.length),
}));
