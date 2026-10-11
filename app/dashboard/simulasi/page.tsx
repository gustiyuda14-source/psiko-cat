import Link from "next/link";
import { revalidatePath } from "next/cache";
import ResetSesiButton from "./ResetSesiButton";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { MODULE_CONFIG, MODULE_ORDER, SIMULASI_PACKAGE, type ModuleType } from "@/lib/test-config";
import { createTestSessionAndRedirect } from "@/lib/test-session";
import { PageHeader, buttonStyles } from "@/app/components/ui";
import { ChevronDown, ChevronRight } from "@/app/components/icons";
import SimulasiCatalog, { type LastScores, type SimulasiItem } from "./SimulasiCatalog";
import SimulasiProgress, { type SubScores, type TryoutPoint } from "./SimulasiProgress";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function startSession(formData: FormData) {
  "use server";
  const session = await getSession();
  if (!session) return;
  const requested = formData.get("module");
  const moduleTypes = requested === "ALL"
    ? MODULE_ORDER
    : MODULE_ORDER.includes(requested as ModuleType)
      ? [requested as ModuleType]
      : [];
  if (!moduleTypes.length) return;
  await createTestSessionAndRedirect(session.sub, moduleTypes);
}

// Hapus sesi PENDING/IN_PROGRESS milik peserta yang login (user id dari cookie,
// bukan dari form). Sesi selesai & riwayat nilai tidak disentuh.
async function resetOpenSessions() {
  "use server";
  const session = await getSession();
  if (!session) return;
  const { data: open } = await supabaseAdmin
    .from("test_sessions")
    .select("id, module_sessions(id)")
    .eq("user_id", session.sub)
    .in("status", ["PENDING", "IN_PROGRESS"]);
  const testIds = (open ?? []).map((s) => s.id);
  if (!testIds.length) return;
  const moduleIds = (open ?? []).flatMap((s) => s.module_sessions.map((m) => m.id));
  if (moduleIds.length) {
    await supabaseAdmin.from("answers").delete().in("module_session_id", moduleIds);
    await supabaseAdmin.from("kecermatan_logs").delete().in("module_session_id", moduleIds);
    await supabaseAdmin.from("module_sessions").delete().in("id", moduleIds);
  }
  await supabaseAdmin.from("anti_cheat_events").delete().in("test_session_id", testIds);
  await supabaseAdmin.from("test_sessions").delete().in("id", testIds).eq("user_id", session.sub);
  revalidatePath("/dashboard/simulasi");
}

export default async function SimulasiPage() {
  const session = (await getSession())!;

  // Kecermatan sekarang punya banyak paket bank soal (masing-masing 500 soal, 1 dipilih
  // random per sesi/latihan) — hitung dari satu paket referensi, bukan total semua paket,
  // supaya angka yang ditampilkan cocok dengan jumlah soal yang benar-benar didapat user.
  const [{ data: nonKecermatanRows }, { count: kecermatanCount }, { data: openSessions }, { data: scoredRows }, { data: doneSessions }] =
    await Promise.all([
      supabaseAdmin
        .from("questions")
        .select("type")
        .eq("is_active", true)
        .or(
          `and(type.eq.KECERDASAN,package_number.eq.${SIMULASI_PACKAGE.KECERDASAN}),` +
            `and(type.eq.KEPRIBADIAN,package_number.eq.${SIMULASI_PACKAGE.KEPRIBADIAN})`
        ),
      supabaseAdmin
        .from("questions")
        .select("id", { count: "exact", head: true })
        .eq("type", "KECERMATAN")
        .eq("is_active", true)
        .eq("package_number", 7),
      supabaseAdmin
        .from("test_sessions")
        .select("id, status, created_at")
        .eq("user_id", session.sub)
        .in("status", ["PENDING", "IN_PROGRESS"])
        .order("created_at", { ascending: false }),
      // Nilai murni terakhir per sub-tes (isi madu di sisi kubus). Urut terbaru dulu;
      // baris pertama per module_type yang dipakai.
      supabaseAdmin
        .from("module_sessions")
        .select("module_type, raw_score, completed_at, test_sessions!inner(user_id)")
        .eq("test_sessions.user_id", session.sub)
        .not("raw_score", "is", null)
        .order("completed_at", { ascending: false })
        .limit(60),
      // Tren Nilai Akhir Psikotest: sesi selesai milik peserta ini, sama dengan Beranda.
      supabaseAdmin
        .from("test_sessions")
        .select("nap_score, completed_at, created_at, status, module_sessions(module_type)")
        .eq("user_id", session.sub)
        .in("status", ["COMPLETED", "DISQUALIFIED"])
        .order("created_at", { ascending: true }),
    ]);

  const countByType = (nonKecermatanRows ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.type] = (acc[row.type] ?? 0) + 1;
    return acc;
  }, {});
  countByType["KECERMATAN"] = kecermatanCount ?? 0;

  const totalQuestions = MODULE_ORDER.reduce((sum, type) => sum + (countByType[type] ?? 0), 0);
  const totalMinutes =
    MODULE_ORDER.reduce((sum, type) => sum + MODULE_CONFIG[type].time_limit_seconds, 0) / 60;

  const running = openSessions ?? [];

  const last: LastScores = {};
  const subScores: SubScores = {};
  for (const row of scoredRows ?? []) {
    const type = row.module_type as ModuleType;
    if (row.raw_score == null) continue;
    (subScores[type] ??= []).unshift(row.raw_score); // baris urut terbaru dulu → simpan lama ke baru
    if (last[type]) {
      last[type].prev ??= row.raw_score;
      continue;
    }
    last[type] = {
      score: row.raw_score,
      at: row.completed_at
        ? new Date(row.completed_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
        : "-",
    };
  }

  type Done = { nap_score: number | null; completed_at: string | null; created_at: string; module_sessions: { module_type: string }[] };
  const done = (doneSessions ?? []) as Done[];
  const isFull = (s: Done) => MODULE_ORDER.every((t) => s.module_sessions.some((m) => m.module_type === t));
  const tryouts: TryoutPoint[] = done
    .filter((s) => isFull(s) && s.nap_score != null)
    .map((s) => ({ at: s.completed_at ?? s.created_at, nap: s.nap_score! }));
  const single = done.filter((s) => !isFull(s)).length;

  const items: SimulasiItem[] = [
    {
      id: "ALL",
      title: "Tryout Lengkap Paket 1",
      meta: `${totalQuestions} butir · ${totalMinutes} menit`,
      desc: "Ketiga sub-tes berurutan dengan timer berjalan. Hasil dihitung sebagai Nilai Akhir Psikotest.",
      faces: [...MODULE_ORDER],
    },
    ...MODULE_ORDER.map((type): SimulasiItem => {
      const meta = MODULE_CONFIG[type];
      return {
        id: type,
        title: meta.label,
        meta: `${countByType[type] ?? 0} butir · ${meta.time_limit_seconds / 60} menit`,
        desc: `Satu sub-tes (${meta.shortDesc}) dengan timer berjalan. Hasil masuk riwayat.`,
        faces: [type],
      };
    }),
  ];

  return (
    <div className="app-page space-y-6">
      <PageHeader
        kicker="Simulasi"
        title="Simulasi"
        description="Tes resmi dengan timer berjalan. Hasilnya masuk ke riwayat dan dihitung sebagai Nilai Akhir Psikotest. Sisi kubus menunjukkan nilai terakhir tiap sub-tes."
      />

      <SimulasiProgress tryouts={tryouts} subScores={subScores} single={single} />

      {/* Sesi yang belum selesai: jalan kembali kalau browser tertutup di tengah
          ujian (timer tetap jalan di server). Dilipat supaya tidak memenuhi layar. */}
      {running.length > 0 && (
        <details className="notice group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
            Sesi belum selesai ({running.length})
            <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
          </summary>
          <ul className="mt-3 divide-y divide-dashed divide-border">
            {running.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Sesi dibuat {formatDateTime(s.created_at)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Status {s.status === "PENDING" ? "belum dimulai" : "sedang berjalan"}
                  </p>
                </div>
                <Link
                  href={`/test/${s.id}`}
                  className={buttonStyles({ variant: "primary", size: "md" })}
                >
                  Buka sesi
                  <ChevronRight className="size-4" />
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-end border-t border-dashed border-border pt-3">
            <ResetSesiButton action={resetOpenSessions} count={running.length} />
          </div>
        </details>
      )}

      <section>
        <div className="mb-1">
          <span className="section-kicker">Katalog simulasi</span>
          <h2 className="mt-1 font-heading text-2xl">Pilih tes</h2>
        </div>
        <SimulasiCatalog items={items} last={last} action={startSession} />
      </section>
    </div>
  );
}
