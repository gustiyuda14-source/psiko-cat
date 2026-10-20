import assert from "node:assert/strict";
import { type Fig, type Fill, type Key, type Prim, type Pt, INK, KEYS, RED, cellS, place, r1, regular, text, textC } from "./figural-lib";

// K12 batch spasial (batch 26): tata letak, model sel bersama (matriks + analogi + deret bangun), penyusun pembahasan.
// Gaya disetujui pemilik dari prototipe 2026-10-20 (G-5): hitam-putih, jawaban berbingkai hijau, keterangan merah.

export type Draft = { sub_type: string; tier: 2 | 3; instruksi: string; stem: string; key: Key; stemSvg: string; opts: Fig[]; pembahasan: string; pbhSvg: string };
export const POLA = { instruksi: "Perhatikan pola gambar pada matriks berikut.", stem: "Gambar manakah pengganti tanda tanya?" };
export const SERI = { instruksi: "Perhatikan urutan gambar berikut.", stem: "Gambar manakah pengganti tanda tanya?" };
export const ANALOGI = { instruksi: "Perhatikan hubungan gambar berikut.", stem: "Gambar manakah pengganti tanda tanya?" };

export const svg = (w: number, h: number, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r1(w)} ${r1(h)}" width="${r1(w)}" height="${r1(h)}" role="img"><rect width="100%" height="100%" fill="#fff"/>${body}</svg>`;
export const optSvg = (f: Fig) => svg(100, 100, cellS(f, 50, 50, 97)).replace('width="100" height="100"', 'width="220" height="220"');

type Cell = Fig | null;
export type At = (r: number, c: number) => Pt;
/** Grid sel figur, viewBox pas isi. seps = tanda di celah antarkolom (analogi); extra = gambar tambahan di bawah grid. */
export function layout(rows: Cell[][], o: { size?: number; gap?: number; seps?: string[]; hl?: [number, number]; ann?: (at: At, s: number) => string; foot?: string[]; minW?: number; extraH?: number; extra?: (y0: number, w: number) => string } = {}) {
  const s = o.size ?? 110, gap = o.gap ?? 10, cols = rows[0].length, step = s + gap;
  const gw = cols * s + (cols - 1) * gap, w = Math.max(gw + 8, o.minW ?? 0), left = (w - gw) / 2 + s / 2;
  const at: At = (r, c) => [left + c * step, 4 + s / 2 + r * step];
  let body = "";
  rows.forEach((row, r) => row.forEach((f, c) => (body += cellS(f, ...at(r, c), s, o.hl?.[0] === r && o.hl?.[1] === c))));
  o.seps?.forEach((t, i) => (body += text((at(0, i)[0] + at(0, i + 1)[0]) / 2, at(0, 0)[1] + 12, t, 34)));
  if (o.ann) body += o.ann(at, s);
  let h = 4 + rows.length * step - gap + 4;
  if (o.extra) { body += o.extra(h, w); h += o.extraH ?? 0; }
  (o.foot ?? []).forEach((t, i) => (body += textC(w / 2, h + 28 + i * 28, t, 20, RED)));
  if (o.foot?.length) h += 16 + o.foot.length * 28;
  return svg(w, h, body);
}
/** Panah kecil "›" merah di antara kolom (pembahasan matriks). */
export const colMarks = (at: At) =>
  [0, 1, 2].map((r) => [0, 1].map((c) => { const [x1, y] = at(r, c), [x2] = at(r, c + 1); return textC((x1 + x2) / 2, y + 7, "›", 22, RED); }).join("")).join("");

// ── model sel: bingkai + isi tengah + titik pojok + deret titik bawah ─────────
// s: 0 = lingkaran, 3–8 = segi-n. Isi tengah memakai SATU dari: g (garis), w (segitiga baling), t (bangun kecil), a (jarum).
export type MC = { s: number; f?: Fill; t?: number; tf?: Fill; a?: number; g?: string[]; w?: number[]; k?: number; n?: number };
export const SHAPE_NAME: Record<number, string> = { 0: "lingkaran", 3: "segitiga", 4: "persegi", 5: "segi lima", 6: "segi enam", 7: "segi tujuh", 8: "segi delapan" };
export const CORNER_NAME = ["kiri atas", "kanan atas", "kanan bawah", "kiri bawah"];
export const DIR_NAME = ["atas", "kanan atas", "kanan", "kanan bawah", "bawah", "kiri bawah", "kiri", "kiri atas"];
export const WEDGE_NAME = ["atas", "kanan", "bawah", "kiri"];
export const LINE_NAME: Record<string, string> = { H: "garis datar", V: "garis tegak", "/": "garis /", "\\": "garis \\" };
export const COLOR = (f: Fill | undefined) => (f === "b" ? "hitam" : "putih");
export const inv = (f: Fill): Fill => (f === "b" ? "w" : "b");

const SEG: Record<string, [Pt, Pt]> = { H: [[-20, 0], [20, 0]], V: [[0, -20], [0, 20]], "/": [[-14, 14], [14, -14]], "\\": [[-14, -14], [14, 14]] };
const WEDGE: Pt[][] = [[[-20, -20], [20, -20], [0, 0]], [[20, -20], [20, 20], [0, 0]], [[20, 20], [-20, 20], [0, 0]], [[-20, 20], [-20, -20], [0, 0]]];
const NEEDLE: Pt[] = [[0, -21], [10, -7], [4, -7], [4, 11], [-4, 11], [-4, -7], [-10, -7]]; // lebar supaya jarum putih di bingkai hitam tetap tebal
export const CORNER: Pt[] = [[-40, -40], [40, -40], [40, 40], [-40, 40]];
const rot = (p: Pt, deg: number): Pt => { const a = (deg * Math.PI) / 180; return [r1(p[0] * Math.cos(a) - p[1] * Math.sin(a)), r1(p[0] * Math.sin(a) + p[1] * Math.cos(a))]; };
const outerPts = (s: number): Pt[] => (s === 4 ? regular(4, 42, 45) : regular(s, 37));
const innerPts = (t: number): Pt[] => (t === 4 ? regular(4, 15, 45) : regular(t, 14));
const pip = (P: Pt[], [x, y]: Pt) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
/** Titik `p` di dalam bingkai dengan jarak aman `pad` (bingkai diperkecil sedikit lalu dicek). */
const inside = (s: number, p: Pt, pad = 3) => (s === 0 ? Math.hypot(...p) <= 34 - pad : pip(outerPts(s).map(([x, y]): Pt => [x * (1 - pad / 37), y * (1 - pad / 37)]), p));

export function cellFig(m: MC): Fig {
  const f = m.f ?? "w", out: Prim[] = [];
  out.push(m.s === 0 ? { k: "circ", c: [0, 0], r: 34, fill: f } : { k: "poly", pts: outerPts(m.s), fill: f });
  const centre: Pt[] = [];
  const nIsi = [m.g, m.w, m.t, m.a].filter((x) => x !== undefined).length;
  assert.ok(nIsi <= 1, "isi tengah hanya satu jenis");
  if (m.w) { assert.equal(f, "w", "segitiga baling butuh bingkai putih"); m.w.forEach((i) => { out.push({ k: "poly", pts: WEDGE[i], fill: "b" }); centre.push(...WEDGE[i]); }); }
  if (m.g) { assert.equal(f, "w", "garis butuh bingkai putih"); m.g.forEach((x) => { out.push({ k: "line", a: SEG[x][0], b: SEG[x][1], w: 4 }); centre.push(...SEG[x]); }); }
  if (m.t !== undefined) {
    const tf = m.tf ?? inv(f);
    out.push(m.t === 0 ? { k: "circ", c: [0, 0], r: 12, fill: tf } : { k: "poly", pts: innerPts(m.t), fill: tf });
    centre.push(...(m.t === 0 ? ([[12, 0], [-12, 0], [0, 12], [0, -12]] as Pt[]) : innerPts(m.t)));
  }
  if (m.a !== undefined) { const pts = NEEDLE.map((p) => rot(p, 45 * m.a!)); out.push({ k: "poly", pts, fill: inv(f) }); centre.push(...pts); }
  centre.forEach((p) => assert.ok(inside(m.s, p), `isi tengah keluar dari ${SHAPE_NAME[m.s]}`));
  if (m.n) for (let i = 0; i < m.n; i++) out.push({ k: "circ", c: [r1((i - (m.n - 1) / 2) * 9), 43], r: 3, fill: "b" });
  if (m.k !== undefined) out.push({ k: "circ", c: CORNER[m.k], r: 4.5, fill: "b" });
  return out;
}

// ── opsi + pembahasan ────────────────────────────────────────────────────────
export type Wrong<T> = { name: string; v: T; isi: string; alasan: string };
export type L = (name: string) => string;
/** Taruh kunci di `key`, pengecoh mengisi sisanya; pembahasan 2 paragraf (§5): langkah, lalu tiap opsi salah + Jawaban + Tips. */
export function finish<T>(o: { ans: T; wrongs: Wrong<T>[]; key: Key; fig: (v: T) => Fig; p1: string[]; tips: (L: L) => string }) {
  assert.equal(o.wrongs.length, 4);
  const opts = place(o.fig(o.ans), o.wrongs.map((w) => o.fig(w.v)), o.key);
  const names = o.wrongs.map((w) => w.name);
  names.splice(KEYS.indexOf(o.key), 0, "__kunci");
  assert.equal(new Set(names).size, 5, "nama pengecoh kembar");
  const L: L = (n) => { const i = names.indexOf(n); assert.ok(i >= 0, `pengecoh ${n} tidak ada`); return KEYS[i]; };
  const p2 = [...o.wrongs].sort((a, b) => L(a.name).localeCompare(L(b.name))).map((w) => `Opsi ${L(w.name)} (${w.isi}): ${w.alasan}`);
  const pembahasan = `${o.p1.join("\n")}<br>${p2.join("\n")}\nJawaban: Opsi ${o.key}.\nTips: ${o.tips(L)}`;
  return { opts, pembahasan, L };
}

export const pos1 = ([r, c]: [number, number]) => `(${r + 1},${c + 1})`;
export { INK };
