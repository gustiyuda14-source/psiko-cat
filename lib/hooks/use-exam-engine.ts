"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { UseBoundStore, StoreApi } from "zustand";
import type { ExamState } from "@/lib/stores/exam-store";
import type { RecoverySnapshot } from "@/lib/types/safe-question";

const FLUSH_THRESHOLD = 5;
const HEARTBEAT_MS = 30_000;

type ExamStore = UseBoundStore<StoreApi<ExamState>>;

type AnswerPayload = {
  question_id: string;
  selected_key: string;
  column_index?: number;
};

type Args = {
  store: ExamStore;
  sessionId: string;
  moduleSessionId: string;
  timeLimitSeconds: number;
  startedAt?: string | null; // ISO — jika ada, modul sudah berjalan di server
  initialSnapshot?: RecoverySnapshot | null;
  totalQuestions: number;
  onComplete?: () => void;
};

export function useExamEngine({
  store,
  sessionId,
  moduleSessionId,
  timeLimitSeconds,
  startedAt,
  initialSnapshot,
  totalQuestions,
  onComplete,
}: Args) {
  const [mounted, setMounted] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [resumeIndex, setResumeIndex] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(timeLimitSeconds);

  const state = store();

  const answersBuffer = useRef<AnswerPayload[]>([]);
  const isFlushing = useRef(false);
  const lastHeartbeat = useRef(Date.now());
  const sidRef = useRef(sessionId);
  const msidRef = useRef(moduleSessionId);
  sidRef.current = sessionId;
  msidRef.current = moduleSessionId;

  // ── API helpers ────────────────────────────────────────────────────────────

  const flushAnswers = useCallback(async () => {
    if (isFlushing.current || answersBuffer.current.length === 0) return;
    isFlushing.current = true;
    const batch = answersBuffer.current.splice(0);
    try {
      await fetch(
        `/api/sessions/${sidRef.current}/modules/${msidRef.current}/answers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: batch }),
        }
      );
    } catch {
      answersBuffer.current = [...batch, ...answersBuffer.current];
    } finally {
      isFlushing.current = false;
    }
  }, []);

  const flushRef = useRef(flushAnswers);
  useEffect(() => { flushRef.current = flushAnswers; }, [flushAnswers]);

  const syncHeartbeat = useCallback(async () => {
    const s = store.getState();
    try {
      await fetch(`/api/sessions/${sidRef.current}/sync`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module_session_id: msidRef.current,
          current_question_index: s.currentIndex,
          current_column_index: null,
          column_remaining_ms: null,
        }),
      });
    } catch {}
  }, [store]);

  const finish = useCallback(async () => {
    await flushRef.current();
    // Mark module as COMPLETED in DB
    try {
      await fetch(
        `/api/sessions/${sidRef.current}/modules/${msidRef.current}/complete`,
        { method: "POST" }
      );
    } catch {}
    store.getState().setStatus("completed");
    onComplete?.();
  }, [store, onComplete]);

  const finishRef = useRef(finish);
  useEffect(() => { finishRef.current = finish; }, [finish]);

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  useEffect(() => { setMounted(true); }, []);

  // Online / offline
  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const on = () => setIsOffline(false);
    const off = () => setIsOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  // beforeunload guard
  useEffect(() => {
    if (state.status !== "running") return;
    const guard = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [state.status]);

  // Init / resume detection
  useEffect(() => {
    if (!mounted) return;
    const s = store.getState();

    // Reload of a live session in this browser — continue silently
    if (
      s.sessionId === sessionId &&
      s.moduleSessionId === moduleSessionId &&
      s.status === "running" &&
      s.deadlineTs != null
    ) return;

    // Server says module already started → offer resume
    if (startedAt) {
      const deadline = new Date(startedAt).getTime() + timeLimitSeconds * 1000;
      if (deadline > Date.now()) {
        setResumeIndex(initialSnapshot?.current_question_index ?? 0);
        setShowResume(true);
        return;
      }
    }

    // Fresh start
    store.getState().init({
      sid: sessionId,
      msid: moduleSessionId,
      deadlineTs: Date.now() + timeLimitSeconds * 1000,
      index: 0,
      fresh: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, sessionId, moduleSessionId]);

  // Timer — deadline based, recompute each tick (no drift on long timers)
  useEffect(() => {
    if (state.status !== "running") return;

    const tick = () => {
      const s = store.getState();
      if (s.deadlineTs == null) return;
      const left = Math.max(0, Math.ceil((s.deadlineTs - Date.now()) / 1000));
      setSecondsLeft(left);

      const now = Date.now();
      if (now - lastHeartbeat.current >= HEARTBEAT_MS) {
        lastHeartbeat.current = now;
        syncHeartbeat();
      }

      if (left <= 0) finishRef.current();
    };

    tick();
    const interval = setInterval(tick, 500);
    return () => clearInterval(interval);
  }, [state.status, store, syncHeartbeat]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleAnswer = useCallback(
    (qid: string, key: string) => {
      store.getState().setAnswer(qid, key);
      answersBuffer.current.push({ question_id: qid, selected_key: key });
      if (answersBuffer.current.length >= FLUSH_THRESHOLD) flushRef.current();
    },
    [store]
  );

  const doResume = useCallback(() => {
    const deadline = startedAt
      ? new Date(startedAt).getTime() + timeLimitSeconds * 1000
      : Date.now() + timeLimitSeconds * 1000;
    store.getState().init({
      sid: sessionId,
      msid: moduleSessionId,
      deadlineTs: deadline,
      index: Math.min(resumeIndex, totalQuestions - 1),
      fresh: false,
    });
    setShowResume(false);
  }, [store, sessionId, moduleSessionId, startedAt, timeLimitSeconds, resumeIndex, totalQuestions]);

  const doFreshStart = useCallback(() => {
    store.getState().init({
      sid: sessionId,
      msid: moduleSessionId,
      deadlineTs: Date.now() + timeLimitSeconds * 1000,
      index: 0,
      fresh: true,
    });
    setShowResume(false);
  }, [store, sessionId, moduleSessionId, timeLimitSeconds]);

  return {
    mounted,
    isOffline,
    showResume,
    resumeIndex,
    secondsLeft,
    state,
    store,
    handleAnswer,
    finish,
    flushAnswers,
    doResume,
    doFreshStart,
  };
}
