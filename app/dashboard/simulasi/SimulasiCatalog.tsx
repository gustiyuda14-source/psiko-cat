"use client";

import { useState, useTransition } from "react";
import type { ModuleType } from "@/lib/test-config";
import { fillY, wavePath } from "@/lib/honey";
import { Button } from "@/app/components/ui-client";
import { ArrowRight } from "@/app/components/icons";

/*
  Katalog Simulasi: tiap tes = kubus isometrik. Tiga sisi kubus = tiga sub-tes
  (kiri Kecerdasan, kanan Kecermatan, atas Kepribadian), madu = nilai murni
  terakhir (0-100) dari riwayat. Tryout lengkap menyalakan ketiga sisi; kartu
  sub-tes hanya menyalakan sisinya sendiri. Memulai tes tetap lewat server action
  `startSession` (buat sesi lalu redirect). CSS di app/honey.css.
*/

export type SimulasiItem = { id: string; title: string; meta: string; desc: string; faces: ModuleType[] };
export type LastScores = Partial<Record<ModuleType, { score: number; at: string }>>;

const WAVE = wavePath(50, 4.5, -100, 200, 140);
const FACES: { type: ModuleType; label: string; side: string; pts: string; y0: number; h: number; shade: number; text: string }[] = [
  { type: "KECERDASAN", label: "Kecerdasan", side: "kiri", pts: "0,28.87 50,57.735 50,115.47 0,86.6", y0: 28.87, h: 86.6, shade: 0.07, text: "matrix(1 0.577 0 1 25 74)" },
  { type: "KECERMATAN", label: "Kecermatan", side: "kanan", pts: "50,57.735 100,28.87 100,86.6 50,115.47", y0: 28.87, h: 86.6, shade: 0.2, text: "matrix(1 -0.577 0 1 75 74)" },
  { type: "KEPRIBADIAN", label: "Kepribadian", side: "atas", pts: "0,28.87 50,0 100,28.87 50,57.735", y0: 0, h: 57.735, shade: 0, text: "matrix(0.866 0.5 -0.866 0.5 50 31)" },
];
const OUTLINE = "50,0 100,28.87 100,86.6 50,115.47 0,86.6 0,28.87";

function Cube({ item, last, idx }: { item: SimulasiItem; last: LastScores; idx: number }) {
  return (
    <svg viewBox="-4 -4 108 124" aria-hidden="true">
      <defs>
        <linearGradient id={`sc-honey-${idx}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--honey-top)" />
          <stop offset="1" stopColor="var(--honey-bot)" />
        </linearGradient>
        {FACES.map((f) => (
          <clipPath key={f.type} id={`sc-${idx}-${f.type}`}>
            <polygon points={f.pts} />
          </clipPath>
        ))}
      </defs>
      {FACES.map((f) => {
        const on = item.faces.includes(f.type);
        const score = last[f.type]?.score;
        const p = on && score !== undefined ? Math.max(0, Math.min(1, score / 100)) : 0;
        return (
          <g key={f.type} className={on ? "" : "hc-ghost"}>
            <polygon className="hc-core-base" points={f.pts} />
            <g clipPath={`url(#sc-${idx}-${f.type})`}>
              <g className="hc-honey-y" style={{ transform: `translateY(${fillY(f.y0, f.h, p)}px)` }}>
                <g className={on && p > 0 && p < 1 ? "hc-honey-x is-live" : "hc-honey-x"}>
                  <path d={WAVE} fill={`url(#sc-honey-${idx})`} className="hc-honey" />
                </g>
              </g>
            </g>
            <polygon className="hc-shade" points={f.pts} style={{ fillOpacity: f.shade }} />
            {on && (
              <text className="hc-face-num" textAnchor="middle" dominantBaseline="middle" transform={f.text}>
                {score !== undefined ? Math.round(score) : "–"}
              </text>
            )}
          </g>
        );
      })}
      <path className="hc-cube-edge" d="M50 57.735 L0 28.87 M50 57.735 L100 28.87 M50 57.735 V115.47" />
      <polygon className="hc-cube-out" points={OUTLINE} />
    </svg>
  );
}

export default function SimulasiCatalog({
  items,
  last,
  action,
}: {
  items: SimulasiItem[];
  last: LastScores;
  action: (formData: FormData) => Promise<void>;
}) {
  const [selected, setSelected] = useState(0);
  const [pending, startTransition] = useTransition();
  const item = items[selected];

  function start() {
    const fd = new FormData();
    fd.set("module", item.id);
    startTransition(() => action(fd));
  }

  return (
    <div className="hc-stage">
      <div className="hc-field hc-frame hc-cubefield">
        <p className="hc-hud" aria-hidden="true">
          Nilai terakhir <b>per sub-tes</b>
        </p>
        <div className="hc-cubes" role="group" aria-label="Pilih tes">
          {items.map((it, i) => (
            <button
              key={it.id}
              type="button"
              className={`hc-cube${i === 0 ? " is-big" : ""}`}
              aria-pressed={i === selected}
              style={{ animationDelay: `${i * 70}ms` }}
              onClick={() => (i === selected ? document.getElementById("sim-start")?.focus() : setSelected(i))}
            >
              <Cube item={it} last={last} idx={i} />
              <span className="hc-cube-shadow" aria-hidden="true" />
              <span className="hc-cube-title">{it.title}</span>
              <span className="hc-cube-meta tnum">{it.meta}</span>
            </button>
          ))}
        </div>
        <p className="hc-legend">
          {FACES.map((f) => (
            <span key={f.type} className="hc-legend-item">
              <i aria-hidden="true" />
              Sisi {f.side}: {f.label}
            </span>
          ))}
        </p>
      </div>

      <aside className="hc-panel" aria-live="polite" key={item.id}>
        <div className="hc-panel-top">
          <span className="hc-tag">{item.faces.length > 1 ? "Paket lengkap" : "Sub-tes"}</span>
          <span className="hc-code tnum">{item.meta}</span>
        </div>
        <h2 className="hc-panel-title">{item.title}</h2>
        <p className="hc-panel-desc">{item.desc}</p>
        <ul className="hc-scores">
          {FACES.map((f) => {
            const on = item.faces.includes(f.type);
            const l = last[f.type];
            return (
              <li key={f.type}>
                <i className={on ? "" : "is-off"} aria-hidden="true" />
                <div>
                  <b>{f.label}</b>
                  <span>{!on ? "Tidak termasuk tes ini" : l ? `Sisi ${f.side} · terakhir ${l.at}` : `Sisi ${f.side} · belum pernah dikerjakan`}</span>
                </div>
                <em className={`tnum${on && l ? "" : " is-na"}`}>{on && l ? Math.round(l.score) : "–"}</em>
              </li>
            );
          })}
        </ul>
        <div className="hc-actions">
          <Button id="sim-start" variant="primary" size="lg" block disabled={pending} onClick={start}>
            {pending ? "Membuat sesi…" : item.faces.length > 1 ? "Mulai tryout lengkap" : "Mulai sub-tes"}
            {!pending && <ArrowRight className="size-4" />}
          </Button>
        </div>
        <p className="sr-only" role="status">
          {pending ? "Membuat sesi…" : ""}
        </p>
      </aside>
    </div>
  );
}
