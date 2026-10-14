// Kartu katalog drill Kecerdasan (docs/rencana/drilling/00 §2). Dipakai script build
// (validasi sub_type) dan UI (katalog, label). Aman diimpor dari client.

export type DrillAspek = "praktis" | "verbal" | "logis" | "analitis" | "integritas";

/** Aspek pedoman SPCP 2026 butir 6: Kecerdasan 6.a.1 (numerik → praktis, figural → analitis),
 *  Integritas dan Kejujuran 6.b (dikerjakan di modul Kepribadian). */
export const DRILL_ASPEK: { key: DrillAspek; label: string; modul: "Kecerdasan" | "Kepribadian" }[] = [
  { key: "praktis", label: "Berpikir Praktis", modul: "Kecerdasan" },
  { key: "verbal", label: "Berpikir Verbal", modul: "Kecerdasan" },
  { key: "logis", label: "Berpikir Logis", modul: "Kecerdasan" },
  { key: "analitis", label: "Berpikir Analitis", modul: "Kecerdasan" },
  { key: "integritas", label: "Integritas & Kejujuran", modul: "Kepribadian" },
];

/** opsi: jumlah pilihan per soal (default 5 = a–e; Integritas 2 = a–b). */
export type DrillCard = { label: string; aspek: DrillAspek; desc: string; prefix: string[]; opsi?: number };

export const DRILL_CARDS: Record<string, DrillCard> = {
  K01: { label: "Sinonim & Antonim", aspek: "verbal", desc: "Persamaan dan lawan kata, termasuk kata baku langka", prefix: ["VRB-SIN-", "VRB-ANT-"] },
  K02: { label: "Analogi Kata", aspek: "verbal", desc: "Hubungan pasangan kata", prefix: ["VRB-ANL-"] },
  K03: { label: "Kata Ganjil", aspek: "verbal", desc: "Satu kata yang paling berbeda", prefix: ["VRB-GJL"] },
  K04: { label: "Pemahaman Bacaan", aspek: "verbal", desc: "Wacana dan tabel data", prefix: ["VRB-BACA-"] },
  K05: { label: "Hitung Cepat", aspek: "praktis", desc: "Operasi campuran, pecahan, desimal, akar, persen", prefix: ["NUM-HIT-", "NUM-ALJ-"] },
  K06: { label: "Konversi Satuan", aspek: "praktis", desc: "Panjang, luas, volume, berat, waktu, kuantitas", prefix: ["NUM-SAT-"] },
  K07: { label: "Soal Cerita", aspek: "praktis", desc: "Proporsi, kecepatan, uang, rasio, pencacahan, alokasi waktu", prefix: ["NUM-CRT-"] },
  K08: { label: "Silogisme", aspek: "logis", desc: "Menarik kesimpulan dari premis", prefix: ["LOG-SIL-"] },
  K09: { label: "Deret Angka & Huruf", aspek: "analitis", desc: "Pola deret satu dan dua baris", prefix: ["ANL-DRT-"] },
  K10: { label: "Angka dalam Gambar", aspek: "analitis", desc: "Operasi tersembunyi, nilai huruf, dan bahasa panda", prefix: ["ANL-ANGKA-", "ANL-OPERASI-", "ANL-KODE"] },
  K11: { label: "Wacana Logika", aspek: "analitis", desc: "Urutan, jadwal, perbandingan banyak atribut", prefix: ["ANL-WCN-"] },
  K12: { label: "Pola & Matriks Gambar", aspek: "analitis", desc: "Matriks 3×3, deret, dan analogi gambar", prefix: ["FIG-MTX-", "FIG-SERI", "FIG-ANALOGI", "FIG-ROTASI-"] },
  K13: { label: "Ikon Kategori", aspek: "analitis", desc: "Kelompok gambar berdasarkan kategori", prefix: ["FIG-IKON-"] },
  K14: { label: "Susun Potongan Gambar", aspek: "analitis", desc: "Urutkan potongan menjadi gambar utuh", prefix: ["FIG-SUSUN-"] },
  K17: { label: "Denah & Arah Mata Angin", aspek: "analitis", desc: "Arah 8 mata angin, rute belok kiri/kanan, bangunan yang dilalui, pojok & di antara jalan, peta diputar, ingat denah", prefix: ["FIG-DENAH-"] },
  K16: { label: "Kecukupan Data", aspek: "logis", desc: "Menilai apakah pernyataan cukup untuk menjawab", prefix: ["LOG-KCK-"] },
  K18: { label: "Sebab-Akibat", aspek: "logis", desc: "Hubungan sebab-akibat dua pernyataan: sebab lebih dulu, akibat lebih dulu, satu sebab bersama", prefix: ["LOG-SBA-"] },
  K15: { label: "Integritas & Kejujuran", aspek: "integritas", desc: "Pilihan A/B: integritas, inovasi, kepemimpinan, transparansi, produktivitas, profesionalisme, religiusitas", prefix: ["SKJ-"], opsi: 2 },
};

/** Kategori soal di navigasi sesi drill: awalan sub_type → label, urutan = urutan grup. Awalan terpanjang menang. */
const DRILL_CATEGORIES: [string, string][] = [
  ["VRB-SIN", "Sinonim"], ["VRB-ANT", "Antonim"],
  ["VRB-ANL-1K", "Analogi satu kata"], ["VRB-ANL-2K", "Analogi dua kata"], ["VRB-ANL-PAIR", "Pasangan analogi"],
  ["VRB-GJL", "Kata ganjil"], ["VRB-GJL-NUM", "Bilangan ganjil"],
  ["VRB-BACA-TEKS", "Bacaan teks"], ["VRB-BACA-TABEL", "Bacaan tabel"],
  ["NUM-HIT-PECAHAN", "Pecahan"], ["NUM-HIT-DESIMAL", "Desimal"], ["NUM-HIT-PERSEN", "Persen"],
  ["NUM-HIT-AKAR-PANGKAT", "Akar & pangkat"], ["NUM-HIT-CAMPUR", "Operasi campuran"], ["NUM-HIT-TEORI", "Teori bilangan"],
  ["NUM-HIT-TRIK-KALI", "Trik perkalian"], ["NUM-HIT-TRIK-PERSEN", "Trik persen & pecahan"], ["NUM-HIT-TRIK-BAGI", "Trik bagi & estimasi"], ["NUM-HIT-TRIK-TAMBAH", "Trik tambah & kurang"],
  ["NUM-ALJ", "Aljabar & perbandingan"],
  ["NUM-SAT-KONVERSI", "Konversi satuan"], ["NUM-SAT-CERITA", "Soal cerita satuan"],
  ["NUM-CRT-ALOKASI", "Alokasi waktu"], ["NUM-CRT-ALOKASI-STRATEGI", "Alokasi · strategi"], ["NUM-CRT-ALOKASI-POIN", "Alokasi · poin maksimal"], ["NUM-CRT-GERAK", "Jarak & kecepatan"], ["NUM-CRT-RASIO", "Rasio"],
  ["NUM-CRT-PROPORSI", "Proporsi"], ["NUM-CRT-UANG", "Uang"], ["NUM-CRT-UMUR", "Umur"], ["NUM-CRT-LINIER", "Persamaan linier"],
  ["NUM-CRT-PENCACAHAN", "Pencacahan"], ["NUM-CRT-HIMPUNAN", "Himpunan"], ["NUM-CRT-GEOMETRI", "Geometri"], ["NUM-CRT-BULAT", "Bilangan bulat"],
  ["LOG-SIL-KATEGORI", "Silogisme kategorikal"], ["LOG-SIL-KONDISIONAL", "Kondisional"], ["LOG-SIL-JEBAKAN", "Jebakan logika"],
  ["ANL-DRT-1TRACK", "Deret angka"], ["ANL-DRT-HURUF", "Deret huruf"], ["ANL-DRT-ALFANUM", "Alfanumerik"],
  ["ANL-DRT-2BARIS", "Deret dua baris"], ["ANL-DRT-LINGKARAN", "Deret lingkaran"],
  ["ANL-ANGKA", "Angka dalam gambar"], ["ANL-OPERASI", "Operasi simbol"], ["ANL-KODE-HURUF", "Nilai huruf"], ["ANL-KODE-PANDA", "Bahasa panda"],
  ["ANL-WCN-URUTAN", "Urutan"], ["ANL-WCN-JADWAL", "Jadwal"],
  ["FIG-MTX", "Matriks gambar"], ["FIG-SERI", "Deret gambar"], ["FIG-ANALOGI", "Analogi gambar"], ["FIG-ROTASI", "Rotasi & cermin"],
  ["FIG-IKON", "Ikon kategori"], ["FIG-SUSUN", "Susun potongan"],
  // K15 diurutkan per 7 aspek Integritas dan Kejujuran (pedoman SPCP 6.b).
  ["SKJ-KEBENARAN", "Integritas · Kebenaran"], ["SKJ-ATURAN", "Integritas · Penegakan aturan"],
  ["SKJ-INOVASI", "Inovasi · Pembaruan"], ["SKJ-RISIKO", "Inovasi · Keberanian bertindak"],
  ["SKJ-WEWENANG", "Kepemimpinan · Kewenangan"], ["SKJ-TEGAS", "Kepemimpinan · Ketegasan"],
  ["SKJ-INFORMASI", "Transparansi · Keterbukaan informasi"],
  ["SKJ-MANDIRI", "Produktivitas · Kemandirian"], ["SKJ-HASIL", "Produktivitas · Orientasi hasil"],
  ["SKJ-PATUH", "Profesionalisme · Taat standar"], ["SKJ-REFLEKSI", "Profesionalisme · Refleksi diri"],
  ["SKJ-RELIGI", "Religiusitas · Makna religius"],
  ["FIG-DENAH-ARAH", "Arah mata angin"], ["FIG-DENAH-RUTE", "Rute & belokan"], ["FIG-DENAH-LEWAT", "Bangunan dilalui"], ["FIG-DENAH-RELASI", "Pojok & di antara jalan"], ["FIG-DENAH-ROTASI", "Rotasi peta & badan"], ["FIG-DENAH-INGAT", "Ingat denah"],
  ["LOG-KCK-NILAI", "Mencari nilai"], ["LOG-KCK-YATIDAK", "Ya atau tidak"], ["LOG-KCK-URUTAN", "Urutan"], ["LOG-KCK-3P", "Tiga pernyataan"],
  ["LOG-SBA-LANGSUNG", "Sebab ditulis lebih dulu"], ["LOG-SBA-TERBALIK", "Akibat ditulis lebih dulu"], ["LOG-SBA-BERSAMA", "Satu sebab bersama"],
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

