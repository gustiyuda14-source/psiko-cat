"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Button, ConfirmDialog } from "@/app/components/ui-client";
import { ArrowRight } from "@/app/components/icons";
import { SectorCards, type Sector } from "@/app/components/SectorCards";
import { fillY, hexPoints, wavePath } from "@/lib/honey";
import {
  DRILL_ASPEK,
  DRILL_PROGRESS_KEY,
  DRILL_TIERS,
  readDrillProgress,
  writeDrillProgress,
  type DrillCard,
  type DrillProgress,
} from "@/lib/drill-cards";
import { DrillWheel, type WheelCard } from "./DrillWheel";

type CatalogCard = DrillCard & { kartu: string; tiers: string[][] };

const WAVE = wavePath(50, 4.5, -100, 200, 140);
const HEX = "50,0 100,28.87 100,86.6 50,115.47 0,86.6 0,28.87";

// localStorage sebagai external store: string mentah stabil antar render, server = "".
function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("drill-progress", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("drill-progress", onChange);
  };
}
function useProgress(): DrillProgress {
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(DRILL_PROGRESS_KEY) ?? "";
      } catch {
        return "";
      }
    },
    () => ""
  );
  return useMemo(() => (raw ? readDrillProgress() : {}), [raw]);
}

function stats(ids: string[], progress: DrillProgress) {
  const done = ids.filter((id) => progress[id]);
  const right = done.reduce((s, id) => s + progress[id][0], 0);
  const tries = done.reduce((s, id) => s + progress[id][1], 0);
  return { done: done.length, total: ids.length, acc: tries ? Math.round((right / tries) * 100) : null };
}

function MiniHexes({ fills }: { fills: (number | null)[] }) {
  const pts = fills.map((_, i) => [Math.floor(i / 2) * 17 + (i % 2) * 8.5 + 10, (i % 2) * 15 + 11]);
  const w = Math.max(...pts.map((p) => p[0])) + 10;
  return (
    <svg viewBox={`0 0 ${w} 37`} style={{ height: 34, width: (34 * w) / 37 }}>
      {fills.map((f, i) => (
        <polygon
          key={i}
          points={hexPoints(pts[i][0], pts[i][1], 9.5)}
          className={f === null ? "is-locked" : f > 0 ? "is-on" : ""}
          style={f ? { fillOpacity: 0.3 + 0.7 * f } : undefined}
        />
      ))}
    </svg>
  );
}

export default function DrillCatalog({ cards }: { cards: CatalogCard[] }) {
  const router = useRouter();
  const progress = useProgress();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(cards[0]?.kartu ?? "");
  const [resetStep, setResetStep] = useState(0);
  const panelRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // "/" = fokus ke kolom cari, seperti katalog lama.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || /INPUT|TEXTAREA/.test((e.target as HTMLElement).tagName)) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const aspekLabel = (key: string) => DRILL_ASPEK.find((a) => a.key === key)?.label ?? key;
  const q = query.trim().toLowerCase();
  const matches = (c: CatalogCard) =>
    (filter === "all" || c.aspek === filter) && (!q || `${c.label} ${c.desc}`.toLowerCase().includes(q));

  const wheel: WheelCard[] = cards.map((c, i) => {
    const t = c.tiers.map((ids) => stats(ids, progress));
    const all = stats(c.tiers.flat(), progress);
    return {
      kartu: c.kartu,
      no: String(i + 1).padStart(2, "0"),
      label: c.label,
      aspek: c.aspek,
      aspekLabel: aspekLabel(c.aspek),
      tiers: t.map((s) => (s.total ? s.done / s.total : 0)) as [number, number, number],
      p: all.total ? all.done / all.total : 0,
      locked: all.total === 0,
      match: matches(c),
    };
  });
  const allStats = stats(cards.flatMap((c) => c.tiers.flat()), progress);

  // Kartu terpilih ikut pindah kalau tersaring keluar oleh filter/cari.
  const visible = wheel.filter((w) => w.match);
  const current = visible.some((w) => w.kartu === selected) ? selected : visible[0]?.kartu ?? selected;
  const card = cards.find((c) => c.kartu === current)!;
  const cardStats = stats(card.tiers.flat(), progress);
  const locked = cardStats.total === 0;
  const p = locked ? 0 : cardStats.done / cardStats.total;

  const sectors: Sector[] = [{ key: "all", label: "Semua" }, ...DRILL_ASPEK].map((a) => {
    const own = wheel.filter((w) => a.key === "all" || w.aspek === a.key);
    const own_ = cards.filter((c) => a.key === "all" || c.aspek === a.key);
    const s = stats(own_.flatMap((c) => c.tiers.flat()), progress);
    return {
      key: a.key,
      label: a.label,
      p: s.total ? s.done / s.total : 0,
      meta: `${own.length} jenis · ${s.total} soal`,
      mini: <MiniHexes fills={own.map((w) => (w.locked ? null : w.p))} />,
    };
  });

  const start = (kartu: string, tier?: number) =>
    router.push(`/latihan/drill/${kartu}${tier ? `?tier=${tier}` : ""}`);

  const resetCard = () => {
    const next = { ...readDrillProgress() };
    for (const id of card.tiers.flat()) delete next[id];
    writeDrillProgress(next);
    window.dispatchEvent(new Event("drill-progress"));
    setResetStep(0);
  };

  return (
    <>
      <label className="hc-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" />
          <path d="M20 20l-4.2-4.2" />
        </svg>
        <span className="sr-only">Cari jenis soal</span>
        <input ref={searchRef} type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari jenis soal…" autoComplete="off" />
        <kbd aria-hidden="true">/</kbd>
      </label>

      <SectorCards sectors={sectors} active={filter} onPick={(k) => setFilter(k === filter ? "all" : k)} label="Pilih aspek" />

      <div className="hc-stage">
        <div className="hc-field">
          {visible.length ? (
            <DrillWheel
              cards={wheel}
              selected={current}
              overall={{ p: allStats.total ? allStats.done / allStats.total : 0, done: allStats.done, total: allStats.total }}
              onSelect={(kartu, again) => {
                setSelected(kartu);
                // Ketuk irisan yang sudah terpilih = lanjut ke aksi utama di panel.
                if (again) panelRef.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
              }}
            />
          ) : (
            <div className="hc-empty">
              <p>
                Tidak ada jenis soal yang cocok dengan <strong>“{query}”</strong>
                {filter !== "all" ? " di aspek ini" : ""}.
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                }}
              >
                Hapus pencarian dan filter
              </Button>
            </div>
          )}
        </div>

        <aside ref={panelRef} className="hc-panel" aria-live="polite" key={current}>
          <div className="hc-panel-top">
            <span className="hc-tag">{aspekLabel(card.aspek)}</span>
            <span className="hc-code tnum">
              Kartu {String(cards.indexOf(card) + 1).padStart(2, "0")}
              {locked ? "" : ` · ${cardStats.total} soal`}
            </span>
          </div>
          <h2 className="hc-panel-title">{card.label}</h2>
          <p className="hc-panel-desc">{card.desc}</p>

          {locked ? (
            <p className="hc-panel-desc mt-4">Soal untuk kartu ini sedang disiapkan. Kartu terbuka otomatis begitu soalnya tersedia.</p>
          ) : (
            <>
              <div className="hc-meter">
                <svg viewBox="0 0 100 115.47" className="hc-meter-hex" aria-hidden="true">
                  <defs>
                    <clipPath id="dp-hex">
                      <polygon points={HEX} />
                    </clipPath>
                    <linearGradient id="dp-honey" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="var(--honey-top)" />
                      <stop offset="1" stopColor="var(--honey-bot)" />
                    </linearGradient>
                  </defs>
                  <polygon points={HEX} className="hc-core-base" />
                  <g clipPath="url(#dp-hex)">
                    <g className="hc-honey-y" style={{ transform: `translateY(${fillY(0, 115.47, p)}px)` }}>
                      <path d={WAVE} fill="url(#dp-honey)" className="hc-honey" />
                    </g>
                  </g>
                  <polygon points={HEX} className="hc-core-line" />
                </svg>
                <span className="hc-meter-pct tnum">{Math.round(p * 100)}%</span>
                <span className="hc-meter-of tnum">
                  {cardStats.done} dari {cardStats.total} soal
                  <br />
                  {cardStats.acc !== null ? `Akurasi ${cardStats.acc}%` : "Belum ada jawaban"}
                </span>
              </div>

              <ul className="hc-tiers">
                {DRILL_TIERS.map(({ tier, label }) => {
                  const ids = card.tiers[tier - 1];
                  const s = stats(ids, progress);
                  return (
                    <li key={tier}>
                      <div className="min-w-0">
                        <b>{label}</b>
                        <span className="tnum">
                          {ids.length ? `${s.done}/${s.total} dikerjakan${s.acc !== null ? ` · akurasi ${s.acc}%` : ""}` : "Belum ada soal"}
                        </span>
                        {ids.length > 0 && (
                          <span className="hc-pips" aria-hidden="true">
                            {Array.from({ length: 10 }, (_, j) => (
                              <i key={j} className={j < Math.round((s.done / s.total) * 10) ? "is-on" : ""} />
                            ))}
                          </span>
                        )}
                      </div>
                      <Button variant="secondary" size="sm" disabled={!ids.length} onClick={() => start(card.kartu, tier)}>
                        {s.done ? "Lanjut" : "Mulai"}
                      </Button>
                    </li>
                  );
                })}
              </ul>

              <div className="hc-actions">
                <Button variant="primary" size="lg" block onClick={() => start(card.kartu)}>
                  Campuran semua tingkat
                  <ArrowRight className="size-4" />
                </Button>
                <Button variant="ghost" onClick={() => setResetStep(1)} disabled={!cardStats.done}>
                  Ulang kartu ini dari nol
                </Button>
              </div>
            </>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={resetStep === 1}
        onClose={() => setResetStep(0)}
        onConfirm={() => setResetStep(2)}
        title="Hapus progres kartu ini?"
        confirmLabel="Ya, lanjut"
        tone="danger"
      >
        <p className="text-muted-foreground">Semua hasil {card.label} di perangkat ini akan dihapus. Kartu lain tidak terpengaruh.</p>
      </ConfirmDialog>
      <ConfirmDialog
        open={resetStep === 2}
        onClose={() => setResetStep(0)}
        onConfirm={resetCard}
        title="Yakin hapus sekarang?"
        confirmLabel="Hapus progres"
        tone="danger"
      >
        <p className="text-muted-foreground">Tindakan ini tidak bisa dibatalkan.</p>
      </ConfirmDialog>
    </>
  );
}
