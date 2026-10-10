"use client";

import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import Link from "next/link";
import { ArrowRight } from "@/app/components/icons";
import { buttonStyles } from "@/app/components/ui";
import { Button, ConfirmDialog } from "@/app/components/ui-client";
import { PackageOrbit, type OrbitItem } from "@/app/components/PackageOrbit";
import { KecermatanSymbol } from "@/app/components/KecermatanKeyStrip";
import { fillY, wavePath } from "@/lib/honey";
import { clearLatihanProgress, useLatihanProgress } from "@/lib/latihan-progress";

/*
  Pemilih paket latihan berupa orbit dial (PackageOrbit) yang berputar seperti roda
  drilling: satu dial per paket, satu juring per kolom (10 untuk Kecermatan, 4 bagian
  untuk modul lain), madu = capaian terjauh (butir terbanyak yang pernah dijawab dalam
  satu sesi, dari lib/latihan-progress.ts). Panel di samping berisi rincian paket + tombol mulai; untuk Kecermatan juga
  rincian kolom dan pilihan timer per kolom. Nama komponen dipertahankan supaya
  pemanggilnya tidak berubah. CSS di app/honey.css.
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

/*
  Jalur ke panel: dari tepi dial terpilih (yang selalu berhenti di penanda fokus)
  ke tepi panel — siku horizontal di desktop, vertikal di HP saat panel turun ke bawah.
  Diukur dari DOM supaya ikut tata letak apa pun.
*/
type PanelLink = { w: number; h: number; d: string; at: [number, number] };

function measurePanelLink(stage: HTMLElement): PanelLink | null {
  const svg = stage.querySelector<SVGSVGElement>(".hc-wheel[data-reach]");
  const aside = stage.querySelector(".hc-panel");
  if (!svg || !aside) return null;
  const n = (v: number) => Math.round(v * 10) / 10;
  const clamp = (v: number, a: number, b: number) => n(Math.min(Math.max(v, a), b));
  const o = stage.getBoundingClientRect(), s = svg.getBoundingClientRect(), r = aside.getBoundingClientRect();
  const p = { l: r.left - o.left, t: r.top - o.top, r: r.right - o.left, b: r.bottom - o.top };
  const cx = n(s.left + s.width / 2 - o.left), cy = n(s.top + s.height / 2 - o.top), reach = Number(svg.dataset.reach);
  if (p.l > cx + reach) {
    const x0 = n(cx + reach), y = clamp(cy, p.t + 32, p.b - 32), mid = n(x0 + (p.l - x0) / 2);
    return { w: n(o.width), h: n(o.height), d: `M${x0} ${cy}H${mid}V${y}H${n(p.l)}`, at: [n(p.l), y] };
  }
  const y0 = n(cy + reach), x = clamp(cx, p.l + 32, p.r - 32), mid = n(y0 + (p.t - y0) / 2);
  return { w: n(o.width), h: n(o.height), d: `M${cx} ${y0}V${mid}H${x}V${n(p.t)}`, at: [x, n(p.t)] };
}

function usePanelLink(root: RefObject<HTMLDivElement | null>) {
  const [link, setLink] = useState<PanelLink | null>(null);
  const last = useRef("");
  // Ukur tiap render (setState hanya kalau berubah) dan saat ukuran panggung berubah.
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const sync = () => {
      const next = measurePanelLink(el);
      const key = JSON.stringify(next);
      if (key === last.current) return;
      last.current = key;
      setLink(next);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  });
  return link;
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
  const panelRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const link = usePanelLink(stageRef);

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
  const orbit: OrbitItem[] = view.map((v, i) => ({
    id: String(v.pkg.id),
    no: String(i + 1).padStart(2, "0"),
    label: v.pkg.label,
    status: status(v),
    segs: Array.from({ length: marks }, (_, k) => ring(v, k)),
    locked: !v.ready,
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

      <div ref={stageRef} className="hc-stage hc-linked">
        <div className="hc-field">
          <PackageOrbit
            items={orbit}
            selected={String(current.pkg.id)}
            overall={{ p: totalAll ? doneAll / totalAll : 0, done: doneAll, total: totalAll }}
            unit={unitLabel}
            hud={
              <>
                Orbit <b>{moduleLabel}</b>&nbsp; {packages.length} paket
              </>
            }
            legend={marks === 10 ? "Satu juring per kolom, searah jarum jam dari atas." : "Satu juring per seperempat paket, searah jarum jam dari atas."}
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

        {link && (
          // key = paket terpilih: jalur muncul ulang tiap ganti paket.
          <svg className="hc-links" width={link.w} height={link.h} aria-hidden="true">
            <defs>
              <filter id="pc-blur" filterUnits="userSpaceOnUse" x="0" y="0" width={link.w} height={link.h}>
                <feGaussianBlur stdDeviation="3" />
              </filter>
            </defs>
            <g key={pkg.id} className="hc-link is-on is-panel">
              <path className="hc-link-halo" d={link.d} filter="url(#pc-blur)" />
              <path className="hc-link-trace" d={link.d} />
              <path className="hc-link-pulse is-glow" d={link.d} pathLength={100} filter="url(#pc-blur)" />
              <path className="hc-link-pulse" d={link.d} pathLength={100} />
              <rect className="hc-link-node" x={link.at[0] - 3.5} y={link.at[1] - 3.5} width={7} height={7} transform={`rotate(45 ${link.at[0]} ${link.at[1]})`} />
            </g>
          </svg>
        )}
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
