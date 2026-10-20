import assert from "node:assert/strict";
import { BOBOT, JALUR, hitungPsikogram, kategoriWS, posisiDariTotal, rsKecerdasan, rsKepribadian, rsSikapKerja, wsDariNorma, normaDari, kunciNorma, NORMA_MIN, type Aspek } from "./psikogram";

for (const j of JALUR) assert.equal(Object.values(BOBOT[j]).reduce((a, b) => a + b, 0), 20, `${j} bobot ≠ 20`);

assert.deepEqual([20, 16, 15.9, 11.5, 11.44, 8.5, 8.4, 4, 3.9, 0].map(kategoriWS), ["B", "B", "CB", "CB", "C", "C", "K", "K", "KS", "KS"]);

// Tabel posisi Lampiran A hlm 22.
assert.equal(posisiDariTotal(-1520), 1);
assert.equal(posisiDariTotal(-80), 37);
assert.equal(posisiDariTotal(0), 39);
assert.equal(posisiDariTotal(18), 39);
assert.equal(posisiDariTotal(19), 40);
assert.equal(posisiDariTotal(39), 60);
assert.equal(posisiDariTotal(40), 61);
assert.equal(posisiDariTotal(41), 61);
assert.equal(posisiDariTotal(72), 80);
assert.equal(posisiDariTotal(80), 85);

const semua = (ws: number) => Object.fromEntries(Object.keys(BOBOT.BINTARA).map((a) => [a, ws])) as Partial<Record<Aspek, number>>;

// Semua C → total 40 → posisi 61 → tepat MS.
const c = hitungPsikogram("BINTARA", semua(10));
assert.equal(c.total, 40);
assert.equal(c.nilai_akhir, 61);
assert.equal(c.status, "MS");

// Semua B → 85.
assert.equal(hitungPsikogram("BINTARA", semua(20)).nilai_akhir, 85);

// Satu KS berbobot 1, sisanya B → total 0 → posisi 39 → TMS.
const ks = hitungPsikogram("BINTARA", { ...semua(20), verbal: 2 });
assert.equal(ks.total, 0);
assert.equal(ks.nilai_akhir, 39);
assert.equal(ks.status, "TMS");
assert.deepEqual(ks.aspek_ks, ["verbal"]);

// Aspek belum diuji → tanpa nilai akhir; KS tetap mematikan.
const { loyalitas, kerja_sama, ...tanpa } = semua(20);
void loyalitas; void kerja_sama;
const kurang = hitungPsikogram("BINTARA", tanpa);
assert.deepEqual(kurang.belum_diuji, ["loyalitas", "kerja_sama"]);
assert.equal(kurang.nilai_akhir, null);
assert.equal(kurang.status, null);
assert.equal(hitungPsikogram("BINTARA", { ...tanpa, ketahanan: 0 }).status, "TMS");

// Akpol tidak memakai loyalitas/kerja sama → lengkap dari aspek yang sama.
assert.equal(hitungPsikogram("AKPOL", { ...semua(10), analitis: 10 }).status, "MS");

// WS dari data sesi.
const kec = rsKecerdasan([
  ...Array.from({ length: 25 }, (_, i) => ({ sequence_number: i + 1, benar: i < 20 })),   // verbal 20/25
  ...Array.from({ length: 25 }, (_, i) => ({ sequence_number: i + 76, benar: false })),  // praktis 0/25
]);
assert.deepEqual(kec, { verbal: 0.8, praktis: 0 });
assert.deepEqual(rsKepribadian([
  { aspect: "Prososial", skor: 4, max: 4 }, { aspect: "Prososial", skor: 1, max: 4 }, { aspect: "Prososial", skor: 0, max: 4 },
  { aspect: "Kerja Sama", skor: 4, max: 4 }, { aspect: "Bukan Aspek", skor: 4, max: 4 },
]), { prososial: 0.3333, kerja_sama: 1 });
// SJT bobot 1–5: (bobot − 1) / 4 → 5 = 1, 3 = 0,5, 1 = 0.
assert.deepEqual(rsKepribadian([
  { aspect: "Stabilitas Emosi", skor: 5, max: 5 }, { aspect: "Stabilitas Emosi", skor: 3, max: 5 }, { aspect: "Stabilitas Emosi", skor: 1, max: 5 },
]), { stabilitas_emosi: 0.5 });
assert.deepEqual(rsSikapKerja(50, 100, null), { kecepatan: 0.5, ketelitian: 1 });

// Norma kelompok: WS = 10 + 3z. Rata-rata → 10 (C), +2 SD → 16 (B), −2 SD → 4 (K), < −2 SD → KS.
const norma = { ketahanan: { n: NORMA_MIN, mean: 0.2, sd: 0.1 } };
assert.equal(wsDariNorma("ketahanan", 0.2, norma), 10);
assert.equal(wsDariNorma("ketahanan", 0.4, norma), 16);
assert.equal(wsDariNorma("ketahanan", 0, norma), 4);
assert.equal(kategoriWS(wsDariNorma("ketahanan", -0.01, norma)), "KS");
assert.equal(wsDariNorma("ketahanan", 0.2, { ketahanan: { n: NORMA_MIN - 1, mean: 0.2, sd: 0.1 } }), 4); // cadangan proporsi
assert.deepEqual(normaDari([{ verbal: 0.2 }, { verbal: 0.4 }]), { verbal: { n: 2, mean: 0.3, sd: 0.1 } });
// Norma SJT terpisah: kunci "sjt:<aspek>" hanya untuk aspek Kepribadian.
const normaKp = { prososial: { n: NORMA_MIN, mean: 0.5, sd: 0.1 }, "sjt:prososial": { n: NORMA_MIN, mean: 0.8, sd: 0.1 } };
assert.equal(wsDariNorma("prososial", 0.8, normaKp), 19);
assert.equal(wsDariNorma("prososial", 0.8, normaKp, true), 10);
assert.equal(kunciNorma("verbal", true), "verbal");
// Norma berplafon (rata-rata tinggi, mis. prososial 20 Okt): 10 + 3z mentok 13,6 di RS 1; lantai garis lurus → 20 (B).
const normaTinggi = { prososial: { n: NORMA_MIN, mean: 0.783, sd: 0.181 } };
assert.equal(wsDariNorma("prososial", 1, normaTinggi), 20);
assert.equal(kategoriWS(wsDariNorma("prososial", 1, normaTinggi)), "B");
assert.equal(wsDariNorma("prososial", 0.783, normaTinggi), 10);
assert.equal(wsDariNorma("prososial", 0.9, normaTinggi), 15.39); // 10 + 10 × 0,117 / 0,217
assert.equal(wsDariNorma("prososial", 0.6, normaTinggi), 6.97); // di bawah rata-rata tetap 10 + 3z
for (let rs = 0, prev = -1; rs <= 1.0001; rs += 0.01) {
  const ws = wsDariNorma("prososial", rs, normaTinggi);
  assert.ok(ws >= prev, `WS tidak boleh turun saat RS naik (rs ${rs.toFixed(2)})`);
  prev = ws;
}
assert.equal(wsDariNorma("prososial", 0.5, { prososial: normaKp.prososial }, true), 10); // tanpa norma SJT → proporsi × 20

console.log("psikogram.test ok");
