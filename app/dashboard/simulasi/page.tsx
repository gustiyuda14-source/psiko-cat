import Link from "next/link";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { MODULE_CONFIG, type ModuleType } from "@/lib/test-session";

const MODULE_ORDER: ModuleType[] = ["KECERDASAN", "KECERMATAN", "KEPRIBADIAN"];

function PackageCard({
  href,
  title,
  desc,
  questionCount,
  minutes,
}: {
  href: string;
  title: string;
  desc: string;
  questionCount: number;
  minutes: number;
}) {
  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_10px_28px_-20px_rgba(16,33,59,0.35)] transition-all duration-200 hover:-translate-y-0.5"
    >
      <div className="h-1.5 bg-gradient-to-r from-success via-success to-accent" />
      <div className="space-y-3 p-5">
        <span className="inline-flex rounded-lg bg-primary/7 px-2.5 py-1 text-xs font-semibold text-primary">
          {questionCount} soal · {minutes} menit
        </span>
        <div>
          <p className="font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
        </div>
        <p className="flex items-center text-sm font-semibold text-primary">
          Mulai
          <span className="ml-1 transition-transform duration-200 group-hover:translate-x-1">→</span>
        </p>
      </div>
    </Link>
  );
}

export default async function SimulasiPage() {
  const session = (await getSession())!;

  const [{ data: questionRows }, { data: runningSessions }] = await Promise.all([
    supabaseAdmin.from("questions").select("type").eq("is_active", true),
    supabaseAdmin
      .from("test_sessions")
      .select("id, status, created_at")
      .eq("user_id", session.sub)
      .in("status", ["PENDING", "IN_PROGRESS"])
      .order("created_at", { ascending: false }),
  ]);

  const countByType = (questionRows ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.type] = (acc[row.type] ?? 0) + 1;
    return acc;
  }, {});

  const totalQuestions = MODULE_ORDER.reduce((sum, type) => sum + (countByType[type] ?? 0), 0);
  const totalMinutes = MODULE_ORDER.reduce((sum, type) => sum + MODULE_CONFIG[type].time_limit_seconds, 0) / 60;

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Simulasi</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tes resmi — hasil tersimpan ke riwayat dan dihitung ke nilai NAP.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PackageCard
          href="/test/new"
          title="Tryout Lengkap"
          desc="Kecerdasan, Kecermatan, Kepribadian"
          questionCount={totalQuestions}
          minutes={totalMinutes}
        />
        {MODULE_ORDER.map((type) => {
          const meta = MODULE_CONFIG[type];
          return (
            <PackageCard
              key={type}
              href={`/test/new/${meta.slug}`}
              title={`Real Exam · ${meta.label}`}
              desc={meta.shortDesc}
              questionCount={countByType[type] ?? 0}
              minutes={meta.time_limit_seconds / 60}
            />
          );
        })}
      </div>

      {runningSessions && runningSessions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Sesi Berjalan
          </h2>
          <div className="space-y-2">
            {runningSessions.map((s) => (
              <Link
                key={s.id}
                href={`/test/${s.id}`}
                className="flex items-center justify-between rounded-2xl border border-border/80 bg-card px-5 py-4 shadow-[0_10px_28px_-20px_rgba(16,33,59,0.35)] transition-all duration-200 hover:-translate-y-0.5"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">Sesi Tes</p>
                  <p className="text-xs text-muted-foreground">
                    Status: {s.status === "PENDING" ? "Belum dimulai" : "Sedang berlangsung"}
                  </p>
                </div>
                <span className="text-sm font-semibold text-primary">Lanjutkan →</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
