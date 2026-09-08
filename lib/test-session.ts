import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type ModuleType = "KECERDASAN" | "KECERMATAN" | "KEPRIBADIAN";

export type ModuleConfigEntry = {
  slug: string;
  time_limit_seconds: number;
  label: string;
  shortDesc: string;
};

export const MODULE_CONFIG: Record<ModuleType, ModuleConfigEntry> = {
  KECERDASAN: { slug: "kecerdasan", time_limit_seconds: 5400, label: "Kecerdasan", shortDesc: "kognitif & spasial" },
  KECERMATAN: { slug: "kecermatan", time_limit_seconds: 600, label: "Kecermatan", shortDesc: "10 lajur simbol" },
  KEPRIBADIAN: { slug: "kepribadian", time_limit_seconds: 3600, label: "Kepribadian", shortDesc: "skala Likert" },
};

export const MODULE_ORDER: ModuleType[] = ["KECERDASAN", "KECERMATAN", "KEPRIBADIAN"];

export const KECERMATAN_PACKAGES = [3, 4, 5, 6, 7, 8];

export function pickRandomKecermatanPackage(): number {
  return KECERMATAN_PACKAGES[Math.floor(Math.random() * KECERMATAN_PACKAGES.length)];
}

export const SLUG_TO_MODULE: Record<string, ModuleType> = Object.fromEntries(
  (Object.entries(MODULE_CONFIG) as [ModuleType, ModuleConfigEntry][]).map(
    ([type, cfg]) => [cfg.slug, type]
  )
);

// Buat TestSession baru berisi ModuleSession untuk tiap module_type yang diminta
// (urutan array = sequence_order), lalu redirect ke halaman overview session.
export async function createTestSessionAndRedirect(userId: string, moduleTypes: ModuleType[]) {
  const { data: testSession, error: sessionError } = await supabaseAdmin
    .from("test_sessions")
    .insert({ user_id: userId, status: "PENDING" })
    .select("id")
    .single();

  if (sessionError || !testSession) redirect("/dashboard");

  const kecermatanPackage = moduleTypes.includes("KECERMATAN") ? pickRandomKecermatanPackage() : null;

  await supabaseAdmin.from("module_sessions").insert(
    moduleTypes.map((type, i) => ({
      test_session_id: testSession.id,
      module_type: type,
      sequence_order: i + 1,
      status: "NOT_STARTED",
      time_limit_seconds: MODULE_CONFIG[type].time_limit_seconds,
      kecermatan_package_number: type === "KECERMATAN" ? kecermatanPackage : null,
    }))
  );

  redirect(`/test/${testSession.id}`);
}
