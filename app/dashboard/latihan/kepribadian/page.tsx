import { KEPRIBADIAN_PACKAGES, KEPRIBADIAN_PACKAGE_LABELS, PRIBADI_PACKAGE_SIZE } from "@/lib/test-config";
import { PageHeader } from "@/app/components/ui";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PackageCarousel } from "@/app/components/PackageCarousel";

// Sama seperti pemilih paket Kecermatan (app/dashboard/latihan/kecermatan/page.tsx):
// picker tinggal di app/dashboard (masih ada sidebar), sesinya di app/latihan/kepribadian/[package]
// yang di luar shell.
export default async function LatihanKepribadianPackagesPage() {
  const counts = await Promise.all(
    KEPRIBADIAN_PACKAGES.map((pkg) =>
      supabaseAdmin
        .from("questions")
        .select("id", { count: "exact", head: true })
        .eq("type", "KEPRIBADIAN")
        .eq("is_active", true)
        .eq("package_number", pkg)
    )
  );
  const packages = KEPRIBADIAN_PACKAGES.map((pkg, index) => ({
    id: pkg,
    label: KEPRIBADIAN_PACKAGE_LABELS[pkg],
    questionCount: counts[index].count,
  }));

  return (
    <div className="app-page space-y-6">
      <PageHeader
        title="Latihan Kepribadian"
        description="Pilih paket untuk berlatih. Setiap paket berisi 48 pernyataan Kepribadian dan 63 butir Substansi Khusus."
      />

      <PackageCarousel
        packages={packages}
        expectedCount={PRIBADI_PACKAGE_SIZE}
        unitLabel="butir"
        completeLabel="48 + 63 butir"
        hrefBase="/latihan/kepribadian"
        moduleLabel="kepribadian"
      />
    </div>
  );
}
