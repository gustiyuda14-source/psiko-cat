"use client";

import { useEffect, useRef } from "react";
import { buttonStyles, type Size, type Variant } from "@/app/components/ui";

/*
  Bagian kosakata komponen yang butuh JS di browser: tombol dengan handler,
  dan dialog.
*/

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  block?: boolean;
};

export function Button({
  variant,
  size,
  block,
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, size, block, className })}
      {...rest}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dialog
// ─────────────────────────────────────────────────────────────────────────────

/*
  <dialog> native, bukan div ber-position-fixed.

  Yang didapat gratis dan tidak perlu ditulis ulang: focus trap, tombol Esc,
  ::backdrop, dan penempatan di top layer — yang terakhir penting karena panel
  ujian punya ancestor overflow, dan overlay yang dipasang manual akan terpotong
  di sana.
*/

export function Dialog({
  open,
  onClose,
  labelledBy,
  dismissible = true,
  className = "",
  children,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  /** false untuk keputusan yang harus dijawab (mis. lanjut sesi atau mulai ulang). */
  dismissible?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onCancel={(e) => {
        e.preventDefault(); // cegah close native supaya state React tetap sumber kebenaran
        if (dismissible) onClose();
      }}
      onClick={(e) => {
        if (dismissible && e.target === ref.current) onClose();
      }}
      className={`m-auto w-full max-w-[min(30rem,calc(100vw-2rem))] border-0 bg-transparent p-0 backdrop:bg-[#08192f]/60 ${className}`}
    >
      <div className="surface-panel enter-rise p-6 text-left sm:p-7">{children}</div>
    </dialog>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  confirmLabel,
  cancelLabel = "Batal",
  tone = "primary",
  dismissible = true,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "primary" | "accent" | "danger";
  dismissible?: boolean;
  children?: React.ReactNode;
}) {
  const id = `confirm-${title.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <Dialog open={open} onClose={onClose} labelledBy={id} dismissible={dismissible}>
      <h2 id={id} className="font-heading text-xl text-foreground">
        {title}
      </h2>
      {children && <div className="mt-3 space-y-3 text-sm">{children}</div>}
      <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose} className="sm:min-w-28">
          {cancelLabel}
        </Button>
        <Button
          variant={tone === "danger" ? "danger" : tone}
          onClick={onConfirm}
          className="sm:min-w-36"
        >
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}

