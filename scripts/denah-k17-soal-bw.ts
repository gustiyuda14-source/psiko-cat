// Soal K17 bersama: helper arah/pembahasan (dipakai semua fase) + soal di peta hitam-putih
// (RUTE fase C, ROTASI fase D). Dipakai scripts/generate-denah-k17.ts.
import { sideOf as side2, meets, type Map2, type St, type Bld } from "./denah-k17-bw";
import { pick, shuffle, DIR, SHORT, bearing, sectorOf, angDiff, left, right, ERR_SECTOR, W, tag, arrow, f1, rect, FONT, C_OK, C_NO, C_REF, type Obj } from "./denah-k17-peta";

export type Item = Record<string, unknown>;
export const LET = ["a", "b", "c", "d", "e"];
export const bOf = (a: Obj, b: Obj) => bearing(a.cx, a.cy, b.cx, b.cy);
export const corners = (o: Obj) => [[o.x, o.y], [o.x + o.w, o.y], [o.x, o.y + o.h], [o.x + o.w, o.y + o.h]];
export const safeKey = (a: Obj, b: Obj) => { const br = bOf(a, b), d = sectorOf(br); return angDiff(br, d * 45) <= 10 && corners(b).every(([x, y]) => sectorOf(bearing(a.cx, a.cy, x, y)) === d) ? d : -1; };
// Bahasa pembahasan: arah peta dalam kata sehari-hari (atas/kanan/bawah/kiri).
export const POS = ["atas", "kanan-atas", "kanan", "kanan-bawah", "bawah", "kiri-bawah", "kiri", "kiri-atas"];
export const MOVE = ["lurus ke atas", "serong ke kanan-atas", "lurus ke kanan", "serong ke kanan-bawah", "lurus ke bawah", "serong ke kiri-bawah", "lurus ke kiri", "serong ke kiri-atas"];
export const story = { n: 0 }; // pemilih gambaran nyata bergilir (tanpa rnd supaya kunci tetap sama)
export const tipsArah = (d: number) => d % 2
  ? "Tips: arah serong (Timur Laut, Tenggara, Barat Daya, Barat Laut) artinya bergeser ke samping DAN ke atas/bawah hampir sama jauh. Kalau gesernya hanya sedikit, itu masih arah lurus."
  : "Tips: hafalkan 4 arah utama dulu: atas = Utara, kanan = Timur, bawah = Selatan, kiri = Barat. Arah serong ada di antaranya.";
export const nyataArah = (d: number, x: string) => [
  `Gambaran nyata: petugas patroli melapor lewat HT, "Pelaku lari ke arah ${DIR[d]} dari ${x}." Rekan yang memegang peta harus langsung tahu itu ${MOVE[d]} di peta.`,
  `Gambaran nyata: ada laporan "Kebakaran di sebelah ${DIR[d]} ${x}." Petugas yang salah membaca arah akan datang ke tempat yang salah.`,
  `Gambaran nyata: saat latihan lapangan, komandan memberi perintah "Regu 2 bergerak ke ${DIR[d]}!" Kamu harus tahu arahnya tanpa ragu: ${MOVE[d]} di peta.`,
][story.n++ % 3];

export function arrange<T>(key: T, others: T[], pos: number): T[] { const o = [...others]; o.splice(pos, 0, key); return o; }

// ---------- RUTE di peta hitam-putih (jaringan jalan tidak seragam) ----------
export const ring2 = (o: { x: number; y: number; w: number; h: number }, c: string, dash = false) => rect(o.x - 5, o.y - 5, o.w + 10, o.h + 10, "none", `rx="7" stroke="${c}" stroke-width="3"${dash ? ' stroke-dasharray="6 4"' : ""}`);
const up = (h: number) => h === 2 || h === 4; // Timur/Selatan = koordinat naik
const al = (o: Bld, s: St) => (s.axis === "V" ? o.cy : o.cx);
// Objek di sisi `side` jalan s, di depan posisi `at` searah h, urut terdekat.
const ahead2 = (p: Map2, s: St, h: number, side: number, at: number) => p.objs
  .filter((o) => side2(o, s) === side && (up(h) ? al(o, s) > at : al(o, s) < at))
  .sort((a, b) => Math.abs(al(a, s) - at) - Math.abs(al(b, s) - at));
const first2 = (l: Bld[], k: number) => (l.slice(0, k + 1).every((o) => o.building) ? l[k] ?? null : null);
const pt2 = (s: St, v: number) => (s.axis === "V" ? [s.c, v] : [v, s.c]);

export function rute2(p: Map2, pos: number, turns: number, walker: string): Item | null {
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
    const nyata = story.n++ % 2
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

// ---------- ROTASI ----------
export const INSTRUKSI_ROT = "Gunakan denah. Arah ditentukan oleh kompas; peta bisa saja tidak menghadap Utara. Arah diukur dari titik tengah bangunan. Lapangan bukan bangunan. Berputar searah jarum jam: Utara → Timur Laut → Timur → Tenggara → Selatan → Barat Daya → Barat → Barat Laut; satu langkah = 45°.";
const SISI = ["atas", "kanan", "bawah", "kiri"]; // letak Utara di layar untuk putaran k×90°
// Bangunan di bingkai kompas (Utara ke atas) untuk peta yang diputar k×90° searah jarum jam: semua fungsi arah tetap berlaku.
const tf = (o: Bld, k: number): Obj => {
  const t = (x: number, y: number) => (k === 1 ? [y, -x] : k === 2 ? [-x, -y] : k === 3 ? [-y, x] : [x, y]);
  const [ax, ay] = t(o.x, o.y), [bx, by] = t(o.x + o.w, o.y + o.h), [cx, cy] = t(o.cx, o.cy);
  return { ...o, x: Math.min(ax, bx), y: Math.min(ay, by), w: Math.abs(bx - ax), h: Math.abs(by - ay), cx, cy } as unknown as Obj;
};
const ray = (o: Bld, d: number, L: number, c: string, w = 3, dash = false) => { const a = d * Math.PI / 180;
  return `<line x1="${f1(o.cx)}" y1="${f1(o.cy)}" x2="${f1(o.cx + L * Math.sin(a))}" y2="${f1(o.cy - L * Math.cos(a))}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"${dash ? ' stroke-dasharray="7 6"' : ""}/>`; };
// Kompas kecil di titik acuan, diputar sesuai kompas peta (U ditebalkan).
const rose = (o: Bld, k: number) => `<circle cx="${f1(o.cx)}" cy="${f1(o.cy)}" r="50" fill="#fff" opacity=".85"/>` + Array.from({ length: 8 }, (_, i) => {
  const a = (i * 45 + k * 90) * Math.PI / 180, L = i % 2 ? 24 : 32;
  return ray(o, i * 45 + k * 90, L, C_REF, i ? 1.5 : 3.5) + (i % 2 ? "" : `<text x="${f1(o.cx + 42 * Math.sin(a))}" y="${f1(o.cy - 42 * Math.cos(a) + 4.5)}" text-anchor="middle" font-size="13" font-weight="800" fill="${C_REF}" ${FONT}>${SHORT[i]}</text>`);
}).join("");
const nyataRot = (k: number) => [
  `Gambaran nyata: peta wilayah di dinding pos jaga sering dipasang mengikuti bentuk ruangan, tidak selalu Utara di atas. Petugas yang langsung membaca "atas = Utara" akan mengirim regu ke arah yang salah.`,
  `Gambaran nyata: saat memegang denah TKP yang difoto miring dari HP rekan, Utara bisa ada di ${SISI[k]}. Cek kompas dulu sebelum melapor arah lewat HT.`,
][story.n++ % 2];
// Tag yang dijepit di dalam bingkai peta (tag dekat tepi tidak terpotong).
const tagIn = (x: number, y: number, t: string, c: string) => { const w = t.length * 7 + 14; return tag(Math.min(Math.max(x, w / 2 + 10), W - w / 2 - 10), y, t, c); };
const TIPS_ROT = "Tips: jangan pernah menganggap atas = Utara sebelum melihat kompas. Putar HP atau kertasnya sampai U menghadap ke atas, baru baca arahnya.";

/** R1: peta diputar k×90°; ARAH pilih bangunan (form "b") atau pilih arah (form "a"). Kunci menurut kompas. */
export function rotArah(p: Map2, k: number, pos: number, used: Set<string>, form: "b" | "a"): Item | null {
  const B = p.objs.filter((o) => o.building), T = new Map(B.map((o) => [o, tf(o, k)]));
  const scr = (d: number) => (d + 2 * k) % 8; // arah kompas d terlihat di layar sebagai arah scr(d)
  const why = (s: number, d: number) => s === (d + 8 - 2 * k) % 8 ? "jebakan arah layar: atas peta dianggap Utara" : ERR_SECTOR.find(([, f]) => f(d) === s)?.[0] ?? "bukan arah yang ditanya";
  for (const x of shuffle(B)) for (const y of shuffle(B)) {
    if (x === y || used.has(x.name + y.name) || used.has(y.name + x.name)) continue;
    const tx = T.get(x)!, d = safeKey(tx, T.get(y)!);
    if (d < 0) continue;
    const trap = (d + 8 - 2 * k) % 8; // sektor kompas bangunan yang di layar tampak di arah d
    const tb = (z: Bld) => bOf(tx, T.get(z)!);
    let opts: { z?: Bld; s: number; why: string }[];
    if (form === "b") {
      const pool = B.filter((z) => z !== x && z !== y).map((z) => ({ z, br: tb(z) })).filter(({ br }) => angDiff(br, d * 45) >= 35 && angDiff(br, sectorOf(br) * 45) <= 15);
      const tz = pool.find(({ br }) => sectorOf(br) === trap);
      if (!tz) continue;
      const ds = [{ z: tz.z, s: trap, why: "" }];
      // Satu pengecoh per arah, supaya alasan tiap opsi berbeda.
      for (const [, f] of ERR_SECTOR) { const z = pool.find(({ br }) => sectorOf(br) === f(d)); if (z && ds.length < 4 && !ds.some((q) => q.s === f(d))) ds.push({ z: z.z, s: f(d), why: "" }); }
      for (const { z, br } of shuffle(pool)) if (ds.length < 4 && !ds.some((q) => q.s === sectorOf(br))) ds.push({ z, s: sectorOf(br), why: "" });
      if (ds.length < 4) continue;
      for (const q of ds) q.why = why(q.s, d);
      opts = arrange({ z: y, s: d, why: "" }, shuffle(ds), pos);
    } else {
      const ds = [{ s: trap === d ? -1 : scr(d), why: "jebakan arah layar: atas peta dianggap Utara" }].filter((q) => q.s >= 0);
      for (const [w, f] of ERR_SECTOR) if (f(d) !== d && !ds.some((q) => q.s === f(d)) && ds.length < 4) ds.push({ s: f(d), why: w });
      const all = [{ s: d, why: "" }, ...ds].sort((a, b) => a.s - b.s), i0 = all.findIndex((o) => o.s === d);
      opts = all.map((_, i) => all[(i + i0 - pos + 5) % 5]);
    }
    used.add(x.name + y.name);
    const L1 = `Langkah 1: Lihat kompas: Utara ada di ${SISI[k]} peta, bukan di atas.`;
    const L2 = `Langkah 2: Putar peta di kepala (atau putar HP) ${k * 90}° sampai U di atas. Di peta ini, ${DIR[d]} mengarah ke ${POS[scr(d)]} layar.`;
    const sq = opts.find((o) => o.why.startsWith("jebakan arah layar"));
    const over = rose(x, k) + ring2(x, C_REF) + ring2(y, C_OK) + (sq?.z ? ring2(sq.z, C_NO, true) + arrow(x as unknown as Obj, sq.z as unknown as Obj, C_NO, "no", "atas = U? ✗", true) : sq ? tagIn(y.cx, y.y - 16, `tanpa kompas: ${SHORT[sq.s]} ✗`, C_NO) : "")
      + arrow(x as unknown as Obj, y as unknown as Obj, C_OK, "ok", `${DIR[d]} ✓`);
    const head = { cap: [`Utara di ${SISI[k]} peta (peta diputar ${k * 90}°)`, `${DIR[d]} = ${POS[scr(d)]} layar`], over, sub_type: "FIG-DENAH-ROTASI", tier: k === 2 ? 3 : 2, instruksi: INSTRUKSI_ROT, rot: k * 90 };
    if (form === "b") {
      const why2 = opts.map((o, i) => (o.z === y ? "" : `Opsi ${LET[i].toUpperCase()} (${o.z!.name}): di layar ia ada di ${POS[scr(o.s)]} ${x.name}, menurut kompas itu ${DIR[o.s]}; ${o.why}.`)).filter(Boolean).join("\n");
      return { ...head, stem: `Di antara pilihan berikut, bangunan yang terletak di arah ${DIR[d]} dari ${x.name} adalah …`,
        opsi: Object.fromEntries(opts.map((o, i) => [LET[i], o.z!.name])), kunci: [LET[pos]],
        pembahasan: `${L1}\n${L2}\nLangkah 3: Dari tengah ${x.name}, geser ke ${POS[scr(d)]} layar. Bangunan pilihan yang kena arah itu adalah ${y.name}.<br>Kenapa yang lain salah:\n${why2}\nJawaban: ${y.name}.<br>${nyataRot(k)}\n${TIPS_ROT}` };
    }
    const why2 = opts.map((o, i) => (o.s === d ? "" : `Opsi ${LET[i].toUpperCase()} (${DIR[o.s]}): ${o.why}.`)).filter(Boolean).join("\n");
    return { ...head, stem: `${y.name} terletak di arah mana dari ${x.name}?`,
      opsi: Object.fromEntries(opts.map((o, i) => [LET[i], DIR[o.s]])), kunci: [LET[pos]],
      pembahasan: `${L1}\nLangkah 2: Di layar, ${y.name} ada di ${POS[scr(d)]} ${x.name}.\nLangkah 3: Putar peta di kepala ${k * 90}° sampai U di atas: ${POS[scr(d)]} layar = ${DIR[d]}.<br>Kenapa yang lain salah:\n${why2}\nJawaban: ${DIR[d]}.<br>${nyataRot(k)}\n${TIPS_ROT}` };
  }
  return null;
}

/** R2: berdiri di depan bangunan, menghadap a, berputar n° (cw = searah jarum jam). Peta Utara di atas. */
export function putar(p: Map2, pos: number, used: Set<string>, form: "b" | "a", walker: string, a: number, n: number, cw: boolean): Item | null {
  const st = n / 45, sg = cw ? 1 : -1, f = (a + sg * st + 16) % 8, arah = cw ? "searah jarum jam" : "berlawanan arah jarum jam";
  const named: [number, string][] = [
    [(a - sg * st + 16) % 8, `itu kalau berputar ${cw ? "berlawanan arah" : "searah"} jarum jam (arah putar terbalik)`],
    ...(st > 1 ? [[(a + sg * (st - 1) + 16) % 8, `itu baru ${n - 45}°, kurang satu langkah`] as [number, string]] : []),
    [(a + sg * (st + 1) + 16) % 8, `itu ${n + 45}°, kelebihan satu langkah`],
    ...(st % 2 ? [] : [[(a + sg * (st / 2) + 16) % 8, `itu baru setengah putaran (${n / 2}°)`] as [number, string]]),
    [a, "itu arah awal, seolah tidak berputar"],
    [(f + 4) % 8, "itu kebalikan arah akhir"],
  ];
  const seq = Array.from({ length: st + 1 }, (_, i) => SHORT[(a + sg * i + 16) % 8]).join(" → ");
  const B = p.objs.filter((o) => o.building);
  for (const x of shuffle(B)) {
    if (used.has(x.name)) continue;
    let opts: { z?: Bld; s: number; why: string }[];
    let y: Bld | undefined;
    if (form === "b") {
      y = shuffle(B).find((z) => z !== x && safeKey(x as unknown as Obj, z as unknown as Obj) === f);
      if (!y) continue;
      const pool = B.filter((z) => z !== x && z !== y).map((z) => ({ z, br: bOf(x as unknown as Obj, z as unknown as Obj) })).filter(({ br }) => angDiff(br, f * 45) >= 35 && angDiff(br, sectorOf(br) * 45) <= 15);
      const ds: { z: Bld; s: number; why: string }[] = [];
      for (const [s, w] of named) { const z = pool.find((q) => sectorOf(q.br) === s && !ds.some((u) => u.z === q.z)); if (z && s !== f && !ds.some((u) => u.s === s) && ds.length < 4) ds.push({ z: z.z, s, why: w }); }
      if (ds.length < 4) continue;
      opts = arrange({ z: y, s: f, why: "" }, shuffle(ds), pos);
    } else {
      const ds: { s: number; why: string }[] = [];
      for (const [s, w] of named) if (s !== f && !ds.some((q) => q.s === s) && ds.length < 4) ds.push({ s, why: w });
      if (ds.length < 4) continue;
      const all = [{ s: f, why: "" }, ...ds].sort((u, v) => u.s - v.s), i0 = all.findIndex((o) => o.s === f);
      opts = all.map((_, i) => all[(i + i0 - pos + 5) % 5]);
    }
    used.add(x.name);
    // Busur putar di titik acuan: sinar awal (biru), busur bertanda panah, arah akhir (hijau).
    const R0 = 34, P = (d: number) => [x.cx + R0 * Math.sin(d * Math.PI / 4), x.cy - R0 * Math.cos(d * Math.PI / 4)];
    const [sx, sy] = P(a), [ex, ey] = P(f);
    const arc = `<path d="M${f1(sx)} ${f1(sy)}A${R0} ${R0} 0 ${st > 4 ? 1 : 0} ${cw ? 1 : 0} ${f1(ex)} ${f1(ey)}" fill="none" stroke="${C_REF}" stroke-width="4" marker-end="url(#ref)"/>`;
    const wrong = opts.find((o) => o.why.includes("terbalik")) ?? opts.find((o) => o.s !== f)!;
    const over = `<circle cx="${f1(x.cx)}" cy="${f1(x.cy)}" r="${R0 + 14}" fill="#fff" opacity=".85"/>` + ring2(x, C_REF) + ray(x, a * 45, R0 + 10, C_REF, 3) + arc
      + tagIn(x.cx + 58 * Math.sin(a * Math.PI / 4), x.cy - 58 * Math.cos(a * Math.PI / 4), `awal ${SHORT[a]}`, C_REF)
      + (y ? ring2(y, C_OK) + (wrong.z ? ring2(wrong.z, C_NO, true) + tagIn(wrong.z.cx, wrong.z.cy, `${SHORT[wrong.s]} ✗`, C_NO) : "") + arrow(x as unknown as Obj, y as unknown as Obj, C_OK, "ok", `${DIR[f]} ✓`)
        : ray(x, f * 45, 110, C_OK, 4) + tagIn(x.cx + 120 * Math.sin(f * Math.PI / 4), x.cy - 120 * Math.cos(f * Math.PI / 4), `${DIR[f]} ✓`, C_OK));
    const why2 = opts.map((o, i) => (o.s === f ? "" : `Opsi ${LET[i].toUpperCase()} (${o.z ? `${o.z.name}, di ${DIR[o.s]}` : DIR[o.s]}): ${o.why}.`)).filter(Boolean).join("\n");
    const base = `${walker} berdiri di depan ${x.name} menghadap ${DIR[a]}, lalu berputar ${n}° ${arah}.`;
    const lang = `Langkah 1: ${n}° = ${st} langkah kompas (1 langkah = 45°).\nLangkah 2: Dari ${DIR[a]}, hitung ${st} langkah ${arah}: ${seq}. Sekarang menghadap ${DIR[f]}.`;
    const nyata = `Gambaran nyata: dalam baris-berbaris, aba-aba "Hadap kanan" = putar 90° searah jarum jam dan "Balik kanan" = 180°. Petugas jaga yang tahu ke mana ia menghadap setelah berputar bisa melapor arah dengan tepat tanpa melihat peta.`;
    const tips = "Tips: hafalkan urutan searah jarum jam U → TL → T → TG → S → BD → B → BL. Berlawanan arah jarum jam = baca urutan itu mundur. 90° = 2 langkah, 180° = berbalik.";
    return {
      cap: [`${walker}: menghadap ${DIR[a]}, putar ${n}° ${cw ? "searah" : "berlawanan"}`, `${seq} = ${DIR[f]}`], over,
      sub_type: "FIG-DENAH-ROTASI", tier: n % 90 === 0 && cw ? 2 : 3, instruksi: INSTRUKSI_ROT,
      stem: form === "b" ? `${base} Di antara pilihan berikut, bangunan yang berada di depannya sekarang (searah hadapnya) adalah …` : `${base} Sekarang ${walker} menghadap ke arah …`,
      opsi: Object.fromEntries(opts.map((o, i) => [LET[i], o.z ? o.z.name : DIR[o.s]])), kunci: [LET[pos]],
      pembahasan: `${lang}${y ? `\nLangkah 3: Dari tengah ${x.name}, arah ${DIR[f]} = ${MOVE[f]} di peta. Bangunan pilihan yang kena arah itu: ${y.name}.` : ""}<br>Kenapa yang lain salah:\n${why2}\nJawaban: ${y ? y.name : DIR[f]}.<br>${nyata}\n${tips}`,
    };
  }
  return null;
}
