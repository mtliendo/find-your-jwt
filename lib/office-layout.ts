export const OFFICE = {
  width: 2240,
  height: 1600,
  wall: 40,
  spawn: { x: 1120, y: 1380 },
} as const;

export type Rect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Point = { x: number; y: number };

const DESK_COLS = [220, 620, 1420, 1820];
const DESK_ROWS = [200, 500, 800, 1100];

export function getDesks(): Rect[] {
  return DESK_ROWS.flatMap((y) =>
    DESK_COLS.map((x) => ({ x, y, w: 176, h: 82 })),
  );
}

export function getChairs(): Rect[] {
  return getDesks().map((desk) => ({
    x: desk.x + 54,
    y: desk.y + 86,
    w: 68,
    h: 42,
  }));
}

export function getCabinets(): Rect[] {
  const cabinets: Rect[] = [];
  for (let i = 0; i < 8; i += 1) {
    cabinets.push({ x: 80 + i * 270, y: 48, w: 92, h: 64 });
  }
  return cabinets;
}

export function getConferenceTable(): Rect {
  return { x: 960, y: 560, w: 320, h: 168 };
}

export function getPlants(): Point[] {
  return [
    { x: 90, y: 1520 },
    { x: 2150, y: 1520 },
    { x: 90, y: 140 },
    { x: 2150, y: 140 },
    { x: 1100, y: 120 },
    { x: 1280, y: 1200 },
  ];
}

export function getLamps(): Point[] {
  return [
    { x: 400, y: 360 },
    { x: 1840, y: 360 },
    { x: 400, y: 980 },
    { x: 1840, y: 980 },
    { x: 1120, y: 640 },
    { x: 1120, y: 1180 },
  ];
}

export function getWalls(): Rect[] {
  const { width, height, wall } = OFFICE;
  return [
    { x: 0, y: 0, w: width, h: wall },
    { x: 0, y: height - wall, w: width, h: wall },
    { x: 0, y: 0, w: wall, h: height },
    { x: width - wall, y: 0, w: wall, h: height },
  ];
}

function inflate(rect: Rect, pad: number): Rect {
  return {
    x: rect.x - pad,
    y: rect.y - pad,
    w: rect.w + pad * 2,
    h: rect.h + pad * 2,
  };
}

function contains(rect: Rect, point: Point, pad = 0) {
  const r = inflate(rect, pad);
  return (
    point.x >= r.x &&
    point.x <= r.x + r.w &&
    point.y >= r.y &&
    point.y <= r.y + r.h
  );
}

export function getCollisionRects(): Rect[] {
  return [
    ...getWalls(),
    ...getDesks(),
    ...getChairs(),
    ...getCabinets(),
    getConferenceTable(),
  ];
}

export function tokenAnchors(): Point[] {
  const spots: Point[] = [];

  for (const desk of getDesks()) {
    spots.push(
      { x: desk.x + 28, y: desk.y + 20 },
      { x: desk.x + 78, y: desk.y + 24 },
      { x: desk.x + 132, y: desk.y + 18 },
      { x: desk.x + 48, y: desk.y + 52 },
      { x: desk.x + 118, y: desk.y + 50 },
    );
  }

  const table = getConferenceTable();
  spots.push(
    { x: table.x + 36, y: table.y + 36 },
    { x: table.x + 96, y: table.y + 48 },
    { x: table.x + 160, y: table.y + 32 },
    { x: table.x + 224, y: table.y + 50 },
    { x: table.x + 280, y: table.y + 38 },
    { x: table.x + 70, y: table.y + 112 },
    { x: table.x + 180, y: table.y + 120 },
    { x: table.x + 250, y: table.y + 108 },
  );

  const blocked = [
    ...getCollisionRects(),
    { x: OFFICE.spawn.x - 80, y: OFFICE.spawn.y - 80, w: 160, h: 160 },
  ];

  for (let x = 90; x < OFFICE.width - 90; x += 72) {
    for (let y = 140; y < OFFICE.height - 90; y += 72) {
      const point = { x, y };
      if (blocked.some((rect) => contains(rect, point, 18))) continue;
      spots.push(point);
    }
  }

  return spots;
}

export function shuffleInPlace<T>(items: T[]) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = items[i];
    const swap = items[j];
    if (current === undefined || swap === undefined) continue;
    items[i] = swap;
    items[j] = current;
  }
  return items;
}

export function placeOnAnchors<T extends { id: string; raw: string }>(
  tokens: T[],
): Array<T & Point> {
  const anchors = shuffleInPlace(tokenAnchors());
  if (anchors.length < tokens.length) {
    throw new Error("Office layout does not have enough token anchors.");
  }

  return tokens.map((token, index) => {
    const point = anchors[index];
    if (!point) {
      throw new Error("Missing token anchor.");
    }
    return { ...token, x: point.x, y: point.y };
  });
}
