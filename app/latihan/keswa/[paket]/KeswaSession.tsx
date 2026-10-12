"use client";

import { useCallback, useEffect, useEffectEvent, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExamBar, ExamBody, ExamDock, ExamTimer } from "@/app/components/ExamChrome";
import { Button, ConfirmDialog } from "@/app/components/ui-client";
import { KESWA_DURASI_DETIK } from "@/lib/keswa-scoring";

/*
  Simulasi Keswa: satu pernyataan per layar, Ya/Tidak (keyboard Y/T, panah kiri/kanan).
  Jawaban + waktu mulai disimpan di localStorage tiap menjawab supaya refresh tidak menghapus
  pekerjaan 90 menit; dihapus setelah berhasil dikirim. Penilaian di /api/keswa.
*/

type Simpan = { jawaban: string; mulai: number };
const noSubscribe = () => () => {};
const sekarang = () => Date.now();

/** Simpanan yang masih bisa dilanjutkan (waktunya belum habis), sebagai string supaya snapshot stabil. */
function baca(key: string, total: number): string | null {
  try {
    const raw = localStorage.getItem(key);
    const s = raw ? (JSON.parse(raw) as Simpan) : null;
    return s && s.jawaban.length === total && Date.now() - s.mulai < KESWA_DURASI_DETIK * 1000 ? raw : null;
  } catch {
    return null;
  }
}
function tulis(key: string, v: Simpan | null) {
  try {
    if (v) localStorage.setItem(key, JSON.stringify(v));
    else localStorage.removeItem(key);
  } catch {}
}

export default function KeswaSession({ paket, soal, userId, percobaan }: { paket: number; soal: string[]; userId: string; percobaan: number }) {
  const router = useRouter();
  const key = `psiko_keswa:${userId}:${paket}`;
  const raw = useSyncExternalStore(noSubscribe, () => baca(key, soal.length), () => null);
  const tersimpan = raw ? (JSON.parse(raw) as Simpan) : null;

  const [jalan, setJalan] = useState<Simpan | null>(null);
  const [idx, setIdx] = useState(0);
  const [now, setNow] = useState(0);
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [mengirim, setMengirim] = useState(false);
  const [galat, setGalat] = useState("");
  const jalanRef = useRef(jalan);
  useEffect(() => {
    jalanRef.current = jalan;
  }, [jalan]);

  const sisa = jalan ? Math.max(0, KESWA_DURASI_DETIK - Math.floor((now - jalan.mulai) / 1000)) : KESWA_DURASI_DETIK;
  const terjawab = jalan ? soal.length - (jalan.jawaban.match(/-/g)?.length ?? 0) : 0;

  const kirim = useCallback(async () => {
    const s = jalanRef.current;
    if (!s || mengirim) return;
    setMengirim(true);
    setGalat("");
    try {
      const res = await fetch("/api/keswa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paket, jawaban: s.jawaban, durasi: Math.floor((Date.now() - s.mulai) / 1000) }),
      });
      const data = (await res.json().catch(() => ({}))) as { id?: number; error?: string };
      if (!res.ok || !data.id) throw new Error(data.error ?? "Hasil belum bisa disimpan. Coba kirim lagi.");
      tulis(key, null);
      router.push(`/latihan/keswa/hasil/${data.id}`);
    } catch (e) {
      setGalat(e instanceof Error ? e.message : "Hasil belum bisa disimpan. Coba kirim lagi.");
      setMengirim(false);
    }
  }, [key, mengirim, paket, router]);

  // Waktu habis = kirim otomatis.
  const mulaiAt = jalan?.mulai;
  useEffect(() => {
    if (mulaiAt === undefined) return;
    const t = setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (n - mulaiAt >= KESWA_DURASI_DETIK * 1000) {
        clearInterval(t);
        void kirim();
      }
    }, 1000);
    return () => clearInterval(t);
  }, [mulaiAt, kirim]);

  const jawab = (c: "Y" | "T") => {
    if (!jalan) return;
    const next = { ...jalan, jawaban: jalan.jawaban.slice(0, idx) + c + jalan.jawaban.slice(idx + 1) };
    tulis(key, next);
    setJalan(next);
    setIdx(Math.min(soal.length - 1, idx + 1));
  };

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey || konfirmasi) return;
    const k = e.key.toLowerCase();
    if (k === "y") jawab("Y");
    else if (k === "t") jawab("T");
    else if (e.key === "ArrowRight") setIdx(Math.min(soal.length - 1, idx + 1));
    else if (e.key === "ArrowLeft") setIdx(Math.max(0, idx - 1));
    else return;
    e.preventDefault();
  });
  const aktif = jalan !== null;
  useEffect(() => {
    if (!aktif) return;
    const h = (e: KeyboardEvent) => onKey(e);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [aktif]);

  const mulai = (lanjut: Simpan | null) => {
    const s = lanjut ?? { jawaban: "-".repeat(soal.length), mulai: sekarang() };
    tulis(key, s);
    setNow(sekarang());
    setIdx(lanjut ? Math.max(0, s.jawaban.indexOf("-")) : 0);
    setJalan(s);
  };

  const keluar = (
    <Link href="/dashboard/keswa?tab=simulasi" className="mbtn">
      <span aria-hidden="true">←</span>
      Keluar
    </Link>
  );

  if (!jalan) {
    return (
      <div className="min-h-[100dvh] bg-background">
        <ExamBar title={`Simulasi Keswa · Paket ${paket}`} actions={keluar} />
        <div className="app-page">
          <section className="fd-result enter-rise">
            <p className="section-kicker">Simulasi Keswa</p>
            <h1 className="fd-result-title">Paket {paket}</h1>
            <dl className="fd-stats">
              <div><dt>Pernyataan</dt><dd className="tnum">{soal.length}</dd></div>
              <div><dt>Waktu</dt><dd className="tnum">{KESWA_DURASI_DETIK / 60}<span> menit</span></dd></div>
              <div><dt>Jawaban</dt><dd>Ya / Tidak</dd></div>
            </dl>
            <ul className="ksw-list">
              <li>Tidak ada jawaban benar atau salah. Jawab sesuai keadaanmu yang sebenarnya.</li>
              <li>Tekan <kbd>Y</kbd> untuk Ya, <kbd>T</kbd> untuk Tidak, panah kiri/kanan untuk pindah soal.</li>
              <li>Hasilnya status VALID / TIDAK VALID dari 5 cek, bukan skor kejiwaan.</li>
              <li>Waktu habis = jawaban dikirim otomatis.</li>
            </ul>
            {percobaan >= 2 && (
              <p className="ksw-warn" role="note">
                Kamu sudah punya 2 hasil untuk paket ini. Mengirim simulasi baru akan menghapus hasil yang paling lama.
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              {tersimpan ? (
                <>
                  <Button variant="accent" size="lg" onClick={() => mulai(tersimpan)}>
                    Lanjutkan ({soal.length - (tersimpan.jawaban.match(/-/g)?.length ?? 0)} terjawab)
                  </Button>
                  <Button variant="secondary" size="lg" onClick={() => mulai(null)}>
                    Mulai dari awal
                  </Button>
                </>
              ) : (
                <Button variant="accent" size="lg" onClick={() => mulai(null)}>
                  Mulai simulasi
                </Button>
              )}
            </div>
          </section>
        </div>
      </div>
    );
  }

  const pilihan = jalan.jawaban[idx];
  const kosongN = soal.length - terjawab;

  return (
    <div className="min-h-[100dvh] bg-background">
      <ExamBar title={`Simulasi Keswa · Paket ${paket}`} count={`Soal ${idx + 1} dari ${soal.length}`} timer={<ExamTimer seconds={sisa} />} actions={keluar} />
      <ExamBody
        navigator={
          <aside className="order-2 bg-card p-5 lg:sticky lg:top-[58px] lg:h-[calc(100dvh-58px)] lg:w-[300px] lg:shrink-0 lg:overflow-auto lg:border-l lg:border-border" aria-label="Navigasi soal">
            <div className="dnav-head">
              <div>
                <p className="dnav-kicker">Keswa · Paket {paket}</p>
                <p className="dnav-count">
                  <b>{terjawab}</b>/{soal.length} <span>soal dijawab</span>
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setKonfirmasi(true)} disabled={mengirim}>
                Selesai
              </Button>
            </div>
            <h3 className="dnav-title">Nomor soal</h3>
            <div className="dnav-grid">
              {soal.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIdx(i)}
                  aria-current={i === idx ? "step" : undefined}
                  aria-label={`Soal ${i + 1}, ${jalan.jawaban[i] === "-" ? "belum dijawab" : "sudah dijawab"}`}
                  className={`dnum ${jalan.jawaban[i] === "-" ? "" : "is-answered"}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </aside>
        }
      >
        <article key={idx} className="enter-rise space-y-5">
          <p className="qnum tnum">Soal {idx + 1}</p>
          <div className="q-card">
            <div className="q-body">
              <p className="q-stem ksw-stem">{soal[idx]}</p>
            </div>
          </div>
          <div className="ksw-yt" role="group" aria-label="Jawaban">
            {(["Y", "T"] as const).map((c) => (
              <button key={c} type="button" className={`opt ${pilihan === c ? "sel" : ""}`} aria-pressed={pilihan === c} onClick={() => jawab(c)}>
                <span className="mark is-square">{c}</span>
                {c === "Y" ? "Ya" : "Tidak"}
              </button>
            ))}
          </div>
          {galat && (
            <div className="rounded-md border border-destructive/40 bg-destructive-soft p-4 text-sm" role="alert">
              <p className="mb-3 text-foreground">{galat}</p>
              <Button variant="primary" onClick={() => void kirim()} disabled={mengirim}>
                Kirim ulang
              </Button>
            </div>
          )}
        </article>
      </ExamBody>
      <ExamDock
        onPrev={() => setIdx((i) => Math.max(0, i - 1))}
        onNext={() => setIdx((i) => Math.min(soal.length - 1, i + 1))}
        prevDisabled={idx === 0}
        nextDisabled={idx >= soal.length - 1}
        prevLabel="Soal sebelumnya"
        nextLabel="Soal berikutnya"
      />
      <ConfirmDialog
        open={konfirmasi}
        onClose={() => setKonfirmasi(false)}
        onConfirm={() => {
          setKonfirmasi(false);
          void kirim();
        }}
        title="Kirim jawaban?"
        confirmLabel={mengirim ? "Mengirim…" : "Kirim sekarang"}
        tone="accent"
      >
        <p>
          {kosongN > 0
            ? `Masih ada ${kosongN} soal kosong. Soal kosong ikut dinilai di cek "soal kosong".`
            : "Semua soal sudah dijawab."}
        </p>
      </ConfirmDialog>
    </div>
  );
}
