"use client";

import { useState } from "react";
import Link from "next/link";
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
    return (
      <div className="flex items-center justify-center min-h-screen bg-cream text-navy">
        <p className="text-sm text-navy/60">Belum ada soal latihan Kecermatan.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream text-navy">
      <header className="bg-navy text-white">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <Link
              href="/dashboard"
              onClick={(e) => {
                if (answeredCount > 0 && !window.confirm("Keluar dari latihan? Progres tidak disimpan.")) {
                  e.preventDefault();
                }
              }}
              className="text-xs text-cream-dark/70 hover:text-white"
            >
              ← Dashboard
            </Link>
            <p className="text-xs text-cream-dark/70 font-medium tracking-wider uppercase mt-1">
              Latihan Kecermatan (Training)
            </p>
          </div>
          <div className="text-right text-xs text-cream-dark/70">
            <p>{answeredCount} dicoba</p>
            <p className="text-gold font-semibold">{correctCount} benar</p>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-2xl mx-auto px-4 flex items-center gap-1 py-1.5">
            {ROMAN.map((r, i) => (
              <div
                key={i}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                  i === colIdx ? "bg-gold text-navy" : i < colIdx ? "text-cream-dark/50" : "text-cream-dark/30"
                }`}
              >
                {r}
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-cream-dark">
          <div className="flex items-center justify-between px-6 py-4 border-b border-cream-dark">
            <div>
              <p className="text-xs text-navy/60 font-semibold uppercase tracking-wider">
                Soal {rowInCol + 1}/50
              </p>
              <p className="text-lg font-semibold">Kolom {ROMAN[colIdx]}</p>
            </div>
            <span className="text-xs text-navy/60 bg-cream px-3 py-1.5 rounded-full font-semibold">
              {idx + 1}/{sorted.length}
            </span>
          </div>

          <div className="px-6 py-5 space-y-6">
            <div>
              <p className="text-xs text-navy/60 font-semibold uppercase tracking-wider mb-2">Petunjuk Soal</p>
              <table className="w-full border-collapse rounded-xl overflow-hidden border border-cream-dark">
                <thead>
                  <tr className="bg-navy text-white">
                    {(["A", "B", "C", "D", "E"] as const).map((k) => (
                      <th key={k} className="py-2.5 text-center text-sm font-bold border-r border-white/10 last:border-r-0">
                        {k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-cream">
                    {(["A", "B", "C", "D", "E"] as const).map((k) => (
                      <td key={k} className="py-3 text-center text-xl border-r border-cream-dark last:border-r-0">
                        {symbolMap[k]}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <p className="text-xs text-navy/60 font-semibold uppercase tracking-wider mb-2">Soal</p>
              <div className="grid grid-cols-4 gap-3">
                {payload?.shown.map((sym, i) => (
                  <div key={i} className="flex items-center justify-center h-16 bg-cream border border-cream-dark rounded-xl text-3xl">
                    {sym}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-navy/60 font-semibold uppercase tracking-wider mb-2">Jawaban Anda</p>
              <div className="grid grid-cols-5 gap-2">
                {(["A", "B", "C", "D", "E"] as const).map((ch) => {
                  const isPicked = fb?.selected === ch;
                  const isCorrectKey = fb && ch === fb.correct_key;
                  let cls = "bg-white border-2 border-cream-dark text-navy hover:border-navy";
                  if (fb) {
                    if (isCorrectKey) cls = "bg-sage text-white";
                    else if (isPicked) cls = "bg-red-500 text-white";
                    else cls = "bg-cream text-navy/40";
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
              <p className={`text-sm font-semibold ${fb.is_correct ? "text-sage" : "text-red-500"}`}>
                {fb.is_correct ? "✓ Benar" : `✗ Salah — kunci: ${fb.correct_key}`}
              </p>
            )}
          </div>

          <div className="px-6 pb-6">
            <button
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
              disabled={idx === 0}
              className="w-full py-3 border-2 border-navy/20 text-navy rounded-xl text-sm font-bold disabled:opacity-30 hover:bg-cream transition-colors"
            >
              ← Sebelumnya
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
