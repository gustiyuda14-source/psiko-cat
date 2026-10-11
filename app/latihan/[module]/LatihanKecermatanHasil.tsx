"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { SafeQuestion, KecermatanOptionsPayload } from "@/lib/types/safe-question";
import type { KecermatanScoreResult } from "@/lib/scoring/kecermatan";
import { KecermatanSymbol } from "@/app/components/KecermatanKeyStrip";
import { buttonStyles } from "@/app/components/ui";
import { ChevronRight, Repeat } from "@/app/components/icons";
import { fillY, wavePath } from "@/lib/honey";

/*
  Layar selesai latihan Kecermatan, bahasa visual sama dengan pemilih paket
  (app/honey.css): panel madu di kanan (sticky di desktop, paling atas di HP)
  berisi meter heksagon, indeks Ke/Kt/Kh (mode timer), dan grafik klik per kolom —
  batang yang rata = Ketahanan tinggi. Kiri: rincian per kolom, tiap kolom
  <details> yang bisa dibuka untuk melihat butir yang salah.
*/

export type LatihanFeedback = { selected: string; is_correct: boolean; correct_key: string };

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const HEX = "50,0 100,28.87 100,86.6 50,115.47 0,86.6 0,28.87";
const WAVE = wavePath(50, 4.5, -100, 200, 140);
const PER_COLUMN = 50;
const r1 = (n: number) => (Math.round(n * 10) / 10).toLocaleString("id-ID");

type Wrong = { id: string; no: number; shown: string[]; selected: string; selectedSym: string; key: string; keySym: string };
type Column = { index: number; total: number; correct: number; wrong: Wrong[] };

function buildColumns(sorted: SafeQuestion[], answers: Record<string, LatihanFeedback>): Column[] {
  const cols: Column[] = ROMAN.map((_, i) => ({ index: i + 1, total: 0, correct: 0, wrong: [] }));
  for (const q of sorted) {
    const fb = answers[q.id];
    const col = cols[(q.column_index ?? 0) - 1];
    if (!fb || !col) continue;
    col.total++;
    if (fb.is_correct) {
      col.correct++;
      continue;
    }
    const p = q.options_payload as unknown as KecermatanOptionsPayload;
    const sym = (k: string) => p.symbol_map[k as keyof typeof p.symbol_map] ?? "?";
    col.wrong.push({
      id: q.id,
      no: q.sequence_number,
      shown: p.shown,
      selected: fb.selected,
      selectedSym: sym(fb.selected),
      key: fb.correct_key,
      keySym: sym(fb.correct_key),
    });
  }
  return cols;
}

function HexMeter({ value, label, note }: { value: number; label: string; note: string }) {
  // Mulai kosong lalu terisi: satu momen gerak di layar ini.
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(value));
    return () => cancelAnimationFrame(id);
  }, [value]);
  return (
    <div className="hc-meter lr-meter">
      <svg viewBox="0 0 100 115.47" className="hc-meter-hex" aria-hidden="true">
        <defs>
          <clipPath id="lr-hex">
            <polygon points={HEX} />
          </clipPath>
          <linearGradient id="lr-honey" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--honey-top)" />
            <stop offset="1" stopColor="var(--honey-bot)" />
          </linearGradient>
        </defs>
        <polygon points={HEX} className="hc-core-base" />
        <g clipPath="url(#lr-hex)">
          <g className="hc-honey-y" style={{ transform: `translateY(${fillY(0, 115.47, Math.max(shown, 0.04))}px)` }}>
            <g className="hc-honey-x is-live">
              <path d={WAVE} fill="url(#lr-honey)" className="hc-honey" />
            </g>
          </g>
        </g>
        <polygon points={HEX} className="hc-core-line" />
      </svg>
      <div>
        <span className="lr-meter-lab">{label}</span>
        <span className="hc-meter-pct tnum">{r1(value * 100)}</span>
        <span className="hc-meter-of">{note}</span>
      </div>
    </div>
  );
}

function Bar({ value }: { value: number }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setW(Math.max(0, Math.min(100, value))));
    return () => cancelAnimationFrame(id);
  }, [value]);
  return (
    <i aria-hidden="true">
      <span style={{ transform: `scaleX(${w / 100})` }} />
    </i>
  );
}

export default function LatihanKecermatanHasil({
  sorted,
  answers,
  timedMode,
  score,
  scoreFailed,
  onRestart,
}: {
  sorted: SafeQuestion[];
  answers: Record<string, LatihanFeedback>;
  timedMode: boolean;
  score: KecermatanScoreResult | null;
  scoreFailed: boolean;
  onRestart: () => void;
}) {
  const cols = buildColumns(sorted, answers);
  const answered = cols.reduce((s, c) => s + c.total, 0);
  const correct = cols.reduce((s, c) => s + c.correct, 0);
  const accuracy = answered ? correct / answered : 0;
  const touched = cols.filter((c) => c.total > 0);
  const peak = Math.max(PER_COLUMN, ...cols.map((c) => c.total));

  const panel = (
    <aside className="hc-panel lr-panel" aria-label="Hasil latihan" aria-live="polite">
      <div className="hc-panel-top">
        <span className="hc-tag">Kecermatan</span>
        <span className="hc-code">{timedMode ? "60 detik per kolom" : "Tanpa batas waktu"}</span>
      </div>
      <h2 className="hc-panel-title">Latihan selesai</h2>
      <p className="hc-panel-desc tnum">
        {answered} dari {sorted.length} butir dicoba · {correct} benar
      </p>

      {timedMode ? (
        score ? (
          <>
            <HexMeter value={score.raw_score / 100} label="Skor murni" note="Dihitung dengan rumus ujian resmi" />
            <dl className="lr-idx">
              {[
                { label: "Kecepatan", value: score.ke_index },
                { label: "Ketelitian", value: score.kt_index },
                { label: "Ketahanan", value: score.kh_index },
              ].map((s) => (
                <div key={s.label}>
                  <dt>{s.label}</dt>
                  <dd className="tnum">{r1(s.value)}</dd>
                  <Bar value={s.value} />
                </div>
              ))}
            </dl>
            <dl className="lr-sum">
              <div>
                <dt>Kontribusi ke Nilai Akhir Psikotest</dt>
                <dd className="tnum">
                  {r1(score.nap_contribution)} <small>/ 20</small>
                </dd>
              </div>
            </dl>
            {score.is_disqualifying && (
              <p className="lr-warn">Skor murni 40 ke bawah. Di ujian, nilai ini menggugurkan.</p>
            )}
          </>
        ) : (
          <p className="lr-wait">{scoreFailed ? "Skor belum bisa dihitung. Coba ulangi latihan." : "Menghitung skor…"}</p>
        )
      ) : (
        <HexMeter
          value={accuracy}
          label="Ketepatan"
          note="Skor rumus ujian muncul kalau latihan memakai timer per kolom."
        />
      )}

      <figure className="lr-chart">
        <figcaption>
          <b>Jawaban per kolom</b>
          <span>
            <i className="is-ok" /> benar <i className="is-bad" /> salah
          </span>
        </figcaption>
        <ol aria-label="Jumlah jawaban tiap kolom">
          {cols.map((c, i) => (
            <li key={c.index} aria-label={`Kolom ${ROMAN[i]}: ${c.total} dijawab, ${c.correct} benar`}>
              <span className="lr-chart-track">
                <span className="lr-chart-n tnum">{c.total || ""}</span>
                <span className="lr-chart-bar" style={{ height: `calc((100% - 14px) * ${c.total / peak})`, animationDelay: `${i * 40}ms` }}>
                  <span className="is-bad" style={{ flexGrow: c.total - c.correct }} />
                  <span className="is-ok" style={{ flexGrow: c.correct }} />
                </span>
              </span>
              <span className="lr-chart-x">{ROMAN[i]}</span>
            </li>
          ))}
        </ol>
        {timedMode && <p>Bagian emas yang sama tinggi di tiap kolom berarti Ketahanan tinggi.</p>}
      </figure>

      <div className="hc-actions">
        <button type="button" onClick={onRestart} className={buttonStyles({ variant: "primary", size: "lg", block: true })}>
          <Repeat className="size-4" />
          Ulangi latihan
        </button>
        <Link href="/dashboard/latihan/kecermatan" className={buttonStyles({ variant: "ghost", block: true })}>
          Pilih paket lain
        </Link>
      </div>
    </aside>
  );

  return (
    <div className="lr-stage">
      {panel}
      <section className="lr-main" aria-labelledby="lr-cols-title">
        <h2 id="lr-cols-title" className="lr-title">
          Rincian per kolom
        </h2>
        {touched.length === 0 ? (
          <p className="lr-empty">Belum ada butir yang dijawab.</p>
        ) : (
          <ul className="lr-cols">
            {touched.map((c) => {
              const i = c.index - 1;
              const clean = c.wrong.length === 0;
              return (
                <li key={c.index}>
                  <details className="lr-col">
                    <summary>
                      <span className={`pk-hex${clean ? " is-full" : " is-part"}`} aria-hidden="true">
                        <svg viewBox="0 0 100 115.47">
                          <polygon points="50,2 98,29.9 98,85.6 50,113.5 2,85.6 2,29.9" />
                        </svg>
                        <b>{ROMAN[i]}</b>
                      </span>
                      <span className="lr-col-main">
                        <span className="lr-col-top">
                          <b>Kolom {ROMAN[i]}</b>
                          <span className="tnum">
                            {c.correct}/{c.total} benar
                          </span>
                        </span>
                        <span className="lr-col-bar" aria-hidden="true">
                          <span style={{ width: `${(c.correct / PER_COLUMN) * 100}%` }} className="is-ok" />
                          <span style={{ width: `${(c.wrong.length / PER_COLUMN) * 100}%` }} className="is-bad" />
                        </span>
                      </span>
                      <span className={`lr-pill${clean ? " is-clean" : ""}`}>{clean ? "Bersih" : `${c.wrong.length} salah`}</span>
                      <ChevronRight className="lr-chev size-4" />
                    </summary>
                    {clean ? (
                      <p className="lr-clean">Semua jawaban di kolom ini benar.</p>
                    ) : (
                      <ul className="lr-wrong">
                        {c.wrong.map((w) => (
                          <li key={w.id}>
                            <span className="lr-no tnum">Butir {w.no}</span>
                            <span className="lr-sym" aria-label="Simbol yang tampil">
                              {w.shown.map((s, k) => (
                                <span key={k}>
                                  <KecermatanSymbol symbol={s} />
                                </span>
                              ))}
                            </span>
                            <span className="lr-ans">
                              <span className="is-bad">
                                Pilih {w.selected} <KecermatanSymbol symbol={w.selectedSym} />
                              </span>
                              <span className="is-ok">
                                Kunci {w.key} <KecermatanSymbol symbol={w.keySym} />
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </details>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
