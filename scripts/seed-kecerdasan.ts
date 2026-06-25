import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error("Set NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env.local");
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const soalPath = path.join(__dirname, "../soal.json");
const raw      = JSON.parse(fs.readFileSync(soalPath, "utf-8"));
const soalList: any[] = raw.soal.filter((s: any) => s.id >= 38);

function buildPayload(soal: any) {
  const choices = Object.entries(soal.pilihan as Record<string, string>).map(
    ([k, v]) => ({ key: k.toUpperCase() as "A"|"B"|"C"|"D"|"E", text: String(v) })
  );

  // Untuk soal ganda (2 kunci): gabung jadi string sorted "BD"
  // Untuk soal biasa (1 kunci): huruf tunggal "D"
  const correct_key = soal.ganda
    ? (soal.kunci as string[]).map((k: string) => k.toUpperCase()).sort().join("")
    : (soal.kunci as string[])[0].toUpperCase();

  const options_payload = {
    question_text:   soal.soal   ?? null,
    svg_content:     soal.gambar ?? null,
    instruksi:       soal.instruksi,
    sub_text:        soal.wacana ?? null,
    is_multi_select: soal.ganda === true,
    choices,
  };

  const scoring_rule = {
    type:        "dichotomous",
    correct_key,
  };

  return { options_payload, scoring_rule };
}

async function main() {
  console.log(`Seeding ${soalList.length} soal KECERDASAN...`);
  let ok = 0, fail = 0;

  for (const soal of soalList) {
    const { options_payload, scoring_rule } = buildPayload(soal);

    const { error } = await supabase
      .from("questions")
      .update({ options_payload, scoring_rule })
      .eq("type", "KECERDASAN")
      .eq("sequence_number", soal.id);

    if (error) {
      console.error(`❌ Soal #${soal.id} (${soal.tipe}):`, error.message);
      fail++;
    } else {
      ok++;
      if (ok % 20 === 0) console.log(`  ✓ ${ok}/100 selesai`);
    }
  }

  console.log(`\nSelesai: ✓${ok} berhasil | ✗${fail} gagal`);
}

main();
