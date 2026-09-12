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
  return type === "KECERMATAN"
    ? "/dashboard/latihan/kecermatan"
    : `/latihan/${MODULE_CONFIG[type].slug}`;
}

export const KECERMATAN_PACKAGES = [3, 4, 5, 6, 7, 8];

export const KECERMATAN_PACKAGE_LABELS: Record<number, string> = Object.fromEntries(
  KECERMATAN_PACKAGES.map((id, index) => [id, `Paket ${index + 1}`])
);

export function pickRandomKecermatanPackage(): number {
  return KECERMATAN_PACKAGES[Math.floor(Math.random() * KECERMATAN_PACKAGES.length)];
}

export const SLUG_TO_MODULE: Record<string, ModuleType> = Object.fromEntries(
  (Object.entries(MODULE_CONFIG) as [ModuleType, ModuleConfigEntry][]).map(
    ([type, config]) => [config.slug, type]
  )
);
