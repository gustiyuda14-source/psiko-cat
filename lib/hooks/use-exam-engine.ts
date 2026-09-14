"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { UseBoundStore, StoreApi } from "zustand";
import type { ExamState } from "@/lib/stores/exam-store";
import type { RecoverySnapshot } from "@/lib/types/safe-question";

const FLUSH_THRESHOLD = 5;
const HEARTBEAT_MS = 30_000;

type ExamStore = UseBoundStore<StoreApi<ExamState>>;
export type SaveState = "saved" | "pending" | "saving" | "error";

type Args = {
  store: ExamStore;
  sessionId: string;
  moduleSessionId: string;
  timeLimitSeconds: number;
  startedAt?: string | null;
  initialSnapshot?: RecoverySnapshot | null;
  totalQuestions: number;
  onComplete?: () => void;
};

const subscribeMounted = () => () => {};

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
  const mounted = useSyncExternalStore(subscribeMounted, () => true, () => false);
  const [showResume, setShowResume] = useState(false);
  const [resumeIndex, setResumeIndex] = useState(0);
  const [isOffline, setIsOffline] = useState(
    () => typeof navigator !== "undefined" && !navigator.onLine
  );
  const [secondsLeft, setSecondsLeft] = useState(timeLimitSeconds);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [saveError, setSaveError] = useState("");
  const [pendingCount, setPendingCount] = useState(0);
  const state = store();

  const pendingAnswers = useRef(new Map<string, string>());
  const activeFlush = useRef<Promise<boolean> | null>(null);
  const finishing = useRef(false);
  const completed = useRef(false);
  const lastHeartbeat = useRef(0);

  const flushAnswers = useCallback((): Promise<boolean> => {
    if (activeFlush.current) return activeFlush.current;
    if (pendingAnswers.current.size === 0) {
      setSaveState("saved");
      return Promise.resolve(true);
    }

    const batch = [...pendingAnswers.current].map(([question_id, selected_key]) => ({
      question_id,
      selected_key,
    }));
    setSaveState("saving");
    setSaveError("");

    const request = (async () => {
      try {
        const response = await fetch(
          `/api/sessions/${sessionId}/modules/${moduleSessionId}/answers`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answers: batch }),
          }
        );
        if (!response.ok) throw new Error(`Server menolak jawaban (${response.status})`);
        for (const answer of batch) {
          if (pendingAnswers.current.get(answer.question_id) === answer.selected_key) {
            pendingAnswers.current.delete(answer.question_id);
          }
        }
        setPendingCount(pendingAnswers.current.size);
        setSaveState(pendingAnswers.current.size ? "pending" : "saved");
        return true;
      } catch (error) {
        setSaveState("error");
        setSaveError(error instanceof Error ? error.message : "Jawaban belum tersimpan");
        return false;
      } finally {
        activeFlush.current = null;
      }
    })();

    activeFlush.current = request;
    return request;
  }, [moduleSessionId, sessionId]);

  const syncHeartbeat = useCallback(async (): Promise<boolean> => {
    const current = store.getState();
    try {
      const response = await fetch(`/api/sessions/${sessionId}/sync`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module_session_id: moduleSessionId,
          current_question_index: current.currentIndex,
          current_column_index: null,
          column_remaining_ms: null,
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }, [moduleSessionId, sessionId, store]);

  const finish = useCallback(async (): Promise<boolean> => {
    if (finishing.current || completed.current) return false;
    finishing.current = true;
    try {
      for (let attempt = 0; attempt < 3 && pendingAnswers.current.size; attempt++) {
        const saved = await flushAnswers();
        if (!saved) await new Promise((resolve) => setTimeout(resolve, 500));
      }
      if (pendingAnswers.current.size) {
        setSaveState("error");
        setSaveError("Masih ada jawaban yang belum diterima server. Coba kirim ulang.");
        return false;
      }

      const response = await fetch(
        `/api/sessions/${sessionId}/modules/${moduleSessionId}/complete`,
        { method: "POST" }
      );
      if (!response.ok) throw new Error(`Gagal menyelesaikan sub-tes (${response.status})`);
      completed.current = true;
      store.getState().setStatus("completed");
      setSaveState("saved");
      onComplete?.();
      return true;
    } catch (error) {
      setSaveState("error");
      setSaveError(error instanceof Error ? error.message : "Sub-tes belum berhasil diselesaikan");
      return false;
    } finally {
      finishing.current = false;
    }
  }, [flushAnswers, moduleSessionId, onComplete, sessionId, store]);

  useEffect(() => {
    const online = () => {
      setIsOffline(false);
      void flushAnswers();
    };
    const offline = () => setIsOffline(true);
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, [flushAnswers]);

  useEffect(() => {
    if (state.status !== "running") return;
    const guard = (event: BeforeUnloadEvent) => event.preventDefault();
    const sendPending = () => {
      if (!pendingAnswers.current.size) return;
      const answers = [...pendingAnswers.current].map(([question_id, selected_key]) => ({
        question_id,
        selected_key,
      }));
      navigator.sendBeacon(
        `/api/sessions/${sessionId}/modules/${moduleSessionId}/answers`,
        new Blob([JSON.stringify({ answers })], { type: "application/json" })
      );
    };
    window.addEventListener("beforeunload", guard);
    window.addEventListener("pagehide", sendPending);
    return () => {
      window.removeEventListener("beforeunload", guard);
      window.removeEventListener("pagehide", sendPending);
    };
  }, [moduleSessionId, sessionId, state.status]);

  useEffect(() => {
    if (!mounted) return;
    const current = store.getState();
    const sameSession =
      current.sessionId === sessionId && current.moduleSessionId === moduleSessionId;

    if (!sameSession || current.status !== "running" || current.deadlineTs == null) {
      if (startedAt) {
        const deadline = new Date(startedAt).getTime() + timeLimitSeconds * 1000;
        store.getState().init({
          sid: sessionId,
          msid: moduleSessionId,
          deadlineTs: deadline,
          index: Math.min(initialSnapshot?.current_question_index ?? 0, Math.max(0, totalQuestions - 1)),
          fresh: !sameSession,
        });
        queueMicrotask(() => {
          setResumeIndex(initialSnapshot?.current_question_index ?? 0);
          if (deadline > Date.now()) setShowResume(true);
        });
      } else {
        store.getState().init({
          sid: sessionId,
          msid: moduleSessionId,
          deadlineTs: Date.now() + timeLimitSeconds * 1000,
          index: 0,
          fresh: true,
        });
        void syncHeartbeat();
      }
    }

    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(
          `/api/sessions/${sessionId}/modules/${moduleSessionId}/answers`
        );
        if (!response.ok) return;
        const data = (await response.json()) as {
          answers?: Array<{ question_id: string; selected_key: string }>;
        };
        if (cancelled) return;
        const local = store.getState().answers;
        const server = Object.fromEntries(
          (data.answers ?? []).map((answer) => [answer.question_id, answer.selected_key])
        );
        const merged = { ...server, ...local };
        store.getState().replaceAnswers(merged);
        for (const [questionId, selectedKey] of Object.entries(local)) {
          if (server[questionId] !== selectedKey) pendingAnswers.current.set(questionId, selectedKey);
        }
        setPendingCount(pendingAnswers.current.size);
        if (pendingAnswers.current.size) {
          setSaveState("pending");
          void flushAnswers();
        }
      } catch {
        setIsOffline(!navigator.onLine);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    flushAnswers,
    initialSnapshot,
    moduleSessionId,
    mounted,
    sessionId,
    startedAt,
    store,
    syncHeartbeat,
    timeLimitSeconds,
    totalQuestions,
  ]);

  useEffect(() => {
    if (state.status !== "running" || showResume) return;
    const tick = () => {
      const current = store.getState();
      if (current.deadlineTs == null) return;
      const left = Math.max(0, Math.ceil((current.deadlineTs - Date.now()) / 1000));
      setSecondsLeft(left);

      const now = Date.now();
      if (now - lastHeartbeat.current >= HEARTBEAT_MS) {
        lastHeartbeat.current = now;
        void syncHeartbeat();
      }
      if (left <= 0) void finish();
    };
    tick();
    const interval = window.setInterval(tick, 500);
    return () => window.clearInterval(interval);
  }, [finish, showResume, state.status, store, syncHeartbeat]);

  const handleAnswer = useCallback(
    (questionId: string, selectedKey: string) => {
      store.getState().setAnswer(questionId, selectedKey);
      pendingAnswers.current.set(questionId, selectedKey);
      setPendingCount(pendingAnswers.current.size);
      setSaveState("pending");
      setSaveError("");
      if (pendingAnswers.current.size >= FLUSH_THRESHOLD) void flushAnswers();
    },
    [flushAnswers, store]
  );

  const doResume = useCallback(() => {
    const deadline = startedAt
      ? new Date(startedAt).getTime() + timeLimitSeconds * 1000
      : Date.now() + timeLimitSeconds * 1000;
    store.getState().init({
      sid: sessionId,
      msid: moduleSessionId,
      deadlineTs: deadline,
      index: Math.min(resumeIndex, Math.max(0, totalQuestions - 1)),
      fresh: false,
    });
    setShowResume(false);
    void syncHeartbeat();
  }, [moduleSessionId, resumeIndex, sessionId, startedAt, store, syncHeartbeat, timeLimitSeconds, totalQuestions]);

  const doRestartAtBeginning = useCallback(() => {
    const deadline = startedAt
      ? new Date(startedAt).getTime() + timeLimitSeconds * 1000
      : Date.now() + timeLimitSeconds * 1000;
    store.getState().init({
      sid: sessionId,
      msid: moduleSessionId,
      deadlineTs: deadline,
      index: 0,
      fresh: false,
    });
    setShowResume(false);
    void syncHeartbeat();
  }, [moduleSessionId, sessionId, startedAt, store, syncHeartbeat, timeLimitSeconds]);

  return {
    mounted,
    isOffline,
    showResume,
    resumeIndex,
    secondsLeft,
    state,
    store,
    saveState,
    saveError,
    pendingCount,
    handleAnswer,
    finish,
    flushAnswers,
    doResume,
    doFreshStart: doRestartAtBeginning,
  };
}
