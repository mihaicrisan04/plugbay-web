// Data and geometry for the Stack figure. What it shows comes from the page's
// model (src/lib/model.ts), which is where the files are parsed and merged; the
// numbers below only place it.
import {
  type ConfigFile,
  type DetailId,
  details,
  files,
  filesOnPath,
  servers,
} from "../../lib/model";

// ---- What the figure shows ----

export type SocketState = "on" | "off" | "open";

// A file's item number keys its plate to its row in the legend.
export const itemOf = (file: ConfigFile) => files.indexOf(file) + 1;

function socketsOf(file?: ConfigFile) {
  return servers.map((server) => {
    const setting = file?.settings.find((entry) => entry.server === server);
    if (!setting) {
      return { literal: null, state: "open" as SocketState };
    }
    return {
      literal: setting.literal,
      state: (setting.literal === "false" ? "off" : "on") as SocketState,
    };
  });
}

// One view per directory an agent starts in: the files on its path, and what
// the data says each server comes out as there.
export const views = details.map((detail) => ({
  directory: detail.directory,
  id: detail.id,
  letter: detail.letter,
  path: filesOnPath(detail.directory),
  result: servers.map((server) => {
    const pinned = detail.servers.find((name) => name.startsWith(`${server}:`));
    const disabled = detail.disabled.find((item) => item.server === server);
    if (pinned) {
      return { server, state: "on" as SocketState, text: pinned };
    }
    return {
      by: disabled?.by,
      server,
      state: (disabled ? "off" : "open") as SocketState,
      text: server,
    };
  }),
}));

export type View = (typeof views)[number];

// Files every view passes are the trunk; the one file only it passes is its branch.
const trunkFiles = files.filter((file) =>
  views.every((view) => view.path.includes(file))
);

export const plates = [
  { branch: null, file: null, label: "/", sockets: socketsOf(), station: 0 },
  ...trunkFiles.map((file, index) => ({
    branch: null,
    file,
    label: file.directory,
    sockets: socketsOf(file),
    station: index + 1,
  })),
  ...views.map((view) => {
    const file = view.path.find((candidate) => !trunkFiles.includes(candidate));
    return {
      branch: view.id as DetailId | null,
      file: file ?? null,
      label: file?.directory ?? view.directory,
      sockets: socketsOf(file),
      station: trunkFiles.length + 1,
    };
  }),
];

export type Plate = (typeof plates)[number];

// Is the cable on this lane live after the given station, for a view?
export function liveAfter(view: View, lane: number, station: number) {
  const passed = plates.filter(
    (plate) =>
      plate.station <= station &&
      (plate.branch === null || plate.branch === view.id)
  );
  const last = passed.findLast((plate) => plate.sockets[lane].state !== "open");
  return last?.sockets[lane].state === "on";
}

// ---- Where it goes ----

// The plate artwork (src/assets/figures/stack/plate.png), measured in the
// units of its 249 x 934 drawing: sockets, bore and outline.
const ART = { height: 934, width: 249 };
const ART_SOCKETS = { x: 91, ys: [294, 468, 642] };
const ART_BORE = { x: 99, y: 98 };
const ART_OUTLINE = [
  [249, 98],
  [13, 2],
  [0, 8],
  [0, 842],
  [237, 934],
  [249, 928],
];

function plateAt(width: number) {
  const scale = width / ART.width;
  const at = (value: number) => Math.round(value * scale);
  return {
    boreX: at(ART_BORE.x),
    boreY: at(ART_BORE.y) + 0.5,
    height: at(ART.height),
    // The silhouette twice: as a CSS polygon, and as a path on the plate's own box.
    outline: ART_OUTLINE.map(
      ([x, y]) => `${(x / ART.width) * 100}% ${(y / ART.height) * 100}%`
    ).join(","),
    outlinePath: `M${ART_OUTLINE.map(([x, y]) => `${(x * scale).toFixed(1)} ${(y * scale).toFixed(1)}`).join("L")}Z`,
    socketX: at(ART_SOCKETS.x),
    socketYs: ART_SOCKETS.ys.map(at),
    width,
  };
}

interface LayoutInput {
  // How far the alternate branch plate sits behind the one on the axis.
  ghost: { x: number; y: number };
  height: number;
  plateTop: number;
  plateWidth: number;
  result: { headTop: number; left: number; rowHeight: number; width: number };
  stations: number[];
  width: number;
}

function layoutOf(input: LayoutInput) {
  const plate = plateAt(input.plateWidth);
  const laneYs = plate.socketYs.map((y) => input.plateTop + y);
  // Closed, the stack sits against the result with a sliver between plates.
  const closedLast = input.result.left - plate.width - 8;
  const press = input.stations.map(
    (station, index) =>
      closedLast - (input.stations.length - 1 - index) * 14 - station
  );
  return {
    ...input,
    axisY: input.plateTop + plate.boreY,
    laneYs,
    plate,
    press,
    socketXs: input.stations.map((station) => station + plate.socketX),
  };
}

export type Layout = ReturnType<typeof layoutOf>;

// From 640px the figure is drawn in units that are 1 CSS pixel at 720px.
export const wide = layoutOf({
  ghost: { x: -24, y: -22 },
  height: 330,
  plateTop: 48,
  plateWidth: 60,
  result: { headTop: 60, left: 548, rowHeight: 42, width: 156 },
  stations: [96, 244, 392],
  width: 718,
});

// Below that it is its own drawing, in units of 1/340 of the figure's width.
export const narrow = layoutOf({
  ghost: { x: -16, y: -14 },
  height: 236,
  plateTop: 22,
  plateWidth: 48,
  result: { headTop: 34, left: 210, rowHeight: 33, width: 124 },
  stations: [8, 77, 146],
  width: 340,
});

// Both drawings, as the CSS variables the stylesheet sizes itself from.
const sizeVars = (prefix: string, layout: Layout) => [
  `--${prefix}-w:${layout.width}`,
  `--${prefix}-h:${layout.height}`,
  `--${prefix}-plate-w:${layout.plate.width}`,
  `--${prefix}-plate-h:${layout.plate.height}`,
  `--${prefix}-ghost-x:${layout.ghost.x}`,
  `--${prefix}-ghost-y:${layout.ghost.y}`,
];

export const layoutStyle = [
  ...sizeVars("n", narrow),
  ...sizeVars("w", wide),
  `--lanes:${servers.length}`,
].join(";");
