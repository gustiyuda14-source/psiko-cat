# CAT & IRT Design for a Cognitive-Ability Module (Verbal, Logis/Spasial, Analitis, Praktis/Aritmetika)

Context: the draft spec mixes a 100-item fixed form (bentuk tetap) with an adaptive algorithm (start medium, update theta, stop when SEM <= 0.15 OR >= 20 items). Notes below give the numbers and sources needed to fix that spec. Items marked "Inference" are my reasoning/arithmetic from cited facts, not source claims.

## 1. Which IRT model is standard for ability CAT, and what calibration sample sizes are needed?

### Takeaway
Operational ability CATs use dichotomous logistic models (2PL/3PL; the big military/licensure programs historically 3PL), with polytomous models (GRM, GPCM, PCM) for partial-credit items. Model complexity drives sample size: roughly >=200 examinees as an absolute floor for any IRT, ~500 for 2PL/GRM-type models, and ~1,000 for stable 3PL on long tests. A brand-new Indonesian bank without that calibration data cannot run a defensible CAT yet.

### Cited Findings
- Software support shows the model menu used in practice: catR supports dichotomous 1PL–4PL and polytomous GRM, MGRM, PCM, GPCM, RSM, NRM — [Magis & Barrada 2017, JSS 76(1)](https://personal.unizar.es/barrada/papers/17_JSS_Magis.pdf); mirtCAT supports unidimensional and multidimensional IRT CAT — [Chalmers 2016, JSS 71(5)](https://ideas.repec.org/a/jss/jstsof/v071i05.html).
- CAT-ASVAB (military aptitude, hundreds of thousands of applicants per year) is an IRT CAT with Sympson-Hetter exposure control; the literature on its exposure control studies it under the 3PL — [PARE/UMass article on CAT-ASVAB exposure control](https://openpublishing.library.umass.edu/pare/article/1344/galley/1295/view); [Meadows Center: "A Comparison of Exposure Control Procedures in CATs Using the 3PL Model"](https://meadowscenter.org/?p=3154).
- Sample-size rules of thumb reported in a review: Sireci (1992) suggested a minimum of 200 people for any IRT analysis; 2PL and 3PL need more than 200; for the 3PL, N = 1,000 gave stable parameters for a 70-item test, and N = 500 was enough for a 27-item test — [Atlantis Press review paper](https://www.atlantis-press.com/article/125907988.pdf).
- The same review notes another finding of "no difference in suitable sample size" between 1PL and 3PL in one study. So the literature is not unanimous; the dependence is on test length, item quality and the precision required — [Atlantis Press](https://www.atlantis-press.com/article/125907988.pdf).
- GRM: N = 500 gave accurate parameter estimates in most conditions studied, but tests with 240 items needed N = 1,000. De Ayala (1994) found good recovery of discrimination and threshold parameters (r > 0.89) with 375 examinees for 15-item scales and 750 for 30-item scales (about 25 examinees per item) — [Jiang, Wang & Weiss 2016, Frontiers in Psychology](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2016.00109/pdf).
- Large calibration samples are "not easily met in many practical pretesting situations", which has driven research on small-sample methods — [Atlantis Press](https://www.atlantis-press.com/article/125907988.pdf).

### Inferences
- A practical rule for this project: 2PL with N >= 500 per item (each item answered by about 500 people from the target population of job applicants) is the realistic minimum. Use 3PL (it adds a guessing parameter c, *parameter tebakan*) only if N per item is about 1,000 or more. The 1PL/Rasch model can work with about 200 but assumes equal discrimination, which cognitive items with mixed formats rarely meet.
- The calibration sample must come from the operational population (Indonesian job applicants, online, proctored the same way). Parameters from students or other populations drift (see section 6).
- Because the four subtests measure different abilities, calibrate each subtest as its own unidimensional scale (*skala unidimensi per subtes*), or fit a multidimensional/bifactor model (mirtCAT supports this). Do not put 100 mixed items on one theta without checking dimensionality.

### Gaps
- I could not verify online the exact sample-size tables in de Ayala (2009, *The Theory and Practice of IRT*) or Embretson & Reise (2000). Practitioners often quote "about 500 for 2PL, about 1,000 for 3PL" from these books, but I did not confirm the page-level wording this session.
- I did not verify which IRT model CAT-ASVAB, GMAT or NCLEX currently use from primary technical manuals.

## 2. How large must the item bank be, and why is about 100 items not enough?

### Takeaway
The classic benchmark is a pool equal to 6–8 linear test forms in size and quality to support a CAT about half the length of the linear test (Stocking, ETS 1994). Pool size has to be calculated per content area (per subtest), and exposure control needs extra items on top of that. About 100 items split across 4 subtests (about 25 each) cannot support adaptivity, security and precision at the same time.

### Cited Findings
- "Item pools of the size and quality of six to eight linear tests are adequate to support adaptive tests of roughly half the length of a parallel linear test." The same report recommends multiple randomly assigned pools, with rotation, for continuous testing security — [Stocking 1994, ETS RR "Three Practical Issues for Modern Adaptive Testing Item Pools"](https://www.ets.org/research/policy_research_reports/publications/report/1994/hxnr.html).
- CAT typically needs no more than half the items of a conventional test to reach equivalent reliability and validity — [Redalyc article on CAT item banks](https://www.redalyc.org/pdf/3995/399541533004.pdf).
- ACER simulation for psychological assessment: a bank of 150 items (10 items per 0.5-logit ability level) gave an SEM of about 0.47 after an average of 20 items (0.39 after 29 items) for 85–93% (64–82%) of simulees. Doubling to 300 items (20 per level) did not significantly improve performance — [ACER, "Adaptive testing for psychological assessment: how many items are enough…"](https://people.acer.org/en/publications/adaptive-testing-for-psychological-assessment-how-many-items-are-/).
- A good bank must cover all aspects of the construct and have enough items at every scale value (all theta levels) — [Redalyc](https://www.redalyc.org/pdf/3995/399541533004.pdf).

### Inferences
- The ACER result is the most directly relevant: even 150 items on one construct reached only SEM about 0.4–0.47 at 20–29 items. This draft has about 25 items per subtest, so each subtest has about one sixth of that bank.
- Stocking arithmetic for this spec: if each subtest CAT should be about 10–15 items, the per-subtest pool should be about 6–8 times the equivalent linear form (about 20–30 items), which gives **roughly 120–240 calibrated items per subtest**, or about 500–1,000 in total for 4 subtests. That is before replacing retired or compromised items.
- With a 25-item subtest pool and a 10–15-item CAT, each examinee sees 40–60% of the pool. Item exposure rates come close to 100% for the most informative items, and the test is effectively a fixed form that anyone can memorise and leak. That defeats both reasons for CAT: efficiency and security.
- Recommendation for the spec: keep the 100 items as a **fixed linear form (bentuk linear tetap) or a multistage test (MST)** for phase 1, use it to collect calibration data, and switch to CAT only when the bank reaches a few hundred calibrated items per subtest.

### Gaps
- I did not retrieve the exact item-pool sizes of CAT-ASVAB subtests, GRE or NCLEX from primary sources this session. Figures quoted elsewhere, such as "CAT-ASVAB pools of about 100–200+ items per subtest" or "NCLEX pool of thousands", are unverified here.
- I found no source specific to Indonesian-language cognitive item banks.

## 3. Realistic stopping rules: SEM thresholds, reliability equivalents, and min/max length

### Takeaway
Operational CATs stop at SE(theta) about 0.30 (reliability about 0.91), sometimes 0.25–0.40, always combined with a minimum and a maximum item count. SEM <= 0.15 corresponds to reliability about 0.98 and needs test information about 44. That takes roughly 60–180 perfectly targeted items, more than a 25-item subtest pool contains, so the rule as drafted can never fire.

### Cited Findings
- NIH Toolbox / PROMIS default: stop after 12 items (maximum) or when SE of the EAP estimate is below 0.3, which "corresponds to a minimum reliability of 0.91", after at least 4 items (minimum) — reported in [PMC12681468, "Reducing patient burden of PROMs … advanced CAT stopping rules"](https://pmc.ncbi.nlm.nih.gov/articles/PMC12681468/) and [JMIR Formative Research 2025;9:e60215](https://formative.jmir.org/2025/1/e60215). These were search-result extracts; the full text was blocked by CAPTCHA, so verify the wording.
- mirtCAT's default precision stopping criterion is `min_SEM = 0.3` per dimension, combined with `min_items` and `max_items` — [mirtCAT reference manual v1.14](https://cran.r-project.org/web/packages/mirtCAT/refman/mirtCAT.html).
- SE(theta) = 1/sqrt(I(theta)); a typical target of 0.30–0.40 logits corresponds to reliability of about 0.90–0.84. Minimums of 5–10 items are "typical" to stop lucky early patterns from ending the test, and the SE rule can only fire between min and max — [MetricGate CAT stopping-rules doc](https://metricgate.com/docs/cat-stopping-rules). This is a secondary calculator/tutorial site, so treat it as corroboration only.
- NCLEX (licensure classification CAT): minimum 85 and maximum 150 items, 5-hour time limit. It stops when the 95% confidence interval lies entirely above or below the passing standard, and has max-length and run-out-of-time rules — [UWorld Nursing](https://nursing.uworld.com/?p=48325), [Lecturio](https://www.lecturio.com/blog/demystifying-the-cat-exam-for-nclex-how-adaptive-testing-works/). These are test-prep secondary sources; the official NCSBN documentation was not fetched.
- CAT-ASVAB precision in practice: AFQT composite reliability 0.97 (CAT) vs 0.94 (paper-and-pencil); individual subtest reliabilities range 0.71–0.88; AFQT SEM 4.39 (CAT) vs 5.87 (P&P), with N = 307,276 CAT examinees in 2019 — [Official ASVAB, Test Score Precision](https://www.officialasvab.com/researchers/test-score-precision/).

### Inferences
- With theta scaled to N(0,1), marginal reliability is about 1 − SE². That gives:
  - SE 0.50 → 0.75
  - SE 0.40 → 0.84
  - SE 0.35 → 0.88
  - SE 0.316 → 0.90
  - SE 0.30 → 0.91
  - SE 0.25 → 0.94
  - SE 0.20 → 0.96
  - **SE 0.15 → 0.9775**

  Even CAT-ASVAB *subtests* only reach 0.71–0.88, so 0.98 per subtest is unrealistic.
- Required information for SE 0.15: I = 1/0.15² ≈ 44.4.
  - A 2PL item gives at most a²/4 at theta = b (logistic metric, D = 1).
  - With a = 1.0 that is 0.25 per item, so about 178 perfectly targeted items.
  - With a = 1.5 it is 0.5625 per item, so about 79 items.
  - With D = 1.7 and a = 1.0 it is about 0.72 per item, so about 62 items.
  - 3PL items with guessing c > 0 give even less.

  All of these exceed a 25-item subtest pool.
- **Logic bug in the draft:** "stop when SEM <= 0.15 OR at least 20 items" makes 20 a *maximum*, not a minimum. Because SE 0.15 is unreachable, every examinee stops at exactly 20 items, so the "adaptive" test is in effect a 20-item fixed-length CAT with uncontrolled precision. ACER's simulation suggests the final SE would be about 0.4–0.5. Correct form: `stop if (n >= n_min AND SE <= SE_target) OR n >= n_max`.
- Suggested starting values per subtest, to be confirmed by simulation:
  - SE_target = 0.30–0.35
  - n_min = 5–8
  - n_max = 15–25
  - add a time limit, plus an overall battery cap so 4 subtests stay within the session time.
  - For a selection (seleksi) decision near a cut score, consider a classification rule (SPRT/confidence interval around the cut, as NCLEX does) rather than a fixed SE.

### Gaps
- I did not retrieve GRE/GMAT published conditional SEMs or reliabilities.
- I did not verify a peer-reviewed source that explicitly tabulates SE versus reliability. The formula is standard but was only seen here on secondary sites and in the PROMIS/NIH statement (SE 0.3 ↔ 0.91).

## 4. Item selection, exposure control, content balancing, and ability estimation

### Takeaway
The default is maximum Fisher information (MFI) item selection plus an exposure-control layer (randomesque, Sympson-Hetter, a-stratification, or progressive/proportional methods) plus content balancing (Kingsbury-Zara or shadow tests). Estimate ability with EAP/MAP, or Bayes modal, for the early items, because ML is undefined for all-correct or all-wrong response patterns. Both main R packages implement all of these off the shelf.

### Cited Findings
- catR item selection rules: MFI, bOpt, thOpt, MLWI, MPWI, MEI, MEPV, KL, KLP, GDI, progressive, proportional, random. Ability estimators: ML, BM (Bayes modal), EAP, WL (Warm's weighted likelihood), ROB. Stopping rules: length, precision, classification, minimum information. Exposure control: randomesque, Sympson-Hetter, restrictive progressive/proportional. Content balancing: Kingsbury & Zara method — [Magis & Barrada 2017](https://personal.unizar.es/barrada/papers/17_JSS_Magis.pdf).
- mirtCAT selection criteria: MI, MEI, MEPV, MLWI, MPWI, KL, IKL (plus D/T/A/E/W-rules for multidimensional tests). Estimators: MAP, EAP, ML, WLE. Exposure control: randomesque (choose randomly from the top-n items) and Sympson-Hetter. Content balancing: `content` and `content_prop` arguments. Shadow testing (optimal test design) through `constr_fun` and `customNextItem`, and a separate `preCAT` stage for the first items — [mirtCAT refman v1.14](https://cran.r-project.org/web/packages/mirtCAT/refman/mirtCAT.html); [Chalmers 2016 JSS](https://ideas.repec.org/a/jss/jstsof/v071i05.html).
- Sympson-Hetter gives each item a conditional administration probability K_i in [0,1], calibrated iteratively *by simulation* until every item's exposure rate is at or below the target maximum. CAT-ASVAB uses SH because the test is high stakes — [PARE/UMass](https://openpublishing.library.umass.edu/pare/article/1344/galley/1295/view); [MetricGate exposure-control doc](https://metricgate.com/docs/cat-exposure-control/).
- a-stratification (Chang & Ying 1999) divides the pool into strata by discrimination (a), usually 4. It uses low-a items early, when theta is uncertain, and saves high-a items for later, which evens out exposure across the pool — [Psicothema comparison of exposure methods](https://www.psicothema.com/pdf/3191.pdf); [UT Austin repository](https://repositories.lib.utexas.edu/items/2c9da59d-502b-48ed-85e9-5b11e43a91d1/full).
- Shadow testing is the general method when many constraints apply at once (content, exposure, enemy items) — [mirtCAT CRAN description](https://cran.rstudio.com/web/packages/mirtCAT/index.html).

### Inferences
- **"Start at medium difficulty" (mulai dari tingkat sedang):** this is standard. Theta0 = 0, or a random value in [−0.5, 0.5] so the first item is not always the same, which is itself an exposure problem. Use EAP/MAP with an N(0,1) prior from item 1, or a short preCAT block, because ML diverges after all-correct or all-wrong strings. A common pattern is EAP during the test and ML/WLE for the final score, but EAP throughout is also common (PROMIS uses EAP).
- **Content balancing across 4 subtests:** either run 4 separate subtest CATs, each with its own theta and stopping rule (simplest, and matches the separate reported scores), or one CAT with Kingsbury-Zara target proportions (for example 25% each). If subtest scores are reported separately, they must be estimated separately; one blended theta cannot produce four valid subtest scores.
- Set exposure targets (for example r_max = 0.2–0.3) and verify them by simulation. With a tiny pool, no exposure method can work: SH would simply run out of eligible items.

### Gaps
- I did not retrieve the original Kingsbury & Zara (1989), Sympson & Hetter (1985), or Chang & Ying (1999) papers. Their descriptions above come from secondary summaries.
- I found no comparative source on which exposure method is "best". Practitioner opinion differs: randomesque is simple, SH needs simulation-based calibration, and a-stratification depends on a good spread of a-parameters.

## 5. Converting theta to a reportable 0–100 score, and combining theta with fixed-form scores

### Takeaway
Theta is converted with a linear transformation to a scale score. Percentiles come from a norm group (kelompok norma) of comparable applicants. CAT and fixed-form results can only be combined or compared if both sit on the same calibrated theta scale (same item parameters, or linked/equated forms). Never average a raw percent-correct with a theta.

### Cited Findings
- GRE (section-level adaptive MST) converts raw scores to scaled scores through equating, which accounts for differences between editions *and* the difficulty differences introduced by adaptation. A given scaled score therefore means the same performance whichever second section the examinee received — [ETS, Understand GRE scores](https://www.ets.org/gre/test-takers/general-test/scores/understand-scores.html).
- CAT-ASVAB reports CAT subtest scores, from IRT theta, alongside P&P results on a common reporting scale (AFQT). AFQT SEMs are reported in that score metric: 4.39 for CAT and 5.87 for P&P — [Official ASVAB](https://www.officialasvab.com/researchers/test-score-precision/).
- Programs that rotate multiple pools must show that scores and passing decisions are psychometrically comparable across pools, for example by comparing conditional SEMs at equal scale scores — [Applied Psychological Measurement 2023, doi:10.1177/01466216231209749](https://journals.sagepub.com/doi/10.1177/01466216231209749) (search-result abstract only).

### Inferences
- Recommended reporting chain:
  1. theta, per subtest
  2. a linear scale score. Examples: T = 50 + 10·theta; or, for a "0–100 style" display, S = 50 + 15·theta clipped to [0, 100]. A linear map keeps the SE meaning: SE_S = 15·SE_theta.
  3. a percentile against an Indonesian applicant norm group, by job level if needed
  4. a category (for example sangat rendah to sangat tinggi).

  Do **not** present theta-derived 0–100 as "percent correct" (persen benar). In a CAT everyone answers about 50% correctly by design, so percent correct is meaningless.
- To combine CAT and the 100-item fixed form: calibrate all items together (concurrent calibration), then score the fixed form with IRT (pattern scoring, or summed-score EAP) on the same theta scale. Both delivery modes then produce comparable theta and scale scores. Alternatively, score the fixed form by classical number-correct and equate it to theta (true-score equating).
- Report score bands (score ± 1 SE) so users see that a CAT that stopped at SE 0.35 is less precise than a 100-item fixed form.

### Gaps
- I did not find a source that tabulates the PROMIS T-score transformation, but it is widely known as mean 50 and SD 10 on a reference population.
- I found no source specifically on 0–100 reporting conventions in psychological selection tests in Indonesia.

## 6. Operational concerns: drift, pretest items, review/skip, security, fixed-form fallback, simulation before launch

### Takeaway
A defensible CAT program follows a fixed sequence: build bank → calibrate → Monte Carlo and post-hoc simulation to set start, selection, stopping and exposure parameters → pilot → launch with embedded unscored pretest items → continuous monitoring for item parameter drift and exposure, with multiple pools rotated. Mature programs restrict or structure item review; GRE's MST allows review within a section.

### Cited Findings
- Three simulation types:
  - **Monte Carlo** generates simulees with a specified theta distribution, to evaluate a calibrated bank and set operational CAT parameters before launch.
  - **Post-hoc** re-runs real response data from a conventional test to estimate how much CAT shortens the test.
  - **Hybrid** combines the two, for sparse response matrices.

  Live CAT studies are "expensive and time-consuming" but needed to validate the model in practice — [IACAT, CAT Research Strategies](https://iacat.org/cat-research-strategies/); [European Proceedings, post-hoc CAT simulation study](https://www.europeanproceedings.com/article/10.15405/epsbs.2016.11.42).
- Item parameter drift (IPD, pergeseran parameter butir) from security breaches, practice or curriculum change threatens validity and fairness. GMAC studied IPD in CAT pretest calibration and found the short-term effect very limited under its conditions — [GMAC research report](https://www.gmac.com/market-intelligence-and-research/research-library/validity-and-testing/research-reports-validity-related/potential-impact-of-item-parameter-drift-due-to-practice-and-curriculum-change-on-item-calibration); [GMAC RR-11-02 item calibration](https://www.gmac.com/-/media/files/gmac/research/research-report-series/rr1102_itemcalibration.pdf). The R package irtQ includes simulated CAT data for IPD detection — [irtQ simIPD](https://rdrr.io/cran/irtQ/man/simIPD.html).
- Online calibration (calibrating new items embedded during operational CAT) has been extended to GRM polytomous items — [PMC6989429](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6989429/).
- Stocking recommends multiple randomly selected pools for continuous testing security, and benchmark standards so that new pools stay parallel to old ones — [Stocking 1994 ETS](https://www.ets.org/research/policy_research_reports/publications/report/1994/hxnr.html).
- Item review: GRE's MST lets examinees navigate within a section, skipping, returning and changing answers. This is one reason ETS chose section-level (multistage) adaptivity over item-level adaptivity — [ETS GRE scores](https://www.ets.org/gre/test-takers/general-test/scores/understand-scores.html); [Collegeave summary](https://www.collegeave.com/?p=26216).
- The 2014 AERA/APA/NCME *Standards* gave particular attention to technology-based testing, and CAT programs with multiple pools must show score comparability across pools — [Wikipedia: Standards for Educational and Psychological Testing](https://en.wikipedia.org/wiki/Standards_for_Educational_and_Psychological_Testing); [APM 2023](https://journals.sagepub.com/doi/10.1177/01466216231209749).

### Inferences
- **Skip rule:** in item-level CAT, skipping normally either scores the item as wrong or is not allowed, because the next item depends on the current response. If the product requires skip/review, use MST (2–3 stages of fixed modules, routed by score), which allows review inside a module.
- **Pretest items:** embed 2–5 unscored new items per session at random positions. They collect calibration data (target N >= 500 per item, see section 1) without affecting scores.
- **Fallback:** keep the calibrated fixed form or MST as a fallback for outages, accommodations, or a pool that is too small. Because everything shares one theta scale (section 5), fallback scores stay comparable.
- **Online-specific security:** time limits per item and per subtest, randomised options, and logging of response latency and exposure counts per item. Retire items whose exposure exceeds the target or that show drift.
- **Simulation gate (syarat sebelum go-live):** before launch, a Monte Carlo run of N >= 1,000–5,000 simulees per subtest using the real calibrated parameters must report:
  - bias and RMSE of theta
  - mean, minimum and maximum test length
  - the conditional SE curve across theta
  - the maximum and distribution of item exposure rates
  - test overlap rate
  - content-balance compliance

### Gaps
- I did not retrieve the specific 2014 *Standards* clauses that govern CAT documentation (pool size, selection algorithm, stopping rule, CSEM reporting). The full text is paywalled and was not fetched.
- I did not verify an official current GMAT or NCLEX policy on item review.
- I found no source giving quantitative drift-detection thresholds.

## 7. Scoring multiple-answer composite items ('ac', 'bd' must match exactly)

### Takeaway
All-or-nothing scoring (1 only when the selected set exactly matches the key) keeps the item dichotomous and fully compatible with 2PL/3PL CAT, but it discards partial-knowledge information. Partial-credit scoring (PCM/GPCM/GRM) gives more information per item, but needs larger calibration samples per category and a CAT engine that supports polytomous models (catR and mirtCAT both do).

### Cited Findings
- Four-category polytomous items yielded on average 2.1–3.1 times as much IRT information as dichotomous items (NAEP reading) — [ETS 1993, IRT information in polytomously scored items](https://www.ets.org/research/policy_research_reports/publications/report/1993/hxla.html).
- For Multiple Select, Reorder and Matching items, partial-credit models can extract richer information, because credit can be given for each correct action — [Meazure Learning](https://meazurelearning.com/?p=10043); [NSF PAR paper on response-pattern-informed scoring](https://par.nsf.gov/servlets/purl/10385498).
- Counterpoint: one comparison found Rasch dichotomous and partial-credit analyses gave similarly strong psychometric results, with strongly correlated person measures — [researchportal.be](https://researchportal.be/en/node/5665808).
- Partial-credit scoring for multiple true-false items has been studied in Indonesia (physics) — [Jurnal Penelitian dan Evaluasi Pendidikan, UNY](https://jurnal.uny.ac.id/index.php/jpep/article/view/1085).
- catR and mirtCAT both support GRM, PCM and GPCM, so polytomous CAT is technically feasible — [Magis & Barrada 2017](https://personal.unizar.es/barrada/papers/17_JSS_Magis.pdf); [mirtCAT refman](https://cran.r-project.org/web/packages/mirtCAT/refman/mirtCAT.html).

### Inferences
- **Exact-match dichotomous scoring:** the chance of guessing right is much lower than for single-answer MCQ. For example, picking a 2-of-4 combination at random gives 1/6, versus 1/4 for single-answer. So the 3PL c-parameter will be smaller and a 2PL may be adequate. These items also tend to be harder (higher b), which helps measure at the high end.
- **Partial credit:** a polytomous model is valid only if the categories are ordered. "One of two correct, no wrong selections" < "both correct" makes sense. Mixed patterns (one right plus one wrong selection) need an explicit scoring rule decided *before* calibration. Each category threshold needs enough respondents, so calibration N rises.
- **Do not** split 'ac' into two separate dichotomous items (a correct? c correct?) for IRT. They share a stem, which violates local independence (independensi lokal) and inflates information and reliability.
- **Recommendation for v1:** score exact-match dichotomously, keep the raw selection pattern in the database, and evaluate partial-credit scoring later once there is enough data.

### Gaps
- I found no study specific to multiple-response items in *cognitive-ability CAT* comparing dichotomous and polytomous scoring for test length or precision.

## 8. Open-source tools for building and simulating a CAT

### Takeaway
In R, use mirt for calibration and either mirtCAT or catR for CAT logic and simulation. Both are mature, on CRAN, published in JSS, and support every component the spec needs. Python options exist but were not verified this session.

### Cited Findings
- **mirtCAT v1.14** (Chalmers, JSS 2016, 71(5), doi:10.18637/jss.v071.i05):
  - generates shiny HTML interfaces for adaptive and non-adaptive tests
  - supports unidimensional and multidimensional CAT and shadow testing
  - `generate_pattern()` plus `mirtCAT(local_pattern=…)` run Monte Carlo studies in parallel (`cl` argument)
  - builds on mirt objects for item parameters

  Sources: [CRAN index](https://cran.rstudio.com/web/packages/mirtCAT/index.html); [refman](https://cran.r-project.org/web/packages/mirtCAT/refman/mirtCAT.html); [JSS citation](https://ideas.repec.org/a/jss/jstsof/v071i05.html).
- **catR 3.x** (Magis & Barrada, JSS 2017, 76(1), doi:10.18637/jss.v076.c01):
  - supports polytomous models and post-hoc simulation
  - provides exposure control and content balancing
  - `randomCAT()` runs one CAT and `simulateRespondents()` runs batch simulation

  Sources: [JSS paper PDF](https://personal.unizar.es/barrada/papers/17_JSS_Magis.pdf); [CRAN citation](https://cran.r-project.org/web/packages/catR/citation.html); [randomCAT doc](https://rdrr.io/cran/catR/man/randomCAT.html).
- **simCAT** (CRAN) implements CAT simulations — [simCAT refman](https://cran.nics.utk.edu/cran/web/packages/simCAT/refman/simCAT.html).
- **irtsim** (CRAN) supports sample-size planning for IRT calibration through simulation — [irtsim vignette](https://cloud.r-project.org/web/packages/irtsim/vignettes/choosing-item-parameters.html).
- **irtQ** (CRAN) includes IPD detection tooling and simulated CAT data — [irtQ simIPD](https://rdrr.io/cran/irtQ/man/simIPD.html).

### Inferences
- Pragmatic architecture for a TypeScript/Supabase web app:
  - Do calibration and simulation **offline in R** (mirt, then mirtCAT/catR) and store a, b, (c) per item in the database.
  - Implement only the runtime CAT loop in the app: EAP on a quadrature grid, MFI with randomesque top-k selection, the stopping rule, and content constraints. That is roughly 100–200 lines of numerics.
  - Validate the app engine by running the same simulees through it and through catR/mirtCAT, and checking that theta and test length match.
- Do not reimplement calibration (EM/MML estimation) in JavaScript.

### Gaps
- I did not verify Python libraries (for example `catsim`, `girth`, `py-irt`) or the state of their maintenance this session.
- I did not verify any JavaScript/TypeScript CAT library.
