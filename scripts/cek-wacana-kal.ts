import assert from "node:assert/strict";
import { data } from "./kecerdasan-teks-lib";

// Brute force wacana logika Latihan Paket 2 (package_number 3) dan Simulasi Paket 3 (package_number 15), soal 65-75 (pedoman §4.5):
// semua susunan yang memenuhi syarat dihitung, lalu kunci tiap soal diturunkan ulang dan
// dicocokkan dengan field k di prisma/data/kecerdasan_p3_teks.json. Opsi sah harus tepat satu.
//   npx tsx scripts/cek-wacana-kal.ts

function perms<T>(a: T[]): T[][] {
  if (a.length <= 1) return [a];
  return a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p]));
}
type Q<S> = { s: number; kind: "pasti" | "kecuali"; cond?: (x: S) => boolean; opts: ((x: S) => boolean)[] };
type KeyFile = { soal: { s: number; k: string }[] };
const teks = data("kecerdasan_p3_teks.json") as KeyFile;
function check<S>(name: string, sols: S[], qs: Q<S>[], file: KeyFile = teks) {
  console.log(`${name}: ${sols.length} susunan sah`);
  for (const q of qs) {
    const pool = sols.filter(q.cond ?? (() => true));
    assert.ok(pool.length > 0, `soal ${q.s}: syarat tambahan tidak punya susunan`);
    const ok = q.opts.map((f) => (q.kind === "pasti" ? pool.every(f) : !pool.some(f)));
    assert.equal(ok.filter(Boolean).length, 1, `soal ${q.s}: opsi sah ${ok.filter(Boolean).length}, harus tepat 1`);
    if (q.kind === "kecuali") q.opts.forEach((f, i) => assert.ok(ok[i] || pool.some(f), `soal ${q.s}: opsi ${"ABCDE"[i]} juga tidak mungkin`));
    const key = "ABCDE"[ok.indexOf(true)];
    assert.equal(key, file.soal.find((x) => x.s === q.s)!.k, `soal ${q.s}: kunci file ≠ brute force ${key}`);
  }
}

// ── KURSI (65-68): kursi 1-6 searah jarum jam, kanan = nomor berikutnya, berhadapan = selisih 3 ──
{
  type S = Record<string, number>;
  const names = ["Ardi", "Bima", "Citra", "Dani", "Elsa", "Fajar"];
  const adj = (s: S, a: string, b: string) => [1, 5].includes((s[a] - s[b] + 6) % 6);
  const sols = perms([1, 2, 3, 4, 5, 6]).map((p) => Object.fromEntries(names.map((n, i) => [n, p[i]])) as S).filter((s) =>
    s.Ardi === 1 && (s.Dani - s.Ardi + 6) % 6 === 3 && !adj(s, "Bima", "Ardi") && (s.Citra - s.Elsa + 6) % 6 === 1
    && (!adj(s, "Elsa", "Dani") || adj(s, "Fajar", "Bima")));
  const order = (s: S) => names.slice().sort((a, b) => s[a] - s[b]).join(", ");
  check("KURSI", sols, [
    { s: 65, kind: "pasti", opts: [(s) => adj(s, "Citra", "Dani"), (s) => (s.Elsa - s.Fajar + 6) % 6 === 3, (s) => adj(s, "Fajar", "Ardi"), (s) => s.Citra === 6, (s) => (s.Bima - s.Fajar + 6) % 6 === 1] },
    { s: 66, kind: "kecuali", opts: [(s) => s.Elsa === 2, (s) => s.Bima === 3, (s) => adj(s, "Citra", "Fajar"), (s) => adj(s, "Citra", "Dani"), (s) => adj(s, "Elsa", "Dani")] },
    { s: 67, kind: "pasti", cond: (s) => s.Bima === 5, opts: ["Bima", "Citra", "Dani", "Elsa", "Fajar"].map((n) => (s: S) => s[n] === 2) },
    { s: 68, kind: "pasti", cond: (s) => adj(s, "Elsa", "Dani"), opts: ["Ardi, Elsa, Citra, Dani, Bima, Fajar", "Ardi, Fajar, Bima, Dani, Elsa, Citra", "Ardi, Bima, Fajar, Dani, Elsa, Citra", "Ardi, Fajar, Elsa, Dani, Citra, Bima", "Ardi, Citra, Elsa, Dani, Bima, Fajar"].map((o) => (s: S) => order(s) === o) },
  ]);
}

// ── LATIHAN (69-72): 6 sesi berurutan Senin pagi … Rabu siang ──
{
  type S = Record<string, number>; // indeks sesi 0-5
  const names = ["Hukum", "Komunikasi", "Navigasi", "P3K", "Senam", "Taktik"];
  const day = (s: S, m: string) => Math.floor(s[m] / 2), pagi = (s: S, m: string) => s[m] % 2 === 0;
  const sols = perms([0, 1, 2, 3, 4, 5]).map((p) => Object.fromEntries(names.map((n, i) => [n, p[i]])) as S).filter((s) =>
    pagi(s, "Senam") && day(s, "Navigasi") === day(s, "Taktik") && s.Navigasi < s.Taktik && s.P3K < s.Hukum
    && day(s, "Komunikasi") !== 0 && day(s, "Komunikasi") !== day(s, "Hukum") && (day(s, "Hukum") !== 2 || pagi(s, "Komunikasi")));
  const at = (s: S, i: number) => names.find((n) => s[n] === i);
  check("LATIHAN", sols, [
    { s: 69, kind: "pasti", opts: [(s) => day(s, "Komunikasi") === 2, (s) => day(s, "Senam") === 2, (s) => day(s, "P3K") === 0, (s) => pagi(s, "Navigasi"), (s) => day(s, "Taktik") === 0] },
    { s: 70, kind: "kecuali", opts: [(s) => day(s, "Hukum") === 1, (s) => s.Komunikasi === 3, (s) => day(s, "Senam") === 0, (s) => s.P3K === 3, (s) => s.Taktik === 5] },
    { s: 71, kind: "pasti", cond: (s) => day(s, "Hukum") === 2, opts: ["Komunikasi", "Navigasi", "P3K", "Senam", "Taktik"].map((m) => (s: S) => at(s, 3) === m) },
    { s: 72, kind: "pasti", cond: (s) => day(s, "Senam") === 1, opts: [(s) => s.Komunikasi === 4, (s) => s.Hukum === 3, (s) => s.P3K === 1, (s) => s.Navigasi === 2, (s) => s.Taktik === 5] },
  ]);
}

// ── UNIT (73-75): peringkat 1-4 (1 = tertinggi) × unit ──
{
  type S = { r: Record<string, number>; u: Record<string, string> };
  const names = ["Kirana", "Lukas", "Mega", "Nanda"], units = ["Siber", "Narkoba", "Lantas", "Tipikor"];
  const sols: S[] = [];
  for (const rp of perms([1, 2, 3, 4])) for (const up of perms(units)) {
    const r = Object.fromEntries(names.map((n, i) => [n, rp[i]])), u = Object.fromEntries(names.map((n, i) => [n, up[i]]));
    const who = (unit: string) => names.find((n) => u[n] === unit)!, best = names.find((n) => r[n] === 1)!;
    if (u[best] === "Siber" && r.Mega < r.Lukas && r.Nanda !== 4 && !["Siber", "Narkoba"].includes(u.Kirana) && u.Mega !== "Narkoba"
      && r[who("Lantas")] === r[who("Narkoba")] + 1 && (u.Lukas !== "Tipikor" || r.Kirana === 2) && (best !== "Nanda" || u.Kirana === "Tipikor")) sols.push({ r, u });
  }
  const siber = (x: S) => names.find((n) => x.u[n] === "Siber");
  check("UNIT", sols, [
    // opsi E "tidak dapat ditentukan" sah hanya jika unit Siber tidak tunggal
    { s: 73, kind: "pasti", opts: [...names.map((n) => (x: S) => siber(x) === n), () => new Set(sols.map(siber)).size > 1] },
    { s: 74, kind: "pasti", cond: (x) => x.r.Kirana === 4 && x.u.Kirana === "Lantas", opts: [...["Lukas", "Mega", "Nanda", "Kirana"].map((n) => (x: S) => x.u[n] === "Narkoba"), () => false] },
    { s: 75, kind: "pasti", cond: (x) => x.u.Lukas === "Lantas", opts: [(x) => x.r.Kirana === 2, (x) => x.r.Lukas === 4, (x) => x.r.Nanda === 2, (x) => x.u.Mega === "Tipikor", (x) => x.u.Nanda === "Narkoba"] },
  ]);
}
console.log("OK: kunci 65-75 pkg 3 cocok dengan brute force.");

// ════ Simulasi Paket 3 (package_number 15), soal 65-75: tiap wacana wajib bersolusi tunggal ════
// Ganti ke "kecerdasan_p15_teks.json" setelah file bagian digabung.
const P15_FILE = "kecerdasan_p15_teks.json";
const t15 = data(P15_FILE) as KeyFile;
const tunggal = <S>(name: string, sols: S[]) => { assert.equal(sols.length, 1, `${name}: solusi harus tunggal, dapat ${sols.length}`); return sols; };
type Pos = Record<string, number>;
const assign = (names: string[]) => perms(names.map((_, i) => i + 1)).map((p) => Object.fromEntries(names.map((n, i) => [n, p[i]])) as Pos);

// ── p15wPOS (65-68): pos 1-6 berjajar barat → timur ──
{
  const all = assign(["Galih", "Hana", "Irfan", "Jihan", "Kevin", "Laras"]);
  const adj = (s: Pos, a: string, b: string) => Math.abs(s[a] - s[b]) === 1;
  const base = (s: Pos) => s.Irfan === s.Kevin + 1 && Math.abs(s.Jihan - s.Laras) === 3 && !adj(s, "Galih", "Hana") && !adj(s, "Galih", "Irfan")
    && (s.Galih !== 1 || s.Jihan === 6);
  const sols = tunggal("POS", all.filter((s) => base(s) && s.Laras > s.Jihan));
  check("POS", sols, [
    { s: 65, kind: "pasti", opts: ["Galih", "Irfan", "Jihan", "Kevin", "Laras"].map((n) => (s: Pos) => s[n] === 3) },
    { s: 66, kind: "pasti", opts: [(s) => s.Galih === 1, (s) => s.Laras === s.Irfan + 1, (s) => adj(s, "Jihan", "Irfan"), (s) => adj(s, "Hana", "Kevin"), (s) => Math.abs(s.Hana - s.Laras) === 3] },
    { s: 67, kind: "kecuali", opts: [(s) => s.Kevin % 2 === 1, (s) => s.Galih === 6, (s) => s.Kevin < s.Irfan && s.Irfan < s.Laras, (s) => s.Kevin === s.Jihan + 1, (s) => adj(s, "Hana", "Laras")] },
  ], t15);
  // 68: syarat "Laras di sebelah timur Jihan" dihapus
  check("POS tanpa syarat Laras-timur-Jihan", all.filter(base), [
    { s: 68, kind: "pasti", opts: [(s) => s.Galih === 6, (s) => s.Jihan === 2, (s) => adj(s, "Hana", "Laras"), (s) => s.Laras === 5, (s) => adj(s, "Jihan", "Irfan")] },
  ], t15);
}

// ── p15wJADWAL (69-72): hari 1-6 = Senin-Sabtu ──
{
  const acts = ["Apel", "Bakti", "Donor", "Jalan", "Menembak", "Penyuluhan"];
  const all = assign(acts);
  const syarat = [
    (s: Pos) => s.Menembak !== 1 && s.Menembak !== 6,
    (s: Pos) => s.Penyuluhan === s.Donor + 2,
    (s: Pos) => s.Menembak < s.Donor,
    (s: Pos) => s.Bakti > s.Menembak,
    (s: Pos) => s.Apel !== 1,
    (s: Pos) => s.Menembak !== 2 || s.Apel === 1,
  ];
  const sols = tunggal("JADWAL", all.filter((s) => syarat.every((f) => f(s))));
  const on = (s: Pos, d: number) => acts.find((a) => s[a] === d);
  check("JADWAL", sols, [
    { s: 69, kind: "pasti", opts: ["Apel", "Bakti", "Donor", "Menembak", "Penyuluhan"].map((a) => (s: Pos) => s[a] === 4) },
    { s: 70, kind: "pasti", opts: [(s) => s.Jalan === s.Menembak - 1, (s) => s.Donor < s.Bakti && s.Bakti < s.Penyuluhan, (s) => s.Apel === 1, (s) => s.Menembak === 2, (s) => s.Donor === 3] },
  ], t15);
  // 71: syarat Bakti > Menembak diganti dengan Bakti hari Senin
  const ganti = all.filter((s) => syarat.filter((_, i) => i !== 3).every((f) => f(s)) && s.Bakti === 1);
  check("JADWAL syarat Bakti diganti", ganti, [
    { s: 71, kind: "pasti", opts: [...["Apel", "Jalan", "Donor", "Menembak"].map((a) => (s: Pos) => s[a] === 2), () => new Set(ganti.map((s) => on(s, 2))).size > 1] },
  ], t15);
  // 72: Jalan sehat dan Apel bertukar hari; opsi sah = syarat yang dilanggar (urutan opsi: syarat 0,1,3,4,5)
  const tukar = sols.map((s) => ({ ...s, Apel: s.Jalan, Jalan: s.Apel }));
  check("JADWAL Jalan-Apel ditukar", tukar, [{ s: 72, kind: "pasti", opts: [0, 1, 3, 4, 5].map((i) => (s: Pos) => !syarat[i](s)) }], t15);
}

// ── p15wASAL (73-75): nama × kota × fungsi ──
{
  type S = { a: Record<string, string>; f: Record<string, string> };
  const names = ["Rafi", "Sinta", "Taufik", "Umi", "Wawan"];
  const all: S[] = [];
  for (const ap of perms(["Ambon", "Bogor", "Cirebon", "Dumai", "Kupang"])) for (const fp of perms(["Binmas", "Intelkam", "Lantas", "Reskrim", "Sabhara"]))
    all.push({ a: Object.fromEntries(names.map((n, i) => [n, ap[i]])), f: Object.fromEntries(names.map((n, i) => [n, fp[i]])) });
  const who = (m: Record<string, string>, v: string) => names.find((n) => m[n] === v)!;
  const base = ({ a, f }: S) => f[who(a, "Kupang")] === "Binmas" && f[who(a, "Bogor")] === "Reskrim" && f.Rafi === "Sabhara" && ["Ambon", "Cirebon"].includes(a.Rafi)
    && f.Wawan === "Lantas" && !["Ambon", "Dumai"].includes(a.Wawan) && !["Bogor", "Kupang"].includes(a.Sinta);
  const sols = tunggal("ASAL", all.filter((x) => base(x) && (x.a.Umi !== "Kupang" || x.f.Taufik === "Intelkam")));
  check("ASAL", sols, [
    { s: 73, kind: "pasti", opts: names.map((n) => (x: S) => x.a[n] === "Ambon") },
    { s: 74, kind: "kecuali", opts: [(x) => x.f.Umi === "Reskrim", (x) => x.a.Taufik === "Bogor", (x) => x.f[who(x.a, "Cirebon")] === "Lantas", (x) => x.a.Rafi === "Ambon", (x) => x.f.Sinta === "Intelkam"] },
  ], t15);
  // 75: syarat terakhir diganti "jika Taufik dari Kupang, maka Rafi dari Cirebon"
  check("ASAL syarat terakhir diganti", all.filter((x) => base(x) && (x.a.Taufik !== "Kupang" || x.a.Rafi === "Cirebon")), [
    { s: 75, kind: "pasti", opts: names.map((n) => (x: S) => x.f[n] === "Binmas") },
  ], t15);
}
console.log(`OK: kunci 65-75 pkg 15 (${P15_FILE}) cocok dengan brute force.`);
