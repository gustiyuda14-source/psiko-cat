"use client";

import QuestionPassage from "@/app/components/QuestionPassage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { recordLatihanProgress } from "@/lib/practice-progress";
import type { SafeQuestion, KecerdasanOptionsPayload } from "@/lib/types/safe-question";
import { Badge } from "@/app/components/ui";
import { Button } from "@/app/components/ui-client";
import { Check } from "@/app/components/icons";
import AttemptSaver from "./AttemptSaver";
import { ExamBody, ExamDock, QuestionNavigator, SubmitDialog } from "@/app/components/ExamChrome";
import { KecerdasanReview, type KecerdasanReviewItem } from "@/app/components/PembahasanSection";
import { useExamKeyboard } from "@/lib/hooks/use-exam-keyboard";
import { MODULE_CONFIG } from "@/lib/test-config";

// Batas waktu sama dengan sub-tes Kecerdasan di simulasi (90 menit).
const TIME_LIMIT_MS = MODULE_CONFIG.KECERDASAN.time_limit_seconds * 1000;

// Alur ini sengaja dibikin sama kayak sub-tes Kecerdasan di simulasi asli
// (lihat EngineKecerdasan.tsx): pilih dulu, tidak ada koreksi per butir,
// baru dikumpulkan di akhir dan dapat pembahasan lengkap. Bedanya cuma
// jawaban disimpan di state lokal (bukan module_sessions) dan pengecekan
// lewat /api/practice/check (satu request untuk seluruh paket) saat submit.
export default function LatihanKecerdasan({
  questions,
  progressKey,
  onSecondsLeft,
}: {
  questions: SafeQuestion[];
  progressKey?: string;
  /** Sisa detik untuk timer di ExamBar milik LatihanGate; null = sembunyikan. */
  onSecondsLeft?: (seconds: number | null) => void;
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
  // Deadline wall-clock (tahan tab-throttling), pola sama dengan EngineKecermatan.
  const [deadline, setDeadline] = useState(() => Date.now() + TIME_LIMIT_MS);
  const [timeUp, setTimeUp] = useState(false);

  const q = sorted[idx];
  const payload = q?.options_payload as unknown as KecerdasanOptionsPayload | undefined;
  const picked = q ? picks[q.id] : undefined;
  const multi = Boolean(payload?.is_multi_select);
  const answeredCount = Object.keys(picks).length;

  const choose = useCallback(
    (key: string) => {
      if (!q || timeUp) return;
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
          const rest = { ...current };
          delete rest[q.id];
          return rest;
        }
        return { ...current, [q.id]: next };
      });
    },
    [multi, q, timeUp]
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
      const res = await fetch("/api/practice/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: sorted.map((q) => ({ question_id: q.id, selected_key: picks[q.id] ?? null })) }),
      });
      if (!res.ok) throw new Error("Pembahasan belum dapat dimuat. Coba kumpulkan lagi.");
      const { items: checked } = (await res.json()) as {
        items: Record<string, { is_correct: boolean; correct_key: string; pembahasan: string | null; pembahasan_svg: string | null }>;
      };
      setResults(
        sorted.map((question) => ({
          question_id: question.id,
          sequence_number: question.sequence_number,
          selected_key: picks[question.id] ?? null,
          ...checked[question.id],
          payload: question.options_payload as unknown as KecerdasanOptionsPayload,
        }) satisfies KecerdasanReviewItem)
      );
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Pembahasan belum dapat dimuat. Coba kumpulkan lagi.");
    } finally {
      setSubmitting(false);
    }
  }, [picks, sorted]);

  const submitRef = useRef(handleSubmit);
  useEffect(() => {
    submitRef.current = handleSubmit;
  });

  // Waktu habis: kunci jawaban dan kumpulkan sekali. Kalau gagal (jaringan),
  // peserta kumpulkan manual lewat tombol, tidak di-retry otomatis.
  useEffect(() => {
    if (results || timeUp) return;
    const interval = setInterval(tick, 250);
    function tick() {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      onSecondsLeft?.(left);
      if (left > 0) return;
      clearInterval(interval);
      setTimeUp(true);
      void submitRef.current();
    }
    tick();
    return () => clearInterval(interval);
  }, [deadline, results, timeUp, onSecondsLeft]);

  useEffect(() => {
    if (results) onSecondsLeft?.(null);
  }, [results, onSecondsLeft]);

  if (results) {
    return (
      <section className="surface-card mx-auto my-6 w-[calc(100%-2rem)] max-w-3xl space-y-5 px-6 py-8 sm:px-8">
        <div className="text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
            <Check className="size-7" strokeWidth={2.5} />
          </span>
          <h2 className="font-heading mt-3 text-2xl text-foreground">Latihan selesai</h2>
        </div>
        <AttemptSaver progressKey={progressKey} answers={Object.fromEntries(results.map((r) => [r.question_id, r.selected_key]))} />
        <KecerdasanReview items={results} />
        <Button
          variant="primary"
          size="lg"
          block
          onClick={() => {
            setPicks({});
            setIdx(0);
            setResults(null);
            setTimeUp(false);
            setDeadline(Date.now() + TIME_LIMIT_MS);
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

          {timeUp && (
            <p role="alert" className="text-sm font-semibold text-destructive">
              Waktu habis. Jawaban dikunci dan dikumpulkan otomatis.
            </p>
          )}
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
