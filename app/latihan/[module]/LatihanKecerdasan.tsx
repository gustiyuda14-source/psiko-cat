"use client";

import { useState } from "react";
import Link from "next/link";
import type { SafeQuestion, KecerdasanOptionsPayload } from "@/lib/types/safe-question";

type Feedback = { selected: string; is_correct: boolean; correct_key: string };

export default function LatihanKecerdasan({ questions }: { questions: SafeQuestion[] }) {
  const sorted = [...questions].sort((a, b) => a.sequence_number - b.sequence_number);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Feedback>>({});
  const [checking, setChecking] = useState(false);

  const q = sorted[idx];
  const payload = q?.options_payload as unknown as KecerdasanOptionsPayload;
  const fb = q ? answers[q.id] : undefined;
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter((a) => a.is_correct).length;

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
    } finally {
      setChecking(false);
    }
  }

  if (!q) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-navy-xd text-cream">
        <p className="text-sm text-cream-dark/70">Belum ada soal latihan Kecerdasan.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-xd text-cream">
      <header className="sticky top-0 z-30 bg-navy/95 backdrop-blur border-b border-navy-light">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <div>
            <Link
              href="/dashboard"
              onClick={(e) => {
                if (answeredCount > 0 && !window.confirm("Keluar dari latihan? Progres tidak disimpan.")) {
                  e.preventDefault();
                }
              }}
              className="text-xs text-cream-dark/60 hover:text-cream"
            >
              ← Dashboard
            </Link>
            <p className="text-[11px] text-cream-dark/60 uppercase tracking-widest font-semibold mt-1">
              Latihan Kecerdasan
            </p>
            <p className="text-sm mt-0.5">
              Soal <span className="font-bold">{idx + 1}</span>
              <span className="text-cream-dark/50"> / {sorted.length}</span>
            </p>
          </div>
          <div className="text-right text-xs text-cream-dark/60">
            <p>{answeredCount} dicoba</p>
            <p className="text-sage font-semibold">{correctCount} benar</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        <div className="bg-navy border border-navy-light rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-navy-light">
            <span className="text-sm font-semibold text-cream-dark/80">Soal Nomor {idx + 1}</span>
          </div>

          <div className="px-6 py-5 space-y-5">
            {payload?.instruksi && (
              <div className="text-sm font-semibold text-gold bg-gold/10 border border-gold/30 p-3 rounded-xl">
                {payload.instruksi}
              </div>
            )}
            {payload?.sub_text && (
              <div className="text-sm italic leading-relaxed text-cream-dark/80 border-l-2 border-navy-light pl-4 py-1">
                {payload.sub_text}
              </div>
            )}
            {payload?.question_text && (
              <p className="text-base leading-relaxed">{payload.question_text}</p>
            )}
            {payload?.svg_content && (
              <div
                className="bg-cream rounded-xl p-4 flex justify-center overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: payload.svg_content }}
              />
            )}

            <div className="space-y-2.5 pt-1">
              {payload?.choices?.map((c) => {
                const isPicked = fb?.selected === c.key;
                const isCorrectKey = fb && c.key === fb.correct_key;
                let cls = "border-navy-light hover:border-navy-light hover:bg-navy-light/40";
                if (fb) {
                  if (isCorrectKey) cls = "border-sage bg-sage/15";
                  else if (isPicked) cls = "border-red-500 bg-red-500/15";
                  else cls = "border-navy-light opacity-50";
                }
                return (
                  <button
                    key={c.key}
                    onClick={() => pick(c.key)}
                    disabled={!!fb || checking}
                    className={`w-full flex items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-all duration-150 ${cls}`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        fb && isCorrectKey
                          ? "bg-sage text-white"
                          : fb && isPicked
                          ? "bg-red-500 text-white"
                          : "bg-navy-light text-cream-dark/70"
                      }`}
                    >
                      {c.key}
                    </span>
                    <span className="text-sm leading-relaxed">{c.text}</span>
                  </button>
                );
              })}
            </div>

            {fb && (
              <p className={`text-sm font-semibold ${fb.is_correct ? "text-sage" : "text-red-400"}`}>
                {fb.is_correct ? "✓ Benar" : `✗ Salah — kunci: ${fb.correct_key}`}
              </p>
            )}
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
