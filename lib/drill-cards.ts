// Kartu katalog drill Kecerdasan (docs/rencana/drilling/00 §2). Dipakai script build
// (validasi sub_type) dan UI (katalog, label). Aman diimpor dari client.

export type DrillAspek = "verbal" | "numerik" | "logika" | "analitis" | "figural" | "sikap";

/** modul = tes resmi asal aspek: Sikap Kerja bagian tes Kepribadian, sisanya Kecerdasan. */
export const DRILL_ASPEK: { key: DrillAspek; label: string; modul: "Kecerdasan" | "Kepribadian" }[] = [
  { key: "verbal", label: "Verbal", modul: "Kecerdasan" },
  { key: "numerik", label: "Numerik", modul: "Kecerdasan" },
  { key: "logika", label: "Logika", modul: "Kecerdasan" },
  { key: "analitis", label: "Analitis", modul: "Kecerdasan" },
  { key: "figural", label: "Figural", modul: "Kecerdasan" },
  { key: "sikap", label: "Sikap Kerja", modul: "Kepribadian" },
];

/** opsi: jumlah pilihan per soal (default 5 = a–e; Sikap Kerja 2 = a–b). */
export type DrillCard = { label: string; aspek: DrillAspek; desc: string; prefix: string[]; opsi?: number };

export const DRILL_CARDS: Record<string, DrillCard> = {
  K01: { label: "Sinonim & Antonim", aspek: "verbal", desc: "Persamaan dan lawan kata, termasuk kata baku langka", prefix: ["VRB-SIN-", "VRB-ANT-"] },
  K02: { label: "Analogi Kata", aspek: "verbal", desc: "Hubungan pasangan kata", prefix: ["VRB-ANL-"] },
  K03: { label: "Kata Ganjil", aspek: "verbal", desc: "Satu kata yang paling berbeda", prefix: ["VRB-GJL"] },
  K04: { label: "Pemahaman Bacaan", aspek: "verbal", desc: "Wacana dan tabel data", prefix: ["VRB-BACA-"] },
  K05: { label: "Hitung Cepat", aspek: "numerik", desc: "Operasi campuran, pecahan, desimal, akar, persen", prefix: ["NUM-HIT-", "NUM-ALJ-"] },
  K06: { label: "Konversi Satuan", aspek: "numerik", desc: "Panjang, luas, volume, berat, waktu, kuantitas", prefix: ["NUM-SAT-"] },
  K07: { label: "Soal Cerita", aspek: "numerik", desc: "Proporsi, kecepatan, uang, rasio, pencacahan, alokasi waktu", prefix: ["NUM-CRT-"] },
  K08: { label: "Silogisme", aspek: "logika", desc: "Menarik kesimpulan dari premis", prefix: ["LOG-SIL-"] },
  K09: { label: "Deret Angka & Huruf", aspek: "analitis", desc: "Pola deret satu dan dua baris", prefix: ["ANL-DRT-"] },
  K10: { label: "Angka dalam Gambar", aspek: "analitis", desc: "Operasi tersembunyi dan kode", prefix: ["ANL-ANGKA-", "ANL-OPERASI-", "ANL-KODE"] },
  K11: { label: "Wacana Logika", aspek: "analitis", desc: "Urutan, jadwal, perbandingan banyak atribut", prefix: ["ANL-WCN-"] },
  K12: { label: "Pola & Matriks Gambar", aspek: "figural", desc: "Matriks 3×3, deret, dan analogi gambar", prefix: ["FIG-MTX-", "FIG-SERI", "FIG-ANALOGI", "FIG-ROTASI-"] },
  K13: { label: "Ikon Kategori", aspek: "figural", desc: "Kelompok gambar berdasarkan kategori", prefix: ["FIG-IKON-"] },
  K14: { label: "Susun Potongan Gambar", aspek: "figural", desc: "Urutkan potongan menjadi gambar utuh", prefix: ["FIG-SUSUN-"] },
  K16: { label: "Kecukupan Data", aspek: "logika", desc: "Menilai apakah pernyataan cukup untuk menjawab", prefix: ["LOG-KCK-"] },
  K15: { label: "Sikap Kerja", aspek: "sikap", desc: "Pilihan A/B sesuai kunci latihan nilai kerja institusi", prefix: ["SKJ-"], opsi: 2 },
};

export const DRILL_TIERS = [
  { tier: 1, label: "Dasar" },
  { tier: 2, label: "Menengah" },
  { tier: 3, label: "Lanjut" },
] as const;

export const DRILL_SET_SIZE = 10;

/** Progres drill di localStorage: id soal → [benar, percobaan, ms terakhir]. Global per peserta, bukan per paket. */
export const DRILL_PROGRESS_KEY = "psiko_drill_res";
export type DrillProgress = Record<string, [number, number, number]>;

export function readDrillProgress(): DrillProgress {
  try {
    const raw = localStorage.getItem(DRILL_PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as DrillProgress) : {};
  } catch {
    return {};
  }
}

export function writeDrillProgress(progress: DrillProgress) {
  try {
    localStorage.setItem(DRILL_PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // localStorage penuh/diblokir (mode privat): progres hilang saat tab ditutup, latihan tetap jalan.
  }
}
