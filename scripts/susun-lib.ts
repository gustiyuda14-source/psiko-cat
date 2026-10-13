// Potongan susun gambar bersama (dipindah dari generate-kecerdasan-susun-s2.ts tanpa perubahan keluaran):
// pemandangan siluet 600×190 dipotong tegak bergelombang, potongan diacak menurut `order`.
export const enDash = (parts: number[]) => parts.join(" – ");
/** Urutan label potongan (posisi tampil) dari kiri ke kanan gambar utuh. */
export const answerFor = (order: number[]) => Array.from({ length: order.length }, (_, sourceIndex) => order.indexOf(sourceIndex + 1) + 1);

// The small separation makes each organic cut readable without detached fragments.
export function stripClip(prefix: string, index: number, left: number, right: number, height: number, last: boolean, gap = 1.5) {
  const l = left + (index === 0 ? 0 : gap);
  const r = right - (last ? 0 : gap);
  return `<clipPath id="${prefix}clip${index + 1}"><path d="M ${l} 0 H ${r}
    C ${r + 6} 24 ${r - 8} 47 ${r + 2} 68 C ${r + 9} 92 ${r - 6} 112 ${r + 4} 137 C ${r + 7} 156 ${r - 4} 175 ${r} ${height}
    H ${l} C ${l - 4} 175 ${l + 7} 156 ${l + 4} 137 C ${l - 6} 112 ${l + 9} 92 ${l + 2} 68 C ${l - 8} 47 ${l + 6} 24 ${l} 0 Z"/></clipPath>`;
}

export function verticalPositions(count: number) {
  const start = count === 4 ? 30 : count === 5 ? 25 : 15;
  const step = count === 4 ? 200 : count === 5 ? 165 : 138;
  return Array.from({ length: count }, (_, index) => ({ x: start + index * step, y: 22 }));
}

export function verticalPuzzleSvg(prefix: string, puzzle: { pieces: number; order: number[]; scene: string }) {
  const sourceWidth = 600;
  const cuts = Array.from({ length: puzzle.pieces + 1 }, (_, index) => index * sourceWidth / puzzle.pieces);
  const clips = Array.from({ length: puzzle.pieces }, (_, index) => stripClip(prefix, index, cuts[index], cuts[index + 1], 190, index === puzzle.pieces - 1));
  const pieces = puzzle.order.map((sourcePiece, slot) => {
    const sourceIndex = sourcePiece - 1;
    const { x, y } = verticalPositions(puzzle.pieces)[slot];
    const origin = cuts[sourceIndex];
    const pieceWidth = cuts[sourceIndex + 1] - origin;
    return `<g transform="translate(${x - origin} ${y})" clip-path="url(#${prefix}clip${sourcePiece})"><use href="#${prefix}scene"/></g>` +
      `<text x="${x + pieceWidth / 2}" y="245" fill="#111" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="middle">${slot + 1}</text>`;
  }).join("");
  return `<svg viewBox="0 0 850 300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="white"/><defs>${clips.join("")}<g id="${prefix}scene" fill="#111">${puzzle.scene}</g></defs>${pieces}</svg>`;
}

type Point = [number, number];
type Edge = { points: Point[]; owners: number[] };
export type CutLayout = { polygons: Point[][]; edges: Edge[]; rows: 1 | 2 };
const cutPath = (points: Point[], close = false) => points.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ") + (close ? " Z" : "");

/** Each shared edge is stored once; neighbouring cells traverse it in opposite directions. */
export function cutLayout(pieces: number): CutLayout {
  if (pieces !== 5 && pieces !== 6) throw new Error("Potongan baru harus 5 atau 6");
  const edges: Edge[] = [], cells: { edge: number; reverse: boolean }[][] = [];
  const add = (points: Point[]) => (edges.push({ points, owners: [] }), edges.length - 1);
  const cell = (refs: [number, boolean][]) => {
    const owner = cells.length + 1;
    cells.push(refs.map(([edge, reverse]) => { edges[edge].owners.push(owner); return { edge, reverse }; }));
  };
  if (pieces === 5) {
    const xs = [0, 90, 210, 320, 455, 600];
    const profiles: Point[][] = [
      [[90, 0], [104, 37], [82, 86], [101, 142], [90, 190]],
      [[210, 0], [222, 49], [199, 94], [225, 132], [210, 190]],
      [[320, 0], [329, 32], [305, 98], [334, 153], [320, 190]],
      [[455, 0], [473, 55], [448, 114], [463, 159], [455, 190]],
    ];
    const sides = xs.map((x, i) => add(i === 0 || i === 5 ? [[x, 0], [x, 190]] : profiles[i - 1]));
    for (let i = 0; i < 5; i++) cell([[add([[xs[i], 0], [xs[i + 1], 0]]), false], [sides[i + 1], false],
      [add([[xs[i], 190], [xs[i + 1], 190]]), true], [sides[i], true]]);
  } else {
    // Staggered junctions share the same horizontal chain, including the short overlaps.
    const h: Point[][] = [
      [[0, 96], [38, 85], [82, 104], [124, 89], [153, 108], [180, 96]],
      [[180, 96], [198, 109], [215, 106]],
      [[215, 106], [253, 91], [298, 107], [349, 84], [390, 96]],
      [[390, 96], [407, 103], [430, 106]],
      [[430, 106], [468, 90], [511, 112], [556, 87], [600, 96]],
    ];
    const middle = h.map(add);
    const topProfiles: Point[][] = [
      [[180, 0], [193, 23], [170, 48], [190, 77], [180, 96]],
      [[390, 0], [400, 31], [376, 58], [406, 79], [390, 96]],
    ];
    const bottomProfiles: Point[][] = [
      [[215, 106], [231, 123], [207, 148], [223, 176], [215, 190]],
      [[430, 106], [441, 134], [413, 157], [447, 173], [430, 190]],
    ];
    const top = [0, 180, 390, 600].map((x, i) => add(i === 0 || i === 3 ? [[x, 0], [x, 96]] : topProfiles[i - 1]));
    const bottom = [0, 215, 430, 600].map((x, i) => add(i === 0 || i === 3 ? [[x, 96], [x, 190]] : bottomProfiles[i - 1]));
    const topGroups = [[0], [1, 2], [3, 4]], bottomGroups = [[0, 1], [2, 3], [4]];
    for (let i = 0; i < 3; i++) cell([[add([[edges[top[i]].points[0][0], 0], [edges[top[i + 1]].points[0][0], 0]]), false],
      [top[i + 1], false], ...topGroups[i].slice().reverse().map((j): [number, boolean] => [middle[j], true]), [top[i], true]]);
    for (let i = 0; i < 3; i++) cell([...bottomGroups[i].map((j): [number, boolean] => [middle[j], false]), [bottom[i + 1], false],
      [add([[edges[bottom[i]].points.at(-1)![0], 190], [edges[bottom[i + 1]].points.at(-1)![0], 190]]), true], [bottom[i], true]]);
  }
  const polygons = cells.map((refs) => {
    const polygon: Point[] = [];
    for (const { edge, reverse } of refs) {
      const points = reverse ? edges[edge].points.slice().reverse() : edges[edge].points;
      if (polygon.length && polygon.at(-1)!.some((v, i) => v !== points[0][i])) throw new Error("Tepi tidak bertemu");
      polygon.push(...(polygon.length ? points.slice(1) : points));
    }
    if (polygon[0].some((v, i) => v !== polygon.at(-1)![i])) throw new Error("Potongan tidak tertutup");
    return polygon.slice(0, -1);
  });
  return { polygons, edges, rows: pieces === 5 ? 1 : 2 };
}

export function cutBounds(points: Point[]) {
  const xs = points.map(([x]) => x), ys = points.map(([, y]) => y);
  const x = Math.min(...xs), y = Math.min(...ys);
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
}

export function cutArea(points: Point[]) {
  return Math.abs(points.reduce((sum, [x, y], i) => {
    const [nx, ny] = points[(i + 1) % points.length];
    return sum + x * ny - nx * y;
  }, 0)) / 2;
}

export function cutPuzzleSvg(prefix: string, puzzle: { pieces: number; order: number[]; scene: string }) {
  // Three display columns keep the five full-height pieces legible on a 360px screen.
  const layout = cutLayout(puzzle.pieces), columns = 3, displayRows = 2;
  const boxes = layout.polygons.map(cutBounds), cellWidth = Math.max(...boxes.map((b) => b.width)) + 24;
  const cellHeight = Math.max(...boxes.map((b) => b.height)) + 44;
  const clips = layout.polygons.map((points, i) => `<clipPath id="${prefix}clip${i + 1}"><path d="${cutPath(points, true)}"/></clipPath>`).join("");
  const pieces = puzzle.order.map((source, slot) => {
    const b = boxes[source - 1], x = slot % columns * cellWidth + (cellWidth - b.width) / 2;
    const y = Math.floor(slot / columns) * cellHeight + 10;
    return `<g transform="translate(${x - b.x} ${y - b.y})" clip-path="url(#${prefix}clip${source})"><use href="#${prefix}scene"/></g>` +
      `<text x="${slot % columns * cellWidth + cellWidth / 2}" y="${Math.floor(slot / columns) * cellHeight + cellHeight - 10}" fill="#111" font-family="sans-serif" font-size="24" font-weight="bold" text-anchor="middle">${slot + 1}</text>`;
  }).join("");
  return `<svg viewBox="0 0 ${columns * cellWidth} ${displayRows * cellHeight}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="white"/><defs>${clips}<g id="${prefix}scene" fill="#111">${puzzle.scene}</g></defs>${pieces}</svg>`;
}

/** Intact source, actual shared cuts, and displayed labels at polygon centroids; no ids. */
export function cutPembahasanSvg(puzzle: { pieces: number; order: number[]; scene: string }) {
  const layout = cutLayout(puzzle.pieces), ans = answerFor(puzzle.order);
  const cuts = layout.edges.filter((e) => e.owners.length === 2).map((e) => `<path d="${cutPath(e.points)}" fill="none" stroke="#d32f2f" stroke-width="2" stroke-dasharray="7 5"/>`).join("");
  const labels = layout.polygons.map((points, i) => {
    let area = 0, cx = 0, cy = 0;
    points.forEach(([x, y], j) => {
      const [nx, ny] = points[(j + 1) % points.length], cross = x * ny - nx * y;
      area += cross; cx += (x + nx) * cross; cy += (y + ny) * cross;
    });
    cx /= 3 * area; cy /= 3 * area;
    return `<circle cx="${cx}" cy="${cy}" r="12" fill="#1a7f37"/><text x="${cx}" y="${cy + 6}" fill="white" font-family="sans-serif" font-size="17" font-weight="bold" text-anchor="middle">${ans[i]}</text>`;
  }).join("");
  return `<svg viewBox="0 0 600 190" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="white"/><g fill="#111">${puzzle.scene}</g>${cuts}${labels}</svg>`;
}

/** Translation-invariant signature, also canonical when an edge is traversed backwards. */
export function cutProfile(points: Point[]) {
  const signature = (ps: Point[]) => JSON.stringify(ps.map(([x, y]) => [x - ps[0][0], y - ps[0][1]]));
  return [signature(points), signature(points.slice().reverse())].sort()[0];
}
