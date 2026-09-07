import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type {
  KecerdasanScoringRule,
  KecermatanScoringRule,
} from "@/lib/types/safe-question";

// Stateless: baca scoring_rule server-side, bandingkan, balikin hasil. Tidak menulis apapun ke DB.
export async function POST(req: NextRequest) {
  try {
    const { question_id, selected_key } = (await req.json()) as {
      question_id: string;
      selected_key: string;
    };

    if (!question_id || !selected_key) {
      return NextResponse.json({ error: "question_id dan selected_key wajib" }, { status: 400 });
    }

    const { data: question, error } = await supabaseAdmin
      .from("questions")
      .select("type, scoring_rule")
      .eq("id", question_id)
      .single();

    if (error || !question) {
      return NextResponse.json({ error: "Soal tidak ditemukan" }, { status: 404 });
    }

    if (question.type === "KECERDASAN") {
      const rule = question.scoring_rule as unknown as KecerdasanScoringRule;
      return NextResponse.json({ is_correct: selected_key === rule.correct_key, correct_key: rule.correct_key });
    }

    if (question.type === "KECERMATAN") {
      const rule = question.scoring_rule as unknown as KecermatanScoringRule;
      return NextResponse.json({ is_correct: selected_key === rule.correct_choice, correct_key: rule.correct_choice });
    }

    // Kepribadian: skala Likert, tidak ada jawaban benar/salah
    return NextResponse.json({});
  } catch (err) {
    console.error("[POST /api/practice/check]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
