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

// Kecerdasan dan Kepribadian baru punya Paket 1 terisi (bank soal existing,
// di-tag package_number=1). Paket 2-10 disediakan slotnya duluan di carousel
// (nampil "Belum tersedia") supaya begitu bank soalnya nyusul, tinggal insert
// ke DB dengan package_number yang sesuai — tidak ada kode yang perlu diubah.
export const KECERDASAN_PACKAGES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
export const KECERDASAN_PACKAGE_LABELS: Record<number, string> = Object.fromEntries(
  KECERDASAN_PACKAGES.map((id) => [id, `Paket ${id}`])
);

export const KEPRIBADIAN_PACKAGES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
export const KEPRIBADIAN_PACKAGE_LABELS: Record<number, string> = Object.fromEntries(
  KEPRIBADIAN_PACKAGES.map((id) => [id, `Paket ${id}`])
);

export const SLUG_TO_MODULE: Record<string, ModuleType> = Object.fromEntries(
  (Object.entries(MODULE_CONFIG) as [ModuleType, ModuleConfigEntry][]).map(
    ([type, config]) => [config.slug, type]
  )
);
