import type { CSSProperties, ReactNode } from "react";
import { analyzeKecermatan, titikHafalDari, type Analisis } from "@/lib/kecermatan-analisis";
import type { KecermatanTiming } from "@/lib/progress-rules";
import type { KecermatanColumnGroup } from "@/app/components/PembahasanSection";
import { KecermatanSymbol } from "@/app/components/KecermatanKeyStrip";
import PELAFALAN from "@/data/kecermatan-pelafalan.json";

/*
  Isi tab "Tanpa batas waktu" dan "Analisis" di hasil latihan Kecermatan
  (prototipe output/kecermatan-review-prototype.html, CSS app/latihan-analisis.css).
  AnalisisSimulasi = versi pembahasan Simulasi Penuh (PembahasanNavigator).
  Grafik garis = SVG viewBox 0 0 100 100 tanpa rasio; label = HTML di atasnya (persen).
*/

export const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
export const PER_COLUMN = 50;
export const r1 = (n: number) => (Math.round(n * 10) / 10).toLocaleString("id-ID");
const nama = (sym: string) => (PELAFALAN as Record<string, string>)[sym];
type Valid = Extract<Analisis, { valid: true }>;

const POLA = {
  impulsif: "Kamu cenderung buru-buru. Seperti menyeberang tanpa lihat kanan-kiri: cepat, tapi gampang salah.",
  seimbang: "Cepat dan teliti seimbang. Seperti menyeberang yang benar: tengok kanan-kiri sebentar, lalu jalan mantap.",
  ragu: "Kamu sering lama di butir yang sebenarnya sudah kamu tahu. Seperti berdiri lama di tepi jalan padahal jalanan sudah sepi: aman, tapi waktunya habis.",
};
const TREN = {
  naik: ["Naik", "is-up", "Seperti mesin motor yang sudah panas: makin lama makin enak jalannya."],
  stabil: ["Stabil", "", "Seperti jalan di tol: kecepatanmu sama terus dari awal sampai akhir."],
  turun: ["Turun", "is-down", "Seperti baterai HP yang mulai habis: di kolom akhir tenagamu menurun."],
};

type PlotProps = {
  h: number;
  xs: number[];
  ys: number[];
  hi: number;
  lo: number;
  yTicks: number[];
  xLabels: { x: number; t: ReactNode }[];
  values?: { x: number; v: number; t: string; below?: boolean }[];
  mark?: number;
  markT?: string;
  levels?: { x0: number; x1: number; v: number }[];
  thin?: boolean;
  label: string;
};

function Plot({ h, xs, ys, hi, lo, yTicks, xLabels, values, mark, markT, levels, thin, label }: PlotProps) {
  const Y = (v: number) => ((hi - v) / (hi - lo)) * 100;
  return (
    <div className="lr-plot is-draw" style={{ "--h": `${h}px` } as CSSProperties} role="img" aria-label={label}>
      {mark !== undefined && <div className="lr-plot-zone" style={{ width: `${mark}%` }} />}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {yTicks.map((v) => <line key={v} className="grid" x1="0" x2="100" y1={Y(v)} y2={Y(v)} />)}
        {mark !== undefined && <line className="mark" x1={mark} x2={mark} y1="0" y2="100" />}
        {levels?.map((l) => <line key={l.x0} className="lvl" x1={l.x0} x2={l.x1} y1={Y(l.v)} y2={Y(l.v)} />)}
        <polyline className={`line${thin ? " is-thin" : ""}`} points={xs.map((x, i) => `${x.toFixed(2)},${Y(ys[i]).toFixed(2)}`).join(" ")} />
        {values &&
          xs.map((x, i) => (
            <g key={i}>
              <path className="dot-o" d={`M${x} ${Y(ys[i])}h0`} />
              <path className="dot-i" d={`M${x} ${Y(ys[i])}h0`} />
            </g>
          ))}
      </svg>
      {yTicks.map((v) => <span key={v} className="lr-plot-y" style={{ top: `${Y(v)}%` }}>{v}</span>)}
      {xLabels.map((l) => <span key={l.x} className="lr-plot-x" style={{ left: `${l.x}%` }}>{l.t}</span>)}
      {values?.map((v) => (
        <span key={v.x} className={`lr-plot-v${v.below ? " is-below" : ""}`} style={{ left: `${v.x}%`, top: `${Y(v.v)}%` }}>{v.t}</span>
      ))}
      {mark !== undefined && <span className="lr-plot-t" style={{ left: `calc(${mark}% + 6px)`, top: 4 }}>{markT}</span>}
    </div>
  );
}

/** Grafik batang per kolom; skip = kolom tak dikerjakan (slot berarsir). */
export function BarChart({ title, bars, notes }: { title: string; bars: { n: number; ok: number; skip?: boolean }[]; notes: (string | false)[] }) {
  const peak = Math.max(PER_COLUMN, ...bars.map((c) => c.n));
  return (
    <figure className="lr-chart">
      <figcaption>
        <b>{title}</b>
        <span>
          <i className="is-ok" /> benar <i className="is-bad" /> salah
        </span>
      </figcaption>
      <ol aria-label={title}>
        {bars.map((c, i) => (
          <li key={i} aria-label={`Kolom ${ROMAN[i]}: ${c.skip ? "belum dikerjakan" : `${c.n} dijawab, ${c.ok} benar`}`}>
            <span className="lr-chart-track">
              <span className="lr-chart-n tnum">{c.skip ? "-" : c.n || ""}</span>
              {c.skip ? (
                <span className="lr-chart-bar is-skip" />
              ) : (
                <span className="lr-chart-bar" style={{ height: `calc((100% - 14px) * ${c.n / peak})`, animationDelay: `${i * 40}ms` }}>
                  <span className="is-bad" style={{ flexGrow: c.n - c.ok }} />
                  <span className="is-ok" style={{ flexGrow: c.ok }} />
                </span>
              )}
            </span>
            <span className="lr-chart-x">{ROMAN[i]}</span>
          </li>
        ))}
      </ol>
      {notes.map((t) => t && <p key={t}>{t}</p>)}
    </figure>
  );
}

/** "Kapan kunci mulai hafal?": kurva detik per butir menurut posisi dalam kolom (lib/kecermatan-analisis kurvaDari). */
export function HafalSection({ kurva }: { kurva: (number | null)[] }) {
  const pts = kurva.flatMap((y, i) => (y === null ? [] : [{ i, y }]));
  const { titikHafal: k, lebihCepatPct, sebelum, sesudah } = titikHafalDari(kurva);
  const n = pts.length ? pts[pts.length - 1].i + 1 : 0;
  const X = (i: number) => (i * 100) / (n - 1);
  const hi = Math.ceil(Math.max(...pts.map((p) => p.y)) + 0.4);
  const m = k === null ? undefined : X(k - 0.5);
  return (
    <section className="lr-sec">
      <div className="pg-sec-h">
        <h3>Kapan kunci mulai hafal?</h3>
      </div>
      {pts.length < 10 ? (
        <p className="pg-empty">Belum cukup butir untuk membaca titik hafal.</p>
      ) : (
        <>
          {k !== null ? (
            <>
              <p className="lr-big">
                ±{k} butir untuk hafal kunci, setelah itu <em>{lebihCepatPct}% lebih cepat</em>.
              </p>
              <p className="lr-sub">
                Dari sekitar {r1(sebelum!)} detik jadi {r1(sesudah!)} detik per butir.
              </p>
            </>
          ) : (
            <p className="lr-big">Tidak terlihat fase menghafal yang jelas: kamu sudah lancar sejak awal kolom.</p>
          )}
          <div className="pg-legend" style={{ marginTop: 14 }}>
            <span><i className="lr-key" />detik per butir (biasanya)</span>
            {k !== null && <span><i className="lr-key is-dash" />rata-rata sebelum dan sesudah hafal</span>}
          </div>
          <Plot
            h={170}
            xs={pts.map((p) => X(p.i))}
            ys={pts.map((p) => p.y)}
            lo={0}
            hi={hi}
            yTicks={Array.from({ length: hi + 1 }, (_, v) => v)}
            thin
            xLabels={[1, 10, 20, 30, 40, 50].filter((b) => b <= n).map((b) => ({ x: X(b - 1), t: b }))}
            mark={m}
            markT={`hafal di butir ke-${k}`}
            levels={m === undefined ? undefined : [{ x0: 0, x1: m, v: sebelum! }, { x0: m, x1: 100, v: sesudah! }]}
            label={`Detik per butir menurut urutan butir 1 sampai ${n}.${k === null ? "" : ` Sekitar ${r1(sebelum!)} detik sebelum butir ke-${k}, sekitar ${r1(sesudah!)} detik sesudahnya.`}`}
          />
          <p className="lr-like">
            Seperti menghafal nomor HP teman: awalnya lihat catatan, lama-lama langsung ingat.
            {k !== null && " Bagian berarsir adalah saat kamu masih sering melirik kunci."}
          </p>
        </>
      )}
    </section>
  );
}

/**
  Pembahasan Simulasi Penuh: grafik + analisis yang sama dengan latihan bertimer. Waktu per butir = jeda dari klik
  sebelumnya di kolom yang sama (lib/review.ts); butir pertama kolom tanpa waktu, jadi tidak ikut dianalisis.
  Kolom ujian selalu urut I-X, maka urutan kunjungan = nomor kolom.
*/
export function AnalisisSimulasi({ groups }: { groups: KecermatanColumnGroup[] }) {
  const items = groups.flatMap((g) =>
    g.items.map((it) => ({
      id: it.question_id,
      column: g.column_index,
      seq: it.sequence_number,
      correct: it.is_correct,
      selected: it.selected_key,
      correctKey: it.correct_key,
      symbols: it.symbol_map as Record<string, string>,
    }))
  );
  const timing: KecermatanTiming = { v: 1, pel: false, cols: {}, t: {} };
  for (const g of groups) {
    timing.cols[g.column_index] = { o: g.column_index, clean: true };
    let sejakMulai = 0;
    for (const it of g.items) if (it.ms && it.ms > 0) timing.t[it.question_id] = [(sejakMulai += it.ms), it.ms];
  }
  const a = analyzeKecermatan(items, timing);
  const bars = ROMAN.map((_, i) => {
    const g = groups.find((x) => x.column_index === i + 1);
    return { n: g?.total ?? 0, ok: g?.correct ?? 0 };
  });
  return (
    <div className="space-y-4">
      <div className="lr-pane">
        <section className="lr-sec">
          <BarChart title="Jawaban per kolom" bars={bars} notes={["Bagian emas yang sama tinggi di tiap kolom berarti Ketahanan tinggi."]} />
        </section>
        {a.valid && <KecepatanPerKolom a={a} />}
      </div>
      {a.valid ? (
        <AnalisisPane a={a} timedMode />
      ) : (
        <div className="lr-pane">
          <section className="lr-sec">
            <p className="pg-empty">{a.alasan}</p>
          </section>
        </div>
      )}
    </div>
  );
}

export function ProfilPane({ a }: { a: Valid }) {
  const { akurasi, benarPerMenit, tren, jeda } = a.penuh;
  const t = TREN[tren];
  return (
    <div className="lr-pane">
      <section className="lr-sec">
        <div className="pg-sec-h">
          <h3>Profil tanpa batas waktu</h3>
          <span>semua butir yang kamu jawab</span>
        </div>
        <dl className="lr-stats">
          <div>
            <dt>Akurasi</dt>
            <dd>
              <b className="tnum">{r1(akurasi)}<small>%</small></b>
              <p className="lr-like">Seperti melempar 100 bola ke keranjang: {Math.floor(akurasi)} masuk.</p>
            </dd>
          </div>
          <div>
            <dt>Benar per menit</dt>
            <dd>
              <b className="tnum">{r1(benarPerMenit)}</b>
              <p className="lr-like">Seperti speedometer motor: menunjukkan seberapa kencang kamu melaju.</p>
            </dd>
          </div>
          <div>
            <dt>Tren kecepatan</dt>
            <dd>
              <b className={t[1]}>{t[0]}</b>
              <p className="lr-like">{t[2]}</p>
            </dd>
          </div>
          <div>
            <dt>Jeda panjang dibuang</dt>
            <dd>
              <b className="tnum">{jeda} <small>kali</small></b>
              <p className="lr-like">Seperti stopwatch yang di-pause saat kamu berhenti sebentar.</p>
            </dd>
          </div>
        </dl>
      </section>
      <KecepatanPerKolom a={a} />
    </div>
  );
}

function KecepatanPerKolom({ a }: { a: Valid }) {
  const { perKolom } = a.penuh;
  const bpm = perKolom.map((k) => k.benarPerMenit);
  const xs = bpm.map((_, i) => 5 + (i * 90) / (bpm.length - 1));
  const lo = Math.max(0, Math.floor((Math.min(...bpm) - 4) / 5) * 5);
  const hi = Math.ceil((Math.max(...bpm) + 3) / 5) * 5;
  const max = bpm.indexOf(Math.max(...bpm));
  const min = bpm.indexOf(Math.min(...bpm));
  return (
    <section className="lr-sec">
      <div className="pg-sec-h">
        <h3>Kecepatan per kolom</h3>
        <span>urut sesuai yang kamu kerjakan</span>
      </div>
      <div className="pg-legend">
        <span><i className="lr-key" />benar per menit</span>
        <span><i className="lr-key is-hex" />akurasi (%)</span>
      </div>
      <Plot
        h={150}
        xs={xs}
        ys={bpm}
        lo={lo}
        hi={hi}
        yTicks={Array.from({ length: (hi - lo) / 5 + 1 }, (_, i) => lo + i * 5)}
        xLabels={perKolom.map((k, i) => ({ x: xs[i], t: ROMAN[k.column - 1] }))}
        values={[...new Set([0, max, bpm.length - 1])].map((i) => ({ x: xs[i], v: bpm[i], t: r1(bpm[i]), below: i > 0 && bpm[i - 1] > bpm[i] }))}
        label={`Benar per menit per kolom, urut dikerjakan: ${perKolom.map((k) => `kolom ${ROMAN[k.column - 1]} ${r1(k.benarPerMenit)}`).join(", ")}.`}
      />
      <div className="lr-accrow" aria-label={`Akurasi per kolom: ${perKolom.map((k) => `kolom ${ROMAN[k.column - 1]} ${r1(k.akurasi)}%`).join(", ")}`}>
        {perKolom.map((k, i) => (
          <span key={k.column} className={k.akurasi < 90 ? "is-low" : ""} style={{ left: `${xs[i]}%` }}>{Math.round(k.akurasi)}</span>
        ))}
      </div>
      <p className="lr-note">
        Paling kencang di kolom {ROMAN[perKolom[max].column - 1]} ({r1(bpm[max])} benar per menit), paling pelan di kolom{" "}
        {ROMAN[perKolom[min].column - 1]} ({r1(bpm[min])}).
      </p>
    </section>
  );
}

export function AnalisisPane({ a, timedMode }: { a: Valid; timedMode: boolean }) {
  const { pola, tertukar, koreksiDiri } = a.diagnosis;
  const p0 = tertukar[0];
  const tips = [
    a.adaptasi.titikHafal && `Di ${a.adaptasi.titikHafal} butir pertama tiap kolom, sebut nama simbolnya dalam hati. Kunci jadi lebih cepat nempel.`,
    p0 && nama(p0.benar) && nama(p0.dikira) && `Bedakan “${nama(p0.benar)}” dan “${nama(p0.dikira)}”: cari satu detail yang beda, lihat itu dulu, baru tekan.`,
    pola === "impulsif" && "Tahan sekejap sebelum menekan: pastikan simbol itu memang tidak ada di baris soal.",
    pola === "ragu" && "Kalau sudah yakin, langsung tekan. Mengecek ulang jawaban yang sudah benar cuma makan waktu.",
    !timedMode && "Sesekali coba dengan timer 60 detik supaya terbiasa dengan tempo aslinya.",
  ].filter((t): t is string => Boolean(t)).slice(0, 3);
  return (
    <div className="lr-pane">
      <HafalSection kurva={a.adaptasi.kurva} />
      <section className="lr-sec">
        <div className="pg-sec-h">
          <h3>Simbol yang sering tertukar</h3>
        </div>
        {tertukar.length ? (
          <>
            <ul className="lr-pairs">
              {tertukar.map((p) => (
                <li key={p.benar + p.dikira}>
                  <span className="lr-pair-sym" aria-hidden="true">
                    <span><KecermatanSymbol symbol={p.benar} /></span>
                    <span><KecermatanSymbol symbol={p.dikira} /></span>
                  </span>
                  <span className="lr-pair-txt">
                    <b>{nama(p.benar) && nama(p.dikira) ? `${nama(p.benar)} dan ${nama(p.dikira)}` : "Dua simbol mirip"}</b>
                    <small>kiri kunci yang hilang, kanan yang kamu kira</small>
                  </span>
                  <span className="lr-pair-n tnum">{p.n}<small> kali</small></span>
                </li>
              ))}
            </ul>
            <p className="lr-like">Seperti anak kembar: sekilas sama, bedanya di satu detail kecil. Cari detail itu dulu sebelum menekan.</p>
          </>
        ) : (
          <p className="pg-empty">Tidak ada pasangan simbol yang sering tertukar. Matamu jeli.</p>
        )}
      </section>
      <section className="lr-sec">
        <div className="pg-sec-h">
          <h3>Gaya kerjamu</h3>
        </div>
        <ol className="lr-scale" aria-label="Gaya kerja">
          {([["impulsif", "Impulsif"], ["seimbang", "Seimbang"], ["ragu", "Ragu-ragu"]] as const).map(([k, l]) => (
            <li key={k} aria-current={k === pola ? "true" : undefined}>{l}</li>
          ))}
        </ol>
        <p className="lr-note">{POLA[pola]}</p>
        {koreksiDiri && <p className="lr-like">Setelah salah, kamu melambat sebentar lalu kembali normal. Itu tanda bagus: kamu belajar dari salah.</p>}
      </section>
      {tips.length > 0 && (
        <section className="lr-sec">
          <div className="pg-sec-h">
            <h3>Coba ini di latihan berikutnya</h3>
          </div>
          <ul className="lr-tips">
            {tips.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </section>
      )}
    </div>
  );
}
