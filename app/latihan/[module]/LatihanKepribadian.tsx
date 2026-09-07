"use client";

import { useState } from "react";
import Link from "next/link";
import type { SafeQuestion, KepribadianOptionsPayload } from "@/lib/types/safe-question";

export default function LatihanKepribadian({ questions }: { questions: SafeQuestion[] }) {
  const sorted = [...questions].sort((a, b) => a.sequence_number - b.sequence_number);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const q = sorted[idx];
  const payload = q?.options_payload as unknown as KepribadianOptionsPayload;
  const picked = q ? answers[q.id] : undefined;
  const answeredCount = Object.keys(answers).length;

  function pick(key: string) {
    setAnswers((prev) => ({ ...prev, [q.id]: key }));
    if (idx < sorted.length - 1) {
      setTimeout(() => setIdx((i) => i + 1), 200);
    }
  }

  if (!q) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-navy-xd text-cream">
        <p className="text-sm text-cream-dark/70">Belum ada soal latihan Kepribadian.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-xd text-cream">
      <header className="sticky top-0 z-30 bg-navy/95 backdrop-blur border-b border-navy-light">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="text-xs text-cream-dark/60 hover:text-cream">← Dashboard</Link>
            <p className="text-[11px] text-cream-dark/60 uppercase tracking-widest font-semibold mt-1">
              Latihan Kepribadian
            </p>
            <p className="text-sm mt-0.5">
              Pernyataan <span className="font-bold">{idx + 1}</span>
              <span className="text-cream-dark/50"> / {sorted.length}</span>
            </p>
          </div>
          <p className="text-xs text-cream-dark/60">{answeredCount} terjawab</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        <div className="bg-navy border border-navy-light rounded-2xl overflow-hidden">
          <div className="px-6 py-8">
            {payload?.aspect && (
              <div className="flex justify-center mb-4">
                <span className="inline-block rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
                  {payload.aspect}
                </span>
              </div>
            )}
            <p className="text-lg leading-relaxed text-center font-medium">{payload?.statement}</p>
          </div>

          <div className="px-6 pb-6 space-y-2.5">
            {payload?.choices?.map((c) => (
              <button
                key={c.key}
                onClick={() => pick(c.key)}
                className={`w-full flex items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-all duration-150 ${
                  picked === c.key
                    ? "border-gold bg-gold/15"
                    : "border-navy-light hover:bg-navy-light/40"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                    picked === c.key ? "border-gold bg-gold" : "border-navy-light"
                  }`}
                >
                  {picked === c.key && <span className="h-2 w-2 rounded-full bg-navy-xd" />}
                </span>
                <span className="text-sm font-medium">{c.text}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
            className="rounded-xl border border-navy-light px-5 py-2.5 text-sm font-medium disabled:opacity-30 hover:bg-navy-light/40 transition-colors"
          >
            ← Sebelumnya
          </button>
          <button
            onClick={() => setIdx((i) => Math.min(sorted.length - 1, i + 1))}
            disabled={idx >= sorted.length - 1}
            className="rounded-xl border border-navy-light px-5 py-2.5 text-sm font-medium disabled:opacity-30 hover:bg-navy-light/40 transition-colors"
          >
            Selanjutnya →
          </button>
        </div>
      </main>
    </div>
  );
}
