import type {
  KecerdasanOptionsPayload,
  KepribadianOptionsPayload,
} from "@/lib/types/safe-question";
import { Accordion, Badge, Meter } from "@/app/components/ui";
import { Check, ChevronDown, Close } from "@/app/components/icons";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export type KecerdasanReviewItem = {
  question_id: string;
  sequence_number: number;
  selected_key: string | null;
  correct_key: string;
  is_correct: boolean;
  payload: KecerdasanOptionsPayload;
};

export type KepribadianReviewItem = {
  question_id: string;
  sequence_number: number;
  selected_key: string | null;
  payload: KepribadianOptionsPayload;
};

export type KecermatanSummary = {
  ke_index: number | null;
  kt_index: number | null;
  kh_index: number | null;
  nap_contribution: number | null;
  raw_score: number | null;
};

export type KecermatanDetailItem = {
  question_id: string;
  sequence_number: number;
  shown: string[];
  selected_key: string;
  selected_symbol: string;
  correct_key: string;
  correct_symbol: string;
};

export type KecermatanColumnGroup = {
  column_index: number; // 1-10
  total: number;
  correct: number;
  wrong: KecermatanDetailItem[];
};

type Props = {
  kecerdasan: KecerdasanReviewItem[];
  kepribadian: KepribadianReviewItem[];
  kecermatan: KecermatanSummary | null;
  kecermatanDetail: KecermatanColumnGroup[];
};

function r1(v: number | null) {
  return v == null ? "—" : v.toFixed(1);
}

/*
  Kelompok butir memakai <details> bertingkat di dalam accordion sub-tes.

  Sebelumnya seluruh 100 butir dirender ke dalam satu kotak ber-max-height dan
  scroll sendiri, jadi ada scroll di dalam accordion di dalam scroll halaman.
  Sekarang tidak ada scroll bersarang sama sekali: butir yang salah terbuka
  duluan karena itu yang dicari peserta, sisanya menunggu dibuka.
*/
function ItemGroup({
  label,
  count,
  tone,
  defaultOpen = false,
  children,
}: {
  label: string;
  count: number;
  tone: "success" | "danger" | "neutral";
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <details open={defaultOpen} className="group/items">
      <summary className="flex min-h-11 list-none items-center gap-2.5 rounded-md px-1 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
        <ChevronDown className="size-4 shrink-0 text-faint-foreground transition-transform duration-200 ease-out group-open/items:rotate-180" />
        {label}
        <Badge tone={tone}>{count}</Badge>
      </summary>
      <div className="space-y-2.5 pb-2 pt-2">{children}</div>
    </details>
  );
}

function KecerdasanItem({ item }: { item: KecerdasanReviewItem }) {
  const skipped = item.selected_key === null;
  const shell = skipped
    ? "border-border bg-card"
    : item.is_correct
      ? "border-success/40 bg-success-soft"
      : "border-destructive/40 bg-destructive-soft";

  return (
    <article className={`space-y-2.5 rounded-md border p-4 text-sm ${shell}`}>
      <div className="flex items-center justify-between gap-2">
        <h4 className="tnum text-xs font-semibold text-muted-foreground">
          Butir {item.sequence_number}
        </h4>
        {skipped ? (
          <Badge tone="neutral">Dilewati</Badge>
        ) : item.is_correct ? (
          <Badge tone="success">
            <Check className="size-3.5" strokeWidth={3} />
            Benar
          </Badge>
        ) : (
          <Badge tone="danger">
            <Close className="size-3.5" strokeWidth={3} />
            Salah
          </Badge>
        )}
      </div>

      {item.payload.instruksi && (
        <p className="text-xs font-medium text-muted-foreground">{item.payload.instruksi}</p>
      )}
      {item.payload.question_text && (
        <p className="max-w-[68ch] leading-relaxed text-foreground">{item.payload.question_text}</p>
      )}
      {item.payload.svg_content && (
        <div
          className="overflow-x-auto rounded-md border border-border bg-card p-2"
          dangerouslySetInnerHTML={{ __html: item.payload.svg_content }}
        />
      )}

      <dl className="flex flex-wrap gap-x-6 gap-y-1 border-t border-border/70 pt-2.5 text-xs">
        <div className="flex gap-1.5">
          <dt className="text-muted-foreground">Jawaban Anda</dt>
          <dd
            className={`font-bold ${
              skipped ? "text-muted-foreground" : item.is_correct ? "text-success" : "text-destructive"
            }`}
          >
            {item.selected_key ?? "—"}
          </dd>
        </div>
        {!item.is_correct && (
          <div className="flex gap-1.5">
            <dt className="text-muted-foreground">Kunci</dt>
            <dd className="font-bold text-success">{item.correct_key}</dd>
          </div>
        )}
      </dl>
    </article>
  );
}

function KecerdasanReview({ items }: { items: KecerdasanReviewItem[] }) {
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">Tidak ada jawaban tersimpan.</p>;
  }

  const sorted = [...items].sort((a, b) => a.sequence_number - b.sequence_number);
  const wrong = sorted.filter((i) => i.selected_key !== null && !i.is_correct);
  const skipped = sorted.filter((i) => i.selected_key === null);
  const correct = sorted.filter((i) => i.is_correct);
  const pct = Math.round((correct.length / sorted.length) * 100);

  return (
    <div className="space-y-4">
      <div className="inset-panel px-4 py-3">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-semibold text-foreground">Ketepatan</p>
          <p className="tnum text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{correct.length}</span>/{sorted.length}{" "}
            benar · {pct}%
          </p>
        </div>
        <Meter
          value={correct.length}
          max={sorted.length}
          tone={pct >= 70 ? "success" : pct >= 50 ? "accent" : "danger"}
          className="mt-2.5"
          label={`${pct} persen butir dijawab benar`}
        />
      </div>

      <div className="divide-y divide-border">
        <ItemGroup label="Perlu ditinjau" count={wrong.length} tone="danger" defaultOpen>
          {wrong.map((item) => (
            <KecerdasanItem key={item.question_id} item={item} />
          ))}
        </ItemGroup>
        <ItemGroup label="Dilewati" count={skipped.length} tone="neutral">
          {skipped.map((item) => (
            <KecerdasanItem key={item.question_id} item={item} />
          ))}
        </ItemGroup>
        <ItemGroup label="Sudah benar" count={correct.length} tone="success">
          {correct.map((item) => (
            <KecerdasanItem key={item.question_id} item={item} />
          ))}
        </ItemGroup>
      </div>
    </div>
  );
}

function KepribadianReview({ items }: { items: KepribadianReviewItem[] }) {
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">Tidak ada jawaban tersimpan.</p>;
  }

  const sorted = [...items].sort((a, b) => a.sequence_number - b.sequence_number);
  const answered = sorted.filter((i) => i.selected_key).length;

  return (
    <div className="space-y-4">
      <div className="inset-panel px-4 py-3">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-semibold text-foreground">Kelengkapan</p>
          <p className="tnum text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{answered}</span>/{sorted.length}{" "}
            pernyataan
          </p>
        </div>
        <Meter
          value={answered}
          max={sorted.length}
          tone="primary"
          className="mt-2.5"
          label={`${answered} dari ${sorted.length} pernyataan dijawab`}
        />
        <p className="mt-2.5 text-xs text-muted-foreground">
          Skala kepribadian tidak punya jawaban benar atau salah — yang dinilai adalah pola
          jawaban terhadap tiap aspek.
        </p>
      </div>

      <ul className="divide-y divide-border">
        {sorted.map((item) => {
          const choiceText = item.payload.choices?.find((c) => c.key === item.selected_key)?.text;
          return (
            <li key={item.question_id} className="flex flex-wrap gap-x-4 gap-y-1 py-3 text-sm">
              <span className="tnum w-8 shrink-0 text-xs text-muted-foreground">
                {item.sequence_number}
              </span>
              <p className="min-w-0 flex-1 leading-relaxed text-foreground">
                {item.payload.statement}
              </p>
              <span className="shrink-0">
                {item.selected_key ? (
                  <Badge tone="info">{choiceText ?? item.selected_key}</Badge>
                ) : (
                  <Badge tone="neutral">Dilewati</Badge>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function KecermatanReview({ summary }: { summary: KecermatanSummary }) {
  const indices = [
    {
      label: "Kecepatan (Ke)",
      value: summary.ke_index,
      note: "Berapa banyak butir sempat diklik dari 500.",
    },
    {
      label: "Ketelitian (Kt)",
      value: summary.kt_index,
      note: "Berapa persen dari klik itu yang benar.",
    },
    {
      label: "Ketahanan (Kh)",
      value: summary.kh_index,
      note: "Seberapa stabil hasilnya dari kolom I ke X.",
    },
  ];

  return (
    <div className="space-y-3">
      <dl className="surface-card flex flex-col divide-y divide-border sm:flex-row sm:divide-x sm:divide-y-0">
        {indices.map((s) => (
          <div key={s.label} className="flex-1 px-4 py-3.5">
            <dt className="text-xs font-medium text-muted-foreground">{s.label}</dt>
            <dd className="tnum font-heading mt-1 text-2xl text-foreground">{r1(s.value)}</dd>
            <p className="mt-1 text-xs text-muted-foreground">{s.note}</p>
          </div>
        ))}
      </dl>

      <dl className="inset-panel space-y-1.5 px-4 py-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Skor murni</dt>
          <dd className="tnum font-semibold text-foreground">{r1(summary.raw_score)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Kontribusi ke NAP</dt>
          <dd className="tnum font-semibold text-foreground">
            {r1(summary.nap_contribution)} <span className="text-muted-foreground">/ 20</span>
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function KecermatanDetailReview({ groups }: { groups: KecermatanColumnGroup[] }) {
  const totalWrong = groups.reduce((s, g) => s + g.wrong.length, 0);

  if (!groups.length) {
    return <p className="text-sm text-muted-foreground">Belum ada jawaban tersimpan.</p>;
  }

  if (totalWrong === 0) {
    return (
      <p className="flex items-center gap-2 rounded-md border border-success/30 bg-success-soft px-4 py-3 text-sm font-medium text-success">
        <Check className="size-4" strokeWidth={3} />
        Semua jawaban yang tercatat benar.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {groups.map((g) => (
        <Accordion
          key={g.column_index}
          label={`Kolom ${ROMAN[g.column_index - 1]}`}
          summary={
            g.wrong.length === 0
              ? `${g.correct}/${g.total} benar`
              : `${g.correct}/${g.total} benar · ${g.wrong.length} salah`
          }
          trailing={
            <Badge tone={g.wrong.length === 0 ? "success" : "danger"}>
              {g.wrong.length === 0 ? "bersih" : `${g.wrong.length} salah`}
            </Badge>
          }
        >
          {g.wrong.length === 0 ? (
            <p className="text-sm text-success">Semua benar di kolom ini.</p>
          ) : (
            <ul className="space-y-2.5">
              {g.wrong.map((item) => (
                <li
                  key={item.question_id}
                  className="space-y-2.5 rounded-md border border-destructive/35 bg-destructive-soft p-4"
                >
                  <p className="tnum text-xs font-semibold text-muted-foreground">
                    Butir {item.sequence_number}
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {item.shown.map((sym, i) => (
                      <span
                        key={i}
                        className="flex h-11 items-center justify-center rounded-md border border-border bg-card text-xl"
                      >
                        {sym}
                      </span>
                    ))}
                  </div>
                  <dl className="flex flex-wrap gap-x-6 gap-y-1 border-t border-destructive/20 pt-2.5 text-xs">
                    <div className="flex gap-1.5">
                      <dt className="text-muted-foreground">Anda pilih</dt>
                      <dd className="font-bold text-destructive">
                        {item.selected_key} ({item.selected_symbol})
                      </dd>
                    </div>
                    <div className="flex gap-1.5">
                      <dt className="text-muted-foreground">Kunci</dt>
                      <dd className="font-bold text-success">
                        {item.correct_key} ({item.correct_symbol})
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          )}
        </Accordion>
      ))}
    </div>
  );
}

export default function PembahasanSection({
  kecerdasan,
  kepribadian,
  kecermatan,
  kecermatanDetail,
}: Props) {
  const ksCorrect = kecerdasan.filter((i) => i.is_correct).length;
  const kpAnswered = kepribadian.filter((i) => i.selected_key).length;

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-foreground">Pembahasan per sub-tes</h2>

      <Accordion
        label="Kecerdasan Umum"
        summary={kecerdasan.length ? `${ksCorrect}/${kecerdasan.length} benar` : "Tidak ada data"}
      >
        <KecerdasanReview items={kecerdasan} />
      </Accordion>

      <Accordion
        label="Kepribadian"
        summary={
          kepribadian.length ? `${kpAnswered}/${kepribadian.length} dijawab` : "Tidak ada data"
        }
      >
        <KepribadianReview items={kepribadian} />
      </Accordion>

      <Accordion
        label="Kecermatan"
        summary={
          kecermatan
            ? `Ke ${r1(kecermatan.ke_index)} · Kt ${r1(kecermatan.kt_index)} · Kh ${r1(kecermatan.kh_index)}`
            : "Tidak ada data"
        }
      >
        {kecermatan ? (
          <div className="space-y-5">
            <KecermatanReview summary={kecermatan} />
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Butir yang salah per kolom</h3>
              <KecermatanDetailReview groups={kecermatanDetail} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Data kecermatan belum tersedia.</p>
        )}
      </Accordion>
    </section>
  );
}
