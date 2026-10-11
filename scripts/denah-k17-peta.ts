// Mesin peta K17 Denah & Arah Mata Angin: geometri grid, acak ber-seed, ikon, render SVG peta dan
// coretan pembahasan. Dipakai scripts/generate-denah-k17.ts.
export function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let rnd = mulberry32(17);
export const reseed = (s: number) => { rnd = mulberry32(s); };
export const pick = <T>(a: T[]) => a[Math.floor(rnd() * a.length)];
export const shuffle = <T>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

// ---------- arah ----------
export const DIR = ["Utara", "Timur Laut", "Timur", "Tenggara", "Selatan", "Barat Daya", "Barat", "Barat Laut"];
export const SHORT = ["U", "TL", "T", "TG", "S", "BD", "B", "BL"];
export const bearing = (ax: number, ay: number, bx: number, by: number) => (Math.atan2(bx - ax, ay - by) * 180 / Math.PI + 360) % 360;
export const sectorOf = (b: number) => Math.round(b / 45) % 8;
export const angDiff = (a: number, b: number) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
export const left = (h: number) => (h + 6) % 8;
export const right = (h: number) => (h + 2) % 8;
export const ERR_SECTOR: [string, (d: number) => number][] = [
  ["hampir benar, meleset satu langkah di kompas", (d) => (d + 7) % 8], ["hampir benar, meleset satu langkah di kompas", (d) => (d + 1) % 8],
  ["jebakan kiri-kanan tertukar", (d) => (8 - d) % 8],
  ["jebakan atas-bawah tertukar", (d) => (12 - d) % 8],
  ["kebalikannya, acuan dan tujuan tertukar", (d) => (d + 4) % 8],
  ["meleset seperempat putaran", (d) => (d + 2) % 8], ["meleset seperempat putaran", (d) => (d + 6) % 8],
];

// ---------- geometri ----------
export const W = 448, M = 8, TOP = 84, R = 30, BW = (W - 2 * M - 2 * R) / 3, BH = 160;
export const H = TOP + 3 * BH + 2 * R + M;
export const SW = (BW - 12) / 2, SH = (BH - 12) / 2;
export const bx0 = (c: number) => M + c * (BW + R), by0 = (r: number) => TOP + r * (BH + R);
export const VX = [0, 1].map((i) => bx0(i) + BW + R / 2), HY = [0, 1].map((j) => by0(j) + BH + R / 2);

export type Obj = { name: string; kind: string; building: boolean; c: number; r: number; cells: [number, number][]; x: number; y: number; w: number; h: number; cx: number; cy: number };
export type Street = { axis: "V" | "H"; i: number; name: string };
export type Peta = { objs: Obj[]; streets: Street[]; trees: [number, number][] };

export const HOUSES = ["Ani", "Budi", "Dewi", "Eko", "Gita", "Hadi", "Ita", "Joko", "Kiki", "Lia", "Mira", "Nur", "Oki", "Putu", "Rudi", "Tia", "Yudi", "Zul"];
export const PUBLIC = ["Kantor Polisi", "Rumah Sakit", "Masjid", "Gereja", "Pura", "SD Harapan", "SMP Bangsa", "Pasar", "Bank", "Kantor Pos", "Balai Desa", "Puskesmas", "Minimarket", "Perpustakaan", "Kantor Camat"];
export const STREETS = ["Jl. Melati", "Jl. Mawar", "Jl. Kenanga", "Jl. Anggrek", "Jl. Cempaka", "Jl. Flamboyan", "Jl. Merdeka", "Jl. Pemuda", "Jl. Sudirman", "Jl. Diponegoro", "Jl. Pahlawan", "Jl. Gajah Mada", "Jl. Veteran", "Jl. Kartini"];
export const WALKERS = ["Sinta", "Bayu", "Dimas", "Lina", "Tono", "Fajar", "Nisa", "Reza", "Wulan", "Galih"];
// Pola isi blok: s = rumah (1 sel), w = gedung umum (2 sel mendatar); sel kosong diberi pohon.
export const PATTERNS: ["s" | "w", [number, number][]][][] = [
  [["w", [[0, 0], [1, 0]]], ["w", [[0, 1], [1, 1]]]],
  [["w", [[0, 0], [1, 0]]], ["s", [[0, 1]]], ["s", [[1, 1]]]],
  [["s", [[0, 0]]], ["s", [[1, 0]]], ["w", [[0, 1], [1, 1]]]],
  [["s", [[0, 0]]], ["s", [[1, 0]]], ["s", [[0, 1]]], ["s", [[1, 1]]]],
  [["w", [[0, 0], [1, 0]]]],
  [["s", [[0, 0]]], ["w", [[0, 1], [1, 1]]]],
  [["s", [[0, 0]]], ["s", [[1, 1]]]],
];

export function place(name: string, kind: string, building: boolean, c: number, r: number, cells: [number, number][]): Obj {
  const sx = bx0(c) + 6 + Math.min(...cells.map((k) => k[0])) * SW, sy = by0(r) + 6 + Math.min(...cells.map((k) => k[1])) * SH;
  const full = cells.length === 4, wide = cells.length >= 2;
  const w = full ? BW - 20 : wide ? 92 : 44, h = full ? BH - 44 : wide ? 38 : 34;
  const x = full ? bx0(c) + 10 : sx + ((wide ? 2 * SW : SW) - w) / 2, y = full ? by0(r) + 10 : sy + 8;
  return { name, kind, building, c, r, cells, x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
}

export function makePeta(min = 11, max = 16): Peta {
  for (;;) {
    const objs: Obj[] = [], trees: [number, number][] = [];
    const houses = shuffle(HOUSES), pubs = shuffle(PUBLIC);
    const open = Math.floor(rnd() * 9), openKind = pick(["Lapangan", "Taman", "Kolam"]);
    for (let b = 0; b < 9; b++) {
      const c = b % 3, r = Math.floor(b / 3);
      let pat = pick(PATTERNS);
      if (b === open) {
        if (openKind === "Lapangan") { objs.push(place("Lapangan", "lapangan", false, c, r, [[0, 0], [1, 0], [0, 1], [1, 1]])); continue; }
        objs.push(place(openKind, openKind.toLowerCase(), false, c, r, [[0, 0], [1, 0]]));
        pat = pick<typeof pat>([[["w", [[0, 1], [1, 1]]]], [["s", [[0, 1]]], ["s", [[1, 1]]]], [["s", [[0, 1]]]]]);
      }
      const used = new Set<string>();
      for (const [t, cells] of pat) {
        cells.forEach(([sx, sy]) => used.add(`${sx}${sy}`));
        objs.push(t === "w" ? place(pubs.pop()!, "pub", true, c, r, cells) : place(`R. ${houses.pop()}`, "rumah", true, c, r, cells));
      }
      if (b !== open || openKind !== "Lapangan")
        for (const [sx, sy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) if (!used.has(`${sx}${sy}`) && !(b === open && sy === 0)) trees.push([bx0(c) + 6 + sx * SW + SW / 2, by0(r) + 6 + sy * SH + SH / 2]);
    }
    const n = objs.filter((o) => o.building).length;
    if (n < min || n > max) continue;
    const names = shuffle(STREETS);
    const streets: Street[] = [{ axis: "V", i: 0, name: names[0] }, { axis: "V", i: 1, name: names[1] }, { axis: "H", i: 0, name: names[2] }, { axis: "H", i: 1, name: names[3] }];
    return { objs, streets, trees };
  }
}

// ---------- ikon SVG ----------
export const f1 = (n: number) => Math.round(n * 10) / 10;
export const rect = (x: number, y: number, w: number, h: number, fill: string, extra = "") => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${fill}" ${extra}/>`;
export const poly = (pts: number[][], fill: string, extra = "") => `<polygon points="${pts.map((p) => p.map(f1).join(",")).join(" ")}" fill="${fill}" ${extra}/>`;
export const LINE = 'stroke="#4b5563" stroke-width="1"';
export const ROOFS = ["#c2410c", "#b91c1c", "#92400e", "#475569", "#15803d", "#1d4ed8"];
export const windows = (x: number, y: number, w: number, n: number, fill = "#9cd3f0") =>
  Array.from({ length: n }, (_, i) => rect(x + 6 + i * ((w - 12) / n) + 1, y, (w - 12) / n - 4, 7, fill, LINE)).join("");

export function icon(o: Obj, roof: string): string {
  const { x, y, w, h } = o;
  if (o.kind === "rumah")
    return poly([[x - 3, y + 14], [x + w / 2, y], [x + w + 3, y + 14]], roof, LINE) + rect(x + 4, y + 14, w - 8, h - 14, "#fdf6e3", LINE)
      + rect(x + w / 2 - 4, y + h - 12, 8, 12, "#8b5a2b") + rect(x + 8, y + 18, 8, 7, "#9cd3f0", LINE) + rect(x + w - 16, y + 18, 8, 7, "#9cd3f0", LINE);
  if (o.kind === "lapangan")
    return rect(x, y, w, h, "#4d9a3e", 'rx="4"') + `<g fill="none" stroke="#fff" stroke-width="1.5">${rect(x + 6, y + 6, w - 12, h - 12, "none")}<line x1="${f1(x + 6)}" y1="${f1(y + h / 2)}" x2="${f1(x + w - 6)}" y2="${f1(y + h / 2)}"/><circle cx="${f1(x + w / 2)}" cy="${f1(y + h / 2)}" r="12"/></g>`;
  if (o.kind === "taman")
    return rect(x, y, w, h, "#9fd38a", 'rx="6"') + `<path d="M${x} ${y + h - 8}Q${x + w / 2} ${y + 8} ${x + w} ${y + 12}" stroke="#e7d7b1" stroke-width="5" fill="none"/>` + [0.2, 0.5, 0.8].map((t) => tree(x + w * t, y + h / 2 - 2, 9)).join("");
  if (o.kind === "kolam")
    return rect(x - 2, y - 2, w + 4, h + 4, "#e5e7eb", 'rx="7"') + rect(x + 3, y + 3, w - 6, h - 6, "#60a5fa", 'rx="5"') + `<path d="M${x + 12} ${y + h / 2}q8 -5 16 0t16 0t16 0t16 0" stroke="#dbeafe" stroke-width="1.5" fill="none"/>`;
  const base = (wall: string, band: string) => rect(x, y + 9, w, h - 9, wall, LINE) + rect(x - 2, y + 3, w + 4, 8, band, LINE) + windows(x, y + 16, w, 5) + rect(x + w / 2 - 5, y + h - 12, 10, 12, "#6b4f2a");
  switch (o.name) {
    case "Kantor Polisi": return base("#e8eef7", "#1e3a8a") + `<polygon points="${starPts(x + w / 2, y + 7, 6)}" fill="#facc15"/>`;
    case "Rumah Sakit": case "Puskesmas": {
      const c = o.name === "Rumah Sakit" ? "#dc2626" : "#0d9488";
      return base("#ffffff", "#e5e7eb") + rect(x + w / 2 - 7, y - 6, 14, 14, "#fff", LINE) + rect(x + w / 2 - 2, y - 4, 4, 10, c) + rect(x + w / 2 - 5, y - 1, 10, 4, c);
    }
    case "Masjid":
      return rect(x + 14, y + 16, w - 28, h - 16, "#f5f5f4", LINE) + `<path d="M${x + w / 2 - 16} ${y + 17}a16 15 0 0 1 32 0z" fill="#15803d" ${LINE}/>`
        + [x + 6, x + w - 12].map((mx) => rect(mx, y + 6, 6, h - 6, "#e7e5e4", LINE) + `<path d="M${mx} ${y + 7}a3 4 0 0 1 6 0z" fill="#15803d"/>`).join("")
        + [x + 26, x + w / 2 - 4, x + w - 34].map((ax) => `<path d="M${ax} ${y + h}v-9a4 4 0 0 1 8 0v9z" fill="#78716c"/>`).join("") + `<circle cx="${x + w / 2}" cy="${y - 1}" r="2.5" fill="#ca8a04"/>`;
    case "Gereja":
      return poly([[x + 18, y + 16], [x + w / 2 + 12, y + 4], [x + w + 2, y + 16]], "#7c2d12", LINE) + rect(x + 22, y + 16, w - 24, h - 16, "#fef3c7", LINE) + windows(x + 20, y + 21, w - 22, 4)
        + rect(x + 2, y + 2, 18, h - 2, "#fde68a", LINE) + poly([[x, y + 4], [x + 11, y - 6], [x + 22, y + 4]], "#7c2d12") + rect(x + 10, y - 13, 2, 9, "#374151") + rect(x + 7, y - 10, 8, 2, "#374151") + rect(x + 7, y + h - 12, 8, 12, "#6b4f2a");
    case "Pura": { // candi bentar: dua belahan berundak, sisi dalam tegak
      const half = [[0, h], [0, 16], [10, 16], [10, 8], [20, 8], [20, 0], [30, 0], [30, -6], [38, -6], [38, h]];
      return poly(half.map(([u, v]) => [x + 4 + u, y + v]), "#b45309", LINE) + poly(half.map(([u, v]) => [x + w - 4 - u, y + v]), "#b45309", LINE) + rect(x, y + h - 4, w, 4, "#78716c");
    }
    case "SD Harapan": case "SMP Bangsa":
      return poly([[x - 3, y + 14], [x + 10, y + 2], [x + w - 10, y + 2], [x + w + 3, y + 14]], "#b91c1c", LINE) + rect(x + 2, y + 14, w - 4, h - 14, "#fff7d6", LINE) + windows(x, y + 19, w, 5)
        + rect(x + w / 2 - 5, y + h - 12, 10, 12, "#6b4f2a") + rect(x + w + 4, y - 8, 1.5, h + 8, "#374151") + rect(x + w + 5.5, y - 8, 10, 3.5, "#dc2626") + rect(x + w + 5.5, y - 4.5, 10, 3.5, "#fff", LINE);
    case "Pasar":
      return rect(x, y + 14, w, h - 14, "#fef9c3", LINE) + Array.from({ length: 8 }, (_, i) => rect(x - 2 + i * (w + 4) / 8, y + 4, (w + 4) / 8, 10, i % 2 ? "#fff" : "#dc2626", LINE)).join("")
        + Array.from({ length: 3 }, (_, i) => rect(x + 8 + i * 28, y + 20, 20, 12, "#fdba74", LINE)).join("");
    case "Bank":
      return poly([[x - 2, y + 12], [x + w / 2, y], [x + w + 2, y + 12]], "#9ca3af", LINE) + rect(x + 2, y + 12, w - 4, 4, "#d1d5db", LINE)
        + Array.from({ length: 5 }, (_, i) => rect(x + 8 + i * 17, y + 16, 7, h - 20, "#f3f4f6", LINE)).join("") + rect(x - 2, y + h - 4, w + 4, 4, "#9ca3af", LINE);
    case "Kantor Pos": return base("#ffffff", "#ea580c") + rect(x + w / 2 - 7, y + 4, 14, 6, "#fff", LINE);
    case "Balai Desa":
      return poly([[x - 4, y + 18], [x + 14, y + 8], [x + w - 14, y + 8], [x + w + 4, y + 18]], "#92400e", LINE) + poly([[x + 18, y + 8], [x + 32, y - 2], [x + w - 32, y - 2], [x + w - 18, y + 8]], "#78350f", LINE)
        + rect(x + 2, y + h - 3, w - 4, 3, "#a8a29e") + [0.1, 0.37, 0.63, 0.9].map((t) => rect(x + w * t - 2, y + 18, 4, h - 21, "#a16207")).join("");
    case "Minimarket": return rect(x, y + 9, w, h - 9, "#bfdbfe", LINE) + rect(x - 2, y + 3, w + 4, 8, "#2563eb", LINE) + rect(x - 2, y + 9, w + 4, 2, "#facc15") + rect(x + w / 2 - 8, y + 16, 16, h - 16, "#93c5fd", LINE);
    case "Perpustakaan": return base("#ede9fe", "#6d28d9") + ["#f59e0b", "#10b981", "#ef4444"].map((c, i) => rect(x + w / 2 - 7 + i * 5, y + 3, 4, 8, c)).join("");
    default: // Kantor Camat
      return poly([[x - 3, y + 14], [x + w / 2, y + 2], [x + w + 3, y + 14]], "#334155", LINE) + rect(x + 2, y + 14, w - 4, h - 14, "#f1f5f9", LINE) + windows(x, y + 19, w, 5) + rect(x + w / 2 - 5, y + h - 12, 10, 12, "#6b4f2a");
  }
}
export function starPts(cx: number, cy: number, R0: number) {
  return Array.from({ length: 10 }, (_, i) => { const a = (-90 + 36 * i) * Math.PI / 180, r = i % 2 ? R0 * 0.45 : R0; return `${f1(cx + r * Math.cos(a))},${f1(cy + r * Math.sin(a))}`; }).join(" ");
}
export const tree = (x: number, y: number, s = 11) => rect(x - 1.5, y + s * 0.4, 3, s * 0.7, "#7c5a3a") + `<circle cx="${f1(x)}" cy="${f1(y)}" r="${s * 0.75}" fill="#3f8f3a"/><circle cx="${f1(x - s * 0.35)}" cy="${f1(y + 2)}" r="${s * 0.5}" fill="#4fa548"/>`;

export const FONT = 'font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif"';
export const label = (x: number, y: number, t: string, size = 14) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="middle" font-size="${size}" font-weight="700" fill="#1f2937" stroke="#fff" stroke-width="3" paint-order="stroke" ${FONT}>${t}</text>`;

export function compass(cx: number, cy: number) {
  const pts = (a: number, l: number) => [cx + l * Math.sin(a * Math.PI / 180), cy - l * Math.cos(a * Math.PI / 180)];
  const ray = (a: number, l: number, dark: boolean) => poly([pts(a, l), pts(a + 90, 4), [cx, cy]], dark ? "#1f2937" : "#9ca3af") + poly([pts(a, l), pts(a - 90, 4), [cx, cy]], dark ? "#4b5563" : "#d1d5db");
  const rays = [45, 135, 225, 315].map((a) => ray(a, 13, false)).join("") + [0, 90, 180, 270].map((a) => ray(a, 22, a === 0)).join("");
  const labels = SHORT.map((s, i) => { const [lx, ly] = pts(i * 45, i % 2 ? 26 : 30); return `<text x="${f1(lx)}" y="${f1(ly + 4)}" text-anchor="middle" font-size="11" font-weight="700" fill="${i === 0 ? "#b91c1c" : "#1f2937"}" ${FONT}>${s}</text>`; }).join("");
  return `<circle cx="${cx}" cy="${cy}" r="36" fill="#fff" stroke="#d1d5db"/>${rays}${labels}`;
}

// `extra` = gambar pembahasan: peta dipudarkan + coretan (panah, jalur) dan keterangan di pita atas.
export function renderSvg(p: Peta, n: number, extra?: { cap: string[]; over: string }): string {
  const roads = rect(M - 4, HY[0] - R / 2, W - 2 * M + 8, R, "#8f98a3") + rect(M - 4, HY[1] - R / 2, W - 2 * M + 8, R, "#8f98a3")
    + rect(VX[0] - R / 2, TOP - 4, R, H - TOP - M + 8, "#8f98a3") + rect(VX[1] - R / 2, TOP - 4, R, H - TOP - M + 8, "#8f98a3");
  const dash = 'stroke="#fff" stroke-width="1.5" stroke-dasharray="8 6"';
  const lines = HY.map((y) => `<line x1="${M}" y1="${f1(y)}" x2="${W - M}" y2="${f1(y)}" ${dash}/>`).join("") + VX.map((x) => `<line x1="${f1(x)}" y1="${TOP}" x2="${f1(x)}" y2="${H - M}" ${dash}/>`).join("");
  const sname = (s: Street) => {
    const t = `font-size="13" font-weight="700" fill="#fff" ${FONT} text-anchor="middle"`;
    if (s.axis === "H") { const x = bx0(1) + BW / 2, y = HY[s.i]; return `${rect(x - 52, y - 9, 104, 18, "#8f98a3")}<text x="${f1(x)}" y="${f1(y + 4.5)}" ${t}>${s.name}</text>`; }
    const x = VX[s.i], y = by0(1) + BH / 2;
    return `${rect(x - 9, y - 52, 18, 104, "#8f98a3")}<text transform="translate(${f1(x + 4.5)} ${f1(y)}) rotate(-90)" ${t}>${s.name}</text>`;
  };
  const blocks = [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => rect(bx0(c), by0(r), BW, BH, "#e7efd9", 'rx="6" stroke="#c9d8b4"'))).join("");
  const objs = p.objs.map((o, i) => icon(o, ROOFS[i % ROOFS.length]) + (o.cells.length === 4 ? label(o.cx, o.cy + 5, o.name) : label(o.cx, o.y + o.h + 17, o.name))).join("");
  const head = extra
    ? `<defs>${MK("ok", C_OK)}${MK("no", C_NO)}${MK("ref", C_REF)}</defs>${rect(0, TOP - 6, W, H - TOP + 6, "#fff", 'opacity=".4"')}${extra.over}`
      + `<text x="${M + 4}" y="30" font-size="14" font-weight="700" fill="#1f2937" ${FONT}>${extra.cap[0]}</text><text x="${M + 4}" y="52" font-size="14" font-weight="700" fill="${C_OK}" ${FONT}>${extra.cap[1]}</text>`
    : `<text x="${M + 4}" y="30" font-size="15" font-weight="700" fill="#1f2937" ${FONT}>Peta ${n}</text><text x="${M + 4}" y="50" font-size="12" fill="#4b5563" ${FONT}>Atas peta = Utara</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${f1(H)}" width="${W}" height="${f1(H)}" role="img" aria-label="${extra ? "Pembahasan" : "Denah"} peta ${n}">`
    + rect(0, 0, W, H, "#f8f7f2") + roads + lines + blocks + p.trees.map(([x, y]) => tree(x, y - 6)).join("") + objs + p.streets.map(sname).join("")
    + compass(W - 46, 42) + head + "</svg>";
}

// ---------- coretan pembahasan ----------
export const C_OK = "#15803d", C_NO = "#dc2626", C_REF = "#2563eb";
export const MK = (id: string, c: string) => `<marker id="${id}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${c}"/></marker>`;
export const ring = (o: Obj, c: string, dash = false) => rect(o.x - 6, o.y - 6, o.w + 12, o.h + 34, "none", `rx="8" stroke="${c}" stroke-width="3"${dash ? ' stroke-dasharray="6 4"' : ""}`);
export const tag = (x: number, y: number, t: string, c: string) => {
  const w = t.length * 7 + 14;
  return rect(x - w / 2, y - 11, w, 20, "#fff", `rx="10" stroke="${c}" stroke-width="1.5"`) + `<text x="${f1(x)}" y="${f1(y + 4)}" text-anchor="middle" font-size="12" font-weight="700" fill="${c}" ${FONT}>${t}</text>`;
};
export function arrow(a: Obj, b: Obj, c: string, mk: string, t: string, dash = false) {
  const dx = b.cx - a.cx, dy = b.cy - a.cy, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
  return `<line x1="${f1(a.cx + ux * 12)}" y1="${f1(a.cy + uy * 12)}" x2="${f1(b.cx - ux * 22)}" y2="${f1(b.cy - uy * 22)}" stroke="${c}" stroke-width="4" stroke-linecap="round"${dash ? ' stroke-dasharray="7 6"' : ""} marker-end="url(#${mk})"/>`
    + (t ? tag(a.cx + dx * 0.55, a.cy + dy * 0.55, t, c) : "");
}

