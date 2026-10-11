"use client";

import { Accuracy, Facts, StubRing, Ticket, TierStack, fmt, pct } from "@/app/components/ProgressTicket";
import { DRILL_ASPEK, DRILL_TIERS } from "@/lib/drill-cards";
import type { DrillProgress } from "@/lib/practice-progress";

/*
  Tiket progres drilling di atas katalog: cakupan per level tiap aspek, akurasi terhadap
  target 80%, rekomendasi latihan, dan progress tiap kartu per level. Data dari akun peserta
  (lib/practice-progress.ts); jumlah soal dari bank drill.
*/

export type ProgressCard = { kartu: string; label: string; aspek: string; tiers: string[][] };

export const TARGET = 80;
const MIN_FOR_PRIO = 5;

/** Soal dikerjakan, total soal, akurasi (benar / percobaan) untuk sekumpulan id soal.
 *  ok/bad = soal benar tanpa pernah salah / soal pernah salah — sama dengan navigasi sesi drill. */
export function stats(ids: string[], progress: DrillProgress) {
  const done = ids.filter((id) => progress[id]);
  const right = done.reduce((s, id) => s + progress[id][0], 0);
  const tries = done.reduce((s, id) => s + progress[id][1], 0);
  const ok = done.filter((id) => progress[id][0] === progress[id][1]).length;
  return { done: done.length, total: ids.length, right, tries, ok, bad: done.length - ok, acc: tries ? Math.round((right / tries) * 100) : null };
}
const tierIds = (cards: ProgressCard[], i: number) => cards.flatMap((c) => c.tiers[i]);

export function aspekTiers(cards: ProgressCard[], progress: DrillProgress) {
  const t = DRILL_TIERS.map((_, i) => stats(tierIds(cards, i), progress));
  return { total: t.map((s) => s.total), done: t.map((s) => s.done) };
}

export default function DrillProgressTicket({
  cards,
  progress,
  onStart,
}: {
  cards: ProgressCard[];
  progress: DrillProgress;
  onStart: (kartu: string) => void;
}) {
  const open = cards.filter((c) => c.tiers.flat().length);
  const all = stats(open.flatMap((c) => c.tiers.flat()), progress);
  const per = open.map((c) => ({ c, s: stats(c.tiers.flat(), progress) }));
  const worked = per.filter((x) => x.s.done > 0).length;
  const finished = per.filter((x) => x.s.done === x.s.total).length;

  const aspek = DRILL_ASPEK.map((a, ai) => {
    const own = open.filter((c) => c.aspek === a.key);
    const s = stats(own.flatMap((c) => c.tiers.flat()), progress);
    return { ...a, ai, own, s, tiers: aspekTiers(own, progress) };
  }).filter((a) => a.own.length);

  const prio = open
    .flatMap((c) => DRILL_TIERS.map((t, i) => ({ c, t, s: stats(c.tiers[i], progress) })))
    .filter((x) => x.s.done >= MIN_FOR_PRIO && x.s.acc !== null && x.s.acc < TARGET)
    .sort((a, b) => a.s.acc! - b.s.acc!)
    .slice(0, 3);

  return (
    <Ticket
      label="Progress drilling"
      foot={
        <>
        <div className="pg-sec-h">
          <h3>Progress drilling per kartu dan level</h3>
          <div className="pg-legend">
            <span><i style={{ background: "var(--success)" }} />Benar</span>
            <span><i style={{ background: "var(--destructive)" }} />Pernah salah</span>
            <span><i style={{ background: "repeating-linear-gradient(135deg,var(--pg-track) 0 3px,#f8f4ea 3px 6px)" }} />Belum dikerjakan</span>
          </div>
        </div>
        <div className="pg-heat-scroll">
          <div className="pg-heat" role="table" aria-label="Hasil drilling per kartu dan level">
            <div role="row" style={{ display: "contents" }}>
              <span className="pg-hd" role="columnheader">Kartu</span>
              {DRILL_TIERS.map(({ tier, label }) => (
                <span key={tier} className="pg-hd" role="columnheader">
                  {label}
                </span>
              ))}
            </div>
            {aspek.map((a) => (
              <div key={a.key} role="rowgroup" style={{ display: "contents" }}>
                <span className="pg-grp">{a.label}</span>
                {a.own.map((c) => (
                  <div key={c.kartu} role="row" style={{ display: "contents" }}>
                    <span className="pg-card" role="rowheader">
                      <code>{c.kartu}</code>
                      {c.label}
                    </span>
                    {DRILL_TIERS.map((t, i) => {
                      const s = stats(c.tiers[i], progress);
                      if (!s.total) return <span key={t.tier} role="cell" className="pg-cell is-na">Tidak ada soal</span>;
                      if (!s.done)
                        return (
                          <span key={t.tier} role="cell" className="pg-cell is-none" title={`${c.label}, ${t.label}: belum dikerjakan, ${s.total} soal`}>
                            <span>0/{s.total}</span>
                            <span>Belum</span>
                          </span>
                        );
                      return (
                        <span
                          key={t.tier}
                          role="cell"
                          className="pg-cell is-mix"
                          title={`${c.label}, ${t.label}: ${s.ok} benar, ${s.bad} pernah salah, ${s.total - s.done} belum dari ${s.total} soal`}
                        >
                          <span>
                            {s.done}/{s.total}
                          </span>
                          <b>
                            <span className="pg-ok">✓ {s.ok}</span>
                            <span className="pg-bad">✗ {s.bad}</span>
                          </b>
                          <span className="pg-mixbar" aria-hidden="true">
                            <i className="pg-ok" style={{ width: `${(s.ok / s.total) * 100}%` }} />
                            <i className="pg-bad" style={{ width: `${(s.bad / s.total) * 100}%` }} />
                          </span>
                        </span>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <p className="pg-note">Bar di dasar sel: hijau = soal dijawab benar, merah = soal pernah dijawab salah, arsir = belum dikerjakan (sama dengan warna nomor soal di sesi drill).</p>
        </>
      }
      stub={
        <>
          <span className="pg-label">Progress drilling</span>
          <span className="pg-big">
            {pct(all.done, all.total)}
            <small>%</small>
          </span>
          <span className="pg-sub tnum">
            {fmt(all.done)} dari {fmt(all.total)} soal dikerjakan
          </span>
          <StubRing p={all.total ? all.done / all.total : 0} />
          <Facts
            rows={[
              ["Akurasi keseluruhan", all.acc === null ? "-" : `${all.acc}%`],
              ["Percobaan menjawab", fmt(all.tries)],
              ["Kartu dikerjakan", `${worked} dari ${open.length}`],
              ["Kartu selesai", String(finished)],
            ]}
          />
        </>
      }
    >
      <section>
        <div className="pg-sec-h">
          <h3>Capaian per aspek</h3>
          <div className="pg-legend">
            {DRILL_TIERS.map(({ tier, label }) => (
              <span key={tier}>
                <i style={{ background: `var(--pg-t${tier})` }} />
                {label}
              </span>
            ))}
          </div>
        </div>
        <ul className="pg-asp">
          {aspek.map((a) => (
            <li key={a.key}>
              <span className="pg-nm">
                {a.label}
                <small>{a.own.length} kartu</small>
              </span>
              <TierStack total={a.tiers.total} done={a.tiers.done} delay={a.ai * 3} label={`${a.label}: ${a.s.done} dari ${a.s.total} soal dikerjakan`} />
              <Accuracy acc={a.s.acc} delay={a.ai} />
              <div className="pg-meta">
                <span>
                  {a.s.done} dari {a.s.total} soal
                </span>
                <span>{pct(a.s.done, a.s.total)}%</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="pg-sec-h">
          <h3>Rekomendasi latihan</h3>
          <span>
            Kriteria: akurasi di bawah {TARGET}% dari minimal {MIN_FOR_PRIO} soal
          </span>
        </div>
        {prio.length ? (
          <ol className="pg-prio">
            {prio.map(({ c, t, s }) => (
              <li key={`${c.kartu}-${t.tier}`}>
                <button type="button" onClick={() => onStart(c.kartu)}>
                  <span>
                    <b>{c.label}</b>
                    <small>
                      Level {t.label} · {s.done} soal dikerjakan
                    </small>
                  </span>
                  <em>{s.acc}%</em>
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <p className="pg-empty">
            {all.done
              ? `Belum ada level kartu di bawah target. Rekomendasi muncul setelah satu level kartu dikerjakan minimal ${MIN_FOR_PRIO} soal dengan akurasi di bawah ${TARGET}%.`
              : "Rekomendasi muncul setelah kamu mulai mengerjakan drilling."}
          </p>
        )}
        <p className="pg-note">Penanda hitam pada bar akurasi: target {TARGET}%. Pilih rekomendasi untuk langsung mulai drilling.</p>
      </section>

    </Ticket>
  );
}
