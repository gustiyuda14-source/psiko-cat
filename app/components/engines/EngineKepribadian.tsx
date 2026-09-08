"use client";

import type {
  SafeQuestion,
  KepribadianOptionsPayload,
  RecoverySnapshot,
} from "@/lib/types/safe-question";
import { useEffect, useState } from "react";
import { useKepribadianStore } from "@/lib/stores/exam-store";
import { useExamEngine } from "@/lib/hooks/use-exam-engine";

type Props = {
  questions: SafeQuestion[];
  moduleSessionId: string;
  sessionId: string;
  timeLimitSeconds?: number;
  startedAt?: string | null;
  initialSnapshot?: RecoverySnapshot | null;
  onComplete?: () => void;
};

function fmt(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function EngineKepribadian({
  questions,
  moduleSessionId,
  sessionId,
  timeLimitSeconds = 3600,
  startedAt,
  initialSnapshot,
  onComplete,
}: Props) {
  const sorted = [...questions].sort((a, b) => a.sequence_number - b.sequence_number);

  const engine = useExamEngine({
    store: useKepribadianStore,
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Memuat...</div>
      </div>
    );
  }

  if (state.status === "completed") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
        <div className="text-5xl">✓</div>
        <h2 className="text-2xl font-semibold">Sub-Tes Kepribadian Selesai</h2>
        <p className="text-sm text-muted-foreground">Jawaban Anda telah tersimpan. Mengalihkan...</p>
      </div>
    );
  }

  const idx = Math.min(state.currentIndex, sorted.length - 1);
  const q = sorted[idx];
  const payload = q?.options_payload as unknown as KepribadianOptionsPayload;
  const picked = q ? state.answers[q.id] : undefined;
  const answeredCount = Object.keys(state.answers).length;
  const lowTime = secondsLeft <= 300;

  function pick(key: string) {
    engine.handleAnswer(q.id, key);
    if (idx < sorted.length - 1) {
      setTimeout(() => store.getState().next(), 200);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Offline overlay */}
      {isOffline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="max-w-xs space-y-3 rounded-2xl border border-destructive/30 bg-card p-8 text-center">
            <div className="text-4xl">📡</div>
            <h2 className="text-lg font-semibold text-destructive">Koneksi Terputus</h2>
            <p className="text-sm text-muted-foreground">Timer tetap berjalan. Jawaban tersimpan otomatis saat online kembali.</p>
          </div>
        </div>
      )}

      {/* Resume modal */}
      {showResume && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80">
          <div className="max-w-sm space-y-5 rounded-2xl border border-border bg-card p-8 text-foreground">
            <h2 className="text-xl font-semibold">Lanjutkan Sesi?</h2>
            <p className="text-sm text-muted-foreground">Sesi sebelumnya terdeteksi pada pernyataan nomor {resumeIndex + 1}.</p>
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
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80">
          <div className="w-full max-w-sm space-y-5 rounded-2xl border border-border bg-card p-8 text-foreground">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <h2 className="text-xl font-semibold">Yakin Ingin Mengumpulkan?</h2>
            </div>
            <div className="space-y-1 rounded-xl bg-accent-soft px-4 py-3 text-sm text-foreground">
              <p>Kamu baru menjawab <span className="font-bold">{answeredCount}</span> dari <span className="font-bold">{sorted.length}</span> pernyataan.</p>
              {answeredCount < sorted.length && (
                <p className="text-xs text-foreground">Pernyataan yang belum dijawab akan dihitung tidak dijawab.</p>
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

      {/* Sticky header */}
      <header className="sticky top-0 z-30 border-b border-primary/10 bg-primary text-primary-foreground backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60">Sub-Tes Kepribadian</p>
            <p className="mt-0.5 text-sm text-white/80">
              Pernyataan <span className="font-bold text-primary-foreground">{idx + 1}</span>
              <span className="text-white/60"> / {sorted.length}</span>
              <span className="ml-3 text-xs text-white/60">{answeredCount} terjawab</span>
            </p>
          </div>
          <div className={`flex items-center gap-2 font-mono tabular-nums font-bold text-2xl ${lowTime ? "animate-pulse text-accent" : "text-primary-foreground"}`}>
            <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
            {fmt(secondsLeft)}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 bg-white/10">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${(answeredCount / sorted.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Page body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex gap-5 items-start">

        {/* ── Left: Statement card ── */}
        <main className="flex-1 min-w-0 space-y-4">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {/* Card header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <span className="text-sm font-semibold">Pernyataan {idx + 1}</span>
              <span className="rounded-full bg-primary/7 px-3 py-1 text-xs text-muted-foreground">Skala Likert</span>
            </div>

            {/* Statement */}
            <div className="px-6 py-8">
              {payload?.aspect && (
                <div className="flex justify-center mb-4">
                  <span className="inline-block rounded-full border border-primary/20 bg-primary/7 px-3 py-1 text-xs font-medium text-primary">
                    {payload.aspect}
                  </span>
                </div>
              )}
              <p className="text-center text-lg font-medium leading-relaxed">
                {payload?.statement}
              </p>
            </div>

            {/* Likert choices */}
            <div className="px-6 pb-6 space-y-2.5">
              {payload?.choices?.map((c) => (
                <button
                  key={c.key}
                  onClick={() => pick(c.key)}
                  className={`w-full flex items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-all duration-150 ${
                    picked === c.key
                      ? "border-primary bg-primary/7"
                      : "border-border hover:border-primary/40 hover:bg-primary/7"
                  }`}
                >
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    picked === c.key ? "border-primary bg-primary" : "border-border"
                  }`}>
                    {picked === c.key && <span className="h-2 w-2 rounded-full bg-white" />}
                  </span>
                  <span className="text-sm font-medium">{c.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prev / Next */}
          <div className="flex justify-between">
            <button
              onClick={() => store.getState().prev()}
              disabled={idx === 0}
              className="min-h-11 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/7 disabled:opacity-30"
            >
              ← Sebelumnya
            </button>
            <button
              onClick={() => store.getState().next()}
              disabled={idx >= sorted.length - 1}
              className="min-h-11 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/7 disabled:opacity-30"
            >
              Selanjutnya →
            </button>
          </div>
        </main>

        {/* ── Right: Sticky sidebar ── */}
        <aside className="w-72 shrink-0 sticky top-20 space-y-4">
          {/* Tipe soal */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Tipe Soal</p>
            <div className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/7 px-3 py-1.5 text-xs font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              Tes Kepribadian
            </div>
          </div>

          {/* Daftar soal */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Daftar Soal</p>
              <span className="font-mono text-xs text-muted-foreground">{answeredCount}/{sorted.length}</span>
            </div>

            <div className="mb-3 h-1 overflow-hidden rounded-full bg-primary/7">
              <div
                className="h-full rounded-full bg-success transition-all duration-300"
                style={{ width: `${(answeredCount / sorted.length) * 100}%` }}
              />
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto pr-1">
              {sorted.map((sq, i) => {
                const answered = state.answers[sq.id];
                const current = i === idx;
                return (
                  <button
                    key={sq.id}
                    onClick={() => store.getState().goTo(i)}
                    title={`Pernyataan ${i + 1}${answered ? ` — ${answered}` : ""}`}
                    className={`relative flex flex-col items-center justify-center h-9 w-9 rounded-lg text-[10px] font-bold transition-all ${
                      current
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-1 ring-offset-card"
                        : answered
                        ? "bg-success text-white hover:bg-success/90"
                        : "border border-border bg-card text-muted-foreground hover:bg-primary/7"
                    }`}
                  >
                    <span className="leading-none">{i + 1}</span>
                    {answered && (
                      <span className="leading-none text-[7px] opacity-80 mt-0.5">{answered}</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center gap-3 border-t border-border pt-3">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded bg-success"></span>Dijawab
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded border border-border bg-card"></span>Belum
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded bg-primary"></span>Aktif
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={() => setShowConfirm(true)}
            className="min-h-12 w-full rounded-xl bg-success py-3.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-success/90"
          >
            Selesai &amp; Kumpulkan
          </button>
        </aside>
      </div>
    </div>
  );
}
