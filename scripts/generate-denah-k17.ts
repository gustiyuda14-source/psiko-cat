import * as fs from "fs";
import * as path from "path";
import { makeMap2, renderMap2, sideOf as side2, meets, type Map2, type St, type Bld } from "./denah-k17-bw";
import {
  reseed, pick, shuffle, DIR, SHORT, bearing, sectorOf, angDiff, left, right, ERR_SECTOR, W, VX, HY, WALKERS,
  makePeta, renderSvg, ring, tag, arrow, f1, rect, FONT, C_OK, C_NO, C_REF, MK, M, R, TOP, H, type Obj, type Street, type Peta,
} from "./denah-k17-peta";

// Generator K17 Denah & Arah Mata Angin (pedoman: Claude Doc "Pedoman Penyusunan Bank Soal
// Denah & Arah Mata Angin", 2026-10-11). Mesin peta + render ada di denah-k17-peta.ts.
// Peta 1–10 (5 soal/peta): 2 ARAH pilih bangunan, 1 ARAH pilih arah, 2 RUTE kiri/kanan setelah belokan.
// Peta 11–22: LEWAT (hitung bangunan dilalui) + RELASI (pojok persimpangan, di antara dua jalan).
// Arah diukur titik tengah ke titik tengah ikon (sektor 45°); kunci wajib ≤ 10° dari pusat
// sektornya, pengecoh ≥ 35° dari pusat sektor kunci. Tiap pengecoh = satu kesalahan bernama.
//
// Pakai: npx tsx scripts/generate-denah-k17.ts
// Hasil: public/drill/img/K17-peta-NN.svg + bank/drill/kecerdasan/K17-denah-arah.json (ditimpa)

const ROOT = path.join(__dirname, "..");

// ---------- soal ----------
type Item = Record<string, unknown>;
const LET = ["a", "b", "c", "d", "e"];
const LEWAT_DEF = " Bangunan yang dilalui = bangunan yang berbatasan langsung dengan ruas jalan yang ditempuh, di kedua sisi jalan, tanpa bangunan awal dan tujuan; bangunan di pojok belokan dihitung sekali.";
const RELASI_DEF = " Pojok Timur Laut persimpangan = bangunan di sudut blok kanan-atas persimpangan yang paling dekat ke persimpangan (begitu juga pojok lain). Di antara Jl. A dan Jl. B = di blok yang diapit kedua jalan itu.";
const INSTRUKSI = "Gunakan denah. Utara ditunjukkan kompas (atas peta). Arah diukur dari titik tengah bangunan. Belok kiri/kanan dihitung dari arah hadap pejalan. Bangunan di sebelah kiri/kanan = bangunan yang berbatasan langsung dengan jalan yang sedang dilalui. Lapangan, taman, dan kolam bukan bangunan.";
const bOf = (a: Obj, b: Obj) => bearing(a.cx, a.cy, b.cx, b.cy);
const corners = (o: Obj) => [[o.x, o.y], [o.x + o.w, o.y], [o.x, o.y + o.h], [o.x + o.w, o.y + o.h]];
const safeKey = (a: Obj, b: Obj) => { const br = bOf(a, b), d = sectorOf(br); return angDiff(br, d * 45) <= 10 && corners(b).every(([x, y]) => sectorOf(bearing(a.cx, a.cy, x, y)) === d) ? d : -1; };
// Bahasa pembahasan: arah peta dalam kata sehari-hari (atas/kanan/bawah/kiri).
const POS = ["atas", "kanan-atas", "kanan", "kanan-bawah", "bawah", "kiri-bawah", "kiri", "kiri-atas"];
const MOVE = ["lurus ke atas", "serong ke kanan-atas", "lurus ke kanan", "serong ke kanan-bawah", "lurus ke bawah", "serong ke kiri-bawah", "lurus ke kiri", "serong ke kiri-atas"];
let story = 0; // pemilih gambaran nyata bergilir (tanpa rnd supaya kunci tetap sama)
const tipsArah = (d: number) => d % 2
  ? "Tips: arah serong (Timur Laut, Tenggara, Barat Daya, Barat Laut) artinya bergeser ke samping DAN ke atas/bawah hampir sama jauh. Kalau gesernya hanya sedikit, itu masih arah lurus."
  : "Tips: hafalkan 4 arah utama dulu: atas = Utara, kanan = Timur, bawah = Selatan, kiri = Barat. Arah serong ada di antaranya.";
const nyataArah = (d: number, x: string) => [
  `Gambaran nyata: petugas patroli melapor lewat HT, "Pelaku lari ke arah ${DIR[d]} dari ${x}." Rekan yang memegang peta harus langsung tahu itu ${MOVE[d]} di peta.`,
  `Gambaran nyata: ada laporan "Kebakaran di sebelah ${DIR[d]} ${x}." Petugas yang salah membaca arah akan datang ke tempat yang salah.`,
  `Gambaran nyata: saat latihan lapangan, komandan memberi perintah "Regu 2 bergerak ke ${DIR[d]}!" Kamu harus tahu arahnya tanpa ragu: ${MOVE[d]} di peta.`,
][story++ % 3];

// Cincin penanda: peta grid (label di bawah ikon) vs peta hitam-putih (cincin di badan bangunan saja).
let ringFn: (o: Obj, c: string, dash?: boolean) => string = ring;
const rg = (o: Obj, c: string, dash = false) => ringFn(o, c, dash);

function arrange<T>(key: T, others: T[], pos: number): T[] { const o = [...others]; o.splice(pos, 0, key); return o; }

function arahBangunan(p: Peta, pos: number, used: Set<string>): Item | null {
  const B = p.objs.filter((o) => o.building);
  for (const x of shuffle(B)) for (const y of shuffle(B)) {
    if (x === y || used.has(x.name + y.name) || used.has(y.name + x.name)) continue;
    const d = safeKey(x, y);
    if (d < 0) continue;
    const pool = B.filter((z) => z !== x && z !== y).map((z) => ({ z, br: bOf(x, z) }))
      .filter(({ br }) => angDiff(br, d * 45) >= 35 && angDiff(br, sectorOf(br) * 45) <= 15);
    const ds: { z: Obj; why: string }[] = [];
    for (const [why, f] of ERR_SECTOR) { const z = pool.find(({ z, br }) => sectorOf(br) === f(d) && !ds.some((q) => q.z === z)); if (z && ds.length < 4) ds.push({ z: z.z, why }); }
    for (const { z } of shuffle(pool)) if (ds.length < 4 && !ds.some((q) => q.z === z)) ds.push({ z, why: "" });
    for (const q of ds) q.why = ERR_SECTOR.find(([, f]) => f(d) === sectorOf(bOf(x, q.z)))?.[0] ?? "bukan arah yang ditanya";
    if (ds.length < 4) continue;
    used.add(x.name + y.name);
    const opts = arrange({ z: y, why: "" }, shuffle(ds), pos);
    const near = ds.filter((q) => angDiff(bOf(x, q.z), d * 45) <= 50).length;
    const why2 = opts.map((o, i) => { const s = sectorOf(bOf(x, o.z)); return o.z === y ? "" : `Opsi ${LET[i].toUpperCase()} (${o.z.name}): letaknya di ${POS[s]} ${x.name}, jadi ${DIR[s]}; ${o.why}.`; }).filter(Boolean).join("\n");
    const close = ds.filter((q) => ERR_SECTOR.slice(0, 2).some(([, f]) => f(d) === sectorOf(bOf(x, q.z))))
      .sort((a, b) => angDiff(bOf(x, a.z), d * 45) - angDiff(bOf(x, b.z), d * 45)).slice(0, 1);
    return {
      cap: [`Dari ${x.name} ke ${y.name}:`, `${MOVE[d]} = ${DIR[d]}`],
      over: rg(x, C_REF) + rg(y, C_OK) + close.map((q) => rg(q.z, C_NO, true) + arrow(x, q.z, C_NO, "no", `${DIR[sectorOf(bOf(x, q.z))]} ✗`, true)).join("") + arrow(x, y, C_OK, "ok", `${DIR[d]} ✓`),
      sub_type: "FIG-DENAH-ARAH", tier: d % 2 === 0 ? 1 : near >= 2 ? 3 : 2,
      stem: `Di antara pilihan berikut, bangunan yang terletak di arah ${DIR[d]} dari ${x.name} adalah …`,
      opsi: Object.fromEntries(opts.map((o, i) => [LET[i], o.z.name])), kunci: [LET[pos]],
      pembahasan: `Langkah 1: Taruh jari di tengah ${x.name}.\nLangkah 2: Lihat kompas: ${DIR[d]} = ${MOVE[d]}. Geser jari ${MOVE[d]} dari ${x.name}.\nLangkah 3: Bangunan pilihan yang kena arah itu adalah ${y.name}.<br>Kenapa yang lain salah:\n${why2}\nJawaban: ${y.name}.<br>${nyataArah(d, x.name)}\n${tipsArah(d)}`,
    };
  }
  return null;
}

function arahArah(p: Peta, pos: number, used: Set<string>): Item | null {
  const B = p.objs.filter((o) => o.building);
  for (const x of shuffle(B)) for (const y of shuffle(B)) {
    if (x === y || used.has(x.name + y.name) || used.has(y.name + x.name)) continue;
    const d = safeKey(x, y);
    if (d < 0) continue;
    used.add(x.name + y.name);
    const ds: { s: number; why: string }[] = [];
    for (const [why, f] of ERR_SECTOR) if (f(d) !== d && !ds.some((q) => q.s === f(d)) && ds.length < 4) ds.push({ s: f(d), why });
    // Urut searah jarum jam mulai dari arah tertentu supaya kunci jatuh di `pos`.
    const all = [{ s: d, why: "" }, ...ds].sort((a, b) => a.s - b.s);
    const k = all.findIndex((o) => o.s === d), opts = all.map((_, i) => all[(i + k - pos + 5) % 5]);
    const why2 = opts.map((o, i) => o.s === d ? "" : `Opsi ${LET[i].toUpperCase()} (${DIR[o.s]}): itu arah ${POS[o.s]}; ${o.why}.`).filter(Boolean).join("\n");
    const geser = d % 2 ? `geser ke ${d < 4 ? "kanan" : "kiri"} dan ke ${d === 1 || d === 7 ? "atas" : "bawah"} hampir sama jauh` : "hampir lurus";
    return {
      cap: [`Dari ${x.name} ke ${y.name}:`, `${MOVE[d]} = ${DIR[d]}`],
      over: rg(x, C_REF) + rg(y, C_OK) + arrow(x, y, C_OK, "ok", `${DIR[d]} ✓`),
      sub_type: "FIG-DENAH-ARAH", tier: d % 2 === 0 ? 1 : 2,
      stem: `${y.name} terletak di arah mana dari ${x.name}?`,
      opsi: Object.fromEntries(opts.map((o, i) => [LET[i], DIR[o.s]])), kunci: [LET[pos]],
      pembahasan: `Langkah 1: Taruh jari di tengah ${x.name}, lalu cari ${y.name}.\nLangkah 2: ${y.name} ada di ${POS[d]} ${x.name} (${geser}).\nLangkah 3: Cocokkan dengan kompas: ${POS[d]} = ${DIR[d]}.<br>Kenapa yang lain salah:\n${why2}\nJawaban: ${DIR[d]}.<br>${nyataArah(d, x.name)}\n${tipsArah(d)}`,
    };
  }
  return null;
}

// Objek di sisi `side` (arah mata angin) jalan `s`, di depan titik `at` searah `h`, urut terdekat.
function along(p: Peta, s: Street, h: number, side: number, at: number): Obj[] {
  const res = p.objs.filter((o) => {
    if (s.axis === "V") return side === 6 ? o.c === s.i && o.cells.some((k) => k[0] === 1) : o.c === s.i + 1 && o.cells.some((k) => k[0] === 0);
    return side === 0 ? o.r === s.i && o.cells.some((k) => k[1] === 1) : o.r === s.i + 1 && o.cells.some((k) => k[1] === 0);
  }).filter((o) => (s.axis === "V" ? (h === 0 ? o.cy < at : o.cy > at) : (h === 2 ? o.cx > at : o.cx < at)));
  return res.sort((a, b) => Math.abs((s.axis === "V" ? a.cy : a.cx) - at) - Math.abs((s.axis === "V" ? b.cy : b.cx) - at));
}
const nth = (l: Obj[], n: number) => (l.slice(0, n + 1).every((o) => o.building) ? l[n] ?? null : null);
const touches = (o: Obj, s: Street) => s.axis === "V"
  ? (o.c === s.i && o.cells.some((k) => k[0] === 1)) || (o.c === s.i + 1 && o.cells.some((k) => k[0] === 0))
  : (o.r === s.i && o.cells.some((k) => k[1] === 1)) || (o.r === s.i + 1 && o.cells.some((k) => k[1] === 0));

function rute(p: Peta, pos: number, turns: number, walker: string): Item | null {
  for (let tries = 0; tries < 400; tries++) {
    const x = pick(p.objs.filter((o) => o.building));
    const s0 = pick(p.streets.filter((s) => touches(x, s)));
    if (!s0) continue;
    let h = s0.axis === "V" ? pick([0, 4]) : pick([2, 6]);
    let st = s0, at = s0.axis === "V" ? x.cy : x.cx;
    const steps: { st: Street; h: number; turn: "kiri" | "kanan"; cross: Street; at: number }[] = [];
    for (let t = 0; t < turns; t++) {
      const cross = shuffle(p.streets.filter((c) => c.axis !== st.axis && (st.axis === "V" ? (h === 0 ? HY[c.i] < at : HY[c.i] > at) : (h === 2 ? VX[c.i] > at : VX[c.i] < at))))[0];
      if (!cross) break;
      const turn = pick(["kiri", "kanan"] as const);
      steps.push({ st, h, turn, cross, at });
      at = st.axis === "V" ? VX[st.i] : HY[st.i];
      h = turn === "kiri" ? left(h) : right(h);
      st = cross;
    }
    if (steps.length !== turns) continue;
    const last = steps[turns - 1], K = pick(["kiri", "kanan"] as const), notK = K === "kiri" ? "kanan" : "kiri";
    const dirFor = (hd: number, nm: string) => (nm === "kiri" ? left(hd) : right(hd));
    const side = dirFor(h, K), rev = (h + 4) % 8;
    const turnAt = last.st.axis === "V" ? HY[last.cross.i] : VX[last.cross.i];
    const key = nth(along(p, st, h, side, at), 0);
    if (!key || key === x) continue;
    const cand: [Obj | null, string][] = [
      [nth(along(p, st, h, dirFor(h, notK), at), 0), `ada di sisi ${notK}; kiri dan kanan tertukar`],
      [nth(along(p, st, rev, dirFor(rev, K), at), 0), `itu kalau belokan terakhir salah arah (belok ${last.turn === "kiri" ? "kanan" : "kiri"})`],
      [nth(along(p, last.st, last.h, dirFor(last.h, K), turnAt), 0), `itu kalau ${walker} lupa belok di ${last.cross.name} dan jalan lurus terus`],
      [nth(along(p, st, h, side, at), 1), `itu bangunan kedua; yang pertama terlewat`],
      [nth(along(p, st, rev, dirFor(rev, notK), at), 0), `itu kalau belokan terakhir salah arah dan sisinya juga tertukar`],
      [nth(along(p, st, h, dirFor(h, notK), at), 1), `itu bangunan kedua di sisi ${notK}`],
    ];
    const ds: { z: Obj; why: string }[] = [];
    for (const [z, why] of cand) if (z && z !== key && z !== x && !ds.some((q) => q.z === z) && ds.length < 4) ds.push({ z, why });
    if (ds.length < 4) continue;
    const opts = arrange({ z: key, why: "" }, shuffle(ds), pos);
    const heads = [...steps.map((s) => s.h), h];
    const tier = turns === 3 || heads.includes(4) ? 3 : turns === 1 && heads.every((q) => q === 0 || q === 2) ? 1 : 2;
    const route = steps.map((s, i) => `${i ? "lalu di" : "Di"} persimpangan ${s.cross.name} ia belok ${s.turn}`).join(", ");
    const nh = (i: number) => (i + 1 < turns ? steps[i + 1].h : h);
    const trace = steps.map((s, i) => `Langkah ${i + 2}: Di ${s.cross.name} belok ${s.turn}. Menghadap ${DIR[s.h]}, ${s.turn}nya adalah ${DIR[nh(i)]}. Sekarang menghadap ${DIR[nh(i)]}.`).join("\n");
    const why2 = opts.map((o, i) => o.z === key ? "" : `Opsi ${LET[i].toUpperCase()} (${o.z.name}): ${o.why}.`).filter(Boolean).join("\n");
    const pt = (a: Street, b: Street) => (a.axis === "V" ? [VX[a.i], HY[b.i]] : [VX[b.i], HY[a.i]]);
    const path = [s0.axis === "V" ? [VX[s0.i], x.cy] : [x.cx, HY[s0.i]], ...steps.map((s) => pt(s.st, s.cross)), st.axis === "V" ? [VX[st.i], key.cy] : [key.cx, HY[st.i]]];
    const swap = ds.find((q) => q.why.startsWith("ada di sisi"));
    const nyata = story++ % 2
      ? `Gambaran nyata: seperti memandu ambulans lewat telepon. Sopir yang menghadap ${DIR[h]} melihat ${DIR[left(h)]} di kirinya dan ${DIR[right(h)]} di kanannya${h === 4 ? ", kebalikan dari kiri-kanan layar" : ""}.`
      : "Gambaran nyata: kamu memandu mobil patroli lewat HT. Sopir hanya melihat jalan di depannya, jadi perintah belok kiri/kanan harus dihitung dari arah hadap sopir, bukan dari peta.";
    const tips = heads.includes(4)
      ? "Tips: putar badan atau HP-mu mengikuti arah jalan. Saat menghadap Selatan (ke bawah peta), kiri jadi Timur dan kanan jadi Barat, kebalikan dari yang terlihat di layar."
      : 'Tips: setiap kali belok, ucapkan dalam hati "sekarang aku menghadap ..." supaya arah tidak tertukar.';
    return {
      cap: [`Jalur ${walker}: ${turns} belokan`, `Menghadap ${DIR[h]}, ${K} = ${DIR[side]}`],
      over: ring(x, C_REF) + ring(key, C_OK) + (swap ? ring(swap.z, C_NO, true) + tag(swap.z.cx, swap.z.y - 8, `${notK} ✗`, C_NO) : "")
        + `<polyline points="${path.map((q) => q.map(f1).join(",")).join(" ")}" fill="none" stroke="${C_REF}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" opacity=".9" marker-end="url(#ref)"/>`
        + `<circle cx="${f1(path[0][0])}" cy="${f1(path[0][1])}" r="6" fill="${C_REF}"/>` + tag(x.cx, x.y - 8, "Mulai", C_REF)
        + steps.map((s, i) => { const [qx, qy] = path[i + 1]; return `<circle cx="${f1(qx)}" cy="${f1(qy)}" r="10" fill="${C_REF}"/><text x="${f1(qx)}" y="${f1(qy + 4.5)}" text-anchor="middle" font-size="13" font-weight="700" fill="#fff" ${FONT}>${i + 1}</text>` + tag(qx + (qx > W / 2 ? 46 : -46), qy, `${s.turn} → ${SHORT[nh(i)]}`, C_REF); }).join("")
        + tag(key.cx, key.y - 8, `${K} ✓`, C_OK),
      sub_type: "FIG-DENAH-RUTE", tier,
      stem: `${walker} keluar dari ${x.name} ke ${s0.name}, lalu berjalan ke arah ${DIR[steps[0].h]}. ${route}. Bangunan pertama di sebelah ${K} ${walker} setelah belokan terakhir adalah …`,
      opsi: Object.fromEntries(opts.map((o, i) => [LET[i], o.z.name])), kunci: [LET[pos]],
      pembahasan: `Langkah 1: ${walker} keluar dari ${x.name} ke ${s0.name}, menghadap ${DIR[steps[0].h]}.\n${trace}\nLangkah ${turns + 2}: Menghadap ${DIR[h]}, sisi ${K} = ${DIR[side]}. Bangunan pertama di sisi itu: ${key.name}.<br>Kenapa yang lain salah:\n${why2}\nJawaban: ${key.name}.<br>${nyata}\n${tips}`,
    };
  }
  return null;
}

// ---------- LEWAT & RELASI ----------
const alongOf = (o: Obj, s: Street) => (s.axis === "V" ? o.cy : o.cx);
const crossAt = (s: Street) => (s.axis === "V" ? VX[s.i] : HY[s.i]);
const onSt = (s: Street, v: number) => (s.axis === "V" ? [VX[s.i], v] : [v, HY[s.i]]);
// Sisi jalan tempat objek menempel: arah mata angin (Barat/Timur untuk jalan tegak, Utara/Selatan untuk mendatar).
const sideDir = (o: Obj, s: Street) => s.axis === "V"
  ? (o.c === s.i && o.cells.some((k) => k[0] === 1) ? 6 : o.c === s.i + 1 && o.cells.some((k) => k[0] === 0) ? 2 : -1)
  : (o.r === s.i && o.cells.some((k) => k[1] === 1) ? 0 : o.r === s.i + 1 && o.cells.some((k) => k[1] === 0) ? 4 : -1);
const names = (l: Obj[]) => l.map((o) => o.name).join(", ");
const badge = (o: Obj, k: number) => `<circle cx="${f1(o.x)}" cy="${f1(o.y)}" r="10" fill="${C_OK}"/><text x="${f1(o.x)}" y="${f1(o.y + 4.5)}" text-anchor="middle" font-size="13" font-weight="700" fill="#fff" ${FONT}>${k}</text>`;
const line = (pts: number[][], c: string) => `<polyline points="${pts.map((q) => q.map(f1).join(",")).join(" ")}" fill="none" stroke="${c}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" opacity=".9" marker-end="url(#ref)"/>`;
const at = (cx: number, cy: number) => ({ cx, cy }) as Obj;

function lewat(p: Peta, pos: number, segs: number, walker: string, dense: boolean): Item | null {
  for (let tries = 0; tries < 800; tries++) {
    const x = pick(p.objs.filter((o) => o.building));
    const s0 = pick(p.streets.filter((s) => sideDir(x, s) >= 0));
    if (!s0) continue;
    let st = s0, pos0 = alongOf(x, s0), h = pick(s0.axis === "V" ? [0, 4] : [2, 6]);
    const ahead = (v: number) => (h === 0 || h === 6 ? v < pos0 : v > pos0);
    const legs: { st: Street; from: number; to: number; h: number }[] = [];
    for (let k = 1; k < segs; k++) {
      const cross = shuffle(p.streets.filter((c) => c.axis !== st.axis && ahead(crossAt(c))))[0];
      if (!cross) break;
      legs.push({ st, from: pos0, to: crossAt(cross), h });
      pos0 = crossAt(st); h = pick(cross.axis === "V" ? [0, 4] : [2, 6]); st = cross;
    }
    if (legs.length !== segs - 1) continue;
    const y = pick(p.objs.filter((o) => o.building && o !== x && sideDir(o, st) >= 0 && ahead(alongOf(o, st))));
    if (!y) continue;
    legs.push({ st, from: pos0, to: alongOf(y, st), h });
    // Tujuan yang menempel ke ruas sebelumnya (atau awal ke ruas berikutnya) = jalur memutar yang membingungkan.
    if (legs.slice(0, -1).some((g) => sideDir(y, g.st) >= 0) || legs.slice(1).some((g) => sideDir(x, g.st) >= 0)) continue;
    // Bangunan yang badannya sejajar dengan titik awal/tujuan (di seberang jalan) membuat "dilalui"
    // ambigu: tolak jalurnya. Batas antar-ruas di persimpangan tidak perlu dicek (jauh dari bangunan).
    let amb = false;
    const per = legs.map((g, gi) => p.objs.filter((o) => o !== x && o !== y && sideDir(o, g.st) >= 0).filter((o) => {
      const v = alongOf(o, g.st), lo = Math.min(g.from, g.to), hi = Math.max(g.from, g.to);
      const [e0, e1] = g.st.axis === "V" ? [o.y, o.y + o.h] : [o.x, o.x + o.w];
      const ends = [...(gi === 0 ? [g.from] : []), ...(gi === legs.length - 1 ? [g.to] : [])];
      if (ends.some((e) => e >= e0 - 10 && e <= e1 + 10)) amb = true;
      return v > lo && v < hi;
    }));
    if (amb) continue;
    const seen = new Set<Obj>(), fresh = per.map((l) => l.filter((o) => o.building && !seen.has(o) && seen.add(o)));
    const counted = fresh.flat(), n = counted.length, dup = per.flat().filter((o) => o.building).length - n;
    const open = [...new Set(per.flat().filter((o) => !o.building))];
    if (n < 2 || n > 12 || fresh.some((l) => !l.length)) continue;
    const kiri = fresh.reduce((t, l, i) => t + l.filter((o) => sideDir(o, legs[i].st) === left(legs[i].h)).length, 0);
    const named: [number, string][] = [[n + 2, `${x.name} dan ${y.name} ikut dihitung`], [kiri, "hanya menghitung sisi kiri jalan"], [n - kiri, "hanya menghitung sisi kanan jalan"]];
    if (open.length) named.push([n + open.length, `${names(open)} ikut dihitung, padahal bukan bangunan`]);
    if (segs > 1) named.push([n - fresh[segs - 1].length, `ruas ${st.name} terlupa`]);
    if (dup) named.push([n + dup, "bangunan di pojok belokan terhitung dua kali"]);
    for (let k = 1; k <= 4; k++) named.push([n - k, "ada bangunan yang terlewat"], [n + k, "ada bangunan yang terhitung dua kali atau bukan di jalur"]);
    const take = (l: [number, string][], cnt: number) => l.filter(([v], i) => v >= 0 && v !== n && l.findIndex(([u]) => u === v) === i).slice(0, cnt);
    const lo = take(named.filter(([v]) => v < n), pos), hi = take(named.filter(([v]) => v > n), 4 - pos);
    if (lo.length !== pos || hi.length !== 4 - pos) continue;
    const opts = [...lo, [n, ""] as [number, string], ...hi].sort((a, b) => a[0] - b[0]);
    const why2 = opts.map(([v, w], i) => (v === n ? "" : `Opsi ${LET[i].toUpperCase()} (${v}): ${w}.`)).filter(Boolean).join("\n");
    const via = legs.map((g) => g.st.name), path0 = [onSt(s0, alongOf(x, s0)), ...legs.slice(0, -1).map((g, i) => onSt(g.st, crossAt(legs[i + 1].st))), onSt(st, alongOf(y, st))];
    const steps = legs.map((g, i) => `Langkah ${i + 2}: Di ${g.st.name}: ${fresh[i].length ? names(fresh[i]) : "tidak ada bangunan baru"} (${fresh[i].length}).`).join("\n");
    const nyata = story++ % 2
      ? "Gambaran nyata: saat patroli jalan kaki, petugas mencatat bangunan yang dilewati untuk laporan wilayah. Hitungan yang meleset membuat laporan tidak bisa dipercaya."
      : `Gambaran nyata: saksi berkata "pelaku berjalan melewati ${n} bangunan, lalu menghilang". Petugas yang menghitung bangunan di jalur dengan benar bisa menemukan titik terakhir pelaku.`;
    return {
      sub_type: "FIG-DENAH-LEWAT", tier: Math.min(3, segs + (dense ? 1 : 0)), extra: LEWAT_DEF,
      stem: `${walker} berjalan dari ${x.name} ke ${y.name} melalui ${via.length > 1 ? `${via.slice(0, -1).join(", ")} lalu ${via[via.length - 1]}` : via[0]}. Banyaknya bangunan yang dilalui ${walker} adalah …`,
      opsi: Object.fromEntries(opts.map(([v], i) => [LET[i], String(v)])), kunci: [LET[pos]],
      cap: [`Jalur ${walker}: ${x.name} → ${y.name}`, `Dilalui: ${n} bangunan`],
      over: ring(x, C_REF) + ring(y, C_REF) + tag(x.cx, x.y - 8, "Mulai", C_REF) + tag(y.cx, y.y - 8, "Tujuan", C_REF) + line(path0, C_REF)
        + open.map((o) => tag(o.cx, o.cy, "bukan bangunan", C_NO)).join("") + counted.map((o, i) => ring(o, C_OK) + badge(o, i + 1)).join(""),
      pembahasan: `Langkah 1: Jalur ${walker}: ${via.join(" → ")}. ${x.name} (awal) dan ${y.name} (tujuan) tidak dihitung.\n${steps}\nLangkah ${segs + 2}: ${segs > 1 ? `Jumlahkan: ${fresh.map((l) => l.length).join(" + ")} = ${n}` : `Total: ${n}`} bangunan.${open.length ? ` ${names(open)} bukan bangunan, jadi tidak dihitung.` : ""}<br>Kenapa yang lain salah:\n${why2}\nJawaban: ${n}.<br>${nyata}\nTips: hitung per ruas jalan, sisi kiri dan kanan sekaligus, lalu jumlahkan. Bangunan awal dan tujuan tidak dihitung, dan bangunan di pojok belokan cukup dihitung sekali.`,
    };
  }
  return null;
}

// Pojok persimpangan: blok di arah diagonal d, sel sudut yang menempel ke persimpangan.
const QUAD: Record<number, [number, number, number, number]> = { 1: [1, 0, 0, 1], 3: [1, 1, 0, 0], 5: [0, 1, 1, 0], 7: [0, 0, 1, 1] };
const corner = (p: Peta, i: number, j: number, d: number) => {
  const [dc, dr, sc, sr] = QUAD[d];
  return p.objs.find((o) => o.c === i + dc && o.r === j + dr && o.cells.some((k) => k[0] === sc && k[1] === sr)) ?? null;
};

function pojok(p: Peta, pos: number, used: Set<string>, dense: boolean): Item | null {
  const V = p.streets.filter((s) => s.axis === "V"), Hs = p.streets.filter((s) => s.axis === "H");
  for (const [vi, hj, d] of shuffle([0, 1].flatMap((i) => [0, 1].flatMap((j) => [1, 3, 5, 7].map((q) => [i, j, q]))))) {
    const key = corner(p, vi, hj, d);
    if (!key?.building || used.has(`p${vi}${hj}${d}`)) continue;
    const [dc, dr] = QUAD[d];
    const cand: [Obj | null, string][] = [
      ...([[(8 - d) % 8, "kiri-kanan tertukar"], [(12 - d) % 8, "atas-bawah tertukar"], [(d + 4) % 8, "pojok yang berseberangan"]] as [number, string][])
        .map(([q, w]) => [corner(p, vi, hj, q), `pojok ${DIR[q]} simpang yang sama; ${w}`] as [Obj | null, string]),
      ...p.objs.filter((o) => o.c === vi + dc && o.r === hj + dr && o !== key).map((o) => [o, "satu blok, tapi tidak di sudut yang menempel ke persimpangan"] as [Obj, string]),
      ...[0, 1].flatMap((i) => [0, 1].map((j) => (i === vi && j === hj ? null : [corner(p, i, j, d), `pojok ${DIR[d]} persimpangan lain (${V[i].name} dan ${Hs[j].name})`] as [Obj | null, string]))).filter((c): c is [Obj | null, string] => !!c),
    ];
    const ds: { z: Obj; why: string }[] = [];
    for (const [z, why] of cand) if (z?.building && z !== key && !ds.some((q) => q.z === z) && ds.length < 4) ds.push({ z, why });
    if (ds.length < 4) continue;
    used.add(`p${vi}${hj}${d}`);
    const opts = arrange({ z: key, why: "" }, shuffle(ds), pos), cx = VX[vi], cy = HY[hj];
    const mirror = ds.find((q) => q.why.startsWith("pojok") && !q.why.includes("lain"));
    const why2 = opts.map((o, i) => (o.z === key ? "" : `Opsi ${LET[i].toUpperCase()} (${o.z.name}): ${o.why}.`)).filter(Boolean).join("\n");
    return {
      sub_type: "FIG-DENAH-RELASI", tier: dense ? 2 : 1, extra: RELASI_DEF,
      stem: `Bangunan yang berada di pojok ${DIR[d]} persimpangan ${V[vi].name} dan ${Hs[hj].name} adalah …`,
      opsi: Object.fromEntries(opts.map((o, i) => [LET[i], o.z.name])), kunci: [LET[pos]],
      cap: [`Simpang ${V[vi].name} – ${Hs[hj].name}`, `pojok ${POS[d]} = ${DIR[d]}`],
      over: `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="8" fill="${C_REF}"/>` + ring(key, C_OK) + arrow(at(cx, cy), key, C_OK, "ok", "") + tag(key.cx, key.y - 8, `pojok ${SHORT[d]} ✓`, C_OK)
        + (mirror ? ring(mirror.z, C_NO, true) + tag(mirror.z.cx, mirror.z.y - 8, `${SHORT[[1, 3, 5, 7].find((q) => corner(p, vi, hj, q) === mirror.z)!]} ✗`, C_NO) : ""),
      pembahasan: `Langkah 1: Temukan titik persimpangan ${V[vi].name} dan ${Hs[hj].name}.\nLangkah 2: Pojok ${DIR[d]} = blok di ${POS[d]} persimpangan itu.\nLangkah 3: Bangunan di sudut blok itu yang paling dekat ke persimpangan: ${key.name}.<br>Kenapa yang lain salah:\n${why2}\nJawaban: ${key.name}.<br>Gambaran nyata: laporan kejadian sering menyebut lokasi seperti "pojok ${DIR[d]} simpang ${V[vi].name}–${Hs[hj].name}". Petugas harus langsung menemukan titiknya tanpa salah blok.\nTips: berdiri di titik persimpangan, lalu pakai kompas: kanan-atas = Timur Laut, kanan-bawah = Tenggara, kiri-bawah = Barat Daya, kiri-atas = Barat Laut.`,
    };
  }
  return null;
}

function antara(p: Peta, pos: number, used: Set<string>, dense: boolean): Item | null {
  for (const st of shuffle(p.streets)) for (const d of shuffle(st.axis === "V" ? [2, 6] : [0, 4])) {
    if (used.has(`a${st.name}${d}`)) continue;
    const pair = p.streets.filter((s) => s.axis !== st.axis), other = p.streets.find((s) => s.axis === st.axis && s !== st)!;
    const inBand = (o: Obj) => (st.axis === "V" ? o.r === 1 : o.c === 1);
    const hit = p.objs.filter((o) => inBand(o) && sideDir(o, st) === d);
    if (hit.length !== 1 || !hit[0].building) continue;
    const key = hit[0], opp = (d + 4) % 8;
    const cand: [Obj | undefined, string][] = [
      ...p.objs.filter((o) => inBand(o) && sideDir(o, st) === opp).map((o) => [o, `sisi ${DIR[opp]} ${st.name}; sisinya tertukar`] as [Obj, string]),
      ...p.objs.filter((o) => !inBand(o) && sideDir(o, st) === d).map((o) => [o, `sisi ${DIR[d]} ${st.name}, tapi tidak di antara ${pair[0].name} dan ${pair[1].name}`] as [Obj, string]),
      ...p.objs.filter((o) => inBand(o) && o.c === key.c && o.r === key.r && o !== key).map((o) => [o, `di antara kedua jalan, tapi tidak menempel ke ${st.name}`] as [Obj, string]),
      ...p.objs.filter((o) => inBand(o) && sideDir(o, other) >= 0).map((o) => [o, `menempel ke ${other.name}, bukan ${st.name}`] as [Obj, string]),
    ];
    const ds: { z: Obj; why: string }[] = [];
    for (const [z, why] of cand) if (z?.building && z !== key && !ds.some((q) => q.z === z) && ds.length < 4) ds.push({ z, why });
    if (ds.length < 4) continue;
    used.add(`a${st.name}${d}`);
    const opts = arrange({ z: key, why: "" }, shuffle(ds), pos), swap = ds.find((q) => q.why.includes("tertukar"));
    const band = st.axis === "V" ? rect(M, HY[0] + R / 2, W - 2 * M, HY[1] - HY[0] - R, C_REF, 'opacity=".12"') : rect(VX[0] + R / 2, TOP, VX[1] - VX[0] - R, H - TOP - M, C_REF, 'opacity=".12"');
    const why2 = opts.map((o, i) => (o.z === key ? "" : `Opsi ${LET[i].toUpperCase()} (${o.z.name}): ${o.why}.`)).filter(Boolean).join("\n");
    return {
      sub_type: "FIG-DENAH-RELASI", tier: dense ? 3 : 2, extra: RELASI_DEF,
      stem: `Bangunan yang terletak di antara ${pair[0].name} dan ${pair[1].name} serta berbatasan langsung dengan sisi ${DIR[d]} ${st.name} adalah …`,
      opsi: Object.fromEntries(opts.map((o, i) => [LET[i], o.z.name])), kunci: [LET[pos]],
      cap: [`Di antara ${pair[0].name} dan ${pair[1].name}`, `sisi ${DIR[d]} ${st.name}`],
      over: band + ring(key, C_OK) + tag(key.cx, key.y - 8, `sisi ${SHORT[d]} ✓`, C_OK) + (swap ? ring(swap.z, C_NO, true) + tag(swap.z.cx, swap.z.y - 8, `sisi ${SHORT[opp]} ✗`, C_NO) : ""),
      pembahasan: `Langkah 1: Cari ${pair[0].name} dan ${pair[1].name}; daerah di antaranya adalah ${st.axis === "V" ? "baris" : "kolom"} tengah peta (diarsir biru di gambar).\nLangkah 2: Sisi ${DIR[d]} ${st.name} = sebelah ${POS[d]} jalan itu.\nLangkah 3: Bangunan di daerah itu yang menempel ke ${st.name}: ${key.name}.<br>Kenapa yang lain salah:\n${why2}\nJawaban: ${key.name}.<br>Gambaran nyata: petugas menerima pesan "titik kumpul di gedung antara ${pair[0].name} dan ${pair[1].name}, sisi ${DIR[d]} ${st.name}". Dua patokan jalan dipakai supaya lokasinya tidak tertukar dengan blok sebelah.\nTips: tandai dulu daerah di antara dua jalan yang disebut, baru pilih sisi jalannya. Semua syarat harus terpenuhi, bukan salah satu.`,
    };
  }
  return null;
}

// ---------- RUTE di peta hitam-putih (jaringan jalan tidak seragam) ----------
const ring2 = (o: { x: number; y: number; w: number; h: number }, c: string, dash = false) => rect(o.x - 5, o.y - 5, o.w + 10, o.h + 10, "none", `rx="7" stroke="${c}" stroke-width="3"${dash ? ' stroke-dasharray="6 4"' : ""}`);
const up = (h: number) => h === 2 || h === 4; // Timur/Selatan = koordinat naik
const al = (o: Bld, s: St) => (s.axis === "V" ? o.cy : o.cx);
// Objek di sisi `side` jalan s, di depan posisi `at` searah h, urut terdekat.
const ahead2 = (p: Map2, s: St, h: number, side: number, at: number) => p.objs
  .filter((o) => side2(o, s) === side && (up(h) ? al(o, s) > at : al(o, s) < at))
  .sort((a, b) => Math.abs(al(a, s) - at) - Math.abs(al(b, s) - at));
const first2 = (l: Bld[], k: number) => (l.slice(0, k + 1).every((o) => o.building) ? l[k] ?? null : null);
const pt2 = (s: St, v: number) => (s.axis === "V" ? [s.c, v] : [v, s.c]);

function rute2(p: Map2, pos: number, turns: number, walker: string): Item | null {
  for (let tries = 0; tries < 800; tries++) {
    const x = pick(p.objs.filter((o) => o.building));
    const s0 = pick(p.streets.filter((s) => side2(x, s) >= 0));
    if (!s0) continue;
    let h = s0.axis === "V" ? pick([0, 4]) : pick([2, 6]), st = s0, at = al(x, s0), ok = true;
    const steps: { st: St; h: number; turn: "kiri" | "kanan"; cross: St; at: number }[] = [];
    for (let t = 0; t < turns && ok; t++) {
      const cross = shuffle(p.streets.filter((c) => c.axis !== st.axis && meets(st, c) && (up(h) ? c.c > at + 20 : c.c < at - 20)))[0];
      const turn = pick(["kiri", "kanan"] as const), nh = turn === "kiri" ? left(h) : right(h);
      // Jalan baru harus berlanjut ke arah belokan (pertigaan hanya bisa dibelok ke sisi yang ada jalannya).
      if (!cross || (up(nh) ? cross.a1 < st.c + 70 : cross.a0 > st.c - 70)) { ok = false; break; }
      steps.push({ st, h, turn, cross, at });
      at = st.c; h = nh; st = cross;
    }
    if (!ok || steps.length !== turns) continue;
    const last = steps[turns - 1], K = pick(["kiri", "kanan"] as const), notK = K === "kiri" ? "kanan" : "kiri";
    const dirFor = (hd: number, nm: string) => (nm === "kiri" ? left(hd) : right(hd));
    const side = dirFor(h, K), rev = (h + 4) % 8, list = ahead2(p, st, h, side, at);
    const key = first2(list, 0);
    if (!key || key === x || (list[1] && Math.abs(al(list[1], st) - al(key, st)) < 14)) continue;
    const cand: [Bld | null, string][] = [
      [first2(ahead2(p, st, h, dirFor(h, notK), at), 0), `ada di sisi ${notK}; kiri dan kanan tertukar`],
      [first2(ahead2(p, st, rev, dirFor(rev, K), at), 0), `itu kalau belokan terakhir salah arah (belok ${last.turn === "kiri" ? "kanan" : "kiri"})`],
      [first2(ahead2(p, last.st, last.h, dirFor(last.h, K), last.cross.c), 0), `itu kalau ${walker} lupa belok di ${last.cross.name} dan jalan lurus terus`],
      [first2(list, 1), "itu bangunan kedua; yang pertama terlewat"],
      [first2(ahead2(p, st, rev, dirFor(rev, notK), at), 0), "itu kalau belokan terakhir salah arah dan sisinya juga tertukar"],
      [first2(ahead2(p, st, h, dirFor(h, notK), at), 1), `itu bangunan kedua di sisi ${notK}`],
    ];
    const ds: { z: Bld; why: string }[] = [];
    for (const [z, why] of cand) if (z && z !== key && z !== x && !ds.some((q) => q.z === z) && ds.length < 4) ds.push({ z, why });
    if (ds.length < 4) continue;
    const opts = arrange({ z: key, why: "" }, shuffle(ds), pos), heads = [...steps.map((q) => q.h), h];
    const tier = turns === 3 || heads.includes(4) ? 3 : turns === 1 && heads.every((q) => q === 0 || q === 2) ? 1 : 2;
    const nh = (i: number) => (i + 1 < turns ? steps[i + 1].h : h);
    const route = steps.map((q, i) => `${i ? "lalu di" : "Di"} persimpangan ${q.cross.name} ia belok ${q.turn}`).join(", ");
    const trace = steps.map((q, i) => `Langkah ${i + 2}: Di ${q.cross.name} belok ${q.turn}. Menghadap ${DIR[q.h]}, ${q.turn}nya adalah ${DIR[nh(i)]}. Sekarang menghadap ${DIR[nh(i)]}.`).join("\n");
    const why2 = opts.map((o, i) => (o.z === key ? "" : `Opsi ${LET[i].toUpperCase()} (${o.z.name}): ${o.why}.`)).filter(Boolean).join("\n");
    const path = [pt2(s0, al(x, s0)), ...steps.map((q) => pt2(q.st, q.cross.c)), pt2(st, al(key, st))];
    const swap = ds.find((q) => q.why.startsWith("ada di sisi"));
    const nyata = story++ % 2
      ? `Gambaran nyata: seperti memandu ambulans lewat telepon. Sopir yang menghadap ${DIR[h]} melihat ${DIR[left(h)]} di kirinya dan ${DIR[right(h)]} di kanannya${h === 4 ? ", kebalikan dari kiri-kanan layar" : ""}.`
      : "Gambaran nyata: kamu memandu mobil patroli lewat HT. Sopir hanya melihat jalan di depannya, jadi perintah belok kiri/kanan harus dihitung dari arah hadap sopir, bukan dari peta.";
    const tips = heads.includes(4)
      ? "Tips: putar badan atau HP-mu mengikuti arah jalan. Saat menghadap Selatan (ke bawah peta), kiri jadi Timur dan kanan jadi Barat, kebalikan dari yang terlihat di layar."
      : 'Tips: setiap kali belok, ucapkan dalam hati "sekarang aku menghadap ..." supaya arah tidak tertukar.';
    return {
      sub_type: "FIG-DENAH-RUTE", tier,
      stem: `${walker} keluar dari ${x.name} ke ${s0.name}, lalu berjalan ke arah ${DIR[steps[0].h]}. ${route}. Bangunan pertama di sebelah ${K} ${walker} setelah belokan terakhir adalah …`,
      opsi: Object.fromEntries(opts.map((o, i) => [LET[i], o.z.name])), kunci: [LET[pos]],
      cap: [`Jalur ${walker}: ${turns} belokan`, `Menghadap ${DIR[h]}, ${K} = ${DIR[side]}`],
      over: ring2(x, C_REF) + ring2(key, C_OK) + (swap ? ring2(swap.z, C_NO, true) + tag(swap.z.cx, swap.z.cy, `${notK} ✗`, C_NO) : "")
        + `<polyline points="${path.map((q) => q.map(f1).join(",")).join(" ")}" fill="none" stroke="${C_REF}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" opacity=".9" marker-end="url(#ref)"/>`
        + `<circle cx="${f1(path[0][0])}" cy="${f1(path[0][1])}" r="6" fill="${C_REF}"/>` + tag(x.cx, x.cy, "Mulai", C_REF)
        + steps.map((q, i) => { const [qx, qy] = path[i + 1]; return `<circle cx="${f1(qx)}" cy="${f1(qy)}" r="10" fill="${C_REF}"/><text x="${f1(qx)}" y="${f1(qy + 4.5)}" text-anchor="middle" font-size="13" font-weight="700" fill="#fff" ${FONT}>${i + 1}</text>` + tag(qx + (qx > W / 2 ? 46 : -46), qy, `${q.turn} → ${SHORT[nh(i)]}`, C_REF); }).join("")
        + tag(key.cx, key.cy, `${K} ✓`, C_OK),
      pembahasan: `Langkah 1: ${walker} keluar dari ${x.name} ke ${s0.name}, menghadap ${DIR[steps[0].h]}.\n${trace}\nLangkah ${turns + 2}: Menghadap ${DIR[h]}, sisi ${K} = ${DIR[side]}. Bangunan pertama di sisi itu: ${key.name}.<br>Kenapa yang lain salah:\n${why2}\nJawaban: ${key.name}.<br>${nyata}\n${tips}`,
    };
  }
  return null;
}

// ---------- utama ----------
const items: Item[] = [];
const BANK = path.join(ROOT, "bank/drill/kecerdasan/K17-denah-arah.json");
const OLD = new Map<string, Item>(fs.existsSync(BANK) ? (JSON.parse(fs.readFileSync(BANK, "utf8")) as Item[]).map((i) => [i.id as string, i]) : []);
let n = 0;
const DEFS = MK("ok", C_OK) + MK("no", C_NO) + MK("ref", C_REF);
function emit(m: number, p: Peta, set: Item[], bw?: Map2) {
  const img = `drill/img/K17-peta-${String(m).padStart(2, "0")}.svg`;
  fs.writeFileSync(path.join(ROOT, "public", img), bw ? renderMap2(bw, m) : renderSvg(p, m));
  for (const s of set) {
    const id = `K17-N-${String(++n).padStart(3, "0")}`, pb = `${id}.svg`;
    const ex = s as { cap: string[]; over: string };
    fs.writeFileSync(path.join(ROOT, "data/drill-pembahasan", pb), bw ? renderMap2(bw, m, { ...ex, defs: DEFS }) : renderSvg(p, m, ex));
    // Status cek buta tetap berlaku selama stem/opsi/kunci tidak berubah; berubah = harus dicek ulang.
    const was = OLD.get(id), same = was && JSON.stringify([was.stem, was.opsi, was.kunci]) === JSON.stringify([s.stem, s.opsi, s.kunci]);
    items.push({ id, kartu: "K17", sub_type: s.sub_type, tier: s.tier, sumber: "baru", instruksi: INSTRUKSI + ((s.extra as string) ?? ""), stem: s.stem, gambar: img, opsi: s.opsi, kunci: s.kunci, pembahasan: s.pembahasan, gambar_pembahasan: pb, status_kunci: same ? was.status_kunci : "tunggal" });
  }
}

// Peta 1–10: ARAH + RUTE (batch 13, sudah dicek buta — urutan acak jangan diubah).
const positions = shuffle(Array.from({ length: 50 }, (_, i) => i % 5));
for (let m = 1; m <= 10; m++) {
  for (let attempt = 0; ; attempt++) {
    reseed(1700 + m * 101 + attempt);
    const p = makePeta(), used = new Set<string>(), base = n;
    const walkers = shuffle(WALKERS);
    const set = [
      arahBangunan(p, positions[base], used), arahBangunan(p, positions[base + 1], used), arahArah(p, positions[base + 2], used),
      rute(p, positions[base + 3], 1 + (m % 2), walkers[0]), rute(p, positions[base + 4], 2 + (m % 2), walkers[1]),
    ];
    if (set.some((s) => !s)) continue;
    emit(m, p, set as Item[]);
    break;
  }
}

// Peta 11–22: LEWAT + RELASI; peta 12, 16, 20 padat (17–20 bangunan) untuk tier 3.
const posB = shuffle(Array.from({ length: 60 }, (_, i) => i % 5));
for (let m = 11; m <= 22; m++) {
  const dense = m % 4 === 0, nL = m % 2 ? 3 : 2;
  for (let attempt = 0; ; attempt++) {
    reseed(2900 + m * 101 + attempt);
    const p = dense ? makePeta(17, 20) : makePeta(), used = new Set<string>(), base = n - 50;
    const walkers = shuffle(WALKERS);
    const set: (Item | null)[] = [];
    for (let k = 0; k < 5; k++)
      set.push(k < nL ? lewat(p, posB[base + k], 1 + ((m + k) % 3), walkers[k], dense)
        : (m + k) % 2 ? pojok(p, posB[base + k], used, dense) : antara(p, posB[base + k], used, dense));
    if (set.some((s) => !s)) continue;
    emit(m, p, set as Item[]);
    break;
  }
}

// Peta 23–34: gaya hitam-putih, jaringan jalan tidak seragam; ARAH + RUTE (batch 15).
const posC = shuffle(Array.from({ length: 60 }, (_, i) => i % 5));
ringFn = ring2;
for (let m = 23; m <= 34; m++) {
  const nA = m % 2 ? 2 : 3;
  for (let attempt = 0; ; attempt++) {
    reseed(7300 + m * 97 + attempt);
    const bw = makeMap2(), p = bw as unknown as Peta, used = new Set<string>(), base = n - 110;
    const walkers = shuffle(WALKERS);
    const set: (Item | null)[] = [];
    for (let k = 0; k < 5; k++)
      set.push(k < nA ? (k === nA - 1 ? arahArah(p, posC[base + k], used) : arahBangunan(p, posC[base + k], used))
        : rute2(bw, posC[base + k], 1 + ((m + k) % 3), walkers[k]));
    if (set.some((s) => !s)) continue;
    emit(m, p, set as Item[], bw);
    break;
  }
}
fs.writeFileSync(BANK, JSON.stringify(items, null, 2) + "\n");
const count = (k: string, v: unknown) => items.filter((i) => i[k] === v).length;
console.log(`${items.length} soal · ${["ARAH", "RUTE", "LEWAT", "RELASI"].map((t) => `${t} ${count("sub_type", `FIG-DENAH-${t}`)}`).join(" ")} · tier ${[1, 2, 3].map((t) => count("tier", t)).join("/")} · ${OLD.size ? items.filter((i) => i.status_kunci === "tunggal").length + " perlu cek buta" : ""}`);
