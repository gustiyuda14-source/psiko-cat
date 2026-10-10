import { KEPRIBADIAN_PACKAGES, KEPRIBADIAN_PACKAGE_LABELS, PRIBADI_PACKAGE_SIZE } from "@/lib/test-config";
import { PageHeader } from "@/app/components/ui";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PackageCarousel, type PackageOption, type PackagePart } from "@/app/components/PackageCarousel";

const SHORT: Record<string, string> = {
  Prososial: "PRO",
  "Pengambilan Keputusan": "PK",
  "Penyesuaian Diri": "PD",
  "Kepercayaan Diri": "KD",
  "Stabilitas Emosi": "SE",
  "Motif Berprestasi": "MB",
};

// Kelompokkan butir berurutan: aspek Kepribadian satu per satu, Substansi Khusus satu bagian.
function toParts(list: { subtes: string | null; aspect: string | null }[]): PackagePart[] {
  const parts: PackagePart[] = [];
  for (const row of list) {
    const sk = row.subtes === "SK";
    const label = sk ? "Substansi Khusus" : row.aspect ?? "Kepribadian";
    const last = parts.at(-1);
    if (last?.label === label) last.count++;
    else parts.push({ label, short: sk ? "SUBSTANSI KHUSUS" : SHORT[label] ?? label.slice(0, 3).toUpperCase(), part: sk ? "Bagian 2 · pilih A/B" : "Bagian 1 · Kepribadian", count: 1 });
  }
  return parts;
}

// Sama seperti pemilih paket Kecermatan (app/dashboard/latihan/kecermatan/page.tsx):
// picker tinggal di app/dashboard (masih ada sidebar), sesinya di app/latihan/kepribadian/[package]
// yang di luar shell.
export default async function LatihanKepribadianPackagesPage() {
  // Satu query kecil per paket (111 baris, jauh di bawah batas 1000 baris
  // PostgREST): jumlah butir + komposisi berurutan untuk bar pratinjau di panel.
  const rows = await Promise.all(
    KEPRIBADIAN_PACKAGES.map((pkg) =>
      supabaseAdmin
        .from("questions")
        .select("subtes:options_payload->>subtes, aspect:options_payload->>aspect")
        .eq("type", "KEPRIBADIAN")
        .eq("is_active", true)
        .eq("package_number", pkg)
        .order("sequence_number", { ascending: true })
    )
  );
  const packages: PackageOption[] = KEPRIBADIAN_PACKAGES.map((pkg, index) => {
    const list = (rows[index].data ?? []) as { subtes: string | null; aspect: string | null }[];
    return { id: pkg, label: KEPRIBADIAN_PACKAGE_LABELS[pkg], questionCount: list.length, parts: toParts(list) };
  });

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
