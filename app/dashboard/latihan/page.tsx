import {
  KECERDASAN_PACKAGES,
  KECERDASAN_PACKAGE_LABELS,
  KECERMATAN_ANGKA_PACKAGES,
  KECERMATAN_ANGKA_PACKAGE_LABELS,
  KECERMATAN_SPASIAL_PACKAGES,
  KECERMATAN_SPASIAL_PACKAGE_LABELS,
  KECERMATAN_SPASIAL_DASAR_PACKAGES,
  KECERMATAN_SPASIAL_DASAR_PACKAGE_LABELS,
  KECERMATAN_SIMBOL_PACKAGES,
  KECERMATAN_SIMBOL_PACKAGE_LABELS,
  KECERMATAN_EMOJI_PACKAGES,
  KECERMATAN_SILUET_PACKAGES,
  KECERMATAN_SAINS_PACKAGES,
  KECERMATAN_SAINS_PACKAGE_LABELS,
  KECERMATAN_PACKAGE_LABELS,
  KEPRIBADIAN_PACKAGES,
  KEPRIBADIAN_PACKAGE_LABELS,
  PRIBADI_PACKAGE_SIZE,
  MODULE_CONFIG,
  MODULE_ORDER,
  latihanHref,
  type ModuleType,
} from "@/lib/test-config";
import { PageHeader } from "@/app/components/ui";
import { supabaseAdmin } from "@/lib/supabase-admin";
import LatihanCatalog, { type LatihanModule, type LatihanRow } from "./LatihanCatalog";

const DESC = {
  KECERDASAN: "Soal kognitif dan spasial, 100 butir per paket",
  KECERMATAN: "Temukan simbol yang tidak muncul, 10 kolom",
  KEPRIBADIAN: "Kepribadian + Integritas & Kejujuran, 111 butir per paket",
} as const;

// Kunci progres = rute sesi paket (lib/practice-progress.ts). Kecermatan punya tujuh aspek.
const ROWS: { module: ModuleType; label: string; route: string; ids: number[]; labels: Record<number, string>; per: number }[] = [
  { module: "KECERDASAN", label: "Kecerdasan", route: "/latihan/kecerdasan", ids: KECERDASAN_PACKAGES, labels: KECERDASAN_PACKAGE_LABELS, per: 100 },
  { module: "KEPRIBADIAN", label: "Kepribadian", route: "/latihan/kepribadian", ids: KEPRIBADIAN_PACKAGES, labels: KEPRIBADIAN_PACKAGE_LABELS, per: PRIBADI_PACKAGE_SIZE },
  { module: "KECERMATAN", label: "Sikap Kerja / Kecermatan Emoji & Gambar", route: "/latihan/kecermatan", ids: KECERMATAN_EMOJI_PACKAGES, labels: KECERMATAN_PACKAGE_LABELS, per: 500 },
  { module: "KECERMATAN", label: "Sikap Kerja / Kecermatan Angka & Huruf", route: "/latihan/kecermatan-angka", ids: KECERMATAN_ANGKA_PACKAGES, labels: KECERMATAN_ANGKA_PACKAGE_LABELS, per: 500 },
  { module: "KECERMATAN", label: "Sikap Kerja / Kecermatan Spasial Dasar", route: "/latihan/kecermatan-spasial-dasar", ids: KECERMATAN_SPASIAL_DASAR_PACKAGES, labels: KECERMATAN_SPASIAL_DASAR_PACKAGE_LABELS, per: 500 },
  { module: "KECERMATAN", label: "Sikap Kerja / Kecermatan Spasial", route: "/latihan/kecermatan-spasial", ids: KECERMATAN_SPASIAL_PACKAGES, labels: KECERMATAN_SPASIAL_PACKAGE_LABELS, per: 500 },
  { module: "KECERMATAN", label: "Sikap Kerja / Kecermatan Simbol Hilang", route: "/latihan/kecermatan-simbol", ids: KECERMATAN_SIMBOL_PACKAGES, labels: KECERMATAN_SIMBOL_PACKAGE_LABELS, per: 500 },
  { module: "KECERMATAN", label: "Sikap Kerja / Kecermatan Siluet Gambar", route: "/latihan/kecermatan", ids: KECERMATAN_SILUET_PACKAGES, labels: KECERMATAN_PACKAGE_LABELS, per: 500 },
  { module: "KECERMATAN", label: "Sikap Kerja / Kecermatan Simbol Sains", route: "/latihan/kecermatan-sains", ids: KECERMATAN_SAINS_PACKAGES, labels: KECERMATAN_SAINS_PACKAGE_LABELS, per: 500 },
];

export default async function LatihanIndexPage() {
  // Paket dianggap tersedia bila isinya lengkap, aturan sama dengan pemilih paket (PackageCarousel).
  // Hitung per paket dengan head:true: hitung gabungan kena batas 1000 baris PostgREST (lib/kecermatan-packages.ts).
  const counts = await Promise.all(
    ROWS.map((r) =>
      Promise.all(
        r.ids.map((pkg) =>
          supabaseAdmin
            .from("questions")
            .select("id", { count: "exact", head: true })
            .eq("type", r.module)
            .eq("is_active", true)
            .eq("package_number", pkg)
        )
      )
    )
  );

  const rows: LatihanRow[] = ROWS.map((r, ri) => ({
    module: r.module,
    label: r.label,
    sub: `${r.ids.length} paket · ${r.per} butir per paket`,
    per: r.per,
    packages: r.ids.map((id, i) => ({ key: `${r.route}/${id}`, label: r.labels[id] ?? `Paket ${i + 1}`, ready: counts[ri][i].count === r.per })),
  }));

  const modules: LatihanModule[] = MODULE_ORDER.map((type) => ({
    module: type,
    href: latihanHref(type),
    label: MODULE_CONFIG[type].menuLabel ?? MODULE_CONFIG[type].label,
    desc: DESC[type],
  }));

  return (
    <div className="app-page space-y-6">
      <PageHeader
        kicker="Latihan"
        title="Latihan"
        description="Pilih kemampuan yang ingin dilatih, lalu kerjakan tanpa batas waktu. Latihan tidak dihitung sebagai tes resmi dan tidak masuk riwayat."
      />
      <LatihanCatalog modules={modules} rows={rows} />
    </div>
  );
}
