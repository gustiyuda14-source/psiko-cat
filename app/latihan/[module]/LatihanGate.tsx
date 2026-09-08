"use client";

import { useState } from "react";
import type { SafeQuestion } from "@/lib/types/safe-question";
import { MODULE_CONFIG, type ModuleType } from "@/lib/test-session";
import LatihanKecerdasan from "./LatihanKecerdasan";
import LatihanKepribadian from "./LatihanKepribadian";
import LatihanKecermatan from "./LatihanKecermatan";

export default function LatihanGate({
  moduleType,
  questions,
}: {
  moduleType: ModuleType;
  questions: SafeQuestion[];
}) {
  const [started, setStarted] = useState(false);
  const meta = MODULE_CONFIG[moduleType];
  const label = `Paket Latihan 1 - ${meta.label}`;

  if (started) {
    if (moduleType === "KECERDASAN") return <LatihanKecerdasan questions={questions} />;
    if (moduleType === "KEPRIBADIAN") return <LatihanKepribadian questions={questions} />;
    return <LatihanKecermatan questions={questions} />;
  }

  return (
    <div className="rounded-xl border border-border bg-card px-6 py-5 space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg uppercase tracking-wide text-foreground">{label}</span>
          <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
            Tanpa Batas Waktu
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {questions.length} soal tersedia · {meta.shortDesc}
        </p>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Mode latihan tidak dihitung sebagai tes resmi dan tidak disimpan ke riwayat.
        {moduleType === "KECERDASAN" && " Jawaban langsung dikoreksi setiap soal."}
        {moduleType === "KECERMATAN" && " Jawaban langsung dikoreksi, soal berikutnya tampil otomatis."}
        {moduleType === "KEPRIBADIAN" && " Tidak ada jawaban benar/salah, langsung lanjut ke pernyataan berikutnya."}
      </p>

      <button
        onClick={() => setStarted(true)}
        disabled={questions.length === 0}
        className="w-full rounded-xl bg-accent text-primary py-3 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
      >
        {questions.length === 0 ? "Belum Ada Soal" : "Mulai Latihan"}
      </button>
    </div>
  );
}
