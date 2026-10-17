import assert from "node:assert/strict";
import { BUNDAR, BUNDAR_HURUF, HL, KEYS, type Key, type Pie, type Pt, pie, pieAt, redRing, redText, svgWrap } from "./figural-lib";

// Pola bundar Latihan Paket 5 (package_number 6), nomor 51-56. Data & aturan dari Codex C2 (diaudit sesi 2, rencana kecerdasan-latihan-paket-5):
// 51 hasil kali sektor berhadapan tetap (108) · 52 +3 / ×2 bergantian dari panah · 53 luar = 2 × dalam² + 1 ·
// 54 pusat = atas × bawah − kanan × kiri · 55 huruf + 6 = angka di seberang · 56 lompatan huruf +3, +4, +5, … dengan kembali ke A.
// Tingkat: 51, 52, 55 sedang · 53, 54, 56 HOTS. Kunci dihitung dari aturan. Gambar pembahasan: "?" terisi (hijau) + anotasi merah, tanpa id.

export type Bundar6 = { pkg: 6; seq: number; key: Key; instruksi: string; svg: string; choices: string[]; tingkat: 2 | 3; pembahasan: string; pembahasan_svg: string };
export const BUNDAR6_ITEMS: Bundar6[] = [];
const P = "kal6b-ah-";
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
const push = (it: Omit<Bundar6, "pkg" | "svg" | "pembahasan_svg">, b: { svg: string; pembahasan_svg: string }, answer: string | number) => {
  assert.equal(it.choices[KEYS.indexOf(it.key)], String(answer), `bundar6 ${it.seq}: kunci tidak cocok dengan aturan`);
  assert.equal(new Set(it.choices).size, 5, `bundar6 ${it.seq}: pilihan kembar`);
  assert.match(it.pembahasan, new RegExp(`^[^\\n]+\\n\\n[^\\n]+Jawaban: ${it.key.toLowerCase()}\\.$`), `bundar6 ${it.seq}: pembahasan 2 paragraf + kunci`);
  BUNDAR6_ITEMS.push({ pkg: 6, ...it, ...b });
};
const val = (ch: string) => ch.charCodeAt(0) - 64;
const letter = (n: number) => String.fromCharCode(64 + (((n - 1) % 26) + 26) % 26 + 1);
const PANAH = "Bilangan dibaca searah jarum jam mulai dari tanda panah. ";

// 51 berhadapan (sedang): 8 juring, hasil kali dua bilangan yang berhadapan selalu 108.
{
  const v = [4, 6, 9, 12, 27, 18, 12, 9];
  for (let i = 0; i < 4; i++) assert.equal(v[i] * v[i + 4], 108);
  assert.notEqual(v[0] + v[4], v[1] + v[5], "aturan 'jumlah tetap' harus gugur");
  const p: Pie = { cx: 425, cy: 150, r: 130, outer: v }, pa: Pie = { ...p, cy: 165 };
  const ann = redText(425, 345, "4 × 27 = 6 × 18 = 9 × 12 = 108 → 12 × 9 = 108", 24);
  push({ seq: 51, key: "B", instruksi: BUNDAR, choices: ["4", "9", "12", "18", "27"], tingkat: 2,
    pembahasan: "Pasangkan bilangan yang saling berhadapan (melewati pusat): 4 ↔ 27, 6 ↔ 18, 9 ↔ 12, dan 12 ↔ ?. Hasil kali setiap pasangan selalu 108 (4 × 27 = 108, 6 × 18 = 108, 9 × 12 = 108), jadi 12 × ? = 108 dan ? = 108 ÷ 12 = 9.\n\nOpsi 4 hanya menyalin bilangan pertama tanpa menguji pasangannya. Opsi 12 menyalin bilangan di seberangnya. Opsi 18 membagi 108 dengan 6, pasangan yang salah. Opsi 27 membagi 108 dengan 4, juga pasangan yang salah. Tips: cari dulu besaran yang sama pada semua pasangan lengkap. Jawaban: b." },
    build([p], 300, { ring: "outer", i: 7 }, 9, ann, 365, [pa]), 9);
}
// 52 putaran (sedang): dari panah, +3 dan ×2 bergantian; tidak disambung dari juring terakhir ke juring awal.
{
  const v = [6]; for (let i = 0; i < 5; i++) v.push(i % 2 ? v[i] * 2 : v[i] + 3);
  assert.deepEqual(v, [6, 9, 18, 21, 42, 45]);
  const p: Pie = { cx: 425, cy: 155, r: 125, outer: v, startArrow: true }, pa: Pie = { ...p, cy: 190 };
  const ann = redText(425, 362, "+3, ×2, +3, ×2, +3", 26) + redText(425, 398, "42 + 3 = 45", 26);
  push({ seq: 52, key: "D", instruksi: PANAH + BUNDAR, choices: ["24", "39", "42", "45", "84"], tingkat: 2,
    pembahasan: "Mulai dari panah dan baca searah jarum jam: 6 → 9 (+3), 9 → 18 (×2), 18 → 21 (+3), 21 → 42 (×2). Operasinya bergantian tambah 3 dan kali 2. Setelah ×2, giliran berikutnya +3, jadi ? = 42 + 3 = 45.\n\nOpsi 24 menambah 3 pada 21 lagi, seolah 42 tidak ada. Opsi 39 membalik operasi menjadi kurang (42 − 3). Opsi 42 menyalin juring terakhir tanpa menjalankan operasi. Opsi 84 salah giliran, mengalikan 2 dua kali berturut-turut. Tips: tulis operasi di atas setiap panah agar giliran tidak tertukar. Jawaban: d." },
    build([p], 300, { ring: "outer", i: 5 }, 45, ann, 410, [pa]), 45);
}
// 53 dalam → luar (HOTS): luar = 2 × dalam² + 1; aturan linear dari dua pasangan pertama gugur di pasangan ketiga.
{
  const inner = [2, 4, 6, 7], outer = inner.map((x) => 2 * x * x + 1);
  assert.deepEqual(outer, [9, 33, 73, 99]);
  assert.notEqual(9 + ((33 - 9) / 2) * (6 - 2), 73, "aturan linear harus gugur di pasangan ketiga");
  const p: Pie = { cx: 425, cy: 150, r: 130, outer, inner }, pa: Pie = { ...p, cx: 290, cy: 160 };
  const ann = inner.map((d, i) => redText(560, 82 + 52 * i, `2 × ${d}² + 1 = ${i === 3 ? "?" : outer[i]}`, 26, "start")).join("");
  push({ seq: 53, key: "C", instruksi: BUNDAR, choices: ["15", "98", "99", "100", "129"], tingkat: 3,
    pembahasan: "Bandingkan bilangan dalam dan luar pada juring yang sama: 2 → 9, 4 → 33, 6 → 73. Ketiganya memenuhi luar = 2 × dalam² + 1 (2 × 4 + 1 = 9, 2 × 16 + 1 = 33, 2 × 36 + 1 = 73). Dugaan linear dari dua pasangan pertama (naik 12 tiap 1 langkah dalam) meramalkan 57 untuk 6, jadi gugur. Untuk 7: 2 × 49 + 1 = 99.\n\nOpsi 15 lupa memangkatkan (2 × 7 + 1). Opsi 98 lupa menambah 1 (2 × 49). Opsi 100 menambah 2, bukan 1 (98 + 2). Opsi 129 memakai 8, bukan 7 (2 × 8² + 1). Tips: uji dugaan aturan pada semua juring yang lengkap, bukan dua saja. Jawaban: c." },
    build([p], 300, { ring: "outer", i: 3 }, 99, ann, 320, [pa]), 99);
}
// 54 pusat pada tiga lingkaran (HOTS): pusat = atas × bawah − kanan × kiri.
{
  const c = [[8, 3, 5, 4], [9, 4, 6, 5], [7, 5, 8, 6]].map(([t, r, b, l]) => ({ v: [t, r, b, l], center: t * b - r * l }));
  assert.deepEqual(c.map((x) => x.center), [28, 34, 26]);
  const sum = (v: number[]) => v.reduce((s, x) => s + x);
  assert.notEqual(sum(c[0].v), c[0].center, "aturan 'jumlah semua' harus gugur");
  assert.notEqual(c[0].v[0] * c[0].v[2] - (c[0].v[1] + c[0].v[3]), c[0].center, "aturan pkg 5 (atas × bawah − jumlah) harus gugur");
  const pies: Pie[] = c.map((x, i) => ({ cx: 155 + i * 270, cy: 150, r: 112, outer: x.v, center: x.center }));
  const ann = c.map((x, i) => { const [t, r, b, l] = x.v; return redText(155 + i * 270, 302, `${t}×${b} − ${r}×${l} = ${i === 2 ? "?" : x.center}`, 22); }).join("");
  push({ seq: 54, key: "A", instruksi: BUNDAR, choices: ["26", "30", "34", "56", "86"], tingkat: 3,
    pembahasan: "Bilangan di pusat = (atas × bawah) − (kanan × kiri). Lingkaran 1: 8 × 5 − 3 × 4 = 40 − 12 = 28. Lingkaran 2: 9 × 6 − 4 × 5 = 54 − 20 = 34. Lingkaran 3: 7 × 8 − 5 × 6 = 56 − 30 = 26.\n\nOpsi 30 berhenti pada hasil kali kanan × kiri (5 × 6). Opsi 34 menyalin pusat lingkaran kedua. Opsi 56 lupa mengurangi (hanya 7 × 8). Opsi 86 menjumlahkan, bukan mengurangi (56 + 30). Tips: rumuskan aturan dari lingkaran 1, lalu buktikan di lingkaran 2 sebelum menghitung lingkaran 3. Jawaban: a." },
    build(pies, 290, { ring: "center", pie: 2 }, 26, ann, 325), 26);
}
// 55 huruf ↔ angka berhadapan (sedang): angka = nilai huruf + 6.
{
  const L = ["E", "I", "M", "Q"], num = L.map((l) => val(l) + 6);
  assert.deepEqual(num, [11, 15, 19, 23]);
  const p: Pie = { cx: 425, cy: 150, r: 130, outer: [...L, ...num] }, pa: Pie = { ...p, cx: 290, cy: 160 };
  const ann = L.map((l, i) => redText(560, 82 + 52 * i, `${l} = ${val(l)} → ${val(l)} + 6 = ${i === 3 ? "?" : num[i]}`, 26, "start")).join("");
  push({ seq: 55, key: "E", instruksi: BUNDAR_HURUF, choices: ["11", "17", "19", "22", "23"], tingkat: 2,
    pembahasan: "Huruf dan angka saling berhadapan: E ↔ 11, I ↔ 15, M ↔ 19, Q ↔ ?. Ubah huruf ke urutannya: E = 5, I = 9, M = 13, Q = 17. Setiap angka = urutan huruf + 6 (5 + 6 = 11, 9 + 6 = 15, 13 + 6 = 19), jadi ? = 17 + 6 = 23.\n\nOpsi 11 membalik operasi (17 − 6). Opsi 17 lupa menambah 6 dan hanya menulis urutan Q. Opsi 19 menyalin angka pasangan M. Opsi 22 salah menghitung urutan Q menjadi 16 (16 + 6). Tips: ubah semua huruf ke angka dulu, baru cari selisihnya. Jawaban: e." },
    build([p], 300, { ring: "outer", i: 7 }, 23, ann, 320, [pa]), 23);
}
// 56 lompatan huruf (HOTS): dari panah, maju 3, 4, 5, 6, … posisi; lewat Z kembali ke A.
{
  const n = [12]; for (let s = 3; s <= 7; s++) n.push(n[n.length - 1] + s);
  const L = n.map(letter);
  assert.deepEqual(L, ["L", "O", "S", "X", "D", "K"]);
  const p: Pie = { cx: 425, cy: 155, r: 125, outer: L, startArrow: true }, pa: Pie = { ...p, cy: 190 };
  const ann = redText(425, 362, "L(12) +3 O(15) +4 S(19) +5 X(24) +6 D(28 − 26 = 4)", 22) + redText(425, 398, "D(4) + 7 = 11 = K", 26);
  push({ seq: 56, key: "B", instruksi: "Huruf dibaca searah jarum jam mulai dari tanda panah. Huruf mewakili urutannya dalam alfabet (A = 1, B = 2, …, Z = 26); bila hitungan melewati Z, lanjutkan dari A. Tentukan huruf yang tepat untuk menggantikan tanda tanya (?) pada gambar.",
    choices: ["D", "K", "L", "M", "X"], tingkat: 3,
    pembahasan: "Ubah huruf ke urutannya mulai dari panah: L = 12, O = 15, S = 19, X = 24, D = 4. Lompatannya +3, +4, +5, lalu +6 (24 + 6 = 30, melewati Z sehingga 30 − 26 = 4 = D). Lompatan berikutnya +7: 4 + 7 = 11 = K.\n\nOpsi D menyalin huruf terakhir tanpa melompat. Opsi L melompat 8, satu terlalu jauh. Opsi M melompat 9, melewatkan satu kenaikan. Opsi X menyalin huruf sebelum putaran dan mengabaikan D. Tips: catat besar lompatan di setiap langkah, lalu kurangi 26 bila melewati Z. Jawaban: b." },
    build([p], 300, { ring: "outer", i: 5 }, "K", ann, 410, [pa]), "K");
}
