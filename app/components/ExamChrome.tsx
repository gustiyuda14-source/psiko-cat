"use client";

type ExamHeaderProps = {
  title: string;
  itemLabel: string;
  current: number;
  total: number;
  answered: number;
  secondsLeft: number;
};

function formatTime(total: number): string {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function ExamHeader({
  title,
  itemLabel,
  current,
  total,
  answered,
  secondsLeft,
}: ExamHeaderProps) {
  const lowTime = secondsLeft <= 300;
  const progress = total ? Math.round((answered / total) * 100) : 0;

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-primary text-primary-foreground shadow-[0_10px_30px_-24px_rgba(7,24,46,0.9)]">
      <div className="mx-auto flex min-h-[68px] max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold sm:text-base">{title}</p>
          <p className="mt-0.5 text-xs text-white/70 sm:text-sm">
            {itemLabel} {current} dari {total}
            <span className="hidden sm:inline"> · {answered} terjawab</span>
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/65">Sisa waktu</p>
          <p
            className={`font-mono text-xl font-bold tabular-nums sm:text-2xl ${
              lowTime ? "text-accent" : "text-primary-foreground"
            }`}
            aria-label={`Sisa waktu ${formatTime(secondsLeft)}`}
          >
            {formatTime(secondsLeft)}
          </p>
        </div>
      </div>
      <div
        className="h-1 bg-white/10"
        role="progressbar"
        aria-label="Kemajuan jawaban"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div
          className="h-full origin-left bg-accent transition-transform duration-300"
          style={{ transform: `scaleX(${progress / 100})` }}
        />
      </div>
    </header>
  );
}

type QuestionNavigatorProps = {
  typeLabel: string;
  itemLabel: string;
  questionIds: string[];
  answers: Record<string, string>;
  currentIndex: number;
  onGoTo: (index: number) => void;
  onSubmit: () => void;
};

function NavigatorContent({
  typeLabel,
  itemLabel,
  questionIds,
  answers,
  currentIndex,
  onGoTo,
  onSubmit,
}: QuestionNavigatorProps) {
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-foreground">{typeLabel}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {answeredCount} dari {questionIds.length} terjawab
        </p>
      </div>

      <div className="grid max-h-72 grid-cols-6 gap-2 overflow-y-auto pr-1 sm:grid-cols-8 lg:grid-cols-5">
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
              className={`flex size-11 flex-col items-center justify-center rounded-xl border text-xs font-bold transition-colors ${
                current
                  ? "border-primary bg-primary text-primary-foreground"
                  : answered
                    ? "border-success/30 bg-success-soft text-success"
                    : "border-border bg-card text-muted-foreground hover:border-primary/35 hover:text-primary"
              }`}
            >
              <span>{index + 1}</span>
              {answered && !current && <span aria-hidden="true" className="text-[8px] leading-none">✓</span>}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-3 text-[11px] text-muted-foreground">
        <span><b className="text-success">✓</b> Dijawab</span>
        <span><b className="text-primary">■</b> Aktif</span>
        <span><b>□</b> Belum</span>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        className="min-h-12 w-full rounded-xl bg-success px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-success/90 active:bg-success"
      >
        Selesai dan Kumpulkan
      </button>
    </div>
  );
}

export function QuestionNavigator(props: QuestionNavigatorProps) {
  return (
    <>
      <details className="surface-card group lg:hidden">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-foreground marker:content-none">
          Navigasi {props.itemLabel.toLowerCase()}
          <span className="font-mono text-xs font-medium text-muted-foreground group-open:hidden">
            {Object.keys(props.answers).length}/{props.questionIds.length}
          </span>
          <span aria-hidden="true" className="hidden text-primary group-open:inline">Tutup</span>
        </summary>
        <div className="border-t border-border p-4">
          <NavigatorContent {...props} />
        </div>
      </details>

      <aside className="surface-card sticky top-24 order-2 hidden w-72 shrink-0 p-4 lg:block" aria-label={`Navigasi ${props.itemLabel.toLowerCase()}`}>
        <NavigatorContent {...props} />
      </aside>
    </>
  );
}

export function OfflineNotice() {
  return (
    <div className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-md rounded-xl border border-destructive/25 bg-card px-4 py-3 shadow-[0_20px_50px_-24px_rgba(16,33,59,0.75)]" role="status">
      <p className="text-sm font-semibold text-destructive">Koneksi terputus</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Timer tetap berjalan. Jawaban akan dikirim saat koneksi kembali.
      </p>
    </div>
  );
}
