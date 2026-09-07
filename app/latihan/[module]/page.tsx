import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { SLUG_TO_MODULE } from "@/lib/test-session";
import type { SafeQuestion } from "@/lib/types/safe-question";
import LatihanKecerdasan from "./LatihanKecerdasan";
import LatihanKepribadian from "./LatihanKepribadian";
import LatihanKecermatan from "./LatihanKecermatan";

// Latihan/Training: tanpa waktu, client-only, TIDAK menyentuh test_sessions/module_sessions.
// Soal diambil langsung server-side (SafeQuestion, scoring_rule tidak pernah ikut terkirim).
export default async function LatihanPage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: slug } = await params;
  const moduleType = SLUG_TO_MODULE[slug];
  if (!moduleType) notFound();

  const session = await getSession();
  if (!session) redirect("/login");

  const { data: questions } = await supabaseAdmin
    .from("questions")
    .select("id, type, sequence_number, column_index, options_payload, is_active, created_at, updated_at")
    .eq("type", moduleType)
    .eq("is_active", true)
    .order("column_index", { ascending: true })
    .order("sequence_number", { ascending: true });

  const safeQuestions = (questions ?? []) as unknown as SafeQuestion[];

  if (moduleType === "KECERDASAN") return <LatihanKecerdasan questions={safeQuestions} />;
  if (moduleType === "KEPRIBADIAN") return <LatihanKepribadian questions={safeQuestions} />;
  return <LatihanKecermatan questions={safeQuestions} />;
}
