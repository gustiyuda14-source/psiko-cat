"use client";

import { useEffect, useRef, useState } from "react";

/*
  Katalog "tiket level" dari dajiks-cest (assets/cest-catalog.js), versi React
  generik: konsol cari + filter (opsional), track scroll-snap dengan kartu
  tengah fokus, rel penghitung + titik. Ketuk kartu samping = geser ke tengah,
  ketuk kartu tengah = onPick. Dipakai PackageCarousel (paket latihan) dan
  halaman Simulasi / Latihan. CSS di app/catalog.css.
*/

export type TicketItem = {
  id: string | number;
  tag: string;
  tone: "green" | "cyan" | "amber";
  badges?: string[];
  title: string;
  meta: string;
  /** Pratinjau simbol (Kecermatan) — mengisi slot meter A1–C1 milik cest. */
  symbols?: string[];
  symbolsLabel?: string;
  foot: string;
  /** Sobekan: label vertikal + nomor besar. */
  stub: [string, string];
  /** Cincin progres di sobekan; tanpa ring dan tanpa `locked` sobekan hanya berisi label + nomor. */
  ring?: { p: number; text: string };
  /** Gembok di sobekan; kartu tidak bisa dipilih. */
  locked?: boolean;
  /** Grup filter (key chip). */
  group?: string[];
  /** Teks yang dicari kolom cari. */
  search?: string;
};

export type TicketFilter = { key: string; label: string };

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

function SearchIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.2-4.2" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg {...iconProps} className="cat-lockic">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg {...iconProps} className="cat-go">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

function ArrowIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg {...iconProps}>
      <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

function Track({
  items,
  label,
  onPick,
}: {
  items: TicketItem[];
  label: string;
  onPick: (item: TicketItem) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const [center, setCenter] = useState(0);

  function offsetFor(i: number) {
    const track = trackRef.current;
    const card = track?.children[i] as HTMLElement | undefined;
    return track && card ? card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2 : null;
  }

  function go(i: number, behavior: ScrollBehavior = "smooth") {
    const left = offsetFor(i);
    if (left == null) return;
    trackRef.current?.scrollTo({ left, behavior });
    setCenter(i);
  }

  // Track di-mount ulang (key) tiap filter/cari berubah, jadi cukup posisikan sekali.
  useEffect(() => {
    const left = offsetFor(0);
    if (left != null) trackRef.current?.scrollTo({ left, behavior: "instant" });
  }, []);

  function onScroll() {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const track = trackRef.current;
      if (!track) return;
      const mid = track.scrollLeft + track.clientWidth / 2;
      let best = 0;
      let dist = Infinity;
      Array.from(track.children).forEach((c, j) => {
        const el = c as HTMLElement;
        const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid);
        if (d < dist) {
          dist = d;
          best = j;
        }
      });
      setCenter(best);
    });
  }

  return (
    <>
      <div
        ref={trackRef}
        className="cat-track"
        role="group"
        aria-label={label}
        tabIndex={0}
        onScroll={onScroll}
        onKeyDown={(e) => {
          if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
          e.preventDefault();
          const next = Math.min(items.length - 1, Math.max(0, center + (e.key === "ArrowRight" ? 1 : -1)));
          go(next);
          (trackRef.current?.children[next] as HTMLElement | undefined)?.focus({ preventScroll: true });
        }}
      >
        {items.length === 0 && <p className="cat-empty">Tidak ada yang cocok dengan filter ini.</p>}
        {items.map((it, i) => {
          const isCenter = i === center;
          return (
            <button
              key={it.id}
              type="button"
              className={`cat-card ${isCenter ? "is-center" : ""}`}
              tabIndex={isCenter ? 0 : -1}
              aria-disabled={isCenter && it.locked ? true : undefined}
              onClick={() => {
                if (!isCenter) return go(i);
                if (!it.locked) onPick(it);
              }}
            >
              <span className="cat-body">
                <span className="cat-tags">
                  <span className={`cat-tag tone-${it.tone}`}>{it.tag}</span>
                  {it.badges?.map((b, k) => (
                    <span key={b} className={`cat-tag cat-badge${k ? " is-extra" : ""}`}>
                      {b}
                    </span>
                  ))}
                </span>
                <span className="cat-head">
                  <strong className="cat-title">{it.title}</strong>
                  <span className="cat-meta">{it.meta}</span>
                </span>
                {it.symbols && (
                  <span className="cat-symbols" aria-label={it.symbolsLabel}>
                    {it.symbols.map((symbol, k) => (
                      <span key={k}>{symbol}</span>
                    ))}
                  </span>
                )}
                <span className="cat-foot">
                  <span>{it.foot}</span>
                  <PlayIcon />
                </span>
              </span>
              <span className="cat-stub">
                <span className="cat-stub-v">{it.stub[0]}</span>
                <span className="cat-stub-no">{it.stub[1]}</span>
                {it.ring ? (
                  <span className="cat-ring" style={{ "--p": it.ring.p } as React.CSSProperties}>
                    <span>{it.ring.text}</span>
                  </span>
                ) : it.locked ? (
                  <LockIcon />
                ) : (
                  <span aria-hidden="true" />
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div className="cat-nav" style={{ visibility: items.length > 1 ? undefined : "hidden" }}>
        <button type="button" className="cat-arrow" aria-label="Sebelumnya" disabled={center <= 0} onClick={() => go(center - 1)}>
          <ArrowIcon dir="left" />
        </button>
        <div className="cat-rail">
          <span className="cat-count" aria-hidden="true">
            <b>{String(center + 1).padStart(2, "0")}</b> / {String(items.length).padStart(2, "0")}
          </span>
          <div className="cat-dots" role="tablist" aria-label={`Posisi ${label}`}>
            {items.map((it, i) => (
              <button
                key={it.id}
                type="button"
                role="tab"
                className="cat-dot"
                aria-selected={i === center}
                aria-label={it.title}
                onClick={() => go(i)}
              />
            ))}
          </div>
        </div>
        <button
          type="button"
          className="cat-arrow"
          aria-label="Berikutnya"
          disabled={center >= items.length - 1}
          onClick={() => go(center + 1)}
        >
          <ArrowIcon dir="right" />
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {items[center] ? `${items[center].title} dipilih.` : ""}
      </p>
    </>
  );
}

export function TicketCatalog({
  items,
  label,
  onPick,
  filters,
  search,
  placeholder = "Cari…",
  className = "",
}: {
  items: TicketItem[];
  /** Nama katalog untuk aria-label, mis. "paket kecerdasan". */
  label: string;
  onPick: (item: TicketItem) => void;
  /** Chip filter; item cocok bila `group` memuat key-nya. Chip pertama harus "semua" (key "all"). */
  filters?: TicketFilter[];
  /** Tampilkan kolom cari (tombol "/" memfokuskannya). */
  search?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!search) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || (e.target as HTMLElement).closest("input, textarea, select, [contenteditable]")) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [search]);

  const needle = query.trim().toLowerCase();
  const inGroup = (it: TicketItem, key: string) => key === "all" || (it.group ?? []).includes(key);
  const shown = items.filter(
    (it) => inGroup(it, filter) && (!needle || (it.search ?? it.title).toLowerCase().includes(needle))
  );

  return (
    <div className={`catalog ${className}`}>
      {(search || filters) && (
        <div className="cat-bar">
          {search && (
            <label className="cat-search">
              <SearchIcon />
              <span className="sr-only">Cari {label}</span>
              <input
                ref={searchRef}
                type="search"
                placeholder={placeholder}
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <kbd aria-hidden="true">/</kbd>
            </label>
          )}
          {filters && (
            <div className="cat-chips" role="group" aria-label={`Filter ${label}`}>
              {filters.map(({ key, label: text }) => {
                const n = items.filter((it) => inGroup(it, key)).length;
                return (
                  <button
                    key={key}
                    type="button"
                    className="chip"
                    aria-pressed={filter === key}
                    aria-label={`${text}: ${n}`}
                    onClick={() => setFilter(key)}
                  >
                    <span>{text}</span>
                    <b>{n}</b>
                    <i style={{ "--p": items.length ? Math.round((n / items.length) * 100) : 0 } as React.CSSProperties} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
      <Track key={`${filter}|${needle}`} items={shown} label={label} onPick={onPick} />
    </div>
  );
}
