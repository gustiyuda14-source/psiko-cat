/**
 * Gambar pembahasan K09 deret dalam lingkaran (K09-AK-001..030).
 * Kiri: gambar soal yang sama (dikecilkan) + nomor urutan baca + jawaban dilingkari. Kanan: deret ditulis lurus dengan operasi antarsuku.
 * Jalankan: npx tsx scripts/generate-k09-lingkaran-pbh.ts  → data/drill-pembahasan/K09-AK-xxx.svg + gambar_pembahasan di bank
 * Setiap operasi di spesifikasi diperiksa terhadap angka (applyOp), jadi salah ketik gagal saat dijalankan.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, El, applyOp, badge, box, circle, curve, frame, loadBank, patchBank, tb, tm, wrapText, writeSvg } from "./pbh-svg-lib";

type Single = { id: string; terms: string[]; ans: number; ops: string[]; rule: string; check: string; head?: string };
type Dual = { id: string; terms: string[]; odd: string[]; even: string[]; rule: string };
const S = (id: string, terms: string, ans: number, ops: string, rule: string, check: string, head?: string): Single => ({ id, terms: terms.split(" "), ans, ops: ops.split(" "), rule, check, head });
const D = (id: string, terms: string, odd: string, even: string, rule: string): Dual => ({ id, terms: terms.split(" "), odd: odd.split(" "), even: even.split(" "), rule });

const SINGLE: Single[] = [
  S("001", "4 6 10 16 24 ? 46 60", 5, "+2 +4 +6 +8 +10 +12 +14", "Selisih naik 2 tiap langkah: +2, +4, +6, …", "Cek: 34 + 12 = 46"),
  S("002", "2 3 5 9 ? 33 65 129", 4, "×2−1 ×2−1 ×2−1 ×2−1 ×2−1 ×2−1 ×2−1", "Tiap suku = 2 × suku sebelumnya − 1", "Cek: 17 × 2 − 1 = 33"),
  S("003", "3 8 15 24 35 ? 63 80", 5, "+5 +7 +9 +11 +13 +15 +17", "Selisih bilangan ganjil yang naik: +5, +7, +9, …", "Cek: 48 + 15 = 63"),
  S("004", "2 3 5 8 13 ? 34 55", 5, "+1 +2 +3 +5 +8 +13 +21", "Tiap suku = jumlah dua suku sebelumnya (5 + 8 = 13, 8 + 13 = 21)", "Cek: 13 + 21 = 34"),
  S("005", "1 2 5 10 13 ? 29 58", 5, "×2 +3 ×2 +3 ×2 +3 ×2", "Bergantian ×2 dan +3", "Cek: 26 + 3 = 29"),
  S("006", "1 2 6 24 ? 720", 4, "×2 ×3 ×4 ×5 ×6", "Pengali naik satu-satu: ×2, ×3, ×4, …", "Cek: 120 × 6 = 720"),
  S("007", "2 5 11 20 ? 47 65", 4, "+3 +6 +9 +12 +15 +18", "Selisih kelipatan 3: +3, +6, +9, …", "Cek: 32 + 15 = 47"),
  S("008", "2 3 5 7 11 ? 17 19", 5, "+1 +2 +2 +4 +2 +4 +2", "Bilangan prima berurutan (selisihnya tidak tetap)", "Cek: sesudah 13 → 17 → 19 (prima)"),
  S("009", "7 10 16 25 37 ?", 5, "+3 +6 +9 +12 +15", "Selisih kelipatan 3: +3, +6, +9, …", "Cek: 52 − 37 = 15", "Dibaca dari tulisan MULAI, searah jarum jam"),
  S("010", "3 4 8 17 33 ?", 5, "+1 +4 +9 +16 +25", "Selisih kuadrat berurutan: 1², 2², 3², 4², 5²", "Cek: 58 − 33 = 25 = 5²", "Dibaca dari tulisan MULAI, searah jarum jam"),
  S("011", "1 3 7 15 31 63 ? 255", 6, "×2+1 ×2+1 ×2+1 ×2+1 ×2+1 ×2+1 ×2+1", "Tiap suku = 2 × suku sebelumnya + 1", "Cek: 127 × 2 + 1 = 255", "Dibaca dari tulisan MULAI, searah jarum jam"),
  S("012", "100 95 85 70 50 ?", 5, "−5 −10 −15 −20 −25", "Pengurang naik 5: −5, −10, −15, …", "Cek: 50 − 25 = 25", "Dibaca dari tulisan MULAI, searah jarum jam"),
  S("013", "3 6 4 12 10 40 38 ?", 7, "×2 −2 ×3 −2 ×4 −2 ×5", "Berpasangan: ×2, −2, ×3, −2, ×4, −2, ×5", "Cek: 38 × 5 = 190", "Dibaca dari tulisan MULAI, searah jarum jam"),
  S("014", "2 5 10 9 12 24 23 ?", 7, "+3 ×2 −1 +3 ×2 −1 +3", "Tiga langkah berulang: +3, ×2, −1", "Cek: 23 + 3 = 26", "Dibaca dari tulisan MULAI, searah jarum jam"),
  S("015", "64 32 36 18 22 ?", 5, "÷2 +4 ÷2 +4 ÷2", "Bergantian ÷2 dan +4", "Cek: 22 ÷ 2 = 11", "Dibaca dari tulisan MULAI, searah jarum jam"),
  S("016", "3 7 15 31 63 127 ?", 6, "×2+1 ×2+1 ×2+1 ×2+1 ×2+1 ×2+1", "Tiap suku = 2 × suku sebelumnya + 1", "Cek: 127 × 2 + 1 = 255", "Dimulai dari angka di tengah, lalu searah jarum jam"),
  S("017", "1 4 9 16 25 36 ?", 6, "+3 +5 +7 +9 +11 +13", "Kuadrat berurutan: 1², 2², 3², … 7²", "Cek: 7² = 49", "Dimulai dari angka di tengah, lalu searah jarum jam"),
  S("018", "5 8 14 23 35 50 ?", 6, "+3 +6 +9 +12 +15 +18", "Selisih kelipatan 3: +3, +6, +9, …", "Cek: 50 + 18 = 68", "Dimulai dari angka di tengah, lalu searah jarum jam"),
  S("019", "2 6 12 36 72 216 ?", 6, "×3 ×2 ×3 ×2 ×3 ×2", "Pengali bergantian ×3 dan ×2", "Cek: 216 × 2 = 432", "Dimulai dari angka di tengah, lalu searah jarum jam"),
  S("020", "2 3 5 8 13 21 ?", 6, "+1 +2 +3 +5 +8 +13", "Tiap suku = jumlah dua suku sebelumnya (2 + 3 = 5, 3 + 5 = 8)", "Cek: 13 + 21 = 34", "Dimulai dari angka di tengah, lalu searah jarum jam"),
  S("021", "3 4 8 9 18 19 ?", 6, "+1 ×2 +1 ×2 +1 ×2", "Bergantian +1 dan ×2", "Cek: 19 × 2 = 38", "Dimulai dari angka di tengah, lalu searah jarum jam"),
  S("022", "10 9 11 8 12 7 ?", 6, "−1 +2 −3 +4 −5 +6", "Besar naik 1, tanda bergantian: −1, +2, −3, +4, …", "Cek: 7 + 6 = 13", "Dimulai dari angka di tengah, lalu searah jarum jam"),
  S("023", "6 7 9 13 21 37 ?", 6, "+1 +2 +4 +8 +16 +32", "Selisih dikali 2 tiap langkah: +1, +2, +4, +8, …", "Cek: 37 + 32 = 69", "Dimulai dari angka di tengah, lalu searah jarum jam"),
];
const DUAL: Dual[] = [
  D("024", "1 20 3 17 5 14 P Q", "+2 +2 +2", "−3 −3 −3", "Pisahkan posisi ganjil dan genap."),
  D("025", "2 5 4 10 8 15 P Q", "×2 ×2 ×2", "+5 +5 +5", "Pisahkan posisi ganjil dan genap."),
  D("026", "3 30 P 26 12 22 24 Q", "×2 ×2 ×2", "−4 −4 −4", "Pisahkan posisi ganjil dan genap."),
  D("027", "1 2 4 5 9 11 16 20 P Q", "+3 +5 +7 +9", "+3 +6 +9 +12", "Pisahkan posisi ganjil dan genap."),
  D("028", "81 2 27 6 P 18 3 Q", "÷3 ÷3 ÷3", "×3 ×3 ×3", "Pisahkan posisi ganjil dan genap."),
  D("029", "5 100 8 90 P 75 17 55 23 Q", "+3 +4 +5 +6", "−10 −15 −20 −25", "Pisahkan posisi ganjil dan genap."),
  D("030", "3 6 5 10 9 18 P Q", "+2 +4 +8", "+4 +8 +16", "Pisahkan posisi ganjil dan genap."),
];

type Node = { v: string; x: number; y: number };
function readQuestion(id: string): { inner: string; nodes: Node[] } {
  const s = readFileSync(join(ROOT, "public/drill/img", `${id}.svg`), "utf8");
  const nodes = [...s.matchAll(/<text x="([\d.-]+)" y="([\d.-]+)"[^>]*>([^<]*)<\/text>/g)].filter((m) => m[3] !== "MULAI").map((m) => ({ v: m[3], x: +m[1], y: +m[2] }));
  const inner = s.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "").replace(/<rect x="-40"[^>]*\/>/, "").replace(/id="ah"/g, 'id="qh"').replace(/url\(#ah\)/g, "url(#qh)");
  return { inner, nodes };
}
/** Pasangkan urutan baca (terms) dengan simpul gambar (urutan searah jarum jam dari atas) — untuk ring perlu rotasi. */
function place(terms: string[], nodes: Node[]): Node[] {
  const n = nodes.length;
  if (n !== terms.length) throw new Error(`jumlah simpul ${n} ≠ suku ${terms.length}`);
  for (let r = 0; r < n; r++) if (terms.every((tv, k) => nodes[(r + k) % n].v === tv)) return terms.map((_, k) => nodes[(r + k) % n]);
  throw new Error("urutan suku tidak cocok dengan gambar soal");
}

const SC = 0.5, OX = 6 + 40 * SC, OY = 4 + 40 * SC;
const sx = (x: number) => OX + x * SC, sy = (y: number) => OY + y * SC;
function thumb(id: string, terms: string[], ansIdx: number[]): El[] {
  const { inner, nodes } = readQuestion(id);
  const pos = place(terms, nodes), pie = !inner.includes("<circle cx=\"200.0\"") && inner.includes("<line x1=\"200\" y1=\"200\"");
  const out: El[] = [`<g transform="translate(${OX},${OY}) scale(${SC})">${inner}</g>`];
  pos.forEach((p, k) => {
    const dx = p.x - 200, dy = p.y - 200, d = Math.hypot(dx, dy);
    const bx = d < 1 ? p.x - 42 : 200 + (dx / d) * (pie ? d + 42 : d - 54), by = d < 1 ? p.y + 4 : 200 + (dy / d) * (pie ? d + 42 : d - 54);
    if (ansIdx.includes(k)) out.push(circle(sx(p.x), sy(p.y), (pie ? 26 : 38) * SC * 1.02, "none", 3.2));
    out.push(...badge(sx(bx), sy(by), k + 1, 9));
  });
  out.push(tm(OX + 200 * SC, 255, "Nomor = urutan baca", 10.5, "middle"));
  return out;
}

function singleSvg(sp: Single): string {
  const item = loadBank("K09-deret-angka-huruf.json").find((i) => i.id === `K09-AK-${sp.id}`)!;
  const key = item.opsi[item.kunci[0]] as string;
  const terms = sp.terms.map((v) => (v === "?" ? key : v));
  terms.forEach((v, k) => { if (k && applyOp(+terms[k - 1], sp.ops[k - 1]) !== +v) throw new Error(`K09-AK-${sp.id}: ${terms[k - 1]} ${sp.ops[k - 1]} ≠ ${v}`); });
  const n = terms.length, X0 = 268, AV = 340, gap = n > 7 ? 8 : 10, w = Math.min(44, Math.floor((AV - (n - 1) * gap) / n));
  const cx = (k: number) => X0 + k * (w + gap) + w / 2;
  const head = sp.head ?? `Dibaca mulai dari ${terms[0]} (sambungan putus: ${terms[n - 1]} → ${terms[0]})`;
  const body: El[] = [...thumb(`K09-AK-${sp.id}`, sp.terms, [sp.ans]), ...wrapText(X0, 28, head, { size: 13.5, w: 700, maxW: 350, gap: 17 }), ...wrapText(X0, 66, sp.rule, { size: 12.5, maxW: 350 })];
  terms.forEach((v, k) => {
    body.push(...box(cx(k) - w / 2, 126, w, 38, v, { dark: k === sp.ans, size: v.length > 3 ? 12 : 14 }));
    if (k) body.push(curve(`M${cx(k - 1)} 120 Q ${(cx(k - 1) + cx(k)) / 2} 98 ${cx(k) - 4} 120`), tb((cx(k - 1) + cx(k)) / 2, 100, sp.ops[k - 1], 10.5, "middle"));
    body.push(tm(cx(k), 180, String(k + 1), 10, "middle"));
  });
  body.push(...box(X0, 204, 130, 40, `? = ${terms[sp.ans]}`, { dark: true, size: 18 }), tm(X0 + 142, 229, sp.check, 12));
  return frame(`Pembahasan K09-AK-${sp.id}`, body);
}
function dualSvg(sp: Dual): string {
  const item = loadBank("K09-deret-angka-huruf.json").find((i) => i.id === `K09-AK-${sp.id}`)!;
  const [vp, vq] = (item.opsi[item.kunci[0]] as string).split(" dan ");
  const terms = sp.terms.map((v) => (v === "P" ? vp : v === "Q" ? vq : v));
  const tracks = [terms.filter((_, k) => k % 2 === 0), terms.filter((_, k) => k % 2 === 1)], ops = [sp.odd, sp.even];
  tracks.forEach((tr, r) => tr.forEach((v, k) => { if (k && applyOp(+tr[k - 1], ops[r][k - 1]) !== +v) throw new Error(`K09-AK-${sp.id}: track ${r} ${tr[k - 1]} ${ops[r][k - 1]} ≠ ${v}`); }));
  const X0 = 268, AV = 340, body: El[] = [...thumb(`K09-AK-${sp.id}`, sp.terms, [sp.terms.indexOf("P"), sp.terms.indexOf("Q")]), tb(X0, 28, "Dua deret berselang-seling", 13.5)];
  const names = ["Posisi ganjil (1, 3, 5, …)", "Posisi genap (2, 4, 6, …)"], blank = ["P", "Q"], vals = [vp, vq];
  tracks.forEach((tr, r) => {
    const n = tr.length, gap = 14, w = Math.min(46, Math.floor((AV - (n - 1) * gap) / n)), y = r ? 196 : 92, cx = (k: number) => X0 + k * (w + gap) + w / 2, ansIdx = sp.terms.slice(r % 2 ? 1 : 0).filter((_, k) => k % 2 === 0).findIndex((v) => v === blank[r]);
    body.push(tb(X0, y - 48, names[r], 12.5), ...box(X0 + AV - 74, y - 66, 74, 24, `${blank[r]} = ${vals[r]}`, { dark: true, size: 13, r: 5 }));
    tr.forEach((v, k) => {
      body.push(...box(cx(k) - w / 2, y, w, 36, v, { dark: k === ansIdx, size: 14 }));
      if (k) body.push(curve(`M${cx(k - 1)} ${y - 6} Q ${(cx(k - 1) + cx(k)) / 2} ${y - 26} ${cx(k) - 4} ${y - 6}`), tb((cx(k - 1) + cx(k)) / 2, y - 22, ops[r][k - 1], 10.5, "middle"));
    });
  });
  return frame(`Pembahasan K09-AK-${sp.id}`, body);
}

SINGLE.forEach((s) => writeSvg(`K09-AK-${s.id}`, singleSvg(s)));
DUAL.forEach((s) => writeSvg(`K09-AK-${s.id}`, dualSvg(s)));
const ids = new Set([...SINGLE, ...DUAL].map((s) => `K09-AK-${s.id}`));
patchBank("K09-deret-angka-huruf.json", (it) => { if (ids.has(it.id as string)) it.gambar_pembahasan = `${it.id}.svg`; });
console.log(`${ids.size} SVG K09 lingkaran`);
