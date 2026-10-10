/**
 * SERVER-SIDE ONLY — jangan import file ini di komponen atau client code.
 * Penilaian latihan PRIBADI (docs/pedoman/PEDOMAN_ENGINE_PRIBADI.md §5).
 *
 *   KP (Likert 4): favorable A1 B2 C3 D4, unfavorable dibalik, kosong 0.
 *      Nilai KP / aspek = Σ skor / (4 × jumlah butir) × 100
 *   SK (pilihan paksa): sesuai kunci 1, lainnya 0. Nilai SK = benar / butir × 100
 *   Nilai PRIBADI = (Nilai KP + Nilai SK) / 2 — kalau salah satu tidak ada di
 *   paket, pakai yang ada saja.
 */

export type KpPembahasan = {
  definisi_aspek: string;
  // Kosong untuk pernyataan langsung ("Saya …") yang tidak punya dua sisi.
  bedah?: { sisi_x: string; sisi_y: string; pembanding: string; pembalik: boolean; sisi_aspek: "x" | "y" };
  alasan: string;
  catatan_psikologi?: string | null;
};

export type PribadiKpRule = {
  type: "likert4";
  aspect: string;
  polarity: "favorable" | "unfavorable";
  pembahasan: KpPembahasan;
};

export type PribadiSkRule = {
  type: "forced_choice";
  dimensi: string;
  correct_key: "A" | "B";
  pembahasan: string;
};

export type PribadiRule = PribadiKpRule | PribadiSkRule;

const FAV: Record<string, number> = { A: 1, B: 2, C: 3, D: 4 };

export function itemScore(rule: PribadiRule, selected: string | null): { skor: number; max: number; ideal: string } {
  if (rule.type === "forced_choice") {
    return { skor: selected === rule.correct_key ? 1 : 0, max: 1, ideal: rule.correct_key };
  }
  const base = selected ? FAV[selected] ?? 0 : 0;
  const skor = base && rule.polarity === "unfavorable" ? 5 - base : base;
  return { skor, max: 4, ideal: rule.polarity === "favorable" ? "D" : "A" };
}

const pct = (skor: number, max: number) => (max ? Math.round((skor / max) * 1000) / 10 : 0);

export type PribadiSummary = {
  kp: { nilai: number; butir: number; aspek: { aspek: string; nilai: number; butir: number }[] } | null;
  sk: { nilai: number; benar: number; butir: number } | null;
  pribadi: number;
};

export function summarize(items: { rule: PribadiRule; selected: string | null }[]): PribadiSummary {
  let kpSkor = 0, kpMax = 0, skBenar = 0, skButir = 0;
  const aspek = new Map<string, { skor: number; max: number; butir: number }>();
  for (const { rule, selected } of items) {
    const s = itemScore(rule, selected);
    if (rule.type === "likert4") {
      kpSkor += s.skor;
      kpMax += s.max;
      const a = aspek.get(rule.aspect) ?? { skor: 0, max: 0, butir: 0 };
      aspek.set(rule.aspect, { skor: a.skor + s.skor, max: a.max + s.max, butir: a.butir + 1 });
    } else {
      skBenar += s.skor;
      skButir += 1;
    }
  }
  const kp = kpMax
    ? { nilai: pct(kpSkor, kpMax), butir: kpMax / 4, aspek: [...aspek].map(([nama, a]) => ({ aspek: nama, nilai: pct(a.skor, a.max), butir: a.butir })) }
    : null;
  const sk = skButir ? { nilai: pct(skBenar, skButir), benar: skBenar, butir: skButir } : null;
  const parts = [kp?.nilai, sk?.nilai].filter((n): n is number => n !== undefined);
  return { kp, sk, pribadi: parts.length ? Math.round((parts.reduce((a, b) => a + b, 0) / parts.length) * 10) / 10 : 0 };
}
