import { PageHeader } from "@/app/components/ui";
import { drillCatalog } from "@/lib/drill-bank";
import DrillCatalog from "./DrillCatalog";

export default function DrillPage() {
  return (
    <div className="app-page space-y-6">
      <PageHeader
        kicker="Drilling"
        title="Drilling per jenis soal"
        description="Latih satu jenis soal sampai lancar. Semua soal kartu tampil di panel nomor, dikelompokkan per level, dengan pembahasan langsung setelah menjawab. Progres tersimpan di perangkat ini."
      />
      <DrillCatalog cards={drillCatalog()} />
    </div>
  );
}
