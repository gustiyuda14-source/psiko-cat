import {
  KECERDASAN_PACKAGES,
  KECERMATAN_ANGKA_PACKAGES,
  KECERMATAN_SPASIAL_PACKAGES,
  KECERMATAN_PACKAGES,
  KEPRIBADIAN_PACKAGES,
  PRIBADI_PACKAGE_SIZE,
  MODULE_CONFIG,
  MODULE_ORDER,
  latihanHref,
} from "@/lib/test-config";
import { PageHeader } from "@/app/components/ui";
import LatihanCatalog, { type LatihanModule } from "./LatihanCatalog";

const DESC = {
  KECERDASAN: "Soal kognitif dan spasial, 100 butir per paket",
  KECERMATAN: "Temukan simbol yang tidak muncul, 10 kolom",
  KEPRIBADIAN: "Kepribadian + Substansi Khusus, 111 butir per paket",
} as const;

// Kunci progres = rute sesi paket (lib/latihan-progress.ts). Kecermatan punya tiga aspek.
const PACKAGES = {
  KECERDASAN: KECERDASAN_PACKAGES.map((id) => ({ key: `/latihan/kecerdasan/${id}`, total: 100 })),
  KEPRIBADIAN: KEPRIBADIAN_PACKAGES.map((id) => ({ key: `/latihan/kepribadian/${id}`, total: PRIBADI_PACKAGE_SIZE })),
  KECERMATAN: [
    ...KECERMATAN_PACKAGES.map((id) => ({ key: `/latihan/kecermatan/${id}`, total: 500 })),
    ...KECERMATAN_ANGKA_PACKAGES.map((id) => ({ key: `/latihan/kecermatan-angka/${id}`, total: 500 })),
    ...KECERMATAN_SPASIAL_PACKAGES.map((id) => ({ key: `/latihan/kecermatan-spasial/${id}`, total: 500 })),
  ],
};

export default function LatihanIndexPage() {
  const modules: LatihanModule[] = MODULE_ORDER.map((type) => ({
    href: latihanHref(type),
    label: MODULE_CONFIG[type].label,
    desc: DESC[type],
    packages: PACKAGES[type],
  }));

  return (
    <div className="app-page space-y-6">
      <PageHeader
        kicker="Latihan"
        title="Latihan"
        description="Pilih kemampuan yang ingin dilatih, lalu kerjakan tanpa batas waktu. Latihan tidak dihitung sebagai tes resmi dan tidak masuk riwayat."
      />
      <section>
        <div className="mb-1">
          <span className="section-kicker">Katalog latihan</span>
          <h2 className="mt-1 font-heading text-2xl">Pilih sub-tes</h2>
        </div>
        <LatihanCatalog modules={modules} />
      </section>
    </div>
  );
}
