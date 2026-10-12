import PembahasanNavigator from "@/app/components/pembahasan/PembahasanNavigator";
import type {
  KecerdasanOptionsPayload,
  KecermatanOptionsPayload,
  KepribadianOptionsPayload,
} from "@/lib/types/safe-question";

export type KecerdasanReviewItem = {
  question_id: string;
  sequence_number: number;
  selected_key: string | null;
  correct_key: string;
  is_correct: boolean;
  pembahasan?: string | null;
  pembahasan_svg?: string | null;
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
  symbol_map: KecermatanOptionsPayload["symbol_map"];
  selected_key: string;
  correct_key: string;
  is_correct: boolean;
};

export type KecermatanColumnGroup = {
  column_index: number; // 1-10
  total: number;
  correct: number;
  /** Semua butir yang dijawab di kolom ini, benar maupun salah. */
  items: KecermatanDetailItem[];
};

type Props = {
  kecerdasan: KecerdasanReviewItem[];
  kepribadian: KepribadianReviewItem[];
  kecermatan: KecermatanSummary | null;
  kecermatanDetail: KecermatanColumnGroup[];
};

/** Pembahasan latihan Kecerdasan (layar selesai + pembahasan tersimpan). */
export function KecerdasanReview({ items }: { items: KecerdasanReviewItem[] }) {
  return <PembahasanNavigator kecerdasan={items} />;
}

/** Pembahasan simulasi: tiga sub-tes dalam satu navigator (halaman hasil + Ruang Review). */
export default function PembahasanSection({ kecerdasan, kepribadian, kecermatan, kecermatanDetail }: Props) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-foreground">Pembahasan per sub-tes</h2>
      <PembahasanNavigator
        kecerdasan={kecerdasan}
        kepribadian={kepribadian}
        kecermatan={{ summary: kecermatan, groups: kecermatanDetail }}
      />
    </section>
  );
}
