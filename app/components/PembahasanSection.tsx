import type {
  KecerdasanOptionsPayload,
  KepribadianOptionsPayload,
} from "@/lib/types/safe-question";

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

function SubSesiDropdown({
  label,
  summary,
  children,
}: {
  label: string;
  summary?: string;
  children: React.ReactNode;
}) {
  return (
    <details className="rounded-xl border border-border bg-card overflow-hidden">
      {/* display stays default (list-item) so the browser keeps its native marker;
          the flex row lives on the inner span instead of on <summary> itself */}
      <summary className="cursor-pointer px-5 py-4 hover:bg-primary/5 transition-colors">
        <span className="inline-flex items-center gap-3 min-w-0 align-middle">
          <span className="font-semibold text-sm text-foreground">{label}</span>
          {summary && <span className="text-xs text-muted-foreground truncate">{summary}</span>}
        </span>
      </summary>
      <div className="border-t border-border px-5 py-4">
        {children}
      </div>
    </details>
  );
}

function KecerdasanReview({ items }: { items: KecerdasanReviewItem[] }) {
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">Tidak ada jawaban tersimpan.</p>;
  }

  const sorted = [...items].sort((a, b) => a.sequence_number - b.sequence_number);
  const correct = sorted.filter((i) => i.is_correct).length;
  const pct = sorted.length ? ((correct / sorted.length) * 100).toFixed(0) : "0";

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground pb-2 border-b border-border">
        {correct}/{sorted.length} benar ({pct}%)
      </p>
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
        {sorted.map((item) => (
          <div
            key={item.question_id}
            className={`rounded-xl border p-4 space-y-2 text-sm ${
              item.selected_key === null
                ? "border-border bg-card"
                : item.is_correct
                ? "border-success bg-success-soft"
                : "border-destructive/60 bg-destructive/10"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Soal {item.sequence_number}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  item.selected_key === null
                    ? "bg-border text-muted-foreground"
                    : item.is_correct
                    ? "bg-success text-white"
                    : "bg-destructive text-white"
                }`}
              >
                {item.selected_key === null ? "Dilewati" : item.is_correct ? "Benar ✓" : "Salah ✗"}
              </span>
            </div>

            {item.payload.instruksi && (
              <p className="text-xs text-primary italic">{item.payload.instruksi}</p>
            )}
            {item.payload.question_text && (
              <p className="text-foreground text-sm leading-relaxed">{item.payload.question_text}</p>
            )}
            {item.payload.svg_content && (
              <div
                className="bg-white rounded-lg p-2 overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: item.payload.svg_content }}
              />
            )}

            <div className="flex items-center gap-4 text-xs pt-1 border-t border-border">
              <span className="text-muted-foreground">
                Jawaban:{" "}
                <span
                  className={`font-bold ${
                    !item.selected_key
                      ? "text-muted-foreground"
                      : item.is_correct
                      ? "text-success"
                      : "text-destructive"
                  }`}
                >
                  {item.selected_key ?? "-"}
                </span>
              </span>
              {!item.is_correct && (
                <span className="text-muted-foreground">
                  Kunci: <span className="font-bold text-success">{item.correct_key}</span>
                </span>
              )}
            </div>
          </div>
        ))}
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
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground pb-2 border-b border-border">
        {answered}/{sorted.length} pernyataan dijawab
      </p>
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
        {sorted.map((item) => {
          const choiceText = item.payload.choices?.find((c) => c.key === item.selected_key)?.text;
          return (
            <div
              key={item.question_id}
              className="rounded-xl border border-border bg-card p-3.5 space-y-1.5 text-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground shrink-0">#{item.sequence_number}</span>
                {item.selected_key ? (
                  <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full text-right">
                    {item.selected_key}{choiceText ? ` · ${choiceText}` : ""}
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground">Dilewati</span>
                )}
              </div>
              <p className="text-foreground leading-relaxed">{item.payload.statement}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function r1(v: number | null) {
  return v == null ? "-" : v.toFixed(1);
}

function KecermatanReview({ summary }: { summary: KecermatanSummary }) {

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { label: "Ke (Kecepatan)", val: summary.ke_index, desc: "total_klik / 500 × 100" },
          { label: "Kt (Ketelitian)", val: summary.kt_index, desc: "benar / klik × 100" },
          { label: "Kh (Ketahanan)", val: summary.kh_index, desc: "konsistensi antar lajur" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 space-y-1">
            <p className="text-2xl font-bold font-mono text-foreground">{r1(s.val)}</p>
            <p className="text-xs font-semibold text-foreground">{s.label}</p>
            <p className="text-[10px] text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border px-4 py-3 text-sm space-y-1.5">
        <div className="flex justify-between text-muted-foreground">
          <span>Skor Murni</span>
          <span className="font-mono font-semibold text-foreground">{r1(summary.raw_score)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Kontribusi NAP</span>
          <span className="font-mono font-semibold text-foreground">{r1(summary.nap_contribution)} / 20</span>
        </div>
      </div>
    </div>
  );
}

export function KecermatanDetailReview({ groups }: { groups: KecermatanColumnGroup[] }) {
  const totalWrong = groups.reduce((s, g) => s + g.wrong.length, 0);

  if (!groups.length) {
    return <p className="text-sm text-muted-foreground">Belum ada jawaban tersimpan.</p>;
  }

  if (totalWrong === 0) {
    return <p className="text-sm text-success">✓ Semua jawaban yang tercatat benar.</p>;
  }

  return (
    <div className="space-y-2">
      {groups.map((g) => (
        <SubSesiDropdown
          key={g.column_index}
          label={`Lajur ${ROMAN[g.column_index - 1]}`}
          summary={g.wrong.length === 0 ? `${g.correct}/${g.total} benar` : `${g.correct}/${g.total} benar · ${g.wrong.length} salah`}
        >
          {g.wrong.length === 0 ? (
            <p className="text-sm text-success">✓ Semua benar di lajur ini.</p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {g.wrong.map((item) => (
                <div key={item.question_id} className="rounded-xl border border-destructive/60 bg-destructive/10 p-4 space-y-2.5 text-sm">
                  <span className="text-xs font-semibold text-muted-foreground">Soal {item.sequence_number}</span>
                  <div className="grid grid-cols-4 gap-2">
                    {item.shown.map((sym, i) => (
                      <div key={i} className="flex items-center justify-center h-10 bg-border rounded-lg text-lg">
                        {sym}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs pt-1 border-t border-border">
                    <span className="text-muted-foreground">
                      Kamu pilih: <span className="font-bold text-destructive">{item.selected_key} ({item.selected_symbol})</span>
                    </span>
                    <span className="text-muted-foreground">
                      Kunci: <span className="font-bold text-success">{item.correct_key} ({item.correct_symbol})</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SubSesiDropdown>
      ))}
    </div>
  );
}

export default function PembahasanSection({ kecerdasan, kepribadian, kecermatan, kecermatanDetail }: Props) {
  const ksCorrect = kecerdasan.filter((i) => i.is_correct).length;
  const kpAnswered = kepribadian.filter((i) => i.selected_key).length;

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2">
        Pembahasan Sesi
      </h2>

      <SubSesiDropdown
        label="Kecerdasan Umum"
        summary={
          kecerdasan.length
            ? `${ksCorrect}/${kecerdasan.length} benar`
            : "Tidak ada data"
        }
      >
        <KecerdasanReview items={kecerdasan} />
      </SubSesiDropdown>

      <SubSesiDropdown
        label="Kepribadian"
        summary={
          kepribadian.length
            ? `${kpAnswered}/${kepribadian.length} dijawab`
            : "Tidak ada data"
        }
      >
        <KepribadianReview items={kepribadian} />
      </SubSesiDropdown>

      <SubSesiDropdown
        label="Kecermatan"
        summary={
          kecermatan
            ? `Ke ${r1(kecermatan.ke_index)} · Kt ${r1(kecermatan.kt_index)}`
            : "Tidak ada data"
        }
      >
        {kecermatan ? (
          <div className="space-y-4">
            <KecermatanReview summary={kecermatan} />
            <div className="space-y-2 pt-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pembahasan per Lajur</p>
              <KecermatanDetailReview groups={kecermatanDetail} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Data kecermatan belum tersedia.</p>
        )}
      </SubSesiDropdown>
    </div>
  );
}
