import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { KecerdasanOptionsPayload, KecerdasanScoringRule } from "@/lib/types/safe-question";
import { isSimulasiPackage } from "@/lib/test-config";
import { hasLiveModuleOfType } from "@/lib/latihan-review";

// Latihan dan ujian membaca dari bank soal yang sama (belum ada bank terpisah,
// lihat F11 di AUDIT_CAT_2026-09-12.md): kunci ditolak selama peserta punya
// module ujian aktif bertipe sama (hasLiveModuleOfType, juga dipakai halaman pembahasan).
function normalizeSelection(value: unknown, allowedKeys: string[], requiredCount: number): string | null {
  if (typeof value !== "string") return null;
  const allowed = new Set(allowedKeys);
  const keys = [...new Set(value.toUpperCase().split(""))].sort();
  if (keys.length !== requiredCount || keys.some((key) => !allowed.has(key))) {
    return null;
  }
  return keys.join("");
}

const MAX_ITEMS = 200;
type Input = { question_id?: unknown; selected_key?: unknown };

/*
  Pembahasan Latihan Kecerdasan saat dikumpulkan, satu request untuk seluruh paket:
  { answers: [{ question_id, selected_key | null }] } → { items: { [question_id]: hasil } }.
  Sebelumnya satu request per butir (100 request, ~300 query); satu yang gagal
  membatalkan seluruh pengumpulan. Bentuk lama { question_id, selected_key } tetap
  diterima untuk tab yang dibuka sebelum deploy ini.
  Stateless: baca scoring_rule server-side, bandingkan, balikin hasil. Tidak menulis apapun ke DB.
*/
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json().catch(() => null)) as ({ answers?: unknown } & Input) | null;
    const single = !Array.isArray(body?.answers);
    const answers = (single ? [body] : body!.answers) as (Input | null)[];
    if (!answers.length || answers.length > MAX_ITEMS || answers.some((a) => typeof a?.question_id !== "string" || !a.question_id)) {
      return NextResponse.json({ error: "question_id wajib" }, { status: 400 });
    }
    const ids = [...new Set(answers.map((a) => a!.question_id as string))];

    // Tanpa filter is_active: halaman latihan yang dibuka sebelum soal dinonaktifkan (mis. kalibrasi
    // pkg 2) tetap harus bisa dikumpulkan. Soal simulasi tetap ditolak lewat isSimulasiPackage di bawah.
    const { data: rows, error } = await supabaseAdmin
      .from("questions")
      .select("id, type, package_number, scoring_rule, options_payload")
      .in("id", ids);
    if (error) throw error;
    if (!rows || rows.length !== ids.length) {
      return NextResponse.json({ error: "Soal tidak ditemukan" }, { status: 404 });
    }
    // Hanya Kecerdasan yang memakai route ini; Kecermatan/Kepribadian dinilai di jalurnya sendiri.
    if (rows.some((r) => r.type !== "KECERDASAN")) {
      return NextResponse.json({ error: "Soal tidak didukung" }, { status: 400 });
    }
    // Soal paket simulasi tidak pernah dipakai latihan: jangan pernah balikin kuncinya.
    if (rows.some((r) => isSimulasiPackage(r.type, r.package_number))) {
      return NextResponse.json({ error: "Soal simulasi tidak tersedia untuk latihan" }, { status: 403 });
    }
    if (await hasLiveModuleOfType(session.sub, "KECERDASAN")) {
      return NextResponse.json(
        { error: "Pembahasan dikunci: module ini sedang berlangsung sebagai ujian aktif" },
        { status: 409 }
      );
    }

    const byId = new Map(rows.map((r) => [r.id as string, r]));
    const items: Record<string, { is_correct: boolean; correct_key: string; pembahasan: string | null; pembahasan_svg: string | null }> = {};
    for (const a of answers) {
      const row = byId.get(a!.question_id as string)!;
      const rule = row.scoring_rule as unknown as KecerdasanScoringRule;
      const payload = row.options_payload as unknown as KecerdasanOptionsPayload;
      // selected_key kosong = butir dilewati: tetap balikin kunci buat pembahasan,
      // tapi jangan lewat normalizeSelection (itu buat validasi jawaban beneran).
      let isCorrect = false;
      if (a!.selected_key) {
        const normalized = normalizeSelection(
          a!.selected_key,
          (payload.choices ?? []).map((choice) => choice.key),
          payload.is_multi_select === true ? 2 : 1
        );
        if (!normalized) return NextResponse.json({ error: "Pilihan tidak valid" }, { status: 400 });
        isCorrect = normalized === rule.correct_key;
      }
      items[row.id] = {
        is_correct: isCorrect,
        correct_key: rule.correct_key,
        pembahasan: rule.pembahasan ?? null,
        pembahasan_svg: rule.pembahasan_svg ?? null,
      };
    }

    return NextResponse.json(single ? items[ids[0]] : { items });
  } catch (err) {
    console.error("[POST /api/practice/check]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
