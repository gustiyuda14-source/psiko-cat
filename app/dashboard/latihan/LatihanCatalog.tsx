"use client";

import { useRouter } from "next/navigation";
import { TicketCatalog, type TicketItem } from "@/app/components/TicketCatalog";

/* Katalog Latihan: satu kartu tiket per sub-tes; `id` berisi tujuan (halaman pemilih paket). */
export default function LatihanCatalog({ items }: { items: TicketItem[] }) {
  const router = useRouter();
  return <TicketCatalog items={items} label="latihan" onPick={(item) => router.push(String(item.id))} />;
}
