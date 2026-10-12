// Mesin peta K17 versi 2 (hitam-putih, gaya soal cetak): jaringan jalan tidak seragam (pertigaan,
// jalan buntu, jarak jalan berbeda), bangunan siluet hitam berjajar di tepi jalan.
// Geometri umum: bangunan menempel ke jalan bila tepinya ≤ GAP+1 dari tepi badan jalan.
import { pick, shuffle, unit as rndUnit } from "./denah-k17-peta";

export const W = 448, TOP = 84, M = 8, H = 600, R = 26, GAP = 5;
const f1 = (n: number) => Math.round(n * 10) / 10;
const INK = "#111", FONT = 'font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif"';

export type St = { axis: "V" | "H"; c: number; a0: number; a1: number; name: string };
export type Bld = { name: string; kind: string; building: boolean; x: number; y: number; w: number; h: number; cx: number; cy: number; lx: number; ly: number };
export type Map2 = { streets: St[]; objs: Bld[] };

const STREET_NAMES = ["Jl. Cendana", "Jl. Nangka", "Jl. Bougenville", "Jl. Teratai", "Jl. Wijaya", "Jl. Hasanuddin", "Jl. Siliwangi", "Jl. Dahlia", "Jl. Seroja",
  "Jl. Kemuning", "Jl. Asoka", "Jl. Mangga", "Jl. Durian", "Jl. Pattimura", "Jl. Imam Bonjol", "Jl. Kenari", "Jl. Cemara", "Jl. Bakti"];
const HOUSES = ["Dina", "Fikri", "Galang", "Hana", "Irfan", "Jihan", "Kevin", "Laras", "Nadia", "Putra", "Rizky", "Tari", "Wawan", "Yoga", "Citra", "Dodi", "Eka", "Farah", "Gilang", "Indah", "Joni", "Kirana", "Lutfi", "Maya"];
const PUBLIC: [string, string][] = [["Kantor Polisi", "polisi"], ["KUA", "gedung"], ["KUD", "gedung"], ["Balai Desa", "balai"], ["SD Cendekia", "sekolah"], ["SMP Tunas", "sekolah"],
  ["Masjid", "masjid"], ["Gereja", "gereja"], ["Puskesmas", "klinik"], ["Klinik", "klinik"], ["Kantor Kec.", "menara"], ["Gd. Serbaguna", "menara"], ["Kantor Pos", "gedung"],
  ["Koperasi", "toko"], ["Pasar", "toko"], ["Bengkel", "toko"], ["Bank", "bank"], ["Apotek", "toko"]];
const SIZE: Record<string, [number, number]> = { rumah: [38, 30], polisi: [52, 40], gedung: [46, 42], balai: [56, 34], sekolah: [58, 36], masjid: [56, 44], gereja: [46, 46], klinik: [50, 38], menara: [46, 48], toko: [54, 34], bank: [52, 38] };

const TALL: Record<string, number> = { sekolah: 11, polisi: 10, gereja: 10, klinik: 5, masjid: 3 };
type Box = [number, number, number, number]; // x0 y0 x1 y1
const hit = (a: Box, b: Box, pad = 0) => a[0] < b[2] + pad && b[0] < a[2] + pad && a[1] < b[3] + pad && b[1] < a[3] + pad;
export const corridor = (s: St): Box => s.axis === "V" ? [s.c - R / 2, s.a0, s.c + R / 2, s.a1] : [s.a0, s.c - R / 2, s.a1, s.c + R / 2];
const labelW = (t: string) => t.length * 7 + 6;

function spaced(lo: number, hi: number, n: number, gap: number): number[] {
  for (;;) {
    const v = Array.from({ length: n }, () => Math.round(lo + (hi - lo) * rndUnit())).sort((a, b) => a - b);
    if (v.every((x, i) => !i || x - v[i - 1] >= gap)) return v;
  }
}

/** Peta baru: 2–3 jalan tegak + 2–3 mendatar, sebagian berhenti di jalan lain (pertigaan). */
export function makeMap2(minB = 16, maxB = 22): Map2 {
  for (;;) {
    const nV = pick([2, 3]), nH = pick([2, 3]);
    const xs = spaced(70, W - 70, nV, nV === 3 ? 118 : 150), ys = spaced(TOP + 60, H - 60, nH, nH === 3 ? 130 : 170);
    const names = shuffle(STREET_NAMES);
    const V: St[] = xs.map((c, i) => ({ axis: "V", c, a0: TOP, a1: H - M, name: names[i] }));
    const Hs: St[] = ys.map((c, i) => ({ axis: "H", c, a0: M, a1: W - M, name: names[nV + i] }));
    // Potong sebagian jalan sampai jalan tegak lurus terdekat → pertigaan / jalan buntu dari tepi.
    for (const [own, other] of [[V, Hs], [Hs, V]] as [St[], St[]][]) {
      const keep = pick(own);
      for (const s of own) {
        if (s === keep || rndUnit() < 0.35) continue;
        const stops = other.map((o) => o.c).filter((c) => c > s.a0 + 40 && c < s.a1 - 40);
        if (!stops.length) continue;
        if (rndUnit() < 0.5) s.a0 = Math.min(...stops); else s.a1 = Math.max(...stops);
      }
    }
    const streets = [...V, ...Hs];
    // Setiap jalan harus bersilangan / bertemu minimal satu jalan lain.
    if (!streets.every((s) => streets.some((o) => o.axis !== s.axis && meets(s, o)))) continue;
    const objs = placeBuildings(streets);
    const n = objs.filter((o) => o.building).length;
    if (n >= minB && n <= maxB) return { streets, objs };
  }
}

// Kotak yang tertutup kompas besar peta diputar; peta ditolak bila ada bangunan/label di sini.
export const ROT_COMPASS: Box = [W - 112, TOP, W - 8, 104];
export const clearOfCompass = (p: Map2) => p.objs.every((o) => {
  const lw = o.building ? labelW(o.name) : 0;
  return !hit([Math.min(o.x, o.lx - lw / 2), Math.min(o.y, o.ly - 14), Math.max(o.x + o.w, o.lx + lw / 2), Math.max(o.y + o.h, o.ly + 5)], ROT_COMPASS, 4);
});

export const meets = (a: St, b: St) => b.c >= a.a0 - 1 && b.c <= a.a1 + 1 && a.c >= b.a0 - 1 && a.c <= b.a1 + 1;

function placeBuildings(streets: St[]): Bld[] {
  const houses = shuffle(HOUSES), pubs = shuffle(PUBLIC);
  const roads = streets.map(corridor), taken: Box[] = [], objs: Bld[] = [];
  const frame: Box = [M + 2, TOP + 2, W - M - 2, H - M - 2];
  const inside = (b: Box) => b[0] >= frame[0] && b[1] >= frame[1] && b[2] <= frame[2] && b[3] <= frame[3];
  let field = rndUnit() < 0.6;
  for (const s of shuffle(streets)) for (const side of shuffle([-1, 1])) {
    for (let t = s.a0 + 22 + rndUnit() * 20; t < s.a1 - 22; t += 48 + rndUnit() * 28) {
      const isField = field && rndUnit() < 0.15;
      const pub = !isField && rndUnit() < 0.42 && pubs.length ? pubs.pop()! : null;
      const kind = isField ? "lapangan" : pub ? pub[1] : "rumah";
      const name = isField ? "Lapangan" : pub ? pub[0] : `R. ${houses.pop() ?? "Ari"}`;
      const [w, h] = isField ? (s.axis === "V" ? [62, 104] : [104, 62]) : SIZE[kind];
      const near = s.c + side * (R / 2 + GAP);
      const x = s.axis === "V" ? (side > 0 ? near : near - w) : t - w / 2;
      const y = s.axis === "H" ? (side > 0 ? near : near - h) : t - h / 2;
      const body: Box = [x, y, x + w, y + h];
      // Label di sisi yang menjauhi jalan (bangunan utara jalan mendatar: label di atas).
      const lw = isField ? 0 : labelW(name), above = s.axis === "H" && side < 0;
      const up = TALL[kind] ?? 0; // hiasan atap (bendera, bintang, salib) yang menonjol ke atas
      const ly = isField ? y + h / 2 + 5 : above ? y - 5 - up : y + h + 14, lx = x + w / 2;
      const lab: Box = isField ? body : [lx - lw / 2, above ? y - 18 - up : y + h + 2, lx + lw / 2, above ? y - 1 : y + h + 18];
      const all: Box = [Math.min(body[0], lab[0]), Math.min(body[1], lab[1]), Math.max(body[2], lab[2]), Math.max(body[3], lab[3])];
      if (!inside(all) || roads.some((r) => hit(all, r, 3)) || taken.some((b) => hit(all, b, 5))) {
        if (pub) pubs.push(pub); else if (!isField) houses.push(name.slice(3));
        continue;
      }
      if (isField) field = false;
      taken.push(all);
      objs.push({ name, kind, building: !isField, x, y, w, h, cx: x + w / 2, cy: y + h / 2, lx, ly });
    }
  }
  return objs;
}

/** Sisi jalan tempat bangunan menempel (0 U, 2 T, 4 S, 6 B) atau -1. */
export function sideOf(o: Bld, s: St): number {
  if (s.axis === "V") {
    const overlap = o.y + o.h > s.a0 && o.y < s.a1;
    if (overlap && Math.abs(o.x - (s.c + R / 2)) <= GAP + 1) return 2;
    if (overlap && Math.abs(o.x + o.w - (s.c - R / 2)) <= GAP + 1) return 6;
  } else {
    const overlap = o.x + o.w > s.a0 && o.x < s.a1;
    if (overlap && Math.abs(o.y - (s.c + R / 2)) <= GAP + 1) return 4;
    if (overlap && Math.abs(o.y + o.h - (s.c - R / 2)) <= GAP + 1) return 0;
  }
  return -1;
}

// ---------- siluet hitam ----------
const r = (x: number, y: number, w: number, h: number, fill = INK) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${fill}"/>`;
const pg = (pts: number[][], fill = INK) => `<polygon points="${pts.map((p) => p.map(f1).join(",")).join(" ")}" fill="${fill}"/>`;
const win = (x: number, y: number, cols: number, rows: number, cw: number, ch: number, gx: number, gy: number) =>
  Array.from({ length: cols * rows }, (_, i) => r(x + (i % cols) * (cw + gx), y + Math.floor(i / cols) * (ch + gy), cw, ch, "#fff")).join("");

function silhouette(o: Bld): string {
  const { x, y, w, h } = o;
  switch (o.kind) {
    case "rumah":
      return pg([[x - 2, y + 13], [x + w / 2, y], [x + w + 2, y + 13]]) + r(x + 3, y + 12, w - 6, h - 12) + r(x + w - 11, y + 2, 5, 8)
        + r(x + w / 2 - 4, y + h - 11, 8, 11, "#fff") + win(x + 7, y + 16, 1, 1, 7, 6, 0, 0) + win(x + w - 14, y + 16, 1, 1, 7, 6, 0, 0);
    case "balai":
      return pg([[x - 3, y + 14], [x + 10, y], [x + w - 10, y], [x + w + 3, y + 14]]) + r(x + 3, y + 13, w - 6, h - 13) + win(x + 8, y + 18, 4, 1, 7, 7, 5, 0) + r(x + w / 2 - 4, y + h - 9, 8, 9, "#fff");
    case "sekolah":
      return pg([[x - 2, y + 13], [x + w / 2 - 4, y + 3], [x + w + 2, y + 13]]) + r(x + 2, y + 12, w - 4, h - 12) + win(x + 7, y + 17, 5, 1, 6, 7, 3.5, 0)
        + r(x + w / 2 - 4, y + h - 9, 8, 9, "#fff") + r(x + w / 2 - 5, y - 10, 1.6, 14) + pg([[x + w / 2 - 3.4, y - 10], [x + w / 2 + 7, y - 7], [x + w / 2 - 3.4, y - 4]]);
    case "masjid":
      return r(x + 10, y + 18, w - 20, h - 18) + `<path d="M${f1(x + w / 2 - 15)} ${f1(y + 19)}a15 15 0 0 1 30 0z" fill="${INK}"/>` + r(x + w / 2 - 0.8, y - 2, 1.6, 6)
        + [x + 2, x + w - 7].map((mx) => r(mx, y + 6, 5, h - 6) + pg([[mx, y + 6], [mx + 2.5, y], [mx + 5, y + 6]])).join("")
        + [x + 15, x + w / 2 - 3, x + w - 21].map((ax) => `<path d="M${f1(ax)} ${f1(y + h)}v-9a3 3 0 0 1 6 0v9z" fill="#fff"/>`).join("");
    case "gereja":
      return r(x + 15, y + 18, w - 15, h - 18) + pg([[x + 13, y + 19], [x + 15 + (w - 15) / 2, y + 9], [x + w + 1, y + 19]]) + r(x, y + 8, 15, h - 8) + pg([[x - 1, y + 9], [x + 7.5, y], [x + 16, y + 9]])
        + r(x + 6.7, y - 9, 1.6, 9) + r(x + 4, y - 6, 7, 1.6) + win(x + 20, y + 23, 3, 1, 5, 8, 4, 0) + r(x + 4, y + h - 10, 7, 10, "#fff");
    case "polisi":
      return r(x, y + 6, w, h - 6) + r(x - 2, y + 4, w + 4, 4) + win(x + 5, y + 13, 5, 2, 6, 6, 3.5, 4) + r(x + w / 2 - 5, y + h - 11, 10, 11, "#fff")
        + `<polygon points="${star(x + w / 2, y - 3, 6)}" fill="${INK}"/>`;
    case "klinik":
      return r(x, y + 8, w, h - 8) + win(x + 5, y + 20, 4, 1, 6, 6, 6, 0) + r(x + w / 2 - 7, y - 4, 14, 14) + r(x + w / 2 - 1.8, y - 2, 3.6, 10, "#fff") + r(x + w / 2 - 5, y + 1.2, 10, 3.6, "#fff") + r(x + w / 2 - 4, y + h - 9, 8, 9, "#fff");
    case "menara":
      return r(x, y, w - 14, h) + r(x + w - 16, y + 18, 16, h - 18) + win(x + 4, y + 4, 3, 4, 6, 6, 3, 4) + win(x + w - 12, y + 23, 2, 2, 4, 5, 3, 4);
    case "toko":
      return r(x, y + 12, w, h - 12) + Array.from({ length: 6 }, (_, i) => `<path d="M${f1(x - 1 + i * (w + 2) / 6)} ${f1(y + 4)}h${f1((w + 2) / 6)}v8a${f1((w + 2) / 12)} 4 0 0 1 -${f1((w + 2) / 6)} 0z" fill="${i % 2 ? INK : "#fff"}" stroke="${INK}" stroke-width="1.2"/>`).join("")
        + r(x + 5, y + 18, w - 10, 7, "#fff") + r(x + w / 2 - 4, y + h - 9, 8, 9, "#fff");
    case "bank":
      return pg([[x - 2, y + 11], [x + w / 2, y], [x + w + 2, y + 11]]) + r(x, y + 11, w, 4) + Array.from({ length: 5 }, (_, i) => r(x + 3 + i * ((w - 10) / 4), y + 16, 4, h - 20)).join("") + r(x - 2, y + h - 4, w + 4, 4);
    case "lapangan":
      return `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="#fff" stroke="${INK}" stroke-width="1.6"/>`
        + (w < h ? `<line x1="${f1(x)}" y1="${f1(y + h / 2)}" x2="${f1(x + w)}" y2="${f1(y + h / 2)}" stroke="${INK}"/>` : `<line x1="${f1(x + w / 2)}" y1="${f1(y)}" x2="${f1(x + w / 2)}" y2="${f1(y + h)}" stroke="${INK}"/>`);
    default: // gedung
      return r(x, y + 4, w, h - 4) + r(x + 4, y, w - 8, 5) + win(x + 5, y + 10, 4, 3, 6, 6, 4, 4) + r(x + w / 2 - 4, y + h - 9, 8, 9, "#fff");
  }
}
function star(cx: number, cy: number, R0: number) {
  return Array.from({ length: 10 }, (_, i) => { const a = (-90 + 36 * i) * Math.PI / 180, rr = i % 2 ? R0 * 0.45 : R0; return `${f1(cx + rr * Math.cos(a))},${f1(cy + rr * Math.sin(a))}`; }).join(" ");
}

// rot = derajat putar searah jarum jam (90 = Utara di kanan peta); huruf tetap tegak.
function compass2(cx: number, cy: number, rot = 0) {
  const L = ["U", "TL", "T", "TG", "S", "BD", "B", "BL"].map((s, i) => {
    const a = (i * 45 + rot) * Math.PI / 180, d = i % 2 ? 22 : 26;
    return `<text x="${f1(cx + d * Math.sin(a))}" y="${f1(cy - d * Math.cos(a) + 4)}" text-anchor="middle" font-size="${i % 2 ? 9.5 : 11}" font-weight="700" fill="${INK}" ${FONT}>${s}</text>`;
  }).join("");
  const needle = pg([[cx, cy - 16], [cx + 4, cy], [cx - 4, cy]]) + pg([[cx, cy + 16], [cx + 4, cy], [cx - 4, cy]], "#fff")
    + `<path d="M${cx} ${cy + 16}L${cx + 4} ${cy}L${cx - 4} ${cy}z" fill="none" stroke="${INK}"/>`;
  const all = `<circle cx="${cx}" cy="${cy}" r="33" fill="#fff" stroke="${INK}" stroke-width="1.2"/>` + (rot ? `<g transform="rotate(${rot} ${cx} ${cy})">${needle}</g>` : needle) + L;
  // Peta diputar: kompas 1,5× supaya huruf terbaca di HP (menutup pojok kanan-atas peta, lihat ROT_COMPASS).
  return rot ? `<g transform="translate(${cx} ${cy}) scale(1.5) translate(${-cx} ${-cy})">${all}</g>` : all;
}

/** Nama jalan di tengah ruas terpanjang di antara persimpangan. */
function streetLabel(s: St, all: St[]) {
  const cuts = [s.a0, ...all.filter((o) => o.axis !== s.axis && meets(s, o)).map((o) => o.c), s.a1].sort((a, b) => a - b);
  let best = [s.a0, s.a1];
  for (let i = 1; i < cuts.length; i++) if (cuts[i] - cuts[i - 1] > best[1] - best[0]) best = [cuts[i - 1], cuts[i]];
  const m = (best[0] + best[1]) / 2, t = `font-size="11.5" font-weight="700" fill="${INK}" ${FONT} text-anchor="middle"`;
  return s.axis === "H" ? `<text x="${f1(m)}" y="${f1(s.c + 4)}" ${t}>${s.name}</text>` : `<text transform="translate(${f1(s.c + 4)} ${f1(m)}) rotate(-90)" ${t}>${s.name}</text>`;
}

export function renderMap2(p: Map2, n: number, extra?: { cap: string[]; over: string; defs: string }, rot = 0): string {
  const line = (s: St, w: number, c: string) => s.axis === "V"
    ? `<line x1="${s.c}" y1="${s.a0}" x2="${s.c}" y2="${s.a1}" stroke="${c}" stroke-width="${w}" stroke-linecap="square"/>`
    : `<line x1="${s.a0}" y1="${s.c}" x2="${s.a1}" y2="${s.c}" stroke="${c}" stroke-width="${w}" stroke-linecap="square"/>`;
  const roads = p.streets.map((s) => line(s, R + 3, INK)).join("") + p.streets.map((s) => line(s, R - 1, "#fff")).join("");
  const objs = p.objs.map((o) => silhouette(o) + `<text x="${f1(o.lx)}" y="${f1(o.ly)}" text-anchor="middle" font-size="12.5" font-weight="${o.building ? 600 : 700}" fill="${INK}" ${FONT}>${o.name}</text>`).join("");
  const head = extra
    ? `<defs>${extra.defs}</defs><rect x="0" y="${TOP - 4}" width="${W}" height="${H - TOP + 4}" fill="#fff" opacity=".45"/>${extra.over}<text x="${M + 4}" y="30" font-size="14" font-weight="700" fill="${INK}" ${FONT}>${extra.cap[0]}</text><text x="${M + 4}" y="52" font-size="14" font-weight="700" fill="#15803d" ${FONT}>${extra.cap[1]}</text>`
    : `<text x="${M + 4}" y="30" font-size="15" font-weight="700" fill="${INK}" ${FONT}>Peta ${n}</text><text x="${M + 4}" y="50" font-size="12" fill="#444" ${FONT}>${rot ? "Arah mengikuti kompas" : "Atas peta = Utara"}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${extra ? "Pembahasan" : "Denah"} peta ${n}">`
    + `<rect width="${W}" height="${H}" fill="#fff"/><defs><clipPath id="mapclip"><rect x="${M}" y="${TOP}" width="${W - 2 * M}" height="${H - TOP - M}"/></clipPath></defs><g clip-path="url(#mapclip)">${roads}</g>`
    + objs + p.streets.map((s) => streetLabel(s, p.streets)).join("")
    + `<rect x="${M}" y="${TOP}" width="${W - 2 * M}" height="${H - TOP - M}" fill="none" stroke="${INK}" stroke-width="1.5"/>` + (rot ? compass2(W - 60, 51, rot) : compass2(W - 46, 42)) + head + "</svg>";
}
