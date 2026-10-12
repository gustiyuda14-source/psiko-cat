"use client";

import { useState, useTransition, type CSSProperties } from "react";
import { MODULE_CONFIG, MODULE_ORDER, type ModuleType } from "@/lib/test-config";
import { fillY, wavePath } from "@/lib/honey";
import { Button, Dialog } from "@/app/components/ui-client";
import { ArrowRight, Check, ChevronLeft } from "@/app/components/icons";

/*
  Katalog Simulasi: tiap tes = kubus isometrik. Tiga sisi kubus = tiga sub-tes
  (kiri Kecerdasan, kanan Kecermatan, atas Kepribadian), madu = nilai murni
  terakhir (0-100) dari riwayat. Tryout lengkap menyalakan ketiga sisi; kartu
  sub-tes hanya menyalakan sisinya sendiri. Memulai tes tetap lewat server action
  `startSession` (buat sesi lalu redirect). CSS di app/honey.css.
  Langkah 1 = pilih paket simulasi: timeline hexagon, semua paket siap = kartu navy yang sama.
  Hexagon emas = paket terpilih (awal: paket siap terkecil yang belum pernah ditryout-kan);
  klik kartu memindahkan emas lalu membuka pratinjau paket sebelum halaman kubus. Paket yang
  pernah ditryout-kan dapat badge hijau. Paket tanpa bank soal tampil "Segera".
*/

export type SimulasiItem = { id: string; title: string; meta: string; desc: string; faces: ModuleType[] };
/** runs/nap/prev/at = tryout lengkap selesai untuk paket ini (nap = terakhir, prev = sebelumnya). */
export type SimulasiPackage = { id: number; meta: string; ready: boolean; runs: number; nap?: number; prev?: number; at?: string };
export type LastScores = Partial<Record<ModuleType, { score: number; at: string; prev?: number }>>;

const WAVE = wavePath(50, 4.5, -100, 200, 140);
const FACES: { type: ModuleType; label: string; side: string; pts: string; y0: number; h: number; shade: number; text: string }[] = [
  { type: "KECERDASAN", label: "Kecerdasan", side: "kiri", pts: "0,28.87 50,57.735 50,115.47 0,86.6", y0: 28.87, h: 86.6, shade: 0.07, text: "matrix(1 0.577 0 1 25 74)" },
  { type: "KECERMATAN", label: "Sikap Kerja", side: "kanan", pts: "50,57.735 100,28.87 100,86.6 50,115.47", y0: 28.87, h: 86.6, shade: 0.2, text: "matrix(1 -0.577 0 1 75 74)" },
  { type: "KEPRIBADIAN", label: "Kepribadian", side: "atas", pts: "0,28.87 50,0 100,28.87 50,57.735", y0: 0, h: 57.735, shade: 0, text: "matrix(0.866 0.5 -0.866 0.5 50 31)" },
];
const HEX = "50,0 100,28.87 100,86.6 50,115.47 0,86.6 0,28.87";
const OUTLINE = HEX;
const SUB_VAR = { KECERDASAN: "--sub-kc", KECERMATAN: "--sub-km", KEPRIBADIAN: "--sub-kp" } as const;

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
  packages,
  items,
  last,
  action,
}: {
  packages: SimulasiPackage[];
  /** Kubus per kartu paket yang sudah tersedia. */
  items: Record<number, SimulasiItem[]>;
  last: LastScores;
  action: (formData: FormData) => Promise<void>;
}) {
  const [pkg, setPkg] = useState<number | null>(null);
  const [selected, setSelected] = useState(0);
  const [pending, startTransition] = useTransition();
  const list = pkg === null ? [] : items[pkg] ?? [];
  const item = list[selected];
  const ready = packages.filter((p) => p.ready);
  const [sel, setSel] = useState(() => (ready.find((p) => p.runs === 0) ?? ready.at(-1))?.id);
  const [preview, setPreview] = useState<number | null>(null);
  const prev = packages.find((p) => p.id === preview);

  if (pkg === null || !item) {
    return (
      <>
        <svg width="0" height="0" className="absolute" aria-hidden="true">
          <defs>
            <linearGradient id="sp-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#b8892b" />
              <stop offset=".5" stopColor="#f3dd8e" />
              <stop offset="1" stopColor="#c9a24a" />
            </linearGradient>
          </defs>
        </svg>
        <ol className="sp-list is-pick" aria-label="Pilih paket simulasi">
          {packages.map((p, i) => {
            const state = !p.ready ? "is-locked" : `is-ready${p.runs > 0 ? " is-done" : ""}${p.id === sel ? " is-sel" : ""}`;
            const delta = p.nap !== undefined && p.prev !== undefined ? Math.round(p.nap) - Math.round(p.prev) : 0;
            return (
              <li key={p.id} className={`sp-step ${state}`} style={{ animationDelay: `${i * 70}ms` }}>
                <span className="sp-node" aria-hidden="true">
                  <svg viewBox="-4 -4 108 124">
                    <polygon points={HEX} />
                  </svg>
                  <b className="tnum">{String(p.id).padStart(2, "0")}</b>
                  {p.runs > 0 && (
                    <span className="sp-tick">
                      <Check className="size-3" />
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  className="sp-card"
                  disabled={!p.ready}
                  aria-haspopup="dialog"
                  onClick={() => {
                    setSel(p.id);
                    setPreview(p.id);
                  }}
                >
                  {p.runs > 0 && (
                    <span className="sp-badges">
                      <span className="sp-badge is-ok">
                        <Check />
                        Sudah dikerjakan
                      </span>
                    </span>
                  )}
                  <span>
                    <span className="sp-title">Simulasi Penuh Paket {p.id}</span>
                    <span className="sp-meta tnum">
                      {!p.ready ? (
                        <span>Bank soal sedang disusun</span>
                      ) : p.runs > 0 ? (
                        <>
                          <span>Selesai {p.runs} kali</span>
                          <span>terakhir {p.at}</span>
                        </>
                      ) : (
                        <>
                          <span>Belum pernah dikerjakan</span>
                          <span>{p.meta}</span>
                        </>
                      )}
                    </span>
                  </span>
                  {!p.ready ? (
                    <span className="sp-soon">Segera</span>
                  ) : (
                    <>
                      <span className="sp-side">
                        {p.nap !== undefined && (
                          <span className="sp-score tnum">
                            <small>Nilai Akhir Psikotest</small>
                            <strong>{Math.round(p.nap)}</strong>
                            {delta !== 0 && (
                              <em className={delta > 0 ? "pg-up" : "pg-down"}>
                                {delta > 0 ? "+" : "−"}
                                {Math.abs(delta)}
                              </em>
                            )}
                          </span>
                        )}
                        <span className="sp-cta">
                          {p.runs > 0 ? "Ulangi paket" : "Pilih paket"}
                          <ArrowRight className="size-4" />
                        </span>
                      </span>
                      <span className="sp-mix">
                        <span className="sp-bar" aria-hidden="true">
                          {MODULE_ORDER.map((t) => (
                            <i key={t} style={{ flex: MODULE_CONFIG[t].time_limit_seconds, background: `var(${SUB_VAR[t]})` }} />
                          ))}
                        </span>
                        <span className="sp-legend tnum">
                          {MODULE_ORDER.map((t) => (
                            <span key={t} style={{ "--c": `var(${SUB_VAR[t]})` } as CSSProperties}>
                              <b>{MODULE_CONFIG[t].label}</b> {MODULE_CONFIG[t].time_limit_seconds / 60} mnt
                            </span>
                          ))}
                        </span>
                      </span>
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
        <Dialog open={prev !== undefined} onClose={() => setPreview(null)} labelledBy="sp-prev-title">
          {prev && (
            <div className="sp-prev">
              <span className="section-kicker">Pratinjau paket</span>
              <h2 id="sp-prev-title" className="sp-prev-title">
                Simulasi Penuh Paket {prev.id}
              </h2>
              <p className="sp-prev-meta tnum">
                {prev.runs > 0
                  ? `Selesai ${prev.runs} kali · terakhir ${prev.at}${prev.nap !== undefined ? ` · Nilai Akhir Psikotest ${Math.round(prev.nap)}` : ""}`
                  : "Belum pernah dikerjakan"}
              </p>
              <span className="sp-bar" aria-hidden="true">
                {MODULE_ORDER.map((t) => (
                  <i key={t} style={{ flex: MODULE_CONFIG[t].time_limit_seconds, background: `var(${SUB_VAR[t]})` }} />
                ))}
              </span>
              <ul className="sp-prev-list tnum">
                {(items[prev.id] ?? []).map((it) => (
                  <li key={it.id} data-full={it.faces.length > 1 ? "true" : undefined}>
                    <b>{it.title}</b>
                    <span>{it.meta}</span>
                  </li>
                ))}
              </ul>
              <p className="sp-prev-note">Timer berjalan dan hasil masuk riwayat. Di langkah berikutnya pilih tryout lengkap atau satu sub-tes.</p>
              <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                <Button variant="secondary" onClick={() => setPreview(null)}>
                  Batal
                </Button>
                <Button
                  variant="accent"
                  onClick={() => {
                    setSelected(0);
                    setPkg(prev.id);
                    setPreview(null);
                  }}
                >
                  Lanjut pilih tes
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </Dialog>
      </>
    );
  }

  function start() {
    const fd = new FormData();
    fd.set("module", item.id);
    fd.set("paket", String(pkg));
    startTransition(() => action(fd));
  }

  return (
    <>
      <button type="button" className="sp-back" onClick={() => setPkg(null)}>
        <ChevronLeft className="size-4" />
        Ganti paket · Paket {pkg}
      </button>
      <div className="hc-stage">
        <div className="hc-field hc-frame hc-cubefield">
          <p className="hc-hud" aria-hidden="true">
            Nilai terakhir <b>per sub-tes</b>
          </p>
          <div className="hc-cubes" role="group" aria-label="Pilih tes">
            {list.map((it, i) => (
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
                    <span>
                      {!on ? "Tidak termasuk tes ini" : l ? `Sisi ${f.side} · terakhir ${l.at}` : `Sisi ${f.side} · belum pernah dikerjakan`}
                      {on && l && l.prev !== undefined && Math.round(l.score) !== Math.round(l.prev) && (
                        <span className={l.score > l.prev ? "pg-up" : "pg-down"}>
                          {" "}· {l.score > l.prev ? "naik" : "turun"} {Math.abs(Math.round(l.score) - Math.round(l.prev))}
                        </span>
                      )}
                    </span>
                    {on && l && (
                      <span className="pg-sbar" role="img" aria-label={`Skor ${Math.round(l.score)} dari 100, batas gugur 40`}>
                        <span className="pg-grow" style={{ width: `${Math.max(0, Math.min(100, l.score))}%` }} />
                      </span>
                    )}
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
    </>
  );
}
