// Dry run backend end-to-end lewat HTTP: simulasi penuh, modul kedaluwarsa, latihan, pembahasan tersimpan.
// Memakai akun + sesi sementara di database ASLI (.env.local); semua barisnya dihapus di akhir, termasuk bila gagal.
//   npm run check:backend                                   → dev server lokal (http://localhost:3000)
//   DRYRUN_BASE=https://psiko-cat.vercel.app npm run check:backend   → production
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

const BASE = process.env.DRYRUN_BASE ?? "http://localhost:3000";
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const results = [];
const check = (name, ok, detail = "") => { results.push({ name, ok }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`); };
const must = async (p) => { const r = await p; if (r.error) throw r.error; return r.data; };

const tag = randomUUID().slice(0, 8);
const userId = randomUUID();
const username = `dryrun-${tag}`;
const password = `Dry-${tag}-run`;
const sessionIds = [];
let cookie = "";

const api = async (method, path, body) => {
  const res = await fetch(BASE + path, {
    method, redirect: "manual",
    headers: { Cookie: cookie, ...(body !== undefined ? { "Content-Type": "application/json" } : {}) },
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });
  const text = await res.text();
  let json = null; try { json = JSON.parse(text); } catch {}
  return { status: res.status, json, text };
};

async function newSession(modules, { kecermatanPkg = 7 } = {}) {
  const ts = await must(s.from("test_sessions").insert({ user_id: userId, status: "PENDING" }).select("id").single());
  sessionIds.push(ts.id);
  const cfg = { KECERDASAN: [5400, 16], KECERMATAN: [600, null], KEPRIBADIAN: [3600, 11] };
  const rows = await must(s.from("module_sessions").insert(modules.map((type, i) => ({
    test_session_id: ts.id, module_type: type, sequence_order: i + 1, status: "NOT_STARTED",
    time_limit_seconds: cfg[type][0], kecermatan_package_number: type === "KECERMATAN" ? kecermatanPkg : null,
    package_number: type === "KECERMATAN" ? null : cfg[type][1],
  }))).select("id, module_type, sequence_order"));
  rows.sort((a, b) => a.sequence_order - b.sequence_order);
  return { id: ts.id, mods: rows };
}
const ageModule = (id, seconds) => must(s.from("module_sessions").update({ status: "IN_PROGRESS", started_at: new Date(Date.now() - seconds * 1000).toISOString() }).eq("id", id));
const sync = (sid, mid, extra = {}) => api("PATCH", `/api/sessions/${sid}/sync`, { module_session_id: mid, current_question_index: 0, current_column_index: null, column_remaining_ms: null, ...extra });

try {
  // ── Setup + login ─────────────────────────────────────────────────────────
  await must(s.from("users").insert({ id: userId, name: "Dry Run", email: `${username}@example.invalid`, username, password_hash: await bcrypt.hash(password, 10), role: "peserta" }));
  let r = await api("POST", "/api/auth/login", { username: 123, password: [] });
  check("login: body bukan string → 400 (bukan 500)", r.status === 400, `status ${r.status}`);
  const login = await fetch(BASE + "/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
  cookie = (login.headers.get("set-cookie") ?? "").split(";")[0];
  check("login akun sementara", login.status === 200 && cookie.startsWith("psiko_session="), `status ${login.status}`);

  // ── Bank soal ─────────────────────────────────────────────────────────────
  const kec16 = await must(s.from("questions").select("id, scoring_rule, options_payload").eq("type", "KECERDASAN").eq("package_number", 16).eq("is_active", true).order("sequence_number"));
  const pri11 = await must(s.from("questions").select("id, options_payload").eq("type", "KEPRIBADIAN").eq("package_number", 11).eq("is_active", true).order("sequence_number"));
  const cer7 = await must(s.from("questions").select("id, column_index, options_payload, scoring_rule").eq("type", "KECERMATAN").eq("package_number", 7).eq("is_active", true).order("column_index").order("sequence_number").limit(5));

  // ── 1. Simulasi penuh normal ──────────────────────────────────────────────
  const full = await newSession(["KECERDASAN", "KECERMATAN", "KEPRIBADIAN"]);
  const [mKec, mCer, mPri] = full.mods;
  r = await sync(full.id, mCer.id, { current_column_index: 1, column_remaining_ms: 60000 });
  check("urutan: sub-tes 2 ditolak sebelum sub-tes 1 selesai", r.status === 409, `status ${r.status}`);
  r = await sync(full.id, mKec.id);
  check("sync Kecerdasan: synced_at + started_at dari server", r.status === 200 && typeof r.json?.synced_at === "number" && !!r.json?.started_at, `status ${r.status}`);
  r = await api("POST", `/api/sessions/${full.id}/modules/${mKec.id}/answers`, { answers: kec16.map((q) => ({ question_id: q.id, selected_key: q.scoring_rule.correct_key })) });
  check(`jawaban Kecerdasan ${kec16.length} butir tersimpan`, r.status === 200 && r.json?.saved === kec16.length, `status ${r.status} ${r.text.slice(0, 80)}`);
  r = await api("POST", `/api/sessions/${full.id}/modules/${mKec.id}/answers`, { answers: [{ question_id: kec16[0].id, selected_key: "Z" }] });
  check("jawaban dengan pilihan tidak valid → 400", r.status === 400, `status ${r.status}`);
  r = await api("GET", `/api/sessions/${full.id}/modules/${mKec.id}/answers`);
  check("GET jawaban Kecerdasan kembali utuh", r.json?.answers?.length === kec16.length, `${r.json?.answers?.length}`);
  r = await api("POST", `/api/sessions/${full.id}/modules/${mKec.id}/complete`);
  check("complete Kecerdasan → COMPLETED", r.json?.status === "COMPLETED", r.text.slice(0, 80));

  r = await sync(full.id, mCer.id, { current_column_index: 1, column_remaining_ms: 60000 });
  check("sync Kecermatan setelah sub-tes 1 selesai", r.status === 200, `status ${r.status}`);
  const t0 = Date.now();
  const logs = cer7.map((q, i) => ({ question_id: q.id, clicked_at_ms: t0 + i * 500, response_value: q.scoring_rule.correct_choice }));
  r = await api("POST", "/api/kecermatan/log", { session_id: full.id, module_session_id: mCer.id, logs });
  check(`log Kecermatan ${logs.length} klik tersimpan`, r.json?.inserted === logs.length, r.text.slice(0, 80));
  r = await api("POST", "/api/kecermatan/log", { session_id: full.id, module_session_id: mCer.id, logs });
  check("log Kecermatan dikirim ulang → dihitung duplikat, tidak dobel", r.json?.inserted === 0 && r.json?.duplicates === logs.length, r.text.slice(0, 80));
  r = await api("POST", `/api/sessions/${full.id}/modules/${mCer.id}/complete`);
  check("complete Kecermatan", r.status === 200, r.text.slice(0, 80));

  r = await sync(full.id, mPri.id);
  const priFirst = pri11.map((q) => ({ question_id: q.id, selected_key: q.options_payload.choices[0].key }));
  const a1 = await api("POST", `/api/sessions/${full.id}/modules/${mPri.id}/answers`, { answers: priFirst.slice(0, 100) });
  const a2 = await api("POST", `/api/sessions/${full.id}/modules/${mPri.id}/answers`, { answers: priFirst.slice(100) });
  check(`jawaban Kepribadian ${pri11.length} butir (2 batch) tersimpan`, a1.status === 200 && a2.status === 200, `${a1.status}/${a2.status}`);
  const changed = { question_id: pri11[0].id, selected_key: pri11[0].options_payload.choices.at(-1).key };
  await api("POST", `/api/sessions/${full.id}/modules/${mPri.id}/answers`, { answers: [changed] });
  await api("POST", "/api/rescue", { sessionId: full.id, kepribadian: { moduleSessionId: mPri.id, answers: { [changed.question_id]: changed.selected_key } } });
  const priRow = await must(s.from("answers").select("selected_key").eq("module_session_id", mPri.id).eq("question_id", pri11[0].id).single());
  check("Kepribadian: jawaban pertama terkunci (answers + rescue tidak menimpa)", priRow.selected_key === priFirst[0].selected_key, `tersimpan ${priRow.selected_key}`);
  r = await api("POST", `/api/sessions/${full.id}/modules/${mPri.id}/complete`);
  check("complete Kepribadian", r.status === 200, r.text.slice(0, 80));

  r = await api("POST", `/api/sessions/${full.id}/calculate`);
  check("calculate Nilai Akhir Psikotest", r.status === 200 && typeof r.json?.nap_score === "number", r.text.slice(0, 120));
  r = await api("POST", `/api/sessions/${full.id}/calculate`);
  check("calculate kedua → 409 (sesi terkunci)", r.status === 409, `status ${r.status}`);
  const counts = await Promise.all([mKec, mPri].map((m) => s.from("answers").select("id", { count: "exact", head: true }).eq("module_session_id", m.id)));
  const logCount = await s.from("kecermatan_logs").select("id", { count: "exact", head: true }).eq("module_session_id", mCer.id);
  check("riwayat simulasi utuh setelah dihitung (jawaban + log)", counts[0].count === kec16.length && counts[1].count === pri11.length && logCount.count === logs.length, `${counts[0].count}/${counts[1].count}/${logCount.count}`);
  const res = await fetch(`${BASE}/test/${full.id}/result`, { headers: { Cookie: cookie }, redirect: "manual" });
  check("halaman hasil + pembahasan simulasi terbuka", res.status === 200, `status ${res.status}`);

  // ── 2. Modul kedaluwarsa tidak membuat macet ──────────────────────────────
  const stuck = await newSession(["KECERDASAN", "KECERMATAN", "KEPRIBADIAN"]);
  await ageModule(stuck.mods[0].id, 5400 + 120);
  r = await api("POST", `/api/sessions/${stuck.id}/modules/${stuck.mods[0].id}/answers`, { answers: [{ question_id: kec16[0].id, selected_key: kec16[0].scoring_rule.correct_key }] });
  check("jawaban setelah waktu habis → 409 (klien menutup sub-tes)", r.status === 409, `status ${r.status}`);
  r = await sync(stuck.id, stuck.mods[1].id, { current_column_index: 1, column_remaining_ms: 60000 });
  check("sub-tes berikutnya terbuka walau sub-tes 1 macet IN_PROGRESS", r.status === 200, `status ${r.status} ${r.text.slice(0, 80)}`);
  r = await api("POST", `/api/sessions/${stuck.id}/modules/${stuck.mods[0].id}/complete`);
  check("complete modul kedaluwarsa → TIMED_OUT", r.json?.status === "TIMED_OUT", r.text.slice(0, 80));

  // ── 3. Kunci pembahasan latihan saat ujian aktif ──────────────────────────
  const live = await newSession(["KECERDASAN"]);
  await ageModule(live.mods[0].id, 60);
  const lat2 = await must(s.from("questions").select("id, is_active, scoring_rule").eq("type", "KECERDASAN").eq("package_number", 2).order("sequence_number"));
  const stalePage = [...lat2.filter((q) => !q.is_active), ...lat2.filter((q) => q.is_active).slice(0, 90)];
  const checkBody = { answers: stalePage.map((q) => ({ question_id: q.id, selected_key: q.scoring_rule.correct_key })) };
  r = await api("POST", "/api/practice/check", checkBody);
  check("latihan dikunci selama ujian Kecerdasan benar-benar berjalan → 409", r.status === 409, `status ${r.status}`);
  await ageModule(live.mods[0].id, 5400 + 600);
  r = await api("POST", "/api/practice/check", checkBody);
  check("ujian kedaluwarsa tidak lagi mengunci latihan; 100 butir (10 nonaktif) dinilai sekali request", r.status === 200 && Object.keys(r.json?.items ?? {}).length === 100 && Object.values(r.json.items).every((i) => i.is_correct), `status ${r.status}`);

  // ── 4. Simpan pembahasan latihan ──────────────────────────────────────────
  const attemptAnswers = Object.fromEntries(stalePage.map((q) => [q.id, q.scoring_rule.correct_key]));
  const saves = [];
  for (let i = 0; i < 3; i++) saves.push(await api("POST", "/api/progress", { action: "attempt", key: "/latihan/kecerdasan/2", answers: attemptAnswers }));
  check("simpan pembahasan latihan dengan soal nonaktif → 200", saves.every((x) => x.status === 200), saves.map((x) => x.status).join(","));
  check("percobaan ke-3 menyisakan 2 terbaru (aturan maks 2)", saves[2].json?.attempts?.length === 2, `${saves[2].json?.attempts?.length}`);
  const attemptId = saves[2].json?.attempts?.[0]?.id;
  const page = await fetch(`${BASE}/latihan/pembahasan/${attemptId}`, { headers: { Cookie: cookie }, redirect: "manual" });
  const html = await page.text();
  check("pembahasan tersimpan terbuka, tidak terkunci", page.status === 200 && !html.includes("Pembahasan dikunci sementara"), `status ${page.status}`);
  r = await api("GET", "/api/progress");
  check("GET /api/progress mengembalikan daftar pembahasan tersimpan", r.json?.attempts?.["/latihan/kecerdasan/2"]?.length === 2, r.text.slice(0, 80));
  r = await api("POST", "/api/progress", { action: "latihan", items: { "/latihan/kecerdasan/2": 100 } });
  check("progres latihan tercatat", r.status === 200, `status ${r.status}`);
  r = await api("POST", "/api/practice/check", { question_id: stalePage[0].id, selected_key: stalePage[0].scoring_rule.correct_key });
  check("bentuk lama /api/practice/check (tab lama) masih jalan", r.status === 200 && r.json?.is_correct === true, `status ${r.status}`);

  // ── 5. Latihan Kepribadian ────────────────────────────────────────────────
  const latPri = await must(s.from("questions").select("id, options_payload").eq("type", "KEPRIBADIAN").eq("package_number", 2).eq("is_active", true).order("sequence_number"));
  r = await api("POST", "/api/practice/pribadi", { answers: latPri.map((q) => ({ question_id: q.id, selected_key: q.options_payload.choices[0].key })) });
  check(`latihan Kepribadian ${latPri.length} butir dinilai`, r.status === 200 && r.json?.items?.length === latPri.length, `status ${r.status} ${r.text.slice(0, 80)}`);
  r = await api("POST", "/api/progress", { action: "attempt", key: "/latihan/kepribadian/2", answers: Object.fromEntries(latPri.map((q) => [q.id, q.options_payload.choices[0].key])) });
  check("pembahasan latihan Kepribadian tersimpan", r.status === 200, `status ${r.status}`);

  // ── 6. Sesi Kecermatan lama tanpa nomor paket ─────────────────────────────
  const old = await newSession(["KECERMATAN"], { kecermatanPkg: null });
  await sync(old.id, old.mods[0].id, { current_column_index: 1, column_remaining_ms: 60000 });
  r = await api("POST", "/api/kecermatan/log", { session_id: old.id, module_session_id: old.mods[0].id, logs: logs.slice(0, 2) });
  check("sesi lama tanpa nomor paket: klik Kecermatan tersimpan (Paket 7)", r.status === 200 && r.json?.inserted === 2, `status ${r.status} ${r.text.slice(0, 80)}`);

  // ── 7. Versi ──────────────────────────────────────────────────────────────
  r = await api("GET", "/api/version");
  check("/api/version", r.status === 200 && "version" in (r.json ?? {}), r.text.slice(0, 80));
} catch (e) {
  check("dry run berjalan tanpa exception", false, e.message ?? String(e));
} finally {
  // ── Bersihkan semua baris akun sementara ──────────────────────────────────
  const mods = sessionIds.length ? (await s.from("module_sessions").select("id").in("test_session_id", sessionIds)).data ?? [] : [];
  const mids = mods.map((m) => m.id);
  if (mids.length) {
    await s.from("answers").delete().in("module_session_id", mids);
    await s.from("kecermatan_logs").delete().in("module_session_id", mids);
    await s.from("module_sessions").delete().in("id", mids);
  }
  if (sessionIds.length) await s.from("test_sessions").delete().in("id", sessionIds);
  for (const t of ["latihan_attempts", "practice_progress", "latihan_kecermatan_scores", "drill_answers", "keswa_attempts"]) await s.from(t).delete().eq("user_id", userId);
  await s.from("users").delete().eq("id", userId);
  const left = await Promise.all([
    s.from("users").select("id", { count: "exact", head: true }).eq("id", userId),
    s.from("test_sessions").select("id", { count: "exact", head: true }).eq("user_id", userId),
    s.from("latihan_attempts").select("id", { count: "exact", head: true }).eq("user_id", userId),
    s.from("practice_progress").select("user_id", { count: "exact", head: true }).eq("user_id", userId),
  ]);
  check("pembersihan: tidak ada sisa data akun sementara", left.every((x) => x.count === 0), left.map((x) => x.count).join("/"));
  const failed = results.filter((x) => !x.ok).length;
  console.log(`\n${results.length - failed}/${results.length} lulus`);
  process.exitCode = failed ? 1 : 0;
}
