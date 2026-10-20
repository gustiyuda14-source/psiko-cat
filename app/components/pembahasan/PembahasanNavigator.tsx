"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buttonStyles } from "@/app/components/ui";
import { ChevronDown, ChevronLeft, ChevronRight } from "@/app/components/icons";
import { cardView, type CardData, type KeswaCekData } from "@/app/components/pembahasan/cards";
import type {
  KecerdasanReviewItem,
  KecermatanColumnGroup,
  KecermatanSummary,
  KepribadianReviewItem,
} from "@/app/components/PembahasanSection";
import type { PribadiReviewItem } from "@/app/components/PribadiReview";
import { HafalSimulasi } from "@/app/latihan/[module]/LatihanKecermatanAnalisis";

/*
  Pembahasan satu nomor per layar: kartu soal + kartu pembahasan di kiri, panel
  kanan berisi pilihan sub-tes, ringkasan, dan daftar soal berwarna (huruf kecil
  di pojok = jawaban peserta). Filter "Salah" menggantikan grup "Perlu ditinjau"
  lama supaya butir yang salah tetap bisa dibuka berurutan.

  Tata letak memakai container query, jadi komponen yang sama pas di halaman
  hasil, Ruang Review, dan layar selesai latihan. Di wadah sempit panel pindah
  ke atas dan daftar soal bisa dilipat.
*/

type State = "ok" | "bad" | "mid" | "skip" | "plain";
type Filter = "all" | State;
type Entry = { id: string; no: number; state: State; pick: string | null; card: CardData };
type Stat = { label: string; value: number; tone?: "ok" | "bad" | "mid" };
/** tone = status grup di tab (cek Keswa lolos/tidak); empty = kartu bila grup tanpa butir. */
type Group = { label: string; entries: Entry[]; tone?: "ok" | "bad"; empty?: CardData };
type Section = {
  key: string;
  label: string;
  groups: Group[];
  stats: Stat[];
  words?: Partial<Record<State, string>>;
  extra?: [string, string][];
  filters: [Filter, string][];
  legend: [State, string][];
};

export type PembahasanNavigatorProps = {
  kecerdasan?: KecerdasanReviewItem[];
  kepribadian?: KepribadianReviewItem[];
  pribadi?: PribadiReviewItem[];
  kecermatan?: { summary: KecermatanSummary | null; groups: KecermatanColumnGroup[] };
  /** Keswa: 5 cek validitas sebagai "kolom"; petak = butir validitas, merah = memicu cek. */
  keswa?: { label: string; cek: KeswaCekData[]; stats: Stat[]; extra: [string, string][] };
};

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

const CELL: Record<State, string> = {
  ok: "bg-success text-white",
  bad: "bg-destructive text-white",
  mid: "bg-accent-ink text-on-accent-ink",
  skip: "border border-dashed border-border-strong bg-card text-muted-foreground",
  plain: "bg-primary text-primary-foreground",
};
const STATE_WORD: Record<State, string> = {
  ok: "benar",
  bad: "salah",
  mid: "mendekati kunci",
  skip: "tidak dijawab",
  plain: "dijawab",
};
const STAT_TONE = { ok: "text-success", bad: "text-destructive", mid: "text-accent-ink" } as const;

const r1 = (v: number | null) => (v == null ? "—" : v.toFixed(1));
const count = (entries: Entry[], ...states: State[]) => entries.filter((e) => states.includes(e.state)).length;
const matches = (e: Entry, f: Filter) => f === "all" || e.state === f || (f === "bad" && e.state === "mid");

const huruf = (jawab: string) => (jawab === "Ya" ? "Y" : jawab === "Tidak" ? "T" : "");

function buildSections({ kecerdasan, kepribadian, pribadi, kecermatan, keswa }: PembahasanNavigatorProps): Section[] {
  const out: Section[] = [];

  if (kecerdasan?.length) {
    const entries: Entry[] = [...kecerdasan]
      .sort((a, b) => a.sequence_number - b.sequence_number)
      .map((item) => ({
        id: item.question_id,
        no: item.sequence_number,
        pick: item.selected_key,
        state: item.selected_key === null ? "skip" : item.is_correct ? "ok" : "bad",
        card: { kind: "ks", item },
      }));
    out.push({
      key: "ks",
      label: "Kecerdasan Umum",
      groups: [{ label: "", entries }],
      stats: [
        { label: "Benar", value: count(entries, "ok"), tone: "ok" },
        { label: "Salah", value: count(entries, "bad"), tone: "bad" },
        { label: "Dilewati", value: count(entries, "skip") },
      ],
      filters: [["all", "Semua"], ["bad", "Salah"], ["skip", "Dilewati"], ["ok", "Benar"]],
      legend: [["ok", "Benar"], ["bad", "Salah"], ["skip", "Dilewati"]],
    });
  }

  if (kepribadian?.length) {
    const entries: Entry[] = [...kepribadian]
      .sort((a, b) => a.sequence_number - b.sequence_number)
      .map((item) => ({
        id: item.question_id,
        no: item.sequence_number,
        pick: item.selected_key,
        state: item.selected_key ? "plain" : "skip",
        card: { kind: "kp", item },
      }));
    out.push({
      key: "kp",
      label: "Kepribadian",
      groups: [{ label: "", entries }],
      stats: [
        { label: "Dijawab", value: count(entries, "plain") },
        { label: "Dilewati", value: count(entries, "skip") },
        { label: "Pernyataan", value: entries.length },
      ],
      filters: [["all", "Semua"], ["skip", "Dilewati"]],
      legend: [["plain", "Dijawab"], ["skip", "Dilewati"]],
    });
  }

  if (pribadi?.length) {
    const entries: Entry[] = pribadi.map((item, i) => {
      const close = item.skor === item.max - 1 && item.subtes !== "SK";
      return {
        id: item.question_id,
        no: i + 1,
        pick: item.selected_key,
        state: item.selected_key === null ? "skip" : item.skor === item.max ? "ok" : close ? "mid" : "bad",
        card: { kind: "pribadi", item, no: i + 1, close },
      };
    });
    out.push({
      key: "pribadi",
      label: pribadi.some((i) => i.subtes === "SK") ? "Kepribadian · Integritas & Kejujuran" : "Kepribadian",
      groups: [{ label: "", entries }],
      stats: [
        { label: "Sesuai kunci", value: count(entries, "ok"), tone: "ok" },
        { label: "Selisih 1", value: count(entries, "mid"), tone: "mid" },
        { label: "Tidak sesuai", value: count(entries, "bad"), tone: "bad" },
      ],
      filters: [["all", "Semua"], ["bad", "Belum sesuai"], ["skip", "Dilewati"], ["ok", "Sesuai kunci"]],
      legend: [["ok", "Sesuai kunci"], ["mid", "Selisih 1 tingkat"], ["bad", "Tidak sesuai kunci"], ["skip", "Dilewati"]],
    });
  }

  if (kecermatan && (kecermatan.summary || kecermatan.groups.length)) {
    const groups = kecermatan.groups.map((g) => {
      const kolom = ROMAN[g.column_index - 1] ?? String(g.column_index);
      return {
        label: kolom,
        entries: g.items.map(
          (item): Entry => ({
            id: item.question_id,
            no: item.sequence_number,
            pick: item.selected_key,
            state: item.is_correct ? "ok" : "bad",
            card: { kind: "kc", item, kolom },
          })
        ),
      };
    });
    const all = groups.flatMap((g) => g.entries);
    const s = kecermatan.summary;
    out.push({
      key: "kc",
      label: "Sikap Kerja",
      groups,
      stats: [
        { label: "Benar", value: count(all, "ok"), tone: "ok" },
        { label: "Salah", value: count(all, "bad"), tone: "bad" },
        { label: "Dijawab", value: all.length },
      ],
      extra: s
        ? [
            ["Kecepatan (Ke)", r1(s.ke_index)],
            ["Ketelitian (Kt)", r1(s.kt_index)],
            ["Ketahanan (Kh)", r1(s.kh_index)],
          ]
        : undefined,
      filters: [["all", "Semua"], ["bad", "Salah"], ["ok", "Benar"]],
      legend: [["ok", "Benar"], ["bad", "Salah"]],
    });
  }

  if (keswa?.cek.length) {
    out.push({
      key: "keswa",
      label: keswa.label,
      groups: keswa.cek.map((cek) => ({
        label: cek.tab,
        tone: cek.lolos ? "ok" : "bad",
        empty: { kind: "keswa", cek },
        entries: cek.items
          .map(
            (item): Entry => ({
              id: item.butir.map((b) => b.no).join("-"),
              no: item.butir[0].no,
              pick: item.butir.map((b) => huruf(b.jawab)).join("") || null,
              // Butir validitas yang tidak dijawab tidak dihitung: bukan "wajar", bukan "terdeteksi".
              state: item.tandai ? "bad" : item.butir.some((b) => !huruf(b.jawab)) ? "skip" : "ok",
              card: { kind: "keswa", cek, item },
            })
          )
          .sort((a, b) => a.no - b.no),
      })),
      stats: keswa.stats,
      extra: keswa.extra,
      words: { ok: "wajar", bad: "terdeteksi" },
      filters: [["all", "Semua"], ["bad", "Terdeteksi"], ["ok", "Wajar"], ["skip", "Tidak dijawab"]],
      legend: [["ok", "Wajar"], ["bad", "Terdeteksi (memicu cek)"], ["skip", "Tidak dijawab"]],
    });
  }

  return out;
}

export default function PembahasanNavigator(props: PembahasanNavigatorProps) {
  const { kecerdasan, kepribadian, pribadi, kecermatan, keswa } = props;
  const sections = useMemo(
    () => buildSections({ kecerdasan, kepribadian, pribadi, kecermatan, keswa }),
    [kecerdasan, kepribadian, pribadi, kecermatan, keswa]
  );
  const [si, setSi] = useState(0);
  const [gi, setGi] = useState(0);
  const [idx, setIdx] = useState(0);
  const [filter, setFilter] = useState<Filter>("all");
  const [reveal, setReveal] = useState(true);
  const [gridOpen, setGridOpen] = useState(false);
  const soalRef = useRef<HTMLElement>(null);

  const section = sections[Math.min(si, sections.length - 1)];
  const group = section?.groups[gi] ?? section?.groups[0];
  const entries = group?.entries ?? [];
  const entry = entries[idx] ?? entries[0];
  const card = entry?.card ?? group?.empty;
  const visible = entries.flatMap((e, i) => (matches(e, filter) ? [i] : []));
  const prevIdx = visible.filter((i) => i < idx).at(-1);
  const nextIdx = visible.find((i) => i > idx);

  function select(i: number) {
    setIdx(i);
    // Pindah nomor dari bawah kartu pembahasan atau dari grid di HP: bawa kartu soal ke layar.
    requestAnimationFrame(() => {
      const el = soalRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      if (top < 72 || top > window.innerHeight - 120) {
        const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        el.scrollIntoView({ block: "start", behavior: smooth ? "smooth" : "auto" });
      }
    });
  }

  const goRef = useRef<(dir: 1 | -1) => void>(() => {});
  useEffect(() => {
    goRef.current = (dir) => {
      const target = dir > 0 ? nextIdx : prevIdx;
      if (target !== undefined) select(target);
    };
  });
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (e.altKey || e.ctrlKey || e.metaKey || t?.closest("input, select, textarea, [contenteditable]")) return;
      if (e.key === "ArrowRight") goRef.current(1);
      if (e.key === "ArrowLeft") goRef.current(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!section || !card) {
    return <p className="text-sm text-muted-foreground">Tidak ada jawaban tersimpan.</p>;
  }

  const view = cardView(card, reveal);
  const pos = visible.indexOf(idx);

  function pickFilter(f: Filter) {
    setFilter(f);
    if (f !== "all" && entry && !matches(entry, f)) {
      const first = entries.findIndex((e) => matches(e, f));
      if (first >= 0) select(first);
    }
  }

  return (
    <div className="@container w-full">
      <div className="grid gap-5 @3xl:grid-cols-[minmax(0,1fr)_18rem] @3xl:items-start">
        <div className="order-2 min-w-0 space-y-4 @3xl:order-1">
          <article ref={soalRef} className="surface-card scroll-mt-24 space-y-3 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-heading text-base font-semibold text-foreground">{view.title}</h3>
              {view.badges}
              {view.status}
              {view.hasKey && (
                <label className="ml-auto inline-flex min-h-9 cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={!reveal}
                    onChange={(e) => setReveal(!e.target.checked)}
                    className="size-4 accent-[var(--primary)]"
                  />
                  Sembunyikan kunci
                </label>
              )}
            </div>
            {view.soal}
          </article>

          <section className="surface-card space-y-3 p-5 sm:p-6" aria-label="Pembahasan">
            <h3 className="font-heading text-base font-semibold text-foreground">Pembahasan</h3>
            {reveal || !view.hasKey ? (
              view.pembahasan
            ) : (
              <p className="text-sm text-muted-foreground">
                Kunci dan pembahasan disembunyikan. Coba jawab ulang dulu, lalu hilangkan centang &quot;Sembunyikan kunci&quot;.
              </p>
            )}
          </section>

          <nav className="flex items-center justify-between gap-3" aria-label="Pindah nomor">
            <button
              type="button"
              disabled={prevIdx === undefined}
              onClick={() => prevIdx !== undefined && select(prevIdx)}
              className={buttonStyles({ variant: "secondary" })}
            >
              <ChevronLeft className="size-4" />
              Sebelumnya
            </button>
            <span className="tnum text-sm text-muted-foreground">
              {pos + 1} / {visible.length}
            </span>
            <button
              type="button"
              disabled={nextIdx === undefined}
              onClick={() => nextIdx !== undefined && select(nextIdx)}
              className={buttonStyles({ variant: "primary" })}
            >
              Berikutnya
              <ChevronRight className="size-4" />
            </button>
          </nav>
          {section.key === "kc" && kecermatan && <HafalSimulasi groups={kecermatan.groups} />}
        </div>

        <aside className="order-1 min-w-0 space-y-4 @3xl:sticky @3xl:top-24 @3xl:order-2 @3xl:max-h-[calc(100dvh-7rem)] @3xl:overflow-y-auto">
          <section className="surface-card space-y-3 p-4">
            {sections.length > 1 ? (
              <div className="space-y-2">
                <label htmlFor="pembahasan-subtes" className="font-heading text-sm font-semibold text-foreground">
                  Sub-tes
                </label>
                <div className="relative">
                  <select
                    id="pembahasan-subtes"
                    value={si}
                    onChange={(e) => {
                      setSi(Number(e.target.value));
                      setGi(0);
                      setIdx(0);
                      setFilter("all");
                    }}
                    className="min-h-11 w-full cursor-pointer appearance-none rounded-full bg-primary py-2.5 pl-4 pr-10 font-heading text-sm font-semibold text-primary-foreground"
                  >
                    {sections.map((s, i) => (
                      <option key={s.key} value={i}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-gold-hi" />
                </div>
              </div>
            ) : (
              <p className="font-heading text-sm font-semibold text-foreground">{section.label}</p>
            )}

            <dl className="grid grid-cols-3 gap-1.5">
              {section.stats.map((s) => (
                <div key={s.label} className="flex flex-col-reverse rounded-md border border-border bg-surface-inset px-1.5 py-2 text-center">
                  <dd className={`tnum font-heading text-xl font-semibold ${s.tone ? STAT_TONE[s.tone] : "text-foreground"}`}>{s.value}</dd>
                  <dt className="text-[0.7rem] leading-tight text-muted-foreground">{s.label}</dt>
                </div>
              ))}
            </dl>

            {section.extra && (
              <dl className="space-y-1 border-t border-border pt-3 text-xs">
                {section.extra.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="tnum font-semibold text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </section>

          <section className="surface-card p-4">
            <button
              type="button"
              aria-expanded={gridOpen}
              onClick={() => setGridOpen((o) => !o)}
              className="flex min-h-9 w-full items-center justify-between font-heading text-sm font-semibold text-foreground @3xl:hidden"
            >
              Daftar soal
              <ChevronDown className={`size-4 transition-transform ${gridOpen ? "rotate-180" : ""}`} />
            </button>
            <h3 className="hidden font-heading text-sm font-semibold text-foreground @3xl:block">Daftar soal</h3>

            <div className={`${gridOpen ? "block" : "hidden"} mt-3 space-y-3 @3xl:block`}>
              {/* Freeze pane: tab kolom + saring tetap terlihat saat daftar nomor di-scroll. */}
              <div className="space-y-3 @3xl:sticky @3xl:-top-px @3xl:z-10 @3xl:-mx-4 @3xl:border-b @3xl:border-border @3xl:bg-card @3xl:px-4 @3xl:pb-3 @3xl:pt-2">
              {section.groups.length > 1 && (
                <div className={section.groups.some((g) => g.tone) ? "flex flex-wrap gap-1" : "grid grid-cols-5 gap-1"} role="group" aria-label="Pilih kolom">
                  {section.groups.map((g, i) => (
                    <button
                      key={g.label}
                      type="button"
                      aria-pressed={i === gi}
                      aria-label={g.tone ? `${g.label}, ${g.tone === "ok" ? "lolos" : "tidak lolos"}` : undefined}
                      onClick={() => {
                        setGi(i);
                        setIdx(0);
                        setFilter("all");
                      }}
                      className={`min-h-8 rounded-md border text-xs font-semibold ${g.tone ? "inline-flex items-center gap-1.5 px-2.5" : ""} ${
                        i === gi ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-surface-inset"
                      }`}
                    >
                      {g.tone && <span className={`size-2 rounded-full ${CELL[g.tone]}`} aria-hidden="true" />}
                      {g.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Saring nomor">
                {section.filters.map(([f, label]) => {
                  const n = f === "all" ? entries.length : entries.filter((e) => matches(e, f)).length;
                  return (
                    <button
                      key={f}
                      type="button"
                      aria-pressed={f === filter}
                      disabled={n === 0}
                      onClick={() => pickFilter(f)}
                      className={`min-h-8 rounded-full border px-3 text-xs font-semibold disabled:opacity-40 ${
                        f === filter ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-surface-inset"
                      }`}
                    >
                      {label} <span className="tnum opacity-75">{n}</span>
                    </button>
                  );
                })}
              </div>
              </div>

              <div className="grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-1.5 @3xl:grid-cols-6">
                {entries.map((e, i) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => select(i)}
                    aria-current={i === idx ? "true" : undefined}
                    aria-label={`Nomor ${e.no}, ${section.words?.[e.state] ?? STATE_WORD[e.state]}${e.pick ? `, jawaban ${e.pick}` : ""}`}
                    className={`tnum relative h-10 rounded-md text-sm font-bold transition-opacity ${CELL[e.state]} ${
                      matches(e, filter) ? "" : "opacity-20"
                    } ${i === idx ? "ring-2 ring-accent ring-offset-2 ring-offset-card" : ""}`}
                  >
                    {e.no}
                    {e.pick && <sup className="absolute right-1 top-1 text-[0.6rem] leading-none">{e.pick}</sup>}
                  </button>
                ))}
              </div>

              <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {section.legend.map(([s, label]) => (
                  <li key={s} className="inline-flex items-center gap-1.5">
                    <span className={`inline-block size-2.5 rounded-sm ${CELL[s]}`} aria-hidden="true" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
