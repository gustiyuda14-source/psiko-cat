import Link from "next/link";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { MODULE_CONFIG, MODULE_ORDER, type ModuleType } from "@/lib/test-config";
import { createTestSessionAndRedirect } from "@/lib/test-session";
import { Badge, PageHeader, buttonStyles } from "@/app/components/ui";
import { ArrowRight, ChevronRight } from "@/app/components/icons";
import { SparkleIcon, SparkleParticles } from "@/app/components/CtaSparkle";

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
      supabaseAdmin.from("questions").select("type").eq("is_active", true).neq("type", "KECERMATAN"),
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

  return (
    <div className="app-page space-y-6">
      <PageHeader
        title="Simulasi"
        description="Tes resmi dengan timer berjalan. Hasilnya masuk ke riwayat dan dihitung sebagai nilai NAP."
      />

      {/* Sesi yang belum selesai muncul paling atas: peserta yang browsernya
          tertutup di tengah ujian butuh jalan kembali, dan timernya tetap jalan
          di server. */}
      {running.length > 0 && (
        <section className="surface-card overflow-hidden border-accent/45">
          <div className="flex items-center gap-3 border-b border-border bg-accent-soft px-5 py-3">
            <p className="text-sm font-semibold text-accent-ink">Ada sesi yang belum selesai</p>
          </div>
          <ul className="divide-y divide-border">
            {running.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
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
        </section>
      )}

      {/* Aksi utama halaman ini tidak boleh bersembunyi di balik disclosure —
          sebelumnya tombol "Mulai Tryout Lengkap" hanya muncul setelah
          accordion dibuka. */}
      <section className="surface-panel overflow-hidden bg-[linear-gradient(115deg,var(--accent-soft),var(--surface-card)_65%)]">
        <div className="flex flex-col gap-6 px-5 py-6 sm:px-7 sm:py-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <Badge tone="accent">Paket lengkap</Badge>
            <h2 className="font-heading mt-3 text-xl text-foreground">Tryout Lengkap Paket 1</h2>
            <p className="mt-1.5 max-w-[52ch] text-sm text-muted-foreground">
              Ketiga sub-tes dikerjakan berurutan dalam satu sesi, lalu nilai NAP dihitung dari
              gabungan ketiganya.
            </p>
            <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
              <div>
                <dt className="eyebrow">Total butir</dt>
                <dd className="tnum font-heading text-lg text-foreground">{totalQuestions}</dd>
              </div>
              <div>
                <dt className="eyebrow">Durasi</dt>
                <dd className="tnum font-heading text-lg text-foreground">{totalMinutes} menit</dd>
              </div>
              <div>
                <dt className="eyebrow">Sub-tes</dt>
                <dd className="font-heading text-lg text-foreground">3</dd>
              </div>
            </dl>
          </div>
          <form action={startSession} className="shrink-0">
            <input type="hidden" name="module" value="ALL" />
            <span className="cta-sparkle-wrap inline-block">
              <button
                type="submit"
                className={buttonStyles({
                  variant: "accent",
                  size: "lg",
                  className: "rounded-full hover:scale-[1.02] hover:shadow-glow active:scale-100",
                })}
              >
                <SparkleIcon />
                Mulai tryout lengkap
                <ArrowRight className="size-4" />
              </button>
              <SparkleParticles />
            </span>
          </form>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="rule-ornate">Atau kerjakan satu sub-tes saja</h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {MODULE_ORDER.map((type) => {
            const meta = MODULE_CONFIG[type];
            return (
              <li
                key={type}
                className="module-card package-hover-card"
              >
                <div className="package-hover-card__inner">
                  <div className="min-w-0">
                    <p className="font-heading text-lg text-foreground">{meta.label}</p>
                    <p className="tnum mt-0.5 text-xs text-muted-foreground">
                      {countByType[type] ?? 0} butir · {meta.time_limit_seconds / 60} menit ·{" "}
                      <span className="font-sans">{meta.shortDesc}</span>
                    </p>
                  </div>
                  <form action={startSession} className="mt-auto w-full">
                    <input type="hidden" name="module" value={type} />
                    <button
                      type="submit"
                      className={buttonStyles({ variant: "secondary", size: "md", className: "w-full justify-between" })}
                    >
                      Mulai
                      <ChevronRight className="size-4" />
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
