import Link from "next/link";
import PembahasanSection, {
  type KecerdasanReviewItem,
  type KecermatanSummary,
  type KecermatanColumnGroup,
} from "@/app/components/PembahasanSection";
import type { KepribadianReview } from "@/lib/review";
import { Meter, buttonStyles } from "@/app/components/ui";
import { ExamBar } from "@/app/components/ExamChrome";
import { ChevronRight } from "@/app/components/icons";
import { ASPEK_LABEL, JALUR, JALUR_LABEL, JALUR_SETARA, type HasilPsikogram, type Jalur } from "@/lib/scoring/psikogram";
import PsikogramSection, { AspekSubtesSection, type AspekSubtes } from "./PsikogramSection";

function round1(n: number | null) {
  return n == null ? "—" : n.toFixed(1);
}

/* Rel ukur 0–100: isian emas sampai skor, garis putus di ambang lulus (gaya rep-rail cest). */
function ScoreRail({ score, threshold, min = 0, max = 100, ticks = [0, 25, 50, 75, 100] }: { score: number | null; threshold: number; min?: number; max?: number; ticks?: number[] }) {
  const W = 640;
  const x = (v: number) => ((Math.min(max, Math.max(min, v)) - min) / (max - min)) * W;
  return (
    <div className="rep-rail">
      <svg viewBox={`0 0 ${W} 74`} role="img" aria-label={`Skor ${round1(score)} dari ${max}, ambang lulus ${threshold}`}>
        <defs>
          <linearGradient id="rep-gold" x1="0" x2="1">
            <stop offset="0" stopColor="#b8892b" />
            <stop offset="0.5" stopColor="#dcc272" />
            <stop offset="1" stopColor="#c0983a" />
          </linearGradient>
        </defs>
        <rect className="r-track" x="0" y="30" width={W} height="14" rx="7" />
        <rect className="r-band" x={x(threshold)} y="30" width={W - x(threshold)} height="14" rx="7" />
        {score != null && <rect className="r-fill" x="0" y="30" width={Math.max(14, x(score))} height="14" rx="7" />}
        {ticks.map((t) => (
          <g key={t}>
            <line className="r-tick" x1={x(t)} x2={x(t)} y1="48" y2="56" />
            <text x={Math.min(W - 12, Math.max(12, x(t)))} y="72" textAnchor="middle">{t}</text>
          </g>
        ))}
        <line className="r-pass" x1={x(threshold)} x2={x(threshold)} y1="20" y2="54" />
        <text className="r-pass-t" x={x(threshold)} y="14" textAnchor="middle">{threshold}</text>
        {score != null && <circle className="r-dot" cx={Math.max(7, x(score))} cy="37" r="9" />}
      </svg>
    </div>
  );
}

function ModuleCard({
  label,
  value,
  max,
  children,
}: {
  label: string;
  value: number | null;
  max: number;
  children?: React.ReactNode;
}) {
  const ratio = value == null ? 0 : value / max;
  return (
    <article className={`rep-mod ${value == null ? "is-pending" : ""}`}>
      <div className="rep-mod-b">
        <p className="rep-kicker">{label}</p>
        <p className="rep-mod-v">
          <strong>{round1(value)}</strong>
          <em>/ {max}</em>
        </p>
        <Meter
          value={value ?? 0}
          max={max}
          tone={ratio >= 0.7 ? "success" : ratio >= 0.5 ? "accent" : "danger"}
          label={`${label}: ${round1(value)} dari ${max}`}
          className="rep-mod-meter"
        />
        {value == null && <p className="muted">Tidak dikerjakan di sesi ini</p>}
        {children}
      </div>
      <div className="rep-mod-s">
        <span>Kontribusi</span>
      </div>
    </article>
  );
}

export type ResultModule = {
  nap_contribution: number | null;
  ke_index: number | null;
  kt_index: number | null;
  kh_index: number | null;
} | null;

export type ResultViewProps = {
  sessionId: string;
  user: { name: string; email: string } | null;
  napScore: number | null;
  passed: boolean;
  disqualified: boolean;
  disqualifiedReason: string | null;
  isStandalone: boolean;
  predikat: string | null;
  threshold: number;
  ks: ResultModule;
  kp: ResultModule;
  kc: ResultModule;
  kecerdasanItems: KecerdasanReviewItem[];
  kepribadianItems: KepribadianReview;
  kecermatanSummary: KecermatanSummary | null;
  kecermatanDetail: KecermatanColumnGroup[];
  psikogram: HasilPsikogram[] | null;
  jalur: Jalur;
  /** Jalur dari profil akun pemilik sesi: tanpa tab ganti profil, profil lain dilipat. */
  profilTetap: boolean;
  kembali: { href: string; label: string; dari?: string };
  aspekSubtes: AspekSubtes[] | null;
};

/* Tampilan hasil murni (tanpa akses data) — page.tsx yang mengambil sesi. */
export default function ResultView({
  sessionId,
  user,
  napScore,
  passed,
  disqualified,
  disqualifiedReason,
  isStandalone,
  predikat,
  threshold,
  ks,
  kp,
  kc,
  kecerdasanItems,
  kepribadianItems,
  kecermatanSummary,
  kecermatanDetail,
  psikogram,
  jalur,
  profilTetap,
  kembali,
  aspekSubtes,
}: ResultViewProps) {
  const outcome = passed ? "Memenuhi Syarat" : "Tidak Memenuhi Syarat";
  const pill = disqualified ? "bad" : passed ? "ok" : "warn-pill";
  // Tryout lengkap: hasil utama = psikogram jalur terpilih (Peraturan As SDM Kapolri No. 3/2017).
  const utama = psikogram?.find((h) => h.jalur === jalur) ?? null;
  const subtesNama = ks ? "Kecerdasan" : kp ? "Kepribadian" : "Sikap Kerja";
  const ksSubtes = aspekSubtes?.filter((a) => a.kategori === "KS") ?? [];

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <ExamBar
        title="Hasil psikotes"
        count={[user?.name, user?.email].filter(Boolean).join(" · ")}
        actions={
          <Link href={kembali.href} className="mbtn">
            <span aria-hidden="true">←</span>
            {kembali.label}
          </Link>
        }
      />

      <div className="rep-page mx-auto w-full max-w-[1160px] px-4 py-8 sm:px-8 sm:py-12">
        <div className="rep-grid">
          <div className="rep-main">
            {psikogram ? <PsikogramSection hasil={psikogram} jalur={jalur} tetap={profilTetap} /> : aspekSubtes ? <AspekSubtesSection subtes={subtesNama} aspek={aspekSubtes} /> : <>
            <div>
              <span className="section-kicker">Rincian nilai</span>
              <h1 className="mt-1">Kontribusi per sub-tes</h1>
            </div>

            <div className="rep-mods">
              <ModuleCard label="Kecerdasan" value={ks?.nap_contribution ?? null} max={60} />
              <ModuleCard label="Kepribadian" value={kp?.nap_contribution ?? null} max={20} />
              <ModuleCard label="Sikap Kerja" value={kc?.nap_contribution ?? null} max={20}>
                {kc && (
                  <dl className="rep-kv">
                    {[
                      { label: "Kecepatan", value: kc.ke_index },
                      { label: "Ketelitian", value: kc.kt_index },
                      { label: "Ketahanan", value: kc.kh_index },
                    ].map((item) => (
                      <div key={item.label}>
                        <dt>{item.label}</dt>
                        <dd>{round1(item.value)}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </ModuleCard>
            </div>
            </>}
          </div>

          <aside className="rep-side">
            {utama ? (
            <section className="rep-hero" aria-label="Nilai akhir">
              <p className="rep-kicker">Nilai akhir psikotes</p>
              {!profilTetap && (
              <nav className="psg-tabs" aria-label="Profil penilaian">
                {JALUR.map((j) => (
                  <Link key={j} href={`?${new URLSearchParams({ jalur: j, ...(kembali.dari ? { dari: kembali.dari } : {}) })}`} scroll={false} aria-current={j === jalur ? "page" : undefined}>{JALUR_LABEL[j]}</Link>
                ))}
              </nav>
              )}
              <div className="rep-trio">
                <div className="rep-cell">
                  <b>{utama.nilai_akhir ?? "—"}</b>
                  <span>Nilai akhir profil {JALUR_LABEL[jalur]} (1–85) · {JALUR_SETARA[jalur]}</span>
                </div>
              </div>
              <ScoreRail score={utama.nilai_akhir} threshold={61} min={1} max={85} ticks={[1, 20, 40, 61, 85]} />
              <div className="rep-status">
                {utama.status ? (
                  <span className={`pill ${utama.status === "MS" ? "ok" : "bad"}`}>{utama.status === "MS" ? "Memenuhi Syarat" : "Tidak Memenuhi Syarat"}</span>
                ) : (
                  <span className="pill warn-pill">Belum lengkap</span>
                )}
                <p className="tnum">Lulus bila minimal <b>61</b> dan tidak ada aspek Kurang Sekali</p>
              </div>
              {utama.aspek_ks.length > 0 && (
                <p className="mt-4 rounded-md bg-white/10 px-4 py-3 text-sm text-[#ff9db1]">
                  Kurang Sekali di {utama.aspek_ks.map((a) => ASPEK_LABEL[a]).join(", ")}. Satu aspek Kurang Sekali membuat hasil Tidak Memenuhi Syarat.
                </p>
              )}
              {utama.belum_diuji.length > 0 && (
                <p className="mt-4 rounded-md bg-white/10 px-4 py-3 text-sm">
                  Belum diuji di sesi ini: {utama.belum_diuji.map((a) => ASPEK_LABEL[a]).join(", ")}. Kerjakan simulasi terbaru untuk nilai akhir profil ini.
                </p>
              )}
            </section>
            ) : aspekSubtes ? (
            <section className="rep-hero" aria-label="Hasil mini tryout">
              <p className="rep-kicker">Hasil mini tryout · {subtesNama}</p>
              <div className="rep-trio">
                <div className="rep-cell">
                  <b>{aspekSubtes.length - ksSubtes.length}/{aspekSubtes.length}</b>
                  <span>Aspek aman dari Kurang Sekali</span>
                </div>
              </div>
              <div className="rep-status">
                <span className={`pill ${ksSubtes.length ? "bad" : "ok"}`}>{ksSubtes.length ? "Ada aspek Kurang Sekali" : "Tidak ada aspek Kurang Sekali"}</span>
                <p className="tnum">Di psikotes resmi, satu aspek Kurang Sekali langsung menggugurkan.</p>
              </div>
              {ksSubtes.length > 0 && (
                <p className="mt-4 rounded-md bg-white/10 px-4 py-3 text-sm text-[#ff9db1]">
                  Prioritas latihan: {ksSubtes.map((a) => ASPEK_LABEL[a.aspek]).join(", ")}.
                </p>
              )}
              <p className="mt-4 text-sm opacity-80">Nilai akhir per profil (1–85) keluar setelah simulasi penuh tiga sub-tes.</p>
            </section>
            ) : (
            <section className="rep-hero" aria-label="Nilai akhir">
              <p className="rep-kicker">{isStandalone ? "Nilai sub-tes" : "Nilai akhir psikotes"}</p>
              <div className="rep-trio">
                <div className="rep-cell">
                  <b>{round1(napScore)}</b>
                  <span>Nilai Akhir Psikotest (0–100)</span>
                </div>
                {predikat && (
                  <div className="rep-cell">
                    <b>{predikat}</b>
                    <span>Predikat</span>
                  </div>
                )}
              </div>
              <ScoreRail score={napScore} threshold={threshold} />
              <div className="rep-status">
                <span className={`pill ${pill}`}>{outcome}</span>
                <p className="tnum">
                  {isStandalone ? "Harus di atas " : "Ambang lulus "}
                  <b>{threshold}</b>
                  {isStandalone ? " untuk sesi satu sub-tes" : " untuk tryout lengkap"}
                </p>
              </div>
              {disqualifiedReason && (
                <p className="mt-4 rounded-md bg-white/10 px-4 py-3 text-sm text-[#ff9db1]">
                  {/* Alasan lama di DB masih memuat "(raw_score=…)"; jangan tampilkan istilah teknis. */}
                  {disqualifiedReason.replace(/\s*\(raw_score=[^)]*\)/, "")}
                </p>
              )}
            </section>
            )}

            <div className="rep-acts">
              <p className="rep-kicker">Langkah berikutnya</p>
              <Link
                href={`/dashboard/review?sesi=${sessionId}`}
                className={buttonStyles({ variant: "primary", size: "lg" })}
              >
                Buka di Ruang Review
                <ChevronRight className="size-4" />
              </Link>
              <Link href="/dashboard/simulasi" className={buttonStyles({ variant: "secondary", size: "lg" })}>
                Coba simulasi lagi
              </Link>
            </div>
          </aside>
        </div>

        {/* Di luar rep-grid supaya navigator pembahasan dapat lebar penuh untuk dua kolomnya. */}
        <div className="mt-8">
          <PembahasanSection
            kecerdasan={kecerdasanItems}
            kepribadian={kepribadianItems.kepribadian}
            pribadi={kepribadianItems.pribadi}
            kecermatan={kecermatanSummary}
            kecermatanDetail={kecermatanDetail}
          />
        </div>
      </div>
    </div>
  );
}
