// Geometry of the hero drawing, in its own units (the wide SVG viewBox). One line of
// plugbay.toml is one patch cable: it leaves the file's panel and lands in the jack of
// the account it names.
import { accounts, files } from "./content";

export const wide = { height: 400, width: 1160 };
export const narrow = { height: 294, width: 336 };

// Panels sit on this line, so a cable always starts at a panel's bottom edge.
export const panelBottom = 128;
const jackY = 310;
const jackRadius = 16;
const cableBend = 84;

const jackX: Record<string, number> = {
  "linear:agency": 150,
  "posthog:acme": 400,
  "sentry:acme": 620,
  "sentry:globex": 840,
};

// On a narrow sheet only the two Sentry accounts are drawn.
const narrowJackX: Record<string, number> = {
  "sentry:acme": 92,
  "sentry:globex": 212,
};
export const narrowJackY = 190;

export const jacks = accounts.map((account) => ({
  account,
  narrowX: narrowJackX[account],
  x: jackX[account],
  y: jackY,
}));

export const jackSize = { hole: 8, radius: jackRadius };

// Where each panel stands, and where each of its pins leaves the bottom edge.
const panelLayout = [
  { left: 0, pins: [{ account: "linear:agency", x: 48 }] },
  {
    left: 290,
    pins: [
      { account: "posthog:acme", x: 330 },
      { account: "sentry:acme", x: 390 },
    ],
  },
  { left: 570, pins: [{ account: "sentry:globex", x: 612 }] },
];

export const panels = files.map((file, index) => ({
  ...file,
  ...panelLayout[index],
}));

// The plug the hand holds: its tip is in this jack, and its cable runs under the hand.
export const corrected = { from: "sentry:acme", to: "sentry:globex" };

function drop(fromX: number, toX: number) {
  const top = panelBottom;
  const bottom = jackY - jackRadius;
  return `M${fromX} ${top}C${fromX} ${top + cableBend} ${toX} ${bottom - cableBend} ${toX} ${bottom}`;
}

export const cables = panels.flatMap((panel) =>
  panel.pins
    .filter((pin) => pin.account !== corrected.to)
    .map((pin) => ({ ...pin, path: drop(pin.x, jackX[pin.account]) }))
);

const heldPin = panels.at(-1)?.pins[0].x ?? 0;
// Ends behind the knuckles, where the hand covers it.
export const heldCable = `M${heldPin} ${panelBottom}C${heldPin} 236 ${jackX[corrected.to] - 60} 178 ${jackX[corrected.to] + 96} 232`;

export const pins = panels.flatMap((panel) => panel.pins.map((pin) => pin.x));
