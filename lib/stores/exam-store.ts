import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Generic store factory untuk modul navigasi-per-soal dengan satu timer modul:
 *   - Kecerdasan (90 menit, kognitif/SVG)
 *   - Kepribadian (60 menit, Likert)
 *
 * Berbeda dari Kecermatan (timer per-lajur), modul ini punya SATU deadline.
 * Deadline disimpan absolut (epoch ms) agar tidak ada drift pada timer panjang
 * dan tahan terhadap reload / resume.
 */

type Status = "idle" | "running" | "completed";

export type ExamState = {
  sessionId: string | null;
  moduleSessionId: string | null;
  currentIndex: number;
  deadlineTs: number | null; // epoch ms
  answers: Record<string, string>;
  status: Status;

  init: (args: {
    sid: string;
    msid: string;
    deadlineTs: number;
    index?: number;
    fresh?: boolean;
  }) => void;
  setAnswer: (qid: string, key: string) => void;
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
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

export function createExamStore(persistKey: string) {
  return create<ExamState>()(
    persist(
      (set) => ({
        sessionId: null,
        moduleSessionId: null,
        currentIndex: 0,
        deadlineTs: null,
        answers: {},
        status: "idle",

        init: ({ sid, msid, deadlineTs, index = 0, fresh = false }) =>
          set((s) => ({
            sessionId: sid,
            moduleSessionId: msid,
            deadlineTs,
            currentIndex: index,
            status: "running",
            answers: fresh ? {} : s.answers,
          })),

        setAnswer: (qid, key) =>
          set((s) => ({ answers: { ...s.answers, [qid]: key } })),

        goTo: (index) => set({ currentIndex: index }),
        next: () => set((s) => ({ currentIndex: s.currentIndex + 1 })),
        prev: () => set((s) => ({ currentIndex: Math.max(0, s.currentIndex - 1) })),
        setStatus: (status) => set({ status }),
      }),
      {
        name: persistKey,
        storage: createJSONStorage(() =>
          typeof window !== "undefined" ? localStorage : noopStorage
        ),
        partialize: (s) => ({
          sessionId: s.sessionId,
          moduleSessionId: s.moduleSessionId,
          currentIndex: s.currentIndex,
          deadlineTs: s.deadlineTs,
          answers: s.answers,
          status: s.status,
        }),
      }
    )
  );
}

export const useKecerdasanStore = createExamStore("kecerdasan-engine");
export const useKepribadianStore = createExamStore("kepribadian-engine");
