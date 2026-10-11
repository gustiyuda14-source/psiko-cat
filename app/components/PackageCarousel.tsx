"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight, Close } from "@/app/components/icons";
import { buttonStyles } from "@/app/components/ui";
import { Button, ConfirmDialog } from "@/app/components/ui-client";
import { useWide } from "@/app/dashboard/drill/DrillWheel";
import { KecermatanSymbol } from "@/app/components/KecermatanKeyStrip";
import { fillY, wavePath } from "@/lib/honey";
import { resetProgress, useLatihanAttempts, useLatihanProgress } from "@/lib/practice-progress";
import { MAX_LATIHAN_ATTEMPTS } from "@/lib/progress-rules";

/*
  Pemilih paket latihan: kartu "Lanjutkan" (satu ketukan ke paket yang sedang
  berjalan) di atas daftar semua paket. Daftar = timeline kartu paket yang sama dengan
  katalog Simulasi (app/paket.css): kartu navy, paket "Lanjutkan" ber-border emas
  berputar, paket selesai ber-badge hijau. Bar segmen (10 per kolom untuk Kecermatan,
  4 seperempat untuk modul lain) terisi sesuai capaian terjauh dari lib/practice-progress.ts.
  Rincian paket + tombol mulai: panel samping di desktop, lembar dari bawah di HP
  (<dialog> native — focus trap, Esc, dan top layer gratis). Nama komponen
  dipertahankan supaya pemanggilnya tidak berubah. CSS di app/honey.css.
*/

export type PackageSection = {
  index: number;
  questionCount: number;
  symbols?: string[];
};

/** Satu bagian isi paket berurutan, mis. aspek Kepribadian atau Substansi Khusus. */
export type PackagePart = { label: string; short: string; part: string; count: number };

export type PackageOption = {
  id: number;
  label: string;
  questionCount: number | null;
  /** Pratinjau simbol kolom pertama — cuma dipakai Kecermatan. */
  symbols?: string[];
  /** Rincian per-bagian (kolom) — cuma dipakai Kecermatan. */
  sections?: PackageSection[];
  /** Komposisi isi paket berurutan — dipakai Kepribadian (aspek + Substansi Khusus). */
  parts?: PackagePart[];
};

const WAVE = wavePath(50, 4.5, -100, 200, 140);
const HEX = "50,0 100,28.87 100,86.6 50,115.47 0,86.6 0,28.87";

/** Lembar rincian di HP: <dialog> modal yang menempel di bawah layar. */
function Sheet({ open, onClose, label, children }: { open: boolean; onClose: () => void; label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-label={label}
      className="pk-sheet"
      onCancel={(e) => {
        e.preventDefault(); // state React tetap sumber kebenaran
        onClose();
      }}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      {children}
    </dialog>
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
  const { attempts } = useLatihanAttempts();
  const firstReady = packages.find((p) => p.questionCount === expectedCount);
  const [selected, setSelected] = useState(firstReady?.id ?? packages[0]?.id);
  const [timedMode, setTimedMode] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const wide = useWide();

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
  const segs = (v: (typeof view)[number]) => (
    <span className="pk-segs" aria-hidden="true">
      {Array.from({ length: marks }, (_, k) => (
        <i key={k} style={{ "--f": `${ring(v, k) * 100}%` } as React.CSSProperties} />
      ))}
    </span>
  );
  const hrefOf = (id: number, timed: boolean) =>
    pkg.sections ? `${hrefBase}/${id}?autostart=1${timed ? "&timed=1" : ""}` : `${hrefBase}/${id}`;
  const href = hrefOf(pkg.id, timedMode);
  // Kartu "Lanjutkan": paket yang sedang berjalan, kalau tidak ada paket siap pertama yang belum selesai.
  const next = view.find((v) => v.ready && v.p > 0 && v.p < 1) ?? view.find((v) => v.ready && v.p < 1);

  const detail = (
    <>
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
            <svg viewBox="0 0 100 115.47" className={`hc-meter-hex${p <= 0 ? " is-empty" : ""}`} aria-hidden="true">
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
                {/* Saat 0% tetap ada "benih" madu tipis yang beriak di dasar sel, ajakan mulai mengisi. */}
                <g className="hc-honey-y" style={{ transform: `translateY(${fillY(0, 115.47, Math.max(p, 0.18))}px)` }}>
                  <g className="hc-honey-x is-live">
                    <path d={WAVE} fill="url(#pc-honey)" className="hc-honey" />
                  </g>
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

          {pkg.parts && pkg.parts.length > 0 && (
            <>
              {/* Bar komposisi: lebar segmen sebanding jumlah butir, terisi madu
                  sesuai capaian terjauh (urutan pengerjaan = urutan segmen). */}
              <div className="hc-cols hc-parts" aria-label={`Komposisi ${pkg.label}`}>
                {pkg.parts.reduce<{ el: React.ReactNode[]; end: number }>(
                  (acc, part, k) => {
                    const end = acc.end + part.count;
                    acc.el.push(
                      <i key={k} title={`${part.label} · ${part.count} ${unitLabel}`} style={{ flexGrow: part.count }} className={done >= end ? "is-on" : ""}>
                        <b>{part.short}</b>
                      </i>
                    );
                    return { el: acc.el, end };
                  },
                  { el: [], end: 0 }
                ).el}
              </div>
              <details className="hc-details is-parts" open>
                <summary>Lihat isi paket</summary>
                <ul>
                  {pkg.parts.map((part, k) => (
                    <li key={k}>
                      <span>
                        {part.label} <small className="tnum">{part.count} {unitLabel}</small>
                      </span>
                      <small>{part.part}</small>
                    </li>
                  ))}
                </ul>
              </details>
            </>
          )}

          {pkg.sections && (
            <>
              <div className="hc-cols" aria-label={`${Math.floor(done / (perColumn || 1))} dari ${pkg.sections.length} kolom tercapai`}>
                {pkg.sections.map((s, k) => (
                  <i key={s.index} className={perColumn && done >= perColumn * (k + 1) ? "is-on" : ""}>
                    <b>{s.index}</b>
                  </i>
                ))}
              </div>
              <details className="hc-details" open>
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
                            <span key={k}><KecermatanSymbol symbol={symbol} /></span>
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

          {(attempts[current.key]?.length ?? 0) > 0 && (
            <div className="mt-5 space-y-2">
              <p className="text-sm font-semibold text-foreground">Pembahasan tersimpan</p>
              {attempts[current.key].map((a, k) => (
                <Link key={a.id} href={`/latihan/pembahasan/${a.id}`} className={buttonStyles({ variant: "secondary", block: true })}>
                  {k === 0 ? "Terbaru" : "Sebelumnya"} ·{" "}
                  {new Date(a.at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                </Link>
              ))}
              <p className="text-xs text-muted-foreground">
                Maksimal {MAX_LATIHAN_ATTEMPTS} pembahasan tersimpan per paket. Menyimpan percobaan berikutnya menghapus yang paling lama, setelah kamu setujui.
              </p>
            </div>
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
    </>
  );

  return (
    <section aria-labelledby="package-carousel-title">
      <div className="mb-4">
        <span className="section-kicker">Katalog latihan</span>
        <h2 id="package-carousel-title" className="mt-1 font-heading text-2xl text-foreground">
          Pilih paket
        </h2>
      </div>

      {next && (
        <div className="pk-hero">
          <div className="min-w-0">
            <span className="pk-hero-kicker">{next.p > 0 ? "Lanjutkan" : "Mulai dari sini"}</span>
            <b className="pk-hero-title">{next.pkg.label}</b>
            {segs(next)}
            <span className="pk-hero-sub tnum">
              {next.p > 0 ? `${next.done} dari ${next.pkg.questionCount} ${unitLabel} · ${Math.round(next.p * 100)}%` : `${next.pkg.questionCount} ${unitLabel}`}
            </span>
          </div>
          <Link href={hrefOf(next.pkg.id, false)} className="pk-hero-cta">
            {next.p > 0 ? "Lanjut latihan" : "Mulai latihan"}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      )}

      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id="sp-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#b8892b" />
            <stop offset=".5" stopColor="#f3dd8e" />
            <stop offset="1" stopColor="#c9a24a" />
          </linearGradient>
        </defs>
      </svg>
      <div className="hc-stage">
        <ol className="sp-list" aria-label="Semua paket">
          {view.map((v, i) => {
            const sel = wide && v.pkg.id === pkg.id;
            const featured = v === next;
            const state = !v.ready
              ? "is-locked"
              : `is-ready${featured ? " is-featured" : ""}${v.p >= 1 ? " is-done" : ""}${sel ? " is-sel" : ""}`;
            return (
              <li key={v.pkg.id} className={`sp-step ${state}`} style={{ animationDelay: `${i * 50}ms` }}>
                <span className="sp-node" aria-hidden="true">
                  <svg viewBox="-4 -4 108 124">
                    <polygon points={HEX} />
                  </svg>
                  <b className="tnum">{String(i + 1).padStart(2, "0")}</b>
                  {v.p >= 1 && (
                    <span className="sp-tick">
                      <Check className="size-3" />
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  className="sp-card"
                  disabled={!v.ready}
                  aria-pressed={wide ? sel : undefined}
                  aria-haspopup={wide ? undefined : "dialog"}
                  aria-label={`${v.pkg.label}, ${status(v)}${v.ready ? `, ${v.done} dari ${v.pkg.questionCount} ${unitLabel}` : ""}`}
                  onClick={() => {
                    setSelected(v.pkg.id);
                    if (!wide) setSheetOpen(true);
                  }}
                >
                  {featured && <span className="sp-shine" aria-hidden="true" />}
                  {(featured || v.p >= 1) && (
                    <span className="sp-badges">
                      {featured && (
                        <span className="sp-badge">
                          <i aria-hidden="true" />
                          {v.p > 0 ? "Lanjutkan di sini" : "Mulai dari sini"}
                        </span>
                      )}
                      {v.p >= 1 && (
                        <span className="sp-badge is-ok">
                          <Check />
                          Selesai
                        </span>
                      )}
                    </span>
                  )}
                  <span>
                    <span className="sp-title">{v.pkg.label}</span>
                    <span className="sp-meta tnum">
                      {!v.ready ? (
                        <span>Soal sedang disiapkan</span>
                      ) : v.done > 0 ? (
                        <span>Terjauh {v.done} dari {v.pkg.questionCount} {unitLabel}</span>
                      ) : (
                        <>
                          <span>Belum mulai</span>
                          <span>{v.pkg.questionCount} {unitLabel}</span>
                        </>
                      )}
                    </span>
                  </span>
                  {!v.ready ? (
                    <span className="sp-soon">Segera</span>
                  ) : (
                    <>
                      <span className="sp-side">
                        {v.p > 0 ? (
                          <span className="sp-score tnum">
                            <small>Capaian</small>
                            <strong>{Math.round(v.p * 100)}%</strong>
                          </span>
                        ) : (
                          <ChevronRight className="sp-chev size-5" />
                        )}
                      </span>
                      <span className="sp-mix">{segs(v)}</span>
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ol>

        {/* Desktop: panel samping. Di bawah 960px disembunyikan CSS (juga saat render
            server, sebelum useWide tahu lebar layar) dan rinciannya pindah ke lembar. */}
        {wide && (
          <aside className="hc-panel pk-side" aria-live="polite" key={pkg.id}>
            {detail}
          </aside>
        )}
      </div>

      {!wide && (
        <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} label={`Rincian ${pkg.label}`}>
          <div className="hc-panel pk-sheet-body" key={pkg.id}>
            <button type="button" className="pk-sheet-close" aria-label="Tutup rincian" onClick={() => setSheetOpen(false)}>
              <Close className="size-5" />
            </button>
            {detail}
          </div>
        </Sheet>
      )}

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          void resetProgress("latihan", [current.key]);
          setConfirmReset(false);
        }}
        title="Hapus progres paket ini?"
        confirmLabel="Hapus progres"
        tone="danger"
      >
        <p className="text-muted-foreground">Capaian {pkg.label} di akunmu dihapus. Paket lain tidak terpengaruh.</p>
      </ConfirmDialog>
    </section>
  );
}
