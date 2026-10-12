import * as fs from "fs";
import * as path from "path";

// Generator Kecermatan Spasial (gambar mirip). Tiap kolom = satu komposisi
// dasar + 4 "slot" detail kecil, masing-masing punya 2 keadaan. Gambar dasar
// memakai keadaan 0 di semua slot; 4 gambar lain masing-masing membalik tepat
// satu slot. Jadi tiap pasangan gambar dalam satu kolom cuma beda 1-2 detail.
//
// Paket 202 memakai 10 komposisi tulisan tangan (KOLOM). Paket lain merakit
// komposisi acak (randomKolom) dari pustaka bentuk dengan seed = nomor paket,
// jadi tiap paket beda isi tapi tetap bisa direproduksi.
//
// Pakai: npx tsx scripts/generate-kecermatan-spasial.ts 203
// Hasil: public/kecermatan-spasial/p203/*.svg + prisma/data/bank_soal_p203.json

const PKG = Number(process.argv[2]);
if (!Number.isInteger(PKG)) throw new Error("Nomor paket wajib, mis. 202");

const FILL = { k: "#000", w: "#fff", g: "#9a9a9a" } as const;
type Fill = keyof typeof FILL;
const S = 'stroke="#000" stroke-width="2.5" stroke-linejoin="round"';
const r1 = (n: number) => Math.round(n * 10) / 10;

const poly = (pts: [number, number][], f: Fill) =>
  `<polygon points="${pts.map(([x, y]) => `${r1(x)},${r1(y)}`).join(" ")}" fill="${FILL[f]}" ${S}/>`;
// Poligon beraturan n sisi, titik pertama mengarah ke `deg` (0 = kanan, -90 = atas).
const ngon = (cx: number, cy: number, r: number, n: number, deg: number, f: Fill) =>
  poly(Array.from({ length: n }, (_, i) => {
    const a = ((deg + (360 / n) * i) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as [number, number];
  }), f);
const tri = (cx: number, cy: number, r: number, deg: number, f: Fill) => ngon(cx, cy, r, 3, deg, f);
const sq = (cx: number, cy: number, s: number, f: Fill) =>
  `<rect x="${r1(cx - s / 2)}" y="${r1(cy - s / 2)}" width="${s}" height="${s}" fill="${FILL[f]}" ${S}/>`;
const dot = (cx: number, cy: number, r: number, f: Fill) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${FILL[f]}" ${S}/>`;
const star = (cx: number, cy: number, R: number, f: Fill) =>
  poly(Array.from({ length: 10 }, (_, i) => {
    const a = ((-90 + 36 * i) * Math.PI) / 180, r = i % 2 ? R * 0.42 : R;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as [number, number];
  }), f);
const cross = (cx: number, cy: number, s: number, f: Fill) => {
  const a = s / 2, b = s / 6;
  return poly([[cx - b, cy - a], [cx + b, cy - a], [cx + b, cy - b], [cx + a, cy - b], [cx + a, cy + b], [cx + b, cy + b],
    [cx + b, cy + a], [cx - b, cy + a], [cx - b, cy + b], [cx - a, cy + b], [cx - a, cy - b], [cx - b, cy - b]], f);
};

// labels[i] = kata pelafalan untuk gambar yang membalik slot ke-i (ciri yang
// cuma dimiliki gambar itu dalam kolomnya). Gambar dasar dilafalkan "dasar".
type Kolom = { main: string; slots: [string, string][]; labels: string[] };

const KOLOM: Kolom[] = [
  // 1. Gugus panah + segitiga kecil (referensi 2)
  { main: poly([[40, 16], [86, 50], [64, 52], [70, 70], [56, 74], [50, 56], [36, 62]], "k"),
    slots: [
      [tri(22, 24, 10, 180, "w"), tri(22, 24, 10, -90, "w")],
      [tri(24, 76, 11, -90, "k"), tri(24, 76, 11, -90, "w")],
      [tri(50, 82, 9, 0, "w"), tri(50, 82, 9, 180, "w")],
      [tri(78, 80, 9, -90, "k"), tri(78, 80, 9, -90, "g")],
    ],
    labels: ["segitiga ke atas · kiri-atas", "segitiga putih · kiri-bawah", "segitiga ke kiri · bawah", "segitiga abu · kanan-bawah"] },
  // 2. Segi lima + lingkaran abu (referensi 1)
  { main: ngon(54, 56, 28, 5, -90, "k"),
    slots: [
      [sq(21, 21, 13, "w"), dot(21, 21, 7.5, "w")],
      [dot(54, 58, 10, "g"), dot(54, 58, 10, "w")],
      [dot(82, 82, 6, "k"), dot(82, 82, 6, "w")],
      [tri(54, 38, 8, -90, "w"), tri(54, 38, 8, 90, "w")],
    ],
    labels: ["bulat · kiri-atas", "bulat putih · tengah", "bulat putih · kanan-bawah", "segitiga ke bawah · tengah"] },
  // 3. Dasi kupu-kupu
  { main: "",
    slots: [
      [poly([[18, 30], [50, 52], [18, 74]], "k"), poly([[18, 30], [50, 52], [18, 74]], "g")],
      [dot(50, 24, 6, "k"), dot(50, 24, 6, "w")],
      [sq(24, 84, 9, "w"), sq(76, 84, 9, "w")],
      [poly([[82, 30], [50, 52], [82, 74]], "w") + tri(70, 52, 7, 180, "k"), poly([[82, 30], [50, 52], [82, 74]], "w")],
    ],
    labels: ["sayap kiri abu", "bulat putih · atas", "kotak · kanan-bawah", "tanpa segitiga · kanan"] },
  // 4. Kincir 4 bilah — tiap slot = warna satu bilah
  { main: "",
    slots: [
      [poly([[50, 50], [50, 14], [70, 34]], "k"), poly([[50, 50], [50, 14], [70, 34]], "w")],
      [poly([[50, 50], [86, 50], [66, 70]], "w"), poly([[50, 50], [86, 50], [66, 70]], "k")],
      [poly([[50, 50], [50, 86], [30, 66]], "k"), poly([[50, 50], [50, 86], [30, 66]], "g")],
      [poly([[50, 50], [14, 50], [34, 30]], "w"), poly([[50, 50], [14, 50], [34, 30]], "k")],
    ],
    labels: ["bilah atas putih", "bilah kanan hitam", "bilah bawah abu", "bilah kiri hitam"] },
  // 5. Bulan sabit (lingkaran hitam ditimpa lingkaran putih)
  { main: "",
    slots: [
      [`<circle cx="46" cy="50" r="30" fill="#000"/><circle cx="60" cy="44" r="24" fill="#fff"/>`,
       `<circle cx="46" cy="50" r="30" fill="#000"/><circle cx="60" cy="56" r="24" fill="#fff"/>`],
      [cross(66, 50, 16, "w"), cross(66, 50, 16, "k")],
      [dot(20, 20, 6, "k"), dot(20, 20, 6, "w")],
      [tri(82, 82, 8, -90, "w"), tri(82, 82, 8, 90, "w")],
    ],
    labels: ["sabit ke bawah", "silang hitam · kanan", "bulat putih · kiri-atas", "segitiga ke bawah · kanan-bawah"] },
  // 6. Bintang
  { main: star(50, 52, 30, "k"),
    slots: [
      [dot(20, 20, 6.5, "w"), dot(20, 20, 6.5, "k")],
      [dot(80, 20, 6.5, "k"), dot(80, 20, 6.5, "w")],
      [dot(50, 55, 5, "w"), ""],
      [sq(22, 80, 10, "g"), sq(78, 80, 10, "g")],
    ],
    labels: ["bulat hitam · kiri-atas", "bulat putih · kanan-atas", "tanpa titik tengah", "kotak abu · kanan-bawah"] },
  // 7. Tetromino L
  { main: sq(38, 48, 18, "w"),
    slots: [
      [sq(38, 30, 18, "w"), sq(38, 30, 18, "g")],
      [sq(38, 66, 18, "k"), sq(38, 66, 18, "w")],
      [sq(56, 66, 18, "w") + dot(56, 66, 4.5, "k"), sq(56, 66, 18, "w")],
      [tri(76, 26, 8, 180, "k"), tri(76, 26, 8, 0, "k")],
    ],
    labels: ["kotak atas abu", "kotak bawah putih", "tanpa titik · kotak kanan", "segitiga ke kanan · kanan-atas"] },
  // 8. Persegi bersarang + belah ketupat
  { main: sq(50, 50, 60, "w"),
    slots: [
      [ngon(50, 50, 22, 4, -90, "k"), ngon(50, 50, 22, 4, -90, "g")],
      [sq(28, 28, 9, "w"), sq(72, 28, 9, "w")],
      [dot(50, 50, 5, "w"), ""],
      [tri(76, 76, 7, 45, "k"), tri(24, 76, 7, 135, "k")],
    ],
    labels: ["ketupat abu · tengah", "kotak · kanan-atas", "tanpa titik tengah", "segitiga · kiri-bawah"] },
  // 9. Segitiga siku + dua persegi bertumpuk (referensi 1 "D")
  { main: poly([[86, 26], [86, 86], [26, 86]], "k"),
    slots: [
      [sq(24, 26, 16, "w") + sq(34, 36, 16, "k"), sq(34, 36, 16, "k") + sq(24, 26, 16, "w")],
      [dot(76, 16, 6, "w"), dot(76, 16, 6, "k")],
      [tri(70, 72, 7, -90, "w"), tri(70, 72, 7, 0, "w")],
      [dot(20, 80, 5.5, "k"), ""],
    ],
    labels: ["kotak putih di depan", "bulat hitam · kanan-atas", "segitiga ke kanan · kanan-bawah", "tanpa titik · kiri-bawah"] },
  // 10. Segi enam + segitiga dalam
  { main: "",
    slots: [
      [ngon(52, 52, 30, 6, 0, "k"), ngon(52, 52, 30, 6, 30, "k")],
      [tri(52, 52, 12, -90, "w"), tri(52, 52, 12, 90, "w")],
      [sq(18, 18, 10, "w"), sq(18, 18, 10, "g")],
      [dot(84, 84, 6, "w"), dot(20, 84, 6, "w")],
    ],
    labels: ["segi enam diputar", "segitiga ke bawah · tengah", "kotak abu · kiri-atas", "bulat · kiri-bawah"] },
];

// mulberry32 — RNG kecil ber-seed supaya paket bisa dibangkitkan ulang identik.
let seed = PKG * 7919;
const rng = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = <T,>(a: readonly T[]) => a[Math.floor(rng() * a.length)];
const shuffle = <T,>(a: T[]) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// --- Mode acak -------------------------------------------------------------
const C = 52; // pusat bentuk utama
const rot = (pts: [number, number][], deg: number): [number, number][] => {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), sn = Math.sin(a);
  return pts.map(([x, y]) => [C + (x - C) * c - (y - C) * sn, C + (x - C) * sn + (y - C) * c]);
};
const starN = (n: number, R: number, deg: number, f: Fill) =>
  poly(Array.from({ length: n * 2 }, (_, i) => {
    const a = ((deg + (180 / n) * i) * Math.PI) / 180, r = i % 2 ? R * 0.45 : R;
    return [C + r * Math.cos(a), C + r * Math.sin(a)] as [number, number];
  }), f);

// Bentuk utama: fungsi (rotasi) -> SVG. `inner` = boleh diberi tanda di pusat.
type Main = { name: string; draw: (deg: number) => string; inner: boolean; step: number };
const MAINS: Main[] = [
  ...[3, 4, 5, 6, 7, 8].map((n) => ({ name: `ngon${n}`, draw: (d: number) => ngon(C, C, 26, n, d - 90, "k"), inner: true, step: 180 / n })),
  ...[4, 5, 6].map((n) => ({ name: `star${n}`, draw: (d: number) => starN(n, 28, d - 90, "k"), inner: true, step: 180 / n })),
  { name: "panah", draw: (d) => poly(rot([[52, 24], [76, 50], [61, 50], [61, 78], [43, 78], [43, 50], [28, 50]], d), "k"), inner: false, step: 90 },
  { name: "kepala-panah", draw: (d) => poly(rot([[30, 26], [80, 46], [58, 54], [66, 78], [52, 82], [46, 60], [28, 70]], d), "k"), inner: false, step: 90 },
  { name: "silang", draw: (d) => poly(rot([[44, 26], [60, 26], [60, 44], [78, 44], [78, 60], [60, 60], [60, 78], [44, 78], [44, 60], [26, 60], [26, 44], [44, 44]], d), "k"), inner: true, step: 45 },
  { name: "trapesium", draw: (d) => poly(rot([[38, 32], [66, 32], [80, 72], [24, 72]], d), "k"), inner: true, step: 180 },
  { name: "siku", draw: (d) => poly(rot([[26, 78], [78, 78], [78, 26]], d), "k"), inner: false, step: 90 },
  { name: "chevron", draw: (d) => poly(rot([[26, 30], [52, 50], [78, 30], [78, 50], [52, 74], [26, 50]], d), "k"), inner: false, step: 180 },
  { name: "dasi", draw: (d) => poly(rot([[26, 30], [52, 52], [26, 74]], d), "k") + poly(rot([[78, 30], [52, 52], [78, 74]], d), "w"), inner: false, step: 90 },
  { name: "bulan", draw: (d) => { const [[bx, by]] = rot([[64, 46]], d); return `<circle cx="${C}" cy="${C}" r="27" fill="#000"/><circle cx="${r1(bx)}" cy="${r1(by)}" r="22" fill="#fff"/>`; }, inner: false, step: 90 },
  { name: "L", draw: (d) => poly(rot([[34, 24], [52, 24], [52, 62], [72, 62], [72, 80], [34, 80]], d), "k"), inner: false, step: 90 },
];

type El = { kind: "tri" | "sq" | "dot" | "dia" | "pent"; x: number; y: number; r: number; fill: Fill; dir: number };
const drawEl = (e: El | null) => {
  if (!e) return "";
  switch (e.kind) {
    case "tri": return tri(e.x, e.y, e.r, e.dir, e.fill);
    case "sq": return sq(e.x, e.y, r1(e.r * 1.5), e.fill);
    case "dot": return dot(e.x, e.y, r1(e.r * 0.85), e.fill);
    case "dia": return ngon(e.x, e.y, e.r, 4, -90, e.fill);
    case "pent": return ngon(e.x, e.y, e.r, 5, -90, e.fill);
  }
};
// 8 jangkar di sekeliling bentuk utama (sudut + tengah sisi)
const ANCHORS: [number, number, number][] = [
  [20, 20, 7.5], [84, 20, 7.5], [20, 84, 7.5], [84, 84, 7.5],
  [52, 15, 6], [52, 89, 6], [15, 52, 6], [89, 52, 6],
];
const KINDS = ["tri", "sq", "dot", "dia", "pent"] as const;
const otherFill = (f: Fill): Fill => pick((["k", "w", "g"] as Fill[]).filter((x) => x !== f));

const KIND_NAME = { tri: "segitiga", sq: "kotak", dot: "bulat", dia: "ketupat", pent: "segi lima" } as const;
const FILL_NAME = { k: "hitam", w: "putih", g: "abu" } as const;
const arah = (deg: number) => ({ 0: "kanan", 90: "bawah", 180: "kiri", 270: "atas" })[(((deg % 360) + 360) % 360) as 0];
const posisi = (x: number, y: number) =>
  [x < 35 ? "kiri" : x > 69 ? "kanan" : "", y < 35 ? "atas" : y > 69 ? "bawah" : ""].filter(Boolean).join("-") || "tengah";

// Satu slot = elemen kecil + versi yang dibalik satu atributnya + label versi balikan.
function slotFor(e: El, allowGone: boolean): [string, string, string] {
  const kinds: string[] = ["fill", "kind"];
  if (e.kind === "tri") kinds.push("dir", "dir");
  if (allowGone) kinds.push("gone");
  const how = pick(kinds);
  const alt: El | null =
    how === "fill" ? { ...e, fill: otherFill(e.fill) } :
    how === "dir" ? { ...e, dir: e.dir + pick([90, 180, -90]) } :
    how === "kind" ? { ...e, kind: pick(KINDS.filter((k) => k !== e.kind)) } : null;
  const at = posisi(e.x, e.y);
  const label =
    how === "fill" ? `${KIND_NAME[e.kind]} ${FILL_NAME[alt!.fill]} · ${at}` :
    how === "dir" ? `segitiga ke ${arah(alt!.dir)} · ${at}` :
    how === "kind" ? `${KIND_NAME[alt!.kind]} · ${at}` : `tanpa ${KIND_NAME[e.kind]} · ${at}`;
  return [drawEl(e), drawEl(alt), label];
}

function randomKolom(main: Main): Kolom {
  // Poligon/bintang beraturan muat di lingkaran r28, aman diputar bebas;
  // bentuk lain cuma kelipatan 90 supaya sudutnya tidak menabrak jangkar.
  const free = /^(ngon|star)/.test(main.name);
  const deg = free ? pick([0, 15, 30, 45, 60]) : pick([0, 90, 180, 270]);
  const slots: [string, string][] = [];
  const labels: string[] = [];
  const add = ([a, b, label]: [string, string, string]) => { slots.push([a, b]); labels.push(label); };
  // Kadang bentuk utama sendiri jadi slot: diputar setengah langkah simetri
  // (paling sulit). Bentuk tak beraturan tidak — putaran 90° terlalu mencolok.
  const mainSlot = free && rng() < 0.35;
  if (mainSlot) add([main.draw(deg), main.draw(deg + main.step), "bentuk diputar"]);
  if (main.inner && slots.length < 4 && rng() < 0.7) {
    add(slotFor({ kind: pick(KINDS), x: C, y: C, r: 9, fill: pick(["w", "g"] as Fill[]), dir: pick([-90, 90, 0, 180]) }, false));
  }
  let gone = false;
  for (const [x, y, r] of shuffle([...ANCHORS])) {
    if (slots.length === 4) break;
    const allowGone = !gone && rng() < 0.3;
    const pair = slotFor({ kind: pick(KINDS), x, y, r, fill: pick(["k", "w", "g", "k", "w"] as Fill[]), dir: pick([-90, 90, 0, 180]) }, allowGone);
    if (pair[1] === "") gone = true;
    add(pair);
  }
  return { main: mainSlot ? "" : main.draw(deg), slots, labels };
}

const SET: Kolom[] = PKG === 202 ? KOLOM : shuffle([...MAINS]).slice(0, 10).map(randomKolom);

const KEYS = ["A", "B", "C", "D", "E"] as const;
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const svgDir = path.join(__dirname, `../public/kecermatan-spasial/p${PKG}`);
fs.mkdirSync(svgDir, { recursive: true });
const pelafalan: Record<string, string> = {};

const kolom = SET.map((k, c) => {
  // varian 0 = dasar, varian 1-4 = balik slot ke-(n-1); urutan huruf diacak
  const variants = shuffle([0, 1, 2, 3, 4]);
  const id = String(c + 1).padStart(2, "0");
  const simbol = {} as Record<(typeof KEYS)[number], string>;
  const bodies = new Set<string>();
  KEYS.forEach((key, i) => {
    const s = [0, 1, 2, 3].map((slot) => (variants[i] === slot + 1 ? 1 : 0));
    const body = k.main + k.slots.map((pair, slot) => pair[s[slot]]).join("");
    bodies.add(body);
    fs.writeFileSync(path.join(svgDir, `k${id}_${key}.svg`),
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="4" y="4" width="92" height="92" fill="#fff" stroke="#000" stroke-width="3"/>${body}</svg>\n`);
    simbol[key] = `/kecermatan-spasial/p${PKG}/k${id}_${key}.svg`;
    pelafalan[simbol[key]] = variants[i] === 0 ? "dasar" : k.labels[variants[i] - 1];
  });
  if (bodies.size !== 5) throw new Error(`Kolom ${c + 1}: ada gambar kembar`);
  const words = KEYS.map((key) => pelafalan[simbol[key]]);
  if (words.some((w) => !w) || new Set(words).size !== 5) throw new Error(`Kolom ${c + 1}: label pelafalan kosong/kembar: ${words}`);

  let keys: string[];
  do keys = shuffle(KEYS.flatMap((key) => Array(10).fill(key))); while (keys.some((key, i) => key === keys[i - 1]));
  const soal = keys.map((kunci, i) => ({
    nomor: i + 1,
    shown: shuffle(KEYS.filter((key) => key !== kunci).map((key) => simbol[key])),
    kunci,
  }));
  return { nomor: c + 1, roman: ROMAN[c], simbol, soal };
});

fs.writeFileSync(path.join(__dirname, `../prisma/data/bank_soal_p${PKG}.json`),
  JSON.stringify({ nomor: PKG, nama: `Paket Spasial ${PKG - 200}`, kategori: "SPASIAL", total_soal: 500, kolom }, null, 2));
// Kata bantuan pelafalan (latihan), digabung dengan label paket/aspek lain.
const labelFile = path.join(__dirname, "../data/kecermatan-pelafalan.json");
const all = fs.existsSync(labelFile) ? JSON.parse(fs.readFileSync(labelFile, "utf8")) : {};
Object.assign(all, pelafalan);
fs.writeFileSync(labelFile, `${JSON.stringify(Object.fromEntries(Object.entries(all).sort()), null, 2)}\n`);
console.log(`Paket ${PKG}: 50 SVG + 500 soal + 50 label ditulis.`);
