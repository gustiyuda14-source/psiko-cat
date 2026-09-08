import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { SLUG_TO_MODULE, pickRandomKecermatanPackage } from "@/lib/test-session";
import type { SafeQuestion } from "@/lib/types/safe-question";
import LatihanGate from "@/app/latihan/[module]/LatihanGate";

// Latihan/Training: tanpa waktu, client-only, TIDAK menyentuh test_sessions/module_sessions.
// Soal diambil langsung server-side (SafeQuestion, scoring_rule tidak pernah ikut terkirim).
// Auth sudah dijamin oleh app/dashboard/layout.tsx — tidak perlu getSession() di sini.
export default async function LatihanPage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: slug } = await params;
  const moduleType = SLUG_TO_MODULE[slug];
  if (!moduleType) notFound();

  let query = supabaseAdmin
    .from("questions")
    .select("id, type, sequence_number, column_index, package_number, options_payload, is_active, created_at, updated_at")
    .eq("type", moduleType)
    .eq("is_active", true);

  if (moduleType === "KECERMATAN") {
    const kecermatanPackage = pickRandomKecermatanPackage();
    query = query.eq("package_number", kecermatanPackage);
  }

  const { data: questions } = await query
    .order("column_index", { ascending: true })
    .order("sequence_number", { ascending: true });

  const safeQuestions = (questions ?? []) as unknown as SafeQuestion[];

  return <LatihanGate moduleType={moduleType} questions={safeQuestions} />;
}
