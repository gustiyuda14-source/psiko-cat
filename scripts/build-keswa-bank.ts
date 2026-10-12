/**
 * Build bank simulasi Keswa dari teks (bank/keswa/<paket>/*.txt) ke data/keswa-bank.json.
 *
 *   npx tsx scripts/build-keswa-bank.ts           # validasi + tulis
 *   npx tsx scripts/build-keswa-bank.ts --check   # validasi saja
 *
 * Format baris (baris kosong dan "#..." diabaikan):
 *   Aku suka ...                 soal umum
 *   S:T | Kadang aku ...         sok sempurna; jawaban T = menyangkal kekurangan wajar
 *   S:Y | Aku tidak pernah ...   sok sempurna; jawaban Y = menyangkal
 *   A:T | Aku pernah lelah ...   acak; jawaban T = menyimpang dari jawaban hampir semua orang
 *   A:Y | Aku bisa terbang ...   acak; jawaban Y = menyimpang
 *   K= | Aku ...                 konsistensi; kalimat sama muncul dua kali
 *   K~ | Aku ... | Aku ...       konsistensi; dua kalimat berlawanan
 * Urutan soal diacak dengan seed tetap per paket (hasil build stabil); anggota pasangan berjarak >= 100 nomor.
 * Gagal satu aturan = exit 1 dan tidak ada file yang ditulis.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { KESWA_TOTAL, type Jawab, type KeswaKunci } from "../lib/keswa-scoring";

const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "bank/keswa");
const OUT = join(ROOT, "data/keswa-bank.json");
const PAKET = ["1", "2"];
const UKURAN = { sok: 15, acak: 15, sama: 10, lawan: 10 };
const JARAK_MIN = 100;

type Unit =
  | { k: "U"; t: string }
  | { k: "S" | "A"; t: string; j: Jawab }
  | { k: "K="; t: string }
  | { k: "K~"; t: string; t2: string };

const errors: string[] = [];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function parse(paket: string): Unit[] {
  const dir = join(SRC, paket);
  const units: Unit[] = [];
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".txt")).sort()) {
    readFileSync(join(dir, f), "utf8").split("\n").forEach((raw, n) => {
      const line = raw.trim();
      if (!line || line.startsWith("#")) return;
      const where = `${paket}/${f}:${n + 1}`;
      const m = line.match(/^(S:[YT]|A:[YT]|K=|K~) \| (.+)$/);
      const texts = m ? m[2].split(" | ") : [line];
      for (const t of texts) {
        if (!/[.)]$/.test(t)) errors.push(`${where}: harus diakhiri titik`);
        if (t.length > 220) errors.push(`${where}: terlalu panjang`);
        if (t.includes("|")) errors.push(`${where}: tag tidak dikenal`);
      }
      if (!m) return void units.push({ k: "U", t: line });
      const tag = m[1];
      if (tag === "K~") {
        if (texts.length !== 2) return void errors.push(`${where}: K~ butuh dua kalimat`);
        units.push({ k: "K~", t: texts[0], t2: texts[1] });
      } else if (texts.length !== 1) errors.push(`${where}: satu kalimat saja`);
      else if (tag === "K=") units.push({ k: "K=", t: texts[0] });
      else units.push({ k: tag[0] as "S" | "A", t: texts[0], j: tag[2] as Jawab });
    });
  }
  return units;
}

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Slot = { t: string; ref: number; peran: "U" | "S" | "A" | "a" | "b"; j?: Jawab };

function susun(paket: string, units: Unit[]) {
  const slots: Slot[] = [];
  units.forEach((u, ref) => {
    if (u.k === "U") slots.push({ t: u.t, ref, peran: "U" });
    else if (u.k === "S" || u.k === "A") slots.push({ t: u.t, ref, peran: u.k, j: u.j });
    else {
      slots.push({ t: u.t, ref, peran: "a" });
      slots.push({ t: u.k === "K~" ? u.t2 : u.t, ref, peran: "b" });
    }
  });

  for (let attempt = 0; attempt < 200000; attempt++) {
    const r = rng(Number(paket) * 1_000_003 + attempt);
    const order = [...slots];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    const pos = new Map<string, number>();
    order.forEach((s, i) => s.peran === "a" || s.peran === "b" ? pos.set(`${s.ref}${s.peran}`, i) : null);
    const ok = units.every((u, ref) => (u.k !== "K=" && u.k !== "K~") || Math.abs(pos.get(`${ref}a`)! - pos.get(`${ref}b`)!) >= JARAK_MIN);
    if (!ok) continue;

    const kunci: KeswaKunci = { sok: [], acak: [], sama: [], lawan: [] };
    order.forEach((s, i) => {
      if (s.peran === "S") kunci.sok.push([i, s.j!]);
      if (s.peran === "A") kunci.acak.push([i, s.j!]);
    });
    units.forEach((u, ref) => {
      const pair: [number, number] = [pos.get(`${ref}a`)!, pos.get(`${ref}b`)!];
      if (u.k === "K=") kunci.sama.push(pair);
      if (u.k === "K~") kunci.lawan.push(pair);
    });
    return { soal: order.map((s) => s.t), kunci };
  }
  errors.push(`${paket}: gagal menyusun urutan dengan jarak pasangan >= ${JARAK_MIN}`);
  return null;
}

const out: Record<string, ReturnType<typeof susun>> = {};
const seenAll = new Map<string, string>();
for (const paket of PAKET) {
  const units = parse(paket);
  const count = (k: Unit["k"]) => units.filter((u) => u.k === k).length;
  const actual = { sok: count("S"), acak: count("A"), sama: count("K="), lawan: count("K~") };
  for (const key of Object.keys(UKURAN) as (keyof typeof UKURAN)[])
    if (actual[key] !== UKURAN[key]) errors.push(`${paket}: kelompok ${key} = ${actual[key]}, harus ${UKURAN[key]}`);
  const total = units.reduce((n, u) => n + (u.k === "K=" || u.k === "K~" ? 2 : 1), 0);
  if (total !== KESWA_TOTAL) errors.push(`${paket}: total ${total} soal, harus ${KESWA_TOTAL}`);

  // Kalimat kembar yang tidak disengaja, di dalam paket maupun antar paket.
  for (const u of units)
    for (const t of u.k === "K~" ? [u.t, u.t2] : [u.t]) {
      const key = norm(t);
      const prev = seenAll.get(key);
      if (prev) errors.push(`kalimat kembar (paket ${prev} & ${paket}): ${t}`);
      else seenAll.set(key, paket);
    }

  const for1 = (u: Unit) => (u.k === "S" || u.k === "A" ? u.j : null);
  const ya = units.filter((u) => for1(u) === "Y").length;
  console.log(`paket ${paket}: ${total} soal, umum ${count("U")}, S ${actual.sok}, A ${actual.acak}, K= ${actual.sama}, K~ ${actual.lawan} (S/A arah Y ${ya})`);
  out[paket] = susun(paket, units);
}

if (errors.length) {
  console.error(errors.slice(0, 50).join("\n"));
  console.error(`${errors.length} masalah`);
  process.exit(1);
}
if (!process.argv.includes("--check")) {
  writeFileSync(OUT, JSON.stringify(out) + "\n");
  console.log(`tulis ${OUT}`);
}
