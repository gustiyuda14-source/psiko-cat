import * as fs from "fs";
import * as path from "path";

// Generator Kecermatan Spasial (gambar mirip). Tiap kolom = satu komposisi
// dasar + 4 "slot" detail kecil, masing-masing punya 2 keadaan. Gambar dasar
// memakai keadaan 0 di semua slot; 4 gambar lain masing-masing membalik tepat
// satu slot. Jadi tiap pasangan gambar dalam satu kolom cuma beda 1-2 detail.
//
// Pakai: npx tsx scripts/generate-kecermatan-spasial.ts 202
// Hasil: public/kecermatan-spasial/p202/*.svg + prisma/data/bank_soal_p202.json

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

type Kolom = { main: string; slots: [string, string][] };

const KOLOM: Kolom[] = [
  // 1. Gugus panah + segitiga kecil (referensi 2)
  { main: poly([[40, 16], [86, 50], [64, 52], [70, 70], [56, 74], [50, 56], [36, 62]], "k"),
    slots: [
      [tri(22, 24, 10, 180, "w"), tri(22, 24, 10, -90, "w")],
      [tri(24, 76, 11, -90, "k"), tri(24, 76, 11, -90, "w")],
      [tri(50, 82, 9, 0, "w"), tri(50, 82, 9, 180, "w")],
      [tri(78, 80, 9, -90, "k"), tri(78, 80, 9, -90, "g")],
    ] },
  // 2. Segi lima + lingkaran abu (referensi 1)
  { main: ngon(54, 56, 28, 5, -90, "k"),
    slots: [
      [sq(21, 21, 13, "w"), dot(21, 21, 7.5, "w")],
      [dot(54, 58, 10, "g"), dot(54, 58, 10, "w")],
      [dot(82, 82, 6, "k"), dot(82, 82, 6, "w")],
      [tri(54, 38, 8, -90, "w"), tri(54, 38, 8, 90, "w")],
    ] },
  // 3. Dasi kupu-kupu
  { main: "",
    slots: [
      [poly([[18, 30], [50, 52], [18, 74]], "k"), poly([[18, 30], [50, 52], [18, 74]], "g")],
      [dot(50, 24, 6, "k"), dot(50, 24, 6, "w")],
      [sq(24, 84, 9, "w"), sq(76, 84, 9, "w")],
      [poly([[82, 30], [50, 52], [82, 74]], "w") + tri(70, 52, 7, 180, "k"), poly([[82, 30], [50, 52], [82, 74]], "w")],
    ] },
  // 4. Kincir 4 bilah — tiap slot = warna satu bilah
  { main: "",
    slots: [
      [poly([[50, 50], [50, 14], [70, 34]], "k"), poly([[50, 50], [50, 14], [70, 34]], "w")],
      [poly([[50, 50], [86, 50], [66, 70]], "w"), poly([[50, 50], [86, 50], [66, 70]], "k")],
      [poly([[50, 50], [50, 86], [30, 66]], "k"), poly([[50, 50], [50, 86], [30, 66]], "g")],
      [poly([[50, 50], [14, 50], [34, 30]], "w"), poly([[50, 50], [14, 50], [34, 30]], "k")],
    ] },
  // 5. Bulan sabit (lingkaran hitam ditimpa lingkaran putih)
  { main: "",
    slots: [
      [`<circle cx="46" cy="50" r="30" fill="#000"/><circle cx="60" cy="44" r="24" fill="#fff"/>`,
       `<circle cx="46" cy="50" r="30" fill="#000"/><circle cx="60" cy="56" r="24" fill="#fff"/>`],
      [cross(66, 50, 16, "w"), cross(66, 50, 16, "k")],
      [dot(20, 20, 6, "k"), dot(20, 20, 6, "w")],
      [tri(82, 82, 8, -90, "w"), tri(82, 82, 8, 90, "w")],
    ] },
  // 6. Bintang
  { main: star(50, 52, 30, "k"),
    slots: [
      [dot(20, 20, 6.5, "w"), dot(20, 20, 6.5, "k")],
      [dot(80, 20, 6.5, "k"), dot(80, 20, 6.5, "w")],
      [dot(50, 55, 5, "w"), ""],
      [sq(22, 80, 10, "g"), sq(78, 80, 10, "g")],
    ] },
  // 7. Tetromino L
  { main: sq(38, 48, 18, "w"),
    slots: [
      [sq(38, 30, 18, "w"), sq(38, 30, 18, "g")],
      [sq(38, 66, 18, "k"), sq(38, 66, 18, "w")],
      [sq(56, 66, 18, "w") + dot(56, 66, 4.5, "k"), sq(56, 66, 18, "w")],
      [tri(76, 26, 8, 180, "k"), tri(76, 26, 8, 0, "k")],
    ] },
  // 8. Persegi bersarang + belah ketupat
  { main: sq(50, 50, 60, "w"),
    slots: [
      [ngon(50, 50, 22, 4, -90, "k"), ngon(50, 50, 22, 4, -90, "g")],
      [sq(28, 28, 9, "w"), sq(72, 28, 9, "w")],
      [dot(50, 50, 5, "w"), ""],
      [tri(76, 76, 7, 45, "k"), tri(24, 76, 7, 135, "k")],
    ] },
  // 9. Segitiga siku + dua persegi bertumpuk (referensi 1 "D")
  { main: poly([[86, 26], [86, 86], [26, 86]], "k"),
    slots: [
      [sq(24, 26, 16, "w") + sq(34, 36, 16, "k"), sq(34, 36, 16, "k") + sq(24, 26, 16, "w")],
      [dot(76, 16, 6, "w"), dot(76, 16, 6, "k")],
      [tri(70, 72, 7, -90, "w"), tri(70, 72, 7, 0, "w")],
      [dot(20, 80, 5.5, "k"), ""],
    ] },
  // 10. Segi enam + segitiga dalam
  { main: "",
    slots: [
      [ngon(52, 52, 30, 6, 0, "k"), ngon(52, 52, 30, 6, 30, "k")],
      [tri(52, 52, 12, -90, "w"), tri(52, 52, 12, 90, "w")],
      [sq(18, 18, 10, "w"), sq(18, 18, 10, "g")],
      [dot(84, 84, 6, "w"), dot(20, 84, 6, "w")],
    ] },
];

const KEYS = ["A", "B", "C", "D", "E"] as const;
const shuffle = <T,>(a: T[]) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const svgDir = path.join(__dirname, `../public/kecermatan-spasial/p${PKG}`);
fs.mkdirSync(svgDir, { recursive: true });

const kolom = KOLOM.map((k, c) => {
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
  });
  if (bodies.size !== 5) throw new Error(`Kolom ${c + 1}: ada gambar kembar`);

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
console.log(`Paket ${PKG}: 50 SVG + 500 soal ditulis.`);
