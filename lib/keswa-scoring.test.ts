import assert from "node:assert/strict";
import { KESWA_TOTAL, nilaiKeswa, pemicuKeswa, type KeswaKunci } from "./keswa-scoring";
import { pembahasanKeswa, ringkasNomor } from "./keswa-pembahasan";
import { cekBaris } from "./keswa-teks";

// Jalankan: npx tsx lib/keswa-scoring.test.ts
const kunci: KeswaKunci = {
  sok: Array.from({ length: 15 }, (_, i) => [i, i % 2 ? "Y" : "T"] as [number, "Y" | "T"]),
  acak: Array.from({ length: 15 }, (_, i) => [20 + i, i % 2 ? "Y" : "T"] as [number, "Y" | "T"]),
  sama: Array.from({ length: 10 }, (_, i) => [40 + i, 300 + i] as [number, number]),
  lawan: Array.from({ length: 10 }, (_, i) => [60 + i, 400 + i] as [number, number]),
};
const isi = (f: (i: number) => string) => Array.from({ length: KESWA_TOTAL }, (_, i) => f(i)).join("");
const set = (s: string, i: number, c: string) => s.slice(0, i) + c + s.slice(i + 1);

// Jujur: tidak menyangkal, tidak menyimpang, konsisten, Ya/Tidak campur.
let jujur = isi((i) => (i % 2 ? "Y" : "T"));
for (const [i, j] of [...kunci.sok, ...kunci.acak]) jujur = set(jujur, i, j === "Y" ? "T" : "Y");
for (const [a, b] of kunci.sama) jujur = set(jujur, b, jujur[a]);
for (const [a, b] of kunci.lawan) jujur = set(jujur, b, jujur[a] === "Y" ? "T" : "Y");
const ok = nilaiKeswa(jujur, kunci);
assert.equal(ok.valid, true);
assert.deepEqual([ok.kosong.nilai, ok.konsistensi.nilai, ok.sokSempurna.nilai, ok.acak.nilai], [0, 0, 0, 0]);

// Semua "Ya": pola gagal.
assert.equal(nilaiKeswa(isi(() => "Y"), kunci).pola.lolos, false);

// Kosong: 29 lolos, 30 gagal.
let k = jujur;
for (let i = 100; i < 129; i++) k = set(k, i, "-");
assert.equal(nilaiKeswa(k, kunci).kosong.lolos, true);
assert.equal(nilaiKeswa(set(k, 129, "-"), kunci).kosong.lolos, false);

// Sok sempurna: 9 disangkal lolos, 10 gagal.
let s = jujur;
for (const [i, j] of kunci.sok.slice(0, 9)) s = set(s, i, j);
assert.equal(nilaiKeswa(s, kunci).sokSempurna.lolos, true);
s = set(s, kunci.sok[9][0], kunci.sok[9][1]);
const sHasil = nilaiKeswa(s, kunci);
assert.equal(sHasil.sokSempurna.nilai, 10);
assert.equal(sHasil.valid, false);

// Acak: 6 menyimpang gagal.
let a = jujur;
for (const [i, j] of kunci.acak.slice(0, 6)) a = set(a, i, j);
assert.equal(nilaiKeswa(a, kunci).acak.lolos, false);

// Konsistensi: 6 pasangan bertentangan gagal; pasangan dengan soal kosong tidak dihitung.
let c = jujur;
for (const [x, y] of kunci.sama.slice(0, 3)) c = set(c, y, c[x] === "Y" ? "T" : "Y");
for (const [x, y] of kunci.lawan.slice(0, 3)) c = set(c, y, c[x]);
assert.equal(nilaiKeswa(c, kunci).konsistensi.nilai, 6);
assert.equal(nilaiKeswa(c, kunci).konsistensi.lolos, false);
assert.equal(nilaiKeswa(set(c, kunci.sama[0][1], "-"), kunci).konsistensi.nilai, 5);

// Pemicu: indeks yang sama dengan hitungan skor.
const pc = pemicuKeswa(set(c, 5, "-"), kunci);
assert.deepEqual(pc.bentrok.map((x) => [x.a, x.jenis]), [[40, "sama"], [41, "sama"], [42, "sama"], [60, "lawan"], [61, "lawan"], [62, "lawan"]]);
assert.deepEqual(pc.kosong, [5]);
assert.deepEqual(pemicuKeswa(s, kunci).sok, kunci.sok.slice(0, 10).map(([i]) => i));
assert.deepEqual(pemicuKeswa(a, kunci).acak, kunci.acak.slice(0, 6).map(([i]) => i));
assert.equal(ringkasNomor([2, 3, 4, 8]), "3–5, 9");

// Pembahasan: urutan sama dengan cekBaris, butir hanya soal validitas.
const soal = Array.from({ length: KESWA_TOTAL }, (_, i) => `Soal ${i + 1}.`);
const bahas = pembahasanKeswa(c, soal, kunci);
assert.deepEqual(bahas.map((b) => b.judul), cekBaris(nilaiKeswa(c, kunci)).map((b) => b.judul));
assert.equal(bahas[1].items.length, 6);
assert.equal(pembahasanKeswa(jujur, soal, kunci).filter((b) => b.items.some((x) => x.butir.some((y) => y.tandai))).length, 0);

// Penanda sorotan **...** selalu berpasangan.
for (const b of [...bahas, ...pembahasanKeswa(a, soal, kunci), ...pembahasanKeswa(s, soal, kunci)])
  for (const t of [b.diukur, b.alasan, b.analogi, ...b.saran, ...b.items.map((x) => x.catatan)]) assert.equal(t.split("**").length % 2, 1, t);

console.log("keswa-scoring OK");
