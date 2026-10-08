"use client";

import { useEffect, useRef, useState } from "react";
import { Button, ConfirmDialog } from "@/app/components/ui-client";
import { Check, ChevronLeft, ChevronRight, CloudOff, Timer } from "@/app/components/icons";
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
// Bar atas (cest .mbar)
// ─────────────────────────────────────────────────────────────────────────────

/* Satu bar navy untuk semua layar tes dan latihan: judul, hitungan, timer, aksi.
   `children` = baris tambahan di bawah bar (mis. segmen kolom Kecermatan). */
export function ExamBar({
  title,
  count,
  timer,
  actions,
  children,
}: {
  title: string;
  count?: React.ReactNode;
  timer?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="mbar-wrap">
      <header className="mbar">
        <strong className="mbar-title">{title}</strong>
        {count && <span className="mbar-count truncate">{count}</span>}
        <span className="sp" />
        {timer}
        {actions}
      </header>
      {children}
    </div>
  );
}

export function ExamTimer({
  seconds,
  unit,
  label = "Sisa waktu",
  muted = false,
}: {
  seconds: number;
  /** Sufiks satuan (mis. "dtk") bila yang ditampilkan detik mentah, bukan m:ss. */
  unit?: string;
  label?: string;
  /** Layar transisi: timer tidak boleh menyala kuning/merah. */
  muted?: boolean;
}) {
  // Ambang menurut skala: waktu sub-tes (menit) vs. detik per kolom Kecermatan.
  const [warnAt, critAt] = unit ? [20, 10] : [300, 60];
  const critical = !muted && seconds <= critAt;
  const warning = !muted && !critical && seconds <= warnAt;
  return (
    <span className={`mtimer ${critical ? "critical" : warning ? "low" : ""}`}>
      <Timer className="size-4" />
      <span className="sr-only">{label}</span>
      <span className="tnum">{unit ? seconds : formatTime(seconds)}</span>
      {unit && <span className="text-xs font-semibold opacity-80">{unit}</span>}
    </span>
  );
}

type ExamHeaderProps = {
  title: string;
  itemLabel: string;
  current: number;
  total: number;
  answered: number;
  secondsLeft: number;
  saveState?: SaveState;
  pendingCount?: number;
  /** Tombol "Selesai" di bar (seperti End Test di cest). */
  onEnd?: () => void;
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
  onEnd,
}: ExamHeaderProps) {
  const announcement = useTimeAnnouncement(secondsLeft);
  const status =
    saveState === "saved"
      ? "Tersimpan di server"
      : saveState === "saving"
        ? "Menyimpan…"
        : saveState === "error"
          ? "Belum tersimpan"
          : `${pendingCount} menunggu`;

  return (
    <>
      <ExamBar
        title={title}
        count={
          <>
            <span className="tnum">
              {itemLabel} {current} dari {total}
            </span>
            <span className="mbar-sub-hide max-sm:hidden">
              {" · "}
              <span className="tnum">{answered} terjawab</span>
              {" · "}
              <span role="status">{status}</span>
            </span>
          </>
        }
        timer={<ExamTimer seconds={secondsLeft} />}
        actions={
          onEnd && (
            <button type="button" className="mbtn" onClick={onEnd}>
              Selesai
            </button>
          )
        }
      />
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Navigator soal (cest nav pane)
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
    <div>
      <div className="dnav-head">
        <div>
          <p className="dnav-kicker">{secondsLeft == null ? "Mode latihan" : `Navigasi ${itemLabel.toLowerCase()}`}</p>
          <p className="dnav-count">
            <b className="tnum">{currentIndex + 1}</b> / {questionIds.length}
            <span>{secondsLeft == null ? "Tanpa batas waktu" : `${answeredCount} terjawab`}</span>
          </p>
        </div>
      </div>

      <ul className="dnav-legend">
        <li>
          <span className="dnum is-done" aria-hidden="true" />
          Terjawab
          <b>{answeredCount}</b>
        </li>
        <li>
          <span className="dnum" aria-hidden="true" />
          Kosong
          <b>{unansweredCount}</b>
        </li>
      </ul>

      <h3 className="dnav-title">Nomor {itemLabel}</h3>
      <div className="dnav-grid">
        {questionIds.map((id, index) => {
          const answered = Boolean(answers[id]);
          const current = index === currentIndex;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onGoTo(index)}
              aria-current={current ? "step" : undefined}
              aria-label={`${itemLabel} ${index + 1}${answered ? ", sudah dijawab" : ", belum dijawab"}`}
              className={`dnum ${answered ? "is-done" : ""}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {onSubmit && (
        <Button variant="danger" size="lg" block className="mt-6" onClick={onSubmit}>
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
      <details
        ref={detailsRef}
        className="group/nav mx-4 mt-4 overflow-hidden rounded-lg border border-border bg-card sm:mx-6 lg:hidden"
      >
        <summary
          ref={summaryRef}
          className="flex min-h-12 list-none items-center justify-between gap-3 px-4 py-3 font-heading text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden"
        >
          <span>Navigasi {noun}</span>
          <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="tnum group-open/nav:hidden">
              {answeredCount}/{props.questionIds.length}
            </span>
            <span className="hidden text-brand-ink group-open/nav:inline">Tutup</span>
          </span>
        </summary>
        <div className="border-t border-border p-4">
          <NavigatorContent {...mobileProps} />
        </div>
      </details>

      <aside
        className="order-2 hidden bg-card p-5 lg:sticky lg:top-[58px] lg:block lg:h-[calc(100dvh-58px)] lg:w-[300px] lg:shrink-0 lg:overflow-auto lg:border-l lg:border-border"
        aria-label={`Navigasi ${noun}`}
      >
        <NavigatorContent {...props} />
      </aside>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Badan layar tes + dock navigasi
// ─────────────────────────────────────────────────────────────────────────────

/* Tata letak cest: konten di tengah (maks 1132px), panel navigator menempel di kanan. */
export function ExamBody({
  navigator,
  children,
}: {
  navigator?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-start">
      {navigator}
      <main className="min-w-0 flex-1 px-4 pb-32 pt-6 sm:px-6 lg:px-8 lg:pt-8">
        <div className="mx-auto max-w-[1132px] space-y-4">{children}</div>
      </main>
    </div>
  );
}

/* Tombol maju (bulat emas, seperti #m-next cest) dan mundur (bulat putih) melayang di kanan bawah. */
export function ExamDock({
  onPrev,
  onNext,
  prevDisabled,
  nextDisabled,
  prevLabel = "Sebelumnya",
  nextLabel = "Berikutnya",
  noPane = false,
}: {
  onPrev: () => void;
  onNext: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  prevLabel?: string;
  nextLabel?: string;
  /** Layar tanpa panel navigator di kanan. */
  noPane?: boolean;
}) {
  return (
    <nav className={`xdock ${noPane ? "no-pane" : ""}`} aria-label="Navigasi">
      <button type="button" className="xround is-prev" onClick={onPrev} disabled={prevDisabled} aria-label={prevLabel} title={prevLabel}>
        <ChevronLeft />
      </button>
      <button type="button" className="xround" onClick={onNext} disabled={nextDisabled} aria-label={nextLabel} title={nextLabel}>
        <ChevronRight />
      </button>
    </nav>
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
