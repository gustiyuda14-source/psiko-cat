// Mesin jaring-jaring kubus: motif, lipat, rotasi, render SVG, tanda tangan gambar.
export type V3 = [number, number, number];
export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const neg = (a: V3): V3 => [-a[0], -a[1], -a[2]];
export const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const key = (a: V3) => a.map((x) => Math.round(x)).join(",");

// ---------- Motif (koordinat lokal 0..1, y ke bawah) ----------
const K = "#111", W = "#fff", G = "#9a9a9a";
type Prim =
  | { k: "rect"; x: number; y: number; w: number; h: number; f: string }
  | { k: "circle"; cx: number; cy: number; r: number; f: string }
  | { k: "poly"; p: [number, number][]; f: string };
export type Anchor =
  | { t: "edge"; v: [number, number]; frase: string } // "alas segitiga menempel di tepi {E}"
  | { t: "axis"; v: [number, number] } // garis
  | { t: "diag"; v: [number, number]; frase: string } // dua titik diagonal
  | { t: "corner"; v: [number, number]; frase: string }
  | { t: "chiral"; a: [number, number]; b: [number, number] }; // huruf L
export interface Design { id: string; nama: string; prims: Prim[]; anchor?: Anchor }

const rot45 = (cx: number, cy: number, w: number, h: number): [number, number][] => {
  const c = Math.SQRT1_2;
  return ([[-w, -h], [w, -h], [w, h], [-w, h]] as [number, number][]).map(([x, y]) => [cx + (x - y) * c, cy + (x + y) * c]);
};
export const DESIGNS: Record<string, Design> = {
  kosong: { id: "kosong", nama: "kosong", prims: [] },
  bulat: { id: "bulat", nama: "lingkaran hitam", prims: [{ k: "circle", cx: 0.5, cy: 0.5, r: 0.21, f: K }] },
  hitam: { id: "hitam", nama: "hitam penuh", prims: [{ k: "rect", x: 0, y: 0, w: 1, h: 1, f: K }] },
  cincin: { id: "cincin", nama: "cincin", prims: [{ k: "circle", cx: 0.5, cy: 0.5, r: 0.3, f: K }, { k: "circle", cx: 0.5, cy: 0.5, r: 0.18, f: W }] },
  silang: { id: "silang", nama: "tanda silang", prims: [{ k: "poly", p: rot45(0.5, 0.5, 0.33, 0.075), f: K }, { k: "poly", p: rot45(0.5, 0.5, 0.075, 0.33), f: K }] },
  plus: { id: "plus", nama: "tanda tambah", prims: [{ k: "rect", x: 0.43, y: 0.17, w: 0.14, h: 0.66, f: K }, { k: "rect", x: 0.17, y: 0.43, w: 0.66, h: 0.14, f: K }] },
  bingkai: { id: "bingkai", nama: "kotak berbingkai", prims: [{ k: "rect", x: 0.15, y: 0.15, w: 0.7, h: 0.7, f: K }, { k: "rect", x: 0.23, y: 0.23, w: 0.54, h: 0.54, f: G }] },
  abu: { id: "abu", nama: "abu-abu penuh", prims: [{ k: "rect", x: 0, y: 0, w: 1, h: 1, f: G }] },
  segitiga: { id: "segitiga", nama: "segitiga", prims: [{ k: "poly", p: [[0.22, 1], [0.78, 1], [0.5, 0.6]], f: K }], anchor: { t: "edge", v: [0, 1], frase: "alasnya menempel di tepi {E}" } },
  garis: { id: "garis", nama: "garis tebal", prims: [{ k: "rect", x: 0.43, y: 0.1, w: 0.14, h: 0.8, f: K }], anchor: { t: "axis", v: [0, 1] } },
  panah: { id: "panah", nama: "panah", prims: [{ k: "poly", p: [[0.5, 0.12], [0.8, 0.45], [0.6, 0.45], [0.6, 0.88], [0.4, 0.88], [0.4, 0.45], [0.2, 0.45]], f: K }], anchor: { t: "edge", v: [0, -1], frase: "ujungnya menunjuk ke {E}" } },
  setengah: { id: "setengah", nama: "setengah hitam", prims: [{ k: "rect", x: 0, y: 0.5, w: 1, h: 0.5, f: K }], anchor: { t: "edge", v: [0, 1], frase: "bagian hitamnya di sisi {E}" } },
  diagonal: { id: "diagonal", nama: "segitiga siku hitam", prims: [{ k: "poly", p: [[0, 0], [1, 0], [0, 1]], f: K }], anchor: { t: "corner", v: [-1, -1], frase: "sudut sikunya di pojok {C}" } },
  pojok: { id: "pojok", nama: "seperempat lingkaran", prims: [{ k: "circle", cx: 1, cy: 1, r: 0.48, f: K }], anchor: { t: "corner", v: [1, 1], frase: "menempel di pojok {C}" } },
  titik2: { id: "titik2", nama: "dua titik", prims: [{ k: "circle", cx: 0.27, cy: 0.27, r: 0.12, f: K }, { k: "circle", cx: 0.73, cy: 0.73, r: 0.12, f: K }], anchor: { t: "diag", v: [1, 1], frase: "titiknya di pojok {C1} dan {C2}" } },
  siku: { id: "siku", nama: "huruf L", prims: [{ k: "rect", x: 0.28, y: 0.14, w: 0.16, h: 0.72, f: K }, { k: "rect", x: 0.28, y: 0.7, w: 0.46, h: 0.16, f: K }], anchor: { t: "chiral", a: [0, -1], b: [1, 0] } },
};

// ---------- Rasterisasi untuk tanda tangan ----------
const N = 16;
function inPoly(x: number, y: number, p: [number, number][]) {
  let ins = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, yi] = p[i], [xj, yj] = p[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ins = !ins;
  }
  return ins;
}
export function sample(d: Design, s: number, t: number): string {
  let c = "0";
  for (const p of d.prims) {
    const hit = p.k === "rect" ? s >= p.x && s <= p.x + p.w && t >= p.y && t <= p.y + p.h
      : p.k === "circle" ? (s - p.cx) ** 2 + (t - p.cy) ** 2 <= p.r ** 2 : inPoly(s, t, p.p);
    if (hit) c = p.f === K ? "1" : p.f === G ? "2" : "0";
  }
  return c;
}

// ---------- Kubus ----------
export interface Face { design: string; r: V3; u: V3; cell?: number } // r = kanan motif, u = atas motif (3D)
export type Cube = Map<string, Face>; // key(normal) -> face
export const NORMALS: V3[] = [[0, 0, 1], [0, 0, -1], [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0]];

export interface Cell { c: number; r: number; design: string; rot: number; no?: number }
const R90 = (v: [number, number], k: number): [number, number] => {
  let [x, y] = v;
  for (let i = 0; i < ((k % 4) + 4) % 4; i++) [x, y] = [-y, x];
  return [x, y];
};
const to3 = (v: [number, number], r: V3, u: V3): V3 => add(mul(r, v[0]), mul(u, -v[1]));

export interface Folded { n: V3; r: V3; u: V3 }
/** Lipat bentuk jaring; sel 0 = depan. null bila bukan jaring kubus. */
export function foldShape(cells: { c: number; r: number }[]): Folded[] | null {
  const out: (Folded | undefined)[] = [];
  out[0] = { n: [0, 0, 1], r: [1, 0, 0], u: [0, 1, 0] };
  const q = [0];
  while (q.length) {
    const i = q.shift()!, f = out[i]!;
    cells.forEach((c, j) => {
      if (out[j]) return;
      const dc = c.c - cells[i].c, dr = c.r - cells[i].r;
      if (Math.abs(dc) + Math.abs(dr) !== 1) return;
      out[j] = dc === 1 ? { n: f.r, r: neg(f.n), u: f.u } : dc === -1 ? { n: neg(f.r), r: f.n, u: f.u }
        : dr === -1 ? { n: f.u, r: f.r, u: neg(f.n) } : { n: neg(f.u), r: f.r, u: f.n };
      q.push(j);
    });
  }
  if (out.some((x) => !x) || out.length !== 6) return null;
  return new Set(out.map((x) => key(x!.n))).size === 6 ? (out as Folded[]) : null;
}
export function fold(cells: Cell[]): Cube {
  const fs = foldShape(cells);
  if (!fs) throw new Error("bukan jaring kubus");
  const cube: Cube = new Map();
  cells.forEach((c, i) => {
    const { n, r, u } = fs[i];
    cube.set(key(n), { cell: i, design: c.design, r: to3(R90([1, 0], c.rot), r, u), u: to3(R90([0, -1], c.rot), r, u) });
  });
  return cube;
}
/** Buka kubus ke bentuk jaring tertentu (sel 0 menerima sisi berarah `n0`). */
export function unfold(cube: Cube, shape: { c: number; r: number }[], rotIdx: number): Cell[] {
  const R = ROTS[rotIdx], cb = rotate(cube, R), fs = foldShape(shape)!;
  return shape.map((s, i) => {
    const { n, r, u } = fs[i], f = cb.get(key(n))!;
    const v: [number, number] = [dot(f.r, r), -dot(f.r, u)];
    let rot = 0;
    while (rot < 4) { const w = R90([1, 0], rot); if (w[0] === Math.round(v[0]) && w[1] === Math.round(v[1])) break; rot++; }
    if (rot === 4 || dot(cross(f.r, f.u), n) < 0) throw new Error("unfold: motif tercermin");
    return { c: s.c, r: s.r, design: f.design, rot };
  });
}

// 24 rotasi
type M3 = V3[]; // baris
const mm = (a: M3, b: M3): M3 => a.map((row) => [0, 1, 2].map((j) => row[0] * b[0][j] + row[1] * b[1][j] + row[2] * b[2][j])) as M3;
export const app = (m: M3, v: V3): V3 => [dot(m[0], v), dot(m[1], v), dot(m[2], v)];
export const ROTS: M3[] = (() => {
  const I: M3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]], X: M3 = [[1, 0, 0], [0, 0, -1], [0, 1, 0]], Y: M3 = [[0, 0, 1], [0, 1, 0], [-1, 0, 0]];
  const seen = new Map<string, M3>([[JSON.stringify(I), I]]), q = [I];
  while (q.length) { const m = q.shift()!; for (const g of [X, Y]) { const n = mm(g, m), k = JSON.stringify(n); if (!seen.has(k)) { seen.set(k, n); q.push(n); } } }
  return [...seen.values()];
})();
export function rotate(cube: Cube, m: M3): Cube {
  const out: Cube = new Map();
  for (const n of NORMALS) { const f = cube.get(key(n))!; out.set(key(app(m, n)), { ...f, r: app(m, f.r), u: app(m, f.u) }); }
  return out;
}
export const mirrorCube = (cube: Cube): Cube => rotate(cube, [[-1, 0, 0], [0, 1, 0], [0, 0, 1]]);
export const opposite = (cube: Cube, design: string): string => {
  for (const n of NORMALS) if (cube.get(key(n))!.design === design) return cube.get(key(neg(n)))!.design;
  throw new Error("motif tidak ada: " + design);
};

// ---------- Tampilan (depan, atas, samping) ----------
export type Pos = "depan" | "atas" | "samping";
export interface View { side: 1 | -1; faces: Record<Pos, Face> }
export const POS_N = (side: number): Record<Pos, V3> => ({ depan: [0, 0, 1], atas: [0, 1, 0], samping: [side, 0, 0] });
const CANON = (side: number): Record<Pos, { r: V3; u: V3 }> => ({
  depan: { r: [1, 0, 0], u: [0, 1, 0] }, atas: { r: [1, 0, 0], u: [0, 0, -1] }, samping: { r: [0, 0, -side], u: [0, 1, 0] },
});
export const viewOf = (cube: Cube, side: 1 | -1): View => {
  const pn = POS_N(side);
  return { side, faces: { depan: cube.get(key(pn.depan))!, atas: cube.get(key(pn.atas))!, samping: cube.get(key(pn.samping))! } };
};
export function faceSig(f: Face, pos: Pos, side: number): string {
  const c = CANON(side)[pos], d = DESIGNS[f.design];
  let s = "";
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const x = (i + 0.5) / N - 0.5, y = 0.5 - (j + 0.5) / N; // canon: x kanan, y atas
    const p = add(mul(c.r, x), mul(c.u, y));
    s += sample(d, 0.5 + dot(p, f.r), 0.5 - dot(p, f.u));
  }
  return s;
}
export const viewSig = (v: View) => (["depan", "atas", "samping"] as Pos[]).map((p) => faceSig(v.faces[p], p, v.side)).join("|") + "#" + v.side;
/** Apakah tampilan ini bisa dihasilkan kubus (rotasi apa pun, sisi samping sama)? */
export function consistent(cube: Cube, v: View): boolean {
  const s = viewSig(v);
  return ROTS.some((m) => viewSig(viewOf(rotate(cube, m), v.side)) === s);
}

// ---------- Nama arah ----------
const DIRNAME: Record<string, string> = { "1,0,0": "kanan", "-1,0,0": "kiri", "0,1,0": "atas", "0,-1,0": "bawah", "0,0,1": "depan", "0,0,-1": "belakang" };
const dirName = (v: V3) => DIRNAME[key(v)];
const cornerName = (v: V3) => {
  const parts: string[] = [];
  for (const ax of [0, 2, 1]) if (Math.round(v[ax]) !== 0) { const e: V3 = [0, 0, 0]; e[ax] = Math.sign(v[ax]); parts.push(dirName(e)); }
  return parts.join("-");
};
const AXIS = ["melintang kiri–kanan", "tegak atas–bawah", "membujur depan–belakang"];
/** Frase arah motif pada sisi kubus (pakai frame 3D motif), "" untuk motif simetris penuh. */
export function orientPhrase(f: Face): string {
  const a = DESIGNS[f.design].anchor;
  if (!a) return "";
  if (a.t === "edge") return a.frase.replace("{E}", dirName(to3(a.v, f.r, f.u)));
  if (a.t === "corner") return a.frase.replace("{C}", cornerName(to3(a.v, f.r, f.u)));
  if (a.t === "diag") return a.frase.replace("{C1}", cornerName(to3(a.v, f.r, f.u))).replace("{C2}", cornerName(to3([-a.v[0], -a.v[1]], f.r, f.u)));
  if (a.t === "axis") return AXIS[to3(a.v, f.r, f.u).findIndex((x) => Math.round(x) !== 0)];
  return `kaki panjangnya ke arah ${dirName(to3(a.a, f.r, f.u))}, kaki pendeknya ke ${dirName(to3(a.b, f.r, f.u))}`;
}
export const describe = (f: Face) => { const o = orientPhrase(f); return DESIGNS[f.design].nama + (o ? ` (${o})` : ""); };
