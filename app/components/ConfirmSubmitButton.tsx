"use client";

import { useRef, useState } from "react";
import { ConfirmDialog } from "@/app/components/ui-client";

/*
  Konfirmasi aksi tak-bisa-dibatalkan lewat dialog aplikasi, bukan
  window.confirm().

  window.confirm memblokir main thread, tampilannya di luar bahasa visual app,
  dan di layar ujian penuh ia muncul sebagai kotak sistem yang justru tidak
  terbaca sebagai bagian dari tes. Perilaku form tidak berubah: konfirmasi
  memanggil requestSubmit() pada form yang sama.
*/
export default function ConfirmSubmitButton({
  message,
  title = "Konfirmasi",
  confirmLabel = "Ya, lanjutkan",
  tone = "primary",
  className,
  children,
}: {
  message: string;
  title?: string;
  confirmLabel?: string;
  tone?: "primary" | "accent" | "danger";
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)} ref={ref}>
        {children}
      </button>

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);
          ref.current?.form?.requestSubmit();
        }}
        title={title}
        confirmLabel={confirmLabel}
        tone={tone}
      >
        <p className="text-muted-foreground">{message}</p>
      </ConfirmDialog>
    </>
  );
}
