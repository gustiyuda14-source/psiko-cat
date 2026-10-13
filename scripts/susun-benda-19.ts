// Adegan susun untuk pkg 19 (Simulasi 4, nomor 33-34): pesawat baling-baling dan bus tingkat. Gaya sama dengan susun-benda-45.ts.
// Kanvas 600×190, isi hitam (#111) dengan detail putih; benda melewati seluruh lebar dan garis potong mendatar y≈96.
const wheel = (x: number, y: number, r: number) => `<circle cx="${x}" cy="${y}" r="${r}"/><circle cx="${x}" cy="${y}" r="${r * 0.58}" fill="white"/><circle cx="${x}" cy="${y}" r="${r * 0.22}"/>`;
const win = (list: [number, number, number, number][], rx = 3) => list.map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="white"/>`).join("");

export const pesawat = `
  <path d="M0 184 H600" stroke="#111" stroke-width="4"/><path d="M40 176 H90 M300 176 H380 M450 176 H520" stroke="#111" stroke-width="2"/>
  <path d="M16 12 H46 L104 70 H40 Z"/><path d="M28 22 H42 L82 62 H46 Z" fill="white"/><path d="M4 66 H70 L66 76 H8 Z"/>
  <path d="M10 70 L110 64 H500 C548 64 580 84 592 110 C596 120 592 128 582 132 C556 142 520 144 490 144 H150 C90 144 40 116 10 84 Z"/>
  <path d="M520 72 C546 74 566 86 576 100 L536 100 Z" fill="white"/><path d="M548 78 L544 100" stroke="#111" stroke-width="3"/>
  ${win([[132, 82, 14, 14], [162, 82, 14, 14], [192, 82, 14, 14], [222, 82, 14, 14], [252, 82, 14, 14], [326, 82, 14, 14], [356, 82, 14, 14], [386, 82, 14, 14], [416, 82, 14, 14], [446, 82, 14, 14]], 6)}
  <rect x="284" y="78" width="26" height="54" rx="4" fill="white"/><rect x="290" y="84" width="14" height="14" rx="4"/>
  <path d="M60 112 H580" stroke="white" stroke-width="3"/><path d="M120 124 H540" stroke="white" stroke-width="2"/>
  <path d="M196 48 H470 C478 48 482 52 482 58 H196 Z"/><path d="M230 62 L250 48 M420 62 L400 48" stroke="#111" stroke-width="5"/>
  <path d="M232 30 H284 C296 30 304 36 306 44 V58 H232 Z"/><path d="M380 30 H432 C444 30 452 36 454 44 V58 H380 Z"/>
  <path d="M240 38 H290 M388 38 H438" stroke="white" stroke-width="3"/>
  <path d="M310 8 V80 M458 8 V80" stroke="#111" stroke-width="5" stroke-linecap="round"/><ellipse cx="310" cy="44" rx="6" ry="9"/><ellipse cx="458" cy="44" rx="6" ry="9"/>
  <path d="M230 144 L222 160 M520 140 L528 160" stroke="#111" stroke-width="6"/>
  ${[[214, 166, 12], [232, 166, 12], [528, 168, 10]].map(([x, y, r]) => wheel(x, y, r)).join("")}`;

export const busTingkat = `
  <path d="M0 184 H600" stroke="#111" stroke-width="4"/>
  <path d="M8 30 C8 18 16 12 28 12 H560 C576 12 588 20 590 36 L594 160 C594 166 590 170 584 170 H14 C10 170 8 166 8 160 Z"/>
  <path d="M8 96 H594" stroke="white" stroke-width="5"/><path d="M8 104 H594" stroke="white" stroke-width="2"/>
  ${win([[22, 26, 60, 50], [94, 26, 74, 50], [180, 26, 74, 50], [266, 26, 74, 50], [352, 26, 74, 50], [438, 26, 74, 50]], 6)}
  <path d="M524 26 H566 C576 26 580 32 580 42 V76 H524 Z" fill="white"/><rect x="532" y="34" width="38" height="10"/>
  ${win([[22, 114, 40, 38], [96, 114, 66, 38], [176, 114, 66, 38], [256, 114, 40, 38], [400, 114, 64, 38]], 4)}
  <rect x="310" y="112" width="74" height="56" rx="3" fill="white"/><path d="M347 112 V168" stroke="#111" stroke-width="4"/><path d="M322 128 H338 M356 128 H372" stroke="#111" stroke-width="3"/>
  <path d="M478 112 H576 C584 112 588 118 588 126 V150 H478 Z" fill="white"/><path d="M492 120 L540 120 L520 146 H492 Z"/>
  <circle cx="584" cy="160" r="5" fill="white"/><rect x="560" y="158" width="18" height="6" fill="white"/>
  <path d="M30 86 H120 M220 86 H330" stroke="white" stroke-width="3"/><path d="M372 86 L452 86" stroke="white" stroke-width="3" stroke-dasharray="10 6"/>
  ${[[86, 172, 18], [140, 172, 18], [500, 172, 18]].map(([x, y, r]) => wheel(x, y, r)).join("")}`;
