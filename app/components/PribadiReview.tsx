import type { KepribadianOptionsPayload } from "@/lib/types/safe-question";
import { Accordion, Badge, Meter } from "@/app/components/ui";

/*
  Hasil + pembahasan latihan PRIBADI (Kepribadian + Substansi Khusus).
  Format pembahasan KP mengikuti pedoman §7.4: aspek → bedah kalimat → sisi
  yang mencerminkan aspek → kunci → catatan psikologi. Nilai dilabeli
  "kesesuaian dengan kunci latihan", bukan "kepribadian Anda" (pedoman §8).
*/

type KpPembahasan = {
  definisi_aspek: string;
  bedah?: { sisi_x: string; sisi_y: string; pembanding: string; pembalik: boolean; sisi_aspek: "x" | "y" };
  alasan: string;
  catatan_psikologi?: string | null;
};

export type PribadiReviewItem = {
  question_id: string;
  selected_key: string | null;
  skor: number;
  max: number;
  ideal: string;
  payload: KepribadianOptionsPayload;
} & (
  | { subtes: "KP"; aspect: string; polarity: "favorable" | "unfavorable"; pembahasan: KpPembahasan }
  | { subtes: "SK"; dimensi: string; pembahasan: string }
);

export type PribadiReviewSummary = {
  kp: { nilai: number; butir: number; aspek: { aspek: string; nilai: number; butir: number }[] } | null;
  sk: { nilai: number; benar: number; butir: number } | null;
  pribadi: number;
};

const choiceText = (p: KepribadianOptionsPayload, key: string | null) =>
  key ? p.choices.find((c) => c.key === key)?.text ?? key : null;

function Score({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div className="inset-panel px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="tnum font-heading text-2xl text-foreground">{value}</p>
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

function Answer({ item }: { item: PribadiReviewItem }) {
  const full = item.skor === item.max;
  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
      <div className="flex gap-1.5">
        <dt className="text-muted-foreground">Jawaban Anda</dt>
        <dd className={`font-bold ${full ? "text-success" : "text-foreground"}`}>
          {choiceText(item.payload, item.selected_key) ?? "Dilewati"}
        </dd>
      </div>
      <div className="flex gap-1.5">
        <dt className="text-muted-foreground">Kunci</dt>
        <dd className="font-bold text-success">{choiceText(item.payload, item.ideal)}</dd>
      </div>
      <div className="flex gap-1.5">
        <dt className="text-muted-foreground">Skor</dt>
        <dd className="tnum font-bold text-foreground">
          {item.skor}/{item.max}
        </dd>
      </div>
    </dl>
  );
}

function KpItem({ item, no }: { item: Extract<PribadiReviewItem, { subtes: "KP" }>; no: number }) {
  const { pembahasan: p } = item;
  return (
    <li className="space-y-3 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="tnum text-xs text-muted-foreground">{no}</span>
        <Badge tone="info">{item.aspect}</Badge>
      </div>
      <p className="leading-relaxed text-foreground">{item.payload.statement}</p>
      <Answer item={item} />
      <ol className="space-y-1.5 border-l-2 border-accent/50 pl-4 text-sm leading-relaxed text-muted-foreground">
        <li>
          <b className="text-foreground">Aspek:</b> {item.aspect} — {p.definisi_aspek}
        </li>
        {p.bedah && (
          <li>
            <b className="text-foreground">Bedah kalimat:</b> X = {p.bedah.sisi_x} · Y = {p.bedah.sisi_y} · pembanding “
            {p.bedah.pembanding}”{p.bedah.pembalik && " (membalik arah: setuju berarti memihak Y)"}
          </li>
        )}
        <li>
          <b className="text-foreground">{p.bedah ? `Sisi aspek: ${p.bedah.sisi_aspek.toUpperCase()}.` : "Alasan:"}</b> {p.alasan}
        </li>
        <li>
          <b className="text-foreground">Kunci:</b> {choiceText(item.payload, item.ideal)} ({item.ideal})
        </li>
        {p.catatan_psikologi && (
          <li>
            <b className="text-foreground">Catatan psikologi:</b> {p.catatan_psikologi}
          </li>
        )}
      </ol>
    </li>
  );
}

function SkItem({ item, no }: { item: Extract<PribadiReviewItem, { subtes: "SK" }>; no: number }) {
  return (
    <li className="space-y-3 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="tnum text-xs text-muted-foreground">{no}</span>
        <Badge tone="accent">{item.dimensi}</Badge>
      </div>
      <p className="leading-relaxed text-foreground">{item.payload.statement}</p>
      <p className="text-sm text-muted-foreground">
        {item.payload.choices.map((c) => `${c.key}. ${c.text}`).join("   ·   ")}
      </p>
      <Answer item={item} />
      <p className="border-l-2 border-accent/50 pl-4 text-sm leading-relaxed text-muted-foreground">{item.pembahasan}</p>
    </li>
  );
}

export function PribadiReview({ summary, items }: { summary: PribadiReviewSummary; items: PribadiReviewItem[] }) {
  const kp = items.filter((i): i is Extract<PribadiReviewItem, { subtes: "KP" }> => i.subtes === "KP");
  const sk = items.filter((i): i is Extract<PribadiReviewItem, { subtes: "SK" }> => i.subtes === "SK");

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <p className="text-center text-xs text-muted-foreground">Kesesuaian dengan kunci latihan D&apos;AJIKS (skala 0–100)</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Score label="Nilai PRIBADI" value={summary.pribadi} note="Rata-rata Kepribadian dan Substansi Khusus" />
          {summary.kp && <Score label="Kepribadian" value={summary.kp.nilai} note={`${summary.kp.butir} pernyataan`} />}
          {summary.sk && <Score label="Substansi Khusus" value={summary.sk.nilai} note={`${summary.sk.benar}/${summary.sk.butir} sesuai kunci`} />}
        </div>
      </div>

      {summary.kp && summary.kp.aspek.length > 0 && (
        <div className="inset-panel space-y-2.5 px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Per aspek Kepribadian</p>
          {summary.kp.aspek.map((a) => (
            <div key={a.aspek}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-foreground">{a.aspek}</span>
                <span className="tnum text-muted-foreground">{a.nilai}</span>
              </div>
              <Meter value={a.nilai} max={100} tone={a.nilai <= 40 ? "danger" : "primary"} className="mt-1" label={`${a.aspek} ${a.nilai}`} />
            </div>
          ))}
        </div>
      )}

      {kp.length > 0 && (
        <Accordion label="Pembahasan Kepribadian" summary={`${kp.length} pernyataan`}>
          <ul className="divide-y divide-border">
            {kp.map((item, i) => (
              <KpItem key={item.question_id} item={item} no={i + 1} />
            ))}
          </ul>
        </Accordion>
      )}
      {sk.length > 0 && (
        <Accordion label="Pembahasan Substansi Khusus" summary={`${sk.length} butir`}>
          <ul className="divide-y divide-border">
            {sk.map((item, i) => (
              <SkItem key={item.question_id} item={item} no={i + 1} />
            ))}
          </ul>
        </Accordion>
      )}
    </div>
  );
}
