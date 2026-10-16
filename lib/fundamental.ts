/*
  Drilling Fundamental: soal hitung dasar yang dibangkitkan dari rumus tiap sesi (port dari repo
  PENGUATAN-DASAR js/soal-bank.js dan REKENING-KORAN- src/logic.js). Tanpa bank soal, tanpa DB.
  ponytail: kunci ikut terkirim ke browser (soal dibangkitkan di klien); pindah ke server kalau
  hasil mulai dicatat ke akun.
*/

export type FundamentalKind = "isian" | "pecahan" | "deret" | "pauli";
export type FundamentalMeta = {
  kode: string;
  grup: "Penguatan Dasar" | "Rekening Koran";
  label: string;
  kicker: string;
  desc: string;
  kind: FundamentalKind;
  total: number;
  /** Isi paket di kartu katalog. */
  points: string[];
  contoh: string[];
  /** Tingkat 1-3 untuk penanda di kartu. */
  level: number;
};

const ISIAN_POINTS = ["50 soal isian angka", "Pembahasan tiap jawaban", "Numpad dan keyboard"];

export const FUNDAMENTAL: FundamentalMeta[] = [
  { kode: "cermin", grup: "Penguatan Dasar", label: "Pasangan Cermin Perkalian", kicker: "Perkalian cepat", desc: "Pakai pasangan jumlah 10 (3↔7, 2↔8, 1↔9, 4↔6) untuk menghitung cepat.", kind: "isian", total: 50, points: ISIAN_POINTS, contoh: ["3↔7", "2↔8", "1↔9", "4↔6"], level: 1 },
  { kode: "dekomposisi", grup: "Penguatan Dasar", label: "Dekomposisi Perkalian", kicker: "Hitung mental", desc: "Pecah perkalian besar jadi bagian kecil yang mudah dihitung di kepala.", kind: "isian", total: 50, points: ISIAN_POINTS, contoh: ["8×92", "14×37", "63×81"], level: 2 },
  { kode: "pecahan", grup: "Penguatan Dasar", label: "Sederhanakan Pecahan", kicker: "FPB dan pecahan", desc: "Cari FPB lalu tulis pecahan dalam bentuk paling sederhana.", kind: "pecahan", total: 50, points: ["50 soal pembilang/penyebut", "Pembahasan tiap jawaban", "Numpad dan keyboard"], contoh: ["12/18", "21/42", "65/156"], level: 2 },
  { kode: "koran", grup: "Rekening Koran", label: "Rekening Koran", kicker: "Tes Kraepelin", desc: "Grid 20 kolom × 30 angka, dikerjakan per kolom dari atas ke bawah. Tulis angka satuan hasil dua angka berdekatan.", kind: "deret", total: 580, points: ["Pilih Tambah atau Kali", "Mode Tes: 20 detik per kolom", "Mode Latihan: tanpa batas waktu"], contoh: ["7+8 → 5", "7×8 → 6"], level: 3 },
  { kode: "pauli", grup: "Rekening Koran", label: "Tes Pauli", kicker: "Tes Pauli", desc: "Jumlahkan dua angka berdekatan dari atas ke bawah tanpa henti selama 60 menit. Tiap 3 menit ada tanda garis.", kind: "pauli", total: 0, points: ["20 periode × 3 menit", "Pilih: pindah kolom atau lanjut (Arnold)", "Kurva kerja per periode"], contoh: ["7+8 → 5", "garis tiap 3 mnt"], level: 3 },
];

export const fundamentalMeta = (kode: string) => FUNDAMENTAL.find((m) => m.kode === kode);

/** Soal isian: `ans` satu angka, atau dua angka [pembilang, penyebut] untuk pecahan. */
export type IsianItem = { stem: string; ans: string[]; bahas: string };

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

function cermin(total: number): IsianItem[] {
  return Array.from({ length: total }, () => {
    // base 1..9 tanpa 5: semua pasangan cermin muncul dua arah (repo asal hanya 3..9).
    const base = [1, 2, 3, 4, 6, 7, 8, 9][rand(0, 7)];
    const n = rand(11, 49);
    const mirror = 10 - base;
    return {
      stem: `Jika ${base} × n = ${base * n},\nmaka ${mirror} × n = ?`,
      ans: [String(mirror * n)],
      bahas: `n = ${base * n} ÷ ${base} = ${n}. Maka ${mirror} × ${n} = ${mirror * n}.\nCepatnya: ${base} × n + ${mirror} × n = 10 × n = ${10 * n}, jadi ${10 * n} − ${base * n} = ${mirror * n}.`,
    };
  });
}

function dekomposisi(total: number): IsianItem[] {
  return Array.from({ length: total }, (_, i) => {
    const [a, b] = i < total * 0.2 ? [rand(7, 9), rand(80, 99)] : i < total * 0.5 ? [rand(11, 19), rand(21, 49)] : [rand(37, 99), rand(41, 99)];
    const ans = a * b;
    const up = Math.ceil(b / 10) * 10;
    const diff = up - b;
    const bahas =
      diff > 0 && diff <= 3
        ? `${a} × (${up} − ${diff}) = ${a * up} − ${a * diff} = ${ans}`
        : `${a} × (${b - (b % 10)} + ${b % 10}) = ${a * (b - (b % 10))} + ${a * (b % 10)} = ${ans}`;
    return { stem: `${a} × ${b} = ?`, ans: [String(ans)], bahas: `Dekomposisi: ${bahas}` };
  });
}

function pecahan(total: number): IsianItem[] {
  return Array.from({ length: total }, (_, i) => {
    const mult = i < total / 2 ? rand(5, 15) : rand(16, 30);
    let p: number, q: number;
    do {
      p = rand(1, 9);
      q = rand(p + 1, 12);
    } while (gcd(p, q) !== 1);
    return {
      stem: `Sederhanakan:\n${p * mult} / ${q * mult}`,
      ans: [String(p), String(q)],
      bahas: `FPB = ${mult}. Penyebut: ${q * mult} ÷ ${mult} = ${q}. Pembilang: ${p * mult} ÷ ${mult} = ${p}.`,
    };
  });
}

const ISIAN: Record<string, (n: number) => IsianItem[]> = { cermin, dekomposisi, pecahan };

export function generateIsian(kode: string): IsianItem[] {
  const meta = fundamentalMeta(kode);
  return meta && ISIAN[kode] ? ISIAN[kode](meta.total) : [];
}

/** Ukuran grid Kraepelin. ponytail: angka awal tanpa sumber resmi; ganti di sini begitu ukuran tes Sekolah Rakyat diketahui. */
export const KORAN = { kolom: 20, baris: 30, detik: 20 };

/** Grid Rekening Koran/Kraepelin: kolom × baris angka 1..9; soal = pasangan angka berurutan dalam satu kolom. */
export const generateKoran = () => Array.from({ length: KORAN.kolom }, () => Array.from({ length: KORAN.baris }, () => rand(1, 9)));
export const deretAnswer = (op: "tambah" | "kali", a: number, b: number) => (op === "tambah" ? a + b : a * b) % 10;

/** Ukuran Kraepelin dari satu nilai per kolom (jumlah jawaban di Mode Tes, detik di Mode Latihan). Nilai mentah, tanpa norma. */
export function kraepelinStats(perKolom: number[]) {
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
  const half = Math.floor(perKolom.length / 2);
  return {
    rata: avg(perKolom),
    keajegan: perKolom.length ? Math.max(...perKolom) - Math.min(...perKolom) : 0,
    // Paruh akhir dikurangi paruh awal: Mode Tes positif = makin cepat, Mode Latihan positif = makin lambat.
    ketahanan: avg(perKolom.slice(perKolom.length - half)) - avg(perKolom.slice(0, half)),
  };
}

/** Tes Pauli (Arnold 1975, Merkblatt hlm. 171): 20 periode × 3 menit, hanya penjumlahan. Grid cukup untuk >3.916 soal (skor tertinggi studi Polandia). */
export const PAULI = { periode: 20, detik: 180, kolom: 40, baris: 200 };
/** Mode Latihan Pauli: durasi pendek untuk pemanasan, garis dan kurva tetap ada. */
export const PAULI_LATIHAN = { periode: 5, detik: 60 };
export const generatePauli = () => Array.from({ length: PAULI.kolom }, () => Array.from({ length: PAULI.baris }, () => rand(1, 9)));

/** Ukuran Pauli dari jumlah benar per periode 3 menit. Nilai mentah, tanpa norma. */
export function pauliStats(per: number[]) {
  const total = per.reduce((a, b) => a + b, 0);
  const mean = per.length ? total / per.length : 0;
  const pct = (x: number) => (mean ? (x / mean) * 100 : 0);
  // Schwankung = rata-rata |selisih periode berurutan| ("Fluctuation M.A.C"); cocok dengan contoh Arnold Abb. 4: ±5,2 (2,9%).
  const diffs = per.slice(1).map((v, i) => Math.abs(v - per[i]));
  const schwankung = diffs.length ? diffs.reduce((a, b) => a + b, 0) / diffs.length : 0;
  const hi = per.indexOf(Math.max(...per));
  const lo = per.indexOf(Math.min(...per));
  return {
    total,
    schwankung,
    schwankungPct: pct(schwankung),
    // Gipfellage = periode puncak (Abb. 4: puncak 195 di periode 13). Steighöhe: rekonstruksi dari indeks Arnold
    // ("negative Form = Tief- dan Hochpunkt tertukar"), bab rumus aslinya tidak ada di PDF.
    gipfel: hi + 1,
    steighohe: per.length ? pct(per[hi] - per[lo]) * (hi >= lo ? 1 : -1) : 0,
  };
}
