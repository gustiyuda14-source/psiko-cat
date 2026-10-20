/**
 * Psikogram resmi Peraturan As SDM Kapolri No. 3/2017, Lampiran A angka 3)–4)
 * (transkrip: docs/riset/sumber/perasisten-sdm-3-2017/TRANSKRIP.md).
 *
 *   WS per aspek (skala 20) → kategori B 16–20 · CB 11,5–15,9 · C 8,5–11,4 · K 4–8,4 · KS 0–3,9
 *   Jumlah aspek = bobot × nilai kategori (B 4 · CB 3 · C 2 · K 1 · KS −76)
 *   Total psikogram → tabel posisi 1–85 → MS bila ≥ 61. KS di aspek mana pun = TMS.
 *
 * RS → WS memakai norma kelompok (Pasal 1 angka 9: WS "menunjukkan posisi individu dalam kelompok").
 * Kelompok = peserta platform (norma-psikogram.json, dibangun scripts/build-norma-psikogram.ts).
 * Rumus skala 20 tidak tertulis di peraturan; WS = 10 + 3z dipilih karena batas kategori
 * tepat simetris di sekitar 10: C 8,5–11,4 = ±0,5 SD dan K/CB berakhir di 4 dan 16 = ±2 SD (inferensi).
 * Di atas rata-rata ada lantai garis lurus ke RS 1 = 20 supaya jawaban sempurna selalu B (lihat wsDariNorma).
 * Aspek tanpa norma cukup (n < NORMA_MIN) jatuh ke proporsi × 20.
 * Kepribadian format situasional (SJT) punya norma sendiri berkunci "sjt:<aspek>": sebaran skornya
 * berbeda dari Likert, jadi kedua format tidak dicampur dalam satu kelompok pembanding.
 * Murni tanpa data/kunci, jadi label & tipe boleh dipakai komponen.
 */

import { round2 } from "./nap";

export const JALUR = ["BINTARA", "TAMTAMA", "AKPOL", "SIPSS"] as const;
export type Jalur = (typeof JALUR)[number];

/** Nama umum per profil peran (platform dipakai peserta Polri dan sekolah kedinasan); padanan Polri di JALUR_SETARA. */
export const JALUR_LABEL: Record<Jalur, string> = { BINTARA: "Pelaksana", TAMTAMA: "Operasional", AKPOL: "Kepemimpinan", SIPSS: "Analis Profesional" };
export const JALUR_SETARA: Record<Jalur, string> = {
  AKPOL: "Setara Akpol, Sekdin, dan setaranya",
  SIPSS: "Setara SIPSS dan formasi lulusan sarjana",
  BINTARA: "Setara Bintara dan staf pelaksana",
  TAMTAMA: "Setara Tamtama dan petugas lapangan",
};

export const ASPEK_LABEL = {
  praktis: "Kemampuan Berpikir Praktis",
  verbal: "Kemampuan Berpikir Verbal",
  logis: "Kemampuan Berpikir Logis",
  analitis: "Kemampuan Berpikir Analitis",
  stabilitas_emosi: "Stabilitas Emosi",
  prososial: "Prososial",
  penyesuaian_diri: "Penyesuaian Diri",
  kepercayaan_diri: "Kepercayaan Diri",
  motif_berprestasi: "Motif Berprestasi",
  pengambilan_keputusan: "Pengambilan Keputusan",
  loyalitas: "Loyalitas",
  kerja_sama: "Kerja Sama",
  kecepatan: "Kecepatan Kerja",
  ketelitian: "Ketelitian Kerja",
  ketahanan: "Ketahanan Kerja",
} as const;
export type Aspek = keyof typeof ASPEK_LABEL;

/** Bobot (BBT) tabel psikogram, Lampiran A hlm 18–21. Tiap jalur berjumlah 20. */
export const BOBOT: Record<Jalur, Partial<Record<Aspek, number>>> = {
  AKPOL: {
    praktis: 1, verbal: 1, logis: 2, analitis: 2,
    stabilitas_emosi: 1, prososial: 2, penyesuaian_diri: 1, kepercayaan_diri: 1, motif_berprestasi: 1, pengambilan_keputusan: 2,
    kecepatan: 2, ketelitian: 2, ketahanan: 2,
  },
  SIPSS: {
    praktis: 1, verbal: 2, logis: 2, analitis: 3,
    stabilitas_emosi: 1, prososial: 1, penyesuaian_diri: 1, kepercayaan_diri: 1, motif_berprestasi: 1, pengambilan_keputusan: 1,
    kecepatan: 1, ketelitian: 3, ketahanan: 2,
  },
  BINTARA: {
    praktis: 2, verbal: 1, logis: 1,
    stabilitas_emosi: 2, prososial: 2, penyesuaian_diri: 1, kepercayaan_diri: 1, motif_berprestasi: 1, pengambilan_keputusan: 1,
    loyalitas: 1, kerja_sama: 2,
    kecepatan: 2, ketelitian: 1, ketahanan: 2,
  },
  TAMTAMA: {
    praktis: 2, verbal: 1, logis: 1,
    stabilitas_emosi: 1, prososial: 2, penyesuaian_diri: 1, kepercayaan_diri: 1, motif_berprestasi: 1,
    loyalitas: 2, kerja_sama: 2,
    kecepatan: 2, ketelitian: 1, ketahanan: 3,
  },
};

export type Kategori = "B" | "CB" | "C" | "K" | "KS";
export const NILAI_KATEGORI: Record<Kategori, number> = { B: 4, CB: 3, C: 2, K: 1, KS: -76 };

/** Rentang di peraturan berhenti di satu desimal (15,9 lalu 16), jadi WS dibulatkan 1 desimal dulu. */
export function kategoriWS(ws: number): Kategori {
  const v = Math.round(ws * 10) / 10;
  if (v >= 16) return "B";
  if (v >= 11.5) return "CB";
  if (v >= 8.5) return "C";
  if (v >= 4) return "K";
  return "KS";
}

const clamp20 = (v: number) => round2(Math.min(20, Math.max(0, v)));

/** Cadangan tanpa norma: proporsi 0–1 dikali 20. */
export const wsDariProporsi = (p: number) => clamp20(p * 20);

/** Kunci norma: nama aspek, atau "sjt:<aspek>" untuk Kepribadian format situasional. */
export type Norma = Partial<Record<string, { n: number; mean: number; sd: number }>>;
export const NORMA_MIN = 30;

export const kunciNorma = (aspek: Aspek, sjt = false) => (sjt && ASPEK_KEPRIBADIAN_SET.has(aspek) ? `sjt:${aspek}` : aspek);

/**
 * WS = 10 + 3z terhadap norma kelompok, batas 0–20.
 * Di atas rata-rata diambil yang lebih besar dari 10 + 3z dan garis lurus rata-rata (10) → RS 1 (20):
 * bila rata-rata kelompok sudah tinggi (Kepribadian ±80%), RS 1 hanya ±1 SD di atasnya sehingga 10 + 3z
 * mentok di CB dan B mustahil walau jawaban sempurna (laporan peserta 20 Okt 2026). Di bawah rata-rata tetap 10 + 3z.
 */
export function wsDariNorma(aspek: Aspek, rs: number, norma: Norma, sjt = false): number {
  const g = norma[kunciNorma(aspek, sjt)];
  if (!g || g.n < NORMA_MIN || g.sd <= 0) return wsDariProporsi(rs);
  const z = 10 + (3 * (rs - g.mean)) / g.sd;
  if (rs <= g.mean || g.mean >= 1) return clamp20(z);
  return clamp20(Math.max(z, 10 + (10 * (rs - g.mean)) / (1 - g.mean)));
}

/** Sampel berkunci kunciNorma (lihat rsNormaSesi). */
export function normaDari(sampel: Record<string, number>[]): Norma {
  const per = new Map<string, number[]>();
  for (const s of sampel) for (const [a, v] of Object.entries(s)) per.set(a, [...(per.get(a) ?? []), v]);
  return Object.fromEntries([...per].map(([a, xs]) => {
    const mean = xs.reduce((x, y) => x + y, 0) / xs.length;
    const sd = Math.sqrt(xs.reduce((x, y) => x + (y - mean) ** 2, 0) / xs.length);
    return [a, { n: xs.length, mean: round4(mean), sd: round4(sd) }];
  }));
}
const round4 = (n: number) => Math.round(n * 10000) / 10000;

/**
 * Batas bawah skor psikogram per posisi 1–85 (Lampiran A hlm 22, "g) Tabel Posisi").
 * Beberapa rentang negatif di sumber tumpang-tindih satu angka (−1520 – −1480 lalu −1481 – −1440);
 * skor di titik tumpang-tindih masuk posisi yang lebih tinggi.
 */
const BATAS_POSISI = [
  -1520, -1481, -1441, -1402, -1362, -1323, -1283, -1244, -1204, -1165, -1125, -1086, -1046, -1007, -968, -928, -889,
  -849, -810, -770, -731, -691, -652, -612, -573, -533, -494, -455, -415, -376, -336, -297, -257, -218,
  -178, -139, -99, -60, -20,
  19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
  40, 42, 43, 45, 47, 48, 50, 52, 53, 55, 57, 58, 60, 62, 63, 65, 67, 68, 70, 72, 73, 75, 77, 78, 80,
];

export function posisiDariTotal(total: number): number {
  let posisi = 1;
  BATAS_POSISI.forEach((batas, i) => { if (total >= batas) posisi = i + 1; });
  return posisi;
}

/** Kategori posisi Lampiran A hlm 21: 1–60 K, 61–80 C, 81–85 B. */
export const kategoriPosisi = (posisi: number): "K" | "C" | "B" => (posisi >= 81 ? "B" : posisi >= 61 ? "C" : "K");

export type BarisPsikogram = { aspek: Aspek; bobot: number; ws: number | null; kategori: Kategori | null; jumlah: number | null };

export type HasilPsikogram = {
  jalur: Jalur;
  baris: BarisPsikogram[];
  /** Aspek berbobot di jalur ini yang tidak punya nilai (modul tidak diambil / bank belum punya butirnya). */
  belum_diuji: Aspek[];
  /** Aspek berkategori KS — "Kategori KS mematikan". */
  aspek_ks: Aspek[];
  total: number | null;
  nilai_akhir: number | null;
  kategori_akhir: "K" | "C" | "B" | null;
  /** null bila ada aspek belum diuji: tabel posisi hanya sah untuk psikogram lengkap (bobot 20). */
  status: "MS" | "TMS" | null;
};

export function hitungPsikogram(jalur: Jalur, ws: Partial<Record<Aspek, number>>): HasilPsikogram {
  const baris = (Object.entries(BOBOT[jalur]) as [Aspek, number][]).map(([aspek, bobot]): BarisPsikogram => {
    const nilai = ws[aspek];
    if (nilai === undefined || !Number.isFinite(nilai)) return { aspek, bobot, ws: null, kategori: null, jumlah: null };
    const kategori = kategoriWS(nilai);
    return { aspek, bobot, ws: round2(nilai), kategori, jumlah: bobot * NILAI_KATEGORI[kategori] };
  });
  const belum_diuji = baris.filter((b) => b.kategori === null).map((b) => b.aspek);
  const aspek_ks = baris.filter((b) => b.kategori === "KS").map((b) => b.aspek);
  if (belum_diuji.length) {
    // KS tetap mematikan walau psikogram belum lengkap.
    return { jalur, baris, belum_diuji, aspek_ks, total: null, nilai_akhir: null, kategori_akhir: null, status: aspek_ks.length ? "TMS" : null };
  }
  const total = baris.reduce((sum, b) => sum + (b.jumlah ?? 0), 0);
  const nilai_akhir = posisiDariTotal(total);
  return {
    jalur, baris, belum_diuji, aspek_ks, total, nilai_akhir,
    kategori_akhir: kategoriPosisi(nilai_akhir),
    status: aspek_ks.length || nilai_akhir < 61 ? "TMS" : "MS",
  };
}

/** RS per aspek dinormalisasi 0–1 (bukan WS). */
export type RS = Partial<Record<Aspek, number>>;

/** Blok nomor Kecerdasan yang sama di semua paket (PEDOMAN_SIMULASI_KECERDASAN §3). */
const BLOK_KECERDASAN: [Aspek, number, number][] = [["verbal", 1, 25], ["logis", 26, 50], ["analitis", 51, 75], ["praktis", 76, 100]];

/** RS per aspek Kecerdasan = benar / butir di blok (Lampiran A: benar 1, salah 0). Blok tanpa butir dilewati. */
export function rsKecerdasan(items: { sequence_number: number; benar: boolean }[]): RS {
  const ws: RS = {};
  for (const [aspek, dari, sampai] of BLOK_KECERDASAN) {
    const blok = items.filter((i) => i.sequence_number >= dari && i.sequence_number <= sampai);
    if (blok.length) ws[aspek] = round4(blok.filter((i) => i.benar).length / blok.length);
  }
  return ws;
}

const ASPEK_KEPRIBADIAN: Record<string, Aspek> = {
  "Stabilitas Emosi": "stabilitas_emosi", Prososial: "prososial", "Penyesuaian Diri": "penyesuaian_diri",
  "Kepercayaan Diri": "kepercayaan_diri", "Motif Berprestasi": "motif_berprestasi",
  "Pengambilan Keputusan": "pengambilan_keputusan", Loyalitas: "loyalitas", "Kerja Sama": "kerja_sama",
};

const ASPEK_KEPRIBADIAN_SET = new Set(Object.values(ASPEK_KEPRIBADIAN));

/**
 * RS per aspek Kepribadian, skor butir digeser ke 0–1: (skor − 1) / (maks − 1), kosong = 0.
 * Likert 1–4 → (skor − 1) / 3; SJT bobot 1–5 → (bobot − 1) / 4.
 */
export function rsKepribadian(items: { aspect: string; skor: number; max: number }[]): RS {
  const acc = new Map<Aspek, { sum: number; n: number }>();
  for (const { aspect, skor, max } of items) {
    const aspek = ASPEK_KEPRIBADIAN[aspect];
    if (!aspek) continue;
    const a = acc.get(aspek) ?? { sum: 0, n: 0 };
    acc.set(aspek, { sum: a.sum + (skor ? (skor - 1) / (max - 1) : 0), n: a.n + 1 });
  }
  return Object.fromEntries([...acc].map(([aspek, a]) => [aspek, round4(a.sum / a.n)]));
}

/** Indeks Ke/Kt/Kh Kecermatan (0–100) → RS kecepatan, ketelitian, ketahanan kerja. */
export function rsSikapKerja(ke: number | null, kt: number | null, kh: number | null): RS {
  const rs: RS = {};
  if (ke != null) rs.kecepatan = round4(ke / 100);
  if (kt != null) rs.ketelitian = round4(kt / 100);
  if (kh != null) rs.ketahanan = round4(kh / 100);
  return rs;
}

export const wsSemua = (rs: RS, norma: Norma, sjt = false): Partial<Record<Aspek, number>> =>
  Object.fromEntries((Object.entries(rs) as [Aspek, number][]).map(([a, v]) => [a, wsDariNorma(a, v, norma, sjt)]));

/** Kategori per aspek tanpa bobot jalur, untuk sesi satu sub-tes (mini tryout). Urut seperti ASPEK_LABEL. */
export type AspekSubtes = { aspek: Aspek; ws: number; kategori: Kategori };
export function aspekSesi(ws: Partial<Record<Aspek, number>>): AspekSubtes[] {
  return (Object.keys(ASPEK_LABEL) as Aspek[])
    .filter((a) => ws[a] !== undefined && Number.isFinite(ws[a]))
    .map((a) => ({ aspek: a, ws: round2(ws[a]!), kategori: kategoriWS(ws[a]!) }));
}

export const hitungSemuaJalur = (ws: Partial<Record<Aspek, number>>) => JALUR.map((jalur) => hitungPsikogram(jalur, ws));
