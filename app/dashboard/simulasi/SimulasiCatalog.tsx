"use client";

import { useTransition } from "react";
import { TicketCatalog, type TicketItem } from "@/app/components/TicketCatalog";

/*
  Katalog Simulasi: tryout lengkap + tiga sub-tes sebagai kartu tiket cest.
  Memilih kartu tengah memanggil server action `startSession` (membuat sesi lalu
  redirect), jadi nilai `module` dikirim lewat FormData seperti form lama.
*/
export default function SimulasiCatalog({
  items,
  action,
}: {
  items: TicketItem[];
  action: (formData: FormData) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <>
      <TicketCatalog
        items={items}
        label="simulasi"
        onPick={(item) => {
          const fd = new FormData();
          fd.set("module", String(item.id));
          startTransition(() => action(fd));
        }}
      />
      <p className="sr-only" role="status">
        {pending ? "Membuat sesi…" : ""}
      </p>
    </>
  );
}
