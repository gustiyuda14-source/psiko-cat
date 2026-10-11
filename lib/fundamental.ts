/*
  Drilling Fundamental: soal hitung dasar yang dibangkitkan dari rumus tiap sesi (port dari repo
  PENGUATAN-DASAR js/soal-bank.js dan REKENING-KORAN- src/logic.js). Tanpa bank soal, tanpa DB.
  ponytail: kunci ikut terkirim ke browser (soal dibangkitkan di klien); pindah ke server kalau
  hasil mulai dicatat ke akun.
*/

export type FundamentalKind = "isian" | "pecahan" | "deret";
export type FundamentalMeta = {
  kode: string;
  grup: "Penguatan Dasar" | "Rekening Koran";
  label: string;
  desc: string;
  kind: FundamentalKind;
  total: number;
  contoh: string[];
};

export const FUNDAMENTAL: FundamentalMeta[] = [
  { kode: "cermin", grup: "Penguatan Dasar", label: "Pasangan Cermin Perkalian", desc: "Pakai pasangan jumlah 10 (3↔7, 2↔8, 1↔9, 4↔6) untuk menghitung cepat.", kind: "isian", total: 50, contoh: ["3↔7", "2↔8", "1↔9", "4↔6"] },
  { kode: "dekomposisi", grup: "Penguatan Dasar", label: "Dekomposisi Perkalian", desc: "Pecah perkalian besar jadi bagian kecil yang mudah dihitung di kepala.", kind: "isian", total: 50, contoh: ["8×92", "14×37", "63×81"] },
  { kode: "pecahan", grup: "Penguatan Dasar", label: "Sederhanakan Pecahan", desc: "Cari FPB lalu tulis pecahan dalam bentuk paling sederhana.", kind: "pecahan", total: 50, contoh: ["12/18", "21/42", "65/156"] },
  { kode: "rk-tambah", grup: "Rekening Koran", label: "Rekening Koran · Tambah", desc: "Jumlahkan dua angka berdekatan, tulis angka satuannya saja.", kind: "deret", total: 99, contoh: ["7+8 → 5", "4+3 → 7"] },
  { kode: "rk-kali", grup: "Rekening Koran", label: "Rekening Koran · Kali", desc: "Kalikan dua angka berdekatan, tulis angka satuannya saja.", kind: "deret", total: 99, contoh: ["7×8 → 6", "4×3 → 2"] },
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

/** Deret Rekening Koran: total+1 angka 1..9; soal ke-i = pasangan (d[i], d[i+1]). */
export const generateDeret = (total: number) => Array.from({ length: total + 1 }, () => rand(1, 9));
export const deretAnswer = (op: "tambah" | "kali", a: number, b: number) => (op === "tambah" ? a + b : a * b) % 10;

export type Tier = { rank: string; label: string };
/** Tier Rekening Koran (repo asal), dihitung dari waktu (detik) dan akurasi (%) untuk 99 soal. */
export function rkTier(sec: number, acc: number): Tier {
  if (sec <= 80 && acc > 99.5) return { rank: "S+", label: "Nyaris sempurna" };
  if (sec <= 90 && acc >= 90) return { rank: "S", label: "Sangat cepat dan teliti" };
  if (sec <= 100 && acc >= 85) return { rank: "A", label: "Cepat" };
  if (sec <= 130 && acc >= 75) return { rank: "B", label: "Solid" };
  if (sec <= 180 && acc >= 60) return { rank: "C", label: "Perlu dipercepat" };
  return { rank: "D", label: "Mulai dari dasar" };
}
