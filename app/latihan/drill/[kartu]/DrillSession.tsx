"use client";

import QuestionPassage from "@/app/components/QuestionPassage";
import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import type { SafeDrillItem } from "@/lib/drill-bank";
import { DRILL_SET_SIZE, DRILL_TIERS, readDrillProgress, writeDrillProgress } from "@/lib/drill-cards";
import { ExamBar, ExamBody, ExamDock } from "@/app/components/ExamChrome";
import { Badge, EmptyState } from "@/app/components/ui";
import { Button } from "@/app/components/ui-client";
import { ArrowRight, Check, Close } from "@/app/components/icons";
import { useExamKeyboard } from "@/lib/hooks/use-exam-keyboard";

type Result = { benar: boolean; kunci: string[]; pembahasan: string; ms: number };

const LETTERS = ["a", "b", "c", "d", "e"];
const tierLabel = (t: number) => DRILL_TIERS.find((x) => x.tier === t)?.label ?? "";

// Set berikutnya (pola dajiks-cest): soal yang belum pernah dikerjakan dulu, lalu yang pernah
// salah, lalu sisanya. Dipanggil dari klik tombol, jadi localStorage aman dibaca di sini.
function pickSet(items: SafeDrillItem[], tier: number | null): string[] {
  const progress = readDrillProgress();
  const pool = items.filter((it) => tier === null || it.tier === tier);
  const rank = (it: SafeDrillItem) => {
    const p = progress[it.id];
    if (!p) return 0;
    return p[0] < p[1] ? 1 : 2;
  };
  return [...pool]
    .sort((a, b) => rank(a) - rank(b) || a.tier - b.tier)
    .slice(0, DRILL_SET_SIZE)
    .map((it) => it.id);
}

export default function DrillSession({
  label,
  tier,
  items,
}: {
  label: string;
  tier: number | null;
  items: SafeDrillItem[];
}) {
  const byId = new Map(items.map((it) => [it.id, it]));
  const [setIds, setSetIds] = useState<string[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, Result>>({});
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shownAt = useRef(0);

  const q = setIds ? byId.get(setIds[idx]) : undefined;
  const picked = q ? picks[q.id] ?? "" : "";
  const result = q ? results[q.id] : undefined;
  const need = q?.multi ? 2 : 1;
  const finished = setIds !== null && setIds.every((id) => results[id]);
  const poolSize = items.filter((it) => tier === null || it.tier === tier).length;

  const goTo = useCallback((i: number) => {
    setIdx(i);
    setError(null);
    shownAt.current = performance.now();
  }, []);

  const startSet = () => {
    setSetIds(pickSet(items, tier));
    setPicks({});
    setResults({});
    goTo(0);
  };

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
    enabled: Boolean(q) && !finished,
    choiceKeys: LETTERS.map((k) => k.toUpperCase()),
    onChoose: choose,
    onPrev: () => setIds && goTo(Math.max(0, idx - 1)),
    onNext: () => setIds && goTo(Math.min(setIds.length - 1, idx + 1)),
  });

  const exit = (
    <Link href="/dashboard/drill" className="mbtn">
      <span aria-hidden="true">←</span>
      Keluar drilling
    </Link>
  );
  const subtitle = `${tier ? tierLabel(tier) : "Semua tingkat"} · ${DRILL_SET_SIZE} soal per set`;

  if (!setIds) {
    return (
      <div className="min-h-[100dvh] bg-background">
        <ExamBar title={`Drilling ${label}`} count={subtitle} actions={exit} />
        <div className="app-page">
          {poolSize === 0 ? (
            <EmptyState title="Belum ada soal" description="Tingkat ini belum punya soal. Pilih tingkat lain dari katalog drilling." />
          ) : (
            <div className="surface-card mx-auto max-w-2xl space-y-5 px-5 py-6 sm:px-7 sm:py-7">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Pilih jawaban lalu tekan <b>Periksa</b>. Kunci dan pembahasan langsung muncul, jadi kamu tahu letak salahnya
                saat itu juga. Soal yang belum pernah dikerjakan didahulukan, lalu soal yang pernah salah.
              </p>
              <dl className="inset-panel grid grid-cols-3 gap-4 px-5 py-4">
                <div>
                  <dt className="text-xs text-muted-foreground">Bank soal</dt>
                  <dd className="tnum font-heading text-lg text-foreground">{poolSize}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Per set</dt>
                  <dd className="tnum font-heading text-lg text-foreground">{Math.min(DRILL_SET_SIZE, poolSize)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Batas waktu</dt>
                  <dd className="font-heading text-lg text-foreground">Tidak ada</dd>
                </div>
              </dl>
              <Button variant="accent" size="lg" block onClick={startSet}>
                Mulai set
                <ArrowRight className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (finished) {
    const benar = setIds.filter((id) => results[id].benar).length;
    const times = setIds.map((id) => results[id].ms).sort((a, b) => a - b);
    const median = Math.round(times[Math.floor(times.length / 2)] / 1000);
    return (
      <div className="min-h-[100dvh] bg-background">
        <ExamBar title={`Drilling ${label}`} count={subtitle} actions={exit} />
        <section className="surface-card mx-auto my-6 w-[calc(100%-2rem)] max-w-xl space-y-5 px-6 py-8 text-center sm:px-8">
          <h2 className="font-heading text-2xl text-foreground">Set selesai</h2>
          <p className="tnum font-heading text-5xl text-foreground">
            {benar}/{setIds.length}
          </p>
          <p className="text-sm text-muted-foreground">
            Median waktu {median} detik per soal. Target ujian sekitar 54 detik per soal.
          </p>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <Link href="/dashboard/drill" className="mbtn justify-center">
              Kembali ke katalog
            </Link>
            <Button variant="accent" onClick={startSet}>
              Set berikutnya
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </section>
      </div>
    );
  }

  if (!q) return null;
  const done = Object.keys(results).length;

  return (
    <div className="min-h-[100dvh] bg-background">
      <ExamBar title={`Drilling ${label}`} count={`${subtitle} · ${done}/${setIds.length} diperiksa`} actions={exit} />
      <ExamBody
        navigator={
          <aside className="order-2 bg-card p-5 lg:sticky lg:top-[58px] lg:h-[calc(100dvh-58px)] lg:w-[300px] lg:shrink-0 lg:overflow-auto lg:border-l lg:border-border" aria-label="Navigasi soal">
            <h3 className="dnav-title">Soal di set ini</h3>
            <div className="dnav-grid">
              {setIds.map((id, i) => {
                const r = results[id];
                const state = r ? (r.benar ? "benar" : "salah") : picks[id] ? "dipilih" : "belum";
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={i === idx ? "step" : undefined}
                    aria-label={`Soal ${i + 1}, ${state}`}
                    className={`dnum ${r ? (r.benar ? "is-ok" : "is-bad") : picks[id] ? "is-done" : ""}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
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
            <p className="q-stem">{q.stem}</p>
            {/* MathML dari bank (divalidasi build: hanya <math>, tanpa script/handler). */}
            {q.rumus && <div className="drill-math overflow-x-auto" dangerouslySetInnerHTML={{ __html: q.rumus }} />}
            {q.gambar && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/${q.gambar}`} alt="" className="mx-auto h-auto max-h-[60vh] w-full max-w-[760px] rounded-md border border-border bg-white p-2" />
            )}
          </div>

          <div className="opts pt-1">
            {LETTERS.map((k) => {
              const sel = picked.includes(k);
              const isKey = result?.kunci.includes(k);
              const state = result ? (isKey ? "is-key" : sel ? "is-wrong" : "") : sel ? "sel" : "";
              return (
                <button key={k} type="button" onClick={() => choose(k)} aria-pressed={sel} disabled={Boolean(result)} className={`opt ${state}`}>
                  <span className={`mark ${q.multi ? "is-square" : ""}`}>{k.toUpperCase()}</span>
                  <span className="opt-text">{q.opsi[k]}</span>
                  {result && isKey && <Check className="ml-auto size-5 text-success" strokeWidth={3} />}
                  {result && sel && !isKey && <Close className="ml-auto size-5 text-destructive" strokeWidth={3} />}
                </button>
              );
            })}
          </div>

          {result ? (
            <div className={`rounded-md border p-4 text-sm leading-relaxed ${result.benar ? "border-success/40 bg-success-soft" : "border-destructive/40 bg-destructive-soft"}`} role="status">
              <p className="mb-2 font-heading text-base text-foreground">{result.benar ? "Benar" : `Belum tepat — kunci ${result.kunci.join(", ").toUpperCase()}`}</p>
              {result.pembahasan.split("<br>").map((p, i) => (
                <p key={i} className="mt-2 text-foreground">
                  {p}
                </p>
              ))}
              {idx < setIds.length - 1 && (
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
        onNext={() => goTo(Math.min(setIds.length - 1, idx + 1))}
        prevDisabled={idx === 0}
        nextDisabled={idx >= setIds.length - 1}
        prevLabel="Soal sebelumnya"
        nextLabel="Soal berikutnya"
      />
    </div>
  );
}
