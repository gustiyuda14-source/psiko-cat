"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "@/app/components/icons";
import { buttonStyles } from "@/app/components/ui";
import { Button, ConfirmDialog } from "@/app/components/ui-client";
import { fillY, wavePath } from "@/lib/honey";
import { clearLatihanProgress, useLatihanProgress } from "@/lib/latihan-progress";

/*
  Pemilih paket latihan bergaya rak tabung ukur: satu tabung per paket, madu =
  capaian terjauh (butir terbanyak yang pernah dijawab dalam satu sesi, dari
  lib/latihan-progress.ts). Garis ukur 10 kolom untuk Kecermatan, 4 untuk modul
  lain. Panel di samping berisi rincian paket + tombol mulai; untuk Kecermatan
  juga rincian kolom dan pilihan timer per kolom (dulu modal). Nama komponen
  dipertahankan supaya pemanggilnya tidak berubah. CSS di app/honey.css.
*/

export type PackageSection = {
  index: number;
  questionCount: number;
  symbols?: string[];
};

export type PackageOption = {
  id: number;
  label: string;
  questionCount: number | null;
  /** Pratinjau simbol kolom pertama — cuma dipakai Kecermatan. */
  symbols?: string[];
  /** Rincian per-bagian (kolom) — cuma dipakai Kecermatan. */
  sections?: PackageSection[];
};

const TUBE_D = "M5 14 V146 A15 15 0 0 0 35 146 V14";
const WAVE = wavePath(20, 2, -40, 80, 180);

function Tube({ p, marks, locked, live }: { p: number; marks: number; locked: boolean; live: boolean }) {
  const ys = Array.from({ length: marks - 1 }, (_, i) => 14 + (147 * (i + 1)) / marks);
  return (
    <svg viewBox="0 0 40 170" aria-hidden="true">
      <path className="hc-tube-body" d={`${TUBE_D} Z`} />
      <g clipPath="url(#pc-tube-in)">
        {locked && <rect width="40" height="170" fill="url(#pc-hatch)" />}
        <g className="hc-honey-y" style={{ transform: `translateY(${fillY(14, 147, p)}px)` }}>
          <g className={live ? "hc-honey-x is-live is-tube" : "hc-honey-x"}>
            <path d={WAVE} fill="url(#pc-honey)" className="hc-honey" />
          </g>
        </g>
      </g>
      {ys.map((y) => (
        <g key={y}>
          <path className="hc-tube-div" d={`M8 ${y} H32`} />
          <path className="hc-tube-tick" d={`M37 ${y} h3`} />
        </g>
      ))}
      <path className="hc-tube-glare" d="M11 22 V136" />
      <rect className="hc-tube-lip" x="1.5" y="8" width="37" height="6" rx="2" />
      <path className="hc-tube-line" d={TUBE_D} />
    </svg>
  );
}

export function PackageCarousel({
  packages,
  expectedCount,
  unitLabel,
  completeLabel,
  hrefBase,
  moduleLabel,
}: {
  packages: PackageOption[];
  /** Jumlah butir/pernyataan yang berarti paket ini sudah lengkap. */
  expectedCount: number;
  /** "butir" atau "pernyataan". */
  unitLabel: string;
  /** Keterangan isi paket lengkap, mis. "10 kolom" atau "100 butir". */
  completeLabel: string;
  /** Prefix rute sesi, mis. "/latihan/kecerdasan" — id paket ditempel di belakangnya. */
  hrefBase: string;
  /** Nama modul buat aria-label, mis. "kecerdasan". */
  moduleLabel: string;
}) {
  const progress = useLatihanProgress();
  const firstReady = packages.find((p) => p.questionCount === expectedCount);
  const [selected, setSelected] = useState(firstReady?.id ?? packages[0]?.id);
  const [timedMode, setTimedMode] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const marks = packages.some((p) => p.sections) ? 10 : 4;
  const view = packages.map((pkg) => {
    const key = `${hrefBase}/${pkg.id}`;
    const ready = pkg.questionCount === expectedCount;
    const done = Math.min(progress[key] ?? 0, pkg.questionCount ?? 0);
    const p = ready && pkg.questionCount ? done / pkg.questionCount : 0;
    return { pkg, key, ready, done, p };
  });
  const current = view.find((v) => v.pkg.id === selected) ?? view[0];
  if (!current) return null;
  const { pkg, ready, done, p } = current;
  const perColumn = pkg.sections?.length ? (pkg.questionCount ?? 0) / pkg.sections.length : 0;
  const status = (v: (typeof view)[number]) =>
    !v.ready ? "Belum tersedia" : v.p >= 1 ? "Selesai" : v.p > 0 ? `${Math.round(v.p * 100)}%` : "Belum mulai";
  const href = pkg.sections ? `${hrefBase}/${pkg.id}?autostart=1${timedMode ? "&timed=1" : ""}` : `${hrefBase}/${pkg.id}`;

  return (
    <section aria-labelledby="package-carousel-title">
      <div className="mb-4">
        <span className="section-kicker">Katalog latihan</span>
        <h2 id="package-carousel-title" className="mt-1 font-heading text-2xl text-foreground">
          Pilih paket
        </h2>
      </div>

      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <clipPath id="pc-tube-in">
            <path d="M8 14 V146 A12 12 0 0 0 32 146 V14 Z" />
          </clipPath>
          <linearGradient id="pc-honey" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--honey-top)" />
            <stop offset="1" stopColor="var(--honey-bot)" />
          </linearGradient>
          <pattern id="pc-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="7" height="7" fill="var(--surface-card)" />
            <rect width="2.5" height="7" fill="var(--hatch)" />
          </pattern>
        </defs>
      </svg>

      <div className="hc-stage">
        <div className="hc-field hc-frame hc-rackfield">
          <p className="hc-hud" aria-hidden="true">
            Rak <b>{moduleLabel}</b>&nbsp; {packages.length} paket
          </p>
          <div className="hc-rack" role="group" aria-label={`Paket ${moduleLabel}`}>
            {view.map((v, i) => (
              <button
                key={v.pkg.id}
                type="button"
                className={`hc-tube${v.ready ? "" : " is-locked"}`}
                aria-pressed={v.pkg.id === current.pkg.id}
                aria-label={`${v.pkg.label}, ${status(v)}${v.ready ? `, ${v.done} dari ${v.pkg.questionCount} ${unitLabel}` : ""}`}
                style={{ animationDelay: `${i * 40}ms` }}
                onClick={() => setSelected(v.pkg.id)}
              >
                <Tube p={v.p} marks={marks} locked={!v.ready} live={v.pkg.id === current.pkg.id && v.p > 0 && v.p < 1} />
                <span className="hc-tube-name">{v.pkg.label}</span>
                <span className="hc-tube-meta tnum">{status(v)}</span>
              </button>
            ))}
          </div>
        </div>

        <aside className="hc-panel" aria-live="polite" key={pkg.id}>
          <div className="hc-panel-top">
            <span className="hc-tag">{moduleLabel.split(" ")[0]}</span>
            <span className="hc-code tnum">{ready ? `${completeLabel} · tanpa timer` : "Belum tersedia"}</span>
          </div>
          <h2 className="hc-panel-title">{pkg.label}</h2>
          <p className="hc-panel-desc tnum">
            {pkg.questionCount == null ? "Jumlah butir belum tersedia" : `${pkg.questionCount} ${unitLabel}`}
          </p>

          {!ready ? (
            <p className="hc-panel-desc mt-4">Soal paket ini sedang disiapkan. Paket terbuka otomatis begitu soalnya lengkap.</p>
          ) : (
            <>
              <div className="hc-meter">
                <svg viewBox="0 0 40 170" className="hc-meter-tube" aria-hidden="true">
                  <path className="hc-tube-body" d={`${TUBE_D} Z`} />
                  <g clipPath="url(#pc-tube-in)">
                    <g className="hc-honey-y" style={{ transform: `translateY(${fillY(14, 147, p)}px)` }}>
                      <path d={WAVE} fill="url(#pc-honey)" className="hc-honey" />
                    </g>
                  </g>
                  <path className="hc-tube-line" d={TUBE_D} />
                </svg>
                <span className="hc-meter-pct tnum">{Math.round(p * 100)}%</span>
                <span className="hc-meter-of tnum">
                  Terjauh {done} dari {pkg.questionCount} {unitLabel}
                  <br />
                  {p >= 1 ? "Paket pernah diselesaikan" : done ? "Sesi baru mulai dari awal" : "Belum pernah dikerjakan"}
                </span>
              </div>

              {pkg.sections && (
                <>
                  <div className="hc-cols" aria-label={`${Math.floor(done / (perColumn || 1))} dari ${pkg.sections.length} kolom tercapai`}>
                    {pkg.sections.map((s, k) => (
                      <i key={s.index} className={perColumn && done >= perColumn * (k + 1) ? "is-on" : ""}>
                        <b>{s.index}</b>
                      </i>
                    ))}
                  </div>
                  <details className="hc-details">
                    <summary>Lihat simbol tiap kolom</summary>
                    <ul>
                      {pkg.sections.map((s) => (
                        <li key={s.index}>
                          <span>
                            Kolom {s.index} <small className="tnum">{s.questionCount} butir</small>
                          </span>
                          {s.symbols && (
                            <span className="cat-symbols" aria-label={`Simbol kolom ${s.index}`}>
                              {s.symbols.map((symbol, k) => (
                                <span key={k}>{symbol}</span>
                              ))}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </details>
                  <div className="hc-timer">
                    <div>
                      <b>Timer per kolom</b>
                      <span>{timedMode ? "60 detik per kolom, urutan terkunci, persis mode ujian." : "Tanpa batas waktu, bebas pindah kolom."}</span>
                    </div>
                    <div role="radiogroup" aria-label="Aktifkan timer per kolom" className="hc-seg">
                      {[false, true].map((on) => (
                        <button key={String(on)} type="button" role="radio" aria-checked={timedMode === on} onClick={() => setTimedMode(on)}>
                          {on ? "Ya" : "Tidak"}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="hc-actions">
                <Link href={href} className={buttonStyles({ variant: "primary", size: "lg", block: true })}>
                  {done ? "Latihan lagi" : "Mulai latihan"}
                  <ArrowRight className="size-4" />
                </Link>
                <Button variant="ghost" disabled={!done} onClick={() => setConfirmReset(true)}>
                  Hapus progres paket ini
                </Button>
              </div>
            </>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          clearLatihanProgress(current.key);
          setConfirmReset(false);
        }}
        title="Hapus progres paket ini?"
        confirmLabel="Hapus progres"
        tone="danger"
      >
        <p className="text-muted-foreground">Capaian {pkg.label} di perangkat ini dihapus. Paket lain tidak terpengaruh.</p>
      </ConfirmDialog>
    </section>
  );
}
