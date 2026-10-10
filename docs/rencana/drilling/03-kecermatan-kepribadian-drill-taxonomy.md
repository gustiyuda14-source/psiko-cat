# 03 — Drill taxonomy: KECERMATAN, KEPRIBADIAN, SIKAP KERJA (planning only)

Status: plan only. No code, no item writing. Modelled on dajiks-cest drilling: sub-task × tier, short sets, rich pembahasan, results tracked per sub-task.

Source abbreviations (all under `scratchpad/txt/`):
- **KC** = `1_5017529637278843693.txt` (Greek Kecermatan, 10 kolom × 50)
- **KP** = `1_5017233494988817385.txt` (Kepribadian Likert-4, 90 items)
- **SK** = `5_6172464214532164661.txt` (Sikap Kerja, 63 A/B pairs). Item *n*: stem at line 2n−1, options at line 2n.
- **SKK** = `5_6172464214532164662.txt` (key for SK)
- Repo = `psiko-cat/`

---

## 0. Baseline: what the repo scores and shows today

| Fact | Where |
|---|---|
| Ke = klik/500×100; Kt = benar/klik×100; Kh = max(0, 100 − SD/15×100), SD = population SD of klik per lajur | `lib/scoring/kecermatan.ts:5-15, 42-45, 78-89` |
| Nilai murni Kecermatan = 0.3Ke + 0.4Kt + 0.3Kh; NAP contribution = ×0.2; gugur at raw ≤ 40 | `kecermatan.ts:92-102` |
| Kepribadian: Σ weights (fav A..E = .20/.15/.10/.05/.04, unfav reversed); raw = Σ/20×100; unanswered = 0 | `lib/scoring/kepribadian.ts:32-49`, `scripts/seed-kepribadian-v2.ts:34-43` |
| NAP = Kecerdasan (60) + Kepribadian (20) + Kecermatan (20); gugur if any raw ≤ 40 or NAP < 61 | `lib/scoring/nap.ts:29-73` |
| 60 s per lajur, 5 s intro between lajur | `lib/stores/kecermatan-store.ts:4`, `LatihanKecermatan.tsx:17` |
| Kecermatan packages 3-8 (emoji/symbol), 101-105 (angka-huruf) | `lib/test-config.ts:22, 37` |
| Kepribadian drill packages 2-11 are empty slots; package 1 is simulation-only | `lib/test-config.ts:43-60` |
| Latihan Kecermatan shows only total correct + accuracy and a per-column accordion. No Ke/Kh, no RT, nothing saved | `LatihanKecermatan.tsx:85-111`; "latihan never persists": `KECERMATAN_SEED_PLAN.md:94` |
| Latihan Kepribadian: one flat run of 100 statements, then a review. No timing, no per-aspect result, nothing saved | `LatihanKepribadian.tsx:12-95` |
| Sikap kerja forced-choice: **no module, scorer, or NAP slot in the repo** (it only appears in research notes) | `docs/riset/research_notes/.../kepribadian_likert_forcedchoice.md:1, 94` |

**Implication for measurement.** Tracking results per sub-task needs persisted drill attempts. One row per attempt, with sub-task, tier, metrics and per-item log, is enough. This is a schema decision to align with the `cest-drill-mapper` plan, not to design twice.

---

## 1. KECERMATAN drill sub-tasks

### 1.1 Symbol families (sub-task axis A)

Each `kolom` in the bank has its own 5-symbol key table (`bank_soal_p*.json → kolom[].simbol`). Rule: tag each column with **family** and **similarity tier S1–S3**, so drills can pull columns by tag.

| Family | Existing columns (package:col) | Notes |
|---|---|---|
| F1 Emoji, objects from different categories | p8:1,2,3,5,6,8,9,10 · p7:7,8,10 · p4:1,8 · p7:4 (suits) | Mostly S1 |
| F2 Emoji, same category / near-identical | p3:2,10 · p4:2,5,7,9,10 · p5:1-4,6,8,9,10 · p6:1-4,6-10 · p8:4,7 | S2–S3. p5 people/ZWJ and p4:9 banknotes (💵💴💶💷) are the hardest |
| F3 Zodiac | p3:1 (♈♉♊♋♌) | S2: glyph detail, low familiarity |
| F4 Geometric / box-drawing / line glyphs | p4:3 ╠╣╦╩╬ (S3) · p4:4 ⇇⇈⇉⇊⇄ (S3) · p3:7 ◓◒◐◑◍ (S3) · p3:5 clocks (S3) · p3:6, p7:5 moon phases (S3) · p3:4 weather (S3) · p3:9, p7:1, p7:2, p7:6 dice (S2) | Orientation and fill-fraction discrimination |
| F5 Greek / math letters | **KC (not in repo)** · p7:3 ∑∏∫∂∞ (S2) | KC confusers are **Π/ϖ** (kolom 3, 5, 8, 10), **ζ/ξ** (kolom 3, 5, 8, 10) and **θ/Φ** (kolom 1, 4, 6, 9) (KC:3, 57). ε and θ are *not* a strong look-alike pair; the real ε-trap is **re-lettering** (next row) |
| F6 Angka-huruf (alphanumeric) | p101 (S1, ordered alphabet: `A2 5B C8 3D E6`) · p102–p105 (S3: shared characters, e.g. p102:3 `R6/R5`, p104:3 `R3/R8`, p105:1 `7J/7F`, `U5/U4`) · p3:8 | Similarity can be computed objectively (shared characters, same position) |

**Interference / re-lettering (cross-family).** In KC, kolom 1 is `a ε, b Π, c Γ, d Φ, e θ` and kolom 4 is `a ε, b Φ, c μ, d Γ, e θ` (KC:3). The same symbols move to other letters, and kolom 6-10 repeat kolom 1-5 (KC:57). This proactive interference is the realistic Tier-3 stressor, more than a "harder glyph".

**Objective similarity rubric.**
- **S1**: 5 different semantic categories or silhouettes. For alphanumeric tokens, no character shared between tokens.
- **S2**: same category, but silhouette or colour is distinct. For alphanumeric tokens, 1–2 tokens share a character.
- **S3**: same silhouette and differs only in orientation, fill, stroke or gender sign. For alphanumeric tokens, ≥ 3 tokens share characters, or two tokens share the same character in the same position (R6/R5).

Emoji S-tags need a two-rater admin tagging pass. Alphanumeric S-tags can be computed.

### 1.2 Drill modes (sub-task axis B): one mode per scored index

Arithmetic from `kecermatan.ts`:
- Kh = 100 − 6.667·SD, so SD 1.5 → 90, 3 → 80, 4.5 → 70, **9 → 40**.
- Klik per lajur → Ke: 20 → 40, 30 → 60, 40 → 80.
- One extra klik with probability p of being correct changes raw by about **+0.06 + 40·(p − Kt)/K**. The break-even is p* = Kt − 0.0015·K: about 0.50 at K = 300 and 0.35 at K = 400. **Random guessing (p = 0.2) lowers the score** until K ≈ 500. Uncertain-but-likely (≥ 50%) clicks raise it. This belongs in the pembahasan as strategy, with the caveat that this is the platform's formula, not a published POLRI formula.

| Mode | Trains | Definition | Duration / columns | Shown after the set |
|---|---|---|---|---|
| **KE-Sprint** | Speed (Ke) | One table, answer as many as possible. Kt floor 85%: a set below it is marked "tidak sah" and does not count toward progression | 1 kolom × 30 s (warm-up) or 1 × 60 s; set = 3 sprints with new tables | klik/kolom, median RT and RT p90 (seconds/item), projected Ke = klik×2, Kt (floor check) |
| **KT-Presisi** | Accuracy (Kt) | No time pressure first, then a soft cap. Every error is logged with its confuser | 2 kolom × 50 items (100 items gives 1% Kt resolution); T1 untimed, T2 90 s/kolom, T3 60 s | Kt%, error matrix (which symbol was chosen instead of which), errors by key letter A–E, errors in the first 5 items after a table change (adaptation cost) |
| **KH-Ketahanan** | Endurance / consistency (Kh) | Sequential lajur, no going back, 5 s intro, exactly like the exam (`EngineKecermatan`). **All lajur in one set use the same S-tier**, otherwise SD measures difficulty rather than endurance (`docs/riset/.../kecermatan_kraepelin_pauli.md:103`) | 5 × 60 s (mini) → 10 × 60 s (full) | klik per lajur line chart, SD, Kh, slope (mean of last 3 minus mean of first 3 lajur), detrended SD (`kraepelin_pauli.md:99`), drop lajur (largest fall), **and** a projected Nilai Murni / NAP contribution (full 10-lajur only) |
| **Adaptasi** (optional 4th) | Table-switch cost | Lajur of 15 items, table changes every lajur, re-lettered symbols | 6 × 20 s | RT of items 1–3 vs 4–15 after each switch |

Note: KH mode is noisy with 10 points (`kraepelin_pauli.md:86, 102`). Show it as a band (Stabil / Fluktuatif / Menurun), not as a precise score.

### 1.3 Tier targets (derived from `kecermatan.ts`)

| Tier | Klik/lajur (s/item) | Kt | SD (Kh) | Projected raw → NAP pts | Meaning |
|---|---|---|---|---|---|
| Dasar | ≥ 20 (≤ 3.0 s) | ≥ 90 | ≤ 4.5 (≥ 70) | 12 + 36 + 21 = **69 → 13.8** | Safely above gugur (≤ 40), "Cukup" |
| Menengah | ≥ 30 (≤ 2.0 s) | ≥ 93 | ≤ 3.0 (≥ 80) | 18 + 37.2 + 24 = **79.2 → 15.8** | Upper Cukup |
| Mahir | ≥ 40 (≤ 1.5 s) | ≥ 95 | ≤ 1.5 (≥ 90) | 24 + 38 + 27 = **89 → 17.8** | Baik Sekali |

**Ke floor in every tier.** Nobody passes a tier with Ke < 40, even when Kt and Kh are high. Reason: the formula gives 70.6 for answering one item per lajur correctly (`docs/SCORING_NAP.pdf` §8 finding 4). Drills must not reward that.

### 1.4 Difficulty tiers (concrete criteria)

| Tier | Symbol similarity | Key-table handling | Time per kolom | Shown order |
|---|---|---|---|---|
| **T1** | S1 only (F1, p101, p7:4) | New table per kolom, no re-lettering of earlier symbols | 90 s (Presisi untimed) | Random order of the 4 shown symbols |
| **T2** | S2 (F2 easy, F3, F5 p7:3, p3:9, p7:1, 2, 6) | New table per kolom; ≤ 1 symbol carried over from the previous kolom | 60 s (exam pace) | Random |
| **T3** | S3 (F4 hard, p5 ZWJ people, p102–105, KC Π/ϖ, ζ/ξ, θ/Φ) | **Re-lettering**: ≥ 3 symbols from kolom *k−1* reappear under different letters (KC kolom 1↔4 pattern) | 50 s (overload; real exam stays at 60) | Random |

Promotion: two consecutive sets meeting the tier target in that mode and family. Demotion: two consecutive "tidak sah" sets (Kt floor not met).

### 1.5 Sub-task grid and learning path
Sub-task id = `KC.<mode>.<family>.<tier>`, e.g. `KC.KT.F5.T3`. Not every cell is needed:
1. Orientation: keyboard A–E strip (`KecermatanKeyStrip`), F1-T1 Presisi untimed
2. KT-Presisi T1 → T2 on F1/F6 (accuracy first, because it carries 40% weight)
3. KE-Sprint T1 → T2 (speed only once Kt ≥ 90 is stable)
4. Family drills T2 → T3 for the weakest family, chosen from the KT error matrix
5. KH mini (5 lajur) → KH full (10 lajur), same S-tier throughout
6. T3 interference (re-lettering, KC pattern)
7. Full simulation (existing package flow)

Minimum bank per family × tier: ≥ 6 distinct key tables × 50 items (300 items), so that tables cannot be memorised across repeats. Missing-symbol items can be derived mechanically from a table (KC: each letter missing exactly 10× per kolom, verified on all 10 kolom), so the binding constraint is **tagged tables**, not authored items.

---

## 2. KEPRIBADIAN drill design (6 aspects)

### 2.1 What "drilling" can legitimately mean, and the ethics limit

Be direct about this. A personality inventory has no correct answers (KP:5-6 says so itself). A drill that teaches a candidate to reproduce the A/D key is **coaching to fake**. The research notes in the repo document the consequences:
- Applicants already inflate conscientiousness and emotional stability (d ≈ 0.3–0.45; instructed faking d 0.5–0.7), and faking lowers reliability (`kepribadian_likert_forcedchoice.md:18, 135-143`).
- Commentary cited in `etika_hukum_keamanan_standar.md:57` argues that "kursus tes psikologis" coaching breaches the code of ethics.
- Reusing operational items is the specific red line (`etika_hukum_keamanan_standar.md:62`).
- Anything presented as a psychological interpretation of the person should be avoided (UU 23/2022, `etika_hukum_keamanan_standar.md:274`).

Prep institutions frame this as *"memahami karakter/profil yang dibutuhkan Polri, menjawab konsisten dan tidak ragu-ragu"*. That framing is defensible **only if** the platform teaches understanding and self-reflection, rather than an answer sheet to memorise.

**The platform should:**
- Teach the construct: what each aspect means for police work, and which wording is favorable vs unfavorable.
- Train *reading* of comparative stems (X "lebih baik daripada" Y), because misreading the direction is a real, non-fake error.
- Measure **consistency** across items of the same aspect and response style (extreme or neutral overuse, acquiescence).
- Label every score "Kesesuaian dengan kunci latihan platform", never "kepribadian Anda".
- Flag disputed keys (§5) instead of presenting them as truth.
- Pair every "your answer differs from the key" with a reflective / development prompt.

**The platform should not:**
- Offer a "hafalkan kunci" view of answer letters.
- Claim the key equals the official POLRI key. It is a prep-material key; the real scoring is not public.
- Promise that drilling guarantees passing.
- Reuse simulation/operational items in drills. This is already partly enforced by package 1 being simulation-only (`test-config.ts:43-46`).

### 2.2 Scale mismatch (must fix before any drill)

| PDF (KP:9-12), 4-point | Repo (`seed-kepribadian-v2.ts:34-40`), 5-point |
|---|---|
| A = Sangat Tidak Sesuai | A = Sangat Setuju |
| B = Tidak Sesuai | B = Setuju |
| C = Sesuai | C = Netral |
| D = Sangat Sesuai | D = Tidak Setuju |
| — (no midpoint) | E = Sangat Tidak Setuju |

- **The letters are inverted.** PDF "D" (ideal for favorable items) equals repo "A". The seed stores *polarity*, not letters, and I verified that all 90 repo polarities match the PDF key exactly (D → favorable, A → unfavorable). The DB is therefore correct today, but any future import that copies letters would flip every item.
- **Midpoint.** The repo adds Netral, which the source test does not have. Choosing all-Netral gives 100 × 0.10 = 10 points → raw **50**, which passes the gugur rule. Drills that claim "exam realism" should use a 4-point mode, or at least report the Netral rate.
- **Wording.** "Sesuai/Tidak sesuai" (self-description) vs "Setuju/Tidak setuju" (opinion). For comparative stems these are not the same question.
- **Acquiescence exploit.** The repo has 67 favorable and 33 unfavorable items. Answering "A" to everything gives 67×0.20 + 33×0.04 = 14.72 → raw **73.6**. A drill set must be polarity-balanced (50/50), or this response style will look like "good profile".

### 2.3 Drill sub-tasks (per aspect: Prososial, Pengambilan Keputusan, Penyesuaian Diri, Kepercayaan Diri, Stabilitas Emosi, Motif Berprestasi)

| Sub-task | What the candidate does | Metric | Legit? |
|---|---|---|---|
| **KP.A Kenali aspek** | Read the aspect definition and police-work examples, then classify a statement into its aspect | % correct aspect | Yes (construct understanding) |
| **KP.B Arah pernyataan** | Label a statement as favorable or unfavorable for its aspect, *without answering it* | Polarity-recognition accuracy | Yes. It teaches reading, not faking |
| **KP.C Bedah perbandingan** | For "X lebih baik/memalukan daripada Y" stems: identify X, Y and the comparator word, then say which side the aspect favours (78 of 90 KP items are comparative) | Parse accuracy; errors where the comparator word (e.g. "memalukan", "menyebalkan", "lebih buruk") reverses the direction, as in KP items 2, 6, 28, 71 | Yes |
| **KP.D Konsistensi** | Answer honestly. The set contains pairs measuring the same aspect in opposite polarity | Consistency index = mean distance between the two answers of a pair after reverse-keying; extreme rate (% SS/STS); Netral rate; acquiescence (agreement with both F and UF items) | Yes. Self-knowledge plus response style |
| **KP.E Spontan berwaktu** | Full aspect block (15 items), about 36 s per item (3600 s / 100, `test-config.ts:13`) | Agreement with the key per aspect (weighted), median RT, % answered (blank = 0 points) | Grey zone. Allowed only with the framing in §2.1 |

**Tiers per aspect.**
- **T1**: direct "Saya …" self-statements with clear polarity, e.g. KP 30, 31, 34, 42, 48, 52.
- **T2**: comparative stem with a clear contrast, e.g. KP 13, 14.
- **T3**: comparative stem where both sides are desirable, or the comparator reverses the direction, e.g. KP 2, 28, 55, 71, 83.

Items with disputed or non-sensical keys (§5) stay **out of T1–T3 scoring** and appear only in pembahasan as "diskusi".

Learning path: KP.A → KP.B → KP.C (T1 → T3) → KP.D → KP.E per aspect → full mixed 100.

---

## 3. SIKAP KERJA forced-choice (63 items)

### 3.1 Key, decoded from SKK
SKK prints the key out of order: 1-18 at line 3, 26-43 at line 7, 51-63 at line 11, 19-25 at line 13, 44-50 at line 17. Decoded:

`1B 2B 3B 4A 5A 6A 7B 8B 9A 10B 11A 12A 13B 14B 15A 16A 17B 18A 19B 20B 21B 22B 23B 24A 25B 26A 27B 28B 29B 30A 31B 32A 33A 34A 35A 36B 37A 38A 39A 40A 41A 42A 43A 44A 45B 46B 47B 48A 49B 50A 51A 52A 53B 54A 55A 56A 57A 58B 59B 60B 61B 62B 63B` (A = 32, B = 31: position-balanced).

### 3.2 Inferred value dimensions and consistency check

| Dim | Value pair | Items → keyed choice | Consistency |
|---|---|---|---|
| D1 | **Kebenaran vs kebaikan** | 9 Kebenaran, 11 benar, 17 benar (A/B positions swapped vs 11), 50 kebenaran | **Consistent** (4/4). Also a good position-swap check |
| D2 | **Keterbukaan vs kerahasiaan** | 5 keterbukaan, 21 keterbukaan (over kewenangan), 45 keterbukaan, 52 keterbukaan, 62 membuka informasi | **Consistent** (5/5) |
| D3 | **Penegakan aturan/sanksi vs kesadaran/pembinaan** | 14 menegaskan aturan, 24 peraturan (over hati), 32 sanksi (over nasehat), 44 sanksi (over solusi), 47 kepatuhan (over kesadaran), 49 menegakan aturan | **Consistent** (6/6). 44 is debatable ("kelalaian" → sanksi over solusi) |
| D4 | **Kepatuhan/standar vs inovasi/perubahan** | Compliance: 2 legalitas, 23 standar, 26 kompetensi (over inovasi), 36 belajar resmi, 48 ketaatan regulasi. Innovation: 15 **merubah struktur** (over *mematuhi struktur*), 16 program baru, 22 terobosan, 27 kebaruan, 33 mengembangkan, 53 mengembangkan konsep, 59 **merubah sistem** (over *menegakan system*) | **Contradiction.** 15 and 59 reject "mematuhi struktur / menegakkan sistem", while 47, 48 and 49 make compliance and enforcement the ideal. 23 (kompleks → standar) and 26 (sulit → kompetensi, not inovasi) vs 16 (tantangan program → baru). The only coherent rule is "inovasi untuk program/konsep, patuh untuk hukum/prosedur"; 15 and 59 break it |
| D5 | **Kewenangan vs kepercayaan/kepedulian/kemampuan/target** | 10 wewenang (over prioritas), 25 kewenangan (over kepercayaan), 28 wewenang (over target), 61 kewenangan (over kemampuan) vs **46 kepedulian (over kewenangan)** | **Contradiction**: 46 vs 10/25/28/61. Plus tension: 25 rejects kepercayaan, while 34 keys "menjaga kepercayaan" |
| D6 | **Keberanian/risiko vs kehati-hatian** | 4 keberanian (over kehati-hatian), 31 keberanian (over kesiapan), 35 keberanian (over kesepakatan), 13 menciptakan tantangan vs **56 mengukur resiko (over mengambil)**, 8 mengukur target | **Contradiction**: 56 vs 4/31 (the most direct pair is 31 kesiapan rejected vs 56 calculated chosen) |
| D7 | **Ketegasan vs kesabaran/ketenangan** | 19 tegas, 42 ketegasan; ketenangan: 12 ketenangan, 20 menenangkan vs 13 (ketenangan rejected) | Tegas is consistent; ketenangan is mildly inconsistent (13 vs 12/20) |
| D8 | **Kemandirian vs kebersamaan** | 1 menyelesaikan (over konsultasi), 6 kemandirian, 40 kemandirian, 55 keuletan (over kekompakan), 18 prestasi (over sosialisasi) vs 3 partisipasi, 58 menerima masukan, 51 "menentukan pilihan kelompok" (ambiguous wording) | Mostly consistent. 51 is ambiguous |
| D9 | **Religiusitas / makna** | 30 awal kehidupan, 37 nikmat beribadah, 38 keterpurukan, 39 penghayatan, 41 hasil berdo'a (over berusaha), 54 ujian kehidupan | Internally consistent. 41 is debatable against the achievement items 18 and 63 |
| D10 | **Proses vs hasil** | 63 prioritas hasil, 60 kualitas-kuantitas (over **integritas-kapasitas**), 8 mengukur target, 28 wewenang over target | Mixed. 60 is questionable for a police integrity profile |
| D11 | **Refleksi / belajar** | 29 dari kegagalan, 57 kelemahan, 58 menerima masukan, 7 proaktif, 43 menyesuaikan strategi | Consistent |

Near-duplicate stems that are useful as built-in consistency probes: 14 ↔ 49 (same options, both B ✓), 32 ↔ 44 (sanksi ✓), 8 ↔ 43 ("persaingan ketat", different option sets), 11 ↔ 17 (position-swapped ✓), 5/21/45/52/62 (info ✓).

### 3.3 Drill sub-tasks per dimension
- **SK.Dn.T1**: pairs where one option is clearly the police value (D1, D2, D3).
- **SK.Dn.T2**: both options desirable, so the candidate must know the institution's priority rule (D4, D5, D6, D8).
- **SK.Dn.T3**: near-duplicates and position swaps, scored on *consistency with one's own earlier choice* as well as agreement with the key.
- **Pembahasan per item**: name the dimension, give the priority rule, and cite the sibling items. For contradictory items (15, 59, 46, 56, plus disputed 41, 44, 60), show "kunci sumber tidak konsisten" and do not score them toward mastery.

Ethics: the same as §2.1, and stronger here. The key is a single-answer "correct" key, so the instrument behaves like a values-knowledge test. Without desirability-matched pairs it offers no faking resistance (`kepribadian_likert_forcedchoice.md:122`). Teaching the *value rules* is legitimate institutional-values education; presenting it as personality measurement is not.

---

## 4. Measurement design

| Area | Sub-task unit | Primary metric | Set size | Min items per tier in bank | Pass rule |
|---|---|---|---|---|---|
| Kecermatan KE | family × tier | klik/lajur, median RT | 3 × 60 s | 6 tables (300 items) | Tier klik target, Kt ≥ 85 |
| Kecermatan KT | family × tier | Kt%, confuser matrix | 100 items | 6 tables | Tier Kt target, Ke ≥ 40 |
| Kecermatan KH | tier | SD / Kh, slope, band | 5 or 10 lajur | 10 same-tier tables | Tier SD target, 2 consecutive |
| Kepribadian KP.B/C | aspect × tier | recognition / parse accuracy | 10 items | 20 per aspect × tier (10 set + 10 reserve) → 360 total; **current 100 (+10 NEW) = gap of about 250** | ≥ 90% |
| Kepribadian KP.D | aspect | consistency index, extreme/Netral rate | 12 (6 pairs) | 12 pairs per aspect | Consistency ≥ 0.8; no pass/fail on agreement |
| Kepribadian KP.E | aspect | agreement % with key (weighted), RT | 15 items | 15 per aspect (= one KP block) | Report only |
| Sikap kerja | dimension × tier | agreement %, self-consistency | 8–10 pairs | ≥ 12 per dimension; D1 has 4, D2 5, D6 6 today → **gap** | ≥ 80% on non-disputed items |

**Mapping to NAP (projection only, clearly labelled):**
- **Kecermatan**: only the full 10-lajur KH set may show "proyeksi kontribusi NAP" = 0.2 × (0.3Ke + 0.4Kt + 0.3Kh) (`kecermatan.ts:92-93`). KE and KT sets show only their own index, plus "what this index adds" (Ke 1 point = 0.06 NAP pts; Kt 1 point = 0.08; Kh 1 point = 0.06).
- **Kepribadian**: per-aspect points use the 17- or 16-item aspect max (3.4 / 3.2 pts, from the distribution in `seed-kepribadian-v2.ts:47`). The overall 20-point projection appears only on a full 100-item polarity-mixed run, with the disclaimer.
- **Sikap kerja**: **there is no NAP slot**. Decide first: fold it into Kepribadian's 20 points, or make it a standalone report-only score. Do not invent a weight.

Learning-path order across modules: Kecermatan first (pure skill, measurable gains), Sikap Kerja value rules second (knowledge), Kepribadian last (understanding and consistency, not score chasing).

---

## 5. Data problems in the sources

**KC (Greek):**
- No answer key in the file. It is derivable: each letter is missing exactly 10× per kolom, and all 500 rows contain 4 distinct in-table symbols (verified).
- Kolom 6-10 reuse the key tables of kolom 1-5 verbatim (KC:57 = KC:3). Interference is real, but the set is not 10 independent tables.
- Letters are lowercase a–e (KC:2); the repo uses A–E.
- Greek is not in any repo package (F5 is new). Seeding the PDF as-is would reuse prep-material items; check the licence/ethics first (`etika_hukum_keamanan_standar.md:62`).

**Repo Kecermatan banks:**
- p5 kolom 5 contains `耽` (a CJK character, very likely a corrupted emoji).
- p6 kolom 6 and kolom 9 have identical tables (😀😃😄😁😆).
- **p101 kolom 1 is a giveaway**: `A2 5B C8 3D E6`. Each token's letter equals its answer letter, so the item can be solved without scanning. All p101 tables follow an ordered alphabet sequence (S1).
- ZWJ / variation-selector emoji (p5 people, ☀️, 🏔️, 🎖️) can render as split glyphs on some devices. That is a fairness problem in T3.
- Key-letter imbalance: p4 (A 83, D 126), p5 (B 87, D 116), p3, p6. Errors-by-letter analysis must normalise for it.
- Spec gap: the `.py` says Kh ≤ 40 means automatic gugur; the code does not enforce it (`TRESHOLD PENILAIAN PSIKO POLRI.py:84` vs `nap.ts:54`; already noted in SCORING_NAP §8 #3). The `.py` also titles itself "Standar CAT … SSDM POLRI untuk Seleksi Kedinasan IPDN" (`.py:2`): mixed provenance, so the thresholds are platform assumptions, not an official POLRI norm.

**KP (Kepribadian), keys likely wrong or disputed (PDF # → repo seq):**
- 36 → 40: "sikap pura-pura untuk menyenangkan lebih baik" keyed **D** (KP:140). It rewards insincerity and contradicts 5/7 (ketulusan, KP:38, 44) and the repo's own explanation.
- 54 → 60: "Mending mengikuti saran orang lain daripada pendapat pribadi" keyed **D** (KP:199). It contradicts 50, 59, 60 (D, own judgement) and 47 (A) in the same aspect, and 26 (A) in PK. Likely should be A.
- 58 → 64: selfie over group photo keyed **D** (KP:211). This conflicts with Prososial / Penyesuaian Diri (40, 42 D).
- 21 → 39: "spontan bertindak daripada penuh pertimbangan" **D** (KP:90) vs 17 D (analysis) and 32 D (think about consequences).
- 2 → 2: leadership over loyalty keyed D *under Prososial* (KP:29) vs 73 D (comforting family over being a leader, KP:262).
- 61 → 68: self-blame keyed favorable for Stabilitas Emosi (KP:222). Debatable.
- 18 → 20: never changing a choice despite better alternatives keyed D (KP:81). Rigidity is rewarded.
- 85, 86 → 94, 95: "ahli > teratur/sistematis" and "menantang > ketelitian" keyed D (KP:300, 303). These are odd for a police profile, where ketelitian is itself scored.
- 43, 49, 53, 55 are debatable or ambiguous (53, "kelemahan … di bawah angka 3", KP:196, can be read both ways).

**KP, nonsensical comparators** (the X vs Y pair is not on one dimension, so any key is arbitrary): 27 forensik vs laboratorium (KP:110), 62 menerima kegagalan vs mengakui kelalaian (KP:225), 66 sabar antri vs hal baru (KP:239), 68 memuji vs mengalihkan marah (KP:245), 69 mengalah vs **menabung** (KP:248), 77 mencari jalan lain vs merencanakan masa depan (KP:276).

**KP, format and typos:**
- Item 90's key "D" sits on the stem line before the number (KP:314-316); a naive parser misses it.
- Typos: "becanda" (KP:71), "dilingkungan" (KP:42, 124), "menggangu" (KP:232), "sekedar" (KP:229), "dari pada" (KP:186, 229, 238, 243, 244, 249), "makan ." (KP:105), and informal "Mending" (KP:198).

**Repo Kepribadian:**
- 5-point vs 4-point and A/E letter inversion (§2.2).
- 67/33 polarity imbalance, so all-"A" scores raw 73.6.
- All-Netral scores raw 50 and passes.
- A blank answer = 0 points, lower than the worst option (0.04).
- 10 [NEW] items are not from the source (`seed-kepribadian-v2.ts:3-4, 66-166`).
- Float accumulation drift (SCORING_NAP §8 #1).

**SK / SKK (Sikap Kerja):**
- Key printed out of order (SKK:12-17), so the transcription risk is high.
- Contradictions: 15, 59 (D4); 46 (D5); 56 (D6); 13 vs 12/20 (D7).
- Disputed keys: 41 (berdo'a over berusaha), 44 (sanksi over solusi), 60 (kualitas-kuantitas over integritas), 51 (ambiguous).
- Odd phrasing: 5 "Melindungi keterbukaan" (SK:10).
- Typos: "Kreatiiftas" (SK:4), "kepercayaaan" (SK:68), "Menegakan" (SK:98, 118), "system" (SK:118), "Menjungjung" (SK:99), "Merubah" (non-baku, SK:30, 118), "resiko" (SK:112). Item 14 "Menegaskan aturan" is probably the same option as 49 "Menegakkan aturan".
- No scorer and no NAP slot in the repo (§0).
