import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { SLUG_TO_MODULE } from "@/lib/test-config";
import type { SafeQuestion } from "@/lib/types/safe-question";
import LatihanGate from "./LatihanGate";

// Latihan/Training: tanpa waktu, client-only, TIDAK menyentuh test_sessions/module_sessions.
// Soal diambil langsung server-side (SafeQuestion, scoring_rule tidak pernah ikut terkirim).
// Auth dijamin proxy.ts (semua path non-publik wajib punya cookie sesi) — rute ini
// sengaja di luar app/dashboard supaya sidebar tidak ikut ter-render saat latihan berjalan.
// Kecermatan TIDAK pernah lewat sini: pemilih paketnya ada di
// app/dashboard/latihan/kecermatan/page.tsx dan sesinya di ../kecermatan/[package].
export default async function LatihanPage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: slug } = await params;
  const moduleType = SLUG_TO_MODULE[slug];
  if (!moduleType) notFound();

  const { data: questions } = await supabaseAdmin
    .from("questions")
    .select("id, type, sequence_number, column_index, options_payload, is_active, created_at, updated_at")
    .eq("type", moduleType)
    .eq("is_active", true)
    .order("column_index", { ascending: true })
    .order("sequence_number", { ascending: true });

  const safeQuestions = (questions ?? []) as unknown as SafeQuestion[];

  return <LatihanGate moduleType={moduleType} questions={safeQuestions} />;
}
