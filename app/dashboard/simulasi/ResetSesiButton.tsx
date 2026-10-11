"use client";

import { buttonStyles } from "@/app/components/ui";

export default function ResetSesiButton({ action, count }: { action: () => Promise<void>; count: number }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Hapus ${count} sesi yang belum selesai?\nJawaban di sesi itu ikut terhapus. Riwayat nilai tidak berubah.`))
          e.preventDefault();
      }}
    >
      <button type="submit" className={buttonStyles({ variant: "secondary", size: "md" })}>
        Reset dari nol
      </button>
    </form>
  );
}
