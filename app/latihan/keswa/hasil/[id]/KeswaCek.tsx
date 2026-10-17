import type { CekBaris } from "@/lib/keswa-teks";
import type { Bahas } from "@/lib/keswa-pembahasan";

// **kata** -> sorotan; dipakai untuk teks pembahasan, bukan kalimat soal.
const sorot = (t: string) => t.split(/\*\*(.+?)\*\*/).map((x, i) => (i % 2 ? <mark key={i} className="ksw-kunci">{x}</mark> : x));

// Daftar 5 cek + pembahasan per cek (server component; bahas sudah diturunkan di server, tanpa kunci).
export function KeswaCek({ baris, bahas }: { baris: CekBaris[]; bahas: Bahas[] }) {
  return (
    <ul className="ksw-cek">
      {baris.map((b, i) => {
        const d = bahas[i];
        return (
          <li key={b.judul} className={b.lolos ? "is-ok" : "is-bad"}>
            <div className="ksw-cek-head">
              <span className="ksw-cek-tag">{b.lolos ? "Lolos" : "Tidak lolos"}</span>
              <b>{b.judul}</b>
              <span className="ksw-cek-angka tnum">{b.angka}</span>
            </div>
            <p>{b.arti}</p>
            {d && (
              <details className="ksw-bahas" open={!b.lolos}>
                <summary>{d.ringkas}</summary>
                <p className="ksw-label">Apa yang diukur</p>
                <p>{sorot(d.diukur)}</p>
                <p className="ksw-label">Kenapa jawabanmu terdeteksi</p>
                <p>{sorot(d.alasan)}</p>
                {d.nomor && <p className="ksw-nomor tnum">Nomor: {d.nomor}</p>}
                {d.items.length > 0 && (
                  <ol className="ksw-butir">
                    {d.items.map((it) => (
                      <li key={it.butir.map((x) => x.no).join("-")}>
                        {it.butir.map((x) => (
                          <p key={x.no} className="ksw-pernyataan">
                            <span className="tnum">{x.no}.</span> {x.teks} <span className={`ksw-jwb${x.tandai ? " is-bad" : ""}`}>jawabanmu {x.jawab}</span>
                          </p>
                        ))}
                        <p className="ksw-alasan">{sorot(it.catatan)}</p>
                      </li>
                    ))}
                  </ol>
                )}
                <p className="ksw-label">Analogi</p>
                <blockquote className="ksw-analogi">{sorot(d.analogi)}</blockquote>
                <p className="ksw-label">Saran perbaikan</p>
                <ul className="ksw-saran">
                  {d.saran.map((x) => <li key={x}>{sorot(x)}</li>)}
                </ul>
              </details>
            )}
          </li>
        );
      })}
    </ul>
  );
}
