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
  participantName: string;
  initialSnapshot?: RecoverySnapshot | null;
  onComplete?: () => void;
};

export default function EngineKecermatan({
  questions,
  moduleSessionId,
  sessionId,
  participantName,
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Memuat...</div>
      </div>
    );
  }

  if (status === "completed") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
        <div className="text-5xl">✓</div>
        <h2 className="text-2xl font-semibold">Sub-Tes Kecermatan Selesai</h2>
        <p className="text-sm text-muted-foreground">Seluruh 10 lajur telah diselesaikan.</p>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Offline overlay */}
      {isOffline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="max-w-xs space-y-3 rounded-2xl border border-destructive/30 bg-card p-8 text-center">
            <div className="text-4xl">📡</div>
            <h2 className="text-lg font-semibold text-destructive">Koneksi Terputus</h2>
            <p className="text-sm text-muted-foreground">Timer tetap berjalan.</p>
          </div>
        </div>
      )}

      {/* Resume modal */}
      {showResume && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-sm space-y-5 rounded-2xl border border-border bg-card p-8 text-foreground">
            <h2 className="text-xl font-semibold">Lanjutkan Sesi?</h2>
            <p className="text-sm text-muted-foreground">
              Sesi sebelumnya terdeteksi di Lajur {resumeCol + 1}, sisa {Math.ceil(resumeMs / 1000)} detik.
            </p>
            <div className="flex gap-3">
              <button onClick={doResume}
                className="min-h-11 flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                Lanjutkan
              </button>
              <button onClick={doFreshStart}
                className="min-h-11 flex-1 rounded-xl border border-border bg-card py-2.5 text-sm font-semibold transition-colors hover:bg-primary/7">
                Mulai Ulang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Top navbar ───────────────────────────────────────────────────────── */}
      <header className="bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/60">Psiko CAT</p>
            <p className="text-sm font-semibold">Psiko Kecermatan</p>
          </div>
          <p className="text-sm text-white/80">
            Peserta: <span className="font-semibold text-primary-foreground">{participantName}</span>
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
                      ? "bg-accent text-primary"
                      : isPast
                      ? "text-white/50"
                      : "text-white/35"
                  }`}
                >
                  {r}
                </div>
              );
            })}
            {showColIntro && introSeconds > 0 && (
              <span className="ml-auto text-xs text-white/60">
                pindah dalam <span className="font-semibold text-accent">{introSeconds}d</span>
              </span>
            )}
          </div>
        </div>

        {/* Timer bar */}
        {!showColIntro && (
          <div className="h-1 bg-white/10">
            <div
              className={`h-full transition-all duration-100 ${
                lowTime ? "bg-destructive" : secondsLeft <= 20 ? "bg-accent" : "bg-success"
              }`}
              style={{ width: `${timerPct}%` }}
            />
          </div>
        )}
      </header>

      {/* ── Column intro screen ─────────────────────────────────────────────── */}
      {showColIntro && (
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {/* Intro header */}
            <div className="bg-primary px-8 py-8 text-primary-foreground">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent">
                KOLOM {ROMAN[nextColIdx]} DARI {ROMAN[TOTAL_COLS - 1]}
              </p>
              <h2 className="font-heading text-3xl font-bold">Kolom {ROMAN[nextColIdx]}</h2>
              <p className="mt-1 text-sm text-white/60">Pelajari tabel kunci — akan selalu tampil saat tes</p>
            </div>

            <div className="px-8 py-6 space-y-6">
              {/* Key table */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tabel Kunci Jawaban
                </p>
                <table className="w-full overflow-hidden rounded-xl border border-border">
                  <thead>
                    <tr className="bg-primary text-primary-foreground">
                      {(["A", "B", "C", "D", "E"] as const).map((k) => (
                        <th key={k} className="py-3 text-center text-sm font-bold border-r border-white/10 last:border-r-0">
                          {k}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-primary/7">
                      {(["A", "B", "C", "D", "E"] as const).map((k) => (
                        <td key={k} className="border-r border-border py-4 text-center text-2xl last:border-r-0">
                          {introSymbolMap[k] ?? "?"}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Instructions */}
              <div className="rounded-r-xl border-l-4 border-accent bg-accent-soft px-5 py-4 text-sm leading-relaxed text-foreground">
                <strong>Total: 50 butir</strong> per kolom<br />
                Pilih simbol yang <strong>tidak ada</strong> pada baris soal. Jawab soal terakhir lalu kolom berikutnya dimulai otomatis.
              </div>

              {/* Countdown */}
              <div className="text-center py-4">
                <p className="text-6xl font-bold leading-none text-primary">{introSeconds}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
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
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {/* Question card header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  SOAL {currentRowIdx + 1}/50
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-lg font-semibold">Soal {currentRowIdx + 1}</p>
                  <span className={`font-mono tabular-nums text-sm font-bold ${lowTime ? "animate-pulse text-destructive" : "text-muted-foreground"}`}>
                    {secondsLeft}s
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="rounded-full bg-primary/7 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                  KOLOM {ROMAN[currentColIdx]} ({currentColIdx + 1}/10)
                </span>
                <p className="mt-1 text-xs text-muted-foreground">{answeredInCol}/50 terjawab</p>
              </div>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* PETUNJUK SOAL — key table */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Petunjuk Soal
                </p>
                <table className="w-full overflow-hidden rounded-xl border border-border">
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
                    <tr className="bg-primary/7">
                      {(["A", "B", "C", "D", "E"] as const).map((k) => (
                        <td key={k} className="border-r border-border py-3 text-center text-xl last:border-r-0">
                          {symbolMap[k]}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* SOAL — 4 shown symbols */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Soal</p>
                <div className="grid grid-cols-4 gap-3">
                  {payload?.shown.map((sym, i) => (
                    <div key={i}
                      className="flex h-16 items-center justify-center rounded-xl border border-border bg-primary/7 text-3xl">
                      {sym}
                    </div>
                  ))}
                </div>
              </div>

              {/* JAWABAN ANDA */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Jawaban Anda</p>
                <div className="grid grid-cols-5 gap-2">
                  {(["A", "B", "C", "D", "E"] as const).map((ch) => (
                    <button
                      key={ch}
                      onClick={() => handleAnswer(currentQ.id, currentColIdx, ch)}
                      disabled={!!picked}
                      className={`flex items-center justify-center h-14 rounded-xl text-base font-bold transition-all ${
                        picked === ch
                          ? "bg-primary text-primary-foreground"
                          : picked
                          ? "bg-primary/7 text-muted-foreground cursor-not-allowed"
                          : "border-2 border-border bg-card text-foreground hover:border-primary hover:bg-primary/7 cursor-pointer"
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
                onClick={() => {
                  const isLastCol = currentColIdx >= TOTAL_COLS - 1;
                  const msg = isLastCol
                    ? "Yakin ingin menyelesaikan Sub-Tes Kecermatan sekarang? Soal yang belum dijawab di lajur ini dihitung tidak dijawab."
                    : `Yakin ingin melewati sisa soal di Lajur ${ROMAN[currentColIdx]} dan lanjut ke lajur berikutnya? Soal yang belum dijawab dihitung tidak dijawab.`;
                  if (window.confirm(msg)) advanceRef.current();
                }}
                className="min-h-12 w-full rounded-xl border-2 border-destructive px-5 py-3.5 text-sm font-bold uppercase tracking-wider text-destructive transition-all duration-200 hover:-translate-y-0.5 hover:bg-destructive/10"
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
