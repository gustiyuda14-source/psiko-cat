"use client";

import { useState } from "react";
import type { SafeQuestion, KecermatanOptionsPayload } from "@/lib/types/safe-question";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
type Feedback = { selected: string; is_correct: boolean; correct_key: string };

export default function LatihanKecermatan({ questions }: { questions: SafeQuestion[] }) {
  const sorted = [...questions].sort(
    (a, b) => (a.column_index ?? 0) - (b.column_index ?? 0) || a.sequence_number - b.sequence_number
  );
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Feedback>>({});
  const [checking, setChecking] = useState(false);

  const q = sorted[idx];
  const payload = q?.options_payload as unknown as KecermatanOptionsPayload;
  const symbolMap = payload?.symbol_map ?? { A: "?", B: "?", C: "?", D: "?", E: "?" };
  const fb = q ? answers[q.id] : undefined;
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter((a) => a.is_correct).length;
  const colIdx = (q?.column_index ?? 1) - 1;
  const rowInCol = q ? sorted.slice(0, idx).filter((s) => s.column_index === q.column_index).length : 0;

  async function pick(key: string) {
    if (fb || checking) return;
    setChecking(true);
    try {
      const res = await fetch("/api/practice/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: q.id, selected_key: key }),
      });
      const data = (await res.json()) as { is_correct: boolean; correct_key: string };
      setAnswers((prev) => ({ ...prev, [q.id]: { selected: key, ...data } }));
      if (idx < sorted.length - 1) {
        setTimeout(() => setIdx((i) => i + 1), 500);
      }
    } finally {
      setChecking(false);
    }
  }

  if (!q) {
    return <p className="text-sm text-muted-foreground">Belum ada soal latihan Kecermatan.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium tracking-wider uppercase">
            Latihan Kecermatan (Training)
          </p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p>{answeredCount} dicoba</p>
          <p className="text-success font-semibold">{correctCount} benar</p>
        </div>
      </div>

      <div className="flex items-center gap-1 rounded-xl border border-border bg-card px-3 py-1.5">
        {ROMAN.map((r, i) => (
          <div
            key={i}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
              i === colIdx ? "bg-accent text-primary" : i < colIdx ? "text-muted-foreground" : "text-muted-foreground/50"
            }`}
          >
            {r}
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Soal {rowInCol + 1}/50
            </p>
            <p className="text-lg font-semibold text-foreground">Kolom {ROMAN[colIdx]}</p>
          </div>
          <span className="text-xs text-muted-foreground bg-background px-3 py-1.5 rounded-full font-semibold">
            {idx + 1}/{sorted.length}
          </span>
        </div>

        <div className="px-6 py-5 space-y-6">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Petunjuk Soal</p>
            <table className="w-full border-collapse rounded-xl overflow-hidden border border-border">
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
                <tr className="bg-background">
                  {(["A", "B", "C", "D", "E"] as const).map((k) => (
                    <td key={k} className="py-3 text-center text-xl text-foreground border-r border-border last:border-r-0">
                      {symbolMap[k]}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Soal</p>
            <div className="grid grid-cols-4 gap-3">
              {payload?.shown.map((sym, i) => (
                <div key={i} className="flex items-center justify-center h-16 bg-background border border-border rounded-xl text-3xl text-foreground">
                  {sym}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Jawaban Anda</p>
            <div className="grid grid-cols-5 gap-2">
              {(["A", "B", "C", "D", "E"] as const).map((ch) => {
                const isPicked = fb?.selected === ch;
                const isCorrectKey = fb && ch === fb.correct_key;
                let cls = "bg-card border-2 border-border text-foreground hover:border-primary";
                if (fb) {
                  if (isCorrectKey) cls = "bg-success text-white";
                  else if (isPicked) cls = "bg-destructive text-white";
                  else cls = "bg-background text-muted-foreground";
                }
                return (
                  <button
                    key={ch}
                    onClick={() => pick(ch)}
                    disabled={!!fb || checking}
                    className={`flex items-center justify-center h-14 rounded-xl text-base font-bold transition-all ${cls}`}
                  >
                    {ch}
                  </button>
                );
              })}
            </div>
          </div>

          {fb && (
            <p className={`text-sm font-semibold ${fb.is_correct ? "text-success" : "text-destructive"}`}>
              {fb.is_correct ? "✓ Benar" : `✗ Salah. Kunci: ${fb.correct_key}`}
            </p>
          )}
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
            className="w-full py-3 border-2 border-border text-foreground rounded-xl text-sm font-bold disabled:opacity-30 hover:bg-background transition-colors"
          >
            ← Sebelumnya
          </button>
        </div>
      </div>
    </div>
  );
}
