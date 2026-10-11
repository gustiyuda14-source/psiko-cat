import * as fs from "fs";
import * as path from "path";

// Generator K17 Denah & Arah Mata Angin (pedoman: Claude Doc "Pedoman Penyusunan Bank Soal
// Denah & Arah Mata Angin", 2026-10-11). Tiap peta = 3×3 blok dipisah 2 jalan tegak + 2 jalan
// mendatar, kompas 8 arah, atas = Utara. Lima soal per peta: 2 ARAH pilih bangunan, 1 ARAH pilih
// arah, 2 RUTE "bangunan pertama di kiri/kanan setelah belokan terakhir".
// Arah diukur titik tengah ke titik tengah ikon (sektor 45°); kunci wajib ≤ 10° dari pusat
// sektornya, pengecoh ≥ 35° dari pusat sektor kunci. Tiap pengecoh = satu kesalahan bernama.
//
// Pakai: npx tsx scripts/generate-denah-k17.ts [jumlahPeta=10]
// Hasil: public/drill/img/K17-peta-NN.svg + bank/drill/kecerdasan/K17-denah-arah.json (ditimpa)

const N_MAPS = Number(process.argv[2] ?? 10);
const ROOT = path.join(__dirname, "..");

function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let rnd = mulberry32(17);
const pick = <T>(a: T[]) => a[Math.floor(rnd() * a.length)];
const shuffle = <T>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

// ---------- arah ----------
const DIR = ["Utara", "Timur Laut", "Timur", "Tenggara", "Selatan", "Barat Daya", "Barat", "Barat Laut"];
const SHORT = ["U", "TL", "T", "TG", "S", "BD", "B", "BL"];
const bearing = (ax: number, ay: number, bx: number, by: number) => (Math.atan2(bx - ax, ay - by) * 180 / Math.PI + 360) % 360;
const sectorOf = (b: number) => Math.round(b / 45) % 8;
const angDiff = (a: number, b: number) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
const left = (h: number) => (h + 6) % 8;
const right = (h: number) => (h + 2) % 8;
const ERR_SECTOR: [string, (d: number) => number][] = [
  ["hampir benar, meleset satu langkah di kompas", (d) => (d + 7) % 8], ["hampir benar, meleset satu langkah di kompas", (d) => (d + 1) % 8],
  ["jebakan kiri-kanan tertukar", (d) => (8 - d) % 8],
  ["jebakan atas-bawah tertukar", (d) => (12 - d) % 8],
  ["kebalikannya, acuan dan tujuan tertukar", (d) => (d + 4) % 8],
  ["meleset seperempat putaran", (d) => (d + 2) % 8], ["meleset seperempat putaran", (d) => (d + 6) % 8],
];

// ---------- geometri ----------
const W = 448, M = 8, TOP = 84, R = 30, BW = (W - 2 * M - 2 * R) / 3, BH = 160;
const H = TOP + 3 * BH + 2 * R + M;
const SW = (BW - 12) / 2, SH = (BH - 12) / 2;
const bx0 = (c: number) => M + c * (BW + R), by0 = (r: number) => TOP + r * (BH + R);
const VX = [0, 1].map((i) => bx0(i) + BW + R / 2), HY = [0, 1].map((j) => by0(j) + BH + R / 2);

type Obj = { name: string; kind: string; building: boolean; c: number; r: number; cells: [number, number][]; x: number; y: number; w: number; h: number; cx: number; cy: number };
type Street = { axis: "V" | "H"; i: number; name: string };
type Peta = { objs: Obj[]; streets: Street[]; trees: [number, number][] };

const HOUSES = ["Ani", "Budi", "Dewi", "Eko", "Gita", "Hadi", "Ita", "Joko", "Kiki", "Lia", "Mira", "Nur", "Oki", "Putu", "Rudi", "Tia", "Yudi", "Zul"];
const PUBLIC = ["Kantor Polisi", "Rumah Sakit", "Masjid", "Gereja", "Pura", "SD Harapan", "SMP Bangsa", "Pasar", "Bank", "Kantor Pos", "Balai Desa", "Puskesmas", "Minimarket", "Perpustakaan", "Kantor Camat"];
const STREETS = ["Jl. Melati", "Jl. Mawar", "Jl. Kenanga", "Jl. Anggrek", "Jl. Cempaka", "Jl. Flamboyan", "Jl. Merdeka", "Jl. Pemuda", "Jl. Sudirman", "Jl. Diponegoro", "Jl. Pahlawan", "Jl. Gajah Mada", "Jl. Veteran", "Jl. Kartini"];
const WALKERS = ["Sinta", "Bayu", "Dimas", "Lina", "Tono", "Fajar", "Nisa", "Reza", "Wulan", "Galih"];
// Pola isi blok: s = rumah (1 sel), w = gedung umum (2 sel mendatar); sel kosong diberi pohon.
const PATTERNS: ["s" | "w", [number, number][]][][] = [
  [["w", [[0, 0], [1, 0]]], ["w", [[0, 1], [1, 1]]]],
  [["w", [[0, 0], [1, 0]]], ["s", [[0, 1]]], ["s", [[1, 1]]]],
  [["s", [[0, 0]]], ["s", [[1, 0]]], ["w", [[0, 1], [1, 1]]]],
  [["s", [[0, 0]]], ["s", [[1, 0]]], ["s", [[0, 1]]], ["s", [[1, 1]]]],
  [["w", [[0, 0], [1, 0]]]],
  [["s", [[0, 0]]], ["w", [[0, 1], [1, 1]]]],
  [["s", [[0, 0]]], ["s", [[1, 1]]]],
];

function place(name: string, kind: string, building: boolean, c: number, r: number, cells: [number, number][]): Obj {
  const sx = bx0(c) + 6 + Math.min(...cells.map((k) => k[0])) * SW, sy = by0(r) + 6 + Math.min(...cells.map((k) => k[1])) * SH;
  const full = cells.length === 4, wide = cells.length >= 2;
  const w = full ? BW - 20 : wide ? 92 : 44, h = full ? BH - 44 : wide ? 38 : 34;
  const x = full ? bx0(c) + 10 : sx + ((wide ? 2 * SW : SW) - w) / 2, y = full ? by0(r) + 10 : sy + 8;
  return { name, kind, building, c, r, cells, x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
}

function makePeta(): Peta {
  for (;;) {
    const objs: Obj[] = [], trees: [number, number][] = [];
    const houses = shuffle(HOUSES), pubs = shuffle(PUBLIC);
    const open = Math.floor(rnd() * 9), openKind = pick(["Lapangan", "Taman", "Kolam"]);
    for (let b = 0; b < 9; b++) {
      const c = b % 3, r = Math.floor(b / 3);
      let pat = pick(PATTERNS);
      if (b === open) {
        if (openKind === "Lapangan") { objs.push(place("Lapangan", "lapangan", false, c, r, [[0, 0], [1, 0], [0, 1], [1, 1]])); continue; }
        objs.push(place(openKind, openKind.toLowerCase(), false, c, r, [[0, 0], [1, 0]]));
        pat = pick<typeof pat>([[["w", [[0, 1], [1, 1]]]], [["s", [[0, 1]]], ["s", [[1, 1]]]], [["s", [[0, 1]]]]]);
      }
      const used = new Set<string>();
      for (const [t, cells] of pat) {
        cells.forEach(([sx, sy]) => used.add(`${sx}${sy}`));
        objs.push(t === "w" ? place(pubs.pop()!, "pub", true, c, r, cells) : place(`R. ${houses.pop()}`, "rumah", true, c, r, cells));
      }
      if (b !== open || openKind !== "Lapangan")
        for (const [sx, sy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) if (!used.has(`${sx}${sy}`) && !(b === open && sy === 0)) trees.push([bx0(c) + 6 + sx * SW + SW / 2, by0(r) + 6 + sy * SH + SH / 2]);
    }
    const n = objs.filter((o) => o.building).length;
    if (n < 11 || n > 16) continue;
    const names = shuffle(STREETS);
    const streets: Street[] = [{ axis: "V", i: 0, name: names[0] }, { axis: "V", i: 1, name: names[1] }, { axis: "H", i: 0, name: names[2] }, { axis: "H", i: 1, name: names[3] }];
    return { objs, streets, trees };
  }
}

// ---------- ikon SVG ----------
const f1 = (n: number) => Math.round(n * 10) / 10;
const rect = (x: number, y: number, w: number, h: number, fill: string, extra = "") => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${fill}" ${extra}/>`;
const poly = (pts: number[][], fill: string, extra = "") => `<polygon points="${pts.map((p) => p.map(f1).join(",")).join(" ")}" fill="${fill}" ${extra}/>`;
const LINE = 'stroke="#4b5563" stroke-width="1"';
const ROOFS = ["#c2410c", "#b91c1c", "#92400e", "#475569", "#15803d", "#1d4ed8"];
const windows = (x: number, y: number, w: number, n: number, fill = "#9cd3f0") =>
  Array.from({ length: n }, (_, i) => rect(x + 6 + i * ((w - 12) / n) + 1, y, (w - 12) / n - 4, 7, fill, LINE)).join("");

function icon(o: Obj, roof: string): string {
  const { x, y, w, h } = o;
  if (o.kind === "rumah")
    return poly([[x - 3, y + 14], [x + w / 2, y], [x + w + 3, y + 14]], roof, LINE) + rect(x + 4, y + 14, w - 8, h - 14, "#fdf6e3", LINE)
      + rect(x + w / 2 - 4, y + h - 12, 8, 12, "#8b5a2b") + rect(x + 8, y + 18, 8, 7, "#9cd3f0", LINE) + rect(x + w - 16, y + 18, 8, 7, "#9cd3f0", LINE);
  if (o.kind === "lapangan")
    return rect(x, y, w, h, "#4d9a3e", 'rx="4"') + `<g fill="none" stroke="#fff" stroke-width="1.5">${rect(x + 6, y + 6, w - 12, h - 12, "none")}<line x1="${f1(x + 6)}" y1="${f1(y + h / 2)}" x2="${f1(x + w - 6)}" y2="${f1(y + h / 2)}"/><circle cx="${f1(x + w / 2)}" cy="${f1(y + h / 2)}" r="12"/></g>`;
  if (o.kind === "taman")
    return rect(x, y, w, h, "#9fd38a", 'rx="6"') + `<path d="M${x} ${y + h - 8}Q${x + w / 2} ${y + 8} ${x + w} ${y + 12}" stroke="#e7d7b1" stroke-width="5" fill="none"/>` + [0.2, 0.5, 0.8].map((t) => tree(x + w * t, y + h / 2 - 2, 9)).join("");
  if (o.kind === "kolam")
    return rect(x - 2, y - 2, w + 4, h + 4, "#e5e7eb", 'rx="7"') + rect(x + 3, y + 3, w - 6, h - 6, "#60a5fa", 'rx="5"') + `<path d="M${x + 12} ${y + h / 2}q8 -5 16 0t16 0t16 0t16 0" stroke="#dbeafe" stroke-width="1.5" fill="none"/>`;
  const base = (wall: string, band: string) => rect(x, y + 9, w, h - 9, wall, LINE) + rect(x - 2, y + 3, w + 4, 8, band, LINE) + windows(x, y + 16, w, 5) + rect(x + w / 2 - 5, y + h - 12, 10, 12, "#6b4f2a");
  switch (o.name) {
    case "Kantor Polisi": return base("#e8eef7", "#1e3a8a") + `<polygon points="${starPts(x + w / 2, y + 7, 6)}" fill="#facc15"/>`;
    case "Rumah Sakit": case "Puskesmas": {
      const c = o.name === "Rumah Sakit" ? "#dc2626" : "#0d9488";
      return base("#ffffff", "#e5e7eb") + rect(x + w / 2 - 7, y - 6, 14, 14, "#fff", LINE) + rect(x + w / 2 - 2, y - 4, 4, 10, c) + rect(x + w / 2 - 5, y - 1, 10, 4, c);
    }
    case "Masjid":
      return rect(x + 14, y + 16, w - 28, h - 16, "#f5f5f4", LINE) + `<path d="M${x + w / 2 - 16} ${y + 17}a16 15 0 0 1 32 0z" fill="#15803d" ${LINE}/>`
        + [x + 6, x + w - 12].map((mx) => rect(mx, y + 6, 6, h - 6, "#e7e5e4", LINE) + `<path d="M${mx} ${y + 7}a3 4 0 0 1 6 0z" fill="#15803d"/>`).join("")
        + [x + 26, x + w / 2 - 4, x + w - 34].map((ax) => `<path d="M${ax} ${y + h}v-9a4 4 0 0 1 8 0v9z" fill="#78716c"/>`).join("") + `<circle cx="${x + w / 2}" cy="${y - 1}" r="2.5" fill="#ca8a04"/>`;
    case "Gereja":
      return poly([[x + 18, y + 16], [x + w / 2 + 12, y + 4], [x + w + 2, y + 16]], "#7c2d12", LINE) + rect(x + 22, y + 16, w - 24, h - 16, "#fef3c7", LINE) + windows(x + 20, y + 21, w - 22, 4)
        + rect(x + 2, y + 2, 18, h - 2, "#fde68a", LINE) + poly([[x, y + 4], [x + 11, y - 6], [x + 22, y + 4]], "#7c2d12") + rect(x + 10, y - 13, 2, 9, "#374151") + rect(x + 7, y - 10, 8, 2, "#374151") + rect(x + 7, y + h - 12, 8, 12, "#6b4f2a");
    case "Pura": { // candi bentar: dua belahan berundak, sisi dalam tegak
      const half = [[0, h], [0, 16], [10, 16], [10, 8], [20, 8], [20, 0], [30, 0], [30, -6], [38, -6], [38, h]];
      return poly(half.map(([u, v]) => [x + 4 + u, y + v]), "#b45309", LINE) + poly(half.map(([u, v]) => [x + w - 4 - u, y + v]), "#b45309", LINE) + rect(x, y + h - 4, w, 4, "#78716c");
    }
    case "SD Harapan": case "SMP Bangsa":
      return poly([[x - 3, y + 14], [x + 10, y + 2], [x + w - 10, y + 2], [x + w + 3, y + 14]], "#b91c1c", LINE) + rect(x + 2, y + 14, w - 4, h - 14, "#fff7d6", LINE) + windows(x, y + 19, w, 5)
        + rect(x + w / 2 - 5, y + h - 12, 10, 12, "#6b4f2a") + rect(x + w + 4, y - 8, 1.5, h + 8, "#374151") + rect(x + w + 5.5, y - 8, 10, 3.5, "#dc2626") + rect(x + w + 5.5, y - 4.5, 10, 3.5, "#fff", LINE);
    case "Pasar":
      return rect(x, y + 14, w, h - 14, "#fef9c3", LINE) + Array.from({ length: 8 }, (_, i) => rect(x - 2 + i * (w + 4) / 8, y + 4, (w + 4) / 8, 10, i % 2 ? "#fff" : "#dc2626", LINE)).join("")
        + Array.from({ length: 3 }, (_, i) => rect(x + 8 + i * 28, y + 20, 20, 12, "#fdba74", LINE)).join("");
    case "Bank":
      return poly([[x - 2, y + 12], [x + w / 2, y], [x + w + 2, y + 12]], "#9ca3af", LINE) + rect(x + 2, y + 12, w - 4, 4, "#d1d5db", LINE)
        + Array.from({ length: 5 }, (_, i) => rect(x + 8 + i * 17, y + 16, 7, h - 20, "#f3f4f6", LINE)).join("") + rect(x - 2, y + h - 4, w + 4, 4, "#9ca3af", LINE);
    case "Kantor Pos": return base("#ffffff", "#ea580c") + rect(x + w / 2 - 7, y + 4, 14, 6, "#fff", LINE);
    case "Balai Desa":
      return poly([[x - 4, y + 18], [x + 14, y + 8], [x + w - 14, y + 8], [x + w + 4, y + 18]], "#92400e", LINE) + poly([[x + 18, y + 8], [x + 32, y - 2], [x + w - 32, y - 2], [x + w - 18, y + 8]], "#78350f", LINE)
        + rect(x + 2, y + h - 3, w - 4, 3, "#a8a29e") + [0.1, 0.37, 0.63, 0.9].map((t) => rect(x + w * t - 2, y + 18, 4, h - 21, "#a16207")).join("");
    case "Minimarket": return rect(x, y + 9, w, h - 9, "#bfdbfe", LINE) + rect(x - 2, y + 3, w + 4, 8, "#2563eb", LINE) + rect(x - 2, y + 9, w + 4, 2, "#facc15") + rect(x + w / 2 - 8, y + 16, 16, h - 16, "#93c5fd", LINE);
    case "Perpustakaan": return base("#ede9fe", "#6d28d9") + ["#f59e0b", "#10b981", "#ef4444"].map((c, i) => rect(x + w / 2 - 7 + i * 5, y + 3, 4, 8, c)).join("");
    default: // Kantor Camat
      return poly([[x - 3, y + 14], [x + w / 2, y + 2], [x + w + 3, y + 14]], "#334155", LINE) + rect(x + 2, y + 14, w - 4, h - 14, "#f1f5f9", LINE) + windows(x, y + 19, w, 5) + rect(x + w / 2 - 5, y + h - 12, 10, 12, "#6b4f2a");
  }
}
function starPts(cx: number, cy: number, R0: number) {
  return Array.from({ length: 10 }, (_, i) => { const a = (-90 + 36 * i) * Math.PI / 180, r = i % 2 ? R0 * 0.45 : R0; return `${f1(cx + r * Math.cos(a))},${f1(cy + r * Math.sin(a))}`; }).join(" ");
}
const tree = (x: number, y: number, s = 11) => rect(x - 1.5, y + s * 0.4, 3, s * 0.7, "#7c5a3a") + `<circle cx="${f1(x)}" cy="${f1(y)}" r="${s * 0.75}" fill="#3f8f3a"/><circle cx="${f1(x - s * 0.35)}" cy="${f1(y + 2)}" r="${s * 0.5}" fill="#4fa548"/>`;

const FONT = 'font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif"';
const label = (x: number, y: number, t: string, size = 14) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="middle" font-size="${size}" font-weight="700" fill="#1f2937" stroke="#fff" stroke-width="3" paint-order="stroke" ${FONT}>${t}</text>`;

function compass(cx: number, cy: number) {
  const pts = (a: number, l: number) => [cx + l * Math.sin(a * Math.PI / 180), cy - l * Math.cos(a * Math.PI / 180)];
  const ray = (a: number, l: number, dark: boolean) => poly([pts(a, l), pts(a + 90, 4), [cx, cy]], dark ? "#1f2937" : "#9ca3af") + poly([pts(a, l), pts(a - 90, 4), [cx, cy]], dark ? "#4b5563" : "#d1d5db");
  const rays = [45, 135, 225, 315].map((a) => ray(a, 13, false)).join("") + [0, 90, 180, 270].map((a) => ray(a, 22, a === 0)).join("");
  const labels = SHORT.map((s, i) => { const [lx, ly] = pts(i * 45, i % 2 ? 26 : 30); return `<text x="${f1(lx)}" y="${f1(ly + 4)}" text-anchor="middle" font-size="11" font-weight="700" fill="${i === 0 ? "#b91c1c" : "#1f2937"}" ${FONT}>${s}</text>`; }).join("");
  return `<circle cx="${cx}" cy="${cy}" r="36" fill="#fff" stroke="#d1d5db"/>${rays}${labels}`;
}

// `extra` = gambar pembahasan: peta dipudarkan + coretan (panah, jalur) dan keterangan di pita atas.
function renderSvg(p: Peta, n: number, extra?: { cap: string[]; over: string }): string {
  const roads = rect(M - 4, HY[0] - R / 2, W - 2 * M + 8, R, "#8f98a3") + rect(M - 4, HY[1] - R / 2, W - 2 * M + 8, R, "#8f98a3")
    + rect(VX[0] - R / 2, TOP - 4, R, H - TOP - M + 8, "#8f98a3") + rect(VX[1] - R / 2, TOP - 4, R, H - TOP - M + 8, "#8f98a3");
  const dash = 'stroke="#fff" stroke-width="1.5" stroke-dasharray="8 6"';
  const lines = HY.map((y) => `<line x1="${M}" y1="${f1(y)}" x2="${W - M}" y2="${f1(y)}" ${dash}/>`).join("") + VX.map((x) => `<line x1="${f1(x)}" y1="${TOP}" x2="${f1(x)}" y2="${H - M}" ${dash}/>`).join("");
  const sname = (s: Street) => {
    const t = `font-size="13" font-weight="700" fill="#fff" ${FONT} text-anchor="middle"`;
    if (s.axis === "H") { const x = bx0(1) + BW / 2, y = HY[s.i]; return `${rect(x - 52, y - 9, 104, 18, "#8f98a3")}<text x="${f1(x)}" y="${f1(y + 4.5)}" ${t}>${s.name}</text>`; }
    const x = VX[s.i], y = by0(1) + BH / 2;
    return `${rect(x - 9, y - 52, 18, 104, "#8f98a3")}<text transform="translate(${f1(x + 4.5)} ${f1(y)}) rotate(-90)" ${t}>${s.name}</text>`;
  };
  const blocks = [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => rect(bx0(c), by0(r), BW, BH, "#e7efd9", 'rx="6" stroke="#c9d8b4"'))).join("");
  const objs = p.objs.map((o, i) => icon(o, ROOFS[i % ROOFS.length]) + (o.cells.length === 4 ? label(o.cx, o.cy + 5, o.name) : label(o.cx, o.y + o.h + 17, o.name))).join("");
  const head = extra
    ? `<defs>${MK("ok", C_OK)}${MK("no", C_NO)}${MK("ref", C_REF)}</defs>${rect(0, TOP - 6, W, H - TOP + 6, "#fff", 'opacity=".4"')}${extra.over}`
      + `<text x="${M + 4}" y="30" font-size="14" font-weight="700" fill="#1f2937" ${FONT}>${extra.cap[0]}</text><text x="${M + 4}" y="52" font-size="14" font-weight="700" fill="${C_OK}" ${FONT}>${extra.cap[1]}</text>`
    : `<text x="${M + 4}" y="30" font-size="15" font-weight="700" fill="#1f2937" ${FONT}>Peta ${n}</text><text x="${M + 4}" y="50" font-size="12" fill="#4b5563" ${FONT}>Atas peta = Utara</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${f1(H)}" width="${W}" height="${f1(H)}" role="img" aria-label="${extra ? "Pembahasan" : "Denah"} peta ${n}">`
    + rect(0, 0, W, H, "#f8f7f2") + roads + lines + blocks + p.trees.map(([x, y]) => tree(x, y - 6)).join("") + objs + p.streets.map(sname).join("")
    + compass(W - 46, 42) + head + "</svg>";
}

// ---------- coretan pembahasan ----------
const C_OK = "#15803d", C_NO = "#dc2626", C_REF = "#2563eb";
const MK = (id: string, c: string) => `<marker id="${id}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${c}"/></marker>`;
const ring = (o: Obj, c: string, dash = false) => rect(o.x - 6, o.y - 6, o.w + 12, o.h + 34, "none", `rx="8" stroke="${c}" stroke-width="3"${dash ? ' stroke-dasharray="6 4"' : ""}`);
const tag = (x: number, y: number, t: string, c: string) => {
  const w = t.length * 7 + 14;
  return rect(x - w / 2, y - 11, w, 20, "#fff", `rx="10" stroke="${c}" stroke-width="1.5"`) + `<text x="${f1(x)}" y="${f1(y + 4)}" text-anchor="middle" font-size="12" font-weight="700" fill="${c}" ${FONT}>${t}</text>`;
};
function arrow(a: Obj, b: Obj, c: string, mk: string, t: string, dash = false) {
  const dx = b.cx - a.cx, dy = b.cy - a.cy, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
  return `<line x1="${f1(a.cx + ux * 12)}" y1="${f1(a.cy + uy * 12)}" x2="${f1(b.cx - ux * 22)}" y2="${f1(b.cy - uy * 22)}" stroke="${c}" stroke-width="4" stroke-linecap="round"${dash ? ' stroke-dasharray="7 6"' : ""} marker-end="url(#${mk})"/>`
    + tag(a.cx + dx * 0.55, a.cy + dy * 0.55, t, c);
}

// ---------- soal ----------
type Item = Record<string, unknown>;
const LET = ["a", "b", "c", "d", "e"];
const INSTRUKSI = "Gunakan denah. Utara ditunjukkan kompas (atas peta). Arah diukur dari titik tengah bangunan. Belok kiri/kanan dihitung dari arah hadap pejalan. Bangunan di sebelah kiri/kanan = bangunan yang berbatasan langsung dengan jalan yang sedang dilalui. Lapangan, taman, dan kolam bukan bangunan.";
const bOf = (a: Obj, b: Obj) => bearing(a.cx, a.cy, b.cx, b.cy);
const corners = (o: Obj) => [[o.x, o.y], [o.x + o.w, o.y], [o.x, o.y + o.h], [o.x + o.w, o.y + o.h]];
const safeKey = (a: Obj, b: Obj) => { const br = bOf(a, b), d = sectorOf(br); return angDiff(br, d * 45) <= 10 && corners(b).every(([x, y]) => sectorOf(bearing(a.cx, a.cy, x, y)) === d) ? d : -1; };
// Bahasa pembahasan: arah peta dalam kata sehari-hari (atas/kanan/bawah/kiri).
const POS = ["atas", "kanan-atas", "kanan", "kanan-bawah", "bawah", "kiri-bawah", "kiri", "kiri-atas"];
const MOVE = ["lurus ke atas", "serong ke kanan-atas", "lurus ke kanan", "serong ke kanan-bawah", "lurus ke bawah", "serong ke kiri-bawah", "lurus ke kiri", "serong ke kiri-atas"];
let story = 0; // pemilih gambaran nyata bergilir (tanpa rnd supaya kunci tetap sama)
const tipsArah = (d: number) => d % 2
  ? "Tips: arah serong (Timur Laut, Tenggara, Barat Daya, Barat Laut) artinya bergeser ke samping DAN ke atas/bawah hampir sama jauh. Kalau gesernya hanya sedikit, itu masih arah lurus."
  : "Tips: hafalkan 4 arah utama dulu: atas = Utara, kanan = Timur, bawah = Selatan, kiri = Barat. Arah serong ada di antaranya.";
const nyataArah = (d: number, x: string) => [
  `Gambaran nyata: petugas patroli melapor lewat HT, "Pelaku lari ke arah ${DIR[d]} dari ${x}." Rekan yang memegang peta harus langsung tahu itu ${MOVE[d]} di peta.`,
  `Gambaran nyata: ada laporan "Kebakaran di sebelah ${DIR[d]} ${x}." Petugas yang salah membaca arah akan datang ke tempat yang salah.`,
  `Gambaran nyata: saat latihan lapangan, komandan memberi perintah "Regu 2 bergerak ke ${DIR[d]}!" Kamu harus tahu arahnya tanpa ragu: ${MOVE[d]} di peta.`,
][story++ % 3];

function arrange<T>(key: T, others: T[], pos: number): T[] { const o = [...others]; o.splice(pos, 0, key); return o; }

function arahBangunan(p: Peta, pos: number, used: Set<string>): Item | null {
  const B = p.objs.filter((o) => o.building);
  for (const x of shuffle(B)) for (const y of shuffle(B)) {
    if (x === y || used.has(x.name + y.name) || used.has(y.name + x.name)) continue;
    const d = safeKey(x, y);
    if (d < 0) continue;
    const pool = B.filter((z) => z !== x && z !== y).map((z) => ({ z, br: bOf(x, z) }))
      .filter(({ br }) => angDiff(br, d * 45) >= 35 && angDiff(br, sectorOf(br) * 45) <= 15);
    const ds: { z: Obj; why: string }[] = [];
    for (const [why, f] of ERR_SECTOR) { const z = pool.find(({ z, br }) => sectorOf(br) === f(d) && !ds.some((q) => q.z === z)); if (z && ds.length < 4) ds.push({ z: z.z, why }); }
    for (const { z } of shuffle(pool)) if (ds.length < 4 && !ds.some((q) => q.z === z)) ds.push({ z, why: "" });
    for (const q of ds) q.why = ERR_SECTOR.find(([, f]) => f(d) === sectorOf(bOf(x, q.z)))?.[0] ?? "bukan arah yang ditanya";
    if (ds.length < 4) continue;
    used.add(x.name + y.name);
    const opts = arrange({ z: y, why: "" }, shuffle(ds), pos);
    const near = ds.filter((q) => angDiff(bOf(x, q.z), d * 45) <= 50).length;
    const why2 = opts.map((o, i) => { const s = sectorOf(bOf(x, o.z)); return o.z === y ? "" : `Opsi ${LET[i].toUpperCase()} (${o.z.name}): letaknya di ${POS[s]} ${x.name}, jadi ${DIR[s]}; ${o.why}.`; }).filter(Boolean).join("\n");
    const close = ds.filter((q) => ERR_SECTOR.slice(0, 2).some(([, f]) => f(d) === sectorOf(bOf(x, q.z))))
      .sort((a, b) => angDiff(bOf(x, a.z), d * 45) - angDiff(bOf(x, b.z), d * 45)).slice(0, 1);
    return {
      cap: [`Dari ${x.name} ke ${y.name}:`, `${MOVE[d]} = ${DIR[d]}`],
      over: ring(x, C_REF) + ring(y, C_OK) + close.map((q) => ring(q.z, C_NO, true) + arrow(x, q.z, C_NO, "no", `${DIR[sectorOf(bOf(x, q.z))]} ✗`, true)).join("") + arrow(x, y, C_OK, "ok", `${DIR[d]} ✓`),
      sub_type: "FIG-DENAH-ARAH", tier: d % 2 === 0 ? 1 : near >= 2 ? 3 : 2,
      stem: `Di antara pilihan berikut, bangunan yang terletak di arah ${DIR[d]} dari ${x.name} adalah …`,
      opsi: Object.fromEntries(opts.map((o, i) => [LET[i], o.z.name])), kunci: [LET[pos]],
      pembahasan: `Langkah 1: Taruh jari di tengah ${x.name}.\nLangkah 2: Lihat kompas: ${DIR[d]} = ${MOVE[d]}. Geser jari ${MOVE[d]} dari ${x.name}.\nLangkah 3: Bangunan pilihan yang kena arah itu adalah ${y.name}.<br>Kenapa yang lain salah:\n${why2}\nJawaban: ${y.name}.<br>${nyataArah(d, x.name)}\n${tipsArah(d)}`,
    };
  }
  return null;
}

function arahArah(p: Peta, pos: number, used: Set<string>): Item | null {
  const B = p.objs.filter((o) => o.building);
  for (const x of shuffle(B)) for (const y of shuffle(B)) {
    if (x === y || used.has(x.name + y.name) || used.has(y.name + x.name)) continue;
    const d = safeKey(x, y);
    if (d < 0) continue;
    used.add(x.name + y.name);
    const ds: { s: number; why: string }[] = [];
    for (const [why, f] of ERR_SECTOR) if (f(d) !== d && !ds.some((q) => q.s === f(d)) && ds.length < 4) ds.push({ s: f(d), why });
    // Urut searah jarum jam mulai dari arah tertentu supaya kunci jatuh di `pos`.
    const all = [{ s: d, why: "" }, ...ds].sort((a, b) => a.s - b.s);
    const k = all.findIndex((o) => o.s === d), opts = all.map((_, i) => all[(i + k - pos + 5) % 5]);
    const why2 = opts.map((o, i) => o.s === d ? "" : `Opsi ${LET[i].toUpperCase()} (${DIR[o.s]}): itu arah ${POS[o.s]}; ${o.why}.`).filter(Boolean).join("\n");
    const geser = d % 2 ? `geser ke ${d < 4 ? "kanan" : "kiri"} dan ke ${d === 1 || d === 7 ? "atas" : "bawah"} hampir sama jauh` : "hampir lurus";
    return {
      cap: [`Dari ${x.name} ke ${y.name}:`, `${MOVE[d]} = ${DIR[d]}`],
      over: ring(x, C_REF) + ring(y, C_OK) + arrow(x, y, C_OK, "ok", `${DIR[d]} ✓`),
      sub_type: "FIG-DENAH-ARAH", tier: d % 2 === 0 ? 1 : 2,
      stem: `${y.name} terletak di arah mana dari ${x.name}?`,
      opsi: Object.fromEntries(opts.map((o, i) => [LET[i], DIR[o.s]])), kunci: [LET[pos]],
      pembahasan: `Langkah 1: Taruh jari di tengah ${x.name}, lalu cari ${y.name}.\nLangkah 2: ${y.name} ada di ${POS[d]} ${x.name} (${geser}).\nLangkah 3: Cocokkan dengan kompas: ${POS[d]} = ${DIR[d]}.<br>Kenapa yang lain salah:\n${why2}\nJawaban: ${DIR[d]}.<br>${nyataArah(d, x.name)}\n${tipsArah(d)}`,
    };
  }
  return null;
}

// Objek di sisi `side` (arah mata angin) jalan `s`, di depan titik `at` searah `h`, urut terdekat.
function along(p: Peta, s: Street, h: number, side: number, at: number): Obj[] {
  const res = p.objs.filter((o) => {
    if (s.axis === "V") return side === 6 ? o.c === s.i && o.cells.some((k) => k[0] === 1) : o.c === s.i + 1 && o.cells.some((k) => k[0] === 0);
    return side === 0 ? o.r === s.i && o.cells.some((k) => k[1] === 1) : o.r === s.i + 1 && o.cells.some((k) => k[1] === 0);
  }).filter((o) => (s.axis === "V" ? (h === 0 ? o.cy < at : o.cy > at) : (h === 2 ? o.cx > at : o.cx < at)));
  return res.sort((a, b) => Math.abs((s.axis === "V" ? a.cy : a.cx) - at) - Math.abs((s.axis === "V" ? b.cy : b.cx) - at));
}
const nth = (l: Obj[], n: number) => (l.slice(0, n + 1).every((o) => o.building) ? l[n] ?? null : null);
const touches = (o: Obj, s: Street) => s.axis === "V"
  ? (o.c === s.i && o.cells.some((k) => k[0] === 1)) || (o.c === s.i + 1 && o.cells.some((k) => k[0] === 0))
  : (o.r === s.i && o.cells.some((k) => k[1] === 1)) || (o.r === s.i + 1 && o.cells.some((k) => k[1] === 0));

function rute(p: Peta, pos: number, turns: number, walker: string): Item | null {
  for (let tries = 0; tries < 400; tries++) {
    const x = pick(p.objs.filter((o) => o.building));
    const s0 = pick(p.streets.filter((s) => touches(x, s)));
    if (!s0) continue;
    let h = s0.axis === "V" ? pick([0, 4]) : pick([2, 6]);
    let st = s0, at = s0.axis === "V" ? x.cy : x.cx;
    const steps: { st: Street; h: number; turn: "kiri" | "kanan"; cross: Street; at: number }[] = [];
    for (let t = 0; t < turns; t++) {
      const cross = shuffle(p.streets.filter((c) => c.axis !== st.axis && (st.axis === "V" ? (h === 0 ? HY[c.i] < at : HY[c.i] > at) : (h === 2 ? VX[c.i] > at : VX[c.i] < at))))[0];
      if (!cross) break;
      const turn = pick(["kiri", "kanan"] as const);
      steps.push({ st, h, turn, cross, at });
      at = st.axis === "V" ? VX[st.i] : HY[st.i];
      h = turn === "kiri" ? left(h) : right(h);
      st = cross;
    }
    if (steps.length !== turns) continue;
    const last = steps[turns - 1], K = pick(["kiri", "kanan"] as const), notK = K === "kiri" ? "kanan" : "kiri";
    const dirFor = (hd: number, nm: string) => (nm === "kiri" ? left(hd) : right(hd));
    const side = dirFor(h, K), rev = (h + 4) % 8;
    const turnAt = last.st.axis === "V" ? HY[last.cross.i] : VX[last.cross.i];
    const key = nth(along(p, st, h, side, at), 0);
    if (!key || key === x) continue;
    const cand: [Obj | null, string][] = [
      [nth(along(p, st, h, dirFor(h, notK), at), 0), `ada di sisi ${notK}; kiri dan kanan tertukar`],
      [nth(along(p, st, rev, dirFor(rev, K), at), 0), `itu kalau belokan terakhir salah arah (belok ${last.turn === "kiri" ? "kanan" : "kiri"})`],
      [nth(along(p, last.st, last.h, dirFor(last.h, K), turnAt), 0), `itu kalau ${walker} lupa belok di ${last.cross.name} dan jalan lurus terus`],
      [nth(along(p, st, h, side, at), 1), `itu bangunan kedua; yang pertama terlewat`],
      [nth(along(p, st, rev, dirFor(rev, notK), at), 0), `itu kalau belokan terakhir salah arah dan sisinya juga tertukar`],
      [nth(along(p, st, h, dirFor(h, notK), at), 1), `itu bangunan kedua di sisi ${notK}`],
    ];
    const ds: { z: Obj; why: string }[] = [];
    for (const [z, why] of cand) if (z && z !== key && z !== x && !ds.some((q) => q.z === z) && ds.length < 4) ds.push({ z, why });
    if (ds.length < 4) continue;
    const opts = arrange({ z: key, why: "" }, shuffle(ds), pos);
    const heads = [...steps.map((s) => s.h), h];
    const tier = turns === 3 || heads.includes(4) ? 3 : turns === 1 && heads.every((q) => q === 0 || q === 2) ? 1 : 2;
    const route = steps.map((s, i) => `${i ? "lalu di" : "Di"} persimpangan ${s.cross.name} ia belok ${s.turn}`).join(", ");
    const nh = (i: number) => (i + 1 < turns ? steps[i + 1].h : h);
    const trace = steps.map((s, i) => `Langkah ${i + 2}: Di ${s.cross.name} belok ${s.turn}. Menghadap ${DIR[s.h]}, ${s.turn}nya adalah ${DIR[nh(i)]}. Sekarang menghadap ${DIR[nh(i)]}.`).join("\n");
    const why2 = opts.map((o, i) => o.z === key ? "" : `Opsi ${LET[i].toUpperCase()} (${o.z.name}): ${o.why}.`).filter(Boolean).join("\n");
    const pt = (a: Street, b: Street) => (a.axis === "V" ? [VX[a.i], HY[b.i]] : [VX[b.i], HY[a.i]]);
    const path = [s0.axis === "V" ? [VX[s0.i], x.cy] : [x.cx, HY[s0.i]], ...steps.map((s) => pt(s.st, s.cross)), st.axis === "V" ? [VX[st.i], key.cy] : [key.cx, HY[st.i]]];
    const swap = ds.find((q) => q.why.startsWith("ada di sisi"));
    const nyata = story++ % 2
      ? `Gambaran nyata: seperti memandu ambulans lewat telepon. Sopir yang menghadap ${DIR[h]} melihat ${DIR[left(h)]} di kirinya dan ${DIR[right(h)]} di kanannya${h === 4 ? ", kebalikan dari kiri-kanan layar" : ""}.`
      : "Gambaran nyata: kamu memandu mobil patroli lewat HT. Sopir hanya melihat jalan di depannya, jadi perintah belok kiri/kanan harus dihitung dari arah hadap sopir, bukan dari peta.";
    const tips = heads.includes(4)
      ? "Tips: putar badan atau HP-mu mengikuti arah jalan. Saat menghadap Selatan (ke bawah peta), kiri jadi Timur dan kanan jadi Barat, kebalikan dari yang terlihat di layar."
      : 'Tips: setiap kali belok, ucapkan dalam hati "sekarang aku menghadap ..." supaya arah tidak tertukar.';
    return {
      cap: [`Jalur ${walker}: ${turns} belokan`, `Menghadap ${DIR[h]}, ${K} = ${DIR[side]}`],
      over: ring(x, C_REF) + ring(key, C_OK) + (swap ? ring(swap.z, C_NO, true) + tag(swap.z.cx, swap.z.y - 8, `${notK} ✗`, C_NO) : "")
        + `<polyline points="${path.map((q) => q.map(f1).join(",")).join(" ")}" fill="none" stroke="${C_REF}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" opacity=".9" marker-end="url(#ref)"/>`
        + `<circle cx="${f1(path[0][0])}" cy="${f1(path[0][1])}" r="6" fill="${C_REF}"/>` + tag(x.cx, x.y - 8, "Mulai", C_REF)
        + steps.map((s, i) => { const [qx, qy] = path[i + 1]; return `<circle cx="${f1(qx)}" cy="${f1(qy)}" r="10" fill="${C_REF}"/><text x="${f1(qx)}" y="${f1(qy + 4.5)}" text-anchor="middle" font-size="13" font-weight="700" fill="#fff" ${FONT}>${i + 1}</text>` + tag(qx + (qx > W / 2 ? 46 : -46), qy, `${s.turn} → ${SHORT[nh(i)]}`, C_REF); }).join("")
        + tag(key.cx, key.y - 8, `${K} ✓`, C_OK),
      sub_type: "FIG-DENAH-RUTE", tier,
      stem: `${walker} keluar dari ${x.name} ke ${s0.name}, lalu berjalan ke arah ${DIR[steps[0].h]}. ${route}. Bangunan pertama di sebelah ${K} ${walker} setelah belokan terakhir adalah …`,
      opsi: Object.fromEntries(opts.map((o, i) => [LET[i], o.z.name])), kunci: [LET[pos]],
      pembahasan: `Langkah 1: ${walker} keluar dari ${x.name} ke ${s0.name}, menghadap ${DIR[steps[0].h]}.\n${trace}\nLangkah ${turns + 2}: Menghadap ${DIR[h]}, sisi ${K} = ${DIR[side]}. Bangunan pertama di sisi itu: ${key.name}.<br>Kenapa yang lain salah:\n${why2}\nJawaban: ${key.name}.<br>${nyata}\n${tips}`,
    };
  }
  return null;
}

// ---------- utama ----------
const items: Item[] = [];
const BANK = path.join(ROOT, "bank/drill/kecerdasan/K17-denah-arah.json");
const OLD = new Map<string, Item>(fs.existsSync(BANK) ? (JSON.parse(fs.readFileSync(BANK, "utf8")) as Item[]).map((i) => [i.id as string, i]) : []);
const positions = shuffle(Array.from({ length: N_MAPS * 5 }, (_, i) => i % 5));
let n = 0;
for (let m = 1; m <= N_MAPS; m++) {
  for (let attempt = 0; ; attempt++) {
    rnd = mulberry32(1700 + m * 101 + attempt);
    const p = makePeta(), used = new Set<string>(), base = n;
    const walkers = shuffle(WALKERS);
    const set = [
      arahBangunan(p, positions[base], used), arahBangunan(p, positions[base + 1], used), arahArah(p, positions[base + 2], used),
      rute(p, positions[base + 3], 1 + (m % 2), walkers[0]), rute(p, positions[base + 4], 2 + (m % 2), walkers[1]),
    ];
    if (set.some((s) => !s)) continue;
    const img = `drill/img/K17-peta-${String(m).padStart(2, "0")}.svg`;
    fs.writeFileSync(path.join(ROOT, "public", img), renderSvg(p, m));
    for (const s of set as Item[]) {
      const id = `K17-N-${String(++n).padStart(3, "0")}`, pb = `${id}.svg`;
      fs.writeFileSync(path.join(ROOT, "data/drill-pembahasan", pb), renderSvg(p, m, s as { cap: string[]; over: string }));
      // Status cek buta tetap berlaku selama stem/opsi/kunci tidak berubah; berubah = harus dicek ulang.
      const was = OLD.get(id), same = was && JSON.stringify([was.stem, was.opsi, was.kunci]) === JSON.stringify([s.stem, s.opsi, s.kunci]);
      items.push({ id, kartu: "K17", sub_type: s.sub_type, tier: s.tier, sumber: "baru", instruksi: INSTRUKSI, stem: s.stem, gambar: img, opsi: s.opsi, kunci: s.kunci, pembahasan: s.pembahasan, gambar_pembahasan: pb, status_kunci: same ? was.status_kunci : "tunggal" });
    }
    break;
  }
}
fs.writeFileSync(BANK, JSON.stringify(items, null, 2) + "\n");
const count = (k: string, v: unknown) => items.filter((i) => i[k] === v).length;
console.log(`${items.length} soal, ${N_MAPS} peta · ARAH ${count("sub_type", "FIG-DENAH-ARAH")} RUTE ${count("sub_type", "FIG-DENAH-RUTE")} · tier ${[1, 2, 3].map((t) => count("tier", t)).join("/")}`);
