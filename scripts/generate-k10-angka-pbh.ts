/**
 * Gambar pembahasan K10 angka dalam gambar (13 butir): gambar soal dikecilkan di kiri, aturan + hitungan gambar 1 dan 2 di kanan.
 * Jawaban numerik tiap butir dicocokkan dengan opsi kunci di bank (assert), jadi salah hitung gagal saat dijalankan.
 *   npx tsx scripts/generate-k10-angka-pbh.ts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { El, ROOT, box, frame, line, loadBank, patchBank, rect, t, tb, tm, wrapText, writeSvg } from "./pbh-svg-lib";

type Spec = { id: string; rule: string; g1: string[]; g2: string[]; ans: number; calc: string };
const SPECS: Spec[] = [
  { id: "B2-077", rule: "Kotak kanan = kotak kiri × 5 (di tiap baris)", g1: ["3 × 5 = 15", "6 × 5 = 30"], g2: ["4 × 5 = 20", "7 × 5 = ?"], ans: 35, calc: "7*5" },
  { id: "B2-078", rule: "Kotak kanan = kuadrat kotak kiri", g1: ["2² = 4", "5² = 25"], g2: ["6² = 36", "?² = 81 → ? = 9"], ans: 9, calc: "Math.sqrt(81)" },
  { id: "B2-079", rule: "Kotak kanan atas = (kiri atas + kotak bawah)²", g1: ["(13 + 4)² = 17² = 289"], g2: ["(11 + ?)² = 196", "11 + ? = 14 → ? = 3"], ans: 3, calc: "Math.sqrt(196)-11" },
  { id: "B3-076", rule: "Angka tengah = (atas + bawah) − (kiri + kanan)", g1: ["(15 + 10) − (6 + 9) = 10"], g2: ["(20 + 13) − (7 + 11)", "= 33 − 18 = 15"], ans: 15, calc: "(20+13)-(7+11)" },
  { id: "B3-077", rule: "Alas = kiri + kanan; tengah = kiri × kanan ÷ alas", g1: ["10 + 15 = 25", "10 × 15 ÷ 25 = 6"], g2: ["12 + 24 = 36", "12 × 24 ÷ 36 = ?"], ans: 8, calc: "12*24/36" },
  { id: "B2-082", rule: "Alas = kiri × (tengah + kanan)", g1: ["6 × (4 + 3) = 42"], g2: ["5 × (? + 3) = 45", "? + 3 = 9 → ? = 6"], ans: 6, calc: "45/5-3" },
  { id: "B3-078", rule: "Kotak besar = (roda kiri + roda kanan) pangkat angka kotak kecil", g1: ["(4 + 3)² = 49"], g2: ["(2 + 4)³ = 6³ = ?"], ans: 216, calc: "6**3" },
  { id: "B3-079", rule: "Dari kecil ke besar, angka dikali pengali tetap", g1: ["4 × 3 = 12", "12 × 3 = 36"], g2: ["5 × 3 = ?", "? × 3 = 45"], ans: 15, calc: "5*3" },
  { id: "B3-080", rule: "Selisih dua kotak = kuadrat angka di ujung panah", g1: ["530 − 386 = 144 = 12²"], g2: ["610 − 441 = 169", "169 = ?² → ? = 13"], ans: 13, calc: "Math.sqrt(610-441)" },
  { id: "A3-057", rule: "Angka tengah = atas × kiri ÷ kanan", g1: ["14 × 18 ÷ 6 = 42"], g2: ["9 × 32 ÷ 12 = ?"], ans: 24, calc: "9*32/12" },
  { id: "A3-058", rule: "Angka tengah = (kiri atas ÷ kiri bawah) − (kanan atas ÷ kanan bawah)", g1: ["42 ÷ 6 − 45 ÷ 9", "= 7 − 5 = 2"], g2: ["54 ÷ 6 − 40 ÷ 5", "= 9 − 8 = ?"], ans: 1, calc: "54/6-40/5" },
  { id: "B2-081", rule: "Angka tengah = kiri × bawah + atas × kanan", g1: ["6 × 9 + 4 × 7", "= 54 + 28 = 82"], g2: ["8 × 7 + 3 × 5", "= 56 + 15 = ?"], ans: 71, calc: "8*7+3*5" },
  { id: "B2-083", rule: "Angka tengah = (kiri atas × kanan bawah) − (kanan atas × kiri bawah)", g1: ["7 × 5 − 3 × 2", "= 35 − 6 = 29"], g2: ["8 × 6 − 4 × 3", "= 48 − 12 = ?"], ans: 36, calc: "8*6-4*3" },
];

function embed(id: string): { els: El[]; x: number } {
  const s = readFileSync(join(ROOT, "public/drill/img", `K10-${id}.svg`), "utf8"), vb = (s.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/) ?? []).slice(1).map(Number);
  const k = Math.min(336 / vb[0], 142 / vb[1]), w = vb[0] * k, h = vb[1] * k, x = 10 + (344 - w) / 2, y = 38 + (152 - h) / 2;
  const inner = s.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "").replace(/<rect width="100%" height="100%" fill="#fff"\/>/, "");
  return { els: [rect(10, 34, 344, 160, "#fff", { sw: 1, stroke: "#bbbbbb", r: 6 }), `<g transform="translate(${x},${y}) scale(${k})">${inner}</g>`], x };
}

function build(sp: Spec): string {
  const item = loadBank("K10-angka-dalam-gambar.json").find((i) => i.id === `K10-${sp.id}`)!, key = item.kunci[0] as string;
  const calc = Number(new Function(`return (${sp.calc})`)());
  if (calc !== sp.ans || Number(String(item.opsi[key]).replace(/[^\d.-]/g, "")) !== sp.ans) throw new Error(`K10-${sp.id}: jawaban ${sp.ans} / hitung ${calc} / kunci ${item.opsi[key]} tidak cocok`);
  const body: El[] = [tb(10, 24, "Gambar soal", 12), ...embed(sp.id).els, tb(372, 24, "Aturan", 12), ...wrapText(372, 44, sp.rule, { size: 13.5, w: 700, maxW: 236, gap: 17 })];
  let y = 44 + wrapText(0, 0, sp.rule, { size: 13.5, w: 700, maxW: 236 }).length * 17 + 14;
  [["Gambar 1 (cocok)", sp.g1, "✓"], ["Gambar 2", sp.g2, ""]].forEach(([name, lines, mk]) => {
    body.push(tm(372, y, String(name), 11), line(372, y + 5, 604, y + 5, { sw: 0.8, stroke: "#bbbbbb" }));
    y += 24;
    (lines as string[]).forEach((l) => { body.push(t(372, y, l, { size: 14, w: 600 }), ...(mk ? [tb(594, y, mk as string, 14)] : [])); y += 21; });
    y += 10;
  });
  body.push(...box(10, 208, 150, 40, `? = ${sp.ans}`, { dark: true, size: 20, r: 8 }));
  if (y - 31 > 250) throw new Error(`K10-${sp.id}: tinggi melebihi bingkai`);
  return frame(`Pembahasan K10-${sp.id}`, body);
}
SPECS.forEach((sp) => writeSvg(`K10-${sp.id}`, build(sp)));
const ids = new Set(SPECS.map((s) => `K10-${s.id}`));
patchBank("K10-angka-dalam-gambar.json", (it) => { if (ids.has(it.id as string)) it.gambar_pembahasan = `${it.id}.svg`; });
if (ids.size !== 13) throw new Error(`jumlah ${ids.size} ≠ 13`);
console.log(`${ids.size} SVG K10 angka`);
