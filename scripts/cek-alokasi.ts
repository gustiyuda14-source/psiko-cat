import assert from "node:assert/strict";
import * as fs from "fs";
import * as path from "path";
import { KEYS, checkA7 } from "./kecerdasan-teks-lib";

// Soal Alokasi Waktu (rencana docs/rencana/simulasi-5.md §2.4–2.4b): setiap butir menyimpan data terstruktur,
// skrip ini menghitung ulang semua kemungkinan dan memastikan tepat satu opsi yang sah (pedoman D-1).
//   npx tsx scripts/cek-alokasi.ts
// Model waktu: ia mengerjakan tugas satu per satu; jeda tidak dipakai bekerja, tugas yang terpotong jeda dilanjutkan
// sesudahnya. Rekan mengerjakan tugas delegasi berurutan mulai `rekan_mulai` (bawaan: awal jendela). Tugas `sendiri`
// tidak boleh didelegasikan. Setiap tugas wajib selesai sebelum `tenggat` (bawaan: akhir jendela).
//   tanya "delegasi": opsi = daftar tugas yang dilepas ([] = tanpa bantuan); sah bila semua tugas selesai.
//   tanya "pas":      seperti delegasi, dan sisa tugasnya menghabiskan waktu kerja tepat tanpa sisa.
//   tanya "strategi": opsi = { hemat, delegasi, korban, tugas? } (§2.4b); sah bila delegasi && !korban && hemat ≥ kelebihan.
//   tanya "terpendek": opsi = satu tugas yang dilepas; sah bila cukup DAN durasinya terpendek di antara semua tugas yang cukup.
//   tanya "maks":     opsi = "N tugas utuh" tanpa bantuan; sah bila N = jumlah tugas terbanyak yang muat di waktu kerja.
//   tanya "paralel":  opsi = "HH.MM"; ia dan rekan mulai bersama di awal jendela, tiap tugas dikerjakan utuh oleh satu
//                     orang (tugas `sendiri` hanya olehnya); sah bila sama dengan waktu selesai paling cepat.
// `rekan_faktor` (mis. 1.5): rekan mengerjakan tugas delegasi faktor × lebih lama.

type Tugas = { nama: string; menit: number; sendiri?: boolean; tenggat?: string };
type Strategi = { hemat: number; delegasi: boolean; korban: boolean; tugas?: string };
type Data = { jendela: [string, string]; jeda?: [string, string][]; rekan_mulai?: string; rekan_faktor?: number; tugas: Tugas[]; tanya: "delegasi" | "pas" | "strategi" | "terpendek" | "maks" | "paralel"; opsi: (string[] | Strategi | string)[] };
export type Alokasi = { s: number; t: "CRT"; sub: "ALOKASI"; bentuk: string; d: 2 | 3; i: string; w: string; q: string; c: string[]; k: string; p: string; data: Data };
type Paket = { wacana: Record<string, string>; soal: Alokasi[] };

export const TANPA_BANTUAN = "Semua tugas dapat diselesaikan tanpa bantuan";
const root = path.join(__dirname, "..");
const jam = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}.${String(m % 60).padStart(2, "0")}`;
const menit = (hhmm: string) => { const m = hhmm.match(/^(\d{2})\.(\d{2})$/); assert.ok(m, `jam ${hhmm}`); return +m[1] * 60 + +m[2]; };

function perms<T>(xs: T[]): T[][] {
  return xs.length <= 1 ? [xs] : xs.flatMap((x, i) => perms([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p]));
}

/** Waktu selesai tiap tugas bila dikerjakan berurutan mulai `start`, melompati jeda. */
function jadwal(urut: Tugas[], start: number, jeda: [number, number][], faktor = 1) {
  let now = start;
  return urut.map((t) => {
    let sisa = t.menit * faktor;
    while (sisa > 0) {
      const j = jeda.find(([a, b]) => now >= a && now < b);
      if (j) { now = j[1]; continue; }
      const next = Math.min(...jeda.map(([a]) => a).filter((a) => a > now), Infinity);
      const kerja = Math.min(sisa, next - now);
      now += kerja; sisa -= kerja;
    }
    return now;
  });
}

/** Apakah ada urutan kerja yang membuat semua tugas (miliknya dan rekan) selesai tepat waktu? */
export function bisa(d: Data, lepas: string[]) {
  const [w0, w1] = d.jendela.map(menit), jeda = (d.jeda ?? []).map(([a, b]) => [menit(a), menit(b)] as [number, number]);
  const due = (t: Tugas) => Math.min(t.tenggat ? menit(t.tenggat) : w1, w1);
  const rekan = d.tugas.filter((t) => lepas.includes(t.nama)), sendiri = d.tugas.filter((t) => !lepas.includes(t.nama));
  if (rekan.some((t) => t.sendiri)) return false;
  // Rekan tidak terikat jeda miliknya.
  const okRekan = perms(rekan).some((u) => jadwal(u, d.rekan_mulai ? menit(d.rekan_mulai) : w0, [], d.rekan_faktor).every((f, n) => f <= due(u[n])));
  const okSendiri = perms(sendiri).some((u) => jadwal(u, w0, jeda).every((f, n) => f <= due(u[n])));
  return okRekan && okSendiri;
}

export function waktuKerja(d: Data) {
  const [w0, w1] = d.jendela.map(menit);
  return w1 - w0 - (d.jeda ?? []).reduce((n, [a, b]) => n + menit(b) - menit(a), 0);
}
export const kelebihan = (d: Data) => d.tugas.reduce((n, t) => n + t.menit, 0) - waktuKerja(d);

/** Jumlah tugas terbanyak yang muat di waktu kerja (tanpa bantuan): ambil dari yang terpendek. */
export const maksTugas = (d: Data) => { let sisa = waktuKerja(d), n = 0; for (const m of d.tugas.map((t) => t.menit).sort((a, b) => a - b)) { if (m > sisa) break; sisa -= m; n++; } return n; };

/** Waktu selesai paling cepat bila ia dan rekan bekerja paralel (brute force semua pembagian tugas). */
export function selesaiParalel(d: Data) {
  const n = d.tugas.length, w0 = menit(d.jendela[0]);
  let best = Infinity;
  for (let mask = 0; mask < 1 << n; mask++) {
    if (d.tugas.some((t, i) => t.sendiri && mask & (1 << i))) continue;
    const r = d.tugas.reduce((s, t, i) => s + (mask & (1 << i) ? t.menit * (d.rekan_faktor ?? 1) : 0), 0);
    const a = d.tugas.reduce((s, t, i) => s + (mask & (1 << i) ? 0 : t.menit), 0);
    best = Math.min(best, Math.max(r, a));
  }
  assert.ok(!d.jeda?.length, "paralel: model ini tidak memakai jeda");
  return jam(w0 + best);
}

function sah(d: Data, o: string[] | Strategi | string) {
  if (d.tanya === "strategi") {
    const s = o as Strategi;
    if (s.tugas) {
      const t = d.tugas.find((x) => x.nama === s.tugas);
      assert.ok(t && t.menit === s.hemat, `opsi strategi: hemat ${s.hemat} ≠ durasi tugas ${s.tugas}`);
      if (s.delegasi) assert.ok(!t.sendiri, `opsi strategi: ${s.tugas} wajib dikerjakan sendiri, tidak boleh ditandai delegasi`);
    }
    return s.delegasi && !s.korban && s.hemat >= kelebihan(d);
  }
  if (d.tanya === "maks") return o === `${maksTugas(d)} tugas utuh`;
  if (d.tanya === "paralel") return o === selesaiParalel(d);
  const lepas = o as string[];
  for (const n of lepas) assert.ok(d.tugas.some((t) => t.nama === n), `opsi menyebut tugas yang tidak ada: ${n}`);
  if (!bisa(d, lepas)) return false;
  if (d.tanya === "terpendek") {
    const cukup = d.tugas.filter((t) => bisa(d, [t.nama])).map((t) => t.menit);
    return lepas.length === 1 && d.tugas.find((t) => t.nama === lepas[0])!.menit === Math.min(...cukup);
  }
  if (d.tanya === "pas") return d.tugas.filter((t) => !lepas.includes(t.nama)).reduce((n, t) => n + t.menit, 0) === waktuKerja(d);
  return true;
}

const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const teksOpsi = (o: string[]) => (o.length ? [o[0], ...o.slice(1).map(lower)].join(" dan ") : TANPA_BANTUAN);

/** Cek satu butir; mengembalikan huruf kunci hasil hitungan. */
export function cekButir(x: Alokasi, wacana: Record<string, string>) {
  const tag = `alokasi #${x.s}`, d = x.data, body = wacana[x.w];
  assert.ok(body, `${tag}: wacana ${x.w} tidak ada`);
  assert.equal(x.c.length, 5, `${tag}: 5 opsi`);
  assert.equal(new Set(x.c).size, 5, `${tag}: opsi kembar`);
  assert.equal(d.opsi.length, 5, `${tag}: data.opsi harus 5`);
  // Susunan §2.4a: konteks (jendela "pukul A hingga B" + titik dua) / daftar "• Tugas: N menit" (spasi tak-putus sebelum "menit", supaya tidak terpotong di layar HP) / kendala / q "Pertanyaan: …?"
  const parts = body.split("\n\n");
  assert.equal(parts.length, 3, `${tag}: wacana harus 3 bagian (konteks, daftar, kendala) dipisah baris kosong`);
  assert.ok(parts[0].includes(`pukul ${d.jendela[0]} hingga ${d.jendela[1]}`) && parts[0].endsWith(":"), `${tag}: konteks harus memuat "pukul ${d.jendela[0]} hingga ${d.jendela[1]}" dan diakhiri titik dua`);
  assert.deepEqual(parts[1].split("\n"), d.tugas.map((t) => `• ${t.nama}: ${t.menit}\u00a0menit`), `${tag}: daftar tugas ≠ data`);
  for (const [a, b] of d.jeda ?? []) assert.ok(parts[2].includes(`${a} hingga ${b}`), `${tag}: kendala harus menyebut jeda ${a} hingga ${b}`);
  if (d.rekan_faktor) assert.ok(parts[2].includes(`${String(d.rekan_faktor).replace(".", ",")} kali`), `${tag}: kendala harus menyebut rekan ${d.rekan_faktor} kali lebih lama`);
  if (d.rekan_mulai) assert.ok(parts[2].includes(d.rekan_mulai), `${tag}: kendala harus menyebut rekan mulai ${d.rekan_mulai}`);
  for (const t of d.tugas.filter((t) => t.tenggat)) assert.ok(parts[2].includes(t.tenggat!), `${tag}: kendala harus menyebut tenggat ${t.tenggat}`);
  assert.match(x.q, /^Pertanyaan: .+\?$/, `${tag}: q harus "Pertanyaan: …?"`);
  for (const t of d.tugas) assert.match(t.nama, /^Me/, `${tag}: nama tugas berawalan me- (${t.nama})`);
  if (d.tanya === "maks" || d.tanya === "paralel") d.opsi.forEach((o, n) => assert.equal(x.c[n], o, `${tag}: opsi ${KEYS[n]} ≠ data`));
  else if (d.tanya !== "strategi") d.opsi.forEach((o, n) => assert.equal(x.c[n], teksOpsi(o as string[]), `${tag}: opsi ${KEYS[n]} ≠ data`));
  for (const c of x.c) assert.ok(!/\.$/.test(c), `${tag}: opsi tanpa titik`);
  const valid = d.opsi.map((o, n) => (sah(d, o) ? KEYS[n] : null)).filter(Boolean);
  assert.equal(valid.length, 1, `${tag}: harus tepat 1 opsi sah, dapat ${JSON.stringify(valid)}`);
  assert.equal(x.k, valid[0], `${tag}: kunci ${x.k} ≠ hitungan ${valid[0]}`);
  if (d.tanya === "terpendek") {
    // Tugas terpendek yang cukup harus tunggal di seluruh daftar, bukan hanya di opsi.
    const cukup = d.tugas.filter((t) => bisa(d, [t.nama]));
    assert.equal(cukup.filter((t) => t.menit === Math.min(...cukup.map((c) => c.menit))).length, 1, `${tag}: tugas terpendek yang cukup harus tunggal`);
  }
  if (d.tanya === "pas") {
    // Tidak boleh ada pasangan lain (di luar opsi) yang juga pas.
    const pas = d.tugas.flatMap((a, i) => d.tugas.slice(i + 1).map((b) => [a.nama, b.nama])).filter((o) => sah(d, o));
    assert.equal(pas.length, 1, `${tag}: pasangan pas harus tunggal, dapat ${JSON.stringify(pas)}`);
  }
  // Pembahasan §2.4a: angka waktu kerja dan kelebihan disebut, tiap opsi salah dibahas, Jawaban + Tips.
  if (d.tanya === "paralel") assert.ok(x.p.includes(`${d.tugas.reduce((n, t) => n + t.menit, 0)} menit`), `${tag}: pembahasan harus menyebut total durasi`);
  else assert.ok(x.p.includes(`${waktuKerja(d)} menit`) && x.p.includes(`${kelebihan(d)} menit`), `${tag}: pembahasan harus menyebut waktu kerja ${waktuKerja(d)} menit dan kelebihan ${kelebihan(d)} menit`);
  assert.ok(x.p.includes("<br>") && x.p.includes(`Jawaban: ${x.c[KEYS.indexOf(x.k as never)]} (${x.k}).`) && /Tips: /.test(x.p), `${tag}: pembahasan harus 2 paragraf, "Jawaban: <isi> (${x.k})." dan "Tips:"`);
  for (const k of KEYS.filter((k) => k !== x.k)) assert.ok(x.p.includes(`Opsi ${k} (`), `${tag}: pembahasan tidak membahas opsi ${k}`);
  return valid[0]!;
}

const DRILL_DIR = path.join(root, "bank/drill/kecerdasan");
const STRATEGI = "NUM-CRT-ALOKASI-STRATEGI";
type DrillItem = { id: string; sub_type: string; tier: number; stem: string; opsi: Record<string, string>; kunci: string[]; nilai_opsi: Record<string, Strategi>; pembahasan: string };

/** Drill K07 strategi delegasi (§2.6): stem = konteks / daftar / kendala / "Pertanyaan:" (dipisah baris kosong);
 *  jendela, jeda, dan tugas dibaca dari stem (yang dilihat peserta), data per opsi dari `nilai_opsi`. */
function cekDrillStrategi() {
  const items = (JSON.parse(fs.readFileSync(path.join(DRILL_DIR, "K07-soal-cerita.json"), "utf8")) as DrillItem[]).filter((x) => x.sub_type === STRATEGI);
  assert.equal(items.length, 10, `K07 strategi: harus 10 butir, ada ${items.length}`);
  assert.deepEqual([1, 2, 3].map((t) => items.filter((x) => x.tier === t).length), [3, 4, 3], "K07 strategi: tier harus 3/4/3");
  return items.map((it, n) => {
    const parts = it.stem.split("\n\n");
    assert.equal(parts.length, 4, `${it.id}: stem harus 4 bagian`);
    const jendela = parts[0].match(/pukul (\d{2}\.\d{2}) hingga (\d{2}\.\d{2})/);
    assert.ok(jendela, `${it.id}: jendela "pukul A hingga B" tidak ada`);
    const data: Data = {
      jendela: [jendela[1], jendela[2]],
      jeda: [...parts[2].matchAll(/(\d{2}\.\d{2}) hingga (\d{2}\.\d{2})/g)].map((m) => [m[1], m[2]] as [string, string]),
      tugas: parts[1].split("\n").map((l) => { const m = l.match(/^• (.+): (\d+)\u00a0menit$/); assert.ok(m, `${it.id}: baris tugas "${l}"`); return { nama: m[1], menit: +m[2] }; }),
      tanya: "strategi",
      opsi: KEYS.map((k) => it.nilai_opsi[k.toLowerCase()]),
    };
    const x: Alokasi = { s: n + 1, t: "CRT", sub: "ALOKASI", bentuk: "strategi", d: 3, i: "", w: it.id, q: parts[3], c: KEYS.map((k) => it.opsi[k.toLowerCase()]), k: it.kunci[0].toUpperCase(), p: it.pembahasan, data };
    assert.equal(it.kunci.length, 1, `${it.id}: satu kunci`);
    cekButir(x, { [it.id]: parts.slice(0, 3).join("\n\n") });
    checkA7(it.id, it);
    return { pkg: it.id, x };
  });
}

/** Anti-bocor (§2.4): nama tugas dan jendela tidak dipakai drill K07/K11 (selain butir strategi yang ikut dicek) maupun butir alokasi lain. */
function cekBocor(all: { pkg: string; x: Alokasi }[]) {
  const k07 = (JSON.parse(fs.readFileSync(path.join(DRILL_DIR, "K07-soal-cerita.json"), "utf8")) as DrillItem[]).filter((x) => x.sub_type !== STRATEGI);
  const drill = [JSON.stringify(k07), fs.readFileSync(path.join(DRILL_DIR, "K11-wacana-logika.json"), "utf8")].join("\n").toLowerCase();
  const seenNama = new Map<string, string>(), seenJendela = new Map<string, string>();
  for (const { pkg, x } of all) {
    const tag = `pkg ${pkg} #${x.s}`;
    const j = x.data.jendela.join("–");
    assert.ok(!drill.includes(j), `${tag}: jendela ${j} sudah dipakai drill`);
    assert.ok(!seenJendela.has(j), `${tag}: jendela ${j} sama dengan ${seenJendela.get(j)}`);
    seenJendela.set(j, tag);
    for (const t of x.data.tugas) {
      const n = t.nama.toLowerCase();
      assert.ok(!drill.includes(n), `${tag}: tugas "${t.nama}" sudah dipakai drill`);
      assert.ok(!seenNama.has(n), `${tag}: tugas "${t.nama}" sama dengan ${seenNama.get(n)}`);
      seenNama.set(n, tag);
    }
  }
}

if (require.main === module) {
  const file = JSON.parse(fs.readFileSync(path.join(root, "prisma/data/kecerdasan_alokasi.json"), "utf8")) as Record<string, Paket>;
  const all: { pkg: string; x: Alokasi }[] = [];
  for (const [pkg, paket] of Object.entries(file)) {
    for (const x of paket.soal) { assert.equal(x.sub, "ALOKASI"); assert.equal(x.t, "CRT"); cekButir(x, paket.wacana); all.push({ pkg, x }); }
    assert.equal(paket.soal.filter((x) => x.bentuk === "strategi").length, 1, `pkg ${pkg}: tepat 1 butir bentuk "delegasi terbaik" (§2.4b)`);
    // D-3: kunci "lepas satu tugas" tidak boleh selalu tugas terpanjang.
    const terpanjang = paket.soal.filter((x) => x.data.tanya === "delegasi" && (x.data.opsi[KEYS.indexOf(x.k as never)] as string[]).length === 1
      && Math.max(...x.data.tugas.map((t) => t.menit)) === x.data.tugas.find((t) => t.nama === (x.data.opsi[KEYS.indexOf(x.k as never)] as string[])[0])!.menit);
    assert.ok(terpanjang.length <= 2, `pkg ${pkg}: kunci = tugas terpanjang di ${terpanjang.length} butir (D-3)`);
    checkA7(`alokasi pkg ${pkg}`, paket);
    console.log(`OK pkg ${pkg}: ${paket.soal.length} butir alokasi · kunci ${paket.soal.map((x) => `${x.s}${x.k}`).join(" ")}`);
  }
  const drill = cekDrillStrategi();
  console.log(`OK drill K07 strategi: ${drill.length} butir · kunci ${drill.map((d) => d.x.k).join("")}`);
  cekBocor([...all, ...drill]);
  console.log(`SEMUA LOLOS · ${all.length} butir simulasi + ${drill.length} butir drill`);
}
