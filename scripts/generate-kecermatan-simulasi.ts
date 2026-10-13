import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { downloadSiluet, glyphPool, makeColumn, maxAlternation, maxRun, mulberry32, shuffle } from "./generate-kecermatan-simbol";

// Paket Kecermatan Simulasi Penuh: gabungan 5 jenis latihan, semua hitam-putih.
// Aturan lengkap: docs/pedoman/PEDOMAN_SIMULASI_KECERMATAN.md. Ringkas:
// - 10 kolom = 5 jenis x 2; tiap paruh (I-V, VI-X) memuat kelima jenis dengan
//   beban kesulitan setara, supaya turunnya skor antar-paruh = ketahanan, bukan desain soal.
// - simbol tidak boleh dipakai ulang dari paket latihan (anti-bocor).
// - urutan jawaban mengikuti contoh Polri (makeColumn): A-E masing-masing 10,
//   sama berturut maks 2, selang-seling maks 4, soal kembar tidak berurutan.
//
// Pakai: npx tsx scripts/generate-kecermatan-simulasi.ts 11
// Hasil: prisma/data/bank_soal_p11.json + public/kecermatan-simulasi/p11/*.svg (+ ikon baru di public/kecermatan-siluet/)

const KEYS = ["A", "B", "C", "D", "E"] as const;
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
type Key = (typeof KEYS)[number];

// Blueprint per paket. Donor spasial = nomor paket generator spasial yang SAMA SEKALI tidak
// dipakai latihan (mode ikut rentang: <400 HOTS, 400-499 sedang, 500+ dasar kolom 1-5 mudah / 6-10 menengah).
type Kolom =
  | { jenis: "GAMBAR"; ikon: string[] }
  | { jenis: "ANGKA_HURUF"; token: string[] }
  | { jenis: "SIMBOL"; huruf: string[] }
  | { jenis: "AKSARA"; gaya: "garis" | "lengkung" | "titik" | "campur"; dasar: 0 | 1 }
  | { jenis: "SPASIAL"; donor: number; kolom: number; level: string };

const BLUEPRINT: Record<number, { nama: string; kolom: Kolom[] }> = {
  11: {
    nama: "Simulasi 1 — Campuran Hitam Putih",
    kolom: [
      // Paruh A
      { jenis: "GAMBAR", ikon: ["anchor", "key", "crown", "trophy", "lightbulb"] },
      { jenis: "ANGKA_HURUF", token: ["8B3", "B83", "38B", "3B8", "83B"] },
      { jenis: "SPASIAL", donor: 599, kolom: 6, level: "dasar menengah" },
      { jenis: "SIMBOL", huruf: ["λ", "Λ", "ψ", "Ψ", "χ"] },
      { jenis: "SPASIAL", donor: 299, kolom: 1, level: "HOTS" },
      // Paruh B
      { jenis: "GAMBAR", ikon: ["car-simple", "taxi", "police-car", "jeep", "van"] },
      { jenis: "ANGKA_HURUF", token: ["R4", "7M", "H9", "3T", "W6"] },
      { jenis: "SPASIAL", donor: 599, kolom: 1, level: "dasar mudah" },
      { jenis: "AKSARA", gaya: "campur", dasar: 0 },
      { jenis: "SPASIAL", donor: 499, kolom: 1, level: "sedang" },
    ],
  },
  12: {
    nama: "Simulasi 4 — Campuran Hitam Putih",
    kolom: [
      // Paruh A
      { jenis: "GAMBAR", ikon: ["hourglass", "compass", "feather", "gift", "puzzle-piece"] },
      { jenis: "ANGKA_HURUF", token: ["5S2", "S52", "25S", "2S5", "52S"] },
      { jenis: "SPASIAL", donor: 598, kolom: 7, level: "dasar menengah" },
      { jenis: "SIMBOL", huruf: ["θ", "Θ", "φ", "Φ", "ω"] },
      { jenis: "SPASIAL", donor: 298, kolom: 2, level: "HOTS" },
      // Paruh B
      { jenis: "GAMBAR", ikon: ["cloud-sun", "cloud-moon", "cloud-lightning", "cloud-snow", "cloud-fog"] },
      { jenis: "ANGKA_HURUF", token: ["K8", "4P", "N2", "6D", "Y3"] },
      { jenis: "SPASIAL", donor: 598, kolom: 2, level: "dasar mudah" },
      { jenis: "AKSARA", gaya: "lengkung", dasar: 1 },
      { jenis: "SPASIAL", donor: 498, kolom: 2, level: "sedang" },
    ],
  },
};

const PKG = Number(process.argv[2]);
const plan = BLUEPRINT[PKG];
if (!plan) throw new Error(`Blueprint paket ${PKG} belum ada`);
const root = fileURLToPath(new URL("..", import.meta.url));
const rand = mulberry32(PKG);
const outDir = join(root, `public/kecermatan-simulasi/p${PKG}`);
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

// Teks (angka-huruf, Yunani) digambar sebagai SVG supaya ukurannya pas di kotak kunci
// dan warnanya pasti hitam, sama seperti jenis gambar lain.
const textSvg = (text: string, size: number, weight: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="10" fill="#fff"/>` +
  `<text x="50" y="50" dominant-baseline="central" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" ` +
  `font-size="${size}" font-weight="${weight}" fill="#000">${text}</text></svg>\n`;

// Anti-bocor: kumpulan simbol semua bank latihan (+ bank simulasi lain) yang sudah ada.
const latihanSymbols = new Set<string>();
for (const id of [3, 4, 5, 6, 7, 8, 9, 10, 101, 102, 103, 104, 105, 301]) {
  const bank = JSON.parse(readFileSync(join(root, `prisma/data/bank_soal_p${id}.json`), "utf8"));
  for (const k of bank.kolom) for (const v of Object.values(k.simbol)) latihanSymbols.add(String(v));
}

const donors = new Map<number, { dir: string; bank: { kolom: { simbol: Record<Key, string> }[] } }>();
function donor(pkg: number) {
  if (!donors.has(pkg)) {
    const dir = mkdtempSync(join(tmpdir(), "kecermatan-donor-"));
    execFileSync("npx", ["tsx", join(root, "scripts/generate-kecermatan-spasial.ts"), String(pkg)], { env: { ...process.env, SPASIAL_OUT: dir } });
    donors.set(pkg, { dir, bank: JSON.parse(readFileSync(join(dir, `bank_soal_p${pkg}.json`), "utf8")) });
  }
  return donors.get(pkg)!;
}

async function symbolsFor(k: Kolom, c: number): Promise<string[]> {
  const file = (i: number) => `k${String(c + 1).padStart(2, "0")}_${i + 1}.svg`;
  const save = (svgs: string[]) => svgs.map((svg, i) => {
    writeFileSync(join(outDir, file(i)), svg);
    return `/kecermatan-simulasi/p${PKG}/${file(i)}`;
  });
  switch (k.jenis) {
    case "GAMBAR":
      await downloadSiluet(k.ikon);
      return k.ikon.map((name) => `/kecermatan-siluet/${name}.svg`);
    case "ANGKA_HURUF":
      return save(k.token.map((t) => textSvg(t, t.length > 2 ? 40 : 52, 700)));
    case "SIMBOL":
      return save(k.huruf.map((h) => textSvg(h, 72, 400)));
    case "AKSARA": {
      // glyphPool menulis 10 glyph (2 dasar x 5 varian beda 1 goresan) ke public/kecermatan-simbol/p<PKG>/;
      // satu kolom memakai 5 varian dari satu dasar (paling mirip), disalin lalu folder sementara dihapus.
      const pool = glyphPool(PKG, k.gaya, rand);
      const src = join(root, `public/kecermatan-simbol/p${PKG}`);
      const picked = pool.slice(k.dasar * 5, k.dasar * 5 + 5).map((p) => join(src, p.split("/").pop()!));
      const out = picked.map((p, i) => { copyFileSync(p, join(outDir, file(i))); return `/kecermatan-simulasi/p${PKG}/${file(i)}`; });
      rmSync(src, { recursive: true });
      return out;
    }
    case "SPASIAL": {
      const d = donor(k.donor);
      const simbol = d.bank.kolom[k.kolom - 1].simbol;
      return KEYS.map((key, i) => {
        copyFileSync(join(d.dir, `p${k.donor}`, simbol[key].split("/").pop()!), join(outDir, file(i)));
        return `/kecermatan-simulasi/p${PKG}/${file(i)}`;
      });
    }
  }
}

async function main() {
  assert.equal(plan.kolom.length, 10);
  for (const half of [plan.kolom.slice(0, 5), plan.kolom.slice(5)]) {
    const jenis = half.map((k) => (k.jenis === "AKSARA" ? "SIMBOL" : k.jenis === "SPASIAL" && k.level.startsWith("dasar") ? "SPASIAL_DASAR" : k.jenis));
    assert.deepEqual([...jenis].sort(), ["ANGKA_HURUF", "GAMBAR", "SIMBOL", "SPASIAL", "SPASIAL_DASAR"], "Tiap paruh wajib memuat kelima jenis");
  }
  const kolom = [];
  for (const [c, k] of plan.kolom.entries()) {
    const values = await symbolsFor(k, c);
    assert.equal(new Set(values).size, 5, `Kolom ${c + 1}: simbol kembar`);
    for (const v of values) assert.ok(!latihanSymbols.has(v), `Kolom ${c + 1}: ${v} sudah dipakai paket latihan`);
    const shuffled = shuffle(values, rand);
    const simbol = Object.fromEntries(KEYS.map((key, i) => [key, shuffled[i]])) as Record<Key, string>;
    const soal = makeColumn(simbol, rand);
    const kunci = soal.map((s) => s.kunci);
    assert.deepEqual(KEYS.map((key) => kunci.filter((x) => x === key).length), [10, 10, 10, 10, 10]);
    assert.ok(maxRun(kunci) <= 2 && maxAlternation(kunci) <= 4);
    const jenis = k.jenis === "SPASIAL" ? `SPASIAL ${k.level.toUpperCase()}` : k.jenis;
    kolom.push({ nomor: c + 1, roman: ROMAN[c], jenis, simbol, soal });
  }
  for (const d of donors.values()) rmSync(d.dir, { recursive: true });
  writeFileSync(join(root, `prisma/data/bank_soal_p${PKG}.json`),
    `${JSON.stringify({ nomor: PKG, nama: plan.nama, kategori: "CAMPURAN", total_soal: 500, kolom }, null, 2)}\n`);
  console.log(`Paket ${PKG}: 10 kolom, 500 soal ditulis.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
