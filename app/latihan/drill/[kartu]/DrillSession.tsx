"use client";

import QuestionPassage from "@/app/components/QuestionPassage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { SafeDrillItem } from "@/lib/drill-bank";
import { DRILL_TIERS, readDrillProgress, writeDrillProgress, type DrillProgress } from "@/lib/drill-cards";
import { useDrillProgress } from "@/lib/hooks/use-drill-progress";
import { ExamBar, ExamBody, ExamDock } from "@/app/components/ExamChrome";
import { Badge, EmptyState } from "@/app/components/ui";
import { Button } from "@/app/components/ui-client";
import { ArrowRight, Check, Close } from "@/app/components/icons";
import { useExamKeyboard } from "@/lib/hooks/use-exam-keyboard";

type Result = { benar: boolean; kunci: string[]; pembahasan: string; gambar_pembahasan?: string | null; ms: number };

const LETTERS = ["a", "b", "c", "d", "e"];
const tierLabel = (t: number) => DRILL_TIERS.find((x) => x.tier === t)?.label ?? "";

type NavState = "ok" | "bad" | "done" | "todo";
const NAV_LABEL: Record<NavState, string> = { ok: "Benar", bad: "Pernah salah", done: "Dipilih, belum diperiksa", todo: "Belum dikerjakan" };

// Soal pertama yang dibuka (pola dajiks-cest): yang belum pernah dikerjakan, lalu yang pernah salah, lalu soal 1.
function startIndex(items: SafeDrillItem[], progress: DrillProgress) {
  const fresh = items.findIndex((it) => !progress[it.id]);
  if (fresh >= 0) return fresh;
  const wrong = items.findIndex((it) => progress[it.id][0] < progress[it.id][1]);
  return Math.max(0, wrong);
}

export default function DrillSession({ label, items: raw }: { label: string; items: SafeDrillItem[] }) {
  // Semua soal kartu, urut Dasar → Menengah → Lanjut; nomor soal = posisi di daftar ini.
  const items = useMemo(() => [...raw].sort((a, b) => a.tier - b.tier), [raw]);
  const progress = useDrillProgress();
  // null = belum memilih soal sendiri; ikut startIndex sampai progres localStorage terbaca.
  const [chosen, setChosen] = useState<number | null>(null);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, Result>>({});
  // Setelah Periksa, gulir ke pembahasan (opsi panjang + dock bawah bisa menutupinya).
  const revealNext = useRef(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shownAt = useRef(0);

  const idx = chosen ?? startIndex(items, progress);
  const q = items[idx];
  const picked = q ? picks[q.id] ?? "" : "";
  const result = q ? results[q.id] : undefined;
  const need = q?.multi ? 2 : 1;

  useEffect(() => {
    shownAt.current = performance.now();
  }, []);

  const goTo = useCallback((i: number) => {
    setChosen(i);
    setError(null);
    shownAt.current = performance.now();
  }, []);

  const choose = useCallback(
    (key: string) => {
      if (!q || results[q.id]) return;
      const k = key.toLowerCase();
      setPicks((cur) => {
        const v = cur[q.id] ?? "";
        if (need === 1) return { ...cur, [q.id]: k };
        if (v.includes(k)) return { ...cur, [q.id]: v.replace(k, "") };
        if (v.length >= need) return cur;
        return { ...cur, [q.id]: (v + k).split("").sort().join("") };
      });
    },
    [need, q, results]
  );

  const check = async () => {
    if (!q || picked.length !== need || checking) return;
    // Kunci posisi: progres baru akan menggeser startIndex, soal ini harus tetap tampil dengan pembahasannya.
    setChosen(idx);
    setChecking(true);
    setError(null);
    const ms = Math.round(performance.now() - shownAt.current);
    try {
      const res = await fetch("/api/drill/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: q.id, pilihan: picked }),
      });
      if (!res.ok) throw new Error("Jawaban belum bisa diperiksa. Coba lagi.");
      const data = (await res.json()) as Omit<Result, "ms">;
      revealNext.current = true;
      setResults((cur) => ({ ...cur, [q.id]: { ...data, ms } }));
      const progress = readDrillProgress();
      const prev = progress[q.id] ?? [0, 0, 0];
      progress[q.id] = [prev[0] + (data.benar ? 1 : 0), prev[1] + 1, ms];
      writeDrillProgress(progress);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Jawaban belum bisa diperiksa. Coba lagi.");
    } finally {
      setChecking(false);
    }
  };

  useExamKeyboard({
    enabled: Boolean(q),
    choiceKeys: (q ? LETTERS.filter((k) => k in q.opsi) : LETTERS).map((k) => k.toUpperCase()),
    onChoose: choose,
    onPrev: () => goTo(Math.max(0, idx - 1)),
    onNext: () => goTo(Math.min(items.length - 1, idx + 1)),
  });

  const exit = (
    <Link href="/dashboard/drill" className="mbtn">
      <span aria-hidden="true">←</span>
      Keluar drilling
    </Link>
  );
  if (!q) {
    return (
      <div className="min-h-[100dvh] bg-background">
        <ExamBar title={`Drilling ${label}`} count="0 soal" actions={exit} />
        <div className="app-page">
          <EmptyState title="Belum ada soal" description="Soal untuk kartu ini sedang disiapkan. Pilih kartu lain dari katalog drilling." />
        </div>
      </div>
    );
  }

  // Warna nomor: hasil sesi ini dulu, lalu pilihan yang belum diperiksa, lalu riwayat di perangkat ini.
  const stateOf = (id: string): NavState => {
    const r = results[id];
    if (r) return r.benar ? "ok" : "bad";
    if (picks[id]) return "done";
    const p = progress[id];
    return p ? (p[0] === p[1] ? "ok" : "bad") : "todo";
  };
  const states = items.map((it) => stateOf(it.id));
  const count = { ok: 0, bad: 0, done: 0, todo: 0 };
  for (const st of states) count[st]++;
  const worked = items.length - count.todo - count.done;

  return (
    <div className="min-h-[100dvh] bg-background">
      <ExamBar title={`Drilling ${label}`} count={`Soal ${idx + 1} dari ${items.length} · ${tierLabel(q.tier)}`} actions={exit} />
      <ExamBody
        navigator={
          <aside className="order-2 bg-card p-5 lg:sticky lg:top-[58px] lg:h-[calc(100dvh-58px)] lg:w-[300px] lg:shrink-0 lg:overflow-auto lg:border-l lg:border-border" aria-label="Navigasi soal">
            <div className="dnav-head">
              <div>
                <p className="dnav-kicker">Drilling · {label}</p>
                <p className="dnav-count">
                  <b>{worked}</b>/{items.length} <span>soal dikerjakan</span>
                </p>
              </div>
            </div>
            <ul className="dnav-legend">
              {(Object.keys(count) as NavState[])
                .filter((k) => k !== "done" || count.done)
                .map((k) => (
                  <li key={k}>
                    <i className={`dnum is-${k}`} aria-hidden="true" />
                    {NAV_LABEL[k]} <b>{count[k]}</b>
                  </li>
                ))}
            </ul>
            {DRILL_TIERS.map(({ tier, label: lv }) => {
              const own = items.map((it, i) => [it, i] as const).filter(([it]) => it.tier === tier);
              if (!own.length) return null;
              return (
                <section key={tier}>
                  <h3 className="dnav-title">{lv}</h3>
                  <div className="dnav-grid">
                    {own.map(([it, i]) => (
                      <button
                        key={it.id}
                        type="button"
                        onClick={() => goTo(i)}
                        aria-current={i === idx ? "step" : undefined}
                        aria-label={`Soal ${i + 1}, ${lv}, ${NAV_LABEL[states[i]].toLowerCase()}`}
                        className={`dnum is-${states[i]}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </section>
              );
            })}
          </aside>
        }
      >
        <article key={q.id} data-active-question tabIndex={-1} className="enter-rise space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="qnum tnum">Soal {idx + 1}</p>
            <Badge tone="neutral">{tierLabel(q.tier)}</Badge>
          </div>
          <div className="q-card">
            {q.instruksi && <p className="q-ins">{q.instruksi}</p>}
            <QuestionPassage paragraphs={q.bacaan} table={q.tabel} />
            <p className="q-stem whitespace-pre-line">{q.stem}</p>
            {/* MathML dari bank (divalidasi build: hanya <math>, tanpa script/handler). */}
            {q.rumus && <div className="drill-math overflow-x-auto" dangerouslySetInnerHTML={{ __html: q.rumus }} />}
            {q.gambar && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/${q.gambar}`} alt="" className="q-figure" />
            )}
          </div>

          <div className={`pt-1 ${q.opsi_gambar ? "opts-fig" : "opts"}`}>
            {LETTERS.filter((k) => k in q.opsi).map((k) => {
              const sel = picked.includes(k);
              const isKey = result?.kunci.includes(k);
              const state = result ? (isKey ? "is-key" : sel ? "is-wrong" : "") : sel ? "sel" : "";
              return (
                <button key={k} type="button" onClick={() => choose(k)} aria-pressed={sel} disabled={Boolean(result)} className={`opt ${q.opsi_gambar ? "opt-fig" : ""} ${state}`}>
                  <span className={`mark ${q.multi ? "is-square" : ""}`}>{k.toUpperCase()}</span>
                  {q.opsi_gambar?.[k] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/${q.opsi_gambar[k]}`} alt={q.opsi[k]} className="opt-figure" />
                  ) : (
                    <span className="opt-text">{q.opsi[k]}</span>
                  )}
                  {result && isKey && <Check className="ml-auto size-5 text-success" strokeWidth={3} />}
                  {result && sel && !isKey && <Close className="ml-auto size-5 text-destructive" strokeWidth={3} />}
                </button>
              );
            })}
          </div>

          {result ? (
            <div
              ref={(el) => {
                if (!el || !revealNext.current) return;
                revealNext.current = false;
                const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
              }}
              className={`scroll-mb-28 rounded-md border p-4 text-sm leading-relaxed ${result.benar ? "border-success/40 bg-success-soft" : "border-destructive/40 bg-destructive-soft"}`} role="status">
              <p className="mb-2 font-heading text-base text-foreground">{result.benar ? "Benar" : `Belum tepat — kunci ${result.kunci.join(", ").toUpperCase()}`}</p>
              {result.gambar_pembahasan && (
                <figure className="my-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={result.gambar_pembahasan} alt="Gambar pembahasan: jawaban yang benar" className="q-figure" />
                  <figcaption className="mt-1 text-center text-xs text-muted-foreground">Gambar pembahasan</figcaption>
                </figure>
              )}
              {result.pembahasan.split("<br>").map((p, i) => (
                <p key={i} className="mt-2 text-foreground">
                  {p}
                </p>
              ))}
              {idx < items.length - 1 && (
                <Button variant="primary" className="mt-4" onClick={() => goTo(idx + 1)}>
                  Soal berikutnya
                  <ArrowRight className="size-4" />
                </Button>
              )}
            </div>
          ) : (
            <Button variant="accent" size="lg" onClick={() => void check()} disabled={picked.length !== need || checking}>
              {checking ? "Memeriksa…" : need === 2 ? "Periksa (pilih 2)" : "Periksa"}
            </Button>
          )}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </article>
      </ExamBody>
      <ExamDock
        onPrev={() => goTo(Math.max(0, idx - 1))}
        onNext={() => goTo(Math.min(items.length - 1, idx + 1))}
        prevDisabled={idx === 0}
        nextDisabled={idx >= items.length - 1}
        prevLabel="Soal sebelumnya"
        nextLabel="Soal berikutnya"
      />
    </div>
  );
}
