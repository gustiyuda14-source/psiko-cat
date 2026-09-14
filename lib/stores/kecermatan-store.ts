import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const COLUMN_DURATION_MS = 60_000;

type Status = "idle" | "running" | "completed";

export type PendingKecermatanLog = {
  question_id: string;
  clicked_at_ms: number;
  response_value: string;
};

type KecermatanState = {
  sessionId: string | null;
  moduleSessionId: string | null;
  currentColIdx: number;
  currentRowIdx: number;
  columnRemainingMs: number;
  columnDeadlineTs: number | null;
  answers: Record<string, string>;
  pendingLogs: Record<string, PendingKecermatanLog>;
  status: Status;

  init: (sid: string, msid: string, col?: number, row?: number, ms?: number, fresh?: boolean) => void;
  setAnswer: (qid: string, choice: string) => void;
  replaceAnswers: (answers: Record<string, string>) => void;
  queueLog: (log: PendingKecermatanLog) => void;
  acknowledgeLogs: (logs: PendingKecermatanLog[]) => void;
  advanceRow: () => void;
  advanceColumn: () => void;
  setColumnRemaining: (remainingMs: number) => void;
  setStatus: (s: Status) => void;
};

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  key: () => null,
  length: 0,
} satisfies Storage;

export const useKecermatanStore = create<KecermatanState>()(
  persist(
    (set) => ({
      sessionId: null,
      moduleSessionId: null,
      currentColIdx: 0,
      currentRowIdx: 0,
      columnRemainingMs: COLUMN_DURATION_MS,
      columnDeadlineTs: null,
      answers: {},
      pendingLogs: {},
      status: "idle",

      init: (sid, msid, col = 0, row = 0, ms = COLUMN_DURATION_MS, fresh = false) =>
        set((s) => ({
          sessionId: sid,
          moduleSessionId: msid,
          currentColIdx: col,
          currentRowIdx: row,
          columnRemainingMs: ms,
          columnDeadlineTs: Date.now() + ms,
          status: "running",
          answers:
            fresh || s.sessionId !== sid || s.moduleSessionId !== msid ? {} : s.answers,
          pendingLogs:
            fresh || s.sessionId !== sid || s.moduleSessionId !== msid ? {} : s.pendingLogs,
        })),

      setAnswer: (qid, choice) =>
        set((s) => ({ answers: { ...s.answers, [qid]: choice } })),

      replaceAnswers: (answers) => set({ answers }),

      queueLog: (log) =>
        set((s) => ({ pendingLogs: { ...s.pendingLogs, [log.question_id]: log } })),

      acknowledgeLogs: (logs) =>
        set((s) => {
          const pendingLogs = { ...s.pendingLogs };
          for (const log of logs) {
            if (pendingLogs[log.question_id]?.clicked_at_ms === log.clicked_at_ms) {
              delete pendingLogs[log.question_id];
            }
          }
          return { pendingLogs };
        }),

      advanceRow: () =>
        set((s) => ({ currentRowIdx: s.currentRowIdx + 1 })),

      advanceColumn: () =>
        set((s) => ({
          currentColIdx: s.currentColIdx + 1,
          currentRowIdx: 0,
          columnRemainingMs: COLUMN_DURATION_MS,
          columnDeadlineTs: Date.now() + COLUMN_DURATION_MS,
        })),

      setColumnRemaining: (remainingMs) =>
        set({ columnRemainingMs: Math.max(0, remainingMs) }),

      setStatus: (status) => set({ status }),
    }),
    {
      name: "kecermatan-engine",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : noopStorage
      ),
      partialize: (s) => ({
        sessionId: s.sessionId,
        moduleSessionId: s.moduleSessionId,
        currentColIdx: s.currentColIdx,
        currentRowIdx: s.currentRowIdx,
        columnRemainingMs: s.columnRemainingMs,
        columnDeadlineTs: s.columnDeadlineTs,
        answers: s.answers,
        pendingLogs: s.pendingLogs,
        status: s.status,
      }),
    }
  )
);
