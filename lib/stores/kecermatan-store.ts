import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const COLUMN_DURATION_MS = 60_000;

type Status = "idle" | "running" | "completed";

type KecermatanState = {
  sessionId: string | null;
  moduleSessionId: string | null;
  currentColIdx: number;
  currentRowIdx: number;
  columnRemainingMs: number;
  answers: Record<string, string>;
  status: Status;

  init: (sid: string, msid: string, col?: number, row?: number, ms?: number, fresh?: boolean) => void;
  setAnswer: (qid: string, choice: string) => void;
  advanceRow: () => void;
  advanceColumn: () => void;
  tickColumn: (delta: number) => void;
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
      answers: {},
      status: "idle",

      init: (sid, msid, col = 0, row = 0, ms = COLUMN_DURATION_MS, fresh = false) =>
        set((s) => ({
          sessionId: sid,
          moduleSessionId: msid,
          currentColIdx: col,
          currentRowIdx: row,
          columnRemainingMs: ms,
          status: "running",
          answers: fresh ? {} : s.answers,
        })),

      setAnswer: (qid, choice) =>
        set((s) => ({ answers: { ...s.answers, [qid]: choice } })),

      advanceRow: () =>
        set((s) => ({ currentRowIdx: s.currentRowIdx + 1 })),

      advanceColumn: () =>
        set((s) => ({
          currentColIdx: s.currentColIdx + 1,
          currentRowIdx: 0,
          columnRemainingMs: COLUMN_DURATION_MS,
        })),

      tickColumn: (delta) =>
        set((s) => ({ columnRemainingMs: Math.max(0, s.columnRemainingMs - delta) })),

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
        answers: s.answers,
        status: s.status,
      }),
    }
  )
);
