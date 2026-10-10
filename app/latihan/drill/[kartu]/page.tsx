import { notFound } from "next/navigation";
import { DRILL_CARDS } from "@/lib/drill-cards";
import { drillItemsFor } from "@/lib/drill-bank";
import DrillSession from "./DrillSession";

// Di luar app/dashboard supaya sidebar tidak ikut tampil saat drill berjalan (sama seperti latihan).
// Auth dijamin proxy.ts. Soal dikirim tanpa kunci/pembahasan (SafeDrillItem).
export default async function DrillSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ kartu: string }>;
  searchParams: Promise<{ tier?: string }>;
}) {
  const { kartu } = await params;
  const card = DRILL_CARDS[kartu];
  if (!card) notFound();
  const tierParam = Number((await searchParams).tier);
  const tier = [1, 2, 3].includes(tierParam) ? tierParam : null;

  return <DrillSession label={card.label} tier={tier} items={drillItemsFor(kartu)} />;
}
