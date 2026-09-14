import {
  KECERMATAN_PACKAGES,
  KECERMATAN_PACKAGE_LABELS,
  KECERMATAN_ANGKA_PACKAGES,
  KECERMATAN_ANGKA_PACKAGE_LABELS,
} from "@/lib/test-config";
import { PageHeader } from "@/app/components/ui";
import { buildKecermatanPackages } from "@/lib/kecermatan-packages";
import { KecermatanAspectPicker } from "@/app/components/KecermatanAspectPicker";

// Kecermatan punya banyak paket bank soal, jadi user memilih paket dulu di sini sebelum
// latihan mulai. Pemilih paket SENGAJA tinggal di dalam app/dashboard (masih ada sidebar)
// karena dia permukaan menjelajah, bukan sesi; sesinya sendiri di app/latihan/kecermatan/[package]
// (atau .../kecermatan-angka/[package]) yang di luar shell.
//
// Dua aspek (emoji/gambar vs angka-huruf) satu tile sidebar yang sama — bedanya
// cuma sub-tab di dalam halaman ini (KecermatanAspectPicker), bukan dua entri
// nav terpisah.
export default async function LatihanKecermatanPackagesPage() {
  const [emojiPackages, angkaPackages] = await Promise.all([
    buildKecermatanPackages(KECERMATAN_PACKAGES, KECERMATAN_PACKAGE_LABELS),
    buildKecermatanPackages(KECERMATAN_ANGKA_PACKAGES, KECERMATAN_ANGKA_PACKAGE_LABELS),
  ]);

  return (
    <div className="app-page space-y-6">
      <PageHeader
        title="Latihan Kecermatan"
        description="Pilih aspek dan paket untuk berlatih dalam 10 kolom. Lihat simbol kolom pertama di bawah; kunci simbol berganti saat berpindah kolom."
      />

      <KecermatanAspectPicker emojiPackages={emojiPackages} angkaPackages={angkaPackages} />
    </div>
  );
}
