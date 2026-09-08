"use client";

import type {
  SafeQuestion,
  KecerdasanOptionsPayload,
  RecoverySnapshot,
} from "@/lib/types/safe-question";
import { useEffect, useState } from "react";
import { useKecerdasanStore } from "@/lib/stores/exam-store";
import { useExamEngine } from "@/lib/hooks/use-exam-engine";
import { ExamHeader, OfflineNotice, QuestionNavigator } from "@/app/components/ExamChrome";

type Props = {
  questions: SafeQuestion[];
  moduleSessionId: string;
  sessionId: string;
  timeLimitSeconds?: number;
  startedAt?: string | null;
  initialSnapshot?: RecoverySnapshot | null;
  onComplete?: () => void;
};

export default function EngineKecerdasan({
  questions,
  moduleSessionId,
  sessionId,
  timeLimitSeconds = 5400,
  startedAt,
  initialSnapshot,
  onComplete,
}: Props) {
  const sorted = [...questions].sort((a, b) => a.sequence_number - b.sequence_number);

  const engine = useExamEngine({
    store: useKecerdasanStore,
    sessionId,
    moduleSessionId,
    timeLimitSeconds,
    startedAt,
    initialSnapshot,
    totalQuestions: sorted.length,
    onComplete,
  });

  const { mounted, isOffline, showResume, resumeIndex, secondsLeft, state, store } = engine;
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (state.status === "completed") {
      const t = setTimeout(() => onComplete?.(), 1500);
      return () => clearTimeout(t);
    }
  }, [state.status, onComplete]);

  if (!mounted) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Memuat...</div>
      </div>
    );
  }

  if (state.status === "completed") {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-background px-4 text-center text-foreground">
        <div className="flex size-14 items-center justify-center rounded-full bg-success-soft text-2xl font-bold text-success" aria-hidden="true">✓</div>
        <h2 className="text-2xl font-semibold">Sub-Tes Kecerdasan Selesai</h2>
        <p className="text-sm text-muted-foreground">Jawaban Anda telah tersimpan. Mengalihkan...</p>
      </div>
    );
  }

  const idx = Math.min(state.currentIndex, sorted.length - 1);
  const q = sorted[idx];
  const payload = q?.options_payload as unknown as KecerdasanOptionsPayload;
  const picked = q ? state.answers[q.id] : undefined;
  const answeredCount = Object.keys(state.answers).length;

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      {isOffline && <OfflineNotice />}

      {/* Resume modal */}
      {showResume && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="resume-title">
          <div className="surface-card w-full max-w-sm space-y-5 p-6 text-foreground sm:p-8">
            <h2 id="resume-title" className="text-xl font-semibold">Lanjutkan Sesi?</h2>
            <p className="text-sm text-muted-foreground">Sesi sebelumnya terdeteksi pada soal nomor {resumeIndex + 1}.</p>
            <div className="flex gap-3">
              <button onClick={engine.doResume}
                className="min-h-11 flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                Lanjutkan
              </button>
              <button onClick={engine.doFreshStart}
                className="min-h-11 flex-1 rounded-xl border border-border bg-card py-2.5 text-sm font-semibold transition-colors hover:bg-primary/7">
                Mulai Ulang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm submit modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="submit-title">
          <div className="surface-card w-full max-w-sm space-y-5 p-6 text-foreground sm:p-8">
            <h2 id="submit-title" className="text-xl font-semibold">Yakin Ingin Mengumpulkan?</h2>
            <div className="space-y-1 rounded-xl bg-accent-soft px-4 py-3 text-sm text-foreground">
              <p>Kamu baru menjawab <span className="font-bold">{answeredCount}</span> dari <span className="font-bold">{sorted.length}</span> soal.</p>
              {answeredCount < sorted.length && (
                <p className="text-xs text-foreground">Soal yang belum dijawab akan dihitung tidak dijawab.</p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Setelah dikumpulkan, kamu tidak bisa kembali mengerjakan sub-tes ini.</p>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowConfirm(false)}
                className="min-h-11 flex-1 rounded-xl border border-border bg-card py-2.5 text-sm font-semibold transition-colors hover:bg-primary/7"
              >
                Batal
              </button>
              <button
                onClick={() => { setShowConfirm(false); engine.finish(); }}
                className="min-h-11 flex-1 rounded-xl bg-accent py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-accent/90"
              >
                Ya, Kumpulkan
              </button>
            </div>
          </div>
        </div>
      )}

      <ExamHeader
        title="Sub-Tes Kecerdasan"
        itemLabel="Soal"
        current={idx + 1}
        total={sorted.length}
        answered={answeredCount}
        secondsLeft={secondsLeft}
      />

      {/* Page body: question + sidebar */}
      <div className="mx-auto flex max-w-7xl flex-col items-stretch gap-4 px-4 py-4 sm:px-6 sm:py-6 lg:flex-row lg:items-start lg:gap-6">
        <QuestionNavigator
          typeLabel={payload?.is_multi_select ? "Pilihan Ganda Kompleks" : "Pilihan Ganda"}
          itemLabel="Soal"
          questionIds={sorted.map((question) => question.id)}
          answers={state.answers}
          currentIndex={idx}
          onGoTo={(index) => store.getState().goTo(index)}
          onSubmit={() => setShowConfirm(true)}
        />

        {/* ── Left: Question card ── */}
        <main className="flex-1 min-w-0 space-y-4">
          <div className="surface-card overflow-hidden">
            {/* Card header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-4 sm:px-6">
              <span className="text-sm font-semibold">Soal Nomor {idx + 1}</span>
              <span className="rounded-full bg-primary/7 px-3 py-1 text-xs text-muted-foreground">
                {payload?.is_multi_select ? "Pilihan Ganda Kompleks" : "Pilihan Ganda"}
              </span>
            </div>

            {/* Question content */}
            <div className="space-y-5 px-4 py-5 sm:px-6">
              {payload?.instruksi && (
                <div className="rounded-xl border border-primary/20 bg-primary/7 p-3 text-sm font-semibold text-foreground">
                  {payload.instruksi}
                  {payload?.is_multi_select && (
                    <span className="mt-1 block text-xs font-normal text-muted-foreground">
                      Anda dapat memilih lebih dari satu jawaban.
                    </span>
                  )}
                </div>
              )}

              {payload?.sub_text && (
                <div className="border-l-2 border-primary/20 py-1 pl-4 text-sm italic leading-relaxed text-muted-foreground">
                  {payload.sub_text}
                </div>
              )}

              {payload?.question_text && (
                <p className="text-base leading-relaxed">{payload.question_text}</p>
              )}

              {payload?.svg_content && (
                <div
                  className="bg-white rounded-xl p-4 flex justify-center overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: payload.svg_content }}
                />
              )}

              {/* Choices */}
              <div className="space-y-2.5 pt-1">
                {payload?.choices?.map((c) => {
                  const isSelected = payload?.is_multi_select 
                    ? picked?.includes(c.key) 
                    : picked === c.key;

                  const handleSelect = () => {
                    if (payload?.is_multi_select) {
                      let current = picked || "";
                      if (current.includes(c.key)) {
                        current = current.replace(c.key, "");
                      } else {
                        current += c.key;
                      }
                      current = current.split('').sort().join('');
                      engine.handleAnswer(q.id, current);
                    } else {
                      engine.handleAnswer(q.id, c.key);
                    }
                  };

                  return (
                    <button
                      key={c.key}
                      onClick={handleSelect}
                      className={`flex min-h-12 w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors duration-150 sm:gap-4 sm:px-4 ${
                        isSelected
                          ? "border-primary bg-primary/7"
                          : "border-border hover:border-primary/40 hover:bg-primary/7"
                      }`}
                    >
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center ${payload?.is_multi_select ? 'rounded-md' : 'rounded-full'} text-sm font-bold transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-primary/7 text-muted-foreground"
                      }`}>
                        {c.key}
                      </span>
                      <span className="text-sm leading-relaxed">{c.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Prev / Next buttons */}
          <div className="flex gap-3 sm:justify-between">
            <button
              onClick={() => store.getState().prev()}
              disabled={idx === 0}
              className="min-h-12 flex-1 rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/7 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none sm:px-5"
            >
              ← Sebelumnya
            </button>
            <button
              onClick={() => store.getState().next()}
              disabled={idx >= sorted.length - 1}
              className="min-h-12 flex-1 rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/7 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none sm:px-5"
            >
              Selanjutnya →
            </button>
          </div>
        </main>

      </div>
    </div>
  );
}
