import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) throw new Error("Konfigurasi Supabase server belum lengkap");
    _client = createClient(
      url,
      serviceKey,
      { auth: { persistSession: false } }
    );
  }
  return _client;
}

// Proxy defers client creation to first request — avoids build-time env var errors
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop: string | symbol) {
    return Reflect.get(getClient(), prop, getClient());
  },
});
