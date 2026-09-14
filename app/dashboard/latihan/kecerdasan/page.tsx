import { KECERDASAN_PACKAGES, KECERDASAN_PACKAGE_LABELS } from "@/lib/test-config";
import { PageHeader } from "@/app/components/ui";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PackageCarousel } from "@/app/components/PackageCarousel";

// Sama seperti pemilih paket Kecermatan (app/dashboard/latihan/kecermatan/page.tsx):
// picker tinggal di app/dashboard (masih ada sidebar), sesinya di app/latihan/kecerdasan/[package]
// yang di luar shell.
export default async function LatihanKecerdasanPackagesPage() {
  const counts = await Promise.all(
    KECERDASAN_PACKAGES.map((pkg) =>
      supabaseAdmin
        .from("questions")
        .select("id", { count: "exact", head: true })
        .eq("type", "KECERDASAN")
        .eq("is_active", true)
        .eq("package_number", pkg)
    )
  );
  const packages = KECERDASAN_PACKAGES.map((pkg, index) => ({
    id: pkg,
    label: KECERDASAN_PACKAGE_LABELS[pkg],
    questionCount: counts[index].count,
  }));

  return (
    <div className="app-page space-y-6">
      <PageHeader
        title="Latihan Kecerdasan"
        description="Pilih paket untuk berlatih. Setiap paket berisi 100 butir kognitif & spasial."
      />

      <PackageCarousel
        packages={packages}
        expectedCount={100}
        unitLabel="butir"
        completeLabel="100 butir"
        hrefBase="/latihan/kecerdasan"
        moduleLabel="kecerdasan"
      />
    </div>
  );
}
