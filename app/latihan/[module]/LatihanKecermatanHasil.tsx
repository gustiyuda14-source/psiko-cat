"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SafeQuestion, KecermatanOptionsPayload } from "@/lib/types/safe-question";
import type { KecermatanScoreResult } from "@/lib/scoring/kecermatan";
import { KecermatanSymbol } from "@/app/components/KecermatanKeyStrip";
import { buttonStyles } from "@/app/components/ui";
import { ChevronDown, ChevronRight, Repeat } from "@/app/components/icons";
import { fillY, wavePath } from "@/lib/honey";
import { analyzeKecermatan } from "@/lib/kecermatan-analisis";
import type { KecermatanTiming } from "@/lib/progress-rules";
import { scoreLatihanKecermatan } from "./actions";
import { AnalisisPane, BarChart, PER_COLUMN, ProfilPane, ROMAN, Tabs, r1 } from "./LatihanKecermatanAnalisis";

/*
  Layar selesai latihan Kecermatan, bahasa visual sama dengan pemilih paket
  (app/honey.css): panel madu di kanan (sticky di desktop, paling atas di HP)
  berisi meter heksagon, indeks Ke/Kt/Kh, dan grafik klik per kolom — batang yang
  rata = Ketahanan tinggi. Tanpa timer: "Nilai 60 detik" bayangan dari 60 detik
  pertama tiap kolom (docs/rencana/kecermatan-latihan-analisis.md), tidak disimpan
  ke tren. Kiri: tab profil + analisis (LatihanKecermatanAnalisis.tsx) dan rincian
  per kolom, tiap kolom <details> yang bisa dibuka untuk melihat butir yang salah.
*/

export type LatihanFeedback = { selected: string; is_correct: boolean; correct_key: string };

const HEX = "50,0 100,28.87 100,86.6 50,115.47 0,86.6 0,28.87";
const WAVE = wavePath(50, 4.5, -100, 200, 140);
// ponytail: ambang "nilai 60 detik rendah" sementara = 15 butir per kolom (Keterlibatan penuh engine v2); kalibrasi F4.
const BUTIR_60_RENDAH = 15;
const LEGACY_GATE = ["Nilai 60 detik tidak tersedia", "Percobaan ini tersimpan sebelum waktu pengerjaan dicatat. Ulangi latihan untuk melihat Nilai 60 detik dan analisisnya."];

type Wrong = { id: string; no: number; shown: string[]; selected: string; selectedSym: string; key: string; keySym: string };
type Column = { index: number; total: number; correct: number; wrong: Wrong[] };

function buildColumns(sorted: SafeQuestion[], answers: Record<string, LatihanFeedback>): Column[] {
  const cols: Column[] = ROMAN.map((_, i) => ({ index: i + 1, total: 0, correct: 0, wrong: [] }));
  for (const q of sorted) {
    const fb = answers[q.id];
    const col = cols[(q.column_index ?? 0) - 1];
    if (!fb || !col) continue;
    col.total++;
    if (fb.is_correct) {
      col.correct++;
      continue;
    }
    const p = q.options_payload as unknown as KecermatanOptionsPayload;
    const sym = (k: string) => p.symbol_map[k as keyof typeof p.symbol_map] ?? "?";
    col.wrong.push({
      id: q.id,
      no: q.sequence_number,
      shown: p.shown,
      selected: fb.selected,
      selectedSym: sym(fb.selected),
      key: fb.correct_key,
      keySym: sym(fb.correct_key),
    });
  }
  return cols;
}

function HexMeter({ value, label, note }: { value: number; label: string; note: string }) {
  // Mulai kosong lalu terisi: satu momen gerak di layar ini.
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(value));
    return () => cancelAnimationFrame(id);
  }, [value]);
  return (
    <div className="hc-meter lr-meter">
      <svg viewBox="0 0 100 115.47" className="hc-meter-hex" aria-hidden="true">
        <defs>
          <clipPath id="lr-hex">
            <polygon points={HEX} />
          </clipPath>
          <linearGradient id="lr-honey" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--honey-top)" />
            <stop offset="1" stopColor="var(--honey-bot)" />
          </linearGradient>
        </defs>
        <polygon points={HEX} className="hc-core-base" />
        <g clipPath="url(#lr-hex)">
          <g className="hc-honey-y" style={{ transform: `translateY(${fillY(0, 115.47, Math.max(shown, 0.04))}px)` }}>
            <g className="hc-honey-x is-live">
              <path d={WAVE} fill="url(#lr-honey)" className="hc-honey" />
            </g>
          </g>
        </g>
        <polygon points={HEX} className="hc-core-line" />
      </svg>
      <div>
        <span className="lr-meter-lab">{label}</span>
        <span className="hc-meter-pct tnum">{r1(value * 100)}</span>
        <span className="hc-meter-of">{note}</span>
      </div>
    </div>
  );
}

function Indeks({ score }: { score: KecermatanScoreResult }) {
  return (
    <dl className="lr-idx">
      {[
        { label: "Kecepatan", value: score.ke_index },
        { label: "Ketelitian", value: score.kt_index },
        { label: "Ketahanan", value: score.kh_index },
      ].map((s) => (
        <div key={s.label}>
          <dt>{s.label}</dt>
          <dd className="tnum">{r1(s.value)}</dd>
          <Bar value={s.value} />
        </div>
      ))}
    </dl>
  );
}

function Bar({ value }: { value: number }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setW(Math.max(0, Math.min(100, value))));
    return () => cancelAnimationFrame(id);
  }, [value]);
  return (
    <i aria-hidden="true">
      <span style={{ transform: `scaleX(${w / 100})` }} />
    </i>
  );
}

export default function LatihanKecermatanHasil({
  sorted,
  answers,
  timedMode,
  ajiks = false,
  score,
  scoreFailed,
  onRestart,
  restartHref,
  title = "Latihan selesai",
  notice,
  timing,
}: {
  sorted: SafeQuestion[];
  answers: Record<string, LatihanFeedback>;
  timedMode: boolean;
  /** Metode D'AJIKS: timer per kolom bertahap, bukan 60 detik. */
  ajiks?: boolean;
  score: KecermatanScoreResult | null;
  scoreFailed: boolean;
  /** Waktu pengerjaan; null = percobaan lama sebelum waktu dicatat. */
  timing: KecermatanTiming | null;
  /** Layar selesai latihan: ulang di tempat. Halaman pembahasan memakai restartHref. */
  onRestart?: () => void;
  restartHref?: string;
  title?: string;
  /** Baris status di atas tombol, mis. AttemptSaver. */
  notice?: React.ReactNode;
}) {
  const cols = buildColumns(sorted, answers);
  const answered = cols.reduce((s, c) => s + c.total, 0);
  const correct = cols.reduce((s, c) => s + c.correct, 0);
  const accuracy = answered ? correct / answered : 0;
  const touched = cols.filter((c) => c.total > 0);
  const pathname = usePathname();

  const a = useMemo(
    () =>
      analyzeKecermatan(
        // Butir yang belum dijawab ikut supaya posisi butir dihitung dari butir pertama kolom.
        sorted.map((q) => {
          const fb = answers[q.id];
          return {
            id: q.id,
            column: q.column_index ?? 1,
            seq: q.sequence_number,
            correct: Boolean(fb?.is_correct),
            selected: fb?.selected ?? "",
            correctKey: fb?.correct_key ?? "",
            symbols: (q.options_payload as unknown as KecermatanOptionsPayload).symbol_map ?? {},
          };
        }),
        timing
      ),
    [sorted, answers, timing]
  );

  // Nilai 60 detik bayangan (tanpa timer): engine v2 di server, tanpa progressKey = tidak masuk tren Beranda.
  const [bay, setBay] = useState<KecermatanScoreResult | null | false>(null);
  const bayKey = !timedMode && a.valid ? JSON.stringify(a.bayangan) : "";
  useEffect(() => {
    if (!bayKey) return;
    let cancelled = false;
    scoreLatihanKecermatan(JSON.parse(bayKey))
      .then((r) => !cancelled && setBay(r ?? false))
      .catch(() => !cancelled && setBay(false));
    return () => {
      cancelled = true;
    };
  }, [bayKey]);
  const butir60 = a.valid ? Math.round(a.bayangan.reduce((s, c) => s + c.total_klik, 0) / a.kolomDikunjungi) : 0;
  const low = Boolean(bayKey) && butir60 < BUTIR_60_RENDAH;
  const gate = timing ? ["Nilai 60 detik belum bisa dihitung", a.valid ? "" : a.alasan] : LEGACY_GATE;
  const unordered = timing ? Object.keys(timing.cols).filter((c) => !timing.cols[Number(c)].clean).map((c) => ROMAN[Number(c) - 1]) : [];

  // Panel sticky di desktop, dilepas bila lebih tinggi dari layar supaya bagian bawahnya terbaca.
  const panelRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const fit = () => el.classList.toggle("is-tall", el.offsetHeight > window.innerHeight - 48);
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  const tabs = timedMode ? ["Analisis", "Per kolom"] : ["Tanpa batas waktu", "Analisis", "Per kolom"];
  const [tab, setTab] = useState(0);
  const empty = (
    <div className="lr-pane">
      <section className="lr-sec">
        <p className="pg-empty">{!timing ? "Grafik dan analisis muncul untuk percobaan baru." : !a.valid && a.alasan}</p>
      </section>
    </div>
  );

  const panel = (
    <aside ref={panelRef} className="hc-panel lr-panel" aria-label="Hasil latihan" aria-live="polite">
      <div className="hc-panel-top">
        <span className="hc-tag">Sikap Kerja</span>
        <span className="hc-code">{ajiks ? "Metode D'AJIKS" : timedMode ? "60 detik per kolom" : "Tanpa batas waktu"}</span>
      </div>
      <h2 className="hc-panel-title">{title}</h2>
      <p className="hc-panel-desc tnum">
        {answered} dari {sorted.length} butir dicoba · {correct} benar
      </p>

      {timedMode ? (
        score ? (
          <>
            <HexMeter value={score.raw_score / 100} label="Skor murni" note="Dihitung dengan rumus ujian resmi" />
            <Indeks score={score} />
            <dl className="lr-sum">
              <div>
                <dt>Kontribusi ke Nilai Akhir Psikotest</dt>
                <dd className="tnum">
                  {r1(score.nap_contribution)} <small>/ 20</small>
                </dd>
              </div>
            </dl>
            {score.is_disqualifying && (
              <p className="lr-warn">Skor murni 40 ke bawah. Di ujian, nilai ini menggugurkan.</p>
            )}
          </>
        ) : (
          <p className="lr-wait">{scoreFailed ? "Skor belum bisa dihitung. Coba ulangi latihan." : "Menghitung skor…"}</p>
        )
      ) : a.valid ? (
        bay ? (
          <>
            <HexMeter value={bay.raw_score / 100} label="Nilai 60 detik" note="Perkiraan latihan, bukan nilai ujian" />
            <p className="lr-say">
              {low ? (
                <>
                  <b>{a.penuh.akurasi >= 95 ? "Hampir semua jawabanmu benar, keren." : "Jawabanmu sudah lumayan tepat."}</b> Tapi dalam 60 detik
                  kamu baru sampai butir ke-{butir60} dari 50, jadi latihan tanpa waktu jangan dianggap remeh, ya.
                </>
              ) : (
                `${a.penuh.akurasi >= 95 ? "Kamu teliti" : "Ketelitianmu masih bisa naik"}, dan kecepatanmu ${
                  { naik: "makin lancar", stabil: "ajeg", turun: "menurun di kolom akhir" }[a.penuh.tren]
                }. Dalam 60 detik rata-rata kamu sampai butir ke-${butir60} dari 50.`
              )}
            </p>
            <Indeks score={bay} />
            <details className="lr-why">
              <summary>
                Apa arti angka-angka ini? <ChevronDown />
              </summary>
              <p>
                Nilai 60 detik dihitung dari butir yang kamu jawab di 60 detik pertama tiap kolom, dengan rumus yang sama seperti latihan
                bertimer. Anggap saja intipan: kalau waktunya dibatasi, segini kira-kira hasilmu.
              </p>
              <dl>
                <div>
                  <dt>Kecepatan</dt>
                  <dd>Seperti lomba makan kerupuk: yang dihitung kerupuk yang habis, bukan yang cuma digigit.</dd>
                </div>
                <div>
                  <dt>Ketelitian</dt>
                  <dd>Seperti mencari rumah teman: jalan cepat boleh, asal tidak salah ketuk pintu. Nilainya baru penuh kalau jumlah butirmu juga cukup.</dd>
                </div>
                <div>
                  <dt>Ketahanan</dt>
                  <dd>Seperti lari jauh: yang penting larinya ajeg sampai garis akhir.</dd>
                </div>
              </dl>
            </details>
          </>
        ) : (
          <p className="lr-wait">{bay === false ? "Nilai 60 detik belum bisa dihitung. Coba ulangi latihan." : "Menghitung Nilai 60 detik…"}</p>
        )
      ) : (
        <>
          <HexMeter value={accuracy} label="Ketepatan" note="Dari butir yang sudah kamu jawab" />
          <div className="lr-gate" role="status">
            <b>{gate[0]}</b>
            <p>{gate[1]}</p>
          </div>
        </>
      )}

      {!timedMode && a.valid ? (
        <BarChart
          title="Dalam 60 detik pertama"
          bars={a.bayangan.map((c) => ({ n: c.total_klik, ok: c.total_benar, skip: !timing?.cols[c.column_index] }))}
          notes={[
            unordered.length > 0 && `Kolom ${unordered.join(", ")} dikerjakan tidak urut dari butir 1, tetap dihitung.`,
            a.kolomDikunjungi < 10 && "Kolom berarsir belum dikerjakan, dihitung 0 seperti di ujian.",
            "Tinggi penuh = 50 butir. Batang yang sama tinggi berarti kamu ajeg.",
          ]}
        />
      ) : (
        <BarChart
          title="Jawaban per kolom"
          bars={cols.map((c) => ({ n: c.total, ok: c.correct }))}
          notes={[
            ajiks
              ? "Di mode ini kolom awal memang lebih pendek, jadi grafik naik itu wajar dan nilainya lebih rendah daripada mode 60 detik. Bandingkan dengan latihan D'AJIKS-mu sebelumnya, bukan dengan mode 60 detik."
              : timedMode && "Bagian emas yang sama tinggi di tiap kolom berarti Ketahanan tinggi.",
          ]}
        />
      )}

      {notice}

      <div className="hc-actions">
        {low && (
          <a href={`${restartHref ?? pathname}?timed=1&autostart=1`} className={buttonStyles({ variant: "primary", size: "lg", block: true })}>
            <Repeat className="size-4" />
            Ulangi pakai timer
          </a>
        )}
        {restartHref ? (
          <Link href={restartHref} className={buttonStyles({ variant: low ? "secondary" : "primary", size: "lg", block: true })}>
            <Repeat className="size-4" />
            Ulangi latihan
          </Link>
        ) : (
          <button type="button" onClick={onRestart} className={buttonStyles({ variant: low ? "secondary" : "primary", size: "lg", block: true })}>
            <Repeat className="size-4" />
            Ulangi latihan
          </button>
        )}
        <Link href="/dashboard/latihan/kecermatan" className={buttonStyles({ variant: "ghost", block: true })}>
          Pilih paket lain
        </Link>
      </div>
    </aside>
  );

  return (
    <div className="lr-stage">
      {panel}
      <section className="lr-main" aria-label="Rincian hasil">
        <Tabs tabs={tabs} tab={tab} setTab={setTab} />
        <div role="tabpanel" id="lr-p" aria-labelledby={`lr-t${tab}`}>
          {tabs[tab] === "Tanpa batas waktu" ? (
            a.valid ? <ProfilPane a={a} /> : empty
          ) : tabs[tab] === "Analisis" ? (
            a.valid ? <AnalisisPane a={a} timedMode={timedMode} /> : empty
          ) : touched.length === 0 ? (
            <p className="lr-empty">Belum ada butir yang dijawab.</p>
          ) : (
            <div className="lr-pane is-bare">
              <ul className="lr-cols">
                {touched.map((c) => {
                  const i = c.index - 1;
                  const clean = c.wrong.length === 0;
                  return (
                    <li key={c.index}>
                      <details className="lr-col">
                        <summary>
                          <span className={`pk-hex${clean ? " is-full" : " is-part"}`} aria-hidden="true">
                            <svg viewBox="0 0 100 115.47">
                              <polygon points="50,2 98,29.9 98,85.6 50,113.5 2,85.6 2,29.9" />
                            </svg>
                            <b>{ROMAN[i]}</b>
                          </span>
                          <span className="lr-col-main">
                            <span className="lr-col-top">
                              <b>Kolom {ROMAN[i]}</b>
                              <span className="tnum">
                                {c.correct}/{c.total} benar
                              </span>
                            </span>
                            <span className="lr-col-bar" aria-hidden="true">
                              <span style={{ width: `${(c.correct / PER_COLUMN) * 100}%` }} className="is-ok" />
                              <span style={{ width: `${(c.wrong.length / PER_COLUMN) * 100}%` }} className="is-bad" />
                            </span>
                          </span>
                          <span className={`lr-pill${clean ? " is-clean" : ""}`}>{clean ? "Bersih" : `${c.wrong.length} salah`}</span>
                          <ChevronRight className="lr-chev size-4" />
                        </summary>
                        {clean ? (
                          <p className="lr-clean">Semua jawaban di kolom ini benar.</p>
                        ) : (
                          <ul className="lr-wrong">
                            {c.wrong.map((w) => (
                              <li key={w.id}>
                                <span className="lr-no tnum">Butir {w.no}</span>
                                <span className="lr-sym" aria-label="Simbol yang tampil">
                                  {w.shown.map((s, k) => (
                                    <span key={k}>
                                      <KecermatanSymbol symbol={s} />
                                    </span>
                                  ))}
                                </span>
                                <span className="lr-ans">
                                  <span className="is-bad">
                                    Pilih {w.selected} <KecermatanSymbol symbol={w.selectedSym} />
                                  </span>
                                  <span className="is-ok">
                                    Kunci {w.key} <KecermatanSymbol symbol={w.keySym} />
                                  </span>
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </details>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
