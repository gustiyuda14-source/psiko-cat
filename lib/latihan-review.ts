import "server-only";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { isModuleExpired } from "@/lib/session-access";
import { isSimulasiPackage, type ModuleType } from "@/lib/test-config";
import { latihanPackageOf } from "@/lib/progress-rules";
import { getMissingSymbolKey } from "@/lib/kecermatan-symbols";
import { calculateKecermatan, type KecermatanScoreResult } from "@/lib/scoring/kecermatan";
import { itemScore, summarize, type PribadiRule, type PribadiSummary } from "@/lib/scoring/pribadi";
import type { KecerdasanReviewItem } from "@/app/components/PembahasanSection";
import type { PribadiReviewItem } from "@/app/components/PribadiReview";
import type {
  KecerdasanOptionsPayload,
  KecerdasanScoringRule,
  KecermatanOptionsPayload,
  KepribadianOptionsPayload,
  SafeQuestion,
} from "@/lib/types/safe-question";

/*
  Pembahasan latihan yang sudah dikumpulkan (tabel latihan_attempts,
  docs/rencana/sql/latihan-attempts.sql). Yang tersimpan hanya pilihan peserta;
  kunci dan pembahasan dihitung ulang dari bank soal saat halaman dibuka, dengan
  penjagaan yang sama seperti /api/practice/check.
*/

/**
  Latihan dan ujian masih memakai bank soal yang sama (F11, AUDIT_CAT_2026-09-12.md):
  selama peserta punya module ujian aktif bertipe sama, kunci latihan tidak dibuka.
*/
export async function hasLiveModuleOfType(userId: string, moduleType: string): Promise<boolean> {
  const { data: sessions } = await supabaseAdmin
    .from("test_sessions")
    .select("id")
    .eq("user_id", userId)
    .in("status", ["PENDING", "IN_PROGRESS"]);
  const sessionIds = (sessions ?? []).map((s) => s.id);
  if (!sessionIds.length) return false;

  const { data: liveModules } = await supabaseAdmin
    .from("module_sessions")
    .select("module_type, started_at, time_limit_seconds")
    .in("test_session_id", sessionIds)
    .eq("module_type", moduleType)
    .eq("status", "IN_PROGRESS");
  // Modul yang waktunya sudah habis tapi tidak pernah ditutup bukan ujian aktif lagi;
  // tanpa ini pembahasan latihan peserta terkunci selamanya.
  return (liveModules ?? []).some((m) => !isModuleExpired(m));
}

type QuestionRow = SafeQuestion & { scoring_rule: unknown };

/**
  Semua butir paket (urut seperti layar latihan), termasuk scoring_rule untuk server.
  Termasuk butir nonaktif: halaman latihan yang dibuka sebelum soal dinonaktifkan
  (mis. kalibrasi pkg 2) tetap mengirim id lama, sama seperti /api/practice/check.
*/
export async function packageQuestions(module: ModuleType, pkg: number): Promise<QuestionRow[]> {
  let query = supabaseAdmin
    .from("questions")
    .select("id, type, sequence_number, column_index, package_number, options_payload, scoring_rule, is_active, created_at, updated_at")
    .eq("type", module)
    .eq("package_number", pkg);
  if (module === "KECERMATAN") query = query.order("column_index", { ascending: true });
  const { data, error } = await query.order("sequence_number", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as QuestionRow[];
}

export type KecermatanFeedback = Record<string, { selected: string; is_correct: boolean; correct_key: string }>;

export type LatihanReview =
  | { status: "missing" }
  | { status: "locked"; module: ModuleType }
  | {
      status: "ok";
      key: string;
      module: ModuleType;
      pkg: number;
      submittedAt: string;
      timed: boolean;
      /** Percobaan lain yang masih tersimpan untuk paket ini, terbaru dulu. */
      siblings: { id: number; at: string }[];
      kecerdasan?: KecerdasanReviewItem[];
      kecermatan?: { questions: SafeQuestion[]; answers: KecermatanFeedback; score: KecermatanScoreResult | null };
      pribadi?: { summary: PribadiSummary; items: PribadiReviewItem[] };
    };

// Kunci tidak boleh ikut terkirim ke komponen klien.
const strip = (q: QuestionRow) => Object.fromEntries(Object.entries(q).filter(([k]) => k !== "scoring_rule")) as SafeQuestion;

export async function loadLatihanReview(userId: string, attemptId: number): Promise<LatihanReview> {
  const { data: attempt } = await supabaseAdmin
    .from("latihan_attempts")
    .select("id, item_key, answers, timed, submitted_at")
    .eq("id", attemptId)
    .eq("user_id", userId)
    .maybeSingle();
  const route = attempt ? latihanPackageOf(attempt.item_key) : null;
  if (!attempt || !route || isSimulasiPackage(route.module, route.pkg)) return { status: "missing" };
  if (route.module !== "KEPRIBADIAN" && (await hasLiveModuleOfType(userId, route.module))) {
    return { status: "locked", module: route.module };
  }

  const [all, { data: siblings }] = await Promise.all([
    packageQuestions(route.module, route.pkg),
    supabaseAdmin
      .from("latihan_attempts")
      .select("id, submitted_at")
      .eq("user_id", userId)
      .eq("item_key", attempt.item_key)
      .order("submitted_at", { ascending: false }),
  ]);
  const picks = attempt.answers as Record<string, string | null>;
  // Tampilkan butir yang dikerjakan peserta saat itu. Kecerdasan/Kepribadian menyimpan semua butir
  // (dilewati = null); Kecermatan hanya yang diklik, jadi sisanya dari butir yang masih aktif.
  const questions = all.filter((q) => q.id in picks || (route.module === "KECERMATAN" && q.is_active));
  const base = {
    status: "ok" as const,
    key: attempt.item_key as string,
    module: route.module,
    pkg: route.pkg,
    submittedAt: attempt.submitted_at as string,
    timed: Boolean(attempt.timed),
    siblings: (siblings ?? []).map((s) => ({ id: s.id as number, at: s.submitted_at as string })),
  };

  if (route.module === "KECERDASAN") {
    return {
      ...base,
      kecerdasan: questions.map((q) => {
        const rule = q.scoring_rule as KecerdasanScoringRule;
        const selected = picks[q.id] ?? null;
        const normalized = selected ? [...new Set(selected.toUpperCase())].sort().join("") : null;
        return {
          question_id: q.id,
          sequence_number: q.sequence_number,
          selected_key: selected,
          correct_key: rule.correct_key,
          is_correct: normalized === rule.correct_key,
          pembahasan: rule.pembahasan ?? null,
          payload: q.options_payload as unknown as KecerdasanOptionsPayload,
        };
      }),
    };
  }

  if (route.module === "KECERMATAN") {
    // Hanya butir yang dijawab yang punya umpan balik, sama seperti layar selesai latihan.
    const answers: KecermatanFeedback = {};
    const stats = Array.from({ length: 10 }, (_, i) => ({ column_index: i + 1, total_klik: 0, total_benar: 0 }));
    for (const q of questions) {
      const selected = picks[q.id];
      const correct = getMissingSymbolKey(q.options_payload as unknown as KecermatanOptionsPayload);
      if (!selected || !correct) continue;
      answers[q.id] = { selected, is_correct: selected === correct, correct_key: correct };
      const col = stats[(q.column_index ?? 0) - 1];
      if (col) {
        col.total_klik++;
        if (selected === correct) col.total_benar++;
      }
    }
    let score: KecermatanScoreResult | null = null;
    if (base.timed) {
      try {
        score = calculateKecermatan(stats);
      } catch {
        score = null;
      }
    }
    return { ...base, kecermatan: { questions: questions.map(strip), answers, score } };
  }

  const scored = questions.flatMap((q) => {
    const rule = q.scoring_rule as PribadiRule;
    if (rule?.type !== "likert4" && rule?.type !== "forced_choice") return [];
    return [{ q, rule, selected: picks[q.id] ?? null }];
  });
  return {
    ...base,
    pribadi: {
      summary: summarize(scored),
      items: scored.map(({ q, rule, selected }) => ({
        question_id: q.id,
        selected_key: selected,
        payload: q.options_payload as unknown as KepribadianOptionsPayload,
        ...itemScore(rule, selected),
        ...(rule.type === "likert4"
          ? { subtes: "KP", aspect: rule.aspect, polarity: rule.polarity, pembahasan: rule.pembahasan }
          : { subtes: "SK", dimensi: rule.dimensi, pembahasan: rule.pembahasan }),
      })) as PribadiReviewItem[],
    },
  };
}
