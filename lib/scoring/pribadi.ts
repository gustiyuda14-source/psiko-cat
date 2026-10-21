/**
 * SERVER-SIDE ONLY — jangan import file ini di komponen atau client code.
 * Penilaian latihan PRIBADI (docs/pedoman/PEDOMAN_ENGINE_PRIBADI.md §5).
 *
 *   KP (Likert 4): favorable A1 B2 C3 D4, unfavorable dibalik, kosong 0.
 *      Nilai KP / aspek = Σ skor / (4 × jumlah butir) × 100
 *   KP situasional (SJT, 5 opsi): skor = bobot opsi terpilih 1–5, kosong 0; masuk
 *      Nilai KP / aspek bersama Likert, maks 5 per butir.
 *   SK (pilihan paksa): sesuai kunci 1, lainnya 0. Nilai SK = benar / butir × 100
 *   Ya/Tidak (A = Ya, B = Tidak): sesuai kunci 1, lainnya 0; butir aspek masuk Nilai KP,
 *      butir Validitas (kesan terlalu sempurna) dihitung terpisah, tidak masuk nilai.
 *   Nilai PRIBADI = (Nilai KP + Nilai SK) / 2 — kalau salah satu tidak ada di
 *   paket, pakai yang ada saja.
 */

import { round2 } from "./nap";
import { kembarSk } from "./kembar-sk";

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

export type SjtPembahasan = {
  definisi_aspek: string;
  /** Alasan bobot tiap opsi A–E. */
  opsi: Record<string, string>;
  tips: string;
};

/** Kepribadian format situasional: 5 opsi, tiap opsi berbobot 1–5 (kunci = bobot 5). */
export type PribadiSjtRule = {
  type: "sjt5";
  aspect: string;
  bobot: Record<string, number>;
  pembahasan: SjtPembahasan;
};

export type PribadiSkRule = {
  type: "forced_choice";
  dimensi: string;
  correct_key: "A" | "B";
  pembahasan: string;
};

export type YtPembahasan = { definisi_aspek: string; alasan: string; jika_sebaliknya: string; tips: string };

/** Kepribadian format pernyataan Ya/Tidak: A = Ya, B = Tidak. */
export type PribadiYtRule = {
  type: "ya_tidak";
  aspect: string;
  validitas: boolean;
  correct_key: "A" | "B";
  pembahasan: YtPembahasan;
};

export type PribadiRule = PribadiKpRule | PribadiSjtRule | PribadiSkRule | PribadiYtRule;

// Substansi Khusus = Aspek Integritas dan Kejujuran, pedoman SPCP 2026 butir 6.b (7 aspek).
// Butir bank memakai 11 dimensi aturan kunci (pedoman engine §3.1); D4 dibelah lewat `sub`.
const ASPEK_DIMENSI: Record<string, string> = {
  D1: "Integritas", D2: "Transparansi", D3: "Integritas", D5: "Kepemimpinan", D6: "Inovasi",
  D7: "Kepemimpinan", D8: "Produktivitas", D9: "Religiusitas", D10: "Produktivitas", D11: "Profesionalisme",
};

/** Aspek Integritas dan Kejujuran dari dimensi butir SK; lempar error kalau tidak terpetakan. */
export function aspekIntegritas(dimensi: string, sub?: string | null): string {
  const aspek = dimensi === "D4" ? { patuh: "Profesionalisme", inovasi: "Inovasi" }[sub ?? ""] : ASPEK_DIMENSI[dimensi];
  if (!aspek) throw new Error(`Dimensi SK tanpa aspek Integritas: ${dimensi}${sub ? `/${sub}` : ""}`);
  return aspek;
}

const FAV: Record<string, number> = { A: 1, B: 2, C: 3, D: 4 };

/** scoring_rule format PRIBADI (Likert 4, SJT, atau SK); paket lama Likert 5 = false. */
export function isPribadiRule(rule: unknown): rule is PribadiRule {
  const t = (rule as PribadiRule | null)?.type;
  return t === "likert4" || t === "sjt5" || t === "forced_choice" || t === "ya_tidak";
}

/** Field pembahasan per jenis butir untuk PribadiReviewItem (latihan, review simulasi, pembahasan tersimpan). */
export function reviewFields(rule: PribadiRule) {
  if (rule.type === "likert4") return { subtes: "KP" as const, aspect: rule.aspect, polarity: rule.polarity, pembahasan: rule.pembahasan };
  if (rule.type === "sjt5") return { subtes: "SJT" as const, aspect: rule.aspect, bobot: rule.bobot, pembahasan: rule.pembahasan };
  if (rule.type === "ya_tidak") return { subtes: "YT" as const, aspect: rule.aspect, validitas: rule.validitas, pembahasan: rule.pembahasan };
  return { subtes: "SK" as const, dimensi: rule.dimensi, pembahasan: rule.pembahasan };
}

/** Nilai sub-tes PRIBADI di simulasi (§5.3): 20% ke Nilai Akhir Psikotest, gugur bila ≤ 40. */
export function pribadiModuleScore(items: { rule: PribadiRule; selected: string | null }[]) {
  const raw_score = round2(summarize(items).pribadi);
  const nap_contribution = round2(raw_score * 0.2);
  return { poin_akumulasi: nap_contribution, raw_score, nap_contribution, is_disqualifying: raw_score <= 40 };
}

export function itemScore(rule: PribadiRule, selected: string | null): { skor: number; max: number; ideal: string } {
  if (rule.type === "forced_choice" || rule.type === "ya_tidak") {
    return { skor: selected === rule.correct_key ? 1 : 0, max: 1, ideal: rule.correct_key };
  }
  if (rule.type === "sjt5") {
    const ideal = Object.keys(rule.bobot).find((k) => rule.bobot[k] === 5) ?? "";
    return { skor: selected ? rule.bobot[selected] ?? 0 : 0, max: 5, ideal };
  }
  const base = selected ? FAV[selected] ?? 0 : 0;
  const skor = base && rule.polarity === "unfavorable" ? 5 - base : base;
  return { skor, max: 4, ideal: rule.polarity === "favorable" ? "D" : "A" };
}

const pct = (skor: number, max: number) => (max ? Math.round((skor / max) * 1000) / 10 : 0);

export type PribadiSummary = {
  kp: { nilai: number; butir: number; aspek: { aspek: string; nilai: number; butir: number }[] } | null;
  sk: { nilai: number; benar: number; butir: number } | null;
  /** Butir Validitas Ya/Tidak; perhatian = ≥ VALIDITAS_PERHATIAN butir tidak sesuai. */
  validitas: { sesuai: number; butir: number; perhatian: boolean } | null;
  pribadi: number;
};

// ponytail: ambang provisional pemilik 2026-10-21 (≥4 dari 10), ganti setelah ada data sesi.
const VALIDITAS_PERHATIAN = 4;

export function summarize(items: { rule: PribadiRule; selected: string | null }[]): PribadiSummary {
  let kpSkor = 0, kpMax = 0, kpButir = 0, skBenar = 0, skButir = 0, valSesuai = 0, valButir = 0;
  const aspek = new Map<string, { skor: number; max: number; butir: number }>();
  for (const { rule, selected } of items) {
    const s = itemScore(rule, selected);
    if (rule.type === "ya_tidak" && rule.validitas) {
      valSesuai += s.skor;
      valButir += 1;
    } else if (rule.type !== "forced_choice") {
      kpSkor += s.skor;
      kpMax += s.max;
      kpButir += 1;
      const a = aspek.get(rule.aspect) ?? { skor: 0, max: 0, butir: 0 };
      aspek.set(rule.aspect, { skor: a.skor + s.skor, max: a.max + s.max, butir: a.butir + 1 });
    } else {
      skBenar += s.skor;
      skButir += 1;
    }
  }
  const kp = kpMax
    ? { nilai: pct(kpSkor, kpMax), butir: kpButir, aspek: [...aspek].map(([nama, a]) => ({ aspek: nama, nilai: pct(a.skor, a.max), butir: a.butir })) }
    : null;
  const sk = skButir ? { nilai: pct(skBenar, skButir), benar: skBenar, butir: skButir } : null;
  const validitas = valButir ? { sesuai: valSesuai, butir: valButir, perhatian: valButir - valSesuai >= VALIDITAS_PERHATIAN } : null;
  const parts = [kp?.nilai, sk?.nilai].filter((n): n is number => n !== undefined);
  return { kp, sk, validitas, pribadi: parts.length ? Math.round((parts.reduce((a, b) => a + b, 0) / parts.length) * 10) / 10 : 0 };
}

export type KonsistensiInput = { no: number; bankId: string; pasangan: string | null; rule: PribadiRule; selected: string | null; statement: string };
type KonsistensiSisi = { no: number; statement: string; jawab: string | null };
export type KonsistensiBaris = { a: KonsistensiSisi; b: KonsistensiSisi; status: "konsisten" | "berbeda" | "kosong" };

/**
 * Pasangan pernyataan serupa (Ya/Tidak `pasangan`, Pass Hand `kembar_dengan`): konsisten bila
 * kedua jawaban sama-sama sesuai kunci atau sama-sama tidak, jadi pasangan yang arahnya dibalik
 * ikut terbaca benar. Pasangan yang kembarannya tidak ada di paket diabaikan.
 */
export function konsistensi(items: KonsistensiInput[]): KonsistensiBaris[] {
  const byId = new Map(items.map((it) => [it.bankId, it]));
  const keyOf = (r: PribadiRule) => (r.type === "ya_tidak" || r.type === "forced_choice" ? r.correct_key : null);
  const sisi = (it: KonsistensiInput): KonsistensiSisi => ({ no: it.no, statement: it.statement, jawab: it.selected });
  const out: KonsistensiBaris[] = [];
  const seen = new Set<string>();
  for (const it of items) {
    const other = it.pasangan ? byId.get(it.pasangan) : undefined;
    if (!other || other === it) continue;
    const [x, y] = it.no < other.no ? [it, other] : [other, it];
    const kx = keyOf(x.rule), ky = keyOf(y.rule);
    if (!kx || !ky || seen.has(x.bankId)) continue;
    seen.add(x.bankId);
    const status = !x.selected || !y.selected ? "kosong" : (x.selected === kx) === (y.selected === ky) ? "konsisten" : "berbeda";
    out.push({ a: sisi(x), b: sisi(y), status });
  }
  return out.sort((p, q) => p.a.no - q.a.no);
}

export type PasanganStatus = { no: number; status: KonsistensiBaris["status"] };

/**
 * Konsistensi satu paket dari butir urut tampil (nomor = indeks + 1): tabel pasangan + status pasangan per id butir.
 * Pasangan dari options_payload.pasangan (Ya/Tidak), atau peta kembar Pass Hand untuk paket yang sudah live.
 */
export function konsistensiPaket(items: { id: string; rule: PribadiRule; selected: string | null; payload: { statement: string; bank_id?: string; pasangan?: string | null } }[]) {
  const baris = konsistensi(
    items.flatMap((it, i) =>
      it.payload.bank_id
        ? [{ no: i + 1, bankId: it.payload.bank_id, pasangan: it.payload.pasangan ?? kembarSk(it.payload.bank_id), rule: it.rule, selected: it.selected, statement: it.payload.statement }]
        : []
    )
  );
  const pasanganOf: Record<string, PasanganStatus> = {};
  for (const { a, b, status } of baris) {
    pasanganOf[items[a.no - 1].id] = { no: b.no, status };
    pasanganOf[items[b.no - 1].id] = { no: a.no, status };
  }
  return { baris, pasanganOf };
}
