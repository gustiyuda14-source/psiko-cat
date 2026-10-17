"use client";

import Link from "next/link";
import { useId, useRef, type CSSProperties, type ReactNode } from "react";

/*
  Kartu "Potongan Lembar" (CSS: .lb-* di app/lembar.css). Dengan `petunjuk`, kartu = tombol yang membuka
  lembar petunjuk (<dialog> native: fokus terkunci, Escape menutup, fokus kembali ke kartu); "Mulai" menuju `href`.
  Tanpa `petunjuk`, kartu = tautan biasa. Spesimen dirender di server dan masuk lewat `spec`.
*/
export type Petunjuk = {
  /** Satu kalimat di bawah judul lembar petunjuk. */
  ringkas: string;
  fakta: [string, ReactNode][];
  aturan: ReactNode[];
  catatan?: ReactNode;
};

const ARROW = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

export function LembarSheet({
  href,
  code,
  side,
  title,
  line,
  cta,
  spec,
  tall,
  quiet,
  layout,
  petunjuk,
}: {
  href: string;
  code: string;
  side: string;
  title: string;
  line: string;
  cta: string;
  spec: ReactNode;
  /** Spesimen dibagi atas-bawah (kartu dua baris). */
  tall?: boolean;
  quiet?: boolean;
  /** --c (bentang kolom dari 12), --r (bentang baris), --i (urutan animasi masuk). Kosong = diatur pembungkus. */
  layout?: { c?: number; r?: number; i?: number };
  petunjuk?: Petunjuk;
}) {
  const dlg = useRef<HTMLDialogElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const id = useId();
  const style = layout && ({ "--c": layout.c, "--r": layout.r, "--i": layout.i } as CSSProperties);
  const cls = `lb-sheet${quiet ? " is-quiet" : ""}`;
  const label = `${title}, ${code}. ${cta}`;
  const inner = (
    <>
      <span className={`lb-spec${tall ? " is-tall" : ""}`} aria-hidden="true">
        {spec}
      </span>
      <span className="lb-tear" aria-hidden="true" />
      <span className="lb-id">
        <span className="lb-code">
          <span>{code}</span>
          <span>{side}</span>
        </span>
        <span className="lb-title">{title}</span>
        <span className="lb-line">{line}</span>
        <span className="lb-go">
          {cta}
          {ARROW}
        </span>
      </span>
    </>
  );

  if (!petunjuk)
    return (
      <Link href={href} className={cls} style={style} aria-label={label}>
        {inner}
      </Link>
    );

  return (
    <>
      <button ref={btn} type="button" className={cls} style={style} aria-label={label} aria-haspopup="dialog" onClick={() => dlg.current?.showModal()}>
        {inner}
      </button>
      <dialog
        ref={dlg}
        className="lb-dialog"
        aria-labelledby={`${id}-t`}
        onClose={() => btn.current?.focus()}
        // Klik di luar lembar (latar) menutup; isi lembar membungkus seluruh area dialog.
        onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
      >
        <div className="lb-dlg-top">
          <span className="lb-dlg-kicker">
            <span>Lembar petunjuk · {code}</span>
            <span>{side}</span>
          </span>
          <h2 id={`${id}-t`}>{title}</h2>
          <p>{petunjuk.ringkas}</p>
        </div>
        <span className="lb-tear" aria-hidden="true" />
        <div className="lb-dlg-body">
          <dl className="lb-fakta">
            {petunjuk.fakta.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <p className="lb-aturan-h">Petunjuk</p>
          <ol className="lb-aturan">
            {petunjuk.aturan.map((a, i) => (
              <li key={i}>
                <span>{a}</span>
              </li>
            ))}
          </ol>
          {petunjuk.catatan && (
            <p className="lb-catatan" role="note">
              {petunjuk.catatan}
            </p>
          )}
          <div className="lb-dlg-act">
            <button type="button" className="lb-btn is-ghost" onClick={() => dlg.current?.close()}>
              Batal
            </button>
            <Link href={href} className="lb-btn is-gold">
              {cta}
              {ARROW}
            </Link>
          </div>
        </div>
      </dialog>
    </>
  );
}
