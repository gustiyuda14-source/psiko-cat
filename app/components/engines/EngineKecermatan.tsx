"use client";

import { useEffect, useMemo, useRef, useCallback, useState, useSyncExternalStore } from "react";
import type {
  SafeQuestion,
  KecermatanOptionsPayload,
  RecoverySnapshot,
} from "@/lib/types/safe-question";
import { useKecermatanStore, COLUMN_DURATION_MS } from "@/lib/stores/kecermatan-store";
import {
  ExamCompleted,
  ExamLoading,
  OfflineNotice,
  ResumeDialog,
  SaveErrorNotice,
} from "@/app/components/ExamChrome";
import type { SaveState } from "@/lib/hooks/use-exam-engine";
import { Button, ConfirmDialog } from "@/app/components/ui-client";
import { Timer } from "@/app/components/icons";
import { useExamKeyboard } from "@/lib/hooks/use-exam-keyboard";
import {
  KecermatanKeyStrip,
  KECERMATAN_KEYS,
  type KecermatanKey,
} from "@/app/components/KecermatanKeyStrip";

const FLUSH_THRESHOLD = 20;
const HEARTBEAT_MS = 30_000;
const TOTAL_COLS = 10;
const INTRO_SECONDS = 5;
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

const subscribeMounted = () => () => {};

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
  const mounted = useSyncExternalStore(subscribeMounted, () => true, () => false);
  const [showResume, setShowResume] = useState(false);
  const [isOffline, setIsOffline] = useState(
    () => typeof navigator !== "undefined" && !navigator.onLine
  );
  const [resumeCol, setResumeCol] = useState(0);
  const [resumeRow, setResumeRow] = useState(0);
  const [resumeMs, setResumeMs] = useState(COLUMN_DURATION_MS);
  const [showColIntro, setShowColIntro] = useState(false);
  const [introSeconds, setIntroSeconds] = useState(INTRO_SECONDS);
  const [nextColIdx, setNextColIdx] = useState(1);
  const [showSkip, setShowSkip] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [saveError, setSaveError] = useState("");
  const [displayRemainingMs, setDisplayRemainingMs] = useState(COLUMN_DURATION_MS);

  const store = useKecermatanStore();

  const activeFlush = useRef<Promise<boolean> | null>(null);
  const advancing = useRef(false);
  const completed = useRef(false);
  const lastHeartbeat = useRef(0);

  const columns = useMemo(
    () =>
      Array.from({ length: TOTAL_COLS }, (_, i) =>
        questions
          .filter((q) => q.column_index === i + 1)
          .sort((a, b) => a.sequence_number - b.sequence_number)
      ),
    [questions]
  );

  // ── API helpers ──────────────────────────────────────────────────────────────

  const flushLogs = useCallback((): Promise<boolean> => {
    if (activeFlush.current) return activeFlush.current;
    const batch = Object.values(useKecermatanStore.getState().pendingLogs);
    if (!batch.length) {
      setSaveState("saved");
      return Promise.resolve(true);
    }
    setSaveState("saving");
    setSaveError("");
    const request = (async () => {
      try {
        const response = await fetch("/api/kecermatan/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            module_session_id: moduleSessionId,
            logs: batch,
          }),
        });
        if (!response.ok) throw new Error(`Server menolak log (${response.status})`);
        useKecermatanStore.getState().acknowledgeLogs(batch);
        setSaveState(
          Object.keys(useKecermatanStore.getState().pendingLogs).length ? "pending" : "saved"
        );
        return true;
      } catch (error) {
        setSaveState("error");
        setSaveError(error instanceof Error ? error.message : "Klik belum tersimpan");
        return false;
      } finally {
        activeFlush.current = null;
      }
    })();
    activeFlush.current = request;
    return request;
  }, [moduleSessionId, sessionId]);

  const syncHeartbeat = useCallback(async () => {
    const s = useKecermatanStore.getState();
    const remainingMs = Math.max(
      0,
      (s.columnDeadlineTs ?? Date.now() + s.columnRemainingMs) - Date.now()
    );
    try {
      const response = await fetch(`/api/sessions/${sessionId}/sync`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module_session_id: moduleSessionId,
          current_question_index: s.currentColIdx * 50 + s.currentRowIdx,
          current_column_index: s.currentColIdx + 1,
          column_remaining_ms: remainingMs,
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }, [moduleSessionId, sessionId]);

  // Called when a column ends (timer=0 or all rows answered)
  const handleAdvance = useCallback(async () => {
    if (advancing.current || completed.current) return;
    advancing.current = true;
    const saved = await flushLogs();
    if (!saved || Object.keys(useKecermatanStore.getState().pendingLogs).length) {
      setSaveState("error");
      setSaveError("Klik terakhir belum diterima server. Kirim ulang sebelum melanjutkan.");
      advancing.current = false;
      return;
    }
    const { currentColIdx } = useKecermatanStore.getState();
    if (currentColIdx >= TOTAL_COLS - 1) {
      try {
        const response = await fetch(
          `/api/sessions/${sessionId}/modules/${moduleSessionId}/complete`,
          { method: "POST" }
        );
        if (!response.ok) throw new Error(`Gagal menyelesaikan sub-tes (${response.status})`);
        completed.current = true;
        useKecermatanStore.getState().setStatus("completed");
        onComplete?.();
      } catch (error) {
        setSaveState("error");
        setSaveError(error instanceof Error ? error.message : "Sub-tes belum selesai");
      }
    } else {
      setNextColIdx(currentColIdx + 1);
      setIntroSeconds(INTRO_SECONDS);
      setShowColIntro(true);
    }
    advancing.current = false;
  }, [flushLogs, moduleSessionId, onComplete, sessionId]);

  const advanceRef = useRef(handleAdvance);
  useEffect(() => { advanceRef.current = handleAdvance; }, [handleAdvance]);

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  useEffect(() => {
    const on = () => {
      setIsOffline(false);
      void flushLogs();
    };
    const off = () => setIsOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, [flushLogs]);

  useEffect(() => {
    if (store.status !== "running") return;
    const guard = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    const sendPending = () => {
      const logs = Object.values(useKecermatanStore.getState().pendingLogs);
      if (!logs.length) return;
      navigator.sendBeacon(
        "/api/kecermatan/log",
        new Blob(
          [JSON.stringify({ session_id: sessionId, module_session_id: moduleSessionId, logs })],
          { type: "application/json" }
        )
      );
    };
    window.addEventListener("beforeunload", guard);
    window.addEventListener("pagehide", sendPending);
    return () => {
      window.removeEventListener("beforeunload", guard);
      window.removeEventListener("pagehide", sendPending);
    };
  }, [moduleSessionId, sessionId, store.status]);

  useEffect(() => {
    if (!mounted) return;
    const s = useKecermatanStore.getState();
    if (s.sessionId === sessionId && s.moduleSessionId === moduleSessionId && s.status === "running") {
      if (s.columnDeadlineTs == null) {
        useKecermatanStore.getState().init(
          sessionId,
          moduleSessionId,
          s.currentColIdx,
          s.currentRowIdx,
          s.columnRemainingMs
        );
      }
      if (Object.keys(s.pendingLogs).length) {
        queueMicrotask(() => {
          setSaveState("pending");
          void flushLogs();
        });
      }
      return;
    }
    if (initialSnapshot?.current_column_index != null && initialSnapshot.current_column_index > 0) {
      let col = Math.min(initialSnapshot.current_column_index - 1, TOTAL_COLS - 1);
      let ms =
        (initialSnapshot.column_remaining_ms ?? COLUMN_DURATION_MS) -
        Math.max(0, Date.now() - initialSnapshot.snapshot_at);
      while (ms <= 0 && col < TOTAL_COLS - 1) {
        col += 1;
        ms += COLUMN_DURATION_MS;
      }
      queueMicrotask(() => {
        setResumeCol(col);
        setResumeRow(
          Math.max(0, Math.min(49, initialSnapshot.current_question_index - col * 50))
        );
        setResumeMs(Math.max(0, ms));
        setShowResume(true);
      });
      return;
    }
    useKecermatanStore.getState().init(sessionId, moduleSessionId, 0, 0, COLUMN_DURATION_MS, true);
    void syncHeartbeat();
  }, [flushLogs, initialSnapshot, moduleSessionId, mounted, sessionId, syncHeartbeat]);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    void (async () => {
      try {
        const query = new URLSearchParams({
          session_id: sessionId,
          module_session_id: moduleSessionId,
        });
        const response = await fetch(`/api/kecermatan/log?${query}`);
        if (!response.ok) return;
        const data = (await response.json()) as {
          logs?: Array<{ question_id: string; response_value: string }>;
        };
        if (cancelled) return;
        const serverAnswers = Object.fromEntries(
          (data.logs ?? []).map((log) => [log.question_id, log.response_value])
        );
        const localAnswers = useKecermatanStore.getState().answers;
        useKecermatanStore.getState().replaceAnswers({ ...serverAnswers, ...localAnswers });
      } catch {
        setIsOffline(!navigator.onLine);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [moduleSessionId, mounted, sessionId]);

  // Column timer — restarts when column changes or showColIntro toggles off
  useEffect(() => {
    if (store.status !== "running" || showColIntro) return;
    const current = useKecermatanStore.getState();
    const deadline = current.columnDeadlineTs ?? Date.now() + current.columnRemainingMs;
    const tick = () => {
      const remaining = Math.max(0, deadline - Date.now());
      setDisplayRemainingMs(remaining);
      const now = Date.now();
      if (now - lastHeartbeat.current >= HEARTBEAT_MS) {
        lastHeartbeat.current = now;
        void syncHeartbeat();
      }
      if (remaining <= 0) {
        clearInterval(interval);
        useKecermatanStore.getState().setColumnRemaining(0);
        void advanceRef.current();
      }
    };
    queueMicrotask(tick);
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [store.status, store.currentColIdx, store.columnDeadlineTs, showColIntro, syncHeartbeat]);

  // Intro countdown
  useEffect(() => {
    if (!showColIntro) return;
    let remaining = INTRO_SECONDS;
    const interval = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(interval);
        useKecermatanStore.getState().advanceColumn();
        setShowColIntro(false);
        setIntroSeconds(INTRO_SECONDS);
      } else {
        setIntroSeconds(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [showColIntro]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  // Membaca state lewat getState(), bukan lewat `store` hasil subscribe, supaya
  // identitas callback tidak berubah tiap tick timer 100ms — listener keyboard
  // di bawah bergantung padanya.
  const handleAnswer = useCallback(
    (qid: string, colIdx: number, choice: string) => {
      const s = useKecermatanStore.getState();
      if (s.answers[qid]) return;
      s.setAnswer(qid, choice);
      useKecermatanStore.getState().queueLog({
        question_id: qid,
        clicked_at_ms: Date.now(),
        response_value: choice,
      });
      setSaveState("pending");
      setSaveError("");
      if (Object.keys(useKecermatanStore.getState().pendingLogs).length >= FLUSH_THRESHOLD) {
        void flushLogs();
      }

      // Auto-advance to next question or next column
      const { currentRowIdx } = useKecermatanStore.getState();
      const totalInCol = columns[colIdx]?.length ?? 50;
      if (currentRowIdx >= totalInCol - 1) {
        void advanceRef.current();
      } else {
        useKecermatanStore.getState().advanceRow();
      }
    },
    [columns, flushLogs]
  );

  function doResume() {
    useKecermatanStore.getState().init(sessionId, moduleSessionId, resumeCol, resumeRow, resumeMs);
    setShowResume(false);
    void syncHeartbeat();
  }

  function doFreshStart() {
    useKecermatanStore.getState().init(sessionId, moduleSessionId, resumeCol, 0, resumeMs);
    setShowResume(false);
    void syncHeartbeat();
  }

  // ── Derived state ─────────────────────────────────────────────────────────────

  const { status, currentColIdx, currentRowIdx, answers } = store;
  const colQuestions = columns[currentColIdx] ?? [];
  const currentQ = colQuestions[Math.min(currentRowIdx, colQuestions.length - 1)] ?? null;
  const payload = currentQ?.options_payload as unknown as KecermatanOptionsPayload | null;
  const symbolMap = payload?.symbol_map ?? { A: "?", B: "?", C: "?", D: "?", E: "?" };
  const picked = currentQ ? answers[currentQ.id] : undefined;
  const secondsLeft = Math.ceil(displayRemainingMs / 1000);
  const timerRatio = Math.max(0, displayRemainingMs / COLUMN_DURATION_MS);
  const critical = secondsLeft <= 10;
  const warning = !critical && secondsLeft <= 20;
  const answeredInCol = colQuestions.filter((q) => answers[q.id]).length;
  const totalInCol = colQuestions.length || 50;
  const activeColIdx = showColIntro ? nextColIdx : currentColIdx;

  const introColPayload = columns[nextColIdx]?.[0]?.options_payload as unknown as KecermatanOptionsPayload | null;
  const introSymbolMap: Partial<Record<KecermatanKey, string>> = introColPayload?.symbol_map ?? {};

  const onChoose = useCallback(
    (key: string) => {
      const s = useKecermatanStore.getState();
      const col = columns[s.currentColIdx] ?? [];
      const q = col[Math.min(s.currentRowIdx, col.length - 1)];
      if (q) handleAnswer(q.id, s.currentColIdx, key);
    },
    [columns, handleAnswer]
  );

  useExamKeyboard({
    enabled: mounted && status === "running" && !showColIntro && !showResume && !showSkip,
    choiceKeys: KECERMATAN_KEYS as unknown as string[],
    onChoose,
  });

  // ── Early returns ─────────────────────────────────────────────────────────────

  if (!mounted) return <ExamLoading label="Menyiapkan kolom simbol" />;

  if (status === "completed") {
    return (
      <ExamCompleted
        title="Sub-Tes Kecermatan selesai"
        note="Sepuluh kolom sudah dikerjakan dan seluruh klik tercatat di server."
      />
    );
  }

  const isLastCol = currentColIdx >= TOTAL_COLS - 1;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      {isOffline && <OfflineNotice />}

      <ResumeDialog
        open={showResume}
        itemLabel="Kolom"
        resumeIndex={resumeCol}
        onResume={doResume}
        onFreshStart={doFreshStart}
      />

      <ConfirmDialog
        open={showSkip}
        onClose={() => setShowSkip(false)}
        onConfirm={() => {
          setShowSkip(false);
          void advanceRef.current();
        }}
        title={isLastCol ? "Selesaikan sub-tes sekarang?" : `Lewati sisa Kolom ${ROMAN[currentColIdx]}?`}
        confirmLabel={isLastCol ? "Ya, selesaikan" : "Ya, lanjut kolom berikutnya"}
        tone="danger"
      >
        <p className="text-muted-foreground">
          Baru{" "}
          <span className="tnum font-semibold text-foreground">
            {answeredInCol} dari {totalInCol}
          </span>{" "}
          butir di kolom ini yang dijawab. Sisanya dihitung sebagai tidak dijawab dan tidak bisa
          dikerjakan ulang.
        </p>
      </ConfirmDialog>

      {/* ── Header: satu baris, satu timer ────────────────────────────────────
          Versi sebelumnya menumpuk tiga baris chrome (judul, deretan angka
          romawi, bar timer) lalu mengulang angka detik yang sama di dalam kartu
          soal. Di modul 1,2 detik per butir, chrome itu memakan ruang yang
          seharusnya jadi ruang baca. */}
      <header className="on-nav sticky top-0 z-30 bg-surface-nav text-white shadow-e3">
        <div className="mx-auto flex min-h-14 max-w-3xl items-center justify-between gap-4 px-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Sub-Tes Kecermatan</p>
            <p className="truncate text-xs text-white/70">
              Kolom {ROMAN[activeColIdx]}
              <span className="tnum"> · {activeColIdx + 1}/{TOTAL_COLS}</span>
              <span className="hidden sm:inline"> · {participantName}</span>
              <span className="hidden sm:inline">
                {saveState === "saved"
                  ? " · Tersimpan"
                  : saveState === "saving"
                    ? " · Menyimpan…"
                    : saveState === "error"
                      ? " · Belum tersimpan"
                      : ` · ${Object.keys(store.pendingLogs).length} menunggu`}
              </span>
            </p>
          </div>
          <div
            className={`flex shrink-0 items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors duration-200 ease-out ${
              critical && !showColIntro ? "bg-accent text-primary" : "bg-white/8 text-white"
            }`}
          >
            <Timer className="size-4" />
            <span className="sr-only">{showColIntro ? "Kolom dimulai dalam" : "Sisa waktu kolom"}</span>
            <span className={`tnum text-lg font-bold ${warning ? "text-accent" : ""}`}>
              {showColIntro ? introSeconds : secondsLeft}
              <span className="ml-0.5 text-xs font-semibold opacity-80">dtk</span>
            </span>
          </div>
        </div>

        {/* Sepuluh segmen kemajuan kolom. Sebelumnya ini deretan <div> yang
            tampak seperti tab padahal tidak bisa diklik — afordans yang
            berbohong. Sekarang bentuknya jelas indikator, bukan kontrol. */}
        <div
          className="mx-auto flex max-w-3xl gap-1 px-4 pb-2"
          role="img"
          aria-label={`Kolom ${activeColIdx + 1} dari ${TOTAL_COLS}`}
        >
          {ROMAN.map((_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i < activeColIdx ? "bg-white/45" : i === activeColIdx ? "bg-accent" : "bg-white/12"
              }`}
            />
          ))}
        </div>

        {!showColIntro && (
          <div
            className="h-0.5 bg-white/12"
            role="progressbar"
            aria-label="Sisa waktu kolom"
            aria-valuenow={secondsLeft}
            aria-valuemin={0}
            aria-valuemax={COLUMN_DURATION_MS / 1000}
          >
            <div
              className={`h-full origin-left transition-transform duration-100 ease-linear ${
                critical ? "bg-destructive" : warning ? "bg-accent" : "bg-success"
              }`}
              style={{ transform: `scaleX(${timerRatio})` }}
            />
          </div>
        )}
      </header>
      {saveError && (
        <SaveErrorNotice message={saveError} onRetry={() => void flushLogs()} />
      )}

      {/* ── Layar transisi antar kolom ───────────────────────────────────────── */}
      {showColIntro && (
        <main className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
          <div className="surface-panel enter-rise overflow-hidden">
            <div className="border-b border-border px-5 py-5 sm:px-7">
              <h2 className="font-heading text-2xl text-foreground">Kolom {ROMAN[nextColIdx]}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Kunci simbol berganti tiap kolom. Hafalkan pasangan huruf dan simbol di bawah —
                tabel ini tetap tampil selama kolom berjalan.
              </p>
            </div>

            <div className="space-y-6 px-5 py-6 sm:px-7">
              <KecermatanKeyStrip symbolMap={introSymbolMap} size="lg" />

              <p className="text-sm leading-relaxed text-muted-foreground">
                Tiap butir menampilkan empat simbol. Pilih huruf dari simbol yang{" "}
                <strong className="font-semibold text-foreground">tidak muncul</strong>. Kolom ini
                berisi <span className="tnum font-semibold text-foreground">50 butir</span> dalam{" "}
                <span className="tnum font-semibold text-foreground">60 detik</span>.
              </p>

              <div className="inset-panel flex flex-col items-center gap-1 px-5 py-6">
                <p className="tnum font-heading text-5xl text-primary">{introSeconds}</p>
                <p className="text-xs font-medium text-muted-foreground">
                  Kolom dimulai otomatis
                </p>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ── Butir soal ───────────────────────────────────────────────────────── */}
      {!showColIntro && currentQ && (
        <main className="mx-auto max-w-3xl px-4 py-4 sm:py-6">
          <div className="surface-card overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5 sm:px-6">
              <h2 className="tnum text-sm font-semibold text-foreground">
                Butir {currentRowIdx + 1}
                <span className="font-normal text-muted-foreground"> / {totalInCol}</span>
              </h2>
              <p className="tnum text-xs text-muted-foreground">{answeredInCol} terjawab</p>
            </div>

            {/* Kunci, soal, dan jawaban dibungkus satu lebar yang sama supaya
                perbandingan simbol jadi gerakan mata vertikal, bukan menyapu
                kiri-kanan tiap butir. */}
            <div className="mx-auto max-w-lg space-y-5 px-4 py-5 sm:px-6 sm:py-6">
              <KecermatanKeyStrip symbolMap={symbolMap} />

              <div key={currentQ.id} className="question-enter grid grid-cols-4 gap-2" aria-label={`Simbol kolom ${currentColIdx + 1}, butir ${currentRowIdx + 1}`}>
                {payload?.shown.map((sym, i) => (
                  <div
                    key={i}
                    className="flex h-16 items-center justify-center rounded-md border border-border bg-surface-inset text-3xl"
                  >
                    {sym}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {KECERMATAN_KEYS.map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => handleAnswer(currentQ.id, currentColIdx, ch)}
                    disabled={Boolean(picked)}
                    aria-label={`Jawab ${ch}`}
                    className={`flex h-14 items-center justify-center rounded-md text-base font-bold transition-[background-color,border-color,transform] duration-100 ease-out ${
                      picked === ch
                        ? "bg-primary text-primary-foreground"
                        : picked
                          ? "bg-surface-inset text-faint-foreground"
                          : "border-2 border-border bg-card text-foreground hover:border-primary hover:bg-primary/6 active:translate-y-px"
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Tekan <kbd className="font-mono font-semibold text-foreground">A</kbd>–
                <kbd className="font-mono font-semibold text-foreground">E</kbd> di keyboard untuk
                menjawab lebih cepat.
              </p>
            </div>

            <div className="border-t border-border px-4 py-3 sm:px-6">
              <Button variant="danger" block onClick={() => setShowSkip(true)}>
                {isLastCol ? "Selesaikan sub-tes" : `Lewati sisa Kolom ${ROMAN[currentColIdx]}`}
              </Button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
