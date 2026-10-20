import type { KepribadianOptionsPayload } from "@/lib/types/safe-question";
import type { AspekSubtes } from "@/lib/scoring/psikogram";
import { AspekSubtesSection } from "@/app/test/[sessionId]/result/PsikogramSection";
import PembahasanNavigator from "@/app/components/pembahasan/PembahasanNavigator";

/*
  Hasil + pembahasan latihan PRIBADI (Kepribadian + Integritas & Kejujuran, pedoman SPCP 6.a.2 dan 6.b).
  Kepribadian (Likert dan SJT) dinilai versi psikogram: kategori B/CB/C/K/KS per aspek, sama dengan
  mini tryout di menu tes (lib/scoring/psikogram-sesi.ts psikogramPribadi). Pass Hand / Integritas tidak
  punya aspek di tabel psikogram, jadi tampil sebagai persentase sesuai kunci.
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

type SjtPembahasan = { definisi_aspek: string; opsi: Record<string, string>; tips: string };

export type PribadiReviewItem = {
  question_id: string;
  selected_key: string | null;
  skor: number;
  max: number;
  ideal: string;
  payload: KepribadianOptionsPayload;
} & (
  | { subtes: "KP"; aspect: string; polarity: "favorable" | "unfavorable"; pembahasan: KpPembahasan }
  | { subtes: "SJT"; aspect: string; bobot: Record<string, number>; pembahasan: SjtPembahasan }
  | { subtes: "SK"; dimensi: string; pembahasan: string }
);

export type PribadiReviewSummary = {
  kp: { nilai: number; butir: number; aspek: { aspek: string; nilai: number; butir: number }[] } | null;
  sk: { nilai: number; benar: number; butir: number } | null;
  pribadi: number;
  /** Kategori psikogram per aspek Kepribadian; kosong untuk respons lama tanpa field ini. */
  psikogram?: AspekSubtes[];
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
      {summary.psikogram && summary.psikogram.length > 0 && <AspekSubtesSection subtes="Kepribadian" aspek={summary.psikogram} />}
      {summary.sk && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Score
            label="Pass Hand · Integritas & Kejujuran"
            value={summary.sk.nilai}
            note={`${summary.sk.benar}/${summary.sk.butir} sesuai kunci latihan D'AJIKS (skala 0–100)`}
          />
          <p className="inset-panel px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            Integritas & Kejujuran tidak punya baris sendiri di tabel psikogram, jadi dinilai terpisah dari kategori aspek
            Kepribadian di atas.
          </p>
        </div>
      )}

      <PembahasanNavigator pribadi={items} />
    </div>
  );
}
