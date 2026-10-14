/**
 * K07 alokasi waktu, bentuk "poin maksimal": butir K07-N-011..040 (sub_type NUM-CRT-ALOKASI-POIN).
 *   npx tsx scripts/generate-k07-poin.ts                 # status_kunci = tunggal (belum dicek buta)
 *   npx tsx scripts/generate-k07-poin.ts --status ganda  # setelah cek buta sepakat
 * Tiap butir = jendela waktu T + 3–4 kegiatan (menit, poin, boleh diulang) + syarat opsional (batas kali / wajib).
 * Kunci dan pengecoh dihitung dari data lewat brute force (pedoman D-1, Q-2); skrip gagal bila optimum tidak tunggal,
 * pengecoh tidak sesuai kesalahan yang dinamai, sebaran kunci tidak rata, atau ada unsur A-7 / nama kegiatan bocor.
 * Butir lain di K07 tidak disentuh; N-011..040 selalu dibangkitkan ulang; status `ganda` dipertahankan bila stem/opsi tidak berubah.
 */
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { checkA7 } from "./kecerdasan-teks-lib";

const ROOT = join(__dirname, "..");
const FILE = join(ROOT, "bank/drill/kecerdasan/K07-soal-cerita.json");
const LETTERS = ["a", "b", "c", "d", "e"];
const RILIS = "2026-10-14"; // tanggal push batch; ganti bila push mundur (badge NEW)
const status = process.argv.includes("--status") ? process.argv[process.argv.indexOf("--status") + 1] : "tunggal";

type Act = { n: string; m: number; p: number; maks?: number; wajib?: boolean };
type Inst = { id: string; tier: 1 | 2 | 3; konteks: string; T: number; acts: Act[]; kunci: string };
type Tag = "LEBIH" | "BATAS" | "RATE" | "ABS" | "PAS" | "RENDAH";

const I = (id: string, tier: 1 | 2 | 3, kunci: string, T: number, konteks: string, acts: Act[]): Inst => ({ id, tier, konteks, T, acts, kunci });
const INST: Inst[] = [
  I("K07-N-011", 1, "c", 40, "Seorang peserta pelatihan administrasi memiliki waktu 40 menit untuk menambah poin belajar. Kegiatan yang tersedia:",
    [{ n: "Mendengarkan ceramah", m: 20, p: 70 }, { n: "Membaca buku panduan", m: 10, p: 45 }, { n: "Mengerjakan kuis", m: 8, p: 40 }]),
  I("K07-N-012", 1, "a", 36, "Seorang siswa menjaga stan kerajinan di bazar sekolah selama 36 menit dan mengumpulkan poin kreativitas. Kegiatan yang tersedia:",
    [{ n: "Menganyam gelang", m: 18, p: 72 }, { n: "Membuat bros kain", m: 9, p: 45 }, { n: "Melukis kipas", m: 6, p: 24 }]),
  I("K07-N-013", 1, "d", 35, "Seorang atlet pemula memiliki sesi latihan 35 menit dan mengumpulkan poin kebugaran. Kegiatan yang tersedia:",
    [{ n: "Lari keliling lapangan", m: 15, p: 60 }, { n: "Lompat tali", m: 10, p: 50 }, { n: "Peregangan otot", m: 5, p: 20 }]),
  I("K07-N-014", 2, "e", 75, "Seorang peserta bimbingan belajar memiliki waktu 75 menit untuk persiapan ulangan dan mengumpulkan poin penguasaan. Kegiatan yang tersedia:",
    [{ n: "Menghafal rumus", m: 9, p: 50 }, { n: "Mengerjakan soal latihan", m: 10, p: 55 }, { n: "Menonton video pembahasan", m: 15, p: 60 }]),
  I("K07-N-015", 2, "b", 50, "Seorang karyawan koperasi simpan pinjam memiliki waktu 50 menit sebelum jam makan siang dan mengumpulkan poin kinerja. Kegiatan yang tersedia:",
    [{ n: "Menginput data anggota", m: 12, p: 66 }, { n: "Memeriksa laporan setoran", m: 15, p: 68 }, { n: "Melayani konsultasi pinjaman", m: 30, p: 120 }]),
  I("K07-N-016", 2, "c", 55, "Seorang relawan taman kota bertugas selama 55 menit dan mengumpulkan poin kontribusi. Kegiatan yang tersedia:",
    [{ n: "Memangkas tanaman hias", m: 8, p: 40 }, { n: "Menyiram kebun bibit", m: 18, p: 63 }, { n: "Menyapu jalur setapak", m: 7, p: 28 }]),
  I("K07-N-017", 2, "a", 75, "Seorang petugas perpustakaan kampus memiliki waktu 75 menit pada jam sepi dan mengumpulkan poin layanan. Kegiatan yang tersedia:",
    [{ n: "Menempel label buku", m: 4, p: 10 }, { n: "Menyusun koleksi di rak", m: 30, p: 120 }, { n: "Melayani peminjaman", m: 10, p: 60 }]),
  I("K07-N-018", 3, "d", 55, "Seorang guru memiliki waktu 55 menit di sela jam mengajar dan mengumpulkan poin kinerja. Kegiatan yang tersedia:",
    [{ n: "Memeriksa tugas siswa", m: 12, p: 66 }, { n: "Menyusun laporan nilai", m: 24, p: 72, wajib: true }, { n: "Mengisi daftar hadir", m: 4, p: 14, wajib: true }, { n: "Menyiapkan bahan ajar", m: 15, p: 90 }]),
  I("K07-N-019", 3, "b", 55, "Seorang peserta bazar kuliner memiliki waktu memasak 55 menit dan mengumpulkan poin penilaian juri. Kegiatan yang tersedia:",
    [{ n: "Membuat roti isi", m: 24, p: 96 }, { n: "Membuat pastel", m: 8, p: 40 }, { n: "Membuat donat", m: 12, p: 54 }, { n: "Membuat bolu kukus", m: 18, p: 99, maks: 2 }]),
  I("K07-N-020", 3, "e", 50, "Seorang pengunjung pameran sains memiliki waktu 50 menit untuk berkeliling dan mengumpulkan poin keaktifan. Kegiatan yang tersedia:",
    [{ n: "Mencoba simulasi robot", m: 10, p: 70, maks: 1 }, { n: "Menonton demonstrasi laboratorium", m: 15, p: 90, maks: 1 }, { n: "Mengisi kuis stan", m: 5, p: 25 }, { n: "Mengikuti diskusi panel", m: 20, p: 80 }]),
  // batch 23 (2026-10-14): +20
  I("K07-N-021", 1, "b", 40, "Seorang peserta kelas bahasa Inggris memiliki waktu 40 menit untuk mengumpulkan poin keterampilan. Kegiatan yang tersedia:",
    [{ n: "Menulis esai pendek", m: 30, p: 165 }, { n: "Berlatih percakapan", m: 10, p: 70 }, { n: "Menghafal kosakata", m: 4, p: 26 }]),
  I("K07-N-022", 1, "d", 30, "Seorang anggota klub catur memiliki waktu latihan 30 menit dan mengumpulkan poin latihan. Kegiatan yang tersedia:",
    [{ n: "Memecahkan teka-teki catur", m: 6, p: 39 }, { n: "Bermain partai cepat", m: 10, p: 70 }, { n: "Menganalisis partai klasik", m: 24, p: 108 }]),
  I("K07-N-023", 1, "a", 30, "Seorang pemain bulu tangkis pemula memiliki sesi latihan 30 menit dan mengumpulkan poin latihan. Kegiatan yang tersedia:",
    [{ n: "Berlatih servis", m: 8, p: 28 }, { n: "Berlatih gerak kaki", m: 5, p: 25 }, { n: "Bermain pertandingan ganda", m: 15, p: 45 }]),
  I("K07-N-024", 1, "e", 30, "Seorang anggota pramuka memiliki waktu 30 menit pada latihan rutin dan mengumpulkan poin kecakapan. Kegiatan yang tersedia:",
    [{ n: "Mempraktikkan simpul tali", m: 10, p: 60 }, { n: "Membuat tandu darurat", m: 20, p: 100 }, { n: "Menghafal sandi semafor", m: 5, p: 15 }]),
  I("K07-N-025", 1, "c", 40, "Seorang pekerja paruh waktu di toko roti memiliki waktu 40 menit dan mengumpulkan poin kinerja. Kegiatan yang tersedia:",
    [{ n: "Menghias kue mangkuk", m: 6, p: 42 }, { n: "Membungkus roti tawar", m: 10, p: 65 }, { n: "Memanggang bolu gulung", m: 12, p: 48 }]),
  I("K07-N-026", 1, "b", 45, "Seorang mahasiswa magang di kantor desain memiliki waktu 45 menit dan mengumpulkan poin tugas. Kegiatan yang tersedia:",
    [{ n: "Membuat poster acara", m: 24, p: 132 }, { n: "Merapikan berkas desain", m: 5, p: 15 }, { n: "Membuat ikon aplikasi", m: 8, p: 52 }]),
  I("K07-N-027", 1, "d", 40, "Seorang siswa kelas musik memiliki waktu latihan 40 menit dan mengumpulkan poin latihan. Kegiatan yang tersedia:",
    [{ n: "Berlatih tangga nada", m: 9, p: 54 }, { n: "Menyetel senar ukulele", m: 4, p: 22 }, { n: "Memainkan lagu utuh", m: 15, p: 75 }]),
  I("K07-N-028", 2, "a", 30, "Seorang penjahit rumahan memiliki waktu 30 menit sebelum menjemput anak dan mengumpulkan poin pesanan. Kegiatan yang tersedia:",
    [{ n: "Memasang kancing baju", m: 18, p: 54 }, { n: "Menjahit sarung bantal", m: 20, p: 100 }, { n: "Memotong pola kemeja", m: 30, p: 120 }]),
  I("K07-N-029", 2, "e", 60, "Seorang relawan bank sampah bertugas selama 60 menit dan mengumpulkan poin kontribusi. Kegiatan yang tersedia:",
    [{ n: "Memilah botol plastik", m: 8, p: 28 }, { n: "Menimbang kardus bekas", m: 12, p: 54 }, { n: "Mengisi buku tabungan sampah", m: 9, p: 45 }]),
  I("K07-N-030", 2, "c", 70, "Seorang fotografer acara wisuda memiliki waktu 70 menit dan mengumpulkan poin pekerjaan. Kegiatan yang tersedia:",
    [{ n: "Memotret foto keluarga", m: 18, p: 117 }, { n: "Menyunting album digital", m: 25, p: 150 }, { n: "Mencetak foto ukuran kecil", m: 9, p: 45 }]),
  I("K07-N-031", 2, "b", 80, "Seorang karyawan gudang ekspedisi memiliki waktu 80 menit pada satu giliran kerja dan mengumpulkan poin kinerja. Kegiatan yang tersedia:",
    [{ n: "Menyortir paket kiriman", m: 18, p: 99 }, { n: "Memuat barang ke truk", m: 30, p: 135 }, { n: "Menempel resi pengiriman", m: 4, p: 14 }]),
  I("K07-N-032", 2, "d", 70, "Seorang peserta pelatihan barista memiliki waktu praktik 70 menit dan mengumpulkan poin praktik. Kegiatan yang tersedia:",
    [{ n: "Menyangrai biji kopi", m: 24, p: 108 }, { n: "Membuat latte art", m: 15, p: 105 }, { n: "Membersihkan mesin kopi", m: 4, p: 26 }]),
  I("K07-N-033", 2, "a", 55, "Seorang pengelola kebun hidroponik memiliki waktu 55 menit dan mengumpulkan poin perawatan. Kegiatan yang tersedia:",
    [{ n: "Memanen sawi", m: 20, p: 80 }, { n: "Mengganti larutan nutrisi", m: 24, p: 120 }, { n: "Menyemai benih selada", m: 9, p: 63 }]),
  I("K07-N-034", 3, "e", 50, "Seorang staf humas kampus memiliki waktu 50 menit dan mengumpulkan poin kinerja. Kegiatan yang tersedia:",
    [{ n: "Menulis siaran pers", m: 10, p: 70 }, { n: "Mengunggah konten media sosial", m: 6, p: 33 }, { n: "Membalas pesan pengunjung", m: 4, p: 14, wajib: true }, { n: "Menyusun laporan bulanan", m: 20, p: 80, wajib: true }]),
  I("K07-N-035", 3, "c", 70, "Seorang petugas puskesmas memiliki waktu 70 menit pada jam pelayanan dan mengumpulkan poin layanan. Kegiatan yang tersedia:",
    [{ n: "Mengisi kartu berobat", m: 6, p: 18, wajib: true }, { n: "Menimbang badan pasien", m: 4, p: 16, wajib: true }, { n: "Memberikan penyuluhan gizi", m: 15, p: 90 }, { n: "Mendata ibu hamil", m: 18, p: 90 }]),
  I("K07-N-036", 3, "b", 45, "Seorang pengurus OSIS memiliki waktu 45 menit saat jam istirahat panjang dan mengumpulkan poin keaktifan. Kegiatan yang tersedia:",
    [{ n: "Merancang pamflet lomba", m: 10, p: 70 }, { n: "Memimpin rapat koordinasi kelas", m: 18, p: 54, wajib: true }, { n: "Mengecek kas OSIS", m: 8, p: 36, wajib: true }, { n: "Memasang poster di mading", m: 5, p: 30 }]),
  I("K07-N-037", 3, "d", 70, "Seorang pemandu museum memiliki waktu 70 menit dan mengumpulkan poin layanan. Kegiatan yang tersedia:",
    [{ n: "Memandu rombongan sekolah", m: 24, p: 108 }, { n: "Menjawab pertanyaan di meja informasi", m: 4, p: 24, maks: 2 }, { n: "Menata ulang vitrin koleksi", m: 9, p: 27 }, { n: "Membersihkan replika artefak", m: 5, p: 20 }]),
  I("K07-N-038", 3, "a", 50, "Seorang pengrajin keramik memiliki waktu 50 menit sebelum tungku dinyalakan dan mengumpulkan poin produksi. Kegiatan yang tersedia:",
    [{ n: "Membuat guci besar", m: 18, p: 108, maks: 1 }, { n: "Mengamplas tatakan", m: 4, p: 12 }, { n: "Membuat cangkir", m: 6, p: 30 }, { n: "Mewarnai piring hias", m: 30, p: 75 }]),
  I("K07-N-039", 3, "e", 80, "Seorang editor penerbit buku memiliki waktu 80 menit dan mengumpulkan poin kinerja. Kegiatan yang tersedia:",
    [{ n: "Menyunting naskah bab", m: 30, p: 120 }, { n: "Memeriksa ejaan sampul", m: 10, p: 30, wajib: true }, { n: "Menyusun daftar isi", m: 15, p: 90 }, { n: "Menulis sinopsis", m: 12, p: 78, maks: 1 }]),
  I("K07-N-040", 3, "c", 50, "Seorang peserta perkemahan memiliki waktu 50 menit sebelum upacara api unggun dan mengumpulkan poin regu. Kegiatan yang tersedia:",
    [{ n: "Membangun gapura bambu", m: 15, p: 105, maks: 1 }, { n: "Mencari jejak", m: 20, p: 80 }, { n: "Mengikat tali pancang", m: 5, p: 25 }, { n: "Membersihkan area kemah", m: 8, p: 24, wajib: true }]),
];

// ── model ──────────────────────────────────────────────────────────────
type S = number[];
const time = (a: Act[], s: S) => s.reduce((t, c, i) => t + c * a[i].m, 0);
const pts = (a: Act[], s: S) => s.reduce((t, c, i) => t + c * a[i].p, 0);
const langgar = (a: Act[], s: S) => a.flatMap((x, i) =>
  x.maks !== undefined && s[i] > x.maks ? [`${x.n} dilakukan ${s[i]} kali padahal hanya tersedia ${x.maks} kali`]
    : x.wajib && s[i] < 1 ? [`${x.n} tidak dilakukan padahal wajib minimal satu kali`] : []);
const sah = (inst: Inst, s: S) => time(inst.acts, s) <= inst.T && langgar(inst.acts, s).length === 0;
const same = (x: S, y: S) => x.every((c, i) => c === y[i]);

function semua(T: number, a: Act[]): S[] {
  const out: S[] = [];
  const rec = (i: number, left: number, cur: S) => {
    if (i === a.length) return void out.push(cur);
    for (let c = 0; c * a[i].m <= left; c++) rec(i + 1, left - c * a[i].m, [...cur, c]);
  };
  rec(0, T, []);
  return out;
}
const validTop = (inst: Inst) => semua(inst.T, inst.acts).filter((s) => sah(inst, s)).sort((x, y) => pts(inst.acts, y) - pts(inst.acts, x));

const rate = (x: Act) => x.p / x.m;
const idf = (v: number) => String(Number(v.toFixed(2))).replace(".", ",");
const rasio = (x: Act) => (Number.isInteger(rate(x)) || Math.abs(rate(x) * 10 - Math.round(rate(x) * 10)) < 1e-9 ? "" : "sekitar ") + idf(rate(x));
const teks = (a: Act[], s: S) => s.map((c, i) => (c > 0 ? `${a[i].n} ${c} kali` : "")).filter(Boolean).join(" + ");
const hitung = (a: Act[], s: S) => s.map((c, i) => (c > 0 ? `${c} × ${a[i].p}` : "")).filter(Boolean).join(" + ") + ` = ${pts(a, s)}`;
const unit = (a: Act[], i: number, n: number): S => a.map((_, j) => (j === i ? n : 0));

// ── pengecoh ───────────────────────────────────────────────────────────
function kandidat(inst: Inst, key: S): { s: S; tag: Tag }[] {
  const { acts: a, T } = inst;
  const sisa = T - time(a, key);
  const top = a.reduce((b, x, i) => (rate(x) > rate(a[b]) ? i : b), 0);
  const maxP = a.reduce((b, x, i) => (x.p > a[b].p ? i : b), 0);
  const low = a.reduce((b, x, i) => (rate(x) < rate(a[b]) ? i : b), 0);
  const c: { s: S; tag: Tag }[] = [];
  // 1. kunci + satu kegiatan lagi yang tidak muat di sisa waktu → lupa cek batas waktu
  // (satu jenis kegiatan non-terbaik dibulatkan ke atas; bila tidak ada, kunci + satu kegiatan; jangan tetangga RATE/kunci agar tidak membocorkan)
  const lebih = a.map((_, i) => i).filter((i) => i !== top).map((i) => unit(a, i, Math.floor(T / a[i].m) + 1)).sort((x, y) => pts(a, y) - pts(a, x));
  const extra = a.map((x, i) => i).filter((i) => a[i].m > sisa).sort((i, j) => rate(a[j]) - rate(a[i]))[0];
  if (lebih.length) c.push({ s: lebih[0], tag: "LEBIH" });
  else if (extra !== undefined) c.push({ s: key.map((v, i) => (i === extra ? v + 1 : v)), tag: "LEBIH" });
  // 2. kegiatan poin/menit tertinggi sebanyak mungkin tanpa memperhatikan sisa & syarat
  c.push({ s: unit(a, top, Math.floor(T / a[top].m)), tag: "RATE" });
  // 3. kegiatan dengan poin terbesar per kali, sisa waktu diisi seadanya
  const abs = unit(a, maxP, Math.floor(T / a[maxP].m));
  let left = T - time(a, abs);
  for (const i of a.map((_, i) => i).sort((x, y) => rate(a[y]) - rate(a[x]))) { const n = Math.floor(left / a[i].m); abs[i] += n; left -= n * a[i].m; }
  c.push({ s: abs, tag: "ABS" });
  // 4. pas waktu tetapi poin lebih rendah
  const rank = validTop(inst).filter((s) => !same(s, key));
  const pas = rank.find((s) => time(a, s) >= time(a, key));
  if (pas) c.push({ s: pas, tag: "PAS" });
  // 5. kegiatan poin/menit terendah memenuhi waktu
  c.push({ s: unit(a, low, Math.floor(T / a[low].m)), tag: "RENDAH" });
  for (const s of rank) c.push({ s, tag: "RENDAH" });
  for (const s of lebih.slice(1)) c.push({ s, tag: "LEBIH" }); // cadangan bila kombinasi sah terlalu sedikit
  return c;
}

function alasan(inst: Inst, s: S, tag: Tag, key: S): string {
  const { acts: a, T } = inst;
  const M = time(a, s), P = pts(a, s), kp = pts(a, key), beda = kp - P, sisa = T - M;
  const bat = langgar(a, s);
  if (M > T) return `waktunya tidak dicek: strategi ini memerlukan ${M} menit, melebihi batas ${T} menit (lebih ${M - T} menit)${bat.length ? `; selain itu ${bat.join("; ")}` : ""}, jadi tidak sah walau totalnya tampak ${P} poin`;
  if (bat.length) return `syarat diabaikan: ${bat.join("; ")}, jadi strategi ini tidak sah walau totalnya tampak ${P} poin`;
  const top = a.reduce((b, x, i) => (rate(x) > rate(a[b]) ? i : b), 0);
  const maxP = a.reduce((b, x, i) => (x.p > a[b].p ? i : b), 0);
  const lebih = `${beda} poin lebih rendah dari kunci (${kp} poin)`;
  if (tag === "RATE") return `hanya memakai ${a[top].n} (poin per menit tertinggi) sebanyak mungkin; ${sisa} menit dibiarkan menganggur sehingga totalnya ${P} poin, ${lebih}`;
  if (tag === "ABS") return `memilih ${a[maxP].n} yang poin per kalinya paling besar (${a[maxP].p} poin), padahal poin per menitnya hanya ${rasio(a[maxP])}; totalnya ${P} poin, ${lebih}`;
  if (tag === "PAS") return `memakai waktu ${M} dari ${T} menit, tetapi komposisinya berpoin per menit lebih rendah; totalnya ${P} poin, ${lebih}`;
  return `sah dan muat dalam ${M} menit, tetapi komposisinya kurang efisien; totalnya ${P} poin, ${lebih}`;
}

// ── bangun butir ───────────────────────────────────────────────────────
type Out = Record<string, unknown>;
let seed = 20261014;
const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;

function bangun(inst: Inst, lama: Out | undefined): Out {
  const { acts: a, T } = inst;
  const rank = validTop(inst);
  assert.ok(pts(a, rank[0]) > pts(a, rank[1]), `${inst.id}: optimum tidak tunggal`);
  const key = rank[0];
  const pilih: { s: S; tag: Tag }[] = [];
  const tidakSah = () => pilih.filter((p) => !sah(inst, p.s)).length;
  for (const k of kandidat(inst, key)) {
    if (pilih.length === 4) break;
    if (same(k.s, key) || pilih.some((p) => same(p.s, k.s)) || time(a, k.s) === 0) continue;
    if (!sah(inst, k.s) && tidakSah() >= 2) continue; // maksimal 2 pengecoh tidak sah, sisanya sah tetapi kalah (tier 3 tidak boleh gugur hanya lewat syarat)
    pilih.push(k);
  }
  assert.equal(pilih.length, 4, `${inst.id}: kekurangan pengecoh`);
  for (const p of pilih) if (sah(inst, p.s)) assert.ok(pts(a, p.s) < pts(a, key), `${inst.id}: pengecoh sah menyamai kunci`);

  const urut = pilih.map((p) => ({ p, r: rnd() })).sort((x, y) => x.r - y.r).map((x) => x.p);
  const kpos = LETTERS.indexOf(inst.kunci);
  const slot: ({ s: S; tag: Tag } | "KEY")[] = [...urut];
  slot.splice(kpos, 0, "KEY");
  const opsi: Record<string, string> = {}, nilai: Record<string, unknown> = {};
  slot.forEach((x, i) => {
    const s = x === "KEY" ? key : x.s;
    opsi[LETTERS[i]] = teks(a, s);
    nilai[LETTERS[i]] = { menit: time(a, s), poin: pts(a, s), sah: sah(inst, s), ...(x === "KEY" ? {} : { kesalahan: x.tag }) };
  });
  assert.equal(new Set(Object.values(opsi)).size, 5, `${inst.id}: opsi kembar`);

  // stem
  const syarat: string[] = [];
  const wj = a.filter((x) => x.wajib).map((x) => x.n);
  if (wj.length) syarat.push(`${wj.join(" dan ")} wajib dilakukan minimal satu kali.`);
  const daftar = a.map((x) => `• ${x.n}: ${x.m} menit → ${x.p} poin${x.maks ? ` (hanya tersedia ${x.maks} kali)` : ""}`).join("\n");
  const stem = `${inst.konteks}\n\n${daftar}\n\nPoin diperoleh setiap kali satu kegiatan selesai utuh. Kegiatan boleh diulang${a.some((x) => x.maks) ? " kecuali yang diberi batas" : ""}, urutannya bebas, dan total waktu tidak boleh melebihi ${T} menit.${syarat.length ? " " + syarat.join(" ") : ""}\n\nPertanyaan: Strategi manakah yang menghasilkan poin paling banyak?`;

  // pembahasan
  const kM = time(a, key), sisa = T - kM;
  const top = a.reduce((b, x, i) => (rate(x) > rate(a[b]) ? i : b), 0);
  const tersedia = a.filter((x, i) => x.maks === undefined || key[i] < x.maks);
  if (sisa > 0) assert.ok(tersedia.every((x) => x.m > sisa), `${inst.id}: sisa ${sisa} menit masih bisa dipakai → bukan optimum`);
  const l1: string[] = [`1. Hitung poin per menit tiap kegiatan: ${a.map((x) => `${x.n} ${x.p} ÷ ${x.m} = ${rasio(x)}`).join("; ")}.`];
  l1.push(`2. Poin per menit tertinggi: ${a[top].n} (${rasio(a[top])}). Bandingkan dengan poin per kegiatan: kegiatan berpoin terbesar belum tentu paling menguntungkan.`);
  const w0 = a.filter((x) => x.wajib), m0 = w0.reduce((t, x) => t + x.m, 0);
  if (w0.length) l1.push(`3. Syarat wajib dipenuhi dulu: ${w0.map((x) => x.n).join(" dan ")} ${w0.length > 1 ? "masing-masing " : ""}satu kali memakai ${m0} menit, sisa ${T - m0} menit baru diisi kegiatan terbaik.`);
  const bts = a.filter((x) => x.maks !== undefined);
  if (bts.length) l1.push(`${w0.length ? 4 : 3}. Batas pemakaian dihormati: ${bts.map((x) => `${x.n} paling banyak ${x.maks} kali`).join("; ")}.`);
  const nn = l1.length + 1;
  l1.push(`${nn}. Susun waktu ${T} menit: ${teks(a, key)} memakai ${kM} menit${sisa ? `, sisa ${sisa} menit tidak cukup untuk kegiatan mana pun yang masih boleh dipilih (terpendek ${Math.min(...tersedia.map((x) => x.m))} menit)` : " (waktu habis terpakai)"}. Semua kombinasi yang muat dibandingkan dan susunan ini poinnya paling banyak.`);
  l1.push(`${nn + 1}. Hitung poin: ${hitung(a, key)} poin.`);
  const kalah = slot.flatMap((x, i) => (x === "KEY" ? [] : [`Opsi ${LETTERS[i].toUpperCase()} (${opsi[LETTERS[i]]}) gugur karena ${alasan(inst, x.s, x.tag, key)}.`]));
  const tips = ["Tips: hitung poin per menit lebih dulu, bukan poin per kegiatan.", inst.tier === 1 ? "Lalu pastikan jumlah kegiatan tidak melebihi waktu." : "Isi sisa waktu dengan kegiatan lain yang masih muat, karena waktu menganggur berarti poin hilang, tetapi pas waktu belum tentu poin terbanyak.", ...(inst.tier === 3 ? ["Baca syarat (wajib / batas kali) lebih dulu dan gugurkan opsi yang melanggar sebelum membandingkan poin."] : [])].join(" ");
  const pembahasan = `${l1.join("\n")}<br>${kalah.join(" ")} Jawaban: ${teks(a, key)} (${inst.kunci.toUpperCase()}). ${tips}`;

  checkA7(inst.id, { stem, opsi, pembahasan });
  return {
    id: inst.id, kartu: "K07", sub_type: "NUM-CRT-ALOKASI-POIN", tier: inst.tier, sumber: "baru", rilis: lama?.rilis ?? RILIS,
    stem, opsi, kunci: [inst.kunci], nilai_opsi: nilai, pembahasan,
    status_kunci: lama?.status_kunci === "ganda" && lama.stem === stem && JSON.stringify(lama.opsi) === JSON.stringify(opsi) ? "ganda" : status,
  };
}

// ── jalankan ───────────────────────────────────────────────────────────
const all: Out[] = JSON.parse(readFileSync(FILE, "utf8"));
const lamaMap = new Map(all.map((x) => [x.id as string, x]));
const baru = INST.map((i) => bangun(i, lamaMap.get(i.id)));

// sebaran kunci (D-4), tebakan bentuk (D-3), bocor nama kegiatan
const hurufHit = LETTERS.map((l) => INST.filter((i) => i.kunci === l).length);
assert.ok(hurufHit.every((n) => n === INST.length / 5), `sebaran kunci ${hurufHit} (harus rata per huruf)`);
const murni = INST.filter((i) => { const k = validTop(i)[0], top = i.acts.reduce((b, x, j) => (rate(x) > rate(i.acts[b]) ? j : b), 0); return same(k, unit(i.acts, top, Math.floor(i.T / i.acts[top].m))); }).length;
assert.ok(murni >= 0.2 * INST.length && murni <= 0.5 * INST.length, `kunci "satu jenis kegiatan terbaik" ada ${murni} dari ${INST.length} (target 20–50%)`);
const penuh = INST.filter((i) => { const k = validTop(i)[0]; return i.T - time(i.acts, k) === 0; }).length;
assert.ok(penuh >= 0.4 * INST.length && penuh <= 0.75 * INST.length, `kunci memakai seluruh waktu ${penuh} dari ${INST.length} (target 40–75%)`);
const lain = all.filter((x) => !INST.some((i) => i.id === x.id)).map((x) => `${x.stem} ${JSON.stringify(x.opsi)}`.toLowerCase());
for (const i of INST) for (const x of i.acts) assert.ok(!lain.some((t) => t.includes(x.n.toLowerCase())), `${i.id}: nama kegiatan "${x.n}" sudah ada di butir lain`);
const dalam = INST.flatMap((i) => i.acts.map((x) => x.n.toLowerCase()));
assert.equal(new Set(dalam).size, dalam.length, "nama kegiatan kembar antar butir poin");

const sisa = all.filter((x) => !INST.some((i) => i.id === x.id));
const idx = sisa.findIndex((x) => (x.id as string) > "K07-N-010" && (x.id as string).startsWith("K07-N"));
const out = idx >= 0 ? [...sisa.slice(0, idx), ...baru, ...sisa.slice(idx)] : [...sisa, ...baru];
writeFileSync(FILE, JSON.stringify(out, null, 2) + "\n");
console.log(`K07-N-011..040: ${baru.length} butir (status ${status}); kunci murni ${murni}, penuh ${penuh}, huruf ${hurufHit}`);
