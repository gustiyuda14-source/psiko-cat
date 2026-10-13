/**
 * Gambar pembahasan K16 Kecukupan Data (20 butir): tabel keputusan tiap pernyataan (cukup / tidak cukup) + alasannya.
 * Verdict tiap baris ditulis tangan dari pembahasan, lalu diperiksa terhadap teks opsi kunci (kategori jawaban) saat dijalankan.
 *   npx tsx scripts/generate-k16-pbh.ts
 */
import { El, INK, box, frame, loadBank, patchBank, rect, t, tb, wrapText, writeSvg } from "./pbh-svg-lib";

type Row = [lab: string, ok: boolean, why: string];
type Cat = "1" | "2" | "both" | "each" | "none" | "pair";
type Spec = { id: string; cat: Cat; ask: string; rows: Row[] };
const S = (id: string, cat: Cat, ask: string, ...rows: Row[]): Spec => ({ id, cat, ask, rows });

const SPECS: Spec[] = [
  S("KC1-001", "2", "Total panen Blok Selatan (kg)", ["(1) saja", false, "Jumlah pohon bisa dihitung (50), tetapi hasil tiap pohon tidak diketahui: bisa 1.000 kg, bisa 1.500 kg."], ["(2) saja", true, "Utara = 40 × 25 = 1.000 kg, jadi Selatan = 2.200 − 1.000 = 1.200 kg."]),
  S("KC1-002", "1", "Usia Raka sekarang", ["(1) saja", true, "Lima tahun lalu: 40 = 4 × (r − 5), jadi r = 15."], ["(2) saja", false, "m + r = 52 masih dua yang belum diketahui: Raka 15 atau 12 sama-sama cocok."]),
  S("KC1-003", "none", "Harga satu roti", ["(1) saja", false, "4r + 3s = 26.000: roti 5.000 dan susu 2.000, atau roti 2.000 dan susu 6.000."], ["(2) saja", false, "8r + 6s = 52.000: lagi satu persamaan dengan dua yang dicari."], ["(1) + (2)", false, "(2) ÷ 2 sama persis dengan (1): persamaan yang sama ditulis dua kali, tetap tidak cukup."]),
  S("KC1-004", "each", "Nilai x (rata-rata Regu B)", ["(1) saja", true, "Jumlah gabungan 40 × 82 = 3.280, Regu B = 3.280 − 1.920 = 1.360, x = 1.360 : 16 = 85."], ["(2) saja", true, "Jumlah Regu B 1.360 : 16 anggota = 85."]),
  S("KC1-005", "pair", "Harga beli sepeda", ["(1) saja", false, "Harga jual 1.800.000, tetapi untung atau rugi tidak diketahui."], ["(2) saja", false, "Untung 20% tanpa satu pun angka rupiah."], ["(3) saja", false, "Untung 300.000, tetapi dari harga berapa tidak diketahui."], ["pasangan", true, "(1)+(2): 1.800.000 ÷ 1,2 · (1)+(3): 1.800.000 − 300.000 · (2)+(3): 300.000 × 5. Semuanya Rp1.500.000."]),
  S("KC1-006", "1", "Apakah n ganjil? (ya/tidak)", ["(1) saja", true, "5n + 4 ganjil, 4 genap, jadi 5n ganjil, jadi n ganjil: pasti \"ya\"."], ["(2) saja", false, "Kelipatan 5: n = 5 (ganjil), n = 10 (genap): bisa ya, bisa tidak."]),
  S("KC1-007", "none", "Kotak yang paling berat", ["(1) saja", false, "P lebih berat dari Q; R bisa di atas P, di antara, atau di bawah Q."], ["(2) saja", false, "R lebih berat dari Q; kotak P tidak disebut."], ["(1) + (2)", false, "Q pasti paling ringan, tetapi P dan R tidak dibandingkan: P–R–Q dan R–P–Q sama-sama mungkin."]),
  S("KC1-008", "2", "Luas halaman (p × l)", ["(1) saja", false, "p : l = 5 : 3 cocok untuk 5 × 3 (luas 15) dan 10 × 6 (luas 60)."], ["(2) saja", true, "Keliling 48 → p + l = 24, p = 15 → l = 9, luas 135 m²."]),
  S("KC1-009", "each", "Banyak permen jeruk", ["(1) saja", true, "Peluang stroberi 0,45 → s = 36, jadi j = 80 − 36 = 44."], ["(2) saja", true, "j − s = 8 dan j + s = 80 → 2j = 88, j = 44."]),
  S("KC1-010", "both", "Apakah pendapatan N lebih besar dari M (Rp600.000)?", ["(1) saja", false, "Harga N 18.000: terjual 40 → 720.000 (ya), terjual 30 → 540.000 (tidak)."], ["(2) saja", false, "Terjual 32: harga 20.000 → 640.000 (ya), harga 15.000 → 480.000 (tidak)."], ["(1) + (2)", true, "18.000 × 32 = 576.000 < 600.000: pasti \"tidak\"."]),
  S("KC2-001", "1", "Penumpang saat berangkat", ["(1) saja", true, "x − 12 + 7 = 45 → x = 50."], ["(2) saja", false, "\"Berkurang 5\" sudah diketahui dari soal: berangkat 30 atau 60 orang sama-sama cocok."]),
  S("KC2-002", "2", "Waktu kolam penuh (pipa P dan Q bersama)", ["(1) saja", false, "P saja 8 jam, Q tidak diketahui: bersama bisa 4 jam atau 6 jam."], ["(2) saja", true, "Sepertiga kolam dalam 2 jam → penuh dalam 3 × 2 = 6 jam."]),
  S("KC2-003", "both", "Perenang yang finis ketiga", ["(1) saja", false, "Kirana tepat di depan Laras, Mega bukan juara 1: ketiga bisa Mega, Laras, atau Nadia."], ["(2) saja", false, "Nadia keempat, Laras di depan Mega: ketiga bisa Mega atau Kirana."], ["(1) + (2)", true, "Nadia terakhir + Kirana tepat di depan Laras + Laras di depan Mega → Kirana–Laras–Mega: ketiga pasti Mega."]),
  S("KC2-004", "1", "Apakah harga setelah turun > harga awal? (ya/tidak)", ["(1) saja", true, "Naik x% lalu turun x% selalu lebih murah (100 → 125 → 93,75): pasti \"tidak\"."], ["(2) saja", false, "Naik 25%: turun 10% → 112,5 (ya), turun 30% → 87,5 (tidak)."]),
  S("KC2-005", "2", "Apakah rata-rata > 80? (sama dengan n > 80?)", ["(1) saja", false, "n > 75: n = 76 → rata-rata 79,2 (tidak), n = 90 → 82 (ya)."], ["(2) saja", true, "Ada nilai 95 dan tak ada yang lebih tinggi dari n → n ≥ 95 → rata-rata ≥ 83: pasti \"ya\"."]),
  S("KC2-006", "each", "Sisa botol (n dibagi 8)", ["(1) saja", true, "n bersisa 7 dibagi 16 → bersisa 7 dibagi 8 (16 = 2 × 8): 7."], ["(2) saja", true, "n + 1 habis dibagi 8 → n bersisa 7."]),
  S("KC2-007", "none", "Apakah putri lebih banyak dari putra? (ya/tidak)", ["(1) saja", false, "Hanya membahas putri; tentang putra tidak ada informasi."], ["(2) saja", false, "Peserta tari putri dan putra sama banyak, tetapi bagian yang ikut tidak diketahui."], ["(1) + (2)", false, "Putri 10 → 4 ikut tari; putra bisa 8 (ya) atau 20 (tidak)."]),
  S("KC2-008", "both", "Luas halaman (p × l)", ["(1) saja", false, "p² + l² = 169: 5 × 12 (luas 60) atau persegi sisi ≈ 9,19 (luas ≈ 84,5)."], ["(2) saja", false, "p + l = 17: 5 × 12 (luas 60) atau 8 × 9 (luas 72)."], ["(1) + (2)", true, "17² = 169 + 2pl → pl = 60: luas 60 m²."]),
  S("KC2-009", "each", "Banyak kotak kecil (4k + 9b = 62)", ["(1) saja", true, "Hanya 11 kecil + 2 besar atau 2 kecil + 6 besar; total 13 kotak → 11 kecil."], ["(2) saja", true, "Kecil lebih banyak: 11 > 2 cocok, 2 > 6 tidak → 11 kecil."]),
  S("KC2-010", "none", "Apakah a lebih kecil dari b? (ya/tidak)", ["(1) saja", false, "a² < b²: a = 2, b = 5 (ya); a = 2, b = −5 (tidak)."], ["(2) saja", false, "a positif: b = 5 (ya), b = 1 (tidak)."], ["(1) + (2)", false, "a = 2 dengan b = 5 (ya) atau b = −5 (tidak): masih bisa dua-duanya."]),
];
const SUM: Record<Cat, string> = { "1": "Hanya pernyataan (1) yang cukup", "2": "Hanya pernyataan (2) yang cukup", both: "Cukup hanya jika (1) dan (2) digabung", each: "(1) saja cukup dan (2) saja cukup", none: "Digabung pun tetap tidak cukup", pair: "Dua pernyataan mana pun, bila dipasangkan, cukup" };

/** Cek kategori jawaban terhadap teks opsi kunci (kata kunci umum di bank K16). */
function catOf(text: string): Cat {
  const x = text.toLowerCase();
  if (/tidak cukup.*bersama|bersama-sama pun|digabung pun|gabungan kedua fakta|tetap tidak dapat dipastikan/.test(x) || x.includes("masih diperlukan data lain")) return "none";
  if (/dua pernyataan mana pun/.test(x)) return "pair";
  if (/bersama-sama cukup|dipakai bersama|digabungkan|bersama\./.test(x) && !/pun/.test(x)) return "both";
  if (/(1)[^.]*(2)[^.]*(maupun|dan pernyataan \(2\) saja|juga cukup|pula|sendiri maupun)/.test(x) || /maupun|saja juga cukup|terjawab pula/.test(x) || /cukup dan pernyataan \(2\) saja cukup/.test(x)) return "each";
  if (/pernyataan \(2\) saja cukup|\(2\) saja,|keterangan \(2\)|data \(2\) saja/.test(x) && !/\(1\) saja sudah cukup|\(1\) saja cukup/.test(x.split("tetapi")[0])) return "2";
  return "1";
}

function build(sp: Spec): string {
  const item = loadBank("K16-kecukupan-data.json").find((i) => i.id === `K16-${sp.id}`)!, key = item.kunci[0] as string;
  const tag = ((item.stem as string).match(/\n(Pernyataan|Keterangan|Petunjuk|Data|Fakta|Informasi) \(1\)/) ?? [])[1] ?? "Pernyataan";
  const body: El[] = [tb(16, 24, "Yang ditanya:", 12.5), ...wrapText(106, 24, sp.ask, { size: 13, w: 700, maxW: 490, gap: 16 })];
  let y = 42;
  sp.rows.forEach(([lab, ok, why]) => {
    const lines = wrapText(0, 0, why, { size: 12, maxW: 366 }).length, h = Math.max(34, lines * 15 + 14);
    body.push(rect(16, y, 84, h, "#fff", { r: 6 }), tb(58, y + h / 2 + 4, lab.replace("saja", tag === "Pernyataan" ? "saja" : "saja"), 12, "middle"),
      ...box(108, y + h / 2 - 13, 112, 26, ok ? "CUKUP ✓" : "TIDAK CUKUP ✗", { dark: ok, size: 11, r: 13 }), ...wrapText(232, y + h / 2 - (lines - 1) * 7.5 + 4, why, { size: 12, maxW: 366, gap: 15 }));
    y += h + 6;
  });
  const cat = sp.cat, shown = catOf(item.opsi[key] as string);
  if (shown !== cat) console.warn(`  periksa ${sp.id}: kategori manual ${cat}, dari opsi kunci ${shown}`);
  body.push(rect(16, Math.min(y + 2, 232), 584, 24, INK, { r: 6 }), t(308, Math.min(y + 2, 232) + 16.5, `Jawaban: Opsi ${key.toUpperCase()} — ${SUM[cat]}`, { size: 12.5, w: 700, anchor: "middle", fill: "#fff" }));
  if (Math.min(y + 2, 232) + 24 > 258) throw new Error(`${sp.id}: tinggi melebihi bingkai`);
  return frame(`Pembahasan K16-${sp.id}`, body);
}

SPECS.forEach((sp) => writeSvg(`K16-${sp.id}`, build(sp)));
const ids = new Set(SPECS.map((s) => `K16-${s.id}`));
patchBank("K16-kecukupan-data.json", (it) => { if (ids.has(it.id as string)) it.gambar_pembahasan = `${it.id}.svg`; });
if (ids.size !== 20) throw new Error(`jumlah ${ids.size} ≠ 20`);
console.log(`${ids.size} SVG K16`);
