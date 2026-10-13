import assert from "node:assert/strict";
import { INK, KEYS, W, r1, type Key } from "./figural-lib";

// Deret gambar MOSAIK (FIG-SERI-MOSAIK), uji coba 2026-10-12. Grid ubin hitam berisi bentuk putih;
// ubin bergerak di lintasan, berputar, bercermin, atau berganti warna menurut 2-3 aturan sekaligus.
// Keadaan ubin = (deg, mir, inv): cermin sumbu tegak dulu, lalu putar searah jarum jam deg; inv = warna dibalik.
// Kesamaan visual diuji dengan sampling 20x20 per ubin, jadi simetri ubin ikut diperhitungkan.
// Dipakai generate-kecerdasan-figural-kal.ts (pkg 15 no 26-27).

type Tile = "kosong" | "bulat" | "titik" | "seperempat" | "busur" | "arsir" | "setengah" | "bintang" | "segitiga" | "daun" | "bendera";
type Cell = { tile: Tile; deg: number; mir: boolean; inv: boolean };
type Frame = Cell[]; // baris demi baris, n x n
type Pt = [number, number];

const star: Pt[] = Array.from({ length: 16 }, (_, i) => { const a = (Math.PI * i) / 8, r = i % 2 ? 0.3 : 0.4; return [r * Math.sin(a), -r * Math.cos(a)]; });
const tri: Pt[] = [[0, -0.36], [0.34, 0.3], [-0.34, 0.3]];
const pole: Pt[] = [[-0.3, -0.38], [-0.18, -0.38], [-0.18, 0.38], [-0.3, 0.38]];
const flag: Pt[] = [[-0.18, -0.38], [0.34, -0.22], [-0.18, -0.04]];
const pip = (P: Pt[], x: number, y: number) => {
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const [xi, yi] = P[i], [xj, yj] = P[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const sq = (a: number, b: number) => a * a + b * b;
const inside: Record<Tile, (x: number, y: number) => boolean> = {
  kosong: () => false,
  bulat: (x, y) => sq(x, y) < 0.36 ** 2,
  titik: (x, y) => [-1, 0, 1].some((i) => [-1, 0, 1].some((j) => sq(x - i * 0.28, y - j * 0.28) < 0.075 ** 2)),
  seperempat: (x, y) => sq(x + 0.5, y + 0.5) < 1,
  busur: (x, y) => { const d = sq(x + 0.5, y - 0.5); return d > 0.25 && d < 0.95 ** 2; },
  arsir: (x, y) => [-2, -1, 0, 1, 2].some((k) => Math.abs(x + y - k * 0.3) / Math.SQRT2 < 0.045),
  setengah: (x, y) => sq(x, y + 0.5) < 0.42 ** 2,
  bintang: (x, y) => pip(star, x, y),
  segitiga: (x, y) => pip(tri, x, y),
  daun: (x, y) => sq(x - 0.5, y + 0.5) < 1 && sq(x + 0.5, y - 0.5) < 1,
  bendera: (x, y) => pip(pole, x, y) || pip(flag, x, y),
};
const pts = (P: Pt[]) => P.map(([x, y]) => `${x.toFixed(3)},${y.toFixed(3)}`).join(" ");
function shapeSvg(t: Tile, f: string): string {
  switch (t) {
    case "kosong": return "";
    case "bulat": return `<circle r=".36" fill="${f}"/>`;
    case "titik": return [-1, 0, 1].flatMap((i) => [-1, 0, 1].map((j) => `<circle cx="${i * 0.28}" cy="${j * 0.28}" r=".075" fill="${f}"/>`)).join("");
    case "seperempat": return `<path d="M-.5,-.5 L.5,-.5 A1,1 0 0 1 -.5,.5 Z" fill="${f}"/>`;
    case "busur": return `<path d="M-.5,-.45 A.95,.95 0 0 1 .45,.5 L0,.5 A.5,.5 0 0 0 -.5,0 Z" fill="${f}"/>`;
    case "arsir": return [-2, -1, 0, 1, 2].map((k) => `<line x1="${-1 + k * 0.3}" y1="1" x2="${1 + k * 0.3}" y2="-1" stroke="${f}" stroke-width=".09"/>`).join("");
    case "setengah": return `<path d="M-.42,-.5 A.42,.42 0 0 0 .42,-.5 Z" fill="${f}"/>`;
    case "bintang": return `<polygon points="${pts(star)}" fill="${f}"/>`;
    case "segitiga": return `<polygon points="${pts(tri)}" fill="${f}"/>`;
    case "daun": return `<path d="M-.5,-.5 A1,1 0 0 0 .5,.5 A1,1 0 0 0 -.5,-.5 Z" fill="${f}"/>`;
    case "bendera": return `<polygon points="${pts(pole)}" fill="${f}"/><polygon points="${pts(flag)}" fill="${f}"/>`;
  }
}

// ── sidik visual ─────────────────────────────────────────────────────────────
const G = 20;
function cellBits(c: Cell): string {
  const a = (-c.deg * Math.PI) / 180, co = Math.cos(a), si = Math.sin(a);
  let s = "";
  for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) {
    const qx = (j + 0.5) / G - 0.5, qy = (i + 0.5) / G - 0.5;
    let x = qx * co - qy * si; const y = qx * si + qy * co;
    if (c.mir) x = -x;
    s += inside[c.tile](x, y) !== c.inv ? "1" : "0";
  }
  return s;
}
const bits = (f: Frame) => f.map(cellBits).join("");
const ham = (a: string, b: string) => { let d = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++; return d; };
const md = (a: number, m: number) => ((a % m) + m) % m;
const C = (tile: Tile, inv = false, deg = 0, mir = false): Cell => ({ tile, deg, mir, inv });

// ── render ───────────────────────────────────────────────────────────────────
// Satu bingkai = grid n x n. perRow 5 = satu baris; 3 = baris 3 + 2. Tanpa `st` = gaya lama (ubin kotak, bingkai ganda; paket live).
// Gaya (pkg 4/5, PEDOMAN G-10): tiap butir beda bentuk ubin × bingkai × celah. Topeng ubin digambar sebagai path evenodd berwarna
// sama dengan bingkai, jadi tanpa id/clipPath (aman untuk pembahasan_svg, G-8).
type Overlay = (center: (i: number) => Pt, T: number) => string;
export type Style = { mask: "kotak" | "bulat" | "lembut" | "oktagon"; frame: "ganda" | "tipis" | "panel" | "papan"; gap?: number; chevron?: boolean };
const FRAME_BG = { ganda: "white", tipis: "white", panel: "#e8e8e8", papan: "#a8a8a8" } as const;
const TILE_D: Record<Exclude<Style["mask"], "kotak">, string> = {
  bulat: "M0,-.485A.485,.485 0 1 0 0,.485A.485,.485 0 1 0 0,-.485Z",
  lembut: "M-.28,-.485H.28A.205,.205 0 0 1 .485,-.28V.28A.205,.205 0 0 1 .28,.485H-.28A.205,.205 0 0 1 -.485,.28V-.28A.205,.205 0 0 1 -.28,-.485Z",
  oktagon: "M-.32,-.485H.32L.485,-.32V.32L.32,.485H-.32L-.485,.32V-.32Z",
};
function frameSvg(f: Frame | null, n: number, x: number, y: number, size: number, label: string, mark?: { overlay?: Overlay; hl?: boolean }, st?: Style) {
  const pad = size * (st && st.frame !== "ganda" && st.frame !== "tipis" ? 0.06 : 0.04), grid = size - 2 * pad, gap = grid * (st?.gap ?? 0.02), T = (grid - (n - 1) * gap) / n;
  const center = (i: number): Pt => [x + pad + (i % n) * (T + gap) + T / 2, y + pad + Math.floor(i / n) * (T + gap) + T / 2];
  const hlw = mark?.hl ? 9 : 3, strokeC = mark?.hl ? HL : INK;
  let o: string;
  if (!st || st.frame === "ganda") o = `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="white" stroke="${strokeC}" stroke-width="${hlw}"/>`;
  else o = `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${r1(size * 0.07)}" fill="${FRAME_BG[st.frame]}" stroke="${mark?.hl ? HL : st.frame === "tipis" ? INK : "none"}" stroke-width="${mark?.hl ? 9 : st.frame === "tipis" ? 3 : 0}"/>`;
  if (f) {
    f.forEach((c, i) => {
      const r = Math.floor(i / n), cc = i % n, fg = c.inv ? INK : "white", bg = c.inv ? "white" : INK;
      const hole = st?.frame === "papan" && c.tile === "kosong", masked = !!st && st.mask !== "kotak";
      const tileBg = hole ? "#8c8c8c" : bg;
      const edge = masked ? `<path d="M-.5,-.5H.5V.5H-.5Z${TILE_D[st!.mask as keyof typeof TILE_D]}" fill="${FRAME_BG[st!.frame]}" fill-rule="evenodd"/><path d="${TILE_D[st!.mask as keyof typeof TILE_D]}" fill="none" stroke="${hole ? "#6f6f6f" : INK}" stroke-width=".04"/>` : "";
      o += `<svg x="${(x + pad + cc * (T + gap)).toFixed(1)}" y="${(y + pad + r * (T + gap)).toFixed(1)}" width="${T.toFixed(1)}" height="${T.toFixed(1)}" viewBox="-.5 -.5 1 1" overflow="hidden"><rect x="-.5" y="-.5" width="1" height="1" fill="${tileBg}" stroke="${masked ? "none" : INK}" stroke-width=".05"/><g transform="rotate(${c.deg}) scale(${c.mir ? -1 : 1},1)">${shapeSvg(c.tile, fg)}</g>${edge}</svg>`;
    });
    if (mark?.overlay) o += mark.overlay(center, T);
  } else o += `<text x="${x + size / 2}" y="${y + size / 2 + size * 0.15}" font-family="Arial, Helvetica, sans-serif" font-size="${size * 0.42}" font-weight="bold" text-anchor="middle" fill="${INK}">?</text>`;
  return o + `<text x="${x + size / 2}" y="${y + size + 30}" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="${INK}">${label}</text>`;
}
const HL = "#1a7f37", RED = "#d32f2f";
/** Panah merah dari a ke b (tanpa id, aman dirender berulang di satu halaman). */
function arrow([x1, y1]: Pt, [x2, y2]: Pt, dash = false) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = 14, w = 8;
  const bx = x2 - h * Math.cos(a), by = y2 - h * Math.sin(a);
  return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} L${bx.toFixed(1)} ${by.toFixed(1)}" stroke="${RED}" stroke-width="4" fill="none"${dash ? ' stroke-dasharray="8 6"' : ""}/>` +
    `<polygon points="${x2.toFixed(1)},${y2.toFixed(1)} ${(bx + w * Math.sin(a)).toFixed(1)},${(by - w * Math.cos(a)).toFixed(1)} ${(bx - w * Math.sin(a)).toFixed(1)},${(by + w * Math.cos(a)).toFixed(1)}" fill="${RED}"/>`;
}
export function mosaikSvg(frames: (Frame | null)[], options: Frame[], n: number, perRow: 3 | 5 = 5, marks: ({ overlay?: Overlay; hl?: boolean } | undefined)[] = [], st?: Style) {
  const gx = 18, size = perRow === 5 ? (W - 20 - 4 * gx) / 5 : 230, rowH = size + 48;
  let body = "", y = 10;
  const row = (list: (Frame | null)[], labels: string[]) => {
    for (let s = 0; s < list.length; s += perRow) {
      const chunk = list.slice(s, s + perRow), w = chunk.length * size + (chunk.length - 1) * gx, x0 = (W - w) / 2;
      chunk.forEach((f, i) => { body += frameSvg(f, n, x0 + i * (size + gx), y, size, labels[s + i], list === frames ? marks[s + i] : undefined, st); if (st?.chevron && list === frames && i < chunk.length - 1) body += `<path d="M${r1(x0 + (i + 1) * (size + gx) - gx / 2 - 4)},${r1(y + size / 2 - 9)}L${r1(x0 + (i + 1) * (size + gx) - gx / 2 + 4)},${r1(y + size / 2)}L${r1(x0 + (i + 1) * (size + gx) - gx / 2 - 4)},${r1(y + size / 2 + 9)}" fill="none" stroke="#666" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`; });
      y += rowH;
    }
  };
  row(frames, ["(1)", "(2)", "(3)", "(4)", "(5)"]);
  if (options.length) { y += 16; row(options, ["a", "b", "c", "d", "e"]); }
  return `<svg viewBox="0 0 ${W} ${Math.ceil(y)}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="white"/>${body}</svg>`;
}

// ── butir ────────────────────────────────────────────────────────────────────
export type MosaikItem = { pkg: number; seq: number; key: Key; instruksi: string; svg: string; tingkat: 3; pembahasan: string; pembahasan_svg: string };
const POLA = "Pilihlah satu gambar untuk melengkapi pola di bawah ini.";
type Opt = { f: Frame; why?: string }; // opsi pertama = jawaban
type Def = { pkg: number; seq: number; key: Key; n: number; frames: (Frame | null)[]; opts: Opt[]; aturan: string; tahap: string; overlay: Overlay; st?: Style };

export function buildMosaik(perRow: 3 | 5 = 5): MosaikItem[] {
  const defs: Def[] = [];

  { // ULAR — lintasan zig-zag; warna menempel pada baris tengah; ubin berputar hanya saat pindah baris
    const snake = [0, 1, 2, 5, 4, 3, 6, 7, 8], L = 9;
    const T: Tile[] = ["bendera", "seperempat", "segitiga", "busur", "bintang", "daun", "arsir", "titik", "setengah"];
    const at = (t: number, o: { dir?: number; turn?: number; invByTile?: boolean } = {}): Frame => {
      const dir = o.dir ?? 1, turn = o.turn ?? 90, f: Frame = new Array(9);
      T.forEach((tile, p) => {
        let turns = 0;
        for (let k = 0; k < t; k++) if (Math.floor(snake[md(p + dir * k, L)] / 3) !== Math.floor(snake[md(p + dir * (k + 1), L)] / 3)) turns++;
        const pos = snake[md(p + dir * t, L)];
        f[pos] = C(tile, o.invByTile ? Math.floor(snake[p] / 3) === 1 : Math.floor(pos / 3) === 1, md(turn * turns, 360));
      });
      return f;
    };
    defs.push({
      pkg: 15, seq: 26, key: "D", n: 3, frames: [at(0), at(1), at(2), at(3), null],
      opts: [{ f: at(4) }, { f: at(4, { invByTile: true }), why: "warnanya ikut ubin, padahal warna ditentukan oleh baris tengah" }, { f: at(4, { turn: 0 }), why: "ubin tidak berputar saat berbelok" }, { f: at(4, { turn: -90 }), why: "ubin berputar berlawanan arah jarum jam saat berbelok" }, { f: at(4, { dir: -1 }), why: "ubin merayap ke arah sebaliknya" }],
      aturan: "Ada tiga aturan. (1) Sembilan ubin merayap 1 langkah sepanjang lintasan ular: baris atas ke kanan, turun, baris tengah ke kiri, turun, baris bawah ke kanan, lalu ubin di kanan bawah melompat ke kiri atas. (2) Warna menempel pada baris, bukan pada ubin: ubin di baris tengah selalu putih berisi hitam, ubin di baris lain hitam berisi putih. (3) Ubin berputar 90° searah jarum jam hanya ketika pindah baris; saat berjalan lurus ia tidak berputar.",
      tahap: "Gambar (5) satu langkah setelah gambar (4). Tips: lacak bendera, karena arah tiangnya hanya berubah di titik belok.",
      overlay: (c) => snake.slice(0, -1).map((cell, k) => arrow(c(cell), c(snake[k + 1]))).join("") + arrow(c(8), c(0), true),
    });
  }

  { // DIAGONAL TEMBUS — geser diagonal pada grid tembus; menembus tepi = warna terbalik; cermin tiap langkah
    const n = 3;
    const T: Tile[] = ["bendera", "titik", "seperempat", "bulat", "daun", "segitiga", "busur", "bintang", "arsir"];
    const at = (t: number, o: { dc?: number; dr?: number; mir?: boolean; wrapInv?: boolean } = {}): Frame => {
      const dc = o.dc ?? 1, dr = o.dr ?? 1, f: Frame = new Array(9);
      T.forEach((tile, i) => {
        let r = Math.floor(i / n), c = i % n, wraps = 0;
        for (let k = 0; k < t; k++) { const nr = r + dr, nc = c + dc; if (nr < 0 || nr > 2 || nc < 0 || nc > 2) wraps++; r = md(nr, 3); c = md(nc, 3); }
        f[r * n + c] = C(tile, (o.wrapInv ?? true) && wraps % 2 === 1, 0, (o.mir ?? true) && t % 2 === 1);
      });
      return f;
    };
    defs.push({
      pkg: 15, seq: 27, key: "B", n, frames: [at(0), null, at(2), at(3), at(4)],
      opts: [{ f: at(1) }, { f: at(1, { dc: -1 }), why: "ubin bergerak diagonal ke kiri bawah" }, { f: at(1, { mir: false }), why: "ubin tidak dicerminkan" }, { f: at(1, { wrapInv: false }), why: "ubin yang menembus tepi tidak berganti warna" }, { f: at(1, { dr: 0 }), why: "ubin hanya bergeser ke kanan, tidak turun" }],
      aturan: "Ada tiga aturan. (1) Semua ubin bergeser diagonal 1 petak ke kanan bawah; ubin yang keluar dari tepi kanan atau bawah muncul kembali di sisi seberang. (2) Setiap kali menembus tepi, warnanya terbalik (hitam menjadi putih atau sebaliknya). (3) Setiap langkah semua ubin dicerminkan kiri–kanan.",
      overlay: (c, T) => [0, 1, 3, 4].map((i) => arrow(c(i), [c(i)[0] + T * 0.9, c(i)[1] + T * 0.9])).join("") + [2, 5, 6, 7, 8].map((i) => { const [x, y] = c(i); return arrow([x, y], [x + T * 0.42, y + T * 0.42], true); }).join(""),
      tahap: "Gambar (2) satu langkah setelah gambar (1): semua ubin tercermin, dan hanya ubin dari kolom kanan atau baris bawah yang berganti warna. Tips: setelah 3 langkah susunan petak kembali seperti semula, jadi gambar (4) hanya berbeda cermin dan warna dari gambar (1).",
    });
  }

  { // LOMPAT (pkg 16) — ring 8 ubin melompat 3 petak searah jarum jam, berputar 90° berlawanan arah; bendera pusat berputar 180°
    const ring = [0, 1, 2, 5, 8, 7, 6, 3];
    const T: Tile[] = ["seperempat", "titik", "busur", "bintang", "arsir", "segitiga", "bulat", "daun"];
    const at = (t: number, step = 3, rot = -90, crot = 180): Frame => {
      const f: Frame = new Array(9);
      T.forEach((tile, p) => (f[ring[md(p + step * t, 8)]] = C(tile, false, md(rot * t, 360))));
      f[4] = C("bendera", true, md(crot * t, 360));
      return f;
    };
    defs.push({
      pkg: 16, seq: 26, key: "C", n: 3, frames: [at(0), null, at(2), at(3), at(4)],
      opts: [{ f: at(1) }, { f: at(1, 1) }, { f: at(1, -3) }, { f: at(1, 3, 90) }, { f: at(1, 3, -90, 0) }].map((o, i) => ({ ...o, why: ["", "ubin hanya bergeser 1 petak", "ubin melompat berlawanan arah jarum jam", "ubin berputar searah jarum jam", "bendera di tengah tidak berputar"][i] || undefined })),
      aturan: "Ada tiga aturan. (1) Delapan ubin tepi melompat 3 petak searah jarum jam setiap langkah, jadi dua tetangga dilewati. (2) Setiap ubin berputar 90° berlawanan arah jarum jam. (3) Bendera di tengah berputar 180° setiap langkah.",
      tahap: "Gambar (2) satu langkah setelah gambar (1). Tips: ikuti satu ubin yang jelas arahnya, misalnya segitiga, dari (1) ke (3) ke (4); ia selalu berada 3 petak di depan, sehingga posisinya di (2) bisa dicek dari dua arah.",
      overlay: (c) => arrow(c(ring[5]), c(ring[0])) + arrow(c(ring[0]), c(ring[3]), true),
    });
  }

  { // KONVEYOR (pkg 4) — kolom 1 dan 3 turun, kolom 2 naik (menembus tepi = dicermin kiri-kanan); ubin kolom tengah selalu terbalik warnanya
    const T: Tile[] = ["bendera", "titik", "seperempat", "bulat", "busur", "segitiga", "arsir", "bintang", "daun"];
    const DIR = [1, -1, 1];
    const at = (t: number, o: { dir?: number[]; mir?: boolean; midInv?: boolean } = {}): Frame => {
      const dir = o.dir ?? DIR, f: Frame = new Array(9);
      T.forEach((tile, i) => {
        const c = i % 3; let r = Math.floor(i / 3), wraps = 0;
        for (let k = 0; k < t; k++) { const nr = r + dir[c]; if (nr < 0 || nr > 2) wraps++; r = md(nr, 3); }
        f[r * 3 + c] = C(tile, (o.midInv ?? true) && c === 1, 0, (o.mir ?? true) && wraps % 2 === 1);
      });
      return f;
    };
    defs.push({
      pkg: 4, seq: 26, key: "C", n: 3, st: { mask: "oktagon", frame: "panel", gap: 0.08, chevron: true }, frames: [at(0), at(1), null, at(3), at(4)],
      opts: [{ f: at(2) }, { f: at(2, { dir: [1, 0, 1] }), why: "kolom tengah diam, padahal ia naik 1 petak setiap langkah" }, { f: at(2, { mir: false }), why: "ubin yang menembus tepi tidak dicerminkan" }, { f: at(2, { midInv: false }), why: "ubin kolom tengah tidak dibalik warnanya" }, { f: at(2, { dir: [1, 1, 1] }), why: "kolom tengah ikut turun, padahal ia naik" }],
      aturan: "Ada tiga aturan. (1) Kolom kiri dan kanan bergerak turun 1 petak setiap langkah, sedangkan kolom tengah naik 1 petak; ubin yang keluar dari tepi muncul di sisi seberang kolomnya. (2) Setiap kali menembus tepi, ubin dicerminkan kiri–kanan. (3) Warna menempel pada kolom, bukan pada ubin: semua ubin di kolom tengah selalu putih berisi hitam.",
      tahap: "Gambar (3) berada satu langkah setelah gambar (2). Tips: kolom berulang tiap 3 langkah, jadi gambar (4) sama dengan gambar (1) tetapi semua ubin sudah dicerminkan satu kali.",
      overlay: (c) => [0, 2].map((col) => arrow(c(col), c(col + 3)) + arrow(c(col + 3), c(col + 6))).join("") + arrow(c(7), c(4)) + arrow(c(4), c(1)),
    });
  }

  { // CINCIN SUDUT (pkg 4) — ring 8 ubin bergeser 1 petak berlawanan arah jarum jam; warna menempel pada sudut; bendera pusat berputar ↺ dan dicermin
    const ring = [0, 1, 2, 5, 8, 7, 6, 3];
    const T: Tile[] = ["seperempat", "titik", "busur", "bintang", "arsir", "segitiga", "bulat", "daun"];
    const at = (t: number, o: { step?: number; byTile?: boolean; crot?: number; cmir?: boolean } = {}): Frame => {
      const step = o.step ?? -1, f: Frame = new Array(9);
      T.forEach((tile, p) => {
        const q = md(p + step * t, 8);
        f[ring[q]] = C(tile, o.byTile ? p % 2 === 0 : q % 2 === 0, 0, false);
      });
      f[4] = C("bendera", false, md((o.crot ?? -90) * t, 360), (o.cmir ?? true) && t % 2 === 1);
      return f;
    };
    defs.push({
      pkg: 4, seq: 27, key: "E", n: 3, st: { mask: "bulat", frame: "papan", gap: 0.07 }, frames: [at(0), at(1), at(2), null, at(4)],
      opts: [{ f: at(3) }, { f: at(3, { step: 1 }), why: "ubin tepi bergeser searah jarum jam" }, { f: at(3, { byTile: true }), why: "warna ikut ubinnya, padahal warna menempel pada sudut" }, { f: at(3, { crot: 90 }), why: "bendera di tengah berputar searah jarum jam" }, { f: at(3, { cmir: false }), why: "bendera di tengah tidak dicerminkan" }],
      aturan: "Ada tiga aturan. (1) Delapan ubin tepi bergeser 1 petak berlawanan arah jarum jam setiap langkah. (2) Warna menempel pada petaknya, bukan pada ubin: ubin yang berada di empat sudut selalu putih berisi hitam, ubin di empat sisi tengah selalu hitam berisi putih. (3) Bendera di tengah berputar 90° berlawanan arah jarum jam dan dicerminkan kiri–kanan setiap langkah ganjil.",
      tahap: "Gambar (4) satu langkah setelah gambar (3). Tips: ikuti bendera di tengah dan satu ubin yang jelas (misalnya segitiga); warna cukup dicek dari petaknya.",
      overlay: (c) => ring.slice(0, -1).map((cell, k) => arrow(c(ring[k + 1]), c(cell))).join("") + arrow(c(ring[0]), c(ring[7]), true),
    });
  }

  { // SILANG (pkg 5) — kolom tepi bertukar menyilang (titik pusat sebagai poros) dan ubin yang pindah berputar ↻; ubin kolom tengah (diam) berganti warna tiap langkah
    const T: Tile[] = ["bendera", "segitiga", "busur", "seperempat", "setengah", "arsir", "daun", "titik", "bintang"];
    const at = (t: number, o: { cross?: boolean; rot?: number; midInv?: boolean; stay?: boolean } = {}): Frame => {
      const f: Frame = new Array(9), rot = o.rot ?? 90;
      T.forEach((tile, i) => {
        if (i % 3 === 1) { f[i] = C(tile, (o.midInv ?? true) && t % 2 === 1); return; }
        const pos = t % 2 === 0 || o.stay ? i : o.cross === false ? Math.floor(i / 3) * 3 + 2 - (i % 3) : 8 - i;
        f[pos] = C(tile, false, md(rot * t, 360));
      });
      return f;
    };
    defs.push({
      pkg: 5, seq: 26, key: "E", n: 3, st: { mask: "lembut", frame: "tipis", gap: 0.09, chevron: true }, frames: [at(0), at(1), at(2), null, at(4)],
      opts: [{ f: at(3) }, { f: at(3, { stay: true }), why: "ubin di kolom tepi tidak berpindah tempat, padahal kedua kolom tepi bertukar setiap langkah" }, { f: at(3, { rot: 0 }), why: "ubin yang pindah tidak berputar" }, { f: at(3, { midInv: false }), why: "ubin kolom tengah tidak berganti warna" }, { f: at(3, { cross: false }), why: "ubin hanya bertukar kiri–kanan di barisnya sendiri, tidak menyilang (atas ke bawah)" }],
      aturan: "Ada tiga aturan. (1) Ubin di kolom kiri dan kolom kanan bertukar tempat secara menyilang setiap langkah: ubin kiri atas pindah ke kanan bawah, kiri tengah ke kanan tengah, kiri bawah ke kanan atas, dan sebaliknya (pusat gambar sebagai poros). (2) Setiap ubin yang pindah berputar 90° searah jarum jam. (3) Ubin di kolom tengah tidak pindah, tetapi warnanya terbalik setiap langkah (ganjil terbalik, genap normal).",
      tahap: "Gambar (4) berada satu langkah setelah gambar (3). Tips: setelah 2 langkah semua ubin kolom tepi kembali ke tempat semula tetapi sudah berputar 180°; ikuti bendera, karena arah tiangnya menunjukkan jumlah putaran.",
      overlay: (c) => [[0, 8], [2, 6], [3, 5]].map(([a, b]) => arrow(c(a), c(b)) + arrow(c(b), c(a))).join(""),
    });
  }

  { // GESER KOSONG (pkg 5) — satu petak kosong berjalan 8→7→4→5→8; ubin yang menutup petak kosong bergeser 1 petak, berputar 90° ↻, dan warnanya terbalik
    const T: Tile[] = ["segitiga", "titik", "daun", "arsir", "busur", "seperempat", "bulat", "bendera", "kosong"];
    const PATH = [7, 4, 5, 8];
    const at = (t: number, o: { path?: number[]; rot?: number; inv?: boolean } = {}): Frame => {
      const path = o.path ?? PATH, rot = o.rot ?? 90, f: Frame = T.map((tile) => C(tile));
      let b = 8;
      for (let k = 0; k < t; k++) {
        const nb = path[k], moved = f[nb];
        f[b] = C(moved.tile, (o.inv ?? true) ? !moved.inv : moved.inv, md(moved.deg + rot, 360));
        f[nb] = C("kosong");
        b = nb;
      }
      return f;
    };
    defs.push({
      pkg: 5, seq: 27, key: "D", n: 3, st: { mask: "kotak", frame: "papan", gap: 0.05 }, frames: [at(0), at(1), null, at(3), at(4)],
      opts: [{ f: at(2) }, { f: at(2, { path: [5, 4, 7, 8] }), why: "petak kosong berjalan ke arah sebaliknya (naik dulu, lalu ke kiri)" }, { f: at(2, { rot: 0 }), why: "ubin yang bergeser tidak berputar" }, { f: at(2, { inv: false }), why: "ubin yang bergeser tidak berganti warna" }, { f: at(2, { rot: -90 }), why: "ubin yang bergeser berputar berlawanan arah jarum jam" }],
      aturan: "Ada tiga aturan. (1) Satu petak kosong (lubang pada papan abu-abu) berjalan 1 petak setiap langkah: dari kanan bawah ke kiri, naik ke tengah, ke kanan, lalu turun kembali ke kanan bawah. Petak kosong bertukar tempat dengan ubin di sebelahnya, sehingga ubin itu bergeser 1 petak ke petak kosong yang lama. (2) Setiap ubin yang bergeser berputar 90° searah jarum jam. (3) Setiap ubin yang bergeser warnanya terbalik. Ubin yang bergeser dua kali (bendera) berputar 180° dan warnanya kembali normal.",
      tahap: "Gambar (3) berada satu langkah setelah gambar (2): petak kosong pindah dari bawah tengah ke tengah, dan ubin tengah (busur) turun ke bawah tengah. Tips: lacak petak kosongnya dulu, baru ubin yang tepat berada di belakangnya.",
      overlay: (c) => [[8, 7], [7, 4], [4, 5]].map(([a, b]) => arrow(c(a), c(b))).join("") + arrow(c(5), c(8), true),
    });
  }

  return defs.map((d) => {
    // Opsi berlabel huruf; jawaban di posisi d.key, pengecoh mengisi sisanya berurutan.
    const order: Opt[] = new Array(5), rest = d.opts.slice(1);
    KEYS.forEach((k, i) => (order[i] = k === d.key ? d.opts[0] : rest.shift()!));
    const b = order.map((o) => bits(o.f));
    for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) assert.ok(ham(b[i], b[j]) >= 12, `mosaik ${d.seq}: opsi ${i}/${j} terlalu mirip`);
    for (const o of d.opts.slice(1)) for (const f of d.frames) if (f) assert.notEqual(bits(o.f), bits(f), `mosaik ${d.seq}: pengecoh sama dengan gambar soal (${o.why})`);
    const gugur = KEYS.map((k, i) => (k === d.key ? "" : `Opsi ${k.toLowerCase()} gugur karena ${order[i].why}.`)).filter(Boolean).join(" ");
    // Gambar pembahasan: deret lengkap, jawaban mengisi "?" dan berbingkai hijau, panah lintasan di gambar (1).
    const filled = d.frames.map((f) => f ?? d.opts[0].f), at = d.frames.indexOf(null);
    const marks = filled.map((_, i) => (i === 0 ? { overlay: d.overlay } : i === at ? { hl: true } : undefined));
    // Aturan 2 paragraf (RULES GENERATE SOAL SPASIAL §3): pola, lalu eliminasi.
    return {
      pkg: d.pkg, seq: d.seq, key: d.key, instruksi: POLA, tingkat: 3 as const,
      svg: mosaikSvg(d.frames, order.map((o) => o.f), d.n, perRow, [], d.st),
      pembahasan: `${d.aturan} ${d.tahap}\n\n${gugur} Jawaban: ${d.key.toLowerCase()}.`,
      pembahasan_svg: mosaikSvg(filled, [], d.n, perRow, marks, d.st),
    };
  });
}
