import Link from "next/link";
import { KECERMATAN_PACKAGES, KECERMATAN_PACKAGE_LABELS } from "@/lib/test-session";

// Rute statis ini menang atas app/dashboard/latihan/[module]/page.tsx untuk slug
// "kecermatan" secara spesifik (Kecerdasan/Kepribadian tetap lewat [module]) — Kecermatan
// punya banyak paket bank soal, jadi user memilih paket dulu di sini sebelum latihan mulai.
export default function LatihanKecermatanPackagesPage() {
  return (
    <div className="app-page space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Latihan Kecermatan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pilih paket bank soal — tiap paket 500 soal, 10 lajur simbol, tanpa batas waktu.
        </p>
      </div>

      <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {KECERMATAN_PACKAGES.map((pkg) => (
          <Link
            key={pkg}
            href={`/dashboard/latihan/kecermatan/${pkg}`}
            className="surface-card interactive-card group flex min-h-48 flex-col overflow-hidden"
          >
            <div className="h-1 bg-accent" />
            <div className="flex flex-1 flex-col gap-4 p-5">
              <span className="inline-flex rounded-lg bg-primary/7 px-2.5 py-1 text-xs font-semibold text-primary">
                500 soal
              </span>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{KECERMATAN_PACKAGE_LABELS[pkg]}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">10 lajur simbol</p>
              </div>
              <p className="flex items-center text-sm font-semibold text-primary">
                Mulai
                <span className="ml-1 transition-transform duration-200 group-hover:translate-x-1">→</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
