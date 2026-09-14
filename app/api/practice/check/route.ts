import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type {
  KecerdasanOptionsPayload,
  KecerdasanScoringRule,
  KecermatanOptionsPayload,
  KecermatanScoringRule,
} from "@/lib/types/safe-question";

// Latihan dan ujian membaca dari bank soal yang sama (belum ada bank terpisah,
// lihat F11 di AUDIT_CAT_2026-09-12.md). Peserta bisa tahu question_id dari
// soal ujian yang sedang dikerjakan lalu mengirimkannya ke endpoint ini untuk
// membocorkan kunci jawaban ujian aktifnya sendiri. Kunci itu dengan menolak
// permintaan saat peserta punya module aktif (IN_PROGRESS) bertipe sama.
async function hasLiveModuleOfType(userId: string, moduleType: string): Promise<boolean> {
  const { data: sessions } = await supabaseAdmin
    .from("test_sessions")
    .select("id")
    .eq("user_id", userId)
    .in("status", ["PENDING", "IN_PROGRESS"]);
  const sessionIds = (sessions ?? []).map((s) => s.id);
  if (!sessionIds.length) return false;

  const { data: liveModule } = await supabaseAdmin
    .from("module_sessions")
    .select("id")
    .in("test_session_id", sessionIds)
    .eq("module_type", moduleType)
    .eq("status", "IN_PROGRESS")
    .limit(1)
    .maybeSingle();
  return Boolean(liveModule);
}

function normalizeSelection(value: unknown, allowedKeys: string[], requiredCount: number): string | null {
  if (typeof value !== "string") return null;
  const allowed = new Set(allowedKeys);
  const keys = [...new Set(value.toUpperCase().split(""))].sort();
  if (keys.length !== requiredCount || keys.some((key) => !allowed.has(key))) {
    return null;
  }
  return keys.join("");
}

// Stateless: baca scoring_rule server-side, bandingkan, balikin hasil. Tidak menulis apapun ke DB.
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { question_id, selected_key } = (await req.json()) as {
      question_id: string;
      selected_key: string;
    };

    if (!question_id || !selected_key) {
      return NextResponse.json({ error: "question_id dan selected_key wajib" }, { status: 400 });
    }

    const { data: question, error } = await supabaseAdmin
      .from("questions")
      .select("type, scoring_rule, options_payload")
      .eq("id", question_id)
      .eq("is_active", true)
      .single();

    if (error || !question) {
      return NextResponse.json({ error: "Soal tidak ditemukan" }, { status: 404 });
    }

    if (
      question.type !== "KEPRIBADIAN" &&
      (await hasLiveModuleOfType(session.sub, question.type))
    ) {
      return NextResponse.json(
        { error: "Pembahasan dikunci: module ini sedang berlangsung sebagai ujian aktif" },
        { status: 409 }
      );
    }

    if (question.type === "KECERDASAN") {
      const rule = question.scoring_rule as unknown as KecerdasanScoringRule;
      const payload = question.options_payload as unknown as KecerdasanOptionsPayload;
      const normalized = normalizeSelection(
        selected_key,
        (payload.choices ?? []).map((choice) => choice.key),
        payload.is_multi_select === true ? 2 : 1
      );
      if (!normalized) return NextResponse.json({ error: "Pilihan tidak valid" }, { status: 400 });
      return NextResponse.json({ is_correct: normalized === rule.correct_key, correct_key: rule.correct_key });
    }

    if (question.type === "KECERMATAN") {
      const rule = question.scoring_rule as unknown as KecermatanScoringRule;
      const payload = question.options_payload as unknown as KecermatanOptionsPayload;
      const normalized = normalizeSelection(selected_key, payload.choices ?? [], 1);
      if (!normalized) return NextResponse.json({ error: "Pilihan tidak valid" }, { status: 400 });
      return NextResponse.json({ is_correct: normalized === rule.correct_choice, correct_key: rule.correct_choice });
    }

    // Kepribadian: skala Likert, tidak ada jawaban benar/salah
    return NextResponse.json({});
  } catch (err) {
    console.error("[POST /api/practice/check]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
