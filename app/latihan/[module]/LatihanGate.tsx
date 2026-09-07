"use client";

import { useState } from "react";
import Link from "next/link";
import type { SafeQuestion } from "@/lib/types/safe-question";
import type { ModuleType } from "@/lib/test-session";
import LatihanKecerdasan from "./LatihanKecerdasan";
import LatihanKepribadian from "./LatihanKepribadian";
import LatihanKecermatan from "./LatihanKecermatan";

const META: Record<ModuleType, { icon: string; label: string; desc: string }> = {
  KECERDASAN: { icon: "🧠", label: "Latihan Kecerdasan", desc: "kognitif & spasial" },
  KECERMATAN: { icon: "🎯", label: "Latihan Kecermatan (Training)", desc: "10 lajur simbol" },
  KEPRIBADIAN: { icon: "💡", label: "Latihan Kepribadian", desc: "skala Likert" },
};

export default function LatihanGate({
  moduleType,
  questions,
}: {
  moduleType: ModuleType;
  questions: SafeQuestion[];
}) {
  const [started, setStarted] = useState(false);
  const meta = META[moduleType];

  if (started) {
    if (moduleType === "KECERDASAN") return <LatihanKecerdasan questions={questions} />;
    if (moduleType === "KEPRIBADIAN") return <LatihanKepribadian questions={questions} />;
    return <LatihanKecermatan questions={questions} />;
  }

  return (
    <div className="min-h-screen bg-navy-xd text-cream px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Link href="/dashboard" className="text-xs text-cream-dark/60 hover:text-cream">← Dashboard</Link>
          <h1 className="text-2xl font-bold mt-2">Psiko CAT</h1>
        </div>

        <div className="rounded-xl border border-navy-light bg-navy px-6 py-5 space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-3xl shrink-0">{meta.icon}</span>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">{meta.label}</span>
                <span className="rounded-full border border-navy-light px-2 py-0.5 text-xs text-cream-dark/70">
                  Tanpa Batas Waktu
                </span>
              </div>
              <p className="text-xs text-cream-dark/60">
                {questions.length} soal tersedia · {meta.desc}
              </p>
            </div>
          </div>

          <p className="text-xs text-cream-dark/60 leading-relaxed">
            Mode latihan tidak dihitung sebagai tes resmi dan tidak disimpan ke riwayat.
            {moduleType === "KECERDASAN" && " Jawaban langsung dikoreksi setiap soal."}
            {moduleType === "KECERMATAN" && " Jawaban langsung dikoreksi, soal berikutnya tampil otomatis."}
            {moduleType === "KEPRIBADIAN" && " Tidak ada jawaban benar/salah, langsung lanjut ke pernyataan berikutnya."}
          </p>

          <button
            onClick={() => setStarted(true)}
            disabled={questions.length === 0}
            className="w-full rounded-xl bg-gold text-navy-xd py-3 text-sm font-bold hover:bg-gold-light transition-colors disabled:opacity-40"
          >
            {questions.length === 0 ? "Belum Ada Soal" : "Mulai Latihan"}
          </button>
        </div>
      </div>
    </div>
  );
}
