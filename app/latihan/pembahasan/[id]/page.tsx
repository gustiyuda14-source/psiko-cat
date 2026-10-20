import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { loadLatihanReview } from "@/lib/latihan-review";
import { attemptModeLabel } from "@/lib/progress-rules";
import {
  KECERDASAN_PACKAGE_LABELS,
  KECERMATAN_ANGKA_PACKAGE_LABELS,
  KECERMATAN_PACKAGE_LABELS,
  KECERMATAN_SIMBOL_PACKAGE_LABELS,
  KECERMATAN_SAINS_PACKAGE_LABELS,
  KECERMATAN_SPASIAL_PACKAGE_LABELS,
  KECERMATAN_SPASIAL_DASAR_PACKAGE_LABELS,
  KEPRIBADIAN_PACKAGE_LABELS,
  MODULE_CONFIG,
} from "@/lib/test-config";
import { ExamBar } from "@/app/components/ExamChrome";
import { EmptyState, buttonStyles } from "@/app/components/ui";
import { KecerdasanReview } from "@/app/components/PembahasanSection";
import { PribadiReview } from "@/app/components/PribadiReview";
import LatihanKecermatanHasil from "@/app/latihan/[module]/LatihanKecermatanHasil";

// Pembahasan latihan yang pernah dikumpulkan (maks 2 per paket, lib/latihan-review.ts).
// Auth dijamin proxy.ts; baris hanya dibaca bila milik peserta yang login.

const LABELS: [string, Record<number, string>][] = [
  ["/latihan/kecerdasan/", KECERDASAN_PACKAGE_LABELS],
  ["/latihan/kepribadian/", KEPRIBADIAN_PACKAGE_LABELS],
  ["/latihan/kecermatan-angka/", KECERMATAN_ANGKA_PACKAGE_LABELS],
  ["/latihan/kecermatan-spasial/", KECERMATAN_SPASIAL_PACKAGE_LABELS],
  ["/latihan/kecermatan-spasial-dasar/", KECERMATAN_SPASIAL_DASAR_PACKAGE_LABELS],
  ["/latihan/kecermatan-simbol/", KECERMATAN_SIMBOL_PACKAGE_LABELS],
  ["/latihan/kecermatan-sains/", KECERMATAN_SAINS_PACKAGE_LABELS],
  ["/latihan/kecermatan/", KECERMATAN_PACKAGE_LABELS],
];
const PICKER = {
  KECERDASAN: "/dashboard/latihan/kecerdasan",
  KECERMATAN: "/dashboard/latihan/kecermatan",
  KEPRIBADIAN: "/dashboard/latihan/kepribadian",
} as const;

const tanggal = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Makassar" });

export default async function LatihanPembahasanPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id) || id <= 0) notFound();

  const review = await loadLatihanReview(session.sub, id);
  if (review.status === "missing") notFound();

  const back = (
    <Link href={PICKER[review.module]} className="mbtn">
      <span aria-hidden="true">←</span>
      Kembali ke paket
    </Link>
  );

  if (review.status === "locked") {
    return (
      <div className="min-h-[100dvh] bg-background">
        <ExamBar title={`Pembahasan Latihan ${MODULE_CONFIG[review.module].label}`} actions={back} />
        <div className="app-page">
          <EmptyState
            title="Pembahasan dikunci sementara"
            description={`Kamu sedang mengerjakan ujian ${MODULE_CONFIG[review.module].label}. Pembahasan latihan terbuka lagi setelah ujian itu selesai.`}
          />
        </div>
      </div>
    );
  }

  const label = LABELS.find(([base]) => review.key.startsWith(base))?.[1][review.pkg] ?? `Paket ${review.pkg}`;
  const nth = review.siblings.findIndex((s) => s.id === id);

  return (
    <div className="min-h-[100dvh] bg-background">
      <ExamBar
        title={`Pembahasan Latihan ${MODULE_CONFIG[review.module].label}`}
        count={`${label} · dikumpulkan ${tanggal(review.submittedAt)}`}
        actions={back}
      />

      {review.siblings.length > 1 && (
        <nav className="app-page pb-0" aria-label="Percobaan tersimpan">
          <div className="flex flex-wrap gap-2">
            {review.siblings.map((s, i) => (
              <Link
                key={s.id}
                href={`/latihan/pembahasan/${s.id}`}
                aria-current={s.id === id ? "page" : undefined}
                className={buttonStyles({ variant: s.id === id ? "primary" : "secondary", size: "sm" })}
              >
                {review.module === "KECERMATAN" ? attemptModeLabel(s) : i === 0 ? "Terbaru" : "Sebelumnya"} · {tanggal(s.at)}
              </Link>
            ))}
          </div>
        </nav>
      )}

      {review.kecermatan ? (
        <div className="app-page">
          <LatihanKecermatanHasil
            sorted={review.kecermatan.questions}
            answers={review.kecermatan.answers}
            timedMode={review.timed}
            ajiks={review.ajiks}
            score={review.kecermatan.score}
            timing={review.kecermatan.timing}
            scoreFailed={review.timed && !review.kecermatan.score}
            restartHref={review.key}
            title={nth === 0 ? "Percobaan terbaru" : "Percobaan sebelumnya"}
          />
        </div>
      ) : (
        <section className="mx-auto my-6 w-[calc(100%-2rem)] max-w-6xl space-y-5">
          {review.kecerdasan && <KecerdasanReview items={review.kecerdasan} />}
          {review.pribadi && <PribadiReview summary={review.pribadi.summary} items={review.pribadi.items} />}
          <Link href={review.key} className={buttonStyles({ variant: "primary", size: "lg", block: true })}>
            Ulangi latihan
          </Link>
        </section>
      )}
    </div>
  );
}
