"use client";

import { useEffect, useRef, useState } from "react";
import { Button, ConfirmDialog } from "@/app/components/ui-client";
import { Check, CloudOff, Timer } from "@/app/components/icons";
import type { SaveState } from "@/lib/hooks/use-exam-engine";

/*
  Chrome bersama untuk ketiga engine ujian: header, navigator soal, notice
  offline, dan dua dialog yang sebelumnya disalin utuh di dua engine.
*/

function formatTime(total: number): string {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pengumuman waktu
// ─────────────────────────────────────────────────────────────────────────────

/*
  Timer yang di-aria-live setiap detik akan membanjiri screen reader dan justru
  menutupi teks soal. Yang diumumkan hanya ambang batas, sekali per ambang.
*/
const THRESHOLDS = [600, 300, 60, 30];

function useTimeAnnouncement(secondsLeft: number): string {
  const [message, setMessage] = useState("");
  const announced = useRef<Set<number>>(new Set());

  useEffect(() => {
    // Ambang terketat yang masih berlaku — bukan yang pertama cocok. Kalau
    // peserta melanjutkan sesi dengan sisa 45 detik, yang benar diumumkan
    // "1 menit", bukan "10 menit" hanya karena 45 juga di bawah 600.
    const applicable = THRESHOLDS.filter((t) => secondsLeft <= t);
    if (applicable.length === 0) return;
    const hit = Math.min(...applicable);
    if (announced.current.has(hit)) return;
    // Ambang di atasnya ikut ditandai supaya resume di tengah sesi tidak
    // memuntahkan beberapa pengumuman sekaligus.
    THRESHOLDS.filter((t) => t >= hit).forEach((t) => announced.current.add(t));
    setMessage(
      hit >= 60 ? `Sisa waktu ${hit / 60} menit.` : `Sisa waktu ${hit} detik.`
    );
  }, [secondsLeft]);

  return message;
}

// ─────────────────────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────────────────────

type ExamHeaderProps = {
  title: string;
  itemLabel: string;
  current: number;
  total: number;
  answered: number;
  secondsLeft: number;
  saveState?: SaveState;
  pendingCount?: number;
};

export function ExamHeader({
  title,
  itemLabel,
  current,
  total,
  answered,
  secondsLeft,
  saveState = "saved",
  pendingCount = 0,
}: ExamHeaderProps) {
  const announcement = useTimeAnnouncement(secondsLeft);
  const critical = secondsLeft <= 60;
  const warning = !critical && secondsLeft <= 300;
  const progress = total ? answered / total : 0;

  return (
    <header className="on-nav sticky top-0 z-30 bg-surface-nav text-white shadow-e3">
      <div className="mx-auto flex min-h-15 max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="mt-0.5 truncate text-xs text-white/70">
            <span className="tnum">
              {itemLabel} {current} dari {total}
            </span>
            <span className="hidden sm:inline"> · </span>
            <span className="hidden tnum sm:inline">{answered} terjawab</span>
            <span className="hidden sm:inline"> · </span>
            <span className="hidden sm:inline" role="status">
              {saveState === "saved"
                ? "Tersimpan di server"
                : saveState === "saving"
                  ? "Menyimpan…"
                  : saveState === "error"
                    ? "Belum tersimpan"
                    : `${pendingCount} menunggu`}
            </span>
          </p>
        </div>

        {/* Eskalasi waktu tanpa warna baru: teks putih -> teks gold -> chip gold
            terisi. Chip terisi punya kontras 5.6:1 dan menarik mata tanpa
            animasi berkedip. */}
        <div
          className={`flex shrink-0 items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors duration-200 ease-out ${
            critical ? "bg-accent text-primary" : "bg-white/8 text-white"
          }`}
        >
          <Timer className={`size-4 ${warning ? "text-accent" : ""}`} />
          <span className="sr-only">Sisa waktu</span>
          <span
            className={`tnum text-lg font-bold sm:text-xl ${
              warning ? "text-accent" : ""
            }`}
          >
            {formatTime(secondsLeft)}
          </span>
        </div>
      </div>

      <div
        className="h-0.5 bg-white/12"
        role="progressbar"
        aria-label="Kemajuan jawaban"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={answered}
      >
        <div
          className="h-full origin-left bg-accent transition-transform duration-300 ease-out"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Navigator soal
// ─────────────────────────────────────────────────────────────────────────────

type QuestionNavigatorProps = {
  itemLabel: string;
  questionIds: string[];
  answers: Record<string, unknown>;
  currentIndex: number;
  secondsLeft?: number;
  onGoTo: (index: number) => void;
  onSubmit?: () => void;
  submitLabel?: string;
};

function NavigatorContent({
  itemLabel,
  questionIds,
  answers,
  currentIndex,
  secondsLeft,
  onGoTo,
  onSubmit,
  submitLabel,
}: QuestionNavigatorProps) {
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questionIds.length - answeredCount;

  return (
    <div className="space-y-5">
      {secondsLeft == null && (
        <div className="rounded-xl border border-border bg-card px-4 py-5 text-center">
          <p className="text-xs font-bold tracking-wide text-muted-foreground">MODE LATIHAN</p>
          <p className="mt-2 text-xl font-bold text-foreground">Tanpa batas waktu</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
        <div className="rounded-lg bg-success-soft px-2 py-3 text-success">
          <strong className="tnum block text-base">{answeredCount}</strong>
          Terjawab
        </div>
        <div className="rounded-lg bg-accent-soft px-2 py-3 text-accent-ink">
          <strong className="tnum block text-base">{currentIndex + 1}</strong>
          Aktif
        </div>
        <div className="rounded-lg bg-surface-inset px-2 py-3 text-muted-foreground">
          <strong className="tnum block text-base">{unansweredCount}</strong>
          Kosong
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-bold tracking-wide text-muted-foreground">NOMOR {itemLabel.toUpperCase()}</p>
        <div className="grid max-h-[18rem] grid-cols-5 gap-2 overflow-y-auto pr-1">
        {questionIds.map((id, index) => {
          const answered = Boolean(answers[id]);
          const current = index === currentIndex;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onGoTo(index)}
              aria-current={current ? "step" : undefined}
              aria-label={`${itemLabel} ${index + 1}${
                answered ? ", sudah dijawab" : ", belum dijawab"
              }`}
              className={`tnum flex h-12 items-center justify-center rounded-lg border text-sm font-bold transition-colors duration-150 ease-out ${
                current
                  ? "border-accent-strong bg-accent text-primary ring-2 ring-primary ring-offset-2"
                  : answered
                    ? "border-success bg-success text-white hover:brightness-95"
                    : "border-border-strong/55 bg-card text-muted-foreground hover:border-primary/45 hover:text-foreground"
              }`}
            >
              {index + 1}
            </button>
          );
        })}
        </div>
      </div>

      <ul className="flex flex-wrap gap-x-3 gap-y-2 border-t border-border pt-4 text-xs font-medium text-muted-foreground">
        <li className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-success" aria-hidden="true" />
          Terjawab
        </li>
        <li className="flex items-center gap-1.5">
          <span
            className="size-3 rounded-sm border border-border-strong/55 bg-card"
            aria-hidden="true"
          />
          Kosong
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm border-2 border-primary bg-accent" aria-hidden="true" />
          Aktif
        </li>
      </ul>

      {onSubmit && (
        <Button
          variant="danger"
          size="lg"
          block
          onClick={onSubmit}
        >
          {submitLabel ?? "Selesai Ujian"}
        </Button>
      )}
    </div>
  );
}

export function QuestionNavigator(props: QuestionNavigatorProps) {
  const noun = props.itemLabel.toLowerCase();
  const answeredCount = Object.keys(props.answers).length;
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const mobileProps = {
    ...props,
    onGoTo: (index: number) => {
      props.onGoTo(index);
      if (detailsRef.current) detailsRef.current.open = false;
      requestAnimationFrame(() => {
        const question = document.querySelector<HTMLElement>("[data-active-question]");
        (question ?? summaryRef.current)?.focus();
      });
    },
  };

  return (
    <>
      <details ref={detailsRef} className="group/nav overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:hidden">
        <summary ref={summaryRef} className="flex min-h-12 list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
          <span>Navigasi {noun}</span>
          <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="tnum group-open/nav:hidden">
              {answeredCount}/{props.questionIds.length}
            </span>
            <span className="hidden text-primary group-open/nav:inline">Tutup</span>
          </span>
        </summary>
        <div className="border-t border-border p-4">
          <NavigatorContent {...mobileProps} />
        </div>
      </details>

      <aside
        className="sticky top-24 order-2 hidden w-80 shrink-0 self-start rounded-2xl border border-border bg-card p-5 shadow-sm lg:block"
        aria-label={`Navigasi ${noun}`}
      >
        <NavigatorContent {...props} />
      </aside>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Notice offline
// ─────────────────────────────────────────────────────────────────────────────

export function OfflineNotice() {
  return (
    <div
      className="surface-panel fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-md items-start gap-3 px-4 py-3"
      role="status"
    >
      <CloudOff className="mt-0.5 size-5 shrink-0 text-destructive" />
      <div>
        <p className="text-sm font-semibold text-destructive">Koneksi terputus</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Timer tetap berjalan. Jawaban disimpan di perangkat ini dan akan dicoba dikirim saat
          koneksi kembali.
        </p>
      </div>
    </div>
  );
}

export function SaveErrorNotice({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      className="mx-auto mt-3 flex max-w-7xl flex-wrap items-center justify-between gap-3 rounded-md border border-destructive/30 bg-destructive-soft px-4 py-3 text-sm text-destructive sm:px-6"
      role="alert"
    >
      <span>{message}</span>
      <Button variant="danger" size="sm" onClick={onRetry}>
        Kirim ulang
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dialog ujian
// ─────────────────────────────────────────────────────────────────────────────

export function ResumeDialog({
  open,
  itemLabel,
  resumeIndex,
  onResume,
  onFreshStart,
}: {
  open: boolean;
  itemLabel: string;
  resumeIndex: number;
  onResume: () => void;
  onFreshStart: () => void;
}) {
  return (
    <ConfirmDialog
      open={open}
      // Sesi harus dijawab: tidak ada opsi menutup tanpa memilih.
      dismissible={false}
      onClose={onFreshStart}
      onConfirm={onResume}
      title="Lanjutkan sesi sebelumnya?"
      confirmLabel={`Lanjut dari ${itemLabel.toLowerCase()} ${resumeIndex + 1}`}
      cancelLabel="Buka dari awal"
      tone="primary"
    >
      <p className="text-muted-foreground">
        Sesi sebelumnya berhenti di {itemLabel.toLowerCase()} nomor{" "}
        <span className="tnum font-semibold text-foreground">{resumeIndex + 1}</span>. Timer
        tetap mengikuti waktu mulai yang tercatat di server. Membuka dari awal tidak mengulang
        waktu atau menghapus jawaban yang sudah tersimpan.
      </p>
    </ConfirmDialog>
  );
}

export function SubmitDialog({
  open,
  itemLabel,
  answered,
  total,
  onClose,
  onConfirm,
}: {
  open: boolean;
  itemLabel: string;
  answered: number;
  total: number;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const remaining = total - answered;
  const noun = itemLabel.toLowerCase();

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Kumpulkan sub-tes ini?"
      confirmLabel="Ya, kumpulkan"
      tone={remaining > 0 ? "danger" : "primary"}
    >
      <div className="inset-panel flex items-baseline justify-between gap-4 px-4 py-3">
        <span className="text-muted-foreground">Terjawab</span>
        <span className="tnum font-semibold text-foreground">
          {answered} dari {total} {noun}
        </span>
      </div>
      {remaining > 0 && (
        <p className="flex items-start gap-2 rounded-md border border-destructive/25 bg-destructive-soft px-4 py-3 text-destructive">
          <span>
            <span className="tnum font-semibold">{remaining}</span> {noun} belum dijawab dan akan
            dihitung sebagai tidak dijawab.
          </span>
        </p>
      )}
      <p className="text-muted-foreground">
        Setelah dikumpulkan, sub-tes ini tidak bisa dibuka lagi.
      </p>
    </ConfirmDialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Layar transisi
// ─────────────────────────────────────────────────────────────────────────────

export function ExamLoading({ label = "Menyiapkan soal" }: { label?: string }) {
  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="h-15 bg-surface-nav" />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <p className="sr-only">{label}</p>
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
          <div className="hidden w-72 shrink-0 lg:block">
            <div className="skeleton h-96 w-full rounded-lg" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="skeleton h-80 w-full rounded-lg" />
            <div className="flex gap-3">
              <div className="skeleton h-12 flex-1 rounded-md" />
              <div className="skeleton h-12 flex-1 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExamCompleted({ title, note }: { title: string; note: string }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <span
        className="flex size-14 items-center justify-center rounded-full bg-success-soft text-success"
        aria-hidden="true"
      >
        <Check className="size-7" strokeWidth={2.5} />
      </span>
      <h2 className="font-heading text-2xl text-foreground">{title}</h2>
      <p className="max-w-[42ch] text-sm text-muted-foreground">{note}</p>
    </div>
  );
}
