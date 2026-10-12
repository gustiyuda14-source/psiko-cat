import assert from "node:assert/strict";
import * as fs from "fs";
import * as path from "path";
import { answerFor, enDash, verticalPuzzleSvg } from "./susun-lib";

// Susun potongan gambar untuk kalibrasi Logis/Spasial 2026-10-12 (nomor 33-34):
//   pkg 13: mobil patroli (5 potong), kapal selam (4)   — menggantikan soal persegi 4 segitiga
//           Paket 1 lama yang ambigu (docs/rencana/drilling/susun-findings.md §2)
//   pkg 3:  helikopter (4), truk pemadam kebakaran (6)
//   pkg 15: motor patroli (5), ekskavator (6, tingkat 3)   — Simulasi 3
//   pkg 16: sepeda (4), mobil derek (6, tingkat 3)          — Simulasi 1 baru
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

const motorPatroli = `
  <path d="M0 184 H600" stroke="#111" stroke-width="4"/>
  <rect x="24" y="52" width="88" height="48" rx="6"/><rect x="34" y="62" width="68" height="8" fill="white"/>
  <text x="68" y="92" fill="white" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="bold" text-anchor="middle">POLISI</text>
  <path d="M40 52 L28 12" stroke="#111" stroke-width="3"/><rect x="12" y="104" width="20" height="12"/>
  <path d="M80 118 C92 92 168 92 182 118 Z"/><rect x="60" y="104" width="392" height="10"/>
  <path d="M110 100 C110 88 140 86 170 88 L262 90 C270 90 272 98 266 100 Z"/>
  <rect x="228" y="114" width="110" height="40" rx="6"/><path d="M248 120 V148 M264 120 V148 M280 120 V148 M296 120 V148 M312 120 V148" stroke="white" stroke-width="4"/>
  <path d="M262 98 C270 70 340 66 364 94 Z"/><path d="M282 86 H342" stroke="white" stroke-width="4"/>
  <path d="M168 162 H300" stroke="#111" stroke-width="9" stroke-linecap="round"/>
  <path d="M362 96 C380 72 420 66 446 80 L456 104 L362 104 Z"/>
  <path d="M404 72 L418 24 L442 28 L434 78 Z" fill="white" stroke="#111" stroke-width="4"/><rect x="416" y="10" width="30" height="11"/>
  <path d="M392 56 L422 62" stroke="#111" stroke-width="7" stroke-linecap="round"/><path d="M412 70 L480 146" stroke="#111" stroke-width="10"/>
  <circle cx="456" cy="90" r="12"/><circle cx="456" cy="90" r="6" fill="white"/>
  <path d="M446 118 C458 98 508 98 520 118 Z"/>
  <circle cx="130" cy="146" r="36"/><circle cx="130" cy="146" r="22" fill="white"/><circle cx="130" cy="146" r="8"/>
  <circle cx="480" cy="146" r="36"/><circle cx="480" cy="146" r="22" fill="white"/><circle cx="480" cy="146" r="8"/>
  <path d="M554 180 L571 124 L588 180 Z"/><path d="M561 156 H581" stroke="white" stroke-width="6"/><rect x="546" y="176" width="50" height="7"/>`;

const ekskavator = `
  <path d="M0 184 H600" stroke="#111" stroke-width="4"/><path d="M518 184 C540 150 582 148 600 166 V184 Z"/>
  <rect x="30" y="140" width="362" height="40" rx="20"/>
  <circle cx="62" cy="160" r="10" fill="white"/><circle cx="118" cy="160" r="10" fill="white"/><circle cx="174" cy="160" r="10" fill="white"/><circle cx="230" cy="160" r="10" fill="white"/><circle cx="286" cy="160" r="10" fill="white"/><circle cx="350" cy="160" r="10" fill="white"/>
  <path d="M18 128 C10 110 12 92 26 84 L112 84 L112 128 Z"/><path d="M30 96 L44 120 M50 96 L64 120 M70 96 L84 120" stroke="white" stroke-width="5"/>
  <rect x="64" y="50" width="10" height="34"/><rect x="60" y="44" width="18" height="8"/>
  <rect x="106" y="90" width="104" height="38"/><path d="M124 98 V120 M140 98 V120 M156 98 V120 M172 98 V120 M188 98 V120" stroke="white" stroke-width="5"/>
  <rect x="196" y="36" width="96" height="92" rx="6"/><path d="M210 48 H278 V96 H210 Z" fill="white"/><path d="M244 48 V96" stroke="#111" stroke-width="4"/>
  <path d="M286 100 L302 122 L470 56 L450 28 Z"/>
  <path d="M318 128 L404 84" stroke="#111" stroke-width="10"/><path d="M404 84 L432 70" stroke="#111" stroke-width="4"/>
  <circle cx="460" cy="42" r="13"/><circle cx="460" cy="42" r="5" fill="white"/>
  <path d="M460 42 L532 118" stroke="#111" stroke-width="16" stroke-linecap="round"/>
  <path d="M512 110 L556 104 C578 120 576 150 552 160 L520 154 Z"/>
  <path d="M524 156 L518 172 L534 158 Z M540 158 L536 174 L550 160 Z"/>`;

const sepeda = `
  <path d="M0 184 H600" stroke="#111" stroke-width="4"/>
  <circle cx="120" cy="130" r="50" fill="none" stroke="#111" stroke-width="8"/><circle cx="470" cy="130" r="50" fill="none" stroke="#111" stroke-width="8"/>
  <path d="M120 82 V178 M72 130 H168 M470 82 V178 M422 130 H518" stroke="#111" stroke-width="2"/>
  <circle cx="120" cy="130" r="7"/><circle cx="470" cy="130" r="7"/>
  <path d="M120 130 L270 140 L240 70 Z M240 70 L410 64 M270 140 L418 92 M410 58 L470 130" fill="none" stroke="#111" stroke-width="8" stroke-linejoin="round"/>
  <path d="M120 126 L262 128 M120 136 L262 152" stroke="#111" stroke-width="2"/>
  <circle cx="270" cy="140" r="16"/><circle cx="270" cy="140" r="6" fill="white"/><path d="M270 140 L292 168" stroke="#111" stroke-width="6"/><rect x="282" y="166" width="22" height="7"/>
  <path d="M240 70 V58" stroke="#111" stroke-width="6"/><path d="M216 52 C230 44 262 46 270 54 L262 60 L222 60 Z"/>
  <path d="M70 76 H172 M100 76 L120 126 M160 76 L120 126" stroke="#111" stroke-width="5"/><rect x="78" y="38" width="76" height="38" rx="4"/><rect x="88" y="52" width="56" height="8" fill="white"/>
  <path d="M410 64 L402 38 M384 38 H432" stroke="#111" stroke-width="7" stroke-linecap="round"/><circle cx="430" cy="27" r="6"/>
  <rect x="436" y="44" width="66" height="40" rx="3"/><path d="M450 48 V80 M464 48 V80 M478 48 V80 M492 48 V80 M440 64 H498" stroke="white" stroke-width="3"/>
  <circle cx="512" cy="70" r="8"/><path d="M520 66 L548 58 M520 74 L548 82" stroke="#111" stroke-width="2"/>`;

const mobilDerek = `
  <path d="M0 184 H600" stroke="#111" stroke-width="4"/>
  <rect x="20" y="120" width="545" height="16"/><rect x="30" y="100" width="290" height="20"/>
  <path d="M42 100 L58 120 M78 100 L94 120 M114 100 L130 120 M240 100 L256 120 M276 100 L292 120" stroke="white" stroke-width="5"/>
  <path d="M160 104 L44 40" stroke="#111" stroke-width="12" stroke-linecap="round"/><path d="M44 40 V88" stroke="#111" stroke-width="3"/>
  <path d="M44 88 V100 C44 110 58 110 58 100" fill="none" stroke="#111" stroke-width="5"/>
  <circle cx="160" cy="92" r="16"/><circle cx="160" cy="92" r="6" fill="white"/>
  <rect x="214" y="66" width="86" height="34" rx="3"/><path d="M240 60 H274" stroke="#111" stroke-width="5"/><rect x="226" y="78" width="62" height="6" fill="white"/>
  <rect x="330" y="36" width="10" height="84"/>
  <path d="M344 120 V58 C344 50 350 46 358 46 L470 46 C486 46 494 54 500 66 L520 96 L568 102 C574 104 576 108 576 114 V120 Z"/>
  <rect x="396" y="34" width="50" height="12" rx="2"/><path d="M420 36 V44" stroke="white" stroke-width="3"/>
  <path d="M364 58 H410 V92 H364 Z M424 58 H468 C476 58 482 62 486 68 L500 92 H424 Z" fill="white"/><path d="M432 104 H446" stroke="white" stroke-width="4"/>
  <rect x="508" y="62" width="8" height="20"/><path d="M548 106 V118 M558 106 V118 M568 106 V118" stroke="white" stroke-width="3"/><circle cx="571" cy="110" r="4" fill="white"/>
  <circle cx="120" cy="150" r="30"/><circle cx="120" cy="150" r="17" fill="white"/><circle cx="120" cy="150" r="7"/>
  <circle cx="230" cy="150" r="30"/><circle cx="230" cy="150" r="17" fill="white"/><circle cx="230" cy="150" r="7"/>
  <circle cx="470" cy="150" r="30"/><circle cx="470" cy="150" r="17" fill="white"/><circle cx="470" cy="150" r="7"/>`;

type Puzzle = { pkg: number; seq: number; objek: string; pieces: number; order: number[]; key: Key; scene: string; pembahasan: string; tingkat?: 2 | 3 };

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
  { pkg: 15, seq: 33, objek: "motor patroli", pieces: 5, order: [4, 1, 5, 3, 2], key: "A", scene: motorPatroli,
    pembahasan: "Ujung kiri adalah potongan dengan kotak belakang bertuliskan POLISI dan antena. Ujung kanan adalah potongan dengan setengah roda depan dan kerucut lalu lintas. Setelah kotak belakang, potongan dengan jok dan sisa roda belakang menyambung ke tangki bergaris putih dan mesin bersirip. Kaca depan dengan lampu rotator dan garpu depan berada tepat sebelum ujung kanan. Rangka bawah, jok, knalpot, dan roda harus menyambung di setiap batas." },
  { pkg: 15, seq: 34, objek: "ekskavator", pieces: 6, order: [3, 6, 1, 5, 2, 4], key: "D", scene: ekskavator, tingkat: 3,
    pembahasan: "Ujung kiri adalah pemberat belakang yang membulat dengan garis-garis putih miring dan cerobong asap. Ujung kanan adalah bucket bergigi dengan gundukan tanah. Dari kiri: pemberat, kisi-kisi mesin, kabin berjendela, silinder hidrolik dengan ujung depan rantai roda, sendi lengan dengan pin putih, lalu bucket. Rantai roda dengan roller putih, lengan, dan garis tanah harus menyambung di setiap batas; ada enam potongan, jadi periksa setiap sambungan sebelum memilih." },

  { pkg: 16, seq: 33, objek: "sepeda", pieces: 4, order: [3, 1, 4, 2], key: "B", scene: sepeda,
    pembahasan: "Ujung kiri adalah potongan dengan boncengan dan kotak bergaris putih di atas roda belakang. Ujung kanan adalah potongan dengan keranjang berkisi, lampu depan, dan separuh kanan roda depan. Potongan dengan sadel, gir, dan pedal menyambung ke sisa roda belakang; potongan dengan setang, bel, dan pipa rangka miring berada sebelum keranjang. Pipa rangka harus menyambung lurus di setiap batas." },
  { pkg: 16, seq: 34, objek: "mobil derek", pieces: 6, order: [5, 2, 6, 1, 4, 3], key: "E", scene: mobilDerek, tingkat: 3,
    pembahasan: "Ujung kiri adalah ujung lengan derek dengan tali dan pengait. Ujung kanan adalah moncong kabin dengan kisi-kisi dan lampu depan. Dari kiri: pengait, gulungan tali (drum) dengan roda belakang pertama, kotak perkakas dengan roda belakang kedua, cerobong asap tegak di belakang kabin, jendela pintu dengan lampu rotator dan roda depan, lalu moncong. Lengan derek, bak bergaris miring, sasis, dan kabin harus menyambung di setiap batas; ada enam potongan, jadi periksa setiap sambungan." },];

/** Gambar pembahasan: gambar utuh, garis potong putus-putus, nomor potongan di atas tiap bagian (tanpa id). */
function pembahasanSvg(p: Puzzle) {
  const w = 600 / p.pieces, ans = answerFor(p.order);
  const cuts = Array.from({ length: p.pieces - 1 }, (_, i) => `<path d="M${(i + 1) * w} 24 V214" stroke="#d32f2f" stroke-width="3" stroke-dasharray="8 6"/>`).join("");
  const labels = ans.map((n, i) => `<circle cx="${i * w + w / 2}" cy="14" r="13" fill="#1a7f37"/><text x="${i * w + w / 2}" y="20" fill="white" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="bold" text-anchor="middle">${n}</text>`).join("");
  return `<svg viewBox="0 -4 600 222" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="-4" width="600" height="222" fill="white"/><g transform="translate(0 26)" fill="#111">${p.scene}</g>${cuts}${labels}</svg>`;
}
/** Paragraf eliminasi: setiap opsi salah putus di sambungan pertama yang tidak bersebelahan pada urutan benar. */
function gugur(p: Puzzle, choices: string[]) {
  const ans = answerFor(p.order), next = new Map(ans.slice(0, -1).map((n, i) => [n, ans[i + 1]]));
  return choices.map((c, i) => {
    if (KEYS[i] === p.key) return "";
    const seq = c.split(" – ").map(Number), j = seq.findIndex((n, k) => k < seq.length - 1 && next.get(n) !== seq[k + 1]);
    return `Opsi ${KEYS[i].toLowerCase()} putus di sambungan ${seq[j]}–${seq[j + 1]}.`;
  }).filter(Boolean).join(" ");
}

type Row = {
  sequence_number: number;
  options_payload: { instruksi: string; question_text: null; sub_text: null; is_multi_select: false; svg_content: string; choices: { key: Key; text: string }[] };
  scoring_rule: { type: "dichotomous"; correct_key: Key };
  tingkat: 2 | 3;
  objek: string;
  pembahasan: string;
  pembahasan_svg?: string;
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
    tingkat: p.tingkat ?? 2, objek: p.objek,
    // Simulasi 3 (pkg 15) ke atas + Latihan Paket 2 (pkg 3): aturan 2 paragraf + gambar pembahasan. Pkg 13 tidak diubah.
    ...(p.pkg >= 15 || p.pkg === 3
      ? { pembahasan: `${p.pembahasan}\n\n${gugur(p, choices)} Urutan: ${ans}. Jawaban: ${p.key.toLowerCase()}.`, pembahasan_svg: pembahasanSvg(p) }
      : { pembahasan: `${p.pembahasan} Urutan: ${ans}. Jawaban: ${p.key.toLowerCase()}.` }),
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
  puzzles.map((p, i) => { const r = out[p.pkg].find((x) => x.sequence_number === p.seq)!; return `<section><h3>pkg ${p.pkg} · soal ${p.seq} · ${p.objek} · kunci ${p.key} (${enDash(answerFor(p.order))})</h3>${r.options_payload.svg_content}<h4>Gambar utuh</h4>${r.pembahasan_svg ?? whole(puzzles[i].scene)}<p>${r.options_payload.choices.map((c) => `${c.key}. ${c.text}`).join(" · ")}</p><p>${r.pembahasan}</p></section>`; }).join("") +
  `</body></html>`);
console.log(`OK: ${puzzles.length} soal susun → prisma/data/kecerdasan_susun_kal.json`);
