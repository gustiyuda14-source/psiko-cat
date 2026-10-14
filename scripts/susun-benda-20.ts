// Adegan susun untuk pkg 20 (Simulasi 5, nomor 33-34). Butir 33 = kapal kontainer (prototipe).
// Gaya sama dengan susun-benda-19.ts: kanvas 600×190, isi hitam (#111) dengan detail putih, abu (#b0b0b0) hanya untuk kontainer.
// Sengaja KEMBAR: tumpukan kontainer simetris cermin, dua derek berlawanan arah, dan tanda sarat buritan/haluan saling
// bercermin, sehingga potongan-potongan saling mirip. Pembeda tetap ada: menara anjungan hanya di kiri, haluan hanya di kanan,
// tinggi tumpukan tidak simetris, dan tiap potongan memuat penanda unik (lihat CIRI di generate-kecerdasan-susun-20.ts).
const DECK = 134, COL_X0 = 122, COL_W = 30, COL_PITCH = 33, TIER_H = 21, TIER_PITCH = 23;
const TIERS = [2, 3, 4, 4, 5, 5, 4, 5, 5, 4, 4, 3, 3];

/** Satu kontainer; `mirror` membalik arah penguat diagonal dan sisi pintu (kolom di separuh kanan kapal). */
function box(x: number, y: number, style: number, mirror: boolean) {
  const w = COL_W, h = TIER_H, ribs = (c: string, sw: number) => [7, 13, 19, 25].map((dx) => `<path d="M${x + dx} ${y + 3} V${y + h - 3}" stroke="${c}" stroke-width="${sw}"/>`).join("");
  if (style === 0) return `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>${ribs("white", 1.6)}`;
  if (style === 1) return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#b0b0b0"/>${ribs("#111", 1.2)}`;
  if (style === 2) return `<rect x="${x}" y="${y}" width="${w}" height="${h}"/><path d="${mirror ? `M${x + 4} ${y + 4} L${x + w - 4} ${y + h - 4}` : `M${x + 4} ${y + h - 4} L${x + w - 4} ${y + 4}`}" stroke="white" stroke-width="2.4"/>`;
  return `<rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${h - 2}" fill="white" stroke="#111" stroke-width="2"/>${ribs("#111", 1.1)}<rect x="${mirror ? x + 2 : x + w - 9}" y="${y + 4}" width="7" height="${h - 8}"/>`;
}

const stacks = TIERS.map((n, col) => {
  const key = Math.min(col, 12 - col), mirror = col > 6;
  return Array.from({ length: n }, (_, t) => box(COL_X0 + col * COL_PITCH, DECK - TIER_PITCH * (t + 1) + 2, (key * 5 + t * 3 + (key > 3 ? 1 : 0)) % 4, mirror)).join("");
}).join("");

/** Derek kapal: tiang + lengan miring, diberi tepi putih supaya terpisah dari kontainer. */
const crane = (px: number, tipX: number) => {
  const base = `M${px + 5} 26 L${tipX} 6`;
  return `<rect x="${px - 1}" y="26" width="12" height="${DECK - 26}" fill="white"/><rect x="${px + 1}" y="26" width="8" height="${DECK - 26}"/>` +
    `<path d="${base}" stroke="white" stroke-width="12" stroke-linecap="round"/><path d="${base}" stroke="#111" stroke-width="6" stroke-linecap="round"/>` +
    `<path d="M${tipX} 8 V${tipX < px ? 44 : 44}" stroke="#111" stroke-width="2"/><rect x="${tipX - 4}" y="42" width="8" height="8"/>`;
};
const ticks = (x: number, dir: 1 | -1) => [0, 1, 2, 3, 4].map((i) => `<path d="M${x} ${140 + 5 * i} h${dir * (i % 2 ? 8 : 12)}" stroke="white" stroke-width="2"/>`).join("");
const wave = `<path d="M0 178 q10 -6 20 0${" t20 0".repeat(29)}" fill="none" stroke="#111" stroke-width="3.5"/>`;

export const kapalKontainer = `
  ${wave}
  <path d="M8 134 H500 C540 134 568 126 598 106 C594 140 570 170 530 170 H36 C18 170 8 160 8 148 Z"/>
  <path d="M16 148 H562" stroke="white" stroke-width="3"/>
  <path d="${Array.from({ length: 10 }, (_, i) => `M${70 + 52 * i} 152 V167`).join(" ")}" stroke="white" stroke-width="1.5"/>
  ${ticks(14, 1)}${ticks(576, -1)}
  <circle cx="280" cy="159" r="7" fill="none" stroke="white" stroke-width="2"/><path d="M270 159 H290" stroke="white" stroke-width="2"/>
  <path d="M324 136 L348 171 M334 136 L358 171 M326 142 H337 M332 151 H343 M338 160 H349" stroke="white" stroke-width="2"/>
  <circle cx="563" cy="141" r="5.5" fill="white"/><circle cx="563" cy="141" r="2"/>
  ${stacks}
  ${crane(262, 346)}${crane(462, 386)}
  <path d="M28 134 V76 H104 V134 Z"/><path d="M34 76 V56 H98 V76 Z"/><path d="M22 56 V36 H116 V56 Z"/><path d="M30 36 V30 H110 V36 Z"/>
  <path d="M22 56 H116 M34 76 H98" stroke="white" stroke-width="2"/>
  <path d="M36 36 V16 H58 L60 12 V36 Z"/><path d="M36 22 H60 M36 28 H60" stroke="white" stroke-width="3"/>
  <rect x="82" y="8" width="5" height="22"/><path d="M70 14 H100" stroke="#111" stroke-width="3"/>
  ${[64, 72, 80, 88, 96, 104].map((x) => `<rect x="${x}" y="42" width="5" height="7" fill="white"/>`).join("")}
  ${[38, 50, 62, 74, 86].flatMap((x) => [84, 100, 116].map((y) => `<rect x="${x}" y="${y}" width="7" height="9" rx="1.5" fill="white"/>`)).join("")}
  <path d="M590 106 V66" stroke="#111" stroke-width="3"/><path d="M590 66 L574 72 L590 78 Z"/>`;

// ---- Butir 34: jembatan gantung dua menara (kembar: dua menara, dua pilar, hanger berjarak sama, tiga bentang). ----
// Pembeda: gerbang tol dengan palang + papan panah hanya di kiri, bendera dan matahari abu hanya di kanan, antena bola hanya di menara kiri,
// truk di bentang kiri, bus di bentang tengah-kanan, mobil di bentang kanan, tongkang di bawah tengah, mercusuar di kanan.
const TX = [140, 460];
const cableY = (p: [number, number][], x: number) => { // y kabel (bezier kuadrat p) pada x, lewat bisection
  let lo = 0, hi = 1;
  const at = (s: number) => [0, 1, 2].map((i) => (i === 0 ? (1 - s) ** 2 : i === 1 ? 2 * (1 - s) * s : s * s)).reduce((a, w, i) => [a[0] + w * p[i][0], a[1] + w * p[i][1]], [0, 0]);
  for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if ((at(m)[0] < x) === (p[2][0] > p[0][0])) lo = m; else hi = m; }
  return at(lo)[1];
};
const CABLES: [number, number][][] = [[[0, 100], [95, 92], [140, 24]], [[140, 24], [300, 144], [460, 24]], [[460, 24], [505, 92], [600, 100]]];
const hangers = Array.from({ length: 33 }, (_, i) => 12 + 18 * i).filter((x) => x < 590 && TX.every((t) => Math.abs(x - t) > 24))
  .map((x) => `M${x} ${Math.round(cableY(CABLES[x < TX[0] ? 0 : x < TX[1] ? 1 : 2], x) * 10) / 10 + 1} V104`).join(" ");
const tower = (cx: number, top: string) =>
  `<rect x="${cx - 6 - 10}" y="24" width="9" height="108"/><rect x="${cx + 7}" y="24" width="9" height="108"/>` +
  [40, 70, 100].map((y) => `<rect x="${cx - 16}" y="${y}" width="32" height="5"/>`).join("") +
  `<path d="M${cx - 7} 45 L${cx + 7} 70 M${cx + 7} 45 L${cx - 7} 70 M${cx - 7} 75 L${cx + 7} 100 M${cx + 7} 75 L${cx - 7} 100" stroke="#111" stroke-width="2.5"/>` +
  `<path d="M${cx - 11.5} 30 V126 M${cx + 11.5} 30 V126" stroke="white" stroke-width="1.6"/><rect x="${cx - 22}" y="20" width="44" height="6"/>${top}`;
const pier = (cx: number, extra: string) =>
  `<path d="M${cx - 26} 128 L${cx - 35} 178 H${cx + 35} L${cx + 26} 128 Z"/><path d="${[142, 156, 168].map((y, i) => `M${cx - 27 - i * 2} ${y} H${cx + 27 + i * 2}`).join(" ")}" stroke="white" stroke-width="1.8"/>${extra}`;
const wheelB = (x: number, y: number, r: number) => `<circle cx="${x}" cy="${y}" r="${r}"/><circle cx="${x}" cy="${y}" r="${r * 0.55}" fill="white"/><circle cx="${x}" cy="${y}" r="${r * 0.2}"/>`;
const zig = Array.from({ length: 43 }, (_, i) => `${i ? "L" : "M"}${14 * i} ${i % 2 ? 112 : 126}`).join(" ");

export const jembatanGantung = `
  <circle cx="540" cy="42" r="15" fill="#b0b0b0"/>
  <path d="M262 46 q6 -7 12 0 q6 -7 12 0 M300 60 q5 -6 10 0 q5 -6 10 0" fill="none" stroke="#111" stroke-width="2"/>
  ${CABLES.map(([a, b, c]) => `<path d="M${a} Q${b} ${c}" fill="none" stroke="#111" stroke-width="3.5"/>`).join("")}
  <path d="${hangers}" stroke="#111" stroke-width="1.6"/>
  ${tower(TX[0], `<path d="M${TX[0]} 20 V4" stroke="#111" stroke-width="2.5"/><circle cx="${TX[0]}" cy="5" r="3.5"/><path d="M${TX[0] - 7} 11 H${TX[0] + 7}" stroke="#111" stroke-width="2.5"/>`)}
  ${tower(TX[1], `<path d="M${TX[1]} 20 V3" stroke="#111" stroke-width="2.5"/><path d="M${TX[1]} 4 L${TX[1] + 20} 9 L${TX[1]} 15 Z"/>`)}
  <rect x="0" y="104" width="600" height="6"/><rect x="0" y="110" width="600" height="18"/>
  <path d="${zig}" fill="none" stroke="white" stroke-width="2"/><path d="M0 112 H600" stroke="white" stroke-width="1.2"/>
  <rect x="0" y="128" width="54" height="50"/><path d="M13 178 V152 Q27 134 41 152 V178 Z" fill="white"/>
  <path d="M566 178 L572 130 L586 112 H600 V178 Z" fill="#b0b0b0"/>
  ${pier(TX[0], `<path d="M${TX[0] + 38} 140 h9 M${TX[0] + 38} 148 h5 M${TX[0] + 38} 156 h9 M${TX[0] + 38} 164 h5" stroke="#111" stroke-width="2"/>`)}${pier(TX[1], "")}
  <path d="M250 160 H368 L358 174 H262 Z"/><rect x="298" y="142" width="40" height="18"/><rect x="318" y="132" width="9" height="11"/><path d="M318 136 H327" stroke="white" stroke-width="2"/>
  ${[304, 316, 328].map((x) => `<rect x="${x}" y="146" width="7" height="7" fill="white"/>`).join("")}<path d="M268 160 V138 M268 140 H290" stroke="#111" stroke-width="2.5"/>
  <path d="M506 178 Q518 158 540 156 Q562 160 574 178 Z" fill="#b0b0b0"/><path d="M522 160 L528 140 H540 L546 160 Z"/><rect x="528" y="134" width="12" height="6" fill="white" stroke="#111" stroke-width="1.5"/><path d="M526 134 L534 128 L542 134 Z"/>
  <path d="M525 150 H543 M527 156 H545" stroke="white" stroke-width="2.4"/>
  <path d="M0 176 q10 -6 20 0${" t20 0".repeat(29)}" fill="none" stroke="#111" stroke-width="3.5"/>
  <g stroke="white" stroke-width="1.5"><rect x="196" y="80" width="46" height="20"/><path d="M244 86 H256 L265 94 V100 H244 Z"/><rect x="330" y="78" width="68" height="22" rx="4"/><path d="M490 100 V92 L498 86 H512 L518 92 H525 V100 Z"/></g>
  <path d="M200 90 H238" stroke="white" stroke-width="2"/><path d="M247 89 H254 L258 94 H247 Z" fill="white"/><rect x="194" y="99" width="72" height="3"/>
  ${wheelB(210, 99, 5)}${wheelB(250, 99, 5)}
  <rect x="334" y="82" width="10" height="17" fill="white"/><path d="M339 82 V99" stroke="#111" stroke-width="1.6"/>${[349, 362, 375].map((x) => `<rect x="${x}" y="83" width="10" height="9" fill="white"/>`).join("")}<rect x="388" y="83" width="7" height="9" fill="white"/>
  ${wheelB(354, 99, 5)}${wheelB(386, 99, 5)}
  <path d="M500 89 H510 L513 92 H498 Z" fill="white"/>${wheelB(499, 100, 4)}${wheelB(517, 100, 4)}
  <rect x="14" y="80" width="26" height="24"/><rect x="10" y="75" width="34" height="5"/><rect x="19" y="85" width="12" height="9" fill="white"/>
  <path d="M40 92 H78" stroke="#111" stroke-width="3.5"/><path d="M44 92 H78" stroke="white" stroke-width="1.6" stroke-dasharray="5 5"/>
  <path d="M104 104 V72" stroke="#111" stroke-width="3"/><rect x="88" y="62" width="32" height="18" stroke="white" stroke-width="1.5"/><path d="M95 71 H112 M106 65 L113 71 L106 77" fill="none" stroke="white" stroke-width="2.4"/>`;
