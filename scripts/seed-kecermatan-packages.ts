import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error("Set NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env.local");
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// Paket 7 sudah ada di DB (di-seed lewat prisma/seed.ts sebelumnya) — jangan diulang di sini.
const PACKAGES = [3, 4, 5, 6, 8];

type SymbolMap = Record<"A" | "B" | "C" | "D" | "E", string>;
type BankSoal = {
  nomor: number;
  nama: string;
  total_soal: number;
  kolom: { nomor: number; simbol: SymbolMap; soal: { nomor: number; shown: string[]; kunci: string }[] }[];
};

async function seedPackage(pkg: number) {
  const filePath = path.join(__dirname, `../prisma/data/bank_soal_p${pkg}.json`);
  const bank: BankSoal = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const rows: {
    type: "KECERMATAN";
    sequence_number: number;
    column_index: number;
    package_number: number;
    options_payload: object;
    scoring_rule: object;
    is_active: boolean;
  }[] = [];

  let sequence = 1;
  for (const kolom of bank.kolom) {
    for (const soal of kolom.soal) {
      rows.push({
        type: "KECERMATAN",
        sequence_number: sequence++,
        column_index: kolom.nomor,
        package_number: pkg,
        options_payload: {
          symbol_map: kolom.simbol,
          shown: soal.shown,
          choices: ["A", "B", "C", "D", "E"],
        },
        scoring_rule: {
          type: "symbol_match",
          correct_choice: soal.kunci,
        },
        is_active: true,
      });
    }
  }

  console.log(`Paket ${pkg} (${bank.nama}): ${rows.length} soal, insert dalam batch 100...`);
  let ok = 0;
  for (let i = 0; i < rows.length; i += 100) {
    const chunk = rows.slice(i, i + 100);
    const { error } = await supabase.from("questions").insert(chunk);
    if (error) {
      console.error(`  ❌ Paket ${pkg} batch ${i}-${i + chunk.length}:`, error.message);
      throw error;
    }
    ok += chunk.length;
  }
  console.log(`  ✅ Paket ${pkg}: ${ok}/${rows.length} soal ter-insert`);
}

async function main() {
  for (const pkg of PACKAGES) {
    await seedPackage(pkg);
  }
  console.log("\nSelesai seeding semua paket Kecermatan baru.");
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
