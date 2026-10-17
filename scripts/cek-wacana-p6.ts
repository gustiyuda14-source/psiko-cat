import assert from "node:assert/strict";
import { data } from "./kecerdasan-teks-lib";

// Brute force wacana logika Latihan Paket 5 (package_number 6), soal 65-72 (pedoman §4.5, layout v4).
// Kunci tiap soal diturunkan ulang dari semua susunan sah dan dicocokkan dengan prisma/data/kecerdasan_p6_teks.json.
//   npx tsx scripts/cek-wacana-p6.ts
// LARI: solusi tunggal, tiap syarat perlu. DESA: 4 susunan sah (pola POSKO), tiap syarat perlu.

type Pos = Record<string, number>;
type Q<S> = { s: number; kind: "pasti" | "kecuali"; opts: ((x: S) => boolean)[] };
const teks = data("kecerdasan_p6_teks.json") as { soal: { s: number; k: string }[] };

function perms<T>(a: T[]): T[][] {
  return a.length <= 1 ? [a] : a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p]));
}
const assign = (names: string[]) => perms(names.map((_, i) => i + 1)).map((p) => Object.fromEntries(names.map((n, i) => [n, p[i]])) as Pos);
const lolos = <S>(all: S[], syarat: ((s: S) => boolean)[], tanpa = -1) => all.filter((s) => syarat.every((f, i) => i === tanpa || f(s)));
const perlu = <S>(name: string, all: S[], syarat: ((s: S) => boolean)[], n: number) =>
  syarat.forEach((_, i) => assert.ok(lolos(all, syarat, i).length > n, `${name}: syarat ke-${i + 1} tidak perlu`));

function check<S>(name: string, sols: S[], qs: Q<S>[]) {
  console.log(`${name}: ${sols.length} susunan sah`);
  for (const q of qs) {
    const ok = q.opts.map((f) => (q.kind === "pasti" ? sols.every(f) : !sols.some(f)));
    assert.equal(ok.filter(Boolean).length, 1, `soal ${q.s}: opsi sah ${ok.filter(Boolean).length}, harus tepat 1`);
    const key = "ABCDE"[ok.indexOf(true)];
    assert.equal(key, teks.soal.find((x) => x.s === q.s)!.k, `soal ${q.s}: kunci file ≠ brute force ${key}`);
  }
}

// ── p6wLARI (65-68): urutan finis 1 (pertama) - 6 (terakhir) ──
{
  const all = assign(["Ayu", "Bimo", "Cahya", "Dedi", "Eka", "Farhan"]);
  const syarat = [(s: Pos) => s.Bimo === s.Ayu + 2, (s: Pos) => s.Cahya % 2 === 1, (s: Pos) => ![1, 6].includes(s.Dedi),
    (s: Pos) => s.Farhan === s.Eka + 1, (s: Pos) => !(s.Cahya < s.Ayu) || s.Dedi === s.Bimo + 1];
  perlu("LARI", all, syarat, 1);
  const sols = lolos(all, syarat);
  assert.equal(sols.length, 1, "LARI: harus tepat satu susunan");
  const tepatDiBelakang = (s: Pos, a: string, b: string) => s[a] === s[b] + 1;
  check("LARI", sols, [
    { s: 65, kind: "pasti", opts: ["Ayu", "Cahya", "Dedi", "Eka", "Farhan"].map((n) => (s: Pos) => s[n] === 3) },
    { s: 66, kind: "pasti", opts: [(s) => tepatDiBelakang(s, "Eka", "Farhan"), (s) => tepatDiBelakang(s, "Dedi", "Bimo"), (s) => s.Cahya === 3, (s) => s.Ayu === 2, (s) => tepatDiBelakang(s, "Cahya", "Ayu")] },
  ]);
  check("LARI tanpa syarat 3", lolos(all, syarat, 2), [
    { s: 67, kind: "pasti", opts: [(s) => s.Dedi === 1, (s) => tepatDiBelakang(s, "Bimo", "Cahya"), (s) => s.Eka === 1, (s) => s.Ayu === 4, (s) => s.Farhan === 6] },
  ]);
  check("LARI tanpa syarat 5", lolos(all, syarat, 4), [
    { s: 68, kind: "kecuali", opts: [(s) => s.Cahya === 1, (s) => s.Ayu === 2, (s) => s.Dedi === 5, (s) => s.Bimo === 3, (s) => s.Eka === 5] },
  ]);
}

// ── p6wDESA (69-72): hari 1-5 = Senin-Jumat × desa ──
{
  type S = { h: Pos; d: Record<string, string> };
  const names = ["Gilang", "Hesti", "Irfan", "Jihan", "Kevin"];
  const all: S[] = [];
  for (const h of assign(names)) for (const dp of perms(["Asri", "Bukit", "Cendana", "Damar", "Embun"]))
    all.push({ h, d: Object.fromEntries(names.map((n, i) => [n, dp[i]])) });
  const hariDesa = (x: S, desa: string) => x.h[names.find((n) => x.d[n] === desa)!];
  const syarat = [(x: S) => [2, 4].includes(x.h.Hesti), (x: S) => hariDesa(x, "Cendana") === x.h.Irfan + 1, (x: S) => x.d.Kevin === "Embun",
    (x: S) => hariDesa(x, "Embun") < hariDesa(x, "Asri"), (x: S) => hariDesa(x, "Bukit") === 1, (x: S) => hariDesa(x, "Damar") === 3];
  perlu("DESA", all, syarat, 4);
  const sols = lolos(all, syarat);
  assert.equal(sols.length, 4, "DESA: harus tepat 4 susunan (dicantumkan di pembahasan)");
  const mungkin = (f: (x: S) => boolean) => () => sols.some(f);
  const memastikan = (f: (x: S) => boolean) => () => sols.filter(f).length === 1;
  check("DESA", sols, [
    { s: 69, kind: "pasti", opts: ["Bukit", "Asri", "Cendana", "Damar", "Embun"].map((desa) => (x: S) => hariDesa(x, desa) === 5) },
    { s: 70, kind: "pasti", opts: [(x) => x.h.Irfan === 1, (x) => x.h.Kevin === 4, (x) => x.d.Gilang === "Asri", (x) => x.d.Hesti === "Cendana", (x) => x.h.Jihan === 5] },
    { s: 71, kind: "pasti", opts: [(x: S) => x.d.Gilang === "Damar", (x: S) => x.d.Irfan === "Cendana", (x: S) => x.h.Kevin === 3, (x: S) => x.d.Jihan === "Embun", (x: S) => x.h.Hesti === 2 && x.h.Irfan === 3].map(mungkin) },
    { s: 72, kind: "pasti", opts: [(x: S) => x.h.Jihan === 5, (x: S) => x.h.Kevin === 2, (x: S) => x.d.Irfan === "Bukit", (x: S) => x.h.Hesti === 4, (x: S) => x.h.Gilang === 1].map(memastikan) },
  ]);
}
console.log("OK: kunci 65-72 pkg 6 cocok dengan brute force.");
