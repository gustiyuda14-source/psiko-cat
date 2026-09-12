"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "@/app/components/icons";
import { buttonStyles } from "@/app/components/ui";
import { Button } from "@/app/components/ui-client";

type PackageOption = {
  id: number;
  label: string;
  questionCount: number | null;
  symbols: string[];
};

export function KecermatanPackageCarousel({ packages }: { packages: PackageOption[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = packages[activeIndex];

  if (!active) return null;
  const activeAvailable = active.questionCount === 500;

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
            className="inline-flex size-11 items-center justify-center rounded-md border border-border-strong/55 bg-card text-foreground shadow-e1 transition-colors hover:border-border-strong hover:bg-surface-inset disabled:pointer-events-none disabled:opacity-45"
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
            className="inline-flex size-11 items-center justify-center rounded-md border border-border-strong/55 bg-card text-foreground shadow-e1 transition-colors hover:border-border-strong hover:bg-surface-inset disabled:pointer-events-none disabled:opacity-45"
            aria-label="Paket berikutnya"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div
        className="package-carousel__stage"
        aria-label="Pilihan paket kecermatan"
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

          return (
            <button
              key={pkg.id}
              type="button"
              onClick={() => setActiveIndex(index)}
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
                  {pkg.questionCount === 500 ? "10 kolom" : "Belum lengkap"}
                </span>
              </span>
              <span>
                <span className="block text-lg font-bold">{pkg.label}</span>
                <span className="mt-1 block text-sm text-[var(--pc-ink-dim)]">
                  {pkg.questionCount == null ? "Jumlah butir belum tersedia" : `${pkg.questionCount} butir`}
                </span>
              </span>
              <span className="package-carousel__symbols" aria-label={`Pratinjau simbol ${pkg.label}`}>
                {pkg.symbols.map((symbol, symbolIndex) => (
                  <span key={symbolIndex}>{symbol}</span>
                ))}
              </span>
              <span className="package-carousel__reticle" aria-hidden="true" />
              <span className="package-carousel__scanline" aria-hidden="true" />
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Dipilih: <span className="font-semibold text-foreground">{active.label}</span>
          <span className="tnum"> · {active.questionCount ?? "—"} butir</span>
        </p>
        {activeAvailable ? (
          <Link
            href={`/latihan/kecermatan/${active.id}`}
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
    </section>
  );
}
