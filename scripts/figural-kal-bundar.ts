import assert from "node:assert/strict";
import { BUNDAR, BUNDAR_HURUF, KEYS, type Key, type Pie, pieSvg } from "./figural-lib";

// Pola bundar Latihan Paket 2 (package_number 3), nomor 51-56. Aturan berbeda dari Simulasi
// Paket 2 (s2): R1 berseberangan, R2 putaran, R3 cincin, R5 antar-lingkaran, huruf (a) dan (b).
// Kunci dihitung dari aturan lalu dicocokkan dengan opsi kunci.

export type BundarItem = { seq: number; key: Key; instruksi: string; svg: string; choices: string[]; tingkat: 2 | 3; pembahasan: string };
export const BUNDAR_ITEMS: BundarItem[] = [];
const P = "kal3b-ah-";
const svg = (pies: Pie[], h?: number) => pieSvg(pies.map((p) => ({ ...p, idPrefix: P })), h);
const push = (it: BundarItem, answer: string | number) => {
  assert.equal(it.choices[KEYS.indexOf(it.key)], String(answer), `bundar ${it.seq}: kunci tidak cocok dengan aturan`);
  assert.match(it.pembahasan, new RegExp(`Jawaban: ${it.key.toLowerCase()}\\.$`), `bundar ${it.seq}: pembahasan tidak menyebut kunci`);
  BUNDAR_ITEMS.push(it);
};
const val = (ch: string) => ch.charCodeAt(0) - 64;

// 51 R1 berseberangan: bilangan di seberang = 2 × bilangan + 1.
{
  const a = [3, 5, 8, 10], b = a.map((x) => 2 * x + 1);
  assert.deepEqual(b, [7, 11, 17, 21]);
  push({ seq: 51, key: "D", instruksi: BUNDAR, svg: svg([{ cx: 425, cy: 150, r: 130, outer: [...a, ...b.slice(0, 3), "?"] }]), choices: ["18", "19", "20", "21", "23"], tingkat: 2,
    pembahasan: "Pasangkan bilangan yang saling berhadapan: 3 ↔ 7, 5 ↔ 11, 8 ↔ 17. Bilangan di seberang = 2 × bilangan + 1 (2 × 3 + 1 = 7, 2 × 5 + 1 = 11, 2 × 8 + 1 = 17). Di hadapan 10: 2 × 10 + 1 = 21. Opsi 20 lupa menambah 1. Jawaban: d." }, b[3]);
}
// 52 R2 putaran: searah jarum jam dari panah, tiap bilangan = 2 × sebelumnya − 1.
{
  const v = [3]; for (let i = 1; i < 6; i++) v.push(2 * v[i - 1] - 1);
  assert.deepEqual(v, [3, 5, 9, 17, 33, 65]);
  push({ seq: 52, key: "C", instruksi: "Bilangan dibaca searah jarum jam mulai dari tanda panah. " + BUNDAR, svg: svg([{ cx: 425, cy: 155, r: 125, outer: [...v.slice(0, 5), "?"], startArrow: true }]), choices: ["49", "64", "65", "66", "67"], tingkat: 2,
    pembahasan: "Dibaca searah jarum jam mulai dari 3: 3, 5, 9, 17, 33. Setiap bilangan = 2 × bilangan sebelumnya − 1 (2 × 17 − 1 = 33). Cara lain: selisihnya 2, 4, 8, 16, jadi selisih berikutnya 32. Bilangan berikutnya 2 × 33 − 1 = 65. Opsi 64 lupa dikurangi 1, dan opsi 49 hanya menambah selisih 16 lagi. Jawaban: c." }, v[5]);
}
// 53 R3 cincin: luar = 2 × dalam² + 1 (bukan aturan linear).
{
  const inner = [3, 1, 4, 2], outer = inner.map((x) => 2 * x * x + 1);
  assert.deepEqual(outer, [19, 3, 33, 9]);
  // aturan linear a·x + b dari dua contoh pertama harus gugur di contoh ketiga
  const a = (19 - 3) / (3 - 1), b0 = 3 - a;
  assert.notEqual(a * 4 + b0, 33);
  push({ seq: 53, key: "B", instruksi: BUNDAR, svg: svg([{ cx: 425, cy: 150, r: 130, outer: [...outer.slice(0, 3), "?"], inner }]), choices: ["8", "9", "10", "11", "17"], tingkat: 3,
    pembahasan: "Bandingkan cincin dalam dan luar pada juring yang sama: 3 → 19, 1 → 3, 4 → 33. Aturannya luar = 2 × dalam² + 1 (2 × 9 + 1 = 19, 2 × 1 + 1 = 3, 2 × 16 + 1 = 33). Aturan kali tetap (misalnya × 8 − 5) cocok untuk dua juring pertama tetapi gugur di juring ketiga. Untuk dalam 2: 2 × 4 + 1 = 9. Opsi 17 menghitung 2⁴ + 1. Jawaban: b." }, outer[3]);
}
// 54 R5 antar-lingkaran: pusat = (atas + bawah) × (kanan − kiri).
{
  const c = [[3, 6, 5, 2], [4, 7, 2, 4], [5, 9, 3, 6]].map(([t, r, b, l]) => ({ v: [t, r, b, l], center: (t + b) * (r - l) }));
  assert.deepEqual(c.map((x) => x.center), [32, 18, 24]);
  assert.notEqual(c[1].v.reduce((s, x) => s + x) * 2, c[1].center, "aturan 'jumlah × 2' harus gugur");
  push({ seq: 54, key: "A", instruksi: BUNDAR, svg: svg(c.map((x, i) => ({ cx: 155 + i * 270, cy: 150, r: 112, outer: x.v, center: i === 2 ? "?" : x.center })), 290), choices: ["24", "27", "30", "36", "46"], tingkat: 3,
    pembahasan: "Bilangan di pusat = (atas + bawah) × (kanan − kiri). Lingkaran 1: (3 + 5) × (6 − 2) = 32. Lingkaran 2: (4 + 2) × (7 − 4) = 18. Lingkaran 3: (5 + 3) × (9 − 6) = 24. Aturan 'jumlah semua × 2' cocok untuk lingkaran 1 (16 × 2) tetapi gugur di lingkaran 2. Opsi 46 adalah jumlah lingkaran 3 dikali 2. Jawaban: a." }, c[2].center);
}
// 55 huruf (a): angka di seberang huruf = urutan × 3 − 2.
{
  const letters = ["D", "G", "J", "M"], nums = letters.map((l) => val(l) * 3 - 2);
  assert.deepEqual(nums, [10, 19, 28, 37]);
  push({ seq: 55, key: "E", instruksi: BUNDAR_HURUF, svg: svg([{ cx: 425, cy: 150, r: 130, outer: [...letters, ...nums.slice(0, 3), "?"] }]), choices: ["35", "36", "38", "39", "37"], tingkat: 3,
    pembahasan: "Ubah huruf menjadi urutannya: D = 4, G = 7, J = 10, M = 13. Pasangan yang berhadapan: 4 ↔ 10, 7 ↔ 19, 10 ↔ 28. Aturannya angka = urutan × 3 − 2 (4 × 3 − 2 = 10). Untuk M: 13 × 3 − 2 = 37. Opsi 39 lupa mengurangi 2, dan opsi 36 memakai urutan L (12) karena salah hitung satu huruf. Jawaban: e." }, nums[3]);
}
// 56 huruf (b): nilai huruf dikali 2; lewat Z kembali ke A (32 − 26 = 6 = F).
{
  const vals = [2]; for (let i = 1; i < 5; i++) vals.push(vals[i - 1] * 2);
  const wrap = (n: number) => ((n - 1) % 26) + 1, letter = (n: number) => String.fromCharCode(64 + wrap(n));
  assert.deepEqual(vals.map(letter), ["B", "D", "H", "P", "F"]);
  push({ seq: 56, key: "A", instruksi: "Huruf dibaca searah jarum jam mulai dari tanda panah. Huruf mewakili urutannya dalam alfabet (A = 1, B = 2, …, Z = 26); setelah Z, hitungan kembali ke A. Tentukan huruf yang tepat untuk menggantikan tanda tanya (?) pada gambar.",
    svg: svg([{ cx: 425, cy: 155, r: 125, outer: [...vals.slice(0, 4).map(letter), "?"], startArrow: true }]), choices: ["F", "E", "G", "Q", "Z"], tingkat: 3,
    pembahasan: "Ubah huruf menjadi urutannya: B = 2, D = 4, H = 8, P = 16. Setiap nilai dikali 2, jadi berikutnya 32. Alfabet hanya sampai 26, jadi hitungan kembali ke A: 32 − 26 = 6 = F. Opsi Q hanya maju satu huruf dari P. Opsi Z berhenti di huruf terakhir tanpa kembali ke A. Opsi E dan G salah hitung satu posisi. Jawaban: a." }, letter(vals[4]));
}
