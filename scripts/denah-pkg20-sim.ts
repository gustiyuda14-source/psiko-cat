import { sideOf, meets, R, GAP, type Map2, type St, type Bld } from "./denah-k17-bw";
import { left, right } from "./denah-k17-peta";

// Mesin rute paket 20: simulasi berbasis daftar (sim) + pemeriksa independen berbasis langkah piksel (walkCheck).
// Kerangka layar: heading 0 = atas, 2 = kanan, 4 = bawah, 6 = kiri (y turun).
export type Dir = "kiri" | "kanan";
export type Turn = { n: number; dir: Dir }; // belok di persimpangan ke-n di depan (pertigaan ikut dihitung)
export type RouteSpec = { x: Bld; s0: St; h0: number; turns: Turn[]; K: Dir; m: number };
export type SimOpt = { skipT?: boolean; lenient?: boolean; margin?: number };
export type Leg = { st: St; h: number; at: number; cross: St; turn: Dir; n: number; crossings: St[] };
export type SimRes = { key: Bld; legs: Leg[]; st: St; h: number; at: number; side: number; list: Bld[]; pts: number[][] };

export const up = (h: number) => h === 2 || h === 4;
export const al = (o: Bld, s: St) => (s.axis === "V" ? o.cy : o.cx);
const span = (o: Bld, s: St) => (s.axis === "V" ? [o.y, o.y + o.h] : [o.x, o.x + o.w]);
export const pt = (s: St, v: number) => (s.axis === "V" ? [s.c, v] : [v, s.c]);
export const turnTo = (h: number, d: Dir) => (d === "kiri" ? left(h) : right(h));
// Perempatan penuh: jalan lintas menembus kedua sisi dan jalan sekarang melewati persimpangan.
const through = (st: St, c: St) => c.a0 < st.c - 20 && c.a1 > st.c + 20 && st.a0 < c.c - 20 && st.a1 > c.c + 20;

/** Persimpangan di depan (urut terdekat) pada jalan st yang dilalui menghadap h dari posisi at. */
export const ahead = (p: Map2, st: St, h: number, at: number, o: SimOpt = {}) => p.streets
  .filter((c) => c.axis !== st.axis && meets(st, c) && (!o.skipT || through(st, c)) && (up(h) ? c.c > at + (o.margin ?? 20) : c.c < at - (o.margin ?? 20)))
  .sort((a, b) => Math.abs(a.c - at) - Math.abs(b.c - at));
// Jalan baru harus berlanjut ke arah belokan (pertigaan hanya bisa dibelok ke sisi yang ada jalannya).
export const turnOk = (st: St, h: number, cross: St, d: Dir) => (up(turnTo(h, d)) ? cross.a1 >= st.c + 70 : cross.a0 <= st.c - 70);

export function sim(p: Map2, sp: RouteSpec, o: SimOpt = {}): SimRes | null {
  let st = sp.s0, h = sp.h0, at = al(sp.x, st);
  const legs: Leg[] = [], pts = [pt(st, at)];
  for (const t of sp.turns) {
    const crossings = ahead(p, st, h, at, o), cross = crossings[t.n - 1];
    if (!cross || !turnOk(st, h, cross, t.dir)) return null;
    legs.push({ st, h, at, cross, turn: t.dir, n: t.n, crossings });
    pts.push(pt(st, cross.c));
    at = st.c; h = turnTo(h, t.dir); st = cross;
  }
  if (st === sp.s0) return null;
  const side = turnTo(h, sp.K);
  const adj = p.objs.filter((b) => sideOf(b, st) === side);
  // Bangunan yang mengangkangi titik belok membuat "pertama" menjadi ambigu.
  if (adj.some((b) => { const [lo, hi] = span(b, st); return lo - 2 <= at && at <= hi + 2; })) return null;
  const list = adj.filter((b) => (up(h) ? al(b, st) > at : al(b, st) < at)).sort((a, b) => Math.abs(al(a, st) - at) - Math.abs(al(b, st) - at));
  const key = list[sp.m - 1];
  if (!key || list.slice(0, sp.m).some((b) => !b.building)) return null;
  if (!o.lenient) {
    const near = list.slice(0, sp.m + 1);
    if (near.length < sp.m + 1 || near.some((b, i) => i && Math.abs(al(b, st) - al(near[i - 1], st)) < 14)) return null;
    if (al(key, st) < st.a0 + 8 || al(key, st) > st.a1 - 8) return null;
  }
  pts.push(pt(st, al(key, st)));
  return { key, legs, st, h, at, side, list, pts };
}

/** Pemeriksa independen: jalan 1 px per langkah dengan vektor layar, hitung persimpangan yang dilewati dan sentuhan pertama tiap bangunan. */
export function walkCheck(p: Map2, sp: RouteSpec, margin = 20, off = R / 2 + GAP + 4): Bld | null {
  let st = sp.s0;
  let d = [[0, -1], [0, -1], [1, 0], [0, 1], [0, 1], [0, 1], [-1, 0], [0, -1]][sp.h0];
  let [px, py] = pt(st, al(sp.x, st));
  const along = () => (st.axis === "V" ? [px, py][1] : px);
  for (const t of sp.turns) {
    const start = along(), seen = new Set<St>();
    let count = 0, hit: St | null = null;
    for (let i = 0; i < 2000 && !hit; i++) {
      const prev = along();
      px += d[0]; py += d[1];
      const cur = along();
      for (const c of p.streets) {
        if (c.axis === st.axis || seen.has(c) || Math.abs(c.c - start) < margin) continue;
        const covers = st.c >= c.a0 - 1 && st.c <= c.a1 + 1;
        if (covers && (prev - c.c) * (cur - c.c) <= 0 && Math.abs(cur - start) > margin) { seen.add(c); if (++count === t.n) hit = c; }
      }
      if (cur < st.a0 - 2 || cur > st.a1 + 2) return null;
    }
    if (!hit) return null;
    // Pindah ke titik tengah persimpangan lalu belok (vektor: kiri = (dy,-dx), kanan = (-dy,dx)).
    if (st.axis === "V") py = hit.c; else px = hit.c;
    d = t.dir === "kiri" ? [d[1], -d[0]] : [-d[1], d[0]];
    st = hit;
  }
  const lat = sp.K === "kiri" ? [d[1], -d[0]] : [-d[1], d[0]];
  const touched: Bld[] = [];
  for (let i = 0; i < 2000; i++) {
    px += d[0]; py += d[1];
    if (along() < st.a0 - 2 || along() > st.a1 + 2) break;
    const sx = px + lat[0] * off, sy = py + lat[1] * off;
    const b = p.objs.find((q) => sx >= q.x && sx <= q.x + q.w && sy >= q.y && sy <= q.y + q.h);
    if (b && !touched.includes(b)) { touched.push(b); if (touched.length === sp.m) return touched.some((q) => !q.building) ? null : b; }
  }
  return null;
}

/** Label nama jalan (di tengah ruas terpanjang, lihat streetLabel di denah-k17-bw) tidak boleh saling bertumpuk. */
export function labelsClear(p: Map2) {
  const boxes = p.streets.map((s) => {
    const cuts = [s.a0, ...p.streets.filter((o) => o.axis !== s.axis && meets(s, o)).map((o) => o.c), s.a1].sort((a, b) => a - b);
    let best = [s.a0, s.a1];
    for (let i = 1; i < cuts.length; i++) if (cuts[i] - cuts[i - 1] > best[1] - best[0]) best = [cuts[i - 1], cuts[i]];
    const m = (best[0] + best[1]) / 2, hw = s.name.length * 3.8 + 4;
    return s.axis === "H" ? [m - hw, s.c - 9, m + hw, s.c + 7] : [s.c - 9, m - hw, s.c + 7, m + hw];
  });
  return boxes.every((a, i) => boxes.every((b, j) => j <= i || !(a[0] < b[2] + 4 && b[0] < a[2] + 4 && a[1] < b[3] + 4 && b[1] < a[3] + 4)));
}
