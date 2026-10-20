import { PageHeader } from "@/app/components/ui";
import { pilihProfilAwal } from "@/app/components/profil-actions";
import { JALUR, JALUR_LABEL, JALUR_SETARA } from "@/lib/scoring/psikogram";

/* Langkah wajib peserta tanpa profil tujuan (proxy.ts mengarahkan ke sini): semua nilai akhir memakai bobot profil ini. */
export default function ProfilWajibPage() {
  return (
    <div className="app-page space-y-6">
      <PageHeader
        kicker="Langkah pertama"
        title="Pilih profil tujuanmu"
        description="Nilai akhir simulasi dihitung dengan bobot profil ini (Peraturan As SDM Kapolri No. 3/2017). Pilihan tersimpan di akunmu dan bisa diganti nanti di Beranda atau Simulasi."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {JALUR.map((j) => (
          <form key={j} action={pilihProfilAwal.bind(null, j)}>
            <button
              type="submit"
              className="surface-card flex min-h-24 w-full flex-col items-start gap-1 px-5 py-4 text-left transition-colors duration-150 hover:border-[var(--gold)] focus-visible:outline-3 focus-visible:outline-ring active:scale-[.98]"
            >
              <span className="font-heading text-lg font-bold text-foreground">{JALUR_LABEL[j]}</span>
              <span className="text-sm text-muted-foreground">{JALUR_SETARA[j]}</span>
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
