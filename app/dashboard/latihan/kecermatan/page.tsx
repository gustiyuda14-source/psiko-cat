import { KECERMATAN_PACKAGES, KECERMATAN_PACKAGE_LABELS } from "@/lib/test-config";
import { PageHeader } from "@/app/components/ui";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { KECERMATAN_KEYS } from "@/lib/kecermatan-symbols";
import { KecermatanPackageCarousel } from "@/app/components/KecermatanPackageCarousel";

// Kecermatan punya banyak paket bank soal, jadi user memilih paket dulu di sini sebelum
// latihan mulai. Pemilih paket SENGAJA tinggal di dalam app/dashboard (masih ada sidebar)
// karena dia permukaan menjelajah, bukan sesi; sesinya sendiri di app/latihan/kecermatan/[package]
// yang di luar shell. Lihat latihanHref() di lib/test-session.ts.
export default async function LatihanKecermatanPackagesPage() {
  const previews = await Promise.all(KECERMATAN_PACKAGES.map((pkg) =>
    supabaseAdmin.from("questions")
      .select("options_payload", { count: "exact" })
      .eq("type", "KECERMATAN").eq("is_active", true).eq("package_number", pkg)
      .order("column_index", { ascending: true })
      .order("sequence_number", { ascending: true }).limit(1)
  ));
  const packages = KECERMATAN_PACKAGES.map((pkg, index) => {
    const symbolMap = previews[index].data?.[0]?.options_payload?.symbol_map as
      | Record<string, string>
      | undefined;

    return {
      id: pkg,
      label: KECERMATAN_PACKAGE_LABELS[pkg],
      questionCount: previews[index].count,
      symbols: KECERMATAN_KEYS.map((key) => symbolMap?.[key] ?? "—"),
    };
  });

  return (
    <div className="app-page space-y-6">
      <PageHeader
        title="Latihan Kecermatan"
        description="Pilih paket untuk berlatih dalam 10 kolom. Lihat simbol kolom pertama di bawah; kunci simbol berganti saat berpindah kolom."
      />

      <KecermatanPackageCarousel packages={packages} />
    </div>
  );
}
