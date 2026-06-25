/**
 * prisma/seed.ts
 * Seed database dengan:
 *  - 500 soal Kecermatan (dari bank_soal_p7.json — real data dari V3)
 *  - 10 soal Kecerdasan sample (placeholder — akan diganti bank soal lengkap di Step 4)
 *  - 10 soal Kepribadian sample (placeholder — akan diganti bank soal lengkap di Step 4)
 *
 * Jalankan: npx prisma db seed
 */

import { QuestionType } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../app/generated/prisma/client";
import bankSoalP7 from "./data/bank_soal_p7.json";

// Seed menggunakan koneksi direct (bukan pooler) untuk menghindari prepared statement issues
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

type SymbolMap = Record<"A" | "B" | "C" | "D" | "E", string>;

// ─────────────────────────────────────────────────────────────────────────────
// KECERMATAN — 500 soal dari bank_soal_p7.json
// Format V3: { nomor, shown: string[], kunci: "A"|"B"|"C"|"D"|"E" }
// Jawaban = huruf kunci dari simbol yang TIDAK tampil di shown
// ─────────────────────────────────────────────────────────────────────────────

async function seedKecermatan() {
  console.log("  Seeding Kecermatan (500 soal)...");

  const rows: {
    type: QuestionType;
    sequence_number: number;
    column_index: number;
    options_payload: object;
    scoring_rule: object;
    is_active: boolean;
  }[] = [];

  let sequence = 1;

  for (const kolom of bankSoalP7.kolom) {
    const symbolMap = kolom.simbol as SymbolMap;

    for (const soal of kolom.soal) {
      rows.push({
        type: QuestionType.KECERMATAN,
        sequence_number: sequence++,
        column_index: kolom.nomor,
        // Client-safe: tabel simbol + 4 simbol yang tampil
        options_payload: {
          symbol_map: symbolMap,
          shown: soal.shown,
          choices: ["A", "B", "C", "D", "E"],
        },
        // Server-only: kunci jawaban (huruf dari simbol yang hilang)
        scoring_rule: {
          type: "symbol_match",
          correct_choice: soal.kunci,
        },
        is_active: true,
      });
    }
  }

  await prisma.question.createMany({ data: rows, skipDuplicates: true });
  console.log(`  ✅ ${rows.length} soal Kecermatan seeded (Paket 7)`);
}

// ─────────────────────────────────────────────────────────────────────────────
// KECERDASAN — 10 soal sample (PLACEHOLDER)
// Scoring: dikotomis — Benar=1, Salah=0
// Akan diganti dengan bank soal lengkap dari psiko-kecerdasan-cat repo
// ─────────────────────────────────────────────────────────────────────────────

import bankSoalKecerdasan from "../soal.json";

async function seedKecerdasan() {
  console.log("  Seeding Kecerdasan (Data asli dari soal.json)...");

  const rows = bankSoalKecerdasan.soal.map((item: any, idx: number) => {
    // Map object "pilihan": {"a":"...", "b":"..."} to array of {key, text}
    const choicesArray = Object.entries(item.pilihan || {}).map(([k, v]) => ({
      key: k.toUpperCase(),
      text: v
    }));

    return {
      type: QuestionType.KECERDASAN,
      sequence_number: item.id || idx + 1,
      column_index: null,
      options_payload: {
        instruksi: item.instruksi || "",
        question_text: item.soal || "",
        svg_content: item.gambar || null,
        choices: choicesArray,
      },
      scoring_rule: {
        // As per previous convention
        correct_key: item.kunci?.[0]?.toUpperCase() || "A",
      },
      is_active: true,
    };
  });

  await prisma.question.createMany({ data: rows, skipDuplicates: true });
  console.log(`  ✅ ${rows.length} soal Kecerdasan seeded dari soal.json`);
}

// ─────────────────────────────────────────────────────────────────────────────
// KEPRIBADIAN — 10 soal sample (PLACEHOLDER)
// Scoring: Likert 5 opsi, favorable/unfavorable
// Akan diganti dengan bank soal lengkap dari psiko-kepribadian repo
// ─────────────────────────────────────────────────────────────────────────────

const KEPRIBADIAN_SAMPLE: {
  statement: string;
  polarity: "favorable" | "unfavorable";
}[] = [
  { statement: "Saya merasa nyaman bekerja dalam tim yang besar.", polarity: "favorable" },
  { statement: "Saya mudah panik saat menghadapi tekanan kerja.", polarity: "unfavorable" },
  { statement: "Saya selalu menepati janji yang telah saya buat.", polarity: "favorable" },
  { statement: "Saya lebih suka bekerja sendiri daripada bersama orang lain.", polarity: "unfavorable" },
  { statement: "Saya dapat mengendalikan emosi di situasi yang sulit.", polarity: "favorable" },
  { statement: "Saya sering merasa khawatir tanpa alasan yang jelas.", polarity: "unfavorable" },
  { statement: "Saya menerima kritik dengan lapang dada.", polarity: "favorable" },
  { statement: "Saya mudah terpengaruh oleh pendapat orang lain.", polarity: "unfavorable" },
  { statement: "Saya selalu berusaha memberikan hasil terbaik dalam pekerjaan.", polarity: "favorable" },
  { statement: "Saya cenderung menunda pekerjaan yang terasa berat.", polarity: "unfavorable" },
];

const LIKERT_CHOICES = [
  { key: "A", text: "Sangat Setuju" },
  { key: "B", text: "Setuju" },
  { key: "C", text: "Netral" },
  { key: "D", text: "Tidak Setuju" },
  { key: "E", text: "Sangat Tidak Setuju" },
];

const FAVORABLE_WEIGHTS = { A: 0.20, B: 0.15, C: 0.10, D: 0.05, E: 0.04 };
const UNFAVORABLE_WEIGHTS = { A: 0.04, B: 0.05, C: 0.10, D: 0.15, E: 0.20 };

async function seedKepribadian() {
  console.log("  Seeding Kepribadian (10 soal sample)...");

  const rows = KEPRIBADIAN_SAMPLE.map((item, idx) => ({
    type: QuestionType.KEPRIBADIAN,
    sequence_number: idx + 1,
    column_index: null,
    options_payload: {
      statement: item.statement,
      choices: LIKERT_CHOICES,
    },
    scoring_rule: {
      type: "likert",
      polarity: item.polarity,
      weights:
        item.polarity === "favorable" ? FAVORABLE_WEIGHTS : UNFAVORABLE_WEIGHTS,
    },
    is_active: true,
  }));

  await prisma.question.createMany({ data: rows, skipDuplicates: true });
  console.log(`  ✅ ${rows.length} soal Kepribadian seeded (sample)`);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🌱 Mulai seeding database CAT Platform...\n");

  // Bersihkan soal lama sebelum seed ulang
  const deleted = await prisma.question.deleteMany();
  if (deleted.count > 0) {
    console.log(`  🗑  Dihapus ${deleted.count} soal lama\n`);
  }

  await seedKecerdasan();
  await seedKepribadian();
  await seedKecermatan();

  const total = await prisma.question.count();
  console.log(`\n✅ Selesai! Total soal di database: ${total}`);
  console.log("   Kecerdasan  : 10 soal (sample — akan diganti bank soal lengkap)");
  console.log("   Kepribadian : 10 soal (sample — akan diganti bank soal lengkap)");
  console.log("   Kecermatan  : 500 soal (Paket 7 — real data dari V3)\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
