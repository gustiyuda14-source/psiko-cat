export type ModuleType = "KECERDASAN" | "KECERMATAN" | "KEPRIBADIAN";

export type ModuleConfigEntry = {
  slug: string;
  time_limit_seconds: number;
  label: string;
  /** Label menu latihan bila beda dari label resmi (pedoman: Sikap Kerja = tes kecermatan). */
  menuLabel?: string;
  shortDesc: string;
};

export const MODULE_CONFIG: Record<ModuleType, ModuleConfigEntry> = {
  KECERDASAN: { slug: "kecerdasan", time_limit_seconds: 5400, label: "Kecerdasan", shortDesc: "kognitif & spasial" },
  KECERMATAN: { slug: "kecermatan", time_limit_seconds: 600, label: "Sikap Kerja", menuLabel: "Sikap Kerja / Kecermatan", shortDesc: "10 kolom simbol" },
  KEPRIBADIAN: { slug: "kepribadian", time_limit_seconds: 3600, label: "Kepribadian", shortDesc: "skala Likert atau situasional" },
};

export const MODULE_ORDER: ModuleType[] = ["KECERDASAN", "KECERMATAN", "KEPRIBADIAN"];

export function latihanHref(type: ModuleType): string {
  return `/dashboard/latihan/${MODULE_CONFIG[type].slug}`;
}

// Pool ujian/tryout Kecermatan = tab Emoji & Gambar.
const KECERMATAN_UJIAN_PACKAGES = [3, 4, 5, 6, 7, 8];
export const KECERMATAN_EMOJI_PACKAGES = KECERMATAN_UJIAN_PACKAGES;

// Tab Siluet Gambar: paket 9 (dulu "Paket 7" Emoji & Gambar) + 601-604. Latihan
// saja. Rute sesinya tetap /latihan/kecermatan/[package] supaya progres dan
// pembahasan tersimpan paket 9 tidak hilang.
export const KECERMATAN_SILUET_PACKAGES = [9, 601, 602, 603, 604];

// Paket sah di rute /latihan/kecermatan/[package] (kedua tab di atas).
export const KECERMATAN_PACKAGES = [...KECERMATAN_EMOJI_PACKAGES, ...KECERMATAN_SILUET_PACKAGES];

export const KECERMATAN_PACKAGE_LABELS: Record<number, string> = Object.fromEntries([
  ...KECERMATAN_EMOJI_PACKAGES.map((id, index) => [id, `Paket ${index + 1}`]),
  ...KECERMATAN_SILUET_PACKAGES.map((id, index) => [id, `Paket ${index + 1}`]),
]);

export function pickRandomKecermatanPackage(): number {
  return KECERMATAN_UJIAN_PACKAGES[Math.floor(Math.random() * KECERMATAN_UJIAN_PACKAGES.length)];
}

// Aspek kedua Kecermatan: angka-huruf, bukan emoji/gambar. Masih type
// KECERMATAN yang sama, cuma package_number beda range (101+) dan tile
// latihan sendiri (lihat app/dashboard/latihan/kecermatan-angka) — bukan
// ModuleType baru, karena skema soal & scoring-nya identik dengan Kecermatan.
// Baru Paket 1 (101) yang ada soal aslinya; 102-105 slotnya disiapkan duluan.
export const KECERMATAN_ANGKA_PACKAGES = [101, 102, 103, 104, 105];

export const KECERMATAN_ANGKA_PACKAGE_LABELS: Record<number, string> = Object.fromEntries(
  KECERMATAN_ANGKA_PACKAGES.map((id, index) => [id, `Paket ${index + 1}`])
);

// Aspek ketiga Kecermatan: Spasial (gambar geometris mirip, simbol = path SVG
// di public/kecermatan-spasial). Latihan saja — tidak masuk pool ujian
// pickRandomKecermatanPackage(). Semua 6 paket (201-206) sudah berisi soal.
export const KECERMATAN_SPASIAL_PACKAGES = [201, 202, 203, 204, 205, 206];

export const KECERMATAN_SPASIAL_PACKAGE_LABELS: Record<number, string> = Object.fromEntries(
  KECERMATAN_SPASIAL_PACKAGES.map((id, index) => [id, `Paket ${index + 1}`])
);

// Aspek Spasial Dasar: gambar spasial versi latihan dasar (kolom I-V mudah,
// VI-X menengah — scripts/generate-kecermatan-spasial.ts 501..510). Latihan
// saja, tidak masuk pool ujian.
export const KECERMATAN_SPASIAL_DASAR_PACKAGES = [501, 502, 503, 504, 505, 506, 507, 508, 509, 510];

export const KECERMATAN_SPASIAL_DASAR_PACKAGE_LABELS: Record<number, string> = Object.fromEntries(
  KECERMATAN_SPASIAL_DASAR_PACKAGES.map((id, index) => [id, `Paket ${index + 1}`])
);

// Aspek keempat Kecermatan: Simbol Hilang (huruf Yunani mirip, aturan dari
// contoh soal Polri — lihat scripts/generate-kecermatan-simbol.ts). Latihan saja,
// tidak masuk pool ujian.
export const KECERMATAN_SIMBOL_PACKAGES = [301, 302, 303, 304, 305];

export const KECERMATAN_SIMBOL_PACKAGE_LABELS: Record<number, string> = Object.fromEntries(
  KECERMATAN_SIMBOL_PACKAGES.map((id, index) => [id, `Paket ${index + 1}`])
);

// Aspek Simbol Sains: huruf Yunani + lambang matematika/fisika
// (scripts/generate-kecermatan-sains.ts). Latihan saja, tidak masuk pool ujian.
export const KECERMATAN_SAINS_PACKAGES = [701, 702, 703, 704, 705];

export const KECERMATAN_SAINS_PACKAGE_LABELS: Record<number, string> = Object.fromEntries(
  KECERMATAN_SAINS_PACKAGES.map((id, index) => [id, `Paket ${index + 1}`])
);

// Aspek Simbol Komposisi Majemuk (tab "Komposisi Majemuk"): gambar berisi bentuk
// utama + hiasan pojok + tanda kecil, kesulitan naik dari kolom I ke X
// (scripts/generate-kecermatan-komposisi.ts). Latihan saja, tidak masuk pool ujian.
export const KECERMATAN_KOMPOSISI_PACKAGES = [801, 802, 803, 804, 805];

export const KECERMATAN_KOMPOSISI_PACKAGE_LABELS: Record<number, string> = Object.fromEntries(
  KECERMATAN_KOMPOSISI_PACKAGES.map((id, index) => [id, `Paket ${index + 1}`])
);

// Paket latihan/drilling Kecerdasan & Kepribadian. Paket 1 (package_number=1)
// khusus simulasi (SIMULASI_PACKAGE) dan TIDAK boleh muncul di sini, supaya
// soal simulasi tidak bocor lewat latihan (pola dajiks-cest). Slot 2-11 tampil
// "Belum tersedia" sampai bank soalnya di-insert dengan package_number tsb.
export const KECERDASAN_PACKAGES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
// Paket baru dirilis: kartu ber-badge NEW sampai peserta mengerjakannya. Kosongkan saat tidak lagi baru.
export const KECERDASAN_PACKAGES_NEW = [6]; // Paket 5, rilis 2026-10-17
export const KECERDASAN_PACKAGE_LABELS: Record<number, string> = Object.fromEntries(
  KECERDASAN_PACKAGES.map((id, index) => [id, `Paket ${index + 1}`])
);

export const KEPRIBADIAN_PACKAGES = [2, 3, 4, 5, 6, 7, 8, 9, 10];
// Paket latihan PRIBADI = 48 Kepribadian (Likert 4) + 63 Substansi Khusus (A/B),
// docs/pedoman/PEDOMAN_ENGINE_PRIBADI.md. Paket 11 (bank/pribadi/paket-11.json)
// dipindah jadi simulasi, jadi tidak muncul di latihan.
export const PRIBADI_PACKAGE_SIZE = 48 + 63;
// Sub-tes Kepribadian format situasional (SJT): 48 butir 5 opsi berbobot 1–5 + 63 Pass Hand
// (Integritas & Kejujuran A/B), bank/pribadi/sjt-*.json + sk-sjt-*.json. Tab sendiri di pemilih paket.
export const KEPRIBADIAN_SJT_PACKAGES = [21, 22, 23, 24, 25];
export const KEPRIBADIAN_SJT_PACKAGE_LABELS: Record<number, string> = Object.fromEntries(
  KEPRIBADIAN_SJT_PACKAGES.map((id, index) => [id, `Paket ${index + 1}`])
);
/** Semua paket latihan Kepribadian (Likert + SJT); sesinya sama-sama di /latihan/kepribadian/[pkg]. */
export const KEPRIBADIAN_LATIHAN_PACKAGES = [...KEPRIBADIAN_PACKAGES, ...KEPRIBADIAN_SJT_PACKAGES];
export const KEPRIBADIAN_PACKAGE_LABELS: Record<number, string> = Object.fromEntries([
  ...KEPRIBADIAN_PACKAGES.map((id, index) => [id, `Paket ${index + 1}`]),
  ...KEPRIBADIAN_SJT_PACKAGES.map((id, index) => [id, `SJT Paket ${index + 1}`]),
]);

// Simulasi/tryout membaca SATU paket per module, tidak pernah semua soal aktif
// (pola dajiks-cest: bank simulasi terpisah dari bank drilling). Paket lain
// cuma muncul di latihan. Kecermatan memakai kecermatan_package_number per sesi.
// Kepribadian simulasi = paket PRIBADI 11 (format pedoman, Likert 4 + Substansi
// Khusus). Paket 1 Likert 5 lama tetap di DB untuk riwayat sesi lama —
// lib/review.ts kepribadianPackageOf memilih paket dari jawaban sesi.
export const SIMULASI_PACKAGE = { KECERDASAN: 1, KEPRIBADIAN: 11 } as const;

// Kartu Simulasi Penuh → package_number bank soal per module. Nomor sesi tersimpan di
// module_sessions.package_number; sesi lama (null) memakai SIMULASI_PACKAGE (= Paket 1).
// Nomor simulasi tidak boleh bentrok dengan paket latihan (KECERDASAN_PACKAGES 2-11).
// Kecerdasan 13/14 = Paket 1/12 setelah kalibrasi Logis/Spasial 2026-10-12 (denah masuk blok
// 38-42, scripts/seed-kecerdasan-kal.ts). Kartu 1 sejak 2026-10-12 = pkg 16 (disusun ulang penuh sesuai
// pedoman §3); pkg 13 menjadi bank lama. Sejak 2026-10-13 kecukupan data 4 butir (pedoman §4.7,
// scripts/seed-kecerdasan-kck.ts --copy): pkg 18 (salinan 16) untuk kartu 1 dan pkg 17 (salinan 14)
// untuk kartu 2 sudah di DB; begitu kartu dipindah, 14 dan 16 menjadi bank lama (sudah terdaftar di
// SIMULASI_KECERDASAN_LAMA). Simulasi berikutnya memakai 19 ke atas.
// Kepribadian per kartu: 1 = paket 11, 2 = paket 13 (sejak 2026-10-12; sesi lama kartu 2 tetap
// menyimpan paket 11), 3 = paket 12. Kecermatan kartu 1 tetap paket 11 (campuran 5 jenis hitam-putih,
// docs/pedoman/PEDOMAN_SIMULASI_KECERMATAN.md); kartu 2 tetap paket 401
// (Spasial Sedang, scripts/generate-kecermatan-spasial.ts 401; sesi lama tetap menyimpan paket
// acaknya di kecermatan_package_number); kartu 3 tetap paket 10.
// Sejak 2026-10-17 Kepribadian tiap kartu = paket lama + Loyalitas & Kerja Sama (psikogram Bintara/Tamtama,
// scripts/extend-pribadi-paket.ts): 11→16, 13→18, 12→17, 14→19, 15→20. Paket 11–15 menjadi bank lama.
// Sejak 2026-10-20 Kepribadian kartu 4/5 = format situasional (SJT, 64 + Pass Hand yang sama): 19→26, 20→27.
export const SIMULASI_PAKET: Record<number, { KECERDASAN: number; KEPRIBADIAN: number; KECERMATAN?: number }> = {
  1: { KECERDASAN: 18, KEPRIBADIAN: 16, KECERMATAN: 11 },
  2: { KECERDASAN: 17, KEPRIBADIAN: 18, KECERMATAN: 401 },
  3: { KECERDASAN: 15, KEPRIBADIAN: 17, KECERMATAN: 10 },
  4: { KECERDASAN: 19, KEPRIBADIAN: 26, KECERMATAN: 12 },
  5: { KECERDASAN: 20, KEPRIBADIAN: 27, KECERMATAN: 13 },

};
// Bank Kecerdasan simulasi sebelum kalibrasi (package_number → kartu). Tidak dipakai sesi baru,
// tetap aktif supaya review dan nilai sesi lama terbaca, dan tetap terlarang dibuka lewat latihan.
const SIMULASI_KECERDASAN_LAMA: Record<number, number> = { 1: 1, 12: 2, 13: 1, 14: 2, 16: 1 };
// Bank Kepribadian simulasi lama (sebelum Loyalitas & Kerja Sama; 19/20 = Likert kartu 4/5 sebelum SJT):
// tetap aktif untuk sesi lama, tetap terlarang di latihan.
const SIMULASI_KEPRIBADIAN_LAMA = [11, 12, 13, 14, 15, 19, 20];

/** Kartu Simulasi Penuh dari package_number Kecerdasan sebuah sesi (null = sesi lama = kartu 1). */
export function simulasiKartuOf(kecerdasanPackage: number | null | undefined): number {
  const pkg = kecerdasanPackage ?? SIMULASI_PACKAGE.KECERDASAN;
  return SIMULASI_KECERDASAN_LAMA[pkg] ?? Number(Object.keys(SIMULASI_PAKET).find((id) => SIMULASI_PAKET[Number(id)].KECERDASAN === pkg) ?? 0);
}

/** Paket bank soal sebuah module simulasi; null (sesi lama) = Paket 1. */
export function simulasiPackageOf(type: "KECERDASAN" | "KEPRIBADIAN", packageNumber: number | null | undefined): number {
  return packageNumber ?? SIMULASI_PACKAGE[type];
}

/** Semua package_number milik simulasi — tidak pernah boleh dibuka lewat latihan. */
export function isSimulasiPackage(type: string, packageNumber: number | null): boolean {
  if (type === "KECERDASAN" && packageNumber != null && packageNumber in SIMULASI_KECERDASAN_LAMA) return true;
  if (type === "KEPRIBADIAN" && packageNumber != null && SIMULASI_KEPRIBADIAN_LAMA.includes(packageNumber)) return true;
  return Object.values(SIMULASI_PAKET).some((p) => p[type as keyof typeof p] === packageNumber);
}

export const SLUG_TO_MODULE: Record<string, ModuleType> = Object.fromEntries(
  (Object.entries(MODULE_CONFIG) as [ModuleType, ModuleConfigEntry][]).map(
    ([type, config]) => [config.slug, type]
  )
);
