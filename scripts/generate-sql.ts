import * as fs from "fs";
import * as path from "path";

const soalPath = path.join(__dirname, "../soal.json");
const raw = JSON.parse(fs.readFileSync(soalPath, "utf-8"));
const soalList: any[] = raw.soal.filter((s: any) => s.id >= 38);

function buildPayload(soal: any) {
  const choices = Object.entries(soal.pilihan as Record<string, string>).map(
    ([k, v]) => ({ key: k.toUpperCase() as "A"|"B"|"C"|"D"|"E", text: String(v) })
  );

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

let sql = "BEGIN;\n\n";

for (const soal of soalList) {
  const { options_payload, scoring_rule } = buildPayload(soal);
  
  // Escape single quotes for SQL
  const optionsStr = JSON.stringify(options_payload).replace(/'/g, "''");
  const scoringStr = JSON.stringify(scoring_rule).replace(/'/g, "''");
  
  sql += `UPDATE questions 
SET options_payload = '${optionsStr}'::jsonb, 
    scoring_rule = '${scoringStr}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = ${soal.id};\n`;
}

sql += "\nCOMMIT;\n";

const sqlPath = path.join(__dirname, "../seed-kecerdasan.sql");
fs.writeFileSync(sqlPath, sql);
console.log(`Berhasil membuat ${sqlPath}! Silakan copy-paste isinya ke Supabase SQL Editor.`);
