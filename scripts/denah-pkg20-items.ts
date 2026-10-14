import assert from "node:assert/strict";
import { sideOf, W, H, M, TOP, type Map2, type Bld, type St } from "./denah-k17-bw";
import { pick, shuffle, DIR, SHORT, bearing, sectorOf, angDiff, tag, f1, FONT, C_OK, C_NO, C_REF, type Obj } from "./denah-k17-peta";
import { LET, POS, MOVE, arrange, ring2, safeKey, type Item } from "./denah-k17-soal-bw";
import { sim, walkCheck, turnTo, ahead, turnOk, al, pt, type RouteSpec, type SimOpt, type Dir } from "./denah-pkg20-sim";

// Butir prototipe paket 20: RUTE (slot 40, peta A) dan ROTASI (slot 42, peta B). Lihat generate-kecerdasan-denah-20.ts.
const ORD = ["pertama", "kedua", "ketiga", "keempat"];
const flip = (d: Dir): Dir => (d === "kiri" ? "kanan" : "kiri");
const O = (b: Bld) => b as unknown as Obj;
const poly = (pts: number[][], c: string, mk: string) => `<polyline points="${pts.map((q) => q.map(f1).join(",")).join(" ")}" fill="none" stroke="${c}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" opacity=".9" marker-end="url(#${mk})"/>`;
const dot = (q: number[], n: number | string) => `<circle cx="${f1(q[0])}" cy="${f1(q[1])}" r="10" fill="${C_REF}"/><text x="${f1(q[0])}" y="${f1(q[1] + 4.5)}" text-anchor="middle" font-size="13" font-weight="700" fill="#fff" ${FONT}>${n}</text>`;
const clamp = (x: number, y: number, t: string) => { const w = t.length * 7 + 14; return [Math.min(Math.max(x, w / 2 + M + 4), W - w / 2 - M - 4), Math.min(Math.max(y, TOP + 16), H - M - 16)]; };
const tagIn = (x: number, y: number, t: string, c: string) => { const [cx, cy] = clamp(x, y, t); return tag(cx, cy, t, c); };
const two = (lines: string[]) => lines.join(" ");
const VEC = [[0, -1], [0, -1], [1, 0], [0, 1], [0, 1], [0, 1], [-1, 0], [0, -1]];
/** Tag belokan diletakkan di sisi luar sudut jalur (diagonal berlawanan dengan kedua ruas), supaya tidak menutupi garis. */
const turnTag = (q: number[], hIn: number, hOut: number, t: string) => {
  const w = t.length * 7 + 14, dx = VEC[hIn][0] - VEC[hOut][0], dy = VEC[hIn][1] - VEC[hOut][1];
  return tagIn(q[0] + Math.sign(dx) * (w / 2 + 12), q[1] + Math.sign(dy) * 22, t, C_REF);
};
/** Persimpangan yang dilewati saat menghitung (bulatan kosong bernomor). */
const passed = (l: { st: St; n: number; crossings: St[] }) => l.crossings.slice(0, l.n - 1).map((c, j) => {
  const q = pt(l.st, c.c);
  return `<circle cx="${f1(q[0])}" cy="${f1(q[1])}" r="9" fill="#fff" stroke="${C_REF}" stroke-width="2.5"/><text x="${f1(q[0])}" y="${f1(q[1] + 4.2)}" text-anchor="middle" font-size="12" font-weight="700" fill="${C_REF}" ${FONT}>${j + 1}</text>`;
}).join("");

/** Susun belokan secara konstruktif: tiap langkah memilih (persimpangan ke-n, arah) yang benar-benar bisa dibelok. */
function makeTurns(p: Map2, s0: St, h0: number, at0: number, count: number) {
  const turns: { n: number; dir: Dir }[] = [];
  let st = s0, h = h0, at = at0;
  for (let t = 0; t < count; t++) {
    const opts = ahead(p, st, h, at).slice(0, 3).flatMap((c, i) => (["kiri", "kanan"] as Dir[]).filter((d) => turnOk(st, h, c, d)).map((d) => ({ n: i + 1, dir: d, c })));
    if (!opts.length) return null;
    const o = pick(opts.some((q) => q.n >= 2) ? opts.filter((q) => q.n >= 2) : opts); // condong ke hitungan ≥ 2 (lapis hitung persimpangan)
    turns.push({ n: o.n, dir: o.dir }); at = st.c; h = turnTo(h, o.dir); st = o.c;
  }
  return turns;
}

// ---------------- RUTE ----------------
export const INSTRUKSI_RUTE = "Gunakan denah. Utara di atas peta. Arah diukur dari titik tengah bangunan. Belok kiri/kanan dihitung dari arah hadap pejalan, bukan dari layar. Persimpangan dihitung searah gerak dari tempat pejalan berada, pertigaan ikut dihitung, dan persimpangan yang baru saja dibelokinya tidak dihitung lagi. Bangunan di sebelah kiri/kanan = bangunan yang berbatasan langsung dengan jalan yang sedang dilalui, dihitung mulai dari persimpangan terakhir. Lapangan bukan bangunan.";
type Mut = { id: string; short: string; why: string; key: Bld };

/** `count` belokan dan yang dicari bangunan ke-`m` (prototipe 40: 3 belokan, bangunan kedua). */
export function rute20(p: Map2, pos: number, walker: string, count = 3, m = 2): Item | null {
  for (let tries = 0; tries < 3000; tries++) {
    const x = pick(p.objs.filter((o) => o.building));
    const cs = p.streets.filter((s) => sideOf(x, s) >= 0);
    if (!cs.length) continue;
    const s0 = pick(cs), h0 = s0.axis === "V" ? pick([0, 4]) : pick([2, 6]);
    const turns = makeTurns(p, s0, h0, al(x, s0), count);
    if (!turns) continue;
    const sp: RouteSpec = { x, s0, h0, turns, K: pick(["kiri", "kanan"] as Dir[]), m };
    if (turns.filter((t) => t.n >= 2).length < 2 || turns.every((t) => t.dir === turns[0].dir)) continue;
    const r = sim(p, sp);
    if (!r) continue;
    const heads = [h0, ...r.legs.map((l) => turnTo(l.h, l.turn))];
    if (!heads.some((h) => h === 4 || h === 6)) continue;
    // Pemeriksa independen + sapuan tafsir (margin hitung persimpangan, jarak sampel sisi) harus sama dengan sim.
    if ([1, 20, 30].some((mg) => sim(p, sp, { margin: mg })?.key !== r.key)) continue;
    if ([[20, 20], [20, 24], [20, 28], [1, 22], [30, 22]].some(([mg, off]) => walkCheck(p, sp, mg, off) !== r.key)) continue;

    // Pengecoh = satu kesalahan bernama, dihitung ulang dengan sim yang sama memakai spesifikasi yang diubah.
    const cand: Mut[] = [];
    const add = (id: string, short: string, why: string, spec: RouteSpec, o: SimOpt = {}) => { const q = sim(p, spec, { lenient: true, ...o }); if (q && q.key !== r.key && !cand.some((c) => c.key === q.key)) cand.push({ id, short, why, key: q.key }); };
    const notK = flip(sp.K), L = turns.length - 1;
    add("ord-", `${ORD[m - 2]} ✗`, `itu bangunan ${ORD[m - 2]} di sisi ${sp.K}; yang ditanya bangunan ${ORD[m - 1]} (hitungan kurang satu)`, { ...sp, m: m - 1 });
    add("sisi", `${notK} ✗`, `itu bangunan kedua di sisi ${notK}; kiri dan kanan tertukar di akhir`, { ...sp, K: notK });
    add("dirL", "belok terbalik ✗", `itu hasil bila belokan ke-${L + 1} diambil ke ${flip(turns[L].dir)}, bukan ${turns[L].dir} (kiri-kanan tertukar saat berbelok)`, { ...sp, turns: turns.map((t, i) => (i === L ? { ...t, dir: flip(t.dir) } : t)) });
    add("skipT", "pertigaan ✗", "itu hasil bila pertigaan tidak dihitung sebagai persimpangan, sehingga hitungan persimpangan bergeser", sp, { skipT: true });
    for (const [i, t] of turns.entries()) for (const dn of [1, -1]) if (t.n + dn >= 1) add(`n${i}${dn}`, `ke-${t.n + dn} ✗`, `itu hasil bila belokan ke-${i + 1} diambil di persimpangan ke-${t.n + dn}, bukan ke-${t.n} (salah hitung persimpangan)`, { ...sp, turns: turns.map((u, j) => (j === i ? { ...u, n: t.n + dn } : u)) });
    for (const i of [0, 1]) add(`dir${i}`, `belok ${i + 1} ✗`, `itu hasil bila belokan ke-${i + 1} diambil ke ${flip(turns[i].dir)}, bukan ${turns[i].dir}; sejak belokan itu jalurnya melenceng`, { ...sp, turns: turns.map((u, j) => (j === i ? { ...u, dir: flip(u.dir) } : u)) });
    add("ord+", `${ORD[m]} ✗`, `itu bangunan ${ORD[m]}; hitungan kebablasan satu bangunan`, { ...sp, m: m + 1 });
    // Urutan: 'hampir benar' (ord-) selalu ikut; tiga lainnya dari kesalahan yang berbeda jenis.
    const ds = [cand.find((c) => c.id === "ord-"), cand.find((c) => c.id === "sisi"), cand.find((c) => c.id === "dirL"), cand.find((c) => c.id === "skipT"), ...cand].filter((c, i, a): c is Mut => !!c && a.indexOf(c) === i).slice(0, 4);
    if (ds.length < 4 || ds[0].id !== "ord-") continue;
    const opts = arrange({ id: "", short: "", why: "", key: r.key }, shuffle(ds), pos);
    // D-3: kunci tidak boleh satu-satunya "R. nama" atau satu-satunya gedung umum di antara opsi.
    if (opts.filter((o) => o.key.name.startsWith("R. ") === r.key.name.startsWith("R. ")).length < 2) continue;
    const names = opts.map((o) => o.key.name);
    assert.equal(new Set(names).size, 5);

    const hn = (h: number) => DIR[h];
    const trace = r.legs.map((l, i) => `Ruas ${i + 1}: menyusuri ${l.st.name} menghadap ${hn(l.h)}; persimpangan berurutan ${l.crossings.slice(0, l.n).map((c, j) => `ke-${j + 1} ${c.name}`).join(", ")}; belok ${l.turn} di ke-${l.n}, ${l.turn}nya ${hn(heads[i + 1])}, kini menghadap ${hn(heads[i + 1])}.`);
    const p1 = `Ada tiga lapis aturan: (1) kiri/kanan dihitung dari arah hadap pejalan, bukan dari layar; (2) tiap belokan ditentukan oleh hitungan persimpangan yang dimulai ulang setelah setiap belokan, pertigaan ikut dihitung; (3) yang dicari bangunan ${ORD[m - 1]} di satu sisi jalan, dihitung dari persimpangan terakhir. ${two([`${walker} keluar dari ${x.name} ke ${s0.name} dan menghadap ${hn(h0)}.`, ...trace, `Di ${r.st.name} ia menghadap ${hn(r.h)}, sisi ${sp.K} adalah ${hn(r.side)}; bangunan di sisi itu berurutan ${r.list.slice(0, m).map((b, i) => `${ORD[i]} ${b.name}`).join(", ")}.`])}`;
    const p2 = `${opts.map((o, i) => (o.id ? `Opsi ${LET[i]} (${o.key.name}) gugur: ${o.why}.` : "")).filter(Boolean).join(" ")} Opsi ${LET[pos]} (${r.key.name}) cocok dengan ketiga lapis: bangunan ${ORD[m - 1]} di sisi ${sp.K} ${r.st.name} setelah belokan terakhir. Jawaban: ${LET[pos]}.`;
    const near = ds[0], q = r.pts, last = q[q.length - 2];
    const route = r.legs.map((l, i) => passed(l) + dot(q[i + 1], i + 1) + turnTag(q[i + 1], l.h, heads[i + 1], `ke-${l.n} ${l.turn} → ${SHORT[heads[i + 1]]}`)).join("");
    return {
      sub_type: "FIG-DENAH-RUTE", tier: 3, instruksi: INSTRUKSI_RUTE,
      stem: `${walker} keluar dari ${x.name} ke ${s0.name}, lalu berjalan ke arah ${DIR[h0]}. ${turns.map((t, i) => `${i ? "lalu di persimpangan" : "Di persimpangan"} ${ORD[t.n - 1]}${i ? " berikutnya" : ""} ia belok ${t.dir}`).join(", ")}. Bangunan ${ORD[m - 1]} di sebelah ${sp.K} ${walker} setelah belokan terakhir adalah …`,
      opsi: Object.fromEntries(opts.map((o, i) => [LET[i], o.key.name])), kunci: [LET[pos]],
      cap: [`Jalur ${walker}: ${count} belokan, hitung persimpangan`, `Menghadap ${DIR[r.h]}, ${sp.K} = ${DIR[r.side]}: bangunan ke-${m}`],
      over: ring2(x, C_REF) + ring2(r.key, C_OK) + ring2(near.key, C_NO, true) + poly(q.slice(0, -1), C_REF, "ref") + poly([last, q[q.length - 1]], C_OK, "ok")
        + `<circle cx="${f1(q[0][0])}" cy="${f1(q[0][1])}" r="6" fill="${C_REF}"/>` + route + tagIn(x.cx, x.cy, "Mulai", C_REF)
        + tagIn(near.key.cx, near.key.cy, near.short, C_NO) + tagIn(r.key.cx, r.key.cy, `${sp.K} ke-${m} ✓`, C_OK),
      pembahasan: `${p1}\n\n${p2}`, ans: r.key.name, ds: opts.map((o) => o.id), proof: { sim: r.key.name, walk: walkCheck(p, sp)!.name }, spec: { start: x.name, street: s0.name, h0: DIR[h0], turns, K: sp.K, m: sp.m },
    };
  }
  return null;
}

// ---------------- ROTASI ----------------
export const INSTRUKSI_ROTASI = "Gunakan denah. Peta tidak menghadap Utara: arah ditentukan oleh kompas. Belok kiri/kanan dihitung dari arah hadap pejalan. Berhenti di depan sebuah bangunan = berada di jalan tepat di sampingnya. Arah diukur dari titik tengah bangunan. Berputar di tempat searah jarum jam: Utara → Timur Laut → Timur → Tenggara → Selatan → Barat Daya → Barat → Barat Laut; satu langkah = 45°. Lapangan bukan bangunan.";
const rot = (v: number[], deg: number) => { const a = deg * Math.PI / 180; return [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)]; }; // searah jarum jam di layar (y turun)
const vec = (b: number[], a: number[]) => [b[0] - a[0], b[1] - a[1]];

export function rotasi20(p: Map2, k: number, pos: number, walker: string): Item | null {
  const B = p.objs.filter((o) => o.building), scr = (d: number) => (d + 2 * k) % 8, cmp = (s: number) => (s - 2 * k + 16) % 8;
  for (let tries = 0; tries < 3000; tries++) {
    const x = pick(B), cs = p.streets.filter((s) => sideOf(x, s) >= 0);
    if (!cs.length) continue;
    const s0 = pick(cs), h0 = s0.axis === "V" ? pick([0, 4]) : pick([2, 6]);
    const turns = makeTurns(p, s0, h0, al(x, s0), 2);
    if (!turns) continue;
    const sp: RouteSpec = { x, s0, h0, turns, K: pick(["kiri", "kanan"] as Dir[]), m: 1 };
    if (turns[0].dir === turns[1].dir) continue;
    const r = sim(p, sp);
    if (!r || walkCheck(p, sp) !== r.key || walkCheck(p, sp, 30, 24) !== r.key || sim(p, sp, { margin: 1 })?.key !== r.key) continue;
    const Z = r.key, hf = r.h, cw = pick([true, false]), nDeg = pick([135, 225]), st = nDeg / 45, sg = cw ? 1 : -1;
    const fs = (hf + sg * st + 16) % 8, fc = cmp(fs), arah = cw ? "searah" : "berlawanan arah";
    const br = (b: Bld, z: Bld = Z) => bearing(z.cx, z.cy, b.cx, b.cy);
    const clear = (b: Bld, s: number, z: Bld = Z) => sectorOf(br(b, z)) === s && angDiff(br(b, z), s * 45) <= 10;
    const Ys = shuffle(B.filter((b) => b !== Z && safeKey(O(Z), O(b)) === fs));
    if (!Ys.length) continue;
    const Y = Ys[0];
    // Pengecoh: satu kesalahan bernama = satu sektor berbeda dari Z.
    const err: { id: string; s: number; why: string; z?: Bld }[] = [
      { id: "kompas", s: fc, why: `jebakan arah layar: arah akhir ${DIR[fc]} dibaca seakan atas peta = Utara` },
      { id: "balik", s: (hf - sg * st + 16) % 8, why: "arah putar terbalik (searah tertukar dengan berlawanan arah)" },
      { id: "kurang", s: (hf + sg * (st - 1) + 16) % 8, why: `putaran kurang satu langkah, baru ${nDeg - 45}°` },
      { id: "lebih", s: (hf + sg * (st + 1) + 16) % 8, why: `putaran kelebihan satu langkah, jadi ${nDeg + 45}°` },
      { id: "belum", s: hf, why: "memakai arah hadap sebelum berputar (putaran terlupa)" },
      { id: "lawan", s: (fs + 4) % 8, why: "kebalikan arah akhir" },
    ];
    const Z2 = sim(p, { ...sp, m: 2 }, { lenient: true })?.key;
    const used = new Set<Bld>([Z, Y]);
    const ds: { id: string; s: number; why: string; z: Bld }[] = [];
    const take = (e: { id: string; s: number; why: string }, z?: Bld) => {
      if (e.s === fs || ds.some((d) => d.s === e.s)) return false;
      const b = shuffle(B).find((q) => !used.has(q) && clear(q, e.s));
      if (!b) return false;
      used.add(b); ds.push({ ...e, z: b }); return true;
    };
    for (const id of ["kompas", "balik"]) if (!take(err.find((e) => e.id === id)!)) break;
    if (ds.length < 2 || !(take(err[2]) || take(err[3]))) continue;
    for (const e of [err[4], err[5], err[2], err[3]]) if (ds.length < 4) take(e);
    if (ds.length < 4 && Z2) {
      const b = shuffle(B).find((q) => !used.has(q) && q !== Z2 && safeKey(O(Z2), O(q)) === fs && sectorOf(br(q)) !== fs && angDiff(br(q), sectorOf(br(q)) * 45) <= 10 && !ds.some((d) => d.s === sectorOf(br(q))));
      if (b) { used.add(b); ds.push({ id: "z2", s: sectorOf(br(b)), why: `salah tempat berhenti: ${Z2.name} adalah bangunan kedua di sisi ${sp.K}, padahal ia berhenti di bangunan pertama (${Z.name})`, z: b }); }
    }
    if (ds.length < 4) continue;
    ds.length = 4;
    const opts = arrange({ id: "", s: fs, why: "", z: Y }, shuffle(ds), pos);
    if (opts.filter((o) => o.z.name.startsWith("R. ") === Y.name.startsWith("R. ")).length < 2) continue;
    // Bukti tunggal: vektor hadap hasil putaran nyata (matriks putar) vs vektor ke tiap opsi; tepat satu opsi dalam ±22,5°.
    const v0 = [[0, -1], [0, -1], [1, 0], [0, 1], [0, 1], [0, 1], [-1, 0], [0, -1]][h0];
    const nvec = rot([0, -1], k * 90); // Utara di layar
    assert.deepEqual(rot(nvec, ((h0 - 2 * k + 16) % 8) * 45).map((v) => Math.round(v) + 0), v0, "kompas ≠ arah layar awal");
    const hfV = [[0, -1], [0, -1], [1, 0], [0, 1], [0, 1], [0, 1], [-1, 0], [0, -1]][hf];
    const fv = rot(hfV, sg * nDeg);
    const hit = opts.filter((o) => { const w = vec([o.z.cx, o.z.cy], [Z.cx, Z.cy]); return Math.abs(Math.atan2(fv[0] * w[1] - fv[1] * w[0], fv[0] * w[0] + fv[1] * w[1])) * 180 / Math.PI < 22.5; });
    if (hit.length !== 1 || hit[0].z !== Y) continue;

    const near = [...ds].sort((a, b) => Math.min((a.s - fs + 8) % 8, (fs - a.s + 8) % 8) - Math.min((b.s - fs + 8) % 8, (fs - b.s + 8) % 8))[0];
    const hc = (h: number) => DIR[cmp(h)];
    const heads = [h0, ...r.legs.map((l) => turnTo(l.h, l.turn))];
    const map4 = [2, 4, 6, 0].map((d) => `${DIR[d]} = ${POS[scr(d)]}`).join(", ");
    const seq = Array.from({ length: st + 1 }, (_, i) => SHORT[cmp((hf + sg * i + 16) % 8)]).join(" → ");
    const trace = r.legs.map((l, i) => `Belok ${i + 1}: di ${l.cross.name} ia belok ${l.turn}; menghadap ${hc(l.h)}, ${l.turn}nya ${hc(heads[i + 1])}, kini menghadap ${hc(heads[i + 1])} (di layar: ${MOVE[heads[i + 1]]}).`);
    const p1 = `Ada empat lapis aturan: (1) peta tidak menghadap Utara, jadi arah kompas harus diterjemahkan ke layar; (2) kiri/kanan dihitung dari arah hadap pejalan; (3) ia berhenti di bangunan pertama di satu sisi jalan; (4) ia berputar di tempat dan arah barunya harus diukur dari bangunan tempat berhenti itu. Utara ada di ${["atas", "kanan", "bawah", "kiri"][k]} peta, sehingga ${map4}. ${two([`${walker} keluar dari ${x.name} ke ${s0.name}, menghadap ${hc(h0)} (di layar: ${MOVE[h0]}).`, ...trace, `Di ${r.st.name} sisi ${sp.K} = ${hc(r.side)}; bangunan pertama di sisi itu: ${Z.name}.`, `Menghadap ${hc(hf)}, putar ${nDeg}° ${arah} jarum jam = ${st} langkah: ${seq}, kini menghadap ${DIR[fc]} (di layar: ${MOVE[fs]}).`, `Dari tengah ${Z.name}, ${DIR[fc]} dituju oleh ${Y.name}.`])}`;
    const p2 = `${opts.map((o, i) => (o.id ? `Opsi ${LET[i]} (${o.z.name}): di layar ia ada di ${POS[o.s]} ${Z.name}, menurut kompas ${DIR[cmp(o.s)]}; ${o.why}.` : "")).filter(Boolean).join(" ")} Opsi ${LET[pos]} (${Y.name}) satu-satunya yang berada di ${DIR[fc]} dari ${Z.name}. Jawaban: ${LET[pos]}.`;
    const R0 = 40, P = (s: number, d = R0) => [Z.cx + d * Math.sin(s * Math.PI / 4), Z.cy - d * Math.cos(s * Math.PI / 4)], a = fs * Math.PI / 4;
    const [sx, sy] = P(hf), [ex, ey] = P(fs), tg = [sg * Math.cos(a), sg * Math.sin(a)], nm = [-tg[1], tg[0]];
    const head = `<path d="M${f1(ex + tg[0] * 11)} ${f1(ey + tg[1] * 11)}L${f1(ex - tg[0] * 4 + nm[0] * 8)} ${f1(ey - tg[1] * 4 + nm[1] * 8)}L${f1(ex - tg[0] * 4 - nm[0] * 8)} ${f1(ey - tg[1] * 4 - nm[1] * 8)}z" fill="${C_REF}"/>`;
    const mid = (hf + sg * st / 2 + 16) % 8, [tx, ty] = P(mid, R0 + 34);
    const bY = br(Y) * Math.PI / 180, q = r.pts;
    const route = r.legs.map((l, i) => dot(q[i + 1], i + 1) + turnTag(q[i + 1], l.h, heads[i + 1], `${l.turn} → ${SHORT[cmp(heads[i + 1])]}`)).join("");
    return {
      sub_type: "FIG-DENAH-ROTASI", tier: 3, instruksi: INSTRUKSI_ROTASI, rot: k * 90,
      stem: `${walker} keluar dari ${x.name} ke ${s0.name}, lalu berjalan ke arah ${hc(h0)}. Di persimpangan ${r.legs[0].cross.name} ia belok ${turns[0].dir}, lalu di persimpangan ${r.legs[1].cross.name} ia belok ${turns[1].dir}. Setelah belokan terakhir ia berhenti di depan bangunan pertama di sebelah ${sp.K}nya, lalu berputar ${nDeg}° ${arah} jarum jam di tempat. Di antara pilihan berikut, bangunan yang terletak di arah hadapnya sekarang, diukur dari bangunan tempat ia berhenti, adalah …`,
      opsi: Object.fromEntries(opts.map((o, i) => [LET[i], o.z.name])), kunci: [LET[pos]],
      cap: [`Utara di ${["atas", "kanan", "bawah", "kiri"][k]} peta: 2 belokan, lalu putar ${nDeg}°`, `Hadap ${SHORT[cmp(hf)]} ${cw ? "→" : "←"} ${DIR[fc]} = ${POS[fs]} layar`],
      over: `<circle cx="${f1(Z.cx)}" cy="${f1(Z.cy)}" r="${R0 + 14}" fill="#fff" opacity=".9"/>` + ring2(x, C_REF) + poly(q, C_REF, "ref") + `<circle cx="${f1(q[0][0])}" cy="${f1(q[0][1])}" r="6" fill="${C_REF}"/>` + route + tagIn(x.cx, x.cy, "Mulai", C_REF)
        + ring2(Z, C_REF)
        + `<path d="M${f1(sx)} ${f1(sy)}A${R0} ${R0} 0 ${st > 4 ? 1 : 0} ${cw ? 1 : 0} ${f1(ex)} ${f1(ey)}" fill="none" stroke="${C_REF}" stroke-width="4"/>` + head + `<text x="${f1(Z.lx)}" y="${f1(Z.ly)}" text-anchor="middle" font-size="12.5" font-weight="800" fill="${C_REF}" stroke="#fff" stroke-width="3" paint-order="stroke" ${FONT}>${Z.name}</text>` + tagIn(tx, ty, `${nDeg}° ${cw ? "searah" : "berlawanan"}`, C_REF)
        + ring2(Y, C_OK) + `<line x1="${f1(Z.cx + (R0 + 20) * Math.sin(a))}" y1="${f1(Z.cy - (R0 + 20) * Math.cos(a))}" x2="${f1(Y.cx - 24 * Math.sin(bY))}" y2="${f1(Y.cy + 24 * Math.cos(bY))}" stroke="${C_OK}" stroke-width="4" stroke-linecap="round" marker-end="url(#ok)"/>` + tagIn(Y.cx, Y.cy, `${SHORT[fc]} ✓`, C_OK)
        + ring2(near.z, C_NO, true) + tagIn(near.z.cx, near.z.cy, `${SHORT[cmp(near.s)]} ✗`, C_NO),
      pembahasan: `${p1}\n\n${p2}`, ans: Y.name, ds: opts.map((o) => o.id), proof: { sim: Z.name, walk: walkCheck(p, sp)!.name, hit: hit.map((h) => h.z.name) },
      spec: { start: x.name, street: s0.name, h0: hc(h0), turns, K: sp.K, nDeg, cw, k },
    };
  }
  return null;
}
