import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { answerFor, enDash, verticalPuzzleSvg } from "./susun-lib";

type Choice = { key: "A" | "B" | "C" | "D" | "E"; text: string };
type Item = {
  sequence_number: number;
  options_payload: {
    instruksi: string;
    question_text: null;
    sub_text: null;
    is_multi_select: false;
    svg_content: string;
    choices: Choice[];
  };
  scoring_rule: { type: "dichotomous"; correct_key: Choice["key"] };
  tingkat: 2 | 3;
  objek: string;
  pembahasan: string;
  pembahasan_svg: string;
};

type Puzzle = {
  sequence: 35 | 36 | 37;
  object: string;
  pieces: number;
  order: number[];
  correct: Choice["key"];
  choices: string[];
  scene: string;
  pembahasan: string;
};

const INSTRUCTION = "Urutkanlah potongan gambar berikut menjadi gambar yang utuh.";
const CATEGORY_INSTRUCTION = "Pilihlah satu gambar yang tidak termasuk dalam kelompoknya.";
const assert: (condition: unknown, message: string) => asserts condition = (condition, message) => {
  if (!condition) throw new Error(`Self-check gagal: ${message}`);
};

const sailingShip = `
  <path d="M10 143 C92 157 500 159 590 139 L552 176 C433 188 163 188 43 170 Z"/>
  <path d="M42 166 C174 180 430 181 553 170" fill="none" stroke="white" stroke-width="6" stroke-linecap="round"/>
  <path d="M14 140 L2 128 L63 137" fill="none" stroke="#111" stroke-width="8" stroke-linecap="round"/>
  <path d="M185 147 V60 M380 148 V16" fill="none" stroke="#111" stroke-width="11" stroke-linecap="round"/>
  <path d="M179 68 L80 144 H179 Z M76 139 L14 130 L76 109 Z"/>
  <path d="M374 27 L276 76 H374 Z M374 82 L258 144 H374 Z M386 57 L505 144 H386 Z"/>
  <path d="M380 17 V5 L421 17 L380 29 Z"/>
  <path d="M454 145 V99 H535 V145 Z M442 96 H548 V107 H442 Z"/>
  <rect x="478" y="112" width="30" height="19" fill="white"/>
  <circle cx="96" cy="158" r="6" fill="white"/><circle cx="158" cy="164" r="6" fill="white"/><circle cx="224" cy="166" r="6" fill="white"/><circle cx="291" cy="167" r="6" fill="white"/><circle cx="358" cy="167" r="6" fill="white"/><circle cx="425" cy="164" r="6" fill="white"/>
  <path d="M24 194 C50 181 76 207 102 194 S154 181 180 194 S232 207 258 194 S310 181 336 194 S388 207 414 194 S466 181 492 194 S544 207 576 193" fill="none" stroke="#111" stroke-width="7" stroke-linecap="round"/>`;

const bicycle = `
  <circle cx="105" cy="102" r="86"/><circle cx="105" cy="102" r="75" fill="white"/>
  <circle cx="495" cy="102" r="86"/><circle cx="495" cy="102" r="75" fill="white"/>
  <g fill="none" stroke="#111" stroke-width="4"><path d="M105 17 V187 M20 102 H190 M44 41 L166 163 M166 41 L44 163 M495 17 V187 M410 102 H580 M434 41 L556 163 M556 41 L434 163"/></g>
  <circle cx="105" cy="102" r="13" fill="none" stroke="#111" stroke-width="7"/><circle cx="105" cy="102" r="4"/>
  <path d="M105 102 L220 52 L292 123 Z M220 52 L418 67 L292 123 Z" fill="none" stroke="#111" stroke-width="13" stroke-linejoin="round"/>
  <path d="M105 126 H292 L276 137 H105 Z" fill="none" stroke="#111" stroke-width="7" stroke-linejoin="round"/>
  <path d="M220 52 L214 39 M191 37 H240 L248 46 H187 Z M418 67 L495 102 M418 67 L436 40 C447 29 462 31 474 35" fill="none" stroke="#111" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="455" cy="51" r="12"/><circle cx="455" cy="51" r="5" fill="white"/>
  <circle cx="292" cy="123" r="21" fill="none" stroke="#111" stroke-width="8"/><path d="M292 123 L319 140 M292 123 L265 106" fill="none" stroke="#111" stroke-width="7" stroke-linecap="round"/>`;

const steamLocomotive = `
  <path d="M10 146 V72 H150 V146 Z M52 86 H117 V123 H52 Z"/><rect x="66" y="96" width="35" height="18" fill="white"/>
  <path d="M0 59 H163 V73 H0 Z"/><path d="M145 78 H435 C453 78 465 91 465 111 V146 H145 Z"/>
  <path d="M245 78 V54 C245 44 303 44 303 54 V78 Z"/><path d="M360 78 V27 H395 V78 Z M351 27 H404 V39 H351 Z"/>
  <path d="M379 25 C358 15 368 -2 387 7 C394 -10 421 1 412 18 C432 23 424 43 404 40 C396 49 379 43 379 25 Z"/>
  <circle cx="455" cy="96" r="19"/><circle cx="455" cy="96" r="9" fill="white"/>
  <path d="M465 126 H531 L590 153 H480 Z"/><path d="M510 151 L540 119 M535 151 L565 132" fill="none" stroke="white" stroke-width="6"/>
  <path d="M0 146 H570 V165 H0 Z"/>
  <circle cx="130" cy="157" r="47"/><circle cx="130" cy="157" r="34" fill="white"/><circle cx="310" cy="157" r="50"/><circle cx="310" cy="157" r="36" fill="white"/><circle cx="490" cy="160" r="31"/><circle cx="490" cy="160" r="21" fill="white"/>
  <g fill="none" stroke="#111" stroke-width="5"><path d="M130 116 V198 M89 157 H171 M310 110 V204 M263 157 H357 M490 132 V188 M462 160 H518"/><path d="M83 151 L355 151" stroke-width="11" stroke-linecap="round"/></g>
  <path d="M165 139 H258 M358 139 H425" fill="none" stroke="white" stroke-width="6" stroke-linecap="round"/>`;

const puzzles: Puzzle[] = [
  {
    sequence: 35, object: "kapal layar", pieces: 4, order: [3, 1, 4, 2], correct: "E",
    choices: ["2 – 4 – 3 – 1", "3 – 4 – 1 – 2", "1 – 3 – 4 – 2", "2 – 1 – 4 – 3", "2 – 4 – 1 – 3"], scene: sailingShip,
    pembahasan: "Tentukan kedua ujung dulu. Potongan 2 berisi haluan runcing dengan layar jib (ujung kiri), dan potongan 3 berisi buritan dengan kabin berjendela (ujung kanan). Setelah haluan, potongan 4 memuat tiang pendek dengan layar depan, lalu potongan 1 memuat tiang tinggi dengan dua layar dan bendera. Di setiap batas, potongan layar dan deret lubang jendela lambung harus menyambung.\n\nOpsi A gugur karena buritan (potongan 3) dipasang sebelum tiang tinggi, sehingga layar putus di sambungan 4–3. Opsi B gugur karena buritan dipasang di ujung kiri. Opsi C gugur karena haluan (potongan 2) dipasang di ujung kanan. Opsi D gugur karena tiang pendek dan tiang tinggi tertukar sehingga layar terputus. Tips: cari dua potongan ujung (haluan dan buritan) lebih dulu, lalu isi bagian tengahnya. Urutan: 2 – 4 – 1 – 3. Jawaban: E.",
  },
  {
    sequence: 36, object: "sepeda", pieces: 5, order: [4, 1, 5, 2, 3], correct: "B",
    choices: ["2 – 5 – 4 – 1 – 3", "2 – 4 – 5 – 1 – 3", "3 – 1 – 5 – 4 – 2", "2 – 4 – 5 – 3 – 1", "1 – 3 – 2 – 5 – 4"], scene: bicycle,
    pembahasan: "Mulai dari roda belakang yang memiliki gir (potongan 2), lalu sadel dan rantai (potongan 4), engkol dan pedal di tengah rangka (potongan 5), tabung atas, garpu, setang, dan lampu (potongan 1), dan terakhir separuh kanan roda depan (potongan 3). Jari-jari roda dan batang rangka harus menyambung di setiap batas.\n\nOpsi A gugur karena sadel dan engkol tertukar sehingga rantai terputus. Opsi C gugur karena urutannya terbalik: separuh kanan roda depan (potongan 3) dipasang di ujung kiri. Opsi D gugur karena separuh roda depan dipasang sebelum setang, sehingga putus di sambungan 5–3. Opsi E gugur karena dimulai dari setang (potongan 1), bukan dari roda belakang. Tips: mulai dari potongan yang paling mudah dikenali (roda) lalu ikuti batang rangka yang menyambung. Urutan: 2 – 4 – 5 – 1 – 3. Jawaban: B.",
  },
  {
    sequence: 37, object: "lokomotif kereta uap", pieces: 6, order: [5, 2, 6, 1, 4, 3], correct: "C",
    choices: ["4 – 2 – 6 – 1 – 5 – 3", "3 – 1 – 5 – 6 – 2 – 4", "4 – 2 – 6 – 5 – 1 – 3", "4 – 2 – 6 – 5 – 3 – 1", "5 – 1 – 3 – 4 – 2 – 6"], scene: steamLocomotive,
    pembahasan: "Bagian belakang lokomotif adalah kabin dengan atap dan jendela (potongan 4), disusul sambungan kabin ke ketel beserta batang penggerak (potongan 2), kubah uap di atas roda penggerak (potongan 6), cerobong berasap (potongan 5), lampu depan dengan roda kecil (potongan 1), dan bajak rel di ujung depan (potongan 3). Batang penggerak dan roda harus menyambung lurus.\n\nOpsi A gugur karena cerobong dan lampu depan tertukar. Opsi B gugur karena urutannya terbalik: bajak rel (potongan 3) dipasang di ujung kiri. Opsi D gugur karena bajak rel diletakkan sebelum lampu depan. Opsi E gugur karena bajak rel berada di tengah dan langsung disambung ke kabin (sambungan 3–4 putus). Tips: tetapkan kedua ujung (kabin dan bajak rel) dulu, lalu ikuti batang penggerak yang harus lurus. Urutan: 4 – 2 – 6 – 5 – 1 – 3. Jawaban: C.",
  },
];

function buildItem(puzzle: Puzzle): Item {
  const letters: Choice["key"][] = ["A", "B", "C", "D", "E"];
  return {
    sequence_number: puzzle.sequence,
    options_payload: {
      instruksi: INSTRUCTION, question_text: null, sub_text: null, is_multi_select: false,
      svg_content: verticalPuzzleSvg(`s2q${puzzle.sequence}-`, puzzle),
      choices: letters.map((key, index) => ({ key, text: puzzle.choices[index] })),
    },
    scoring_rule: { type: "dichotomous", correct_key: puzzle.correct },
    tingkat: 2,
    objek: puzzle.object,
    pembahasan: puzzle.pembahasan,
    pembahasan_svg: solvedSvg(puzzle),
  };
}

/** pemb = gambar pembahasan: kotak hiu berbingkai hijau, celah insang dilingkari merah, label ikan/mamalia merah. */
function categorySvg(pemb = false) {
  const box = (x: number, label: string, icon: string) => `<g transform="translate(${x} 0)"><rect x="0" y="16" width="140" height="132" rx="7" fill="none" stroke="${pemb && label === "a" ? HL : "#111"}" stroke-width="${pemb && label === "a" ? 7 : 3}"/>${icon}<text x="70" y="181" fill="#111" font-family="sans-serif" font-size="24" font-weight="bold" text-anchor="middle">${label}</text>${pemb ? `<text x="70" y="216" fill="${RED}" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="bold" text-anchor="middle">${label === "a" ? "ikan" : "mamalia"}</text>` : ""}</g>`;
  const shark = `<path d="M12 88 C28 68 45 61 70 65 C87 68 99 78 108 84 L124 45 L119 84 L132 92 L119 101 L121 116 L108 99 C93 108 80 116 58 114 C36 112 23 103 12 88 Z" fill="#111"/><path d="M58 67 L72 37 L84 71 Z M65 106 L85 128 L81 104 Z" fill="#111"/><circle cx="30" cy="82" r="3" fill="white"/><path d="M40 76 V86 M45 75 V85 M50 76 V86 M55 77 V87 M60 78 V88" stroke="white" stroke-width="3" stroke-linecap="round"/>`;
  const whale = `<path d="M10 87 C13 67 28 56 51 57 C75 57 94 65 106 76 C114 73 123 69 130 62 C130 73 127 81 122 86 C128 90 132 98 131 107 C123 105 117 101 112 96 C94 108 72 115 48 114 C27 114 13 105 10 87 Z" fill="#111"/><path d="M91 65 L98 48 L104 70 Z" fill="#111"/><circle cx="27" cy="78" r="3" fill="white"/><path d="M34 94 C48 102 63 104 78 101 M37 100 C50 108 64 109 79 105 M42 106 C53 112 65 113 76 109" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"/><path d="M24 55 C19 49 20 43 25 39 M31 54 C29 48 32 44 36 41" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round"/>`;
  const orca = `<path d="M12 91 C13 76 26 67 44 65 C54 57 64 54 76 57 L73 21 L96 62 C105 66 111 73 116 80 C123 75 129 68 135 64 C134 75 131 82 127 87 C133 92 136 99 135 106 C127 104 121 100 116 95 C105 108 90 115 70 116 C47 117 25 109 14 99 C11 97 11 94 12 91 Z" fill="#111"/><path d="M53 103 C59 111 67 117 80 120 L76 103 Z" fill="#111"/><path d="M34 99 C49 108 64 110 80 108 C95 106 104 100 113 91 C108 103 96 112 80 115 C60 118 43 111 34 99 Z" fill="white"/><ellipse cx="42" cy="77" rx="13" ry="7" fill="white"/><circle cx="29" cy="78" r="3" fill="white"/>`;
  // narwal: badan paus diperkecil, tanpa sirip punggung (ciri narwal), bercak putih, gading lurus berulir dari mulut
  const narwhal = `<g transform="translate(30 14) scale(0.8)"><path d="M10 87 C13 67 28 56 51 57 C75 57 94 65 106 76 C114 73 123 69 130 62 C130 73 127 81 122 86 C128 90 132 98 131 107 C123 105 117 101 112 96 C94 108 72 115 48 114 C27 114 13 105 10 87 Z" fill="#111"/><circle cx="27" cy="78" r="3" fill="white"/><g fill="white"><circle cx="60" cy="70" r="3"/><circle cx="74" cy="68" r="2.5"/><circle cx="86" cy="74" r="3"/><circle cx="68" cy="80" r="2"/><circle cx="96" cy="82" r="2.5"/></g></g><path d="M39 83 L4 73" stroke="#111" stroke-width="4" stroke-linecap="round"/><path d="M33 79 L35 84 M26 77 L28 82 M19 75 L21 80 M12 73 L14 78" stroke="white" stroke-width="1.5"/>`;
  const dolphin = `<path d="M13 81 C19 78 25 77 32 78 C34 67 43 60 55 59 C69 58 80 62 88 69 C86 63 89 58 94 57 C98 64 98 71 94 77 C101 80 106 84 112 87 C119 84 124 79 129 75 C129 84 126 90 122 93 C126 97 130 103 130 111 C122 108 117 104 113 99 C102 102 92 102 81 99 L72 112 C69 114 66 112 67 108 L71 98 C57 100 47 98 39 93 C31 91 23 91 15 90 C11 89 10 85 13 81 Z" fill="#111"/><circle cx="38" cy="78" r="3" fill="white"/><circle cx="54" cy="65" r="3" fill="white"/>`;
  return `<svg viewBox="0 0 850 ${pemb ? 228 : 200}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="white"/>${box(20, "a", shark)}${box(187, "b", whale)}${box(354, "c", orca)}${box(521, "d", narwhal)}${box(688, "e", dolphin)}${pemb ? `<circle cx="70" cy="82" r="20" fill="none" stroke="${RED}" stroke-width="4"/>` : ""}</svg>`;
}

function categoryItem(): Item {
  const letters: Choice["key"][] = ["A", "B", "C", "D", "E"];
  return {
    sequence_number: 40,
    options_payload: {
      instruksi: CATEGORY_INSTRUCTION, question_text: null, sub_text: null, is_multi_select: false,
      svg_content: categorySvg(), choices: letters.map((key) => ({ key, text: key.toLowerCase() })),
    },
    scoring_rule: { type: "dichotomous", correct_key: "A" },
    tingkat: 2,
    objek: "hewan laut: mamalia dan ikan (hiu, paus, orca, narwal, lumba-lumba)",
    pembahasan: "Paus, orca, narwal, dan lumba-lumba adalah mamalia laut: bernapas dengan paru-paru dan menyusui anaknya, meskipun bentuknya mirip ikan (orca sering disebut paus pembunuh, dan narwal adalah paus bergading, keduanya bukan ikan). Hiu adalah ikan: bernapas dengan insang (celah insang tampak di samping kepala).\n\nOpsi b (paus) gugur karena paus bernapas lewat lubang sembur di atas kepala (semburannya tampak di gambar). Opsi c (orca) gugur karena orca termasuk keluarga lumba-lumba. Opsi d (narwal) gugur karena narwal adalah paus bergading. Opsi e (lumba-lumba) gugur karena lumba-lumba juga bernapas dengan paru-paru lewat lubang sembur. Keempatnya mamalia, jadi hanya hiu yang tidak termasuk kelompoknya. Tips: jangan tertipu bentuk badan yang mirip; cari ciri pembeda seperti celah insang. Jawaban: A.",
    pembahasan_svg: categorySvg(true),
  };
}

function wholeSvg(puzzle: Puzzle) {
  return `<svg viewBox="0 0 600 190" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="white"/><g fill="#111">${puzzle.scene}</g></svg>`;
}

const HL = "#1a7f37", RED = "#d32f2f";
/** Gambar pembahasan: objek utuh (dipotong 0–190 seperti potongan soal, svg bersarang tanpa id), garis potong
 *  bergelombang merah putus-putus (lengkung yang sama dengan stripClip), dan nomor potongan hijau sesuai urutan benar. */
function solvedSvg(puzzle: Puzzle) {
  const w = 600 / puzzle.pieces, labels = answerFor(puzzle.order);
  const cuts = Array.from({ length: puzzle.pieces - 1 }, (_, i) => { const x = (i + 1) * w;
    return `<path d="M ${x} 0 C ${x + 6} 24 ${x - 8} 47 ${x + 2} 68 C ${x + 9} 92 ${x - 6} 112 ${x + 4} 137 C ${x + 7} 156 ${x - 4} 175 ${x} 190" fill="none" stroke="${RED}" stroke-width="3" stroke-dasharray="8 6"/>`; }).join("");
  const nums = labels.map((n, i) => `<circle cx="${(i + 0.5) * w}" cy="17" r="15" fill="${HL}"/><text x="${(i + 0.5) * w}" y="24" fill="white" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="bold" text-anchor="middle">${n}</text>`).join("");
  return `<svg viewBox="0 0 600 226" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="white"/>${nums}<svg x="0" y="36" width="600" height="190" viewBox="0 0 600 190" overflow="hidden"><g fill="#111">${puzzle.scene}</g>${cuts}</svg></svg>`;
}

function check(items: Item[]) {
  const expected = [35, 36, 37, 40];
  const expectedKeys: Record<number, Choice["key"]> = { 35: "E", 36: "B", 37: "C", 40: "A" };
  assert(items.length === 4, "harus tepat empat item");
  assert(items.map((item) => item.sequence_number).join(",") === expected.join(","), "sequence_number salah");
  const allIds: string[] = [];
  items.forEach((item, index) => {
    const svg = item.options_payload.svg_content;
    const choices = item.options_payload.choices;
    assert(item.scoring_rule.correct_key === expectedKeys[item.sequence_number], `correct_key ${item.sequence_number} salah`);
    assert(!/<(?:script|image|style)\b/i.test(svg), `SVG ${item.sequence_number} memuat elemen tidak aman`);
    assert(!/(?:href|xlink:href)="(?!#)/i.test(svg), `SVG ${item.sequence_number} memakai href eksternal`);
    assert(svg.startsWith(`<svg viewBox="0 0 850 ${item.sequence_number === 40 ? 200 : 300}" xmlns="http://www.w3.org/2000/svg">`), `viewBox ${item.sequence_number} salah`);
    const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
    assert(ids.every((id) => id.startsWith(`s2q${item.sequence_number}-`)), `id SVG ${item.sequence_number} tidak berprefiks`);
    allIds.push(...ids);
    assert(/^[^\n]+\n\n[^\n]+ Tips: [^\n]+ Jawaban: [A-E]\.$/.test(item.pembahasan) && item.pembahasan.endsWith(`Jawaban: ${item.scoring_rule.correct_key}.`), `pembahasan ${item.sequence_number} harus 2 paragraf + tips + kunci`);
    assert(!/<(?:script|image|style)\b|href=|\bid="/.test(item.pembahasan_svg), `pembahasan_svg ${item.sequence_number} memakai id/elemen tidak aman`);
    if (item.sequence_number === 40) {
      assert(item.options_payload.instruksi === CATEGORY_INSTRUCTION, "instruksi kategori salah");
      assert(choices.map((choice) => choice.text).join(",") === "a,b,c,d,e", "pilihan kategori salah");
      return;
    }
    const puzzle = puzzles[index];
    const answer = enDash(answerFor(puzzle.order));
    assert(choices.length === 5 && new Set(choices.map((choice) => choice.text)).size === 5, `pilihan ${item.sequence_number} harus lima dan unik`);
    assert(choices.find((choice) => choice.key === item.scoring_rule.correct_key)?.text === answer, `kunci ${item.sequence_number} tidak cocok dengan urutan sebenarnya`);
    assert(puzzle.order.some((piece, slot) => piece !== slot + 1), `urutan ${item.sequence_number} tidak boleh identitas`);
    assert(puzzle.order.filter((piece, slot) => piece === slot + 1).length <= 1, `terlalu banyak potongan ${item.sequence_number} tetap di slotnya`);
    assert(600 / puzzle.pieces >= 100, `potongan ${item.sequence_number} terlalu sempit`);
    assert(/<clipPath[\s\S]*?<path d="[^"]*C/.test(svg), `potongan ${item.sequence_number} harus memakai kurva`);
  });
  assert(new Set(allIds).size === allIds.length, "id SVG tidak unik antar soal");
}

function preview(items: Item[]) {
  const cards = items.map((item, index) => {
    const keyText = item.options_payload.choices.find((choice) => choice.key === item.scoring_rule.correct_key)?.text;
    const choices = item.options_payload.choices.map((choice) => `${choice.key}. ${choice.text}`).join(" &nbsp; ");
    const whole = item.sequence_number === 40 ? "" : `<h3>Gambar utuh</h3><div class="whole">${wholeSvg(puzzles[index])}</div>`;
    return `<section><h2>Soal ${item.sequence_number}: ${item.objek}</h2><p class="instruction">${item.options_payload.instruksi}</p><h3>${item.sequence_number === 40 ? "Pilihan ikon hewan laut" : "Potongan acak"}</h3>${item.options_payload.svg_content}${whole}<p><strong>Kunci ${item.scoring_rule.correct_key}:</strong> ${keyText}</p><p>${choices}</p><h3>Gambar pembahasan</h3><div class="whole">${item.pembahasan_svg}</div><p>${item.pembahasan.replace("\n\n", "<br><br>")}</p></section>`;
  }).join("\n");
  return `<!doctype html><html lang="id"><meta charset="utf-8"><title>Preview Susun S2</title><style>body{font-family:Arial,sans-serif;margin:24px;color:#111}section{border:1px solid #aaa;margin:20px 0;padding:16px}h2{margin:0 0 8px}.instruction{font-weight:bold}.whole{max-width:600px}svg{display:block;max-width:100%;height:auto}p{font-size:14px;line-height:1.6}</style><body><h1>Preview Kecerdasan Paket 2 — Susun Potongan dan Ikon Kategori</h1>${cards}</body></html>`;
}

const items = [...puzzles.map(buildItem), categoryItem()];
check(items);
mkdirSync(resolve("prisma/data"), { recursive: true });
mkdirSync(resolve("output"), { recursive: true });
writeFileSync(resolve("prisma/data/kecerdasan_s2_susun.json"), `${JSON.stringify(items, null, 2)}\n`);
writeFileSync(resolve("output/susun-s2-preview.html"), preview(items));
console.log("Generated prisma/data/kecerdasan_s2_susun.json and output/susun-s2-preview.html");
