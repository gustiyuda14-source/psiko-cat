import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isSimulasiPackage } from "@/lib/test-config";
import type { KepribadianOptionsPayload } from "@/lib/types/safe-question";
import { isPribadiRule, itemScore, konsistensiPaket, reviewFields, summarize, type PribadiRule } from "@/lib/scoring/pribadi";
import { psikogramPribadi } from "@/lib/scoring/psikogram-sesi";

// Latihan PRIBADI (Kepribadian Likert/SJT + Substansi Khusus) dikumpulkan sekali di akhir:
// satu request untuk seluruh paket, kunci + pembahasan dibaca server-side.
// Stateless, tidak menulis ke DB. Butir paket simulasi selalu ditolak.
const MAX_ITEMS = 200;

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as { answers?: { question_id?: unknown; selected_key?: unknown }[] };
    const answers = Array.isArray(body.answers) ? body.answers : null;
    if (!answers?.length || answers.length > MAX_ITEMS || answers.some((a) => typeof a?.question_id !== "string")) {
      return NextResponse.json({ error: "Daftar jawaban tidak valid" }, { status: 400 });
    }
    const ids = [...new Set(answers.map((a) => a.question_id as string))];

    const { data: rows, error } = await supabaseAdmin
      .from("questions")
      .select("id, package_number, options_payload, scoring_rule")
      .eq("type", "KEPRIBADIAN")
      .in("id", ids);
    if (error) throw error;
    if (!rows || rows.length !== ids.length) {
      return NextResponse.json({ error: "Soal tidak ditemukan" }, { status: 404 });
    }
    if (rows.some((r) => isSimulasiPackage("KEPRIBADIAN", r.package_number))) {
      return NextResponse.json({ error: "Soal simulasi tidak tersedia untuk latihan" }, { status: 403 });
    }

    const byId = new Map(rows.map((r) => [r.id, r]));
    const scored = answers.map((a) => {
      const row = byId.get(a.question_id as string)!;
      const rule = row.scoring_rule;
      if (!isPribadiRule(rule)) return null;
      const payload = row.options_payload as unknown as KepribadianOptionsPayload;
      const allowed = (payload.choices ?? []).map((c) => c.key as string);
      const selected = typeof a.selected_key === "string" && allowed.includes(a.selected_key) ? a.selected_key : null;
      return { id: row.id, rule, selected, payload };
    });
    if (scored.some((s) => !s)) {
      return NextResponse.json({ error: "Paket ini belum memakai format PRIBADI" }, { status: 422 });
    }
    const valid = scored as { id: string; rule: PribadiRule; selected: string | null; payload: KepribadianOptionsPayload }[];
    const { baris, pasanganOf } = konsistensiPaket(valid);

    return NextResponse.json({
      items: valid.map(({ id, rule, selected }) => ({
        question_id: id,
        selected_key: selected,
        ...itemScore(rule, selected),
        ...reviewFields(rule),
        pasangan: pasanganOf[id] ?? null,
      })),
      summary: { ...summarize(valid), psikogram: psikogramPribadi(valid), konsistensi: baris },
    });
  } catch (err) {
    console.error("[POST /api/practice/pribadi]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
