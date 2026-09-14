import Link from "next/link";
import { MODULE_CONFIG, MODULE_ORDER, latihanHref } from "@/lib/test-config";
import { PageHeader, buttonStyles } from "@/app/components/ui";
import { ChevronRight } from "@/app/components/icons";

export default function LatihanIndexPage() {
  return (
    <div className="app-page space-y-6">
      <PageHeader
        title="Latihan"
        description="Pilih kemampuan yang ingin dilatih, lalu kerjakan tanpa batas waktu. Latihan tidak dihitung sebagai tes resmi dan tidak masuk riwayat."
      />

      <ul className="grid gap-4 md:grid-cols-2">
        {MODULE_ORDER.map((type) => {
          const meta = MODULE_CONFIG[type];
          return (
            <li
              key={type}
              className={`module-card package-hover-card ${type === "KECERMATAN" ? "module-card-featured on-nav md:row-span-2" : ""}`}
            >
              <div className="package-hover-card__inner">
                <div className="min-w-0">
                  <p className={`font-heading text-xl ${type === "KECERMATAN" ? "text-white" : "text-foreground"}`}>{meta.label}</p>
                  <p className={`mt-2 text-sm ${type === "KECERMATAN" ? "text-white/75" : "text-muted-foreground"}`}>{meta.shortDesc}</p>
                </div>
                {type === "KECERMATAN" && (
                  <div className="my-auto w-full space-y-5 py-4">
                    <div className="grid grid-cols-5 gap-2" aria-label="Pilihan jawaban A hingga E">
                      {["A", "B", "C", "D", "E"].map((key) => (
                        <span key={key} className="flex h-14 items-center justify-center rounded-md border border-white/25 text-lg font-semibold text-white">{key}</span>
                      ))}
                    </div>
                    <p className="max-w-[40ch] text-sm text-white/75">Temukan simbol yang tidak muncul. Jaga ritme menjawab, lalu lihat akurasi setelah latihan selesai.</p>
                  </div>
                )}
                <Link
                  href={latihanHref(type)}
                  className={buttonStyles({ variant: type === "KECERMATAN" ? "accent" : "secondary", size: "md", className: "mt-auto w-full justify-between" })}
                >
                  Buka latihan
                  <ChevronRight className="size-4" />
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
