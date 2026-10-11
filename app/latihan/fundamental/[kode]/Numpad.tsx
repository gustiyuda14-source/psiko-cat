"use client";

import { useEffect } from "react";

/* Numpad sentuh 3×4 + keyboard fisik (angka, Backspace, Enter). Dipakai kedua sesi fundamental.
   Tanpa onDelete/onEnter tombolnya tidak tampil (Rekening Koran: jawaban tidak bisa dihapus). */
export default function Numpad({
  onDigit,
  onDelete,
  onEnter,
  enterLabel = "OK",
  disabled = false,
}: {
  onDigit: (d: string) => void;
  onDelete?: () => void;
  onEnter?: () => void;
  enterLabel?: string;
  disabled?: boolean;
}) {
  useEffect(() => {
    if (disabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || /INPUT|TEXTAREA/.test((e.target as HTMLElement).tagName)) return;
      if (/^[0-9]$/.test(e.key)) onDigit(e.key);
      else if (e.key === "Backspace" && onDelete) onDelete();
      else if (e.key === "Enter" && onEnter) onEnter();
      else return;
      e.preventDefault();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [disabled, onDigit, onDelete, onEnter]);

  return (
    <div className="fd-pad" role="group" aria-label="Numpad">
      {["7", "8", "9", "4", "5", "6", "1", "2", "3"].map((d) => (
        <button key={d} type="button" className="fd-key tnum" onClick={() => onDigit(d)} disabled={disabled}>
          {d}
        </button>
      ))}
      {onDelete ? (
        <button type="button" className="fd-key is-fn" onClick={onDelete} disabled={disabled} aria-label="Hapus satu angka">
          ⌫
        </button>
      ) : (
        <span aria-hidden="true" />
      )}
      <button type="button" className="fd-key tnum" onClick={() => onDigit("0")} disabled={disabled}>
        0
      </button>
      {onEnter ? (
        <button type="button" className="fd-key is-enter" onClick={onEnter} disabled={disabled}>
          {enterLabel}
        </button>
      ) : (
        <span aria-hidden="true" />
      )}
    </div>
  );
}
