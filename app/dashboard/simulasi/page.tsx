import Link from "next/link";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { MODULE_CONFIG, MODULE_ORDER, SIMULASI_PACKAGE, type ModuleType } from "@/lib/test-config";
import { createTestSessionAndRedirect } from "@/lib/test-session";
import { PageHeader, buttonStyles } from "@/app/components/ui";
import { ChevronRight } from "@/app/components/icons";
import type { TicketItem } from "@/app/components/TicketCatalog";
import SimulasiCatalog from "./SimulasiCatalog";

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

export default async function SimulasiPage() {
  const session = (await getSession())!;

  // Kecermatan sekarang punya banyak paket bank soal (masing-masing 500 soal, 1 dipilih
  // random per sesi/latihan) — hitung dari satu paket referensi, bukan total semua paket,
  // supaya angka yang ditampilkan cocok dengan jumlah soal yang benar-benar didapat user.
  const [{ data: nonKecermatanRows }, { count: kecermatanCount }, { data: openSessions }] =
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

  const TONE = { KECERDASAN: "green", KECERMATAN: "cyan", KEPRIBADIAN: "amber" } as const;
  const items: TicketItem[] = [
    {
      id: "ALL",
      tag: "Paket lengkap",
      tone: "green",
      badges: ["NAP"],
      title: "Tryout Lengkap Paket 1",
      meta: `${totalQuestions} butir · ${totalMinutes} menit · 3 sub-tes`,
      foot: "Mulai tryout lengkap",
      stub: ["Sub-tes", "03"],
    },
    ...MODULE_ORDER.map((type, index): TicketItem => {
      const meta = MODULE_CONFIG[type];
      return {
        id: type,
        tag: "Sub-tes",
        tone: TONE[type],
        title: meta.label,
        meta: `${countByType[type] ?? 0} butir · ${meta.time_limit_seconds / 60} menit · ${meta.shortDesc}`,
        foot: "Mulai sub-tes",
        stub: ["Sub-tes", String(index + 1).padStart(2, "0")],
      };
    }),
  ];

  return (
    <div className="app-page space-y-6">
      <PageHeader
        kicker="Simulasi"
        title="Simulasi"
        description="Tes resmi dengan timer berjalan. Hasilnya masuk ke riwayat dan dihitung sebagai nilai NAP. Ketuk kartu tengah untuk memulai."
      />

      {/* Sesi yang belum selesai muncul paling atas: peserta yang browsernya
          tertutup di tengah ujian butuh jalan kembali, dan timernya tetap jalan
          di server. */}
      {running.length > 0 && (
        <aside className="notice" aria-labelledby="running-h">
          <strong id="running-h" className="text-sm">Ada sesi yang belum selesai</strong>
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
        </aside>
      )}

      <section>
        <div className="mb-1">
          <span className="section-kicker">Katalog simulasi</span>
          <h2 className="mt-1 font-heading text-2xl">Pilih tes</h2>
        </div>
        <SimulasiCatalog items={items} action={startSession} />
      </section>
    </div>
  );
}
