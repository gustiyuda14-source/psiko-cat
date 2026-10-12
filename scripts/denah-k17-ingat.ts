// Soal K17 INGAT: peta hitam-putih ditampilkan `tampil_detik` detik, lalu disembunyikan; soal dijawab
// dari ingatan. Tiga bentuk: ARAH pilih bangunan, sisi jalan, bangunan di sebelah. Dipakai generate-denah-k17.ts.
import { sideOf, meets, TOP, H, W, R, type Map2, type St, type Bld } from "./denah-k17-bw";
import { shuffle, DIR, SHORT, sectorOf, angDiff, ERR_SECTOR, tag, arrow, C_OK, C_NO, C_REF, type Obj } from "./denah-k17-peta";
import { LET, arrange, bOf, safeKey, POS, MOVE, story, ring2, type Item } from "./denah-k17-soal-bw";

export const INSTRUKSI_INGAT = "Hafalkan denah selama waktu yang diberikan. Setelah waktu habis, denah disembunyikan dan soal muncul; jawab dari ingatan. Utara di atas peta. Arah diukur dari titik tengah bangunan. Bangunan di sisi jalan = bangunan yang berbatasan langsung dengan jalan itu. Lapangan bukan bangunan.";
const O = (b: Bld) => b as unknown as Obj;
const al = (o: Bld, s: St) => (s.axis === "V" ? o.cy : o.cx);
// Badan bangunan seluruhnya di sepanjang ruas jalan (bukan di ujung jalan buntu/pertigaan).
const inside = (o: Bld, s: St) => (s.axis === "V" ? o.y >= s.a0 && o.y + o.h <= s.a1 : o.x >= s.a0 && o.x + o.w <= s.a1);
const onSide = (p: Map2, s: St, sd: number) => p.objs.filter((o) => sideOf(o, s) === sd).sort((a, b) => al(a, s) - al(b, s));
// Jauh dari jalan s (bukan "hampir menempel"): tidak sejajar ruasnya, atau celahnya > 40 px.
const far = (o: Bld, s: St) => {
  const [lo, hi, a, b] = s.axis === "V" ? [o.y, o.y + o.h, o.x, o.x + o.w] : [o.x, o.x + o.w, o.y, o.y + o.h];
  return hi < s.a0 || lo > s.a1 || Math.min(Math.abs(a - s.c), Math.abs(b - s.c), a < s.c && b > s.c ? 0 : Infinity) - R / 2 > 40;
};
const names = (l: Bld[]) => l.map((o) => o.name).join(", ");
const ORDER = (s: St) => (s.axis === "V" ? "dari Utara ke Selatan" : "dari Barat ke Timur");
const sidesOf = (s: St) => (s.axis === "V" ? [6, 2] : [0, 4]);
const third = (v: number, lo: number, hi: number, t: [string, string, string]) => t[Math.min(2, Math.floor((v - lo) / ((hi - lo) / 3)))];
// Letak bangunan dalam kata: bagian peta + jalan tempat ia menempel (patokan hafalan).
const where = (p: Map2, o: Bld) => {
  const part = [third(o.cx, 0, W, ["kiri", "", "kanan"]), third(o.cy, TOP, H, ["atas", "", "bawah"])].filter(Boolean).join(" ") || "tengah";
  const st = p.streets.find((s) => sideOf(o, s) >= 0);
  return `bagian ${part} peta${st ? `, sisi ${DIR[sideOf(o, st)]} ${st.name}` : ""}`;
};
const nyata = () => [
  "Gambaran nyata: saksi hanya melihat lokasi sekilas dari atas motor, lalu melapor. Petugas yang terlatih mengingat denah bisa memastikan lokasi tanpa membuka peta lagi.",
  "Gambaran nyata: saat apel pagi, denah wilayah patroli hanya ditunjukkan sebentar sebelum berangkat. Selama patroli, letak bangunan penting harus diingat tanpa melihat peta.",
  "Gambaran nyata: petugas yang tiba di TKP mengamati sekeliling satu kali, lalu harus melaporkan posisi bangunan di sekitar kejadian dengan tepat lewat HT.",
][story.n++ % 3];
const TIPS = "Tips: jangan menghafal bangunan satu per satu. Hafalkan per jalan (chunking): sebut nama jalan, lalu bangunan di sisi kiri dan kanannya berurutan. Tiga atau empat kelompok kecil jauh lebih mudah diingat daripada 20 nama acak.";
const why2Of = (opts: { z: Bld; why: string }[], key: Bld) => opts.map((o, i) => (o.z === key ? "" : `Opsi ${LET[i].toUpperCase()} (${o.z.name}): ${o.why}.`)).filter(Boolean).join("\n");
const pack = (tier: number, secs: number, x: Omit<Item, "sub_type">): Item => ({ sub_type: "FIG-DENAH-INGAT", tier, tampil_detik: secs, instruksi: INSTRUKSI_INGAT, ...x });

/** ARAH dari ingatan: bangunan di arah D dari X (satu pengecoh per arah). */
export function ingatArah(p: Map2, pos: number, used: Set<string>, tier: number, secs: number): Item | null {
  const B = p.objs.filter((o) => o.building);
  for (const x of shuffle(B)) for (const y of shuffle(B)) {
    if (x === y || used.has(x.name) || used.has(y.name)) continue;
    const d = safeKey(O(x), O(y));
    if (d < 0) continue;
    const pool = B.filter((z) => z !== x && z !== y).map((z) => ({ z, br: bOf(O(x), O(z)) })).filter(({ br }) => angDiff(br, d * 45) >= 35 && angDiff(br, sectorOf(br) * 45) <= 15);
    const ds: { z: Bld; s: number; why: string }[] = [];
    for (const [w, f] of ERR_SECTOR) { const z = pool.find(({ br }) => sectorOf(br) === f(d)); if (z && ds.length < 4 && !ds.some((q) => q.s === f(d))) ds.push({ z: z.z, s: f(d), why: w }); }
    for (const { z, br } of shuffle(pool)) if (ds.length < 4 && !ds.some((q) => q.s === sectorOf(br))) ds.push({ z, s: sectorOf(br), why: "arah lain" });
    if (ds.length < 4) continue;
    used.add(x.name); used.add(y.name);
    const opts = arrange({ z: y, s: d, why: "" }, shuffle(ds), pos);
    const why2 = opts.map((o, i) => (o.z === y ? "" : `Opsi ${LET[i].toUpperCase()} (${o.z.name}): letaknya di ${POS[o.s]} ${x.name}, jadi ${DIR[o.s]}; ${o.why}.`)).filter(Boolean).join("\n");
    const near = ds.filter((q) => q.why.startsWith("hampir")).sort((a, b) => angDiff(bOf(O(x), O(a.z)), d * 45) - angDiff(bOf(O(x), O(b.z)), d * 45))[0];
    return pack(tier, secs, {
      cap: [`Ingat: ${x.name} → ${y.name}`, `${MOVE[d]} = ${DIR[d]}`],
      over: ring2(x, C_REF) + ring2(y, C_OK) + (near ? ring2(near.z, C_NO, true) + arrow(O(x), O(near.z), C_NO, "no", `${SHORT[near.s]} ✗`, true) : "") + arrow(O(x), O(y), C_OK, "ok", `${DIR[d]} ✓`),
      stem: `Pada peta tadi, di antara pilihan berikut, bangunan yang terletak di arah ${DIR[d]} dari ${x.name} adalah …`,
      opsi: Object.fromEntries(opts.map((o, i) => [LET[i], o.z.name])), kunci: [LET[pos]],
      pembahasan: `Langkah 1: Saat menghafal, ingat patokannya dulu: ${x.name} ada di ${where(p, x)}.\nLangkah 2: ${DIR[d]} = ${MOVE[d]}. Dari ${x.name}, bangunan pilihan yang ada di arah itu adalah ${y.name} (${where(p, y)}).<br>Kenapa yang lain salah:\n${why2}\nJawaban: ${y.name}.<br>${nyata()}\n${TIPS}`,
    });
  }
  return null;
}

/** Sisi jalan: satu-satunya pilihan yang berbatasan dengan sisi D Jl. X. */
export function ingatSisi(p: Map2, pos: number, used: Set<string>, tier: number, secs: number): Item | null {
  for (const st of shuffle(p.streets)) for (const sd of shuffle(sidesOf(st))) {
    const opp = (sd + 4) % 8, key = shuffle(p.objs.filter((o) => o.building && sideOf(o, st) === sd && inside(o, st) && !used.has(o.name)))[0];
    if (!key || used.has(st.name + sd)) continue;
    const ok = (o: Bld) => o.building && o !== key && sideOf(o, st) !== sd;
    // Urutan: sisi seberang (wajib), sisi yang sama di jalan sejajar, lalu bangunan lain.
    const oppC = shuffle(p.objs.filter((o) => ok(o) && sideOf(o, st) === opp && inside(o, st))).map((z) => ({ z, why: `di sisi ${DIR[opp]} ${st.name}; sisinya tertukar` }));
    const parC = p.streets.filter((s) => s !== st && s.axis === st.axis).flatMap((s) => shuffle(p.objs.filter((o) => ok(o) && sideOf(o, s) === sd)).map((z) => ({ z, why: `di sisi ${DIR[sd]} ${s.name}, bukan ${st.name}; jalannya tertukar` })));
    const restC = shuffle(p.objs.filter((o) => ok(o) && far(o, st))).map((z) => ({ z, why: `tidak berbatasan dengan ${st.name}; letaknya di ${where(p, z)}` }));
    if (!oppC.length) continue;
    const ds: { z: Bld; why: string }[] = [];
    for (const c of [oppC[0], ...parC.slice(0, 1), ...restC]) if (c && ds.length < 4 && !ds.some((q) => q.z === c.z)) ds.push(c);
    if (ds.length < 4) continue;
    used.add(st.name + sd); used.add(key.name);
    const opts = arrange({ z: key, why: "" }, shuffle(ds), pos), swap = ds[0];
    return pack(tier, secs, {
      cap: [`Ingat: sisi ${DIR[sd]} ${st.name}`, `${names(onSide(p, st, sd))}`],
      over: ring2(key, C_OK) + tag(key.cx, key.cy, `sisi ${SHORT[sd]} ✓`, C_OK) + ring2(swap.z, C_NO, true) + tag(swap.z.cx, swap.z.cy, `sisi ${SHORT[opp]} ✗`, C_NO),
      stem: `Pada peta tadi, bangunan yang berbatasan langsung dengan sisi ${DIR[sd]} ${st.name} adalah …`,
      opsi: Object.fromEntries(opts.map((o, i) => [LET[i], o.z.name])), kunci: [LET[pos]],
      pembahasan: `Langkah 1: Saat menghafal, kelompokkan per jalan. ${st.name}: ${sidesOf(st).map((s) => `sisi ${DIR[s]} ${names(onSide(p, st, s)) || "kosong"}`).join("; ")} (${ORDER(st)}).\nLangkah 2: Sisi ${DIR[sd]} = ${POS[sd]} jalan itu. Dari pilihan, hanya ${key.name} yang ada di sana.<br>Kenapa yang lain salah:\n${why2Of(opts, key)}\nJawaban: ${key.name}.<br>${nyata()}\n${TIPS}`,
    });
  }
  return null;
}

/** Bangunan tepat di sebelah D dari X, pada sisi jalan yang sama. */
export function ingatSebelah(p: Map2, pos: number, used: Set<string>, tier: number, secs: number): Item | null {
  for (const x of shuffle(p.objs.filter((o) => o.building && !used.has(o.name)))) for (const st of shuffle(p.streets.filter((s) => sideOf(x, s) >= 0 && inside(x, s)))) {
    const sd = sideOf(x, st), opp = (sd + 4) % 8, row = onSide(p, st, sd), i = row.indexOf(x);
    for (const dir of shuffle(st.axis === "V" ? [0, 4] : [2, 6])) {
      const k = dir === 2 || dir === 4 ? 1 : -1, key = row[i + k];
      // Tetangga harus bangunan, dekat (tepat bersebelahan), dan seluruhnya di ruas jalan yang sama.
      const lo = Math.min(al(key ?? x, st), al(x, st)), hi = Math.max(al(key ?? x, st), al(x, st));
      if (!key?.building || !inside(key, st) || hi - lo > 95 || p.streets.some((c) => c.axis !== st.axis && meets(c, st) && c.c > lo && c.c < hi)) continue;
      const across = onSide(p, st, opp).filter((o) => o.building).sort((a, b) => Math.abs(al(a, st) - al(key, st)) - Math.abs(al(b, st) - al(key, st)));
      const cand: [Bld | undefined, string][] = [
        [row[i - k], `itu tetangga di sebelah ${DIR[(dir + 4) % 8]} ${x.name}; arahnya tertukar`],
        [row[i + 2 * k], `itu bangunan kedua ke arah ${DIR[dir]}; ${key.name} ada di antaranya`],
        [across[0], `ada di seberang jalan (sisi ${DIR[opp]} ${st.name}), bukan di sisi yang sama`],
        [across[1], `ada di seberang jalan (sisi ${DIR[opp]} ${st.name})`],
        ...shuffle(p.objs.filter((o) => far(o, st))).map((o) => [o, `tidak bersebelahan dengan ${x.name}; letaknya di ${where(p, o)}`] as [Bld, string]),
      ];
      const ds: { z: Bld; why: string }[] = [];
      for (const [z, why] of cand) if (z?.building && z !== key && z !== x && ds.length < 4 && !ds.some((q) => q.z === z)) ds.push({ z, why });
      if (ds.length < 4 || !row[i - k]?.building) continue;
      used.add(x.name); used.add(key.name);
      const opts = arrange({ z: key, why: "" }, shuffle(ds), pos), other = row[i - k];
      return pack(tier, secs, {
        cap: [`Ingat: sisi ${DIR[sd]} ${st.name} (${ORDER(st)})`, names(row)],
        over: ring2(x, C_REF) + ring2(key, C_OK) + arrow(O(x), O(key), C_OK, "ok", "") + tag(key.cx, key.cy, `${SHORT[dir]} ✓`, C_OK) + ring2(other, C_NO, true) + tag(other.cx, other.cy, `${SHORT[(dir + 4) % 8]} ✗`, C_NO),
        stem: `Pada peta tadi, bangunan yang tepat di sebelah ${DIR[dir]} ${x.name}, sama-sama di sisi ${DIR[sd]} ${st.name}, adalah …`,
        opsi: Object.fromEntries(opts.map((o, j) => [LET[j], o.z.name])), kunci: [LET[pos]],
        pembahasan: `Langkah 1: Saat menghafal, urutkan bangunan per sisi jalan. Sisi ${DIR[sd]} ${st.name} ${ORDER(st)}: ${names(row)}.\nLangkah 2: Cari ${x.name} di urutan itu, lalu lihat tetangganya ke arah ${DIR[dir]} (${MOVE[dir]}): ${key.name}.<br>Kenapa yang lain salah:\n${why2Of(opts, key)}\nJawaban: ${key.name}.<br>${nyata()}\n${TIPS}`,
      });
    }
  }
  return null;
}
