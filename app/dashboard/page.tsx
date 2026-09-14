import Link from "next/link";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { WeeklyFrequencyChart, NapTrendChart } from "./ActivityCharts";
import { buttonStyles, EmptyState, Meter } from "@/app/components/ui";
import { ArrowRight } from "@/app/components/icons";

const PASSING_NAP = 61;

function greeting(hour: number): string {
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 19) return "Selamat sore";
  return "Selamat malam";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/*
  Ringkasan ditaruh dalam satu kartu yang dibagi hairline, bukan tiga kartu
  seukuran berjajar. Tiga kartu identik membaca sebagai "struktur halaman"
  padahal isinya satu kelompok angka yang saling dibandingkan.
*/
function SummaryCell({
  label,
  value,
  caption,
  tone = "foreground",
  children,
}: {
  label: string;
  value: string;
  caption?: string;
  tone?: "foreground" | "success" | "primary";
  children?: React.ReactNode;
}) {
  const toneClass = {
    foreground: "text-foreground",
    success: "text-success",
    primary: "text-primary",
  }[tone];

  return (
    <div className={`flex-1 px-5 py-4 sm:px-6 sm:py-5 ${tone === "primary" ? "shadow-glow" : ""}`}>
      <p className="eyebrow">{label}</p>
      <p className={`tnum mt-1.5 font-heading text-3xl ${toneClass}`}>{value}</p>
      {caption && <p className="mt-1 text-xs text-muted-foreground">{caption}</p>}
      {children}
    </div>
  );
}

export default async function DashboardPage() {
  const session = (await getSession())!;

  const { data: sessions } = await supabaseAdmin
    .from("test_sessions")
    .select("id, status, nap_score, is_passed, completed_at, created_at, module_sessions(module_type)")
    .eq("user_id", session.sub)
    .order("created_at", { ascending: false });

  const allSessions = sessions ?? [];
  const completedSessions = allSessions.filter(
    (s) => s.status === "COMPLETED" || s.status === "DISQUALIFIED"
  );
  const fullSessions = completedSessions.filter((s) => {
    const types = new Set(s.module_sessions.map((module) => module.module_type));
    return types.size === 3 && ["KECERDASAN", "KEPRIBADIAN", "KECERMATAN"].every((type) => types.has(type));
  });
  const standaloneCount = completedSessions.length - fullSessions.length;
  const bestScore = fullSessions.length
    ? Math.max(...fullSessions.map((s) => s.nap_score ?? 0))
    : null;
  const passedCount = fullSessions.filter((s) => s.is_passed).length;
  const lastActivity = completedSessions[0]?.completed_at ?? completedSessions[0]?.created_at;

  return (
    <div className="app-page space-y-6">
      <section className="hero-panel on-nav grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-center">
        <div className="relative">
          <p className="text-sm text-white/70">{greeting(new Date().getHours())},</p>
          <h1 className="font-heading mt-2 text-3xl sm:text-4xl">{session.name}</h1>
          <p className="mt-3 text-sm text-white/75">
            {lastActivity
              ? `Tes terakhir ${formatDate(lastActivity)}`
              : "Belum ada tes resmi yang diselesaikan"}
          </p>
          <Link
            href="/dashboard/simulasi"
            className={buttonStyles({ variant: "accent", size: "lg", className: "mt-6 rounded-full" })}
          >
            Mulai simulasi
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="relative border-t border-white/20 pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
          <p className="text-sm font-semibold text-white">Ruang persiapan Anda</p>
          <p className="mt-2 max-w-[34ch] text-sm text-white/75">Asah kecerdasan, ketelitian, dan pemahaman diri sebelum simulasi resmi.</p>
          <Link href="/dashboard/latihan" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white underline decoration-accent underline-offset-8">
            Jelajahi latihan <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {completedSessions.length === 0 ? (
        <EmptyState
          title="Belum ada riwayat tes"
          description="Selesaikan satu simulasi resmi untuk mulai melihat skor NAP, tren, dan pembahasan soal di sini. Latihan tidak dihitung ke riwayat."
          action={
            <Link href="/dashboard/latihan" className={buttonStyles({ variant: "secondary" })}>
              Lihat menu latihan
            </Link>
          }
        />
      ) : (
        <>
          <div className="surface-card summary-strip flex flex-col overflow-hidden divide-y divide-border sm:flex-row sm:divide-x sm:divide-y-0">
            <SummaryCell
              label="Tryout lengkap selesai"
              value={String(fullSessions.length)}
              caption={`${standaloneCount} sesi satu sub-tes · ${allSessions.length} sesi dibuat`}
            />
            <SummaryCell
              label="Lulus tryout"
              value={String(passedCount)}
              tone={passedCount > 0 ? "success" : "foreground"}
              caption={
                fullSessions.length
                  ? `${Math.round((passedCount / fullSessions.length) * 100)}% dari tryout lengkap`
                  : undefined
              }
            />
            <SummaryCell
              label="Skor NAP terbaik"
              value={bestScore != null ? bestScore.toFixed(1) : "—"}
              tone="primary"
            >
              {bestScore != null && (
                <div className="mt-2.5">
                  <Meter
                    value={bestScore}
                    max={100}
                    tone={bestScore >= PASSING_NAP ? "success" : "accent"}
                    label={`Skor terbaik ${bestScore.toFixed(1)} dari 100`}
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Ambang lulus <span className="tnum font-semibold">{PASSING_NAP}</span>
                  </p>
                </div>
              )}
            </SummaryCell>
          </div>

          <section className="space-y-3">
            <h2 className="rule-ornate">Ringkasan aktivitas</h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <WeeklyFrequencyChart sessions={allSessions} />
              <NapTrendChart sessions={fullSessions} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
