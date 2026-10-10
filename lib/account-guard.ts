// Penjaga sesi untuk proxy.ts (padanan lib/accounts.js di dajiks-cest): token yang masih sah ditolak bila
// akunnya dinonaktifkan, dihapus, atau password-nya direset. Tanpa server-only (proxy bukan React server).
// Cache 60 dtk per instance; ID tak dikenal → satu refresh paksa (dibatasi 5 dtk). Supabase gagal = lolos
// (login tidak mati karena database sedang bermasalah), sama seperti cadangan users.json di CEST.
import { sessionVersion } from "@/lib/account-rules";

const TTL = 60_000, MIN_FORCE = 5_000, BACKOFF = 10_000, TIMEOUT = 4_000, PAGE = 1000;
type Entry = { aktif: boolean; pv: string };
let cache: Map<string, Entry> | null = null, at = 0, forcedAt = 0, failUntil = 0;
let inflight: Promise<Map<string, Entry> | null> | null = null;

async function fetchAll(): Promise<Map<string, Entry>> {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, ""), key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!url || !key) throw new Error("Supabase belum dikonfigurasi");
  const headers: Record<string, string> = { apikey: key };
  if (!key.startsWith("sb_")) headers.Authorization = "Bearer " + key;
  const map = new Map<string, Entry>();
  for (let from = 0; ; from += PAGE) {
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), TIMEOUT);
    try {
      // select=* supaya tetap jalan sebelum kolom aktif dibuat (kolom hilang = aktif).
      const res = await fetch(`${url}/rest/v1/users?select=*&order=id.asc`, { headers: { ...headers, Range: `${from}-${from + PAGE - 1}` }, signal: ctl.signal });
      if (!res.ok) throw new Error(`Supabase ${res.status}`);
      const rows = (await res.json()) as { id: string; aktif?: boolean | null; password_hash?: string | null }[];
      for (const r of rows) map.set(r.id, { aktif: r.aktif !== false, pv: r.password_hash ? sessionVersion(r.password_hash) : "" });
      if (rows.length < PAGE) return map;
    } finally {
      clearTimeout(timer);
    }
  }
}

async function accounts(force: boolean): Promise<Map<string, Entry> | null> {
  const now = Date.now();
  if (now < failUntil) return cache;
  if (cache && now - at < TTL && !(force && now - forcedAt >= MIN_FORCE)) return cache;
  if (force) forcedAt = now;
  inflight ??= fetchAll()
    .then((m) => ((cache = m), (at = Date.now()), m))
    .catch((e: Error) => {
      console.error("account-guard: Supabase gagal, sesi dilewatkan", e.message);
      failUntil = Date.now() + BACKOFF;
      return cache;
    })
    .finally(() => (inflight = null));
  return inflight;
}

/** true = token harus ditolak. pv kosong (token lama sebelum fitur ini) hanya dicek status aktifnya. */
export async function sessionBlocked(sub: string, pv: string | undefined): Promise<boolean> {
  let list = await accounts(false);
  if (!list) return false;
  let u = list.get(sub);
  if (!u) {
    list = await accounts(true);
    u = list?.get(sub);
    if (!list) return false;
    if (!u) return true;
  }
  if (pv && pv !== u.pv) {
    // Bisa berarti cache masih memuat hash lama (baru saja login dengan password hasil reset): cek ulang sekali.
    u = (await accounts(true))?.get(sub) ?? u;
  }
  return !u.aktif || (!!pv && pv !== u.pv);
}
