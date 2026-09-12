import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import LogoutButton from "@/app/components/LogoutButton";
import { Accordion, Badge, EmptyState, PageHeader } from "@/app/components/ui";
import { ChevronRight } from "@/app/components/icons";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/dashboard");

  const { data: users } = await supabaseAdmin
    .from("users")
    .select(`
      id, name, username, gender,
      test_sessions (
        id, status, nap_score, is_passed, completed_at, created_at
      )
    `)
    .eq("role", "peserta")
    .order("name", { ascending: true });

  type UserRow = {
    id: string;
    name: string;
    username: string;
    gender: string | null;
    test_sessions: Array<{
      id: string;
      status: string;
      nap_score: number | null;
      is_passed: boolean | null;
      completed_at: string | null;
      created_at: string;
    }>;
  };

  const peserta = (users ?? []) as unknown as UserRow[];

  const totalPeserta = peserta.length;
  const totalTes = peserta.reduce((s, u) => s + (u.test_sessions?.length ?? 0), 0);
  const totalLulus = peserta.reduce(
    (s, u) => s + (u.test_sessions?.filter((t) => t.is_passed).length ?? 0),
    0
  );

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <PageHeader title="Dashboard Admin" description="D'Ajiks Akademi · Psiko CAT" actions={<LogoutButton />} />

        <dl className="surface-card summary-strip mt-6 flex flex-col overflow-hidden divide-y divide-border sm:flex-row sm:divide-x sm:divide-y-0">
          {[
            { label: "Peserta terdaftar", value: totalPeserta, tone: "text-foreground" },
            { label: "Total attempt", value: totalTes, tone: "text-primary" },
            { label: "Total lulus", value: totalLulus, tone: "text-success" },
          ].map((s) => (
            <div key={s.label} className="flex-1 px-5 py-4">
              <dt className="text-xs font-medium text-muted-foreground">{s.label}</dt>
              <dd className={`tnum font-heading mt-1 text-3xl ${s.tone}`}>{s.value}</dd>
            </div>
          ))}
        </dl>

        <section className="mt-6 space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Daftar peserta</h2>

          {peserta.length === 0 ? (
            <EmptyState
              title="Belum ada peserta"
              description="Peserta yang terdaftar dengan role peserta akan muncul di daftar ini."
            />
          ) : (
            peserta.map((u) => {
              const sessions = (u.test_sessions ?? []).sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              );
              const completed = sessions.filter(
                (s) => s.status === "COMPLETED" || s.status === "DISQUALIFIED"
              );
              const best = completed.length
                ? completed.reduce((p, c) => ((c.nap_score ?? 0) > (p.nap_score ?? 0) ? c : p))
                : null;
              const lulusCount = completed.filter((s) => s.is_passed).length;

              return (
                <Accordion
                  key={u.id}
                  label={u.name}
                  summary={
                    <span className="tnum">
                      @{u.username} · {sessions.length} attempt · {lulusCount} lulus
                      {best?.nap_score != null && ` · terbaik ${best.nap_score.toFixed(1)}`}
                    </span>
                  }
                  trailing={
                    best?.nap_score != null ? (
                      <Badge tone={best.is_passed ? "success" : "danger"}>
                        {best.nap_score.toFixed(1)}
                      </Badge>
                    ) : (
                      <Badge tone="neutral">belum ada</Badge>
                    )
                  }
                >
                  {sessions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Belum pernah mengikuti tes.</p>
                  ) : (
                    <ul className="divide-y divide-border">
                      {sessions.map((s) => {
                        const done = s.status === "COMPLETED" || s.status === "DISQUALIFIED";
                        return (
                          <li
                            key={s.id}
                            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5 text-sm"
                          >
                            <span className="tnum text-muted-foreground">
                              {formatDate(s.completed_at ?? s.created_at)}
                            </span>
                            <div className="flex items-center gap-3">
                              {done ? (
                                <>
                                  <span
                                    className={`text-xs font-semibold ${
                                      s.is_passed ? "text-success" : "text-destructive"
                                    }`}
                                  >
                                    {s.is_passed
                                      ? "Lulus"
                                      : s.status === "DISQUALIFIED"
                                        ? "Gugur"
                                        : "Tidak Lulus"}
                                  </span>
                                  <span className="tnum font-semibold text-foreground">
                                    {s.nap_score?.toFixed(1) ?? "—"}
                                  </span>
                                  <Link
                                    href={`/test/${s.id}/result`}
                                    className="flex items-center gap-0.5 text-xs font-semibold text-primary hover:underline"
                                  >
                                    Detail
                                    <ChevronRight className="size-3.5" />
                                  </Link>
                                </>
                              ) : (
                                <Badge tone="info">{s.status}</Badge>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </Accordion>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}
