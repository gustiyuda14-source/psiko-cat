"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import data from "@/data/kosakata.json";

/*
  Kosakata verbal, port dari dajiks-cest (assets/cest-vocab.js): cari + filter (sekaligus hitungan
  dan progres hafal), tandai hafal, mode hafalan = arti, sinonim, antonim diburamkan sampai diketuk.
  Data: data/kosakata.json. Tanda hafal per akun di localStorage perangkat ini.
*/

type Kata = { w: string; k: string; arti: string; sin: string[]; ant: string[]; ex: string; soal?: boolean };

const WORDS = (data.words as Kata[]).slice().sort((a, b) => a.w.localeCompare(b.w, "id"));
const KELAS: Record<string, string> = { n: "kata benda", v: "kata kerja", a: "kata sifat", adv: "kata keterangan", p: "partikel" };
const FILTERS: [string, string, (w: Kata, known: Set<string>) => boolean][] = [
  ["all", "Semua", () => true],
  ["a", "Kata sifat", (w) => w.k === "a"],
  ["n", "Kata benda", (w) => w.k === "n"],
  ["v", "Kata kerja", (w) => w.k === "v"],
  ["soal", "Ada di soal", (w) => Boolean(w.soal)],
  ["todo", "Belum hafal", (w, k) => !k.has(w.w)],
];

// ponytail: tanda hafal di localStorage per akun, tidak ikut pindah perangkat; pindah ke practice_progress bila perlu sinkron.
const storeKey = (userId: string) => `psiko_kosakata_hafal:${userId}`;

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange); // tab lain di perangkat yang sama
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readRaw(userId: string): string {
  try {
    return localStorage.getItem(storeKey(userId)) ?? "[]";
  } catch {
    return "[]"; // storage diblokir: tanda hafal tidak tersimpan
  }
}

function parse(raw: string): Set<string> {
  try {
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export default function KosakataList({ userId }: { userId: string }) {
  const raw = useSyncExternalStore(subscribe, () => readRaw(userId), () => "[]");
  const known = useMemo(() => parse(raw), [raw]);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [hide, setHide] = useState(false);
  const [shown, setShown] = useState<Set<string>>(() => new Set());

  function toggleKnown(w: string) {
    const next = parse(readRaw(userId)); // bukan `known`: dua klik cepat sebelum render ulang tidak saling menimpa
    if (!next.delete(w)) next.add(w);
    try {
      localStorage.setItem(storeKey(userId), JSON.stringify([...next]));
    } catch {
      // mode privat / storage diblokir
    }
    listeners.forEach((l) => l());
  }

  function reveal(w: string) {
    if (!hide) return;
    const next = new Set(shown);
    if (!next.delete(w)) next.add(w);
    setShown(next);
  }

  const needle = q.trim().toLowerCase();
  const active = FILTERS.find((f) => f[0] === filter)![2];
  const list = WORDS.filter(
    (w) => active(w, known) && (!needle || [w.w, w.arti, ...w.sin, ...w.ant].join(" ").toLowerCase().includes(needle)),
  );

  return (
    <div className="catalog">
      <div className="voc-sticky">
        <div className="cat-bar">
          <label className="cat-search">
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="6.5" />
              <path d="M20 20l-4.2-4.2" />
            </svg>
            <span className="sr-only">Cari kosakata</span>
            <input
              type="search"
              placeholder="Cari kata, arti, sinonim, atau antonim…"
              autoComplete="off"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
          <div className="cat-chips" role="group" aria-label="Filter kosakata">
            {FILTERS.map(([key, label, fn]) => {
              const set = WORDS.filter((w) => fn(w, known));
              const p = set.length ? Math.round((set.filter((w) => known.has(w.w)).length / set.length) * 100) : 0;
              return (
                <button key={key} type="button" className="chip" aria-pressed={key === filter} onClick={() => setFilter(key)}>
                  <span>{label}</span>
                  <b>{set.length}</b>
                  <i style={{ "--p": p } as React.CSSProperties} />
                </button>
              );
            })}
          </div>
        </div>
        <div className="voc-tools">
          <p className="muted">Garis di tiap filter = bagian yang sudah kamu tandai hafal.</p>
          <button
            type="button"
            className="voc-hide"
            aria-pressed={hide}
            onClick={() => {
              setHide(!hide);
              setShown(new Set());
            }}
          >
            Mode hafalan: sembunyikan arti
          </button>
        </div>
      </div>

      <div className={`voc-grid${hide ? " is-hide" : ""}`}>
        {list.length ? (
          list.map((w) => {
            const isKnown = known.has(w.w);
            return (
              <article key={w.w} className={`voc${isKnown ? " is-known" : ""}${shown.has(w.w) ? " is-shown" : ""}`}>
                <b className="voc-w">{w.w}</b>
                <span className="voc-pos">
                  {KELAS[w.k] ?? w.k}
                  {w.soal ? " · ada di soal" : ""}
                </span>
                <button type="button" className="voc-reveal" onClick={() => reveal(w.w)} tabIndex={hide ? 0 : -1}>
                  <span className="voc-id">{w.arti}</span>
                  {(w.sin.length > 0 || w.ant.length > 0) && (
                    <dl className="voc-forms">
                      {w.sin.length > 0 && (
                        <div>
                          <dt>SIN</dt>
                          <dd>{w.sin.join(", ")}</dd>
                        </div>
                      )}
                      {w.ant.length > 0 && (
                        <div>
                          <dt>ANT</dt>
                          <dd>{w.ant.join(", ")}</dd>
                        </div>
                      )}
                    </dl>
                  )}
                </button>
                <p className="voc-ex">{w.ex}</p>
                <button type="button" className="voc-known" aria-pressed={isKnown} onClick={() => toggleKnown(w.w)}>
                  {isKnown ? "✓ Sudah hafal" : "Tandai hafal"}
                </button>
              </article>
            );
          })
        ) : (
          <p className="cat-empty">Tidak ada kata yang cocok. Ubah filter atau kata kunci.</p>
        )}
      </div>
    </div>
  );
}
