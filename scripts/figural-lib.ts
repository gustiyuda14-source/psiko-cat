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
export type Pie = { idPrefix?: string; cx: number; cy: number; r: number; outer: (string | number)[]; inner?: (string | number)[]; center?: string | number; startArrow?: boolean; innerSize?: number };
let arrowId = 0;
export function pie({ idPrefix = "s2b-ah-", cx, cy, r, outer, inner, center, startArrow, innerSize }: Pie) {
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
    inner.forEach((t, i) => (s += label(at(mid(i), rIn * 0.58), t, innerSize ?? fs - 4)));
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

// ── tata letak besar (terbaca di HP) + gambar pembahasan, dipakai pkg 15 ────────
// Figur digambar dengan draw() lalu diskalakan (transform), jadi sig()/place() tetap berlaku.
// Gambar pembahasan: jawaban berbingkai hijau, anotasi merah; tanpa id (dirender bersama butir lain).
export const HL = "#1a7f37", RED = "#d32f2f";
export const textC = (x: number, y: number, t: string, size: number, fill: string, anchor = "middle") =>
  `<text x="${r1(x)}" y="${r1(y)}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="bold" text-anchor="${anchor}" fill="${fill}">${t}</text>`;
export const redText = (x: number, y: number, t: string, size = 24, anchor = "middle") => textC(x, y, t, size, RED, anchor);
export const redRing = (x: number, y: number, r: number, color = RED) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" fill="none" stroke="${color}" stroke-width="4"/>`;
/** Panah merah dari a ke b, kepala berupa poligon (tanpa marker/id). */
export function redArrow([x1, y1]: Pt, [x2, y2]: Pt, dash = false, color = RED) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = 16, w = 9, bx = x2 - h * Math.cos(a), by = y2 - h * Math.sin(a);
  return `<path d="M${r1(x1)} ${r1(y1)} L${r1(bx)} ${r1(by)}" stroke="${color}" stroke-width="4" fill="none"${dash ? ' stroke-dasharray="8 6"' : ""}/>` +
    `<polygon points="${r1(x2)},${r1(y2)} ${r1(bx + w * Math.sin(a))},${r1(by - w * Math.cos(a))} ${r1(bx - w * Math.sin(a))},${r1(by + w * Math.cos(a))}" fill="${color}"/>`;
}
export const drawS = (fig: Fig, cx: number, cy: number, size: number) =>
  `<g transform="translate(${r1(cx)} ${r1(cy)}) scale(${Math.round((size / BOX) * 1000) / 1000})">${draw(fig, 0, 0)}</g>`;
/** Kotak berukuran `size` berisi figur (koordinat BOX) atau "?"; hl = bingkai hijau. */
export const cellS = (f: Fig | null, cx: number, cy: number, size: number, hl = false) =>
  `<rect x="${r1(cx - size / 2)}" y="${r1(cy - size / 2)}" width="${size}" height="${size}" fill="white" stroke="${hl ? HL : INK}" stroke-width="${hl ? 8 : 3}"/>` +
  (f ? drawS(f, cx, cy, size) : text(cx, cy + size * 0.15, "?", Math.round(size * 0.42)));
export function optionsRowS(options: Fig[], top: number, o: { size?: number; hl?: number } = {}) {
  const size = o.size ?? 140, step = 160, left = (W - 4 * step) / 2, cy = top + size / 2;
  return {
    body: options.map((f, i) => cellS(f, left + i * step, cy, size, o.hl === i) + text(left + i * step, cy + size / 2 + 32, "abcde"[i], 28)).join(""),
    at: (i: number): Pt => [left + i * step, cy], size, bottom: cy + size / 2 + 46,
  };
}
export type Ann = (at: (r: number, c: number) => Pt, size: number) => string;
/** Grid figur besar (null = "?"), opsional 5 pilihan di bawah. Juga untuk analogi (1×4), soal rotasi (1×1), pembahasan. */
export function gridS(grid: (Fig | null)[][], options: Fig[] | null, o: { size?: number; gap?: number; hl?: [number, number]; ann?: Ann; top?: number; foot?: number } = {}) {
  const size = o.size ?? 150, step = size + (o.gap ?? 14), cols = grid[0].length;
  const left = (W - (cols - 1) * step) / 2, top = (o.top ?? 16) + size / 2;
  const at = (r: number, c: number): Pt => [left + c * step, top + r * step];
  let body = "";
  grid.forEach((row, r) => row.forEach((f, c) => (body += cellS(f, ...at(r, c), size, o.hl?.[0] === r && o.hl?.[1] === c))));
  if (o.ann) body += o.ann(at, size);
  let bottom = top + (grid.length - 1) * step + size / 2 + (o.foot ?? 16);
  if (options) { const op = optionsRowS(options, bottom + 24); body += op.body; bottom = op.bottom; }
  return svgWrap(Math.ceil(bottom), body);
}
/** Analogi besar A : B = C : ? (anotasi tambahan opsional). */
export const analogyS = (figs: (Fig | null)[], options: Fig[] | null, o: { hl?: boolean; ann?: Ann; foot?: number } = {}) =>
  gridS([figs], options, {
    gap: 50, hl: o.hl ? [0, 3] : undefined, foot: o.foot,
    ann: (at, s) => [":", "=", ":"].map((t, i) => text((at(0, i)[0] + at(0, i + 1)[0]) / 2, at(0, 0)[1] + 12, t, 40)).join("") + (o.ann?.(at, s) ?? ""),
  });
/** Koordinat label pie (sama dengan pie()): cincin luar, dalam, atau pusat. */
export function pieAt({ cx, cy, r, outer, inner, center }: Pie, ring: "outer" | "inner" | "center", i = 0): Pt {
  const n = outer.length, deg = ((-90 + (360 / n) * i) * Math.PI) / 180;
  const rr = ring === "center" ? 0 : ring === "inner" ? r * 0.5 * 0.58 : inner ? r * 0.76 : center !== undefined ? r * 0.66 : r * 0.62;
  return [r1(cx + rr * Math.cos(deg)), r1(cy + rr * Math.sin(deg))];
}
/** Titik figur (koordinat BOX) → koordinat SVG pada kotak berpusat `at` berukuran `size`. */
export const fp = ([x, y]: Pt, [cx, cy]: Pt, size: number): Pt => [cx + (x * size) / BOX, cy + (y * size) / BOX];
/** Baris keterangan merah di tengah, mulai dari y0. */
export const foot = (lines: string[], y0: number) => lines.map((t, i) => redText(W / 2, y0 + 34 * i, t, 25)).join("");
/** Satu titik (koordinat BOX) setelah cermin/putar yang sama dengan tf(). */
export const ptf = (p: Pt, deg: number, mirror = false): Pt => (tf([{ k: "circ", c: p, r: 1, fill: "b" }], deg, mirror)[0] as { c: Pt }).c;
/** Garis putus-putus (cermin/sumbu) dari a ke b. */
export const dashLine = ([x1, y1]: Pt, [x2, y2]: Pt, color = INK) =>
  `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${color}" stroke-width="3" stroke-dasharray="8 6"/>`;
