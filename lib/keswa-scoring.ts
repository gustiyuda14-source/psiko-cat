// Penilaian simulasi Keswa: 5 cek validitas, tanpa skor klinis dan tanpa kunci "benar".
// Murni (tanpa server-only) supaya bisa dites; kunci kelompok soal dibaca dari lib/keswa-bank.ts di server.

export const KESWA_TOTAL = 567;
export const KESWA_DURASI_DETIK = 90 * 60;

// ponytail: ambang tebakan masuk akal, belum dikalibrasi; setel ulang dari data keswa_attempts.
export const KESWA_AMBANG = {
  kosong: 30, // gagal bila >= 30 soal tidak dijawab (konvensi Cannot Say MMPI)
  konsistensi: 6, // gagal bila >= 6 dari 20 pasangan bertentangan
  yaMin: 0.15, // gagal bila proporsi "Ya" < 15% ...
  yaMaks: 0.85, // ... atau > 85% dari soal yang dijawab
  sokSempurna: 10, // gagal bila >= 10 dari 15 kekurangan wajar disangkal
  acak: 6, // gagal bila >= 6 dari 15 jawaban menyimpang
} as const;

export type Jawab = "Y" | "T";
/** Indeks soal 0-based + jawaban yang dihitung (menyangkal / menyimpang). */
export type KeswaKunci = {
  sok: [number, Jawab][];
  acak: [number, Jawab][];
  sama: [number, number][];
  lawan: [number, number][];
};

export type KeswaCek = { nilai: number; dari: number; lolos: boolean };
export type KeswaHasil = {
  valid: boolean;
  kosong: KeswaCek;
  konsistensi: KeswaCek;
  /** nilai = jumlah "Ya", dari = jumlah soal dijawab */
  pola: KeswaCek;
  sokSempurna: KeswaCek;
  acak: KeswaCek;
};

/** "Y" / "T" / "-" per soal, panjang KESWA_TOTAL. */
export const JAWABAN_RE = new RegExp(`^[YT-]{${KESWA_TOTAL}}$`);

export function nilaiKeswa(jawaban: string, kunci: KeswaKunci): KeswaHasil {
  const at = (i: number) => (jawaban[i] === "Y" || jawaban[i] === "T" ? (jawaban[i] as Jawab) : null);

  let dijawab = 0;
  let ya = 0;
  for (let i = 0; i < jawaban.length; i++) {
    if (at(i)) dijawab++;
    if (at(i) === "Y") ya++;
  }
  const kosongN = jawaban.length - dijawab;

  let bentrok = 0;
  for (const [a, b] of kunci.sama) if (at(a) && at(b) && at(a) !== at(b)) bentrok++;
  for (const [a, b] of kunci.lawan) if (at(a) && at(b) && at(a) === at(b)) bentrok++;
  const pasangan = kunci.sama.length + kunci.lawan.length;

  const hitung = (list: [number, Jawab][]) => list.filter(([i, j]) => at(i) === j).length;
  const sokN = hitung(kunci.sok);
  const acakN = hitung(kunci.acak);
  const rasio = dijawab ? ya / dijawab : 0;

  const kosong = { nilai: kosongN, dari: jawaban.length, lolos: kosongN < KESWA_AMBANG.kosong };
  const konsistensi = { nilai: bentrok, dari: pasangan, lolos: bentrok < KESWA_AMBANG.konsistensi };
  const pola = { nilai: ya, dari: dijawab, lolos: rasio >= KESWA_AMBANG.yaMin && rasio <= KESWA_AMBANG.yaMaks };
  const sokSempurna = { nilai: sokN, dari: kunci.sok.length, lolos: sokN < KESWA_AMBANG.sokSempurna };
  const acak = { nilai: acakN, dari: kunci.acak.length, lolos: acakN < KESWA_AMBANG.acak };

  return {
    valid: kosong.lolos && konsistensi.lolos && pola.lolos && sokSempurna.lolos && acak.lolos,
    kosong,
    konsistensi,
    pola,
    sokSempurna,
    acak,
  };
}
