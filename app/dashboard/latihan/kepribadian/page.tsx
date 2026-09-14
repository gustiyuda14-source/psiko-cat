import { KEPRIBADIAN_PACKAGES, KEPRIBADIAN_PACKAGE_LABELS } from "@/lib/test-config";
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
        description="Pilih paket untuk berlatih. Setiap paket berisi 100 pernyataan skala Likert."
      />

      <PackageCarousel
        packages={packages}
        expectedCount={100}
        unitLabel="pernyataan"
        completeLabel="100 pernyataan"
        hrefBase="/latihan/kepribadian"
        moduleLabel="kepribadian"
      />
    </div>
  );
}
