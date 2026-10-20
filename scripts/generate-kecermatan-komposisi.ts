import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { makeColumn, maxAlternation, maxRun, mulberry32, shuffle } from "./generate-kecermatan-simbol";

// Generator Kecermatan latihan aspek "Simbol Komposisi Majemuk" (tab "Komposisi
// Majemuk"), usulan peserta 2026-10-20 (sketsa "Kolom 1"), prototipe disetujui
// pemilik. 5 paket (801-805), 10 kolom x 50 butir.
// - Tiap gambar = 1 bentuk utama besar + 1 hiasan pojok + segitiga hitam kecil
//   di pojok + 1-2 tanda kecil, di grid 3x3 dalam bingkai. Hiasan dan tanda kecil
//   diambil dari kolam bersama per kolom, jadi elemen yang sama muncul di beberapa
//   gambar; yang membedakan adalah bentuk utama.
// - Kesulitan naik dari kolom I ke X, jadwalnya SAMA di kelima paket (TINGKAT);
//   paket hanya beda isi (seed = nomor paket). Puncaknya "agak sulit": bentuk
//   utama dari 2 keluarga, beda isi (hitam/putih/abu/arsir) atau arah, tidak ada
//   beda detail kecil.
// - Urutan jawaban: makeColumn dari generate-kecermatan-simbol.ts (pedoman §4).
//
// Pakai: npx tsx scripts/generate-kecermatan-komposisi.ts [dir-lembar-review]
// Hasil: public/kecermatan-komposisi/p80x/kNN_A.svg …, prisma/data/bank_soal_p80x.json,
//        label baru di data/kecermatan-pelafalan.json, lembar review (bila dir diberi).

const KEYS = ["A", "B", "C", "D", "E"] as const;
type Key = (typeof KEYS)[number];
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const PAKET = [801, 802, 803, 804, 805];
const root = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url));

const FILL = { k: "#000", w: "#fff", g: "#9a9a9a" } as const;
type Fill = keyof typeof FILL;
const S = 'stroke="#000" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"';
const r1 = (n: number) => Math.round(n * 10) / 10;
const pts = (p: [number, number][]) => p.map(([x, y]) => `${r1(x)},${r1(y)}`).join(" ");
type R = () => number;
const pick = <T,>(r: R, xs: T[]) => xs[Math.floor(r() * xs.length)];
const at = (x: number, y: number, body: string, deg = 0) =>
  `<g transform="translate(${r1(x)} ${r1(y)})${deg ? ` rotate(${deg})` : ""}">${body}</g>`;

// ---- Grid: pojok 0 TL, 1 TR, 2 BR, 3 BL ----
const C = [20.7, 50, 79.3];
const CORNER_CELL: [number, number][] = [[0, 0], [2, 0], [2, 2], [0, 2]];
const CORNER_PT: [number, number, number, number][] = [[5.5, 5.5, 1, 1], [94.5, 5.5, -1, 1], [94.5, 94.5, -1, -1], [5.5, 94.5, 1, -1]];
const BLOCK_CENTER: [number, number][] = [[35.4, 35.4], [64.6, 35.4], [64.6, 64.6], [35.4, 64.6]];
const blockCells = (k: number) => {
  const [cc, rr] = CORNER_CELL[k];
  const cs = cc === 0 ? [0, 1] : [1, 2], rs = rr === 0 ? [0, 1] : [1, 2];
  return cs.flatMap((c) => rs.map((r) => `${c},${r}`));
};

// ---- Hiasan pojok (menempel di sudut bingkai) ----
const wedge = (k: number) => {
  const [x, y, sx, sy] = CORNER_PT[k];
  return `<polygon points="${pts([[x, y], [x + sx * 14, y], [x, y + sy * 14]])}" fill="#000"/>`;
};
const DECO: Record<string, (k: number) => string> = {
  arsir: (k) => {
    const [x, y, sx, sy] = CORNER_PT[k];
    return [9, 15, 21, 27].map((d) =>
      `<line x1="${r1(x + sx * d)}" y1="${y}" x2="${x}" y2="${r1(y + sy * d)}" stroke="#000" stroke-width="2.4" stroke-linecap="round"/>`).join("");
  },
  gelombang: (k) => {
    const [x, y, sx, sy] = CORNER_PT[k];
    const p: [number, number][] = [];
    for (let i = 0; i <= 24; i++) {
      const t = (i / 24) * (Math.PI / 2), rad = 27 + 3.2 * Math.sin(t * 6);
      p.push([x + sx * rad * Math.cos(t), y + sy * rad * Math.sin(t)]);
    }
    return `<polyline points="${pts(p)}" fill="none" ${S}/>`;
  },
  busur: (k) => {
    const [x, y, sx, sy] = CORNER_PT[k];
    const sw = sx * sy > 0 ? 1 : 0;
    return [13, 22].map((rad) =>
      `<path d="M${r1(x + sx * rad)} ${y} A${rad} ${rad} 0 0 ${sw} ${x} ${r1(y + sy * rad)}" fill="none" ${S}/>`).join("");
  },
  tangga: (k) => {
    const [x, y, sx, sy] = CORNER_PT[k];
    const p: [number, number][] = [[x, y], [x + sx * 26, y], [x + sx * 26, y + sy * 8], [x + sx * 17, y + sy * 8],
      [x + sx * 17, y + sy * 17], [x + sx * 8, y + sy * 17], [x + sx * 8, y + sy * 26], [x, y + sy * 26]];
    return `<polygon points="${pts(p)}" fill="${FILL.g}" ${S}/>`;
  },
};

// ---- Tanda kecil (di tengah sel, ±11) ----
const head = (x: number, y: number, deg: number) =>
  at(x, y, `<polygon points="0,0 -5,-3.6 -5,3.6" fill="#000" stroke="#000" stroke-width="1.2" stroke-linejoin="round"/>`, deg);
const dblArrow = (len: number) =>
  `<line x1="${-len / 2 + 3}" y1="0" x2="${len / 2 - 3}" y2="0" stroke="#000" stroke-width="2.2"/>` +
  head(len / 2, 0, 0) + head(-len / 2, 0, 180);
const MARK: Record<string, (r: R) => string> = {
  panah: (r) => at(0, 0, `<line x1="-10" y1="0" x2="6" y2="0" stroke="#000" stroke-width="2.4"/>` + head(11, 0, 0), pick(r, [0, 90, 180, 270, 45, 225])),
  panahGanda: () => at(0, -4.5, dblArrow(22)) + at(0, 4.5, dblArrow(22)),
  sumbu: (r) => at(0, 0, `<path d="M-9 9 V-6 M-9 9 H6" fill="none" stroke="#000" stroke-width="2.4"/>` + head(-9, -11, -90) + head(11, 9, 0), pick(r, [0, 90])),
  daun: (r) => at(0, 0,
    `<ellipse cx="-5.5" cy="0" rx="3.6" ry="8" fill="#000" transform="rotate(20 -5.5 0)"/>` +
    `<ellipse cx="5.5" cy="1" rx="3.6" ry="8" fill="#fff" ${S} transform="rotate(20 5.5 1)"/>`, pick(r, [0, 90])),
  lengkung: () => `<path d="M-11 5 v-4 a3.7 3.7 0 0 1 7.4 0 v4 M-3.6 5 v-4 a3.7 3.7 0 0 1 7.4 0 v4 M3.8 5 v-4 a3.7 3.7 0 0 1 7.4 0 v4" fill="none" ${S}/>`,
  titik: () => [[0, -6], [-6.5, 5], [6.5, 5]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="#000"/>`).join(""),
  kotak: () => `<rect x="-7" y="-7" width="14" height="14" fill="#fff" ${S}/><circle cx="0" cy="0" r="2.6" fill="#000"/>`,
};

// ---- Bentuk utama (pusat 0,0, jangkauan ≤ 22). Tiap keluarga 3 varian yang
// beda isi atau arah (tidak ada beda detail kecil), plus label pelafalan. ----
const hatchClip = (shape: string, deg: number) =>
  `<clipPath id="h"><${shape}/></clipPath><${shape} fill="#fff"/>` +
  `<g clip-path="url(#h)" transform="rotate(${deg})">${[-21, -14, -7, 0, 7, 14, 21]
    .map((v) => `<line x1="-30" y1="${v}" x2="30" y2="${v}" stroke="#000" stroke-width="2.2"/>`).join("")}</g>` +
  `<${shape} fill="none" ${S}/>`;
const KGW: Fill[] = ["k", "w", "g"];
const MAIN: Record<string, { label: [string, string, string]; draw: (v: number) => string }> = {
  oval: {
    label: ["oval arsir", "oval hitam", "oval abu"],
    draw: (v) => {
      const e = `ellipse cx="0" cy="0" rx="12.5" ry="20.5" transform="rotate(32)"`;
      return v === 0 ? hatchClip(e, -30) : `<${e} fill="${FILL[v === 1 ? "k" : "g"]}" ${S}/>`;
    },
  },
  kristal: {
    label: ["kristal hitam", "kristal putih", "kristal abu"],
    draw: (v) => `<polygon points="0,-22 8,-11 8,11 0,22 -8,11 -8,-11" fill="${FILL[KGW[v]]}" ${S}/>` +
      (v === 1 ? `<line x1="0" y1="-22" x2="0" y2="22" stroke="#000" stroke-width="2"/>` : ""),
  },
  kurung: {
    label: ["kurung kanan", "kurung kiri", "kurung abu"],
    draw: (v) => at(0, 0, v === 2
      ? `<path d="M-6 -20 Q24 0 -6 20" fill="none" stroke="#000" stroke-width="10" stroke-linecap="round"/>` +
        `<path d="M-6 -20 Q24 0 -6 20" fill="none" stroke="${FILL.g}" stroke-width="5.5" stroke-linecap="round"/>`
      : `<path d="M-6 -20 Q24 0 -6 20" fill="none" stroke="#000" stroke-width="7" stroke-linecap="round"/>`, v === 1 ? 180 : 0),
  },
  palang: {
    label: ["tiga palang", "dua palang", "palang pendek"],
    draw: (v) => {
      const bars = v === 1 ? [[-8, 40], [8, 40]] : [[-14, 40], [0, v === 2 ? 20 : 40], [14, 40]];
      return bars.map(([y, w]) => `<rect x="-20" y="${y - 3.5}" width="${w}" height="7" fill="#000"/>`).join("");
    },
  },
  sabit: {
    label: ["sabit kanan", "sabit kiri", "sabit atas"],
    draw: (v) => at(0, 0, `<circle cx="0" cy="0" r="20" fill="#000"/><circle cx="9" cy="-3" r="16" fill="#fff"/>`, [0, 180, -90][v]),
  },
  tetes: {
    label: ["tetes atas", "tetes bawah", "tetes hitam"],
    draw: (v) => at(0, 0, `<path d="M0 -22 C10 -8 15 2 15 8 A15 15 0 0 1 -15 8 C-15 2 -10 -8 0 -22 Z" fill="${FILL[v === 2 ? "k" : "g"]}" ${S}/>`, v === 1 ? 180 : 0),
  },
  kipas: {
    label: ["kipas hitam", "kipas jari", "kipas abu"],
    draw: (v) => {
      const spokes = v === 1 ? [30, 60].map((a) => {
        const t = (a * Math.PI) / 180;
        return `<line x1="-14" y1="14" x2="${r1(-14 + 34 * Math.cos(t))}" y2="${r1(14 - 34 * Math.sin(t))}" stroke="#000" stroke-width="2.2"/>`;
      }).join("") : "";
      return `<path d="M-14 14 L20 14 A34 34 0 0 0 -14 -20 Z" fill="${FILL[KGW[v]]}" ${S}/>${spokes}`;
    },
  },
  zigzag: {
    label: ["zigzag", "zigzag tegak", "zigzag abu"],
    draw: (v) => {
      const p: [number, number][] = [];
      for (let i = 0; i <= 6; i++) p.push([-20 + (40 / 6) * i, i % 2 ? -9 : 9]);
      const line = (c: string, w: number) => `<polyline points="${pts(p)}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="miter"/>`;
      return at(0, 0, v === 2 ? line("#000", 9) + line(FILL.g, 4.5) : line("#000", 6), v === 1 ? 90 : 0);
    },
  },
  cincin: {
    label: ["cincin titik", "cincin kosong", "cincin abu"],
    draw: (v) => `<circle cx="0" cy="0" r="17" fill="#fff" stroke="#000" stroke-width="6.5"/>` +
      (v === 0 ? `<circle cx="0" cy="0" r="5.5" fill="#000"/>` : v === 2 ? `<circle cx="0" cy="0" r="13.8" fill="${FILL.g}"/>` : ""),
  },
  segienam: {
    label: ["segi enam hitam", "segi enam titik", "segi enam abu"],
    draw: (v) => `<polygon points="0,-19 17,-9 15,11 0,20 -16,10 -17,-8" fill="${FILL[v === 1 ? "w" : v === 2 ? "g" : "k"]}" ${S}/>` +
      (v === 1 ? `<circle cx="0" cy="0" r="5" fill="#000"/>` : ""),
  },
};

// Jadwal kesulitan per kolom, sama untuk semua paket.
//   grup  = jumlah gambar per keluarga bentuk utama (5 keluarga = semua beda jenis)
//   tanda = tanda kecil per gambar; posSama = anggota satu keluarga di posisi sama
const TINGKAT: { nama: string; grup: number[]; tanda: number; posSama: boolean }[] = [
  { nama: "mudah", grup: [1, 1, 1, 1, 1], tanda: 1, posSama: false },
  { nama: "mudah", grup: [1, 1, 1, 1, 1], tanda: 1, posSama: false },
  { nama: "mudah+", grup: [1, 1, 1, 1, 1], tanda: 2, posSama: false },
  { nama: "mudah+", grup: [1, 1, 1, 1, 1], tanda: 2, posSama: false },
  { nama: "sedang", grup: [2, 1, 1, 1], tanda: 2, posSama: false },
  { nama: "sedang", grup: [2, 1, 1, 1], tanda: 2, posSama: true },
  { nama: "sedang+", grup: [2, 2, 1], tanda: 2, posSama: false },
  { nama: "sedang+", grup: [2, 2, 1], tanda: 2, posSama: true },
  { nama: "agak sulit", grup: [3, 2], tanda: 2, posSama: false },
  { nama: "agak sulit", grup: [3, 2], tanda: 2, posSama: true },
];

type Fig = { fam: string; v: number; svg: string };

function figure(r: R, fam: string, v: number, pos: number, deco: string, marks: string[], withWedge: boolean): string {
  const free = ["0,0", "1,0", "2,0", "0,1", "1,1", "2,1", "0,2", "1,2", "2,2"].filter((c) => !blockCells(pos).includes(c));
  const decoK = pick(r, [0, 1, 2, 3].filter((k) => k !== pos));
  const wedgeK = pick(r, [0, 1, 2, 3].filter((k) => k !== decoK));
  const busy = new Set([CORNER_CELL[decoK].join(","), ...(withWedge ? [CORNER_CELL[wedgeK].join(",")] : [])]);
  const cells = shuffle(free.filter((c) => !busy.has(c)), r).slice(0, marks.length);
  const [bx, by] = BLOCK_CENTER[pos];
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">`,
    `<rect x="4" y="4" width="92" height="92" fill="#fff" stroke="#000" stroke-width="3"/>`,
    DECO[deco](decoK),
    withWedge ? wedge(wedgeK) : "",
    at(bx, by, MAIN[fam].draw(v)),
    ...cells.map((c, i) => {
      const [cc, rr] = c.split(",").map(Number);
      return at(C[cc], C[rr], MARK[marks[i]](r));
    }),
    `</svg>`,
    "",
  ].join("\n");
}

function kolom(r: R, c: number, usage: Map<string, number>): Fig[] {
  const t = TINGKAT[c];
  // Keluarga yang paling jarang dipakai di paket ini didahulukan (variasi antar kolom).
  const fams = shuffle(Object.keys(MAIN), r).sort((a, b) => usage.get(a)! - usage.get(b)!).slice(0, t.grup.length);
  const decoPool = shuffle(Object.keys(DECO), r).slice(0, 2);
  const markPool = shuffle(Object.keys(MARK), r).slice(0, 4);
  const famPos = shuffle([0, 1, 2, 3], r);
  const noWedge = Math.floor(r() * 5);
  const figs: Fig[] = [];
  t.grup.forEach((n, g) => {
    usage.set(fams[g], usage.get(fams[g])! + 1);
    shuffle([0, 1, 2], r).slice(0, n).forEach((v) => {
      const i = figs.length;
      const pos = t.posSama ? famPos[g % 4] : pick(r, [0, 1, 2, 3]);
      const marks = shuffle(markPool, r).slice(0, t.tanda);
      figs.push({ fam: fams[g], v, svg: figure(r, fams[g], v, pos, pick(r, decoPool), marks, i !== noWedge) });
    });
  });
  return shuffle(figs, r);
}

const pathOf = (nomor: number, c: number, k: Key) => `/kecermatan-komposisi/p${nomor}/k${String(c + 1).padStart(2, "0")}_${k}.svg`;

function makeBank(nomor: number, index: number, pelafalan: Record<string, string>) {
  const rand = mulberry32(nomor);
  const dir = root(`public/kecermatan-komposisi/p${nomor}`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const usage = new Map(Object.keys(MAIN).map((f) => [f, 0]));
  return {
    nomor,
    nama: `Paket Komposisi Majemuk ${index + 1}`,
    kategori: "KOMPOSISI_MAJEMUK",
    total_soal: 500,
    kolom: ROMAN.map((roman, c) => {
      const figs = kolom(rand, c, usage);
      const simbol = Object.fromEntries(KEYS.map((k) => [k, pathOf(nomor, c, k)])) as Record<Key, string>;
      KEYS.forEach((k, i) => {
        writeFileSync(root(`public${simbol[k]}`), figs[i].svg);
        pelafalan[simbol[k]] = MAIN[figs[i].fam].label[figs[i].v];
      });
      return { nomor: c + 1, roman, tingkat: TINGKAT[c].nama, simbol, soal: makeColumn(simbol, rand) };
    }),
  };
}

// Self-check: baca ulang 5 JSON + SVG dari disk.
function verify(pelafalan: Record<string, string>) {
  const sums = new Set<string>();
  const svgs = new Set<string>();
  for (const nomor of PAKET) {
    const raw = readFileSync(root(`prisma/data/bank_soal_p${nomor}.json`), "utf8");
    sums.add(createHash("sha256").update(raw).digest("hex"));
    const bank = JSON.parse(raw);
    assert.equal(bank.kategori, "KOMPOSISI_MAJEMUK");
    assert.equal(bank.kolom.length, 10, `p${nomor}: harus 10 kolom`);
    let butir = 0;
    bank.kolom.forEach((kolom: { simbol: Record<Key, string>; soal: { shown: string[]; kunci: Key }[] }, c: number) => {
      const vals = Object.values(kolom.simbol);
      const body = vals.map((v) => readFileSync(root(`public${v}`), "utf8"));
      assert.equal(new Set(body).size, 5, `p${nomor} kolom ${c + 1}: gambar kembar`);
      body.forEach((b) => svgs.add(b));
      assert.equal(new Set(vals.map((v) => pelafalan[v])).size, 5, `p${nomor} kolom ${c + 1}: label kembar`);
      assert.equal(kolom.soal.length, 50);
      const counts = Object.fromEntries(KEYS.map((k) => [k, 0]));
      kolom.soal.forEach((s, n) => {
        assert.equal(new Set(s.shown).size, 4);
        for (const v of s.shown) assert.ok(vals.includes(v));
        assert.deepEqual(KEYS.filter((k) => !s.shown.includes(kolom.simbol[k])), [s.kunci]);
        if (n) assert.notEqual(s.shown.join(), kolom.soal[n - 1].shown.join());
        counts[s.kunci]++;
        butir++;
      });
      assert.deepEqual(Object.values(counts), [10, 10, 10, 10, 10], `p${nomor} kolom ${c + 1}: sebaran kunci`);
      assert.ok(maxRun(kolom.soal.map((s) => s.kunci)) <= 2);
      assert.ok(maxAlternation(kolom.soal.map((s) => s.kunci)) <= 4);
    });
    assert.equal(butir, 500);
  }
  assert.equal(sums.size, 5, "Ada file JSON yang identik");
  assert.equal(svgs.size, 250, "Ada gambar kembar antarkolom");
}

// Lembar review: kunci tiap kolom di 54px (kotak kunci HP) dan 110px, plus label.
function reviewSheet(dir: string, pelafalan: Record<string, string>) {
  mkdirSync(dir, { recursive: true });
  const body = PAKET.map((nomor) => {
    const bank = JSON.parse(readFileSync(root(`prisma/data/bank_soal_p${nomor}.json`), "utf8"));
    const rows = bank.kolom.map((k: { roman: string; tingkat: string; simbol: Record<Key, string> }) =>
      `<tr><th>${k.roman}<br><small>${k.tingkat}</small></th>${KEYS.map((key) => {
        const src = root(`public${k.simbol[key]}`);
        return `<td><img src="file://${src}" width="54"><img src="file://${src}" width="110"><br><b>${key}</b> ${pelafalan[k.simbol[key]]}</td>`;
      }).join("")}</tr>`).join("");
    return `<section id="p${nomor}"><h2>Paket ${nomor}</h2><table>${rows}</table></section>`;
  }).join("");
  writeFileSync(`${dir}/komposisi-review.html`,
    `<!doctype html><meta charset="utf-8"><title>Review Komposisi Majemuk</title><style>` +
    `body{font:13px system-ui;margin:16px;background:#ddd}table{border-collapse:collapse;margin-bottom:12px}` +
    `td,th{border:1px solid #999;padding:4px 6px;text-align:center;vertical-align:bottom;background:#f4f4f4}` +
    `img{margin:2px;vertical-align:bottom}h2{margin:8px 0 4px}` +
    `body:has(:target) section:not(:target){display:none}</style>` +
    `<h1>Review Komposisi Majemuk 801–805</h1>${body}\n`);
}

function main() {
  const pelafalan: Record<string, string> = {};
  PAKET.forEach((nomor, i) => {
    const bank = makeBank(nomor, i, pelafalan);
    writeFileSync(root(`prisma/data/bank_soal_p${nomor}.json`), `${JSON.stringify(bank, null, 2)}\n`);
  });
  verify(pelafalan);
  const labelFile = root("data/kecermatan-pelafalan.json");
  const all = JSON.parse(readFileSync(labelFile, "utf8"));
  for (const k of Object.keys(all)) if (k.startsWith("/kecermatan-komposisi/")) delete all[k];
  Object.assign(all, pelafalan);
  writeFileSync(labelFile, `${JSON.stringify(Object.fromEntries(Object.entries(all).sort()), null, 2)}\n`);
  if (process.argv[2]) reviewSheet(process.argv[2], pelafalan);
  assert.ok(existsSync(labelFile));
  console.log(`OK: 5 paket x 500 butir, ${Object.keys(pelafalan).length} gambar berlabel`);
}

main();
