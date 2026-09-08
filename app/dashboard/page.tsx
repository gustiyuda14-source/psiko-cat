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
  const session = (await getSession())!;

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
    <div className="app-page space-y-6 sm:space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-primary px-6 py-7 text-white shadow-[0_24px_60px_-30px_rgba(12,35,66,0.72)] sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-accent/20 blur-3xl" />
        <p className="relative inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs">
          {greeting(new Date().getHours())}
        </p>
        <h1 className="font-heading relative mt-4 text-2xl font-semibold sm:text-3xl">{session.name}</h1>
        <p className="relative mt-1 text-sm text-white/70">@{session.username}</p>
        <Link
          href="/dashboard/simulasi"
          className="relative mt-6 inline-flex min-h-12 items-center rounded-xl bg-accent px-5 text-sm font-bold text-primary shadow-[0_12px_24px_-16px_rgba(217,152,63,0.9)] transition-colors hover:bg-accent/90"
        >
          Mulai Simulasi
        </Link>
      </section>

      {/* Stat tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="surface-card min-h-28 p-5">
          <p className="text-2xl font-bold text-foreground">{completedSessions.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Total Tes</p>
        </div>
        <div className="surface-card min-h-28 p-5">
          <p className="text-2xl font-bold text-success">
            {completedSessions.filter((s) => s.is_passed).length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Lulus</p>
        </div>
        <div className="surface-card min-h-28 p-5">
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
