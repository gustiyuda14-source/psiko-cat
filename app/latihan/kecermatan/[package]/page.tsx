import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { KECERMATAN_PACKAGES, KECERMATAN_PACKAGE_LABELS } from "@/lib/test-config";
import type { SafeQuestion } from "@/lib/types/safe-question";
import LatihanGate from "@/app/latihan/[module]/LatihanGate";

// Auth dijamin proxy.ts, sama seperti ../../[module]/page.tsx. Di luar app/dashboard
// supaya sidebar tidak ikut ter-render saat latihan berjalan.
export default async function LatihanKecermatanPackagePage({
  params,
}: {
  params: Promise<{ package: string }>;
}) {
  const { package: packageParam } = await params;
  const pkg = Number(packageParam);
  if (!KECERMATAN_PACKAGES.includes(pkg)) notFound();

  const { data: questions } = await supabaseAdmin
    .from("questions")
    .select("id, type, sequence_number, column_index, package_number, options_payload, is_active, created_at, updated_at")
    .eq("type", "KECERMATAN")
    .eq("is_active", true)
    .eq("package_number", pkg)
    .order("column_index", { ascending: true })
    .order("sequence_number", { ascending: true });

  const safeQuestions = (questions ?? []) as unknown as SafeQuestion[];

  return <LatihanGate moduleType="KECERMATAN" questions={safeQuestions} packageLabel={KECERMATAN_PACKAGE_LABELS[pkg]} progressKey={`/latihan/kecermatan/${pkg}`} />;
}
