export type ModuleType = "KECERDASAN" | "KECERMATAN" | "KEPRIBADIAN";

export type ModuleConfigEntry = {
  slug: string;
  time_limit_seconds: number;
  label: string;
  shortDesc: string;
};

export const MODULE_CONFIG: Record<ModuleType, ModuleConfigEntry> = {
  KECERDASAN: { slug: "kecerdasan", time_limit_seconds: 5400, label: "Kecerdasan", shortDesc: "kognitif & spasial" },
  KECERMATAN: { slug: "kecermatan", time_limit_seconds: 600, label: "Kecermatan", shortDesc: "10 kolom simbol" },
  KEPRIBADIAN: { slug: "kepribadian", time_limit_seconds: 3600, label: "Kepribadian", shortDesc: "skala Likert" },
};

export const MODULE_ORDER: ModuleType[] = ["KECERDASAN", "KECERMATAN", "KEPRIBADIAN"];

export function latihanHref(type: ModuleType): string {
  return `/dashboard/latihan/${MODULE_CONFIG[type].slug}`;
}

export const KECERMATAN_PACKAGES = [3, 4, 5, 6, 7, 8];

export const KECERMATAN_PACKAGE_LABELS: Record<number, string> = Object.fromEntries(
  KECERMATAN_PACKAGES.map((id, index) => [id, `Paket ${index + 1}`])
);

export function pickRandomKecermatanPackage(): number {
  return KECERMATAN_PACKAGES[Math.floor(Math.random() * KECERMATAN_PACKAGES.length)];
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

// Paket latihan/drilling Kecerdasan & Kepribadian. Paket 1 (package_number=1)
// khusus simulasi (SIMULASI_PACKAGE) dan TIDAK boleh muncul di sini, supaya
// soal simulasi tidak bocor lewat latihan (pola dajiks-cest). Slot 2-11 tampil
// "Belum tersedia" sampai bank soalnya di-insert dengan package_number tsb.
export const KECERDASAN_PACKAGES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
export const KECERDASAN_PACKAGE_LABELS: Record<number, string> = Object.fromEntries(
  KECERDASAN_PACKAGES.map((id, index) => [id, `Paket ${index + 1}`])
);

export const KEPRIBADIAN_PACKAGES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
export const KEPRIBADIAN_PACKAGE_LABELS: Record<number, string> = Object.fromEntries(
  KEPRIBADIAN_PACKAGES.map((id, index) => [id, `Paket ${index + 1}`])
);

// Simulasi/tryout membaca SATU paket per module, tidak pernah semua soal aktif
// (pola dajiks-cest: bank simulasi terpisah dari bank drilling). Paket lain
// cuma muncul di latihan. Kecermatan memakai kecermatan_package_number per sesi.
export const SIMULASI_PACKAGE = { KECERDASAN: 1, KEPRIBADIAN: 1 } as const;

export const SLUG_TO_MODULE: Record<string, ModuleType> = Object.fromEntries(
  (Object.entries(MODULE_CONFIG) as [ModuleType, ModuleConfigEntry][]).map(
    ([type, config]) => [config.slug, type]
  )
);
