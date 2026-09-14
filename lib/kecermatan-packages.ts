import { supabaseAdmin } from "@/lib/supabase-admin";
import { KECERMATAN_KEYS } from "@/lib/kecermatan-symbols";
import type { PackageOption, PackageSection } from "@/app/components/PackageCarousel";

const COLUMN_COUNT = 10;
const QUESTIONS_PER_COLUMN = 50;
const COLUMN_STARTS = Array.from({ length: COLUMN_COUNT }, (_, i) => i * QUESTIONS_PER_COLUMN + 1);

// Dipakai oleh kedua aspek Kecermatan (emoji & angka-huruf) di
// app/dashboard/latihan/kecermatan/page.tsx — logic-nya identik, cuma beda
// daftar package_number + label yang dikirim.
export async function buildKecermatanPackages(
  packageNumbers: number[],
  labels: Record<number, string>
): Promise<PackageOption[]> {
  const previews = await Promise.all(packageNumbers.map((pkg) =>
    supabaseAdmin.from("questions")
      .select("options_payload", { count: "exact" })
      .eq("type", "KECERMATAN").eq("is_active", true).eq("package_number", pkg)
      .order("column_index", { ascending: true })
      .order("sequence_number", { ascending: true }).limit(1)
  ));

  // Rincian per kolom cuma perlu ditarik buat paket yang sudah lengkap (500
  // butir) — dipakai modal "detail paket" sebelum peserta mulai.
  const sectionRows = await Promise.all(packageNumbers.map((pkg, index) =>
    previews[index].count === 500
      ? supabaseAdmin.from("questions")
          .select("column_index, sequence_number, options_payload")
          .eq("type", "KECERMATAN").eq("is_active", true).eq("package_number", pkg)
          .in("sequence_number", COLUMN_STARTS)
      : Promise.resolve({ data: null })
  ));

  return packageNumbers.map((pkg, index) => {
    const symbolMap = previews[index].data?.[0]?.options_payload?.symbol_map as
      | Record<string, string>
      | undefined;

    const rows = sectionRows[index].data as
      | { column_index: number; options_payload: { symbol_map?: Record<string, string> } }[]
      | null;
    const sections: PackageSection[] | undefined = rows
      ?.sort((a, b) => a.column_index - b.column_index)
      .map((row) => ({
        index: row.column_index,
        questionCount: QUESTIONS_PER_COLUMN,
        symbols: KECERMATAN_KEYS.map((key) => row.options_payload.symbol_map?.[key] ?? "—"),
      }));

    return {
      id: pkg,
      label: labels[pkg],
      questionCount: previews[index].count,
      symbols: KECERMATAN_KEYS.map((key) => symbolMap?.[key] ?? "—"),
      sections,
    };
  });
}
