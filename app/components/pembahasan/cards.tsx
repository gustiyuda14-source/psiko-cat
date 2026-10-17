import QuestionPassage from "@/app/components/QuestionPassage";
import { KECERMATAN_KEYS, KecermatanKeyStrip, KecermatanSymbol } from "@/app/components/KecermatanKeyStrip";
import { Badge } from "@/app/components/ui";
import { Check, Close } from "@/app/components/icons";
import type {
  KecerdasanReviewItem,
  KecermatanDetailItem,
  KepribadianReviewItem,
} from "@/app/components/PembahasanSection";
import type { PribadiReviewItem } from "@/app/components/PribadiReview";
import { MathText } from "@/app/components/MathText";
import type { Bahas, BahasItem } from "@/lib/keswa-pembahasan";
import type { CekBaris } from "@/lib/keswa-teks";

/** Satu cek validitas Keswa, sudah diturunkan di server untuk percobaan ini (tanpa daftar kunci). */
export type KeswaCekData = Bahas & CekBaris;

/*
  Isi kartu soal + kartu pembahasan untuk satu nomor, per jenis butir.
  Dipakai PembahasanNavigator; tidak punya state sendiri.
*/

export type CardData =
  | { kind: "ks"; item: KecerdasanReviewItem }
  | { kind: "kp"; item: KepribadianReviewItem }
  | { kind: "pribadi"; item: PribadiReviewItem; no: number; close: boolean }
  | { kind: "kc"; item: KecermatanDetailItem; kolom: string }
  | { kind: "keswa"; cek: KeswaCekData; item?: BahasItem };

export type CardView = {
  title: string;
  badges?: React.ReactNode;
  status: React.ReactNode;
  /** false = skala tanpa kunci (Kepribadian simulasi), toggle sembunyikan kunci tidak tampil. */
  hasKey: boolean;
  soal: React.ReactNode;
  pembahasan: React.ReactNode;
};

type Tone = "key" | "bad" | "mid" | "pick" | null;

const ROW: Record<Exclude<Tone, null> | "none", { box: string; dot: string; tag: string }> = {
  key: { box: "border-success/50 bg-success-soft", dot: "bg-success text-white", tag: "text-success" },
  bad: { box: "border-destructive/50 bg-destructive-soft", dot: "bg-destructive text-white", tag: "text-destructive" },
  mid: { box: "border-accent-ink/40 bg-accent-soft", dot: "bg-accent-ink text-on-accent-ink", tag: "text-accent-ink" },
  pick: { box: "border-primary/40 bg-primary/10", dot: "bg-primary text-primary-foreground", tag: "text-brand-ink" },
  none: { box: "border-border bg-card", dot: "bg-surface-inset text-muted-foreground", tag: "" },
};

type Row = { k: string; text: React.ReactNode; tone: Tone; tag?: string };

function Choices({ rows }: { rows: Row[] }) {
  return (
    <ul className="space-y-2">
      {rows.map((r) => {
        const s = ROW[r.tone ?? "none"];
        return (
          <li key={r.k} className={`flex items-start gap-3 rounded-md border px-3.5 py-2.5 ${s.box}`}>
            <span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${s.dot}`}>{r.k}</span>
            <span className="min-w-0 flex-1 self-center leading-relaxed text-foreground">{r.text}</span>
            {r.tag && <span className={`shrink-0 self-center text-xs font-semibold ${s.tag}`}>{r.tag}</span>}
          </li>
        );
      })}
    </ul>
  );
}

/** Warna satu pilihan: kunci hijau, pilihan peserta yang bukan kunci merah (atau emas bila mendekati). */
function row(k: string, text: React.ReactNode, isKey: boolean, picked: boolean, reveal: boolean, miss: Tone = "bad"): Row {
  if (reveal && isKey) return { k, text, tone: "key", tag: picked ? "Jawaban kamu · Kunci" : "Kunci" };
  if (picked) return { k, text, tone: reveal ? miss : "pick", tag: "Jawaban kamu" };
  return { k, text, tone: null };
}

function AnswerLine({ items }: { items: [string, React.ReactNode, string?][] }) {
  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
      {items.map(([label, value, cls]) => (
        <div key={label} className="flex gap-1.5">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className={`font-bold ${cls ?? "text-foreground"}`}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

const ok = (
  <Badge tone="success">
    <Check className="size-3.5" strokeWidth={3} />
    Benar
  </Badge>
);
const bad = (
  <Badge tone="danger">
    <Close className="size-3.5" strokeWidth={3} />
    Salah
  </Badge>
);
const skipped = <Badge tone="neutral">Dilewati</Badge>;

function kecerdasan(item: KecerdasanReviewItem, reveal: boolean): CardView {
  const p = item.payload;
  return {
    title: `Soal nomor ${item.sequence_number}`,
    status: item.selected_key === null ? skipped : item.is_correct ? ok : bad,
    hasKey: true,
    soal: (
      <>
        {p.instruksi && <p className="text-sm font-medium text-muted-foreground"><MathText text={p.instruksi} /></p>}
        {p.sub_text && (
          <details>
            <summary className="cursor-pointer text-sm font-semibold text-muted-foreground hover:text-foreground">Lihat bacaan</summary>
            <div className="mt-2">
              <QuestionPassage text={p.sub_text} compact />
            </div>
          </details>
        )}
        {p.question_text && <p className="max-w-[72ch] whitespace-pre-line leading-relaxed text-foreground"><MathText text={p.question_text} /></p>}
        {p.svg_content && (
          <div className="overflow-x-auto rounded-md border border-border bg-white p-2" dangerouslySetInnerHTML={{ __html: p.svg_content }} />
        )}
        {/* Kunci dua jawaban berbentuk "AC". Pilihan butir gambar ada di dalam SVG; teksnya cuma huruf, jadi tidak diulang. */}
        <Choices
          rows={(p.choices ?? []).map((c) =>
            row(
              c.key,
              c.text && c.text.trim().toUpperCase() !== c.key ? <MathText text={c.text} /> : null,
              item.correct_key.includes(c.key),
              item.selected_key?.includes(c.key) ?? false,
              reveal
            )
          )}
        />
      </>
    ),
    pembahasan: (
      <>
        <AnswerLine
          items={[
            ["Jawaban kamu", item.selected_key ?? "Dilewati"],
            ["Kunci", item.correct_key, "text-success"],
          ]}
        />
        {/* SVG pembahasan dibuat generator sendiri (dicek tanpa script/href luar), sama seperti svg_content soal. */}
        {item.pembahasan_svg && (
          <figure>
            <div className="overflow-x-auto rounded-md border border-border bg-white p-2" dangerouslySetInnerHTML={{ __html: item.pembahasan_svg }} />
            <figcaption className="mt-1 text-center text-xs text-muted-foreground">Gambar pembahasan</figcaption>
          </figure>
        )}
        {item.pembahasan ? (
          <p className="max-w-[72ch] whitespace-pre-line leading-relaxed text-foreground"><MathText text={item.pembahasan} /></p>
        ) : (
          <p className="text-sm text-muted-foreground">Pembahasan belum tersedia untuk butir ini.</p>
        )}
      </>
    ),
  };
}

function kepribadianLama(item: KepribadianReviewItem): CardView {
  return {
    title: `Pernyataan ${item.sequence_number}`,
    badges: item.payload.aspect && <Badge tone="info">{item.payload.aspect}</Badge>,
    status: item.selected_key ? <Badge tone="info">Dijawab</Badge> : skipped,
    hasKey: false,
    soal: (
      <>
        <p className="max-w-[72ch] leading-relaxed text-foreground">{item.payload.statement}</p>
        <Choices rows={item.payload.choices.map((c) => row(c.key, c.text, false, c.key === item.selected_key, false))} />
      </>
    ),
    pembahasan: (
      <p className="max-w-[72ch] text-sm leading-relaxed text-muted-foreground">
        Skala kepribadian tidak punya jawaban benar atau salah. Yang dinilai adalah pola jawaban terhadap tiap aspek.
      </p>
    ),
  };
}

function pribadi(item: PribadiReviewItem, no: number, close: boolean, reveal: boolean): CardView {
  const text = (key: string | null) => (key ? item.payload.choices.find((c) => c.key === key)?.text ?? key : null);
  const full = item.skor === item.max;
  const rows = item.payload.choices.map((c) =>
    row(c.key, c.text, c.key === item.ideal, c.key === item.selected_key, reveal, close ? "mid" : "bad")
  );
  const answer = (
    <AnswerLine
      items={[
        ["Jawaban kamu", text(item.selected_key) ?? "Dilewati", full ? "text-success" : undefined],
        ["Kunci", text(item.ideal), "text-success"],
        ["Skor", `${item.skor}/${item.max}`],
      ]}
    />
  );
  const status = item.selected_key === null ? skipped : <Badge tone={full ? "success" : close ? "accent" : "danger"}>Skor {item.skor}/{item.max}</Badge>;

  if (item.subtes === "KP") {
    const p = item.pembahasan;
    return {
      title: `Pernyataan ${no}`,
      badges: <Badge tone="info">{item.aspect}</Badge>,
      status,
      hasKey: true,
      soal: (
        <>
          <p className="max-w-[72ch] leading-relaxed text-foreground">{item.payload.statement}</p>
          <Choices rows={rows} />
        </>
      ),
      pembahasan: (
        <>
          {answer}
          <ol className="max-w-[72ch] space-y-1.5 border-l-2 border-accent/50 pl-4 text-sm leading-relaxed text-muted-foreground">
            <li>
              <b className="text-foreground">Aspek:</b> {item.aspect} — {p.definisi_aspek}
            </li>
            {p.bedah && (
              <li>
                <b className="text-foreground">Bedah kalimat:</b> X = {p.bedah.sisi_x} · Y = {p.bedah.sisi_y} · pembanding “{p.bedah.pembanding}”
                {p.bedah.pembalik && " (membalik arah: setuju berarti memihak Y)"}
              </li>
            )}
            <li>
              <b className="text-foreground">{p.bedah ? `Sisi aspek: ${p.bedah.sisi_aspek.toUpperCase()}.` : "Alasan:"}</b> {p.alasan}
            </li>
            <li>
              <b className="text-foreground">Kunci:</b> {text(item.ideal)} ({item.ideal})
            </li>
            {p.catatan_psikologi && (
              <li>
                <b className="text-foreground">Catatan psikologi:</b> {p.catatan_psikologi}
              </li>
            )}
          </ol>
          <p className="text-xs text-muted-foreground">Skor menunjukkan kesesuaian dengan kunci latihan, bukan penilaian kepribadian kamu.</p>
        </>
      ),
    };
  }
  return {
    title: `Butir ${no}`,
    badges: (
      <>
        {item.payload.aspect && <Badge tone="info">{item.payload.aspect}</Badge>}
        <Badge tone="neutral">{item.dimensi}</Badge>
      </>
    ),
    status,
    hasKey: true,
    soal: (
      <>
        <p className="max-w-[72ch] leading-relaxed text-foreground">{item.payload.statement}</p>
        <Choices rows={rows} />
      </>
    ),
    pembahasan: (
      <>
        {answer}
        <p className="max-w-[72ch] border-l-2 border-accent/50 pl-4 text-sm leading-relaxed text-muted-foreground">{item.pembahasan}</p>
      </>
    ),
  };
}

function kecermatan(item: KecermatanDetailItem, kolom: string, reveal: boolean): CardView {
  const sym = (k: string) => item.symbol_map[k as keyof typeof item.symbol_map] ?? "?";
  return {
    title: `Kolom ${kolom} · butir ${item.sequence_number}`,
    status: item.is_correct ? ok : bad,
    hasKey: true,
    soal: (
      <>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent-ink">Kunci kolom {kolom}</p>
        <div className="max-w-sm">
          <KecermatanKeyStrip symbolMap={item.symbol_map} />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent-ink">Yang tampil di soal</p>
        <div className="grid max-w-xs grid-cols-4 gap-2">
          {item.shown.map((s, i) => (
            <span key={i} className="flex h-12 items-center justify-center rounded-md border border-border-strong bg-card text-2xl">
              <KecermatanSymbol symbol={s} />
            </span>
          ))}
        </div>
        <Choices
          rows={KECERMATAN_KEYS.map((k) =>
            row(k, <span className="text-xl"><KecermatanSymbol symbol={sym(k)} /></span>, k === item.correct_key, k === item.selected_key, reveal)
          )}
        />
      </>
    ),
    pembahasan: (
      <>
        <AnswerLine
          items={[
            ["Jawaban kamu", <SimbolJawaban key="jawab" k={item.selected_key} symbol={sym(item.selected_key)} />],
            ["Kunci", <SimbolJawaban key="kunci" k={item.correct_key} symbol={sym(item.correct_key)} />, "text-success"],
          ]}
        />
        <p className="max-w-[72ch] leading-relaxed text-foreground">
          Dari lima simbol kunci, yang tidak muncul di soal ada di posisi {item.correct_key}.
          {!item.is_correct && ` Simbol pilihan ${item.selected_key} sebenarnya tampil di soal.`}
        </p>
      </>
    ),
  };
}

/* Huruf + simbol sebaris. <img> default block (Tailwind preflight) memecah "C (" dan ")" ke baris berbeda. */
function SimbolJawaban({ k, symbol }: { k: string; symbol: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 align-middle">
      {k}
      <span className="inline-grid size-7 place-items-center rounded-md border border-border bg-card text-base">
        <KecermatanSymbol symbol={symbol} />
      </span>
    </span>
  );
}

// **kata** -> sorotan; dipakai untuk teks pembahasan Keswa, bukan kalimat soal.
const sorot = (t: string) => t.split(/\*\*(.+?)\*\*/).map((x, i) => (i % 2 ? <mark key={i} className="ksw-kunci">{x}</mark> : x));
const LABEL_KECIL = "text-xs font-semibold uppercase tracking-[0.08em] text-accent-ink";

/* Keswa tidak punya kunci: baris jawaban hanya ditandai "Jawaban kamu" (merah bila memicu cek), tidak pernah "Kunci". */
function keswa(cek: KeswaCekData, item?: BahasItem): CardView {
  const kosong = !!item && !item.tandai && item.butir.some((b) => b.jawab !== "Ya" && b.jawab !== "Tidak");
  return {
    title: item ? `${cek.tab} · nomor ${item.butir.map((b) => b.no).join(" & ")}` : cek.judul,
    status: kosong ? (
      <Badge tone="neutral">Tidak dijawab</Badge>
    ) : item ? (
      <Badge tone={item.tandai ? "danger" : "success"}>
        {item.tandai ? <Close className="size-3.5" strokeWidth={3} /> : <Check className="size-3.5" strokeWidth={3} />}
        {item.tandai ? "Terdeteksi" : "Wajar"}
      </Badge>
    ) : null,
    hasKey: false,
    soal: item ? (
      item.butir.map((b) => (
        <div key={b.no} className="space-y-2">
          <p className="max-w-[72ch] leading-relaxed text-foreground">
            <span className="tnum font-bold text-muted-foreground">{b.no}.</span> {b.teks}
          </p>
          <Choices
            rows={[
              ["Y", "Ya"],
              ["T", "Tidak"],
            ].map(([k, text]) => (b.jawab === text ? { k, text, tone: item.tandai ? "bad" : "pick", tag: "Jawaban kamu" } : { k, text, tone: null }))}
          />
        </div>
      ))
    ) : (
      <p className="text-sm text-muted-foreground">Tidak ada butir di cek ini.</p>
    ),
    pembahasan: (
      <>
        {item && (
          <>
            <AnswerLine
              items={[
                ["Jawaban kamu", item.butir.map((b) => b.jawab).join(" · ")],
                kosong
                  ? ["Status", "Tidak dihitung"]
                  : ["Status", item.tandai ? "Terdeteksi" : "Wajar", item.tandai ? "text-destructive" : "text-success"],
              ]}
            />
            <p className="max-w-[72ch] leading-relaxed text-foreground">{sorot(item.catatan)}</p>
            <p className="max-w-[72ch] text-sm leading-relaxed text-muted-foreground">
              Di Keswa tidak ada jawaban benar atau salah. Status di atas hanya menunjukkan apakah jawaban ini ikut membuat
              cek tidak lolos.
            </p>
          </>
        )}
        <div className={`max-w-[72ch] space-y-1.5 text-sm leading-relaxed text-foreground ${item ? "border-t border-border pt-3" : ""}`}>
          <p className="flex flex-wrap items-center gap-2">
            <b className="font-heading">Cek {cek.judul}</b>
            <Badge tone={cek.lolos ? "success" : "danger"}>{cek.lolos ? "Lolos" : "Tidak lolos"}</Badge>
            <span className="tnum text-muted-foreground">{cek.angka}</span>
          </p>
          <p>{cek.arti}</p>
          <p className="text-muted-foreground">{cek.ringkas}</p>
          <p className={`${LABEL_KECIL} pt-2`}>Apa yang diukur</p>
          <p>{sorot(cek.diukur)}</p>
          <p className={`${LABEL_KECIL} pt-2`}>Kenapa jawabanmu terdeteksi</p>
          <p>{sorot(cek.alasan)}</p>
          {cek.nomor && <p className="tnum break-words text-muted-foreground">Nomor: {cek.nomor}</p>}
          <p className={`${LABEL_KECIL} pt-2`}>Analogi</p>
          <blockquote className="border-l-2 border-accent/50 pl-4 italic">{sorot(cek.analogi)}</blockquote>
          <p className={`${LABEL_KECIL} pt-2`}>Saran perbaikan</p>
          <ul className="list-disc space-y-1 pl-5">
            {cek.saran.map((x) => (
              <li key={x}>{sorot(x)}</li>
            ))}
          </ul>
        </div>
      </>
    ),
  };
}

export function cardView(card: CardData, reveal: boolean): CardView {
  switch (card.kind) {
    case "ks":
      return kecerdasan(card.item, reveal);
    case "kp":
      return kepribadianLama(card.item);
    case "pribadi":
      return pribadi(card.item, card.no, card.close, reveal);
    case "kc":
      return kecermatan(card.item, card.kolom, reveal);
    case "keswa":
      return keswa(card.cek, card.item);
  }
}
