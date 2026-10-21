import type { KepribadianOptionsPayload } from "@/lib/types/safe-question";
import type { AspekSubtes } from "@/lib/scoring/psikogram";
import type { KonsistensiBaris, PasanganStatus } from "@/lib/scoring/pribadi";
import { AspekSubtesSection } from "@/app/test/[sessionId]/result/PsikogramSection";
import PembahasanNavigator from "@/app/components/pembahasan/PembahasanNavigator";
import { KonsistensiTabel } from "@/app/components/KonsistensiTabel";

/*
  Hasil + pembahasan latihan PRIBADI (Kepribadian + Integritas & Kejujuran, pedoman SPCP 6.a.2 dan 6.b).
  Kepribadian (Likert dan SJT) dinilai versi psikogram: kategori B/CB/C/K/KS per aspek, sama dengan
  mini tryout di menu tes (lib/scoring/psikogram-sesi.ts psikogramPribadi). Pass Hand / Integritas tidak
  punya aspek di tabel psikogram, jadi tampil sebagai persentase sesuai kunci.
  Format Ya/Tidak: butir aspek masuk psikogram, butir Validitas tampil terpisah, dan pasangan pernyataan
  serupa dirangkum di tabel konsistensi (juga butir kembar Pass Hand).
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

type YtPembahasan = { definisi_aspek: string; alasan: string; jika_sebaliknya: string; tips: string };

export type PribadiReviewItem = {
  question_id: string;
  selected_key: string | null;
  skor: number;
  max: number;
  ideal: string;
  payload: KepribadianOptionsPayload;
  /** Pasangan konsistensi di paket ini (Ya/Tidak, Pass Hand kembar); null bila tidak berpasangan. */
  pasangan?: PasanganStatus | null;
} & (
  | { subtes: "KP"; aspect: string; polarity: "favorable" | "unfavorable"; pembahasan: KpPembahasan }
  | { subtes: "SJT"; aspect: string; bobot: Record<string, number>; pembahasan: SjtPembahasan }
  | { subtes: "SK"; dimensi: string; pembahasan: string }
  | { subtes: "YT"; aspect: string; validitas: boolean; pembahasan: YtPembahasan }
);

export type PribadiReviewSummary = {
  kp: { nilai: number; butir: number; aspek: { aspek: string; nilai: number; butir: number }[] } | null;
  sk: { nilai: number; benar: number; butir: number } | null;
  /** Butir Validitas Ya/Tidak; kosong untuk respons lama dan paket tanpa butir validitas. */
  validitas?: { sesuai: number; butir: number; perhatian: boolean } | null;
  konsistensi?: KonsistensiBaris[];
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
  const choiceText = (no: number, key: string) => items[no - 1]?.payload.choices.find((c) => c.key === key)?.text ?? key;
  return (
    <div className="space-y-4">
      {summary.psikogram && summary.psikogram.length > 0 && <AspekSubtesSection subtes="Kepribadian" aspek={summary.psikogram} />}
      {summary.validitas && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Score
            label="Validitas jawaban"
            value={summary.validitas.sesuai}
            note={`dari ${summary.validitas.butir} butir dijawab realistis${summary.validitas.perhatian ? " · perlu perhatian" : ""}`}
          />
          <p
            className={`inset-panel px-4 py-3 text-xs leading-relaxed ${summary.validitas.perhatian ? "text-accent-ink" : "text-muted-foreground"}`}
          >
            Butir validitas memeriksa kesan terlalu sempurna. Mengakui kekurangan wajar justru dinilai jujur.
            {summary.validitas.perhatian && " Banyak jawabanmu terlihat terlalu sempurna; di tes asli pola ini bisa membuat hasil dianggap kurang valid."}
          </p>
        </div>
      )}
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

      {summary.konsistensi && summary.konsistensi.length > 0 && <KonsistensiTabel baris={summary.konsistensi} choiceText={choiceText} />}

      <PembahasanNavigator pribadi={items} />
    </div>
  );
}
