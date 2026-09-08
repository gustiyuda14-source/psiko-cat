import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { WeeklyFrequencyChart, NapTrendChart } from "./ActivityCharts";

function greeting(hour: number): string {
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 19) return "Selamat sore";
  return "Selamat malam";
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const { data: sessions } = await supabaseAdmin
    .from("test_sessions")
    .select("id, status, nap_score, is_passed, completed_at, created_at")
    .eq("user_id", session.sub)
    .order("created_at", { ascending: false });

  const completedSessions = (sessions ?? []).filter(
    (s) => s.status === "COMPLETED" || s.status === "DISQUALIFIED"
  );
  const bestScore = completedSessions.length
    ? Math.max(...completedSessions.map((s) => s.nap_score ?? 0))
    : null;

  return (
    <div className="space-y-6 p-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[2rem] bg-[#0b2442] px-7 py-8 text-white shadow-[0_24px_60px_-26px_rgba(12,35,66,0.72)]">
        <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-accent/20 blur-3xl" />
        <p className="relative inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs">
          {greeting(new Date().getHours())}
        </p>
        <h1 className="relative mt-4 text-2xl font-semibold">{session.name}</h1>
        <p className="relative mt-1 text-sm text-slate-300">@{session.username}</p>
        <Link
          href="/dashboard/simulasi"
          className="relative mt-6 inline-flex min-h-11 items-center rounded-xl bg-accent px-5 text-sm font-bold text-primary shadow-[0_12px_24px_-12px_rgba(217,152,63,0.9)] transition-all duration-200 hover:-translate-y-0.5"
        >
          Mulai Simulasi
        </Link>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-[0_10px_28px_-20px_rgba(16,33,59,0.35)]">
          <p className="text-2xl font-bold text-foreground">{completedSessions.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Total Tes</p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-[0_10px_28px_-20px_rgba(16,33,59,0.35)]">
          <p className="text-2xl font-bold text-success">
            {completedSessions.filter((s) => s.is_passed).length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Lulus</p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-[0_10px_28px_-20px_rgba(16,33,59,0.35)]">
          <p className="text-2xl font-bold text-primary">{bestScore?.toFixed(1) ?? "-"}</p>
          <p className="mt-1 text-xs text-muted-foreground">Skor Terbaik</p>
        </div>
      </div>

      {/* Ringkasan aktivitas */}
      {sessions && sessions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Ringkasan Aktivitas
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <WeeklyFrequencyChart sessions={sessions} />
            <NapTrendChart sessions={completedSessions} />
          </div>
        </div>
      )}
    </div>
  );
}
