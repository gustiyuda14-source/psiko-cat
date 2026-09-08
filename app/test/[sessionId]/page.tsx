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
    return <span className="rounded-full bg-emerald-700/40 border border-emerald-600 px-2 py-0.5 text-xs text-emerald-300">Selesai</span>;
  if (s === "IN_PROGRESS")
    return <span className="rounded-full bg-blue-700/40 border border-blue-600 px-2 py-0.5 text-xs text-blue-300">Berlangsung</span>;
  return <span className="rounded-full bg-zinc-700/40 border border-zinc-600 px-2 py-0.5 text-xs text-zinc-400">Belum Dimulai</span>;
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
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Psiko CAT</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Peserta: <span className="text-white">{user?.name}</span>
            <span className="text-zinc-600 ml-2">({user?.email})</span>
          </p>
        </div>

        {/* Progress overview */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Progress Tes</span>
            <span className="font-mono">{doneCount} / {moduleSessions.length} selesai</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
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
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{meta.label}</span>
                    {statusBadge(ms.status)}
                  </div>
                  <p className="text-xs text-zinc-500">{desc}</p>
                </div>
                {btn.disabled ? (
                  <span className="text-sm text-zinc-500">{btn.label}</span>
                ) : (
                  <Link
                    href={`/test/${sessionId}/${meta.slug}`}
                    className="rounded-lg bg-blue-600 text-zinc-950 px-4 py-2 text-sm font-semibold hover:bg-blue-500 transition-colors"
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
              className="w-full rounded-xl bg-emerald-600 py-3.5 text-base font-bold hover:bg-emerald-500 transition-colors"
            >
              Hitung Nilai NAP →
            </ConfirmSubmitButton>
          </form>
        )}

        {!allDone && (
          <div className="space-y-3">
            <p className="text-center text-xs text-zinc-600">
              Selesaikan ketiga sub-tes secara berurutan untuk menghitung nilai NAP.
            </p>
            <form action={`/test/${sessionId}/result`} method="GET">
              <input type="hidden" name="calculate" value="1" />
              <ConfirmSubmitButton
                message="Masih ada sub-tes yang belum selesai. Soal yang belum dikerjakan akan dihitung tidak dijawab dan tidak bisa diulang. Yakin lanjut?"
                className="w-full rounded-xl border border-amber-700/40 py-2.5 text-xs font-semibold text-amber-500 hover:bg-amber-950/20 transition-colors"
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
