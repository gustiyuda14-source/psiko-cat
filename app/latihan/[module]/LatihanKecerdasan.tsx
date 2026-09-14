"use client";

import { useCallback, useMemo, useState } from "react";
import type { SafeQuestion, KecerdasanOptionsPayload } from "@/lib/types/safe-question";
import { Badge } from "@/app/components/ui";
import { Button } from "@/app/components/ui-client";
import { Check, ChevronLeft, ChevronRight } from "@/app/components/icons";
import { QuestionNavigator, SubmitDialog } from "@/app/components/ExamChrome";
import { KecerdasanReview, type KecerdasanReviewItem } from "@/app/components/PembahasanSection";
import { useExamKeyboard } from "@/lib/hooks/use-exam-keyboard";

// Alur ini sengaja dibikin sama kayak sub-tes Kecerdasan di simulasi asli
// (lihat EngineKecerdasan.tsx): pilih dulu, tidak ada koreksi per butir,
// baru dikumpulkan di akhir dan dapat pembahasan lengkap. Bedanya cuma
// jawaban disimpan di state lokal (bukan module_sessions) dan pengecekan
// lewat /api/practice/check per butir saat submit, bukan sekali jalan di server.
export default function LatihanKecerdasan({ questions }: { questions: SafeQuestion[] }) {
  const sorted = useMemo(
    () => [...questions].sort((a, b) => a.sequence_number - b.sequence_number),
    [questions]
  );
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [results, setResults] = useState<KecerdasanReviewItem[] | null>(null);

  const q = sorted[idx];
  const payload = q?.options_payload as unknown as KecerdasanOptionsPayload | undefined;
  const picked = q ? picks[q.id] : undefined;
  const multi = Boolean(payload?.is_multi_select);
  const answeredCount = Object.keys(picks).length;

  const choose = useCallback(
    (key: string) => {
      if (!q) return;
      if (!multi) {
        setPicks((current) => ({ ...current, [q.id]: key }));
        return;
      }
      setPicks((current) => {
        const value = current[q.id] ?? "";
        if (!value.includes(key) && value.length >= 2) return current;
        const next = value.includes(key)
          ? value.replace(key, "")
          : (value + key).split("").sort().join("");
        if (!next) {
          const { [q.id]: _drop, ...rest } = current;
          return rest;
        }
        return { ...current, [q.id]: next };
      });
    },
    [multi, q]
  );

  const choiceKeys = useMemo(() => payload?.choices?.map((c) => c.key) ?? [], [payload]);

  useExamKeyboard({
    enabled: Boolean(q) && !showConfirm && !results,
    choiceKeys,
    onChoose: choose,
    onPrev: () => setIdx((i) => Math.max(0, i - 1)),
    onNext: () => setIdx((i) => Math.min(sorted.length - 1, i + 1)),
  });

  const handleSubmit = useCallback(async () => {
    setShowConfirm(false);
    setSubmitting(true);
    setSubmitError(null);
    try {
      const items = await Promise.all(
        sorted.map(async (question) => {
          const selected = picks[question.id] ?? null;
          const res = await fetch("/api/practice/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question_id: question.id, selected_key: selected }),
          });
          if (!res.ok) throw new Error("Pembahasan belum dapat dimuat. Coba kumpulkan lagi.");
          const data = (await res.json()) as { is_correct: boolean; correct_key: string };
          return {
            question_id: question.id,
            sequence_number: question.sequence_number,
            selected_key: selected,
            correct_key: data.correct_key,
            is_correct: data.is_correct,
            payload: question.options_payload as unknown as KecerdasanOptionsPayload,
          } satisfies KecerdasanReviewItem;
        })
      );
      setResults(items);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Pembahasan belum dapat dimuat. Coba kumpulkan lagi.");
    } finally {
      setSubmitting(false);
    }
  }, [picks, sorted]);

  if (results) {
    return (
      <section className="surface-card mx-auto max-w-3xl space-y-5 px-6 py-8 sm:px-8">
        <div className="text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
            <Check className="size-7" strokeWidth={2.5} />
          </span>
          <h2 className="font-heading mt-3 text-2xl text-foreground">Latihan selesai</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Jawaban latihan hanya tersimpan selama halaman ini terbuka.
          </p>
        </div>
        <KecerdasanReview items={results} />
        <Button
          variant="primary"
          size="lg"
          block
          onClick={() => {
            setPicks({});
            setIdx(0);
            setResults(null);
          }}
        >
          Mulai ulang latihan
        </Button>
      </section>
    );
  }

  if (!q) return null;

  return (
    <div className="mx-auto flex max-w-7xl flex-col items-stretch gap-4 lg:flex-row lg:items-start lg:gap-6">
      <QuestionNavigator
        itemLabel="Butir"
        questionIds={sorted.map((question) => question.id)}
        answers={picks}
        currentIndex={idx}
        onGoTo={setIdx}
        onSubmit={() => setShowConfirm(true)}
        submitLabel="Kumpulkan latihan"
      />

      <SubmitDialog
        open={showConfirm}
        itemLabel="Butir"
        answered={answeredCount}
        total={sorted.length}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => void handleSubmit()}
      />

      <main className="min-w-0 flex-1 space-y-4">
        <article key={q.id} data-active-question tabIndex={-1} className="surface-card enter-rise overflow-hidden">
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3 sm:px-6">
            <h2 className="tnum text-sm font-semibold text-foreground">Butir {idx + 1}</h2>
            <Badge tone={multi ? "accent" : "neutral"}>
              {multi ? "Boleh lebih dari satu jawaban" : "Satu jawaban"}
            </Badge>
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
                const isSelected = multi ? Boolean(picked?.includes(c.key)) : picked === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => choose(c.key)}
                    aria-pressed={isSelected}
                    className={`flex min-h-12 w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-[background-color,border-color,box-shadow] duration-150 ease-out sm:gap-4 sm:px-4 ${
                      isSelected
                        ? "border-primary bg-primary/6 shadow-e1"
                        : "border-border hover:border-border-strong hover:bg-surface-inset"
                    }`}
                  >
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center text-sm font-bold transition-colors duration-150 ${
                        multi ? "rounded-[6px]" : "rounded-full"
                      } ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "border border-border-strong/45 bg-surface-inset text-muted-foreground"
                      }`}
                    >
                      {isSelected && multi ? <Check className="size-4" strokeWidth={3} /> : c.key}
                    </span>
                    <span className="text-sm leading-relaxed text-foreground">{c.text}</span>
                  </button>
                );
              })}
            </div>

            {submitError && (
              <p role="alert" className="text-sm text-destructive">
                {submitError}
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

        {submitting && (
          <p role="status" className="text-center text-sm text-muted-foreground">
            Mengumpulkan dan menyiapkan pembahasan...
          </p>
        )}
      </main>
    </div>
  );
}
