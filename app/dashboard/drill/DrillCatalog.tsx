"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Button, ConfirmDialog } from "@/app/components/ui-client";
import { ArrowRight } from "@/app/components/icons";
import { SectorCards, type Sector } from "@/app/components/SectorCards";
import { fillY, hexPoints, wavePath } from "@/lib/honey";
import { DRILL_ASPEK, DRILL_TIERS, type DrillCard } from "@/lib/drill-cards";
import { TierStack } from "@/app/components/ProgressTicket";
import { NewBadge } from "@/app/components/NewBadge";
import { resetProgress, useDrillProgress, useDrillProgressReady } from "@/lib/practice-progress";
import DrillProgressTicket, { aspekTiers, stats } from "./DrillProgress";
import { DrillWheel, type WheelCard } from "./DrillWheel";
import { DrillCluster } from "./DrillCluster";

type CatalogCard = DrillCard & { kartu: string; tiers: string[][]; kategori: { label: string; ids: string[] }[]; baru: string[] };

const WAVE = wavePath(50, 4.5, -100, 200, 140);
const HEX = "50,0 100,28.87 100,86.6 50,115.47 0,86.6 0,28.87";

/** Tampilan katalog pilihan peserta (Roda/Kluster), diingat per perangkat. */
const VIEW_KEY = "psiko_drill_view";
type View = "roda" | "kluster";
// localStorage sebagai external store; server (dan storage diblokir) = Roda.
function subscribeView(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(VIEW_KEY, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(VIEW_KEY, onChange);
  };
}
function readView(): View {
  try {
    return localStorage.getItem(VIEW_KEY) === "kluster" ? "kluster" : "roda";
  } catch {
    return "roda";
  }
}
const VIEWS: { key: View; label: string; icon: React.ReactNode }[] = [
  {
    key: "kluster",
    label: "Kluster",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 3.5l3.5 2v4L7 11.5l-3.5-2v-4z" />
        <path d="M14 3.5l3.5 2v4L14 11.5l-3.5-2" />
        <path d="M10.5 9.5l3.5 2v4l-3.5 2-3.5-2v-4" />
      </svg>
    ),
  },
  {
    key: "roda",
    label: "Roda",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 4v5M12 15v5M4 12h5M15 12h5" />
      </svg>
    ),
  },
];

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
  const progress = useDrillProgress();
  const ready = useDrillProgressReady();
  // Butir baru yang belum pernah dijawab peserta. Sebelum progres termuat semua butir tampak belum dikerjakan, jadi tunggu.
  const freshOf = (ids: string[]) => (ready ? ids.filter((id) => !progress[id]) : []);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [findOpen, setFindOpen] = useState(false);
  const [selected, setSelected] = useState(cards[0]?.kartu ?? "");
  const [resetStep, setResetStep] = useState(0);
  const panelRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const findBtnRef = useRef<HTMLButtonElement>(null);

  // "/" = buka kotak cari dan fokus ke kolomnya.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || /INPUT|TEXTAREA/.test((e.target as HTMLElement).tagName)) return;
      e.preventDefault();
      setFindOpen(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    if (findOpen) searchRef.current?.focus();
  }, [findOpen]);
  const view = useSyncExternalStore(subscribeView, readView, () => "roda" as View);
  const pickView = (v: View) => {
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      // localStorage diblokir: tampilan tetap Roda.
    }
    window.dispatchEvent(new Event(VIEW_KEY));
  };

  const aspekLabel = (key: string) => DRILL_ASPEK.find((a) => a.key === key)?.label ?? key;
  const modul = (key: string) => DRILL_ASPEK.find((a) => a.key === key)?.modul ?? "Kecerdasan";
  // Cari: setiap kata harus ada di judul, deskripsi, aspek, atau kategori soal kartu; saat mencari, filter aspek diabaikan.
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const q = words.join(" ");
  const hit = (text: string) => words.length > 0 && words.every((w) => text.toLowerCase().includes(w));
  const matches = (c: CatalogCard) =>
    q ? hit([c.label, c.desc, aspekLabel(c.aspek), ...c.kategori.map((k) => k.label)].join(" ")) : filter === "all" || c.aspek === filter;

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
      fresh: freshOf(c.baru).length,
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
  const fresh = freshOf(card.baru);
  const baruSet = new Set(card.baru);

  const sectors: Sector[] = [{ key: "all", label: "Semua" }, ...DRILL_ASPEK].map((a) => {
    const own = wheel.filter((w) => a.key === "all" || w.aspek === a.key);
    const own_ = cards.filter((c) => a.key === "all" || c.aspek === a.key);
    const s = stats(own_.flatMap((c) => c.tiers.flat()), progress);
    const t = aspekTiers(own_, progress);
    return {
      key: a.key,
      label: a.label,
      p: s.total ? s.done / s.total : 0,
      meta: `${own.length} jenis · ${s.total} soal`,
      mini: <MiniHexes fills={own.map((w) => (w.locked ? null : w.p))} />,
      bar: <TierStack total={t.total} done={t.done} label={`${a.label}: ${s.done} dari ${s.total} soal dikerjakan`} />,
      badge: a.key === "all" ? undefined : modul(a.key),
    };
  });

  const start = (kartu: string) => router.push(`/latihan/drill/${kartu}`);
  const onSelect = (kartu: string, again?: boolean) => {
    setSelected(kartu);
    // Ketuk kartu yang sudah terpilih = lanjut ke aksi utama di panel.
    if (again) panelRef.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
  };

  const resetCard = () => {
    void resetProgress("drill", card.tiers.flat());
    setResetStep(0);
  };

  return (
    <>
      <DrillProgressTicket cards={cards} progress={progress} onStart={start} />
      <div className="hc-dock">
        <SectorCards sectors={sectors} active={filter} onPick={(k) => setFilter(k === filter ? "all" : k)} label="Pilih aspek" />
        <div
          className="hc-find"
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFindOpen(false);
          }}
        >
          <button
            ref={findBtnRef}
            type="button"
            className="hc-find-btn"
            aria-label="Cari jenis soal"
            aria-expanded={findOpen}
            aria-controls="hc-find-pop"
            aria-keyshortcuts="/"
            title="Cari jenis soal ( / )"
            data-active={q ? "true" : undefined}
            onClick={() => setFindOpen((o) => !o)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" />
              <path d="M20 20l-4.2-4.2" />
            </svg>
          </button>
          {findOpen && (
            <div id="hc-find-pop" className="hc-find-pop" role="search">
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Escape") return;
                  setFindOpen(false);
                  findBtnRef.current?.focus();
                }}
                placeholder="Cari jenis soal…"
                aria-label="Cari jenis soal"
                autoComplete="off"
              />
              {query && (
                <button type="button" className="hc-find-clear" aria-label="Hapus pencarian" onClick={() => { setQuery(""); searchRef.current?.focus(); }}>
                  ×
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="hc-stage">
        <div className="hc-field">
          <div className="hc-views" role="group" aria-label="Tampilan kartu">
            {VIEWS.map((v) => (
              <button key={v.key} type="button" aria-pressed={view === v.key} aria-label={v.label} title={v.label} onClick={() => pickView(v.key)}>
                {v.icon}
                <span>{v.label}</span>
              </button>
            ))}
          </div>
          {visible.length ? (
            view === "kluster" ? (
              <DrillCluster cards={wheel} selected={current} panel={panelRef} onSelect={onSelect} />
            ) : (
              <DrillWheel
                cards={wheel}
                selected={current}
                overall={{ p: allStats.total ? allStats.done / allStats.total : 0, done: allStats.done, total: allStats.total }}
                onSelect={onSelect}
              />
            )
          ) : (
            <div className="hc-empty">
              <p>
                Tidak ada jenis soal yang cocok dengan <strong>“{query}”</strong>.
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
            {fresh.length > 0 && <NewBadge />}
            <span className="hc-mod" data-mod={modul(card.aspek).toLowerCase()}>
              Drilling {modul(card.aspek)}
            </span>
            <span className="hc-tag">{aspekLabel(card.aspek)}</span>
            <span className="hc-code tnum">
              Kartu {String(cards.indexOf(card) + 1).padStart(2, "0")}
              {locked ? "" : ` · ${cardStats.total} soal`}
            </span>
          </div>
          <h2 className="hc-panel-title">{card.label}</h2>
          <p className="hc-panel-desc">{card.desc}</p>
          {fresh.length > 0 && (
            <p className="hc-fresh">
              <b className="tnum">{fresh.length}</b> soal baru belum kamu kerjakan. Tanda NEW hilang begitu soalnya kamu jawab.
            </p>
          )}

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

              <ul className="hc-levels hc-cats" aria-label="Kategori soal di kartu ini">
                {card.kategori.map(({ label, ids }) => {
                  const s = stats(ids, progress);
                  const nf = freshOf(ids.filter((id) => baruSet.has(id))).length;
                  return (
                    <li key={label} className="hc-level" data-hit={hit(label) ? "true" : undefined}>
                      <b>{label}</b>
                      {nf > 0 && <NewBadge small count={nf} />}
                      <span className="tnum">
                        {s.done}/{s.total}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <ul className="hc-levels" aria-label="Level soal di kartu ini">
                {DRILL_TIERS.map(({ tier, label }) => {
                  const ids = card.tiers[tier - 1];
                  if (!ids.length) return null;
                  const s = stats(ids, progress);
                  return (
                    <li key={tier} className="hc-level" data-tier={tier}>
                      <b>{label}</b>
                      <span className="tnum">
                        {s.done}/{s.total}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <div className="hc-actions">
                <Button variant="primary" size="lg" block onClick={() => start(card.kartu)}>
                  {cardStats.done ? "Lanjutkan drilling" : "Mulai drilling"}
                  <ArrowRight className="size-4" />
                </Button>
                <Button variant="ghost" onClick={() => setResetStep(1)} disabled={!cardStats.done}>
                  Ulang kartu ini dari nol
                </Button>
              </div>
            </>
          )}
          <i className="gr" aria-hidden="true" />
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
        <p className="text-muted-foreground">Semua hasil {card.label} di akunmu akan dihapus. Kartu lain tidak terpengaruh.</p>
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
