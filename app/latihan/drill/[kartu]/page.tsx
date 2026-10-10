import { notFound } from "next/navigation";
import { DRILL_CARDS } from "@/lib/drill-cards";
import { drillItemsFor } from "@/lib/drill-bank";
import DrillSession from "./DrillSession";

// Di luar app/dashboard supaya sidebar tidak ikut tampil saat drill berjalan (sama seperti latihan).
// Auth dijamin proxy.ts. Soal dikirim tanpa kunci/pembahasan (SafeDrillItem).
export default async function DrillSessionPage({ params }: { params: Promise<{ kartu: string }> }) {
  const { kartu } = await params;
  const card = DRILL_CARDS[kartu];
  if (!card) notFound();

  return <DrillSession label={card.label} items={drillItemsFor(kartu)} />;
}
