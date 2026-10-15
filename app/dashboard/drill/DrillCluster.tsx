"use client";

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { NewBadge } from "@/app/components/NewBadge";
import { fillY, wavePath } from "@/lib/honey";
import { useWide, useWidth, type WheelCard } from "./DrillWheel";

/*
  Kluster drilling: alternatif tampilan Roda. Satu sel heksagon per kartu, berkelompok
  jadi pulau per aspek; madu mengisi sel sesuai bagian soal yang sudah dikerjakan.
  Reticle putus-putus mengikuti sel terpilih, dan di desktop jalur sinyal menyambung
  sel terpilih ke judul panel. Saat filter/cari menyisakan satu aspek, kamera zoom ke
  pulaunya. Bidang sempit (< 620px: HP, atau desktop dengan panel di samping) memakai
  susunan rapat 4-3-4-3 tanpa label pulau. CSS di app/honey.css.
*/

const SQ3 = Math.sqrt(3);
const HEX = "50,0 100,28.87 100,86.6 50,115.47 0,86.6 0,28.87";
const WAVE = wavePath(50, 4.5, -100, 200, 140);
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

type Pt = [number, number];

/** Pola baris pulau 2-3-2-3… dipotong ke n, supaya pulau berbentuk gumpalan, bukan garis. */
function islandRows(n: number) {
  if (n <= 2) return [n];
  const rows: number[] = [];
  for (let left = n, i = 0; left > 0; i++) {
    const w = Math.min(left, i % 2 ? 3 : 2);
    rows.push(w);
    left -= w;
  }
  return rows;
}

/** Pusat sel untuk baris-baris berpusat. Dua baris berurutan selalu bergeser setengah sel agar sel saling mengunci. */
function rowsToPts(rows: number[], u: number): Pt[] {
  const pts: Pt[] = [];
  let off = 0;
  rows.forEach((len, r) => {
    if (r > 0 && (len - rows[r - 1]) % 2 === 0) off = off ? 0 : 0.5;
    for (let c = 0; c < len; c++) pts.push([SQ3 * u * (c - (len - 1) / 2 + off), 1.5 * u * r]);
  });
  return pts;
}

/** Tata letak penuh (zoom 1): posisi sel, posisi label pulau, tinggi bidang. Titik (0,0) = tengah bidang. */
function layoutAll(cards: WheelCard[], W: number, S: number, compact: boolean) {
  const u = (SQ3 * S + Math.max(6, S * 0.15)) / SQ3;
  const pos: Record<string, Pt> = {};
  const labels: { aspek: string; label: string; at: Pt }[] = [];

  if (compact) {
    const rows: number[] = [];
    for (let left = cards.length, i = 0; left > 0; i++) {
      const w = Math.min(left, i % 2 ? 3 : 4);
      rows.push(w);
      left -= w;
    }
    rowsToPts(rows, u).forEach((p, i) => (pos[cards[i].kartu] = p));
  } else {
    // Pulau per aspek, dialirkan kiri→kanan dan pindah baris kalau melebihi lebar bidang.
    const groups: WheelCard[][] = [];
    cards.forEach((c, i) => (i > 0 && c.aspek === cards[i - 1].aspek ? groups.at(-1)!.push(c) : groups.push([c])));
    // Celah antar pulau: ±setengah sel ke samping, ke bawah cukup untuk label pulau berikutnya.
    const gapX = SQ3 * u * 0.55, gapY = 30, maxW = W - 48;
    let x = 0, y = 0, rowH = 0;
    for (const g of groups) {
      const pts = rowsToPts(islandRows(g.length), u);
      const minX = Math.min(...pts.map((p) => p[0])) - (SQ3 * S) / 2;
      const w = Math.max(...pts.map((p) => p[0])) + (SQ3 * S) / 2 - minX;
      const h = Math.max(...pts.map((p) => p[1])) + 2 * S;
      if (x > 0 && x + w > maxW) {
        x = 0;
        y += rowH + gapY;
        rowH = 0;
      }
      g.forEach((c, i) => (pos[c.kartu] = [x - minX + pts[i][0], y + S + pts[i][1]]));
      const top = pts.filter((p) => p[1] === 0);
      labels.push({ aspek: g[0].aspek, label: g[0].aspekLabel, at: [x - minX + top.reduce((s, p) => s + p[0], 0) / top.length, y - 18] });
      x += w + gapX;
      rowH = Math.max(rowH, h);
    }
  }

  const xs = Object.values(pos).map((p) => p[0]);
  const ys = Object.values(pos).map((p) => p[1]);
  const minX = Math.min(...xs) - (SQ3 * S) / 2, maxX = Math.max(...xs) + (SQ3 * S) / 2;
  const minY = Math.min(...ys, ...labels.map((l) => l.at[1] + S - 8)) - S, maxY = Math.max(...ys) + S;
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  for (const k in pos) pos[k] = [pos[k][0] - cx, pos[k][1] - cy];
  for (const l of labels) l.at = [l.at[0] - cx, l.at[1] - cy];
  return { pos, labels, H: maxY - minY + 72 };
}

export function DrillCluster({
  cards,
  selected,
  onSelect,
  panel,
}: {
  cards: WheelCard[];
  selected: string;
  onSelect: (kartu: string, focus?: boolean) => void;
  /** Panel kartu terpilih: ujung jalur sinyal (desktop). */
  panel: RefObject<HTMLElement | null>;
}) {
  const [boxRef, W] = useWidth<HTMLDivElement>();
  const wide = useWide();
  const cellRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const linkRef = useRef<SVGSVGElement>(null);
  // Masuk: sel muncul dari tengah satu per satu, sekali saat bidang pertama kali punya lebar.
  const [entered, setEntered] = useState(false);
  const [settling, setSettling] = useState(true);
  useEffect(() => {
    if (!W || entered) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
    return () => cancelAnimationFrame(id);
  }, [W, entered]);
  useEffect(() => {
    if (!entered) return;
    const t = setTimeout(() => setSettling(false), 1700);
    return () => clearTimeout(t);
  }, [entered]);

  const matchKey = cards.map((c) => (c.match ? 1 : 0)).join("");

  // Jalur sinyal sel → judul panel. Digambar per frame selama sel/panel masih beranimasi.
  useEffect(() => {
    let raf = 0;
    const until = performance.now() + (settling ? 2400 : 1000);
    const draw = () => {
      const svg = linkRef.current, box = boxRef.current, cell = cellRefs.current[selected], title = panel.current?.querySelector("h2");
      if (!svg) return;
      const show = wide && !!box && !!cell && !!title && !cell.disabled;
      svg.style.opacity = show ? "1" : "0";
      if (show) {
        const b = box.getBoundingClientRect(), c = cell.getBoundingClientRect(), t = title.getBoundingClientRect();
        const p = panel.current!.getBoundingClientRect();
        const sx = c.right - b.left + 4, sy = c.top + c.height / 2 - b.top;
        const ex = p.left - b.left, ey = t.top + t.height / 2 - b.top;
        const mx = ex - 18, dy = ey - sy, r = Math.min(10, Math.abs(dy) / 2), s = Math.sign(dy);
        const d = Math.abs(dy) < 1 || sx > mx - r
          ? `M${sx} ${sy} H${ex}`
          : `M${sx} ${sy} H${mx - r} Q${mx} ${sy} ${mx} ${sy + s * r} V${ey - s * r} Q${mx} ${ey} ${mx + r} ${ey} H${ex}`;
        svg.querySelector("path")!.setAttribute("d", d);
        const [a, z] = svg.querySelectorAll("circle");
        a.setAttribute("cx", String(sx));
        a.setAttribute("cy", String(sy));
        z.setAttribute("cx", String(ex));
        z.setAttribute("cy", String(ey));
      }
      if (performance.now() < until) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [selected, W, wide, matchKey, settling, panel, boxRef]);

  if (!W) return <div ref={boxRef} className="hk-box" style={{ minHeight: 420 }} />;

  const compact = W < 620;
  const S = compact ? clamp(W / 8.4, 34, 58) : clamp(W / 13.6, 40, 66);
  const { pos, labels, H } = layoutAll(cards, W, S, compact);
  // Nama kartu muat kalau sel cukup besar (desktop sempit di samping panel masih muat; HP tidak).
  const showName = S >= 50;

  // Kamera: kalau yang tersisa hanya satu aspek (filter atau hasil cari), zoom ke sel-sel itu.
  const hits = cards.filter((c) => c.match);
  const aspects = new Set(hits.map((c) => c.aspek));
  const zoomAspek = hits.length && hits.length < cards.length && aspects.size === 1 ? hits[0].aspek : null;
  let Z = 1, fx = 0, fy = 0;
  if (zoomAspek) {
    const ox = hits.map((c) => pos[c.kartu][0]), oy = hits.map((c) => pos[c.kartu][1]);
    const bw = Math.max(...ox) - Math.min(...ox) + SQ3 * S, bh = Math.max(...oy) - Math.min(...oy) + 2 * S + (compact ? 0 : 40);
    Z = clamp(Math.min((W - 80) / bw, (H - 90) / bh), 1, 1.75);
    fx = (Math.max(...ox) + Math.min(...ox)) / 2;
    fy = (Math.max(...oy) + Math.min(...oy)) / 2 - (compact ? 0 : 20 / Z);
  }
  const at = ([x, y]: Pt): Pt => [(x - fx) * Z, (y - fy) * Z];
  const move = (p: Pt, k: number) => `translate(-50%, -50%) translate(${p[0].toFixed(1)}px, ${p[1].toFixed(1)}px) scale(${k.toFixed(3)})`;
  const START = "translate(-50%, -50%) scale(0.2)";
  // Zoom mengubah ukuran sel langsung (bukan scale), supaya teks dan garis dirender tajam di ukuran akhir.
  const size = { width: SQ3 * S * Z, height: 2 * S * Z, "--s": `${S * Z}px` } as CSSProperties;

  function onKey(e: React.KeyboardEvent, kartu: string) {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const i = hits.findIndex((c) => c.kartu === kartu);
    const next = hits[(i + step + hits.length) % hits.length];
    if (next) {
      onSelect(next.kartu);
      requestAnimationFrame(() => cellRefs.current[next.kartu]?.focus());
    }
  }

  const sel = cards.find((c) => c.kartu === selected);
  const selIndex = cards.findIndex((c) => c.kartu === selected);

  return (
    <div ref={boxRef} className="hk-box">
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="hk-clip">
            <polygon points={HEX} />
          </clipPath>
          <linearGradient id="hk-honey" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--honey-top)" />
            <stop offset="1" stopColor="var(--honey-bot)" />
          </linearGradient>
          <pattern id="hk-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="7" height="7" fill="var(--surface-card)" />
            <rect width="2.5" height="7" fill="var(--hatch)" />
          </pattern>
        </defs>
      </svg>

      <div className="hk-field hc-frame" style={{ height: Math.ceil(H) }} role="group" aria-label="Kluster jenis soal. Gunakan panah untuk berpindah kartu.">
        <p className="hc-hud" aria-hidden="true">
          Kluster <b>{zoomAspek ? hits[0].aspekLabel : "Semua"}</b>&nbsp; {hits.length} jenis
        </p>

        {!compact &&
          labels.map((l) => (
            <span
              key={l.aspek}
              className={`hk-label${zoomAspek && zoomAspek !== l.aspek ? " is-hide" : ""}`}
              style={{ transform: entered ? move(at(l.at), 1) : START }}
              aria-hidden="true"
            >
              {l.label}
            </span>
          ))}

        {cards.map((c, i) => {
          const isSel = c.kartu === selected;
          const k = isSel ? 1.06 : 1;
          return (
            <button
              key={c.kartu}
              ref={(el) => {
                cellRefs.current[c.kartu] = el;
              }}
              type="button"
              className={`hk-cell${isSel ? " is-sel" : ""}${c.match ? "" : " is-out"}${c.locked ? " is-locked" : ""}${c.p >= 0.62 ? " is-high" : ""}${entered ? "" : " is-enter"}`}
              style={{ ...size, transform: entered ? move(at(pos[c.kartu]), k) : START, transitionDelay: settling && entered ? `${i * 38}ms` : undefined }}
              disabled={!c.match}
              tabIndex={isSel && c.match ? 0 : -1}
              aria-pressed={isSel}
              aria-label={`${c.label}, ${c.aspekLabel}, ${c.locked ? "belum tersedia" : `${c.fresh ? `${c.fresh} soal baru. ` : ""}${Math.round(c.p * 100)} persen dikerjakan`}`}
              onClick={() => onSelect(c.kartu, isSel)}
              onKeyDown={(e) => onKey(e, c.kartu)}
            >
              <span className="hk-inner">
                <svg className="hk-hex" viewBox="0 0 100 115.47" aria-hidden="true">
                  <polygon className="hk-base" points={HEX} />
                  <g clipPath="url(#hk-clip)">
                    {c.locked && <rect width="100" height="116" fill="url(#hk-hatch)" />}
                    <g className="hc-honey-y" style={{ transform: `translateY(${fillY(0, 115.47, c.p)}px)` }}>
                      <g className={`hc-honey-x${isSel && c.p > 0 && c.p < 1 ? " is-live" : ""}`}>
                        <path d={WAVE} fill="url(#hk-honey)" className="hc-honey" />
                      </g>
                    </g>
                  </g>
                  <polyline className="hk-hi" points="1.5,29.7 50,1.7 98.5,29.7" />
                  <polygon className="hk-line" points={HEX} />
                </svg>
                <span className="hk-body">
                  <span className="hk-no tnum">{c.no}</span>
                  {showName && <span className="hk-name">{c.label}</span>}
                  <span className="hk-pct tnum">{c.locked ? "Segera" : c.p >= 1 ? "Selesai" : `${Math.round(c.p * 100)}%`}</span>
                </span>
                {c.fresh > 0 && <NewBadge small className="hk-new" />}
              </span>
            </button>
          );
        })}

        {sel && (
          <div
            className="hk-reticle"
            style={{
              ...size,
              opacity: sel.match && entered ? 1 : 0,
              transform: entered ? move(at(pos[sel.kartu]), 1.06 * 1.17) : START,
              transitionDelay: settling && entered ? `${selIndex * 38}ms` : undefined,
            }}
            aria-hidden="true"
          >
            <svg className="hk-hex" viewBox="0 0 100 115.47">
              <polygon points={HEX} />
              <path d="M50 -9 V-2 M50 117.5 V124.5 M-9 57.7 H-2 M102 57.7 H109" />
            </svg>
          </div>
        )}
      </div>

      <svg ref={linkRef} className="hk-link" aria-hidden="true">
        <path />
        <circle r="3" />
        <circle r="3.5" />
      </svg>
      <p className="hc-legend">Madu mengisi sel sesuai bagian soal yang sudah dikerjakan.</p>
    </div>
  );
}
