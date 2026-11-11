// Screenshots one route at desktop and mobile widths in light and dark.
// Usage: bun scripts/shot.ts <route> [--out dir] [--full] [--motion] [--base url]
// Needs a running server (`bun run dev` or `bun run preview`), default http://localhost:4321.
import { mkdir } from "node:fs/promises";
import { parseArgs } from "node:util";
import { type Browser, chromium } from "@playwright/test";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    base: { default: "http://localhost:4321", type: "string" },
    full: { default: false, type: "boolean" },
    motion: { default: false, type: "boolean" },
    out: { default: ".shots", type: "string" },
  },
});

const route = positionals[0] ?? "/";
const slug = route.replaceAll("/", "-").replace(/^-|-$/g, "") || "home";
const viewports = {
  desktop: { height: 900, width: 1440 },
  mobile: { height: 844, width: 390 },
};
const schemes = ["light", "dark"] as const;

interface Capture {
  colorScheme: (typeof schemes)[number];
  device: string;
  viewport: { height: number; width: number };
}

async function capture(chrome: Browser, shot: Capture) {
  const context = await chrome.newContext({
    colorScheme: shot.colorScheme,
    deviceScaleFactor: 2,
    reducedMotion: values.motion ? "no-preference" : "reduce",
    viewport: shot.viewport,
  });
  const page = await context.newPage();
  const problems: string[] = [];
  page.on("pageerror", (error) => problems.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      problems.push(message.text());
    }
  });
  await page.goto(new URL(route, values.base).href, {
    waitUntil: "networkidle",
  });
  await page.evaluate(() => document.fonts.ready);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  );
  if (overflow > 0) {
    problems.push(`horizontal overflow ${overflow}px`);
  }
  const path = `${values.out}/${slug}-${shot.device}-${shot.colorScheme}.png`;
  await page.screenshot({ fullPage: values.full, path });
  await context.close();
  return `${path} ${problems.length > 0 ? `!! ${problems.join(" | ")}` : "ok"}`;
}

await mkdir(values.out, { recursive: true });
const browser = await chromium.launch();
const shots = Object.entries(viewports).flatMap(([device, viewport]) =>
  schemes.map((colorScheme) => ({ colorScheme, device, viewport }))
);
const results = await Promise.all(shots.map((shot) => capture(browser, shot)));
await browser.close();
console.log(results.join("\n"));
