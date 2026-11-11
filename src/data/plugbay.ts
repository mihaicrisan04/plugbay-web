// Page content, traced to the product repo. Sources and line references live in
// docs/research/content-inventory.md; terminal output in docs/research/canonical-world.md.
// Do not add claims, commands or output here that those files cannot back.

export const links = {
  repo: "https://github.com/mihaicrisan04/plugbay",
  security: "https://github.com/mihaicrisan04/plugbay#security-model",
};

export const install = {
  brew: "brew install mihaicrisan04/tap/plugbay",
  cargo:
    "cargo install --locked --git https://github.com/mihaicrisan04/plugbay",
};

export const hero = {
  eyebrow: "mise for MCP servers.",
  headlines: [
    "The right MCP account in every repo.",
    "Stop using client A's Sentry in client B's repo.",
    "mise for MCP servers.",
  ],
  subhead:
    "Small, committable plugbay.toml files say which MCP servers a directory tree needs, and which account of each. Tokens stay in your keychain.",
  worksWith: "Works with Claude Code and Codex, and with T3 Code through them.",
};

export const pain = {
  body: "You work across clients. Each one has its own Sentry, its own PostHog, its own Linear workspace. Your agents don't know that: they get every MCP server you ever configured, logged in to whichever account you used last.",
  headline: "Stop using client A's Sentry in client B's repo.",
};

// One example world for the whole page: an agency under ~/work with two clients.
export const configFiles = [
  {
    path: "~/work/plugbay.toml",
    scope: "every repo under ~/work",
    source: `[servers]
linear = "agency"`,
  },
  {
    path: "~/work/acme/plugbay.toml",
    scope: "every Acme repo",
    source: `[servers]
sentry = "acme"
posthog = "acme"`,
  },
  {
    path: "~/work/globex/plugbay.toml",
    scope: "every Globex repo",
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
  account: 'sentry = "acme" means server sentry, account acme.',
  disable: "false turns off a server a parent directory turned on.",
  merge:
    "Files load from / down to the project directory. Deeper wins, field by field.",
  secrets: "Config files never hold secrets.",
  tools: "Tools reach the agent as server__tool.",
};

export const steps = [
  {
    body: "plugbay setup registers plugbay once in Claude Code and Codex. You never edit their MCP config again.",
    command: "plugbay setup",
    title: "One entry per agent",
  },
  {
    body: "plugbay walks from / down to where the agent started and merges every plugbay.toml on the way.",
    command: "plugbay use sentry:acme posthog:acme",
    title: "Resolved per directory",
  },
  {
    body: "plugbay logs you in with OAuth or an API token and stores it in the OS keychain, bound to the server's URL and the account.",
    command: "plugbay login",
    title: "Tokens stay in your keychain",
  },
] as const;

export const beforeAfter = [
  {
    after: "One MCP entry per agent, registered once by plugbay setup",
    before:
      "Servers configured again in ~/.claude.json, ~/.codex/config.toml and a .mcp.json per repo",
  },
  {
    after: "Tokens in the OS keychain. Config never holds secrets",
    before: "Tokens pasted into JSON",
  },
  {
    after: 'One account per tree: sentry = "acme"',
    before: "One Sentry login for every client",
  },
  {
    after: "Only what the directory pins",
    before: "Every server's tools loaded in every project",
  },
] as const;

export const facts = [
  "Claude Code and Codex, and T3 Code through them",
  "macOS and Linux",
  "Open source, Apache-2.0",
  "No telemetry",
] as const;

export const migrate =
  "Already have MCP servers set up? plugbay migrate moves them over, and --undo rolls it back.";

// Real output of plugbay 0.2.1 (main), captured in a sandbox. plugbay prints no
// colour, so the page keeps output in one colour. Column widths size to content.
export const terminal = {
  lsAcme: {
    command: "plugbay ls",
    cwd: "~/work/acme/api",
    output: `Project      ~/work/acme/api

Config files (merge order)
  project  ~/work/plugbay.toml
  project  ~/work/acme/plugbay.toml

Servers
  SERVER         TRANSPORT  TARGET                       TOOLS       STATUS
  linear:agency  http       https://mcp.linear.app/mcp   linear__*   ready
  posthog:acme   http       https://mcp.posthog.com/mcp  posthog__*  ready
  sentry:acme    http       https://mcp.sentry.dev/mcp   sentry__*   ready`,
  },
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
  unuseLinear: {
    command: "plugbay unuse linear",
    cwd: "~/work/globex",
    output:
      "Not using linear in ~/work/globex/plugbay.toml (inherited, so it is now switched off here)",
  },
  useAcme: {
    command: "plugbay use sentry:acme posthog:acme",
    cwd: "~/work/acme",
    output: `Using sentry:acme in ~/work/acme/plugbay.toml
Using posthog:acme in ~/work/acme/plugbay.toml`,
  },
  whyLinearGlobex: {
    command: "plugbay why linear",
    cwd: "~/work/globex/web",
    output: "linear is disabled by ~/work/globex/plugbay.toml",
  },
  whySentryAcme: {
    command: "plugbay why sentry",
    cwd: "~/work/acme/api",
    output: `sentry:acme
  identity  https://mcp.sentry.dev/mcp
  tools     sentry__*

  FIELD    VALUE                       SET BY
  enabled  true                        ~/work/acme/plugbay.toml
  account  acme                        ~/work/acme/plugbay.toml
  url      https://mcp.sentry.dev/mcp  <registry>`,
  },
  whySentryGlobex: {
    command: "plugbay why sentry",
    cwd: "~/work/globex/web",
    output: `sentry:globex
  identity  https://mcp.sentry.dev/mcp
  tools     sentry__*

  FIELD    VALUE                       SET BY
  enabled  true                        ~/work/globex/plugbay.toml
  account  globex                      ~/work/globex/plugbay.toml
  url      https://mcp.sentry.dev/mcp  <registry>`,
  },
} as const;
