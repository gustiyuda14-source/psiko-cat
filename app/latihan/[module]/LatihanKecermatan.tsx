"use client";

import { useEffect, useRef, useState } from "react";
import type { SafeQuestion, KecermatanOptionsPayload } from "@/lib/types/safe-question";
import { KecermatanDetailReview } from "@/app/components/PembahasanSection";
import type { KecermatanColumnGroup, KecermatanDetailItem } from "@/app/components/PembahasanSection";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const COLUMN_TRANSITION_SECONDS = 5;
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

export default function LatihanKecermatan({ questions }: { questions: SafeQuestion[] }) {
  const sorted = [...questions].sort(
    (a, b) => (a.column_index ?? 0) - (b.column_index ?? 0) || a.sequence_number - b.sequence_number
  );
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Feedback>>({});
  const [checking, setChecking] = useState(false);
  const [finished, setFinished] = useState(false);
  const [transition, setTransition] = useState<{ nextCol: number; secondsLeft: number } | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearPendingAdvance() {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  }

  useEffect(() => clearPendingAdvance, []);

  const q = sorted[idx];
  const payload = q?.options_payload as unknown as KecermatanOptionsPayload;
  const symbolMap = payload?.symbol_map ?? { A: "?", B: "?", C: "?", D: "?", E: "?" };
  const fb = q ? answers[q.id] : undefined;
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter((a) => a.is_correct).length;
  const colIdx = (q?.column_index ?? 1) - 1;
  const rowInCol = q ? sorted.slice(0, idx).filter((s) => s.column_index === q.column_index).length : 0;

  useEffect(() => {
    if (!transition) return;
    if (transition.secondsLeft <= 0) {
      setIdx((i) => i + 1);
      setTransition(null);
      return;
    }
    const t = setTimeout(() => {
      setTransition((tr) => (tr ? { ...tr, secondsLeft: tr.secondsLeft - 1 } : null));
    }, 1000);
    return () => clearTimeout(t);
  }, [transition]);

  function jumpToColumn(colNum: number) {
    if (transition || finished) return;
    const target = sorted.findIndex((s) => s.column_index === colNum);
    if (target >= 0) {
      clearPendingAdvance();
      setIdx(target);
    }
  }

  function resetPractice() {
    clearPendingAdvance();
    setIdx(0);
    setAnswers({});
    setFinished(false);
    setTransition(null);
  }

  async function pick(key: string) {
    if (fb || checking) return;
    setChecking(true);
    try {
      const res = await fetch("/api/practice/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: q.id, selected_key: key }),
      });
      const data = (await res.json()) as { is_correct: boolean; correct_key: string };
      setAnswers((prev) => ({ ...prev, [q.id]: { selected: key, ...data } }));

      const isLastOverall = idx >= sorted.length - 1;
      const nextQuestion = sorted[idx + 1];
      const isLastInColumn = !isLastOverall && nextQuestion && nextQuestion.column_index !== q.column_index;

      clearPendingAdvance();
      if (isLastOverall) {
        advanceTimer.current = setTimeout(() => setFinished(true), 500);
      } else if (isLastInColumn) {
        advanceTimer.current = setTimeout(
          () => setTransition({ nextCol: nextQuestion.column_index ?? colIdx + 2, secondsLeft: COLUMN_TRANSITION_SECONDS }),
          500
        );
      } else {
        advanceTimer.current = setTimeout(() => setIdx((i) => i + 1), 500);
      }
    } finally {
      setChecking(false);
    }
  }

  if (!q) {
    return <p className="text-sm text-muted-foreground">Belum ada soal latihan Kecermatan.</p>;
  }

  if (finished) {
    const groups = buildLocalGroups(sorted, answers);
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="surface-card p-6 text-center space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Latihan Kecermatan Selesai
          </p>
          <p className="text-3xl font-bold text-foreground">
            {correctCount}/{answeredCount} benar
          </p>
          <p className="text-xs text-muted-foreground">{answeredCount} dari {sorted.length} soal dicoba</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Pembahasan per Lajur
          </p>
          <KecermatanDetailReview groups={groups} />
        </div>

        <button
          onClick={resetPractice}
          className="w-full min-h-11 rounded-xl bg-accent text-primary py-3 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5"
        >
          Ulangi Latihan
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium tracking-wider uppercase">
            Latihan Kecermatan (Training)
          </p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p>{answeredCount} dicoba</p>
          <p className="text-success font-semibold">{correctCount} benar</p>
        </div>
      </div>

      <div className="flex items-center gap-1 rounded-xl border border-border bg-card px-3 py-1.5">
        {ROMAN.map((r, i) => (
          <button
            key={i}
            type="button"
            onClick={() => jumpToColumn(i + 1)}
            disabled={!!transition}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors disabled:cursor-not-allowed ${
              i === colIdx
                ? "bg-accent text-primary"
                : i < colIdx
                ? "text-muted-foreground hover:bg-primary/7"
                : "text-muted-foreground/50 hover:bg-primary/7"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border">
        {transition ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
            <p className="text-sm text-muted-foreground">Kolom {ROMAN[colIdx]} selesai</p>
            <p className="text-lg font-semibold text-foreground">
              Lanjut ke Kolom {ROMAN[transition.nextCol - 1]} dalam {transition.secondsLeft}s…
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Soal {rowInCol + 1}/50
                </p>
                <p className="text-lg font-semibold text-foreground">Kolom {ROMAN[colIdx]}</p>
              </div>
              <span className="text-xs text-muted-foreground bg-background px-3 py-1.5 rounded-full font-semibold">
                {idx + 1}/{sorted.length}
              </span>
            </div>

            <div className="px-6 py-5 space-y-6">
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Petunjuk Soal</p>
                <table className="w-full border-collapse rounded-xl overflow-hidden border border-border">
                  <thead>
                    <tr className="bg-primary text-primary-foreground">
                      {(["A", "B", "C", "D", "E"] as const).map((k) => (
                        <th key={k} className="py-2.5 text-center text-sm font-bold border-r border-white/10 last:border-r-0">
                          {k}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-background">
                      {(["A", "B", "C", "D", "E"] as const).map((k) => (
                        <td key={k} className="py-3 text-center text-xl text-foreground border-r border-border last:border-r-0">
                          {symbolMap[k]}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Soal</p>
                <div className="grid grid-cols-4 gap-3">
                  {payload?.shown.map((sym, i) => (
                    <div key={i} className="flex items-center justify-center h-16 bg-background border border-border rounded-xl text-3xl text-foreground">
                      {sym}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Jawaban Anda</p>
                <div className="grid grid-cols-5 gap-2">
                  {(["A", "B", "C", "D", "E"] as const).map((ch) => {
                    const isPicked = fb?.selected === ch;
                    const isCorrectKey = fb && ch === fb.correct_key;
                    let cls = "bg-card border-2 border-border text-foreground hover:border-primary";
                    if (fb) {
                      if (isCorrectKey) cls = "bg-success text-white";
                      else if (isPicked) cls = "bg-destructive text-white";
                      else cls = "bg-background text-muted-foreground";
                    }
                    return (
                      <button
                        key={ch}
                        onClick={() => pick(ch)}
                        disabled={!!fb || checking}
                        className={`flex items-center justify-center h-14 rounded-xl text-base font-bold transition-all ${cls}`}
                      >
                        {ch}
                      </button>
                    );
                  })}
                </div>
              </div>

              {fb && (
                <p className={`text-sm font-semibold ${fb.is_correct ? "text-success" : "text-destructive"}`}>
                  {fb.is_correct ? "✓ Benar" : `✗ Salah. Kunci: ${fb.correct_key}`}
                </p>
              )}
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => {
                  clearPendingAdvance();
                  setIdx((i) => Math.max(0, i - 1));
                }}
                disabled={idx === 0}
                className="flex-1 py-3 border-2 border-border text-foreground rounded-xl text-sm font-bold disabled:opacity-30 hover:bg-background transition-colors"
              >
                ← Sebelumnya
              </button>
              <button
                onClick={() => {
                  if (window.confirm("Yakin ingin menyelesaikan latihan sekarang? Kamu bisa lihat pembahasan soal yang sudah dicoba.")) {
                    setFinished(true);
                  }
                }}
                className="flex-1 py-3 border-2 border-destructive/40 text-destructive rounded-xl text-sm font-bold hover:bg-destructive/10 transition-colors"
              >
                Selesaikan Latihan
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
