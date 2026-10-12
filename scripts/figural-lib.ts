import assert from "node:assert/strict";

// Primitif figural bersama (dipindah dari generate-kecerdasan-figural-s2.ts tanpa perubahan
// keluaran). Figur dibangun dari koordinat eksplisit, rotasi/cermin dihitung di sini, jadi
// string SVG yang sama = gambar yang sama (sig).
export const INK = "#111";
export const W = 850;
export const BOX = 96;
export const KEYS = ["A", "B", "C", "D", "E"] as const;
export type Key = (typeof KEYS)[number];

// ── primitif + transformasi ──────────────────────────────────────────────────
export type Pt = [number, number];
export type Fill = "b" | "w";
export type Prim =
  | { k: "poly"; pts: Pt[]; fill: Fill }
  | { k: "circ"; c: Pt; r: number; fill: Fill }
  | { k: "line"; a: Pt; b: Pt; w?: number };
export type Fig = Prim[];

export const r1 = (n: number) => Math.round(n * 10) / 10 || 0;
/** Cermin terhadap sumbu vertikal (opsional), lalu putar searah jarum jam `deg`. */
export function tf(fig: Fig, deg: number, mirror = false): Fig {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  const p = ([x, y]: Pt): Pt => {
    const mx = mirror ? -x : x;
    return [r1(mx * c - y * s), r1(mx * s + y * c)];
  };
  return fig.map((q) =>
    q.k === "poly" ? { ...q, pts: q.pts.map(p) } : q.k === "circ" ? { ...q, c: p(q.c) } : { ...q, a: p(q.a), b: p(q.b) },
  );
}
export const fillOf = (f: Fill) => (f === "b" ? INK : "white");
export function draw(fig: Fig, cx: number, cy: number) {
  return fig
    .map((q) => {
      if (q.k === "poly") return `<polygon points="${q.pts.map(([x, y]) => `${r1(cx + x)},${r1(cy + y)}`).join(" ")}" fill="${fillOf(q.fill)}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
      if (q.k === "circ") return `<circle cx="${r1(cx + q.c[0])}" cy="${r1(cy + q.c[1])}" r="${q.r}" fill="${fillOf(q.fill)}" stroke="${INK}" stroke-width="2.5"/>`;
      return `<line x1="${r1(cx + q.a[0])}" y1="${r1(cy + q.a[1])}" x2="${r1(cx + q.b[0])}" y2="${r1(cy + q.b[1])}" stroke="${INK}" stroke-width="${q.w ?? 4}" stroke-linecap="round"/>`;
    })
    .join("");
}
/** Tanda geometris kanonik: sama ⇔ gambar sama. */
export const sig = (fig: Fig) => draw(fig, 0, 0).split("/>").sort().join("/>");

export const regular = (n: number, r: number, rot = 0): Pt[] =>
  Array.from({ length: n }, (_, i) => {
    const a = ((-90 + rot + (360 * i) / n) * Math.PI) / 180;
    return [r1(r * Math.cos(a)), r1(r * Math.sin(a))];
  });
export const shape = (name: "seg3" | "seg4" | "seg6" | "lingkaran", r: number, fill: Fill): Prim =>
  name === "lingkaran"
    ? { k: "circ", c: [0, 0], r, fill }
    : { k: "poly", pts: regular(name === "seg3" ? 3 : name === "seg4" ? 4 : 6, r, name === "seg4" ? 45 : 0), fill };

// ── tata letak ───────────────────────────────────────────────────────────────
export const box = (cx: number, cy: number) => `<rect x="${cx - BOX / 2}" y="${cy - BOX / 2}" width="${BOX}" height="${BOX}" fill="white" stroke="${INK}" stroke-width="3"/>`;
export const text = (x: number, y: number, t: string, size = 22) =>
  `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="bold" text-anchor="middle" fill="${INK}">${t}</text>`;
export const qmark = (cx: number, cy: number) => text(cx, cy + 14, "?", 40);
export const svgWrap = (h: number, body: string) =>
  `<svg viewBox="0 0 ${W} ${h}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="white"/>${body}</svg>`;

export function optionsRow(options: Fig[], top: number) {
  const step = 160, left = (W - 4 * step) / 2, cy = top + BOX / 2;
  return {
    body: options.map((f, i) => box(left + i * step, cy) + draw(f, left + i * step, cy) + text(left + i * step, cy + BOX / 2 + 28, "abcde"[i])).join(""),
    bottom: cy + BOX / 2 + 40,
  };
}
/** Pola: grid (null = "?") di atas, 5 pilihan di bawah. */
export function gridItem(grid: (Fig | null)[][], options: Fig[]) {
  const rows = grid.length, cols = grid[0].length, step = BOX + 12;
  const left = (W - (cols - 1) * step) / 2, top = 20 + BOX / 2;
  let body = "";
  grid.forEach((row, r) => row.forEach((f, c) => {
    const cx = left + c * step, cy = top + r * step;
    body += box(cx, cy) + (f ? draw(f, cx, cy) : qmark(cx, cy));
  }));
  const o = optionsRow(options, top + (rows - 1) * step + BOX / 2 + 34);
  return svgWrap(o.bottom, body + o.body);
}
/** Analogi A : B = C : ? */
export function analogyItem([a, b, c]: Fig[], options: Fig[]) {
  const cy = 20 + BOX / 2, xs = [155, 295, 555, 695];
  const body = [a, b, c, null].map((f, i) => box(xs[i], cy) + (f ? draw(f, xs[i], cy) : qmark(xs[i], cy))).join("") +
    text(225, cy + 8, ":", 34) + text(425, cy + 10, "=", 34) + text(625, cy + 8, ":", 34);
  const o = optionsRow(options, cy + BOX / 2 + 34);
  return svgWrap(o.bottom, body + o.body);
}
/** Satu gambar soal (opsional garis cermin putus-putus di kanannya), lalu pilihan. */
export function stimulusItem(fig: Fig, mirrorLine: boolean, options: Fig[]) {
  const cx = W / 2, cy = 20 + BOX / 2;
  const line = mirrorLine ? `<line x1="${cx + BOX / 2 + 14}" y1="${cy - BOX / 2 - 6}" x2="${cx + BOX / 2 + 14}" y2="${cy + BOX / 2 + 6}" stroke="${INK}" stroke-width="3" stroke-dasharray="8 6"/>` : "";
  const o = optionsRow(options, cy + BOX / 2 + 34);
  return svgWrap(o.bottom, box(cx, cy) + draw(fig, cx, cy) + line + o.body);
}


/** Taruh jawaban di posisi `key`, distraktor mengisi sisanya berurutan. */
export function place(answer: Fig, distractors: Fig[], key: Key): Fig[] {
  const out = [...distractors];
  out.splice(KEYS.indexOf(key), 0, answer);
  assert.equal(out.length, 5);
  assert.equal(new Set(out.map(sig)).size, 5, "opsi kembar secara geometris");
  return out;
}

export const BUNDAR = "Tentukan angka yang tepat untuk menggantikan tanda tanya (?) pada gambar.";
export const BUNDAR_HURUF = "Huruf mewakili urutannya dalam alfabet (A = 1, B = 2, C = 3, dan seterusnya). Tentukan angka yang tepat untuk menggantikan tanda tanya (?) pada gambar.";
export type Pie = { idPrefix?: string; cx: number; cy: number; r: number; outer: (string | number)[]; inner?: (string | number)[]; center?: string | number; startArrow?: boolean };
let arrowId = 0;
export function pie({ idPrefix = "s2b-ah-", cx, cy, r, outer, inner, center, startArrow }: Pie) {
  const n = outer.length, at = (deg: number, rr: number): Pt => [r1(cx + rr * Math.cos((deg * Math.PI) / 180)), r1(cy + rr * Math.sin((deg * Math.PI) / 180))];
  const mid = (i: number) => -90 + (360 / n) * i;
  const fs = r > 90 ? 26 : 22;
  let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="white" stroke="${INK}" stroke-width="3"/>`;
  const rIn = inner ? r * 0.5 : center !== undefined ? r * 0.3 : 0;
  for (let i = 0; i < n; i++) {
    const [x1, y1] = at(mid(i) - 180 / n, rIn), [x2, y2] = at(mid(i) - 180 / n, r);
    s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${INK}" stroke-width="2.5"/>`;
  }
  if (rIn) s += `<circle cx="${cx}" cy="${cy}" r="${r1(rIn)}" fill="white" stroke="${INK}" stroke-width="2.5"/>`;
  const label = ([x, y]: Pt, t: string | number, size = fs) =>
    `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="bold" text-anchor="middle" dominant-baseline="central" fill="${INK}">${t}</text>`;
  outer.forEach((t, i) => (s += label(at(mid(i), inner ? r * 0.76 : rIn ? r * 0.66 : r * 0.62), t)));
  if (inner) {
    for (let i = 0; i < n; i++) {
      const [x2, y2] = at(mid(i) - 180 / n, rIn);
      s += `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="${INK}" stroke-width="2"/>`;
    }
    inner.forEach((t, i) => (s += label(at(mid(i), rIn * 0.58), t, fs - 4)));
  } else if (center !== undefined) s += label([cx, cy], center);
  if (startArrow) {
    const id = `${idPrefix}${++arrowId}`;
    const [ax, ay] = at(-90 - 180 / n + 4, r + 14), [bx, by] = at(-90 + 180 / n - 4, r + 14);
    s += `<defs><marker id="${id}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="${INK}"/></marker></defs>` +
      `<path d="M${ax} ${ay} A${r + 14} ${r + 14} 0 0 1 ${bx} ${by}" fill="none" stroke="${INK}" stroke-width="3" marker-end="url(#${id})"/>`;
  }
  return s;
}
export const pieSvg = (pies: Pie[], h = 300) => svgWrap(h, pies.map(pie).join(""));
