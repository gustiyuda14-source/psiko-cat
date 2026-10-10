# 01 — CEST drill model → psiko-cat (planning only)

Read-only study. `CEST/` = `/Users/gustiputuyudawirashana/Downloads/dajiks-cest`, `PC/` = `.../PROJECT SISTEM PSIKO TERINTEGRASI/psiko-cat`.
I counted and measured the numbers marked (measured) myself on 2026-10-10 by reading the JSON files.

> **Correction to the brief:** drill results are **no longer** `cest_drill_res_<paket>`. Since 2026-10-07 the key is a single global `cest_drill_res` (also `cest_drill_seen`, `cest_mini_hist`, `cest_mini_seen`). This fixed a real bug: a student practised in Package 4, then opened Package 7, and the drilling page looked empty (CEST/assets/cest.js:17, CEST/MEMORY.md:178). Lesson for psiko-cat: **do not scope drill progress per package.**

---

## 1. CEST drill data model

**Unit = task.** A task is one stimulus with 1–5 questions (`qs[]`). Scoring counts questions; navigation counts tasks (CEST/scripts/BANK_SCHEMA.md:8-22).

**Fields that identify a task** (CEST/scripts/BANK_SCHEMA.md:10-13):
- `type`: sub-task code. 17 types in the drill bank: L1–L6, R1–R9, RP, W (measured). RP is drill-only and not a CEST type (BANK_SCHEMA.md:47; MEMORY.md:183).
- `cefr`: level A1/A2/B1/B2/C1. The engine maps it to a logit: A1 −2, A2 −1, B1 0, B2 1, C1 2 (CEST/assets/cest-engine.js:7). An optional `b` overrides it (cest-engine.js:56).
- `skill`: L/R/W.
- `id`:
  - drill: `<type>-<cefr>-Dnn`, numbered per type×level with no gaps. Writing is `W-Dnn` with no level (docs/rencana/ultra-plan-drill.md:44, :173-175).
  - Simulation Package 1: `<type>-<cefr>-nn`. Package N≥2: `<type>-<cefr>-PN-nn` (CEST/CLAUDE.md:53).
  - So the `D` / `PN` infix alone says which bank a task belongs to.
- Optional `batch`: drives the "Batch N · baru" badge on catalog cards and nav cells (cest.js:92, :226).

**The code relies on the type being the ID prefix.** Catalog counts and per-type reset use `id.split('-')[0]` and `startsWith(type + '-')` (cest.js:90, :101-102). The progress panel looks up type/level from the bank instead of parsing the ID (cest-progress.js:186-189).

**Sim bank vs drill bank are physically separate:**
- Sources: `scripts/bank/sim/pN/{listening,reading,writing}/` vs `scripts/bank/drill/{...}/` (CLAUDE.md:11, :53-55).
- Build outputs:
  - simulation → `data/bank.json` and `data/bank-pN.json`. Private: only `api/sim.js` reads them, and the middleware returns 404 for `/data` (CLAUDE.md:20, :29).
  - drill → `assets/drill-bank.json`. Public, because drilling is graded in the browser (CLAUDE.md:36, :79).
- Leak gate: `build_bank.py --pkg N` checks unique IDs and 8-gram overlap against other packages and the drill bank (build_bank.py:4-5, :116, :155). The drill plan's G7 requires 0 8-gram overlap with the simulation bank (ultra-plan-drill.md:227, :362).
- Reason recorded in the decision log: "Bank DRILL terpisah dari bank simulasi agar soal simulasi tidak bocor" (MEMORY.md:40).

**Packages point at the drill bank** through a `drill` field in `assets/packages.json`. All 7 active packages point at the **same** `assets/drill-bank.json` (packages.json:7, :15, ... :59). Drafts have neither `bank` nor `drill` (packages.json:64). `loadPackage` fetches `pkg.drill` (cest.js:26). So there is one drill bank, not one per package.

**Drill bank size** (measured): 426 tasks; L1 23, L2 47, L3 18, L4 15, L5 13, L6 12, R1 43, R2 72, R3 23, R4 22, R5 23, R6 9, R7 16, R8 8, R9 8, RP 4, W 70.

## 2. CEST drill UX flow, end to end

1. **Catalog (Drilling view).**
   - One card per `type` present in the drill bank, limited to the package's modules (cest.js:89-94).
   - Each card shows: `N task · <minLevel>–<maxLevel>`, an A1–C1 meter of the levels covered, a progress ring `[attempted, total]`, and the footer "Sudah dilatih n dari N task" or "Belum dicoba".
   - Filter chips: Semua / L / R / W / Belum dicoba. Search box (cest.js:96-99).
   - Rendering is done by `CestCatalog.ticket` (cest-catalog.js:14-37).
2. **Type modal "TIPE TERPILIH"** (`CestSheet.openDrill`, cest-sheet.js:79-99).
   - One row per CEFR level: `N task · x/N dikerjakan · y benar`, a progress bar, and a "Mulai" button (cest-sheet.js:83-86).
   - "Done" means the ID is in `results` OR in `seen` (cest-sheet.js:80).
3. **Picking the next unattempted task.**
   - `next(tasks)` = first not-done task in bank order, else wrap to the first task (cest-sheet.js:82).
   - Per level: "Mulai" on a level row.
   - Across levels: "Lanjutkan latihan" walks the A1→C1 groups in order (cest-sheet.js:96).
   - The "Latih lagi" button on the result screen uses a different picker, `drillPick`: the 3 tasks closest to B1 (|b|), with +1.5 added for already-seen tasks, then one of those 3 at random (cest.js:175-177).
   - Clicking a nav-pane cell opens that exact task (`startDrill(type, id)`, cest.js:179-181).
4. **Task screen.**
   - Same renderer as the simulation, plus drill-only extras: a right-hand nav pane (drawer on mobile), no timer, the exit button reads "Keluar latihan" (2× confirm), an audio visualiser, and a "Mulai sekarang" skip button (cest.js:151-154, :349; MEMORY.md:46-49, :74).
   - Switching task while there are unchecked answers asks for 1 confirm (cest.js:248).
5. **Pembahasan.**
   - `finishDrill` grades in the browser, then shows `reviewHtml(t, log)` next to a nav card on `#s-drill-result` (cest.js:361-372).
   - Every option is listed with ✓ Kunci / Jawabanmu marks. The key is always shown, even when the answer was right (MEMORY.md:160, :162).
   - Writing shows a model answer and an AI grammar-feedback panel (cest.js:367; MEMORY.md:108).
   - **Explanations are richer in drill.** The rule (ultra-plan-drill.md:109-110, :286): `expl` opens with the operation being tested, then gives the key + the quoted evidence + why **each** distractor fails + one tip, in Bahasa Indonesia.
   - Measured: median `expl` length is 175 chars in drill vs 84.5 in simulation p1. The simulation rule is "1 short sentence" (BANK_SCHEMA.md:29).
   - Example R1-B2-D01: "...memuji anggaran ('solid') tetapi meragukan jadwal... Tips: 'though I wonder' adalah cara sopan...".
6. **Nav pane statuses** (cest.js:213-229; MEMORY.md:48).
   - Cells grouped by CEFR.
   - `ok` (solid green) = all correct; `bad` (red) = any wrong; `done` (pale green) = seen without a score (Writing / old data); `todo` (white).
   - Legend shows counts. The aria-label carries the `x/n` score.
7. **Reset per type.** "Ulang tipe ini dari nol" asks for 2 confirms (cest-sheet.js:89-93). It removes only that type's IDs from `drill_res` and `drill_seen`, by prefix (cest.js:100-104), then reopens the modal empty.
8. **"Start from zero".** Button `#btn-drill-zero` under the drill progress panel, 2 confirms. Clears all `drill_res` and `drill_seen`. Simulation data is not touched (cest.js:480; index.html:134; MEMORY.md:54).

## 3. Measurement

**Recorded per task:** `cest_drill_res = { [taskId]: [correctQs, totalQs] }`, plus `cest_drill_seen = [taskId]`.
- Written in `finishDrill`; the last attempt overwrites (cest.js:369-370).
- Writing tasks only enter `seen`.
- No timestamp, by decision: time trends were deferred, `drill_res` stays `{id:[benar,total]}` (MEMORY.md:155).

**Drill progress panel `#drill-prog`** (`CestProgress.buildDrill` / `drillHtml`, cest-progress.js:188-241). It shows:
- coverage: `done / total task` with a bar;
- overall practice accuracy: `ok/n` questions;
- accuracy per type, sorted weakest first, with `done task · ok/n soal`;
- lists of types "done but unscored" and "not tried";
- accuracy per CEFR level (A1–C1 tiles).

**"Latih tipe terlemah" button:**
- Shown only when some type has ≥5 questions answered (`WEAK_N`) and accuracy below 80% (`WEAK_BELOW`) (cest-progress.js:7, :209, :235).
- The same rule drives the drilling line on Beranda (cest-progress.js:67; MEMORY.md:156).
- The panel is labelled "Akurasi latihan", not a score estimate (cest-progress.js:216).

**Simulation report → drilling:**
- `typeRows` sums correct/total per type from the module log (cest-report.js:170-182).
- `weakTypes` keeps types with n≥2, accuracy <80%, **and present in the drill bank** (`drillTypes.includes`), at most 2 (cest-report.js:183).
- These feed:
  - the primary button "Latih titik lemah: <type>" (`topAction`, cest-report.js:185-188);
  - "Latih <type>" buttons under the diagnostics (cest-report.js:189-198);
  - a per-task "Latih" button on each **wrong** review card, again only if the type exists in the drill bank (cest-tasks.js:179; MEMORY.md:128).
- Clicking `data-drill-go` calls `startDrill(type)` (cest.js:463-464).

**Tryout mini built on the drill bank** (CEST/assets/cest-mini.js:1-5, :17-37):
- Same adaptive engine as the simulation (`pickTask/record/isDone/result`), 45 minutes, no going back. It runs locally over `DRILL` filtered by skill.
- Results go to `cest_mini_hist` (max 20) and `cest_mini_seen` (cest-mini.js:40-47). They are kept separate from the simulation and do **not** touch drill ok/bad statuses.
- Its result screen reuses the diagnostics, which link back into drilling (cest-mini.js:68, :112).

## 4. Storage

**localStorage (browser):**

| Key | Contents |
|---|---|
| `cest_drill_res` | drill results per task |
| `cest_drill_seen` | drill tasks seen |
| `cest_mini_hist` | tryout mini history |
| `cest_mini_seen` | tryout mini tasks seen |
| `cest_vocab_known` | vocabulary marked as known |
| `cest_state_paket-N` | simulation results + review |
| `cest_hist_paket-N` | attempt history |
| `cest_seen_paket-N` | simulation tasks seen |
| `cest_cur_paket-N` | running session (not synced) |
| `cest_drill_wdraft_paket-N_<id>` | Writing drill draft (not synced) |

Drill and mini keys are global; the rest are per package (cest.js:17, :20, :397).

**Server sync: `/api/sync` (GET all keys / PUT `{key, v}`).**
- Writes to the Supabase table `cest_sync(user_id, key, value jsonb, updated_at, PK user_id+key)`, RLS on, no policies, accessed with the service key (MEMORY.md:155).
- Key whitelist regex (CEST/api/sync.js:10):
  `^cest_(state|hist|seen|drill_res|drill_seen|mini_hist|mini_seen)_paket-[1-9]\d?$|^cest_(drill_res|drill_seen|mini_hist|mini_seen|vocab_known)$`
  The client mirrors it (cest-sync.js:6).
- Max 1 MB per key. User ID comes from the cookie, never the body.
- Client `CestSync` behaviour:
  - `pull()` at boot, before the package loads;
  - `touch()` on every `store.set`, debounced to 1.2 s;
  - merge rule for `drill_res` = local wins (MEMORY.md:155);
  - `migrate()` folds old per-package drill keys into the global ones (MEMORY.md:178).
- Accepted weakness: the data is written by the client, so it can be manipulated (MEMORY.md:155).

## 5. Gap table vs psiko-cat today

Facts about psiko-cat that the table depends on:
- **Practice results are stored nowhere.**
  - `/api/practice/check` says "Stateless... Tidak menulis apapun ke DB" (PC/app/api/practice/check/route.ts:47).
  - The latihan gate tells users "tidak disimpan ke riwayat" (PC/app/latihan/[module]/LatihanGate.tsx:137).
  - After submit: "Jawaban latihan hanya tersimpan selama halaman ini terbuka" (PC/app/latihan/[module]/LatihanKecerdasan.tsx:110).
  - No latihan localStorage either: only `lib/stores/exam-store.ts`, `kecermatan-store.ts` and `app/rescue` use it.
- **The practice unit is a whole package.** A package is 100 items, answered all at once and checked at the end, one POST per item (LatihanKecerdasan.tsx:12-16, :73-92).
- **Package choice is the only axis** (PC/lib/test-config.ts:43-60). `Question` has no sub-material and no difficulty column (PC/prisma/schema.prisma:145-169).
- **The sub-material data exists but is dropped.** The source `soal.json` has `tipe` per item (measured over 100 items: hitung 25, silogisme 13, deret 13, wacana 12, pola_gambar 11, analogi 7, sinonim 6, antonim 6, ganjil 6, susun_gambar 1). `seed-kecerdasan.ts` does not write it (PC/scripts/seed-kecerdasan.ts:19, :43-50).
- **Kepribadian has `aspect` and `explanation`,** stored in `scoring_rule`, which is server-only (PC/scripts/seed-kepribadian-v2.ts:178-184).
  - But `LatihanKepribadian.tsx:139` reads `options_payload.aspect`.
  - So rows seeded by v2 probably show no aspect badge. Unverified against the DB: the Supabase MCP failed to connect this session.

| CEST drill capability | psiko-cat | What would host it in psiko-cat |
|---|---|---|
| Drill bank separate from simulation bank | **yes** (package level): Paket 1 = simulation, 2–11 = latihan (test-config.ts:43-60); the check route returns 403 for simulation-package items (route.ts:73-77) and 409 while a module of that type is live (route.ts:79-87) | keep as is. The comments at route.ts:12-16 and LatihanGate.tsx:18-21 ("F11", "bank sama") are stale |
| Sub-task "type" on every item | **no** for Kecerdasan (dropped at seed); **partial** for Kepribadian (`aspect` in scoring_rule); Kecermatan has `column_index` and the symbol / angka-huruf variants by package range (test-config.ts:32-41) | new field on `questions` (see §6) and a re-seed |
| Difficulty level per item (≈ CEFR) | **no** | new field on `questions` |
| Catalog of types with coverage ring / level meter | **partial**: `TicketCatalog` + `PackageCarousel` exist (cards, filters, ring, "Paket terpilih" modal with per-section rows, PackageCarousel.tsx:19-33, :128-160), but per package, not per type | reuse `TicketCatalog` / `PackageCarousel` for a per-sub-material catalog under `app/dashboard/latihan/<modul>` |
| Type modal: rows per level + "next unattempted" + continue | **no** (the modal shows package/column info only) | the PackageCarousel modal pattern, fed by user progress |
| Short task → immediate pembahasan | **no**: Kecerdasan = 100 items then one review; Kecermatan gives per-item feedback (LatihanKecermatan.tsx:158) | new short-set flow reusing `KecerdasanItem`/`KecerdasanReview` (PembahasanSection.tsx:96-210) |
| Rich explanation (key + distractor + tip) | **no** for Kecerdasan: `scoring_rule` holds only `correct_key` (safe-question.ts:46-50); the review shows only "Jawaban Anda" + "Kunci" (PembahasanSection.tsx:138-153). **partial** for Kepribadian (`scoring_rule.explanation` exists but is never returned or rendered) | add `explanation` to `scoring_rule`, return it from `/api/practice/check` (it already returns `correct_key`), render it in `KecerdasanItem` |
| Nav pane with ok/bad/done/todo history | **partial**: `QuestionNavigator` shows answered/unanswered for the current run only (LatihanKecerdasan.tsx:145-153) | extend `QuestionNavigator`, or a new pane fed by stored results |
| Per-task result `[benar, total]` persisted | **no** (stateless route) | new table written **by `/api/practice/check`** (server-graded, so stronger than CEST's client-written data) |
| Progress panel: coverage, accuracy per type/level, weakest-type button | **no** | new section on `/dashboard/latihan` (and Beranda) |
| Reset per type (2× confirm) / Start from zero | **no** (only "Mulai ulang latihan", which clears local state, LatihanKecerdasan.tsx:114-125) | DELETE on the new table, filtered by user (+ sub-material) |
| Simulation report → "Latih <type>" only if the type exists in the drill bank | **no**: `/dashboard/review` covers official sessions only and says "Latihan tidak masuk ke ruang ini" (review/page.tsx:64-69, :82) | `app/dashboard/review/page.tsx` + `PembahasanSection`: group by sub-material, add a link when the drill bank has that sub-material. Needs the sub-material on **Paket 1** items too |
| Tryout mini on the drill bank | **partial**: today's per-package latihan (100 items, optional timed mode for Kecermatan, PackageCarousel.tsx:70, :201) is effectively a "tryout mini" on non-simulation items, but scores are not stored | keep it as the tryout-mini equivalent; store its summary later if wanted |
| Cross-device sync | n/a: psiko-cat has a server DB (Supabase via supabase-js HTTP, see memory "DB connection fix") | a server table replaces localStorage + `/api/sync` entirely |

## 6. Recommended translation to psiko-cat

**Mapping:**
- CEST `type` → psiko-cat **sub-materi**:
  - Kecerdasan: the `tipe` values already in the source (hitung, deret, silogisme, wacana, analogi, sinonim, antonim, ganjil, pola_gambar, susun_gambar).
  - Kepribadian: `aspect`.
  - Kecermatan: aspect (simbol vs angka-huruf). Columns 1–10 are a time axis, not a sub-material.
- CEST `cefr` → **difficulty tier**, e.g. 1 mudah / 2 sedang / 3 sulit. This takes over CEFR's ordering role in the modal rows and per-level accuracy.
- CEST task → an item (butir). An item with a shared `sub_text` (wacana) could form a mini-task group.
- CEST per-package `drill` pointer → psiko-cat "every active question whose `package_number` ≠ `SIMULASI_PACKAGE`" (already enforced). The drill bank stays global across packages, as CEST's is.

**Minimum new data:**
1. `questions.sub_type text null`: the sub-material code. Indexed `(type, sub_type)`.
   It must be a column, or a field in `options_payload`, so the catalog and the review can read it without exposing `scoring_rule`. A column is simpler for counts and filters. Re-seed Kecerdasan from `soal.json.tipe`; take Kepribadian from `aspect`.
2. `questions.difficulty smallint null` (1–3). Without it, the per-level rows and the "next per level" logic collapse into one group per sub-material. That still works, but there is no level ladder.
3. `scoring_rule.explanation text`: server-only, returned by `/api/practice/check` next to `correct_key`. Format rule copied from CEST: operation tested, key + evidence, why each distractor fails, one tip, in Bahasa Indonesia.
4. New table `practice_results(user_id, question_id, correct smallint, total smallint, updated_at, PK(user_id, question_id))`.
   - Mirrors `drill_res`: last attempt overwrites. `updated_at` comes free and unblocks the time trend CEST deferred.
   - Written inside `/api/practice/check`.
   - "Seen without score" (Kepribadian) = a row with `total = 0`.

**Behaviour to copy as-is:**
- next-unattempted per level and across levels (cest-sheet.js:82, :96);
- nav statuses ok/bad/done/todo;
- reset per sub-material and global reset, both with 2× confirm;
- weakest-type rule: n≥5 questions and accuracy <80% (cest-progress.js:7);
- report links only to sub-materials present in the drill bank, max 2, n≥2 and <80% (cest-report.js:183);
- progress global, not per package (the bug fixed at MEMORY.md:178).

**Rule already applied in psiko-cat:** the drill bank is separate from the simulation bank. Paket 1 is simulation-only and is blocked at the check route (test-config.ts:43-46, :57-60; route.ts:73-77). Keep it that way. Note that CEST also runs an 8-gram overlap gate between banks (build_bank.py:116); psiko-cat has no equivalent check for near-duplicate items across packages.

**Open decisions for the user:**
1. Sub-material list per module: the Kecerdasan `tipe` set above as is, or regrouped (e.g. verbal / numerik / figural)? Kecermatan: is it drillable per sub-material at all, or does it stay package-level only (its measure is speed/accuracy/endurance, PembahasanSection.tsx:26-32)?
2. Difficulty: add a tier field now (and who labels ~1,000 items), or launch without levels?
3. Drill unit: one item per "task" (fast feedback), or a short set of N items of one sub-material (closer to CEST testlets)?
4. Kepribadian: no right/wrong answers. Track coverage only, or a favorable-score per aspect? CEST has no equivalent; Writing is "done without score".
5. Is the current 100-item per-package latihan kept as the "tryout mini" equivalent, and should its summary be stored?
6. Should the simulation review link to drilling? That needs `sub_type` on Paket 1 items too, which only labels them and does not expose them to latihan.
7. Explanations: who writes `explanation` for existing items? CEST generated them with a writer agent plus a blind QA agent from a different model (ultra-plan-drill.md:159-229).
