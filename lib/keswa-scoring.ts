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

/** Indeks soal yang memicu tiap cek (0-based). Satu sumber aturan untuk skor dan pembahasan. */
export type KeswaPemicu = {
  kosong: number[];
  /** Pasangan bertentangan; sama = seharusnya selaras, lawan = seharusnya berlawanan. */
  bentrok: { a: number; b: number; jenis: "sama" | "lawan" }[];
  sok: number[];
  acak: number[];
  dijawab: number;
  ya: number;
};

export function pemicuKeswa(jawaban: string, kunci: KeswaKunci): KeswaPemicu {
  const at = (i: number) => (jawaban[i] === "Y" || jawaban[i] === "T" ? (jawaban[i] as Jawab) : null);

  const kosong: number[] = [];
  let ya = 0;
  for (let i = 0; i < jawaban.length; i++) {
    if (!at(i)) kosong.push(i);
    if (at(i) === "Y") ya++;
  }

  const bentrok: KeswaPemicu["bentrok"] = [];
  for (const [a, b] of kunci.sama) if (at(a) && at(b) && at(a) !== at(b)) bentrok.push({ a, b, jenis: "sama" });
  for (const [a, b] of kunci.lawan) if (at(a) && at(b) && at(a) === at(b)) bentrok.push({ a, b, jenis: "lawan" });

  const kena = (list: [number, Jawab][]) => list.filter(([i, j]) => at(i) === j).map(([i]) => i);
  return { kosong, bentrok, sok: kena(kunci.sok), acak: kena(kunci.acak), dijawab: jawaban.length - kosong.length, ya };
}

export function nilaiKeswa(jawaban: string, kunci: KeswaKunci): KeswaHasil {
  const p = pemicuKeswa(jawaban, kunci);
  const kosongN = p.kosong.length;
  const bentrok = p.bentrok.length;
  const pasangan = kunci.sama.length + kunci.lawan.length;
  const sokN = p.sok.length;
  const acakN = p.acak.length;
  const dijawab = p.dijawab;
  const ya = p.ya;
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
