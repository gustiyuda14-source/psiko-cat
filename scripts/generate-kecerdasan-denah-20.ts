import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import * as fs from "fs";
import * as path from "path";
import { makeMap2, clearOfCompass, renderMap2, type Map2 } from "./denah-k17-bw";
import { reseed, shuffle, WALKERS } from "./denah-k17-peta";
import { inlineMap, pembahasanSvg } from "./denah-pkg20-svg";
import { rute20, rotasi20 } from "./denah-pkg20-items";
import { belakang20, samaArah20 } from "./denah-pkg20-arah";
import { labelsClear } from "./denah-pkg20-sim";
import type { Item } from "./denah-k17-soal-bw";

// Blok Denah & Arah Mata Angin paket 20 (Simulasi 5): peta A (Utara di atas) 38 BELAKANG, 39 ARAH SAMA, 40 RUTE 3 belokan, 41 RUTE 4 belokan; peta B (Utara di kiri) 42 ROTASI.
// Mengimpor mesin K17 tanpa menyentuh paket lain. DENAH20_ROWS dipakai generate-kecerdasan-denah-kal.ts; dijalankan langsung hanya menulis pratinjau + PNG.
//   npx tsx scripts/generate-kecerdasan-denah-20.ts [folder-keluaran]
const root = path.join(__dirname, "..");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const KEYS = ["A", "B", "C", "D", "E"] as const;
const PKG = 20, K_ROT = 3; // peta B: Utara di kiri peta (paket 19 memakai 180°)
// Kunci (D-4): 38 C · 39 E · 40 D · 41 B · 42 A; 38/39/41 menggeser indeks letak kunci di opsi.
const POS = { 38: 2, 39: 4, 41: 1 };
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").replace(/[.…]+/g, "").trim();

// ---- Anti-bocor: stem dan peta tidak boleh sama dengan paket lain / drill K17 ----
const existing = Object.fromEntries(Object.entries(JSON.parse(fs.readFileSync(path.join(root, "prisma/data/kecerdasan_denah_kal.json"), "utf8")) as Record<string, { options_payload: { question_text: string; svg_content: string } }[]>).filter(([k]) => k !== String(20)));
const usedStems = new Set<string>([
  ...Object.values(existing).flat().map((r) => norm(r.options_payload.question_text)),
  ...(JSON.parse(fs.readFileSync(path.join(root, "data/drill-bank.json"), "utf8")) as { stem: string }[]).map((q) => norm(q.stem)),
  ...(JSON.parse(fs.readFileSync(path.join(root, "bank/drill/kecerdasan/K17-denah-arah.json"), "utf8")) as { stem: string }[]).map((q) => norm(q.stem)),
]);
const mapCore = (svg: string) => /<g clip-path="url\([^)]*\)">([\s\S]*?)<rect x="8" y="84" width="432"/.exec(svg)?.[1] ?? "";
const oldCores = [
  ...Object.values(existing).flat().map((r) => mapCore(r.options_payload.svg_content)),
  ...fs.readdirSync(path.join(root, "public/drill/img")).filter((f) => f.startsWith("K17-peta")).map((f) => mapCore(fs.readFileSync(path.join(root, "public/drill/img", f), "utf8"))),
].filter(Boolean);
assert.ok(oldCores.length >= 40, "pemeriksa anti-bocor kosong");
const labelsOf = (svg: string) => [...svg.matchAll(/>([^<>]+)<\/text>/g)].map((m) => m[1]).sort().join("|");
const oldLabels = new Set([...Object.values(existing).flat().map((r) => labelsOf(r.options_payload.svg_content))]);
function freshMap(bw: Map2, n: number, rot: number) {
  const svg = renderMap2(bw, n, undefined, rot);
  assert.ok(!oldCores.includes(mapCore(svg)), "peta sama dengan peta paket lain");
  assert.ok(!oldLabels.has(labelsOf(svg)), "label peta sama dengan peta paket lain");
}
// A-7: tanpa unsur kepolisian; nama objek unik supaya opsi tidak ambigu; label jalan tidak bertumpuk.
const okMap = (bw: Map2) => labelsClear(bw) && !bw.objs.some((o) => o.kind === "polisi") && new Set(bw.objs.map((o) => o.name)).size === bw.objs.length;

type Row = {
  sequence_number: number;
  options_payload: { instruksi: string; question_text: string; sub_text: null; is_multi_select: false; svg_content: string; choices: { key: string; text: string }[] };
  scoring_rule: { type: "dichotomous"; correct_key: string };
  sub_type: string; tingkat: 3; pembahasan: string; pembahasan_svg: string;
};
function build(seq: number, it: Item, bw: Map2, n: number, rot: number): Row {
  const opsi = it.opsi as Record<string, string>, over = it as unknown as { cap: string[]; over: string };
  const row: Row = {
    sequence_number: seq,
    options_payload: {
      instruksi: it.instruksi as string, question_text: it.stem as string, sub_text: null, is_multi_select: false,
      svg_content: inlineMap(bw, n, rot, `dk${PKG}q${seq}-`), choices: KEYS.map((key, i) => ({ key, text: opsi["abcde"[i]] })),
    },
    scoring_rule: { type: "dichotomous", correct_key: (it.kunci as string[])[0].toUpperCase() },
    sub_type: it.sub_type as string, tingkat: 3, pembahasan: it.pembahasan as string, pembahasan_svg: pembahasanSvg(bw, n, rot, over),
  };
  // Validasi baris (selaras dengan asersi generator paket lain).
  const texts = row.options_payload.choices.map((c) => c.text);
  assert.equal(new Set(texts).size, 5, `#${seq}: opsi kembar`);
  assert.equal(row.pembahasan.split("\n\n").length, 2, `#${seq}: pembahasan harus 2 paragraf`);
  assert.ok(row.pembahasan.endsWith(`Jawaban: ${row.scoring_rule.correct_key.toLowerCase()}.`), `#${seq}: akhir pembahasan`);
  assert.equal(texts[KEYS.indexOf(row.scoring_rule.correct_key as (typeof KEYS)[number])], it.ans, `#${seq}: kunci ≠ hasil solver`);
  assert.ok(!usedStems.has(norm(row.options_payload.question_text)), `#${seq}: stem sudah dipakai`);
  usedStems.add(norm(row.options_payload.question_text));
  assert.ok(!/<(?:script|image|style)\b|href="(?!#)/.test(row.options_payload.svg_content), `#${seq}: SVG soal tidak aman`);
  assert.ok(!/\bid=/.test(row.pembahasan_svg), `#${seq}: G-8`);
  assert.ok(!/polisi|polri|patroli|pelaku|tersangka|petugas/i.test(JSON.stringify(row)), `#${seq}: A-7`);
  return row;
}

const walkers = shuffle(WALKERS);
const rows: Row[] = [];
let it: Item | null = null, bw: Map2;
for (let a = 0; ; a++) { // slot 40: peta A, Utara di atas
  reseed(60000 + a);
  bw = makeMap2(18, 22);
  if (!okMap(bw) || bw.streets.length < 6) continue;
  it = rute20(bw, 3, walkers[0]);
  if (it) { freshMap(bw, 1, 0); break; }
}
const itA = it, bwA = bw!;
rows.push(build(40, it!, bwA, 1, 0));
// slot 38, 39, 41: peta A yang sama dengan 40 (satu peta, empat butir), pejalan/bangunan tidak diulang.
const usedArah = new Set<string>([itA!.spec ? (itA!.spec as { start: string }).start : ""]);
const it38 = belakang20(bwA, POS[38], usedArah, walkers[2]);
assert.ok(it38, "38: tidak ada butir BELAKANG pada peta A");
rows.push(build(38, it38, bwA, 1, 0));
const it39 = samaArah20(bwA, POS[39], usedArah);
assert.ok(it39, "39: tidak ada butir ARAH SAMA pada peta A");
rows.push(build(39, it39, bwA, 1, 0));
// 41: RUTE lebih panjang dari 40; peta A tidak selalu memuat 4 belokan yang sah, maka turun ke 3 belokan (bangunan ketiga, lalu bangunan kedua seperti 40, rute lain).
let it41: Item | null = null;
const core = (q: Item) => (q.stem as string).replace(/^\S+ /, "").replace(/ \S+ setelah belokan terakhir/, "");
const distinct = (q: Item | null) => !!q && (q.spec as { start: string }).start !== (itA!.spec as { start: string }).start && core(q) !== core(itA!); // bukan kembaran 40 (rute lain)
for (const [cnt, m] of [[4, 2], [3, 3], [3, 2]]) for (let k = 0; k < 40 && !distinct(it41); k++) it41 = rute20(bwA, POS[41], walkers[3], cnt, m);
assert.ok(it41, "41: tidak ada butir RUTE pada peta A");
rows.push(build(41, it41, bwA, 1, 0));
for (let a = 0; ; a++) { // slot 42: peta B, kompas diputar
  reseed(63000 + a);
  bw = makeMap2(18, 22);
  if (!clearOfCompass(bw) || !okMap(bw)) continue;
  it = rotasi20(bw, K_ROT, 0, walkers[1]);
  if (it) { freshMap(bw, 2, K_ROT * 90); break; }
}
rows.push(build(42, it!, bw, 2, K_ROT * 90));
rows.sort((x, y) => x.sequence_number - y.sequence_number);
assert.deepEqual(rows.map((r) => r.sequence_number), [38, 39, 40, 41, 42]);
assert.equal(new Set(rows.map((r) => r.scoring_rule.correct_key)).size, 5, "kunci 38-42 harus tersebar A-E");
export const DENAH20_ROWS = rows;


if (require.main === module) {
  const OUT = process.argv[2] ?? ".";
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, "denah-20-proto.json"), `${JSON.stringify({ [PKG]: rows }, null, 2)}\n`);
  fs.writeFileSync(path.join(OUT, "denah-20-proto-bukti.json"), `${JSON.stringify([it38, it39, itA, it41, it].map((q) => ({ ans: q!.ans, ds: q!.ds, proof: q!.proof, spec: q!.spec })), null, 2)}\n`);

  // ---- Render PNG (G-9): HTML kecil + Chrome headless; lebar tampil 520 dan 360 (headless menolak jendela < ±500 px, jadi body dibatasi 360 px lalu dipotong) ----
  const css = (w: number) => `body{margin:0;width:${w}px;background:#fff;font-family:Arial,sans-serif;color:#111}svg{display:block;width:100%;height:auto}.t{padding:8px 10px;font-size:14px;line-height:1.45}.o{padding:2px 10px 10px;font-size:15px}p{margin:0 0 8px;white-space:pre-line}`;
  const names = { 38: "belakang", 39: "samaarah", 40: "rute", 41: "rute4", 42: "rotasi" } as Record<number, string>;
  for (const r of rows) {
    const o = r.options_payload, nm = names[r.sequence_number];
    const soal = `<div class="t"><p><i>${o.instruksi}</i></p><p><b>${o.question_text}</b></p></div>${o.svg_content}<div class="o">${o.choices.map((c) => `${c.key}. ${c.text}`).join("<br>")}</div>`;
    const pemb = `${r.pembahasan_svg}<div class="t"><p>${r.pembahasan}</p></div>`;
    for (const [file, body] of [[`proto-${nm}`, soal], [`proto-${nm}-pembahasan`, pemb]]) for (const w of [360, 520]) {
      const html = path.join(OUT, `${file}-${w}.html`), png = path.join(OUT, `${file}-${w}.png`);
      fs.writeFileSync(html, `<!doctype html><meta charset="utf-8"><style>${css(w)}</style><body>${body}</body>`);
      execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars", "--window-size=560,2400", `--screenshot=${png}`, `file://${html}`], { stdio: "ignore" });
      execFileSync("python3", ["-c", "import sys;from PIL import Image,ImageChops;i=Image.open(sys.argv[1]).convert('RGB');w=int(sys.argv[2]);i=i.crop((0,0,w,i.height));b=ImageChops.difference(i,Image.new('RGB',i.size,(255,255,255))).getbbox();i.crop((0,0,w,min(i.height,b[3]+12))).save(sys.argv[1])", png, String(w)]);
    }
  }
  console.log(`OK: pkg ${PKG} denah · kunci ${rows.map((r) => `${r.sequence_number}${r.scoring_rule.correct_key}`).join(" ")} · anti-bocor vs ${oldCores.length} peta + ${usedStems.size} stem → ${OUT}`);
}
