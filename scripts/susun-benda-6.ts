// Adegan susun untuk pkg 6 (Latihan Paket 5, nomor 33-34): truk molen (5 potong) dan kereta gantung (grid 2×3).
// Kanvas 600×190, isi hitam (#111) dengan detail putih, pola susun-benda-45.ts; bentuk melewati seluruh lebar supaya tiap potongan membawa bagian benda.
const wheel = (x: number, y: number, r: number) => `<circle cx="${x}" cy="${y}" r="${r}"/><circle cx="${x}" cy="${y}" r="${r * 0.58}" fill="white"/><circle cx="${x}" cy="${y}" r="${r * 0.22}"/>`;
const stroke = (d: string, w = 4, c = "#111") => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;

// Truk molen tampak samping menghadap kanan: corong + perosotan di belakang, tabung miring bergaris spiral, kabin di depan.
export const trukMolen = `
  <path d="M0 184 H600" stroke="#111" stroke-width="4"/>
  <rect x="18" y="126" width="572" height="14"/>
  <path d="M100 52 C150 18 300 8 362 38 C402 56 426 80 430 100 C420 118 380 124 330 124 L150 120 C114 114 94 92 100 52 Z"/>
  <path d="M156 28 C176 58 180 90 168 118 M214 18 C236 52 240 92 226 120 M272 14 C296 50 300 92 286 122 M318 18 C344 52 350 94 338 122 M372 42 C390 64 396 92 388 118" stroke="white" stroke-width="7" fill="none"/>
  <ellipse cx="104" cy="66" rx="8" ry="18" fill="white"/>
  <path d="M68 14 H124 L110 42 H86 Z"/><path d="M78 20 H114" stroke="white" stroke-width="3"/>
  ${stroke("M100 84 L30 118", 10)}<path d="M18 112 L36 108 L40 124 L22 128 Z"/>
  ${stroke("M82 34 V132 M98 34 V132", 4)}${stroke("M82 52 H98 M82 72 H98 M82 92 H98 M82 112 H98", 3)}
  <rect x="300" y="118" width="110" height="30" rx="12"/><path d="M308 133 H402" stroke="white" stroke-width="3"/>
  <path d="M422 64 H462 V126 H422 Z"/><path d="M430 74 H454 M430 86 H454" stroke="white" stroke-width="3"/>
  <path d="M120 126 C126 104 176 98 196 104 C214 98 250 104 254 126 Z"/>
  ${wheel(150, 150, 28)}${wheel(222, 150, 28)}
  <path d="M466 140 V58 C466 50 472 46 480 46 H546 L580 90 C586 94 590 100 590 110 V140 Z"/>
  <path d="M482 58 H538 L564 92 H482 Z" fill="white"/><path d="M522 58 V138" stroke="white" stroke-width="3"/><rect x="530" y="102" width="14" height="5" fill="white"/>
  <circle cx="582" cy="120" r="6" fill="white"/><rect x="560" y="140" width="34" height="9"/>
  <path d="M488 126 C494 104 552 104 560 126 Z"/>${wheel(524, 150, 28)}`;

// Kereta gantung: stasiun bawah di kiri, dua menara rangka, kabel ganda naik ke stasiun atas di kanan, tiga kabin, gunung berpuncak hitam, hutan cemara.
const tower = (x: number, top: number, foot: number) => `<path d="M${x - 5} ${top} H${x + 5} L${x + 14} ${foot} H${x - 14} Z"/>` +
  `<path d="M${x - 3} ${top + 14} L${x + 7} ${(top + foot) / 2} L${x - 9} ${foot - 8} M${x + 3} ${top + 14} L${x - 7} ${(top + foot) / 2} L${x + 9} ${foot - 8}" stroke="white" stroke-width="2.5" fill="none"/>` +
  `<rect x="${x - 18}" y="${top - 6}" width="36" height="8" rx="2"/>`;
const cabin = (x: number, cableY: number, w: number, h: number) => `<path d="M${x} ${cableY} V${cableY + 12}" stroke="#111" stroke-width="4"/><circle cx="${x}" cy="${cableY}" r="5"/>` +
  `<rect x="${x - w / 2}" y="${cableY + 12}" width="${w}" height="${h}" rx="6"/><rect x="${x - w / 2 + 5}" y="${cableY + 18}" width="${w - 10}" height="${h * 0.38}" rx="2" fill="white"/><path d="M${x} ${cableY + 18} V${cableY + 18 + h * 0.38}" stroke="#111" stroke-width="3"/>`;
export const keretaGantung = `
  <path d="M0 186 L120 170 L330 72 L420 110 L600 58 V190 H0 Z" fill="white" stroke="#111" stroke-width="4" stroke-linejoin="round"/>
  <path d="M300 86 L330 72 L362 87 L346 82 L332 92 L316 82 Z"/>
  <path d="M150 168 L230 132 M250 150 L300 120 M450 150 L520 118 M480 170 L560 128" stroke="#111" stroke-width="2.5"/>
  <path d="M206 176 L218 146 L230 176 Z M226 172 L236 150 L246 172 Z M190 180 L200 156 L210 180 Z"/>
  <path d="M458 178 L472 146 L486 178 Z M492 170 L506 136 L520 170 Z M526 182 L540 150 L554 182 Z M560 168 L574 132 L588 168 Z"/>
  <path d="M440 188 C470 176 500 186 520 170 S560 150 600 148" fill="none" stroke="#111" stroke-width="3" stroke-dasharray="8 6"/>
  <path d="M8 184 V96 H116 V184 Z"/><path d="M0 98 L60 58 L124 98 Z"/><path d="M20 112 H46 V134 H20 Z M60 112 H86 V134 H60 Z M30 150 H62 V184 H30 Z" fill="white"/><circle cx="108" cy="90" r="11" fill="white" stroke="#111" stroke-width="4"/>
  ${tower(200, 58, 142)}${tower(428, 30, 106)}
  <path d="M520 28 H600 V66 H520 Z"/><path d="M512 30 L560 6 L604 30 Z"/><path d="M534 38 H560 V52 H534 Z M570 38 H592 V58 H570 Z" fill="white"/>
  ${stroke("M118 86 Q160 74 200 54 Q320 44 428 26 Q480 22 522 36", 3)}${stroke("M118 94 Q160 82 200 62 Q320 52 428 34 Q480 30 522 44", 3)}
  ${cabin(172, 64, 34, 30)}${cabin(286, 46, 40, 36)}${cabin(392, 31, 36, 32)}`;
