"use client";

import type {
  SafeQuestion,
  KepribadianOptionsPayload,
  RecoverySnapshot,
} from "@/lib/types/safe-question";
import { useEffect } from "react";
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

  useEffect(() => {
    if (state.status === "completed") {
      const t = setTimeout(() => onComplete?.(), 1500);
      return () => clearTimeout(t);
    }
  }, [state.status, onComplete]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="text-zinc-500 text-sm">Memuat...</div>
      </div>
    );
  }

  if (state.status === "completed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white gap-4">
        <div className="text-5xl">✓</div>
        <h2 className="text-2xl font-semibold">Sub-Tes Kepribadian Selesai</h2>
        <p className="text-zinc-400 text-sm">Jawaban Anda telah tersimpan. Mengalihkan...</p>
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
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Offline overlay */}
      {isOffline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-zinc-900 border border-red-700 rounded-2xl p-8 max-w-xs text-center space-y-3">
            <div className="text-4xl">📡</div>
            <h2 className="text-lg font-semibold text-red-400">Koneksi Terputus</h2>
            <p className="text-zinc-400 text-sm">Timer tetap berjalan. Jawaban tersimpan otomatis saat online kembali.</p>
          </div>
        </div>
      )}

      {/* Resume modal */}
      {showResume && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 max-w-sm space-y-5">
            <h2 className="text-xl font-semibold">Lanjutkan Sesi?</h2>
            <p className="text-zinc-400 text-sm">Sesi sebelumnya terdeteksi pada pernyataan nomor {resumeIndex + 1}.</p>
            <div className="flex gap-3">
              <button onClick={engine.doResume}
                className="flex-1 bg-blue-600 hover:bg-blue-500 rounded-xl py-2.5 text-sm font-semibold transition-colors">
                Lanjutkan
              </button>
              <button onClick={engine.doFreshStart}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 rounded-xl py-2.5 text-sm font-semibold transition-colors">
                Mulai Ulang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-zinc-900/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-semibold">Sub-Tes Kepribadian</p>
            <p className="text-sm text-zinc-300 mt-0.5">
              Pernyataan <span className="text-white font-bold">{idx + 1}</span>
              <span className="text-zinc-600"> / {sorted.length}</span>
              <span className="text-zinc-600 ml-3 text-xs">{answeredCount} terjawab</span>
            </p>
          </div>
          <div className={`flex items-center gap-2 font-mono font-bold text-2xl ${lowTime ? "text-red-400 animate-pulse" : "text-white"}`}>
            <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
            {fmt(secondsLeft)}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 bg-zinc-800">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${(answeredCount / sorted.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Page body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex gap-5 items-start">

        {/* ── Left: Statement card ── */}
        <main className="flex-1 min-w-0 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            {/* Card header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <span className="text-sm font-semibold text-zinc-300">Pernyataan {idx + 1}</span>
              <span className="text-xs text-zinc-500 bg-zinc-800 px-3 py-1 rounded-full">Skala Likert</span>
            </div>

            {/* Statement */}
            <div className="px-6 py-8">
              <p className="text-lg leading-relaxed text-zinc-100 text-center font-medium">
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
                      ? "border-blue-500 bg-blue-600/15 shadow-sm shadow-blue-500/20"
                      : "border-zinc-700/50 hover:border-zinc-600 hover:bg-zinc-800/60"
                  }`}
                >
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    picked === c.key ? "border-blue-400 bg-blue-500" : "border-zinc-600"
                  }`}>
                    {picked === c.key && <span className="h-2 w-2 rounded-full bg-white" />}
                  </span>
                  <span className="text-sm text-zinc-200 font-medium">{c.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prev / Next */}
          <div className="flex justify-between">
            <button
              onClick={() => store.getState().prev()}
              disabled={idx === 0}
              className="flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 disabled:opacity-30 hover:bg-zinc-800 hover:border-zinc-600 transition-colors"
            >
              ← Sebelumnya
            </button>
            <button
              onClick={() => store.getState().next()}
              disabled={idx >= sorted.length - 1}
              className="flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 disabled:opacity-30 hover:bg-zinc-800 hover:border-zinc-600 transition-colors"
            >
              Selanjutnya →
            </button>
          </div>
        </main>

        {/* ── Right: Sticky sidebar ── */}
        <aside className="w-72 shrink-0 sticky top-20 space-y-4">
          {/* Tipe soal */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-semibold mb-2">Tipe Soal</p>
            <div className="inline-flex items-center gap-2 bg-purple-900/30 border border-purple-800/50 text-purple-300 text-xs font-semibold px-3 py-1.5 rounded-lg">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400"></span>
              Tes Kepribadian
            </div>
          </div>

          {/* Daftar soal */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-semibold">Daftar Soal</p>
              <span className="text-xs text-zinc-500 font-mono">{answeredCount}/{sorted.length}</span>
            </div>

            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
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
                        ? "ring-2 ring-blue-400 ring-offset-1 ring-offset-zinc-900 bg-blue-600 text-white"
                        : answered
                        ? "bg-emerald-700 text-white hover:bg-emerald-600"
                        : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700 border border-zinc-700"
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

            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-zinc-800">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                <span className="h-2.5 w-2.5 rounded bg-emerald-700"></span>Dijawab
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                <span className="h-2.5 w-2.5 rounded bg-zinc-800 border border-zinc-700"></span>Belum
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                <span className="h-2.5 w-2.5 rounded bg-blue-600"></span>Aktif
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={engine.finish}
            className="w-full rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-950/50"
          >
            Selesai &amp; Kumpulkan
          </button>
        </aside>
      </div>
    </div>
  );
}
