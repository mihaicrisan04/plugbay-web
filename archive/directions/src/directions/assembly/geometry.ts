// Geometry for the assembly drawing, in CSS pixels. HTML panels and SVG lines
// read the same numbers, so they cannot drift apart.

export const GRID = 40;
export const LINE_HEIGHT = 22; // one row of terminal output
export const TITLE_BAR = 26;

// The plate illustration (src/assets/directions/assembly/plate.webp), measured
// on the 249 x 934 source: where the sockets, the bore and the outline are.
const PLATE_SOURCE = { height: 934, width: 249 };
const PLATE_SOCKETS = { x: 91, ys: [294, 468, 642] };
const PLATE_BORE = { x: 99, y: 98 };
const PLATE_OUTLINE = [
  [249, 98],
  [13, 2],
  [0, 8],
  [0, 842],
  [237, 934],
  [249, 928],
];

export function plateAt(width: number) {
  const scale = width / PLATE_SOURCE.width;
  const round = (value: number) => Math.round(value * scale);
  return {
    bore: { x: round(PLATE_BORE.x), y: round(PLATE_BORE.y) + 0.5 },
    height: round(PLATE_SOURCE.height),
    outline: PLATE_OUTLINE.map(([x, y]) => [round(x), round(y)]),
    socketX: round(PLATE_SOCKETS.x),
    socketYs: PLATE_SOCKETS.ys.map(round),
    width,
  };
}

export type PlateGeometry = ReturnType<typeof plateAt>;

export interface AssemblyLayout {
  // The alternate branch plate waits behind the one on the axis.
  ghost: { x: number; y: number };
  // Where server names are lettered, left of the first plate.
  labelX: number;
  plate: PlateGeometry;
  plateTop: number;
  // How far each plate travels when the stack closes.
  press: number[];
  // Left edge of each plate. The branch plate is the third.
  stations: number[];
}

const CLOSED_GAP = 14;
const pressFor = (stations: number[], closedAt: number) =>
  stations.map(
    (station, index) =>
      closedAt - (stations.length - 1 - index) * CLOSED_GAP - station
  );

// ---- Wide: the drawing is the page. Everything sits on the 40px grid. ----

const widePlate = plateAt(80);
const WIDE_STATIONS = [80, 240, 400];
const WIDE_TERMINAL = { left: 560, top: 232 };
const widePlateTop = 632 - widePlate.height; // plates stand on a grid line

export const wide = {
  cardTop: 668,
  // Where the axis leaves the terminal for the next view.
  dropX: 640,
  grid: { bottom: 792, top: 192 },
  height: 828,
  layout: {
    ghost: { x: -34, y: -40 },
    labelX: 0,
    plate: widePlate,
    plateTop: widePlateTop,
    press: pressFor(WIDE_STATIONS, WIDE_TERMINAL.left - widePlate.width - 8),
    stations: WIDE_STATIONS,
  } satisfies AssemblyLayout,
  terminal: {
    ...WIDE_TERMINAL,
    bottom: 592,
    rowY: (row: number) =>
      WIDE_TERMINAL.top + TITLE_BAR + 12 + (row + 0.5) * LINE_HEIGHT,
  },
};

// ---- Narrow: the same assembly at phone size, wires dropping into the terminal ----

const narrowPlate = plateAt(60);
const NARROW_STATIONS = [66, 160, 254];

export const narrow = {
  // Wires turn down here, one lane each, and meet the terminal's top edge.
  busXs: [336, 328, 320],
  height: 268,
  layout: {
    ghost: { x: -22, y: -20 },
    labelX: 0,
    plate: narrowPlate,
    plateTop: 24,
    press: pressFor(NARROW_STATIONS, NARROW_STATIONS[2]),
    stations: NARROW_STATIONS,
  } satisfies AssemblyLayout,
  width: 342,
};

export const socketX = (layout: AssemblyLayout, station: number) =>
  layout.stations[station] + layout.plate.socketX;
export const socketY = (layout: AssemblyLayout, column: number) =>
  layout.plateTop + layout.plate.socketYs[column];
export const axisY = (layout: AssemblyLayout) =>
  layout.plateTop + layout.plate.bore.y;

// A wire from the branch plate to an output row: straight, one 45 degree kink, straight in.
export function wireToRow(
  fromX: number,
  fromY: number,
  toX: number,
  rowY: number
) {
  const rise = rowY - fromY;
  if (rise === 0) {
    return `M${fromX} ${fromY}H${toX}`;
  }
  const kinkEnd = toX - 10;
  const kinkStart = kinkEnd - Math.abs(rise);
  return `M${fromX} ${fromY}H${kinkStart}L${kinkEnd} ${rowY}H${toX}`;
}

// A wire from the branch plate to the terminal below it: across, one kink, down its lane.
export function wireToBus(
  fromX: number,
  fromY: number,
  busX: number,
  toY: number
) {
  const kink = 8;
  return `M${fromX} ${fromY}H${busX - kink}L${busX} ${fromY + kink}V${toY}`;
}
