"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import type { SafeQuestion, KecermatanOptionsPayload } from "@/lib/types/safe-question";
import { KecermatanDetailReview } from "@/app/components/PembahasanSection";
import type { KecermatanColumnGroup, KecermatanDetailItem } from "@/app/components/PembahasanSection";
import { KecermatanKeyStrip, KECERMATAN_KEYS } from "@/app/components/KecermatanKeyStrip";
import { buttonStyles, Meter } from "@/app/components/ui";
import { Button, ConfirmDialog } from "@/app/components/ui-client";
import { Repeat } from "@/app/components/icons";
import { useExamKeyboard } from "@/lib/hooks/use-exam-keyboard";
import { getMissingSymbolKey } from "@/lib/kecermatan-symbols";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
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
  const sorted = useMemo(
    () =>
      [...questions].sort(
        (a, b) => (a.column_index ?? 0) - (b.column_index ?? 0) || a.sequence_number - b.sequence_number
      ),
    [questions]
  );
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Feedback>>({});
  const answeredIds = useRef(new Set<string>());
  const [error, setError] = useState("");
  const [finished, setFinished] = useState(false);
  const [showFinish, setShowFinish] = useState(false);

  const q = sorted[idx];
  const payload = q?.options_payload as unknown as KecermatanOptionsPayload | undefined;
  const shown = Array.isArray(payload?.shown) ? payload.shown.filter((symbol) => typeof symbol === "string") : [];
  const symbolMap = payload?.symbol_map ?? { A: "?", B: "?", C: "?", D: "?", E: "?" };
  const fb = q ? answers[q.id] : undefined;
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter((a) => a.is_correct).length;
  const colIdx = (q?.column_index ?? 1) - 1;
  const rowInCol = q ? sorted.slice(0, idx).filter((s) => s.column_index === q.column_index).length : 0;

  function jumpToColumn(colNum: number) {
    if (finished) return;
    const target = sorted.findIndex((s) => s.column_index === colNum);
    if (target >= 0) {
      setError("");
      setIdx(target);
    }
  }

  function resetPractice() {
    answeredIds.current.clear();
    setError("");
    setIdx(0);
    setAnswers({});
    setFinished(false);
  }

  const pick = useCallback(
    (key: string) => {
      if (!q || finished || showFinish || answeredIds.current.has(q.id)) return;
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
      if (idx >= sorted.length - 1) setFinished(true);
      else setIdx(idx + 1);
    },
    [q, finished, showFinish, idx, sorted.length]
  );

  useExamKeyboard({
    enabled: Boolean(q) && !finished && !showFinish,
    choiceKeys: KECERMATAN_KEYS as unknown as string[],
    onChoose: pick,
  });

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

      <div className="surface-card flex flex-wrap items-center justify-between gap-4 px-5 py-3.5">
        <p className="tnum text-sm text-foreground">
          Kolom <span className="font-semibold">{ROMAN[colIdx]}</span>
          <span className="text-muted-foreground"> · butir {rowInCol + 1}</span>
        </p>
        <p className="tnum text-xs text-muted-foreground">
          {answeredCount} dari {sorted.length} terjawab
        </p>
      </div>

      {/* Di mode latihan kolom benar-benar bisa dilompati, jadi deretan ini
          memang kontrol — beda dengan indikator sepuluh segmen di mode ujian
          yang tidak bisa diklik. */}
      <div
        className="surface-card grid grid-cols-5 gap-1 p-1.5 sm:grid-cols-10"
        role="group"
        aria-label="Pilih kolom, 10 kolom tersedia"
      >
        {ROMAN.map((r, i) => {
          const active = i === colIdx;
          return (
            <button
              key={i}
              type="button"
              aria-pressed={active}
              aria-label={`Kolom ${i + 1}${active ? ", sedang dibuka" : ""}`}
              onClick={() => jumpToColumn(i + 1)}
              className={`min-h-11 rounded-md px-2 text-xs font-bold transition-colors duration-150 ${
                active
                  ? "bg-primary text-primary-foreground"
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
              {(fb || error) && (
                <Button variant="secondary" onClick={() => {
                  setError("");
                  if (idx >= sorted.length - 1) setFinished(true);
                  else setIdx(idx + 1);
                }} className="flex-1">
                  Butir berikutnya
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
