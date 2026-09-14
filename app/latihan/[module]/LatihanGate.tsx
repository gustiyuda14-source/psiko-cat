"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { SafeQuestion, KecermatanOptionsPayload } from "@/lib/types/safe-question";
import { MODULE_CONFIG, type ModuleType } from "@/lib/test-config";
import { Badge, EmptyState, PageHeader } from "@/app/components/ui";
import { KecermatanKeyStrip } from "@/app/components/KecermatanKeyStrip";
import { Button } from "@/app/components/ui-client";
import { ArrowRight, ChevronLeft } from "@/app/components/icons";
import { SparkleIcon, SparkleParticles } from "@/app/components/CtaSparkle";
import LatihanKecerdasan from "./LatihanKecerdasan";
import LatihanKepribadian from "./LatihanKepribadian";
import LatihanKecermatan from "./LatihanKecermatan";

// F11 (AUDIT_CAT_2026-09-12.md): latihan dan ujian resmi masih memakai bank
// soal yang sama. Sampai ada bank latihan terpisah, posisikan hasil latihan
// sebagai simulasi pola soal, bukan jaminan soal ujian resmi identik.
const BANK_NOTE = "Latihan ini simulasi pola soal, bukan jaminan soal ujian resmi akan sama persis.";

const MODE_NOTE: Record<ModuleType, string> = {
  KECERDASAN: `Sama seperti simulasi: jawab semua butir dulu, baru kumpulkan untuk melihat kunci dan pembahasan lengkap. ${BANK_NOTE}`,
  KECERMATAN: `Butir berikutnya langsung tampil setelah dijawab. Akurasi dan pembahasan tersedia setelah latihan selesai. ${BANK_NOTE}`,
  KEPRIBADIAN:
    "Tidak ada jawaban benar atau salah — pilihan langsung membawa ke pernyataan berikutnya.",
};

/*
  Wrapper halaman ada di sini, bukan di masing-masing route.

  Sebelumnya dua route latihan me-render komponen ini apa adanya ke dalam <main>
  yang tidak punya padding, jadi kartunya menempel ke tepi viewport dan halaman
  latihan tidak punya judul sama sekali. Karena kedua route memakai gate yang
  sama, perbaikannya cukup di satu tempat ini.
*/
export default function LatihanGate({
  moduleType,
  questions,
  packageLabel,
}: {
  moduleType: ModuleType;
  questions: SafeQuestion[];
  packageLabel?: string;
}) {
  // Halaman sesi sengaja tidak punya sidebar, jadi satu-satunya jalan keluar harus
  // ada di sini. Kecermatan balik ke pemilih paket (tempat user tadi memilih),
  // modul lain balik ke daftar latihan.
  const exitHref =
    moduleType === "KECERMATAN" ? "/dashboard/latihan/kecermatan" : "/dashboard/latihan";

  // Datang dari modal detail paket (PackageCarousel) lewat link ?autostart=1:
  // langsung hitung mundur, skip kartu "belum dimulai" — infonya sudah kelihatan
  // di modal, nampilin lagi di sini cuma nambah satu klik yang gak perlu.
  const searchParams = useSearchParams();
  const autoStart = searchParams.get("autostart") === "1";
  // Cuma dipakai LatihanKecermatan (lihat komponen itu) — modul lain gak
  // punya konsep kolom, prop-nya diabaikan.
  const timedMode = searchParams.get("timed") === "1";
  const [started, setStarted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(autoStart ? 5 : null);
  const practiceRef = useRef<HTMLDivElement>(null);
  const meta = MODULE_CONFIG[moduleType];
  const noun = moduleType === "KEPRIBADIAN" ? "pernyataan" : "butir";
  const firstQuestion = moduleType === "KECERMATAN"
    ? [...questions].sort((a, b) => (a.column_index ?? 0) - (b.column_index ?? 0) || a.sequence_number - b.sequence_number)[0]
    : undefined;
  const firstSymbols = firstQuestion?.options_payload as unknown as KecermatanOptionsPayload | undefined;

  useEffect(() => {
    if (started) practiceRef.current?.scrollIntoView({ block: "start" });
  }, [started]);

  useEffect(() => {
    if (countdown === null) return;
    const t = setTimeout(() => {
      if (countdown <= 1) setStarted(true);
      else setCountdown(countdown - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  return (
    <div className="app-page space-y-5">
      <PageHeader
        title={`Latihan ${meta.label}`}
        description={`${packageLabel ? `${packageLabel} · ` : ""}${questions.length} ${noun} · ${meta.shortDesc}`}
        actions={
          <>
            <Badge tone="neutral">{timedMode ? "60 detik/kolom" : "Tanpa batas waktu"}</Badge>
            <Link
              href={exitHref}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-white/25 px-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/12"
            >
              <ChevronLeft className="size-4" />
              Keluar latihan
            </Link>
          </>
        }
      />

      {started ? (
        <div ref={practiceRef}>
          {moduleType === "KECERDASAN" ? (
            <LatihanKecerdasan questions={questions} />
          ) : moduleType === "KEPRIBADIAN" ? (
            <LatihanKepribadian questions={questions} />
          ) : (
            <LatihanKecermatan questions={questions} timedMode={timedMode} />
          )}
        </div>
      ) : countdown !== null ? (
        <div className="surface-card mx-auto max-w-md space-y-4 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {packageLabel ? `${packageLabel} · ` : ""}
            {questions.length} {noun}
          </p>
          <div className="dots-loader" aria-hidden="true">
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className="dots-loader__circle">
                <span className="dots-loader__dot" />
                <span className="dots-loader__outline" />
              </span>
            ))}
          </div>
          <p className="tnum font-heading text-6xl text-foreground">{countdown}</p>
          <p role="status" className="text-sm text-muted-foreground">
            Latihan dimulai sebentar lagi…
          </p>
        </div>
      ) : questions.length === 0 ? (
        <EmptyState
          title="Bank soal belum terisi"
          description={`Belum ada ${noun} aktif untuk sub-tes ${meta.label}. Hubungi admin bila ini tidak seharusnya.`}
        />
      ) : (
        <div className="surface-card mx-auto max-w-2xl space-y-5 px-5 py-6 sm:px-7 sm:py-7">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Mode latihan tidak dihitung sebagai tes resmi dan tidak disimpan ke riwayat.{" "}
            {MODE_NOTE[moduleType]}
          </p>

          <dl className="inset-panel grid grid-cols-2 gap-4 px-5 py-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-muted-foreground">Tersedia</dt>
              <dd className="tnum font-heading text-lg text-foreground">
                {questions.length} {noun}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Batas waktu</dt>
              <dd className="font-heading text-lg text-foreground">Tidak ada</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Masuk riwayat</dt>
              <dd className="font-heading text-lg text-foreground">Tidak</dd>
            </div>
          </dl>

          {firstSymbols?.symbol_map && (
            <section className="space-y-3" aria-label="Preview simbol kolom pertama">
              <h2 className="text-sm font-semibold text-foreground">Simbol yang akan tampil · Kolom I</h2>
              <KecermatanKeyStrip symbolMap={firstSymbols.symbol_map} />
              <p className="text-xs text-muted-foreground">Cari simbol yang tidak muncul pada butir soal, lalu pilih huruf pasangannya. Kunci simbol berganti setiap kolom.</p>
            </section>
          )}

          <span className="cta-sparkle-wrap block w-full">
            <Button
              variant="accent"
              size="lg"
              block
              onClick={() => setStarted(true)}
              className="hover:scale-[1.02] hover:shadow-glow active:scale-100"
            >
              <SparkleIcon />
              Mulai latihan
              <ArrowRight className="size-4" />
            </Button>
            <SparkleParticles />
          </span>
        </div>
      )}
    </div>
  );
}
