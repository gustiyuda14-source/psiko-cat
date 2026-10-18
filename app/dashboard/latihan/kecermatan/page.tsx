import {
  KECERMATAN_EMOJI_PACKAGES,
  KECERMATAN_SILUET_PACKAGES,
  KECERMATAN_PACKAGE_LABELS,
  KECERMATAN_ANGKA_PACKAGES,
  KECERMATAN_ANGKA_PACKAGE_LABELS,
  KECERMATAN_SPASIAL_PACKAGES,
  KECERMATAN_SPASIAL_PACKAGE_LABELS,
  KECERMATAN_SPASIAL_DASAR_PACKAGES,
  KECERMATAN_SPASIAL_DASAR_PACKAGE_LABELS,
  KECERMATAN_SIMBOL_PACKAGES,
  KECERMATAN_SIMBOL_PACKAGE_LABELS,
  KECERMATAN_SAINS_PACKAGES,
  KECERMATAN_SAINS_PACKAGE_LABELS,
} from "@/lib/test-config";
import { PageHeader } from "@/app/components/ui";
import { buildKecermatanPackages } from "@/lib/kecermatan-packages";
import { KecermatanAspectPicker } from "@/app/components/KecermatanAspectPicker";

// Kecermatan punya banyak paket bank soal, jadi user memilih paket dulu di sini sebelum
// latihan mulai. Pemilih paket SENGAJA tinggal di dalam app/dashboard (masih ada sidebar)
// karena dia permukaan menjelajah, bukan sesi; sesinya sendiri di app/latihan/kecermatan/[package]
// (atau .../kecermatan-angka/[package]) yang di luar shell.
//
// Tujuh aspek (emoji/gambar, siluet gambar, angka-huruf, spasial dasar, spasial, simbol hilang, simbol sains) satu tile sidebar yang sama — bedanya
// cuma sub-tab di dalam halaman ini (KecermatanAspectPicker), bukan dua entri
// nav terpisah.
export default async function LatihanKecermatanPackagesPage() {
  const [emojiPackages, siluetPackages, angkaPackages, spasialDasarPackages, spasialPackages, simbolPackages, sainsPackages] = await Promise.all([
    buildKecermatanPackages(KECERMATAN_EMOJI_PACKAGES, KECERMATAN_PACKAGE_LABELS),
    buildKecermatanPackages(KECERMATAN_SILUET_PACKAGES, KECERMATAN_PACKAGE_LABELS),
    buildKecermatanPackages(KECERMATAN_ANGKA_PACKAGES, KECERMATAN_ANGKA_PACKAGE_LABELS),
    buildKecermatanPackages(KECERMATAN_SPASIAL_DASAR_PACKAGES, KECERMATAN_SPASIAL_DASAR_PACKAGE_LABELS),
    buildKecermatanPackages(KECERMATAN_SPASIAL_PACKAGES, KECERMATAN_SPASIAL_PACKAGE_LABELS),
    buildKecermatanPackages(KECERMATAN_SIMBOL_PACKAGES, KECERMATAN_SIMBOL_PACKAGE_LABELS),
    buildKecermatanPackages(KECERMATAN_SAINS_PACKAGES, KECERMATAN_SAINS_PACKAGE_LABELS),
  ]);

  return (
    <div className="app-page space-y-6">
      <PageHeader
        title="Latihan Sikap Kerja / Kecermatan"
        description="Pilih aspek dan paket untuk berlatih dalam 10 kolom. Lihat simbol kolom pertama di bawah; kunci simbol berganti saat berpindah kolom."
      />

      <KecermatanAspectPicker emojiPackages={emojiPackages} angkaPackages={angkaPackages} spasialDasarPackages={spasialDasarPackages} spasialPackages={spasialPackages} simbolPackages={simbolPackages} siluetPackages={siluetPackages} sainsPackages={sainsPackages} />
    </div>
  );
}
