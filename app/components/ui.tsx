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
  // Aksi utama: gradasi emas dengan teks navy, seperti .btn-primary di dajiks-cest.
  primary: "btn-gold border border-transparent",
  // CTA bermuatan merek: tampilan sama dengan primary (cest hanya punya satu gaya emas).
  accent: "btn-gold border border-transparent shadow-e1",
  // Aksi pendamping = .btn-ghost cest: putih, garis krem, hover krem + garis emas.
  secondary:
    "border border-border bg-card text-foreground hover:border-accent hover:bg-surface-inset active:bg-surface-inset",
  ghost: "border border-transparent text-muted-foreground hover:bg-surface-inset hover:text-foreground",
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
    "inline-flex items-center justify-center rounded-md font-heading font-semibold",
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
  neutral: "bg-[#eef0f3] text-[#3d4a5c]",
  info: "bg-[#e8ebf5] text-brand-ink",
  success: "bg-success-soft text-success",
  danger: "bg-destructive-soft text-destructive",
  accent: "bg-[#f6edd6] text-[#7a5710]",
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
      className={`inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 font-heading text-[0.72rem] font-bold uppercase tracking-[0.12em] ${TONE[tone]} ${className}`}
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
  kicker,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  /** Label kecil di atas judul, mis. "Beranda". */
  kicker?: string;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-5">
      <div className="min-w-0 flex-1 basis-72">
        {kicker && <span className="section-kicker">{kicker}</span>}
        <h1 className="mb-2 mt-1 text-[clamp(1.45rem,2.4vw,2rem)] font-bold leading-tight">{title}</h1>
        {description && <p className="muted max-w-[75ch]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
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
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border px-6 py-12 text-center">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="max-w-[46ch] text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
