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
  K10: { label: "Angka dalam Gambar", aspek: "analitis", desc: "Operasi tersembunyi, nilai huruf, dan bahasa panda", prefix: ["ANL-ANGKA-", "ANL-OPERASI-", "ANL-KODE"] },
  K11: { label: "Wacana Logika", aspek: "analitis", desc: "Urutan, jadwal, perbandingan banyak atribut", prefix: ["ANL-WCN-"] },
  K12: { label: "Pola & Matriks Gambar", aspek: "figural", desc: "Matriks 3×3, deret, dan analogi gambar", prefix: ["FIG-MTX-", "FIG-SERI", "FIG-ANALOGI", "FIG-ROTASI-"] },
  K13: { label: "Ikon Kategori", aspek: "figural", desc: "Kelompok gambar berdasarkan kategori", prefix: ["FIG-IKON-"] },
  K14: { label: "Susun Potongan Gambar", aspek: "figural", desc: "Urutkan potongan menjadi gambar utuh", prefix: ["FIG-SUSUN-"] },
  K17: { label: "Denah & Arah Mata Angin", aspek: "analitis", desc: "Arah 8 mata angin, rute belok kiri/kanan, bangunan yang dilalui, pojok & di antara jalan, peta diputar, ingat denah", prefix: ["FIG-DENAH-"] },
  K16: { label: "Kecukupan Data", aspek: "logika", desc: "Menilai apakah pernyataan cukup untuk menjawab", prefix: ["LOG-KCK-"] },
  K15: { label: "Sikap Kerja", aspek: "sikap", desc: "Pilihan A/B sesuai kunci latihan nilai kerja institusi", prefix: ["SKJ-"], opsi: 2 },
};

/** Kategori soal di navigasi sesi drill: awalan sub_type → label, urutan = urutan grup. Awalan terpanjang menang. */
const DRILL_CATEGORIES: [string, string][] = [
  ["VRB-SIN", "Sinonim"], ["VRB-ANT", "Antonim"],
  ["VRB-ANL-1K", "Analogi satu kata"], ["VRB-ANL-2K", "Analogi dua kata"], ["VRB-ANL-PAIR", "Pasangan analogi"],
  ["VRB-GJL", "Kata ganjil"], ["VRB-GJL-NUM", "Bilangan ganjil"],
  ["VRB-BACA-TEKS", "Bacaan teks"], ["VRB-BACA-TABEL", "Bacaan tabel"],
  ["NUM-HIT-PECAHAN", "Pecahan"], ["NUM-HIT-DESIMAL", "Desimal"], ["NUM-HIT-PERSEN", "Persen"],
  ["NUM-HIT-AKAR-PANGKAT", "Akar & pangkat"], ["NUM-HIT-CAMPUR", "Operasi campuran"], ["NUM-HIT-TEORI", "Teori bilangan"],
  ["NUM-ALJ", "Aljabar & perbandingan"],
  ["NUM-SAT-KONVERSI", "Konversi satuan"], ["NUM-SAT-CERITA", "Soal cerita satuan"],
  ["NUM-CRT-ALOKASI", "Alokasi waktu"], ["NUM-CRT-GERAK", "Jarak & kecepatan"], ["NUM-CRT-RASIO", "Rasio"],
  ["NUM-CRT-PROPORSI", "Proporsi"], ["NUM-CRT-UANG", "Uang"], ["NUM-CRT-UMUR", "Umur"], ["NUM-CRT-LINIER", "Persamaan linier"],
  ["NUM-CRT-PENCACAHAN", "Pencacahan"], ["NUM-CRT-HIMPUNAN", "Himpunan"], ["NUM-CRT-GEOMETRI", "Geometri"], ["NUM-CRT-BULAT", "Bilangan bulat"],
  ["LOG-SIL-KATEGORI", "Silogisme kategorikal"], ["LOG-SIL-KONDISIONAL", "Kondisional"], ["LOG-SIL-JEBAKAN", "Jebakan logika"],
  ["ANL-DRT-1TRACK", "Deret angka"], ["ANL-DRT-HURUF", "Deret huruf"], ["ANL-DRT-ALFANUM", "Alfanumerik"],
  ["ANL-DRT-2BARIS", "Deret dua baris"], ["ANL-DRT-LINGKARAN", "Deret lingkaran"],
  ["ANL-ANGKA", "Angka dalam gambar"], ["ANL-OPERASI", "Operasi simbol"], ["ANL-KODE-HURUF", "Nilai huruf"], ["ANL-KODE-PANDA", "Bahasa panda"],
  ["ANL-WCN-URUTAN", "Urutan"], ["ANL-WCN-JADWAL", "Jadwal"],
  ["FIG-MTX", "Matriks gambar"], ["FIG-SERI", "Deret gambar"], ["FIG-ANALOGI", "Analogi gambar"], ["FIG-ROTASI", "Rotasi & cermin"],
  ["FIG-IKON", "Ikon kategori"], ["FIG-SUSUN", "Susun potongan"],
  ["SKJ-MANDIRI", "Kemandirian"], ["SKJ-INOVASI", "Pembaruan"], ["SKJ-RISIKO", "Keberanian bertindak"],
  ["SKJ-INFORMASI", "Keterbukaan informasi"], ["SKJ-REFLEKSI", "Refleksi diri"], ["SKJ-HASIL", "Orientasi hasil"],
  ["SKJ-KEBENARAN", "Kebenaran"], ["SKJ-WEWENANG", "Kewenangan"], ["SKJ-TEGAS", "Ketegasan"],
  ["SKJ-ATURAN", "Penegakan aturan"], ["SKJ-RELIGI", "Makna religius"],
  ["FIG-DENAH-ARAH", "Arah mata angin"], ["FIG-DENAH-RUTE", "Rute & belokan"], ["FIG-DENAH-LEWAT", "Bangunan dilalui"], ["FIG-DENAH-RELASI", "Pojok & di antara jalan"], ["FIG-DENAH-ROTASI", "Rotasi peta & badan"], ["FIG-DENAH-INGAT", "Ingat denah"],
  ["LOG-KCK-NILAI", "Mencari nilai"], ["LOG-KCK-YATIDAK", "Ya atau tidak"], ["LOG-KCK-URUTAN", "Urutan"], ["LOG-KCK-3P", "Tiga pernyataan"],
];

/** [urutan grup, label] untuk sub_type; tidak dikenal → grup terakhir "Lainnya". */
export function drillCategory(subType: string): [number, string] {
  let best = -1;
  DRILL_CATEGORIES.forEach(([p], i) => {
    if (subType.startsWith(p) && (best < 0 || p.length > DRILL_CATEGORIES[best][0].length)) best = i;
  });
  return best < 0 ? [DRILL_CATEGORIES.length, "Lainnya"] : [best, DRILL_CATEGORIES[best][1]];
}

export const DRILL_TIERS = [
  { tier: 1, label: "Dasar" },
  { tier: 2, label: "Menengah" },
  { tier: 3, label: "Lanjut" },
] as const;

