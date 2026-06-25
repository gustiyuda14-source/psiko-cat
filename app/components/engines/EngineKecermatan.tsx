"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type {
  SafeQuestion,
  KecermatanOptionsPayload,
  RecoverySnapshot,
} from "@/lib/types/safe-question";
import { useKecermatanStore, COLUMN_DURATION_MS } from "@/lib/stores/kecermatan-store";

const FLUSH_THRESHOLD = 20;
const HEARTBEAT_MS = 30_000;
const TOTAL_COLS = 10;
const INTRO_SECONDS = 5;
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

type LogEntry = {
  question_id: string;
  column_index: number;
  clicked_at_ms: number;
  response_value: string;
};

type Props = {
  questions: SafeQuestion[];
  moduleSessionId: string;
  sessionId: string;
  initialSnapshot?: RecoverySnapshot | null;
  onComplete?: () => void;
};

export default function EngineKecermatan({
  questions,
  moduleSessionId,
  sessionId,
  initialSnapshot,
  onComplete,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [resumeCol, setResumeCol] = useState(0);
  const [resumeMs, setResumeMs] = useState(COLUMN_DURATION_MS);
  const [showColIntro, setShowColIntro] = useState(false);
  const [introSeconds, setIntroSeconds] = useState(INTRO_SECONDS);
  const [nextColIdx, setNextColIdx] = useState(1);

  const store = useKecermatanStore();

  const logsBuffer = useRef<LogEntry[]>([]);
  const isFlushing = useRef(false);
  const lastHeartbeat = useRef(Date.now());
  const msidRef = useRef(moduleSessionId);
  const sidRef = useRef(sessionId);
  msidRef.current = moduleSessionId;
  sidRef.current = sessionId;

  const columns = Array.from({ length: TOTAL_COLS }, (_, i) =>
    questions
      .filter((q) => q.column_index === i + 1)
      .sort((a, b) => a.sequence_number - b.sequence_number)
  );

  // ── API helpers ──────────────────────────────────────────────────────────────

  const flushLogs = useCallback(async () => {
    if (isFlushing.current || logsBuffer.current.length === 0) return;
    isFlushing.current = true;
    const batch = logsBuffer.current.splice(0);
    try {
      await fetch("/api/kecermatan/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module_session_id: msidRef.current, logs: batch }),
      });
    } catch {
      logsBuffer.current = [...batch, ...logsBuffer.current];
    } finally {
      isFlushing.current = false;
    }
  }, []);

  const flushRef = useRef(flushLogs);
  useEffect(() => { flushRef.current = flushLogs; }, [flushLogs]);

  const syncHeartbeat = useCallback(async () => {
    const s = useKecermatanStore.getState();
    try {
      await fetch(`/api/sessions/${sidRef.current}/sync`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module_session_id: msidRef.current,
          current_question_index: s.currentColIdx * 50 + s.currentRowIdx,
          current_column_index: s.currentColIdx + 1,
          column_remaining_ms: s.columnRemainingMs,
        }),
      });
    } catch {}
  }, []);

  // Called when a column ends (timer=0 or all rows answered)
  const handleAdvance = useCallback(async () => {
    await flushRef.current();
    const { currentColIdx } = useKecermatanStore.getState();
    if (currentColIdx >= TOTAL_COLS - 1) {
      try {
        await fetch(
          `/api/sessions/${sidRef.current}/modules/${msidRef.current}/complete`,
          { method: "POST" }
        );
      } catch {}
      useKecermatanStore.getState().setStatus("completed");
      onComplete?.();
    } else {
      setNextColIdx(currentColIdx + 1);
      setIntroSeconds(INTRO_SECONDS);
      setShowColIntro(true);
    }
  }, [onComplete]);

  const advanceRef = useRef(handleAdvance);
  useEffect(() => { advanceRef.current = handleAdvance; }, [handleAdvance]);

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const on = () => setIsOffline(false);
    const off = () => setIsOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  useEffect(() => {
    if (store.status !== "running" || process.env.NODE_ENV === "development") return;
    const guard = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [store.status]);

  useEffect(() => {
    if (!mounted) return;
    const s = useKecermatanStore.getState();
    if (s.sessionId === sessionId && s.moduleSessionId === moduleSessionId && s.status === "running") return;
    if (initialSnapshot?.current_column_index != null && initialSnapshot.current_column_index > 0) {
      const col = Math.min(initialSnapshot.current_column_index - 1, TOTAL_COLS - 1);
      const ms = Math.max(0, initialSnapshot.column_remaining_ms ?? COLUMN_DURATION_MS);
      setResumeCol(col);
      setResumeMs(ms);
      setShowResume(true);
      return;
    }
    useKecermatanStore.getState().init(sessionId, moduleSessionId, 0, 0, COLUMN_DURATION_MS, true);
  }, [mounted, sessionId, moduleSessionId, initialSnapshot]);

  // Column timer — restarts when column changes or showColIntro toggles off
  useEffect(() => {
    if (store.status !== "running" || showColIntro) return;
    let remaining = useKecermatanStore.getState().columnRemainingMs;
    const interval = setInterval(() => {
      remaining -= 100;
      useKecermatanStore.getState().tickColumn(100);
      const now = Date.now();
      if (now - lastHeartbeat.current >= HEARTBEAT_MS) {
        lastHeartbeat.current = now;
        syncHeartbeat();
      }
      if (remaining <= 0) {
        clearInterval(interval);
        advanceRef.current();
      }
    }, 100);
    return () => clearInterval(interval);
  }, [store.status, store.currentColIdx, showColIntro, syncHeartbeat]);

  // Intro countdown
  useEffect(() => {
    if (!showColIntro) return;
    const interval = setInterval(() => {
      setIntroSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [showColIntro]);

  // When intro countdown reaches 0, advance to next column
  useEffect(() => {
    if (showColIntro && introSeconds === 0) {
      useKecermatanStore.getState().advanceColumn();
      setShowColIntro(false);
      setIntroSeconds(INTRO_SECONDS);
    }
  }, [showColIntro, introSeconds]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  function handleAnswer(qid: string, colIdx: number, choice: string) {
    if (store.answers[qid]) return;
    store.setAnswer(qid, choice);
    logsBuffer.current.push({
      question_id: qid,
      column_index: colIdx + 1,
      clicked_at_ms: Date.now(),
      response_value: choice,
    });
    if (logsBuffer.current.length >= FLUSH_THRESHOLD) flushLogs();

    // Auto-advance to next question or next column
    const { currentRowIdx } = useKecermatanStore.getState();
    const totalInCol = columns[colIdx]?.length ?? 50;
    if (currentRowIdx >= totalInCol - 1) {
      advanceRef.current();
    } else {
      useKecermatanStore.getState().advanceRow();
    }
  }

  function doResume() {
    useKecermatanStore.getState().init(sessionId, moduleSessionId, resumeCol, 0, resumeMs);
    setShowResume(false);
  }

  function doFreshStart() {
    useKecermatanStore.getState().init(sessionId, moduleSessionId, 0, 0, COLUMN_DURATION_MS, true);
    setShowResume(false);
  }

  // ── Derived state ─────────────────────────────────────────────────────────────

  const { status, currentColIdx, currentRowIdx, columnRemainingMs, answers } = store;
  const colQuestions = columns[currentColIdx] ?? [];
  const currentQ = colQuestions[Math.min(currentRowIdx, colQuestions.length - 1)] ?? null;
  const payload = currentQ?.options_payload as unknown as KecermatanOptionsPayload | null;
  const symbolMap = payload?.symbol_map ?? { A: "?", B: "?", C: "?", D: "?", E: "?" };
  const picked = currentQ ? answers[currentQ.id] : undefined;
  const secondsLeft = Math.ceil(columnRemainingMs / 1000);
  const timerPct = Math.max(0, (columnRemainingMs / COLUMN_DURATION_MS) * 100);
  const lowTime = secondsLeft <= 10;
  const answeredInCol = colQuestions.filter((q) => answers[q.id]).length;

  // Column shown in nav: during intro, show the about-to-start column
  const activeTabIdx = showColIntro ? nextColIdx : currentColIdx;

  // Intro column's symbol map (for the transition screen)
  const introColPayload = columns[nextColIdx]?.[0]?.options_payload as unknown as KecermatanOptionsPayload | null;
  const introSymbolMap: Partial<Record<"A"|"B"|"C"|"D"|"E", string>> = introColPayload?.symbol_map ?? {};

  // ── Early returns ─────────────────────────────────────────────────────────────

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-slate-500 text-sm">Memuat...</div>
      </div>
    );
  }

  if (status === "completed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white gap-4">
        <div className="text-5xl">✓</div>
        <h2 className="text-2xl font-semibold">Sub-Tes Kecermatan Selesai</h2>
        <p className="text-slate-400 text-sm">Seluruh 10 lajur telah diselesaikan.</p>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Offline overlay */}
      {isOffline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-xs text-center space-y-3">
            <div className="text-4xl">📡</div>
            <h2 className="text-lg font-semibold text-red-600">Koneksi Terputus</h2>
            <p className="text-slate-500 text-sm">Timer tetap berjalan.</p>
          </div>
        </div>
      )}

      {/* Resume modal */}
      {showResume && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 space-y-5 shadow-xl">
            <h2 className="text-xl font-semibold">Lanjutkan Sesi?</h2>
            <p className="text-slate-500 text-sm">
              Sesi sebelumnya terdeteksi di Lajur {resumeCol + 1}, sisa {Math.ceil(resumeMs / 1000)} detik.
            </p>
            <div className="flex gap-3">
              <button onClick={doResume}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors">
                Lanjutkan
              </button>
              <button onClick={doFreshStart}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl py-2.5 text-sm font-semibold transition-colors">
                Mulai Ulang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Top navbar (dark navy) ──────────────────────────────────────────── */}
      <header className="bg-[#1e2d4a] text-white">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium tracking-wider uppercase">Psiko CAT</p>
            <p className="text-sm font-semibold">Psiko Kecermatan</p>
          </div>
          <p className="text-sm text-slate-300">
            Peserta: <span className="font-semibold text-white">Peserta</span>
          </p>
        </div>

        {/* Column tabs row */}
        <div className="border-t border-white/10">
          <div className="max-w-4xl mx-auto px-4 flex items-center gap-1 py-1.5">
            {ROMAN.map((r, i) => {
              const isPast = i < (showColIntro ? nextColIdx : currentColIdx);
              const isActive = i === activeTabIdx;
              return (
                <div
                  key={i}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                    isActive
                      ? "bg-amber-500 text-slate-900"
                      : isPast
                      ? "text-slate-500"
                      : "text-slate-600"
                  }`}
                >
                  {r}
                </div>
              );
            })}
            {showColIntro && introSeconds > 0 && (
              <span className="ml-auto text-xs text-slate-400">
                pindah dalam <span className="text-amber-400 font-semibold">{introSeconds}d</span>
              </span>
            )}
          </div>
        </div>

        {/* Timer bar */}
        {!showColIntro && (
          <div className="h-1 bg-white/10">
            <div
              className={`h-full transition-all duration-100 ${
                lowTime ? "bg-red-400" : secondsLeft <= 20 ? "bg-yellow-400" : "bg-emerald-400"
              }`}
              style={{ width: `${timerPct}%` }}
            />
          </div>
        )}
      </header>

      {/* ── Column intro screen ─────────────────────────────────────────────── */}
      {showColIntro && (
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
            {/* Intro header (dark navy) */}
            <div className="bg-[#1e2d4a] px-8 py-8 text-white">
              <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">
                KOLOM {ROMAN[nextColIdx]} DARI {ROMAN[TOTAL_COLS - 1]}
              </p>
              <h2 className="text-3xl font-serif font-bold">Kolom {ROMAN[nextColIdx]}</h2>
              <p className="text-slate-400 text-sm mt-1">Pelajari tabel kunci — akan selalu tampil saat tes</p>
            </div>

            <div className="px-8 py-6 space-y-6">
              {/* Key table */}
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">
                  Tabel Kunci Jawaban
                </p>
                <table className="w-full border-collapse rounded-xl overflow-hidden border border-slate-200">
                  <thead>
                    <tr className="bg-[#1e2d4a] text-white">
                      {(["A", "B", "C", "D", "E"] as const).map((k) => (
                        <th key={k} className="py-3 text-center text-sm font-bold border-r border-white/10 last:border-r-0">
                          {k}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-slate-50">
                      {(["A", "B", "C", "D", "E"] as const).map((k) => (
                        <td key={k} className="py-4 text-center text-2xl border-r border-slate-200 last:border-r-0">
                          {introSymbolMap[k] ?? "?"}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Instructions */}
              <div className="bg-amber-50 border-l-4 border-amber-400 px-5 py-4 rounded-r-xl text-sm text-slate-700 leading-relaxed">
                <strong>Total: 50 butir</strong> per kolom<br />
                Pilih simbol yang <strong className="text-amber-700">tidak ada</strong> pada baris soal. Jawab soal terakhir lalu kolom berikutnya dimulai otomatis.
              </div>

              {/* Countdown */}
              <div className="text-center py-4">
                <p className="text-6xl font-bold text-amber-500 leading-none">{introSeconds}</p>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mt-2">
                  Kolom Dimulai Otomatis...
                </p>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ── Question view ───────────────────────────────────────────────────── */}
      {!showColIntro && currentQ && (
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
            {/* Question card header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  SOAL {currentRowIdx + 1}/50
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-lg font-semibold">Soal {currentRowIdx + 1}</p>
                  <span className={`text-sm font-mono font-bold ${lowTime ? "text-red-500 animate-pulse" : "text-slate-600"}`}>
                    {secondsLeft}s
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full font-semibold">
                  KOLOM {ROMAN[currentColIdx]} ({currentColIdx + 1}/10)
                </span>
                <p className="text-xs text-slate-400 mt-1">{answeredInCol}/50 terjawab</p>
              </div>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* PETUNJUK SOAL — key table */}
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">
                  Petunjuk Soal
                </p>
                <table className="w-full border-collapse rounded-xl overflow-hidden border border-slate-200">
                  <thead>
                    <tr className="bg-[#1e2d4a] text-white">
                      {(["A", "B", "C", "D", "E"] as const).map((k) => (
                        <th key={k} className="py-2.5 text-center text-sm font-bold border-r border-white/10 last:border-r-0">
                          {k}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-slate-50">
                      {(["A", "B", "C", "D", "E"] as const).map((k) => (
                        <td key={k} className="py-3 text-center text-xl border-r border-slate-200 last:border-r-0">
                          {symbolMap[k]}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* SOAL — 4 shown symbols */}
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Soal</p>
                <div className="grid grid-cols-4 gap-3">
                  {payload?.shown.map((sym, i) => (
                    <div key={i}
                      className="flex items-center justify-center h-16 bg-slate-50 border border-slate-200 rounded-xl text-3xl">
                      {sym}
                    </div>
                  ))}
                </div>
              </div>

              {/* JAWABAN ANDA */}
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Jawaban Anda</p>
                <div className="grid grid-cols-5 gap-2">
                  {(["A", "B", "C", "D", "E"] as const).map((ch) => (
                    <button
                      key={ch}
                      onClick={() => handleAnswer(currentQ.id, currentColIdx, ch)}
                      disabled={!!picked}
                      className={`flex items-center justify-center h-14 rounded-xl text-base font-bold transition-all ${
                        picked === ch
                          ? "bg-[#1e2d4a] text-white shadow-md"
                          : picked
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-white border-2 border-slate-200 text-slate-700 hover:border-[#1e2d4a] hover:text-[#1e2d4a] hover:bg-slate-50 cursor-pointer"
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Finish button */}
            <div className="px-6 pb-6">
              <button
                onClick={() => advanceRef.current()}
                className="w-full py-3.5 border-2 border-red-500 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors tracking-wider uppercase"
              >
                Selesaikan Ujian Sekarang &amp; Lanjut
              </button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
