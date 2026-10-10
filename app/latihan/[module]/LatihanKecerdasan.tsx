"use client";

import QuestionPassage from "@/app/components/QuestionPassage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { recordLatihanProgress } from "@/lib/latihan-progress";
import type { SafeQuestion, KecerdasanOptionsPayload } from "@/lib/types/safe-question";
import { Badge } from "@/app/components/ui";
import { Button } from "@/app/components/ui-client";
import { Check } from "@/app/components/icons";
import { ExamBody, ExamDock, QuestionNavigator, SubmitDialog } from "@/app/components/ExamChrome";
import { KecerdasanReview, type KecerdasanReviewItem } from "@/app/components/PembahasanSection";
import { useExamKeyboard } from "@/lib/hooks/use-exam-keyboard";

// Alur ini sengaja dibikin sama kayak sub-tes Kecerdasan di simulasi asli
// (lihat EngineKecerdasan.tsx): pilih dulu, tidak ada koreksi per butir,
// baru dikumpulkan di akhir dan dapat pembahasan lengkap. Bedanya cuma
// jawaban disimpan di state lokal (bukan module_sessions) dan pengecekan
// lewat /api/practice/check per butir saat submit, bukan sekali jalan di server.
export default function LatihanKecerdasan({
  questions,
  progressKey,
}: {
  questions: SafeQuestion[];
  progressKey?: string;
}) {
  const sorted = useMemo(
    () => [...questions].sort((a, b) => a.sequence_number - b.sequence_number),
    [questions]
  );
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState<Record<string, string>>({});

  // Capaian terjauh paket ini (lib/latihan-progress.ts) untuk rak tabung di pemilih paket.
  useEffect(() => {
    if (progressKey) recordLatihanProgress(progressKey, Object.keys(picks).length);
  }, [progressKey, picks]);
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
      <section className="surface-card mx-auto my-6 w-[calc(100%-2rem)] max-w-3xl space-y-5 px-6 py-8 sm:px-8">
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
    <>
      <SubmitDialog
        open={showConfirm}
        itemLabel="Butir"
        answered={answeredCount}
        total={sorted.length}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => void handleSubmit()}
      />

      <ExamBody
        navigator={
          <QuestionNavigator
            itemLabel="Butir"
            questionIds={sorted.map((question) => question.id)}
            answers={picks}
            currentIndex={idx}
            onGoTo={setIdx}
            onSubmit={() => setShowConfirm(true)}
            submitLabel="Kumpulkan latihan"
          />
        }
      >
        <article key={q.id} data-active-question tabIndex={-1} className="enter-rise space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="qnum tnum">Butir {idx + 1}</p>
            <Badge tone={multi ? "accent" : "neutral"}>
              {multi ? "Boleh lebih dari satu jawaban" : "Satu jawaban"}
            </Badge>
          </div>

          <div className="q-card">
            {payload?.instruksi && (
              <p className="q-ins">{payload.instruksi}</p>
            )}
            <QuestionPassage text={payload?.sub_text} />
            {payload?.question_text && (
              <p className="q-stem">{payload.question_text}</p>
            )}
            {payload?.svg_content && (
              <div
                className="flex justify-center overflow-x-auto rounded-md border border-border bg-card p-4"
                dangerouslySetInnerHTML={{ __html: payload.svg_content }}
              />
            )}
          </div>

          <div className="opts pt-1">
            {payload?.choices?.map((c) => {
              const isSelected = multi ? Boolean(picked?.includes(c.key)) : picked === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => choose(c.key)}
                  aria-pressed={isSelected}
                  className={`opt ${isSelected ? "sel" : ""}`}
                >
                  <span className={`mark ${multi ? "is-square" : ""}`}>
                    {isSelected && multi ? <Check className="size-4" strokeWidth={3} /> : c.key}
                  </span>
                  <span className="opt-text">{c.text}</span>
                </button>
              );
            })}
          </div>

          {submitError && (
            <p role="alert" className="text-sm text-destructive">
              {submitError}
            </p>
          )}
          {submitting && (
            <p role="status" className="text-sm text-muted-foreground">
              Mengumpulkan dan menyiapkan pembahasan...
            </p>
          )}
        </article>
      </ExamBody>

      <ExamDock
        onPrev={() => setIdx((i) => Math.max(0, i - 1))}
        onNext={() => setIdx((i) => Math.min(sorted.length - 1, i + 1))}
        prevDisabled={idx === 0}
        nextDisabled={idx >= sorted.length - 1}
        prevLabel="Butir sebelumnya"
        nextLabel="Butir berikutnya"
      />
    </>
  );
}
