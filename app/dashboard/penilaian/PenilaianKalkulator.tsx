"use client";

import { Fragment, useState, type CSSProperties } from "react";
import {
  ASPEK_LABEL, BOBOT, JALUR, JALUR_LABEL, JALUR_SETARA, NILAI_KATEGORI, kategoriPosisi, posisiDariTotal,
  type Aspek, type Jalur, type Kategori,
} from "@/lib/scoring/psikogram";
import { GRUP_ASPEK } from "./grup";

const KATEGORI = Object.keys(NILAI_KATEGORI) as Kategori[];
const WARNA: Record<Kategori, string> = { B: "var(--pnl-b)", CB: "var(--pnl-cb)", C: "var(--pnl-c)", K: "var(--pnl-k)", KS: "var(--pnl-ks)" };
const KATEGORI_POSISI = { B: "Baik", C: "Cukup", K: "Kurang" } as const;
const PRESET = [
  { key: "C", label: "Semua Cukup" },
  { key: "CB", label: "Semua Cukup Baik" },
  { key: "B", label: "Semua Baik" },
  { key: "BKS", label: "Semua Baik, satu KS" },
] as const;
type Preset = (typeof PRESET)[number]["key"];

const aspekOf = (j: Jalur) => Object.keys(BOBOT[j]) as Aspek[];
const isi = (j: Jalur, k: Kategori) => Object.fromEntries(aspekOf(j).map((a) => [a, k])) as Partial<Record<Aspek, Kategori>>;

/*
  Kalkulator psikogram untuk belajar. Profil awal = profil tujuan di akun (tanpa default kalau belum memilih);
  memilih profil di sini tidak mengubah profil akun. Bobot & tabel posisi dari lib/scoring/psikogram.ts.
*/
export default function PenilaianKalkulator({ awal }: { awal: Jalur | null }) {
  const [jalur, setJalur] = useState<Jalur | null>(awal);
  const [kat, setKat] = useState<Partial<Record<Aspek, Kategori>>>(() => (awal ? isi(awal, "C") : {}));
  const [preset, setPreset] = useState<Preset | null>(null);
  const [nudge, setNudge] = useState(0);
  const [minta, setMinta] = useState(false);

  function pilihJalur(j: Jalur) {
    setJalur(j);
    // Aspek yang belum pernah diatur (beda profil, beda aspek) mulai dari Cukup.
    setKat((k) => ({ ...isi(j, "C"), ...k }));
    setPreset(null);
  }

  function pakaiPreset(p: Preset) {
    if (!jalur) { setMinta(true); setNudge((n) => n + 1); return; }
    const k = isi(jalur, p === "BKS" ? "B" : p);
    if (p === "BKS") k[aspekOf(jalur).find((a) => BOBOT[jalur][a] === 1)!] = "KS";
    setKat((lama) => ({ ...lama, ...k }));
    setPreset(p);
  }

  const aspek = jalur ? aspekOf(jalur) : [];
  const total = jalur ? aspek.reduce((s, a) => s + BOBOT[jalur][a]! * NILAI_KATEGORI[kat[a] ?? "C"], 0) : 0;
  const posisi = posisiDariTotal(total);
  const ks = aspek.filter((a) => kat[a] === "KS");
  const ms = !ks.length && posisi >= 61;
  const why = ks.length
    ? `Kurang Sekali di ${ks.map((a) => ASPEK_LABEL[a]).join(", ")}. Satu KS sudah cukup untuk TMS, setinggi apa pun aspek lain.`
    : posisi < 61 ? `Kurang ${61 - posisi} posisi lagi. Naikkan aspek berbobot besar lebih dulu, karena dampaknya paling terasa.`
    : posisi === 61 ? "Tepat di batas. Satu aspek turun sedikit saja bisa membuatmu jatuh di bawah 61."
    : "Aman dari batas 61. Jaga supaya tidak ada aspek yang turun ke KS.";

  return (
    <div className="pnl-calc">
      <div className="pnl-calc-head">
        <p className="pnl-step"><i>1</i>Ketuk profil tujuanmu</p>
        <div key={nudge} className={`pnl-chips${jalur ? "" : " is-nudge"}`} role="radiogroup" aria-label="Profil tujuan">
          {JALUR.map((j) => (
            <Fragment key={j}>
              <input type="radio" name="pnl-profil" id={`pnl-pf-${j}`} checked={jalur === j} onChange={() => pilihJalur(j)} />
              <label className="pnl-press" htmlFor={`pnl-pf-${j}`}>{JALUR_LABEL[j]}<small>{JALUR_SETARA[j]}</small></label>
            </Fragment>
          ))}
        </div>
        <p className="pnl-step"><i>2</i>Ketuk contoh cepat, atau ubah kategori tiap aspek di bawah</p>
        <div className="pnl-presets">
          {PRESET.map((p) => (
            <button key={p.key} type="button" className="pnl-press" aria-pressed={preset === p.key} onClick={() => pakaiPreset(p.key)}>{p.label}</button>
          ))}
        </div>
      </div>

      {!jalur ? (
        <div className="pnl-empty">
          <b>{minta ? "Ketuk profil di langkah 1 dulu, baru contoh cepat bisa dipakai" : "Pilih profil tujuanmu dulu"}</b>
          <span>Ketuk salah satu tombol profil di langkah 1. Bobot tiap aspek berbeda per profil, jadi hitungan baru bisa dimulai setelah profil dipilih.</span>
        </div>
      ) : (
        <div className="pnl-calc-body">
          <div className="pnl-rows">
            {GRUP_ASPEK.map(([grup, daftar]) => {
              const ada = daftar.filter((a) => BOBOT[jalur][a]);
              return (
                <div key={grup}>
                  <p className="pnl-grp-h">{grup}</p>
                  {ada.map((a) => (
                    <div key={a} className="pnl-row">
                      <span>{ASPEK_LABEL[a]}<small>bobot {BOBOT[jalur][a]}</small></span>
                      <span className="pnl-seg" role="radiogroup" aria-label={`Kategori ${ASPEK_LABEL[a]}`}>
                        {KATEGORI.map((k) => (
                          <Fragment key={k}>
                            <input type="radio" name={`pnl-k-${a}`} id={`pnl-k-${a}-${k}`} checked={(kat[a] ?? "C") === k}
                              onChange={() => { setKat((lama) => ({ ...lama, [a]: k })); setPreset(null); }} />
                            <label className="pnl-press" htmlFor={`pnl-k-${a}-${k}`} style={{ "--c": WARNA[k] } as CSSProperties}>{k}</label>
                          </Fragment>
                        ))}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
          <div className="pnl-out" aria-live="polite">
            <p className="pnl-kicker">Nilai akhir · {JALUR_LABEL[jalur]}</p>
            <div className="pnl-big pnl-tnum">{posisi}<small>/ 85</small></div>
            <div className="pnl-rail" aria-hidden="true"><i style={{ width: `${((posisi - 1) / 84) * 100}%` }} /><b /></div>
            <div className={`pnl-verdict ${ms ? "is-ok" : "is-bad"}`}>{ms ? "Memenuhi Syarat" : "Tidak Memenuhi Syarat"}</div>
            <dl>
              <dt>Total psikogram</dt><dd className="pnl-tnum">{total}</dd>
              <dt>Kategori posisi</dt><dd>{KATEGORI_POSISI[kategoriPosisi(posisi)]}</dd>
              <dt>Aspek KS</dt><dd className="pnl-tnum">{ks.length}</dd>
            </dl>
            <p className="pnl-why">{why}</p>
          </div>
        </div>
      )}
    </div>
  );
}
