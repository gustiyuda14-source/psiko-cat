"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PAULI, PAULI_LATIHAN, deretAnswer, pauliStats, type FundamentalMeta } from "@/lib/fundamental";
import { ExamBar, ExamTimer } from "@/app/components/ExamChrome";
import { Button } from "@/app/components/ui-client";
import Numpad from "./Numpad";

/*
  Tes Pauli (Arnold 1975): jumlahkan dua angka berdekatan dari atas ke bawah tanpa henti, PAULI.periode × PAULI.detik.
  Tiap periode habis = tanda garis di posisi terakhir. Aturan instansi berbeda, jadi peserta memilih di awal:
  "pindah" = garis lalu pindah ke kolom baru (1 kolom = 1 periode); "lanjut" = garis lalu lanjut di kolom sama (teks Arnold).
  Kolom penuh = pindah kolom di kedua mode. Tes = 20 × 3 menit tanpa umpan balik benar/salah sampai hasil;
  Latihan = PAULI_LATIHAN (pendek) dengan warna hijau/merah langsung.
*/

type Mode = "pindah" | "lanjut";
type Jenis = "tes" | "latihan";
type Mark = { c: number; r: number };
type State = {
  phase: "intro" | "run" | "done";
  mode: Mode;
  jenis: Jenis;
  col: number;
  ans: number[][];
  startAt: number;
  elapsed: number;
  periode: number;
  marks: Mark[];
  benar: number[];
  dijawab: number[];
  /** Diakhiri peserta sebelum waktu habis: periode berjalan belum penuh. */
  stopped: boolean;
};
type Action = { t: "start"; mode: Mode; jenis: Jenis; now: number } | { t: "tick"; now: number } | { t: "digit"; n: number; benar: boolean } | { t: "stop" };

const PER = PAULI.baris - 1;
const CFG = { tes: { periode: PAULI.periode, detik: PAULI.detik }, latihan: PAULI_LATIHAN };
const durasi = (j: Jenis) => CFG[j].periode * CFG[j].detik;
const fresh = (): State => ({
  phase: "intro",
  mode: "lanjut",
  jenis: "tes",
  col: 0,
  ans: Array.from({ length: PAULI.kolom }, () => []),
  startAt: 0,
  elapsed: 0,
  periode: 0,
  marks: [],
  benar: Array(PAULI.periode).fill(0),
  dijawab: Array(PAULI.periode).fill(0),
  stopped: false,
});

const nextCol = (s: State): State => (s.col + 1 >= PAULI.kolom ? { ...s, phase: "done" } : { ...s, col: s.col + 1 });

function reducer(s: State, a: Action): State {
  if (a.t === "start") return { ...fresh(), phase: "run", mode: a.mode, jenis: a.jenis, startAt: a.now };
  if (s.phase !== "run") return s;
  if (a.t === "stop") return { ...s, phase: "done", stopped: true };
  if (a.t === "tick") {
    // Waktu dari selisih jam, bukan hitungan tick: setInterval melambat di tab latar selama 60 menit.
    const cfg = CFG[s.jenis];
    const elapsed = Math.min(durasi(s.jenis), Math.floor((a.now - s.startAt) / 1000));
    let next: State = { ...s, elapsed };
    while (next.phase === "run" && next.periode < Math.floor(elapsed / cfg.detik)) {
      next = { ...next, periode: next.periode + 1, marks: [...next.marks, { c: next.col, r: next.ans[next.col].length }] };
      if (next.periode >= cfg.periode) next = { ...next, phase: "done" };
      else if (next.mode === "pindah") next = nextCol(next);
    }
    return next;
  }
  const p = s.periode;
  const next = {
    ...s,
    ans: s.ans.map((col, i) => (i === s.col ? [...col, a.n] : col)),
    dijawab: s.dijawab.map((v, i) => (i === p ? v + 1 : v)),
    benar: s.benar.map((v, i) => (i === p && a.benar ? v + 1 : v)),
  };
  return next.ans[s.col].length >= PER ? nextCol(next) : next;
}

const fmt = (x: number) => (Math.round(x * 10) / 10).toLocaleString("id-ID");

export default function PauliSession({ meta, grid }: { meta: FundamentalMeta; grid: number[][] }) {
  const router = useRouter();
  const [s, dispatch] = useReducer(reducer, undefined, fresh);
  // Tes/Latihan dipilih di layar awal, terkunci begitu sesi dimulai.
  const [pilih, setPilih] = useState<Jenis>("tes");
  const jenis = s.phase === "intro" ? pilih : s.jenis;
  const latihan = jenis === "latihan";
  const cfg = CFG[jenis];
  const activeRef = useRef<HTMLSpanElement>(null);
  const pos = s.ans[s.col].length;
  const key = (c: number, r: number) => deretAnswer("tambah", grid[c][r], grid[c][r + 1]);

  useEffect(() => {
    if (s.phase !== "run") return;
    const t = setInterval(() => dispatch({ t: "tick", now: Date.now() }), 500);
    return () => clearInterval(t);
  }, [s.phase]);

  // Tanda garis: getar singkat di perangkat yang mendukung.
  useEffect(() => {
    if (s.periode > 0 && s.phase === "run") navigator.vibrate?.(80);
  }, [s.periode, s.phase]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    activeRef.current?.scrollIntoView({ block: "center", inline: "center", behavior: reduce ? "auto" : "smooth" });
  }, [s.col, pos, s.phase]);

  const onDigit = useCallback(
    (d: string) => {
      if (s.phase !== "run") return;
      const n = Number(d);
      const benar = n === deretAnswer("tambah", grid[s.col][pos], grid[s.col][pos + 1]);
      if (!benar && s.jenis === "latihan") navigator.vibrate?.(60);
      dispatch({ t: "digit", n, benar });
    },
    [grid, pos, s.col, s.jenis, s.phase]
  );

  const exit = (
    <Link href="/dashboard/kraepelin" className="mbtn">
      <span aria-hidden="true">←</span>
      Keluar
    </Link>
  );
  const DURASI = durasi(jenis);
  const menit = DURASI / 60;
  const tiap = cfg.detik / 60;

  if (s.phase === "intro") {
    return (
      <div className="min-h-[100dvh] bg-background">
        <ExamBar title={meta.label} count={`${cfg.periode} periode × ${tiap} menit`} actions={exit} />
        <div className="app-page">
          <section className="fd-result enter-rise">
            <p className="section-kicker">Tes Koran · Pauli</p>
            <h1 className="fd-result-title">{meta.label}</h1>
            <div className="kp-op pl-jenis" role="group" aria-label="Pilih jenis sesi">
              {(["tes", "latihan"] as const).map((j) => (
                <button key={j} type="button" aria-pressed={pilih === j} onClick={() => setPilih(j)}>
                  <b>{durasi(j) / 60}</b>
                  menit · {j === "tes" ? "Tes" : "Latihan"}
                </button>
              ))}
            </div>
            <p className="text-foreground">
              Jumlahkan dua angka yang berdekatan dari atas ke bawah, lalu ketik <b>angka satuannya saja</b>. Kerjakan tanpa henti selama {menit} menit.
              Tiap {tiap} menit muncul tanda <b>garis</b> di posisi terakhirmu. Jawaban tidak bisa diubah, jangan memeriksa ulang.
              {latihan ? " Mode Latihan: durasi pendek dan jawaban langsung berwarna hijau/merah." : " Benar/salah baru terlihat di hasil, seperti tes aslinya."}
            </p>
            <div className="fd-example tnum" aria-label="Contoh">
              <span>7</span>
              <i>5</i>
              <span>8</span>
              <small>7 + 8 = 15 → tulis 5</small>
            </div>
            <p className="fd-source">
              <b>Sumber</b> Mengacu pedoman Arnold, <i>Der Pauli-Test</i> (Springer, 1975): prosedur pelaksanaan dan rumus Schwankung.
            </p>
            <p className="muted">Aturan saat tanda garis berbeda antarinstansi. Pilih yang sesuai tes kamu:</p>
            <div className="kp-modes">
              <button type="button" className="kp-mode" onClick={() => dispatch({ t: "start", mode: "pindah", jenis: pilih, now: Date.now() })}>
                <b>Pindah kolom</b>
                <span>
                  Satu kolom = satu periode {tiap} menit. Saat tanda garis, langsung pindah ke kolom berikutnya. {cfg.periode} kolom = {menit} menit.
                </span>
              </button>
              <button type="button" className="kp-mode" onClick={() => dispatch({ t: "start", mode: "lanjut", jenis: pilih, now: Date.now() })}>
                <b>Lanjut di kolom sama</b>
                <span>Sesuai pedoman Arnold: saat tanda garis, lanjut tanpa jeda di kolom yang sama. Pindah kolom hanya saat kolom penuh.</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  const modeLabel = `${latihan ? "Latihan" : "Tes"} · ${s.mode === "pindah" ? "Pindah kolom" : "Lanjut kolom"}`;

  if (s.phase === "done") {
    // Kurva dari jawaban BENAR per periode (arah sama dengan Kecepatan Kraepelin): angka asal tidak menaikkan kurva.
    // Diakhiri lebih awal: periode berjalan ikut tampil di kurva (bar pudar), tapi tidak dihitung ke ukuran kurva
    // karena waktunya lebih pendek dan akan terlihat seperti penurunan.
    const penuh = s.benar.slice(0, s.periode);
    const sisa = s.stopped && s.periode < cfg.periode ? 1 : 0;
    const per = s.benar.slice(0, s.periode + sisa);
    const st = pauliStats(penuh.length ? penuh : per);
    const total = per.reduce((a, b) => a + b, 0);
    const dijawab = s.dijawab.reduce((a, b) => a + b, 0);
    const salah = dijawab - total;
    const fehler = dijawab ? (salah / dijawab) * 100 : 0;
    const wrong = s.ans.flatMap((a, c) => a.map((n, r) => ({ c, r, n })).filter(({ c, r, n }) => n !== key(c, r)));
    const max = Math.max(1, ...per);
    return (
      <div className="min-h-[100dvh] bg-background">
        <ExamBar title={meta.label} count="Hasil sesi" timer={<ExamTimer seconds={s.elapsed} label="Total waktu" muted />} actions={exit} />
        <div className="app-page">
          <section className="fd-result kp-result enter-rise">
            <p className="section-kicker">Hasil sesi · {modeLabel}{s.stopped ? " · diakhiri lebih awal" : ""}</p>
            <h1 className="fd-result-title">{meta.label}</h1>
            <dl className="fd-stats is-4">
              <div><dt>Jumlah benar</dt><dd className="tnum">{total}<span> dari {dijawab}</span></dd></div>
              <div><dt>Kesalahan</dt><dd className="tnum">{fmt(fehler)}<span>% · {salah} salah</span></dd></div>
              <div><dt>Schwankung</dt><dd className="tnum">±{fmt(st.schwankung)}<span> ({fmt(st.schwankungPct)}%)</span></dd></div>
              <div><dt>Puncak</dt><dd className="tnum">P{st.gipfel}<span> · naik {fmt(st.steighohe)}%</span></dd></div>
            </dl>
            {s.stopped && (
              <p className="muted">
                Diakhiri pada menit {fmt(s.elapsed / 60)} dari {menit}: {penuh.length} periode penuh
                {sisa ? `, periode ${s.periode + 1} belum penuh (bar pudar, tidak dihitung ke Schwankung dan Puncak)` : ""}.
              </p>
            )}
            <p className="muted">
              Schwankung = rata-rata selisih antarperiode berurutan, makin kecil makin stabil. Puncak = periode dengan jawaban benar terbanyak; naik =
              selisih titik tertinggi dan terendah (negatif bila puncak datang sebelum titik terendah). Hanya jumlah benar yang stabil bila tes
              diulang (studi Polandia di buku Arnold: r = .91); Schwankung dan kenaikan kurva tidak.
            </p>

            <figure className="kp-chart-wrap">
              <figcaption className="dnav-title !mt-0">Jawaban benar per {tiap} menit</figcaption>
              <div className="kp-chart" role="list">
                {per.map((v, i) => (
                  <div
                    key={i}
                    role="listitem"
                    className={`kp-bar ${i >= penuh.length ? "is-partial" : ""}`}
                    title={`Periode ${i + 1}: ${v} benar${i >= penuh.length ? " (belum penuh)" : ""}`}
                    aria-label={`Periode ${i + 1}: ${v} benar${i >= penuh.length ? " (belum penuh)" : ""}`}
                  >
                    <i style={{ height: `${(v / max) * 100}%` }} />
                  </div>
                ))}
              </div>
              <div className="kp-axis tnum" aria-hidden="true">
                <span>Periode 1</span>
                <span>{per.length}</span>
              </div>
            </figure>

            {wrong.length > 0 && (
              <div>
                <h2 className="dnav-title !mt-0">Jawaban salah</h2>
                <ul className="fd-wrong tnum">
                  {wrong.slice(0, 60).map(({ c, r, n }) => (
                    <li key={`${c}-${r}`}>
                      <span>K{c + 1}·{r + 1}</span> {grid[c][r]} + {grid[c][r + 1]} → <s>{n}</s> <b>{key(c, r)}</b>
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
              <Link href="/dashboard/kraepelin" className="mbtn fd-ghost">
                Kembali ke katalog
              </Link>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // Hanya kolom sebelum, aktif, dan sesudah yang dirender: grid penuh 40 × 200 terlalu berat per ketikan.
  const marked = new Set(s.marks.map((m) => `${m.c}-${m.r}`));
  const from = Math.max(0, s.col - 1);
  const cols = grid.slice(from, s.col + 2);
  return (
    <div className="min-h-[100dvh] bg-background">
      <ExamBar
        title={meta.label}
        count={`Periode ${s.periode + 1} dari ${cfg.periode} · ${modeLabel}`}
        timer={<ExamTimer seconds={DURASI - s.elapsed} label="Sisa waktu" muted />}
        actions={exit}
      >
        <div className="fd-progress" style={{ ["--p" as string]: `${(s.elapsed / DURASI) * 100}%` }} aria-hidden="true" />
      </ExamBar>
      {s.periode > 0 && (
        <p key={s.periode} className="pl-flash" role="status">
          Garis! Periode {s.periode + 1}
        </p>
      )}
      <div className="kp-run">
        <div className="kp-board">
          <div className="kp-grid tnum" role="group" aria-label="Grid angka">
            {cols.map((digits, i) => {
              const c = from + i;
              return (
                <ol key={c} className={`kp-col ${c === s.col ? "is-active" : c < s.col ? "is-past" : ""}`} aria-label={`Kolom ${c + 1}`}>
                  <li className="kp-head">{c + 1}</li>
                  {digits.map((d, r) => {
                    const a = s.ans[c][r];
                    const active = c === s.col && r === pos;
                    const state = a !== undefined ? (latihan ? (a === key(c, r) ? "is-ok" : "is-bad") : "is-done") : active ? "is-active" : c < s.col ? "is-skip" : "";
                    return (
                      <li key={r} className={marked.has(`${c}-${r}`) ? "pl-mark" : undefined}>
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
              );
            })}
          </div>
        </div>
        <div className="kp-side">
          <p className="fd-hint">Jumlahkan dua angka bertanda, ketik angka satuannya. Garis muncul otomatis tiap {tiap} menit.</p>
          <Numpad onDigit={onDigit} />
          <button
            type="button"
            className="mbtn fd-ghost pl-stop"
            onClick={() => window.confirm("Akhiri tes sekarang? Hasil dan kurva sampai titik ini akan ditampilkan.") && dispatch({ t: "stop" })}
          >
            Akhiri dan lihat hasil
          </button>
        </div>
      </div>
    </div>
  );
}
