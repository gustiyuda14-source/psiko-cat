import { MODULE_CONFIG, MODULE_ORDER, latihanHref } from "@/lib/test-config";
import { PageHeader } from "@/app/components/ui";
import type { TicketItem } from "@/app/components/TicketCatalog";
import LatihanCatalog from "./LatihanCatalog";

const TONE = { KECERDASAN: "green", KECERMATAN: "cyan", KEPRIBADIAN: "amber" } as const;

const DESC = {
  KECERDASAN: "Soal kognitif dan spasial, 100 butir per paket",
  KECERMATAN: "Temukan simbol yang tidak muncul, 10 kolom",
  KEPRIBADIAN: "Pernyataan skala Likert, 100 butir per paket",
} as const;

export default function LatihanIndexPage() {
  const items: TicketItem[] = MODULE_ORDER.map((type, index) => ({
    id: latihanHref(type),
    tag: "Latihan",
    tone: TONE[type],
    badges: ["Tanpa timer"],
    title: MODULE_CONFIG[type].label,
    meta: DESC[type],
    symbols: type === "KECERMATAN" ? ["A", "B", "C", "D", "E"] : undefined,
    symbolsLabel: "Pilihan jawaban A hingga E",
    foot: "Pilih paket",
    stub: ["Sub-tes", String(index + 1).padStart(2, "0")],
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
        <LatihanCatalog items={items} />
      </section>
    </div>
  );
}
