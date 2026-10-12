"use client";

import { ConfirmDialog } from "@/app/components/ui-client";

// Dua konfirmasi sebelum keluar dari sesi yang berjalan (pasangan useLeaveGuard).
const COPY = {
  latihan: {
    title1: "Keluar dari latihan?",
    body1: "Latihan ini belum dikumpulkan.",
    stay1: "Lanjutkan latihan",
    body2:
      "Jawaban yang sudah dipilih hilang dan pembahasannya tidak tersimpan. Latihan tidak bisa dilanjutkan; nanti dimulai lagi dari butir pertama.",
    stay2: "Kembali ke latihan",
  },
  simulasi: {
    title1: "Keluar dari sub-tes?",
    body1: "Sub-tes ini masih berjalan.",
    stay1: "Lanjutkan sub-tes",
    body2:
      "Waktu sub-tes tetap berjalan walau kamu keluar. Jawaban yang sudah dipilih tersimpan, dan kamu bisa melanjutkan dari halaman sesi selama waktunya belum habis.",
    stay2: "Kembali ke sub-tes",
  },
} as const;

export default function LeaveConfirm({
  kind,
  step,
  onStep,
  onLeave,
}: {
  kind: keyof typeof COPY;
  step: 0 | 1 | 2;
  onStep: (step: 0 | 1 | 2) => void;
  onLeave: () => void;
}) {
  const t = COPY[kind];
  return (
    <>
      <ConfirmDialog
        open={step === 1}
        onClose={() => onStep(0)}
        onConfirm={() => onStep(2)}
        title={t.title1}
        confirmLabel="Keluar"
        cancelLabel={t.stay1}
        tone="danger"
      >
        <p className="text-muted-foreground">{t.body1}</p>
      </ConfirmDialog>
      <ConfirmDialog
        open={step === 2}
        onClose={() => onStep(0)}
        onConfirm={() => {
          onStep(0);
          onLeave();
        }}
        title="Yakin keluar sekarang?"
        confirmLabel="Ya, keluar"
        cancelLabel={t.stay2}
        tone="danger"
      >
        <p className="text-muted-foreground">{t.body2}</p>
      </ConfirmDialog>
    </>
  );
}
