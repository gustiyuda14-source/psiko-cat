import { supabaseAdmin } from "@/lib/supabase-admin";
import { KECERMATAN_KEYS } from "@/lib/kecermatan-symbols";
import type { PackageOption, PackageSection } from "@/app/components/PackageCarousel";

const COLUMN_COUNT = 10;
const QUESTIONS_PER_COLUMN = 50;
const COLUMN_STARTS = Array.from({ length: COLUMN_COUNT }, (_, i) => i * QUESTIONS_PER_COLUMN + 1);

// Dipakai oleh kedua aspek Kecermatan (emoji & angka-huruf) di
// app/dashboard/latihan/kecermatan/page.tsx — logic-nya identik, cuma beda
// daftar package_number + label yang dikirim.
type SymbolRow = {
  package_number: number;
  column_index: number;
  options_payload: { symbol_map?: Record<string, string> };
};

// Sebelumnya: N query paralel buat count tiap paket + N query lagi buat
// section rows (sampai ~40 round-trip Supabase per load halaman picker).
// Sekarang: 2 query total, IN (package_number) sekaligus, count dihitung di
// JS. COLUMN_STARTS[0] == 1 jadi baris kolom 1 (dipakai buat preview simbol)
// sudah ikut kebawa di query section, gak perlu query preview terpisah.
export async function buildKecermatanPackages(
  packageNumbers: number[],
  labels: Record<number, string>
): Promise<PackageOption[]> {
  const [{ data: countRows }, { data: symbolRows }] = await Promise.all([
    supabaseAdmin.from("questions")
      .select("package_number")
      .eq("type", "KECERMATAN").eq("is_active", true)
      .in("package_number", packageNumbers),
    supabaseAdmin.from("questions")
      .select("package_number, column_index, sequence_number, options_payload")
      .eq("type", "KECERMATAN").eq("is_active", true)
      .in("package_number", packageNumbers)
      .in("sequence_number", COLUMN_STARTS),
  ]);

  const counts = new Map<number, number>();
  for (const row of (countRows ?? []) as { package_number: number }[]) {
    counts.set(row.package_number, (counts.get(row.package_number) ?? 0) + 1);
  }

  const rowsByPackage = new Map<number, SymbolRow[]>();
  for (const row of (symbolRows ?? []) as SymbolRow[]) {
    const list = rowsByPackage.get(row.package_number) ?? [];
    list.push(row);
    rowsByPackage.set(row.package_number, list);
  }

  return packageNumbers.map((pkg) => {
    const count = counts.get(pkg) ?? 0;
    const rows = (rowsByPackage.get(pkg) ?? []).sort((a, b) => a.column_index - b.column_index);
    const symbolMap = rows.find((row) => row.column_index === 1)?.options_payload.symbol_map;

    // Rincian per kolom cuma berarti buat paket yang sudah lengkap (500 butir)
    // — dipakai modal "detail paket" sebelum peserta mulai.
    const sections: PackageSection[] | undefined = count === 500
      ? rows.map((row) => ({
          index: row.column_index,
          questionCount: QUESTIONS_PER_COLUMN,
          symbols: KECERMATAN_KEYS.map((key) => row.options_payload.symbol_map?.[key] ?? "—"),
        }))
      : undefined;

    return {
      id: pkg,
      label: labels[pkg],
      questionCount: count,
      symbols: KECERMATAN_KEYS.map((key) => symbolMap?.[key] ?? "—"),
      sections,
    };
  });
}
