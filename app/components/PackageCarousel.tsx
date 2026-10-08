"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Close } from "@/app/components/icons";
import { buttonStyles } from "@/app/components/ui";
import { Dialog } from "@/app/components/ui-client";
import { TicketCatalog, type TicketItem } from "@/app/components/TicketCatalog";

/*
  Katalog paket bergaya "tiket level" dari dajiks-cest (assets/cest-catalog.js):
  konsol cari + filter, kartu tiket (badan + sobekan berlubang) di track
  scroll-snap dengan kartu tengah fokus, rel penghitung + titik di bawah.
  Ketuk kartu samping = geser ke tengah, ketuk kartu tengah = pilih paket.
  CSS ada di app/catalog.css.
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
  /** Rincian per-bagian (kolom) — cuma dipakai Kecermatan. Kalau diisi,
      memilih paket membuka modal rincian dulu, bukan langsung pindah halaman. */
  sections?: PackageSection[];
};

const FILTERS = [
  { key: "all", label: "Semua" },
  { key: "ready", label: "Tersedia" },
  { key: "soon", label: "Belum tersedia" },
];

const TONE: Record<string, TicketItem["tone"]> = {
  kecerdasan: "green",
  kecermatan: "cyan",
  kepribadian: "amber",
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
  const router = useRouter();
  const [detail, setDetail] = useState<PackageOption | null>(null);
  const [timedMode, setTimedMode] = useState(false);

  const base = moduleLabel.split(" ")[0];
  const items: TicketItem[] = packages.map((pkg, index) => {
    const available = pkg.questionCount === expectedCount;
    const percent = pkg.questionCount ? Math.min(100, Math.round((pkg.questionCount / expectedCount) * 100)) : 0;
    return {
      id: pkg.id,
      tag: base,
      tone: TONE[base] ?? "green",
      badges: available ? [completeLabel] : [],
      title: pkg.label,
      meta: pkg.questionCount == null ? "Jumlah butir belum tersedia" : `${pkg.questionCount} ${unitLabel}`,
      symbols: pkg.symbols,
      symbolsLabel: `Pratinjau simbol ${pkg.label}`,
      foot: available ? "Mulai paket" : "Belum tersedia",
      stub: ["Paket", String(index + 1).padStart(2, "0")],
      ring: available || percent > 0 ? { p: percent, text: `${percent}%` } : undefined,
      locked: !available,
      group: [available ? "ready" : "soon"],
      search: pkg.label,
    };
  });

  function pick(item: TicketItem) {
    const pkg = packages.find((p) => p.id === item.id);
    if (!pkg) return;
    if (pkg.sections) setDetail(pkg);
    else router.push(`${hrefBase}/${pkg.id}`);
  }

  return (
    <section aria-labelledby="package-carousel-title">
      <div className="mb-4">
        <span className="section-kicker">Katalog latihan</span>
        <h2 id="package-carousel-title" className="mt-1 font-heading text-2xl text-foreground">
          Pilih paket
        </h2>
      </div>

      <TicketCatalog
        items={items}
        label={`paket ${moduleLabel}`}
        filters={FILTERS}
        search
        placeholder="Cari paket…"
        onPick={pick}
      />

      <Dialog
        open={detail !== null}
        onClose={() => setDetail(null)}
        labelledBy="package-detail-title"
      >
        {detail?.sections && (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-kicker">Paket terpilih</p>
                <h2 id="package-detail-title" className="font-heading mt-1 text-2xl text-foreground">
                  {detail.label}
                </h2>
                <p className="tnum mt-1 text-sm text-muted-foreground">
                  {detail.questionCount} {unitLabel} · Tanpa batas waktu
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface-inset hover:text-foreground"
                aria-label="Tutup"
              >
                <Close className="size-4" />
              </button>
            </div>

            <ul className="mt-5 max-h-80 space-y-2 overflow-y-auto pr-1">
              {detail.sections.map((section) => (
                <li
                  key={section.index}
                  className="inset-panel flex items-center justify-between gap-3 px-3.5 py-2.5"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">Kolom {section.index}</p>
                    <p className="tnum text-xs text-muted-foreground">{section.questionCount} butir</p>
                  </div>
                  {section.symbols && (
                    <span className="cat-symbols w-44" aria-label={`Simbol kolom ${section.index}`}>
                      {section.symbols.map((symbol, k) => (
                        <span key={k}>{symbol}</span>
                      ))}
                    </span>
                  )}
                </li>
              ))}
            </ul>

            <div className="inset-panel mt-5 flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Aktifkan timer per kolom?</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {timedMode
                    ? "60 detik per kolom, urutan terkunci — persis mode ujian."
                    : "Tanpa batas waktu, bebas pindah kolom kapan saja."}
                </p>
              </div>
              <div
                role="radiogroup"
                aria-label="Aktifkan timer per kolom"
                className="inline-flex gap-1 rounded-md border border-border bg-card p-1"
              >
                {[false, true].map((on) => (
                  <button
                    key={String(on)}
                    type="button"
                    role="radio"
                    aria-checked={timedMode === on}
                    onClick={() => setTimedMode(on)}
                    className={`min-h-9 rounded-[6px] px-3.5 text-sm font-semibold transition-colors duration-150 ${
                      timedMode === on
                        ? "bg-brand-ink text-white"
                        : "text-muted-foreground hover:bg-surface-inset hover:text-foreground"
                    }`}
                  >
                    {on ? "Ya" : "Tidak"}
                  </button>
                ))}
              </div>
            </div>

            <Link
              href={`${hrefBase}/${detail.id}?autostart=1${timedMode ? "&timed=1" : ""}`}
              className={buttonStyles({
                variant: "accent",
                size: "lg",
                block: true,
                className: "btn-pulse-cta mt-4 justify-center",
              })}
            >
              Mulai Paket
              <ArrowRight className="size-4" />
            </Link>
          </>
        )}
      </Dialog>
    </section>
  );
}
