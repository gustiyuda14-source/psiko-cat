# Tes Kecermatan / Kraepelin-Pauli-Koran family: scoring, psychometrics, and critique of the draft spec

Draft spec under review: 10 columns x 50 items = 500 items; Greek symbols in columns 1-5 and further symbol variations in 6-10; a 60 s timer per column with automatic switching. It defines K (total answered), T (correct/answered x 100%), P (best single column), S (SD or slope across columns), plus a 5-10% penalty when the curve drops more than 30%.

Evidence labels used below: **[EVIDENCE]** means peer-reviewed or meta-analytic. **[MANUAL/CONVENTION]** means a test manual, practitioner document or blog. **[INFERENCE]** means my own reasoning or arithmetic, with no source behind it.

---

## 1. Origin and standard scoring (panker, tianker, janker, hanker) and work-curve interpretation

### Takeaway
The test comes from Kraepelin's continuous-addition "Arbeitskurve" (work curve, 1902). Pauli and Arnold later standardized it as the Pauli-Test. Indonesian practice scores four indices. Panker is the mean correct per column. Tianker is a raw count of errors plus skipped items. Janker is the range or the average absolute deviation across columns. Hanker is the change along a linear regression line, Y50 − Y0. Each raw value is then converted into a 5-level category using norms split by education and sex. None of these indices is combined with a percentage penalty.

### Cited Findings
- Kraepelin published "Die Arbeitskurve" in 1902. It used the continuous-addition method (Addiermethode), which R. Pauli later developed into the Pauli-Test. The work curve plots how performance moves during continuous uniform work and is meant to capture practice and activation effects. W. Arnold and R. Pauli developed it further. — [Spektrum Lexikon der Psychologie: Arbeitskurve / Kraepelin (via search summary; page returned 403)](https://www.spektrum.de/lexikon/psychologie/arbeitskurve/1304)
- The standard German handbook is Arnold, W. (1975), *Der Pauli-Test: Anweisung zur sachgemäßen Durchführung, Auswertung und Anwendung des Kraepelinschen Arbeitsversuches*, Springer. — [Springer](https://www.springer.com/9783540074618)
- An Indonesian manual (SoftwarePsikotes.com, 2013) says the test began as a personality / "performance type" test. It "became an aptitude test by changing the emphasis of scoring and interpretation" and is meant to measure *maximum performance*. It names four factors: speed, accuracy, endurance ("ausdeur") and rhythm/steadiness ("rithme"). It also says the test has long been used in ABRI (TNI/POLRI) and companies for selection and placement. — [Manual Tes Kraepelin, SoftwarePsikotes.com (2013)](https://softwarepsikotes.com/Manual%20Tes%20Kraepelin.pdf) [MANUAL/CONVENTION]
- Administration in that manual: candidates add adjacent digits from bottom to top, with a column switch on a signal every **15 s**, over **50 columns** (the manual states "15 detik x 50 = 12 menit 10 detik"). Practice is 4 columns x 15 s. Proctors are told to watch the start and end closely because "testee biasanya mencuri waktu" (candidates usually steal time). — [Manual Tes Kraepelin (2013)](https://softwarepsikotes.com/Manual%20Tes%20Kraepelin.pdf) [MANUAL/CONVENTION]
- Formulas in the manual [MANUAL/CONVENTION]:
  - **Panker** (kecepatan kerja, work speed) = Σfy / 50, the mean number correct per column.
  - **Tianker** (ketelitian kerja, accuracy) = sum of errors + sum of skipped items. It is a raw count where lower is better, converted through norms.
  - **Janker** (keajegan kerja, steadiness) has two forms. (a) Range = Yt − Yr, the highest minus the lowest column score, which the manual calls the "hasil kasar" (rough result). (b) Average deviation = Σf|d| / N, which the manual calls "lebih teliti" (more precise).
  - **Hanker** (ketahanan kerja, endurance): fit an OLS line to column scores, with b = [NΣXY − ΣXΣY] / [NΣX² − (ΣX)²], then take **Y50 − Y0**. A negative value means endurance declines and a positive value means it rises. — [Manual Tes Kraepelin (2013)](https://softwarepsikotes.com/Manual%20Tes%20Kraepelin.pdf); same formulas in a worked example at [Wicaksono blog (2014)](http://darmawanwicaksono.blogspot.com/2014/09/normal-0-false-false-false-in-x-none-x.html)
- Norms in the manual are split by education group (SMEA, STM, SMA IPA/IPS, sarjana muda, sarjana) and sometimes by sex. Each index maps to 5 categories, from Baik Sekali (very good) to Kurang Sekali (very poor). Examples:
  - Panker for SMA IPA-IPS: ≥14.599 is Baik Sekali, ≤8.257 is Kurang Sekali.
  - Tianker for SMEA: 0-1 is Baik Sekali, ≥34 is Kurang Sekali.
  - Janker (range) for SMA: 0-3 is Baik Sekali, ≥15 is Kurang Sekali.
  - Hanker for SMEA: ≥+2.665 is Baik Sekali, −1.475 to +1.406 is Sedang (average), ≤−3.316 is Kurang Sekali.
  - No sample sizes, collection dates or standardization method are reported.
  — [Manual Tes Kraepelin (2013)](https://softwarepsikotes.com/Manual%20Tes%20Kraepelin.pdf) [MANUAL/CONVENTION]
- In Indonesian prep material, curve shape is read qualitatively as personality or motivation. One example reads a mid-test dip followed by a sharp rise at the end as motivation. — [Dealls: Soal Psikotes Polri](https://dealls.com/pengembangan-karir/soal-psikotes-polri) [CONVENTION, prep site]

### Inferences
- [INFERENCE] Hanker = Y50 − Y0 = 50·b. It is the regression slope rescaled to the test length, so it is a **slope score, not a percentage**. Under the classic norms a moderate decline of a few items over 50 columns still falls in "Sedang". In the tradition a decline therefore earns a lower *category* on its own index. It does not trigger a deduction from speed.
- [INFERENCE] The draft's indices are not the classic ones:
  - Draft K (total answered) differs from Panker (mean *correct*).
  - Draft T (a percentage) differs from Tianker (a count of errors plus skips).
  - Draft P (best column) has no classic counterpart. The nearest is Yt inside the Janker range.
  - Draft S (SD or slope) blends Janker (dispersion) with Hanker (trend).
  - The draft should keep **dispersion (keajegan)** and **trend (ketahanan)** as two separate indices. They answer different questions.
- [INFERENCE] The classic format has many short epochs (50 x 15 s). The draft has few long ones (10 x 60 s). With 10 data points, any per-person curve statistic (SD, slope) is far noisier than with 50 (see Q3).
- [INFERENCE] P ("best column") is the maximum of 10 noisy values. Maxima are biased upward and are the least reliable summary. In the classic tradition the maximum appears only as one end of the Janker range.

### Gaps
- I could not access the full text of the Kraepelin (1902) and Arnold (1975) primary sources. The canonical work-curve components (warm-up/Anregung, practice/Übung, fatigue/Ermüdung, habituation, Antrieb/initial spurt, Schlussantrieb/end spurt) and how Pauli scored them (e.g., the Pauli "Schwankung" fluctuation measure, error percentage) are **not verified from primary text here**. They are known from the secondary tradition only.
- The Indonesian norms carry no date or sample size. The SMEA/STM labels suggest pre-1997 school categories [INFERENCE], so the norms are probably decades old.

---

## 2. Reliability and validity evidence (Kraepelin/Pauli, DSST/coding, d2, Bourdon)

### Takeaway
The best evidence comes from the related tests: d2 and digit-symbol. Their *total output* scores are highly reliable (around .90 or above) and measure visual scanning speed, processing speed and sustained attention. Perceptual-speed scores predict job performance modestly, with some incremental validity over general mental ability (GMA). For the Kraepelin/Pauli indices themselves I found no accessible peer-reviewed reliability coefficients. The Indonesian validity claims trace back to old, unpublished or secondary studies.

### Cited Findings
- **d2 (Brickenkamp)**: Bates & Lemay (2004, *JINS*), N = 364 US adults, found d2 "an internally consistent and valid measure of visual scanning accuracy and speed" with convergent and discriminant validity. They added **acceleration and deterioration** scores for performance constancy and recommended more validation of those process measures. — [Bates & Lemay 2004, Cambridge](https://www.cambridge.org/core/journals/journal-of-the-international-neuropsychological-society/article/abs/d2-test-of-attention-construct-validity-and-extensions-in-scoring-techniques/FC00B4A2821A27EF96DBE9E3DA80355B) [EVIDENCE]
- d2 in a Costa Rican sample: the most reliable scores were total responses (TR), total correct (TA), total effectiveness (TOT) and concentration index (CON), with Cronbach's α and test-retest from **.90 to .97**. Validity was shown by correlations with sustained/selective attention, processing speed and inhibitory-control measures. — [Revista Costarricense de Psicología, SciELO](https://www.scielo.sa.cr/pdf/rcp/v39n2/1659-2913-rcp-39-02-145.pdf) [EVIDENCE]
- d2-R format and scoring: **14 screens/lines, 20 s each**. Concentration Performance (CP) = hits − commission errors; also reported are Processed Targets (pure speed) and Error Percentage. — [Hogrefe d2-R sample report](https://www.hogrefe.com/us/shop/media/downloads/sample-reports/HUS62750_mr.pdf) [MANUAL]
- **Digit Symbol Substitution (DSST/coding)**: among the most sensitive neuropsychological measures of processing speed and cognitive efficiency. It is sensitive to dysfunction from many causes, which also means it has low specificity. — [Jaeger 2018 review, PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC6291255) [EVIDENCE]
- **Perceptual speed and job performance**: Mount, Oh & Burns (2008, *Personnel Psychology*), N = 133 warehouse workers:
  - Number correct (NC) added ΔR² = .06 for task performance over GMA.
  - Number wrong (NW) added ΔR² = .16 for (lack of) rules compliance.
  - So *errors carry different predictive information than speed*.
  — [Mount, Oh & Burns 2008, Univ. Iowa](https://iro.uiowa.edu/esploro/outputs/journalArticle/Incremental-validity-of-perceptual-speed-and/9984963208902771) [EVIDENCE]
- Clerical-occupation validity generalization (Pearlman, Schmidt & Hunter, 1980, *J Appl Psych* 65) is the classic meta-analysis that includes perceptual speed tests. I could not retrieve its coefficients. — [Iowa record](https://iro.uiowa.edu/esploro/outputs/journalArticle/Incremental-validity-of-perceptual-speed-and/9984963208902771); [Schmidt 1998](https://stafforini.com/works/schmidt-1998-validity-and-utility/)
- **Kraepelin in Indonesia**: the manual cites Arief Wangsa (Yogyakarta employees) and Darochim Effendi (1968) as finding "korelasi yang positif dan meyakinkan" (positive, convincing correlation) with work performance. **No coefficients, N or citation details are given.** — [Manual Tes Kraepelin (2013)](https://softwarepsikotes.com/Manual%20Tes%20Kraepelin.pdf) [weak/secondary]
- A newer Indonesian online work-curve test, "Faxtor's Endurance and Speed Test" (Psychology journal, UAD), reportedly shows reliability and validity and a "satisfactory correlation" with the Pauli test on similar aspects. Here Pauli serves as the criterion. — [journal.uad.ac.id article 25292 (search abstract only; PDF blocked)](https://journal.uad.ac.id/index.php/Psychology/article/view/25292) [EVIDENCE, details unverified]
- Czech rehabilitation and disability literature uses the Kraepelin-Pauli work-curve test to judge capacity for sustained gainful employment. — [Prolekare 2007](https://www.prolekare.cz/en/journals/medical-revision/2007-1/urcovani-schopnosti-soustavne-vydelecne-cinnosti-jedince-1738?hl=en) [context only]

### Inferences
- [INFERENCE] In every comparable test the strongest psychometric evidence is for **total or aggregate output** (TR, TA, CP, total coded). Within-test process scores (fluctuation, deterioration, slope) are the weakest-supported. Even Bates & Lemay presented them as new and in need of validation. The draft should treat K and an error-corrected speed score as primary, and S as secondary or descriptive.
- [INFERENCE] The Mount et al. result supports reporting **errors as their own score**. Folding them into a ratio (T = correct/answered) hides information that may predict rule compliance.
- [INFERENCE] A symbol-matching "kecermatan" task is closer to d2 or DSST (perceptual speed, visual search) than to Kraepelin addition (numeric facility). Borrowing Kraepelin's personality interpretations of curve shape onto a symbol task has no direct validity support.

### Gaps
- No accessible peer-reviewed test-retest or split-half coefficients for Panker, Tianker, Janker or Hanker.
- Exact coefficients for the Faxtor/Pauli correlation were not retrievable (TLS/PDF errors).
- Bourdon test: no source retrieved in this session.
- A source I could not verify reported online SDMT test-retest ICCs of about .89-.90. It is not cited for that reason.

---

## 3. How to quantify stability (keajegan) and endurance (ketahanan)

### Takeaway
SD, range, coefficient of variation and slope each measure something different. All within-person curve statistics computed from 10 points are noisy. Slopes and difference scores (last − first, half 2 − half 1) carry the well-known low reliability of change scores. Report them as descriptive or flag-level information unless their reliability has been shown in your own data.

### Cited Findings
- Cronbach & Furby (1970), "How we should measure 'change' — or should we?": raw gain or difference scores are systematically related to measurement error and lead to fallacious conclusions. Gain scores are rarely useful however they are adjusted. — [Cronbach & Furby 1970 PDF](https://www.gwern.net/docs/dnb/1970-cronbach.pdf) [EVIDENCE]
- A difference score D = X − Y is always less reliable than its components, and the higher the correlation between X and Y, the lower the reliability of D. — [Cronbach & Furby 1970 (search summary)](https://www.gwern.net/docs/dnb/1970-cronbach.pdf); counterpoint: [Zimmerman/Williams, "A defense against the alleged unreliability of difference scores"](https://deepblue.lib.umich.edu/items/02281d10-400f-4060-b657-8769dfdf3ec8) [EVIDENCE; debated]
- The Kraepelin manual itself rates range as crude and average deviation as more precise for Janker. — [Manual Tes Kraepelin (2013)](https://softwarepsikotes.com/Manual%20Tes%20Kraepelin.pdf) [MANUAL]
- The d2 tradition operationalizes constancy as acceleration and deterioration process scores, but their validation was preliminary. — [Bates & Lemay 2004](https://www.cambridge.org/core/journals/journal-of-the-international-neuropsychological-society/article/abs/d2-test-of-attention-construct-validity-and-extensions-in-scoring-techniques/FC00B4A2821A27EF96DBE9E3DA80355B)

### Inferences
- [INFERENCE] Comparison of the options:
  - **Range** (max − min): uses only 2 of 10 points, is outlier-driven, and grows with the number of columns.
  - **SD / average absolute deviation**: uses all points, but its scale grows with the person's level. Fast workers have more room to fluctuate.
  - **Coefficient of variation** (SD / mean): removes the level dependence, but is unstable when the mean is low (very slow or near-zero responders).
  - **Detrended SD** (SD of residuals around the slope): separates fluctuation from trend. It is the cleanest "keajegan" if trend is reported separately.
  - **OLS slope**: uses all points, matches the Hanker tradition, and is less outlier-sensitive than last − first.
  - **Split-half difference** (mean of columns 6-10 minus mean of 1-5): this is a classic difference score with the low-reliability problem. In this draft it is also **confounded with the symbol-set change at column 6** (Greek → "continued variations").
- [INFERENCE] Precision of a 10-point slope: with x = 1..10, Σ(x − x̄)² = 82.5. If residual SD across columns is around 3 items, SE(b) = 3/√82.5 ≈ 0.33 items/column. Over the 9-column span that is about ±3 items of "decline" from noise alone at 1 SE. The real residual SD must come from pilot data.
- [INFERENCE] **Design confound**: columns 1-5 and 6-10 use different symbol sets. Any difficulty difference between the sets will look like fatigue or improvement in S. The slope stays uninterpretable until column difficulty is equated, or until the expected column means from norm data are subtracted (an ipsative residual relative to the norm curve).
- [INFERENCE] Recommendation:
  - Compute slope on **norm-adjusted column scores**: per column, z-score against the norm group's mean and SD for that column, then take the slope of those z values.
  - Compute keajegan as the detrended SD.
  - Report both as banded categories (like the classic 5-level norms), not as precise points.
  - Estimate their test-retest reliability before giving them any weight.

### Gaps
- I found no published reliability estimates for per-person work-curve slopes or SDs in Kraepelin/Pauli-type tests. Collect them in your own pilot (test-retest or odd/even-column split).

---

## 4. Is a fixed % penalty for a declining curve (>30% → 5-10% deduction) supported?

### Takeaway
**No support found.** None of the sources reviewed applies a percentage penalty to a raw score for a declining curve. That covers the Indonesian Kraepelin manual and scoring guides, the d2-R scoring and the Pauli/Kraepelin literature. The classic practice scores endurance (Hanker) as a separate norm-referenced index. The 30% threshold and the 5-10% deduction look like arbitrary, practitioner-invented numbers.

### Cited Findings
- Classic Hanker = Y50 − Y0 from a regression line, interpreted only through norm categories. A negative value means "menurun" (declining) and maps to a lower category on that index. No deduction from Panker or any composite is described. — [Manual Tes Kraepelin (2013)](https://softwarepsikotes.com/Manual%20Tes%20Kraepelin.pdf); [Wicaksono (2014)](http://darmawanwicaksono.blogspot.com/2014/09/normal-0-false-false-false-in-x-none-x.html) [MANUAL/CONVENTION]
- In the classic norms a small negative trend (e.g., down to −1.475 for SMEA) is still "Sedang" (average). Some decline is treated as normal, not penalized. — [Manual Tes Kraepelin (2013)](https://softwarepsikotes.com/Manual%20Tes%20Kraepelin.pdf)
- d2-R main scores are CP (hits − commissions), processed targets and error %. Constancy is not used to dock those scores. — [Hogrefe d2-R sample report](https://www.hogrefe.com/us/shop/media/downloads/sample-reports/HUS62750_mr.pdf)
- Change and difference scores are unreliable, so a rule triggered by a decline estimate inherits that unreliability. — [Cronbach & Furby 1970](https://www.gwern.net/docs/dnb/1970-cronbach.pdf)

### Inferences
- [INFERENCE] Specific risks of the proposed rule:
  1. **Double counting**: a decline already lowers K, the total answered. Docking the score again penalizes the same behavior twice.
  2. **Penalizes high starters**: "30% decline" relative to column 1 punishes candidates who start very fast. A slow, flat performer can escape the penalty while answering fewer items in total.
  3. **Regression to the mean**: an unusually high first or peak column, from luck or an easy item cluster, regresses on later columns and produces an apparent decline with no real fatigue.
  4. **Discontinuity**: a hard threshold (29% means nothing, 31% means minus 10%) puts big score jumps between nearly identical performances. That is hard to defend in high-stakes selection.
  5. **Construct confusion**: fatigue or end-of-test decline is partly normal (the work-curve tradition expects fatigue). Penalizing it presumes a validity claim (decline predicts poor job endurance) that has no evidence here.
  6. **Confounded by design**: the symbol-set change at column 6 can create a "decline" by itself (see Q3).
  7. **Undefined percent base**: is it first column vs last, first half vs second half, slope relative to the mean, or peak vs last? Each gives different results.
- [INFERENCE] A defensible alternative: report S (trend) as its own norm-referenced index. If needed, add a **descriptive flag**, for example "slope below the norm group's 10th percentile *and* statistically different from 0", for a psychologist to review. Do not automatically deduct points.

### Gaps
- I can't prove a negative. Some proprietary CAT vendors or Polri internal scoring may use a penalty, but none was publicly documented.

---

## 5. Speed-accuracy trade-off, guessing/random clicking, unanswered items, anomaly flags

### Takeaway
Speed and accuracy trade off within and between people, so a ratio-only accuracy score (T = correct/answered) can be gamed by answering few items carefully. Comparable tests use **error-corrected speed** (d2 CP = hits − commissions), report error counts separately, and treat omissions explicitly. In a forced-choice symbol task, random clicking produces chance-level accuracy at high speed, which is easy to detect.

### Cited Findings
- The speed-accuracy tradeoff (SAT) is a ubiquitous effect where decision speed covaries with accuracy. Heitz (2014) gives a methodological guide and critiques common analysis techniques. — [Heitz 2014, Frontiers in Neuroscience / PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4052662/) [EVIDENCE]
- Bates & Lemay found d2 overall scores correlated with test-taking strategy in expected directions. Strategy (speed vs care) shifts scores. — [Bates & Lemay 2004](https://www.cambridge.org/core/journals/journal-of-the-international-neuropsychological-society/article/abs/d2-test-of-attention-construct-validity-and-extensions-in-scoring-techniques/FC00B4A2821A27EF96DBE9E3DA80355B) [EVIDENCE]
- d2 CP = hits − commission errors, which builds an error correction into the speed score. — [Hogrefe d2-R](https://www.hogrefe.com/us/shop/media/downloads/sample-reports/HUS62750_mr.pdf) [MANUAL]
- Kraepelin Tianker counts errors **plus skipped items** ("Sum of Skippeds"), so skipping is penalized as inaccuracy. The draft's correct/answered ratio does not penalize skipping. — [Manual Tes Kraepelin (2013)](https://softwarepsikotes.com/Manual%20Tes%20Kraepelin.pdf) [MANUAL]
- Errors (number wrong) predicted rule compliance beyond GMA, so errors deserve their own score. — [Mount, Oh & Burns 2008](https://iro.uiowa.edu/esploro/outputs/journalArticle/Incremental-validity-of-perceptual-speed-and/9984963208902771) [EVIDENCE]

### Inferences
- [INFERENCE] Spec gaps to close:
  - **Define "answered" vs "skipped" vs "not reached"** for each column. Is skipping allowed? Is there a "next" button, or must every item be answered in order?
  - **Primary speed score** = correct responses (or correct − wrong) per column. Raw total answered rewards random clicking.
  - **Accuracy**: report error count and error % separately. Use a ratio only alongside a minimum-attempted threshold (e.g., T is shown only if attempted ≥ some norm percentile). Otherwise 5/5 = 100% beats 48/50 = 96%.
- [INFERENCE] Anomaly flags. The thresholds below are illustrative and must be set from pilot distributions:
  - Accuracy near chance. With k answer options chance = 1/k; for a 5-option missing-symbol item, about 20%.
  - Median response time below a physiological floor (e.g., under 150-200 ms per item), or long runs of identical answer positions.
  - Zero responses in a column (disengagement, connectivity loss) vs a sudden drop, which may be a tab switch. Log visibility and blur events.
  - Columns with ~0 errors and very low output (extreme caution strategy), and the reverse.
  - Use **per-item timestamps** to compute within-column rate. That gives a finer, more reliable curve than 10 column totals.

### Gaps
- No Kraepelin-specific literature retrieved on guessing detection or minimum-attempt thresholds. The flags above are design inferences.

---

## 6. Online/digital administration: device, timing, mode equivalence, practice/coaching, item design, parallel forms

### Takeaway
Speeded tests are the category *least* equivalent across paper and computer. Norms from paper Kraepelin/Pauli cannot be reused for an online symbol task, and device or input differences threaten fairness. Retest and coaching effects are real: about +0.26 SD overall in a selection meta-analysis, larger with coaching and identical forms. They plateau after about 3 administrations. Use parallel or randomized forms.

### Cited Findings
- Mead & Drasgow (1993, *Psychological Bulletin* 114, 449-458), a meta-analysis of computerized vs paper cognitive tests, found **speededness moderated cross-mode equivalence**. Early studies found poorer computerized results especially for speed tests. — [GESIS record](https://data.gesis.org/gesiskg/resource/zis-Mead1993Equivalence); [EERA summary](https://eera-ecer.de/ecer-programmes/conference/19/contribution/31667) [EVIDENCE]
- Greaud & Green, "Equivalence of conventional and computer presentation of speed tests" (UMN record; full text blocked). — [UMN Conservancy](https://conservancy.umn.edu/items/ab6d133a-aefc-4c2e-bff5-13c4f55da474)
- Hausknecht et al. (2007, *J Appl Psych* 92, 373-385): 50 studies, 107 samples, N = 134,436. Adjusted retest effect **d = .26**, larger **with coaching** and **with identical forms**. 25-50% of applicants in selection settings are retested. — [Hausknecht et al. 2007 (DePaul)](https://depaul.elsevierpure.com/en/publications/retesting-in-selection-a-meta-analysis-of-practice-effects-for-te/); [SUFE summary](https://academicnewsletter.sufe.edu.cn/info/372000) [EVIDENCE]
- Scharfen, Peters & Holling (2018, *Intelligence* 67, 44-66): 122 studies, 174 samples, N = 153,185. Retest gains were SMCR = 0.33 from test 1 to 2 and 0.17 from 2 to 3, with **no further gain after the third administration** (0.02). Moderators were operation and content, **equivalence of test forms**, retest interval and age. Processing-speed tasks showed no gain from test 3 to 4 (−0.07). The hypothesis that speed tests show the smallest retest effects got only "scarce" support. Note: a WebFetch summary of this paper wrongly claimed speed tests show the *largest* gains; the PDF text says otherwise. — [Scharfen et al. 2018 PDF](https://www.Gwern.net/doc/iq/2018-scharfen.pdf) [EVIDENCE]
- The Kraepelin manual warns that candidates "steal time" at the start and end. That is a proctoring issue online timers remove, but online testing introduces latency and focus issues instead. — [Manual Tes Kraepelin (2013)](https://softwarepsikotes.com/Manual%20Tes%20Kraepelin.pdf) [MANUAL]

### Inferences
- [INFERENCE] **Device/input**: throughput depends on the response modality (mouse travel, touch target size, keyboard keys). Fix the input mode, ideally keyboard number keys mapped to options, or build norms per device class. Record device type and block unsupported devices for high-stakes use.
- [INFERENCE] **Timing**: run the authoritative timer from performance.now() on the client, with server-side start/end timestamps as a sanity check. Never rely on setInterval tick counts, which drift and throttle in background tabs. Store per-item client timestamps. On column switch, discard responses that arrive after the deadline (network latency) using the client-side timestamp checked against the server window.
- [INFERENCE] **Item/symbol design**:
  - Greek letters differ in familiarity across candidates; math/science graduates know α, β, θ. Familiarity changes encoding speed and adds construct-irrelevant variance.
  - Confusable pairs (e.g., Ο/Θ, Ψ/Φ, ν/υ, rotated/mirrored variants) change difficulty.
  - Columns must be **equated in difficulty**, or the curve (S) measures item difficulty rather than endurance. Pilot per-column means and keep the symbol set constant, or counterbalance across columns.
- [INFERENCE] **Parallel forms**: generate each column from a seeded random draw under constraints (equal target frequencies, equal confusable-pair counts, no repeated item within a column). Store the seed for audit. Identical forms boost retest gains, per Hausknecht and Scharfen.
- [INFERENCE] **Coaching**: Indonesian prep material and drilling books are widespread. Expect a coached population, and build norms from a population with the same exposure. Also consider a short warm-up column that is not scored.

### Gaps
- No study found on paper-vs-online equivalence specifically for Kraepelin/Pauli or Indonesian kecermatan.
- The widely cited Mead & Drasgow cross-mode correlations (lower for speeded than for power tests) were not verified numerically in this session.

---

## 7. Indonesian context (Polri, TNI, CPNS/BUMN; local literature)

### Takeaway
Kraepelin/Pauli and symbol- or letter-based "tes kecermatan" are standard in Indonesian selection, including Polri CAT psychological testing. They are heavily coached. Local scholarship on norms exists (e.g., Koentjoro's norm study at UGM), but it is old or thesis-level, and practitioners administer and score inconsistently.

### Cited Findings
- Polri CAT psikologi includes a tes kecermatan among its components, together with personality, intelligence and "passhand" tests. Results are shown right after completion, and administration is supervised by internal and external proctors. — [Tribrata News Polda Kepri](https://tribratanews.kepri.polri.go.id/polda-kepri-gelar-tes-psikologi-calon-bintara-pria-pastikan-proses-transparan-dan-bebas-intervensi); [Ombudsman Papua Barat on CAT psikotes Akpol](https://ombudsman.go.id/news/download/pwk--ombudsman-papua-barat-kawal-cat-psikotes-akpol-pastikan-seleksi-transparan-dan-berkeadilan) [official news; format details not given]
- A prep site describes Polri CAT as including speed and persistence tests "seperti Tes Pauli/Kraepelin" (such as Pauli/Kraepelin) that measure "stabilitas emosi dan daya tahan mental" (emotional stability and mental endurance). — [Dealls](https://dealls.com/pengembangan-karir/soal-psikotes-polri) [CONVENTION; construct claim unsupported]
- The Kraepelin manual says the test is used in ABRI (TNI/POLRI) and companies for selection and placement, and sometimes still as a personality test. — [Manual Tes Kraepelin (2013)](https://softwarepsikotes.com/Manual%20Tes%20Kraepelin.pdf)
- Koentjoro carried out a norm-standardization study (pembakuan norma) of the Kraepelin test for kecepatan, ketelitian, keajegan and ketahanan among sarjana muda IPS and IPA graduates in Kotamadya Yogyakarta. — [search result pointing to UGM repository](https://etd.repository.ugm.ac.id/home/detail_pencarian_downloadfiles/365901) (full text image-only, not verified)
- A UGM thesis-level study reports that Kraepelin and Pauli remain popular among Indonesian psychologists, but their popularity "tidak diiringi dengan keseragaman" (is not matched by uniformity): understanding and administration procedures still differ between users. — [UGM ETD record (search snippet; exact record ambiguous)](https://etd.repository.ugm.ac.id/home/detail_pencarian_downloadfiles/365902)
- Indonesian computer-science theses and papers build computerized Kraepelin apps, for example with Naive Bayes classification or Linear Congruential random generation. They are engineering papers, not psychometric validation. — [Telkom University](https://repositori.telkomuniversity.ac.id/pustaka/files/168077/jurnal_eproc/perancangan-dan-implementasi-tes-psikologi-kraepelin-berbasis-komputer-dengan-metode-naive-bayes-sebagai-pengambilan-keputusan.pdf); [PNL e-jurnal](https://e-jurnal.pnl.ac.id/teknologi/article/view/2418)
- Huruf hilang (missing letter) format: find the letter missing from rows of letters, all lowercase or all uppercase. — [search summary of Polri prep sources](https://journal.uii.ac.id/AUTOMATA/article/download/24095/13997/73484) [CONVENTION]

### Inferences
- [INFERENCE] The draft (10 columns, about 60 s, symbol sets) mirrors the popular Polri-style "kecermatan" prep format. It is not the classic Kraepelin format (50 x 15 s addition). Borrowing Kraepelin labels (panker, janker, hanker) and their personality interpretations for a symbol task needs its own validation.
- [INFERENCE] HIMPSI's code of ethics and test-use norms require tests used for selection to have adequate standardization. A home-built online kecermatan therefore needs its own reliability and norm study before high-stakes use.

### Gaps
- No public official specification of the Polri kecermatan format (columns, items, time per column) or its scoring was found.
- No HIMPSI publication specifically on Kraepelin/Pauli or kecermatan scoring was retrieved.
- Garuda/Neliti full texts could not be accessed in this session.

---

## 8. Converting K/T/P/S into one 0-100 score; norming requirements

### Takeaway
Use **norm-referenced standard scores**: z → T-score (50 ± 10) or percentile, then rescale if a 0-100 display is required. Min-max scaling is sample-dependent and outlier-driven. Weights for any composite should be set and justified explicitly. Norms must come from a representative sample on the *same* online form and device conditions. The classic tradition reports each index separately against norms split by education and sex, not as one composite.

### Cited Findings
- Classic practice converts each index separately into 5 norm categories, with norm tables split by education level and sex. — [Manual Tes Kraepelin (2013)](https://softwarepsikotes.com/Manual%20Tes%20Kraepelin.pdf) [MANUAL]
- d2-R reports its main variables (CP, processed targets, error %) as norm-referenced scores. — [Hogrefe d2-R sample report](https://www.hogrefe.com/us/shop/media/downloads/sample-reports/HUS62750_mr.pdf) [MANUAL]
- Practice and coaching shift score distributions (d ≈ .26, larger with coaching). Norms built on uncoached samples will misclassify coached applicants. — [Hausknecht et al. 2007](https://depaul.elsevierpure.com/en/publications/retesting-in-selection-a-meta-analysis-of-practice-effects-for-te/)
- Speeded-test scores are mode-sensitive, so paper norms cannot be transferred. — [Mead & Drasgow 1993](https://data.gesis.org/gesiskg/resource/zis-Mead1993Equivalence)

### Inferences
- [INFERENCE] Recommended pipeline:
  1. Raw indices: correct per column (vector of 10), total correct, errors, omissions, slope of norm-adjusted column z-scores, detrended SD.
  2. Convert each to a z-score against the relevant norm group (e.g., education level, possibly age). For skewed indices such as error counts, use percentile ranks or normalized z (rank-based inverse normal).
  3. Composite = weighted sum of z values. Defensible defaults: weight speed (correct) and accuracy (errors) heavily, and weight S lightly or not at all until its reliability is shown. Re-standardize the composite.
  4. Display as T-score or percentile, mapped to 0-100 only for presentation, with the 5-band category labels (Baik Sekali … Kurang Sekali) to match Indonesian reporting habits.
- [INFERENCE] **Do not use min-max scaling**: one extreme candidate changes everyone's score, and the result has no fixed meaning across cohorts.
- [INFERENCE] **Do not include P (best column)** in the composite. It is redundant with total speed and is the least reliable.
- [INFERENCE] Norming requirements for the online form:
  - A pilot large enough for stable percentiles in each subgroup (a common rule of thumb is a few hundred per norm group).
  - Same device and input class as production.
  - Coaching exposure recorded.
  - Test-retest or parallel-form reliability for every reported index.
  - Per-column difficulty equating.
  - A periodic norm refresh, since prep culture shifts distributions.

### Gaps
- No published Indonesian composite-scoring scheme (weights) for kecermatan was found. Polri CAT weighting is not public.
