"use client";

import { useCallback, useMemo, useState } from "react";
import type { SafeQuestion, KecerdasanOptionsPayload } from "@/lib/types/safe-question";
import { Badge, Meter } from "@/app/components/ui";
import { Button } from "@/app/components/ui-client";
import { Check, ChevronLeft, ChevronRight, Close } from "@/app/components/icons";
import { QuestionNavigator } from "@/app/components/ExamChrome";
import { useExamKeyboard } from "@/lib/hooks/use-exam-keyboard";

type Feedback = { selected: string; is_correct: boolean; correct_key: string };

export default function LatihanKecerdasan({ questions }: { questions: SafeQuestion[] }) {
  const sorted = useMemo(
    () => [...questions].sort((a, b) => a.sequence_number - b.sequence_number),
    [questions]
  );
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Feedback>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);

  const q = sorted[idx];
  const payload = q?.options_payload as unknown as KecerdasanOptionsPayload | undefined;
  const fb = q ? answers[q.id] : undefined;
  const attempted = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter((a) => a.is_correct).length;

  const checkAnswer = useCallback(
    async (selected: string) => {
      if (!q || answers[q.id] || checking || !selected) return;
      setChecking(true);
      setCheckError(null);
      try {
        const res = await fetch("/api/practice/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question_id: q.id, selected_key: selected }),
        });
        if (!res.ok) throw new Error("Jawaban belum dapat diperiksa. Coba lagi.");
        const data = (await res.json()) as { is_correct: boolean; correct_key: string };
        setAnswers((prev) => ({ ...prev, [q.id]: { selected, ...data } }));
      } catch (error) {
        setCheckError(error instanceof Error ? error.message : "Jawaban belum dapat diperiksa. Coba lagi.");
      } finally {
        setChecking(false);
      }
    },
    [q, answers, checking]
  );

  const multi = Boolean(payload?.is_multi_select);
  const draft = q ? drafts[q.id] ?? "" : "";
  const pick = useCallback(
    (key: string) => {
      if (!q || answers[q.id] || checking) return;
      if (!multi) {
        void checkAnswer(key);
        return;
      }
      setDrafts((current) => {
        const selected = current[q.id] ?? "";
        if (!selected.includes(key) && selected.length >= 2) return current;
        const next = selected.includes(key)
          ? selected.replace(key, "")
          : (selected + key).split("").sort().join("");
        return { ...current, [q.id]: next };
      });
    },
    [answers, checkAnswer, checking, multi, q]
  );

  const choiceKeys = useMemo(() => payload?.choices?.map((c) => c.key) ?? [], [payload]);

  useExamKeyboard({
    enabled: Boolean(q),
    choiceKeys,
    onChoose: pick,
    onPrev: () => setIdx((i) => Math.max(0, i - 1)),
    onNext: () => setIdx((i) => Math.min(sorted.length - 1, i + 1)),
  });

  if (!q) return null;

  return (
    <div className="mx-auto flex max-w-7xl flex-col items-stretch gap-4 lg:flex-row lg:items-start lg:gap-6">
      <QuestionNavigator
        itemLabel="Butir"
        questionIds={sorted.map((question) => question.id)}
        answers={answers}
        currentIndex={idx}
        onGoTo={setIdx}
      />

      <main className="min-w-0 flex-1 space-y-4">
      <div className="surface-card flex flex-wrap items-center justify-between gap-4 px-5 py-3.5">
        <p className="tnum text-sm text-foreground">
          Butir <span className="font-semibold">{idx + 1}</span>
          <span className="text-muted-foreground"> dari {sorted.length}</span>
        </p>
        <div className="flex items-center gap-4">
          <p className="tnum text-xs text-muted-foreground">
            {correctCount} benar dari {attempted} dicoba
          </p>
          <Meter
            value={attempted}
            max={sorted.length}
            tone="primary"
            className="w-24"
            label={`${attempted} dari ${sorted.length} butir dicoba`}
          />
        </div>
      </div>

      <article key={q.id} data-active-question tabIndex={-1} className="surface-card enter-rise overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3 sm:px-6">
          <h2 className="tnum text-sm font-semibold text-foreground">Butir {idx + 1}</h2>
          {fb && (
            <Badge tone={fb.is_correct ? "success" : "danger"}>
              {fb.is_correct ? <Check className="size-3.5" strokeWidth={3} /> : <Close className="size-3.5" strokeWidth={3} />}
              {fb.is_correct ? "Benar" : `Kunci ${fb.correct_key}`}
            </Badge>
          )}
          {!fb && multi && <Badge tone="accent">Pilih dua jawaban</Badge>}
        </div>

        <div className="space-y-5 px-4 py-5 sm:px-6 sm:py-6">
          {payload?.instruksi && (
            <p className="text-sm font-semibold text-foreground">{payload.instruksi}</p>
          )}
          {payload?.sub_text && (
            <div className="inset-panel px-4 py-3 text-sm leading-relaxed text-muted-foreground">
              {payload.sub_text}
            </div>
          )}
          {payload?.question_text && (
            <p className="max-w-[68ch] text-base leading-relaxed text-foreground">
              {payload.question_text}
            </p>
          )}
          {payload?.svg_content && (
            <div
              className="flex justify-center overflow-x-auto rounded-md border border-border bg-card p-4"
              dangerouslySetInnerHTML={{ __html: payload.svg_content }}
            />
          )}

          <div className="space-y-2 pt-1">
            {payload?.choices?.map((c) => {
              const isPicked = fb ? fb.selected.includes(c.key) : draft.includes(c.key);
              const isKey = Boolean(fb?.correct_key.includes(c.key));

              // Setelah dijawab, kunci ditandai hijau dan pilihan salah merah;
              // sisanya diredupkan supaya mata langsung ke perbandingan itu.
              let shell = "border-border hover:border-border-strong hover:bg-surface-inset";
              let marker = "border border-border-strong/45 bg-surface-inset text-muted-foreground";
              if (fb) {
                if (isKey) {
                  shell = "border-success bg-success-soft";
                  marker = "bg-success text-white";
                } else if (isPicked) {
                  shell = "border-destructive bg-destructive-soft";
                  marker = "bg-destructive text-white";
                } else {
                  shell = "border-border opacity-55";
                }
              }

              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => pick(c.key)}
                  disabled={Boolean(fb) || checking}
                  aria-pressed={isPicked}
                  className={`flex min-h-12 w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-[background-color,border-color] duration-150 ease-out disabled:cursor-default sm:gap-4 sm:px-4 ${shell}`}
                >
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${marker}`}
                  >
                    {c.key}
                  </span>
                  <span className="text-sm leading-relaxed text-foreground">{c.text}</span>
                </button>
              );
            })}
          </div>

          {!fb && multi && (
            <Button
              variant="primary"
              size="lg"
              onClick={() => void checkAnswer(draft)}
              disabled={draft.length !== 2 || checking}
            >
              {checking ? "Memeriksa..." : `Periksa pilihan (${draft.length}/2)`}
            </Button>
          )}
          {checkError && (
            <p role="alert" className="text-sm text-destructive">
              {checkError}
            </p>
          )}
        </div>
      </article>

      <nav className="flex gap-3" aria-label="Navigasi butir latihan">
        <Button
          variant="secondary"
          size="lg"
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
          className="flex-1 sm:flex-none"
        >
          <ChevronLeft className="size-4" />
          Sebelumnya
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={() => setIdx((i) => Math.min(sorted.length - 1, i + 1))}
          disabled={idx >= sorted.length - 1}
          className="flex-1 sm:ml-auto sm:min-w-40 sm:flex-none"
        >
          Butir berikutnya
          <ChevronRight className="size-4" />
        </Button>
      </nav>
      </main>
    </div>
  );
}
