import { Fragment, type CSSProperties } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { KESWA_PAKET } from "@/lib/keswa-bank";
import { keswaRiwayat } from "@/lib/keswa-attempts";
import { KESWA_AMBANG, KESWA_DURASI_DETIK, KESWA_TOTAL } from "@/lib/keswa-scoring";
import { durasiKeswa, tanggalKeswa } from "@/lib/keswa-teks";
import { LembarSheet } from "@/app/components/LembarSheet";
import { JawabYT, LembarHead } from "@/app/components/LembarSpesimen";
import "@/app/keswa.css";
import "@/app/lembar.css";
import { KeswaEdukasi, KeswaPanduan } from "./KeswaKonten";

const MENIT = KESWA_DURASI_DETIK / 60;
const TABS = [
  { key: "edukasi", label: "Edukasi", sub: "Bentuk tesnya" },
  { key: "panduan", label: "Panduan", sub: "8 langkah" },
  { key: "simulasi", label: "Simulasi", sub: `${KESWA_PAKET.length} paket` },
] as const;

export default async function KeswaPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { tab: raw } = await searchParams;
  const tab = TABS.some((t) => t.key === raw) ? raw : "edukasi";
  const riwayat = tab === "simulasi" ? await keswaRiwayat(session.sub) : {};

  return (
    <div className="app-page lb">
      <LembarHead
        title="Keswa"
        desc={`Kenali bentuk tes kesehatan jiwa, pelajari cara mengerjakannya, lalu coba simulasi ${KESWA_TOTAL} pernyataan Ya/Tidak dengan cek validitas jawaban.`}
        meta={[`${KESWA_PAKET.length} paket simulasi`, `${KESWA_TOTAL} soal per paket`]}
      />

      <nav className="lb-ftabs" aria-label="Bagian Keswa">
        {TABS.map((t) => (
          <Link key={t.key} href={`/dashboard/keswa?tab=${t.key}`} aria-current={tab === t.key ? "page" : undefined}>
            {t.label}
            <small>{t.sub}</small>
          </Link>
        ))}
      </nav>

      <div className="lb-fbody">
        {tab === "edukasi" && <KeswaEdukasi />}
        {tab === "panduan" && <KeswaPanduan />}
        {tab === "simulasi" && (
          <div className="lb-sheets">
            {KESWA_PAKET.map((p, i) => {
              const r = riwayat[p] ?? [];
              const kode = `Paket ${String(p).padStart(2, "0")}`;
              return (
                <div key={p} className="lb-wrap" style={{ "--i": i } as CSSProperties}>
                  <LembarSheet
                    href={`/latihan/keswa/${p}`}
                    code={kode}
                    side={`${KESWA_TOTAL} soal, ${MENIT} menit`}
                    title={`Simulasi Keswa Paket ${p}`}
                    line="Hasil VALID / TIDAK VALID dari 5 cek: soal kosong, konsistensi, pola Ya/Tidak, sok sempurna, jawaban acak."
                    cta="Mulai simulasi"
                    spec={
                      <>
                        <JawabYT paket={p} isi={r.length > 0} />
                        {r[0] && <span className={`lb-stamp ${r[0].valid ? "is-ok" : "is-no"}`}>{r[0].valid ? "VALID" : "TIDAK VALID"}</span>}
                      </>
                    }
                    petunjuk={{
                      ringkas: "Tes kepribadian berbentuk pernyataan tentang dirimu, dijawab Ya atau Tidak.",
                      fakta: [
                        ["Soal", `${KESWA_TOTAL} pernyataan`],
                        ["Waktu", `${MENIT} menit`],
                        ["Jawab", "Ya / Tidak"],
                        ["Hasil tersimpan", `${Math.min(r.length, 2)} dari 2`],
                      ],
                      aturan: [
                        "Jawab jujur sesuai keadaanmu sehari-hari, bukan dirimu yang ideal. Tidak ada jawaban benar atau salah.",
                        <Fragment key="yt">
                          Klik Ya/Tidak atau tekan <kbd>Y</kbd> / <kbd>T</kbd>; panah kiri/kanan untuk pindah soal.
                        </Fragment>,
                        `Jawab semua soal: ${KESWA_AMBANG.kosong} soal kosong atau lebih dianggap tidak valid. Waktu habis = jawaban dikirim otomatis.`,
                        "Hasilnya status VALID / TIDAK VALID dari 5 cek, bukan skor kejiwaan. Maksimal 2 hasil disimpan per paket.",
                      ],
                      catatan:
                        r.length >= 2 ? "Kamu sudah punya 2 hasil untuk paket ini. Mengirim simulasi baru akan menghapus hasil yang paling lama." : undefined,
                    }}
                  />
                  <p className="lb-slots-h">Hasil tersimpan, maksimal 2</p>
                  <ul className="lb-slots">
                    {[0, 1].map((s) =>
                      r[s] ? (
                        <li key={s}>
                          <Link className="lb-slot" href={`/latihan/keswa/hasil/${r[s].id}`}>
                            <span className={`lb-badge ${r[s].valid ? "is-ok" : "is-no"}`}>{r[s].valid ? "VALID" : "TIDAK VALID"}</span>
                            <span>{tanggalKeswa(r[s].submitted_at)}</span>
                            <span className="tnum">{durasiKeswa(r[s].durasi_detik)}</span>
                          </Link>
                        </li>
                      ) : (
                        <li key={s} className="lb-slot is-empty">
                          <span>Slot {s + 1}</span>
                          <span>Belum ada hasil</span>
                          <span />
                        </li>
                      )
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
