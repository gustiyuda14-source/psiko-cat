import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";
import { data, root, teksRows, type Row, type TeksFile } from "./kecerdasan-teks-lib";

// Pembahasan Kecerdasan sudah ditulis di prisma/data, tapi skrip seed sengaja tidak menyimpannya
// (options_payload ikut terkirim ke browser saat ujian). Skrip ini menaruhnya di scoring_rule.pembahasan,
// yang hanya dibaca server, dengan mencocokkan isi butir (stem, wacana, gambar, pilihan, kunci) — bukan nomor,
// karena butir pkg 13/14/2 adalah salinan yang nomornya digeser.
//   Lihat cakupan:  npx tsx scripts/backfill-pembahasan-kecerdasan.ts
//   Tulis:          npx tsx scripts/backfill-pembahasan-kecerdasan.ts --apply

process.loadEnvFile(path.join(root, ".env.local"));
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

type Payload = Row["options_payload"];
// Salinan pkg 13 dari pkg 1 diberi prefiks id SVG (p13q<n>-); buang supaya tetap cocok.
const fp = (p: Payload, key: string) =>
  JSON.stringify([p.question_text ?? null, p.sub_text ?? null, (p.svg_content ?? "").replace(/p13q\d+-/g, ""), p.choices.map((c) => c.text), key]);

// Gambar pembahasan (opsional) ikut ke scoring_rule.pembahasan_svg, dicocokkan dengan cara yang sama.
const source = new Map<string, { text: string; svg?: string }>();
const add = (row: Row, text: string | undefined, svg?: string) => {
  if (text?.trim()) source.set(fp(row.options_payload, row.scoring_rule.correct_key), { text: text.replaceAll("<br>", "\n").trim(), svg });
};
// p4/p5 = Latihan Paket 3 & 4 (pedoman v3), p19/p20 = Simulasi 4/5; dilewati selama filenya belum ada.
const TEKS_FILES = ["kecerdasan_p2_teks.json", "kecerdasan_p3_teks.json", "kecerdasan_s2_teks.json", "kecerdasan_p15_teks.json", "kecerdasan_p16_teks.json", "kecerdasan_p4_teks.json", "kecerdasan_p5_teks.json", "kecerdasan_p19_teks.json", "kecerdasan_p20_teks.json"];
for (const f of TEKS_FILES.filter((f) => fs.existsSync(path.join(root, "prisma/data", f)))) {
  const teks = data(f) as TeksFile;
  teksRows(teks).forEach((r, i) => add(r, teks.soal[i].p));
}
// Butir swap simulasi-5 (Alokasi 88-92, Sebab-Akibat 73-75), per paket.
for (const f of ["kecerdasan_alokasi.json", "kecerdasan_sba.json"].filter((f) => fs.existsSync(path.join(root, "prisma/data", f))))
  for (const teks of Object.values(data(f) as Record<string, TeksFile>)) teksRows(teks).forEach((r, i) => add(r, teks.soal[i].p));
// Blok kecukupan data 97-99 (seed-kecerdasan-kck.ts): tabel ikut sebagai svg_content.
if (fs.existsSync(path.join(root, "prisma/data/kecerdasan_kck_kal.json")))
  for (const soal of Object.values(data("kecerdasan_kck_kal.json") as Record<string, (TeksFile["soal"][number] & { svg?: string | null })[]>))
    teksRows({ wacana: {}, soal }).forEach((r, i) => add({ ...r, options_payload: { ...r.options_payload, svg_content: soal[i].svg ?? null } }, soal[i].p));
// Paket 1 lama (soal.json, sumber pkg 1 dan salinannya di pkg 13); bentuk butirnya mengikuti seed-kecerdasan.ts.
type P1 = { soal?: string | null; wacana?: string | null; gambar?: string | null; pilihan: Record<string, string>; kunci: string[]; ganda?: boolean; pembahasan?: string };
for (const x of (JSON.parse(fs.readFileSync(path.join(root, "soal.json"), "utf8")) as { soal: P1[] }).soal) {
  const correct_key = x.ganda ? x.kunci.map((k) => k.toUpperCase()).sort().join("") : x.kunci[0].toUpperCase();
  const choices = Object.entries(x.pilihan).map(([k, text]) => ({ key: k.toUpperCase(), text: String(text) }));
  add({ sequence_number: 0, options_payload: { question_text: x.soal ?? null, sub_text: x.wacana ?? null, svg_content: x.gambar ?? null, choices }, scoring_rule: { correct_key } } as unknown as Row, x.pembahasan);
}
type Gambar = Row & { pembahasan?: string; pembahasan_svg?: string };
const gambar: Gambar[] = [
  ...data("kecerdasan_p2_pola.json"),
  ...data("kecerdasan_p2_susun.json"),
  ...data("kecerdasan_s2_figural.json"),
  ...data("kecerdasan_s2_susun.json"),
  ...["kecerdasan_figural_kal.json", "kecerdasan_susun_kal.json", "kecerdasan_denah_kal.json"].flatMap((f) => Object.values(data(f) as Record<string, Gambar[]>).flat()),
];
gambar.forEach((g) => add(g, g.pembahasan, g.pembahasan_svg));

(async () => {
  // Supabase membatasi 1.000 baris per permintaan; baca per halaman supaya semua paket ikut.
  const rows: unknown[] = [];
  for (let from = 0; ; from += 1000) {
    const { data: page, error } = await supabase
      .from("questions")
      .select("id, package_number, sequence_number, options_payload, scoring_rule")
      .eq("type", "KECERDASAN")
      .order("id")
      .range(from, from + 999);
    if (error) throw error;
    rows.push(...page);
    if (page.length < 1000) break;
  }

  const updates: { id: string; scoring_rule: Row["scoring_rule"] & { pembahasan: string; pembahasan_svg?: string } }[] = [];
  const cov: Record<number, [number, number]> = {};
  for (const r of rows as unknown as (Row & { id: string; package_number: number })[]) {
    const src = source.get(fp(r.options_payload, r.scoring_rule.correct_key));
    (cov[r.package_number] ??= [0, 0])[1]++;
    if (!src) continue;
    cov[r.package_number][0]++;
    const cur = r.scoring_rule as { pembahasan?: string; pembahasan_svg?: string };
    if (cur.pembahasan !== src.text || (src.svg && cur.pembahasan_svg !== src.svg))
      updates.push({ id: r.id, scoring_rule: { ...r.scoring_rule, pembahasan: src.text, ...(src.svg ? { pembahasan_svg: src.svg } : {}) } });
  }
  for (const [pkg, [hit, n]] of Object.entries(cov)) console.log(`pkg ${pkg}: ${hit}/${n} butir punya pembahasan`);
  console.log(`${source.size} pembahasan di file, ${updates.length} baris perlu diperbarui.`);

  if (!process.argv.includes("--apply")) return;
  for (const u of updates) {
    const { error: e } = await supabase.from("questions").update({ scoring_rule: u.scoring_rule }).eq("id", u.id);
    if (e) throw e;
  }
  console.log(`Updated ${updates.length} baris.`);
})();
