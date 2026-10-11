"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FundamentalMeta, IsianItem } from "@/lib/fundamental";
import { ExamBar, ExamBody, ExamDock, ExamTimer } from "@/app/components/ExamChrome";
import { Badge } from "@/app/components/ui";
import { Button } from "@/app/components/ui-client";
import { ArrowRight } from "@/app/components/icons";
import Numpad from "./Numpad";

type NavState = "ok" | "bad" | "todo";
const NAV_LABEL: Record<NavState, string> = { ok: "Benar", bad: "Salah", todo: "Belum dijawab" };
const MAX_DIGITS = 5;

export default function IsianSession({ meta, items }: { meta: FundamentalMeta; items: IsianItem[] }) {
  const router = useRouter();
  const fields = meta.kind === "pecahan" ? 2 : 1;
  const [idx, setIdx] = useState(0);
  const [field, setField] = useState(0);
  const [vals, setVals] = useState<Record<number, string[]>>({});
  const [benar, setBenar] = useState<Record<number, boolean>>({});
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [done]);

  const q = items[idx];
  const val = vals[idx] ?? Array(fields).fill("");
  const checked = idx in benar;

  const goTo = useCallback((i: number) => {
    setIdx(i);
    setField(0);
  }, []);

  const onDigit = useCallback(
    (d: string) => {
      if (checked) return;
      setVals((cur) => {
        const v = [...(cur[idx] ?? Array(fields).fill(""))];
        if (v[field].length >= MAX_DIGITS) return cur;
        v[field] += d;
        return { ...cur, [idx]: v };
      });
    },
    [checked, field, fields, idx]
  );

  const onDelete = useCallback(() => {
    if (checked) return;
    // Kolom aktif kosong: mundur ke kolom sebelumnya (pecahan).
    if (!val[field] && field > 0) return setField(field - 1);
    setVals((cur) => {
      const v = [...(cur[idx] ?? Array(fields).fill(""))];
      v[field] = v[field].slice(0, -1);
      return { ...cur, [idx]: v };
    });
  }, [checked, field, fields, idx, val]);

  // Enter: isi kolom berikutnya → periksa → soal berikutnya.
  const onEnter = useCallback(() => {
    if (checked) {
      if (idx < items.length - 1) goTo(idx + 1);
      return;
    }
    if (!val[field]) return;
    if (field < fields - 1) {
      setField(field + 1);
      return;
    }
    if (val.some((v) => !v)) return;
    setBenar((cur) => ({ ...cur, [idx]: val.every((v, i) => Number(v) === Number(q.ans[i])) }));
  }, [checked, field, fields, goTo, idx, items.length, q, val]);

  const states: NavState[] = items.map((_, i) => (i in benar ? (benar[i] ? "ok" : "bad") : "todo"));
  const count = { ok: 0, bad: 0, todo: 0 };
  for (const s of states) count[s]++;
  const answered = count.ok + count.bad;

  const exit = (
    <Link href="/dashboard/fundamental" className="mbtn">
      <span aria-hidden="true">←</span>
      Keluar
    </Link>
  );
  const timer = <ExamTimer seconds={elapsed} label="Waktu berjalan" muted />;

  if (done) {
    const acc = answered ? Math.round((count.ok / answered) * 100) : 0;
    return (
      <div className="min-h-[100dvh] bg-background">
        <ExamBar title={meta.label} count="Hasil sesi" timer={timer} actions={exit} />
        <div className="app-page">
          <section className="fd-result enter-rise">
            <p className="section-kicker">Hasil sesi</p>
            <h1 className="fd-result-title">{meta.label}</h1>
            <dl className="fd-stats">
              <div><dt>Benar</dt><dd className="tnum">{count.ok}<span>/{items.length}</span></dd></div>
              <div><dt>Akurasi</dt><dd className="tnum">{acc}%</dd></div>
              <div><dt>Waktu</dt><dd className="tnum">{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}</dd></div>
            </dl>
            <p className="muted">Hasil belum disimpan ke akun (prototipe). Soal sesi berikutnya dibuat ulang.</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="accent" size="lg" onClick={() => router.refresh()}>
                Ulangi dengan soal baru
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

  return (
    <div className="min-h-[100dvh] bg-background">
      <ExamBar
        title={meta.label}
        count={`Soal ${idx + 1} dari ${items.length}`}
        timer={timer}
        actions={exit}
      />
      <ExamBody
        navigator={
          <aside className="order-2 bg-card p-5 lg:sticky lg:top-[58px] lg:h-[calc(100dvh-58px)] lg:w-[300px] lg:shrink-0 lg:overflow-auto lg:border-l lg:border-border" aria-label="Navigasi soal">
            <div className="dnav-head">
              <div>
                <p className="dnav-kicker">Fundamental · {meta.grup}</p>
                <p className="dnav-count">
                  <b>{answered}</b>/{items.length} <span>soal dijawab</span>
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setDone(true)}>
                Selesai
              </Button>
            </div>
            <ul className="dnav-legend">
              {(Object.keys(count) as NavState[]).map((k) => (
                <li key={k}>
                  <i className={`dnum is-${k}`} aria-hidden="true" />
                  {NAV_LABEL[k]} <b>{count[k]}</b>
                </li>
              ))}
            </ul>
            <h3 className="dnav-title">Nomor soal</h3>
            <div className="dnav-grid">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={i === idx ? "step" : undefined}
                  aria-label={`Soal ${i + 1}, ${NAV_LABEL[states[i]].toLowerCase()}`}
                  className={`dnum is-${states[i]}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </aside>
        }
      >
        <article key={idx} className="enter-rise space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="qnum tnum">Soal {idx + 1}</p>
            <Badge tone="neutral">{meta.kind === "pecahan" ? "Isian pecahan" : "Isian angka"}</Badge>
          </div>

          <div className="fd-work">
            <div className="q-card">
              <div className="q-body">
                <p className="q-stem fd-stem whitespace-pre-line tnum">{q.stem}</p>
              </div>
              <div className={`fd-answer ${checked ? (benar[idx] ? "is-ok" : "is-bad") : ""}`} aria-live="polite">
                {val.map((v, i) => (
                  <span key={i} className="contents">
                    {i > 0 && <span className="fd-slash">/</span>}
                    <button
                      type="button"
                      className="fd-field tnum"
                      aria-current={!checked && i === field ? "true" : undefined}
                      aria-label={fields === 2 ? (i === 0 ? "Pembilang" : "Penyebut") : "Jawaban"}
                      onClick={() => setField(i)}
                      disabled={checked}
                    >
                      {v || <span className="fd-placeholder">?</span>}
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <Numpad onDigit={onDigit} onDelete={onDelete} onEnter={onEnter} enterLabel={checked ? "Lanjut" : fields === 2 && field === 0 ? "→" : "Periksa"} />
          </div>

          {checked && (
            <div className={`rounded-md border p-4 text-sm leading-relaxed ${benar[idx] ? "border-success/40 bg-success-soft" : "border-destructive/40 bg-destructive-soft"}`} role="status">
              <p className="mb-2 font-heading text-base text-foreground">
                {benar[idx] ? "Benar" : `Belum tepat — jawaban ${q.ans.join(" / ")}`}
              </p>
              <p className="whitespace-pre-line text-foreground">{q.bahas}</p>
              {idx < items.length - 1 ? (
                <Button variant="primary" className="mt-4" onClick={() => goTo(idx + 1)}>
                  Soal berikutnya
                  <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button variant="accent" className="mt-4" onClick={() => setDone(true)}>
                  Lihat hasil sesi
                </Button>
              )}
            </div>
          )}
        </article>
      </ExamBody>
      <ExamDock
        onPrev={() => goTo(Math.max(0, idx - 1))}
        onNext={() => goTo(Math.min(items.length - 1, idx + 1))}
        prevDisabled={idx === 0}
        nextDisabled={idx >= items.length - 1}
        prevLabel="Soal sebelumnya"
        nextLabel="Soal berikutnya"
      />
    </div>
  );
}
