// The model-space drawing, derived from src/data/plugbay.ts. Nothing here adds
// a fact: pins come from the config files, layer states from the resolved sets.
import { configFiles, resolved, terminal } from "../../data/plugbay";

export type StopId = "acme" | "globex";
export type Linetype = "continuous" | "hidden" | "phantom";

export interface Stop {
  directory: string;
  id: StopId;
  ls: { command: string; output: string };
  name: string;
  why: { command: string; output: string };
}

export const stops: readonly Stop[] = [
  {
    directory: resolved[0].directory,
    id: "acme",
    ls: terminal.lsAcme,
    name: "api",
    why: terminal.whySentryAcme,
  },
  {
    directory: resolved[1].directory,
    id: "globex",
    ls: terminal.lsGlobex,
    name: "web",
    why: terminal.whySentryGlobex,
  },
];

export interface Pin {
  account: string | null;
  directory: string;
  line: string;
  server: string;
}

const PIN_LINE = /^([a-z0-9-]+) = (?:"([a-z0-9-]+)"|false)$/;

// Every `server = "account"` or `server = false` line, with the directory
// whose plugbay.toml holds it.
export const pins: readonly Pin[] = configFiles.flatMap((file) =>
  file.source.split("\n").flatMap((line) => {
    const match = PIN_LINE.exec(line);
    if (!match) {
      return [];
    }
    return [
      {
        account: match[2] ?? null,
        directory: file.path.replace("/plugbay.toml", ""),
        line,
        server: match[1],
      },
    ];
  })
);

export interface Layer {
  account: string;
  linetype: Linetype;
  note: string;
  on: boolean;
  server: string;
}

const split = (entry: string) => {
  const [server, account] = entry.split(":");
  return { account, server };
};

const pinnedIn = (server: string, account: string) =>
  pins.find((pin) => pin.server === server && pin.account === account)
    ?.directory ?? "";

// One row per server:account in the world. Continuous = the agent started in
// this directory gets it. Phantom = same server, the other tree's account.
// Hidden = exists, not exposed here.
export const layersFor = (id: StopId): Layer[] => {
  const here = resolved[id === "acme" ? 0 : 1];
  const there = resolved[id === "acme" ? 1 : 0];
  const on = here.servers.map(split);

  const elsewhere = there.servers
    .map(split)
    .filter(
      (other) =>
        !on.some(
          (mine) =>
            mine.server === other.server && mine.account === other.account
        )
    );

  const rows: Layer[] = on.map(({ account, server }) => ({
    account,
    linetype: "continuous",
    note: pinnedIn(server, account),
    on: true,
    server,
  }));

  for (const { account, server } of elsewhere) {
    const sameServer = on.some((mine) => mine.server === server);
    const off = here.disabled.find((entry) => entry.server === server);
    let note = "not pinned here";
    if (sameServer) {
      note = "other account";
    } else if (off) {
      note = `off in ${off.by.replace("/plugbay.toml", "")}`;
    }
    rows.push({
      account,
      linetype: sameServer ? "phantom" : "hidden",
      note,
      on: false,
      server,
    });
  }

  // Servers in `plugbay ls` order, the phantom account last.
  return rows.sort(
    (a, b) =>
      Number(a.linetype === "phantom") - Number(b.linetype === "phantom") ||
      a.server.localeCompare(b.server)
  );
};

export const fileFor = (directory: string) =>
  configFiles.find((file) => file.path === `${directory}/plugbay.toml`);
