import { Facts, Ticket } from "@/app/components/ProgressTicket";
import { MODULE_CONFIG, MODULE_ORDER, type ModuleType } from "@/lib/test-config";
import { ASPEK_LABEL, JALUR_LABEL, JALUR_SETARA, type Aspek, type Jalur, type Kategori } from "@/lib/scoring/psikogram";
import ProfilPicker from "@/app/components/ProfilPicker";

/*
  Tiket progres simulasi: nilai akhir psikogram (1–85) profil pilihan peserta tiap tryout
  lengkap terhadap ambang 61, dan kategori aspek terakhir tiap sub-tes. Komponen server;
  data dari page.tsx (riwayat milik peserta sesi ini saja).
*/

export const PASSING = 61;

export type TryoutPoint = { at: string; nap: number; ms: boolean };
/** Kategori per aspek dari percobaan terakhir tiap sub-tes. */
export type AspekTerakhir = Partial<Record<ModuleType, { at: string; aspek: { aspek: Aspek; kategori: Kategori }[] }>>;

const dec = (n: number) => String(Math.round(n));
const day = (iso: string) => new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });

function Trend({ points }: { points: TryoutPoint[] }) {
  const W = 520, H = 230, L = 34, R = 20, T = 24, B = 30;
  const vals = points.map((p) => p.nap);
  const lo = Math.max(0, Math.floor((Math.min(...vals, PASSING) - 6) / 5) * 5);
  const hi = Math.min(85, Math.ceil((Math.max(...vals, PASSING) + 6) / 5) * 5);
  const x = (i: number) => (points.length === 1 ? (L + W - R) / 2 : L + (i * (W - L - R)) / (points.length - 1));
  const y = (v: number) => T + ((hi - v) * (H - T - B)) / (hi - lo);
  const step = hi - lo > 30 ? 10 : 5;
  const ticks = Array.from({ length: Math.floor((hi - lo) / step) + 1 }, (_, i) => lo + i * step);
  const line = points.map((p, i) => `${x(i)},${y(p.nap)}`).join(" ");
  const best = Math.max(...vals);
  const bestIdx = vals.indexOf(best);
  const labelAt = new Set([0, bestIdx, points.length - 1]);
  // Label tanggal di sumbu: semua bila sedikit, selebihnya tiap beberapa titik.
  const every = Math.ceil(points.length / 7);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Nilai Akhir Psikotest per tryout lengkap: ${vals.map(dec).join(", ")}. Ambang ${PASSING}.`}>
      <defs>
        <linearGradient id="pg-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d0a645" stopOpacity=".32" />
          <stop offset="1" stopColor="#d0a645" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="var(--pg-rule)" />
          <text x={L - 8} y={y(v) + 4} textAnchor="end">{v}</text>
        </g>
      ))}
      <rect x={L} y={y(PASSING)} width={W - L - R} height={y(lo) - y(PASSING)} fill="var(--pg-weak-bg)" opacity=".55" />
      <line x1={L} x2={W - R} y1={y(PASSING)} y2={y(PASSING)} stroke="var(--pg-weak)" strokeDasharray="5 4" strokeWidth="1.5" />
      <text className="pg-thr-t" x={W - R} y={y(PASSING) - 6} textAnchor="end">Ambang {PASSING}</text>
      {points.length > 1 && <polygon points={`${x(0)},${y(lo)} ${line} ${x(points.length - 1)},${y(lo)}`} fill="url(#pg-area)" />}
      {points.length > 1 && <polyline className="pg-line" points={line} fill="none" stroke="var(--brand-ink)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
      {points.map((p, i) => {
        const last = i === points.length - 1;
        return (
          <g key={i}>
            <circle cx={x(i)} cy={y(p.nap)} r={last ? 6.5 : 4} fill={last ? "var(--brand-ink)" : "var(--surface-card)"} stroke={p.ms ? "var(--brand-ink)" : "var(--pg-weak)"} strokeWidth="2">
              <title>{`${day(p.at)}: ${dec(p.nap)}`}</title>
            </circle>
            {(i % every === 0 || last) && (
              <text x={x(i)} y={H - 8} textAnchor="middle">{day(p.at)}</text>
            )}
            {labelAt.has(i) && (
              <text className="pg-lbl" x={x(i)} y={y(p.nap) - 12} textAnchor="middle">
                {dec(p.nap)}
                {i === bestIdx && points.length > 1 ? " terbaik" : ""}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function SimulasiProgress({
  tryouts,
  aspekTerakhir,
  single,
  profil,
  belumLengkap,
}: {
  tryouts: TryoutPoint[];
  aspekTerakhir: AspekTerakhir;
  single: number;
  profil: Jalur | null;
  /** Tryout lengkap yang belum punya nilai untuk profil ini (aspeknya belum diuji). */
  belumLengkap: number;
}) {
  const vals = tryouts.map((t) => t.nap);
  const best = vals.length ? Math.max(...vals) : null;
  const bestMs = tryouts.some((t) => t.nap === best && t.ms);
  const last = vals.at(-1);
  const prev = vals.at(-2);
  const passed = tryouts.filter((t) => t.ms).length;
  const delta = last !== undefined && prev !== undefined ? last - prev : null;
  const anySub = MODULE_ORDER.some((t) => aspekTerakhir[t]);

  return (
    <Ticket
      label="Progress simulasi"
      stub={
        <>
          <span className="pg-label">Nilai akhir terbaik{profil ? ` · ${JALUR_LABEL[profil]}` : ""}</span>
          <span className="pg-big">{best === null ? "-" : dec(best)}</span>
          {best !== null ? (
            <span className={`pg-chip${bestMs ? "" : " is-below"}`}>{bestMs ? "Memenuhi Syarat" : "Belum Memenuhi Syarat"} · skala 1–85, lulus 61</span>
          ) : (
            <span className="pg-sub">{profil ? "Belum ada nilai untuk profil ini" : "Pilih profil tujuan untuk melihat nilai"}</span>
          )}
          <Facts
            rows={[
              [
                "Terakhir",
                last === undefined ? "-" : (
                  <>
                    {dec(last)}{" "}
                    {delta !== null && delta !== 0 && (
                      <span className={delta > 0 ? "is-up" : "is-down"} style={{ fontSize: ".8rem" }}>
                        {delta > 0 ? "naik" : "turun"} {dec(Math.abs(delta))}
                      </span>
                    )}
                  </>
                ),
              ],
              ["Tryout lengkap", `${vals.length + belumLengkap} selesai`],
              ["Memenuhi Syarat", vals.length ? `${passed} dari ${vals.length}` : "-"],
              ["Sesi satu sub-tes", String(single)],
            ]}
          />
        </>
      }
    >
      <section className="pg-trend">
        <div className="pg-sec-h">
          <h3>Perkembangan nilai akhir</h3>
          <ProfilPicker value={profil} />
        </div>
        {!profil ? (
          <p className="pg-empty">Pilih profil tujuanmu dulu. Nilai akhir dihitung dengan bobot profil itu (Peraturan As SDM Kapolri No. 3/2017), dan bisa diganti kapan saja.</p>
        ) : tryouts.length ? (
          <>
            <Trend points={tryouts} />
            <p className="pg-empty" style={{ fontSize: ".8rem" }}>
              {JALUR_SETARA[profil]}.{belumLengkap > 0 ? ` ${belumLengkap} tryout lama belum punya nilai profil ini karena aspeknya belum diuji.` : ""}
            </p>
          </>
        ) : (
          <p className="pg-empty">
            {belumLengkap > 0
              ? `${belumLengkap} tryout lengkapmu belum punya nilai profil ${JALUR_LABEL[profil]} karena ada aspek yang belum diuji. Kerjakan simulasi terbaru untuk nilai lengkap.`
              : "Grafik muncul setelah kamu menyelesaikan satu tryout lengkap (ketiga sub-tes)."}
          </p>
        )}
      </section>
      <section>
        <div className="pg-sec-h">
          <h3>Kategori aspek terakhir</h3>
          <span>B · CB · C · K · KS</span>
        </div>
        {anySub ? (
          <div className="pg-range">
            {MODULE_ORDER.map((type) => {
              const a = aspekTerakhir[type];
              const label = MODULE_CONFIG[type].label;
              const ks = a?.aspek.filter((x) => x.kategori === "KS").length ?? 0;
              return (
                <div key={type} className="pg-asp">
                  <span className="pg-nm">
                    {label}
                    <small>{a ? `${day(a.at)} · ${ks ? `${ks} aspek Kurang Sekali` : "aman dari KS"}` : "Belum dikerjakan"}</small>
                  </span>
                  {a && (
                    <ul className="pg-kats" aria-label={`Kategori aspek ${label}`}>
                      {a.aspek.map((x) => (
                        <li key={x.aspek} className={`k-${x.kategori.toLowerCase()}`} title={ASPEK_LABEL[x.aspek]}>
                          {ASPEK_LABEL[x.aspek].replace("Kemampuan Berpikir ", "")} <b>{x.kategori}</b>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="pg-empty">Kategori muncul setelah kamu menyelesaikan satu sub-tes simulasi.</p>
        )}
      </section>
    </Ticket>
  );
}
