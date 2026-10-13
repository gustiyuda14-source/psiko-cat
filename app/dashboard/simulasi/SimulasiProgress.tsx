import { Facts, Ticket } from "@/app/components/ProgressTicket";
import { MODULE_CONFIG, MODULE_ORDER, type ModuleType } from "@/lib/test-config";

/*
  Tiket progres simulasi: perkembangan Nilai Akhir Psikotest tiap tryout lengkap terhadap
  ambang kelulusan, dan distribusi skor tiap sub-tes dari seluruh percobaan. Komponen server;
  data dari page.tsx (riwayat milik peserta sesi ini saja).
*/

export const PASSING = 61;
/** Skor murni sub-tes <= 40 = gugur mutlak (lib/scoring/nap.ts). */
export const GUGUR = 40;

export type TryoutPoint = { at: string; nap: number };
/** Skor murni per sub-tes, urut lama → baru. */
export type SubScores = Partial<Record<ModuleType, number[]>>;

const dec = (n: number) => n.toFixed(1).replace(".", ",");
const day = (iso: string) => new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });

function Trend({ points }: { points: TryoutPoint[] }) {
  const W = 520, H = 230, L = 34, R = 20, T = 24, B = 30;
  const vals = points.map((p) => p.nap);
  const lo = Math.max(0, Math.floor((Math.min(...vals, PASSING) - 6) / 5) * 5);
  const hi = Math.min(100, Math.ceil((Math.max(...vals, PASSING) + 6) / 5) * 5);
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
            <circle cx={x(i)} cy={y(p.nap)} r={last ? 6.5 : 4} fill={last ? "var(--brand-ink)" : "var(--surface-card)"} stroke={p.nap < PASSING ? "var(--pg-weak)" : "var(--brand-ink)"} strokeWidth="2">
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

export default function SimulasiProgress({ tryouts, subScores, single }: { tryouts: TryoutPoint[]; subScores: SubScores; single: number }) {
  const vals = tryouts.map((t) => t.nap);
  const best = vals.length ? Math.max(...vals) : null;
  const last = vals.at(-1);
  const prev = vals.at(-2);
  const passed = vals.filter((v) => v >= PASSING).length;
  const delta = last !== undefined && prev !== undefined ? last - prev : null;
  const anySub = MODULE_ORDER.some((t) => subScores[t]?.length);

  return (
    <Ticket
      label="Progress simulasi"
      stub={
        <>
          <span className="pg-label">Nilai Akhir Psikotest terbaik</span>
          <span className="pg-big">{best === null ? "-" : dec(best)}</span>
          {best !== null ? (
            <span className={`pg-chip${best >= PASSING ? "" : " is-below"}`}>
              {best >= PASSING ? "Memenuhi" : "Belum memenuhi"} ambang kelulusan {PASSING}
            </span>
          ) : (
            <span className="pg-sub">Belum ada tryout lengkap</span>
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
              ["Tryout lengkap", `${vals.length} selesai`],
              ["Memenuhi ambang", vals.length ? `${passed} dari ${vals.length}` : "-"],
              ["Sesi satu sub-tes", String(single)],
            ]}
          />
        </>
      }
    >
      <section className="pg-trend">
        <div className="pg-sec-h">
          <h3>Perkembangan Nilai Akhir Psikotest</h3>
          {tryouts.length > 0 && (
            <span>
              {tryouts.length} tryout lengkap{tryouts.length > 1 ? `, ${day(tryouts[0].at)} sampai ${day(tryouts.at(-1)!.at)}` : ""}
            </span>
          )}
        </div>
        {tryouts.length ? <Trend points={tryouts} /> : <p className="pg-empty">Grafik muncul setelah kamu menyelesaikan satu tryout lengkap (ketiga sub-tes).</p>}
      </section>
      <section>
        <div className="pg-sec-h">
          <h3>Distribusi skor per sub-tes</h3>
          <span>Skala 0 sampai 100</span>
        </div>
        {anySub ? (
          <>
            <div className="pg-range">
              {MODULE_ORDER.map((type) => {
                const s = subScores[type] ?? [];
                const label = MODULE_CONFIG[type].label;
                if (!s.length)
                  return (
                    <div key={type} className="pg-rg">
                      <span className="pg-nm">{label}<small>Belum dikerjakan</small></span>
                      <span className="pg-axis" aria-hidden="true"><span className="pg-thr" style={{ left: `${GUGUR}%` }} /></span>
                      <b>-</b>
                    </div>
                  );
                const r = s.map(Math.round), mn = Math.min(...r), mx = Math.max(...r), lv = r.at(-1)!, d = r.length > 1 ? lv - r.at(-2)! : null;
                return (
                  <div key={type} className="pg-rg">
                    <span className="pg-nm">{label}<small>{r.length} percobaan</small></span>
                    <span className="pg-axis" role="img" aria-label={`${label}: terakhir ${lv}, terbaik ${mx}, rentang ${mn} sampai ${mx}`}>
                      <span className="pg-thr" style={{ left: `${GUGUR}%` }} />
                      <span className="pg-band" style={{ left: `${mn}%`, width: `${mx - mn}%` }} />
                      {r.map((v, i) => <span key={i} className="pg-pt" style={{ left: `${v}%` }} />)}
                      <span className="pg-best" style={{ left: `${mx}%` }} />
                      <span className="pg-last" style={{ left: `${lv}%` }} />
                    </span>
                    <b>{lv}</b>
                    <span className="pg-d">
                      <span>Rentang {mn} sampai {mx}</span>
                      {d !== null && <span className={d >= 0 ? "pg-up" : "pg-down"}>{d === 0 ? "tetap" : `${d > 0 ? "naik" : "turun"} ${Math.abs(d)}`}</span>}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="pg-legend" style={{ marginTop: 16 }}>
              <span><i style={{ background: "var(--brand-ink)", borderRadius: "50%" }} />Terakhir</span>
              <span><i style={{ background: "var(--gold)", width: 2 }} />Terbaik</span>
              <span><i style={{ background: "color-mix(in srgb,var(--pg-t2) 35%,transparent)" }} />Rentang skor</span>
              <span><i style={{ borderLeft: "1.5px dashed var(--pg-weak)", width: 0, borderRadius: 0 }} />Batas gugur {GUGUR}</span>
            </div>
          </>
        ) : (
          <p className="pg-empty">Distribusi muncul setelah kamu menyelesaikan satu sub-tes simulasi.</p>
        )}
      </section>
    </Ticket>
  );
}
