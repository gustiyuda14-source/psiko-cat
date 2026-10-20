import { ChevronDown } from "@/app/components/icons";
import { ASPEK_LABEL, JALUR_LABEL, JALUR_SETARA, type Aspek, type HasilPsikogram, type Jalur, type Kategori } from "@/lib/scoring/psikogram";

const STATUS: Record<"MS" | "TMS", { label: string; pill: string }> = {
  MS: { label: "Memenuhi Syarat", pill: "ok" },
  TMS: { label: "Tidak Memenuhi Syarat", pill: "bad" },
};

function Ringkas({ h }: { h: HasilPsikogram }) {
  if (h.status) return <span className={`pill ${STATUS[h.status].pill}`}>{STATUS[h.status].label}</span>;
  return <span className="pill neu">{h.belum_diuji.length} aspek belum diuji</span>;
}

/* Psikogram keempat jalur (Peraturan As SDM Kapolri No. 3/2017, Lampiran A).
   tetap = jalur dari profil akun: profil itu ditonjolkan, tiga lainnya dilipat. */
export default function PsikogramSection({ hasil, jalur, tetap = false }: { hasil: HasilPsikogram[]; jalur: Jalur; tetap?: boolean }) {
  const row = (h: HasilPsikogram) => (
    <details key={h.jalur} className={`psg-row is-${h.status?.toLowerCase() ?? "na"}`} open={h.jalur === jalur}>
      <summary>
        <span className="psg-j">{JALUR_LABEL[h.jalur]}<small>{JALUR_SETARA[h.jalur]}</small></span>
        <span className="psg-v tnum">{h.nilai_akhir ?? "—"}<em>/ 85</em></span>
        <Ringkas h={h} />
        <span className="psg-toggle" aria-hidden="true"><ChevronDown className="size-5" /></span>
      </summary>
      {h.aspek_ks.length > 0 && (
        <p className="psg-why">
          Kurang Sekali di: {h.aspek_ks.map((a) => ASPEK_LABEL[a]).join(", ")}. Satu aspek KS membuat hasil Tidak
          Memenuhi Syarat.
        </p>
      )}
      {h.belum_diuji.length > 0 && (
        <p className="psg-why">
          Belum diuji: {h.belum_diuji.map((a) => ASPEK_LABEL[a]).join(", ")}. Nilai akhir keluar setelah semua aspek
          jalur ini dikerjakan.
        </p>
      )}
      <table className="psg-t">
        <thead>
          <tr><th>Aspek</th><th>Bobot</th><th>Nilai baku</th><th>Kategori</th><th>Jumlah</th></tr>
        </thead>
        <tbody>
          {h.baris.map((b) => (
            <tr key={b.aspek} className={b.kategori === "KS" ? "is-ks" : undefined}>
              <td>{ASPEK_LABEL[b.aspek]}</td>
              <td className="tnum">{b.bobot}</td>
              <td className="tnum">{b.ws == null ? "—" : b.ws.toFixed(1)}</td>
              <td>{b.kategori ?? "—"}</td>
              <td className="tnum">{b.jumlah ?? "—"}</td>
            </tr>
          ))}
        </tbody>
        {h.total != null && (
          <tfoot>
            <tr><td colSpan={4}>Total psikogram → posisi</td><td className="tnum">{h.total} → {h.nilai_akhir}</td></tr>
          </tfoot>
        )}
      </table>
    </details>
  );
  const lain = hasil.filter((h) => h.jalur !== jalur);
  return (
    <section className="psg is-main" aria-labelledby="psg-h">
      <div>
        <span className="section-kicker">Psikogram Polri</span>
        <h1 id="psg-h" className="mt-1">{tetap ? `Nilai akhir profil ${JALUR_LABEL[jalur]}` : "Nilai akhir per profil"}</h1>
        <p className="muted psg-note">
          Dihitung dengan bobot dan tabel posisi Peraturan As SDM Kapolri No. 3/2017. Lulus = nilai akhir minimal 61{" "}
          <b>dan</b> tidak ada aspek berkategori Kurang Sekali (KS). <span className="psg-tag">Aturan latihan</span> Nilai
          baku dihitung dari posisimu dibanding peserta platform, karena norma asli Polri tidak dipublikasikan. Untuk sekolah kedinasan, profil ini perkiraan latihan dari peran yang setara, bukan aturan resmi sekolahnya.
        </p>
      </div>

      {tetap ? (
        <div className="psg-list">
          {hasil.filter((h) => h.jalur === jalur).map(row)}
          <details className="psg-more">
            <summary>Lihat profil lain ({lain.length})</summary>
            <div className="psg-list">{lain.map(row)}</div>
          </details>
        </div>
      ) : (
        <div className="psg-list">{hasil.map(row)}</div>
      )}
    </section>
  );
}

const KATEGORI_LABEL: Record<Kategori, string> = { B: "Baik", CB: "Cukup Baik", C: "Cukup", K: "Kurang", KS: "Kurang Sekali" };
export type AspekSubtes = { aspek: Aspek; ws: number; kategori: Kategori };

/* Mini tryout (satu sub-tes): kategori tiap aspek tanpa bobot profil — nilai akhir 1–85 butuh ketiga sub-tes. */
export function AspekSubtesSection({ subtes, aspek }: { subtes: string; aspek: AspekSubtes[] }) {
  return (
    <section className="psg is-main" aria-labelledby="psg-h">
      <div>
        <span className="section-kicker">Mini tryout · {subtes}</span>
        <h1 id="psg-h" className="mt-1">Kategori per aspek</h1>
        <p className="muted psg-note">
          Setiap aspek dinilai seperti di psikotes resmi: B 16–20, CB 11,5–15,9, C 8,5–11,4, K 4–8,4, KS di bawah 4. Satu aspek
          Kurang Sekali (KS) menggugurkan. <span className="psg-tag">Aturan latihan</span> Nilai baku dihitung dari posisimu
          dibanding peserta platform. Nilai akhir per profil keluar di simulasi penuh.
        </p>
      </div>
      <div className="psg-row is-solo">
        <table className="psg-t">
          <thead>
            <tr><th>Aspek</th><th>Nilai baku</th><th>Kategori</th></tr>
          </thead>
          <tbody>
            {aspek.map((a) => (
              <tr key={a.aspek} className={a.kategori === "KS" ? "is-ks" : undefined}>
                <td>{ASPEK_LABEL[a.aspek]}</td>
                <td className="tnum">{a.ws.toFixed(1)}</td>
                <td><span className={`psg-kat k-${a.kategori.toLowerCase()}`}>{a.kategori}</span> {KATEGORI_LABEL[a.kategori]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
