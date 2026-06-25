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

const KECERDASAN_SAMPLE = [
  {
    q: "Jika 3x + 7 = 22, maka nilai x adalah...",
    choices: ["3", "4", "5", "6", "7"],
    ans: "C",
  },
  {
    q: "Kata yang berlawanan makna dengan 'MAJU' adalah...",
    choices: ["Progres", "Mundur", "Berkembang", "Meningkat", "Berjalan"],
    ans: "B",
  },
  {
    q: "Deret angka: 2, 4, 8, 16, 32, __ Nilai berikutnya adalah...",
    choices: ["48", "56", "60", "64", "68"],
    ans: "D",
  },
  {
    q: "Analogi: PANAS : API = DINGIN : ...",
    choices: ["Hujan", "Salju", "Angin", "Air", "Es"],
    ans: "E",
  },
  {
    q: "Jika hari ini Selasa, maka 100 hari lagi adalah hari...",
    choices: ["Sabtu", "Minggu", "Senin", "Selasa", "Rabu"],
    ans: "C",
  },
  {
    q: "Sebuah persegi memiliki keliling 48 cm. Luas persegi tersebut adalah...",
    choices: ["96 cm²", "108 cm²", "120 cm²", "144 cm²", "160 cm²"],
    ans: "D",
  },
  {
    q: "Silogisme: Semua polisi adalah abdi negara. Budi adalah polisi. Maka...",
    choices: [
      "Budi bukan abdi negara",
      "Budi adalah abdi negara",
      "Semua abdi negara adalah polisi",
      "Budi mungkin abdi negara",
      "Tidak bisa disimpulkan",
    ],
    ans: "B",
  },
  {
    q: "Urutan yang benar dari terkecil: 3/4, 5/8, 7/12, 2/3",
    choices: ["3/4, 2/3, 5/8, 7/12", "5/8, 7/12, 2/3, 3/4", "7/12, 5/8, 2/3, 3/4", "2/3, 3/4, 5/8, 7/12", "5/8, 2/3, 7/12, 3/4"],
    ans: "B",
  },
  {
    q: "Jika KUCING = 74, maka ANJING = ...",
    choices: ["62", "64", "66", "68", "70"],
    ans: "C",
  },
  {
    q: "Dari 40 peserta, 60% lulus. Berapa peserta yang tidak lulus?",
    choices: ["14", "16", "18", "20", "24"],
    ans: "B",
  },
];

async function seedKecerdasan() {
  console.log("  Seeding Kecerdasan (10 soal sample)...");

  const rows = KECERDASAN_SAMPLE.map((item, idx) => ({
    type: QuestionType.KECERDASAN,
    sequence_number: idx + 1,
    column_index: null,
    options_payload: {
      question_text: item.q,
      svg_content: null,
      choices: item.choices.map((text, i) => ({
        key: ["A", "B", "C", "D", "E"][i],
        text,
      })),
    },
    scoring_rule: {
      type: "dichotomous",
      correct_key: item.ans,
    },
    is_active: true,
  }));

  await prisma.question.createMany({ data: rows, skipDuplicates: true });
  console.log(`  ✅ ${rows.length} soal Kecerdasan seeded (sample)`);
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
