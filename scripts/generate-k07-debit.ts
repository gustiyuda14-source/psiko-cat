/**
 * K07 debit & volume tabung: butir K07-N-041..070 (sub_type NUM-CRT-DEBIT).
 *   npx tsx scripts/generate-k07-debit.ts                 # status_kunci = tunggal (belum dicek buta)
 *   npx tsx scripts/generate-k07-debit.ts --status ganda  # setelah cek buta sepakat
 * Bentuk dilaporkan pemilik 2026-10-19 (drum tabung → volume liter → waktu isi → sisa belum terisi).
 * Tier 1 = volume tabung dalam liter; tier 2 = waktu sampai penuh; tier 3 = sisa setelah t menit
 * (polos / sudah terisi sebagian / debit per detik) atau waktu penuh dengan kebocoran.
 * Kunci dan semua pengecoh dihitung dari data; tiap pengecoh = satu kesalahan bernama (pedoman D-2).
 * Opsi diurutkan naik (D-4); posisi kunci dibagi rata 6 per huruf lewat pencarian. Butir K07 lain tidak disentuh.
 */
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { checkA7 } from "./kecerdasan-teks-lib";

const ROOT = join(__dirname, "..");
const FILE = join(ROOT, "bank/drill/kecerdasan/K07-soal-cerita.json");
const LETTERS = ["a", "b", "c", "d", "e"];
const RILIS = "2026-10-19"; // tanggal push batch; ganti bila push mundur (badge NEW)
const status = process.argv.includes("--status") ? process.argv[process.argv.indexOf("--status") + 1] : "tunggal";

type Jenis = "V" | "T" | "SISA" | "AWAL" | "BOCOR" | "DETIK";
type Inst = {
  id: string; tier: 1 | 2 | 3; jenis: Jenis; wadah: string; konteks: string;
  r: number; diam?: boolean; t: number; tM?: boolean; // t dalam cm; tM = ditulis dalam meter
  q?: number; menit?: number; awal?: [number, number]; bocor?: number; qDetik?: number;
};
type Kand = { v: number; tag: string; why: string };

// ── format angka Indonesia ─────────────────────────────────────────────
const fmt = (x: number) => {
  const r = Math.round(x * 100) / 100;
  const [i, d] = Math.abs(r).toString().split(".");
  return (r < 0 ? "−" : "") + i.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (d ? "," + d : "");
};
const bersih = (x: number) => x > 0 && Math.abs(x * 100 - Math.round(x * 100)) < 1e-6;
const vol = (r: number, t: number) => (22 / 7) * r * r * t / 1000; // liter

// ── data butir ─────────────────────────────────────────────────────────
const I = (id: string, tier: 1 | 2 | 3, jenis: Jenis, wadah: string, konteks: string, o: Partial<Inst> & { r: number; t: number }): Inst =>
  ({ id, tier, jenis, wadah, konteks, ...o });
const INST: Inst[] = [
  // tier 1: volume dalam liter
  I("K07-N-041", 1, "V", "drum", "Sebuah drum penampung air hujan di samping rumah berbentuk tabung", { r: 35, t: 80 }),
  I("K07-N-042", 1, "V", "tandon", "Sebuah tandon air di atap asrama berbentuk tabung", { r: 28, t: 250 }),
  I("K07-N-043", 1, "V", "bak", "Sebuah bak penampung air di kebun sayur berbentuk tabung", { r: 70, t: 50 }),
  I("K07-N-044", 1, "V", "tangki", "Sebuah tangki air minum di halaman sekolah berbentuk tabung", { r: 42, t: 125 }),
  I("K07-N-045", 1, "V", "tandon", "Sebuah tandon air di belakang puskesmas berbentuk tabung", { r: 56, t: 125 }),
  I("K07-N-046", 1, "V", "drum", "Sebuah drum minyak goreng di gudang warung berbentuk tabung", { r: 35, t: 60 }),
  I("K07-N-047", 1, "V", "gentong", "Sebuah gentong air di teras rumah nenek berbentuk tabung", { r: 14, t: 125 }),
  I("K07-N-048", 1, "V", "tangki", "Sebuah tangki penyiram tanaman di kebun bibit berbentuk tabung", { r: 42, t: 250 }),
  I("K07-N-049", 1, "V", "kolam", "Sebuah kolam ikan bulat di halaman perpustakaan berbentuk tabung", { r: 70, t: 100 }),
  I("K07-N-050", 1, "V", "tong", "Sebuah tong sampah organik untuk membuat kompos berbentuk tabung", { r: 35, t: 120 }),
  // tier 2: waktu sampai penuh
  I("K07-N-051", 2, "T", "drum", "Sebuah drum air di dapur rumah makan berbentuk tabung", { r: 35, diam: true, t: 120, q: 22 }),
  I("K07-N-052", 2, "T", "tandon", "Sebuah tandon air di atap kantor kelurahan berbentuk tabung", { r: 28, t: 125, tM: true, q: 11 }),
  I("K07-N-053", 2, "T", "kolam", "Sebuah kolam ikan bulat di taman kota berbentuk tabung", { r: 70, diam: true, t: 80, q: 22 }),
  I("K07-N-054", 2, "T", "tangki", "Sebuah tangki air di samping aula kampus berbentuk tabung", { r: 42, t: 125, tM: true, q: 33 }),
  I("K07-N-055", 2, "T", "ember", "Sebuah ember besar untuk mencuci karpet berbentuk tabung", { r: 14, diam: true, t: 125, q: 11 }),
  I("K07-N-056", 2, "T", "tandon", "Sebuah tandon air di belakang masjid berbentuk tabung", { r: 70, t: 100, tM: true, q: 22 }),
  I("K07-N-057", 2, "T", "tangki", "Sebuah tangki air di lahan pembibitan berbentuk tabung", { r: 42, diam: true, t: 250, tM: true, q: 66 }),
  I("K07-N-058", 2, "T", "drum", "Sebuah drum penampung air di bengkel cuci motor berbentuk tabung", { r: 35, t: 60, q: 3 }),
  I("K07-N-059", 2, "T", "tandon", "Sebuah tandon air di rumah susun berbentuk tabung", { r: 56, t: 125, tM: true, q: 22 }),
  I("K07-N-060", 2, "T", "tangki", "Sebuah tangki air di sebuah peternakan ayam berbentuk tabung", { r: 28, t: 250, q: 22 }),
  // tier 3: sisa / sudah terisi / bocor / debit per detik
  I("K07-N-061", 3, "SISA", "drum", "Sebuah drum air di kamar mandi umum pasar berbentuk tabung", { r: 70, t: 60, q: 12, menit: 15 }),
  I("K07-N-062", 3, "SISA", "kolam", "Sebuah kolam renang anak berbentuk tabung", { r: 70, diam: true, t: 75, q: 25, menit: 10 }),
  I("K07-N-063", 3, "SISA", "tangki", "Sebuah tangki air di stasiun kereta berbentuk tabung", { r: 42, t: 125, q: 15, menit: 8 }),
  I("K07-N-064", 3, "SISA", "tandon", "Sebuah tandon air di pondok pesantren berbentuk tabung", { r: 28, t: 375, tM: true, q: 16, menit: 12 }),
  I("K07-N-065", 3, "AWAL", "tandon", "Sebuah tandon air di gedung serbaguna berbentuk tabung", { r: 35, t: 180, awal: [1, 3], q: 14, menit: 10 }),
  I("K07-N-066", 3, "AWAL", "drum", "Sebuah drum air di dapur katering berbentuk tabung", { r: 35, diam: true, t: 120, awal: [1, 3], q: 8, menit: 10 }),
  I("K07-N-067", 3, "BOCOR", "tandon", "Sebuah tandon air di rumah kos berbentuk tabung", { r: 56, t: 125, q: 30, bocor: 2 }),
  I("K07-N-068", 3, "BOCOR", "tangki", "Sebuah tangki air di tempat cuci mobil berbentuk tabung", { r: 42, diam: true, t: 250, tM: true, q: 25, bocor: 4 }),
  I("K07-N-069", 3, "DETIK", "bak", "Sebuah bak air di kebun hidroponik berbentuk tabung", { r: 42, t: 250, tM: true, qDetik: 0.25, menit: 20 }),
  I("K07-N-070", 3, "DETIK", "gentong", "Sebuah gentong air di bengkel las berbentuk tabung", { r: 14, t: 375, qDetik: 0.1, menit: 10 }),
];

// ── kunci + pengecoh bernama ───────────────────────────────────────────
function hitung(i: Inst) {
  const V = vol(i.r, i.t);
  // varian volume salah (dibawa ke langkah berikutnya)
  const salahV: { v: number; tag: string; why: string }[] = [
    { v: V * 10, tag: "KONV100", why: "memakai 1 liter = 100 cm³, sehingga volumenya 10 kali terlalu besar" },
    { v: V / 10, tag: "KONV10000", why: "memakai 1 liter = 10.000 cm³, sehingga volumenya 10 kali terlalu kecil" },
    { v: V / 3, tag: "KERUCUT", why: "memakai rumus kerucut (⅓ × luas alas × tinggi), padahal wadahnya tabung" },
    { v: (2 * V) / i.r, tag: "SELIMUT", why: "memakai keliling alas × tinggi (luas selimut), bukan luas alas × tinggi" },
    { v: V / i.r, tag: "KUADRAT", why: "jari-jari tidak dikuadratkan (π × r × t)" },
  ];
  if (i.diam) salahV.unshift({ v: V * 4, tag: "DIAMETER", why: "memakai diameter sebagai jari-jari, sehingga volumenya 4 kali terlalu besar" });
  else salahV.push({ v: V * 4, tag: "DUAKALI", why: "jari-jari dikali dua sebelum dikuadratkan, sehingga volumenya 4 kali terlalu besar" });
  if (i.tM) salahV.push({ v: V / 100, tag: "METER", why: "tinggi dalam meter langsung dipakai tanpa diubah ke cm" });
  salahV.push({ v: vol(i.t, i.r), tag: "TERTUKAR", why: "jari-jari dan tinggi tertukar (yang dikuadratkan justru tingginya)" });

  const q = i.qDetik !== undefined ? i.qDetik * 60 : i.q!;
  let key = 0, satuan = "liter";
  const k: Kand[] = [];
  const awalL = i.awal ? (V * i.awal[0]) / i.awal[1] : 0;
  switch (i.jenis) {
    case "V":
      key = V;
      k.push(...salahV.filter((s) => s.tag !== "METER"));
      k.push({ v: V * 1000, tag: "LUPAKONV", why: "hasil dalam cm³ tidak diubah ke liter" });
      break;
    case "T":
      key = V / q; satuan = "menit";
      for (const s of salahV) k.push({ v: s.v / q, tag: s.tag, why: s.why });
      k.push({ v: V * q, tag: "KALI", why: "volume dikali debit, padahal waktu = volume ÷ debit" });
      break;
    case "SISA": case "DETIK": {
      const masuk = q * i.menit!;
      key = V - masuk;
      k.push({ v: masuk, tag: "TERISI", why: `yang dihitung air yang sudah masuk (${fmt(q)} × ${i.menit} = ${fmt(masuk)} liter), bukan sisa yang belum terisi` });
      k.push({ v: (V - masuk) / q, tag: "SISAWAKTU", why: `yang dihitung sisa waktu (${fmt(V - masuk)} ÷ ${fmt(q)} menit), padahal yang ditanya sisa air dalam liter` });
      k.push({ v: V + masuk, tag: "TAMBAH", why: "air yang masuk malah ditambahkan ke volume, padahal sisa = penuh − masuk" });
      k.push({ v: V - q, tag: "LUPAKALI", why: `debit tidak dikali lama pengisian; yang dikurangkan hanya ${fmt(q)} liter` });
      for (const s of salahV) k.push({ v: s.v - masuk, tag: s.tag, why: s.why });
      if (i.jenis === "DETIK") {
        k.push({ v: V - i.qDetik! * i.menit!, tag: "DETIKMENIT", why: `debit ${fmt(i.qDetik!)} liter per detik dipakai sebagai liter per menit (lupa dikali 60)` });
        k.push({ v: V - (i.qDetik! * i.menit!) / 60, tag: "BAGI60", why: "debit per detik dibagi 60, padahal untuk menjadi per menit harus dikali 60" });
      }
      break;
    }
    case "AWAL": {
      const masuk = q * i.menit!;
      key = V - awalL - masuk;
      const [a, b] = i.awal!;
      k.push({ v: V - masuk, tag: "LUPAAWAL", why: `isi awal ${a}/${b} bagian (${fmt(awalL)} liter) tidak dikurangkan` });
      k.push({ v: awalL + masuk, tag: "TERISI", why: `yang dihitung isi ${i.wadah} sekarang (isi awal + air masuk), bukan sisa yang belum terisi` });
      k.push({ v: V - (V * (b - a)) / b - masuk, tag: "AWALBALIK", why: `${a}/${b} dianggap bagian yang kosong, padahal itu bagian yang sudah berisi` });
      k.push({ v: V - awalL - q, tag: "LUPAKALI", why: `debit tidak dikali lama pengisian; yang dikurangkan hanya ${fmt(q)} liter` });
      k.push({ v: (V - awalL - masuk) / q, tag: "SISAWAKTU", why: "yang dihitung sisa waktu dalam menit, padahal yang ditanya sisa air dalam liter" });
      for (const s of salahV) k.push({ v: s.v - s.v * a / b - masuk, tag: s.tag, why: s.why });
      break;
    }
    case "BOCOR": {
      const b = i.bocor!;
      key = V / (q - b); satuan = "menit";
      k.push({ v: V / q, tag: "ABAIBOCOR", why: "kebocoran diabaikan, padahal air yang benar-benar bertambah hanya debit masuk dikurangi bocor" });
      k.push({ v: V / (q + b), tag: "BOCORTAMBAH", why: "kebocoran dijumlahkan ke debit masuk, padahal bocor mengurangi air" });
      k.push({ v: V / b, tag: "BOCORSAJA", why: "volume dibagi debit bocor saja, padahal yang mengisi adalah selisih masuk dan bocor" });
      for (const s of salahV) k.push({ v: s.v / (q - b), tag: s.tag, why: s.why });
      break;
    }
  }
  return { V, q, key, satuan, awalL, kand: k };
}

// ── posisi kunci: tiap butir punya himpunan posisi yang mungkin, dibagi rata 6 per huruf ─
type Prep = { i: Inst; h: ReturnType<typeof hitung>; kecil: Kand[]; besar: Kand[] };
const PREP: Prep[] = INST.map((i) => {
  const h = hitung(i);
  assert.ok(bersih(h.key) && Number.isInteger(Math.round(h.key * 10)), `${i.id}: kunci ${h.key} tidak bersih`);
  const seen = new Set<number>([Math.round(h.key * 100)]);
  const ok = h.kand.filter((c) => {
    const r = Math.round(c.v * 100);
    // pengecoh yang 40 kali lebih kecil/besar dari kunci tidak masuk akal sebagai jawaban, jadi tidak dipakai
    if (!bersih(c.v) || seen.has(r) || c.v < h.key / 40 || c.v > h.key * 40) return false;
    seen.add(r); return true;
  });
  return { i, h, kecil: ok.filter((c) => c.v < h.key), besar: ok.filter((c) => c.v > h.key) };
});
const mungkin = (p: Prep) => [0, 1, 2, 3, 4].filter((pos) => p.kecil.length >= pos && p.besar.length >= 4 - pos);
const target = 7 /* ≤ 24% per huruf (pedoman D-4) */, hitungan = [0, 0, 0, 0, 0], posisi: number[] = [];
// tiap tier paling banyak 4 per huruf, supaya huruf tidak menumpuk di satu jenis soal
const perTier = [1, 2, 3].map(() => [0, 0, 0, 0, 0]);
// butir dengan pilihan posisi paling sedikit dikerjakan dulu, supaya pencarian cepat selesai
const urutCari = PREP.map((_, n) => n).sort((a, b) => mungkin(PREP[a]).length - mungkin(PREP[b]).length || a - b);
const cari = (m: number): boolean => {
  if (m === PREP.length) return true;
  const n = urutCari[m], p = PREP[n], tr = perTier[p.i.tier - 1];
  const urut = mungkin(p).sort((a, b) => hitungan[a] - hitungan[b] || ((n * 7 + a * 3) % 5) - ((n * 7 + b * 3) % 5));
  for (const pos of urut) {
    if (hitungan[pos] >= target || tr[pos] >= 4) continue;
    hitungan[pos]++; tr[pos]++; posisi[n] = pos;
    if (cari(m + 1)) return true;
    hitungan[pos]--; tr[pos]--;
  }
  return false;
};
if (process.env.DEBUG) { for (const p of PREP) console.log(p.i.id, mungkin(p).join(''), 'kecil', p.kecil.map((c) => `${c.tag}=${fmt(c.v)}`).join(' '), '| besar', p.besar.map((c) => `${c.tag}=${fmt(c.v)}`).join(' ')); process.exit(0); }
assert.ok(cari(0), `posisi kunci tidak bisa dibagi rata: ${PREP.map((p) => `${p.i.id}:${mungkin(p)}`).join(" ")}`);

// ── teks ────────────────────────────────────────────────────────────────
const ukur = (i: Inst) => `${i.diam ? `diameter alas ${fmt(i.r * 2)} cm` : `jari-jari alas ${fmt(i.r)} cm`} dan tinggi ${i.tM ? `${fmt(i.t / 100)} m` : `${fmt(i.t)} cm`}`;
function stemOf(i: Inst, q: number) {
  const dasar = `${i.konteks} dengan ${ukur(i)}. (π = 22/7)`;
  const debit = i.qDetik !== undefined ? `${fmt(i.qDetik)} liter per detik` : `${fmt(i.q!)} liter per menit`;
  switch (i.jenis) {
    case "V": return `${dasar}\n\nBerapa liter isi ${i.wadah} itu jika terisi penuh?`;
    case "T": return `${dasar} ${cap(i.wadah)} itu kosong, lalu diisi air dari keran dengan debit ${debit}.\n\nBerapa menit waktu yang diperlukan sampai ${i.wadah} penuh?`;
    case "SISA": case "DETIK": return `${dasar} ${cap(i.wadah)} itu kosong, lalu diisi air dari keran dengan debit ${debit}.\n\nSetelah diisi ${i.menit} menit, berapa liter lagi yang diperlukan sampai ${i.wadah} penuh?`;
    case "AWAL": return `${dasar} ${cap(i.wadah)} itu sudah berisi air ${i.awal![0]}/${i.awal![1]} bagian, lalu ditambah air dari keran dengan debit ${debit}.\n\nSetelah ditambah ${i.menit} menit, berapa liter lagi yang diperlukan sampai ${i.wadah} penuh?`;
    case "BOCOR": return `${dasar} ${cap(i.wadah)} itu kosong, lalu diisi air dari keran dengan debit ${debit}. Ternyata dasarnya bocor sehingga air keluar ${fmt(i.bocor!)} liter per menit.\n\nBerapa menit waktu yang diperlukan sampai ${i.wadah} penuh?`;
  }
  void q;
}
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

function langkah(i: Inst, h: ReturnType<typeof hitung>) {
  const L: string[] = [];
  if (i.diam) L.push(`Jari-jari = ${fmt(i.r * 2)} : 2 = ${fmt(i.r)} cm.`);
  if (i.tM) L.push(`Tinggi ${fmt(i.t / 100)} m = ${fmt(i.t)} cm.`);
  const cm3 = Math.round(h.V * 1000);
  L.push(`Volume = 22/7 × ${fmt(i.r)} × ${fmt(i.r)} × ${fmt(i.t)} = ${fmt(cm3)} cm³ = ${fmt(h.V)} liter (1 liter = 1.000 cm³).`);
  if (i.qDetik !== undefined) L.push(`Debit ${fmt(i.qDetik)} liter per detik = ${fmt(i.qDetik)} × 60 = ${fmt(h.q)} liter per menit.`);
  switch (i.jenis) {
    case "T": L.push(`Waktu = volume ÷ debit = ${fmt(h.V)} ÷ ${fmt(h.q)} = ${fmt(h.key)} menit.`); break;
    case "SISA": case "DETIK": {
      const m = h.q * i.menit!;
      L.push(`Air yang masuk dalam ${i.menit} menit = ${fmt(h.q)} × ${i.menit} = ${fmt(m)} liter.`);
      L.push(`Sisa yang belum terisi = ${fmt(h.V)} − ${fmt(m)} = ${fmt(h.key)} liter.`); break;
    }
    case "AWAL": {
      const m = h.q * i.menit!;
      L.push(`Isi awal = ${i.awal![0]}/${i.awal![1]} × ${fmt(h.V)} = ${fmt(h.awalL)} liter.`);
      L.push(`Air yang masuk dalam ${i.menit} menit = ${fmt(h.q)} × ${i.menit} = ${fmt(m)} liter.`);
      L.push(`Sisa yang belum terisi = ${fmt(h.V)} − ${fmt(h.awalL)} − ${fmt(m)} = ${fmt(h.key)} liter.`); break;
    }
    case "BOCOR":
      L.push(`Air yang benar-benar bertambah = ${fmt(h.q)} − ${fmt(i.bocor!)} = ${fmt(h.q - i.bocor!)} liter per menit.`);
      L.push(`Waktu = ${fmt(h.V)} ÷ ${fmt(h.q - i.bocor!)} = ${fmt(h.key)} menit.`); break;
  }
  return L.map((s, n) => `${n + 1}. ${s}`).join("\n");
}
const TIPS: Record<Jenis, string> = {
  V: "Tips: jari-jari kelipatan 7 cocok dengan π = 22/7, jadi coret 7-nya dulu; terakhir bagi 1.000 untuk mengubah cm³ ke liter.",
  T: "Tips: ubah dulu semua ukuran ke cm (diameter dibagi 2, meter dikali 100), hitung liter, baru bagi dengan debit.",
  SISA: "Tips: kerjakan berantai: volume penuh → air yang sudah masuk (debit × waktu) → sisa = penuh − masuk. Cek opsi mana yang sebenarnya jawaban langkah tengah.",
  DETIK: "Tips: samakan satuan waktu lebih dulu: liter per detik dikali 60 menjadi liter per menit, baru dikali lama pengisian.",
  AWAL: "Tips: sisa = penuh − isi awal − air yang masuk. Pecahan isi awal adalah bagian yang sudah berisi, bukan yang kosong.",
  BOCOR: "Tips: hitung debit bersih dulu (masuk − bocor), baru bagi volume dengan debit bersih itu.",
};

function bangun(p: Prep, pos: number, lama?: Record<string, unknown>) {
  const { i, h } = p;
  // ambil pengecoh terdekat ke kunci di tiap sisi supaya tidak mudah ditebak dari jarak
  const kecil = [...p.kecil].sort((a, b) => b.v - a.v).slice(0, pos);
  const besar = [...p.besar].sort((a, b) => a.v - b.v).slice(0, 4 - pos);
  const urut = [...kecil, { v: h.key, tag: "KEY", why: "" }, ...besar].sort((a, b) => a.v - b.v);
  assert.equal(urut.findIndex((x) => x.tag === "KEY"), pos);
  const opsi: Record<string, string> = {}, nilai: Record<string, number> = {};
  urut.forEach((x, n) => { opsi[LETTERS[n]] = `${fmt(x.v)} ${h.satuan}`; nilai[LETTERS[n]] = Math.round(x.v * 100) / 100; });
  assert.equal(new Set(Object.values(opsi)).size, 5, `${i.id}: opsi kembar`);
  const kunci = LETTERS[pos];
  const stem = stemOf(i, h.q)!;
  const gugur = urut.flatMap((x, n) => (x.tag === "KEY" ? [] : [`Opsi ${LETTERS[n].toUpperCase()} (${opsi[LETTERS[n]]}) gugur karena ${x.why}.`]));
  const pembahasan = `${langkah(i, h)}<br>${gugur.join(" ")} Jawaban: ${opsi[kunci]} (${kunci.toUpperCase()}). ${TIPS[i.jenis]}`;
  checkA7(i.id, { stem, opsi, pembahasan });
  return {
    id: i.id, kartu: "K07", sub_type: "NUM-CRT-DEBIT", tier: i.tier, sumber: "baru", rilis: (lama?.rilis as string) ?? RILIS,
    stem, opsi, kunci: [kunci], hitung: String(Math.round(h.key * 100) / 100), nilai_opsi: nilai, pembahasan,
    status_kunci: lama?.status_kunci === "ganda" && lama.stem === stem && JSON.stringify(lama.opsi) === JSON.stringify(opsi) ? "ganda" : status,
  };
}

// ── jalankan ───────────────────────────────────────────────────────────
const all: Record<string, unknown>[] = JSON.parse(readFileSync(FILE, "utf8"));
const ids = new Set(INST.map((i) => i.id));
const lamaMap = new Map(all.map((x) => [x.id as string, x]));
const baru = PREP.map((p, n) => bangun(p, posisi[n], lamaMap.get(p.i.id)));
const sisa = all.filter((x) => !ids.has(x.id as string));
const idx = sisa.findIndex((x) => x.id === "K07-N-040");
assert.ok(idx >= 0, "K07-N-040 tidak ditemukan");
const out = [...sisa.slice(0, idx + 1), ...baru, ...sisa.slice(idx + 1)];
const stems = out.map((x) => x.stem);
assert.equal(new Set(stems).size, stems.length, "stem kembar di K07");
writeFileSync(FILE, JSON.stringify(out, null, 2) + "\n");
console.log(`K07-N-041..070: ${baru.length} butir (status ${status}); huruf ${hitungan}; tier×huruf ${JSON.stringify(perTier)}`);
