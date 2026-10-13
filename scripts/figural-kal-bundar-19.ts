import assert from "node:assert/strict";
import { BUNDAR, BUNDAR_HURUF, HL, KEYS, type Key, type Pie, type Pt, pie, pieAt, redRing, redText, svgWrap } from "./figural-lib";

// Pola bundar Simulasi 4 (package_number 19), nomor 51-56. Semua HOTS (dua langkah), angka ≤ 100. Aturan berbeda dari pkg 3, 4, 5, 15, 16:
// 51 R1 seberang = 2 × bilangan − 4, 52 R2 berikutnya = sebelumnya + jumlah angka penyusunnya, 53 R3 luar = 3 × dalam − 4,
// 54 R4 pusat = (atas + kanan) × (bawah − kiri), 55 huruf (a) luar = (nilai huruf − 2) × 3, 56 huruf (b) lompatan berlipat dua (+1, +2, +4, …) kembali ke A.
// Opsi diurutkan naik (D-4); kunci 51 D · 52 C · 53 C · 54 E · 55 A · 56 B. Gambar pembahasan: "?" terisi (hijau) + anotasi merah, tanpa id.

export type Bundar19 = { pkg: 19; seq: number; key: Key; instruksi: string; svg: string; choices: string[]; tingkat: 3; pembahasan: string; pembahasan_svg: string };
export const BUNDAR19_ITEMS: Bundar19[] = [];
const P = "kal19b-ah-";
type Slot = { ring: "outer" | "inner" | "center"; i?: number; pie?: number };
/** Soal (dengan "?") dan gambar pembahasan (slot "?" diisi jawaban hijau + lingkaran hijau) dari pie yang sama. */
function build(pies: Pie[], h: number, slot: Slot, answer: string | number, ann: string, hp = h, pa = pies) {
  const k = slot.pie ?? 0, set = (p: Pie, v: string | number): Pie =>
    slot.ring === "center" ? { ...p, center: v } : slot.ring === "inner" ? { ...p, inner: p.inner!.map((x, j) => (j === slot.i ? v : x)) } : { ...p, outer: p.outer.map((x, j) => (j === slot.i ? v : x)) };
  const q = pies.map((p, j) => (j === k ? set(p, "?") : p)), a = pa.map((p, j) => ({ ...(j === k ? set(p, "") : p), startArrow: false }));
  const [x, y] = pieAt(pa[k], slot.ring, slot.i), fs = pa[k].r > 90 ? 26 : 22;
  const label = `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${fs + 2}" font-weight="bold" text-anchor="middle" dominant-baseline="central" fill="${HL}">${answer}</text>`;
  return { svg: svgWrap(h, q.map((p) => pie({ ...p, idPrefix: P })).join("")), pembahasan_svg: svgWrap(hp, a.map((p) => pie(p)).join("") + redRing(x, y, fs + Math.max(0, String(answer).length - 2) * 9, HL) + label + ann) };
}
const push = (it: Omit<Bundar19, "pkg" | "svg" | "pembahasan_svg" | "tingkat">, b: { svg: string; pembahasan_svg: string }, answer: string | number) => {
  assert.equal(it.choices[KEYS.indexOf(it.key)], String(answer), `bundar19 ${it.seq}: kunci tidak cocok dengan aturan`);
  assert.equal(new Set(it.choices).size, 5, `bundar19 ${it.seq}: pilihan kembar`);
  const sorted = [...it.choices].sort((a, b) => (/^\d+$/.test(a) ? +a - +b : a.localeCompare(b)));
  assert.deepEqual(it.choices, sorted, `bundar19 ${it.seq}: opsi harus urut naik`);
  assert.ok(it.choices.every((c) => !/^\d+$/.test(c) || +c <= 100), `bundar19 ${it.seq}: opsi angka ≤ 100`);
  assert.match(it.pembahasan, new RegExp(`^[^\\n]+\\n\\n[^\\n]+Jawaban: ${it.key.toLowerCase()}\\.$`), `bundar19 ${it.seq}: pembahasan 2 paragraf + kunci`);
  BUNDAR19_ITEMS.push({ pkg: 19, tingkat: 3, ...it, ...b });
};
const val = (ch: string) => ch.charCodeAt(0) - 64;
const letter = (n: number) => String.fromCharCode(64 + (((n - 1) % 26) + 26) % 26 + 1);
const angle = (n: number, i: number) => ((-90 + (360 / n) * i) * Math.PI) / 180;
const at = (cx: number, cy: number, n: number, i: number, R: number): Pt => [cx + R * Math.cos(angle(n, i)), cy + R * Math.sin(angle(n, i))];

// 51 R1 berseberangan (HOTS, dua langkah): 8 juring, bilangan di seberang = 2 × bilangan − 4. Pasangan tidak berurutan di lingkaran.
{
  const f = (x: number) => 2 * x - 4, a = [8, 14, 5, 11], outer = [...a, ...a.map(f)];
  assert.deepEqual(outer, [8, 14, 5, 11, 12, 24, 6, 18]);
  assert.notEqual(8 + (6 - 5), 12, "aturan '+1' dari pasangan 5 ↔ 6 harus gugur");
  const p: Pie = { cx: 425, cy: 150, r: 130, outer }, pa: Pie = { ...p, cy: 185 };
  const ann = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => redText(...(([x, y]) => [x, y + 9] as Pt)(at(425, 185, 8, i, 156)), "①②③④"[i % 4], 24)).join("") +
    redText(425, 385, "5×2−4 = 6 · 8×2−4 = 12 · 11×2−4 = 18 · 14×2−4 = ?", 23);
  push({ seq: 51, key: "D", instruksi: BUNDAR, choices: ["15", "20", "21", "24", "28"],
    pembahasan: "Pasangkan bilangan yang saling berhadapan (melewati pusat): 8 ↔ 12, 14 ↔ ?, 5 ↔ 6, 11 ↔ 18. Aturannya dua langkah: bilangan dikali 2, lalu dikurangi 4 (5 × 2 − 4 = 6, 8 × 2 − 4 = 12, 11 × 2 − 4 = 18). Jadi ? = 14 × 2 − 4 = 24.\n\nOpsi 15 hanya mengecek pasangan 5 ↔ 6 (ditambah 1); pasangan 8 ↔ 12 membuktikan aturan itu gugur. Opsi 20 mengerjakan langkah dengan urutan terbalik ((14 − 4) × 2). Opsi 21 mengalikan 1,5 karena hanya cocok dengan pasangan 8 ↔ 12. Opsi 28 lupa mengurangi 4 (14 × 2). Jawaban: d." },
    build([p], 300, { ring: "outer", i: 5 }, 24, ann, 405, [pa]), 24);
}
// 52 R2 putaran (HOTS, dua langkah): searah jarum jam dari panah, berikutnya = sebelumnya + jumlah angka penyusunnya.
{
  const v = [19]; for (let i = 0; i < 7; i++) v.push(v[i] + [...String(v[i])].reduce((s, d) => s + +d, 0));
  assert.deepEqual(v, [19, 29, 40, 44, 52, 59, 73, 83]);
  const p: Pie = { cx: 425, cy: 155, r: 125, outer: v, startArrow: true }, pa: Pie = { ...p, cy: 205 };
  const ann = [6, 7].map((i) => redRing(...pieAt(pa, "outer", i), 24)).join("") + redText(425, 372, "19 + (1+9) = 29 · 29 + (2+9) = 40 · 40 + (4+0) = 44 · …", 22) + redText(425, 408, "73 + (7+3) = 73 + 10 = 83", 26);
  push({ seq: 52, key: "C", instruksi: "Bilangan dibaca searah jarum jam mulai dari tanda panah. " + BUNDAR, choices: ["76", "80", "83", "87", "94"],
    pembahasan: "Baca searah jarum jam mulai dari 19: 19, 29, 40, 44, 52, 59, 73. Selisihnya (+10, +11, +4, +8, +7, +14) tidak berpola sendiri; selisih itu adalah jumlah angka penyusun bilangan sebelumnya: 19 + (1 + 9) = 29, 29 + (2 + 9) = 40, 40 + (4 + 0) = 44, 44 + (4 + 4) = 52, 52 + (5 + 2) = 59, 59 + (5 + 9) = 73. Jadi ? = 73 + (7 + 3) = 83.\n\nOpsi 76 hanya menambahkan angka satuan (73 + 3). Opsi 80 hanya menambahkan angka puluhan (73 + 7). Opsi 87 mengulang selisih terakhir (+14). Opsi 94 mengalikan angka penyusun, bukan menjumlahkan (73 + 7 × 3). Jawaban: c." },
    build([p], 300, { ring: "outer", i: 7 }, 83, ann, 430, [pa]), 83);
}
// 53 R3 cincin (HOTS, dua langkah): luar = 3 × dalam − 4.
{
  const inner = [6, 9, 4, 11, 8, 7], outer = inner.map((x) => 3 * x - 4);
  assert.deepEqual(outer, [14, 23, 8, 29, 20, 17]);
  assert.notEqual(9 + 8, 23, "aturan '+8' dari juring pertama harus gugur");
  assert.notEqual(9 * 2 + 2, 23, "aturan '× 2 + 2' dari juring pertama harus gugur");
  const p: Pie = { cx: 425, cy: 150, r: 130, outer, inner, innerSize: 26 }, pa: Pie = { ...p, cy: 200 };
  const ann = inner.map((x, i) => { const [px, py] = at(425, 200, 6, i, 152); return redText(px, py + 9, `3×${x}−4 = ${i === 5 ? "?" : outer[i]}`, 22, px > 445 ? "start" : px < 405 ? "end" : "middle"); }).join("");
  push({ seq: 53, key: "C", instruksi: BUNDAR, choices: ["15", "16", "17", "21", "25"],
    pembahasan: "Bandingkan cincin dalam dan luar pada juring yang sama: 6 → 14, 9 → 23, 4 → 8, 11 → 29, 8 → 20. Aturannya dua langkah: bilangan dalam dikali 3, lalu dikurangi 4 (3 × 6 − 4 = 14, 3 × 9 − 4 = 23, 3 × 4 − 4 = 8). Untuk bilangan dalam 7: 3 × 7 − 4 = 17.\n\nOpsi 15 hanya mengecek juring pertama (ditambah 8); juring 9 → 23 membuktikan aturan itu gugur. Opsi 16 memakai aturan lain yang hanya cocok dengan juring pertama (× 2 + 2). Opsi 21 lupa mengurangi 4 (3 × 7). Opsi 25 menambah 4, bukan mengurangi (3 × 7 + 4). Jawaban: c." },
    build([p], 300, { ring: "outer", i: 5 }, 17, ann, 410, [pa]), 17);
}
// 54 R4 pusat pada tiga lingkaran (HOTS): pusat = (atas + kanan) × (bawah − kiri). Urutan juring: atas, kanan, bawah, kiri.
{
  const c = [[3, 5, 9, 4], [6, 2, 7, 3], [4, 7, 8, 2]].map(([t, r, b, l]) => ({ v: [t, r, b, l], center: (t + r) * (b - l) }));
  assert.deepEqual(c.map((x) => x.center), [40, 32, 66]);
  const sum = (v: number[]) => v.reduce((s, x) => s + x);
  for (const [nm, g] of [["jumlah semua", (v: number[]) => sum(v)], ["(atas+bawah)×(kanan−kiri)", ([t, r, b, l]: number[]) => (t + b) * (r - l)], ["dijumlah", ([t, r, b, l]: number[]) => t + r + (b - l)]] as const)
    assert.ok(c.slice(0, 2).some((x) => g(x.v) !== x.center), `aturan '${nm}' harus gugur`);
  const pies: Pie[] = c.map((x, i) => ({ cx: 155 + i * 270, cy: 150, r: 112, outer: x.v, center: x.center }));
  const ann = c.map((x, i) => { const [t, r, b, l] = x.v; return redText(155 + i * 270, 302, `(${t}+${r}) × (${b}−${l}) = ${i === 2 ? "?" : x.center}`, 21); }).join("");
  push({ seq: 54, key: "E", instruksi: BUNDAR, choices: ["11", "17", "21", "60", "66"],
    pembahasan: "Bilangan di pusat = (bilangan atas + bilangan kanan) × (bilangan bawah − bilangan kiri). Lingkaran 1: (3 + 5) × (9 − 4) = 8 × 5 = 40. Lingkaran 2: (6 + 2) × (7 − 3) = 8 × 4 = 32. Lingkaran 3: (4 + 7) × (8 − 2) = 11 × 6 = 66.\n\nOpsi 11 mengambil pengurang dari juring yang salah ((4 + 7) × (8 − 7)). Opsi 17 menjumlahkan kedua hasil, bukan mengalikan (11 + 6). Opsi 21 menjumlahkan keempat juring. Opsi 60 menukar pasangan juring ((4 + 8) × (7 − 2)). Jawaban: e." },
    build(pies, 290, { ring: "center", pie: 2 }, 66, ann, 325), 66);
}
// 55 huruf (a) (HOTS, dua langkah): angka luar = (nilai huruf dalam − 2) × 3.
{
  const L = ["D", "G", "K", "P", "T"], outer = L.map((l) => (val(l) - 2) * 3);
  assert.deepEqual(outer, [6, 15, 27, 42, 54]);
  assert.notEqual(val("G") + 2, 15, "aturan '+2' dari juring pertama harus gugur");
  const p: Pie = { cx: 425, cy: 150, r: 130, outer, inner: L }, pa: Pie = { ...p, cx: 290, cy: 175 };
  const ann = L.map((l, i) => redText(545, 66 + 46 * i, `${l} = ${val(l)} → (${val(l)}−2)×3 = ${i === 4 ? "?" : outer[i]}`, 24, "start")).join("");
  push({ seq: 55, key: "A", instruksi: BUNDAR_HURUF, choices: ["54", "57", "58", "60", "66"],
    pembahasan: "Ubah huruf di cincin dalam menjadi urutannya: D = 4, G = 7, K = 11, P = 16, T = 20. Angka di cincin luar didapat dengan dua langkah: urutan huruf dikurangi 2, lalu dikali 3 ((4 − 2) × 3 = 6, (7 − 2) × 3 = 15, (11 − 2) × 3 = 27, (16 − 2) × 3 = 42). Untuk T: (20 − 2) × 3 = 54.\n\nOpsi 57 salah menghitung urutan T satu posisi (21 − 2) × 3. Opsi 58 mengerjakan langkah dengan urutan terbalik (20 × 3 − 2). Opsi 60 lupa mengurangi 2 (20 × 3). Opsi 66 menambah 2, bukan mengurangi ((20 + 2) × 3). Jawaban: a." },
    build([p], 300, { ring: "outer", i: 4 }, 54, ann, 350, [pa]), 54);
}
// 56 huruf (b) (HOTS): lompatan berlipat dua +1, +2, +4, +8, +16; bila lewat Z, lanjut dari A.
{
  const n = [2]; for (let i = 0; i < 5; i++) n.push(n[i] + 2 ** i);
  const L = n.map(letter);
  assert.deepEqual(L, ["B", "C", "E", "I", "Q", "G"]);
  const p: Pie = { cx: 425, cy: 155, r: 125, outer: L, startArrow: true }, pa: Pie = { ...p, cy: 200 };
  const ann = [4, 5].map((i) => redRing(...pieAt(pa, "outer", i), 22)).join("") + redText(425, 360, "B(2) +1 C(3) +2 E(5) +4 I(9) +8 Q(17) +16", 24) +
    redText(425, 397, "17 + 16 = 33 → 33 − 26 = 7 = G", 26);
  push({ seq: 56, key: "B", instruksi: "Huruf dibaca searah jarum jam mulai dari tanda panah. Huruf mewakili urutannya dalam alfabet (A = 1, B = 2, …, Z = 26); bila hitungan melewati Z, lanjutkan dari A. Tentukan huruf yang tepat untuk menggantikan tanda tanya (?) pada gambar.",
    choices: ["F", "G", "H", "Y", "Z"],
    pembahasan: "Baca searah jarum jam mulai dari B: B = 2, C = 3, E = 5, I = 9, Q = 17. Lompatannya +1, +2, +4, +8, yaitu selalu berlipat dua. Lompatan berikutnya +16: 17 + 16 = 33. Karena melewati Z (26), lanjutkan dari A: 33 − 26 = 7, jadi hurufnya G.\n\nOpsi F kurang satu posisi saat kembali ke A (33 − 27). Opsi H lebih satu posisi saat kembali ke A (33 − 25). Opsi Y mengulang lompatan sebelumnya (17 + 8 = 25). Opsi Z berhenti di Z dan tidak melanjutkan dari A. Jawaban: b." },
    build([p], 300, { ring: "outer", i: 5 }, "G", ann, 450, [pa]), "G");
}
