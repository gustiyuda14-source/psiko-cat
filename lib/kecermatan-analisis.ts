import type { KecermatanColumnStats } from "@/lib/scoring/kecermatan";
import type { KecermatanTiming } from "@/lib/progress-rules";

// Analisis hasil latihan Kecermatan dari jawaban + waktu (docs/rencana/kecermatan-latihan-analisis.md).
// Murni, tanpa DB: dipakai layar selesai latihan (browser) dan halaman pembahasan (server).
// Nilai 60 detik bayangan dihitung engine v2 di server dari `bayangan` di sini.
// ponytail: semua ambang (jeda, titik hafal, pola) SEMENTARA; kalibrasi F4 setelah ±30 sesi nyata.

export type AnalisisItem = { id: string; column: number; seq: number; correct: boolean; selected: string; correctKey: string; symbols: Record<string, string> };

export type Analisis =
  | { valid: false; alasan: string }
  | {
      valid: true;
      /** Statistik 10 kolom dalam 60 detik pertama tiap kolom (kolom tak dikunjungi = 0, sama seperti ujian). */
      bayangan: KecermatanColumnStats[];
      kolomDikunjungi: number;
      kolomTidakUrut: number;
      penuh: {
        akurasi: number;
        benarPerMenit: number;
        perKolom: { column: number; urutan: number; benarPerMenit: number; akurasi: number }[];
        tren: "naik" | "stabil" | "turun";
        jeda: number;
      };
      adaptasi: { kurva: (number | null)[] } & TitikHafal;
      diagnosis: {
        pola: "impulsif" | "ragu" | "seimbang";
        /** Simbol kunci yang hilang vs simbol yang dikira hilang, terbanyak dulu. */
        tertukar: { benar: string; dikira: string; n: number }[];
        koreksiDiri: boolean;
      };
    };

const WINDOW_MS = 60_000;
const PER_COLUMN = 50;
const median = (xs: number[]) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const r1 = (n: number) => Math.round(n * 10) / 10;

export function analyzeKecermatan(items: AnalisisItem[], timing: KecermatanTiming | null): Analisis {
  if (!timing) return { valid: false, alasan: "Waktu pengerjaan tidak tercatat untuk latihan ini." };
  const timed = items.filter((it) => timing.t[it.id]);
  const visited = Object.keys(timing.cols).map(Number).filter((c) => timed.some((it) => it.column === c));
  if (visited.length < 3) return { valid: false, alasan: "Kerjakan minimal 3 kolom supaya polamu bisa dibaca." };

  const d = (it: AnalisisItem) => timing.t[it.id][1];
  const medD = median(timed.map(d));
  const akurasi = timed.filter((it) => it.correct).length / timed.length;
  if (medD < 250) return { valid: false, alasan: "Jawaban terlalu cepat untuk dibaca sebagai kerja sungguhan (di bawah seperempat detik per butir)." };
  if (akurasi < 0.35 && medD < 800) return { valid: false, alasan: "Polanya mirip klik acak. Coba lagi dengan tenang, satu butir satu jawaban." };

  // Jeda panjang (melamun, diajak ngobrol) dibuang dari hitungan kecepatan.
  const jedaMs = Math.max(10_000, 5 * medD);
  const aktif = timed.filter((it) => d(it) <= jedaMs);
  const firstSeq = new Map<number, number>();
  for (const it of items) firstSeq.set(it.column, Math.min(firstSeq.get(it.column) ?? Infinity, it.seq));

  const bayangan = Array.from({ length: 10 }, (_, i) => {
    const inWindow = timed.filter((it) => it.column === i + 1 && timing.t[it.id][0] <= WINDOW_MS);
    return { column_index: i + 1, total_klik: inWindow.length, total_benar: inWindow.filter((it) => it.correct).length };
  });

  const rate = (xs: AnalisisItem[]) => {
    const menit = xs.reduce((s, it) => s + d(it), 0) / 60_000;
    return menit > 0 ? r1(xs.filter((it) => it.correct).length / menit) : 0;
  };
  const perKolom = visited
    .map((column) => {
      const xs = aktif.filter((it) => it.column === column);
      const all = timed.filter((it) => it.column === column);
      return { column, urutan: timing.cols[column].o, benarPerMenit: rate(xs), akurasi: r1((all.filter((it) => it.correct).length / all.length) * 100) };
    })
    .sort((a, b) => a.urutan - b.urutan);
  // Arah kecepatan sepanjang urutan kerja: kemiringan garis relatif terhadap rata-rata.
  const ys = perKolom.map((k) => k.benarPerMenit);
  const xBar = (ys.length - 1) / 2;
  const slope = ys.reduce((s, y, i) => s + (i - xBar) * (y - mean(ys)), 0) / ys.reduce((s, _, i) => s + (i - xBar) ** 2, 0);
  const relatif = mean(ys) > 0 ? (slope * (ys.length - 1)) / mean(ys) : 0;
  const tren = relatif > 0.15 ? "naik" : relatif < -0.15 ? "turun" : "stabil";

  const kurva = kurvaDari(aktif.map((it) => ({ p: it.seq - firstSeq.get(it.column)!, ms: d(it) })));

  // Kesalahan di butir tercepat (kuartil bawah) vs sisanya.
  const q25 = median(aktif.map(d).filter((x) => x <= medD));
  const salah = (xs: AnalisisItem[]) => (xs.length ? xs.filter((it) => !it.correct).length / xs.length : 0);
  const cepat = aktif.filter((it) => d(it) <= q25);
  const errCepat = salah(cepat);
  const errLain = salah(aktif.filter((it) => d(it) > q25));
  const bpm = rate(aktif);
  const pola = errCepat >= 0.1 && errCepat >= 2 * errLain ? "impulsif" : akurasi >= 0.95 && bpm < 20 ? "ragu" : "seimbang";

  const pairs = new Map<string, { benar: string; dikira: string; n: number }>();
  const ordered = [...timed].sort((a, b) => a.column - b.column || a.seq - b.seq);
  const setelahSalah: number[] = [];
  ordered.forEach((it, i) => {
    if (!it.correct) {
      const benar = it.symbols[it.correctKey];
      const dikira = it.symbols[it.selected];
      if (benar && dikira) {
        const key = [benar, dikira].sort().join("|");
        const p = pairs.get(key) ?? { benar, dikira, n: 0 };
        p.n++;
        pairs.set(key, p);
      }
      const next = ordered[i + 1];
      if (next && next.column === it.column && d(next) <= jedaMs) setelahSalah.push(d(next));
    }
  });
  const tertukar = [...pairs.values()].filter((p) => p.n >= 2).sort((a, b) => b.n - a.n).slice(0, 3);
  const koreksiDiri = setelahSalah.length >= 3 && median(setelahSalah) > 1.3 * medD;

  return {
    valid: true,
    bayangan,
    kolomDikunjungi: visited.length,
    kolomTidakUrut: visited.filter((c) => !timing.cols[c].clean).length,
    penuh: { akurasi: r1(akurasi * 100), benarPerMenit: bpm, perKolom, tren, jeda: timed.length - aktif.length },
    adaptasi: { kurva, ...titikHafalDari(kurva) },
    diagnosis: { pola, tertukar, koreksiDiri },
  };
}

/** Kurva adaptasi: waktu biasa (median, detik) per posisi butir dalam kolom (0-based), gabungan semua kolom. */
export function kurvaDari(pts: { p: number; ms: number }[]): (number | null)[] {
  return Array.from({ length: PER_COLUMN }, (_, p) => {
    const xs = pts.filter((x) => x.p === p).map((x) => x.ms);
    return xs.length ? r1(median(xs) / 1000) : null;
  });
}

/** Posisi butir (1-based) tempat waktu berubah dari fase menghafal ke fase lancar: potongan dua rata-rata dengan galat terkecil. */
export type TitikHafal = { titikHafal: number | null; lebihCepatPct: number | null; sebelum: number | null; sesudah: number | null };

export function titikHafalDari(kurva: (number | null)[]): TitikHafal {
  const pts = kurva.flatMap((y, i) => (y === null ? [] : [{ i, y }]));
  let best: { k: number; sse: number; before: number; after: number } | null = null;
  for (let k = 5; k <= 25; k++) {
    const a = pts.filter((p) => p.i < k).map((p) => p.y);
    const b = pts.filter((p) => p.i >= k).map((p) => p.y);
    if (a.length < 3 || b.length < 5) continue;
    const ma = mean(a);
    const mb = mean(b);
    const sse = a.reduce((s, y) => s + (y - ma) ** 2, 0) + b.reduce((s, y) => s + (y - mb) ** 2, 0);
    if (!best || sse < best.sse) best = { k, sse, before: ma, after: mb };
  }
  // Beda < 10% = tidak ada fase menghafal yang jelas (langsung lancar).
  if (!best || best.after >= best.before * 0.9) return { titikHafal: null, lebihCepatPct: null, sebelum: null, sesudah: null };
  return { titikHafal: best.k, lebihCepatPct: Math.round((1 - best.after / best.before) * 100), sebelum: r1(best.before), sesudah: r1(best.after) };
}
