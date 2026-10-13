/**
 * K11 gambar pembahasan yang digambar dari data soal: tabel permen, skor kandidat, garis nilai, Venn, jadwal waktu.
 * Konteks netral (A-7): nama tokoh dan "arahan pimpinan" saja, tanpa pangkat atau instansi.
 */
import { El, INK, MUTED, box, frame, line, rect, t, tb, tm, wrapText, writeSvg } from "./pbh-svg-lib";

const H = "url(#hatch)";
const title = (s: string, sub?: string): El[] => [tb(16, 26, s, 16), ...(sub ? [tm(16, 44, sub, 11.5)] : [])];
const dot = (cx: number, cy: number): El => `<circle cx="${cx}" cy="${cy}" r="6.5" fill="${INK}"/>`;

// ---------- permen (064–067) ----------
const KIDS = ["Raka", "Sinta", "Laras", "Tegar", "Bima"], FLV = ["Stroberi", "Cokelat", "Kopi", "Melon"];
const TOOK: boolean[][] = [[1, 1, 0, 0], [0, 0, 0, 1], [1, 1, 1, 0], [1, 0, 1, 0], [1, 1, 0, 0]].map((r) => r.map(Boolean));
function permenSvg(id: string, hiRows: number[], hiTotal: boolean, answer: string): string {
  const x0 = 24, y0 = 74, nw = 62, cw = 56, rh = 29, body: El[] = [...title("Tabel anak × rasa permen", "Isi dari kalimat yang paling pasti: Sinta hanya melon")];
  FLV.forEach((f, c) => body.push(tb(x0 + nw + c * cw + cw / 2, y0 - 8, f, 11, "middle")));
  body.push(tb(x0 + nw + 4 * cw + cw / 2, y0 - 8, "Jumlah", 11, "middle"));
  KIDS.forEach((k, r) => {
    const y = y0 + r * rh, sum = TOOK[r].filter(Boolean).length;
    body.push(t(x0 + nw - 8, y + rh / 2 + 4, k, { size: 12.5, w: hiRows.includes(r) ? 700 : 400, anchor: "end" }));
    for (let c = 0; c < 5; c++) body.push(rect(x0 + nw + c * cw, y, cw, rh, c === 4 && hiTotal ? H : "#fff", { sw: 1 }));
    TOOK[r].forEach((v, c) => v && body.push(dot(x0 + nw + c * cw + cw / 2, y + rh / 2)));
    body.push(tb(x0 + nw + 4 * cw + cw / 2, y + rh / 2 + 5, String(sum), 14, "middle"));
  });
  hiRows.forEach((r) => body.push(rect(x0 - 2, y0 + r * rh - 1, nw + 5 * cw + 4, rh + 2, "none", { sw: 3 })));
  body.push(line(x0 + nw, y0 + 5 * rh + 4, x0 + nw + 5 * cw, y0 + 5 * rh + 4, { sw: 1 }), tb(x0 + nw + 4 * cw + cw / 2, y0 + 5 * rh + 20, "= 10", 14, "middle"));
  const rx = x0 + nw + 5 * cw + 22;
  [["①", "Sinta hanya melon, jadi 4 anak lain (Raka, Laras, Tegar, Bima) mengambil stroberi."], ["②", "Cokelat: semua kecuali Sinta dan Tegar."], ["③", "Kopi: semua kecuali Sinta, Raka, dan Bima, yaitu Laras dan Tegar."]]
    .forEach(([n, s], i) => body.push(tb(rx, 74 + i * 52, n, 13), ...wrapText(rx + 18, 74 + i * 52, s, { size: 11.5, maxW: 616 - rx - 34, gap: 14 })));
  body.push(...wrapText(rx, 74 + 3 * 52 + 4, answer, { size: 12.5, w: 700, maxW: 616 - rx - 14, gap: 16 }));
  return frame(`Pembahasan ${id}`, body);
}

// ---------- kandidat (070–073) ----------
const CAND = ["Kirana", "Lestari", "Mega", "Nadia", "Olivia"], COM = [3, 5, 2, 1, 4], TEL = [4, 3, 2, 5, 1]; // peringkat per kandidat
function kandidatSvg(id: string, hi: number[], answer: string): string {
  const x0 = 24, y0 = 86, nw = 66, rh = 22, body: El[] = [...title("Skor tiap kandidat", "Skor komunikasi = 6 − peringkat · skor ketelitian = 9 − peringkat · total = jumlah keduanya")];
  [["Komunikasi", x0 + nw + 52], ["Ketelitian", x0 + nw + 52 + 108], ["Skor akhir", x0 + nw + 52 + 216 + 60]].forEach(([s, x]) => body.push(tb(+x, y0 - 24, String(s), 12, "middle")));
  ["peringkat", "skor"].forEach((s, k) => { body.push(tm(x0 + nw + 28 + k * 48, y0 - 8, s, 10, "middle"), tm(x0 + nw + 136 + k * 48, y0 - 8, s, 10, "middle")); });
  CAND.forEach((nm, i) => {
    const y = y0 + i * rh, sc = 6 - COM[i], st = 9 - TEL[i], tot = sc + st;
    body.push(t(x0 + nw - 8, y + rh / 2 + 4, nm, { size: 12.5, w: hi.includes(i) ? 700 : 400, anchor: "end" }), line(x0, y + rh, x0 + 540, y + rh, { sw: 0.8, stroke: "#bbbbbb" }),
      tb(x0 + nw + 28, y + rh / 2 + 5, String(COM[i]), 12.5, "middle"), tb(x0 + nw + 76, y + rh / 2 + 5, String(sc), 13, "middle"), tb(x0 + nw + 136, y + rh / 2 + 5, String(TEL[i]), 13, "middle"), tb(x0 + nw + 184, y + rh / 2 + 5, String(st), 13, "middle"),
      rect(x0 + nw + 236, y + 5, tot * 18, rh - 10, hi.includes(i) ? INK : H, { sw: 1.2 }), tb(x0 + nw + 242 + tot * 18, y + rh / 2 + 5, String(tot), 13));
    if (hi.includes(i)) body.push(rect(x0 - 2, y, 540, rh, "none", { sw: 2.5 }));
  });
  body.push(...wrapText(16, y0 + 5 * rh + 20, "Urutan komunikasi: Nadia, Mega, Kirana, Olivia, Lestari. Urutan ketelitian: Olivia, Mega, Lestari, Kirana, Nadia.", { size: 11.5, maxW: 580, gap: 14, fill: MUTED }), ...wrapText(16, 252, answer, { size: 13, w: 700, maxW: 580 }));
  return frame(`Pembahasan ${id}`, body);
}

// ---------- garis nilai (062) ----------
function nilaiSvg(): string {
  const X = (v: number) => 40 + (v - 85) * 44, y = 134, pts: [string, number, number][] = [["Tono", 87, -1], ["Sinta", 89, 1], ["Umar", 90, -1], ["Rina", 95, 1]];
  const body: El[] = [...title("Garis nilai ujian Matematika")];
  body.push(line(X(85), y, X(96), y, { sw: 2 }), line(X(88), 72, X(88), y + 6, { dash: true }), line(X(88), y + 26, X(88), 214, { dash: true }), tb(X(88), 66, "batas 88", 12, "middle"));
  for (let v = 85; v <= 96; v++) body.push(line(X(v), y - 4, X(v), y + 4, { sw: 1.5 }), tm(X(v), y + 20, String(v), 10.5, "middle"));
  pts.forEach(([nm, v, up]) => {
    const above = v > 88, cy = y + up * 48;
    body.push(line(X(v), up > 0 ? y + 24 : y, X(v), cy + (up > 0 ? -12 : 12), { sw: 1 }), ...box(X(v) - 30, cy - 12, 60, 24, `${nm} ${v}`, { dark: above, size: 11.5, r: 12 }));
  });
  body.push(...wrapText(16, 232, "Rina 95 → Sinta = 95 − 6 = 89 → Tono = 89 − 2 = 87 → Umar = 87 + 3 = 90. Di atas 88: Rina, Umar, Sinta.", { size: 12.5, maxW: 580 }));
  return frame("Pembahasan K11-A3-062", body);
}

// ---------- Venn hobi (063) ----------
function hobiSvg(): string {
  const body: El[] = [...title("Siapa di dua kelompok sekaligus?", "Berenang: Dewi, Fitri · Bersepeda: Gina, Hana · Melukis: Fitri, Hana")];
  body.push(`<circle cx="190" cy="152" r="82" fill="#fff" stroke="${INK}" stroke-width="2"/>`, `<circle cx="300" cy="152" r="82" fill="#fff" stroke="${INK}" stroke-width="2"/>`,
    `<path d="M245 91.2 A82 82 0 0 0 245 212.8 A82 82 0 0 0 245 91.2 Z" fill="url(#hatch)" stroke="${INK}" stroke-width="2"/>`,
    tb(150, 66, "Bersepeda", 13, "middle"), tb(340, 66, "Melukis", 13, "middle"), tb(150, 158, "Gina", 14, "middle"), tb(340, 158, "Fitri", 14, "middle"), `<rect x="222" y="139" width="46" height="26" rx="13" fill="#fff" stroke="${INK}" stroke-width="2"/>`, tb(245, 157, "Hana", 13, "middle"));
  body.push(...wrapText(430, 100, "Bersepeda: Gina dan Hana.", { size: 13 }), ...wrapText(430, 122, "Melukis: Fitri dan Hana.", { size: 13 }), ...wrapText(430, 156, "Yang ada di kedua lingkaran hanya Hana.", { size: 13, w: 700, maxW: 170 }));
  return frame("Pembahasan K11-A3-063", body);
}

// ---------- libur (PR-054) ----------
function liburSvg(): string {
  const rows: [string, string, string][] = [["Bima", "Senin", "Kamis"], ["Citra", "Kamis", "Senin"], ["Dodi", "Kamis", "Kamis"]], x0 = 40, y0 = 86, body: El[] = [...title("Jadwal libur sebelum dan sesudah bertukar", "Bima dan Citra bertukar; jadwal Dodi tidak berubah")];
  body.push(tb(x0 + 150, y0 - 14, "Semula", 13, "middle"), tb(x0 + 290, y0 - 14, "Minggu ini", 13, "middle"));
  rows.forEach(([nm, a, b], i) => {
    const y = y0 + i * 44;
    body.push(t(x0 + 70, y + 24, nm, { size: 14, w: 700, anchor: "end" }), ...box(x0 + 100, y, 100, 32, a, { size: 13 }), line(x0 + 206, y + 16, x0 + 238, y + 16, { arrow: true }), ...box(x0 + 244, y, 100, 32, b, { dark: b === "Kamis", size: 13 }));
  });
  body.push(...wrapText(430, 104, "Setelah bertukar: Bima libur Kamis, Citra libur Senin, Dodi tetap Kamis.", { size: 13, maxW: 170, gap: 17 }), ...wrapText(430, 172, "Bima dan Dodi libur pada hari yang sama (Kamis).", { size: 13, w: 700, maxW: 170, gap: 17 }));
  return frame("Pembahasan K11-PR-054", body);
}

// ---------- pohon (PR-064) ----------
function pohonSvg(): string {
  const bars: [string, number][] = [["Jambu air", 70], ["Kelapa gading", 105], ["Kelapa hijau", 140], ["Kelapa sawit", 160]], x0 = 40, base = 214, body: El[] = [...title("Urutan tinggi pohon", "Jambu air < kelapa gading ≤ jenis kelapa lainnya")];
  bars.forEach(([nm, h], i) => {
    const x = x0 + i * 98;
    body.push(rect(x, base - h, 66, h, i === 0 ? H : i === 1 ? "#fff" : INK, { sw: 1.5 }), tb(x + 33, base + 18, nm, 11, "middle"));
    if (i) body.push(tb(x - 16, base - 22, i === 1 ? "<" : "≤", 18, "middle"));
  });
  body.push(...wrapText(446, 84, "Kelapa gading paling rendah di antara kelapa, jadi kelapa hijau dan sawit minimal sama tinggi dengan gading. Jambu air masih di bawah gading, jadi kelapa hijau lebih tinggi dari jambu air.", { size: 12.5, maxW: 156, gap: 16 }));
  return frame("Pembahasan K11-PR-064", body);
}

// ---------- jadwal waktu ----------
const mm = (h: number, m: number) => h * 60 + m, clock = (v: number) => `${Math.floor(v / 60)}.${String(v % 60).padStart(2, "0")}`;
type Blk = { from: number; to: number; label: string; kind?: "off" | "key" };
function lane(name: string, y: number, blks: Blk[], X: (v: number) => number, h = 30): El[] {
  const out: El[] = [t(8, y + h / 2 + 4, name, { size: 11.5, w: 700 })];
  blks.forEach((b) => out.push(rect(X(b.from), y, X(b.to) - X(b.from), h, b.kind === "off" ? H : "#fff", { sw: b.kind === "key" ? 3 : 1.5 }), t((X(b.from) + X(b.to)) / 2, y + h / 2 + 4, b.label, { size: 10.5, w: 600, anchor: "middle", fill: INK })));
  return out;
}
function axis(a: number, b: number, X: (v: number) => number, y: number, step: number): El[] {
  const out: El[] = [line(X(a), y, X(b), y, { sw: 1 })];
  for (let v = a; v <= b; v += step) out.push(line(X(v), y - 3, X(v), y + 3, { sw: 1 }), tm(X(v), y + 15, clock(v), 10, "middle"));
  return out;
}
function piketSvg(id: string, keyBlk: string, notes: string): string {
  const A = mm(7, 45), B = mm(10, 10), X = (v: number) => 56 + (v - A) * 3.6, body: El[] = [...title("Jadwal piket 07.45–10.10", "Blok pagi dan blok siang dipisah arahan pimpinan 08.50–09.05")];
  const lap: Blk = { from: A, to: A + 29, label: "Laporan 29" }, rek: Blk = { from: A + 29, to: A + 48, label: "Rekap 19" }, arah: Blk = { from: mm(8, 50), to: mm(9, 5), label: "Arahan", kind: "off" };
  const mat: Blk = { from: mm(9, 5), to: mm(9, 47), label: "Materi 42" }, mut: Blk = { from: mm(9, 47), to: mm(10, 9), label: "Mutasi 22" };
  [lap, rek, mat, mut].forEach((b) => { if (b.label.startsWith(keyBlk)) b.kind = "key"; });
  body.push(...lane("Laras", 84, [lap, rek, arah, mat, mut], X), ...axis(A, B, X, 126, 15));
  body.push(...lane("Yoga", 150, [{ from: A, to: A + 40, label: "Surat 40 (didelegasikan)", kind: keyBlk === "Surat" ? "key" : undefined }], X));
  body.push(line(X(mm(9, 55)), 66, X(mm(9, 55)), 82, { arrow: true }), tm(X(mm(9, 55)), 62, "materi selesai ≤ 09.55", 10, "middle"), line(X(mm(8, 50)), 66, X(mm(8, 50)), 82, { arrow: true }), tm(X(mm(8, 50)), 62, "laporan selesai < 08.50", 10, "middle"));
  body.push(...wrapText(16, 206, notes, { size: 12, maxW: 584, gap: 15 }));
  return frame(`Pembahasan ${id}`, body);
}
function upacaraSvg(id: string, eko: Blk[], dina: Blk[], notes: string): string {
  const A = mm(13, 0), B = mm(14, 10), X = (v: number) => 64 + (v - A) * 7.2, body: El[] = [...title("Dua petugas, lima tugas", "Dina 13.00–14.00 · Eko 13.10–14.10 · tiap tugas tidak dipotong")];
  body.push(...lane("Dina", 80, dina, X), ...lane("Eko", 124, eko, X), ...axis(A, B, X, 168, 10));
  body.push(line(X(mm(13, 20)), 64, X(mm(13, 20)), 78, { arrow: true }), tm(X(mm(13, 20)), 60, "daftar hadir selesai ≤ 13.20", 10, "middle"));
  body.push(...wrapText(16, 198, notes, { size: 12, maxW: 584, gap: 15 }));
  return frame(`Pembahasan ${id}`, body);
}

export function generateK11Hand(): string[] {
  const out: string[] = [], w = (id: string, svg: string) => { writeSvg(id, svg); out.push(id); };
  w("K11-A3-062", nilaiSvg()); w("K11-A3-063", hobiSvg()); w("K11-PR-054", liburSvg()); w("K11-PR-064", pohonSvg());
  w("K11-A3-064", permenSvg("K11-A3-064", [3], false, "Hanya kopi dan stroberi: Tegar."));
  w("K11-A3-065", permenSvg("K11-A3-065", [2], false, "Tiga permen (stroberi, cokelat, kopi): Laras."));
  w("K11-A3-066", permenSvg("K11-A3-066", [0, 4], false, "Rasa persis sama (stroberi + cokelat): Raka dan Bima."));
  w("K11-A3-067", permenSvg("K11-A3-067", [], true, "Jumlah semua permen: 2 + 1 + 3 + 2 + 2 = 10."));
  w("K11-A3-070", kandidatSvg("K11-A3-070", [2], "Skor tertinggi 11: Mega, paling berpeluang diterima."));
  w("K11-A3-071", kandidatSvg("K11-A3-071", [1], "Skor terendah 7: Lestari, paling kecil peluangnya."));
  w("K11-A3-072", kandidatSvg("K11-A3-072", [3], "Nadia: komunikasi 5 + ketelitian 4 = 9."));
  w("K11-A3-073", kandidatSvg("K11-A3-073", [1, 2], "Tertinggi Mega 11, terendah Lestari 7: selisih 11 − 7 = 4."));
  w("K11-AK-001", piketSvg("K11-AK-001", "Surat", "Blok pagi dan blok siang masing-masing 65 menit. Laporan harus selesai sebelum arahan (blok pagi); surat bila dipegang Laras selesai paling cepat 09.45 (lewat 09.10), jadi juga masuk blok pagi. Laporan 29 + surat 40 = 69 > 65, maka surat didelegasikan."));
  w("K11-AK-002", piketSvg("K11-AK-002", "Materi", "Surat didelegasikan (69 > 65 menit di blok pagi). Materi (42) tidak muat di blok pagi bersama laporan (71 > 65), jadi harus tugas pertama setelah arahan; bila didahului tugas lain, selesai lewat 09.55. Urutan sah: laporan, rekap | materi, mutasi · laporan, mutasi | materi, rekap · mutasi, laporan | materi, rekap."));
  w("K11-AK-003", upacaraSvg("K11-AK-003",
    [{ from: mm(13, 10), to: mm(13, 40), label: "Tenda 30" }, { from: mm(13, 40), to: mm(14, 4), label: "Spanduk 24" }],
    [{ from: mm(13, 0), to: mm(13, 14), label: "Daftar 14" }, { from: mm(13, 14), to: mm(13, 40), label: "Pengeras suara 26" }, { from: mm(13, 40), to: mm(14, 0), label: "Kursi 20", kind: "key" }],
    "Daftar hadir (14 menit, selesai ≤ 13.20) harus dimulai ≤ 13.06 sebelum Eko datang: tugas pertama Dina. Tenda ke Dina berarti 14 + 30 + 24 = 68 > 60 menit, jadi tenda dikerjakan Eko 13.10–13.40. Kursi tidak muat di Eko (74 > 60), jadi Dina menata kursi 13.40–14.00."));
  w("K11-AK-004", upacaraSvg("K11-AK-004",
    [{ from: mm(13, 10), to: mm(13, 40), label: "Tenda 30", kind: "key" }, { from: mm(13, 40), to: mm(14, 6), label: "Pengeras suara 26" }],
    [{ from: mm(13, 0), to: mm(13, 14), label: "Daftar 14" }, { from: mm(13, 14), to: mm(13, 38), label: "Spanduk 24" }, { from: mm(13, 40), to: mm(14, 0), label: "Kursi 20", kind: "key" }],
    "Tenda dan kursi oleh orang yang sama tidak mungkin: Dina 14 + 30 + 20 + 24 = 88 > 60 menit, Eko 30 + 20 + 24 = 74 > 60 menit. Jadwal yang sah: Eko memasang tenda, Dina menata kursi."));
  return out;
}
