"use client";

import { useRef, useState } from "react";
import { useWide, useWidth } from "@/app/dashboard/drill/DrillWheel";
import { annularSector, fillY, nearestAngle, wavePath } from "@/lib/honey";

/*
  Orbit paket latihan: satu dial per paket mengelilingi inti total, dengan gerak yang
  sama seperti roda drilling — orbit berputar lewat jalur terpendek sampai paket
  terpilih berhenti di penanda (kanan di desktop, bawah di HP), dial tetap tegak.
  Tiap dial punya satu juring per kolom (10 Kecermatan, 4 bagian modul lain) yang terisi
  madu sesuai capaian terjauh; cincin skala dial terpilih berputar pelan. CSS di app/honey.css.
*/

export type OrbitItem = {
  id: string;
  no: string;
  label: string;
  status: string;
  /** Bagian dikerjakan per juring, 0-1. */
  segs: number[];
  locked: boolean;
  aria: string;
};

const CORE_HEX = "50,0 100,28.87 100,86.6 50,115.47 0,86.6 0,28.87";
const WAVE = wavePath(50, 4.5, -100, 200, 140);
const hexPts = (r: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = ((-90 + 60 * i) * Math.PI) / 180;
    return `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");

export function PackageOrbit({
  items,
  selected,
  onSelect,
  overall,
  hud,
  legend,
  unit,
}: {
  items: OrbitItem[];
  selected: string;
  onSelect: (id: string, again?: boolean) => void;
  overall: { p: number; done: number; total: number };
  hud: React.ReactNode;
  legend: string;
  unit: string;
}) {
  const [boxRef, W] = useWidth<HTMLDivElement>();
  const focus = useWide() ? 0 : 90;
  const dialRefs = useRef<Record<string, SVGGElement | null>>({});
  const N = items.length;
  const step = 360 / N;
  const angle = (i: number) => i * step;

  // Sama dengan DrillWheel: putaran disimpan supaya pergantian paket lewat jalur terpendek.
  const target = focus - angle(Math.max(0, items.findIndex((it) => it.id === selected)));
  const [rot, setRot] = useState({ target, spin: target });
  const spin = rot.target === target ? rot.spin : nearestAngle(target, rot.spin);
  if (rot.target !== target) setRot({ target, spin });

  if (!W) return <div ref={boxRef} className="hc-wheelbox" style={{ minHeight: 420 }} />;

  const S = Math.min(W, 640);
  const H = S + 40;
  const dial0 = Math.max(34, Math.min(62, S * 0.11));
  const Rorb = S / 2 - dial0 - 36;
  // Dial menyusut bila paket banyak supaya tidak bertumpuk di orbit.
  const dR = Math.min(dial0, Rorb * Math.sin(Math.PI / N) * 0.74);
  const coreR = Math.max(34, Math.min(Rorb - dR * 1.14 - 30, Rorb * 0.46));
  const coreScale = (coreR * 2) / 115.47;
  const r0 = dR * 0.62;
  const gap = Math.min(0.06, Math.PI / items[0].segs.length / 4);
  const markR = Rorb - dR * 1.14 - 12;
  const mx = Math.cos((focus * Math.PI) / 180) * markR;
  const my = Math.sin((focus * Math.PI) / 180) * markR;

  function onKey(e: React.KeyboardEvent, id: string) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(id, true);
      return;
    }
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!d) return;
    e.preventDefault();
    const next = items[(items.findIndex((it) => it.id === id) + d + N) % N];
    onSelect(next.id);
    requestAnimationFrame(() => dialRefs.current[next.id]?.focus());
  }

  return (
    <div ref={boxRef} className="hc-wheelbox hc-frame">
      <p className="hc-hud" aria-hidden="true">
        {hud}
      </p>
      <svg className="hc-wheel" width={W} height={H} viewBox={`${-W / 2} ${-H / 2} ${W} ${H}`} role="group" aria-label="Orbit paket. Gunakan panah untuk berpindah paket.">
        <defs>
          <linearGradient id="po-honey" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--honey-top)" />
            <stop offset="1" stopColor="var(--honey-bot)" />
          </linearGradient>
          <clipPath id="po-core">
            <polygon points={CORE_HEX} />
          </clipPath>
        </defs>

        <circle className="hc-dial-ring" r={Rorb} />
        <circle className="hc-dial-ring" r={coreR + 10} />
        <polygon className="hc-mark" points="0,-6 9,0 0,6" transform={`translate(${mx} ${my}) rotate(${focus})`} />

        <g className="hc-spin" style={{ transform: `rotate(${spin}deg)` }}>
          {items.map((it, i) => {
            const sel = it.id === selected;
            const a = angle(i);
            const segStep = (2 * Math.PI) / it.segs.length;
            return (
              <g key={it.id} transform={`rotate(${a}) translate(${Rorb} 0)`}>
                <g className="hc-upright" style={{ transform: `rotate(${-(a + spin)}deg)` }}>
                  <g
                    ref={(el) => {
                      dialRefs.current[it.id] = el;
                    }}
                    className={`po-dial${sel ? " is-sel" : ""}${it.locked ? " is-locked" : ""}`}
                    role="button"
                    tabIndex={sel ? 0 : -1}
                    aria-pressed={sel}
                    aria-label={it.aria}
                    onClick={() => onSelect(it.id, sel)}
                    onKeyDown={(e) => onKey(e, it.id)}
                  >
                    <g className="po-scale" style={{ transform: `scale(${sel ? 1.14 : 1})` }}>
                      <g className={sel && !it.locked ? "po-ticks is-live" : "po-ticks"}>
                        {Array.from({ length: 60 }, (_, k) => (
                          <line key={k} className={k % 5 === 0 ? "hc-tick is-major" : "hc-tick"} x1={dR + 5} x2={dR + (k % 5 === 0 ? 11 : 8)} transform={`rotate(${k * 6})`} />
                        ))}
                      </g>
                      {it.segs.map((f, k) => {
                        const a0 = -Math.PI / 2 + k * segStep + gap;
                        const a1 = -Math.PI / 2 + (k + 1) * segStep - gap;
                        return (
                          <g key={k}>
                            <path className="po-seg" d={annularSector(r0, dR, a0, a1)} />
                            {f > 0 && <path fill="url(#po-honey)" d={annularSector(r0 + 1, dR - 1, a0, a0 + (a1 - a0) * Math.min(1, f))} />}
                          </g>
                        );
                      })}
                      <polygon className="po-hex" points={hexPts(r0 - 6)} />
                      <text className="po-no" y={dR * 0.13} textAnchor="middle" style={{ fontSize: dR * 0.36 }}>
                        {it.no}
                      </text>
                    </g>
                  </g>
                  {sel && (
                    <text className="po-name" y={dR * 1.14 + 28} textAnchor="middle">
                      {it.label} · <tspan className="po-status">{it.status}</tspan>
                    </text>
                  )}
                </g>
              </g>
            );
          })}
        </g>

        <g transform={`translate(${-coreR * 0.866} ${-coreR}) scale(${coreScale})`} aria-hidden="true">
          <polygon className="hc-core-base" points={CORE_HEX} />
          <g clipPath="url(#po-core)">
            <g className="hc-honey-y" style={{ transform: `translateY(${fillY(0, 115.47, overall.p)}px)` }}>
              <g className="hc-honey-x is-live">
                <path d={WAVE} fill="url(#po-honey)" className="hc-honey" />
              </g>
            </g>
          </g>
          <polygon className="hc-core-line" points={CORE_HEX} />
        </g>
        <g className={`hc-core-text${overall.p >= 0.6 ? " is-high" : ""}`} aria-hidden="true">
          <text y={-coreR * 0.3} textAnchor="middle" className="hc-core-lab">
            Total
          </text>
          <text y={coreR * 0.12} textAnchor="middle" className="hc-core-pct" style={{ fontSize: Math.max(18, Math.min(40, coreR * 0.42)) }}>
            {Math.round(overall.p * 100)}%
          </text>
          {coreR >= 60 && (
            <text y={coreR * 0.42} textAnchor="middle" className="hc-core-of">
              {overall.done} / {overall.total} {unit}
            </text>
          )}
        </g>
      </svg>
      <p className="hc-legend">{legend}</p>
    </div>
  );
}
