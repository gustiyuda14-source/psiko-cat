import assert from "node:assert/strict";
import { data } from "./kecerdasan-teks-lib";

// Brute force wacana logika Latihan Paket 2 (package_number 3), soal 65-75 (pedoman §4.5):
// semua susunan yang memenuhi syarat dihitung, lalu kunci tiap soal diturunkan ulang dan
// dicocokkan dengan field k di prisma/data/kecerdasan_p3_teks.json. Opsi sah harus tepat satu.
//   npx tsx scripts/cek-wacana-kal.ts

function perms<T>(a: T[]): T[][] {
  if (a.length <= 1) return [a];
  return a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p]));
}
type Q<S> = { s: number; kind: "pasti" | "kecuali"; cond?: (x: S) => boolean; opts: ((x: S) => boolean)[] };
const teks = data("kecerdasan_p3_teks.json") as { soal: { s: number; k: string }[] };
function check<S>(name: string, sols: S[], qs: Q<S>[]) {
  console.log(`${name}: ${sols.length} susunan sah`);
  for (const q of qs) {
    const pool = sols.filter(q.cond ?? (() => true));
    assert.ok(pool.length > 0, `soal ${q.s}: syarat tambahan tidak punya susunan`);
    const ok = q.opts.map((f) => (q.kind === "pasti" ? pool.every(f) : !pool.some(f)));
    assert.equal(ok.filter(Boolean).length, 1, `soal ${q.s}: opsi sah ${ok.filter(Boolean).length}, harus tepat 1`);
    if (q.kind === "kecuali") q.opts.forEach((f, i) => assert.ok(ok[i] || pool.some(f), `soal ${q.s}: opsi ${"ABCDE"[i]} juga tidak mungkin`));
    const key = "ABCDE"[ok.indexOf(true)];
    assert.equal(key, teks.soal.find((x) => x.s === q.s)!.k, `soal ${q.s}: kunci file ≠ brute force ${key}`);
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
console.log("OK: kunci 65-75 cocok dengan brute force.");
