import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { AccountError, createAccounts, findAccount, listAccounts, resetPassword, updateAccount } from "@/lib/accounts";

// POST /api/admin/accounts — kelola akun peserta (hanya admin). Padanan api/admin.js di dajiks-cest.
// Body JSON {action: 'list' | 'create' | 'reset' | 'update', ...}.
const LIMIT = 64 * 1024;
const fail = (status: number, error: string, extra?: Record<string, unknown>) =>
  NextResponse.json({ error, ...extra }, { status, headers: { "cache-control": "no-store" } });

// Tolak permintaan lintas situs (cookie SameSite=Lax sudah menahan POST lintas situs; ini lapis kedua).
function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== (req.headers.get("x-forwarded-host") ?? req.headers.get("host"))) return false;
    } catch {
      return false;
    }
  }
  return /^application\/json\b/i.test(req.headers.get("content-type") ?? "");
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return fail(403, "Permintaan ditolak.");
  const session = await getSession();
  if (!session) return fail(401, "Sesi berakhir. Masuk lagi.");
  // Hak admin dibaca ulang dari database, bukan hanya dari token.
  const me = await findAccount(session.username);
  if (!me || !me.aktif) return fail(401, "Sesi berakhir. Masuk lagi.");
  if (!me.admin) return fail(403, "Khusus admin.");

  const text = await req.text();
  if (text.length > LIMIT) return fail(413, "Permintaan terlalu besar.");
  let body: { action?: string; names?: unknown; allowDuplicates?: unknown; id?: unknown; aktif?: unknown; nama?: unknown };
  try {
    body = JSON.parse(text || "{}");
  } catch {
    return fail(400, "JSON tidak valid.");
  }
  const id = String(body.id ?? "").trim().toLowerCase();

  try {
    let data: unknown;
    switch (body.action) {
      case "list":
        data = { users: await listAccounts(), me: me.id };
        break;
      case "create":
        data = await createAccounts(body.names, body.allowDuplicates === true);
        break;
      case "reset":
        data = await resetPassword(id);
        break;
      case "update":
        data = await updateAccount(id, me.id, body);
        break;
      default:
        return fail(400, "Aksi tidak dikenal.");
    }
    return NextResponse.json(data, { headers: { "cache-control": "no-store" } });
  } catch (e) {
    if (e instanceof AccountError) return fail(e.status, e.message, e.extra);
    console.error("[POST /api/admin/accounts]", e);
    return fail(500, "Server gagal memproses. Coba lagi.");
  }
}
