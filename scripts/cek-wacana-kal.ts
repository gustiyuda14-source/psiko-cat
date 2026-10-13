import assert from "node:assert/strict";
import { data } from "./kecerdasan-teks-lib";

// Brute force wacana logika Latihan Paket 2 (package_number 3), Simulasi Paket 3 (package_number 15), Simulasi Paket 1 baru (package_number 16) dan Latihan Paket 3 & 4 (package_number 4 & 5), soal 65-75 (pedoman §4.5):
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

// ════ Simulasi Paket 1 baru (package_number 16), soal 65-75 ════
// Tiap wacana sengaja punya beberapa susunan sah (jumlahnya dikunci di bawah), supaya soal
// "pasti/mungkin/tidak mungkin" menuntut penalaran lintas susunan. Tiap soal tetap tepat satu opsi sah.
// Ganti ke "kecerdasan_p16_teks.json" setelah file bagian digabung.
const P16_FILE = "kecerdasan_p16_teks.json";
const t16 = data(P16_FILE) as KeyFile;
const banyak = <S>(name: string, sols: S[], n: number) => { assert.equal(sols.length, n, `${name}: harus ${n} susunan, dapat ${sols.length}`); return sols; };

// ── p16wRUANG (65-68): ruang U1-U3 (utara) dan S1-S3 (selatan), nomor sama = berhadapan ──
{
  type S = Record<string, string>;
  const names = ["Oka", "Putri", "Rangga", "Sekar", "Tomi", "Vina"];
  const side = (s: S, a: string) => s[a][0], col = (s: S, a: string) => +s[a][1];
  const adj = (s: S, a: string, b: string) => side(s, a) === side(s, b) && Math.abs(col(s, a) - col(s, b)) === 1;
  const face = (s: S, a: string, b: string) => side(s, a) !== side(s, b) && col(s, a) === col(s, b);
  const sols = banyak("RUANG", perms(["U1", "U2", "U3", "S1", "S2", "S3"]).map((p) => Object.fromEntries(names.map((n, i) => [n, p[i]])) as S).filter((s) =>
    side(s, "Oka") === "U" && face(s, "Oka", "Vina") && adj(s, "Putri", "Rangga") && col(s, "Rangga") < col(s, "Sekar")
    && (side(s, "Putri") !== "U" || col(s, "Tomi") === 2)), 3);
  check("RUANG", sols, [
    { s: 65, kind: "pasti", cond: (s) => s.Oka === "U3", opts: ["Putri", "Tomi", "Rangga", "Sekar", "Vina"].map((n) => (s: S) => s[n] === "U1") },
    { s: 66, kind: "pasti", opts: [(s) => col(s, "Tomi") === 2, (s) => side(s, "Putri") === "S", (s) => adj(s, "Oka", "Tomi"), (s) => adj(s, "Sekar", "Tomi"), (s) => col(s, "Rangga") === 1] },
    { s: 67, kind: "kecuali", opts: [(s) => face(s, "Tomi", "Sekar"), (s) => s.Putri === "U3", (s) => adj(s, "Rangga", "Vina"), (s) => s.Sekar === "S3", (s) => adj(s, "Oka", "Sekar")] },
    { s: 68, kind: "pasti", cond: (s) => side(s, "Putri") === "S" && side(s, "Rangga") === "S", opts: [(s) => s.Oka === "U1", (s) => s.Vina === "S1", (s) => adj(s, "Tomi", "Oka"), (s) => s.Rangga === "S2", (s) => face(s, "Sekar", "Putri")] },
  ], t16);
}

// ── p16wUJI (69-72): giliran uji emisi 1-6 ──
{
  const all = assign(["Ambulans", "Bus", "Derek", "Jip", "Pikap", "Truk"]);
  const dekat = (s: Pos, a: string, b: string) => Math.abs(s[a] - s[b]) === 1;
  const sols = banyak("UJI", all.filter((s) => s.Truk === s.Bus + 2 && ![1, 6].includes(s.Derek) && dekat(s, "Pikap", "Derek") && !dekat(s, "Ambulans", "Bus")
    && (s.Derek > s.Bus || s.Ambulans === 6)), 4);
  const order = (s: Pos) => Object.keys(s).sort((a, b) => s[a] - s[b]).join(", ");
  check("UJI", sols, [
    { s: 69, kind: "pasti", cond: (s) => s.Bus === 3, opts: ["Derek, Pikap, Bus, Jip, Truk, Ambulans", "Pikap, Derek, Bus, Ambulans, Truk, Jip", "Pikap, Derek, Bus, Jip, Truk, Ambulans", "Jip, Derek, Bus, Pikap, Truk, Ambulans", "Pikap, Derek, Bus, Jip, Ambulans, Truk"].map((o) => (s: Pos) => order(s) === o) },
    { s: 70, kind: "pasti", opts: [(s) => s.Bus === 1, (s) => s.Jip === s.Bus + 1, (s) => s.Ambulans === 6, (s) => s.Derek > s.Truk, (s) => s.Pikap > s.Jip] },
    { s: 71, kind: "kecuali", opts: [(s) => s.Ambulans === 4, (s) => s.Derek === 2, (s) => s.Pikap === 6, (s) => s.Truk === 5, (s) => s.Ambulans === 5] },
    { s: 72, kind: "pasti", cond: (s) => s.Ambulans < s.Derek, opts: ["Ambulans", "Jip", "Pikap", "Derek", "Truk"].map((k) => (s: Pos) => s[k] === 5) },
  ], t16);
}

// ── p16wPOSKO (73-75): relawan × posko × bantuan ──
{
  type S = { p: Record<string, string>; b: Record<string, string> };
  const names = ["Bayu", "Dewi", "Gilang", "Yoga", "Zahra"];
  const all: S[] = [];
  for (const pp of perms(["Cemara", "Dahlia", "Kenanga", "Melati", "Teratai"])) for (const bp of perms(["beras", "obat", "selimut", "air", "tenda"]))
    all.push({ p: Object.fromEntries(names.map((n, i) => [n, pp[i]])), b: Object.fromEntries(names.map((n, i) => [n, bp[i]])) });
  const who = (m: Record<string, string>, v: string) => names.find((n) => m[n] === v)!;
  const sols = banyak("POSKO", all.filter(({ p, b }) => b[who(p, "Melati")] === "obat" && ["tenda", "air"].includes(b.Yoga) && !["obat", "beras"].includes(b.Zahra)
    && p.Bayu === "Kenanga" && b.Gilang === "selimut" && !["Dahlia", "Teratai"].includes(p.Gilang) && (p.Zahra !== "Teratai" || b.Yoga === "air")), 3);
  const mungkin = (f: (x: S) => boolean) => () => sols.some(f);
  const memastikan = (f: (x: S) => boolean) => () => sols.filter(f).length === 1;
  check("POSKO", sols, [
    { s: 73, kind: "pasti", opts: ["Dewi", "Bayu", "Gilang", "Yoga", "Zahra"].map((n) => (x: S) => x.p[n] === "Melati") },
    // 74 "mungkin benar": opsi sah = terjadi pada minimal satu susunan
    { s: 74, kind: "pasti", opts: [(x: S) => x.p.Yoga === "Dahlia" && x.b.Yoga === "tenda", (x: S) => x.p.Zahra === "Teratai" && x.b.Zahra === "air", (x: S) => x.b[who(x.p, "Dahlia")] === "air", (x: S) => x.b.Bayu === "tenda", (x: S) => x.p.Gilang === "Melati"].map(mungkin) },
    // 75 informasi tambahan yang menyisakan tepat satu susunan
    { s: 75, kind: "pasti", opts: [(x: S) => x.b.Bayu === "beras", (x: S) => x.b.Zahra === "tenda", (x: S) => x.p.Yoga === "Teratai", (x: S) => x.b[who(x.p, "Dahlia")] === "air", (x: S) => x.b.Yoga === "tenda"].map(memastikan) },
  ], t16);
}
console.log(`OK: kunci 65-75 pkg 16 (${P16_FILE}) cocok dengan brute force.`);

// ════ Latihan Paket 3 & 4 (package_number 4 & 5), soal 65-75: tiap wacana bersolusi tunggal, tiap syarat perlu ════
// Soal "syarat dihapus" memakai susunan yang memenuhi syarat lain saja.
const lolos = <S>(all: S[], syarat: ((s: S) => boolean)[], tanpa = -1) => all.filter((s) => syarat.every((f, i) => i === tanpa || f(s)));
const perlu = <S>(name: string, all: S[], syarat: ((s: S) => boolean)[]) =>
  syarat.forEach((_, i) => assert.ok(lolos(all, syarat, i).length > 1, `${name}: syarat ke-${i + 1} tidak perlu`));
const t4 = data("kecerdasan_p4_teks.json") as KeyFile, t5 = data("kecerdasan_p5_teks.json") as KeyFile;
const adj = (s: Pos, a: string, b: string) => Math.abs(s[a] - s[b]) === 1;

// ── p4wKIOS (65-68): kios 1-6 utara → selatan ──
{
  const all = assign(["Mira", "Nanda", "Oki", "Putri", "Rafi", "Sari"]);
  const syarat = [(s: Pos) => s.Oki === s.Mira + 1, (s: Pos) => Math.abs(s.Putri - s.Sari) === 2, (s: Pos) => [1, 6].includes(s.Rafi) && s.Rafi < s.Oki,
    (s: Pos) => s.Mira > s.Nanda, (s: Pos) => s.Putri > s.Sari || s.Mira === 1];
  perlu("KIOS", all, syarat);
  const sols = tunggal("KIOS", lolos(all, syarat));
  check("KIOS", sols, [
    { s: 65, kind: "pasti", opts: ["Nanda", "Putri", "Sari", "Mira", "Oki"].map((n) => (s: Pos) => s[n] === 4) },
    { s: 66, kind: "pasti", opts: [(s) => adj(s, "Nanda", "Mira"), (s) => s.Sari === 3, (s) => Math.abs(s.Rafi - s.Nanda) === 3, (s) => s.Oki === 5, (s) => adj(s, "Putri", "Nanda") && adj(s, "Putri", "Mira")] },
    { s: 68, kind: "pasti", opts: [["Rafi", "Putri"], ["Nanda", "Putri"], ["Mira", "Nanda"], ["Rafi", "Nanda"], ["Rafi"]].map((ns) => (s: Pos) =>
      Object.keys(s).filter((n) => adj(s, n, "Sari")).sort().join() === ns.slice().sort().join()) },
  ], t4);
  check("KIOS tanpa syarat 3", lolos(all, syarat, 2), [
    { s: 67, kind: "kecuali", opts: [(s) => s.Nanda === 1, (s) => s.Rafi === 4, (s) => s.Sari === 3, (s) => s.Putri === 3, (s) => adj(s, "Rafi", "Mira")] },
  ], t4);
}

// ── p4wPIDATO (69-72): urutan tampil 1-6 ──
{
  const all = assign(["Tegar", "Umi", "Vina", "Wahyu", "Yoga", "Zahra"]);
  const syarat = [(s: Pos) => s.Vina === s.Umi + 2, (s: Pos) => s.Yoga === s.Wahyu + 1, (s: Pos) => s.Tegar === 6 || s.Zahra === s.Tegar + 1, (s: Pos) => s.Yoga < s.Vina];
  perlu("PIDATO", all, syarat);
  const sols = tunggal("PIDATO", lolos(all, syarat));
  check("PIDATO", sols, [
    { s: 69, kind: "pasti", opts: ["Umi", "Vina", "Yoga", "Tegar", "Zahra"].map((n) => (s: Pos) => s[n] === 4) },
    { s: 70, kind: "pasti", opts: [(s) => s.Vina === s.Umi + 1, (s) => s.Vina - s.Yoga === 3, (s) => s.Zahra === s.Tegar + 1, (s) => s.Wahyu === 3, (s) => s.Zahra === s.Yoga + 1] },
  ], t4);
  check("PIDATO tanpa syarat 4", lolos(all, syarat, 3), [
    { s: 71, kind: "pasti", opts: [(s) => s.Zahra === s.Umi + 1, (s) => s.Wahyu === 1, (s) => s.Vina === 5, (s) => s.Yoga < s.Umi, (s) => s.Zahra === s.Tegar + 1] },
  ], t4);
  // 72: Zahra–Vina ditukar; opsi sah = syarat yang dilanggar (D = tidak ada yang dilanggar)
  const tukar = sols.map((s) => ({ ...s, Zahra: s.Vina, Vina: s.Zahra }));
  check("PIDATO Zahra-Vina ditukar", tukar, [{ s: 72, kind: "pasti", opts: [(s: Pos) => !syarat[1](s), (s: Pos) => !syarat[3](s), (s: Pos) => !syarat[2](s), (s: Pos) => syarat.every((f) => f(s)), (s: Pos) => !syarat[0](s)] }], t4);
}

// ── p4wBAND (73-75): nama × alat × kaos ──
{
  type S = { a: Record<string, string>; w: Record<string, string> };
  const names = ["Gita", "Hadi", "Intan", "Joko", "Kirana"];
  const all: S[] = [];
  for (const ap of perms(["gitar", "biola", "drum", "piano", "seruling"])) for (const wp of perms(["merah", "biru", "hijau", "kuning", "putih"]))
    all.push({ a: Object.fromEntries(names.map((n, i) => [n, ap[i]])), w: Object.fromEntries(names.map((n, i) => [n, wp[i]])) });
  const who = (m: Record<string, string>, v: string) => names.find((n) => m[n] === v)!;
  const syarat = [(x: S) => x.w[who(x.a, "drum")] === "merah" && x.w[who(x.a, "seruling")] === "hijau",
    (x: S) => x.w.Hadi === "biru" && !["biola", "piano"].includes(x.a.Hadi),
    (x: S) => ["piano", "seruling"].includes(x.a.Gita) && !["hijau", "putih"].includes(x.w.Gita),
    (x: S) => !["gitar", "drum", "seruling"].includes(x.a.Kirana),
    (x: S) => x.a.Joko === "drum" || x.w.Joko === "putih"];
  perlu("BAND", all, syarat);
  const sols = tunggal("BAND", lolos(all, syarat));
  check("BAND", sols, [
    { s: 73, kind: "pasti", opts: ["Gita", "Hadi", "Kirana", "Intan", "Joko"].map((n) => (x: S) => x.a[n] === "biola") },
    { s: 74, kind: "pasti", opts: [(x) => x.w.Intan === "putih", (x) => x.w[who(x.a, "piano")] === "kuning", (x) => x.w.Joko === "putih", (x) => x.a.Hadi === "drum", (x) => x.w[who(x.a, "biola")] === "kuning"] },
  ], t4);
  check("BAND tanpa syarat 4", lolos(all, syarat, 3), [
    { s: 75, kind: "kecuali", opts: [(x) => x.a.Joko === "biola", (x) => x.w.Kirana === "merah", (x) => x.w.Intan === "putih", (x) => x.a.Kirana === "piano", (x) => x.a.Intan === "drum"] },
  ], t4);
}
console.log("OK: kunci 65-75 pkg 4 cocok dengan brute force.");

// ── p5wLANTAI (65-68): lantai 1 (bawah) - 6 (atas) ──
{
  const all = assign(["Aula", "Arsip", "Kantin", "Klinik", "Koperasi", "Perpustakaan"]);
  const syarat = [(s: Pos) => [1, 6].includes(s.Aula), (s: Pos) => s.Arsip === s.Klinik + 1, (s: Pos) => s.Perpustakaan === s.Kantin + 4,
    (s: Pos) => !adj(s, "Koperasi", "Perpustakaan"), (s: Pos) => s.Aula !== 1 || s.Koperasi === 2];
  perlu("LANTAI", all, syarat);
  const sols = tunggal("LANTAI", lolos(all, syarat));
  check("LANTAI", sols, [
    { s: 65, kind: "pasti", opts: ["Arsip", "Koperasi", "Klinik", "Kantin", "Perpustakaan"].map((n) => (s: Pos) => s[n] === 3) },
    { s: 66, kind: "pasti", opts: [(s) => s.Perpustakaan === s.Arsip + 1, (s) => adj(s, "Koperasi", "Arsip"), (s) => s.Kantin === 2, (s) => s.Aula === 1, (s) => s.Klinik === 4] },
  ], t5);
  check("LANTAI tanpa syarat 5", lolos(all, syarat, 4), [
    { s: 67, kind: "pasti", opts: [(s) => s.Kantin === 1, (s) => s.Aula === 6, (s) => s.Arsip === 4, (s) => s.Perpustakaan === 5, (s) => s.Koperasi < s.Klinik] },
  ], t5);
  check("LANTAI tanpa syarat 1", lolos(all, syarat, 0), [
    { s: 68, kind: "kecuali", opts: [(s) => s.Aula === 3, (s) => s.Klinik === 2, (s) => s.Kantin === 2, (s) => s.Koperasi === 1, (s) => s.Aula === 5] },
  ], t5);
}

// ── p5wGIGI (69-72): hari 1-6 = Senin-Sabtu ──
{
  const all = assign(["Cempaka", "Flamboyan", "Kenari", "Matahari", "Pelita", "Rajawali"]);
  const syarat = [(s: Pos) => s.Kenari === s.Flamboyan + 1, (s: Pos) => s.Pelita <= 2, (s: Pos) => Math.abs(s.Cempaka - s.Rajawali) === 3,
    (s: Pos) => s.Rajawali === s.Matahari + 1, (s: Pos) => s.Cempaka > s.Rajawali || s.Flamboyan === 1];
  perlu("GIGI", all, syarat);
  const sols = tunggal("GIGI", lolos(all, syarat));
  check("GIGI", sols, [
    { s: 69, kind: "pasti", opts: ["Kenari", "Rajawali", "Cempaka", "Flamboyan", "Matahari"].map((n) => (s: Pos) => s[n] === 4) },
    { s: 70, kind: "pasti", opts: [(s) => s.Pelita === 2, (s) => s.Flamboyan === s.Cempaka + 1, (s) => s.Cempaka === s.Kenari + 1, (s) => s.Flamboyan === 1, (s) => s.Rajawali === 4] },
  ], t5);
  check("GIGI tanpa syarat 5", lolos(all, syarat, 4), [
    { s: 71, kind: "pasti", opts: [(s) => s.Matahari === s.Pelita + 1, (s) => s.Cempaka === 6, (s) => s.Flamboyan === 4, (s) => s.Rajawali === 3, (s) => s.Kenari === 5] },
  ], t5);
  const tukar = sols.map((s) => ({ ...s, Pelita: s.Matahari, Matahari: s.Pelita }));
  check("GIGI Pelita-Matahari ditukar", tukar, [{ s: 72, kind: "pasti", opts: [(s: Pos) => !syarat[1](s), (s: Pos) => !syarat[3](s), (s: Pos) => !syarat[2](s), (s: Pos) => syarat.every((f) => f(s)), (s: Pos) => !syarat[0](s)] }], t5);
}

// ── p5wMASAK (73-75): nama × peringkat (1 = terbaik) × menu ──
{
  type S = { r: Pos; m: Record<string, string> };
  const names = ["Bagas", "Dewi", "Fikri", "Hesti", "Iwan"];
  const all: S[] = [];
  for (const rp of perms([1, 2, 3, 4, 5])) for (const mp of perms(["soto", "rendang", "gado-gado", "pecel", "sate"]))
    all.push({ r: Object.fromEntries(names.map((n, i) => [n, rp[i]])), m: Object.fromEntries(names.map((n, i) => [n, mp[i]])) });
  const rk = (x: S, menu: string) => x.r[names.find((n) => x.m[n] === menu)!];
  const syarat = [(x: S) => rk(x, "gado-gado") === 5, (x: S) => rk(x, "rendang") < rk(x, "soto") && rk(x, "sate") === rk(x, "soto") + 1,
    (x: S) => x.r.Bagas === x.r.Iwan + 1 && x.m.Bagas !== "soto", (x: S) => x.r.Dewi < x.r.Iwan, (x: S) => x.r.Fikri > x.r.Hesti,
    (x: S) => x.r.Hesti > 2 || x.m.Hesti === "gado-gado"];
  perlu("MASAK", all, syarat);
  const sols = tunggal("MASAK", lolos(all, syarat));
  check("MASAK", sols, [
    { s: 73, kind: "pasti", opts: ["Iwan", "Hesti", "Dewi", "Fikri", "Bagas"].map((n) => (x: S) => x.m[n] === "sate") },
    { s: 74, kind: "pasti", opts: [(x) => x.m.Hesti === "gado-gado", (x) => x.r.Iwan === 1, (x) => rk(x, "gado-gado") === rk(x, "pecel") + 1, (x) => x.m.Dewi === "soto", (x) => x.r.Bagas < x.r.Iwan] },
  ], t5);
  // 75: hanya bagian "Bagas tidak memasak soto" yang dihapus
  const longgar = all.filter((x) => syarat.every((f, i) => i === 2 || f(x)) && x.r.Bagas === x.r.Iwan + 1);
  check("MASAK tanpa larangan soto Bagas", longgar, [
    { s: 75, kind: "kecuali", opts: [(x) => x.m.Iwan === "sate", (x) => x.m.Iwan === "pecel", (x) => x.m.Hesti === "sate", (x) => x.m.Dewi === "pecel", (x) => x.m.Bagas === "soto"] },
  ], t5);
}
console.log("OK: kunci 65-75 pkg 5 cocok dengan brute force.");

// ════ Simulasi Penuh 4 (package_number 19), soal 65-75: konvensi sama dengan pkg 4/5 ════
const t19 = data("kecerdasan_p19_teks.json") as KeyFile;

// ── p19wLOKER (65-68): loker 1-3 baris atas, 4-6 baris bawah (kiri → kanan), loker n+3 tepat di bawah loker n ──
{
  const all = assign(["Ayu", "Bayu", "Cici", "Doni", "Eka", "Fira"]);
  const baris = (n: number) => (n <= 3 ? 0 : 1), kolom = (n: number) => (n - 1) % 3;
  const sebelah = (s: Pos, a: string, b: string) => baris(s[a]) === baris(s[b]) && Math.abs(s[a] - s[b]) === 1;
  const syarat = [(s: Pos) => [1, 3].includes(s.Ayu), (s: Pos) => s.Doni === s.Bayu + 3, (s: Pos) => sebelah(s, "Cici", "Eka"),
    (s: Pos) => s.Fira < s.Bayu, (s: Pos) => s.Ayu !== 1 || s.Cici === s.Ayu + 3];
  perlu("LOKER", all, syarat);
  const sols = tunggal("LOKER", lolos(all, syarat));
  check("LOKER", sols, [
    { s: 65, kind: "pasti", opts: ["Cici", "Doni", "Fira", "Bayu", "Eka"].map((n) => (s: Pos) => s[n] === 5) },
    { s: 66, kind: "pasti", opts: [(s) => s.Ayu === 3, (s) => s.Doni === 4, (s) => sebelah(s, "Cici", "Doni"), (s) => sebelah(s, "Fira", "Bayu"), (s) => s.Eka === s.Ayu + 3] },
  ], t19);
  check("LOKER tanpa syarat 5", lolos(all, syarat, 4), [
    { s: 67, kind: "kecuali", opts: [(s) => s.Eka === 4, (s) => s.Cici === 6, (s) => s.Cici === 5, (s) => s.Eka === 5, (s) => s.Fira === 2] },
  ], t19);
  check("LOKER tanpa syarat 4", lolos(all, syarat, 3), [
    { s: 68, kind: "pasti", opts: [(s) => s.Ayu === 1, (s) => s.Eka === 5, (s) => s.Doni === 6, (s) => s.Fira === 2, (s) => s.Cici === 4] },
  ], t19);
  assert.ok(kolom(sols[0].Cici) === kolom(sols[0].Ayu), "LOKER: Cici di bawah Ayu");
}

// ── p19wHALTE (69-72): urutan singgah 1-6 ──
{
  const all = assign(["KantorPos", "Pasar", "RumahSakit", "Sekolah", "Stasiun", "Taman"]);
  const syarat = [(s: Pos) => s.Stasiun === s.Pasar + 3, (s: Pos) => s.Taman === s.Sekolah + 1, (s: Pos) => s.Pasar !== 1, (s: Pos) => s.Stasiun !== 6,
    (s: Pos) => !(s.RumahSakit < s.Pasar) || s.KantorPos === 1];
  perlu("HALTE", all, syarat);
  const sols = tunggal("HALTE", lolos(all, syarat));
  check("HALTE", sols, [
    { s: 69, kind: "pasti", opts: ["KantorPos", "Stasiun", "Taman", "Pasar", "RumahSakit"].map((n) => (s: Pos) => s[n] === 6) },
  ], t19);
  const tanpa4 = lolos(all, syarat, 3); // 70: hitung susunan tanpa syarat 4
  check("HALTE tanpa syarat 4", tanpa4, [
    { s: 70, kind: "pasti", opts: [1, 2, 3, 4, 5].map((n) => () => tanpa4.length === n) },
  ], t19);
  check("HALTE tanpa syarat 5", lolos(all, syarat, 4), [
    { s: 71, kind: "pasti", opts: [(s) => s.KantorPos === 1, (s) => s.Sekolah === 3, (s) => s.RumahSakit === 6, (s) => s.KantorPos > s.Stasiun, (s) => s.Pasar === 1] },
  ], t19);
  check("HALTE tanpa syarat 3", lolos(all, syarat, 2), [
    { s: 72, kind: "kecuali", opts: [(s) => s.RumahSakit === 1, (s) => s.KantorPos === 6, (s) => s.Sekolah === 2, (s) => s.RumahSakit === 3, (s) => s.Taman === 6] },
  ], t19);
}

// ── p19wPIKET (73-75): guru × hari piket (1 = Senin … 5 = Jumat) × mata pelajaran ──
{
  type S = { h: Pos; m: Record<string, string> };
  const names = ["Hana", "Ilham", "Joko", "Kartika", "Lina"];
  const all: S[] = [];
  for (const hp of perms([1, 2, 3, 4, 5])) for (const mp of perms(["Biologi", "Ekonomi", "Fisika", "Geografi", "Sejarah"]))
    all.push({ h: Object.fromEntries(names.map((n, i) => [n, hp[i]])), m: Object.fromEntries(names.map((n, i) => [n, mp[i]])) });
  const hari = (x: S, mapel: string) => x.h[names.find((n) => x.m[n] === mapel)!];
  const syarat = [(x: S) => hari(x, "Geografi") === 1, (x: S) => x.m.Ilham === "Fisika" && x.h.Ilham === 5, (x: S) => x.h.Joko === x.h.Kartika + 1,
    (x: S) => x.h.Lina < x.h.Hana, (x: S) => x.h.Hana < x.h.Kartika && x.m.Hana !== "Ekonomi", (x: S) => x.m.Lina !== "Geografi" || x.m.Kartika === "Sejarah"];
  perlu("PIKET", all, syarat);
  const sols = tunggal("PIKET", lolos(all, syarat));
  check("PIKET", sols, [
    { s: 73, kind: "pasti", opts: ["Sejarah", "Geografi", "Fisika", "Biologi", "Ekonomi"].map((m) => (x: S) => x.m[names.find((n) => x.h[n] === hari(x, "Biologi") + 2)!] === m) },
  ], t19);
  check("PIKET tanpa syarat 6", lolos(all, syarat, 5), [
    { s: 74, kind: "kecuali", opts: [(x) => x.m.Hana === "Sejarah", (x) => x.m.Joko === "Biologi", (x) => x.m.Kartika === "Ekonomi", (x) => x.m.Kartika === "Geografi", (x) => x.m.Joko === "Sejarah"] },
  ], t19);
  check("PIKET tanpa syarat 3", lolos(all, syarat, 2), [
    { s: 75, kind: "pasti", opts: [(x) => x.m.Lina === "Geografi", (x) => x.h.Hana === 3, (x) => x.h.Kartika > x.h.Lina, (x) => x.h.Joko === 4, (x) => x.m.Kartika === "Sejarah"] },
  ], t19);
}
console.log("OK: kunci 65-75 pkg 19 cocok dengan brute force.");
