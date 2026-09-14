import { ChevronDown } from "@/app/components/icons";

/*
  Kosakata komponen tunggal — bagian yang tidak butuh JS di browser.

  Dipisah dari ui-client.tsx supaya halaman yang seluruhnya dirender di server
  (Review, Hasil, Admin, Simulasi) tidak menyeret bundel klien hanya karena
  memakai Badge atau Meter.


  Sebelumnya tiap permukaan menulis ulang string class tombolnya sendiri, jadi
  "tombol simpan" tidak sama bentuknya di dua halaman. Semua permukaan sekarang
  memanggil `buttonStyles` yang sama, termasuk <Link> (lewat className) supaya
  tautan yang berperan sebagai tombol tidak jadi cabang gaya kedua.
*/

// ─────────────────────────────────────────────────────────────────────────────
// Button
// ─────────────────────────────────────────────────────────────────────────────

export type Variant = "primary" | "accent" | "secondary" | "ghost" | "danger";
export type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  // Aksi utama di permukaan terang.
  primary:
    "btn-primary bg-primary text-primary-foreground shadow-e1 hover:bg-primary-hover active:bg-primary-active",
  // CTA bermuatan merek. Gold hanya sebagai background dengan teks navy.
  // btn-accent-metal menambahkan gradient logam, tapi HANYA di dalam .ornate —
  // di permukaan light, bg-accent yang flat tetap yang berlaku.
  accent:
    "btn-accent-metal bg-accent text-primary shadow-e2 hover:bg-accent-strong active:bg-accent-strong",
  // Aksi pendamping. Border cukup kuat untuk lolos 3:1 sebagai batas kontrol.
  secondary:
    "btn-secondary border border-border-strong/55 bg-card text-foreground shadow-e1 hover:border-border-strong hover:bg-surface-inset active:bg-surface-inset",
  ghost: "text-muted-foreground hover:bg-surface-inset hover:text-foreground",
  danger:
    "border border-destructive/45 bg-card text-destructive hover:border-destructive hover:bg-destructive-soft",
};

const SIZE: Record<Size, string> = {
  sm: "min-h-9 gap-1.5 px-3 text-xs",
  // 44px — target sentuh minimum. Default untuk hampir semua kontrol.
  md: "min-h-11 gap-2 px-4 text-sm",
  lg: "min-h-12 gap-2 px-5 text-sm",
};

export function buttonStyles({
  variant = "secondary",
  size = "md",
  block = false,
  className = "",
}: {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  className?: string;
} = {}) {
  return [
    "inline-flex items-center justify-center rounded-md font-semibold",
    "transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out",
    "active:translate-y-px",
    "disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none",
    VARIANT[variant],
    SIZE[size],
    block ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

// ─────────────────────────────────────────────────────────────────────────────
// Badge
// ─────────────────────────────────────────────────────────────────────────────

type Tone = "neutral" | "info" | "success" | "danger" | "accent";

const TONE: Record<Tone, string> = {
  neutral: "border-border bg-surface-inset text-muted-foreground",
  info: "badge-info border-primary/20 bg-primary/8 text-primary",
  success: "border-success/25 bg-success-soft text-success",
  danger: "border-destructive/25 bg-destructive-soft text-destructive",
  accent: "border-accent/35 bg-accent-soft text-accent-ink",
};

export function Badge({
  tone = "neutral",
  className = "",
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`badge-base inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${TONE[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PageHeader
// ─────────────────────────────────────────────────────────────────────────────

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="hero-panel on-nav flex flex-wrap items-end justify-between gap-5">
      <div className="relative min-w-0 flex-1 basis-72">
        <h1 className="font-heading text-2xl text-white sm:text-3xl">{title}</h1>
        {description && (
          <p className="mt-3 max-w-[68ch] text-sm text-white/75">{description}</p>
        )}
      </div>
      {actions && <div className="relative flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Accordion
// ─────────────────────────────────────────────────────────────────────────────

/*
  <details>/<summary> native dengan marker sendiri. Marker bawaan browser
  ukurannya tidak bisa dikontrol dan posisinya berbeda antar mesin render, jadi
  di sini diganti chevron yang berbagi ketebalan garis dengan ikon lain.
*/

export function Accordion({
  label,
  summary,
  trailing,
  defaultOpen = false,
  children,
}: {
  label: string;
  summary?: React.ReactNode;
  trailing?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details className="surface-card group/acc overflow-hidden" open={defaultOpen}>
      <summary className="flex min-h-14 list-none items-center gap-3 px-4 py-3 transition-colors duration-200 hover:bg-surface-inset sm:px-5 [&::-webkit-details-marker]:hidden">
        <ChevronDown className="size-4 shrink-0 text-faint-foreground transition-transform duration-200 ease-out group-open/acc:rotate-180" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground">{label}</span>
          {summary && (
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">{summary}</span>
          )}
        </span>
        {trailing}
      </summary>
      <div className="border-t border-border px-4 py-4 sm:px-5">{children}</div>
    </details>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Meter
// ─────────────────────────────────────────────────────────────────────────────

/*
  Bar selalu dianimasikan lewat scaleX, tidak pernah lewat width — width memicu
  layout pada tiap frame.
*/
export function Meter({
  value,
  max,
  tone = "primary",
  className = "",
  label,
}: {
  value: number;
  max: number;
  tone?: "primary" | "success" | "accent" | "danger";
  className?: string;
  label?: string;
}) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const fill = {
    primary: "bg-primary",
    success: "bg-success",
    accent: "bg-accent",
    danger: "bg-destructive",
  }[tone];

  return (
    <div
      className={`meter-track h-1.5 overflow-hidden rounded-full bg-surface-inset ${className}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value * 10) / 10}
    >
      <div
        className={`h-full origin-left rounded-full transition-transform duration-300 ease-out ${fill}`}
        style={{ transform: `scaleX(${ratio})` }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EmptyState
// ─────────────────────────────────────────────────────────────────────────────

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="surface-card flex flex-col items-center gap-2 px-6 py-12 text-center">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="max-w-[46ch] text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
