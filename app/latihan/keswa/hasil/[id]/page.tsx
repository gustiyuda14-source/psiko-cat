import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { keswaAttempt } from "@/lib/keswa-attempts";
import { keswaPaket } from "@/lib/keswa-bank";
import { pembahasanKeswa } from "@/lib/keswa-pembahasan";
import { KESWA_AMBANG } from "@/lib/keswa-scoring";
import { cekBaris, durasiKeswa, tanggalKeswa } from "@/lib/keswa-teks";
import { ExamBar } from "@/app/components/ExamChrome";
import { KeswaCek } from "./KeswaCek";
import "@/app/fundamental.css";
import "@/app/keswa.css";

// Hasil simulasi Keswa: hanya pemilik yang bisa membuka (keswaAttempt memfilter user_id).
export default async function KeswaHasilPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id) || id <= 0) notFound();
  const a = await keswaAttempt(session.sub, id);
  if (!a) notFound();

  const baris = cekBaris(a.hasil);
  const terjawab = a.hasil.pola.dari;
  const bank = keswaPaket(a.paket);
  const bahas = bank && a.jawaban?.length === bank.soal.length ? pembahasanKeswa(a.jawaban, bank.soal, bank.kunci) : [];
  const cek = bahas.map((d, i) => ({ ...d, ...baris[i] }));
  const lolos = baris.filter((b) => b.lolos).length;
  const ya = a.hasil.pola.nilai;
  const persenYa = terjawab ? Math.round((ya / terjawab) * 100) : 0;

  return (
    <div className="min-h-[100dvh] bg-background">
      <ExamBar
        title={`Hasil Simulasi Keswa · Paket ${a.paket}`}
        actions={
          <Link href="/dashboard/keswa?tab=simulasi" className="mbtn">
            <span aria-hidden="true">←</span>
            Kembali
          </Link>
        }
      />
      <div className="app-page">
        <section className="fd-result ksw-result enter-rise">
          <p className="section-kicker">Paket {a.paket} · {tanggalKeswa(a.submitted_at)}</p>
          <div className={`ksw-status ${a.valid ? "is-valid" : "is-invalid"}`} role="status">
            <b>{a.valid ? "VALID" : "TIDAK VALID"}</b>
            <span>
              {a.valid
                ? "Pola jawabanmu wajar: lengkap, konsisten, dan jujur."
                : `${5 - lolos} dari 5 cek tidak lolos. Lihat rinciannya di bawah.`}
            </span>
          </div>
          <dl className="fd-stats">
            <div><dt>Dijawab</dt><dd className="tnum">{terjawab}<span>/{a.hasil.kosong.dari}</span></dd></div>
            <div><dt>Waktu</dt><dd className="tnum">{durasiKeswa(a.durasi_detik)}</dd></div>
            <div><dt>Cek lolos</dt><dd className="tnum">{lolos}<span>/5</span></dd></div>
          </dl>
          <KeswaCek
            paket={a.paket}
            baris={baris}
            cek={cek}
            stats={[
              { label: "Dijawab", value: terjawab },
              { label: "Kosong", value: a.hasil.kosong.nilai, tone: a.hasil.kosong.lolos ? undefined : "bad" },
              { label: "Cek lolos", value: lolos, tone: lolos === 5 ? "ok" : "bad" },
            ]}
            extra={[
              ["Jawaban Ya", `${ya} (${persenYa}%)`],
              ["Jawaban Tidak", String(terjawab - ya)],
              ["Rentang wajar Ya", `${KESWA_AMBANG.yaMin * 100}–${KESWA_AMBANG.yaMaks * 100}%`],
            ]}
          />
          <p className="ksw-disclaimer">
            Ini indikator latihan, bukan diagnosis, dan tidak menjamin hasil di tes Keswa yang sebenarnya. Ambang cek masih
            sementara. Cara paling aman tetap sama: jawab jujur, lengkap, dan konsisten.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={`/latihan/keswa/${a.paket}`} className="mbtn ksw-cta">
              Ulangi paket ini
            </Link>
            <Link href="/dashboard/keswa?tab=panduan" className="mbtn fd-ghost">
              Baca panduan
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
