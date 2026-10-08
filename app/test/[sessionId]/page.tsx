import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import ConfirmSubmitButton from "@/app/components/ConfirmSubmitButton";
import { MODULE_CONFIG, type ModuleType } from "@/lib/test-config";
import { Badge, Meter, buttonStyles } from "@/app/components/ui";
import { ExamBar } from "@/app/components/ExamChrome";
import { ArrowRight, Check } from "@/app/components/icons";
import { getSessionAccess } from "@/lib/session-access";
import { runSessionCalculate } from "@/lib/scoring/runner";

type ModuleStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "TIMED_OUT";

const QUESTION_COUNT: Record<ModuleType, number> = { KECERDASAN: 100, KECERMATAN: 500, KEPRIBADIAN: 100 };
const QUESTION_NOUN: Record<ModuleType, string> = { KECERDASAN: "butir", KECERMATAN: "butir", KEPRIBADIAN: "pernyataan" };

function statusBadge(s: ModuleStatus) {
  if (s === "COMPLETED" || s === "TIMED_OUT")
    return (
      <Badge tone="success">
        <Check className="size-3.5" strokeWidth={3} />
        Selesai
      </Badge>
    );
  if (s === "IN_PROGRESS") return <Badge tone="info">Berlangsung</Badge>;
  return <Badge tone="neutral">Belum dimulai</Badge>;
}

async function calculateSession(formData: FormData) {
  "use server";
  const sessionId = formData.get("sessionId");
  if (typeof sessionId !== "string") return;
  const access = await getSessionAccess(sessionId);
  if (!access.ok) return;
  await runSessionCalculate(sessionId);
  redirect(`/test/${sessionId}/result`);
}

export default async function SessionOverviewPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const access = await getSessionAccess(sessionId);
  if (!access.ok) notFound();

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
    if (!m) return { disabled: true, label: "Tidak tersedia" };
    if (m.status === "COMPLETED" || m.status === "TIMED_OUT") return { disabled: true, label: "Selesai" };
    if (m.status === "IN_PROGRESS") return { disabled: false, label: "Lanjutkan" };
    const prev = moduleSessions.find((ms) => ms.sequence_order === seqOrder - 1);
    if (seqOrder === 1 || prev?.status === "COMPLETED" || prev?.status === "TIMED_OUT") {
      return { disabled: false, label: "Mulai" };
    }
    return { disabled: true, label: "Terkunci" };
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <ExamBar
        title="Sesi ujian"
        count={`Psiko CAT · ${user?.name ?? ""}${user?.email ? ` · ${user.email}` : ""}`}
        actions={
          <Link href="/dashboard" className="mbtn">
            <span aria-hidden="true">←</span>
            Keluar
          </Link>
        }
      />
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-10">

        <div className="surface-card space-y-2.5 px-5 py-4">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-medium text-foreground">Kemajuan sesi</span>
            <span className="tnum text-muted-foreground">
              {doneCount} dari {moduleSessions.length} sub-tes selesai
            </span>
          </div>
          <Meter
            value={doneCount}
            max={moduleSessions.length}
            tone={allDone ? "success" : "primary"}
            label={`${doneCount} dari ${moduleSessions.length} sub-tes selesai`}
          />
        </div>

        {/* Daftar bernomor: sub-tes memang harus dikerjakan berurutan, jadi
            nomor di sini menyampaikan urutan yang mengikat, bukan hiasan. */}
        <ol className="surface-card mt-4 divide-y divide-border overflow-hidden">
          {moduleSessions.map((ms) => {
            const moduleType = ms.module_type as ModuleType;
            const meta = MODULE_CONFIG[moduleType];
            const btn = getButtonState(ms.module_type, ms.sequence_order);
            const done = ms.status === "COMPLETED" || ms.status === "TIMED_OUT";

            return (
              <li
                key={ms.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4 sm:flex-nowrap"
              >
                <span
                  className={`tnum flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    done
                      ? "bg-success text-white"
                      : btn.disabled
                        ? "bg-surface-inset text-faint-foreground"
                        : "bg-primary text-primary-foreground"
                  }`}
                  aria-hidden="true"
                >
                  {done ? <Check className="size-4" strokeWidth={3} /> : ms.sequence_order}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">{meta.label}</span>
                    {statusBadge(ms.status)}
                  </div>
                  <p className="tnum mt-0.5 text-xs text-muted-foreground">
                    {QUESTION_COUNT[moduleType]} {QUESTION_NOUN[moduleType]} ·{" "}
                    {meta.time_limit_seconds / 60} menit ·{" "}
                    <span className="font-sans">{meta.shortDesc}</span>
                  </p>
                </div>

                {btn.disabled ? (
                  <span className="shrink-0 text-sm text-muted-foreground">{btn.label}</span>
                ) : (
                  <Link
                    href={`/test/${sessionId}/${meta.slug}`}
                    className={buttonStyles({
                      variant: "primary",
                      size: "md",
                      className: "shrink-0",
                    })}
                  >
                    {btn.label}
                    <ArrowRight className="size-4" />
                  </Link>
                )}
              </li>
            );
          })}
        </ol>

        {allDone ? (
          <form action={calculateSession} className="mt-6">
            <input type="hidden" name="sessionId" value={sessionId} />
            <ConfirmSubmitButton
              title="Hitung nilai NAP sekarang?"
              confirmLabel="Ya, hitung nilai"
              message="Ketiga sub-tes sudah selesai. Setelah nilai dihitung, sesi ini terkunci dan tidak bisa dikerjakan ulang."
              className={buttonStyles({ variant: "accent", size: "lg", block: true })}
            >
              Hitung nilai NAP
              <ArrowRight className="size-4" />
            </ConfirmSubmitButton>
          </form>
        ) : (
          <div className="mt-6 space-y-3">
            <p className="text-center text-xs text-muted-foreground">
              Selesaikan ketiga sub-tes secara berurutan untuk menghitung nilai NAP.
            </p>
            <form action={calculateSession}>
              <input type="hidden" name="sessionId" value={sessionId} />
              <ConfirmSubmitButton
                title="Paksa hitung nilai sekarang?"
                confirmLabel="Ya, paksa hitung"
                tone="danger"
                message="Masih ada sub-tes yang belum selesai. Butir yang belum dikerjakan dihitung sebagai tidak dijawab, dan sesi ini tidak bisa dibuka lagi setelahnya."
                className={buttonStyles({ variant: "danger", size: "md", block: true })}
              >
                Paksa submit dan hitung sekarang
              </ConfirmSubmitButton>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
