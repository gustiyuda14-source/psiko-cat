/**
 * Gambar pembahasan K05 trik batch 2 (K05-N-021..060), kunci = nomor butir.
 * Gaya sama dengan generate-k05-trik-svg.ts (hitam-putih, 616 × 260): kiri contoh, tengah langkah, kanan "Kenapa bisa?".
 */
import { INK, MUTED, t, tb, tm, rect, line, curve, digitBox, pill, lines, steps, svg, silang, frac, bar, bagiKali } from "./generate-k05-trik-svg";

type El = string;
type Rows = [string, number?][];
const rl = (y: number, rows: Rows, size = 12.5, gap = 18) => lines(348, y, rows, size, gap);
const H = "url(#hatch)";

/** Alur satu bilangan lewat 1–3 operasi, tiap hasil di dalam kotak. */
function flow(input: string, ops: [string, string][], size = 22): El[] {
  const gap = ops.length > 2 ? 54 : 62, y0 = 100, out: El[] = [tb(100, 66, input, size, "middle")];
  ops.forEach(([op, val], i) => {
    const yp = y0 + i * gap, from = i === 0 ? 74 : yp - gap + 34;
    out.push(line(100, from, 100, yp - 4, { arrow: true }), tm(108, (from + yp) / 2 + 3, op, 11), ...pill(100, yp, 150, val, 16));
  });
  return out;
}
const rFrac = (a: string, b: string, c: string, d: string, rows: Rows): El[] =>
  [...frac(420, 96, a, b), tb(466, 114, "=", 18, "middle"), ...frac(536, 96, c, d, 15), ...rl(172, rows, 12.5, 18)];
const R = (label: string, title: string, left: El[], right: El[]) => svg(label, title, left, right);

/** Persegi (a + b)²: kotak besar + dua pita + pojok (dari N-001). */
function sqModel(big: string, corner: string, t1: string, t2: string, rows: Rows): El[] {
  const [x0, y0, B, s] = [352, 76, 90, 18];
  return [rect(x0, y0, B, B), tb(x0 + B / 2, y0 + B / 2 + 5, big, 12, "middle"), rect(x0 + B, y0, s, B, H), rect(x0, y0 + B, B, s, H, true), rect(x0 + B, y0 + B, s, s, INK),
    t(x0 + B + s / 2, y0 + B + s / 2 + 3, corner, { size: 8, fill: "#fff", w: 700, anchor: "middle" }), rect(x0 + B + s, y0, s, B, "none", true), tm(x0 + B + s * 1.5, y0 - 5, "ke sini", 10, "middle"),
    curve(`M${x0 + B / 2} ${y0 + B + s + 2} Q ${x0 + B + s * 2 + 16} ${y0 + B + s + 14} ${x0 + B + s * 1.5} ${y0 + B / 2 + 12}`), tm(486, 92, t1, 11.5), tm(486, 109, t2, 11.5), ...rl(208, rows, 12.5, 17)];
}
function sq5Left(d1: string, front: string, res1: string): El[] {
  return [...digitBox(66, 48, d1), ...digitBox(146, 48, "5"), line(66, 96, 66, 124, { arrow: true }), line(146, 96, 146, 124, { arrow: true }), tb(66, 142, front, 14, "middle"), tb(146, 142, "5 × 5", 14, "middle"),
    rect(30, 156, 72, 46, "#fff", false, 6), tb(66, 188, res1, 26, "middle"), rect(110, 156, 72, 46, "#fff", false, 6), tb(146, 188, "25", 26, "middle"), tm(106, 222, "tempel berdampingan", 11, "middle")];
}
/** Tabel 2 × 2 berlabel (dari N-015). */
function grid(x0: number, y0: number, cw: number[], rh: number[], head: string[], side: string[], cells: string[][][], last = false): El[] {
  const out: El[] = [tm(x0 + cw[0] / 2, y0 - 4, head[0], 10, "middle"), tm(x0 + cw[0] + cw[1] / 2, y0 - 4, head[1], 10, "middle"), tm(x0 - 4, y0 + rh[0] / 2 + 4, side[0], 10, "end"), tm(x0 - 4, y0 + rh[0] + rh[1] / 2 + 4, side[1], 10, "end")];
  cells.forEach((row, r) => row.forEach(([a, b], c) => {
    const x = x0 + (c ? cw[0] : 0), y = y0 + (r ? rh[0] : 0), dark = last && r === 1 && c === 1;
    out.push(rect(x, y, cw[c], rh[r], dark ? INK : "#fff"), t(x + cw[c] / 2, y + rh[r] / 2 - 1, a, { size: 11, w: 600, anchor: "middle", fill: dark ? "#fff" : INK }), t(x + cw[c] / 2, y + rh[r] / 2 + 12, b, { size: 10.5, anchor: "middle", fill: dark ? "#fff" : MUTED }));
  }));
  return out;
}
/** Selisih kuadrat: 3 titik di garis bilangan + bentuk L (dari N-005). */
function selisih(lo: string, mid: string, hi: string, b: string, a2: string, bigNum: string, expr: string, ex2: string, prod: string, step: [string, string?][], res: string): [El[], El[]] {
  const left = [line(24, 100, 184, 100, { sw: 2 }), ...[[34, lo], [104, mid], [174, hi]].flatMap(([x, s]) => [line(+x, 92, +x, 108, { sw: 2 }), tb(+x, 128, String(s), 16, "middle")]),
    curve("M38 86 Q 70 62 100 86", false), curve("M108 86 Q 140 62 170 86", false), tb(69, 68, b, 13, "middle"), tb(139, 68, b, 13, "middle"), tb(104, 170, expr, 20, "middle"), tm(104, 196, ex2, 13, "middle"), ...steps(step, res)];
  const [x0, y0, s, c] = [352, 72, 100, 28];
  const right = [`<path d="M${x0} ${y0} h${s} v${s - c} h${-c} v${c} h${-(s - c)} z" fill="#fff" stroke="${INK}" stroke-width="1.5"/>`, rect(x0 + s - c, y0 + s - c, c, c, H, true), tb(x0 + (s - c) / 2, y0 + (s - c) / 2 + 4, a2, 13, "middle"),
    tm(x0 + s - c / 2, y0 + s + 12, `${b}² dibuang`, 10, "middle"), ...lines(472, 88, [["Sisa bentuk L ="], [bigNum], ["potong & tempel"], ["jadi persegi panjang"], [prod, 700]], 12, 19),
    ...rl(208, [["(a + b)(a − b) = a² − b²"], [`a = ${mid} (tengah), b = ${b} (jarak)`, 600]], 12.5, 17)];
  return [left, right];
}
/** Garis bilangan kompensasi: titik awal → loncat bulat → koreksi kecil. */
function komp(ticks: [number, string, number][], arcs: [string, number, number, string][], expr: string, step: [string, string?][], res: string, rightTop: string[], rows: Rows): [El[], El[]] {
  const left = [line(20, 120, 186, 120, { sw: 2 }), ...ticks.flatMap(([x, s, ty]) => [line(x, 112, x, 128, { sw: 2 }), tb(x, ty, s, 13, "middle")]), ...arcs.flatMap(([d, lx, ly, lab]) => [curve(d, false), tb(lx, ly, lab, 13, "middle")]), tb(100, 200, expr, 15, "middle"), ...steps(step, res)];
  return [left, [tb(352, 92, rightTop[0], 16), tb(352, 118, rightTop[1], 16), tb(352, 144, rightTop[2], 16), ...rl(184, rows, 12.5, 18)]];
}
/** Cek angka satuan: daftar opsi + tabel kotak (dari N-015). */
function satuan(a: string, b: string, unit: string, opts: string[], okEnd: string, cells: string[][][], rows: Rows, step: [string, string?][], res: string): [El[], El[]] {
  const left = [tb(100, 68, `${a} × ${b}`, 18, "middle"), tm(100, 88, unit, 11, "middle"), ...opts.flatMap((o, i) => {
    const y = 108 + i * 22, ok = o.endsWith(okEnd);
    return [t(110, y, o.slice(0, -1), { size: 15, w: 600, anchor: "end", fill: ok ? INK : MUTED }), t(118, y, o.slice(-1), { size: 15, w: 700, anchor: "middle", fill: ok ? INK : MUTED }), ok ? rect(108, y - 15, 20, 20, "none", false, 4, 2) : line(60, y - 5, 140, y - 5, { sw: 1 })];
  }), ...steps(step, res)];
  return [left, [...grid(368, 84, [92, 56], [34, 30], [b.slice(0, 1) + "0", b.slice(1)], [a.slice(0, 2) + "0", a.slice(2)], cells, true), ...lines(524, 102, [["Tiga kotak"], ["berakhiran 0."], ["Satuan hanya"], [`dari ${a.slice(2)} × ${b.slice(1)}.`, 700]], 12, 18), ...rl(184, rows, 12.5, 18)]];
}
const bagiBar = (n: number, k: number, lab: string): El[] => bar(352, 84, 240, 34, n, k, () => lab);

export const SVG: Record<number, () => string> = {
  // ===== KALI =====
  21: () => R("Pembahasan 85 kuadrat trik akhiran 5", "85² — trik akhiran 5", [...sq5Left("8", "8 × 9", "72"), ...steps([["Pisah 8 | 5"], ["8 × 9 = 72", "kali angka berikutnya"], ["Belakang = 25"], ["Tempel 72 | 25"]], "7.225")],
    sqModel("80 × 80", "25", "85² = 80² + dua pita", "80 × 5 + pojok 5 × 5", [["Pita bawah pindah ke kanan:"], ["80 × 90 = 7.200", 600], ["+ pojok 25 = 7.225", 700]])),
  22: () => R("Pembahasan 168 kali 5", "168 × 5 — bagi 2, kali 10", [...flow("168 × 5", [["÷ 2", "84"], ["× 10", "840"]]), ...steps([["5 = 10 ÷ 2"], ["168 ÷ 2 = 84"], ["84 × 10"]], "840")],
    [tb(352, 92, "× 5 = × 10 ÷ 2", 17), ...bar(352, 106, 240, 28, 10, 5), tm(472, 150, "5 = setengah dari 10", 11, "middle"), ...rl(180, [["Kali 10 hanya menambah nol,"], ["lalu bagi 2: lebih ringan", 600], ["daripada simpan-menyimpan."]], 12.5, 18)]),
  23: () => R("Pembahasan 76 kali 25", "76 × 25 — bagi 4, kali 100", [...flow("76 × 25", [["÷ 4", "19"], ["× 100", "1.900"]]), ...steps([["25 = 100 ÷ 4"], ["76 ÷ 4 = 19"], ["19 × 100"]], "1.900")],
    [...bar(352, 84, 240, 34, 4, 0, () => "25"), tb(472, 160, "4 × 25 = 100", 14, "middle"), ...rl(186, [["Empat koin Rp25 = Rp100."], ["Jadi × 25 = × 100 lalu ÷ 4."], ["Bagi 4 = bagi 2 dua kali:", 600], ["76 → 38 → 19", 600]], 12.5, 18)]),
  24: () => {
    const cx = [44, 84, 124, 164], row = (y: number, ds: string[]) => ds.map((d, i) => tb(cx[i], y, d, 22, "middle"));
    const left = [...row(92, ["2", "7", "8", "0"]), tb(20, 122, "+", 20, "middle"), ...row(122, ["", "2", "7", "8"]), line(22, 134, 186, 134, { sw: 2 }), ...row(166, ["3", "0", "5", "8"]),
      tm(cx[0], 70, "1", 11, "middle"), tm(cx[1], 70, "1", 11, "middle"), tm(100, 198, "angka kecil = simpanan", 10, "middle"), ...steps([["Satuan: 8"], ["8 + 7 = 15", "tulis 5, simpan 1"], ["7 + 2 + 1 = 10", "tulis 0, simpan 1"], ["2 + 1 = 3"]], "3.058")];
    return R("Pembahasan 278 kali 11", "278 × 11 — kali 11", left, [tb(352, 92, "278 × 11 = 278 × 10 + 278", 13), ...rl(122, [["Jumlahkan 2.780 dan 278 kolom demi"], ["kolom: tiap kolom = dua digit yang"], ["bertetangga (8 + 7, 7 + 2, …)."], ["Itu sebabnya aturannya", 600], ["'jumlahkan tetangga'.", 600]], 12.5, 18)]);
  },
  25: () => R("Pembahasan 47 kali 99", "47 × 99 — kali 100 kurang 1", [...flow("47 × 99", [["× 100", "4.700"], ["− 47", "4.653"]]), ...steps([["99 = 100 − 1"], ["47 × 100 = 4.700"], ["4.700 − 47"]], "4.653")],
    [rect(352, 84, 190, 56), tb(447, 118, "47 × 99", 14, "middle"), rect(542, 84, 24, 56, H, true), tm(554, 78, "1", 10, "middle"), tm(447, 78, "99", 10, "middle"), tm(447, 156, "47 × 100 dikurangi satu salinan 47", 11, "middle"),
      ...rl(182, [["47 × (100 − 1) = 4.700 − 47", 600], ["Pola sama: × 9 = × 10 − 1 salinan,"], ["× 999 = × 1.000 − 1 salinan."]], 12.5, 18)]),
  26: () => { const [l, r] = selisih("66", "70", "74", "4", "70²", "70² − 4²", "70² − 4²", "= 4.900 − 16", "74 × 66", [["Tengah 70, jarak 4"], ["70² = 4.900"], ["4² = 16"], ["4.900 − 16"]], "4.884"); return R("Pembahasan 74 kali 66 selisih kuadrat", "74 × 66 — selisih kuadrat", l, r); },
  27: () => R("Pembahasan 38 kali 15", "38 × 15 — kali 10 ditambah setengahnya", [tb(100, 66, "38 × 15", 20, "middle"), ...pill(100, 80, 170, "38 × 10 = 380", 15), tb(100, 134, "+", 16, "middle"), ...pill(100, 142, 170, "½ dari 380 = 190", 15), line(100, 176, 100, 196, { arrow: true }), ...pill(100, 200, 170, "570", 16),
    ...steps([["15 = 10 + 5"], ["38 × 10 = 380"], ["½ dari 380 = 190"], ["380 + 190"]], "570")],
    [tm(447, 78, "10", 10, "middle"), tm(557, 78, "5", 10, "middle"), tm(366, 116, "38", 10, "end"), rect(372, 84, 150, 56), tb(447, 117, "38 × 10", 13, "middle"), rect(522, 84, 70, 56, H), rect(532, 104, 50, 18, "#fff", false, 3, 1), tb(557, 117, "38 × 5", 11, "middle"),
      ...rl(166, [["38 × 15 = 38 × 10 + 38 × 5"], ["38 × 5 = setengah dari 38 × 10", 600], ["Jadi ×15 = × 10, lalu tambah", 600], ["setengahnya.", 600]], 12.5, 18)]),
  28: () => R("Pembahasan 43 kali 47", "43 × 47 — puluhan sama, satuan berjumlah 10", [tb(100, 62, "43 × 47", 20, "middle"), tm(100, 80, "puluhan sama (4), satuan 3 + 7 = 10", 10, "middle"), rect(30, 94, 72, 36, "#fff", false, 6), tb(66, 118, "4 × 5", 14, "middle"), rect(110, 94, 72, 36, "#fff", false, 6), tb(146, 118, "3 × 7", 14, "middle"),
    line(66, 134, 66, 150, { arrow: true }), line(146, 134, 146, 150, { arrow: true }), rect(30, 154, 72, 44, "#fff", false, 6), tb(66, 184, "20", 24, "middle"), rect(110, 154, 72, 44, "#fff", false, 6), tb(146, 184, "21", 24, "middle"), tm(106, 216, "tempel berdampingan", 11, "middle"),
    ...steps([["Puluhan sama: 4"], ["Satuan 3 + 7 = 10 ✓"], ["Depan 4 × 5 = 20"], ["Belakang 3×7 = 21"]], "2.021")],
    [...grid(368, 76, [100, 80], [38, 34], ["40", "7"], ["40", "3"], [[["40 × 40", "1.600"], ["40 × 7", "280"]], [["3 × 40", "120"], ["3 × 7", "21"]]], true), ...rl(178, [["280 + 120 = 400 = 40 × 10"], ["1.600 + 400 = 2.000 = 4 × 5 ratusan"], ["+ 21 = 2.021", 700]], 12, 17)]),
  29: () => R("Pembahasan 52 kuadrat", "52² — dekat 50", [tb(100, 64, "52 = 50 + 2", 18, "middle"), ...pill(100, 84, 160, "50² = 2.500", 15), ...pill(100, 126, 160, "+ 200 (dua pita)", 14), ...pill(100, 168, 160, "+ 4 (pojok)", 15), tm(100, 222, "2.500 + 200 + 4", 12, "middle"),
    ...steps([["52 = 50 + 2"], ["50² = 2.500"], ["2 × 50 × 2 = 200"], ["2² = 4"]], "2.704")],
    sqModel("50 × 50", "4", "52² = 50² + dua pita", "50 × 2 + pojok 2 × 2", [["Dua pita: 2 × 50 × 2 = 200"], ["Pojok: 2 × 2 = 4"], ["2.500 + 200 + 4 = 2.704", 700]])),
  30: () => R("Pembahasan 102 kali 97 basis 100", "102 × 97 — basis 100, beda arah", [...silang("102", "+2", "97", "−3", "99", "−6"), ...steps([["Jarak: +2 dan −3", "dari 100"], ["Silang → 99", "102 − 3 (atau 97 + 2)"], ["Kali 2 × (−3) = −6"], ["9.900 − 6"]], "9.894")],
    [...grid(368, 76, [104, 80], [38, 34], ["100", "−3"], ["100", "2"], [[["100 × 100", "10.000"], ["100 × (−3)", "−300"]], [["2 × 100", "+200"], ["2 × (−3)", "−6"]]]), ...rl(178, [["10.000 − 300 + 200 − 6"], ["= 9.900 − 6 = 9.894", 700], ["Silang: −3 + 2 = −1 → −100."]], 12.5, 18)]),
  // ===== PERSEN =====
  31: () => R("Pembahasan 28 persen dari 50", "28% dari 50 — persen dibalik", [tb(100, 80, "28% dari 50", 18, "middle"), line(100, 92, 100, 136, { arrow: true }), tm(108, 118, "tukar", 11), tb(100, 156, "50% dari 28", 18, "middle"), tm(100, 182, "50% = ½", 12, "middle"), tb(100, 210, "28 ÷ 2", 16, "middle"),
    ...steps([["Tukar angkanya"], ["50% dari 28"], ["50% = ½"], ["28 ÷ 2"]], "14")],
    [...frac(410, 96, "28 × 50", "100", 16), tb(470, 114, "=", 18, "middle"), ...frac(530, 96, "50 × 28", "100", 16), ...rl(172, [["Pembilangnya sama: 28 × 50."], ["Urutan kali boleh ditukar."], ["Pilih sisi yang persennya enak", 600], ["(10%, 20%, 25%, 50%).", 600]], 12.5, 18)]),
  32: () => R("Pembahasan 33 sepertiga persen dari 450", "33⅓% dari 450 — sepertiga", [tb(100, 72, "450", 16, "middle"), ...bar(24, 82, 160, 34, 3, 1, () => "150"), tm(100, 146, "1 dari 3 bagian", 11, "middle"), tb(100, 178, "450 ÷ 3", 18, "middle"), tm(100, 202, "= 150", 13, "middle"),
    ...steps([["33⅓% = ⅓"], ["Bagi 3 bagian"], ["450 ÷ 3"]], "150")],
    [...lines(352, 88, [["⅓ = 33⅓%", 700], ["⅔ = 66⅔%"], ["1/6 = 16⅔%"], ["5/6 = 83⅓%"]], 13, 22), ...bar(476, 76, 110, 22, 3, 1), tm(476, 116, "⅓ = 33⅓%", 11), ...rl(200, [["33⅓ persen = 100/3 persen,"], ["jadi 100/3 ÷ 100 = ⅓.", 600]], 12.5, 17)]),
  33: () => R("Pembahasan 95 persen dari 480", "95% dari 480 — komplemen", [tb(100, 72, "480", 16, "middle"), ...bar(24, 82, 160, 34, 20, 19), rect(24 + 19 * 8, 82, 8, 34, "#fff", false, 0, 2.5), tm(100, 132, "5% = 1 dari 20 bagian", 11, "middle"), tb(100, 172, "480 − 24", 18, "middle"), tm(100, 196, "buang 1 bagian saja", 12, "middle"),
    ...steps([["Buang 5% saja", "95% = 100% − 5%"], ["5% = 480 ÷ 20", "= 24"], ["480 − 24"]], "456")],
    [...bar(352, 82, 220, 30, 10, 9), tm(462, 128, "p% = 100% − sisa kecil", 11, "middle"), ...rl(160, [["Persen dekat 100: hitung bagian"], ["yang dibuang, lalu kurangkan."], ["Contoh: 98% dari 350", 600], ["= 350 − 7 = 343", 600]], 12.5, 18)]),
  34: () => R("Pembahasan 15 persen dari 360", "15% dari 360 — 10% ditambah setengahnya", [tb(100, 66, "15% dari 360", 18, "middle"), ...pill(100, 80, 150, "10% → 36", 16), tm(100, 126, "geser koma 1 langkah", 10, "middle"), ...pill(100, 138, 150, "5% → 18", 16), tm(100, 184, "setengah dari 10%", 10, "middle"), ...pill(100, 196, 150, "36 + 18", 16),
    ...steps([["15% = 10% + 5%"], ["10% = 36"], ["5% = ½ × 36 = 18"], ["36 + 18"]], "54")],
    [rect(352, 84, 120, 34, H), rect(472, 84, 60, 34, "#fff", true), tb(412, 138, "10%", 13, "middle"), tb(502, 138, "5%", 13, "middle"), line(352, 150, 532, 150, { sw: 1 }), tb(442, 168, "15%", 14, "middle"),
      ...rl(194, [["10% = geser koma 1 langkah."], ["5% = setengahnya.", 600], ["Berlaku: 35% = 30% + 5%, dst."]], 12.5, 18)]),
  35: () => R("Pembahasan 66 dua pertiga persen dari 270", "66⅔% dari 270 — dua pertiga", [tb(100, 72, "270", 16, "middle"), ...bar(24, 82, 160, 34, 3, 2, () => "90"), tm(100, 146, "2 dari 3 bagian", 11, "middle"), tb(100, 178, "2 × 90", 18, "middle"), tm(100, 202, "270 ÷ 3 = 90", 12, "middle"),
    ...steps([["66⅔% = ⅔"], ["270 ÷ 3 = 90"], ["2 × 90"]], "180")],
    [...lines(352, 88, [["⅓ = 33⅓%"], ["⅔ = 66⅔%", 700], ["1/6 = 16⅔%"], ["5/6 = 83⅓%"]], 13, 22), ...bar(476, 76, 110, 22, 6, 4), tm(476, 116, "4/6 = ⅔ = 66⅔%", 11), ...rl(200, [["Ingat keluarga 'sepertiga':"], ["pecahan per 3 dan per 6.", 600]], 12.5, 17)]),
  36: () => R("Pembahasan 62,5 persen dari 320", "62,5% dari 320 — jangkar per 8", [tb(100, 72, "320", 16, "middle"), ...bar(24, 82, 160, 34, 8, 5, () => "40"), tm(100, 146, "5 dari 8 bagian", 11, "middle"), tb(100, 178, "5 × 40", 18, "middle"), tm(100, 202, "320 ÷ 8 = 40", 12, "middle"),
    ...steps([["62,5% = 5/8"], ["320 ÷ 8 = 40"], ["5 × 40"]], "200")],
    [...lines(352, 88, [["1/8 = 12,5%"], ["3/8 = 37,5%"], ["5/8 = 62,5%", 700], ["7/8 = 87,5%"]], 13, 22), ...bar(476, 76, 110, 22, 8, 5), tm(476, 116, "62,5 = 5 × 12,5", 11), ...rl(200, [["Persen kelipatan 12,5% = per 8."], ["Bagi 8 lebih ringan daripada"], ["kali 0,625.", 600]], 12.5, 17)]),
  37: () => R("Pembahasan diskon berantai 20 dan 10 persen", "Diskon 20% lalu 10% — kali sisa harga", [...flow("250.000", [["× 0,8", "200.000"], ["× 0,9", "180.000"]]), ...steps([["Diskon 20%: × 0,8"], ["Diskon 10%: × 0,9"], ["0,8 × 0,9 = 0,72"], ["0,72 × 250.000"]], "Rp180.000")],
    [rect(352, 90, 100, 100), rect(352, 90, 80, 90, H), rect(362, 122, 60, 26, "#fff", false, 4, 1), tb(392, 140, "0,72", 12, "middle"), tm(392, 84, "0,8", 10, "middle"), tm(462, 140, "0,9", 10, "start"), tm(462, 112, "1", 10, "start"),
      ...lines(486, 108, [["kotak 0,8 × 0,9"], ["= 0,72"], ["bagian tersisa", 600]], 12, 19), ...rl(214, [["Diskon berantai = kali sisa harga,"], ["bukan dijumlah: 28%, bukan 30%.", 600]], 12.5, 18)]),
  38: () => R("Pembahasan kenaikan 40 menjadi 50", "40 → 50 — persen naik", [tb(100, 66, "40 → 50", 20, "middle"), ...pill(100, 82, 130, "selisih 10", 15), line(100, 116, 100, 138, { arrow: true }), tb(100, 160, "10 ÷ 40", 18, "middle"), tb(100, 188, "= ¼", 18, "middle"), tb(100, 216, "= 25%", 18, "middle"),
    ...steps([["Selisih: 10"], ["Bagi nilai AWAL"], ["10 ÷ 40 = ¼"], ["¼ = 25%"]], "25%")],
    [...[0, 1, 2, 3].map((i) => rect(352 + i * 40, 84, 40, 30)), rect(512, 84, 40, 30, H), tm(432, 130, "awal 40 = 4 bagian", 11, "middle"), tm(532, 130, "+10", 11, "middle"),
      ...rl(160, [["Persen naik = selisih ÷ AWAL."], ["Dibagi nilai akhir (10 ÷ 50 = 20%)"], ["itu persen turun dari 50.", 600]], 12.5, 18)]),
  39: () => R("Pembahasan naik 25 persen lalu turun 20 persen", "Naik 25% lalu turun 20% — impas", [...flow("Rp80.000", [["× 5/4", "Rp100.000"], ["× 4/5", "Rp80.000"]], 20), ...steps([["Naik 25%: × 5/4"], ["Turun 20%: × 4/5"], ["5/4 × 4/5 = 1"], ["Kembali ke awal"]], "Rp80.000")],
    [...frac(396, 96, "5", "4", 16), tb(430, 114, "×", 18, "middle"), ...frac(464, 96, "4", "5", 16), tb(498, 114, "=", 18, "middle"), tb(530, 114, "1", 22, "middle"),
      ...rl(168, [["Naik 25% dibatalkan turun 20%,"], ["bukan turun 25%: dasar hitungnya"], ["berbeda (80.000 → 100.000).", 600], ["Impas bila (1 + p)(1 − q) = 1."]], 12.5, 17)]),
  40: () => {
    const [x0, y0, s, p] = [352, 76, 100, 14];
    return R("Pembahasan naik 10 persen dua tahun", "Naik 10% dua kali — bunga atas bunga", [...flow("Gaji 100", [["+ 10%", "110"], ["+ 10%", "121"]]), ...steps([["Naik 10%: × 1,1"], ["1,1 × 1,1 = 1,21"], ["Naik 21%"]], "21%")],
      [rect(x0, y0, s, s), tb(x0 + s / 2, y0 + s / 2 + 5, "1 × 1", 13, "middle"), rect(x0 + s, y0, p, s, H), rect(x0, y0 + s, s, p, H), rect(x0 + s, y0 + s, p, p, INK), tm(x0 + s + p / 2, y0 - 5, "0,1", 10, "middle"), tm(x0 - 4, y0 + s + p / 2 + 3, "0,1", 10, "end"),
        ...lines(486, 92, [["(1 + 0,1)²"], ["= 1 + 0,1 + 0,1"], ["+ 0,01 (pojok)"], ["= 1,21", 700]], 12, 19), ...rl(222, [["Pojok 0,01 = bunga atas bunga:"], ["itu sebabnya total bukan 20%.", 600]], 12.5, 17)]);
  },
  // ===== BAGI =====
  41: () => R("Pembahasan 6,5 dibagi 0,25", "6,5 ÷ 0,25 — bagi seperempat = kali 4", [...flow("6,5 ÷ 0,25", [["× 4", "26"]]), ...steps([["0,25 = ¼"], ["÷ ¼ = × 4"], ["6,5 × 4 = 26"]], "26")],
    [...bagiBar(4, 0, "0,25"), tb(472, 160, "1 = 4 × 0,25", 14, "middle"), ...rl(188, [["Dalam 1 ada 4 buah 0,25."], ["Jadi membagi dengan 0,25"], ["= menghitung ada berapa 0,25", 600], ["= mengalikan 4.", 600]], 12.5, 18)]),
  42: () => { const [l, r] = bagiKali("1.275", "5", "2", ["2.550"], "255", "0"); return R("Pembahasan 1.275 dibagi 5", "1.275 ÷ 5 — kali 2, bagi 10", [...l, ...steps([["5 = 10 ÷ 2"], ["1.275 × 2 = 2.550"], ["2.550 ÷ 10"]], "255")], r); },
  43: () => { const [l, r] = bagiKali("3.600", "50", "2", ["7.200"], "72", "00"); return R("Pembahasan 3.600 dibagi 50", "3.600 ÷ 50 — kali 2, bagi 100", [...l, ...steps([["50 = 100 ÷ 2"], ["3.600 × 2 = 7.200"], ["7.200 ÷ 100"]], "72")], r); },
  44: () => { const [l, r] = bagiKali("7.250", "125", "8", ["14.500", "29.000", "58.000"], "58", "000"); return R("Pembahasan 7.250 dibagi 125", "7.250 ÷ 125 — kali 8, bagi 1000", [...l, ...steps([["125 = 1000 ÷ 8"], ["Gandakan 3 kali", "7.250 × 2 × 2 × 2"], ["58.000 ÷ 1000"]], "58")], r); },
  45: () => {
    const rows: [string, string, boolean][] = [["3.462", "3+4+6+2 = 15", false], ["5.217", "5+2+1+7 = 15", false], ["6.034", "6+0+3+4 = 13", false], ["7.236", "7+2+3+6 = 18", true], ["9.371", "9+3+7+1 = 20", false]];
    return R("Pembahasan bilangan habis dibagi 9", "Habis dibagi 9 — jumlah digit", [...rows.flatMap(([n, s, ok], i) => [t(14, 70 + i * 28, n, { size: 13, w: ok ? 700 : 400, fill: ok ? INK : MUTED }), t(64, 70 + i * 28, s, { size: 11.5, w: ok ? 700 : 400, fill: ok ? INK : MUTED }), t(180, 70 + i * 28, ok ? "✓" : "✗", { size: 13, w: 700, fill: ok ? INK : MUTED })]),
      ...steps([["Jumlah digit opsi"], ["Cari kelipatan 9"], ["18 = 2 × 9 → habis"]], "7.236")],
      [tb(352, 86, "7.236 = 7×1000 + 2×100 + 3×10 + 6", 11.5), ...lines(352, 110, [["1000 = 999 + 1"], ["100 = 99 + 1"], ["10 = 9 + 1"]], 12, 18), tm(464, 128, "999, 99, 9 habis", 11), tm(464, 144, "dibagi 9: sisa 1", 11),
        ...rl(184, [["Sisa bagi 9 suatu bilangan"], ["= sisa bagi 9 jumlah digitnya.", 600], ["Jumlah digit 18 → habis dibagi 9."]], 12.5, 18)]);
  },
  46: () => { const [l, r] = satuan("593", "28", "satuan: 3 × 8 = 24 → 4", ["16.601", "16.602", "16.604", "16.606", "16.608"], "4", [[["590 × 20", "…00"], ["590 × 8", "…0"]], [["3 × 20", "…0"], ["3 × 8", "…4"]]], [["Lihat opsi dulu sebelum menghitung."], ["Kalau opsi hanya beda di satuan,"], ["cukup kalikan satuannya.", 600]], [["Cek opsi: beda", "hanya di angka satuan"], ["3 × 8 = 24"], ["Satuan = 4"], ["Pilih yang ber-4"]], "16.604"); return R("Pembahasan cek angka satuan 593 kali 28", "593 × 28 — cek angka satuan", l, r); },
  47: () => R("Pembahasan 3,6 dibagi 0,05", "3,6 ÷ 0,05 — bagi 0,05 = kali 20", [...flow("3,6 ÷ 0,05", [["× 20", "72"]]), ...steps([["0,05 = 1/20"], ["÷ (1/20) = × 20"], ["3,6 × 20 = 72"]], "72")],
    [...bar(352, 84, 240, 28, 20, 0), tb(472, 134, "1 = 20 × 0,05", 14, "middle"), ...rl(164, [["Dalam 1 ada 20 buah 0,05."], ["Jadi ÷ 0,05 = × 20,"], ["÷ 0,5 = × 2, ÷ 0,25 = × 4.", 600]], 12.5, 18)]),
  48: () => R("Pembahasan 90 dibagi 1,25", "90 ÷ 1,25 — ambil 80%", [...flow("90 ÷ 1,25", [["× 4/5", "72"]]), ...steps([["1,25 = 5/4"], ["÷ 5/4 = × 4/5"], ["90 ÷ 5 = 18", "18 × 4 = 72"]], "72")],
    [...bar(352, 84, 240, 34, 5, 4, () => "18"), tm(472, 152, "90 = 5 bagian × 18", 11, "middle"), ...rl(178, [["÷ 1,25 = ambil 80% (4 dari 5)."], ["90 ÷ 5 = 18, lalu 4 × 18 = 72", 600], ["Sama saja: 90 − 20% × 90.", 600]], 12.5, 18)]),
  49: () => R("Pembahasan 4,8 dibagi 0,12", "4,8 ÷ 0,12 — geser koma dua langkah", [...flow("4,8 ÷ 0,12", [["× 100 kedua", "480 ÷ 12"], ["÷ 12", "40"]]), ...steps([["× 100 keduanya", "geser koma 2 langkah"], ["480 ÷ 12"], ["= 40"]], "40")],
    rFrac("4,8", "0,12", "480", "12", [["Pecahan tidak berubah bila atas"], ["dan bawah dikali bilangan sama."], ["Kali 100: pembagi jadi bulat.", 600]])),
  50: () => R("Pembahasan 720 dibagi 15", "720 ÷ 15 — kali 2, bagi 30", [...flow("720 ÷ 15", [["× 2 keduanya", "1.440 ÷ 30"], ["÷ 30", "48"]]), ...steps([["15 × 2 = 30"], ["720 × 2 = 1.440"], ["1.440 ÷ 30 = 48"]], "48")],
    rFrac("720", "15", "1.440", "30", [["15 × 2 = 30: pembagi jadi"], ["kelipatan 10, tinggal geser koma."], ["1.440 ÷ 30 = 144 ÷ 3 = 48", 600]])),
  // ===== TAMBAH =====
  51: () => { const [l, r] = komp([[30, "356", 146], [150, "556", 146], [170, "554", 164]], [["M34 108 Q 90 56 146 108", 90, 70, "+ 200"], ["M150 104 Q 160 92 168 106", 160, 88, "− 2"]], "356 + 200 − 2", [["198 = 200 − 2"], ["356 + 200 = 556"], ["556 − 2"]], "554", ["a + 198", "= a + (200 − 2)", "= (a + 200) − 2"], [["Tambah ratusan bulat tanpa simpan,"], ["lalu satu koreksi kecil."], ["+ 99 = + 100 − 1", 600], ["+ 998 = + 1.000 − 2", 600]]); return R("Pembahasan 356 tambah 198 kompensasi", "356 + 198 — kompensasi", l, r); },
  52: () => { const [l, r] = komp([[170, "724", 146], [30, "624", 146], [58, "+ 1 → 625", 164]], [["M166 108 Q 100 56 34 108", 100, 70, "− 100"]], "724 − 100 + 1", [["99 = 100 − 1"], ["724 − 100 = 624"], ["624 + 1"]], "625", ["a − 99", "= a − (100 − 1)", "= (a − 100) + 1"], [["Kurang ratusan bulat tanpa pinjam,"], ["lalu kembalikan satu."], ["− 98 = − 100 + 2", 600], ["− 999 = − 1.000 + 1", 600]]); return R("Pembahasan 724 kurang 99 kompensasi", "724 − 99 — kompensasi", l, r); },
  53: () => {
    const cols = [44, 84, 124, 164];
    return R("Pembahasan 10.000 dikurangi 3.476", "10.000 − 3.476 — semua dari 9, terakhir dari 10", [...["9", "9", "9", "10"].map((d, i) => tb(cols[i], 74, d, 18, "middle")), tm(14, 74, "dari", 10), ...["3", "4", "7", "6"].map((d, i) => tb(cols[i], 106, `− ${d}`, 16, "middle")), line(24, 118, 186, 118, { sw: 2 }),
      ...["6", "5", "2", "4"].map((d, i) => tb(cols[i], 150, d, 26, "middle")), rect(cols[3] - 18, 52, 36, 106, "none", true, 6), tm(cols[3], 178, "terakhir dari 10", 10, "middle"),
      ...steps([["9 − 3 = 6"], ["9 − 4 = 5"], ["9 − 7 = 2"], ["10 − 6 = 4"]], "6.524")],
      [tb(352, 90, "10.000 = 9.999 + 1", 15), tb(352, 118, "9.999 − 3.476 = 6.523", 15), tm(352, 136, "(tiap digit ≤ 9: tidak pernah meminjam)", 11), tb(352, 162, "6.523 + 1 = 6.524", 15),
        ...rl(200, [["+1 itu yang membuat digit terakhir"], ["dikurangkan dari 10.", 600], ["Rp100.000 − Rp37.256 → Rp62.744"]], 12.5, 17)]);
  },
  54: () => {
    const xs = [34, 78, 122, 166], ns = ["36", "47", "64", "53"];
    return R("Pembahasan 36 tambah 47 tambah 64 tambah 53", "36 + 47 + 64 + 53 — pasangan 100", [...ns.map((n, i) => tb(xs[i], 112, n, 16, "middle")), ...[0, 1, 2].map((i) => tb((xs[i] + xs[i + 1]) / 2, 112, "+", 13, "middle")), curve(`M${xs[0]} 94 Q ${(xs[0] + xs[2]) / 2} 54 ${xs[2]} 92`, false), tb((xs[0] + xs[2]) / 2, 66, "100", 12, "middle"),
      curve(`M${xs[1]} 122 Q ${(xs[1] + xs[3]) / 2} 162 ${xs[3]} 124`, false), tb((xs[1] + xs[3]) / 2, 160, "100", 12, "middle"), tb(100, 204, "100 + 100", 16, "middle"), ...steps([["36 + 64 = 100"], ["47 + 53 = 100"], ["100 + 100"]], "200")],
      [...rl(88, [["Urutan dan kelompok"], ["penjumlahan boleh diubah."]], 12.5, 18), ...rl(136, [["Pasangan satuan:"], ["6 + 4 = 10, 7 + 3 = 10"]], 12.5, 18), tb(352, 178, "Cari pasangan 1+9, 2+8, 3+7, 4+6, 5+5", 11.5), ...rl(214, [["Hasil antara jadi bulat:"], ["tidak ada simpanan berantai.", 600]], 12.5, 17)]);
  },
  55: () => {
    const cx = [376, 424, 472, 520, 568], r1 = ["1", "2", "3", "…", "30"], r2 = ["30", "29", "28", "…", "1"];
    return R("Pembahasan jumlah 1 sampai 30", "1 + 2 + … + 30 — pasangan ujung", [...lines(26, 70, [["1 + 30 = 31"], ["2 + 29 = 31"], ["3 + 28 = 31"], ["⋮"], ["15 + 16 = 31"]], 14, 24), tb(100, 212, "15 × 31", 18, "middle"), ...steps([["Pasangkan ujung"], ["Tiap pasang = 31"], ["15 pasang", "30 ÷ 2"], ["15 × 31"]], "465")],
      [...cx.map((x, i) => tb(x, 86, r1[i], 16, "middle")), ...cx.map((x, i) => tb(x, 112, r2[i], 16, "middle")), line(352, 124, 592, 124, { sw: 1.5 }), ...cx.map((x, i) => tb(x, 146, i === 3 ? "…" : "31", 16, "middle")),
        ...rl(184, [["Dua barisan dijumlah = 30 × 31."], ["Itu dua kali jumlah yang dicari,"], ["jadi bagi 2: 30 × 31 ÷ 2 = 465.", 600]], 12.5, 18)]);
  },
  56: () => R("Pembahasan tiga bilangan berurutan berjumlah 114", "3 bilangan berurutan — jumlah = 3 × tengah", [...["37", "38", "39"].flatMap((s, i) => digitBox(46 + i * 60, 60, s, { size: 46, fs: 20 })), rect(83, 56, 46, 54, "none", false, 6, 2.5), tm(46, 130, "n − 1", 11, "middle"), tm(106, 130, "n", 11, "middle"), tm(166, 130, "n + 1", 11, "middle"),
    tb(100, 170, "114 ÷ 3 = 38", 16, "middle"), tm(100, 192, "(tengah)", 11, "middle"), ...steps([["Jumlah = 3 × n"], ["114 ÷ 3 = 38"], ["Terbesar = n + 1"]], "39")],
    [tb(352, 88, "(n − 1) + n + (n + 1) = 3n", 14), ...rl(116, [["−1 dan +1 saling hapus,"], ["sisa n + n + n = 3n."], ["Jadi tengah = jumlah ÷ 3."]], 12.5, 18), ...rl(188, [["Contoh: 37 + 38 + 39"], ["= 3 × 38 = 114", 700]], 12.5, 18)]),
  57: () => {
    const cx = [24, 60, 96, 132, 168], lab = ["n−4", "n−2", "n", "n+2", "n+4"], v = ["23", "25", "27", "29", "31"];
    return R("Pembahasan lima bilangan ganjil berurutan berjumlah 135", "5 ganjil berurutan — jumlah = 5 × tengah", [...cx.flatMap((x, i) => [...digitBox(x, 60, v[i], { size: 32, fs: 14 }), tm(x, 112, lab[i], 10, "middle")]), rect(80, 56, 32, 40, "none", false, 6, 2.5), tb(100, 156, "135 ÷ 5 = 27", 16, "middle"), tm(100, 178, "(tengah)", 11, "middle"),
      ...steps([["Jumlah = 5 × n"], ["135 ÷ 5 = 27"], ["27 → 29 → 31"], ["Terbesar = n + 4"]], "31")],
      [tb(352, 88, "(n−4)+(n−2)+n+(n+2)+(n+4) = 5n", 12), ...rl(116, [["Selisih ganjil berurutan = 2,"], ["jadi lompatannya −4, −2, +2, +4."], ["Pasangan −4/+4 dan −2/+2 hilang."]], 12.5, 18), ...rl(190, [["Contoh: 23 + 25 + 27 + 29 + 31"], ["= 5 × 27 = 135", 700]], 12.5, 18)]);
  },
  58: () => {
    const [x0, y0, cs] = [352, 74, 22], cells: El[] = [];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) cells.push(rect(x0 + c * cs, y0 + r * cs, cs, cs, Math.max(r, c) % 2 ? "#fff" : H, false, 0, 1));
    return R("Pembahasan jumlah bilangan ganjil pertama", "1 + 3 + 5 + … + 19 — kuadrat banyak suku", [tb(100, 62, "1 + 3 + 5 + … + 19", 16, "middle"), ...pill(100, 76, 170, "suku: (19 + 1) ÷ 2 = 10", 12), line(100, 110, 100, 130, { arrow: true }), ...pill(100, 134, 170, "jumlah = 10²", 16), line(100, 168, 100, 188, { arrow: true }), ...pill(100, 192, 170, "= 100", 16),
      ...steps([["Banyak suku"], ["(19 + 1) ÷ 2 = 10"], ["Jumlah = suku²"], ["10² = 100"]], "100")],
      [...cells, ...lines(480, 90, [["1 = 1²"], ["1 + 3 = 2²"], ["1 + 3 + 5 = 3²"], ["…"], ["1+3+5+7+9 = 5²", 700]], 11.5, 18), ...rl(206, [["n bilangan ganjil pertama = n².", 600], ["Tiap lapis L menambah satu ganjil."]], 12.5, 17)]);
  },
  59: () => {
    const nl = (y: number, a: number, b: number, la: string, lb: string): El[] => [line(20, y, 186, y, { sw: 1.5 }), line(a, y - 7, a, y + 7, { sw: 2 }), line(b, y - 7, b, y + 7, { sw: 2 }), tb(a, y + 22, la, 12, "middle"), tb(b, y + 22, lb, 12, "middle"),
      `<line x1="${a}" y1="${y - 14}" x2="${b}" y2="${y - 14}" stroke="${INK}" stroke-width="1.2" marker-start="url(#ah)" marker-end="url(#ah)"/>`];
    return R("Pembahasan 8.005 dikurangi 4.998", "8.005 − 4.998 — geser bersama", [...nl(80, 40, 150, "4.998", "8.005"), tm(40, 132, "keduanya + 2", 11), line(28, 112, 28, 140, { arrow: true }), ...nl(160, 48, 158, "5.000", "8.007"), tb(100, 214, "8.007 − 5.000", 15, "middle"), ...steps([["Geser + 2", "keduanya"], ["8.007 − 5.000"]], "3.007")],
      [tb(352, 92, "(a + k) − (b + k) = a − b", 14), ...rl(124, [["Dua orang berjalan bersama"], ["sejauh k: jaraknya tetap."]], 12.5, 18), ...rl(184, [["Pilih k supaya pengurang bulat."], ["Pengurangan: geser searah.", 600], ["Penjumlahan: geser berlawanan.", 600]], 12.5, 18)]);
  },
  60: () => {
    const cx = [24, 60, 96, 132, 168], v = ["18", "22", "26", "30", "34"];
    return R("Pembahasan jumlah deret beda tetap", "18 + 22 + 26 + 30 + 34 — suku tengah", [...cx.flatMap((x, i) => digitBox(x, 96, v[i], { size: 32, fs: 14 })), rect(80, 92, 32, 40, "none", false, 6, 2.5), curve("M24 90 Q 96 40 168 90", false), tb(96, 56, "18 + 34 = 52 = 2 × 26", 11, "middle"),
      curve("M60 136 Q 96 164 132 136", false), tb(96, 170, "22 + 30 = 52", 11, "middle"), tb(100, 212, "5 × 26", 18, "middle"), ...steps([["Suku tengah: 26"], ["Ujung = 2 × 26"], ["5 suku × 26"]], "130")],
      [...rl(90, [["Barisan selisih tetap (4):"], ["18 + 34 = 22 + 30 = 26 + 26"], ["Tiap pasangan ujung = 2 × tengah."]], 12.5, 18), ...rl(160, [["Jumlah = banyak suku × tengah", 700]], 12.5, 18), ...rl(190, [["Berlaku bila banyak suku ganjil;"], ["genap: rata-rata dua suku tengah."]], 12.5, 18)]);
  },
};
