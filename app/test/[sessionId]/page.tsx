import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import ConfirmSubmitButton from "@/app/components/ConfirmSubmitButton";
import { MODULE_CONFIG, type ModuleType } from "@/lib/test-session";

type ModuleStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "TIMED_OUT";

const QUESTION_COUNT: Record<ModuleType, number> = { KECERDASAN: 100, KECERMATAN: 500, KEPRIBADIAN: 100 };
const QUESTION_NOUN: Record<ModuleType, string> = { KECERDASAN: "soal", KECERMATAN: "soal", KEPRIBADIAN: "pernyataan" };

function statusBadge(s: ModuleStatus) {
  if (s === "COMPLETED" || s === "TIMED_OUT")
    return <span className="rounded-full border border-success/30 bg-success-soft px-2 py-0.5 text-xs text-success">Selesai</span>;
  if (s === "IN_PROGRESS")
    return <span className="rounded-full border border-primary/20 bg-primary/7 px-2 py-0.5 text-xs text-primary">Berlangsung</span>;
  return <span className="rounded-full border border-border bg-primary/7 px-2 py-0.5 text-xs text-muted-foreground">Belum Dimulai</span>;
}

export default async function SessionOverviewPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const { data: session } = await supabaseAdmin
    .from("test_sessions")
    .select("id, status, users(name, email), module_sessions(*)")
    .eq("id", sessionId)
    .single();

  if (!session) notFound();

  if (session.status === "COMPLETED" || session.status === "DISQUALIFIED") {
    redirect(`/test/${sessionId}/result`);
  }

  const moduleSessions = (session.module_sessions as Array<{
    id: string;
    module_type: string;
    status: ModuleStatus;
    sequence_order: number;
  }>).sort((a, b) => a.sequence_order - b.sequence_order);

  const user = session.users as unknown as { name: string; email: string } | null;

  const allDone = moduleSessions.every(
    (m) => m.status === "COMPLETED" || m.status === "TIMED_OUT"
  );

  const doneCount = moduleSessions.filter(
    (m) => m.status === "COMPLETED" || m.status === "TIMED_OUT"
  ).length;

  const getButtonState = (moduleType: string, seqOrder: number) => {
    const m = moduleSessions.find((ms) => ms.module_type === moduleType);
    if (!m) return { disabled: true, label: "Tidak Tersedia" };
    if (m.status === "COMPLETED" || m.status === "TIMED_OUT") return { disabled: true, label: "Selesai ✓" };
    if (m.status === "IN_PROGRESS") return { disabled: false, label: "Lanjutkan →" };
    const prev = moduleSessions.find((ms) => ms.sequence_order === seqOrder - 1);
    if (seqOrder === 1 || prev?.status === "COMPLETED" || prev?.status === "TIMED_OUT") {
      return { disabled: false, label: "Mulai" };
    }
    return { disabled: true, label: "Terkunci" };
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Psiko CAT</p>
          <h1 className="mt-1 font-heading text-3xl font-bold">Sesi Ujian</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Peserta: <span className="text-foreground">{user?.name}</span>
            <span className="ml-2">({user?.email})</span>
          </p>
        </div>

        {/* Progress overview */}
        <div className="space-y-2 rounded-2xl border border-border bg-card px-5 py-4 shadow-[0_10px_28px_-20px_rgba(16,33,59,0.35)]">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress Tes</span>
            <span className="font-mono">{doneCount} / {moduleSessions.length} selesai</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-primary/7">
            <div
              className="h-full rounded-full bg-success transition-all duration-500"
              style={{ width: `${(doneCount / moduleSessions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          {moduleSessions.map((ms) => {
            const moduleType = ms.module_type as ModuleType;
            const meta = MODULE_CONFIG[moduleType];
            const desc = `${QUESTION_COUNT[moduleType]} ${QUESTION_NOUN[moduleType]} · ${meta.time_limit_seconds / 60} menit · ${meta.shortDesc}`;
            const btn = getButtonState(ms.module_type, ms.sequence_order);
            return (
              <div
                key={ms.id}
                className="flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 shadow-[0_10px_28px_-20px_rgba(16,33,59,0.35)]"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{meta.label}</span>
                    {statusBadge(ms.status)}
                  </div>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                {btn.disabled ? (
                  <span className="text-sm text-muted-foreground">{btn.label}</span>
                ) : (
                  <Link
                    href={`/test/${sessionId}/${meta.slug}`}
                    className="min-h-11 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90"
                  >
                    {btn.label}
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {allDone && (
          <form action={`/test/${sessionId}/result`} method="GET">
            <input type="hidden" name="calculate" value="1" />
            <ConfirmSubmitButton
              message="Yakin ingin mengumpulkan dan menghitung nilai NAP sekarang? Setelah ini tidak bisa kembali mengerjakan."
              className="min-h-12 w-full rounded-xl bg-success py-3.5 text-base font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-success/90"
            >
              Hitung Nilai NAP →
            </ConfirmSubmitButton>
          </form>
        )}

        {!allDone && (
          <div className="space-y-3">
            <p className="text-center text-xs text-muted-foreground">
              Selesaikan ketiga sub-tes secara berurutan untuk menghitung nilai NAP.
            </p>
            <form action={`/test/${sessionId}/result`} method="GET">
              <input type="hidden" name="calculate" value="1" />
              <ConfirmSubmitButton
                message="Masih ada sub-tes yang belum selesai. Soal yang belum dikerjakan akan dihitung tidak dijawab dan tidak bisa diulang. Yakin lanjut?"
                className="min-h-11 w-full rounded-xl border border-destructive/30 bg-destructive/10 py-2.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/15"
              >
                Paksa Submit &amp; Hitung Sekarang →
              </ConfirmSubmitButton>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
