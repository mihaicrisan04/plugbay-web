// The canonical world, reshaped for the assembly drawing. Everything here is
// derived from src/data/plugbay.ts; nothing is restated by hand.
import { configFiles, terminal } from "../../data/plugbay";

// A port is one server slot on a plate: what that file says about the server.
export type PortState = "open" | "set" | "blank";

export interface Port {
  account: string | null;
  server: string;
  state: PortState;
}

const ASSIGNMENT = /^([a-z0-9-]+) = (.+)$/;

function readAssignments(source: string) {
  const assignments = new Map<string, string>();
  for (const line of source.split("\n")) {
    const match = ASSIGNMENT.exec(line);
    if (match) {
      assignments.set(match[1], match[2].replaceAll('"', ""));
    }
  }
  return assignments;
}

// Column order is the order `plugbay ls` prints servers in.
export const servers = ["linear", "posthog", "sentry"] as const;

function portsFor(source: string): Port[] {
  const assignments = readAssignments(source);
  return servers.map((server) => {
    const value = assignments.get(server);
    if (value === undefined) {
      return { account: null, server, state: "open" };
    }
    if (value === "false") {
      return { account: null, server, state: "blank" };
    }
    return { account: value, server, state: "set" };
  });
}

// Item numbers key every plate, tag, dimension and legend row to one file.
export const files = configFiles.map((file, index) => ({
  ...file,
  directory: file.path.replace("/plugbay.toml", ""),
  item: index + 1,
  ports: portsFor(file.source),
}));

export const [workFile, acmeFile, globexFile] = files;

export const emptyPorts: Port[] = servers.map((server) => ({
  account: null,
  server,
  state: "open",
}));

export type BranchId = "acme" | "globex";

// What one server resolves to in a directory, and the file that decided it.
export interface Resolution {
  account: string | null;
  item: number | null;
  server: string;
  state: PortState;
}

function resolve(path: typeof files): Resolution[] {
  return servers.map((server, column) => {
    const deciding = path.findLast(
      (file) => file.ports[column].state !== "open"
    );
    const port = deciding?.ports[column];
    return {
      account: port?.account ?? null,
      item: deciding?.item ?? null,
      server,
      state: port?.state ?? "open",
    };
  });
}

export const branches = [
  {
    file: acmeFile,
    id: "acme" as BranchId,
    ls: terminal.lsAcme,
    resolution: resolve([workFile, acmeFile]),
    why: terminal.whySentryAcme,
  },
  {
    file: globexFile,
    id: "globex" as BranchId,
    ls: terminal.lsGlobex,
    resolution: resolve([workFile, globexFile]),
    why: terminal.whySentryGlobex,
  },
];

export const [acme, globex] = branches;

// Row of `plugbay ls` output (0-based) that lists a server, so a wire can land on it.
export function outputRowOf(output: string, needle: string) {
  return output.split("\n").findIndex((line) => line.includes(needle));
}
