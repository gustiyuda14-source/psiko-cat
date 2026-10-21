import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { aspekIntegritas, itemScore, summarize, type KpPembahasan, type PribadiRule } from "../lib/scoring/pribadi";

// Seed satu paket latihan PRIBADI dari bank file ke tabel questions.
//   npx tsx scripts/seed-pribadi-paket.ts 2          → cek komposisi saja (dry run)
//   npx tsx scripts/seed-pribadi-paket.ts 2 --apply  → tulis ke DB lalu verifikasi
// Urutan butir diambil dari bank/pribadi/paket-<NN>.json. Jalankan
// scripts/check-bank-pribadi.ts dulu untuk validasi isi butir.

process.loadEnvFile(path.join(__dirname, "../.env.local"));

const PKG = Number(process.argv[2]);
const APPLY = process.argv.includes("--apply");
assert.ok(Number.isInteger(PKG) && PKG >= 2, "Nomor paket latihan wajib (Likert 2-10, SJT 21+, Ya/Tidak 31+)");

const dir = path.join(__dirname, "../bank/pribadi");
const read = (f: string) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
const manifest = read(`paket-${String(PKG).padStart(2, "0")}.json`) as { urutan: string[] };

type Kp = { id: string; aspek: string; arah: "favorable" | "unfavorable"; pernyataan: string; alasan: string; catatan_psikologi?: string; bedah?: KpPembahasan["bedah"] };
type Sk = { id: string; dimensi: string; sub?: string; situasi: string; opsi: { A: string; B: string }; kunci: "A" | "B"; kembar_dengan: string | null; pembahasan: string };
type Sjt = { id: string; aspek: string; situasi: string; opsi: Record<string, string>; bobot: Record<string, number>; alasan_opsi: Record<string, string>; tips: string };
type Yt = { id: string; aspek: string; kunci: "Ya" | "Tidak"; pasangan: string | null; pernyataan: string; pembahasan: { alasan: string; jika_sebaliknya: string; tips: string } };
const kp = new Map<string, Kp & { definisi: string }>();
const sjt = new Map<string, Sjt & { definisi: string }>();
const sk = new Map<string, Sk & { nama: string; aturan: string }>();
const yt = new Map<string, Yt & { definisi: string }>();
for (const f of fs.readdirSync(dir)) {
  if (/^kp-.*\.json$/.test(f)) {
    const b = read(f) as { definisi_aspek: Record<string, string>; items: Kp[] };
    for (const it of b.items) kp.set(it.id, { ...it, definisi: b.definisi_aspek[it.aspek] });
  } else if (/^sjt-.*\.json$/.test(f)) {
    const b = read(f) as { definisi_aspek: Record<string, string>; items: Sjt[] };
    for (const it of b.items) sjt.set(it.id, { ...it, definisi: b.definisi_aspek[it.aspek] });
  } else if (/^yt-.*\.json$/.test(f)) {
    const b = read(f) as { definisi_aspek: Record<string, string>; items: Yt[] };
    for (const it of b.items) yt.set(it.id, { ...it, definisi: b.definisi_aspek[it.aspek] });
  } else if (/^sk-.*\.json$/.test(f)) {
    const b = read(f) as { dimensi: Record<string, { nama: string; aturan: string }>; items: Sk[] };
    for (const it of b.items) sk.set(it.id, { ...it, ...b.dimensi[it.dimensi] });
  }
}

// Komposisi paket (pedoman §4.1, §4.2)
const ids = manifest.urutan;
assert.equal(new Set(ids).size, ids.length, "ada butir ganda di manifest");
const ytIds = ids.filter((id) => yt.has(id));
if (ytIds.length) checkYt();

// Paket Ya/Tidak: 70 butir YT saja (6 aspek × 10 + 10 Validitas), kunci 5/5 per kelompok,
// 6 pasangan simetris berjarak >= 15, pembahasan lengkap.
function checkYt() {
  assert.equal(ytIds.length, ids.length, "paket Ya/Tidak tidak boleh campur dengan Likert/SJT/SK");
  assert.equal(ids.length, 70, "paket Ya/Tidak harus 70 butir");
  const per = new Map<string, number[]>();
  for (const id of ids) {
    const it = yt.get(id)!;
    const c = per.get(it.aspek) ?? [0, 0];
    c[it.kunci === "Ya" ? 0 : 1]++;
    per.set(it.aspek, c);
    assert.ok(it.definisi && it.pernyataan && it.pembahasan?.alasan && it.pembahasan.jika_sebaliknya && it.pembahasan.tips, `${id}: isi/pembahasan belum lengkap`);
    if (it.pasangan) {
      assert.equal(yt.get(it.pasangan)?.pasangan, id, `${id}: pasangan tidak simetris`);
      assert.ok(Math.abs(ids.indexOf(id) - ids.indexOf(it.pasangan)) >= 15, `${id}: pasangan terlalu dekat`);
    }
  }
  assert.equal(per.size, 7, "harus 6 aspek + Validitas");
  for (const [a, [y, t]] of per) assert.ok(y === 5 && t === 5, `${a}: harus 5 Ya + 5 Tidak, dapat ${y}:${t}`);
  assert.equal(ids.filter((id) => yt.get(id)!.pasangan).length, 12, "harus 6 pasangan");
}
const sjtIds = ytIds.length ? [] : ids.filter((id) => sjt.has(id));
const kpIds = sjtIds.length ? sjtIds : ids.filter((id) => kp.has(id)), skIds = ids.filter((id) => sk.has(id));
if (!ytIds.length) checkKpSk();
function checkKpSk() {
assert.equal(kpIds.length + skIds.length, ids.length, "ada id yang tidak ada di bank, atau Likert dan SJT tercampur");
assert.ok(kpIds.length === 48 || kpIds.length === 64, "Kepribadian harus 48 butir (64 bila + Loyalitas & Kerja Sama)");
assert.equal(skIds.length, 63, "Substansi Khusus harus 63 butir");
assert.deepEqual(ids.slice(0, kpIds.length), kpIds, "Kepribadian harus di Bagian 1");
const perAspek = new Map<string, number[]>();
for (const id of kpIds) {
  const it = kp.get(id) ?? sjt.get(id)!;
  const c = perAspek.get(it.aspek) ?? [0, 0];
  c["arah" in it && it.arah === "unfavorable" ? 1 : 0]++;
  perAspek.set(it.aspek, c);
}
assert.equal(perAspek.size, kpIds.length / 8, "tiap aspek 8 butir");
if (!sjtIds.length) for (const [a, [f, u]] of perAspek) assert.ok(f === 4 && u === 4, `${a}: harus 4 favorable + 4 unfavorable, dapat ${f}:${u}`);
for (const id of skIds) {
  const t = sk.get(id)!.kembar_dengan;
  if (t) assert.ok(Math.abs(ids.indexOf(id) - ids.indexOf(t)) >= 10, `${id}: kembar terlalu dekat`);
}
}

const CHOICES_KP = [
  { key: "A", text: "Sangat Tidak Sesuai" },
  { key: "B", text: "Tidak Sesuai" },
  { key: "C", text: "Sesuai" },
  { key: "D", text: "Sangat Sesuai" },
];
const CHOICES_YT = [
  { key: "A", text: "Ya" },
  { key: "B", text: "Tidak" },
];
const rows = ids.map((id, i) => {
  const base = { type: "KEPRIBADIAN" as const, sequence_number: i + 1, package_number: PKG, is_active: true };
  const y = yt.get(id);
  if (y) {
    const validitas = y.aspek === "Validitas";
    return {
      ...base,
      options_payload: { subtes: "YT", statement: y.pernyataan, aspect: y.aspek, choices: CHOICES_YT, bank_id: id, pasangan: y.pasangan },
      scoring_rule: {
        type: "ya_tidak", aspect: y.aspek, validitas, correct_key: y.kunci === "Ya" ? "A" : "B",
        pembahasan: { definisi_aspek: y.definisi, ...y.pembahasan },
      } satisfies PribadiRule,
    };
  }
  const j = sjt.get(id);
  if (j) {
    return {
      ...base,
      options_payload: { subtes: "SJT", statement: j.situasi, aspect: j.aspek, choices: Object.keys(j.opsi).map((key) => ({ key, text: j.opsi[key] })), bank_id: id },
      scoring_rule: { type: "sjt5", aspect: j.aspek, bobot: j.bobot, pembahasan: { definisi_aspek: j.definisi, opsi: j.alasan_opsi, tips: j.tips } } satisfies PribadiRule,
    };
  }
  const k = kp.get(id);
  if (k) {
    return {
      ...base,
      options_payload: { subtes: "KP", statement: k.pernyataan, aspect: k.aspek, choices: CHOICES_KP, bank_id: id },
      scoring_rule: {
        type: "likert4", aspect: k.aspek, polarity: k.arah,
        pembahasan: { definisi_aspek: k.definisi, bedah: k.bedah, alasan: k.alasan, catatan_psikologi: k.catatan_psikologi ?? null },
      } satisfies PribadiRule,
    };
  }
  const s = sk.get(id)!;
  return {
    ...base,
    options_payload: { subtes: "SK", statement: s.situasi, aspect: aspekIntegritas(s.dimensi, s.sub), choices: [{ key: "A", text: s.opsi.A }, { key: "B", text: s.opsi.B }], bank_id: id },
    scoring_rule: { type: "forced_choice", dimensi: s.nama, correct_key: s.kunci, pembahasan: `Aturan: ${s.aturan} ${s.pembahasan}` } satisfies PribadiRule,
  };
});
const idealOf = (rule: PribadiRule) => itemScore(rule, null).ideal;
const idealSum = summarize(rows.map((r) => ({ rule: r.scoring_rule, selected: idealOf(r.scoring_rule) })));
assert.equal(idealSum.pribadi, 100, "jawaban ideal harus 100");
if (ytIds.length) assert.equal(idealSum.validitas?.sesuai, 10, "jawaban ideal: Validitas harus 10/10");
console.log(ytIds.length
  ? `Paket ${PKG}: komposisi lolos (Ya/Tidak ${ids.length - 10} butir aspek + 10 Validitas).`
  : `Paket ${PKG}: komposisi lolos (${kpIds.length} Kepribadian${sjtIds.length ? " SJT" : ""} + 63 Integritas & Kejujuran).`);
if (!APPLY) process.exit(0);

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

async function main() {
  const { count } = await supabase.from("questions").select("id", { count: "exact", head: true }).eq("type", "KEPRIBADIAN").eq("package_number", PKG);
  if (count) throw new Error(`Paket ${PKG} sudah berisi ${count} baris. Hapus dulu secara sadar bila memang ingin mengganti.`);
  const { error } = await supabase.from("questions").insert(rows);
  if (error) throw error;

  // Verifikasi dari DB: jumlah, urutan, dan penilaian jawaban ideal = 100.
  const { data } = await supabase.from("questions").select("sequence_number, options_payload, scoring_rule")
    .eq("type", "KEPRIBADIAN").eq("package_number", PKG).order("sequence_number");
  assert.equal(data?.length, ids.length);
  const rules = data!.map((r) => r.scoring_rule as unknown as PribadiRule);
  const ideal = summarize(rules.map((rule) => ({ rule, selected: idealOf(rule) })));
  assert.equal(ideal.pribadi, 100);
  const allC = summarize(rules.map((rule) => ({ rule, selected: rule.type === "forced_choice" || rule.type === "ya_tidak" ? "A" : "C" })));
  assert.equal(data!.filter((r) => (r.scoring_rule as unknown as PribadiRule)?.pembahasan).length, ids.length, "pembahasan harus 100%");
  console.log(`Paket ${PKG}: ${ids.length} baris tertulis. Jawaban ideal = ${ideal.pribadi}; semua "Sesuai" + semua A = ${allC.pribadi} (KP ${allC.kp?.nilai}, SK ${allC.sk?.nilai}).`);
}
main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
