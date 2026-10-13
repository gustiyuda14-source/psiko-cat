/**
 * Gambar pembahasan K07 alokasi waktu (K07-AK-001..016): batang waktu tersedia vs beban tugas.
 * Semua angka dihitung ulang di sini dari data spesifikasi dan dicocokkan dengan jawaban (assert), tidak disalin dari teks pembahasan.
 *   npx tsx scripts/generate-k07-alokasi-pbh.ts
 */
import { El, INK, box, frame, line, patchBank, rect, t, tb, tm, wrapText, writeSvg } from "./pbh-svg-lib";

type Task = [name: string, min: number];
type Spec =
  | { id: string; mode: "lepas"; title: string; avail: number; brk?: number; tasks: Task[]; del: number[]; note: string }
  | { id: string; mode: "kurang"; title: string; avail: number; tasks: Task[]; note: string }
  | { id: string; mode: "urut"; title: string; avail: number; tasks: Task[]; note: string }
  | { id: string; mode: "dua"; title: string; lanes: [string, number[]][]; tasks: Task[]; note: string }
  | { id: string; mode: "bantu"; title: string; avail: number; win: number; mult: number; tasks: Task[]; pick: number; note: string };

const SPECS: Spec[] = [
  { id: "001", mode: "lepas", title: "Waktu 08.00–09.30: lepas satu tugas", avail: 90, tasks: [["Laporan", 39], ["Arsip", 24], ["Mutasi", 31], ["Inventaris", 35]], del: [0], note: "Kelebihan 129 − 90 = 39, jadi tugas yang dilepas minimal 39 menit: hanya Laporan (39)." },
  { id: "002", mode: "lepas", title: "Waktu 13.30–15.35: lepas tugas terpendek yang cukup", avail: 125, tasks: [["Sertif.", 34], ["Daftar", 52], ["Juri", 41], ["Meja reg.", 38]], del: [2], note: "Kelebihan 165 − 125 = 40. Yang ≥ 40: Berkas juri (41) dan Daftar regu (52); pilih yang terpendek, 41." },
  { id: "003", mode: "lepas", title: "Waktu 06.30–08.37: lepas tugas terpendek yang cukup", avail: 127, tasks: [["Data", 26], ["Sarapan", 33], ["Stok obat", 18], ["Logistik", 47], ["Gudang", 40]], del: [4], note: "Kelebihan 164 − 127 = 37. Yang ≥ 37: Tata gudang (40) dan Laporan logistik (47); pilih yang terpendek, 40." },
  { id: "004", mode: "lepas", title: "Waktu 19.30–21.00: cek dulu muat atau tidak", avail: 90, tasks: [["Laporan", 11], ["Jadwal", 31], ["Absensi", 28], ["Kamar", 18]], del: [], note: "Beban 11 + 31 + 28 + 18 = 88 menit ≤ 90: tidak ada kelebihan (sisa 2 menit), jadi tidak ada tugas yang perlu diserahkan." },
  { id: "005", mode: "kurang", title: "Waktu 10.00–11.30: berapa kekurangannya?", avail: 90, tasks: [["Undangan", 26], ["Notula", 34], ["Bahan rapat", 19], ["Ruang rapat", 23]], note: "Beban 26 + 34 + 19 + 23 = 102 menit, tersedia 90 menit: kekurangan 12 menit." },
  { id: "006", mode: "lepas", title: "Waktu 14.45–16.25: lepas tugas terpendek yang cukup", avail: 100, tasks: [["Arsip surat", 9], ["Papan data", 16], ["Kegiatan", 41], ["Surat", 25], ["Rekap harian", 31]], del: [3], note: "Kelebihan 122 − 100 = 22. Yang ≥ 22: 25, 31, 41; pilih yang terpendek, Surat tanda terima (25)." },
  { id: "007", mode: "lepas", title: "Waktu 09.50–11.28: lepas tugas terpendek yang cukup", avail: 98, tasks: [["Nomor dada", 26], ["Formulir", 33], ["Denah", 28], ["Medis", 24], ["Juri", 12]], del: [0], note: "Kelebihan 123 − 98 = 25. Yang ≥ 25: 26, 28, 33; pilih yang terpendek, Nomor dada (26)." },
  { id: "008", mode: "lepas", title: "Waktu 07.50–09.35 dengan rapat 15 menit", avail: 90, brk: 15, tasks: [["Papan", 9], ["Air", 13], ["Data", 28], ["Logistik", 44], ["Selimut", 23]], del: [2], note: "Waktu kerja 105 − 15 (rapat) = 90 menit; kelebihan 117 − 90 = 27. Yang ≥ 27: 28 dan 44; pilih 28." },
  { id: "009", mode: "lepas", title: "Waktu 11.35–13.10 dengan ishoma 25 menit", avail: 70, brk: 25, tasks: [["Buku piket", 7], ["Gudang", 33], ["Mandi", 17], ["Izin", 11], ["Jadwal", 21]], del: [4], note: "Waktu kerja 95 − 25 (ishoma) = 70 menit; kelebihan 89 − 70 = 19. Yang ≥ 19: 21 dan 33; sisa luang paling sedikit dari yang terkecil, Jadwal piket (21)." },
  { id: "010", mode: "urut", title: "Selesaikan sebanyak mungkin tugas (85 menit)", avail: 85, tasks: [["", 8], ["", 13], ["", 17], ["", 23], ["", 25], ["", 38]], note: "Urutkan dari terpendek lalu jumlahkan: 8, 21, 38, 61, 86. Tugas kelima melewati 85, jadi paling banyak 4 tugas." },
  { id: "011", mode: "urut", title: "Selesaikan sebanyak mungkin tugas (95 menit)", avail: 95, tasks: [["", 8], ["", 14], ["", 19], ["", 22], ["", 27], ["", 33]], note: "Jumlah bertahap: 8, 22, 41, 63, 90 (5 tugas); tugas ke-6 (33) membuat 123 > 95. Sisa waktu 95 − 90 = 5 menit." },
  { id: "012", mode: "lepas", title: "Waktu efektif 72 menit: lepas tepat dua tugas", avail: 72, tasks: [["Rekap", 24], ["Arsip", 16], ["Jadwal", 32], ["Mutasi", 18], ["Notula", 28]], del: [3, 4], note: "Kelebihan 118 − 72 = 46. Tidak ada satu tugas yang cukup, jadi dua tugas yang jumlahnya tepat 46: 18 + 28 (Buku mutasi + Notula)." },
  { id: "013", mode: "lepas", title: "Waktu efektif 116 menit: lepas dua tugas, sekecil mungkin", avail: 116, tasks: [["Proposal", 37], ["Donatur", 26], ["Surat", 17], ["Anggaran", 32], ["Spanduk", 31], ["Konfirm.", 15]], del: [1, 2], note: "Kelebihan 158 − 116 = 42. Pasangan dengan jumlah ≥ 42 yang terkecil: 26 + 17 = 43 (Donatur + Undangan). Tidak ada yang tepat 42." },
  { id: "014", mode: "dua", title: "Dua orang mulai bersamaan: samakan bebannya", tasks: [["Data", 29], ["Dapur", 12], ["Tenda", 38], ["Lampu", 18], ["Makanan", 36], ["Obat", 15]], lanes: [["Fikri", [2, 4]], ["Danu", [0, 3, 5, 1]]], note: "Total 148 menit, dibagi dua = 74 menit tiap orang. Tenda + Makanan = 38 + 36 = 74, dan sisanya 29 + 18 + 15 + 12 = 74: keduanya selesai menit ke-74." },
  { id: "015", mode: "dua", title: "Dua orang bersamaan: beban terbesar sekecil mungkin", tasks: [["Lorong", 23], ["Mandi", 32], ["Gudang", 13], ["Tirai", 31], ["Halaman", 21]], lanes: [["Rangga", [1, 3]], ["Danu", [0, 2, 4]]], note: "Total 120, idealnya 60 + 60, tetapi tidak ada kelompok yang berjumlah tepat 60. Beban terbesar paling kecil = 63 (32 + 31), jadi selesai 07.50 + 63 menit = 08.53." },
  { id: "016", mode: "bantu", title: "Syarat dua pihak: Tiara dan Fikri", avail: 105, win: 37, mult: 1.5, tasks: [["Rencana", 38], ["Surat", 16], ["Laporan", 28], ["Absensi", 24], ["Peta", 19]], pick: 3, note: "Tiara perlu melepas ≥ 20 menit (125 − 105), Fikri hanya sanggup durasi ≤ 37 ÷ 1,5 ≈ 24,7. Hanya Absensi (24) memenuhi keduanya." },
];

const X0 = 112, XW = 462;
const fmtMin = (n: number) => `${n}`;
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
/** Susun segmen tugas berurutan mulai x; kembalikan elemen dan x akhir. */
function stack(tasks: Task[], idxs: number[], x: number, y: number, k: number, opt: { dash?: boolean; h?: number; grey?: boolean } = {}): { els: El[]; end: number } {
  const els: El[] = [], h = opt.h ?? 40;
  let cx = x;
  idxs.forEach((i, n) => {
    const [nm, m] = tasks[i], w = m * k;
    els.push(rect(cx, y, w, h, opt.dash ? "url(#hatch)" : n % 2 ? "#e9e9e9" : "#fff", { sw: opt.dash ? 2 : 1.3, dash: opt.dash }));
    const fit = (s: string, size: number) => { const per = Math.floor((w - 4) / (size * 0.58)); return s.length <= per ? s : per >= 4 ? s.slice(0, per - 1) + "…" : ""; };
    if (!opt.dash) els.push(...(nm ? [t(cx + w / 2, y + 17, fit(nm, w < 56 ? 9 : 10.5), { size: w < 56 ? 9 : 10.5, w: 600, anchor: "middle" })] : []), tb(cx + w / 2, y + (nm ? 33 : 25), fmtMin(m), 12, "middle"));
    else els.push(rect(cx + 3, y + 8, w - 6, h - 16, "#fff", { sw: 0 }), t(cx + w / 2, y + 17, fit(nm, 9.5), { size: 9.5, w: 700, anchor: "middle" }), tb(cx + w / 2, y + 31, fmtMin(m), 11.5, "middle"));
    cx += w;
  });
  return { els, end: cx };
}
const rowLab = (y: number, s: string, s2?: string): El[] => [tb(8, y + 16, s, 11.5), ...(s2 ? [tm(8, y + 30, s2, 10)] : [])];

function lepas(sp: Extract<Spec, { mode: "lepas" }>): El[] {
  const total = sum(sp.tasks.map((x) => x[1])), over = total - sp.avail, k = (XW - (sp.del.length ? 6 : 0)) / Math.max(total, sp.avail + (sp.brk ?? 0)), out: El[] = [];
  const all = sp.tasks.map((_, i) => i), keep = all.filter((i) => !sp.del.includes(i));
  // assert: kunci = tugas yang dilepas (kecuali soal "tidak perlu")
  if (sp.del.length && sum(sp.del.map((i) => sp.tasks[i][1])) < over) throw new Error(`${sp.id}: tugas dilepas kurang dari kelebihan`);
  if (sum(keep.map((i) => sp.tasks[i][1])) > sp.avail) throw new Error(`${sp.id}: sisa beban masih melewati waktu`);
  out.push(...rowLab(40, "Waktu", "tersedia"), rect(X0, 42, sp.avail * k, 30, "#fff", { sw: 2.2 }), tb(X0 + sp.avail * k / 2, 62, `${sp.avail} menit`, 13, "middle"));
  if (sp.brk) out.push(rect(X0 + sp.avail * k, 42, sp.brk * k, 30, "url(#hatch)", { dash: true }), tm(X0 + sp.avail * k + sp.brk * k / 2, 88, `jeda ${sp.brk}`, 10, "middle"));
  out.push(...rowLab(100, "Beban", "semua tugas"), ...stack(sp.tasks, all, X0, 100, k).els, line(X0 + sp.avail * k, 36, X0 + sp.avail * k, 200, { dash: true, sw: 1.5 }));
  if (over > 0) out.push(`<path d="M${X0 + sp.avail * k} 148 v6 h${over * k} v-6" fill="none" stroke="${INK}" stroke-width="1.5"/>`, tb(X0 + sp.avail * k + (over * k) / 2, 168, `kelebihan ${over}`, 12, "middle"));
  else out.push(tm(X0 + total * k, 154, `sisa ${sp.avail - total} menit`, 11, "end"));
  if (sp.del.length) {
    const s = stack(sp.tasks, keep, X0, 172, k);
    out.push(...rowLab(172, "Dikerjakan", "sendiri"), ...s.els, ...stack(sp.tasks, sp.del, s.end + 14, 172, k, { dash: true }).els, tm(s.end + 14, 229, "← diserahkan", 10), tb(X0 + sum(keep.map((i) => sp.tasks[i][1])) * k / 2, 231, `${sum(keep.map((i) => sp.tasks[i][1]))} ≤ ${sp.avail} ✓`, 12, "middle"));
  }
  return out;
}
function kurang(sp: Extract<Spec, { mode: "kurang" }>): El[] {
  const total = sum(sp.tasks.map((x) => x[1])), k = XW / total, over = total - sp.avail;
  return [...rowLab(46, "Waktu", "tersedia"), rect(X0, 48, sp.avail * k, 30, "#fff", { sw: 2.2 }), tb(X0 + sp.avail * k / 2, 68, `${sp.avail} menit`, 13, "middle"), ...rowLab(110, "Beban", "semua tugas"), ...stack(sp.tasks, sp.tasks.map((_, i) => i), X0, 110, k).els,
    line(X0 + sp.avail * k, 40, X0 + sp.avail * k, 168, { dash: true, sw: 1.5 }), `<path d="M${X0 + sp.avail * k} 158 v6 h${over * k} v-6" fill="none" stroke="${INK}" stroke-width="1.5"/>`, tb(X0 + sp.avail * k + over * k / 2, 182, `kurang ${over} menit`, 13, "middle")];
}
function urut(sp: Extract<Spec, { mode: "urut" }>): El[] {
  const sorted = [...sp.tasks].sort((a, b) => a[1] - b[1]), total = sum(sorted.map((x) => x[1])), k = XW / Math.max(total, sp.avail), out: El[] = [];
  let cum = 0, fit = 0;
  out.push(...rowLab(54, "Terpendek", "dulu"), rect(X0, 56, sp.avail * k, 8, "#fff", { sw: 1.5 }), tm(X0 + sp.avail * k, 50, `batas ${sp.avail}`, 10.5, "end"));
  sorted.forEach(([, m]) => {
    const w = m * k, ok = cum + m <= sp.avail;
    out.push(rect(X0 + cum * k, 100, w, 44, ok ? "#fff" : "url(#hatch)", { sw: ok ? 1.5 : 2, dash: !ok }), ok ? tb(X0 + cum * k + w / 2, 127, String(m), 13, "middle") : `<rect x="${X0 + cum * k + 3}" y="108" width="${Math.max(0, w - 6)}" height="28" fill="#fff"/>` + tb(X0 + cum * k + w / 2, 127, String(m), 13, "middle"));
    cum += m; if (ok) fit++;
    out.push(tm(X0 + cum * k, 162, `Σ ${cum}`, 10.5, "middle"), line(X0 + cum * k, 144, X0 + cum * k, 150, { sw: 1 }));
  });
  out.push(line(X0 + sp.avail * k, 70, X0 + sp.avail * k, 150, { dash: true, sw: 1.5 }), ...rowLab(100, "Tugas", "urut naik"), ...box(X0, 188, 170, 30, `${fit} tugas muat`, { dark: true, size: 13, r: 15 }), tm(X0 + 184, 208, `sisa ${sp.avail - sorted.slice(0, fit).reduce((a, x) => a + x[1], 0)} menit`, 12));
  return out;
}
function dua(sp: Extract<Spec, { mode: "dua" }>): El[] {
  const loads = sp.lanes.map(([, idx]) => sum(idx.map((i) => sp.tasks[i][1]))), total = sum(sp.tasks.map((x) => x[1])), mx = Math.max(...loads), k = XW / (mx + 6), out: El[] = [];
  if (sum(loads) !== total) throw new Error(`${sp.id}: pembagian tidak memuat semua tugas`);
  sp.lanes.forEach(([nm, idx], r) => { const y = 54 + r * 62; out.push(...rowLab(y, nm, `${loads[r]} menit`), ...stack(sp.tasks, idx, X0, y, k).els); });
  out.push(line(X0 + mx * k, 40, X0 + mx * k, 176, { dash: true, sw: 1.5 }), tb(X0 + mx * k, 192, `selesai di menit ${mx}`, 12.5, "middle"), tm(X0, 192, `ideal ${total} ÷ 2 = ${total / 2}`, 11));
  return out;
}
function bantu(sp: Extract<Spec, { mode: "bantu" }>): El[] {
  const total = sum(sp.tasks.map((x) => x[1])), over = total - sp.avail, maxD = sp.win / sp.mult, out: El[] = [tm(X0, 40, `Perlu dilepas ≥ ${over} menit · durasi ≤ ${sp.win} ÷ ${sp.mult} ≈ ${maxD.toFixed(1)} menit`, 11.5), tb(X0 + 170, 66, `Sisa Tiara ≤ ${sp.avail}?`, 11, "middle"), tb(X0 + 330, 66, `Fikri ${sp.mult} × durasi ≤ ${sp.win}?`, 11, "middle")];
  sp.tasks.forEach(([nm, m], i) => {
    const y = 76 + i * 30, a = total - m, tOk = a <= sp.avail, fOk = m * sp.mult <= sp.win, both = tOk && fOk;
    out.push(rect(8, y, 596, 26, both ? "url(#hatch)" : "#fff", { sw: both ? 2.5 : 1 }), rect(12, y + 3, 100, 20, "#fff", { sw: 0 }), tb(16, y + 17, `${nm} ${m}`, 12), ...[[X0 + 170, tOk, `${a}`], [X0 + 330, fOk, `${m * sp.mult}`]].flatMap(([x, ok, v]) => [tb(+x - 24, y + 17, String(v), 12, "end"), tb(+x - 14, y + 17, ok ? "✓" : "✗", 13)]));
  });
  return out;
}

function build(sp: Spec): string {
  const body: El[] = [tb(8, 22, sp.title, 13)];
  body.push(...(sp.mode === "lepas" ? lepas(sp) : sp.mode === "kurang" ? kurang(sp) : sp.mode === "urut" ? urut(sp) : sp.mode === "dua" ? dua(sp) : bantu(sp)));
  body.push(...wrapText(8, sp.mode === "bantu" ? 238 : sp.mode === "lepas" ? 244 : 232, sp.note, { size: 11, w: 600, maxW: 596, gap: 12.5 }));
  return frame(`Pembahasan K07-AK-${sp.id}`, body);
}

SPECS.forEach((sp) => writeSvg(`K07-AK-${sp.id}`, build(sp)));
const ids = new Set(SPECS.map((s) => `K07-AK-${s.id}`));
patchBank("K07-soal-cerita.json", (it) => { if (ids.has(it.id as string)) it.gambar_pembahasan = `${it.id}.svg`; });
if (ids.size !== 16) throw new Error(`jumlah ${ids.size} ≠ 16`);
console.log(`${ids.size} SVG K07 alokasi`);
