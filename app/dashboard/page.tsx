import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import HomeView, { type HomeSession, type KecermatanLatihanScore } from "./HomeView";
import { profilPilihan, psikogramBanyak } from "@/lib/scoring/psikogram-sesi";
import type { ModuleRow } from "@/lib/scoring/psikogram-rs";
import type { HasilPsikogram } from "@/lib/scoring/psikogram";

export default async function DashboardPage() {
  const session = (await getSession())!;

  const [{ data: sessions }, { data: kecermatanScores }] = await Promise.all([
    supabaseAdmin
      .from("test_sessions")
      .select("id, status, nap_score, is_passed, completed_at, created_at, module_sessions(id, module_type, package_number, ke_index, kt_index, kh_index)")
      .eq("user_id", session.sub)
      .order("created_at", { ascending: false }),
    // Skor latihan Kecermatan mode timer (actions.ts); 30 terakhir cukup untuk tren.
    supabaseAdmin
      .from("latihan_kecermatan_scores")
      .select("raw_score, created_at")
      .eq("user_id", session.sub)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  // Tryout lengkap dinilai ulang dengan psikogram profil pilihan peserta: nap_score = nilai akhir 1–85
  // (null bila aspek profil ini belum diuji), is_passed = Memenuhi Syarat.
  const profil = await profilPilihan();
  const rows = (sessions ?? []) as unknown as (HomeSession & { module_sessions: ModuleRow[] })[];
  const full = rows.filter((s) => (s.status === "COMPLETED" || s.status === "DISQUALIFIED") && new Set(s.module_sessions.map((m) => m.module_type)).size === 3);
  const hasil = profil ? await psikogramBanyak(full) : new Map<string, HasilPsikogram[]>();
  const dinilai = rows.map((s) => {
    if (!full.includes(s)) return s;
    const h = hasil.get(s.id)?.find((x) => x.jalur === profil);
    return { ...s, nap_score: h?.nilai_akhir ?? null, is_passed: h?.status === "MS" };
  });

  return (
    <HomeView
      name={session.name}
      profil={profil}
      sessions={dinilai}
      kecermatanScores={(kecermatanScores ?? []) as KecermatanLatihanScore[]}
    />
  );
}
