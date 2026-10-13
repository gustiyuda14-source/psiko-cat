/**
 * Gambar pembahasan K08 silogisme (37 butir): diagram himpunan (Venn/Euler), rantai jika–maka, dan beberapa kasus khusus.
 * Panel kanan (premis + kesimpulan) diambil otomatis dari butir di bank, jadi gambar dan teks tidak bisa berbeda.
 *   npx tsx scripts/generate-k08-pbh.ts  → data/drill-pembahasan/K08-*.svg + gambar_pembahasan di bank
 */
import { El, INK, MUTED, badge, box, circle, curve, frame, line, loadBank, patchBank, rect, tb, tm, wrapText, writeSvg } from "./pbh-svg-lib";

const HATCH = "url(#hatch)";
type Lv = string;
type Spec =
  | { id: string; k: "A"; title: string; levels: Lv[]; x: string; xOuter?: string; xOverOuter?: boolean }
  | { id: string; k: "B"; title: string; levels: Lv[]; dot: string; at: "in" | "out" | "ghost" }
  | { id: string; k: "C"; title: string; rows: { text: string; st?: "T" | "F" | "?" }[][]; arc?: string; back?: { row: number; from: number; to: number; label: string } }
  | { id: string; k: "CASES"; title: string; cases: { name: string; circles: { cx: number; cy: number; r: number; label: string; fill?: boolean; ink?: boolean }[]; verdict: string }[] }
  | { id: string; k: "HARI" }
  | { id: string; k: "SAHABAT" }
  | { id: string; k: "BEDA" }
  | { id: string; k: "ATAU"; title: string; root: string; opts: { text: string; ok: boolean; note: string }[] }
  | { id: string; k: "UJIAN" }
  | { id: string; k: "LOLOS" };

const SPECS: Spec[] = [
  { id: "B3-081", k: "A", title: "Diagram himpunan", levels: ["Bersayap", "Burung"], x: "Pandai bernyanyi" },
  { id: "B3-082", k: "HARI" },
  { id: "B3-083", k: "A", title: "Diagram himpunan", levels: ["Nilai di atas 90", "Berpredikat terbaik"], x: "Lulusan tahun ini" },
  { id: "B3-084", k: "A", title: "Diagram himpunan", levels: ["Helm standar internasional", "Pembalap profesional"], x: "Pesepeda muda" },
  { id: "B3-085", k: "SAHABAT" },
  { id: "A3-076", k: "C", title: "Rantai jika–maka", rows: [[{ text: "Hujan turun", st: "T" }, { text: "Jalan licin" }, { text: "Pengendara memperlambat laju" }]], arc: "hujan → pengendara memperlambat laju" },
  { id: "A3-077", k: "C", title: "Akibat benar tidak membuktikan sebab", rows: [[{ text: "Petugas tidak datang" }, { text: "Kantor pelayanan tutup" }], [{ text: "Kantor tidak tutup", st: "?" }, { text: "Antrean panjang terbentuk", st: "T" }]], back: { row: 1, from: 1, to: 0, label: "tidak pasti" } },
  { id: "A3-078", k: "A", title: "Diagram himpunan", levels: ["Dibuat dengan cat minyak", "Lukisan di galeri"], x: "Bertema alam" },
  { id: "A3-079", k: "BEDA" },
  { id: "A3-080", k: "A", title: "Diagram himpunan", levels: ["Tidak dapat berenang", "Ikan"], x: "Hidup di laut" },
  { id: "A3-081", k: "B", title: "Napas panjang belum tentu perenang andal", levels: ["Napas panjang", "Perenang andal"], dot: "Laras", at: "ghost" },
  { id: "A3-082", k: "CASES", title: "Dua keadaan yang sama-sama sesuai premis", cases: [
    { name: "Keadaan 1", circles: [{ cx: 90, cy: 120, r: 70, label: "Minuman pahit" }, { cx: 70, cy: 128, r: 30, label: "Kopi" }, { cx: 130, cy: 140, r: 46, label: "Bergula", ink: true }], verdict: "kopi ada yang bergula" },
    { name: "Keadaan 2", circles: [{ cx: 90, cy: 120, r: 70, label: "Minuman pahit" }, { cx: 62, cy: 114, r: 30, label: "Kopi" }, { cx: 140, cy: 150, r: 40, label: "Bergula", ink: true }], verdict: "kopi tidak bergula" }], },
  { id: "A3-083", k: "B", title: "Rantai himpunan", levels: ["Dikendalikan dari darat", "Pesawat nirawak", "Drone pengintai"], dot: "Elang-7", at: "out" },
  { id: "A3-084", k: "A", title: "Diagram himpunan", levels: ["Dari hutan tanaman", "Jati", "Meja di toko"], x: "Berwarna cokelat" },
  { id: "A3-085", k: "A", title: "Diagram himpunan", levels: ["Suka ikan", "Kucing di rumah"], x: "Suka susu", xOuter: "Bertubuh gemuk" },
  { id: "B2-084", k: "C", title: "Rantai sebab–akibat", rows: [[{ text: "Kambing makan rumput gajah", st: "T" }, { text: "Makanan kaya serat" }, { text: "Pencernaan sehat" }]], arc: "kambing → pencernaan sehat" },
  { id: "B2-085", k: "C", title: "Modus ponens", rows: [[{ text: "Bu Wati perawat", st: "T" }, { text: "Tidak pernah absen" }, { text: "Mendapat penghargaan" }]], arc: "Bu Wati mendapat penghargaan" },
  { id: "B2-086", k: "C", title: "Modus ponens", rows: [[{ text: "Pak Joni pelatih", st: "T" }, { text: "Selalu tepat waktu" }, { text: "Dipercaya timnya" }]], arc: "Pak Joni dipercaya timnya" },
  { id: "B2-087", k: "A", title: "Diagram himpunan", levels: ["Subur dan berpengairan", "Kebun di desa"], x: "Ditanami cabai" },
  { id: "B2-088", k: "B", title: "Rantai himpunan", levels: ["Membutuhkan oksigen", "Hewan", "Burung"], dot: "Merpati", at: "in" },
  { id: "B2-089", k: "B", title: "Modus tollens", levels: ["Berwarna merah", "Mawar kebun Bu Rina"], dot: "Mawar Tari (tidak merah)", at: "out" },
  { id: "B2-090", k: "ATAU", title: "Eliminasi pilihan", root: "Semua peserta pelatihan", opts: [{ text: "Di aula", ok: false, note: "aula kosong" }, { text: "Di lapangan", ok: true, note: "tersisa" }] },
  { id: "PR-055", k: "B", title: "Rantai himpunan", levels: ["Jantung beruang empat", "Hewan berdarah panas"], dot: "Paus", at: "in" },
  { id: "PR-056", k: "A", title: "Diagram himpunan", levels: ["Berseragam putih", "Peserta upacara"], x: "Bertopi" },
  { id: "PR-057", k: "CASES", title: "Dua keadaan yang sama-sama sesuai premis", cases: [
    { name: "Keadaan 1", circles: [{ cx: 90, cy: 128, r: 76, label: "Hadir di balai desa" }, { cx: 64, cy: 144, r: 32, label: "Warga" }, { cx: 112, cy: 144, r: 32, label: "Pengurus", ink: true }], verdict: "pengurus ada yang warga" },
    { name: "Keadaan 2", circles: [{ cx: 90, cy: 128, r: 76, label: "Hadir di balai desa" }, { cx: 54, cy: 148, r: 26, label: "Warga" }, { cx: 128, cy: 148, r: 26, label: "Pengurus", ink: true }], verdict: "pengurus bukan warga" }] },
  { id: "PR-058", k: "B", title: "Rantai himpunan", levels: ["Wajib titip tas di loker", "Pengunjung museum"], dot: "Laras", at: "in" },
  { id: "PR-059", k: "C", title: "Modus ponens", rows: [[{ text: "Rapat guru diadakan", st: "T" }, { text: "Semua siswa pulang lebih awal" }]] },
  { id: "PR-060", k: "B", title: "Modus tollens", levels: ["Bersertifikat pertolongan pertama", "Anggota tim SAR"], dot: "Raka (tidak bersertifikat)", at: "out" },
  { id: "PR-061", k: "UJIAN" },
  { id: "PR-062", k: "LOLOS" },
  { id: "PR-063", k: "A", title: "Diagram himpunan", levels: ["Rak atas", "Buku bersampul biru"], x: "Bersampul tebal", xOverOuter: true },
  { id: "PR-067", k: "C", title: "Modus tollens", rows: [[{ text: "Terdaftar dan hadir di aula", st: "F" }, { text: "Mengenakan kartu identitas", st: "F" }]], back: { row: 0, from: 1, to: 0, label: "ditolak mundur" } },
  { id: "MB-041", k: "B", title: "Rantai himpunan", levels: ["Lulus tes kesamaptaan", "Calon prajurit"], dot: "Budi", at: "in" },
  { id: "MB-042", k: "A", title: "Diagram himpunan", levels: ["Punya kartu peserta", "Peserta ujian kedinasan"], x: "Warga masyarakat" },
  { id: "MB-043", k: "C", title: "Rantai jika–maka", rows: [[{ text: "Nilai SKD tinggi", st: "T" }, { text: "Lolos ke SKB" }, { text: "Peluang diterima tinggi" }]], arc: "SKD tinggi → peluang tinggi" },
  { id: "MB-044", k: "C", title: "Modus tollens", rows: [[{ text: "Prajurit disiplin", st: "F" }, { text: "Hadir tepat waktu", st: "F" }]], back: { row: 0, from: 1, to: 0, label: "ditolak mundur" } },
  { id: "MB-045", k: "C", title: "Modus tollens", rows: [[{ text: "Siswa STIS", st: "F" }, { text: "Jago matematika", st: "F" }]], back: { row: 0, from: 1, to: 0, label: "ditolak mundur" } },
];

const LW = 384; // lebar area diagram kiri
const ctr = (e: string) => e.replace('text-anchor="start"', 'text-anchor="middle"');
/** Label bertingkat di tengah, dibungkus ke lebar maxW. */
/** Label di dalam lingkaran jari-jari r (puncak di topY): lebar dibatasi tali busur pada kedalaman 18. */
const ringLab = (cx: number, topY: number, r: number, s: string): El[] => lab(cx, topY + 19, s, 2 * Math.sqrt(2 * r * 18 - 18 * 18) * (r < 70 ? 0.8 : 0.9), r < 70 ? 10 : 10.5, 12);
const lab = (cx: number, y: number, s: string, maxW: number, size = 10.5, gap = 12): El[] => wrapText(cx, y, s, { size, w: 700, maxW, gap }).map(ctr);
const cl = (id: string, d: string, inner: string) => `<clipPath id="${id}">${d}</clipPath>${inner}`;

// ---------- A: bersarang + lingkaran yang beririsan ----------
function diagA(s: Extract<Spec, { k: "A" }>): El[] {
  const n = s.levels.length, radii = n === 3 ? [100, 76, 52] : [100, 64], bot = 242, cx = 118, out: El[] = [];
  s.levels.forEach((lv, i) => out.push(circle(cx, bot - radii[i], radii[i], "#fff", 2), ...ringLab(cx, bot - 2 * radii[i], radii[i], lv)));
  const ri = radii[n - 1], cyI = bot - ri;
  let xc = cx + ri + 24, yc = cyI + 4, xr = ri + 2;
  if (s.xOverOuter) { xc = cx + radii[0] * 0.95; yc = bot - radii[0] - 14; xr = 50; }
  const clipD = s.xOverOuter ? `<circle cx="${cx}" cy="${bot - radii[0]}" r="${radii[0]}"/>` : `<circle cx="${cx}" cy="${cyI}" r="${ri}"/>`;
  if (s.xOuter) out.push(`<circle cx="${xc}" cy="${yc}" r="${xr + 12}" fill="none" stroke="${INK}" stroke-width="1.5" stroke-dasharray="5 4"/>`, ...lab(xc + xr * 0.3, yc + xr + 26, s.xOuter, 140, 10, 11));
  out.push(cl("lens", clipD, `<circle cx="${xc}" cy="${yc}" r="${xr}" fill="url(#hatch)" clip-path="url(#lens)" stroke="none"/>`), `<circle cx="${xc}" cy="${yc}" r="${xr}" fill="none" stroke="${INK}" stroke-width="2"/>`);
  const lx = s.xOverOuter ? xc - xr * 0.2 : (cx + ri + xc - xr) / 2 + 4, ly = s.xOverOuter ? yc + xr * 0.4 : cyI + 8;
  out.push(...box(lx - 19, ly - 11, 38, 22, "ada", { size: 11, r: 11 }), ...wrapText(xc + xr + 6, yc - 4, s.x, { size: 11, w: 700, maxW: LW - (xc + xr + 6) - 4, gap: 13 }));
  return out;
}
// ---------- B: bersarang + satu titik ----------
function diagB(s: Extract<Spec, { k: "B" }>): El[] {
  const n = s.levels.length, radii = n === 3 ? [100, 76, 52] : n === 2 ? [100, 64] : [100], bot = 242, cx = 118, out: El[] = [];
  s.levels.forEach((lv, i) => out.push(circle(cx, bot - radii[i], radii[i], "#fff", 2), ...ringLab(cx, bot - 2 * radii[i], radii[i], lv)));
  const ri = radii[n - 1], cyI = bot - ri, dashed = (x: number, y: number, k: string) => [`<circle cx="${x}" cy="${y}" r="9" fill="#fff" stroke="${INK}" stroke-width="2" stroke-dasharray="3 2"/>`, ...badge(x + 14, y - 10, k, 8)];
  if (s.at === "in") out.push(circle(cx, cyI + 10, 8, INK), tb(cx, cyI + 32, s.dot, 11, "middle"));
  else if (s.at === "out") out.push(circle(cx + radii[0] + 70, bot - 60, 8, INK), ...lab(cx + radii[0] + 70, bot - 36, s.dot, 110, 10.5, 12), tm(cx + radii[0] + 70, bot - 76, "di luar semua", 10, "middle"));
  else out.push(...dashed(cx, cyI + 8, "1"), ...dashed(cx + radii[0] - 14, bot - radii[0] + 30, "2"), ...wrapText(cx + radii[0] + 14, 92, `${s.dot} tidak pasti: ① di dalam ${s.levels[1]} → ya; ② di luar → bukan, tetapi tetap ${s.levels[0]}.`, { size: 10.5, maxW: LW - (cx + radii[0] + 14) - 4, gap: 12.5 }));
  return out;
}
// ---------- C: rantai jika–maka ----------
function diagC(s: Extract<Spec, { k: "C" }>): El[] {
  const out: El[] = [], rows = s.rows, rh = 58, y0 = rows.length > 1 ? 62 : 106;
  rows.forEach((row, r) => {
    const n = row.length, w = n === 3 ? 98 : 128, gap = n === 3 ? 36 : 66, x0 = (LW - (n * w + (n - 1) * gap)) / 2 + 4, y = y0 + r * (rh + 50), pos: number[] = [];
    row.forEach((b, i) => {
      const x = x0 + i * (w + gap); pos.push(x);
      out.push(rect(x, y, w, rh, b.st === "T" ? HATCH : "#fff", { r: 8, sw: b.st === "T" ? 2.5 : 1.5 }), rect(x + 6, y + 8, w - 12, rh - 16, "#fff", { r: 5, sw: 0 }), ...wrapText(x + w / 2, y + 24, b.text, { size: 11, w: 700, maxW: w - 8, gap: 12.5, fill: INK }).map(ctr));
      if (b.st) out.push(...badge(x + w - 2, y + 2, b.st === "T" ? "✓" : b.st === "F" ? "✗" : "?", 10));
      if (i) out.push(line(pos[i - 1] + w + 3, y + rh / 2, x - 3, y + rh / 2, { arrow: true, sw: 2 }), tm((pos[i - 1] + w + x) / 2, y + rh / 2 - 8, "maka", 9.5, "middle"));
    });
    if (s.back && s.back.row === r) {
      const a = pos[s.back.from] + w / 2, b = pos[s.back.to] + w / 2;
      const up = r > 0, y1 = up ? y - 4 : y + rh + 4, y2 = up ? y - 40 : y + rh + 44;
      out.push(curve(`M${a} ${y1} Q ${(a + b) / 2} ${y2 + (up ? -8 : 8)} ${b} ${y1}`, { dash: true, sw: 2 }), tb((a + b) / 2, up ? y - 28 : y + rh + 48, s.back.label, 11, "middle"));
    } else if (s.arc && rows.length === 1 && r === 0) {
      const a = pos[0] + w / 2, b = pos[n - 1] + w / 2;
      out.push(curve(`M${a} ${y - 4} Q ${(a + b) / 2} ${y - 50} ${b} ${y - 4}`, { sw: 2 }), tb((a + b) / 2, y - 38, s.arc, 11, "middle"));
    }
  });
  return out;
}
// ---------- CASES: dua keadaan ----------
function diagCases(s: Extract<Spec, { k: "CASES" }>): El[] {
  const out: El[] = [];
  s.cases.forEach((c, i) => {
    const ox = 4 + i * 190, oy = 40;
    out.push(tb(ox + 90, oy + 4, c.name, 12, "middle"));
    c.circles.forEach((ci) => out.push(`<circle cx="${ox + ci.cx}" cy="${oy + ci.cy - 40}" r="${ci.r}" fill="${ci.ink ? HATCH : "#fff"}" fill-opacity="${ci.ink ? 0.35 : 0}" stroke="${INK}" stroke-width="${ci.ink ? 2.2 : 1.6}"${ci.ink ? ' stroke-dasharray="5 3"' : ""}/>`));
    c.circles.forEach((ci) => out.push(...(ci.r > 60 ? ringLab(ox + ci.cx, oy + ci.cy - 40 - ci.r, ci.r, ci.label) : ci.ink ? [tb(ox + ci.cx, oy + ci.cy - 40 + ci.r + 13, ci.label, 10, "middle")] : [tb(ox + ci.cx, oy + ci.cy - 36, ci.label, 10, "middle")])));
    out.push(...wrapText(ox + 90, oy + 200, `⇒ ${c.verdict}`, { size: 11.5, w: 700, maxW: 170, gap: 14 }).map((e) => e.replace('text-anchor="start"', 'text-anchor="middle"')));
  });
  return out;
}
// ---------- kasus khusus ----------
function diagHari(): El[] {
  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"], w = 48, x0 = 8, y = 110, out: El[] = [];
  days.forEach((d, i) => {
    const x = x0 + i * (w + 3), dark = i === 1, key = i === 4;
    out.push(rect(x, y, w, 46, dark ? INK : key ? HATCH : "#fff", { r: 5, sw: key ? 3 : 1.5 }), tb(x + w / 2, y + 28, d, 10.5, "middle", dark ? "#fff" : INK));
  });
  out.push(tm(x0 + w / 2, y - 8, "kemarin", 10, "middle"), tb(x0 + (w + 3) + w / 2, y - 8, "hari ini", 10.5, "middle"), tb(x0 + 4 * (w + 3) + w / 2, y - 8, "batik", 10.5, "middle"),
    curve(`M${x0 + (w + 3) + w / 2} ${y + 52} Q ${x0 + 2.5 * (w + 3) + w / 2} ${y + 100} ${x0 + 4 * (w + 3) + w / 2} ${y + 52}`, { sw: 2 }), tb(x0 + 2.5 * (w + 3) + w / 2, y + 96, "3 hari lagi", 12, "middle"));
  return out;
}
function diagSahabat(): El[] {
  return [circle(110, 148, 88, "#fff", 2), ...lab(110, 86, "Semua sahabat", 120, 11), tm(110, 100, "(tidak diketahui)", 10, "middle"), `<circle cx="110" cy="160" r="40" fill="url(#hatch)" fill-opacity="0.5" stroke="${INK}" stroke-width="2.5"/>`, rect(80, 142, 60, 36, "#fff", { r: 6, sw: 0 }), tb(110, 157, "Dinda", 12, "middle"), tb(110, 172, "dan Raka", 12, "middle"),
    line(154, 160, 210, 160, { arrow: true, sw: 1.2 }), ...wrapText(216, 148, "hanya mereka berdua yang diketahui berlari bersama tiap Sabtu pagi.", { size: 11, maxW: 160, gap: 13 })];
}
function diagBeda(): El[] {
  return [circle(86, 146, 66, "#fff", 2), ...lab(86, 112, "Pabrik Sentosa", 100, 11), ...wrapText(86, 128, "tidak menerima karyawan baru", { size: 9.5, maxW: 96, gap: 11, fill: MUTED }).map(ctr),
    circle(292, 146, 66, "#fff", 2), ...lab(292, 112, "Karyawan baru minggu ini", 100, 11), circle(292, 152, 8, INK), tb(292, 176, "Nadia", 12, "middle"),
    line(154, 146, 224, 146, { sw: 1.5, dash: true }), `<path d="M180 134 l14 24 M194 134 l-14 24" stroke="${INK}" stroke-width="3"/>`, tm(189, 200, "tidak bersinggungan", 10.5, "middle")];
}
function diagAtau(s: Extract<Spec, { k: "ATAU" }>): El[] {
  const out: El[] = [...box(110, 54, 164, 36, s.root, { size: 11 })];
  s.opts.forEach((o, i) => {
    const x = 20 + i * 190;
    out.push(line(192, 92, x + 70, 134, { arrow: true, sw: 2 }), rect(x, 136, 140, 44, o.ok ? HATCH : "#fff", { r: 8, sw: o.ok ? 3 : 1.5 }), rect(x + 8, 144, 124, 28, "#fff", { r: 5, sw: 0 }), tb(x + 70, 163, o.text, 13, "middle"),
      o.ok ? tb(x + 70, 202, `✓ ${o.note}`, 12, "middle") : `<path d="M${x + 4} ${138} l132 40 M${x + 136} 138 l-132 40" stroke="${INK}" stroke-width="2.5"/>`, ...(o.ok ? [] : [tm(x + 70, 202, o.note, 11, "middle")]));
  });
  return out;
}
function diagUjian(): El[] {
  return [...box(104, 44, 176, 40, "Ada ujian di sekolah?", { size: 12 }), line(150, 86, 74, 126, { arrow: true, sw: 2 }), line(234, 86, 310, 126, { arrow: true, sw: 2 }), tm(84, 106, "tidak", 10.5, "end"), tb(300, 106, "ya (Sabtu ini)", 11, "start"),
    rect(8, 128, 132, 54, "#fff", { r: 8 }), ...wrapText(74, 150, "Renang Sabtu pagi", { size: 11.5, w: 700, maxW: 118, gap: 14 }).map((e) => e.replace('text-anchor="start"', 'text-anchor="middle"')),
    rect(240, 128, 136, 54, HATCH, { r: 8, sw: 3 }), rect(248, 136, 120, 38, "#fff", { r: 5, sw: 0 }), ...wrapText(308, 152, "Renang dipindah ke Minggu pagi", { size: 11.5, w: 700, maxW: 112, gap: 14 }).map((e) => e.replace('text-anchor="start"', 'text-anchor="middle"'))];
}
function diagLolos(): El[] {
  return [rect(8, 62, 180, 52, "#fff", { r: 8 }), ...wrapText(98, 82, "Lari 2,4 km < 12 menit", { size: 11.5, w: 700, maxW: 160, gap: 14 }).map((e) => e.replace('text-anchor="start"', 'text-anchor="middle"')), tm(98, 106, "Bagas: 11 menit", 11, "middle"), ...badge(188, 64, "✓", 11),
    rect(8, 150, 180, 52, "#fff", { r: 8 }), ...wrapText(98, 170, "Push-up > 40 kali", { size: 11.5, w: 700, maxW: 160, gap: 14 }).map((e) => e.replace('text-anchor="start"', 'text-anchor="middle"')), tm(98, 194, "Bagas: 35 kali", 11, "middle"), ...badge(188, 152, "✗", 11),
    line(190, 90, 258, 124, { arrow: true, sw: 2 }), line(190, 178, 258, 144, { arrow: true, sw: 1.5, dash: true }), rect(262, 106, 112, 56, HATCH, { r: 8, sw: 3 }), rect(270, 114, 96, 40, "#fff", { r: 5, sw: 0 }), tb(318, 139, "Lolos fisik", 12, "middle"), tm(318, 188, "cukup satu syarat", 11, "middle")];
}

const sentences = (s: string) => s.replace(/\n/g, " ").replace(/\s*POLRI\b/g, "").replace(/\bSertu\s+/g, "").replace(/\bP\d:\s*/g, "").split(/(?<=[.!?])\s+/).filter(Boolean);
function build(sp: Spec): string {
  const item = loadBank("K08-silogisme.json").find((i) => i.id === `K08-${sp.id}`)!;
  const key = item.kunci[0] as string, title = "title" in sp ? sp.title : sp.k === "HARI" ? "Garis hari dalam seminggu" : sp.k === "SAHABAT" ? "Yang diketahui hanya dua orang" : sp.k === "BEDA" ? "Dua kelompok yang tidak bersinggungan" : sp.k === "UJIAN" ? "Bagan aturan latihan renang" : "Cukup salah satu syarat";
  const left: El[] = sp.k === "A" ? diagA(sp) : sp.k === "B" ? diagB(sp) : sp.k === "C" ? diagC(sp) : sp.k === "CASES" ? diagCases(sp) : sp.k === "HARI" ? diagHari() : sp.k === "SAHABAT" ? diagSahabat() : sp.k === "BEDA" ? diagBeda() : sp.k === "ATAU" ? diagAtau(sp) : sp.k === "UJIAN" ? diagUjian() : diagLolos();
  const px = 398, body: El[] = [tb(10, 22, title, 13), line(LW + 6, 14, LW + 6, 248, { sw: 1, stroke: "#bbbbbb" }), ...left, tm(px, 26, "Premis", 11)];
  let y = 44;
  sentences(item.stem as string).forEach((s) => { const w = wrapText(px, y, s, { size: 11.5, maxW: 208, gap: 13.5 }); body.push(...w); y += w.length * 13.5 + 5; });
  y += 6;
  body.push(tm(px, y, "Kesimpulan", 11)); y += 16;
  body.push(...wrapText(px, y, `${key.toUpperCase()}. ${item.opsi[key]}`, { size: 12, w: 700, maxW: 208, gap: 14.5 }));
  return frame(`Pembahasan K08-${sp.id}`, body);
}

SPECS.forEach((sp) => writeSvg(`K08-${sp.id}`, build(sp)));
const ids = new Set(SPECS.map((s) => `K08-${s.id}`));
patchBank("K08-silogisme.json", (it) => { if (ids.has(it.id as string)) it.gambar_pembahasan = `${it.id}.svg`; });
if (ids.size !== 37) throw new Error(`jumlah ${ids.size} ≠ 37`);
console.log(`${ids.size} SVG K08`);
