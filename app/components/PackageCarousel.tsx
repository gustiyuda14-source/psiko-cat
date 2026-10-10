"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "@/app/components/icons";
import { buttonStyles } from "@/app/components/ui";
import { Button, ConfirmDialog } from "@/app/components/ui-client";
import { DrillWheel, type WheelCard } from "@/app/dashboard/drill/DrillWheel";
import { fillY, wavePath } from "@/lib/honey";
import { clearLatihanProgress, useLatihanProgress } from "@/lib/latihan-progress";

/*
  Pemilih paket latihan memakai roda madu yang sama dengan katalog drilling: satu
  irisan per paket, satu cincin per kolom (10 untuk Kecermatan, 4 bagian untuk modul
  lain), madu = capaian terjauh (butir terbanyak yang pernah dijawab dalam satu sesi,
  dari lib/latihan-progress.ts). Roda berputar supaya paket terpilih berhenti di
  penanda. Panel di samping berisi rincian paket + tombol mulai; untuk Kecermatan juga
  rincian kolom dan pilihan timer per kolom. Nama komponen dipertahankan supaya
  pemanggilnya tidak berubah. CSS di app/honey.css.
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

const WAVE = wavePath(50, 4.5, -100, 200, 140);
const HEX = "50,0 100,28.87 100,86.6 50,115.47 0,86.6 0,28.87";

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
  const panelRef = useRef<HTMLElement>(null);

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
  const ring = (v: (typeof view)[number], k: number) => Math.max(0, Math.min(1, v.p * marks - k));
  const wheel: WheelCard[] = view.map((v, i) => ({
    kartu: String(v.pkg.id),
    no: String(i + 1).padStart(2, "0"),
    label: v.pkg.label,
    aspek: "paket",
    aspekLabel: "",
    tiers: Array.from({ length: marks }, (_, k) => ring(v, k)),
    p: v.p,
    locked: !v.ready,
    match: true,
    aria: `${v.pkg.label}, ${status(v)}${v.ready ? `, ${v.done} dari ${v.pkg.questionCount} ${unitLabel}` : ""}`,
  }));
  const ready_ = view.filter((v) => v.ready);
  const doneAll = ready_.reduce((n, v) => n + v.done, 0);
  const totalAll = ready_.reduce((n, v) => n + (v.pkg.questionCount ?? 0), 0);
  const href = pkg.sections ? `${hrefBase}/${pkg.id}?autostart=1${timedMode ? "&timed=1" : ""}` : `${hrefBase}/${pkg.id}`;

  return (
    <section aria-labelledby="package-carousel-title">
      <div className="mb-4">
        <span className="section-kicker">Katalog latihan</span>
        <h2 id="package-carousel-title" className="mt-1 font-heading text-2xl text-foreground">
          Pilih paket
        </h2>
      </div>

      <div className="hc-stage">
        <div className="hc-field">
          <DrillWheel
            cards={wheel}
            selected={String(current.pkg.id)}
            overall={{ p: totalAll ? doneAll / totalAll : 0, done: doneAll, total: totalAll }}
            unit={unitLabel}
            hud={
              <>
                Roda <b>{moduleLabel}</b>&nbsp; {packages.length} paket
              </>
            }
            legend={marks === 10 ? "Satu cincin per kolom: dalam kolom 1, luar kolom 10." : "Satu cincin per seperempat paket, dari dalam ke luar."}
            onSelect={(id, again) => {
              setSelected(Number(id));
              // Ketuk irisan yang sudah terpilih = lanjut ke tombol mulai di panel.
              if (again) panelRef.current?.querySelector<HTMLElement>("a, button:not(:disabled)")?.focus();
            }}
          />
        </div>

        <aside ref={panelRef} className="hc-panel" aria-live="polite" key={pkg.id}>
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
                <svg viewBox="0 0 100 115.47" className="hc-meter-hex" aria-hidden="true">
                  <defs>
                    <clipPath id="pc-hex">
                      <polygon points={HEX} />
                    </clipPath>
                    <linearGradient id="pc-honey" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="var(--honey-top)" />
                      <stop offset="1" stopColor="var(--honey-bot)" />
                    </linearGradient>
                  </defs>
                  <polygon points={HEX} className="hc-core-base" />
                  <g clipPath="url(#pc-hex)">
                    <g className="hc-honey-y" style={{ transform: `translateY(${fillY(0, 115.47, p)}px)` }}>
                      <path d={WAVE} fill="url(#pc-honey)" className="hc-honey" />
                    </g>
                  </g>
                  <polygon points={HEX} className="hc-core-line" />
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
