"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Close } from "@/app/components/icons";
import { buttonStyles } from "@/app/components/ui";
import { Button, Dialog } from "@/app/components/ui-client";

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
  /** Rincian per-bagian (kolom) — cuma dipakai Kecermatan. Kalau diisi,
      "Mulai Paket" buka modal rincian dulu, bukan langsung pindah halaman. */
  sections?: PackageSection[];
};

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
  /** Label badge saat paket lengkap, mis. "10 kolom" atau "100 butir". */
  completeLabel: string;
  /** Prefix rute sesi, mis. "/latihan/kecerdasan" — id paket ditempel di belakangnya. */
  hrefBase: string;
  /** Nama modul buat aria-label, mis. "kecerdasan". */
  moduleLabel: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const active = packages[activeIndex];

  if (!active) return null;
  const activeAvailable = active.questionCount === expectedCount;

  function move(direction: -1 | 1) {
    setActiveIndex((index) => Math.min(packages.length - 1, Math.max(0, index + direction)));
  }

  return (
    <section className="package-carousel" aria-labelledby="package-carousel-title">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-wide text-muted-foreground">PILIH PAKET</p>
          <h2 id="package-carousel-title" className="mt-1 font-heading text-2xl text-foreground">
            Tentukan set latihan Anda
          </h2>
        </div>
        <div className="flex items-center gap-2" aria-label="Navigasi paket">
          <button
            type="button"
            onClick={() => move(-1)}
            disabled={activeIndex === 0}
            className="inline-flex size-11 items-center justify-center rounded-md border border-border-strong bg-card text-foreground shadow-e1 transition-colors hover:bg-surface-inset disabled:pointer-events-none disabled:opacity-45"
            aria-label="Paket sebelumnya"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="tnum min-w-16 text-center text-sm font-semibold text-muted-foreground">
            {activeIndex + 1} / {packages.length}
          </span>
          <button
            type="button"
            onClick={() => move(1)}
            disabled={activeIndex === packages.length - 1}
            className="inline-flex size-11 items-center justify-center rounded-md border border-border-strong bg-card text-foreground shadow-e1 transition-colors hover:bg-surface-inset disabled:pointer-events-none disabled:opacity-45"
            aria-label="Paket berikutnya"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div
        className="package-carousel__stage"
        aria-label={`Pilihan paket ${moduleLabel}`}
        onKeyDown={(event) => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
          event.preventDefault();
          move(event.key === "ArrowLeft" ? -1 : 1);
        }}
      >
        {packages.map((pkg, index) => {
          const offset = index - activeIndex;
          const state = offset === 0 ? "is-active" : Math.abs(offset) === 1 ? "is-neighbor" : "is-distant";
          const isActive = offset === 0;

          const pkgAvailable = pkg.questionCount === expectedCount;

          return (
            <button
              key={pkg.id}
              type="button"
              onClick={() => {
                if (!isActive) {
                  setActiveIndex(index);
                  return;
                }
                if (pkg.sections && pkgAvailable) setShowDetail(true);
              }}
              aria-pressed={isActive}
              aria-hidden={Math.abs(offset) > 1 ? true : undefined}
              tabIndex={isActive ? 0 : -1}
              className={`package-carousel__card ${state}`}
              style={{ "--package-offset": offset } as CSSProperties}
            >
              <span className="flex items-start justify-between gap-3">
                <span className="package-carousel__index font-heading text-4xl leading-none">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="package-carousel__badge px-2.5 py-1 text-xs font-semibold">
                  {pkg.questionCount === expectedCount ? completeLabel : "Belum lengkap"}
                </span>
              </span>
              <span>
                <span className="block text-lg font-bold">{pkg.label}</span>
                <span className="mt-1 block text-sm text-[var(--pc-ink-dim)]">
                  {pkg.questionCount == null
                    ? "Jumlah butir belum tersedia"
                    : `${pkg.questionCount} ${unitLabel}`}
                </span>
              </span>
              {pkg.symbols && (
                <span className="package-carousel__symbols" aria-label={`Pratinjau simbol ${pkg.label}`}>
                  {pkg.symbols.map((symbol, symbolIndex) => (
                    <span key={symbolIndex}>{symbol}</span>
                  ))}
                </span>
              )}
              <span className="package-carousel__reticle" aria-hidden="true" />
              <span className="package-carousel__scanline" aria-hidden="true" />
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Dipilih: <span className="font-semibold text-foreground">{active.label}</span>
          <span className="tnum"> · {active.questionCount ?? "—"} {unitLabel}</span>
        </p>
        {active.sections ? (
          activeAvailable ? (
            <p className="text-sm text-muted-foreground">Klik kartu paket di atas buat mulai</p>
          ) : (
            <Button variant="secondary" size="lg" disabled>
              Paket belum tersedia
            </Button>
          )
        ) : activeAvailable ? (
          <Link
            href={`${hrefBase}/${active.id}`}
            className={buttonStyles({ variant: "primary", size: "lg" })}
          >
            Mulai {active.label}
            <ArrowRight className="size-4" />
          </Link>
        ) : (
          <Button variant="secondary" size="lg" disabled>
            Paket belum tersedia
          </Button>
        )}
      </div>
      <p className="sr-only" aria-live="polite">
        {active.label} dipilih.
      </p>

      {active.sections && (
        <Dialog
          open={showDetail}
          onClose={() => setShowDetail(false)}
          labelledBy="package-detail-title"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-wide text-muted-foreground">PAKET TERPILIH</p>
              <h2 id="package-detail-title" className="font-heading mt-1 text-2xl text-foreground">
                {active.label}
              </h2>
              <p className="tnum mt-1 text-sm text-muted-foreground">
                {active.questionCount} {unitLabel} · Tanpa batas waktu
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDetail(false)}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface-inset hover:text-foreground"
              aria-label="Tutup"
            >
              <Close className="size-4" />
            </button>
          </div>

          <ul className="mt-5 max-h-80 space-y-2 overflow-y-auto pr-1">
            {active.sections.map((section) => (
              <li
                key={section.index}
                className="inset-panel flex items-center justify-between gap-3 px-3.5 py-2.5"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">Kolom {section.index}</p>
                  <p className="tnum text-xs text-muted-foreground">{section.questionCount} butir</p>
                </div>
                {section.symbols && (
                  <span className="package-carousel__symbols" aria-label={`Simbol kolom ${section.index}`}>
                    {section.symbols.map((symbol, symbolIndex) => (
                      <span key={symbolIndex}>{symbol}</span>
                    ))}
                  </span>
                )}
              </li>
            ))}
          </ul>

          <Link
            href={`${hrefBase}/${active.id}?autostart=1`}
            className={buttonStyles({
              variant: "accent",
              size: "lg",
              block: true,
              className: "btn-pulse-cta mt-6 justify-center rounded-full",
            })}
          >
            Mulai Paket
            <ArrowRight className="size-4" />
          </Link>
        </Dialog>
      )}
    </section>
  );
}
