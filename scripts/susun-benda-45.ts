// Adegan susun untuk pkg 4/5 (nomor 33-34): empat benda nyata yang dikenali dan asimetris.
// Kanvas 600×190, isi hitam (#111) dengan detail putih; bentuk melewati seluruh lebar supaya tiap potongan membawa bagian benda.
// Dipakai generate-kecerdasan-susun-kal.ts (4/33 kereta api, 4/34 kapal feri, 5/33 traktor, 5/34 perahu pinisi).
const wheel = (x: number, y: number, r: number) => `<circle cx="${x}" cy="${y}" r="${r}"/><circle cx="${x}" cy="${y}" r="${r * 0.58}" fill="white"/><circle cx="${x}" cy="${y}" r="${r * 0.22}"/>`;
const win = (list: [number, number, number, number][], rx = 3) => list.map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="white"/>`).join("");
const wave = (y: number, step: number, amp: number) => {
  let d = `M0 ${y}`;
  for (let x = 0, up = true; x < 600; x += step, up = !up) d += x === 0 ? ` C${step / 2} ${y - amp} ${step} ${y + amp} ${step} ${y}` : ` S${x + step} ${y + (up ? -amp : amp)} ${x + step} ${y}`;
  return `<path d="${d}" fill="none" stroke="#111" stroke-width="4"/>`;
};

export const kereta = `
  <path d="M0 184 H600" stroke="#111" stroke-width="4"/><path d="M0 34 H600" stroke="#111" stroke-width="2"/><path d="M130 34 V46 M250 34 V46 M380 34 V30 M520 34 V30" stroke="#111" stroke-width="2"/>
  <path d="M12 150 V60 C12 52 18 46 26 46 H298 V150 Z"/><path d="M12 56 H298" stroke="white" stroke-width="3"/>
  ${win([[30, 68, 36, 30], [76, 68, 30, 30], [168, 66, 44, 32], [218, 66, 44, 32], [268, 66, 22, 32]])}
  <rect x="122" y="64" width="30" height="84" rx="3" fill="white"/><rect x="128" y="70" width="18" height="26"/><rect x="142" y="106" width="5" height="16"/>
  <path d="M12 120 H298" stroke="white" stroke-width="5"/><path d="M12 134 H170" stroke="white" stroke-width="2.5"/>
  <rect x="12" y="150" width="286" height="12"/><rect x="48" y="160" width="86" height="8"/><rect x="186" y="160" width="86" height="8"/>
  <rect x="298" y="62" width="18" height="88"/><path d="M307 62 V150" stroke="white" stroke-width="2"/>
  <path d="M316 150 V84 H338 V42 C338 36 342 32 348 32 H416 C422 32 426 36 428 42 L434 68 H552 C564 68 574 72 582 84 L592 112 V150 Z"/>
  <path d="M474 68 L496 36 L518 68" fill="none" stroke="#111" stroke-width="4"/><path d="M484 36 H508" stroke="#111" stroke-width="5"/>
  <path d="M350 46 H380 V82 H350 Z M390 46 H418 L424 76 H390 Z" fill="white"/><rect x="352" y="94" width="26" height="50" fill="none" stroke="white" stroke-width="3"/>
  <path d="M446 82 V112 M458 82 V112 M476 82 V112 M488 82 V112 M500 82 V112 M522 82 V112" stroke="white" stroke-width="4"/>
  <path d="M316 120 H592" stroke="white" stroke-width="5"/><path d="M556 150 L592 126" stroke="white" stroke-width="4"/>
  <circle cx="582" cy="98" r="8" fill="white"/><circle cx="582" cy="98" r="3"/>
  <rect x="372" y="150" width="104" height="12"/><path d="M384 156 H464" stroke="white" stroke-width="2"/><rect x="342" y="160" width="86" height="8"/><rect x="478" y="160" width="86" height="8"/>
  ${[66, 116, 204, 254, 360, 410, 496, 546].map((x) => wheel(x, 170, 14)).join("")}`;

export const feri = `
  ${wave(177, 60, 8)}
  <path d="M12 124 H508 L590 106 L562 162 C556 167 548 168 540 168 H60 C38 168 20 152 12 124 Z"/>
  <path d="M22 138 H550" stroke="white" stroke-width="4"/>
  ${win([[56, 146, 46, 14], [114, 146, 30, 14], [156, 146, 70, 14], [240, 146, 22, 14], [276, 146, 54, 14], [344, 146, 30, 14], [388, 146, 64, 14], [466, 146, 40, 14]], 2)}
  <circle cx="552" cy="126" r="5" fill="white"/>
  <path d="M20 124 V66 H132 V124 Z"/>${win([[34, 76, 22, 14], [66, 76, 22, 14], [98, 76, 22, 14], [34, 100, 40, 14], [88, 100, 32, 14]], 2)}<path d="M14 66 H138" stroke="#111" stroke-width="5"/>
  <path d="M132 124 V96 H440 V124 Z"/>${win([[146, 104, 30, 14], [186, 104, 30, 14], [226, 104, 50, 14], [288, 104, 22, 14], [322, 104, 50, 14], [384, 104, 44, 14]], 2)}
  <path d="M164 96 V70 H410 V96 Z"/>${win([[178, 78, 34, 12], [222, 78, 34, 12], [330, 78, 60, 12]], 2)}
  <path d="M290 70 V44 H372 L384 70 Z"/><rect x="298" y="50" width="66" height="12" fill="white"/><path d="M334 44 V8 M316 12 H352" stroke="#111" stroke-width="4"/>
  <path d="M196 70 V26 H240 L246 70 Z"/><path d="M197 44 H244" stroke="white" stroke-width="7"/><path d="M196 26 H240" stroke="#111" stroke-width="5"/>
  <path d="M256 70 C260 60 284 60 288 70 Z"/><path d="M144 96 C148 86 172 86 176 96 Z"/>
  <path d="M440 124 V104 H520 L530 124 Z"/><rect x="452" y="108" width="18" height="10" fill="white"/>
  <path d="M492 104 V30" stroke="#111" stroke-width="6"/><path d="M492 32 L334 10 M492 32 L590 100 M492 40 L440 104" stroke="#111" stroke-width="2"/><path d="M492 30 L520 38 L492 46 Z"/>
  <path d="M48 66 V22" stroke="#111" stroke-width="4"/><path d="M48 22 L20 30 L48 38 Z"/><path d="M48 24 L136 66 M48 24 L20 66" stroke="#111" stroke-width="2"/>`;

export const traktor = `
  <path d="M0 184 H600" stroke="#111" stroke-width="4"/>
  <circle cx="130" cy="118" r="60"/><circle cx="130" cy="118" r="66" fill="none" stroke="#111" stroke-width="8" stroke-dasharray="9 7"/><circle cx="130" cy="118" r="36" fill="white"/><circle cx="130" cy="118" r="12"/>
  <path d="M130 84 V152 M96 118 H164 M106 94 L154 142 M154 94 L106 142" stroke="#111" stroke-width="5"/>
  <path d="M56 108 C64 50 196 46 210 96 L196 96 C184 66 90 70 72 108 Z"/>
  <path d="M104 24 H256 L268 100 H92 Z"/><rect x="96" y="12" width="168" height="10" rx="4"/><path d="M120 36 H240 L250 88 H112 Z" fill="white"/>
  <path d="M150 70 L176 54" stroke="#111" stroke-width="5"/><ellipse cx="178" cy="54" rx="10" ry="4"/><path d="M196 76 H232 V90 H196 Z"/>
  <rect x="190" y="118" width="300" height="16"/>
  <path d="M254 70 H500 C516 70 524 78 528 90 L534 134 H266 Z"/>
  <rect x="300" y="52" width="52" height="18" rx="4"/><path d="M310 58 H342 M310 64 H342" stroke="white" stroke-width="2"/>
  <rect x="420" y="26" width="9" height="44"/><path d="M414 26 H435 L430 18 H419 Z"/>
  <path d="M276 100 H528" stroke="white" stroke-width="4"/><path d="M330 72 V132 M402 72 V132" stroke="white" stroke-width="2"/>
  <rect x="506" y="84" width="22" height="40" fill="white"/><path d="M512 84 V124 M518 84 V124 M524 84 V124" stroke="#111" stroke-width="2"/>
  <circle cx="522" cy="76" r="9" fill="white"/><circle cx="522" cy="76" r="4"/>
  <circle cx="480" cy="148" r="32"/><circle cx="480" cy="148" r="36" fill="none" stroke="#111" stroke-width="7" stroke-dasharray="8 6"/><circle cx="480" cy="148" r="18" fill="white"/><circle cx="480" cy="148" r="7"/>
  <path d="M470 130 H494 L486 148 H478 Z"/>
  <path d="M262 88 L556 110" stroke="white" stroke-width="15" stroke-linecap="round"/><path d="M262 88 L556 110" stroke="#111" stroke-width="8" stroke-linecap="round"/>
  <path d="M556 108 H596 L588 170 H548 L552 138 Z"/><path d="M566 160 H580 M568 150 H583" stroke="white" stroke-width="3"/>
  <circle cx="22" cy="120" r="10" fill="none" stroke="#111" stroke-width="5"/><path d="M70 118 L28 150 M86 98 L40 150" stroke="#111" stroke-width="5"/><path d="M14 150 L66 150 L60 176 L24 176 Z"/>`;

export const pinisi = `
  ${wave(179, 50, 7)}
  <path d="M10 112 C40 130 90 136 160 138 H470 C520 138 556 126 590 98 L584 128 C556 158 520 168 470 168 H110 C60 168 22 150 10 112 Z"/>
  <path d="M520 124 L598 84" stroke="#111" stroke-width="7" stroke-linecap="round"/>
  <path d="M40 138 C80 150 130 152 190 152 H470 C500 152 534 148 560 136" fill="none" stroke="white" stroke-width="3"/><path d="M70 158 H480" stroke="white" stroke-width="2"/>
  <path d="M20 100 H112 V138 H34 Z"/>${win([[38, 110, 16, 12], [62, 110, 16, 12], [86, 110, 18, 12]], 2)}<path d="M14 100 H120" stroke="#111" stroke-width="6"/><path d="M8 112 L2 150 H16 Z"/>
  <rect x="200" y="12" width="10" height="130"/><rect x="362" y="26" width="10" height="116"/>
  <path d="M205 12 L172 20 L205 28 Z"/><path d="M367 26 L338 33 L367 40 Z"/>
  <path d="M200 34 L100 52 L82 118 H200 Z"/><path d="M200 62 H92 M200 90 H86" stroke="white" stroke-width="2.5"/><path d="M206 118 H70" stroke="#111" stroke-width="6"/>
  <path d="M362 48 L270 62 L252 120 H362 Z"/><path d="M362 76 H262 M362 100 H256" stroke="white" stroke-width="2.5"/><path d="M368 120 H240" stroke="#111" stroke-width="6"/>
  <path d="M374 34 L592 88 L520 122 H374 Z"/><path d="M374 64 L556 96 M374 92 L536 108" stroke="white" stroke-width="2.5"/>
  <path d="M205 12 L30 100 M205 14 L367 28 M367 26 L596 84 M208 30 L226 118 M366 40 L346 118" stroke="#111" stroke-width="2"/>`;
