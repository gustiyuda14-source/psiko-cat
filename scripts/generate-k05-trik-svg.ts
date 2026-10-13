/**
 * Gambar pembahasan K05 hitung cepat metode praktis (K05-N-001..020).
 * Hitam-putih, landscape 616 × 260: kiri = contoh hitungan, tengah = langkah bernomor + hasil, kanan = "Kenapa bisa?".
 * Jalankan: npx tsx scripts/generate-k05-trik-svg.ts  → data/drill-pembahasan/K05-N-xxx.svg
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const W = 616, H = 260, INK = "#111111", MUTED = "#555555";
const FONT = "system-ui,-apple-system,'Segoe UI',Roboto,sans-serif";
type El = string;
type Opt = { size?: number; fill?: string; w?: number; anchor?: "start" | "middle" | "end" };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const t = (x: number, y: number, s: string, { size = 13, fill = INK, w = 400, anchor = "start" }: Opt = {}): El =>
  `<text x="${x}" y="${y}" font-size="${size}" font-weight="${w}" fill="${fill}" text-anchor="${anchor}">${esc(s)}</text>`;
const tb = (x: number, y: number, s: string, size = 13, anchor: Opt["anchor"] = "start") => t(x, y, s, { size, w: 700, anchor });
const tm = (x: number, y: number, s: string, size = 11, anchor: Opt["anchor"] = "start") => t(x, y, s, { size, fill: MUTED, anchor });
const rect = (x: number, y: number, w: number, h: number, fill = "#fff", dash = false, r = 0, sw = 1.5): El =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${INK}" stroke-width="${sw}"${dash ? ' stroke-dasharray="5 4"' : ""}/>`;
const line = (x1: number, y1: number, x2: number, y2: number, { dash = false, arrow = false, sw = 1.5 } = {}): El =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${INK}" stroke-width="${sw}"${dash ? ' stroke-dasharray="5 4"' : ""}${arrow ? ' marker-end="url(#ah)"' : ""}/>`;
const curve = (d: string, dash = true): El =>
  `<path d="${d}" fill="none" stroke="${INK}" stroke-width="1.5"${dash ? ' stroke-dasharray="5 4"' : ""} marker-end="url(#ah)"/>`;
const digitBox = (cx: number, y: number, s: string, { size = 44, fs = 26, dash = false } = {}): El[] =>
  [rect(cx - size / 2, y, size, size, "#fff", dash, 6), t(cx, y + size / 2 + fs * 0.36, s, { size: fs, w: 700, anchor: "middle", fill: dash ? MUTED : INK })];
const pill = (cx: number, y: number, w: number, s: string, fs = 16): El[] =>
  [rect(cx - w / 2, y, w, 30, "#fff", false, 6), tb(cx, y + 21, s, fs, "middle")];
/** Baris teks berjarak tetap. */
const lines = (x: number, y: number, rows: [string, number?][], size = 12, gap = 19): El[] =>
  rows.map(([s, w = 400], i) => t(x, y + i * gap, s, { size, w }));

/** Kolom langkah bernomor (x 200–336) + bar hasil hitam. */
function steps(list: [string, string?][], result: string): El[] {
  const b: El[] = [];
  list.forEach(([s, sub], i) => {
    const y = 64 + i * 30;
    b.push(`<circle cx="208" cy="${y - 4}" r="8" fill="${INK}"/>`, t(208, y, String(i + 1), { size: 10, fill: "#fff", w: 700, anchor: "middle" }), t(222, y, s, { w: 600 }));
    if (sub) b.push(tm(222, y + 13, sub, 10));
  });
  b.push(rect(200, 184, 130, 40, INK, false, 6), t(265, 210, result, { size: 17, fill: "#fff", w: 700, anchor: "middle" }));
  return b;
}

function svg(label: string, title: string, left: El[], right: El[]): string {
  const defs =
    '<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="#111"/></marker>' +
    '<pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#111" stroke-width="1.2"/></pattern></defs>';
  const frame = [`<rect width="${W}" height="${H}" fill="#fff"/>`, tb(16, 26, title, 17), line(342, 42, 342, 244, { sw: 1 }), tb(356, 58, "Kenapa bisa?", 14)];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(label)}" font-family="${FONT}">` +
    `${defs}${[...frame, ...left].join("")}<g transform="translate(8,0)">${right.join("")}</g></svg>`;
}

/** Tabel silang basis 100 (dipakai 003 dan 006). */
function silang(a: string, da: string, b: string, db: string, depan: string, belakang: string): El[] {
  return [
    tb(58, 80, a, 28, "middle"), tb(146, 80, da, 28, "middle"), tb(58, 122, b, 28, "middle"), tb(146, 122, db, 28, "middle"),
    line(102, 50, 102, 192, { sw: 1 }), line(22, 136, 186, 136, { sw: 2 }), line(86, 72, 124, 108, { dash: true, arrow: true }),
    tb(58, 172, depan, 28, "middle"), tb(146, 172, belakang, 28, "middle"), tm(58, 210, "silang", 10, "middle"), tm(146, 210, "kali", 10, "middle"),
  ];
}

/** Pecahan bertingkat: atas/bawah dengan garis. */
const frac = (cx: number, y: number, top: string, bot: string, size = 18): El[] =>
  [tb(cx, y, top, size, "middle"), line(cx - top.length * size * 0.3 - 4, y + 7, cx + top.length * size * 0.3 + 4, y + 7, { sw: 1.5 }), tb(cx, y + size + 10, bot, size, "middle")];

/** Pita dibagi n sel, k sel pertama diarsir. */
function bar(x: number, y: number, w: number, h: number, n: number, k: number, label?: (i: number) => string): El[] {
  const c = w / n, b: El[] = [];
  for (let i = 0; i < n; i++) {
    b.push(rect(x + i * c, y, c, h, i < k ? "url(#hatch)" : "#fff"));
    if (label) b.push(t(x + i * c + c / 2, y + h + 13, label(i), { size: 9, fill: MUTED, anchor: "middle" }));
  }
  return b;
}

/** Bagi 5/25/125 → kali 2/4/8 lalu geser koma (012–014). */
function bagiKali(n: string, d: string, k: string, chain: string[], hasil: string, nol: string): [El[], El[]] {
  const left: El[] = [tb(100, 74, `${n} ÷ ${d}`, 22, "middle")];
  chain.forEach((s, i) => {
    const y = 104 + i * 28;
    left.push(tm(30, y, "× 2", 11), tb(100, y, s, 16, "middle"));
  });
  const yEnd = 104 + chain.length * 28;
  left.push(tm(30, yEnd, `÷ 1${nol}`, 11), tb(100, yEnd, hasil, 20, "middle"));
  const right = [
    ...frac(420, 96, n, d), tb(466, 114, "=", 18, "middle"), ...frac(536, 96, `${n} × ${k}`, `${d} × ${k}`, 15),
    ...lines(348, 172, [[`${d} × ${k} = 1${nol}, jadi penyebut`], ["berubah menjadi angka bulat"], ["dan membagi cukup geser koma."], [`Kali ${k} = gandakan ${Math.log2(+k)} kali.`, 600]], 12, 18),
  ];
  return [left, right];
}

const ITEMS: Record<string, () => string> = {
  "K05-N-001": () => {
    const left = [...digitBox(66, 48, "6"), ...digitBox(146, 48, "5"), line(66, 96, 66, 124, { arrow: true }), line(146, 96, 146, 124, { arrow: true }),
      tb(66, 142, "6 × 7", 14, "middle"), tb(146, 142, "5 × 5", 14, "middle"),
      rect(30, 156, 72, 46, "#fff", false, 6), tb(66, 188, "42", 26, "middle"), rect(110, 156, 72, 46, "#fff", false, 6), tb(146, 188, "25", 26, "middle"),
      tm(106, 222, "tempel berdampingan", 11, "middle"), ...steps([["Pisah 6 | 5"], ["6 × 7 = 42", "kali angka berikutnya"], ["Belakang = 25"], ["Tempel 42 | 25"]], "4.225")];
    const [x0, y0, big, sm] = [352, 76, 90, 18];
    const right = [rect(x0, y0, big, big), tb(x0 + big / 2, y0 + big / 2 + 5, "60 × 60", 12, "middle"), rect(x0 + big, y0, sm, big, "url(#hatch)"),
      rect(x0, y0 + big, big, sm, "url(#hatch)", true), rect(x0 + big, y0 + big, sm, sm, INK), t(x0 + big + sm / 2, y0 + big + sm / 2 + 3, "25", { size: 8, fill: "#fff", w: 700, anchor: "middle" }),
      rect(x0 + big + sm, y0, sm, big, "none", true), tm(x0 + big + sm * 1.5, y0 - 5, "ke sini", 10, "middle"),
      curve(`M${x0 + big / 2} ${y0 + big + sm + 2} Q ${x0 + big + sm * 2 + 16} ${y0 + big + sm + 14} ${x0 + big + sm * 1.5} ${y0 + big / 2 + 12}`),
      tm(486, 92, "65² = 60² + dua pita", 11.5), tm(486, 109, "60 × 5 + pojok 5 × 5", 11.5),
      ...lines(348, 208, [["Pita bawah pindah ke kanan:"], ["60 × 70 = 4.200", 600], ["+ pojok 25 = 4.225", 700]], 12.5, 17)];
    return svg("Pembahasan 65 kuadrat trik akhiran 5", "65² — trik akhiran 5", left, right);
  },
  "K05-N-002": () => {
    const left = [...digitBox(46, 46, "4"), ...digitBox(106, 46, "?", { dash: true }), ...digitBox(166, 46, "7"),
      line(56, 94, 98, 118, { arrow: true }), line(156, 94, 114, 118, { arrow: true }), tb(106, 136, "4 + 7 = 11", 14, "middle"),
      ...digitBox(46, 150, "5"), ...digitBox(106, 150, "1"), ...digitBox(166, 150, "7"), tm(46, 210, "4 + simpanan 1", 10, "middle"),
      ...steps([["Pisah 4 _ 7"], ["4 + 7 = 11"], ["Tulis 1, simpan 1"], ["Depan 4 + 1 = 5"]], "517")];
    const cols = [418, 442, 466], right: El[] = [];
    [["4", "7", "0"], ["", "4", "7"]].forEach((row, r) => row.forEach((d, c) => right.push(tb(cols[c], 100 + r * 30, d, 22, "middle"))));
    right.push(tb(392, 130, "+", 22, "middle"), line(382, 140, 482, 140, { sw: 2 }), ...["5", "1", "7"].map((d, c) => tb(cols[c], 170, d, 22, "middle")),
      `<rect x="${cols[1] - 13}" y="78" width="26" height="60" rx="6" fill="none" stroke="${INK}" stroke-width="1.5" stroke-dasharray="5 4"/>`,
      tm(500, 100, "47 × 11", 12), tm(500, 116, "= 470 + 47", 12), t(500, 140, "kolom tengah", { size: 12, w: 600 }), t(500, 156, "= 4 + 7", { size: 12, w: 600 }),
      ...lines(348, 208, [["Satuan tetap 7."], ["Tengah = jumlah kedua digit."], ["Depan = 4 (+ simpanan)."]], 12.5, 17));
    return svg("Pembahasan 47 kali 11", "47 × 11 — trik kali 11", left, right);
  },
  "K05-N-003": () => {
    const left = [...silang("97", "−3", "96", "−4", "93", "12"),
      ...steps([["Jarak: −3 dan −4", "masing-masing ke 100"], ["Silang 97 − 4 = 93", "atau 96 − 3, sama"], ["Kali 3 × 4 = 12"], ["Gabung 93 | 12"]], "9.312")];
    const [x0, y0, s, a, b] = [352, 72, 110, 16, 20];
    const right = [rect(x0, y0, s, s), rect(x0 + s - a, y0, a, s, "url(#hatch)"), rect(x0, y0 + s - b, s, b, "url(#hatch)"), rect(x0 + s - a, y0 + s - b, a, b, INK),
      tb(x0 + (s - a) / 2, y0 + (s - b) / 2 + 4, "97 × 96", 12, "middle"), tb(x0 + s - a / 2, y0 - 4, "3", 11, "middle"), tb(x0 + s + 4, y0 + s - b / 2 + 4, "4", 11),
      ...lines(482, 86, [["100 × 100 = 10.000"], ["− pita 3 × 100"], ["− pita 4 × 100"], ["+ pojok 3 × 4"], ["= 9.300 + 12", 700]], 12, 20),
      ...lines(348, 208, [["Pojok 3 × 4 (hitam) ikut terbuang"], ["dua kali, jadi dikembalikan sekali."]], 12.5, 17)];
    return svg("Pembahasan 97 kali 96 metode basis 100", "97 × 96 — basis 100", left, right);
  },
  "K05-N-004": () => {
    const left = [tb(100, 76, "84 × 125", 22, "middle"), line(100, 86, 100, 106, { arrow: true }), tm(108, 100, "× 1000", 11),
      ...pill(100, 110, 140, "84.000"), line(100, 144, 100, 164, { arrow: true }), tm(108, 158, "÷ 8", 11), ...pill(100, 168, 140, "10.500"),
      ...steps([["125 = 1000 ÷ 8"], ["84 × 1000", "= 84.000"], ["84.000 ÷ 8", "84 ÷ 8 = 10,5"], ["Geser koma 3×"]], "10.500")];
    const right = [...bar(352, 80, 240, 32, 8, 1, () => "125"), `<path d="M352 128 q0 10 10 10 h100 q10 0 10 10 q0 -10 10 -10 h100 q10 0 10 -10" fill="none" stroke="${INK}" stroke-width="1.2"/>`,
      tb(472, 166, "8 × 125 = 1000", 13, "middle"),
      ...lines(348, 200, [["Jadi 125 = 1000 ÷ 8, sehingga"], ["× 125 = × 1000 lalu ÷ 8."], ["Tambah nol + bagi 8: lebih ringan.", 600]], 12.5, 17)];
    return svg("Pembahasan 84 kali 125", "84 × 125 — kali 1000 bagi 8", left, right);
  },
  "K05-N-005": () => {
    const left = [line(24, 100, 184, 100, { sw: 2 }), ...[[34, "47"], [104, "50"], [174, "53"]].flatMap(([x, s]) => [line(+x, 92, +x, 108, { sw: 2 }), tb(+x, 128, String(s), 16, "middle")]),
      curve("M38 86 Q 70 62 100 86", false), curve("M108 86 Q 140 62 170 86", false), tb(69, 68, "3", 13, "middle"), tb(139, 68, "3", 13, "middle"),
      tb(104, 170, "50² − 3²", 20, "middle"), tm(104, 196, "= 2.500 − 9", 13, "middle"),
      ...steps([["Tengah 50, jarak 3"], ["50² = 2.500"], ["3² = 9"], ["2.500 − 9"]], "2.491")];
    const [x0, y0, s, c] = [352, 72, 100, 28];
    const right = [`<path d="M${x0} ${y0} h${s} v${s - c} h${-c} v${c} h${-(s - c)} z" fill="#fff" stroke="${INK}" stroke-width="1.5"/>`,
      rect(x0 + s - c, y0 + s - c, c, c, "url(#hatch)", true), tb(x0 + (s - c) / 2, y0 + (s - c) / 2 + 4, "50²", 13, "middle"),
      tm(x0 + s - c / 2, y0 + s + 12, "3² dibuang", 10, "middle"),
      ...lines(472, 88, [["Sisa bentuk L ="], ["50² − 3²"], ["potong & tempel"], ["jadi persegi panjang"], ["53 × 47", 700]], 12, 19),
      ...lines(348, 208, [["(a + b)(a − b) = a² − b²"], ["a = 50 (tengah), b = 3 (jarak)", 600]], 12.5, 17)];
    return svg("Pembahasan 53 kali 47 selisih kuadrat", "53 × 47 — selisih kuadrat", left, right);
  },
  "K05-N-006": () => {
    const left = [...silang("104", "+4", "108", "+8", "112", "32"),
      ...steps([["Lebih: +4 dan +8", "masing-masing dari 100"], ["104 + 8 = 112", "silang; atau 108 + 4"], ["Kali 4 × 8 = 32"], ["Gabung 112 | 32"]], "11.232")];
    const [x0, y0, s, a, b] = [352, 70, 96, 18, 26];
    const right = [rect(x0, y0, s, s), rect(x0 + s, y0, a, s, "url(#hatch)"), rect(x0, y0 + s, s, b, "url(#hatch)"), rect(x0 + s, y0 + s, a, b, INK),
      tb(x0 + s / 2, y0 + s / 2 + 4, "100²", 13, "middle"), tb(x0 + s + a / 2, y0 - 4, "4", 11, "middle"), tb(x0 + s + a + 4, y0 + s + b / 2 + 4, "8", 11),
      ...lines(486, 86, [["100 × 100 = 10.000"], ["+ pita 4 × 100"], ["+ pita 8 × 100"], ["+ pojok 4 × 8"], ["= 11.200 + 32", 700]], 12, 20),
      ...lines(348, 220, [["Di atas 100: semua bagian ditambah."], ["Kotak utuh = 104 × 108."]], 12.5, 17)];
    return svg("Pembahasan 104 kali 108 basis 100", "104 × 108 — basis 100 (di atas)", left, right);
  },
  "K05-N-007": () => {
    const left = [tb(100, 80, "16% dari 25", 18, "middle"), line(100, 92, 100, 136, { arrow: true }), tm(108, 118, "tukar", 11), tb(100, 156, "25% dari 16", 18, "middle"), tm(100, 182, "25% = ¼", 12, "middle"), tb(100, 210, "16 ÷ 4", 16, "middle"),
      ...steps([["Tukar angkanya"], ["25% dari 16"], ["25% = ¼"], ["16 ÷ 4"]], "4")];
    const right = [...frac(410, 96, "16 × 25", "100", 16), tb(470, 114, "=", 18, "middle"), ...frac(530, 96, "25 × 16", "100", 16),
      ...lines(348, 172, [["Pembilangnya sama: 16 × 25."], ["Urutan kali boleh ditukar."], ["Pilih sisi yang persennya enak", 600], ["(20%, 25%, 50%).", 600]], 12.5, 18)];
    return svg("Pembahasan 16 persen dari 25", "16% dari 25 — persen dibalik", left, right);
  },
  "K05-N-008": () => {
    const left = [tb(100, 72, "640", 16, "middle"), ...bar(24, 82, 160, 34, 8, 3, () => "80"), tm(100, 146, "3 dari 8 bagian", 11, "middle"),
      tb(100, 178, "3 × 80", 18, "middle"), tm(100, 202, "640 ÷ 8 = 80", 12, "middle"),
      ...steps([["37,5% = 3/8"], ["640 ÷ 8 = 80"], ["3 × 80"]], "240")];
    const right = [...lines(352, 88, [["1/8 = 12,5%"], ["3/8 = 37,5%", 700], ["5/8 = 62,5%"], ["7/8 = 87,5%"]], 13, 22),
      ...bar(476, 76, 110, 22, 8, 3), tm(476, 116, "37,5 = 3 × 12,5", 11),
      ...lines(348, 200, [["Persen kelipatan 12,5% = per 8."], ["Bagi 8 lebih ringan daripada"], ["kali 0,375.", 600]], 12.5, 17)];
    return svg("Pembahasan 37,5 persen dari 640", "37,5% dari 640 — jangkar per 8", left, right);
  },
  "K05-N-009": () => {
    const left = [tb(100, 72, "2.400", 16, "middle"), ...bar(24, 82, 160, 34, 8, 7), rect(164, 82, 20, 34, "#fff", false, 0, 2.5), tm(174, 132, "300", 10, "middle"),
      tm(90, 132, "7/8 = 87,5%", 10, "middle"), tb(100, 172, "2.400 − 300", 18, "middle"), tm(100, 196, "buang 1 bagian saja", 12, "middle"),
      ...steps([["87,5% = 1 − 1/8"], ["2.400 ÷ 8 = 300"], ["2.400 − 300"]], "2.100")];
    const right = [...bar(352, 82, 220, 30, 10, 9), tm(462, 128, "p% = 100% − sisa kecil", 11, "middle"),
      ...lines(348, 160, [["Persen dekat 100: hitung bagian"], ["yang dibuang, lalu kurangkan."], ["Contoh: 95% dari 360", 600], ["= 360 − 18 = 342", 600]], 12.5, 18)];
    return svg("Pembahasan 87,5 persen dari 2.400", "87,5% dari 2.400 — komplemen", left, right);
  },
  "K05-N-010": () => {
    const left = [...pill(100, 50, 120, "50.000", 15), line(100, 82, 100, 104, { arrow: true }), tm(108, 98, "× 1,2  (naik 20%)", 10),
      ...pill(100, 108, 120, "60.000", 15), line(100, 140, 100, 162, { arrow: true }), tm(108, 156, "× 0,8  (turun 20%)", 10), ...pill(100, 166, 120, "48.000", 15),
      ...steps([["Naik = × 1,2"], ["Turun = × 0,8"], ["1,2 × 0,8 = 0,96"], ["Turun 4%"]], "Rp48.000")];
    const [x0, y0, s, p] = [352, 74, 100, 20];
    const right = [rect(x0, y0, s - 0, s - p), rect(x0 + s, y0, p, s - p, "url(#hatch)"), rect(x0, y0 + s - p, s, p, "#fff", true), rect(x0 + s, y0 + s - p, p, p, INK),
      tb(x0 + s / 2, y0 + (s - p) / 2 + 4, "1 × 0,8", 12, "middle"), tm(x0 + s + p / 2, y0 - 4, "+0,2", 10, "middle"), tm(x0 + s / 2, y0 + s + 13, "−0,2 (dibuang)", 10, "middle"),
      ...lines(486, 88, [["kotak 1,2 × 0,8"], ["= 1 − 0,2²"], ["= 1 − 0,04"], ["= 0,96", 700]], 12, 20),
      ...lines(348, 222, [["Naik p% lalu turun p%: selalu"], ["turun p² (tidak pernah impas).", 600]], 12.5, 17)];
    return svg("Pembahasan naik 20 persen lalu turun 20 persen", "Naik 20% lalu turun 20%", left, right);
  },
  "K05-N-011": () => {
    const left = [tb(100, 70, "0,125 × 4,8", 15, "middle"), tb(100, 92, "+ 0,125 × 15,2", 15, "middle"), line(100, 102, 100, 122, { arrow: true }),
      tb(100, 144, "0,125 × (4,8 + 15,2)", 13, "middle"), tb(100, 174, "0,125 × 20", 17, "middle"), tm(100, 200, "= 20 ÷ 8", 13, "middle"),
      ...steps([["12,5% = 0,125"], ["Keluarkan 0,125"], ["4,8 + 15,2 = 20"], ["20 ÷ 8"]], "2,5")];
    const right = [rect(352, 84, 56, 40, "url(#hatch)"), rect(408, 84, 176, 40), tm(380, 140, "4,8", 11, "middle"), tm(496, 140, "15,2", 11, "middle"),
      tm(352, 78, "tinggi 0,125", 10), `<path d="M352 150 q0 8 8 8 h106 q8 0 8 8 q0 -8 8 -8 h94 q8 0 8 -8" fill="none" stroke="${INK}" stroke-width="1.2"/>`,
      tb(468, 186, "lebar 20", 12, "middle"),
      ...lines(348, 214, [["ab + ac = a(b + c): dua kotak setinggi"], ["sama digabung jadi satu kotak.", 600]], 12.5, 17)];
    return svg("Pembahasan faktor sama", "12,5% × 4,8 + 0,125 × 15,2", left, right);
  },
  "K05-N-012": () => {
    const [l, r] = bagiKali("345", "5", "2", ["690"], "69", "0");
    return svg("Pembahasan 345 dibagi 5", "345 ÷ 5 — kali 2, bagi 10", [...l, ...steps([["5 = 10 ÷ 2"], ["345 × 2 = 690"], ["690 ÷ 10"]], "69")], r);
  },
  "K05-N-013": () => {
    const [l, r] = bagiKali("2.350", "25", "4", ["4.700", "9.400"], "94", "00");
    return svg("Pembahasan 2.350 dibagi 25", "2.350 ÷ 25 — kali 4, bagi 100", [...l, ...steps([["25 = 100 ÷ 4"], ["Gandakan 2 kali", "2.350 → 4.700 → 9.400"], ["9.400 ÷ 100"]], "94")], r);
  },
  "K05-N-014": () => {
    const [l, r] = bagiKali("4.875", "125", "8", ["9.750", "19.500", "39.000"], "39", "000");
    return svg("Pembahasan 4.875 dibagi 125", "4.875 ÷ 125 — kali 8, bagi 1000", [...l, ...steps([["125 = 1000 ÷ 8"], ["Gandakan 3 kali", "4.875 × 2 × 2 × 2"], ["39.000 ÷ 1000"]], "39")], r);
  },
  "K05-N-015": () => {
    const opts = ["17.800", "17.802", "17.804", "17.806", "17.808"];
    const left = [tb(100, 68, "387 × 46", 18, "middle"), tm(100, 88, "satuan: 7 × 6 = 42 → 2", 11, "middle"),
      ...opts.flatMap((o, i) => {
        const y = 108 + i * 22, ok = o.endsWith("2");
        return [t(110, y, o.slice(0, -1), { size: 15, w: 600, anchor: "end", fill: ok ? INK : MUTED }), t(118, y, o.slice(-1), { size: 15, w: 700, anchor: "middle", fill: ok ? INK : MUTED }),
          ok ? rect(108, y - 15, 20, 20, "none", false, 4, 2) : line(60, y - 5, 140, y - 5, { sw: 1 })];
      }),
      ...steps([["Cek opsi: beda", "hanya di angka satuan"], ["7 × 6 = 42"], ["Satuan = 2"], ["Pilih yang ber-2"]], "17.802")];
    const x0 = 368, y0 = 72, cw = [92, 56], rh = [34, 30];
    const cells = [["380 × 40", "380 × 6"], ["7 × 40", "7 × 6"]], tail = [["…0", "…0"], ["…0", "…2"]];
    const right: El[] = [tm(x0 + cw[0] / 2, y0 - 4, "40", 10, "middle"), tm(x0 + cw[0] + cw[1] / 2, y0 - 4, "6", 10, "middle"), tm(x0 - 4, y0 + 20, "380", 10, "end"), tm(x0 - 4, y0 + rh[0] + 18, "7", 10, "end")];
    cells.forEach((row, r) => row.forEach((s, c) => {
      const x = x0 + (c ? cw[0] : 0), y = y0 + (r ? rh[0] : 0), last = r === 1 && c === 1;
      right.push(rect(x, y, cw[c], rh[r], last ? INK : "#fff"), t(x + cw[c] / 2, y + rh[r] / 2 - 1, s, { size: 11, w: 600, anchor: "middle", fill: last ? "#fff" : INK }),
        t(x + cw[c] / 2, y + rh[r] / 2 + 12, tail[r][c], { size: 10, anchor: "middle", fill: last ? "#fff" : MUTED }));
    }));
    right.push(...lines(524, 90, [["Tiga kotak"], ["berakhiran 0."], ["Satuan hanya"], ["dari 7 × 6.", 700]], 12, 18),
      ...lines(348, 172, [["Lihat opsi dulu sebelum menghitung."], ["Kalau opsi hanya beda di satuan,"], ["cukup kalikan satuannya.", 600]], 12.5, 18));
    return svg("Pembahasan cek angka satuan 387 kali 46", "387 × 46 — cek angka satuan", left, right);
  },
  "K05-N-016": () => {
    const left = [...lines(20, 70, [["4.567 → 4+5+6+7 = 22 → 4"], ["23 → 2+3 = 5"], ["4 × 5 = 20 → 2", 700]], 12.5, 22),
      ...[["105.041", "11 → 2", true], ["104.941", "19 → 1", false], ["105.141", "12 → 3", false]].flatMap(([o, r, ok], i) => {
        const y = 150 + i * 22;
        return [t(20, y, String(o), { size: 13, w: ok ? 700 : 400, fill: ok ? INK : MUTED }), t(88, y, String(r), { size: 12, fill: ok ? INK : MUTED, w: ok ? 700 : 400 }), t(150, y, ok ? "✓" : "✗", { size: 13, w: 700, fill: ok ? INK : MUTED })];
      }),
      ...steps([["Digit 4.567 → 4"], ["Digit 23 → 5"], ["4 × 5 = 20 → 2"], ["Opsi yang → 2"]], "105.041")];
    const right = [tb(352, 86, "4.567 = 4×1000 + 5×100 + 6×10 + 7", 11.5),
      ...lines(352, 110, [["1000 = 999 + 1"], ["100 = 99 + 1"], ["10 = 9 + 1"]], 12, 18),
      tm(464, 128, "999, 99, 9 habis", 11), tm(464, 144, "dibagi 9: sisa 1", 11),
      ...lines(348, 184, [["Jadi sisa bagi 9 dari 4.567"], ["= sisa bagi 9 dari 4+5+6+7.", 600], ["Berlaku juga untuk hasil kali."]], 12.5, 18)];
    return svg("Pembahasan cek sembilan 4.567 kali 23", "4.567 × 23 — cek sembilan", left, right);
  },
  "K05-N-017": () => {
    const left = [line(20, 120, 186, 120, { sw: 2 }), ...[[30, "487"], [150, "787"], [170, "786"]].flatMap(([x, s], i) => [line(+x, 112, +x, 128, { sw: 2 }), tb(+x, i === 2 ? 164 : 146, String(s), 13, "middle")]),
      curve("M34 108 Q 90 56 146 108", false), tb(90, 70, "+ 300", 14, "middle"), curve("M150 104 Q 160 92 168 106", false), tb(160, 88, "− 1", 12, "middle"),
      tb(100, 200, "487 + 300 − 1", 15, "middle"),
      ...steps([["299 = 300 − 1"], ["487 + 300 = 787"], ["787 − 1"]], "786")];
    const right = [tb(352, 92, "a + 299", 16), tb(352, 118, "= a + (300 − 1)", 16), tb(352, 144, "= (a + 300) − 1", 16),
      ...lines(348, 184, [["Tambah ratusan bulat tanpa simpan,"], ["lalu satu koreksi kecil."], ["+ 198 = + 200 − 2, − 99 = − 100 + 1", 600]], 12.5, 18)];
    return svg("Pembahasan 487 tambah 299 kompensasi", "487 + 299 — kompensasi", left, right);
  },
  "K05-N-018": () => {
    const cols = [64, 108, 152];
    const left = [...["9", "9", "10"].map((d, i) => tb(cols[i], 74, d, 18, "middle")), tm(20, 74, "dari", 10),
      ...["3", "6", "8"].map((d, i) => tb(cols[i], 106, `− ${d}`, 16, "middle")), line(36, 118, 176, 118, { sw: 2 }),
      ...["6", "3", "2"].map((d, i) => tb(cols[i], 150, d, 26, "middle")), rect(cols[2] - 18, 52, 36, 106, "none", true, 6), tm(cols[2], 178, "terakhir dari 10", 10, "middle"),
      ...steps([["9 − 3 = 6"], ["9 − 6 = 3"], ["10 − 8 = 2"], ["Tanpa meminjam"]], "632")];
    const right = [tb(352, 90, "1.000 = 999 + 1", 15), tb(352, 118, "999 − 368 = 631", 15), tm(352, 136, "(tiap digit ≤ 9: tidak pernah meminjam)", 11), tb(352, 162, "631 + 1 = 632", 15),
      ...lines(348, 200, [["+1 itu yang membuat digit terakhir"], ["dikurangkan dari 10.", 600], ["Rp10.000 − Rp3.750 → Rp6.250"]], 12.5, 17)];
    return svg("Pembahasan 1.000 dikurangi 368", "1.000 − 368 — semua dari 9, terakhir dari 10", left, right);
  },
  "K05-N-019": () => {
    const xs = [30, 68, 106, 144, 180], ns = ["28", "47", "72", "53", "15"];
    const left = [...ns.map((n, i) => tb(xs[i], 112, n, 16, "middle")), ...[0, 1, 2, 3].map((i) => tb((xs[i] + xs[i + 1]) / 2, 112, "+", 13, "middle")),
      curve(`M${xs[0]} 94 Q ${(xs[0] + xs[2]) / 2} 54 ${xs[2]} 92`, false), tb((xs[0] + xs[2]) / 2, 66, "100", 12, "middle"),
      curve(`M${xs[1]} 122 Q ${(xs[1] + xs[3]) / 2} 162 ${xs[3]} 124`, false), tb((xs[1] + xs[3]) / 2, 160, "100", 12, "middle"),
      tb(100, 204, "100 + 100 + 15", 16, "middle"),
      ...steps([["28 + 72 = 100"], ["47 + 53 = 100"], ["Sisa + 15"]], "215")];
    const right = [...lines(352, 88, [["Urutan dan kelompok"], ["penjumlahan boleh diubah."]], 12.5, 18),
      ...lines(352, 136, [["Pasangan satuan:"], ["8 + 2 = 10, 7 + 3 = 10"]], 12.5, 18), tb(352, 178, "Cari pasangan 1+9, 2+8, 3+7, 4+6, 5+5", 11.5),
      ...lines(348, 214, [["Hasil antara jadi bulat:"], ["tidak ada simpanan berantai.", 600]], 12.5, 17)];
    return svg("Pembahasan pasangan genap", "28 + 47 + 72 + 53 + 15 — pasangan", left, right);
  },
  "K05-N-020": () => {
    const nl = (y: number, a: number, b: number, la: string, lb: string): El[] => [line(20, y, 186, y, { sw: 1.5 }), line(a, y - 7, a, y + 7, { sw: 2 }), line(b, y - 7, b, y + 7, { sw: 2 }),
      tb(a, y + 22, la, 12, "middle"), tb(b, y + 22, lb, 12, "middle"), `<line x1="${a}" y1="${y - 14}" x2="${b}" y2="${y - 14}" stroke="${INK}" stroke-width="1.2" marker-start="url(#ah)" marker-end="url(#ah)"/>`];
    const left = [...nl(80, 40, 150, "2.997", "5.003"), tm(40, 132, "keduanya + 3", 11), line(28, 112, 28, 140, { arrow: true }), ...nl(160, 48, 158, "3.000", "5.006"),
      tb(100, 214, "5.006 − 3.000", 15, "middle"),
      ...steps([["Geser + 3", "keduanya"], ["5.006 − 3.000"]], "2.006")];
    const right = [tb(352, 92, "(a + k) − (b + k) = a − b", 14),
      ...lines(352, 124, [["Dua orang berjalan bersama"], ["sejauh k: jaraknya tetap."]], 12.5, 18),
      ...lines(348, 184, [["Pilih k supaya pengurang bulat."], ["Pengurangan: geser searah.", 600], ["Penjumlahan: geser berlawanan.", 600]], 12.5, 18)];
    return svg("Pembahasan 5.003 dikurangi 2.997", "5.003 − 2.997 — geser bersama", left, right);
  },
};

const out = process.argv[2] ?? join(process.cwd(), "data/drill-pembahasan");
for (const [id, fn] of Object.entries(ITEMS)) writeFileSync(join(out, `${id}.svg`), fn());
console.log(`${Object.keys(ITEMS).length} SVG -> ${out}`);
