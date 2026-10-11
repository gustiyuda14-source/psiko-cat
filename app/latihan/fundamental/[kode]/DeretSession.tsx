"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deretAnswer, rkTier, type FundamentalMeta } from "@/lib/fundamental";
import { ExamBar, ExamBody, ExamTimer } from "@/app/components/ExamChrome";
import { Button } from "@/app/components/ui-client";
import Numpad from "./Numpad";

type Phase = "intro" | "run" | "done";
const BEFORE = 3;
const AFTER = 4;

export default function DeretSession({ meta, digits }: { meta: FundamentalMeta; digits: number[] }) {
  const router = useRouter();
  const op = meta.kode === "rk-kali" ? "kali" : "tambah";
  const sym = op === "kali" ? "×" : "+";
  const total = digits.length - 1;
  const [phase, setPhase] = useState<Phase>("intro");
  const [answers, setAnswers] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [shake, setShake] = useState(0);

  useEffect(() => {
    if (phase !== "run") return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const pos = answers.length;
  const key = (i: number) => deretAnswer(op, digits[i], digits[i + 1]);

  const onDigit = useCallback(
    (d: string) => {
      if (phase !== "run" || pos >= total) return;
      const n = Number(d);
      if (n !== deretAnswer(op, digits[pos], digits[pos + 1])) {
        setShake((s) => s + 1);
        navigator.vibrate?.(60);
      }
      setAnswers((a) => [...a, n]);
      if (pos + 1 >= total) setPhase("done");
    },
    [digits, op, phase, pos, total]
  );
  const start = useCallback(() => setPhase("run"), []);

  const exit = (
    <Link href="/dashboard/fundamental" className="mbtn">
      <span aria-hidden="true">←</span>
      Keluar
    </Link>
  );
  const timer = phase === "intro" ? undefined : <ExamTimer seconds={elapsed} label="Waktu berjalan" muted />;
  const wrong = answers.map((a, i) => [a, i] as const).filter(([a, i]) => a !== key(i));
  const ok = answers.length - wrong.length;

  if (phase === "intro") {
    return (
      <div className="min-h-[100dvh] bg-background">
        <ExamBar title={meta.label} count={`${total} soal`} actions={exit} />
        <div className="app-page">
          <section className="fd-result enter-rise">
            <p className="section-kicker">Rekening Koran</p>
            <h1 className="fd-result-title">{meta.label}</h1>
            <p className="text-foreground">
              Deret {total + 1} angka ditampilkan dari atas ke bawah. {op === "kali" ? "Kalikan" : "Jumlahkan"} dua angka yang
              berdekatan, lalu ketik <b>angka satuannya saja</b>. Jawaban langsung tersimpan dan tidak bisa diubah, jadi jaga
              ketelitian. Waktu mulai berjalan saat kamu menekan Mulai.
            </p>
            <div className="fd-example tnum" aria-label="Contoh">
              <span>7</span>
              <i>{deretAnswer(op, 7, 8)}</i>
              <span>8</span>
              <small>
                7 {sym} 8 = {op === "kali" ? 56 : 15} → tulis {deretAnswer(op, 7, 8)}
              </small>
            </div>
            <Button variant="accent" size="lg" onClick={start}>
              Mulai
            </Button>
          </section>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    const acc = Math.round((ok / total) * 1000) / 10;
    const tier = rkTier(elapsed, acc);
    return (
      <div className="min-h-[100dvh] bg-background">
        <ExamBar title={meta.label} count="Hasil sesi" timer={timer} actions={exit} />
        <div className="app-page">
          <section className="fd-result enter-rise">
            <p className="section-kicker">Hasil sesi</p>
            <div className="flex items-center gap-4">
              <span className="fd-tier tnum" data-rank={tier.rank}>{tier.rank}</span>
              <div>
                <h1 className="fd-result-title">{tier.label}</h1>
                <p className="muted">{meta.label}</p>
              </div>
            </div>
            <dl className="fd-stats">
              <div><dt>Benar</dt><dd className="tnum">{ok}<span>/{total}</span></dd></div>
              <div><dt>Akurasi</dt><dd className="tnum">{acc}%</dd></div>
              <div><dt>Waktu</dt><dd className="tnum">{elapsed} dtk</dd></div>
            </dl>
            {wrong.length > 0 && (
              <div>
                <h2 className="dnav-title !mt-0">Jawaban salah</h2>
                <ul className="fd-wrong tnum">
                  {wrong.map(([a, i]) => (
                    <li key={i}>
                      <span>#{i + 1}</span> {digits[i]} {sym} {digits[i + 1]} → <s>{a}</s> <b>{key(i)}</b>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="muted">Tier: S+ ≤80 dtk &gt;99,5% · S ≤90 dtk ≥90% · A ≤100 dtk ≥85% · B ≤130 dtk ≥75% · C ≤180 dtk ≥60%. Hasil belum disimpan ke akun (prototipe).</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="accent" size="lg" onClick={() => router.refresh()}>
                Ulangi dengan deret baru
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

  // Jendela tetap BEFORE+AFTER+1 angka supaya tinggi deret tidak berubah di awal/akhir.
  const to = Math.min(total, Math.max(pos, BEFORE) + AFTER);
  const from = Math.max(0, to - BEFORE - AFTER);
  return (
    <div className="min-h-[100dvh] bg-background">
      <ExamBar title={meta.label} count={`Soal ${pos + 1} dari ${total}`} timer={timer} actions={exit}>
        <div className="fd-progress" style={{ ["--p" as string]: `${(pos / total) * 100}%` }} aria-hidden="true" />
      </ExamBar>
      <ExamBody>
        <div className="fd-work is-deret">
          {/* key = jumlah salah: deret dipasang ulang tiap jawaban salah supaya animasi getar diputar lagi. */}
          <ol key={shake} className={`fd-strip tnum ${shake ? "is-shake" : ""}`} aria-label="Deret angka">
            {Array.from({ length: to - from + 1 }, (_, k) => from + k).map((i) => (
              <li key={i} className={i === pos || i === pos + 1 ? "is-pair" : i < pos ? "is-past" : ""}>
                <span className="fd-digit">{digits[i]}</span>
                {i < to && (
                  <span className={`fd-slot ${i < pos ? (answers[i] === key(i) ? "is-ok" : "is-bad") : i === pos ? "is-active" : ""}`}>
                    {i < pos ? answers[i] : ""}
                  </span>
                )}
              </li>
            ))}
          </ol>
          <div className="space-y-3">
            <p className="fd-hint">
              {op === "kali" ? "Kalikan" : "Jumlahkan"} dua angka bertanda, ketik angka satuannya.
            </p>
            <Numpad onDigit={onDigit} />
          </div>
        </div>
      </ExamBody>
    </div>
  );
}
