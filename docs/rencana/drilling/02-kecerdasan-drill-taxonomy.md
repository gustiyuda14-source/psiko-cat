# 02 — KECERDASAN drill taxonomy (planning only)

This is a planning document only. I did not change any project file and did not write any test items.

**Sources**

| Code | Source | Items | Key |
|---|---|---|---|
| **P** | `1_5015182875738244109.pdf`, the 100-item package. Its text matches `psiko-cat/soal.json` 1–100 | 100 | key published |
| **B** | `KECERDASAN PAKET 3 BINTARA.pdf`, 30 pages. I re-rendered it at 110 dpi in `scratchpad/r2/b-*.png` | 100 | no key |
| **A** | `KECERDASAN PAKET 3-AKPOL.pdf`, 26 pages, in `r2/a-*.png` | 100 | no key |
| **KD** | `SOAL KECERMATAN- d.pdf`. It is actually a CBT import template holding 25 mixed items | 25 | no key |
| **R** | `Menetukan Banyak Rute.pdf`, counting/route problems | 10 | no key |

- I looked at every page of B, A, KD and R.
- I spot-solved items to find defects. The answers I derived are marked "(derived)".
- Item numbers below are the item numbers printed on the page. Page = ceil(n/3.4) is only a rough guide; the exact pages are in the §1 tables.
- Not scanned: `KECERDASAN PAKET 2_BIT ARA.pdf` (26 pages, also image-only). It is the next source to classify.
- Prior figural work is reused, not redone: `analysis/pola-findings.md` and `analysis/susun-findings.md`.

**Official frame**
- The pedoman (§2.1) and `soal.json.metadata` use 4 subtests × 25 items: Verbal 1–25, Logis/Spasial 26–50, Analitis 51–75, Praktis 76–100.
- The test runs 100 items in 90 minutes (`TRESHOLD…py` §2), so the **mean budget is 54 s per item**.
- Scoring:
  - 1 point per item.
  - A two-key item scores only when both keys are right (pedoman §2.1B).
  - KS (score ≤ 40) on any subtest = automatic fail.
- Weight conflict to resolve before scoring is built:
  - the threshold doc says NAP = 60/20/20;
  - the pedoman BAB 4 says 40/40/20.

**What the packages actually look like.** B and A do **not** follow the 25/25/25/25 frame:

| Package | Verbal | Bacaan | Numerik / Praktis | Deret + angka | Logika / analitis | Figural |
|---|---|---|---|---|---|---|
| B | 24 | 11 | 35 | 10 | 10 | 10 |
| A | 25 | — | 25 | 10 + 2 kode | 12 wacana + 10 silogisme | 15 (5 of them are semantic icon items) |

The drill taxonomy therefore follows the **item families the sources contain**, not the 4 official labels. Each sub-task still keeps a `aspek_resmi` tag so scores can be reported against the official subtests.

---

## 1. Taxonomy tree

### 1.0 Codes and the "Bintara vs AKPOL" finding

**Code format:** `<ASPEK>-<SUBMATERI>-<SUBTASK>`, e.g. `VRB-SIN-2K`. This is the value for `questions.sub_type` as proposed in plan 01 §6. Difficulty goes in `questions.difficulty`: 1 = Dasar, 2 = Menengah, 3 = Lanjut.

**Answer formats:**

| Code | Meaning |
|---|---|
| 1K | one key, A–E |
| 2K | two separate keys a–e, scored all-or-nothing |
| PAIR | one option holding a pair, e.g. "M, J" |
| PERM | a permutation option, e.g. "2-4-3-1" |

**Honest finding: AKPOL is not uniformly harder than Bintara in these packages.** The levels differ mainly in *format* and *content domain*:

- **B (Bintara Paket 3)**
  - Verbal uses 1K "padanan kata" with rare or archaic words (MADAR, GANDUH, EPISTAKSIS).
  - Numerik is the **hardest of all sources**: nested roots, remainders of powers, algebraic identities, function sign analysis, quantitative comparison.
  - It has a reading-comprehension block (B25–35).
  - Figural content is mostly semantic icons plus rotation/mirror items.
- **A (AKPOL Paket 3)**
  - Verbal uses the 2K format of package P.
  - Numerik is mid-level: units, story problems, fractions.
  - Analytic wacana is heavier: multi-attribute ranking and scoring (A70–73).
  - Figural has 7 true 3×3 matrices with compound shapes, plus 3 strip-ordering items.
- **P (keyed, 100 items)** is format-identical to A on Verbal, Deret and Silogisme, and simpler in Hitung.

So the "level" column in the tables means **which package family uses the format**. Difficulty is set separately by tier (§2).

### 1.1 VERBAL (aspek_resmi: verbal)

| Code | Sub-materi → sub-task | Definition | Format | Items found | B vs A |
|---|---|---|---|---|---|
| VRB-SIN-2K | Sinonim → choose 2 of 5 words with the same meaning | 5 everyday or semi-formal words; one synonym pair plus 3 distractors from the same domain | 2K | P1–6 (6); A1–6 (6) | A only. A uses more Latin-derived words (Ekuilibrium/Keseimbangan A5, Abrasi/Erosi/Pengikisan A4 with a triple near-synonym trap) |
| VRB-SIN-DEF | Sinonim → padanan kata baku/langka: "X = …" | A rare, archaic, loan or technical word; choose its meaning (a word or a definition phrase) | 1K | B1–11 (11); KD16 (1) | B only. This is knowledge retrieval, not reasoning: either the student knows the word or not |
| VRB-ANT-2K | Antonim → choose 2 of 5 words with opposite meaning | Same layout as SIN-2K | 2K | P7–12 (6); A7–12 (6) | A only |
| VRB-ANT-1K | Antonim → "X >< …" | A stem word, choose its opposite. Distractors are synonyms of the stem (BEBAL >< Pandir/Tolol/Bodoh/Brilian/Idiot, B13) | 1K | B12–16 (5) | B only |
| VRB-ANL-2K | Analogi → fill two blanks with 2 of 5 words | Layouts: `A : B = … : …` (P13,15–18; A13,14,18,19) / `A : … = … : D` (P14; A16) / `A : … = C : …` (P19; A15) / `… : B = C : …` (A17) | 2K | P13–19 (7); A13–19 (7) | A/P |
| VRB-ANL-PAIR | Analogi → choose the matching pair | `A : B = …` with options "x : y" (B17,18,22,24) or two-blank paired options "x ; y" (B20,21) | 1K (PAIR) | B17,18,20,21,22,24 (6) | B |
| VRB-ANL-1K | Analogi → `A : B = C : ?` | B19 KUNYIT:KUNING = KESUMBA:?; B23 | 1K | B19,23 (2) | B |
| VRB-GJL | Ganjil kata → the one word furthest from the other 4 | Category membership: buah/umbi, word class (P24 Belajar = verb), hypernym (P25 Membawa), phase of water (P22), sports clubs (A21, needs world knowledge), body tract (A22) | 1K | P20–25 (6); A20–23,25 (5) | P/A |
| VRB-GJL-NUM | Ganjil → numeric odd-one-out | A24 "2,3,5,8,11": the non-prime | 1K | A24 (1) | A. Drill it under ANL (number property) |
| VRB-BACA-TEKS | Pemahaman bacaan → paragraph-referenced true/false/inference | A 4-paragraph demographic article with stems such as "Berdasarkan paragraf N … BENAR / SALAH / simpulan / urutan / PALING MUNGKIN" | 1K | B25–31 (7) | B only |
| VRB-BACA-TABEL | Pemahaman bacaan → text + data table | League table + text; stems "BENAR / TIDAK TEPAT / which team…" | 1K | B32–35 (4) | B only |

### 1.2 NUMERIK (aspek_resmi: praktis)

| Code | Sub-materi → sub-task | Items found | Notes / B vs A |
|---|---|---|---|
| NUM-HIT-CAMPUR | Hitung cepat → integer mixed operations, order of operations (× : before + −, negatives) | P89,91,92,95,96,97,99; A35,36; KD1,3 (11) | Distractors are the left-to-right evaluation result and sign errors (P96 ±778) |
| NUM-HIT-DESIMAL | Hitung cepat → decimals: division by a decimal, mixed with integers | P93,94; A39=KD20; KD2 (5) | |
| NUM-HIT-PECAHAN | Pecahan → mixed numbers, "a/b dari (…)", comparing fractions, fraction ⟷ percent ⟷ decimal | B36,37; A37,38,41,43=KD23 (6) | B36 has 3 mixed numbers + a nested fraction; A is single-step |
| NUM-HIT-AKAR-PANGKAT | Akar/pangkat → squares, nested roots, √ inside fractions, exponent rules | P90,100 (superscripts lost in extraction); B38,40,58; A40 (6) | B38 `½√(4√(4√(4√(4√16))))` and B40 (5 operations) are the hardest |
| NUM-HIT-PERSEN | Persen → "x% dari y", "x adalah berapa % dari y", products of percentages | P98; B39,44; A27 (4) | B44 = (0,4%×0,5%)/(0,1%×0,2%×0,3%) |
| NUM-HIT-TEORI | Sifat bilangan → remainders of powers, sum of consecutive integers, telescoping sums | B41,43; A42 (3) | B only at depth |
| NUM-ALJ-IDENTITAS | Aljabar cepat → a²−b² identity, solving symbolic constraints | B45 = A61 (same item, signs swapped) (2) | |
| NUM-ALJ-PERBANDINGAN | Perbandingan kuantitatif → "Jika x=…, y=… maka" with options x>y / x<y / x=y / relation / "tidak dapat ditentukan" | B55–60 (6) | B only. Two items have **two correct options** (§6) |
| NUM-ALJ-FUNGSI | Analisis fungsi / barisan → sign of a rational function on intervals; arithmetic + geometric sequence system | B67,70 (2) | Out of profile; keep as Lanjut only |
| NUM-SAT-KONVERSI | Satuan → length/area/volume/mass/time/quantity (rim, kodi, gross, windu, lustrum, caturwulan, dasawarsa) in a multi-term expression | B46,48,49,51,53,54; A44,45,47–50; KD4 (13) | B adds rare quantity units (gross, rim, kodi); A adds area in ha and h:m:s arithmetic |
| NUM-SAT-CERITA | Satuan in a story | B47,50,52 (3) | |
| NUM-CRT-PROPORSI | Soal cerita → direct/inverse proportion, joint work | P78,88; A29; B61; KD8,25 (6) | |
| NUM-CRT-GERAK | Soal cerita → distance/speed/time, average speed over a round trip, meeting/approach | P80; A26; B65; KD6,24 (5) | |
| NUM-CRT-UANG | Soal cerita → money, wage/overtime, profit/loss %, percentage of salary | P76,82,84; A28,31; B62; KD5,7 (8) | |
| NUM-CRT-RASIO | Soal cerita → ratio with difference/total, combined average, mixture grade, moisture content | A27,30,32,34,46; KD13 (6) | A focus |
| NUM-CRT-UMUR | Soal cerita → age then/now/later | P85; B63 (2) | |
| NUM-CRT-GEOMETRI | Soal cerita → circle circumference/wheel turns, cylinder volume, scale map, elevation | P77,79,86; A33; B64 (5) | |
| NUM-CRT-HIMPUNAN | Soal cerita → inclusion–exclusion, "% not in either" | P81; B66 (2) | |
| NUM-CRT-LINIER | Soal cerita → linear growth meeting point, digit puzzle, rooms/people equation | P87; B68,69 (3) | B68/69 are multi-constraint puzzles (Lanjut) |
| NUM-CRT-PENCACAHAN | Banyak rute → rule of product, rule of sum, round trip with or without repeats, paths in a directed graph | R1–R10 (10) | Separate PDF; not in B or A |
| NUM-CRT-ALOKASI | Alokasi waktu & delegasi → time window minus total workload; pick the task(s) that cover the excess, max tasks that fit, two workers in parallel | AK26#1 (1) | Reported from Akpol 2026 test-takers. Order/deadline variants go to ANL-WCN-JADWAL |
| NUM-SMA (out of profile) | Limit, inverse function, integral, linear programming from a graph | KD9–12 (4) | Not a psikotes POLRI type. **Exclude from drills** |

### 1.3 PENALARAN LOGIS (aspek_resmi: logis)

| Code | Sub-task | Definition | Items found | B vs A |
|---|---|---|---|---|
| LOG-SIL-KATEGORI | Silogisme kategorikal | 2–3 premises with semua / sebagian / tidak ada; choose the valid conclusion | P39–43,45–50; B81,83,84; A78,80,82–85; KD18,21(=A78) (25) | A uses 3-premise chains (A84,85) and some **contrary-to-fact premises** (A80 "Semua virus tidak berbahaya", A83 "Semua vaksin adalah antibiotik"): the student must reason formally, not from world knowledge |
| LOG-SIL-KONDISIONAL | Kondisional | Modus ponens/tollens, hypothetical chain, contrapositive | P38,44; A76,77; KD17 (5) | A76 = chain + contrapositive options |
| LOG-SIL-JEBAKAN | Fallacy traps | Affirming the consequent (A81 petinju), "tidak dapat disimpulkan" (B85), a premise that contradicts a fact (A79), time reasoning (B82 Senin/Rabu) | A79,81; B82,85 (4) | Teach as a separate skill: knowing when *no* conclusion follows |

### 1.4 ANALITIS (aspek_resmi: analitis)

| Code | Sub-task | Definition | Format | Items found |
|---|---|---|---|---|
| ANL-DRT-2BARIS | Two-row / two-track series with 2 blanks, one blank per track | Containers: rings with arrows (P51), 2-row tables (P52,53,54,56,57,59,60,61; A55), triangle strip (P55), diamond strip with halves (P58,62). Tokens are alphanumeric (H31J), letter pairs, numbers with letters, expressions (`11−2²`) | 2K | P51–63 (13); A55 (1) |
| ANL-DRT-1TRACK | Number series, 1 next term | Interleaved, two-step, ×/+ alternating (B71,72; A51–53; KD14,15) | 1K or PAIR | B71,72; A51–53; KD14,15 (7) |
| ANL-DRT-HURUF | Letter series | Interleaved letter tracks (B73–75; A54) | 1K / PAIR | B73–75; A54 (4) |
| ANL-ANGKA-GAMBAR | Numbers in a figure | Two figures with "=": find the operation linking the numbers on the edges/corners to the centre (square, triangle, cart, nested parallelograms, arrow box, circles on a triangle or rectangle) | 1K | B76–80; A56–58 (8) |
| ANL-OPERASI-SIMBOL | Redefined operation | "Jika 2×3=36, 5×6=900 maka 4×7=…" | 1K | A59,60 (2) |
| ANL-KODE | Letter cipher / artificial language | A74 letter-string arithmetic; A75 morpheme decoding (ilmya/elmya/atropo/kase) | 1K | A74,75 (2) |
| ANL-WCN-URUTAN | Linear ordering | Strict or partial order from before/after/between clauses; "mungkin / tidak mungkin" stems | 1K | P64,73; A62,68,69; B86–88 (8) |
| ANL-WCN-JADWAL | Scheduling / assignment grid | Persons × days/slots with exclusion and quota constraints | 1K | P70–72; B89,90 (5) |
| ANL-WCN-MULTIATRIBUT | Multi-attribute comparison | Several entities ranked on 2–4 attributes (size, cost, speed, beauty, smartness), with scoring rules | 1K | P66–69; A70–73 (8) |
| ANL-WCN-SELISIH | Relational arithmetic | Age/difference chains ("X 2 tahun lebih tua dari Y") | 1K | P65,74,75 (3) |
| ANL-WCN-DISTRIBUSI | Distribution / table logic | Who took which items, counts per category (permen A64–67); set membership (A63) | 1K | A63–67 (5) |

### 1.5 FIGURAL-SPASIAL (aspek_resmi: logis)

| Code | Sub-task | Definition | Format | Items found |
|---|---|---|---|---|
| FIG-MTX-OVERLAY | Matriks 3×3 → union | col3 = col1 ∪ col2 (or col1 = col2 ∪ col3, A97) | 1K | P28,31,36; A97 (4) |
| FIG-MTX-XOR | Matriks 3×3 → symmetric difference, with fill inversion where shapes overlap | Row 1 of A91 drops the shared diagonal; row 3 inverts the fill where black bars overlap | 1K | A91 (1) |
| FIG-MTX-KURANG | Matriks 3×3 → subtraction | col3 = col1 − col2, on bowtie/pinwheel triangle sets | 1K | A92 (1) |
| FIG-MTX-INVERSI | Matriks 3×3 → solid ⟷ outline inversion and attribute toggle | Inversion of col 1 (P26); outline + band toggle on a curved barrel solid (A93); inverted overlay (A95) | 1K | P26; A93,95 (3) |
| FIG-MTX-LATIN | Matriks 3×3 → Latin square of 2 attributes | Frame {diamond, pentagon-arrow, slanted trapezoid} × inner {drop, cloud, cross}; Latin by rows only | 1K | A94 (1) |
| FIG-MTX-POSISI | Matriks 3×3 → position walk | A black square walks the perimeter in reading order | 1K | A96 (1) |
| FIG-MTX-2BLANK | Matriks with two blanks; the option is a pair of cells | col3 = col1 ⊕ col2 with a mirrored half-shape (drop → heart → house) | 1K | KD19 (1) |
| FIG-SERI | Progressions | Number of sides +1 (P27); nested-layer cycle with fill alternation (P32); converging height tracks (P33); rotation 135° (P35, flawed) | 1K | P27,32,33,35 (4) |
| FIG-ANALOGI | A:B = C:? figural analogy | Multi-layer transform: split-and-offset + inside-out inner glyph (B99); move + complete + flip with a letter shift (B100) | 1K | B99,100 (2) |
| FIG-ROTASI-CERMIN | Find the pure rotation; the rest are mirror images | Free-form asymmetric line drawings (spiral + arrows, lozenge with a slash, X with dots) | 1K | B96–98 (3) |
| FIG-IKON-KATEGORI | 2×2 icon analogy by semantic category | Left 2×2 = category X, right 2×2 = category Y with one "?"; choose the icon of category Y. Real pictograms/logos: prohibition vs hazard signs, COVID prevention vs symptoms, party symbols vs Pancasila, airport vs cinema, school vs lab, percussion vs brass, racket sports, medical vs painting, bathroom vs bedroom | 1K | B91–95; A86–90 (10) |
| FIG-SUSUN-PITA | Susun potongan → equal framed vertical strips of line art | Portrait, cake + piping bag, teapot + cup | PERM | A98,99,100=KD22 (3) |
| FIG-SUSUN-SILUET | Susun potongan → uneven unframed slices of a solid silhouette | Bat, sailing ship (6 slices, two of them tiny), witch on broom | PERM | P29,34,37 (3) |
| FIG-SUSUN-LENGKUNG | Susun potongan → curved/tilted cuts of an icon | Fork + spoon in a ring | PERM | P30 (1) |

Totals I classified: P 100, B 100, A 100, KD 25, R 10 = **335 items**.

---

## 2. Difficulty tiers (1 Dasar / 2 Menengah / 3 Lanjut)

**Target times**
- Times are set against the 54 s/item exam budget.
- "T" = target median time per item at Tier 2.
- Tier 1 target = 1.25 × T. Tier 3 target = T, but at harder content.

| Code | T | Tier 1 Dasar | Tier 2 Menengah | Tier 3 Lanjut |
|---|---|---|---|---|
| VRB-SIN-2K / ANT-2K | 20 s | Everyday words; distractors from different domains | Semi-formal or loan words; 1 distractor is a near-synonym or related word (Diskon/Potongan vs Keuntungan) | Latin or technical words; 2 near-synonyms competing (Abrasi/Erosi/Pengikisan); for antonyms, a graded pair (Jamak–Tunggal vs Sedikit) |
| VRB-SIN-DEF / ANT-1K | 12 s | KBBI common-formal (ARKAIS) | Less frequent (IMPERATIF, INTERINSULER: derive it from affixes) | Rare or archaic (MADAR, GANDUH, MENDIRUS) or medical (EPISTAKSIS); distractors are phonetic look-alikes (Menyurai/Menyurati) |
| VRB-ANL-* | 30 s | Classic relations: part–whole, worker–tool, opposites; blanks only on the right | Mixed blank positions (`A:…=…:D`); relations such as function, cause–effect, unit-of-measure (Umur:Tahun = Kertas:Lembar) | Two relations superimposed (category + order); a domain-knowledge relation (Bogor:Hujan, Surabaya:Pahlawan); distractor pairs that share one word with the key |
| VRB-GJL | 20 s | Clear taxonomic category | Word class or grammatical function (Manakala = conjunction) | Fine semantic feature (Membawa = generic hypernym of 4 specific carrying verbs; Timun = not a tuber) |
| VRB-BACA-* | 60 s/q (+90 s first read) | Literal locate ("paragraf 1 … BENAR") | Paraphrase or negation stems (SALAH, TIDAK TEPAT); numeric comparison from the text | Inference, "PALING MUNGKIN", or a cross-paragraph or text+table merge |
| NUM-HIT-CAMPUR/DESIMAL | 35 s | ≤ 3 operations, ≤ 2-digit operands | 4–5 operations, 3-digit × 2-digit, negatives | 5+ operations with decimal division, distractors from left-to-right evaluation and sign slips; options differ in the last digit (9327/9328) |
| NUM-HIT-PECAHAN/PERSEN | 40 s | Single step | 2-step chain ("¼ dari 4/7 sisa") | 3+ mixed numbers + a nested fraction (B36), products/quotients of percentages (B44) |
| NUM-HIT-AKAR-PANGKAT/TEORI | 45 s | Perfect squares, √ of a perfect square | Exponent rules, √ inside a fraction, telescoping sum (B43) | Nested radicals (B38), remainders of powers (B41), multi-op radical expressions (B40) |
| NUM-ALJ-* | 60 s | One variable, direct evaluation | Two expressions compared; identity use (a²−b²) | Sign/interval analysis, statements I–V (B67); an "x≤y vs x<y" trap |
| NUM-SAT-* | 45 s | 2 terms, adjacent units | 3–4 terms across 2+ steps (km/hm/dam), mixed units | Rare units (gross, kodi, rim, windu, lustrum, caturwulan), m³/dm³/ml ↔ liter, area in ha, h:m:s with borrowing |
| NUM-CRT-* | 75 s | 1 relation, integer result | 2–3 steps, one unit conversion | 3+ steps or two simultaneous unknowns (B68,69); trap wording ("3 kali lebih tua"); rate problems with alternating workers (P88) |
| NUM-CRT-PENCACAHAN | 60 s | Pure product (3 shirts × 2 trousers) | Sum of products over 2 routes (R Ngawi); round trip with no repeat | Directed graph with restrictions (R Grace passes, R campaign villages) |
| LOG-SIL-* | 45 s | 2 premises, A/I forms, valid conclusion stated in the same order | Negative premises (E/O), conversion needed (P42), modus tollens | 3 premises, contrary-to-fact premises, fallacy distractors (affirming the consequent, denying the antecedent), "tidak dapat disimpulkan" |
| ANL-DRT-2BARIS | 60 s | Both tracks +k, one token type | Two token types per cell (letter+number), different steps per track, alternating letter/number order (P59) | Expression tokens (P56 `a±b²` with a +1,+1,+3,+3 cycle), ×5 / ÷5 with decimals (P60), step cycles (+1,+3,+2: P61) |
| ANL-DRT-1TRACK/HURUF | 45 s | Constant difference | Interleaved 2 tracks, or ×/+ alternation | 3 interleaved tracks or a cycle of operations (A51 +2,×2,−2) |
| ANL-ANGKA-GAMBAR / OPERASI | 50 s | One operation (sum, product) | Operation with an exponent read from a cell (B78: (5+6)²; (4+5)³) | Difference of squares (B80), ratio rules (A57 = a·b/c), redefined operators |
| ANL-WCN-* | 90 s first item, 40 s each sibling | ≤ 4 entities, 1 attribute, ≤ 3 clauses | 5 entities or 2 attributes, 4–5 clauses, a "kecuali" or "mungkin" stem | 6–7 entities with quotas or exclusions (P70–72, B89–90), 2-attribute scoring (A70–73), underdetermined models that must be enumerated |
| FIG-MTX-* | 60 s | 1 operator on simple primitives (lines, dots); OR | 1 operator on compound shapes, or XOR/subtraction; Latin square on 2 attributes | Operator + fill inversion on overlap, curved solids, distractors that differ in one primitive or in stacking order (A92 option A) |
| FIG-SERI / ANALOGI | 50 s | 1 layer (count or rotation) | 2 layers (rotation + fill parity) | 3+ layers (SOP §2 HOTS rule), cyclic nesting (P32), inside-out transforms (B99) |
| FIG-ROTASI-CERMIN | 45 s | Asymmetric shape, 90°/180° only, 1 landmark | Arbitrary angles (120°/240°), 2 landmarks | Dense free-form lines, mirror distractors that differ only in one hook/dot (B97,98) |
| FIG-IKON-KATEGORI | 20 s | Categories far apart (prohibition vs hazard) | Neighbouring categories (COVID prevention vs symptom) | Fine categories needing knowledge (Pancasila vs party, racket vs ball sports) |
| FIG-SUSUN-* | 45 s | 4 pieces, ends fixed, a strong continuous line | 5 pieces, full derangement, framed strips | 6 pieces with tiny slices, unframed silhouette or curved cuts, blank-edged strips; distractors = adjacent swap / cyclic shift |

---

## 3. Fast strategy and pembahasan template per sub-task

**Repo rule** (`RULES GENERATE SOAL SPASIAL.md` §3, applied to all types): at most 2 paragraphs.
- **¶1** = rule extraction.
- **¶2** = "Opsi X gugur karena …" for every distractor, ending with "Maka jawaban …".

The templates below fix the slots each generator or author must fill.

| Code | Fast method to teach | ¶1 template | ¶2 template |
|---|---|---|---|
| VRB-SIN/ANT-2K | Define each word in ≤ 3 words, look for a pair *inside* one domain; for antonyms, test "if X then not Y" on the same scale | "Kata <K1> berarti <def>; <K2> berarti <def> — keduanya <sama/berlawanan> pada <dimensi>." | "<D1> hanya berkaitan (<relasi>), bukan sama/lawan; <D2>…; <D3>…. Maka jawaban <k1> dan <k2>." |
| VRB-SIN-DEF / ANT-1K | Affix decomposition (inter- = antar, -is = sifat), memory deck of high-frequency rare words; for ANT-1K, eliminate synonyms first | "<KATA> (KBBI) berarti <def>; <asal/imbuhan bila ada>." | "Opsi <x> adalah <arti kata lain/look-alike>; …" |
| VRB-ANL-* | Make the stem a sentence ("A adalah <relasi> B"), plug every option into the same sentence; check the *direction* | "Hubungan <A>:<B> = <relasi> (kalimat uji: '<…>')." | "Pasangan <x:y> gugur karena relasinya <…>/arahnya terbalik." |
| VRB-GJL | Name the category of 4, then the feature the 5th lacks | "Empat kata adalah <kategori>; <ciri pembeda>." | "<X> satu-satunya yang <tidak/berbeda>…" |
| VRB-BACA-* | Read the stem first, go to the paragraph it names, match the claim span-by-span; for SALAH/TIDAK TEPAT, flip the polarity | "Paragraf <n> menyatakan '<kutipan>' (+ tabel baris <…>)." | "Opsi <x> keliru: teks menyebut <…> bukan <…>." |
| NUM-HIT-* | Order of operations; estimate the magnitude and last digit before computing; cancel before multiplying; fraction ⟷ decimal anchors (⅛ = 0,125) | "Kerjakan <urutan>: <langkah 1> → <langkah 2> = <hasil>." | "<x> muncul jika <salah urutan/tanda/koma>; …" |
| NUM-ALJ-PERBANDINGAN | Reduce each side to a number or a sign; test boundary values; check whether ≤ and < can both hold | "<x> = <…>, <y> = <…>." | "Opsi <…> gugur karena …" |
| NUM-SAT-* | Convert everything to the answer unit first, then add; memorize the ladders (k-h-da-m-d-c-m; ton-kuintal-kg-hg-ons; kodi 20, lusin 12, gross 144, rim 500) | "Ubah ke <satuan>: <t1>=<…>, <t2>=<…>; jumlah = <…>." | "<x> muncul bila <tangga satuan salah/lupa ²/³>." |
| NUM-CRT-* | Translate to one equation; pick the model (proportion / rate×time / inclusion–exclusion / product rule); sanity-check against the options | "Model: <rumus>. <substitusi> = <hasil>." | "<x> = hasil jika <kesalahan khas>." |
| LOG-SIL-* | Venn sketch or the "semua A B" arrow; test each option by building a counter-example; in kondisional, only MP/MT are valid | "Premis: <bentuk>. Diagram/aturan: <…> ⇒ <kesimpulan>." | "Opsi <x> gugur: contoh tandingan <…> / kekeliruan <afirmasi konsekuen>." |
| ANL-DRT-2BARIS | Split each cell into tokens, convert letters to numbers (A=1…Z=26, wrap at 26), solve each track separately; the two answers usually come one per track | "Baris 1: <pola>; baris 2: <pola>." | "Opsi <x> cocok dengan langkah <…> yang salah / track lain." |
| ANL-DRT-1TRACK/HURUF | Differences, then second differences; test interleaving (odd/even positions); test ×/÷ | "Posisi ganjil <…>, genap <…>." | idem |
| ANL-ANGKA-GAMBAR | Test sum, product, difference, square and ratio of the edge numbers on figure 1; verify the rule on figure 2 before applying it | "Gambar 1: <operasi> = <pusat>." | "<x> dari operasi <…> yang hanya cocok di satu gambar." |
| ANL-WCN-* | Draw a grid or number line first; place the fixed facts, then quotas, then cases; for "mungkin", test each option against all clauses | "Dari syarat <…> diperoleh <tabel/urutan>." | "Opsi <x> melanggar syarat '<…>'." |
| FIG-MTX-* | Decompose cells into primitives; test OR / XOR / A−B / Latin on rows 1–2 (pola-findings §3 c); check fill on overlaps | "Tiap baris: <operator> (<bukti baris 1-2>)." | "Opsi <x> gugur karena <primitif hilang/lebih/isi tidak terbalik>." |
| FIG-SERI/ANALOGI | List layer by layer: rotation mod symmetry, fill parity, count, satellite, swap | "Lapis 1 <…>, lapis 2 <…>, lapis 3 <…>." | "Opsi <x> gagal di lapis <n>." |
| FIG-ROTASI-CERMIN | Chirality test: pick 2 landmarks and read their clockwise order, which mirroring reverses | "Landmark <L1>,<L2> searah jarum jam; rotasi mempertahankan urutan ini." | "Opsi <x> urutannya terbalik → cermin." |
| FIG-IKON-KATEGORI | Name both categories in one word each | "Kiri = <kategori 1>, kanan = <kategori 2>." | "<x> termasuk <kategori lain>." |
| FIG-SUSUN-* | susun-findings §3: edge pieces → anchor feature → line continuity at the same height → baseline → eliminate at the first broken join | "Ujung kiri <n>, jangkar <fitur> di <i>/<j>, garis <…> menyambung." | "Opsi <x> putus di sambungan <i>-<j>." |

---

## 4. Quality bar for figural items

The user rejected procedural "house/hill strip" art. That is exactly the current `gen-susun.ts` scene template (susun-findings §5). Below is what the sources do that such art does not.

### 4.1 Matrices and series (A91–97, P26–36)

**What makes them hard**
1. **Compound primitives, not single polygons.** Examples:
   - bowtie = two triangles meeting at their apex (A92);
   - pinwheel = 8 alternating triangle wedges (A92 row 2);
   - stacked triangle clusters (A92 row 3);
   - concave-sided "barrel" solids with curved top/bottom (A93 row 3);
   - slanted trapezoids and pentagon-arrows as frames (A94);
   - star with a chevron cut-out, thick ring, octagon with cut corners, 4-way arrow cross with an arch (A95);
   - crescent, cross, heart with two dots, circle with ×, diamond with a midline (A97).
2. **Boolean operations change fill.**
   - Overlap regions invert colour: white bar on black when two black bars meet (A91 row 3; A97 crescent on black square with white cross).
   - The generator must compute XOR/even-odd fill, not just stack shapes.
3. **The operator differs from item to item:** OR (A97), XOR (A91), subtraction (A92), inversion (A93/A95), Latin (A94), walk (A96). A student cannot reuse a single heuristic.
4. **Distractors differ by one primitive or by spatial arrangement.**
   - A92: option A has the right pieces stacked wrongly.
   - A94: option C follows the column rule instead of the row rule.
   - A93: options vary band position/orientation × fill.
5. **Ink balance.** Large black areas sit next to thin outlines, so white-on-black detail must stay legible at about 120 px per cell.

**Generator must reproduce**
- A shape library of ≥ 25 compound masters (the items above), each with a symmetry order.
- Path-level boolean ops (union / XOR / difference) with even-odd fill.
- Operator families: OR, XOR, MINUS, INVERT, LATIN-row, WALK, ATTR-TOGGLE. The pola generator already has OR/XOR, rotation, satellite, analogy.
- One-layer-off distractors (pola-findings §4 invariants).
- A row-only vs column-rule distractor for Latin items.
- A minimum stroke of 3 px at a 120 px cell.
- Asserted: no solid-in-solid invisibility, and no visually identical options (repo q31 bug).

### 4.2 Rotation vs mirror (B96–98)

**Hard because**
- The stimuli are **hand-drawn free-form scribbles**: a spiral with an arrow and a crossing line, a lozenge with an inner slash and a hook, a bone-shaped X with scattered dots.
- They have no symmetry and no easy landmark.
- The mirrors differ in tiny glyphs.

**Generator must**
- Produce random smooth Bézier strokes (3–5 strokes, mixed line weight, 1–3 dots/hooks) with a guaranteed chirality: no reflective symmetry, checked by a pixel IoU of the mirror vs every rotation < 0.8.
- Render options as rotate(θ) or mirror∘rotate(θ).
- Never use 0°.

### 4.3 Figural analogy (B99–100)

**Hard because**
- Each transform has 3+ layers: split a shape along a diagonal and offset the halves, turn the inner glyph inside-out, rotate.
- B100 adds a letter-shift layer in the corners.

**Generator must**
- Support split-offset, inside-out, and complete-the-shape transforms (arch → ring).
- Support corner-letter shifts.
- Run the uniqueness brute force from pola-findings §4.

### 4.4 Strip ordering (P29,30,34,37; A98–100)

**Hard because the subjects are realistic.**
- Line-art illustrations with fine hatching: a woman's portrait with long hair, a cake with a piping bag, a teapot behind a cup on a saucer.
- Solid silhouettes: bat, sailing ship, witch on a broom, fork + spoon in a ring.
- Cues are weak: hair strands, a saucer rim. Some strips are almost blank.
- Silhouette slices are uneven, and 2 of the 6 ship slices are tiny.

**The pipeline must**
1. Source an **original raster** per item: an image-model prompt describing the scene in text only, with no source-PDF image as input and no real person's likeness. Monochrome line art or silhouette, white background, about 600 px wide, ≤ 100 KB.
2. Have the generator cut it deterministically:
   - framed equal strips (PITA);
   - uneven unframed slices with a minimum width (SILUET);
   - shared curved clip paths (LENGKUNG).
3. Pass a uniqueness gate: the true chain's edge-match score must beat every other permutation by ≥ 20% (`edges2.py`). Reject cuts whose two edges are both near-blank: the teapot fooled the metric.
4. Build distractors in this order: adjacent swap, cyclic shift, end swap, one piece moved. Never identity/reverse only, and never a non-permutation (assert this).
5. Get a human or Claude visual pass on a preview rebuilt *from the key*.

### 4.5 Icon-category (B91–95, A86–90)

These are semantic, not spatial: they test category knowledge.

**Pipeline**
- Use an in-house icon set: monochrome pictograms, consistent stroke, 2×2 + 5 options.
- **No real logos, party symbols or brand marks.** B91 uses PDI-P, Golkar and PKS symbols, plus FIFA/OPEC/FBI logos. That is a trademark and political risk.
- Category pairs come from a curated list. Each distractor belongs to a category that is plausibly near.

---

## 5. Measurement design

### 5.1 Record per attempt

Extend plan 01 §6 `practice_results` with:
- `time_ms`
- `selected` (the keys chosen)
- `partial`: for 2K items, 1 key right counts as a diagnostic half, but is still scored 0 per the pedoman.

**Why time is needed:** psikotes is speeded at 54 s/item. CEST deferred time; here it is required.

### 5.2 Mastery per (sub_type, tier)

Use a rolling window of the **last 12 items**.

| Status | Rule |
|---|---|
| **Dikuasai** | accuracy ≥ 80% **and** median time ≤ tier target (§2), with the window coming from ≥ 2 separate sessions |
| **Akurat-lambat** | accuracy ≥ 80%, time > target. Prescribe speed drills (timed set, same tier) |
| **Cepat-ceroboh** | accuracy < 70%, time < 0.6 × target. Prescribe untimed sets with the pembahasan shown |
| **Belum** | otherwise |

- Weakest-type button: CEST rule unchanged (n ≥ 5, < 80%).
- Additionally, sort by "contribution to exam loss" = (1 − accuracy) × items of that family per 100 in the target package (B or A frequencies, §1).

### 5.3 Minimum items, so the measure means something

- With 12 binary items, the 95% interval on 80% accuracy is about ±23 pp. This is coarse but enough to separate < 60% from ≥ 80%.
- **Bank minimum per (sub_type, tier) = 36 unique items.** That gives 3 full windows without repeats.
- The main families (SIN/ANT/ANL/GJL, HIT, SAT, CRT, SIL-KATEGORI, DRT-2BARIS, WCN, MTX, SUSUN) need **3 tiers × 36 ≈ 108 items each**.
- Thin families get 1–2 tiers × 24, and stay "latihan" with no mastery claim: ANL-KODE, NUM-ALJ-FUNGSI, FIG-ANALOGI, FIG-ROTASI-CERMIN, VRB-BACA.
- Wacana counts per **stimulus**: ≥ 12 stimuli per tier, 3–4 questions each.

### 5.4 Drill set size

| Family | Set size | Time |
|---|---|---|
| Default | 10 items | 6–10 min |
| Wacana | 2 stimuli × 3–4 questions | |
| Figural (MTX/SUSUN/ROTASI) | 8 items | |

- Show the pembahasan immediately after each item in untimed mode, or at the end of the set in timed mode.
- Timed mode uses the tier target × set size as the set timer (per-item timers punish reading).

### 5.5 Recommended learning path

The order puts fast transferable wins first and the heaviest exam families early.

1. NUM-HIT-CAMPUR → DESIMAL → PECAHAN/PERSEN (speed base for every numeric item)
2. NUM-SAT-KONVERSI (13 items in A+B; pure memorization of the ladders)
3. VRB-SIN/ANT-2K → VRB-ANL-* → VRB-GJL. For Bintara, run VRB-SIN-DEF/ANT-1K as a parallel daily vocabulary deck.
4. ANL-DRT-1TRACK/HURUF → ANL-DRT-2BARIS
5. LOG-SIL-KATEGORI → KONDISIONAL → JEBAKAN
6. NUM-CRT-* (proportion, motion, money, ratio) → NUM-CRT-PENCACAHAN
7. ANL-ANGKA-GAMBAR / OPERASI-SIMBOL
8. ANL-WCN-URUTAN → SELISIH → DISTRIBUSI → JADWAL → MULTIATRIBUT
9. FIG-IKON-KATEGORI → FIG-SERI → FIG-MTX (OVERLAY → INVERSI → LATIN → POSISI → XOR/KURANG) → FIG-ROTASI-CERMIN → FIG-ANALOGI → FIG-SUSUN (PITA → SILUET → LENGKUNG)
10. Bintara track only:
    - NUM-HIT-AKAR-PANGKAT/TEORI, NUM-ALJ-IDENTITAS/PERBANDINGAN after step 1;
    - VRB-BACA after step 3.

**Gating and review**
- Unlock tier n+1 at "Dikuasai" or "Akurat-lambat" on tier n.
- Every 3rd set is an interleaved review of already-mastered sub_types, so they are not forgotten.

---

## 6. Known data problems in the sources

### 6.1 Wrong or broken keys and options

| Item | Problem |
|---|---|
| **P86** | The key e "5000 kali" treats the 70 cm diameter as the circumference. True: 350000 / (70π) ≈ 1591, which is not among the options. **The repo carries this key** (soal.json id 86) |
| **P39** | The key b "Loki tidak disukai adiknya" is the denying-the-antecedent fallacy. Nothing valid follows from the premises. Bad item for drilling logic |
| **P49** | The key d needs the implicature "sebagian ⇒ sebagian tidak". Under formal logic no option is valid |
| **P73** | Divia is unconstrained, so the winner (key d Clarita) is not determined |
| P71 | Underdetermined (Azel+Deri Mon and Wed *or* Thu). Solvable only by elimination |
| P83 | Names in the question (Loki/Banner) differ from the stem (Lexi/Bernard) |
| P85 | "tiga kali lebih tua" is ambiguous wording |
| P66 | "tidak memiliki keuntungan" is vague |
| P52 | Row 2 has U37/V34/W31; it should be U27/V24/W21 |
| P57 | Last column E/A breaks the +2 offset |
| P58 | "UW" should be "VW" |
| P59 | "112U" should be "102U" |
| P63 | The PDF stimulus is blank. The repo has a reconstructed version |
| P90, P100 | Superscripts are lost in extraction ("(15 + 40) 2", "212/441" = 21²/441). Verify the rendering in the repo |
| **B2** | Options D and E are both "Tukar tambah" (one of them is presumably the key) |
| B4 | "KOMPULASI" is not standard (kompilasi? kompulsi?). Typo "infonmasi" |
| B17 | Typo "Relalif" |
| **B41** | 3²¹ mod 9¹⁰ = 0 (derived), and 0 is not among the options |
| **B57** | A = B (24 = 24) and A − B + C = C are both true |
| **B59** | x < y and x ≤ y are both true |
| **B67** | Only statement IV is true (derived); no option says "IV saja" |
| B79 | The consistent rule gives √(16·100) = 40 (derived), which is not an option |
| B97 | Possibly two answers (pola-findings) |
| B100 | Letter-shift layer is broken; A and E both fit |
| B25–35 | Copied Katadata article: a copyright issue. The table shows Liverpool MN 31 while the text says pekan ke-30 |
| **A28** | Vidi's salary = 80000 / 0,06 = Rp1.333.333 (derived), not an option |
| A30 | Moisture 20% (wet basis) vs 25% (dry basis): both are options |
| A33 | Name changes Faraz → Rizky |
| A51 | Two blanks but single-number options |
| A53, A74 | Rule unclear: not drill-safe until re-authored |
| A95, A96 | Inconsistent row rule; duplicate BC cell (pola-findings) |
| A98–100 | No published key. Keys derived in susun-findings: E, C, D |
| A100 / KD22 | Option A is not a permutation |
| **KD24** | 120 km / 5 h = 24 km/jam (derived), which is not an option. KD14, KD24 and KD25 have only 4 options |
| KD9–12 | SMA calculus/LP, out of profile |
| KD19 | Option images overlap; labels are unreadable |
| R (Ronaldo) | Route starts at "Jogja" but asks about "Trimujo" |

### 6.2 Duplicates across sources

These matter for a leak gate between the drill and simulation banks.

| Pairs |
|---|
| B45 = A61 (signs swapped) |
| A39 = KD20 |
| A43 = KD23 |
| A78 = KD21 |
| A100 = KD22 |

### 6.3 Repo-side issues

- soal.json 26–37 are original replacements, not transcriptions. Keys 28, 31, 32 and 35 differ from the PDF.
- id 29 is ambiguous.
- q31 has identical options C and D.

All are from pola-findings and susun-findings.

### 6.4 Legal and content issues

- Real logos and party symbols (B91–95, A86–90).
- The Katadata text (B25–35).
- Real-person-like portraits (A100).

**Rule:** use none of these as generator input or reference images. Only re-author the item *types*.
