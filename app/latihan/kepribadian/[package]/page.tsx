import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { KEPRIBADIAN_PACKAGES, KEPRIBADIAN_PACKAGE_LABELS } from "@/lib/test-config";
import type { SafeQuestion } from "@/lib/types/safe-question";
import LatihanGate from "@/app/latihan/[module]/LatihanGate";

// Sama seperti ../../kecermatan/[package]/page.tsx. Auth dijamin proxy.ts,
// di luar app/dashboard supaya sidebar tidak ikut ter-render saat latihan berjalan.
export default async function LatihanKepribadianPackagePage({
  params,
}: {
  params: Promise<{ package: string }>;
}) {
  const { package: packageParam } = await params;
  const pkg = Number(packageParam);
  if (!KEPRIBADIAN_PACKAGES.includes(pkg)) notFound();

  const { data: questions } = await supabaseAdmin
    .from("questions")
    .select("id, type, sequence_number, column_index, package_number, options_payload, is_active, created_at, updated_at")
    .eq("type", "KEPRIBADIAN")
    .eq("is_active", true)
    .eq("package_number", pkg)
    .order("sequence_number", { ascending: true });

  const safeQuestions = (questions ?? []) as unknown as SafeQuestion[];

  return <LatihanGate moduleType="KEPRIBADIAN" questions={safeQuestions} packageLabel={KEPRIBADIAN_PACKAGE_LABELS[pkg]} progressKey={`/latihan/kepribadian/${pkg}`} />;
}
