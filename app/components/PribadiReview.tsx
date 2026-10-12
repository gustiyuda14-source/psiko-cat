import type { KepribadianOptionsPayload } from "@/lib/types/safe-question";
import { Meter } from "@/app/components/ui";
import PembahasanNavigator from "@/app/components/pembahasan/PembahasanNavigator";

/*
  Hasil + pembahasan latihan PRIBADI (Kepribadian + Integritas & Kejujuran, pedoman SPCP 6.a.2 dan 6.b).
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

function Score({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div className="inset-panel px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="tnum font-heading text-2xl text-foreground">{value}</p>
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

export function PribadiReview({ summary, items }: { summary: PribadiReviewSummary; items: PribadiReviewItem[] }) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <p className="text-center text-xs text-muted-foreground">Kesesuaian dengan kunci latihan D&apos;AJIKS (skala 0–100)</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Score label="Nilai PRIBADI" value={summary.pribadi} note="Rata-rata Kepribadian dan Integritas & Kejujuran" />
          {summary.kp && <Score label="Kepribadian" value={summary.kp.nilai} note={`${summary.kp.butir} pernyataan`} />}
          {summary.sk && <Score label="Integritas & Kejujuran" value={summary.sk.nilai} note={`${summary.sk.benar}/${summary.sk.butir} sesuai kunci`} />}
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

      <PembahasanNavigator pribadi={items} />
    </div>
  );
}
