"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KORAN, deretAnswer, kraepelinStats, type FundamentalMeta } from "@/lib/fundamental";
import { ExamBar, ExamTimer } from "@/app/components/ExamChrome";
import { Button } from "@/app/components/ui-client";
import Numpad from "./Numpad";

/*
  Rekening Koran gaya Kraepelin: grid KORAN.kolom × KORAN.baris, dikerjakan per kolom dari atas ke bawah,
  jawaban ditulis di celah antara dua angka. Mode Tes = batas waktu per kolom, pindah otomatis saat habis,
  tanpa umpan balik benar/salah. Mode Latihan = tanpa batas, warna benar/salah langsung tampil.
*/

type Phase = "intro" | "run" | "done";
type Mode = "tes" | "latihan";
type State = { phase: Phase; mode: Mode; col: number; ans: number[][]; left: number; elapsed: number; colSec: number[]; shake: number };
type Action = { t: "start"; mode: Mode } | { t: "tick" } | { t: "digit"; n: number; benar: boolean };

const PER = KORAN.baris - 1;
const fresh = (): State => ({
  phase: "intro",
  mode: "tes",
  col: 0,
  ans: Array.from({ length: KORAN.kolom }, () => []),
  left: KORAN.detik,
  elapsed: 0,
  colSec: Array(KORAN.kolom).fill(0),
  shake: 0,
});

const advance = (s: State): State => (s.col + 1 >= KORAN.kolom ? { ...s, phase: "done" } : { ...s, col: s.col + 1, left: KORAN.detik });

function reducer(s: State, a: Action): State {
  if (a.t === "start") return { ...fresh(), phase: "run", mode: a.mode };
  if (s.phase !== "run") return s;
  if (a.t === "tick") {
    const colSec = s.colSec.map((v, i) => (i === s.col ? v + 1 : v));
    const next = { ...s, elapsed: s.elapsed + 1, colSec };
    if (s.mode === "latihan") return next;
    return s.left <= 1 ? advance({ ...next, left: 0 }) : { ...next, left: s.left - 1 };
  }
  const ans = s.ans.map((col, i) => (i === s.col ? [...col, a.n] : col));
  const next = { ...s, ans, shake: !a.benar && s.mode === "latihan" ? s.shake + 1 : s.shake };
  return ans[s.col].length >= PER ? advance(next) : next;
}

const fmt = (x: number) => (Math.round(x * 10) / 10).toLocaleString("id-ID");

export default function DeretSession({ meta, grid }: { meta: FundamentalMeta; grid: number[][] }) {
  const router = useRouter();
  // Operasi dipilih di layar awal (switch Tambah/Kali), terkunci begitu sesi dimulai.
  const [op, setOp] = useState<"tambah" | "kali">("tambah");
  const sym = op === "kali" ? "×" : "+";
  const title = `${meta.label} · ${op === "kali" ? "Kali" : "Tambah"}`;
  const [s, dispatch] = useReducer(reducer, undefined, fresh);
  const activeRef = useRef<HTMLSpanElement>(null);
  const pos = s.ans[s.col].length;
  const key = (c: number, r: number) => deretAnswer(op, grid[c][r], grid[c][r + 1]);

  useEffect(() => {
    if (s.phase !== "run") return;
    const t = setInterval(() => dispatch({ t: "tick" }), 1000);
    return () => clearInterval(t);
  }, [s.phase]);

  // Grid mengikuti celah aktif (geser vertikal dan horizontal).
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    activeRef.current?.scrollIntoView({ block: "center", inline: "center", behavior: reduce ? "auto" : "smooth" });
  }, [s.col, pos, s.phase]);

  const onDigit = useCallback(
    (d: string) => {
      if (s.phase !== "run") return;
      const n = Number(d);
      const benar = n === deretAnswer(op, grid[s.col][pos], grid[s.col][pos + 1]);
      if (!benar && s.mode === "latihan") navigator.vibrate?.(60);
      dispatch({ t: "digit", n, benar });
    },
    [grid, op, pos, s.col, s.mode, s.phase]
  );

  const exit = (
    <Link href="/dashboard/fundamental" className="mbtn">
      <span aria-hidden="true">←</span>
      Keluar
    </Link>
  );

  if (s.phase === "intro") {
    return (
      <div className="min-h-[100dvh] bg-background">
        <ExamBar title={title} count={`${KORAN.kolom} kolom × ${KORAN.baris} angka`} actions={exit} />
        <div className="app-page">
          <section className="fd-result enter-rise">
            <p className="section-kicker">Rekening Koran · Kraepelin</p>
            <h1 className="fd-result-title">{title}</h1>
            <div className="kp-op" role="group" aria-label="Pilih operasi">
              {(["tambah", "kali"] as const).map((o) => (
                <button key={o} type="button" aria-pressed={op === o} onClick={() => setOp(o)}>
                  <b aria-hidden="true">{o === "kali" ? "×" : "+"}</b>
                  {o === "kali" ? "Perkalian" : "Penjumlahan"}
                </button>
              ))}
            </div>
            <p className="text-foreground">
              Grid berisi {KORAN.kolom} kolom angka. Kerjakan satu kolom dari atas ke bawah: {op === "kali" ? "kalikan" : "jumlahkan"} dua angka
              yang berdekatan, lalu ketik <b>angka satuannya saja</b>. Jawaban muncul di celah antara kedua angka dan tidak bisa diubah. Kolom
              penuh = pindah otomatis ke kolom berikutnya.
            </p>
            <div className="fd-example tnum" aria-label="Contoh">
              <span>7</span>
              <i>{deretAnswer(op, 7, 8)}</i>
              <span>8</span>
              <small>
                7 {sym} 8 = {op === "kali" ? 56 : 15} → tulis {deretAnswer(op, 7, 8)}
              </small>
            </div>
            <div className="kp-modes">
              <button type="button" className="kp-mode is-tes" onClick={() => dispatch({ t: "start", mode: "tes" })}>
                <b>Mode Tes</b>
                <span>
                  {KORAN.detik} detik per kolom. Waktu habis = pindah kolom walau belum selesai. Benar/salah baru terlihat di hasil, seperti tes
                  aslinya.
                </span>
              </button>
              <button type="button" className="kp-mode" onClick={() => dispatch({ t: "start", mode: "latihan" })}>
                <b>Mode Latihan</b>
                <span>Tanpa batas waktu per kolom. Jawaban langsung berwarna hijau/merah supaya kamu tahu letak kesalahan.</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (s.phase === "done") {
    const tes = s.mode === "tes";
    // Mode Tes: jawaban BENAR per kolom (Panker Kraepelin), bukan semua ketikan —
    // angka asal tidak boleh menaikkan Kecepatan (arah yang sama dengan Kecermatan v2).
    const per = tes ? s.ans.map((a, c) => a.filter((n, r) => n === key(c, r)).length) : s.colSec;
    const st = kraepelinStats(per);
    const wrong = s.ans.flatMap((a, c) => a.map((n, r) => ({ c, r, n })).filter(({ c, r, n }) => n !== key(c, r)));
    const dijawab = s.ans.reduce((t, a) => t + a.length, 0);
    const acc = dijawab ? Math.round(((dijawab - wrong.length) / dijawab) * 1000) / 10 : 0;
    const max = Math.max(1, ...per);
    const unit = tes ? "benar" : "dtk";
    const naik = st.ketahanan > 0;
    return (
      <div className="min-h-[100dvh] bg-background">
        <ExamBar title={title} count="Hasil sesi" timer={<ExamTimer seconds={s.elapsed} label="Total waktu" muted />} actions={exit} />
        <div className="app-page">
          <section className="fd-result kp-result enter-rise">
            <p className="section-kicker">Hasil sesi · {tes ? "Mode Tes" : "Mode Latihan"}</p>
            <h1 className="fd-result-title">{title}</h1>
            <dl className="fd-stats is-4">
              <div><dt>Kecepatan</dt><dd className="tnum">{fmt(st.rata)}<span> {unit}/kolom</span></dd></div>
              <div><dt>Ketelitian</dt><dd className="tnum">{wrong.length}<span> salah · {fmt(acc)}%</span></dd></div>
              <div><dt>Keajegan</dt><dd className="tnum">{fmt(st.keajegan)}<span> {unit} selisih</span></dd></div>
              <div><dt>Ketahanan</dt><dd className="tnum">{naik ? "+" : ""}{fmt(st.ketahanan)}<span> {unit}</span></dd></div>
            </dl>
            <p className="muted">
              {dijawab} dari {KORAN.kolom * PER} soal dijawab dalam {s.elapsed} detik. Keajegan = selisih kolom {tes ? "terbanyak dan tersedikit" : "terlama dan tercepat"}
              , makin kecil makin stabil. Ketahanan = rata-rata paruh akhir dikurangi paruh awal
              {tes ? " (positif berarti makin cepat)" : " (positif berarti makin lambat)"}.
            </p>

            <figure className="kp-chart-wrap">
              <figcaption className="dnav-title !mt-0">{tes ? "Jawaban per kolom" : "Detik per kolom"}</figcaption>
              <div className="kp-chart" role="list">
                {per.map((v, i) => (
                  <div key={i} role="listitem" className="kp-bar" title={`Kolom ${i + 1}: ${v} ${unit}`} aria-label={`Kolom ${i + 1}: ${v} ${unit}`}>
                    <i style={{ height: `${(v / max) * 100}%` }} />
                  </div>
                ))}
              </div>
              <div className="kp-axis tnum" aria-hidden="true">
                <span>Kolom 1</span>
                <span>{KORAN.kolom}</span>
              </div>
            </figure>

            {wrong.length > 0 && (
              <div>
                <h2 className="dnav-title !mt-0">Jawaban salah</h2>
                <ul className="fd-wrong tnum">
                  {wrong.slice(0, 60).map(({ c, r, n }) => (
                    <li key={`${c}-${r}`}>
                      <span>K{c + 1}·{r + 1}</span> {grid[c][r]} {sym} {grid[c][r + 1]} → <s>{n}</s> <b>{key(c, r)}</b>
                    </li>
                  ))}
                  {wrong.length > 60 && <li>+{wrong.length - 60} lainnya</li>}
                </ul>
              </div>
            )}
            <p className="muted">Nilai mentah tanpa norma. Hasil belum disimpan ke akun (prototipe).</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="accent" size="lg" onClick={() => router.refresh()}>
                Ulangi dengan grid baru
              </Button>
              <Link href="/dashboard/fundamental" className="mbtn fd-ghost">
                Kembali ke katalog
              </Link>
            </div>
          </section>
        </div>
      </div>
    );
  }

  const tes = s.mode === "tes";
  const done = s.col * PER + pos;
  return (
    <div className="min-h-[100dvh] bg-background">
      <ExamBar
        title={title}
        count={`Kolom ${s.col + 1} dari ${KORAN.kolom} · ${tes ? "Mode Tes" : "Mode Latihan"}`}
        timer={
          tes ? (
            <ExamTimer seconds={s.left} unit="dtk" label="Sisa waktu kolom" muted={s.left > 10} />
          ) : (
            <ExamTimer seconds={s.elapsed} label="Waktu berjalan" muted />
          )
        }
        actions={exit}
      >
        <div className="fd-progress" style={{ ["--p" as string]: `${(done / (KORAN.kolom * PER)) * 100}%` }} aria-hidden="true" />
      </ExamBar>
      <div className="kp-run">
        <div className="kp-board">
          {/* key = jumlah salah (Mode Latihan): kolom aktif dipasang ulang supaya animasi getar diputar lagi. */}
          <div className="kp-grid tnum" role="group" aria-label="Grid angka">
            {grid.map((digits, c) => (
              <ol
                key={c === s.col ? `a${s.shake}` : c}
                className={`kp-col ${c === s.col ? `is-active ${s.shake ? "is-shake" : ""}` : c < s.col ? "is-past" : ""}`}
                aria-label={`Kolom ${c + 1}`}
              >
                <li className="kp-head">{c + 1}</li>
                {digits.map((d, r) => {
                  const a = s.ans[c][r];
                  const active = c === s.col && r === pos;
                  const state =
                    a !== undefined ? (tes ? "is-done" : a === key(c, r) ? "is-ok" : "is-bad") : active ? "is-active" : c < s.col ? "is-skip" : "";
                  return (
                    <li key={r}>
                      <span className={`kp-d ${c === s.col && (r === pos || r === pos + 1) ? "is-pair" : ""}`}>{d}</span>
                      {r < PER && (
                        <span ref={active ? activeRef : undefined} className={`kp-s ${state}`}>
                          {a ?? ""}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            ))}
          </div>
        </div>
        <div className="kp-side">
          <p className="fd-hint">
            {op === "kali" ? "Kalikan" : "Jumlahkan"} dua angka bertanda, ketik angka satuannya. {tes ? "Kolom pindah otomatis saat waktu habis." : ""}
          </p>
          <Numpad onDigit={onDigit} />
        </div>
      </div>
    </div>
  );
}
