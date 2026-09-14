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
// Sempat dicoba 1 query count gabungan (.in package_number, tanpa
// count:"exact") tapi itu BUG: PostgREST default max-rows 1000, sementara
// total baris across package bisa 2500-3000 (5-6 paket x 500) — kepotong
// diam-diam, paket yang gak kebagian 1000 baris pertama kebaca 0 butir.
// Count HARUS pakai head:true (aggregate COUNT di server, gak kena limit
// baris) — makanya tetap N query kecil di sini, tapi tanpa payload apapun
// jadi tetap jauh lebih ringan dari versi awal yang narik options_payload di
// tiap query count. Section/symbol tetap 1 query gabungan (aman, dibatasi
// COLUMN_STARTS, maks ~10 baris/paket).
export async function buildKecermatanPackages(
  packageNumbers: number[],
  labels: Record<number, string>
): Promise<PackageOption[]> {
  const [counts, { data: symbolRows }] = await Promise.all([
    Promise.all(packageNumbers.map((pkg) =>
      supabaseAdmin.from("questions")
        .select("id", { count: "exact", head: true })
        .eq("type", "KECERMATAN").eq("is_active", true).eq("package_number", pkg)
    )),
    supabaseAdmin.from("questions")
      .select("package_number, column_index, sequence_number, options_payload")
      .eq("type", "KECERMATAN").eq("is_active", true)
      .in("package_number", packageNumbers)
      .in("sequence_number", COLUMN_STARTS),
  ]);

  const countByPkg = new Map(packageNumbers.map((pkg, i) => [pkg, counts[i].count ?? 0]));

  const rowsByPackage = new Map<number, SymbolRow[]>();
  for (const row of (symbolRows ?? []) as SymbolRow[]) {
    const list = rowsByPackage.get(row.package_number) ?? [];
    list.push(row);
    rowsByPackage.set(row.package_number, list);
  }

  return packageNumbers.map((pkg) => {
    const count = countByPkg.get(pkg) ?? 0;
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
