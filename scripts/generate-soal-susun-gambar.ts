// generate-soal-susun-gambar.ts — deterministic generator for "susun_gambar" (reorder vertical strips) items.
// Usage:
//   npx tsx scripts/generate-soal-susun-gambar.ts --seed 42 --count 3 --start-id 1001 --out sample-susun.json --preview preview-susun.html
//   npx tsx scripts/generate-soal-susun-gambar.ts --check            (assert-based self-check over many seeds)
// No dependencies. Output items match psiko-cat soal.json shape (+ pembahasan).

type Item = {
  id: number; aspek: "logis"; tipe: "susun_gambar"; ganda: false;
  instruksi: string; kunci: string[]; pilihan: Record<string, string>;
  gambar: string; pembahasan: string;
};
type Meta = { n: number; ys: number[]; order: number[]; answer: number[]; anchors: string[] };

// ---------- PRNG ----------
function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
type Rng = () => number;
const ri = (r: Rng, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1)); // inclusive
function shuffle<T>(r: Rng, a: T[]): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}

// ---------- geometry ----------
const W = 480, H = 260;        // whole picture
const MIN_GAP = 16;            // min vertical separation of ridge heights at any two strip edges (px)
const Y_LO = 100, Y_HI = 215;  // ridge height band
const f = (v: number) => +v.toFixed(1);

// Ridge = Catmull-Rom spline through knots at every strip boundary (x = k*sw).
// With uniform x knots the spline's x(t) is linear, so y(x) is a plain Hermite eval.
function tangents(ys: number[]) {
  const n = ys.length - 1;
  return ys.map((_, k) => k === 0 ? ys[1] - ys[0] : k === n ? ys[n] - ys[n - 1] : (ys[k + 1] - ys[k - 1]) / 2);
}
function ridgeY(ys: number[], sw: number, x: number) {
  const m = tangents(ys);
  const k = Math.min(ys.length - 2, Math.max(0, Math.floor(x / sw)));
  const t = (x - k * sw) / sw, t2 = t * t, t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * ys[k] + (t3 - 2 * t2 + t) * m[k] + (-2 * t3 + 3 * t2) * ys[k + 1] + (t3 - t2) * m[k + 1];
}
function ridgePath(ys: number[], sw: number) {
  const m = tangents(ys);
  let d = `M0,${f(ys[0])}`;
  for (let k = 0; k < ys.length - 1; k++) {
    const x0 = k * sw, x1 = x0 + sw;
    d += ` C${f(x0 + sw / 3)},${f(ys[k] + m[k] / 3)} ${f(x1 - sw / 3)},${f(ys[k + 1] - m[k + 1] / 3)} ${f(x1)},${f(ys[k + 1])}`;
  }
  return d;
}

// Boundary heights: n+1 values, pairwise >= MIN_GAP apart. This alone makes the order unique:
// right edge of strip i matches left edge of strip i+1 exactly, and no other edge pair is within MIN_GAP.
function pickHeights(r: Rng, n: number): number[] {
  for (;;) {
    const ys = Array.from({ length: n + 1 }, () => ri(r, Y_LO, Y_HI));
    const s = ys.slice().sort((a, b) => a - b);
    if (s.every((v, i) => i === 0 || v - s[i - 1] >= MIN_GAP)) return ys;
  }
}

// ---------- scene objects (solid black, source style) ----------
function house(x: number, y: number) { // x center, y ground
  return `<g transform="translate(${f(x)},${f(y)})"><rect x="-26" y="-34" width="52" height="40" class="solid"/>` +
    `<polygon points="-34,-32 0,-62 34,-32" class="solid"/><rect x="-6" y="-18" width="12" height="20" fill="white"/>` +
    `<rect x="-20" y="-26" width="9" height="9" fill="white"/><rect x="11" y="-26" width="9" height="9" fill="white"/></g>`;
}
function tree(x: number, y: number, pine: boolean) {
  const crown = pine
    ? `<polygon points="-22,-24 0,-74 22,-24" class="solid"/><polygon points="-16,-50 0,-88 16,-50" class="solid"/>`
    : `<circle cx="0" cy="-52" r="24" class="solid"/><circle cx="-14" cy="-40" r="14" class="solid"/><circle cx="14" cy="-40" r="14" class="solid"/>`;
  return `<g transform="translate(${f(x)},${f(y)})"><rect x="-4" y="-30" width="8" height="36" class="solid"/>${crown}</g>`;
}
function sun(x: number, y: number) {
  let rays = "";
  for (let a = 0; a < 360; a += 45) rays += `<line x1="0" y1="-24" x2="0" y2="-32" transform="rotate(${a})" class="ray"/>`;
  return `<g transform="translate(${f(x)},${f(y)})"><circle r="17" class="solid"/>${rays}</g>`;
}
function bird(x: number, y: number) {
  return `<path d="M${f(x - 10)},${f(y)} q5,-7 10,0 q5,-7 10,0" class="line"/>`;
}

// ---------- distractors ----------
const key = (p: number[]) => p.join("-");
function distractors(r: Rng, ans: number[]): number[][] {
  const n = ans.length, out: number[][] = [], seen = new Set([key(ans)]);
  const add = (p: number[]) => { if (out.length < 4 && !seen.has(key(p))) { seen.add(key(p)); out.push(p); } };
  const swap = (p: number[], i: number, j: number) => { const q = p.slice(); [q[i], q[j]] = [q[j], q[i]]; return q; };
  // near-miss: one adjacent swap (keeps n-3 correct junctions) — seen in q29, q30, q34, cake, portrait
  const i = ri(r, 0, n - 2); add(swap(ans, i, i + 1));
  // cyclic shift (keeps n-2 junctions; one cut point wrong) — q37 "1-5-2-4-3"
  add(r() < 0.5 ? [...ans.slice(1), ans[0]] : [ans[n - 1], ...ans.slice(0, -1)]);
  // swap the two end pieces (same middle) — q30 "4-2-1-3", q37 "4-1-5-2-3"
  add(swap(ans, 0, n - 1));
  // "lazy" identity / reversed — portrait C "1-2-3-4-5-6", teapot E "5-4-3-2-1"
  add(r() < 0.5 ? Array.from({ length: n }, (_, k) => k + 1) : Array.from({ length: n }, (_, k) => n - k));
  // fallbacks: another adjacent swap with same first piece, then random
  for (let t = 0; out.length < 4 && t < 50; t++) { const j = ri(r, 1, n - 2); add(swap(ans, j, j + 1)); }
  while (out.length < 4) add(shuffle(r, ans));
  return out;
}

// ---------- item ----------
export function makeItem(seed: number, id: number): { item: Item; meta: Meta } {
  const r = mulberry32(seed);
  const n = ri(r, 4, 6), sw = W / n;
  const ys = pickHeights(r, n);
  // display order: order[slot] = original strip index. Reject identity/reverse and >1 fixed point.
  let order: number[];
  do order = shuffle(r, [...Array(n).keys()]);
  while (order.every((v, k) => v === k) || order.every((v, k) => v === n - 1 - k) || order.filter((v, k) => v === k).length > 1);
  const label = (strip: number) => order.indexOf(strip) + 1; // label shown under slot
  const answer = [...Array(n).keys()].map(label);            // labels read left-to-right in the whole picture

  // objects: house + tree straddle two different internal boundaries (anchor features)
  const bs = shuffle(r, [...Array(n - 1).keys()].map((k) => k + 1)).slice(0, 2);
  const hx = bs[0] * sw + ri(r, -8, 8), tx = bs[1] * sw + ri(r, -6, 6); // >= 66px apart: no overlap
  const hy = Math.max(...[-26, 0, 26].map((d) => ridgeY(ys, sw, hx + d))) + 5; // house base below ridge across its footprint
  const sx = ri(r, 40, W - 40), sy = ri(r, 34, 50);
  const pine = r() < 0.5;
  const birds: string[] = [], bxy: number[][] = [[sx, sy]];
  while (birds.length < 2) {
    const bx = ri(r, 20, W - 20), by = ri(r, 25, 75);
    if (bxy.every(([x, y]) => Math.hypot(bx - x, by - y) > 55)) { bxy.push([bx, by]); birds.push(bird(bx, by)); }
  }
  const P = `sg${id}`;
  const scene =
    `<g id="${P}-scene"><rect width="${W}" height="${H}" fill="white"/>` +
    `<path d="${ridgePath(ys, sw)} L${W},${H} L0,${H} Z" class="ground"/>` +
    `<path d="${ridgePath(ys, sw)}" class="ridge"/>` +
    sun(sx, sy) + birds.join("") + house(hx, hy) + tree(tx, ridgeY(ys, sw, tx) + 4, pine) + `</g>`;

  const GAP = 26, M = 40, TOP = 20;
  const VW = n * sw + (n - 1) * GAP + 2 * M, VH = TOP + H + 50;
  let pieces = "";
  order.forEach((strip, slot) => {
    const x = M + slot * (sw + GAP);
    pieces += `<g transform="translate(${f(x)},${TOP})"><g clip-path="url(#${P}-clip)"><use href="#${P}-scene" x="${f(-strip * sw)}"/></g>` +
      `<rect width="${f(sw)}" height="${H}" class="box"/><text x="${f(sw / 2)}" y="${H + 36}" class="text-label">${slot + 1}</text></g>`;
  });
  const gambar =
    `<svg viewBox="0 0 ${f(VW)} ${VH}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="white"/>` +
    `<style>.box{fill:none;stroke:#333;stroke-width:2}.solid{fill:black;stroke:none}.ridge{fill:none;stroke:black;stroke-width:5;stroke-linejoin:round}` +
    `.ground{fill:#d9d9d9;stroke:none}.ray,.line{fill:none;stroke:black;stroke-width:4;stroke-linecap:round}` +
    `.text-label{font-family:sans-serif;font-size:24px;font-weight:bold;text-anchor:middle}</style>` +
    `<defs><clipPath id="${P}-clip"><rect width="${f(sw)}" height="${H}"/></clipPath>${scene}</defs>${pieces}</svg>`;

  // options
  const opts = shuffle(r, [answer, ...distractors(r, answer)]);
  const letters = ["a", "b", "c", "d", "e"];
  const pilihan: Record<string, string> = {};
  opts.forEach((p, k) => (pilihan[letters[k]] = key(p)));
  const kunci = letters[opts.findIndex((p) => key(p) === key(answer))];

  // pembahasan (2 paragraphs, <br> separated like soal.json)
  const L = (strip: number) => label(strip);
  const anchors = [`rumah terbelah di antara potongan ${L(bs[0] - 1)} dan ${L(bs[0])}`,
    `${pine ? "pohon cemara" : "pohon"} terbelah di antara potongan ${L(bs[1] - 1)} dan ${L(bs[1])}`];
  const p1 = `Gambar utuh adalah pemandangan bukit dengan rumah, ${pine ? "pohon cemara" : "pohon"}, dan matahari yang dipotong menjadi ${n} pita tegak. ` +
    `Kuncinya adalah garis punggung bukit yang melintasi semua potongan: ketinggian garis di tepi kanan sebuah potongan harus sama persis dengan ketinggian di tepi kiri potongan sesudahnya, dan pada gambar ini setiap tepi memiliki ketinggian yang berbeda sehingga hanya ada satu sambungan yang cocok. ` +
    `Penanda tambahan: ${anchors.join(", ")}. Dengan menyambung dari kiri ke kanan diperoleh urutan ${key(answer)}.`;
  const elim = opts.filter((p) => key(p) !== key(answer)).map((p) => {
    const letter = letters[opts.indexOf(p)].toUpperCase();
    // any permutation != answer has >= 1 broken junction (the chain is unique), so pos >= 1
    const pos = p.findIndex((v, k) => k > 0 && answer.indexOf(v) !== answer.indexOf(p[k - 1]) + 1);
    return `Opsi ${letter} (${key(p)}) gugur karena garis bukit terputus antara potongan ${p[pos - 1]} dan ${p[pos]}`;
  });
  const p2 = `${elim.join("; ")}. Maka satu-satunya urutan yang menyambung tanpa putus adalah Opsi ${kunci.toUpperCase()} (${key(answer)}).`;

  return {
    item: { id, aspek: "logis", tipe: "susun_gambar", ganda: false,
      instruksi: "Urutkanlah potongan gambar berikut menjadi gambar yang utuh.", kunci: [kunci], pilihan, gambar, pembahasan: `${p1}<br>${p2}` },
    meta: { n, ys, order, answer, anchors },
  };
}

// Reassembled picture (true order) using the same clip/use mechanics — for visual verification only.
export function assembled(item: Item, meta: Meta) {
  const P = `sg${item.id}`, sw = W / meta.n;
  const defs = item.gambar.match(/<defs>[\s\S]*<\/defs>/)![0], style = item.gambar.match(/<style>[\s\S]*?<\/style>/)![0];
  let g = "";
  // built from the published KEY: slot k gets the piece labelled kunci[k] (label L shows strip order[L-1]),
  // so a wrong key would visibly scramble this picture.
  item.pilihan[item.kunci[0]].split("-").map(Number).forEach((lab, k) => {
    const s = meta.order[lab - 1];
    g += `<g transform="translate(${f(k * sw)},0)"><g clip-path="url(#${P}-clip)"><use href="#${P}-scene" x="${f(-s * sw)}"/></g></g>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${style}${defs.replace(/id="sg/g, 'id="as').replace(/#sg/g, "#as")}${g.replace(/#sg/g, "#as")}</svg>`;
}

// ---------- validation ----------
export function svgProblems(svg: string): string[] {
  const errs: string[] = [], stack: string[] = [];
  if (!/^<svg [^>]*viewBox="[^"]+"/.test(svg)) errs.push("missing viewBox");
  if (/<script|\son\w+\s*=|javascript:|href="(?!#)|url\((?!#)/i.test(svg)) errs.push("unsafe/external content");
  for (const m of svg.matchAll(/<(\/?)([a-zA-Z][\w:-]*)[^>]*?(\/?)>/g)) {
    if (m[3]) continue;
    if (m[1]) { if (stack.pop() !== m[2]) errs.push(`unbalanced </${m[2]}>`); } else stack.push(m[2]);
  }
  if (stack.length) errs.push(`unclosed ${stack.join(",")}`);
  const ids = new Set([...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of svg.matchAll(/(?:url\(#|href="#)([^)"]+)/g)) if (!ids.has(m[1])) errs.push(`dangling ref #${m[1]}`);
  return errs;
}

function check() {
  const assert = (c: unknown, msg: string) => { if (!c) throw new Error(msg); };
  for (let seed = 1; seed <= 500; seed++) {
    const { item, meta } = makeItem(seed, 9000 + seed);
    const { n, ys, order, answer } = meta;
    const vals = Object.values(item.pilihan);
    assert(Object.keys(item.pilihan).join("") === "abcde", `${seed}: letters`);
    assert(new Set(vals).size === 5, `${seed}: options not distinct ${vals}`);
    for (const v of vals) assert(v.split("-").map(Number).sort().join() === [...Array(n).keys()].map((k) => k + 1).join(), `${seed}: bad perm ${v}`);
    assert(vals.filter((v) => v === key(answer)).length === 1, `${seed}: key count`);
    assert(item.kunci.length === 1 && item.pilihan[item.kunci[0]] === key(answer), `${seed}: kunci mismatch`);
    // answer really reassembles: the strip labelled answer[k] is original strip k
    answer.forEach((lab, k) => assert(order[lab - 1] === k, `${seed}: answer does not map to strip order`));
    // uniqueness: edge-matching graph (right edge i -> left edge j within tolerance) must be exactly the true chain
    const sw = W / n, Ledge = (s: number) => ridgeY(ys, sw, s * sw), Redge = (s: number) => ridgeY(ys, sw, (s + 1) * sw);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const match = Math.abs(Redge(i) - Ledge(j)) < MIN_GAP;
      assert(match === (j === i + 1), `${seed}: ambiguous junction ${i}->${j}`);
    }
    assert(Math.abs(ridgeY(ys, sw, 0) - ys[0]) < 1e-9 && Math.abs(Redge(n - 1) - ys[n]) < 1e-9, `${seed}: spline knots`);
    assert(svgProblems(item.gambar).length === 0, `${seed}: svg ${svgProblems(item.gambar)}`);
    assert(svgProblems(assembled(item, meta)).length === 0, `${seed}: assembled svg`);
    const paras = item.pembahasan.split("<br>");
    assert(paras.length === 2 && paras[1].includes(`Opsi ${item.kunci[0].toUpperCase()}`), `${seed}: pembahasan`);
    assert((paras[1].match(/gugur/g) || []).length === 4, `${seed}: pembahasan must eliminate 4 options`);
    assert(JSON.stringify(makeItem(seed, 9000 + seed).item) === JSON.stringify(item), `${seed}: not deterministic`);
  }
  // negative tests for the SVG checker
  assert(svgProblems('<svg viewBox="0 0 1 1"><g></svg>').length > 0, "checker misses unbalanced");
  assert(svgProblems('<svg viewBox="0 0 1 1"><use href="#x"/></svg>').length > 0, "checker misses dangling ref");
  assert(svgProblems('<svg viewBox="0 0 1 1"><script/></svg>').length > 0, "checker misses script");
  console.log("check OK: 500 seeds");
}

// ---------- CLI ----------
async function main() {
  const a = process.argv.slice(2), arg = (k: string, d: string) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
  if (a.includes("--check")) return check();
  const seed = Number(arg("--seed", "1")), count = Number(arg("--count", "3")), start = Number(arg("--start-id", "1001"));
  if (!Number.isInteger(seed) || !Number.isInteger(count) || count < 1 || count > 1000) throw new Error("bad --seed/--count");
  const res = Array.from({ length: count }, (_, k) => makeItem((seed * 7919 + k) >>> 0, start + k));
  const fs = await import("node:fs");
  const out = arg("--out", "");
  if (out) fs.writeFileSync(out, JSON.stringify(res.map((x) => x.item), null, 2));
  else console.log(JSON.stringify(res.map((x) => x.item), null, 2));
  const prev = arg("--preview", "");
  if (prev) {
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const body = res.map(({ item, meta }) => `<section><h2>#${item.id} (${meta.n} potongan)</h2><p>${esc(item.instruksi)}</p>
<div class="g">${item.gambar}</div><ol type="a">${Object.entries(item.pilihan).map(([k, v]) => `<li${k === item.kunci[0] ? ' class="k"' : ""}>${v}</li>`).join("")}</ol>
<h3>Disusun sesuai kunci (${item.pilihan[item.kunci[0]]})</h3><div class="g s">${assembled(item, meta)}</div><p class="p">${item.pembahasan}</p></section>`).join("\n");
    fs.writeFileSync(prev, `<!doctype html><meta charset="utf-8"><title>Preview Susun Gambar</title><style>body{font-family:sans-serif;max-width:900px;margin:auto;padding:16px;background:#fff}
.g svg{width:100%;height:auto;border:1px solid #ccc}.s{max-width:520px}.k{font-weight:bold;color:#060}.p{font-size:14px;line-height:1.5}section{margin-bottom:48px}</style>${body}`);
    if (a.includes("--svgdir")) {
      const dir = arg("--svgdir", ".");
      res.forEach(({ item, meta }) => { fs.writeFileSync(`${dir}/q${item.id}.svg`, item.gambar); fs.writeFileSync(`${dir}/q${item.id}-utuh.svg`, assembled(item, meta)); });
    }
  }
}
main();
