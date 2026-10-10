"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { annularSector, fillY, nearestAngle, wavePath } from "@/lib/honey";

/*
  Roda drilling: satu irisan per kartu, dikelompokkan per aspek. Tiap irisan punya
  3 cincin = 3 tingkat (dalam Dasar, tengah Menengah, luar Lanjut); madu mengisi
  cincin searah jarum jam sesuai bagian soal yang sudah dikerjakan. Roda berputar
  supaya irisan terpilih berhenti di penanda fokus (kanan di desktop, bawah di HP).
  CSS di app/honey.css.
*/

export type WheelCard = {
  kartu: string;
  no: string;
  label: string;
  aspek: string;
  aspekLabel: string;
  /** Bagian dikerjakan per tingkat, 0-1. */
  tiers: [number, number, number];
  p: number;
  locked: boolean;
  /** Lolos filter aspek + pencarian. */
  match: boolean;
};

const GAP = 7; // derajat jeda antar kelompok aspek
const WAVE = wavePath(50, 4.5, -100, 200, 140);
const CORE_HEX = "50,0 100,28.87 100,86.6 50,115.47 0,86.6 0,28.87";

export function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

export function useWide() {
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const mq = matchMedia("(min-width: 960px)");
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return wide;
}

export function DrillWheel({
  cards,
  selected,
  onSelect,
  overall,
}: {
  cards: WheelCard[];
  selected: string;
  onSelect: (kartu: string, focus?: boolean) => void;
  overall: { p: number; done: number; total: number };
}) {
  const [boxRef, W] = useWidth<HTMLDivElement>();
  const focus = useWide() ? 0 : 90;
  const wedgeRefs = useRef<Record<string, SVGGElement | null>>({});

  const geo = useMemo(() => {
    const groups = cards.filter((c, i) => i === 0 || c.aspek !== cards[i - 1].aspek).length;
    const sweep = (360 - groups * GAP) / cards.length;
    const centers: Record<string, number> = {};
    let acc = 0;
    cards.forEach((c, i) => {
      if (i > 0 && c.aspek !== cards[i - 1].aspek) acc += GAP;
      centers[c.kartu] = acc + sweep / 2;
      acc += sweep;
    });
    return { centers, half: ((sweep / 2 - 0.7) * Math.PI) / 180 };
  }, [cards]);

  // Putaran disimpan di state supaya tiap pergantian kartu berputar lewat jalur terpendek
  // dari posisi sebelumnya (bukan reset ke 0..360). Pola "state turunan dari props".
  const target = focus - (geo.centers[selected] ?? 0);
  const [rot, setRot] = useState({ target, spin: target });
  const spin = rot.target === target ? rot.spin : nearestAngle(target, rot.spin);
  if (rot.target !== target) setRot({ target, spin });

  if (!W) return <div ref={boxRef} className="hc-wheelbox" style={{ minHeight: 420 }} />;

  const Ro = Math.max(120, Math.min(W / 2 - 34, 270));
  const Ri = Ro * 0.36;
  const band = (Ro - Ri) / 3;
  const rMid = (Ri + Ro) / 2;
  // Layar sempit: ruang atas lebih supaya label aspek teratas tidak menabrak teks HUD "Roda drilling".
  const H = 2 * Ro + (W < 600 ? 160 : 110);
  const coreR = Ri * 0.92;
  const coreScale = (coreR * 2) / 115.47;
  const { half } = geo;
  const base = annularSector(Ri, Ro, -half, half);
  const arc = (r: number) => {
    const P = (a: number) => `${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`;
    return `M${P(-half)} A${r} ${r} 0 0 1 ${P(half)}`;
  };

  const groups = cards.reduce<{ aspek: string; label: string; from: number; to: number }[]>((acc, c) => {
    const ang = geo.centers[c.kartu];
    const last = acc.at(-1);
    if (last && last.aspek === c.aspek) last.to = ang;
    else acc.push({ aspek: c.aspek, label: c.aspekLabel, from: ang, to: ang });
    return acc;
  }, []);

  function onKey(e: React.KeyboardEvent, kartu: string) {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(kartu, true);
      return;
    }
    if (!step) return;
    e.preventDefault();
    const list = cards.filter((c) => c.match);
    const i = list.findIndex((c) => c.kartu === kartu);
    const next = list[(i + step + list.length) % list.length];
    if (next) {
      onSelect(next.kartu);
      requestAnimationFrame(() => wedgeRefs.current[next.kartu]?.focus());
    }
  }

  const fx = Math.cos((focus * Math.PI) / 180) * (Ro + 28);
  const fy = Math.sin((focus * Math.PI) / 180) * (Ro + 28);

  return (
    <div ref={boxRef} className="hc-wheelbox hc-frame">
      <p className="hc-hud" aria-hidden="true">
        Roda <b>drilling</b>&nbsp; {cards.filter((c) => c.match).length} jenis
      </p>
      <svg className="hc-wheel" width={W} height={H} viewBox={`${-W / 2} ${-H / 2} ${W} ${H}`} role="group" aria-label="Roda jenis soal. Gunakan panah untuk berpindah kartu.">
        <defs>
          <linearGradient id="dw-honey" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--honey-top)" />
            <stop offset="1" stopColor="var(--honey-bot)" />
          </linearGradient>
          <pattern id="dw-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="7" height="7" fill="var(--surface-card)" />
            <rect width="2.5" height="7" fill="var(--hatch)" />
          </pattern>
          <clipPath id="dw-core">
            <polygon points={CORE_HEX} />
          </clipPath>
        </defs>

        <circle className="hc-dial-ring" r={Ri - 8} />
        <polygon className="hc-mark" points="0,-5 7,0 0,5" transform={`translate(${fx} ${fy}) rotate(${focus + 180})`} />

        <g className="hc-spin" style={{ transform: `rotate(${spin}deg)` }}>
          {Array.from({ length: 70 }, (_, i) => (
            <line
              key={i}
              className={i % 5 === 0 ? "hc-tick is-major" : "hc-tick"}
              x1={Ro + 12}
              x2={Ro + 12 + (i % 5 === 0 ? 8 : 4)}
              transform={`rotate(${i * (360 / 70)})`}
            />
          ))}

          {cards.map((c) => {
            const ang = geo.centers[c.kartu];
            const sel = c.kartu === selected;
            return (
              <g key={c.kartu} transform={`rotate(${ang})`} className={c.match ? "" : "is-out"}>
                <g className="hc-pop" style={{ transform: `translateX(${sel ? 14 : 0}px)` }}>
                  <g
                    ref={(el) => {
                      wedgeRefs.current[c.kartu] = el;
                    }}
                    className={`hc-wedge${sel ? " is-sel" : ""}${c.locked ? " is-locked" : ""}`}
                    role="button"
                    tabIndex={c.match && sel ? 0 : -1}
                    aria-pressed={sel}
                    aria-disabled={!c.match}
                    aria-label={`${c.label}, ${c.aspekLabel}, ${
                      c.locked ? "belum tersedia" : `${Math.round(c.p * 100)} persen. Dasar ${Math.round(c.tiers[0] * 100)}, Menengah ${Math.round(c.tiers[1] * 100)}, Lanjut ${Math.round(c.tiers[2] * 100)} persen`
                    }`}
                    onClick={() => c.match && onSelect(c.kartu, sel)}
                    onKeyDown={(e) => onKey(e, c.kartu)}
                  >
                    <path className="hc-wedge-base" d={base} />
                    {c.locked && <path d={base} fill="url(#dw-hatch)" />}
                    {c.tiers.map((f, t) =>
                      f > 0 ? (
                        <path
                          key={t}
                          fill="url(#dw-honey)"
                          d={annularSector(Ri + band * t + 2, Ri + band * (t + 1) - 2, -half + 0.01, -half + 0.01 + (2 * half - 0.02) * Math.min(1, f))}
                        />
                      ) : null
                    )}
                    <path className="hc-wedge-sep" d={`${arc(Ri + band)} ${arc(Ri + 2 * band)}`} />
                    <path className="hc-wedge-out" d={base} />
                  </g>
                  <g transform={`translate(${rMid} 0)`} className={`hc-wedge-label${sel ? " is-sel" : ""}`} aria-hidden="true">
                    <g className="hc-upright" style={{ transform: `rotate(${-(ang + spin)}deg)` }}>
                      <text className="hc-wedge-no" y={-3} textAnchor="middle">
                        {c.no}
                      </text>
                      <text className="hc-wedge-pct" y={12} textAnchor="middle">
                        {c.locked ? "Segera" : c.p >= 1 ? "Selesai" : `${Math.round(c.p * 100)}%`}
                      </text>
                    </g>
                  </g>
                </g>
              </g>
            );
          })}

          {groups.map((g) => {
            // Label melengkung di busur luar. Di separuh bawah layar busurnya dibalik
            // (kanan→kiri jadi kiri→kanan) supaya huruf tetap tegak, bukan terbalik.
            const ang = (g.from + g.to) / 2;
            const v = (((ang + spin) % 360) + 360) % 360;
            const bottom = v > 0 && v < 180;
            const r = Ro + 40;
            const P = (d: number) => {
              const a = ((ang + d) * Math.PI) / 180;
              return `${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`;
            };
            const id = `dw-asp-${g.aspek}`;
            return (
              <g key={g.aspek} aria-hidden="true">
                <path id={id} d={bottom ? `M${P(80)} A${r} ${r} 0 0 0 ${P(-80)}` : `M${P(-80)} A${r} ${r} 0 0 1 ${P(80)}`} fill="none" />
                <text className="hc-aspek" dy="0.35em">
                  <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
                    {g.label}
                  </textPath>
                </text>
              </g>
            );
          })}
        </g>

        <g transform={`translate(${-coreR * 0.866} ${-coreR}) scale(${coreScale})`} aria-hidden="true">
          <polygon className="hc-core-base" points={CORE_HEX} />
          <g clipPath="url(#dw-core)">
            <g className="hc-honey-y" style={{ transform: `translateY(${fillY(0, 115.47, overall.p)}px)` }}>
              <g className="hc-honey-x is-live">
                <path d={WAVE} fill="url(#dw-honey)" className="hc-honey" />
              </g>
            </g>
          </g>
          <polygon className="hc-core-line" points={CORE_HEX} />
        </g>
        <g className={`hc-core-text${overall.p >= 0.6 ? " is-high" : ""}`} aria-hidden="true">
          <text y={-coreR * 0.3} textAnchor="middle" className="hc-core-lab">
            Total
          </text>
          <text y={coreR * 0.12} textAnchor="middle" className="hc-core-pct" style={{ fontSize: Math.max(18, Math.min(44, coreR * 0.42)) }}>
            {Math.round(overall.p * 100)}%
          </text>
          <text y={coreR * 0.42} textAnchor="middle" className="hc-core-of">
            {overall.done} / {overall.total} soal
          </text>
        </g>
      </svg>
      <p className="hc-legend">Cincin dalam Dasar, tengah Menengah, luar Lanjut.</p>
    </div>
  );
}
