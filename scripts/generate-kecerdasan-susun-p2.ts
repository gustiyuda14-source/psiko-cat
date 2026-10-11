import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

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
  objek: string;
};

type Puzzle = {
  sequence: number;
  object: string;
  pieces: number;
  order: number[];
  correct: Choice["key"];
  choices: string[];
  scene: string;
  clips: string[];
  positions: { x: number; y: number }[];
  labelY: number;
  instruction?: string;
  sceneWidth?: number;
  cuts?: number[];
};

const INSTRUCTION = "Urutkanlah potongan gambar berikut menjadi gambar yang utuh.";
const RADIAL_INSTRUCTION = "Urutkanlah potongan gambar berikut menjadi gambar yang utuh (mulai dari kanan atas, searah jarum jam).";
const enDash = (parts: number[]) => parts.join(" – ");
const answerFor = (order: number[]) => Array.from({ length: order.length }, (_, sourceIndex) => order.indexOf(sourceIndex + 1) + 1);
const assert: (condition: unknown, message: string) => asserts condition = (condition, message) => {
  if (!condition) throw new Error(`Self-check gagal: ${message}`);
};

// The 3px separation is deliberate: it makes each organic cut readable without
// creating detached fragments. The complete drawing itself is rendered uncut.
function stripClip(prefix: string, index: number, left: number, right: number, height: number, last: boolean, gap = 1.5) {
  const l = left + (index === 0 ? 0 : gap);
  const r = right - (last ? 0 : gap);
  return `<clipPath id="${prefix}clip${index + 1}"><path d="M ${l} 0 H ${r}
    C ${r + 6} 24 ${r - 8} 47 ${r + 2} 68 C ${r + 9} 92 ${r - 6} 112 ${r + 4} 137 C ${r + 7} 156 ${r - 4} 175 ${r} ${height}
    H ${l} C ${l - 4} 175 ${l + 7} 156 ${l + 4} 137 C ${l - 6} 112 ${l + 9} 92 ${l + 2} 68 C ${l - 8} 47 ${l + 6} 24 ${l} 0 Z"/></clipPath>`;
}

function verticalPuzzleSvg(puzzle: Puzzle) {
  const prefix = `s2q${puzzle.sequence}-`;
  const sourceWidth = puzzle.sceneWidth ?? 600;
  const cuts = puzzle.cuts ?? Array.from({ length: puzzle.pieces + 1 }, (_, index) => index * sourceWidth / puzzle.pieces);
  const clips = Array.from({ length: puzzle.pieces }, (_, index) => stripClip(prefix, index, cuts[index], cuts[index + 1], 190, index === puzzle.pieces - 1));
  const pieces = puzzle.order.map((sourcePiece, slot) => {
    const sourceIndex = sourcePiece - 1;
    const { x, y } = puzzle.positions[slot];
    const origin = cuts[sourceIndex];
    const pieceWidth = cuts[sourceIndex + 1] - origin;
    return `<g transform="translate(${x - origin} ${y})" clip-path="url(#${prefix}clip${sourcePiece})"><use href="#${prefix}scene"/></g>` +
      `<text x="${x + pieceWidth / 2}" y="${puzzle.labelY}" fill="#111" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="middle">${slot + 1}</text>`;
  }).join("");
  return `<svg viewBox="0 0 850 300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="white"/><defs>${clips.join("")}<g id="${prefix}scene" fill="#111">${puzzle.scene}</g></defs>${pieces}</svg>`;
}

function radialPuzzleSvg(puzzle: Puzzle) {
  const prefix = `s2q${puzzle.sequence}-`;
  const clips = [
    "M 100 100 C 103 77 97 52 101 0 H 200 V 100 C 177 97 155 103 132 98 C 118 94 110 105 100 100 Z",
    "M 100 100 C 123 103 151 97 200 101 V 190 H 100 C 103 166 97 143 102 121 C 105 110 95 106 100 100 Z",
    "M 100 100 C 97 123 103 151 99 190 H 0 V 100 C 24 103 48 97 69 102 C 82 105 91 95 100 100 Z",
    "M 100 100 C 77 97 52 103 0 99 V 0 H 100 C 97 24 103 48 98 69 C 95 82 105 91 100 100 Z",
  ].map((d, index) => `<clipPath id="${prefix}clip${index + 1}"><path d="${d}"/></clipPath>`);
  const pieces = puzzle.order.map((sourcePiece, slot) => {
    const { x, y } = puzzle.positions[slot];
    return `<g transform="translate(${x} ${y})" clip-path="url(#${prefix}clip${sourcePiece})"><use href="#${prefix}scene"/></g>` +
      `<text x="${x + 100}" y="${puzzle.labelY}" fill="#111" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="middle">${slot + 1}</text>`;
  }).join("");
  return `<svg viewBox="0 0 850 300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="white"/><defs>${clips.join("")}<g id="${prefix}scene" fill="#111">${puzzle.scene}</g></defs>${pieces}</svg>`;
}

const eagle = `
  <path d="M268 111 C235 93 213 76 193 55 C178 39 162 28 145 20 C153 39 155 56 151 70 C132 51 112 39 91 35 C104 55 108 71 105 86 C83 71 62 66 41 69 C59 86 70 101 73 115 C51 108 30 112 15 123 C38 137 63 146 92 154 C67 162 47 174 33 187 C74 181 120 169 166 151 C203 137 236 124 268 111 Z"/>
  <path d="M332 111 C365 93 387 76 407 55 C422 39 438 28 455 20 C447 39 445 56 449 70 C468 51 488 39 509 35 C496 55 492 71 495 86 C517 71 538 66 559 69 C541 86 530 101 527 115 C549 108 570 112 585 123 C562 137 537 146 508 154 C533 162 553 174 567 187 C526 181 480 169 434 151 C397 137 364 124 332 111 Z"/>
  <path d="M258 94 C245 112 247 148 263 165 C272 175 284 180 300 180 C316 180 328 175 337 165 C353 148 355 112 342 94 C334 82 323 77 300 77 C277 77 266 82 258 94 Z"/>
  <path d="M274 76 C274 56 285 42 300 42 C316 42 327 56 327 76 C327 88 319 96 300 98 C282 96 274 88 274 76 Z"/>
  <path d="M322 68 C338 67 349 73 359 81 C346 89 336 91 323 87 Z"/>
  <path d="M278 165 C272 177 269 185 272 190 C280 185 287 181 294 176 C300 184 307 189 316 191 C315 181 312 173 307 164 Z"/>
  <path d="M284 178 L278 190 M316 178 L322 190" fill="none" stroke="#111" stroke-width="4" stroke-linecap="round"/>
  <circle cx="310" cy="67" r="3.5" fill="white"/>`;

const plateCutlery = `
  <circle cx="100" cy="95" r="84"/>
  <circle cx="100" cy="95" r="70" fill="white"/>
  <circle cx="100" cy="95" r="58" fill="none" stroke="#111" stroke-width="4"/>
  <path d="M53 151 C57 155 63 157 68 153 L136 70 C140 65 138 58 133 55 C128 52 122 54 119 59 L51 142 C48 146 49 149 53 151 Z"/>
  <path d="M130 42 C138 28 158 31 160 48 C162 65 151 81 139 89 L126 75 C132 65 128 53 130 42 Z"/>
  <path d="M122 82 L136 94 L83 159 C79 164 71 165 67 161 C63 157 63 151 67 146 Z"/>
  <path d="M55 48 L62 44 L84 70 L80 74 Z M68 38 L75 35 L95 65 L91 69 Z M83 34 L90 33 L107 62 L103 66 Z M98 36 L105 39 L119 66 L115 70 Z"/>`;

const airplane = `
  <path d="M31 99 C51 87 78 83 110 84 L191 86 C218 87 239 78 260 62 L291 28 C298 22 308 19 323 20 L306 72 C304 77 309 81 318 82 L438 85 C454 85 467 81 481 71 L517 46 C525 41 537 39 549 42 L530 88 C543 91 556 95 570 100 C556 105 543 109 530 112 L549 158 C537 161 525 159 517 154 L481 129 C467 119 454 115 438 115 L318 118 C309 119 304 123 306 128 L323 180 C308 181 298 178 291 172 L260 138 C239 122 218 113 191 114 L110 116 C78 117 51 113 31 101 Z"/>
  <path d="M253 84 C271 86 287 89 299 94 L275 101 L247 99 Z"/>
  <path d="M253 116 C271 114 287 111 299 106 L275 99 L247 101 Z"/>
  <path d="M421 114 C440 119 455 130 464 145 L436 144 L404 116 Z"/>
  <path d="M421 86 C440 81 455 70 464 55 L436 56 L404 84 Z"/>
  <g fill="white"><rect x="337" y="91" width="13" height="7" rx="3"/><rect x="358" y="91" width="13" height="7" rx="3"/><rect x="379" y="91" width="13" height="7" rx="3"/><rect x="400" y="91" width="13" height="7" rx="3"/><rect x="421" y="91" width="13" height="7" rx="3"/><rect x="442" y="91" width="13" height="7" rx="3"/></g>`;

const teapot = `
  <path d="M153 79 C115 49 61 55 42 91 C26 121 45 159 88 166 C112 170 132 161 149 145 Z"/>
  <path d="M137 89 C111 72 78 78 66 101 C55 123 70 143 95 145 C112 146 124 137 137 124 Z" fill="white"/>
  <path d="M346 95 C382 88 394 62 421 45 C439 34 458 25 476 17 C466 38 466 57 478 70 C453 69 436 79 420 97 C401 119 379 132 358 136 Z"/>
  <path d="M139 95 C142 67 166 51 207 49 H289 C330 51 355 68 361 99 L365 145 C365 166 347 177 324 179 H175 C151 177 134 164 135 143 Z"/>
  <path d="M190 51 C198 32 220 23 250 23 C280 23 302 32 310 51 Z"/>
  <circle cx="250" cy="18" r="10"/>
  <path d="M154 121 C205 131 295 131 348 120" fill="none" stroke="white" stroke-width="7"/>
  <path d="M178 177 H326 V188 H178 Z"/>`;

const verticalPositions = (count: number) => Array.from({ length: count }, (_, i) => ({
  x: count === 6 ? 18 + i * 138 : count === 5 ? 30 + i * 160 : 50 + i * 200,
  y: 22,
}));

const puzzles: Puzzle[] = [
  {
    sequence: 29, object: "elang", pieces: 4, order: [3, 1, 4, 2], correct: "A",
    choices: ["2 – 4 – 1 – 3", "2 – 1 – 4 – 3", "3 – 1 – 4 – 2", "4 – 2 – 1 – 3", "3 – 4 – 1 – 2"],
    scene: eagle, clips: [], positions: [{ x: 18, y: 22 }, { x: 118, y: 22 }, { x: 310, y: 22 }, { x: 430, y: 22 }], labelY: 245,
    cuts: [0, 170, 430, 510, 600],
  },
  {
    sequence: 30, object: "piring berisi sendok dan garpu", pieces: 4, order: [2, 4, 1, 3], correct: "C",
    choices: ["3 – 4 – 1 – 2", "2 – 4 – 1 – 3", "3 – 1 – 4 – 2", "2 – 1 – 4 – 3", "4 – 1 – 3 – 2"],
    scene: plateCutlery, clips: [], positions: [{ x: 12, y: 30 }, { x: 223, y: 20 }, { x: 434, y: 36 }, { x: 645, y: 24 }], labelY: 245,
    instruction: RADIAL_INSTRUCTION,
  },
  {
    sequence: 34, object: "pesawat", pieces: 6, order: [5, 2, 6, 1, 4, 3], correct: "D",
    choices: ["4 – 2 – 6 – 1 – 5 – 3", "3 – 1 – 5 – 6 – 2 – 4", "4 – 2 – 6 – 5 – 3 – 1", "4 – 2 – 6 – 5 – 1 – 3", "5 – 1 – 3 – 4 – 2 – 6"],
    scene: airplane, clips: [], positions: verticalPositions(6), labelY: 245,
  },
  {
    sequence: 37, object: "teko", pieces: 5, order: [4, 2, 5, 1, 3], correct: "B",
    choices: ["4 – 5 – 2 – 1 – 3", "4 – 2 – 5 – 1 – 3", "3 – 1 – 5 – 2 – 4", "4 – 2 – 5 – 3 – 1", "1 – 3 – 4 – 2 – 5"],
    scene: teapot, clips: [], positions: verticalPositions(5), labelY: 245, sceneWidth: 500,
  },
];

function buildItem(puzzle: Puzzle): Item {
  const letters: Choice["key"][] = ["A", "B", "C", "D", "E"];
  const svg = puzzle.sequence === 30 ? radialPuzzleSvg(puzzle) : verticalPuzzleSvg(puzzle);
  return {
    sequence_number: puzzle.sequence,
    options_payload: {
      instruksi: puzzle.instruction ?? INSTRUCTION, question_text: null, sub_text: null, is_multi_select: false,
      svg_content: svg,
      choices: letters.map((key, index) => ({ key, text: puzzle.choices[index] })),
    },
    scoring_rule: { type: "dichotomous", correct_key: puzzle.correct },
    objek: puzzle.object,
  };
}

function wholeSvg(puzzle: Puzzle) {
  return `<svg viewBox="0 0 600 190" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="white"/><g fill="#111">${puzzle.scene}</g></svg>`;
}

function check(items: Item[]) {
  const expected = [29, 30, 34, 37];
  const expectedKeys: Record<number, Choice["key"]> = { 29: "A", 30: "C", 34: "D", 37: "B" };
  assert(items.length === 4, "harus tepat empat item");
  assert(items.map((item) => item.sequence_number).join(",") === expected.join(","), "sequence_number salah");
  const allIds: string[] = [];
  items.forEach((item, index) => {
    const choices = item.options_payload.choices;
    const answer = enDash(answerFor(puzzles[index].order));
    assert(choices.length === 5 && new Set(choices.map((choice) => choice.text)).size === 5, `pilihan ${item.sequence_number} harus lima dan unik`);
    assert(item.scoring_rule.correct_key === expectedKeys[item.sequence_number], `correct_key ${item.sequence_number} salah`);
    assert(choices.find((choice) => choice.key === item.scoring_rule.correct_key)?.text === answer, `kunci ${item.sequence_number} tidak cocok dengan urutan sebenarnya`);
    assert(item.sequence_number !== 30 || item.options_payload.instruksi === RADIAL_INSTRUCTION, "instruksi radial soal 30 salah");
    assert(!/<script\b/i.test(item.options_payload.svg_content), `SVG ${item.sequence_number} memuat script`);
    assert(item.options_payload.svg_content.startsWith('<svg viewBox="0 0 850 300" xmlns="http://www.w3.org/2000/svg">'), `viewBox ${item.sequence_number} salah`);
    assert(!/<(?:image|script)\b|(?:href|xlink:href)="(?!#)/i.test(item.options_payload.svg_content), `SVG ${item.sequence_number} tidak inline-aman`);
    assert(/<clipPath[\s\S]*?<path d="[^"]*C/.test(item.options_payload.svg_content), `potongan ${item.sequence_number} harus memakai kurva`);
    assert(item.sequence_number === 30 || (puzzles[index].sceneWidth ?? 600) / puzzles[index].pieces >= 100, `potongan ${item.sequence_number} terlalu sempit`);
    allIds.push(...[...item.options_payload.svg_content.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
  });
  assert(new Set(allIds).size === allIds.length, "id SVG tidak unik antar soal");
}

function preview(items: Item[]) {
  const cards = items.map((item, index) => {
    const choiceText = item.options_payload.choices.map((choice) => `${choice.key}. ${choice.text}`).join(" &nbsp; ");
    return `<section><h2>Soal ${item.sequence_number}: ${item.objek}</h2><p class="instruction">${item.options_payload.instruksi}</p><h3>Potongan acak</h3>${item.options_payload.svg_content}<h3>Gambar utuh</h3><div class="whole">${wholeSvg(puzzles[index])}</div><p><strong>Kunci ${item.scoring_rule.correct_key}:</strong> ${item.options_payload.choices.find((choice) => choice.key === item.scoring_rule.correct_key)?.text}</p><p>${choiceText}</p></section>`;
  }).join("\n");
  return `<!doctype html><html lang="id"><meta charset="utf-8"><title>Preview Susun P2</title><style>body{font-family:Arial,sans-serif;margin:24px;color:#111}section{border:1px solid #aaa;margin:20px 0;padding:16px}h2{margin:0 0 8px}.instruction{font-weight:bold}.whole{max-width:600px}svg{display:block;max-width:100%;height:auto}p{font-size:14px;line-height:1.6}</style><body><h1>Preview Kecerdasan Paket 2 — Menyusun Potongan Gambar</h1>${cards}</body></html>`;
}

const items = puzzles.map(buildItem);
check(items);
mkdirSync(resolve("prisma/data"), { recursive: true });
mkdirSync(resolve("output"), { recursive: true });
writeFileSync(resolve("prisma/data/kecerdasan_p2_susun.json"), `${JSON.stringify(items, null, 2)}\n`);
writeFileSync(resolve("output/susun-p2-preview.html"), preview(items));
console.log("Generated prisma/data/kecerdasan_p2_susun.json and output/susun-p2-preview.html");
