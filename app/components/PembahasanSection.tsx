"use client";

import { useState } from "react";
import type {
  KecerdasanOptionsPayload,
  KepribadianOptionsPayload,
} from "@/lib/types/safe-question";

export type KecerdasanReviewItem = {
  question_id: string;
  sequence_number: number;
  selected_key: string | null;
  correct_key: string;
  is_correct: boolean;
  payload: KecerdasanOptionsPayload;
};

export type KepribadianReviewItem = {
  question_id: string;
  sequence_number: number;
  selected_key: string | null;
  payload: KepribadianOptionsPayload;
};

export type KecermatanSummary = {
  ke_index: number | null;
  kt_index: number | null;
  kh_index: number | null;
  nap_contribution: number | null;
  raw_score: number | null;
};

type Props = {
  kecerdasan: KecerdasanReviewItem[];
  kepribadian: KepribadianReviewItem[];
  kecermatan: KecermatanSummary | null;
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function SubSesiDropdown({
  label,
  summary,
  children,
}: {
  label: string;
  summary?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-semibold text-sm">{label}</span>
          {summary && <span className="text-xs text-zinc-500 truncate">{summary}</span>}
        </div>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div className="border-t border-zinc-800 px-5 py-4">
          {children}
        </div>
      )}
    </div>
  );
}

function KecerdasanReview({ items }: { items: KecerdasanReviewItem[] }) {
  if (!items.length) {
    return <p className="text-sm text-zinc-500">Tidak ada jawaban tersimpan.</p>;
  }

  const sorted = [...items].sort((a, b) => a.sequence_number - b.sequence_number);
  const correct = sorted.filter((i) => i.is_correct).length;
  const pct = sorted.length ? ((correct / sorted.length) * 100).toFixed(0) : "0";

  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-500 pb-2 border-b border-zinc-800">
        {correct}/{sorted.length} benar ({pct}%)
      </p>
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
        {sorted.map((item) => (
          <div
            key={item.question_id}
            className={`rounded-xl border p-4 space-y-2 text-sm ${
              item.selected_key === null
                ? "border-zinc-700 bg-zinc-800/30"
                : item.is_correct
                ? "border-emerald-800/60 bg-emerald-950/20"
                : "border-red-800/60 bg-red-950/15"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-zinc-400">Soal {item.sequence_number}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  item.selected_key === null
                    ? "bg-zinc-700 text-zinc-400"
                    : item.is_correct
                    ? "bg-emerald-700/50 text-emerald-300"
                    : "bg-red-700/50 text-red-300"
                }`}
              >
                {item.selected_key === null ? "Dilewati" : item.is_correct ? "Benar ✓" : "Salah ✗"}
              </span>
            </div>

            {item.payload.instruksi && (
              <p className="text-xs text-blue-400 italic">{item.payload.instruksi}</p>
            )}
            {item.payload.question_text && (
              <p className="text-zinc-200 text-sm leading-relaxed">{item.payload.question_text}</p>
            )}
            {item.payload.svg_content && (
              <div
                className="bg-white rounded-lg p-2 overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: item.payload.svg_content }}
              />
            )}

            <div className="flex items-center gap-4 text-xs pt-1 border-t border-zinc-700/40">
              <span className="text-zinc-500">
                Jawaban:{" "}
                <span
                  className={`font-bold ${
                    !item.selected_key
                      ? "text-zinc-600"
                      : item.is_correct
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {item.selected_key ?? "—"}
                </span>
              </span>
              {!item.is_correct && (
                <span className="text-zinc-500">
                  Kunci: <span className="font-bold text-emerald-400">{item.correct_key}</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KepribadianReview({ items }: { items: KepribadianReviewItem[] }) {
  if (!items.length) {
    return <p className="text-sm text-zinc-500">Tidak ada jawaban tersimpan.</p>;
  }

  const sorted = [...items].sort((a, b) => a.sequence_number - b.sequence_number);
  const answered = sorted.filter((i) => i.selected_key).length;

  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-500 pb-2 border-b border-zinc-800">
        {answered}/{sorted.length} pernyataan dijawab
      </p>
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
        {sorted.map((item) => {
          const choiceText = item.payload.choices?.find((c) => c.key === item.selected_key)?.text;
          return (
            <div
              key={item.question_id}
              className="rounded-xl border border-zinc-700/60 bg-zinc-800/30 p-3.5 space-y-1.5 text-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-zinc-600 shrink-0">#{item.sequence_number}</span>
                {item.selected_key ? (
                  <span className="text-[10px] font-semibold bg-blue-700/40 text-blue-300 px-2 py-0.5 rounded-full text-right">
                    {item.selected_key} · {choiceText}
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-600">Dilewati</span>
                )}
              </div>
              <p className="text-zinc-200 leading-relaxed">{item.payload.statement}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KecermatanReview({ summary }: { summary: KecermatanSummary }) {
  const r1 = (v: number | null) => (v == null ? "-" : v.toFixed(1));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { label: "Ke (Kecepatan)", val: summary.ke_index, desc: "total_klik / 500 × 100" },
          { label: "Kt (Ketelitian)", val: summary.kt_index, desc: "benar / klik × 100" },
          { label: "Kh (Ketahanan)", val: summary.kh_index, desc: "konsistensi antar lajur" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4 space-y-1">
            <p className="text-2xl font-bold font-mono">{r1(s.val)}</p>
            <p className="text-xs font-semibold text-zinc-300">{s.label}</p>
            <p className="text-[10px] text-zinc-600">{s.desc}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-zinc-800 px-4 py-3 text-sm space-y-1.5">
        <div className="flex justify-between text-zinc-400">
          <span>Skor Murni</span>
          <span className="font-mono font-semibold text-zinc-200">{r1(summary.raw_score)}</span>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>Kontribusi NAP</span>
          <span className="font-mono font-semibold text-zinc-200">{r1(summary.nap_contribution)} / 20</span>
        </div>
      </div>
    </div>
  );
}

export default function PembahasanSection({ kecerdasan, kepribadian, kecermatan }: Props) {
  const ksCorrect = kecerdasan.filter((i) => i.is_correct).length;
  const kpAnswered = kepribadian.filter((i) => i.selected_key).length;

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider pt-2">
        Pembahasan Sesi
      </h2>

      <SubSesiDropdown
        label="Kecerdasan Umum"
        summary={
          kecerdasan.length
            ? `${ksCorrect}/${kecerdasan.length} benar`
            : "Tidak ada data"
        }
      >
        <KecerdasanReview items={kecerdasan} />
      </SubSesiDropdown>

      <SubSesiDropdown
        label="Kepribadian"
        summary={
          kepribadian.length
            ? `${kpAnswered}/${kepribadian.length} dijawab`
            : "Tidak ada data"
        }
      >
        <KepribadianReview items={kepribadian} />
      </SubSesiDropdown>

      <SubSesiDropdown
        label="Kecermatan"
        summary={
          kecermatan
            ? `Ke ${(kecermatan.ke_index ?? 0).toFixed(1)} · Kt ${(kecermatan.kt_index ?? 0).toFixed(1)}`
            : "Tidak ada data"
        }
      >
        {kecermatan ? (
          <KecermatanReview summary={kecermatan} />
        ) : (
          <p className="text-sm text-zinc-500">Data kecermatan belum tersedia.</p>
        )}
      </SubSesiDropdown>
    </div>
  );
}
