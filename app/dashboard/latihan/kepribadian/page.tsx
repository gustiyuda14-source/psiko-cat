import {
  KEPRIBADIAN_PACKAGES,
  KEPRIBADIAN_PACKAGE_LABELS,
  KEPRIBADIAN_SJT_PACKAGES,
  KEPRIBADIAN_SJT_PACKAGE_LABELS,
  KEPRIBADIAN_SK_PACKAGES,
  KEPRIBADIAN_SK_PACKAGE_LABELS,
  KEPRIBADIAN_YT_PACKAGES,
  KEPRIBADIAN_YT_PACKAGE_LABELS,
} from "@/lib/test-config";
import { PageHeader } from "@/app/components/ui";
import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { PackageOption, PackagePart } from "@/app/components/PackageCarousel";
import { KepribadianFormatPicker } from "@/app/components/KepribadianFormatPicker";

const SHORT: Record<string, string> = {
  Prososial: "PRO",
  "Pengambilan Keputusan": "PK",
  "Penyesuaian Diri": "PD",
  "Kepercayaan Diri": "KD",
  "Stabilitas Emosi": "SE",
  "Motif Berprestasi": "MB",
};

// Kelompokkan butir berurutan: aspek Kepribadian satu per satu, Integritas & Kejujuran satu bagian (aspeknya acak).
// Situasi SJT diacak lintas aspek, jadi satu bagian juga; begitu pula pernyataan Ya/Tidak.
function toParts(list: { subtes: string | null; aspect: string | null }[]): PackagePart[] {
  const parts: PackagePart[] = [];
  for (const row of list) {
    const sk = row.subtes === "SK";
    const sjt = row.subtes === "SJT";
    const yt = row.subtes === "YT";
    const label = sk ? "Integritas & Kejujuran" : sjt ? "Kepribadian situasional" : yt ? "Pernyataan Ya/Tidak" : row.aspect ?? "Kepribadian";
    const last = parts.at(-1);
    if (last?.label === label) last.count++;
    else
      parts.push({
        label,
        short: sk ? "PASS HAND" : sjt ? "SJT" : yt ? "YA/TIDAK" : SHORT[label] ?? label.slice(0, 3).toUpperCase(),
        part: sk ? (parts.length ? "Bagian 2 · pilih A/B" : "Pilih A/B") : sjt ? "Bagian 1 · 5 pilihan tindakan" : yt ? "Jawab Ya atau Tidak" : "Bagian 1 · Kepribadian",
        count: 1,
      });
  }
  return parts;
}

// Sama seperti pemilih paket Kecermatan (app/dashboard/latihan/kecermatan/page.tsx):
// picker tinggal di app/dashboard (masih ada sidebar), sesinya di app/latihan/kepribadian/[package]
// yang di luar shell.
// Satu query kecil per paket (111 baris, jauh di bawah batas 1000 baris
// PostgREST): jumlah butir + komposisi berurutan untuk bar pratinjau di panel.
// Isi bank hampir statis: di-cache 1 jam per deploy, bukan ~20 query tiap halaman dibuka.
// ponytail: soal baru yang di-seed tanpa deploy baru terlihat setelah maks 1 jam.
const build = unstable_cache(
  (ids: number[], labels: Record<number, string>) =>
    Promise.all(
      ids.map((pkg) =>
        supabaseAdmin
          .from("questions")
          .select("subtes:options_payload->>subtes, aspect:options_payload->>aspect")
          .eq("type", "KEPRIBADIAN")
          .eq("is_active", true)
          .eq("package_number", pkg)
          .order("sequence_number", { ascending: true })
      )
    ).then((rows) => {
      // Error dilempar, bukan dibaca 0 butir: hasil gagal tidak boleh ikut di-cache.
      const failed = rows.find((r) => r.error);
      if (failed) throw failed.error;
      return ids.map((pkg, index): PackageOption => {
        const list = (rows[index].data ?? []) as { subtes: string | null; aspect: string | null }[];
        return { id: pkg, label: labels[pkg], questionCount: list.length, parts: toParts(list) };
      });
    }),
  ["kepribadian-packages", process.env.VERCEL_GIT_COMMIT_SHA ?? "dev"],
  { revalidate: 3600 }
);

export default async function LatihanKepribadianPackagesPage() {
  const [likertPackages, sjtPackages, ytPackages, skPackages] = await Promise.all([
    build(KEPRIBADIAN_PACKAGES, KEPRIBADIAN_PACKAGE_LABELS),
    build(KEPRIBADIAN_SJT_PACKAGES, KEPRIBADIAN_SJT_PACKAGE_LABELS),
    build(KEPRIBADIAN_YT_PACKAGES, KEPRIBADIAN_YT_PACKAGE_LABELS),
    build(KEPRIBADIAN_SK_PACKAGES, KEPRIBADIAN_SK_PACKAGE_LABELS),
  ]);

  return (
    <div className="app-page space-y-6">
      <PageHeader
        title="Latihan Kepribadian"
        description="Pilih format dan paket untuk berlatih. Paket skala dan situasional berisi 48 butir Kepribadian dan 63 butir Pass Hand (Integritas & Kejujuran); paket Ya/Tidak berisi 70 pernyataan; paket Integritas & Kejujuran berisi 63 butir Pass Hand saja."
      />

      <KepribadianFormatPicker likertPackages={likertPackages} sjtPackages={sjtPackages} ytPackages={ytPackages} skPackages={skPackages} />
    </div>
  );
}
