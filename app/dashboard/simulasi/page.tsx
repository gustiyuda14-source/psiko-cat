import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { MODULE_CONFIG, MODULE_ORDER } from "@/lib/test-session";

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
      className="surface-card interactive-card group flex min-h-52 flex-col overflow-hidden"
    >
      <div className="h-1 bg-accent" />
      <div className="flex flex-1 flex-col gap-4 p-5">
        <span className="inline-flex rounded-lg bg-primary/7 px-2.5 py-1 text-xs font-semibold text-primary">
          {questionCount} soal · {minutes} menit
        </span>
        <div className="flex-1">
          <p className="font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
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
  // Kecermatan sekarang punya banyak paket bank soal (masing-masing 500 soal, 1 dipilih
  // random per sesi/latihan) — hitung dari satu paket referensi, bukan total semua paket,
  // supaya angka yang ditampilkan cocok dengan jumlah soal yang benar-benar didapat user.
  const [{ data: nonKecermatanRows }, { count: kecermatanCount }] = await Promise.all([
    supabaseAdmin.from("questions").select("type").eq("is_active", true).neq("type", "KECERMATAN"),
    supabaseAdmin
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("type", "KECERMATAN")
      .eq("is_active", true)
      .eq("package_number", 7),
  ]);

  const countByType = (nonKecermatanRows ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.type] = (acc[row.type] ?? 0) + 1;
    return acc;
  }, {});
  countByType["KECERMATAN"] = kecermatanCount ?? 0;

  const totalQuestions = MODULE_ORDER.reduce((sum, type) => sum + (countByType[type] ?? 0), 0);
  const totalMinutes = MODULE_ORDER.reduce((sum, type) => sum + MODULE_CONFIG[type].time_limit_seconds, 0) / 60;

  return (
    <div className="app-page space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Simulasi</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tes resmi dengan timer. Hasil tersimpan ke riwayat dan dihitung ke nilai NAP.
        </p>
      </div>

      <details className="surface-card group overflow-hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            <span className="h-10 w-1.5 shrink-0 rounded-full bg-accent" />
            <div>
              <p className="font-semibold text-foreground">Tryout Lengkap Paket 1</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {totalQuestions} soal · {totalMinutes} menit · Kecerdasan, Kecermatan, Kepribadian
              </p>
            </div>
          </div>
          <span className="shrink-0 text-sm font-semibold text-primary">Lihat rincian</span>
        </summary>

        <div className="space-y-4 border-t border-border p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {MODULE_ORDER.map((type) => {
              const meta = MODULE_CONFIG[type];
              return (
                <PackageCard
                  key={type}
                  href={`/test/new/${meta.slug}`}
                  title={meta.label}
                  desc={meta.shortDesc}
                  questionCount={countByType[type] ?? 0}
                  minutes={meta.time_limit_seconds / 60}
                />
              );
            })}
          </div>
          <Link
            href="/test/new"
            className="group/cta flex min-h-11 items-center justify-center rounded-xl bg-accent px-5 text-sm font-bold text-primary shadow-[0_12px_24px_-12px_rgba(217,152,63,0.9)] transition-all duration-200 hover:-translate-y-0.5"
          >
            Mulai Tryout Lengkap
            <span className="ml-1 transition-transform duration-200 group-hover/cta:translate-x-1">→</span>
          </Link>
        </div>
      </details>
    </div>
  );
}
