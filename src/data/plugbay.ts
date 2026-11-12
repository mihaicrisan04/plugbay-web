// Page content, traced to the product repo. Sources and line references live in
// docs/research/content-inventory.md; terminal output in docs/research/canonical-world.md.
// Do not add claims, commands or output here that those files cannot back.

export const links = {
  repo: "https://github.com/mihaicrisan04/plugbay",
};

export const install = {
  brew: "brew install mihaicrisan04/tap/plugbay",
  cargo:
    "cargo install --locked --git https://github.com/mihaicrisan04/plugbay",
};

export const hero = {
  eyebrow: "mise for MCP servers.",
  statement: "The right MCP account in every repo.",
  subhead:
    "Small, committable plugbay.toml files say which MCP servers a directory tree needs, and which account of each. Tokens stay in your keychain.",
  what: "One plugbay.toml per directory tree: which MCP servers, which account of each.",
};

export const pain = {
  headline: "Stop using client A's Sentry in client B's repo.",
  line: "Your agents get every MCP server you configured, logged in to the account you used last.",
};

// One example world for the whole page: an agency under ~/work with two clients.
export const configFiles = [
  {
    path: "~/work/plugbay.toml",
    source: `[servers]
linear = "agency"`,
  },
  {
    path: "~/work/acme/plugbay.toml",
    source: `[servers]
sentry = "acme"
posthog = "acme"`,
  },
  {
    path: "~/work/globex/plugbay.toml",
    source: `[servers]
sentry = "globex"
linear = false`,
  },
] as const;

// What an agent started in each directory gets, after the files above merge.
export const resolved = [
  {
    directory: "~/work/acme/api",
    disabled: [],
    servers: ["linear:agency", "posthog:acme", "sentry:acme"],
  },
  {
    directory: "~/work/globex/web",
    disabled: [{ by: "~/work/globex/plugbay.toml", server: "linear" }],
    servers: ["sentry:globex"],
  },
] as const;

export const callouts = {
  deeperWins: "Deeper wins, field by field.",
};

export const steps = [
  {
    command: "plugbay setup",
    title: "One entry per agent",
  },
  {
    command: "plugbay use sentry:acme posthog:acme",
    title: "Resolved per directory",
  },
  {
    command: "plugbay login",
    title: "Tokens stay in your keychain",
  },
] as const;

export const licence = "Apache-2.0";

export const facts = [
  "Claude Code and Codex",
  "macOS and Linux",
  licence,
  "No telemetry",
] as const;

// Real output of plugbay 0.2.1 (main), captured in a sandbox. plugbay prints no
// colour, so the page keeps output in one colour. Column widths size to content.
export const terminal = {
  lsGlobex: {
    command: "plugbay ls",
    cwd: "~/work/globex/web",
    output: `Project      ~/work/globex/web

Config files (merge order)
  project  ~/work/plugbay.toml
  project  ~/work/globex/plugbay.toml

Servers
  SERVER         TRANSPORT  TARGET                      TOOLS      STATUS
  sentry:globex  http       https://mcp.sentry.dev/mcp  sentry__*  ready

Disabled
  linear  by ~/work/globex/plugbay.toml`,
  },
} as const;
