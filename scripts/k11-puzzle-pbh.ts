/**
 * K11 puzzle urutan: gambar pembahasan dihitung dengan brute force dari syarat soal (bukan dari teks pembahasan).
 *  - "uji" : tabel opsi × syarat (✓/✗) untuk soal "urutan mana yang memenuhi / mungkin / tidak mungkin".
 *  - "peta": papan orang × urutan; hitam = pasti, arsir = mungkin, kosong = tidak mungkin.
 */
import { El, INK, MUTED, badge, frame, line, loadBank, rect, t, tb, tm, wrapText, writeSvg } from "./pbh-svg-lib";

type Pz = { names: string[]; init: string[]; rules: { label: string; ok: (p: number[]) => boolean }[]; word: string };
// p[i] = urutan (1..n) orang ke-i
const POS: Pz = {
  names: ["Anggrek", "Bougenvil", "Cempaka", "Dahlia", "Edelweis", "Flamboyan"], init: ["A", "B", "C", "D", "E", "F"], word: "pos",
  rules: [
    { label: "D setelah|C dan E", ok: (p) => p[3] > p[2] && p[3] > p[4] },
    { label: "A sebelum E", ok: (p) => p[4] > p[0] },
    { label: "B urutan 2", ok: (p) => p[1] === 2 },
  ],
};
const PSI: Pz = {
  names: ["Ani", "Bayu", "Citra", "Dimas", "Eka", "Fajar", "Gita"], init: ["A", "B", "C", "D", "E", "F", "G"], word: "pasien",
  rules: [
    { label: "B sebelum G", ok: (p) => p[1] < p[6] },
    { label: "F sebelum A", ok: (p) => p[5] < p[0] },
    { label: "Urutan 3:|C atau E", ok: (p) => p[2] === 3 || p[4] === 3 },
    { label: "D di sebelah C", ok: (p) => Math.abs(p[3] - p[2]) === 1 },
  ],
};
const RUN: Pz = {
  names: ["1", "2", "3", "4", "5", "6"], init: ["1", "2", "3", "4", "5", "6"], word: "pelari",
  rules: [
    { label: "3 paling|akhir", ok: (p) => p[2] === 6 },
    { label: "6 sebelum 2", ok: (p) => p[5] < p[1] },
    { label: "1 sebelum 5", ok: (p) => p[0] < p[4] },
    { label: "4 di antara|2 dan 5", ok: (p) => (p[3] - p[1]) * (p[3] - p[4]) < 0 },
  ],
};

function* perms(n: number): Generator<number[]> {
  const a = Array.from({ length: n }, (_, i) => i + 1), used = new Array(n).fill(false), cur: number[] = [];
  function* rec(): Generator<number[]> {
    if (cur.length === n) { yield [...cur]; return; }
    for (let s = 0; s < n; s++) if (!used[s]) { used[s] = true; cur.push(a[s]); yield* rec(); cur.pop(); used[s] = false; }
  }
  yield* rec();
}
const solutions = (pz: Pz, extra: (p: number[]) => boolean = () => true) => [...perms(pz.names.length)].filter((p) => pz.rules.every((r) => r.ok(p)) && extra(p));

/** Ubah daftar opsi ("Bayu, Fajar, …" atau "6, 1, 2, …") menjadi p[i] = urutan orang ke-i. */
function parseSeq(pz: Pz, s: string): number[] {
  const toks = s.split(",").map((x) => x.trim()), p = new Array(pz.names.length).fill(0);
  toks.forEach((tk, k) => { const i = pz.names.indexOf(tk); if (i < 0) throw new Error(`nama ${tk} tidak dikenal`); p[i] = k + 1; });
  return p;
}
const seqInit = (pz: Pz, s: string) => s.split(",").map((x) => pz.init[pz.names.indexOf(x.trim())]).join(" ");

const mark = (ok: boolean, x: number, y: number): El[] => ok
  ? [`<path d="M${x - 6} ${y} l4 5 l8 -10" fill="none" stroke="${INK}" stroke-width="2.5"/>`]
  : [`<path d="M${x - 5} ${y - 5} l10 10 M${x + 5} ${y - 5} l-10 10" stroke="${MUTED}" stroke-width="2"/>`];

/** Tabel opsi × syarat. `keyIsBad` = soal "tidak mungkin": baris kunci yang gagal disorot. */
function ujiSvg(id: string, pz: Pz, title: string, intro: string, foot: string): string {
  const it = loadBank("K11-wacana-logika.json").find((i) => i.id === id)!;
  const letters = ["a", "b", "c", "d", "e"], key = it.kunci[0] as string;
  const cols = pz.rules.length, seqW = pz.names.length > 6 ? 150 : 130, x0 = 28, cw = Math.min(88, Math.floor((560 - seqW - 36) / cols));
  const body: El[] = [tb(16, 26, title, 16), ...wrapText(16, 46, intro, { size: 12, maxW: 580 })];
  const hy = 78;
  pz.rules.forEach((r, c) => r.label.split("|").forEach((l, k) => body.push(t(x0 + 36 + seqW + c * cw + cw / 2, hy + k * 12, l, { size: 10.5, w: 600, anchor: "middle" }))));
  body.push(line(x0, hy + 14, x0 + 36 + seqW + cols * cw, hy + 14, { sw: 1 }));
  letters.forEach((L, i) => {
    const y = hy + 24 + i * 28, p = parseSeq(pz, it.opsi[L]), res = pz.rules.map((r) => r.ok(p));
    if (L === key) body.push(rect(x0 - 10, y - 4, 36 + seqW + cols * cw + 14, 26, "url(#hatch)", { sw: 2.5 }), rect(x0 + 24, y - 1, seqW + cols * cw + 4, 20, "#fff", { sw: 0 }));
    body.push(...badge(x0 + 6, y + 9, L.toUpperCase(), 9), t(x0 + 36, y + 14, seqInit(pz, it.opsi[L]), { size: 13, w: L === key ? 700 : 400 }));
    res.forEach((ok, c) => body.push(...mark(ok, x0 + 36 + seqW + c * cw + cw / 2, y + 9)));
  });
  body.push(...wrapText(16, hy + 24 + 5 * 28 + 14, foot, { size: 12.5, w: 700, maxW: 580 }));
  return frame(`Pembahasan ${id}`, body);
}

/** Papan kemungkinan: baris = orang, kolom = urutan. */
function petaSvg(id: string, pz: Pz, extra: (p: number[]) => boolean, title: string, notes: string[], hi: number[] = [], pairs?: string): string {
  const sols = solutions(pz, extra), n = pz.names.length, cs = n > 6 ? 30 : 34, rh = n > 6 ? 24 : 27, x0 = 104, y0 = 70;
  if (!sols.length) throw new Error(`${id}: tidak ada solusi`);
  const body: El[] = [tb(16, 26, title, 16), tm(16, 44, `${sols.length} susunan memenuhi semua syarat`, 11.5)];
  for (let s = 1; s <= n; s++) body.push(tb(x0 + (s - 1) * cs + cs / 2, y0 - 8, String(s), 12, "middle"));
  pz.names.forEach((nm, i) => {
    const y = y0 + i * rh, set = new Set(sols.map((p) => p[i]));
    body.push(t(x0 - 8, y + rh / 2 + 4, nm, { size: 12.5, w: hi.includes(i) ? 700 : 400, anchor: "end" }));
    for (let s = 1; s <= n; s++) {
      const x = x0 + (s - 1) * cs, poss = set.has(s), forced = set.size === 1 && poss;
      body.push(rect(x, y, cs, rh, forced ? INK : poss ? "url(#hatch)" : "#fff", { sw: 1 }));
      if (poss && !forced) body.push(rect(x + 7, y + 5, cs - 14, rh - 10, "#fff", { sw: 0 }), t(x + cs / 2, y + rh / 2 + 4, "•", { size: 12, anchor: "middle", w: 700 }));
    }
    if (hi.includes(i)) body.push(rect(10, y - 1, x0 - 10 + n * cs + 4, rh + 2, "none", { sw: 2.5 }));
  });
  const lx = x0 + n * cs + 24;
  body.push(...wrapText(lx, y0 + 6, notes.join(" "), { size: 12.2, maxW: 616 - lx - 12, gap: 16 }));
  if (pairs) body.push(...wrapText(lx, y0 + 6 + 16 * (wrapText(0, 0, notes.join(" "), { size: 12.2, maxW: 616 - lx - 12 }).length + 1), pairs, { size: 12.2, w: 700, maxW: 616 - lx - 12, gap: 16 }));
  body.push(rect(16, 238, 14, 14, INK, { sw: 1 }), tm(36, 250, "pasti", 11), rect(80, 238, 14, 14, "url(#hatch)", { sw: 1 }), tm(100, 250, "mungkin", 11), rect(160, 238, 14, 14, "#fff", { sw: 1 }), tm(180, 250, "tidak mungkin", 11));
  return frame(`Pembahasan ${id}`, body);
}

export function generateK11Puzzle(): string[] {
  const out: string[] = [];
  const w = (id: string, svg: string) => { writeSvg(id, svg); out.push(id); };
  w("K11-B3-086", ujiSvg("K11-B3-086", POS, "Uji tiap opsi terhadap tiga syarat", "Syarat: Dahlia setelah Cempaka dan Edelweis · Anggrek sebelum Edelweis · Bougenvil urutan ke-2. Huruf = awal nama pos.", "Hanya opsi B yang lolos ketiganya."));
  w("K11-B3-087", petaSvg("K11-B3-087", POS, () => true, "Di urutan berapa tiap pos mungkin?", ["Dahlia harus didahului Cempaka, Edelweis, Anggrek (karena Anggrek sebelum Edelweis), dan Bougenvil ke-2: minimal 4 pos sebelum Dahlia. Jadi Dahlia paling cepat urutan 5, dan tidak mungkin urutan 3."], [3]));
  const pairs = [...new Set(solutions(POS, (p) => p[5] === 6).map((p) => `${POS.names[p.indexOf(1)]}–${POS.names[p.indexOf(3)]}`))];
  w("K11-B3-088", petaSvg("K11-B3-088", POS, (p) => p[5] === 6, "Jika Flamboyan paling akhir", ["Flamboyan ke-6 dan Bougenvil ke-2, sehingga Dahlia pasti ke-5. Urutan 1, 3, 4 diisi Anggrek, Cempaka, Edelweis dengan Anggrek sebelum Edelweis."], [3], `Pasangan urutan 1 dan 3 yang mungkin: ${pairs.join(", ")}.`));
  w("K11-B3-089", petaSvg("K11-B3-089", PSI, (p) => p[6] === 2 && p[0] === 5, "Jika Gita urutan 2 dan Ani urutan 5", ["Bayu harus sebelum Gita, jadi Bayu pertama. Urutan 3 harus Citra atau Eka; jika Citra, Dimas harus ke-4 dan Fajar tidak kebagian tempat sebelum Ani. Jadi Eka ke-3, Fajar ke-4, Citra dan Dimas mengisi 6–7."], [5]));
  w("K11-B3-090", ujiSvg("K11-B3-090", PSI, "Uji tiap opsi terhadap empat syarat", "Huruf = awal nama pasien. Syarat: Bayu sebelum Gita · Fajar sebelum Ani · urutan 3 = Citra atau Eka · Dimas di sebelah Citra.", "Hanya opsi A yang lolos keempatnya."));
  w("K11-A3-068", ujiSvg("K11-A3-068", RUN, "Uji tiap opsi: urutan finis yang MUNGKIN", "Syarat: pelari 3 finis paling akhir · 6 sebelum 2 · 1 sebelum 5 · 4 di antara 2 dan 5.", "Hanya opsi A yang lolos keempatnya."));
  w("K11-A3-069", ujiSvg("K11-A3-069", RUN, "Uji tiap opsi: urutan finis yang TIDAK MUNGKIN", "Syarat: pelari 3 finis paling akhir · 6 sebelum 2 · 1 sebelum 5 · 4 di antara 2 dan 5. Kunci = opsi yang gagal.", "Opsi E gagal: pelari 4 finis sebelum 2 dan 5, bukan di antaranya."));
  return out;
}
