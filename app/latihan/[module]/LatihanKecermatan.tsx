"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { recordLatihanProgress } from "@/lib/latihan-progress";
import type { SafeQuestion, KecermatanOptionsPayload } from "@/lib/types/safe-question";
import { KecermatanDetailReview } from "@/app/components/PembahasanSection";
import type { KecermatanColumnGroup, KecermatanDetailItem } from "@/app/components/PembahasanSection";
import { KecermatanKeyStrip, KECERMATAN_KEYS } from "@/app/components/KecermatanKeyStrip";
import { buttonStyles, Meter } from "@/app/components/ui";
import { Button, ConfirmDialog } from "@/app/components/ui-client";
import { Repeat, Timer } from "@/app/components/icons";
import { useExamKeyboard } from "@/lib/hooks/use-exam-keyboard";
import { getMissingSymbolKey } from "@/lib/kecermatan-symbols";
import { COLUMN_DURATION_MS } from "@/lib/stores/kecermatan-store";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const INTRO_SECONDS = 5;
type Feedback = { selected: string; is_correct: boolean; correct_key: string };

function buildLocalGroups(
  sorted: SafeQuestion[],
  answers: Record<string, Feedback>
): KecermatanColumnGroup[] {
  const byColumn = new Map<number, { total: number; correct: number; wrong: KecermatanDetailItem[] }>();

  for (const q of sorted) {
    const fb = answers[q.id];
    if (!fb) continue; // belum dicoba — tidak dihitung sebagai salah, cuma dilewati dari ringkasan
    const col = q.column_index ?? 1;
    if (!byColumn.has(col)) byColumn.set(col, { total: 0, correct: 0, wrong: [] });
    const g = byColumn.get(col)!;
    g.total++;
    if (fb.is_correct) {
      g.correct++;
    } else {
      const payload = q.options_payload as unknown as KecermatanOptionsPayload;
      g.wrong.push({
        question_id: q.id,
        sequence_number: q.sequence_number,
        shown: payload.shown,
        selected_key: fb.selected,
        selected_symbol: payload.symbol_map[fb.selected as keyof typeof payload.symbol_map] ?? "?",
        correct_key: fb.correct_key,
        correct_symbol: payload.symbol_map[fb.correct_key as keyof typeof payload.symbol_map] ?? "?",
      });
    }
  }

  return Array.from(byColumn.entries())
    .map(([column_index, g]) => ({ column_index, ...g }))
    .sort((a, b) => a.column_index - b.column_index);
}

export default function LatihanKecermatan({
  questions,
  timedMode = false,
  progressKey,
}: {
  questions: SafeQuestion[];
  progressKey?: string;
  /** Ya di modal "Aktifkan timer per kolom?" — kunci navigasi sekuensial,
      60 detik/kolom, jeda 5 detik tiap ganti kolom. Default bebas navigasi. */
  timedMode?: boolean;
}) {
  const sorted = useMemo(
    () =>
      [...questions].sort(
        (a, b) => (a.column_index ?? 0) - (b.column_index ?? 0) || a.sequence_number - b.sequence_number
      ),
    [questions]
  );
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Feedback>>({});

  // Capaian terjauh paket ini (lib/latihan-progress.ts) untuk rak tabung di pemilih paket.
  useEffect(() => {
    if (progressKey) recordLatihanProgress(progressKey, Object.keys(answers).length);
  }, [progressKey, answers]);
  const answeredIds = useRef(new Set<string>());
  const [error, setError] = useState("");
  const [finished, setFinished] = useState(false);
  const [showFinish, setShowFinish] = useState(false);

  // Timer per kolom — cuma aktif kalau timedMode. Pola deadline-based sama
  // persis EngineKecermatan.tsx (wall-clock, tahan tab-throttling), tapi
  // murni lokal: tidak nyentuh module_sessions/kecermatan_logs sama sekali.
  const [remainingMs, setRemainingMs] = useState(COLUMN_DURATION_MS);
  const [showColIntro, setShowColIntro] = useState(false);
  const [introSeconds, setIntroSeconds] = useState(INTRO_SECONDS);
  const [showSkip, setShowSkip] = useState(false);
  const pendingIdxRef = useRef<number | null>(null);
  const nextColRef = useRef<number | null>(null);

  const q = sorted[idx];
  const payload = q?.options_payload as unknown as KecermatanOptionsPayload | undefined;
  const shown = Array.isArray(payload?.shown) ? payload.shown.filter((symbol) => typeof symbol === "string") : [];
  const symbolMap = payload?.symbol_map ?? { A: "?", B: "?", C: "?", D: "?", E: "?" };
  const fb = q ? answers[q.id] : undefined;
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter((a) => a.is_correct).length;
  const colIdx = (q?.column_index ?? 1) - 1;
  const rowInCol = q ? sorted.slice(0, idx).filter((s) => s.column_index === q.column_index).length : 0;

  // Pindah kolom: kalau kolom terakhir, langsung selesai (sama seperti alur
  // finish yang sudah ada — TIDAK memanggil endpoint real-exam manapun).
  // Kalau bukan, tampilkan jeda 5 detik dulu (niru showColIntro EngineKecermatan)
  // baru lompat ke butir pertama kolom berikutnya.
  const advanceColumn = useCallback(() => {
    const currentCol = q?.column_index ?? 1;
    if (currentCol >= 10) {
      setFinished(true);
      return;
    }
    const nextStart = sorted.findIndex((s) => s.column_index === currentCol + 1);
    if (nextStart < 0) {
      setFinished(true);
      return;
    }
    pendingIdxRef.current = nextStart;
    nextColRef.current = currentCol + 1;
    setShowColIntro(true);
    setIntroSeconds(INTRO_SECONDS);
  }, [q, sorted]);

  // Ref supaya interval timer selalu manggil versi terbaru advanceColumn
  // tanpa perlu masuk dependency array-nya (identitasnya berubah tiap render).
  const advanceColumnRef = useRef(advanceColumn);
  useEffect(() => {
    advanceColumnRef.current = advanceColumn;
  }, [advanceColumn]);

  function jumpToColumn(colNum: number) {
    if (finished || timedMode) return;
    const target = sorted.findIndex((s) => s.column_index === colNum);
    if (target >= 0) {
      setError("");
      setIdx(target);
    }
  }

  function resetPractice() {
    answeredIds.current.clear();
    pendingIdxRef.current = null;
    nextColRef.current = null;
    setError("");
    setIdx(0);
    setAnswers({});
    setFinished(false);
    setShowColIntro(false);
    setRemainingMs(COLUMN_DURATION_MS);
  }

  const pick = useCallback(
    (key: string) => {
      if (!q || finished || showFinish || showColIntro || answeredIds.current.has(q.id)) return;
      if (!KECERMATAN_KEYS.some((choice) => choice === key)) return;
      const correctKey = getMissingSymbolKey(q.options_payload as unknown as KecermatanOptionsPayload);
      if (!correctKey) {
        setError("Simbol soal ini tidak valid. Pilih butir berikutnya atau kolom lain, lalu laporkan ke admin.");
        return;
      }
      answeredIds.current.add(q.id);
      setAnswers((prev) => ({
        ...prev,
        [q.id]: { selected: key, is_correct: key === correctKey, correct_key: correctKey },
      }));
      setError("");
      if (idx >= sorted.length - 1) {
        setFinished(true);
        return;
      }
      const next = sorted[idx + 1];
      const crossesColumn = next.column_index !== q.column_index;
      if (timedMode && crossesColumn) advanceColumn();
      else setIdx(idx + 1);
    },
    [q, finished, showFinish, showColIntro, idx, sorted, timedMode, advanceColumn]
  );

  useExamKeyboard({
    enabled: Boolean(q) && !finished && !showFinish && !showColIntro,
    choiceKeys: KECERMATAN_KEYS as unknown as string[],
    onChoose: pick,
  });

  // Jeda antar-kolom, 1 detik x 5 — persis pola EngineKecermatan.tsx.
  useEffect(() => {
    if (!showColIntro) return;
    let remaining = INTRO_SECONDS;
    const interval = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(interval);
        setShowColIntro(false);
        if (pendingIdxRef.current !== null) {
          setIdx(pendingIdxRef.current);
          pendingIdxRef.current = null;
        }
      } else {
        setIntroSeconds(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [showColIntro]);

  // Timer 60 detik/kolom, deadline-based (wall-clock) — pola sama persis
  // EngineKecermatan.tsx:294-315, tanpa store/DB apapun.
  //
  // Sengaja BUKAN bergantung ke `q` (soal aktif) — itu ganti tiap butir
  // dijawab dalam kolom yang sama, jadi kalau ikut jadi dependency, timer
  // ke-reset ke 60 lagi tiap klik jawaban. Cuma boleh reset pas kolom-nya
  // ganti (`colIdx`), gak peduli lagi di butir keberapa di kolom itu.
  useEffect(() => {
    if (!timedMode || finished || showColIntro || sorted.length === 0) return;
    const deadline = Date.now() + COLUMN_DURATION_MS;
    const tick = () => {
      const remaining = Math.max(0, deadline - Date.now());
      setRemainingMs(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        advanceColumnRef.current();
      }
    };
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [timedMode, colIdx, showColIntro, finished, sorted.length]);

  if (!q) return null;

  if (finished) {
    const groups = buildLocalGroups(sorted, answers);
    const accuracy = answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0;

    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="surface-card px-5 py-6 text-center sm:px-7">
          <p className="text-sm text-muted-foreground">Latihan Kecermatan selesai</p>
          <p className="tnum font-heading mt-1 text-4xl text-foreground">
            {correctCount}
            <span className="text-2xl text-muted-foreground">/{answeredCount}</span>
          </p>
          <p className="tnum mt-1 text-sm text-muted-foreground">
            {accuracy}% tepat · {answeredCount} dari {sorted.length} butir dicoba
          </p>
          <Meter
            value={correctCount}
            max={Math.max(1, answeredCount)}
            tone={accuracy >= 80 ? "success" : accuracy >= 60 ? "accent" : "danger"}
            className="mx-auto mt-4 max-w-xs"
            label={`${accuracy} persen jawaban tepat`}
          />
        </div>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Pembahasan per kolom</h2>
          <KecermatanDetailReview groups={groups} />
        </section>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/dashboard/latihan/kecermatan" className={buttonStyles({ size: "lg", block: true })}>
            Pilih paket lain
          </Link>
          <Button variant="accent" size="lg" block onClick={resetPractice}>
            <Repeat className="size-4" />
            Ulangi latihan
          </Button>
        </div>
      </div>
    );
  }

  if (showColIntro) {
    return (
      <div className="mx-auto max-w-md">
        <div className="surface-card space-y-2 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">Kolom {ROMAN[(nextColRef.current ?? 1) - 1]}</p>
          <p className="tnum font-heading text-6xl text-foreground">{introSeconds}</p>
          <p className="text-sm text-muted-foreground">Kolom berikutnya akan dimulai…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <ConfirmDialog
        open={showFinish}
        onClose={() => setShowFinish(false)}
        onConfirm={() => {
          setShowFinish(false);
          setFinished(true);
        }}
        title="Selesaikan latihan sekarang?"
        confirmLabel="Ya, lihat pembahasan"
        tone="primary"
      >
        <p className="text-muted-foreground">
          Pembahasan hanya memuat butir yang sudah dicoba. Sisanya bisa dikerjakan kapan saja
          dengan mengulang latihan.
        </p>
      </ConfirmDialog>

      {timedMode && (
        <ConfirmDialog
          open={showSkip}
          onClose={() => setShowSkip(false)}
          onConfirm={() => {
            setShowSkip(false);
            advanceColumn();
          }}
          title="Lewati sisa kolom ini?"
          confirmLabel="Ya, lewati"
          tone="danger"
        >
          <p className="text-muted-foreground">
            Butir yang belum dijawab di kolom ini dianggap tidak dijawab, sama seperti waktu habis.
          </p>
        </ConfirmDialog>
      )}

      <div className="surface-card flex flex-wrap items-center justify-between gap-4 px-5 py-3.5">
        <p className="tnum text-sm text-foreground">
          Kolom <span className="font-semibold">{ROMAN[colIdx]}</span>
          <span className="text-muted-foreground"> · butir {rowInCol + 1}</span>
        </p>
        <div className="flex items-center gap-3">
          {timedMode && (
            <span
              className={`tnum inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold ${
                remainingMs <= 10_000 ? "bg-destructive-soft text-destructive" : "bg-accent-soft text-accent-ink"
              }`}
            >
              <Timer className="size-3.5" />
              {Math.ceil(remainingMs / 1000)}d
            </span>
          )}
          <p className="tnum text-xs text-muted-foreground">
            {answeredCount} dari {sorted.length} terjawab
          </p>
        </div>
      </div>

      {/* Mode bebas: kolom benar-benar bisa dilompati, deretan ini kontrol.
          Mode timer: dikunci sekuensial, cuma indikator (samain sama strip
          10-segmen non-interaktif di EngineKecermatan). */}
      <div
        className="surface-card grid grid-cols-5 gap-1 p-1.5 sm:grid-cols-10"
        role={timedMode ? "img" : "group"}
        aria-label={timedMode ? "Progres kolom" : "Pilih kolom, 10 kolom tersedia"}
      >
        {ROMAN.map((r, i) => {
          const active = i === colIdx;
          const done = i < colIdx;
          return (
            <button
              key={i}
              type="button"
              tabIndex={timedMode ? -1 : 0}
              aria-pressed={timedMode ? undefined : active}
              aria-label={`Kolom ${i + 1}${active ? ", sedang dibuka" : ""}`}
              onClick={timedMode ? undefined : () => jumpToColumn(i + 1)}
              className={`min-h-11 rounded-md px-2 text-xs font-bold transition-colors duration-150 ${
                timedMode ? "cursor-default" : ""
              } ${
                active
                  ? "bg-primary text-primary-foreground"
                  : timedMode && done
                    ? "bg-success/20 text-success"
                    : "text-muted-foreground hover:bg-surface-inset hover:text-foreground"
              }`}
            >
              {r}
            </button>
          );
        })}
      </div>

      <div className="surface-card overflow-hidden">
            <div className="mx-auto max-w-lg space-y-5 px-4 py-5 sm:px-6 sm:py-6">
              <KecermatanKeyStrip symbolMap={symbolMap} />

              <div key={q.id} className="question-enter grid grid-cols-4 gap-2" aria-label={`Simbol kolom ${colIdx + 1}, butir ${rowInCol + 1}`}>
                {shown.map((sym, i) => (
                  <div
                    key={i}
                    className="flex h-16 items-center justify-center rounded-md border border-border bg-surface-inset text-3xl"
                  >
                    {sym}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {KECERMATAN_KEYS.map((ch) => {
                  const isPicked = fb?.selected === ch;
                  let cls =
                    "border-2 border-border bg-card text-foreground hover:border-primary hover:bg-primary/6 active:translate-y-px";
                  if (fb) {
                    if (isPicked) cls = "border-2 border-primary bg-primary text-primary-foreground";
                    else cls = "bg-surface-inset text-faint-foreground";
                  }
                  return (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => pick(ch)}
                      disabled={Boolean(fb)}
                      aria-label={`Jawab ${ch}`}
                      className={`flex h-14 items-center justify-center rounded-md text-base font-bold transition-[background-color,border-color,transform] duration-100 ease-out disabled:cursor-default ${cls}`}
                    >
                      {ch}
                    </button>
                  );
                })}
              </div>

              <p className="text-center text-sm text-muted-foreground">
                {fb ? `Jawaban ${fb.selected} sudah tercatat.` : "Ketuk pilihan atau tekan A–E untuk menjawab."}
              </p>
              {error && <p role="alert" className="text-center text-sm text-destructive">{error}</p>}
            </div>

            <div className="flex flex-wrap gap-3 border-t border-border px-4 py-3 sm:px-6">
              {!timedMode && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setError("");
                    setIdx((i) => Math.max(0, i - 1));
                  }}
                  disabled={idx === 0}
                  className="flex-1"
                >
                  Butir sebelumnya
                </Button>
              )}
              {!timedMode && (fb || error) && (
                <Button variant="secondary" onClick={() => {
                  setError("");
                  if (idx >= sorted.length - 1) setFinished(true);
                  else setIdx(idx + 1);
                }} className="flex-1">
                  Butir berikutnya
                </Button>
              )}
              {timedMode && (
                <Button variant="secondary" onClick={() => setShowSkip(true)} className="flex-1">
                  Lewati sisa Kolom
                </Button>
              )}
              <Button variant="danger" onClick={() => setShowFinish(true)} className="flex-1">
                Selesaikan latihan
              </Button>
            </div>
      </div>
    </div>
  );
}
