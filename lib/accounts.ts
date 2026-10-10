import "server-only";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { cleanName, genPassword, MAX_NAME_LEN, MAX_NAMES, nextIds } from "@/lib/account-rules";

// Kelola akun peserta (padanan api/admin.js di dajiks-cest). ID akun = username (p001, p002, …).
export class AccountError extends Error {
  constructor(public status: number, message: string, public extra?: Record<string, unknown>) {
    super(message);
  }
}

export type PublicAccount = { id: string; nama: string; aktif: boolean; admin: boolean; created_at: string | null };
type Row = { id: string; username: string | null; name: string; role: string; aktif?: boolean | null; created_at?: string | null };

const NO_AKTIF = "Kolom aktif belum ada di tabel users. Jalankan docs/rencana/sql/add-users-aktif.sql di Supabase.";
const isMissingColumn = (e: { code?: string; message?: string }) => e.code === "42703" || e.code === "PGRST204" || /aktif/.test(e.message ?? "");

const toPublic = (u: Row): PublicAccount => ({
  id: u.username ?? u.id, nama: u.name, aktif: u.aktif !== false, admin: u.role === "admin", created_at: u.created_at ?? null,
});

async function allRows(): Promise<Row[]> {
  const { data, error } = await supabaseAdmin.from("users").select("*").order("created_at", { ascending: true });
  if (error) throw new AccountError(500, "Gagal membaca akun: " + error.message);
  return data as Row[];
}

export async function listAccounts(): Promise<PublicAccount[]> {
  return (await allRows()).map(toPublic);
}

/** Akun yang sedang login, dibaca ulang dari database (bukan dari token). */
export async function findAccount(username: string): Promise<PublicAccount | null> {
  const { data } = await supabaseAdmin.from("users").select("*").eq("username", username).maybeSingle();
  return data ? toPublic(data as Row) : null;
}

export async function createAccounts(rawNames: unknown, allowDuplicates: boolean) {
  const seen = new Set<string>(), names: string[] = [];
  for (const n of Array.isArray(rawNames) ? rawNames : []) {
    const nama = cleanName(n);
    if (!nama || seen.has(nama)) continue;
    if (nama.length > MAX_NAME_LEN) throw new AccountError(400, `Nama terlalu panjang: ${nama.slice(0, 30)}…`);
    seen.add(nama);
    names.push(nama);
  }
  if (!names.length) throw new AccountError(400, "Tidak ada nama yang valid.");
  if (names.length > MAX_NAMES) throw new AccountError(400, `Maksimal ${MAX_NAMES} nama per permintaan.`);

  for (let attempt = 0; attempt < 4; attempt++) {
    const all = await allRows();
    if (!allowDuplicates) {
      const have = new Map(all.map((u) => [cleanName(u.name), u.username ?? u.id]));
      const duplicates = names.filter((n) => have.has(n)).map((n) => ({ nama: n, id: have.get(n) }));
      if (duplicates.length) throw new AccountError(409, "Ada nama yang sudah punya akun.", { duplicates });
    }
    const ids = nextIds(all.map((u) => u.username ?? ""), names.length);
    const now = new Date().toISOString();
    const out = await Promise.all(
      names.map(async (nama, i) => {
        const password = genPassword();
        return { id: ids[i], nama, password, row: {
            // id/created_at/updated_at diisi di sini: default kolom dibuat Prisma di sisi aplikasi, bukan di database.
            id: randomUUID(), name: nama, username: ids[i], email: `${ids[i]}@psikotes.internal`,
            password_hash: await bcrypt.hash(password, 10), role: "peserta", created_at: now, updated_at: now,
          } };
      })
    );
    const { error } = await supabaseAdmin.from("users").insert(out.map((o) => o.row));
    if (!error) return { created: out.map(({ id, nama, password }) => ({ id, nama, password })) };
    if (error.code !== "23505") throw new AccountError(500, "Gagal membuat akun: " + error.message);
    // 23505 = ID bentrok (dua admin menambah bersamaan): baca ulang lalu coba lagi
  }
  throw new AccountError(409, "ID bentrok berulang. Coba lagi.");
}

async function patch(username: string, values: Record<string, unknown>): Promise<PublicAccount> {
  const { data, error } = await supabaseAdmin.from("users").update({ ...values, updated_at: new Date().toISOString() }).eq("username", username).select("*");
  if (error) throw new AccountError(isMissingColumn(error) && "aktif" in values ? 503 : 500, isMissingColumn(error) && "aktif" in values ? NO_AKTIF : "Gagal menyimpan: " + error.message);
  if (!data?.length) throw new AccountError(404, "ID tidak ditemukan.");
  return toPublic(data[0] as Row);
}

export async function resetPassword(username: string) {
  const password = genPassword();
  const u = await patch(username, { password_hash: await bcrypt.hash(password, 10) });
  return { id: u.id, nama: u.nama, password };
}

export async function updateAccount(username: string, me: string, body: { aktif?: unknown; nama?: unknown }) {
  const values: Record<string, unknown> = {};
  if (typeof body.aktif === "boolean") {
    if (username === me && !body.aktif) throw new AccountError(400, "Akun admin sendiri tidak boleh dinonaktifkan.");
    values.aktif = body.aktif;
  }
  if (body.nama !== undefined) {
    const nama = cleanName(body.nama);
    if (!nama || nama.length > MAX_NAME_LEN) throw new AccountError(400, "Nama tidak valid.");
    values.name = nama;
  }
  if (!Object.keys(values).length) throw new AccountError(400, "Tidak ada perubahan.");
  return { user: await patch(username, values) };
}
