import assert from "node:assert/strict";
import * as fs from "fs";
import * as path from "path";
import { answerFor, enDash, verticalPuzzleSvg } from "./susun-lib";

// Susun potongan gambar untuk kalibrasi Logis/Spasial 2026-10-12 (nomor 33-34):
//   pkg 13: mobil patroli (5 potong), kapal selam (4)   — menggantikan soal persegi 4 segitiga
//           Paket 1 lama yang ambigu (docs/rencana/drilling/susun-findings.md §2)
//   pkg 3:  helikopter (4), truk pemadam kebakaran (6)
// Siluet 600×190 sendiri; setiap potongan memuat ciri unik dan setiap batas potong dilintasi
// garis/massa yang harus menyambung. Kunci dihitung dari `order`, pengecoh = permutasi sah.
//   npx tsx scripts/generate-kecerdasan-susun-kal.ts
// Output: prisma/data/kecerdasan_susun_kal.json ({ [pkg]: Row[] }) + output/susun-kal-preview.html

const INSTRUKSI = "Urutkanlah potongan gambar berikut menjadi gambar yang utuh.";
const KEYS = ["A", "B", "C", "D", "E"] as const;
type Key = (typeof KEYS)[number];

const patrolCar = `
  <path d="M20 122 C20 102 40 94 70 92 L170 88 L232 46 C242 38 254 36 266 36 L400 36 C418 36 430 42 440 52 L482 88 L545 94 C568 97 580 108 580 124 L580 140 C580 146 576 150 570 150 L30 150 C24 150 20 146 20 140 Z"/>
  <path d="M244 84 L270 50 L330 50 L330 84 Z M346 50 L398 50 C410 50 418 55 425 62 L452 84 L346 84 Z" fill="white"/>
  <rect x="296" y="22" width="76" height="14" rx="3"/><rect x="333" y="24" width="3" height="10" fill="white"/>
  <path d="M338 50 V146" stroke="white" stroke-width="4"/>
  <text x="338" y="126" fill="white" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="bold" text-anchor="middle">POLISI</text>
  <rect x="24" y="102" width="16" height="12" fill="white"/><path d="M556 104 L576 108 L576 118 L556 116 Z" fill="white"/>
  <path d="M232 120 H262 M408 120 H438" stroke="white" stroke-width="5" stroke-linecap="round"/>
  <circle cx="130" cy="150" r="34"/><circle cx="130" cy="150" r="20" fill="white"/><circle cx="130" cy="150" r="8"/>
  <circle cx="470" cy="150" r="34"/><circle cx="470" cy="150" r="20" fill="white"/><circle cx="470" cy="150" r="8"/>
  <path d="M0 186 H600" stroke="#111" stroke-width="4"/>`;

const submarine = `
  <path d="M8 22 C40 10 70 34 100 22 S160 10 190 22 S250 34 280 22 S340 10 370 22 S430 34 460 22 S520 10 550 22 S590 30 600 24" fill="none" stroke="#111" stroke-width="4"/>
  <path d="M34 120 C34 92 92 80 162 80 L468 80 C530 80 576 98 576 120 C576 142 530 160 468 160 L162 160 C92 160 34 150 34 120 Z"/>
  <path d="M44 120 L8 88 L22 120 L8 152 Z"/><path d="M14 104 V136" stroke="white" stroke-width="3"/>
  <path d="M330 80 L346 44 L424 44 L436 80 Z"/><path d="M402 44 V12 H426 V22 H412 V44" fill="none" stroke="#111" stroke-width="6" stroke-linejoin="round"/>
  <path d="M120 112 H548" stroke="white" stroke-width="4" stroke-linecap="round"/>
  <circle cx="214" cy="132" r="9" fill="white"/><circle cx="262" cy="132" r="6" fill="white"/><circle cx="486" cy="132" r="11" fill="white"/>
  <path d="M352 56 H416" stroke="white" stroke-width="4"/>
  <circle cx="74" cy="66" r="7" fill="none" stroke="#111" stroke-width="3"/><circle cx="92" cy="50" r="5" fill="none" stroke="#111" stroke-width="3"/><circle cx="110" cy="40" r="4" fill="none" stroke="#111" stroke-width="3"/>
  <path d="M500 182 C520 172 540 192 560 182 M440 186 C455 178 470 194 485 186" fill="none" stroke="#111" stroke-width="3"/>`;

const helicopter = `
  <path d="M150 40 H590" stroke="#111" stroke-width="9" stroke-linecap="round"/><rect x="394" y="34" width="14" height="38"/>
  <path d="M60 92 L312 100 L312 122 L60 106 Z"/><path d="M38 58 L70 58 L82 104 L52 106 Z"/>
  <circle cx="56" cy="74" r="24" fill="none" stroke="#111" stroke-width="5"/><path d="M56 50 V98 M32 74 H80" stroke="#111" stroke-width="3"/>
  <path d="M330 70 C402 66 472 80 502 110 C514 124 507 142 487 146 L330 146 C312 146 300 134 300 116 L300 100 C300 84 312 72 330 70 Z"/>
  <path d="M440 82 C470 88 492 104 498 118 L440 118 Z" fill="white"/><rect x="346" y="84" width="34" height="26" rx="4" fill="white"/>
  <text x="402" y="138" fill="white" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="bold" text-anchor="middle">POLRI</text>
  <path d="M352 146 L346 172 M472 146 L478 172" stroke="#111" stroke-width="6"/>
  <path d="M300 172 H526 C540 172 546 164 552 156" fill="none" stroke="#111" stroke-width="7" stroke-linecap="round"/>
  <path d="M180 120 L190 136 M220 116 L232 132" stroke="#111" stroke-width="3"/>`;

const fireTruck = `
  <rect x="20" y="62" width="384" height="80"/>
  <path d="M400 142 V72 C400 63 406 57 414 57 L500 57 C512 57 520 61 526 69 L561 110 C569 112 576 118 576 128 V142 Z"/>
  <path d="M470 67 L506 67 C512 67 516 70 520 75 L546 106 L470 106 Z" fill="white"/><rect x="420" y="68" width="38" height="38" fill="white"/>
  <rect x="440" y="44" width="34" height="13"/><rect x="455" y="46" width="3" height="9" fill="white"/>
  <path d="M34 40 H430 M34 54 H430" stroke="#111" stroke-width="5"/><path d="M58 40 V54 M96 40 V54 M150 40 V54 M222 40 V54 M276 40 V54 M352 40 V54 M398 40 V54" stroke="#111" stroke-width="4"/>
  <circle cx="132" cy="100" r="27" fill="white"/><circle cx="132" cy="100" r="17"/><circle cx="132" cy="100" r="6" fill="white"/>
  <rect x="182" y="72" width="80" height="40" fill="white"/><rect x="284" y="72" width="44" height="40" fill="white"/><path d="M364 72 L384 92 L364 112 L344 92 Z" fill="white"/>
  <path d="M30 74 H46 M30 90 H46 M30 106 H46" stroke="white" stroke-width="4"/>
  <path d="M222 72 V112 M306 92 H306" stroke="#111" stroke-width="3"/>
  <path d="M20 124 H576" stroke="white" stroke-width="5"/><path d="M562 116 L576 118 L576 130 L562 128 Z" fill="white"/>
  <circle cx="110" cy="150" r="30"/><circle cx="110" cy="150" r="17" fill="white"/><circle cx="110" cy="150" r="7"/>
  <circle cx="300" cy="150" r="30"/><circle cx="300" cy="150" r="17" fill="white"/><circle cx="300" cy="150" r="7"/>
  <circle cx="490" cy="150" r="30"/><circle cx="490" cy="150" r="17" fill="white"/><circle cx="490" cy="150" r="7"/>
  <path d="M0 184 H600" stroke="#111" stroke-width="4"/>`;

type Puzzle = { pkg: number; seq: number; objek: string; pieces: number; order: number[]; key: Key; scene: string; pembahasan: string };

/** Pengecoh: tukar dua potongan bersebelahan, geser siklis, tukar ujung, dan pindah satu potongan. */
function choicesFor(order: number[], key: Key): string[] {
  const ans = answerFor(order), n = ans.length;
  const swap = (a: number[], i: number, j: number) => { const b = [...a]; [b[i], b[j]] = [b[j], b[i]]; return b; };
  const cands = [swap(ans, 1, 2), [...ans.slice(1), ans[0]], swap(ans, 0, n - 1), swap(ans, n - 3, n - 2), [ans[0], ...ans.slice(2), ans[1]], swap(ans, 0, 1)];
  const ds: string[] = [];
  for (const c of cands) { const t = enDash(c); if (t !== enDash(ans) && !ds.includes(t) && ds.length < 4) ds.push(t); }
  assert.equal(ds.length, 4);
  ds.splice(KEYS.indexOf(key), 0, enDash(ans));
  return ds;
}

const puzzles: Puzzle[] = [
  { pkg: 13, seq: 33, objek: "mobil patroli polisi", pieces: 5, order: [3, 5, 1, 4, 2], key: "B", scene: patrolCar,
    pembahasan: "Cari kedua ujung dulu. Potongan dengan bemper belakang dan lampu belakang putih adalah ujung kiri, dan potongan dengan kap mesin serta lampu depan adalah ujung kanan. Setelah bemper belakang, potongan berisi sisa roda belakang menyambung ke kaca belakang. Potongan dengan lampu sirene di atap dan tulisan POLISI berada di tengah, disusul kaca depan dan roda depan. Badan mobil, garis pintu, dan garis jalan harus menyambung di setiap batas." },
  { pkg: 13, seq: 34, objek: "kapal selam", pieces: 4, order: [2, 4, 1, 3], key: "E", scene: submarine,
    pembahasan: "Ujung kiri adalah potongan dengan baling-baling ekor dan gelembung udara. Ujung kanan adalah haluan yang membulat dengan jendela bulat paling besar. Di antaranya, potongan dengan dua jendela kecil (besar lalu kecil) datang lebih dulu, lalu potongan menara dengan periskop. Garis putih di badan kapal dan garis permukaan air harus menyambung di setiap batas." },
  { pkg: 3, seq: 33, objek: "helikopter", pieces: 4, order: [4, 1, 3, 2], key: "C", scene: helicopter,
    pembahasan: "Ujung kiri adalah potongan dengan baling-baling ekor bundar dan sirip ekor. Ujung kanan adalah moncong kabin dengan kaca depan dan ujung landasan yang melengkung ke atas. Di antaranya, potongan batang ekor dengan baling-baling utama datang lebih dulu, lalu potongan kabin bertuliskan POLRI dengan tiang baling-baling. Batang ekor harus menyambung ke kabin dan baling-baling utama harus satu garis lurus." },
  { pkg: 3, seq: 34, objek: "truk pemadam kebakaran", pieces: 6, order: [4, 6, 2, 5, 1, 3], key: "E", scene: fireTruck,
    pembahasan: "Ujung kiri adalah bagian belakang truk dengan ujung tangga. Ujung kanan adalah moncong kabin dengan lampu depan. Urutan dari kiri: belakang truk dengan anak tangga putih dan roda belakang, gulungan selang, pintu lebar, pintu kecil dan lambang belah ketupat di atas roda tengah, kabin belakang dengan lampu sirene, lalu moncong kabin. Tangga di atap, garis putih di badan, dan garis jalan harus lurus menyambung di setiap batas." },
];

type Row = {
  sequence_number: number;
  options_payload: { instruksi: string; question_text: null; sub_text: null; is_multi_select: false; svg_content: string; choices: { key: Key; text: string }[] };
  scoring_rule: { type: "dichotomous"; correct_key: Key };
  tingkat: 2;
  objek: string;
  pembahasan: string;
};
const out: Record<number, Row[]> = {};
for (const p of puzzles) {
  const ans = enDash(answerFor(p.order));
  assert.equal(p.order.length, p.pieces);
  assert.deepEqual([...p.order].sort(), Array.from({ length: p.pieces }, (_, i) => i + 1), `${p.objek}: order bukan permutasi`);
  assert.ok(p.order.filter((x, i) => x === i + 1).length <= 1, `${p.objek}: terlalu banyak potongan tetap`);
  const choices = choicesFor(p.order, p.key);
  assert.equal(new Set(choices).size, 5);
  for (const c of choices) assert.deepEqual(c.split(" – ").map(Number).sort(), Array.from({ length: p.pieces }, (_, i) => i + 1), `${p.objek}: opsi ${c} bukan permutasi`);
  const svg = verticalPuzzleSvg(`kal${p.pkg}q${p.seq}-`, p);
  assert.ok(!/<(?:script|image|style)\b|href="(?!#)/.test(svg), `${p.objek}: SVG tidak aman`);
  (out[p.pkg] ??= []).push({
    sequence_number: p.seq,
    options_payload: { instruksi: INSTRUKSI, question_text: null, sub_text: null, is_multi_select: false, svg_content: svg, choices: KEYS.map((key, i) => ({ key, text: choices[i] })) },
    scoring_rule: { type: "dichotomous", correct_key: p.key },
    tingkat: 2, objek: p.objek,
    pembahasan: `${p.pembahasan} Urutan: ${ans}. Jawaban: ${p.key.toLowerCase()}.`,
  });
}
const ids = Object.values(out).flat().flatMap((r) => [...r.options_payload.svg_content.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
assert.equal(new Set(ids).size, ids.length, "id SVG tidak unik");

const root = path.join(__dirname, "..");
fs.writeFileSync(path.join(root, "prisma/data/kecerdasan_susun_kal.json"), `${JSON.stringify(out, null, 2)}\n`);
fs.mkdirSync(path.join(root, "output"), { recursive: true });
const whole = (scene: string) => `<svg viewBox="0 0 600 190" xmlns="http://www.w3.org/2000/svg" style="max-width:600px"><rect width="100%" height="100%" fill="white"/><g fill="#111">${scene}</g></svg>`;
fs.writeFileSync(path.join(root, "output/susun-kal-preview.html"),
  `<!doctype html><html lang="id"><meta charset="utf-8"><title>Preview Susun Kalibrasi</title><style>body{font-family:Arial,sans-serif;margin:24px;color:#111;max-width:900px}section{border:1px solid #aaa;margin:16px 0;padding:12px}svg{display:block;max-width:100%;height:auto}p{font-size:13px}</style><body>` +
  puzzles.map((p, i) => { const r = out[p.pkg].find((x) => x.sequence_number === p.seq)!; return `<section><h3>pkg ${p.pkg} · soal ${p.seq} · ${p.objek} · kunci ${p.key} (${enDash(answerFor(p.order))})</h3>${r.options_payload.svg_content}<h4>Gambar utuh</h4>${whole(puzzles[i].scene)}<p>${r.options_payload.choices.map((c) => `${c.key}. ${c.text}`).join(" · ")}</p><p>${r.pembahasan}</p></section>`; }).join("") +
  `</body></html>`);
console.log(`OK: ${puzzles.length} soal susun → prisma/data/kecerdasan_susun_kal.json`);
