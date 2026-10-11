# Standard Setting, Composite Score Design, and Selection Validity for a Multi-Test Battery

Context (draft spec under review): `Nilai Akhir = Kecerdasan x 40% + Kepribadian x 40% + Kecermatan x 20%`; passing grade fixed at 61.00 ("Cukup / Memenuhi Syarat"); fully compensatory; no documented rationale for weights or cutoff.

Source-verification legend used below:
- **[V]** = verified in this session from the primary source or a reputable secondary source (URL given).
- **[T]** = from researcher's training knowledge of a well-known primary source, NOT re-verified in this session (the source pages were paywalled or 403). Report writer should treat [T] as "likely correct, check before quoting verbatim".

---

## 1. Standard-setting methods for cutoffs (Angoff, Bookmark, Hofstee, contrasting groups, norm-referenced), panels, documentation; what AERA/APA/NCME (2014) and SIOP (2018) require

### Takeaway
No professional standard prescribes a single cutoff method, but all of them require (a) a documented rationale and procedure for every cut score, (b) a link to job requirements / acceptable proficiency, and (c) evidence of score precision near the cut. A bare "61.00" with no panel, no empirical data, and no documentation fails the documentation requirement regardless of whether 61 happens to be a sensible number.

### Cited Findings
- **[V] Standards 2014, Standard 5.21:** "When proposed score interpretations involve one or more cut scores, the rationale and procedures used for establishing cut scores should be documented clearly." — [ARELLO Passing Score White Paper 2015 quoting the Standards](https://www.arello.org/assets/EAP/6%20Passing%20Score%20White%20Paper%202015-10-19.pdf)
- **[V] Earlier Standards (1999) 4.20 / 4.21**, carried forward into 2014 as 5.22-5.23: cut scores "should be established on the basis of sound empirical data concerning the relation of test performance to relevant criteria" when feasible; when based on judgments, "the judgmental process should be designed so that judges can bring their knowledge and experience to bear in a reasonable way." — [same ARELLO paper](https://www.arello.org/assets/EAP/6%20Passing%20Score%20White%20Paper%202015-10-19.pdf); [Wikipedia overview of the Standards](https://en.wikipedia.org/wiki/Standards_for_Educational_and_Psychological_Testing)
- **[T] Standards 2014 Ch. 5** is titled "Scores, Scales, Norms, Score Linking, and Cut Scores"; 5.22 = judgmental procedures must be designed so qualified participants can apply their expertise; 5.23 = when feasible, cut scores tied to criterion performance should be based on empirical data on the test-criterion relationship. Ch. 2 Standard 2.14 asks for conditional SEM "at or near cut scores"; 2.16 asks for estimates of classification consistency when scores are used for pass/fail decisions. (Not re-verified; quoting order from memory.)
- **[V] Uniform Guidelines (US, 29 CFR 1607.5(H))**: "Where cutoff scores are used, they should normally be set so as to be reasonable and consistent with normal expectations of acceptable proficiency within the work force." Ranking (top-down) is allowed if it is supported by validity/utility evidence, and adverse impact of ranking vs pass/fail must be considered. — [29 CFR 1607.5 (Cornell LII, 41 CFR 60-3.5 mirror)](https://www.law.cornell.edu/cfr/text/41/60-3.5); [SJSU copy of 1607.5](https://www.sjsu.edu/people/stan.malos/courses/bus157/outlines/topic4/eeoc_uniform_guidelines/CFR-2000-title29-vol4-sec1607-5.pdf)
- **[V] SIOP Principles (5th ed., 2018)** were adopted as APA policy in Aug 2018 and are the authoritative I-O guidance for selection validation. — [Cambridge: Principles for the Validation and Use of Personnel Selection Procedures](https://resolve.cambridge.org/core/journals/industrial-and-organizational-psychology/article/principles-for-the-validation-and-use-of-personnel-selection-procedures/730C076329F88919D5C81C6E7D304FE2)
- **[T] SIOP Principles 2018 on cutoffs:** there is no single correct method; cutoffs may be set by judgment (e.g., SME/Angoff-type), by expectancy/criterion data, by the number of openings / selection ratio, or by utility considerations; the method and rationale must be documented; cutoffs should take into account reliability/SEM and the consequences of errors. (PDF 403 in session.)
- **[V] Modified Angoff:** item-centered; SMEs estimate, for each item, the proportion of *minimally acceptable* candidates who would answer correctly; widely used in credentialing. **Hofstee** is a compromise method combining criterion judgments with acceptable min/max cut score and min/max fail rate. — [NBCRNA: Modified Angoff and Hofstee](https://www.nbcrna.com/standard-setting-methods)
- **[V] Contrasting groups** (judges classify real examinees as qualified/unqualified, cut set where the score distributions cross) is cited by Cizek & Bunch (2007) as especially suited to performance assessments. — [ResearchGate/Academia summary; Cizek & Bunch, *Standard Setting*, SAGE 2007](https://www.sagepub.com/books/9781412916837)
- **[V] Panel sizes in practice:** CLEP used 15-20 faculty panelists; others 11 professors; a credentialing exam used 7 SMEs. — [CLEP: Setting Standards](https://clep.collegeboard.org/about-clep/setting-standards); [NCCT Cut Score Study 2020](https://www.ncctinc.com/Documents/Tech%20in%20Surgery%20-%20Certified%20Cut%20Score%20Study_Executive%20Summary%202020.pdf)
- **[V] NCME instructional module on contemporary methods** (Bookmark, body of work, etc.) — [NCME Module 22: Standard Setting II](https://ncme.org/wp-content/uploads/2025/10/Module-22-Standard-setting-II-Contemporary-Methods-1.pdf)
- **[T] Panel size guidance:** Hurtz & Hertz (1999, *Educational and Psychological Measurement*) found ~10-15 Angoff raters usually yield an acceptably small standard error of the cut; Hambleton & Pitoniak (2006, *Educational Measurement* 4th ed.) recommend panels of ~10-20 for high-stakes, with a documented process: panelist selection, training, definition of the "minimally competent candidate" (MCC / *kandidat minimal memenuhi syarat*), at least 2 rounds with feedback (impact data), and a procedural-validity evaluation survey.
- **[T] Bookmark** (Mitzel, Lewis, Patz & Green 2001) requires IRT-calibrated items ordered by difficulty (ordered item booklet) - a natural fit for a CAT/IRT cognitive module because item parameters already exist.

### Which method suits which module (synthesis)
| Module | Suitable methods | Why |
|---|---|---|
| Kecerdasan (cognitive, IRT/CAT) | Bookmark / Angoff on theta scale, or criterion-based (expectancy table), or norm-referenced (e.g., T >= 40) | Items have right/wrong keys and IRT difficulty, so item-centered judgment is possible. [Inference] |
| Kepribadian (Likert, no right answer) | Norm-referenced cut (e.g., exclude bottom x% / T < 35-40 on job-relevant scales) or contrasting groups / criterion-based | Angoff/Bookmark need "correct" responses; they do not fit trait inventories. [Inference; consistent with Cizek & Bunch's method taxonomy] |
| Kecermatan (speed/accuracy) | Norm-referenced or contrasting groups / empirical (performance data) | Speed scores are distributional; SMEs cannot sensibly judge "items". [Inference] |
| Composite | Contrasting groups, criterion-based (expectancy / regression), Hofstee as reality check on fail rate | Judges can't directly rate a weighted composite; examinee-centered methods fit. [Inference] |

### Inferences
- The draft's 61 is a *policy* number, not a standard-setting result. Mandatory gap: a written rationale (Standard 5.21). Recommended: a panel-based or data-based method with documented MCC definition, impact data (expected pass rate), and SEM around 61.
- 61 sitting at the boundary "61-80 = Cukup" looks inherited from the Polri 0-100 category scale (see Q8). Borrowing a category boundary from another system is acceptable only if the score scale itself is equivalent (same norm conversion) - otherwise the number means something different.

### Gaps
- Could not retrieve full text of Standards 2014 Ch. 5 or SIOP 2018 PDF (paywall / 403); exact wording of 5.22-5.23 and SIOP cutoff sections should be checked against the printed documents.
- No single authoritative minimum panel size exists; 10-15 is a convention from research, not a mandate.

---

## 2. Compensatory vs multiple-hurdle vs conjunctive models; per-module minimums; error rates; adverse impact

### Takeaway
A compensatory composite maximizes predictive information and is defensible, but most professional and government systems use a **hybrid**: per-module minimums (floors) where a deficiency cannot be offset on the job, then compensatory ranking above the floors. A pure compensatory model with no floors lets e.g. a near-zero personality/integrity score be "paid for" by high IQ - that is a design decision that needs explicit justification.

### Cited Findings
- **[V]** Compensatory system: cutoff applied to a predictor composite, high scores compensate low ones, applicants ranked top-down. Multiple hurdle: applicant must pass each predictor/stage cutoff sequentially. Compensatory systems "often preserve more information and produce higher expected criterion performance"; multiple hurdles reduce cost because expensive stages are given only to survivors. — [CRAN personnelSelectionUtility vignette: compensatory vs multiple-hurdle simulation](https://erised.las.iastate.edu/CRAN/web/packages/personnelSelectionUtility/vignettes/compensatory-vs-multiple-hurdle-simulation.html)
- **[V]** Textbook treatment of combining test results (compensatory, multiple cutoff, multiple hurdle, combination) — [eCampusOntario HRM 5.14 Combining the Test Results Information](https://ecampusontario.pressbooks.pub/humanresourcesmgmt/chapter/5-14-combining-the-test-results-information/)
- **[V] Uniform Guidelines 1607.5(H):** if ranking produces more adverse impact than pass/fail use, the user needs sufficient validity and utility evidence for ranking. — [41 CFR 60-3.5](https://www.law.cornell.edu/cfr/text/41/60-3.5)
- **[V] Indonesian CPNS uses a hybrid:** each SKD subtest has its own floor (TWK 65, TIU 80, TKP 166 in 2024) - conjunctive - and only then SKD (40%) and SKB (60%) are combined compensatorily for final ranking. — [CNN Indonesia, passing grade SKD 2024](https://www.cnnindonesia.com/edukasi/20240820153948-561-1135365/passing-grade-skd-cpns-2024-ini-target-untuk-lolos-seleksi/amp); [tirto.id, cara perhitungan SKD-SKB 2021](https://tirto.id/cara-perhitungan-skd-skb-cpns-2021-jadwal-syarat-dokumen-ujian-glD1)
- **[V] Adverse impact differs sharply by module:** Black-White d (US) = .79 for cognitive ability tests vs -.07 for conscientiousness and .10 for integrity tests. — [Sackett, Zhang, Berry & Lievens 2022, JAP, Table 3](https://doi.org/10.1037/apl0000994) (full text via [gwern mirror](https://www.gwern.net/doc/statistics/meta-analysis/2021-sackett.pdf))
- **[T]** De Corte, Lievens & Sackett (2007, JAP) showed with Pareto-optimal weighting that composites trading off validity and adverse impact exist; adding non-cognitive predictors with weight lowers subgroup differences at small validity cost. Hard cognitive hurdles early in a multiple-hurdle system maximize adverse impact.

### Inferences
- Error rates: a conjunctive floor on every module **raises false negatives** (rejecting people who would perform) because each additional cut adds measurement error; a pure compensatory model **raises false positives on the low module** (accepting someone with a disqualifying deficit). Which error is costlier is a job-analysis / policy question and must be written down.
- When to set a per-module floor: (a) the attribute is a true minimum requirement for the job (e.g., basic reasoning, integrity/emotional stability for armed/public-trust roles), (b) the module is reliable enough that a floor is not mostly noise, (c) it is documented. Floors should be lenient (e.g., T ~ 35-40 / bottom 10-20%) and the composite cut does the main sorting. This mirrors CPNS's floor+composite design.
- For Indonesian subgroups (region, school type, gender) the d-value equivalents are unknown; a cognitive-heavy weighting will likely produce larger subgroup gaps than personality - monitor (see Q6).

### Gaps
- No public Indonesian research found on adverse impact of CPNS/Polri psychological cutoffs by region or education background.

---

## 3. Deriving weights; validity of cognitive, personality, integrity, speed tests; optimal combinations

### Takeaway
Under the current best estimates (Sackett et al. 2022), cognitive ability (.31) and contextualized conscientiousness (.25) are much closer in validity than the old Schmidt & Hunter (1998) figures implied (.51 vs .31). With roughly uncorrelated predictors of similar validity, **equal or near-equal weights are close to optimal** - so 40/40 is not unreasonable *in principle*. The problem is that nominal weights only mean anything after the modules are standardized, and the 20% on speed has weaker generic evidence.

### Cited Findings
- **[V] Sackett, Zhang, Berry & Lievens (2022), JAP 107(11), "Revisiting meta-analytic estimates of validity in personnel selection: Addressing systematic overcorrection for restriction of range"** - range-restriction corrections in prior meta-analyses were systematically excessive; mean validities drop by .10-.20; structured interviews now rank first. — [doi:10.1037/apl0000994](https://doi.org/10.1037/apl0000994); [SIOP TIP summary](https://www.siop.org/tip-article/is-cognitive-ability-the-best-predictor-of-job-performance); [HumRRO blog](https://www.humrro.org/blog/is-cognitive-ability-the-best-predictor-of-job-performance-new-research-says-its-time-to-think-again/)
- **[V] Operational validity estimates (ρ), Sackett et al. 2022 Table 3 vs Schmidt & Hunter 1998** — [gwern full-text mirror](https://www.gwern.net/doc/statistics/meta-analysis/2021-sackett.pdf):

| Predictor | S&H 1998 | Sackett 2022 ρ | SD ρ | Lower 80% CV | B-W d |
|---|---|---|---|---|---|
| Structured interview | .51 | .42 | .19 | .18 | .23 |
| Job knowledge test | .48 | .40 | .13 | .23 | .54 |
| Empirically keyed biodata | .35 | .38 | .09 | .26 | .33 |
| Work sample | .54 | .33 | .09 | .21 | .67 |
| **Cognitive ability test** | **.51** | **.31** | .14 | .13 | .79 |
| **Integrity test** | **.41** | **.31** | .20 | .05 | .10 |
| Personality-based EI | - | .30 | .17 | .08 | .22 |
| Assessment center | .37 | .29 | .09 | .17 | .52 |
| SJT (knowledge / behavioral tendency) | - | .26 / .26 | | | .39 / .34 |
| **Conscientiousness - contextualized** (work-framed items) | - | **.25** | .00 | .25 | -.07 |
| Emotional stability - contextualized | - | .23 | .10 | .10 | .09 |
| Extraversion - contextualized | - | .21 | | | |
| Agreeableness - contextualized | - | .19 | | | |
| **Conscientiousness - overall (generic items)** | **.31** | **.19** | .15 | .02 | -.07 |
| Emotional stability - overall | - | .09 | | | |
| Extraversion / Agreeableness - overall | - | .10 / .10 | | | |
| Openness - overall / contextualized | - | .05 / .12 | | | |
| Unstructured interview | .38 | .19 | | | .32 |
| Job experience (years) | .18 | .07 | | | .49 |

- **[V]** Explanations for the drops: cognitive .51 -> .31 because Hunter's (1983) GATB range-restriction correction (U = 1.5) was implausible for concurrent studies; conscientiousness .31 -> .19 from newer meta-analyses (range restriction not a factor); integrity .41 -> .31 from a newer meta-analysis. — [Sackett et al. 2022 full text](https://www.gwern.net/doc/statistics/meta-analysis/2021-sackett.pdf)
- **[V]** Follow-up focal article on redesigning selection systems in light of the new estimates: Sackett, Zhang, Berry & Lievens (2023), *Industrial and Organizational Psychology* 16(3), 283-300. — [IDEAS/RePEc record](https://ideas.repec.org/a/cup/inorps/v16y2023i3p283-300_1.html)
- **[T] Schmidt & Hunter (1998, Psych. Bulletin 124:262-274)** old combinations: GMA + integrity R = .65 (+.14); GMA + conscientiousness R = .60 (+.09); GMA + structured interview R = .63. These depend on the now-revised .51 and should not be quoted as current.
- **[V] Perceptual speed & accuracy (Kecermatan analog):** Mount, Oh & Burns (2008, *Personnel Psychology* 61:113-139), N = 133 warehouse workers: after controlling for GMA, number-correct on perceptual speed added ΔR = .06 (15% increase) for task performance and number-wrong added ΔR = .16 (73% increase) for rules compliance. — [Univ. of Iowa repository record](https://iro.uiowa.edu/esploro/outputs/journalArticle/Incremental-validity-of-perceptual-speed-and/9984963208902771)
- **[V]** A claim found online of perceptual-speed validity .598 / reliability .795 came from an Indonesian student repository and is **not** reliable as a meta-analytic figure. — [eprints.upj.ac.id](https://eprints.upj.ac.id/id/eprint/2995/) (flagged, do not use)
- **[V] Unit weights:** Bobko, Roth & Buster (2007, *Organizational Research Methods*) - literature review + meta-analysis: unit weights have substantial predictive validity relative to regression weights and "can be a highly appropriate approach for weighting under many circumstances" (they cross-validate better in small samples). — [SAGE doi:10.1177/1094428106294734](https://journals.sagepub.com/doi/10.1177/1094428106294734)
- **[T] Weighting options** (SIOP 2018 / standard I-O texts): (1) rational/job-analysis weights (SMEs rate importance of each KSAO -> weights; defensible on content-validity grounds), (2) regression weights from a local criterion study (optimal in-sample, shrink out-of-sample; need large N), (3) unit weights on standardized scores, (4) dominance / relative-weights analysis (Budescu 1993; Johnson 2000) to describe each predictor's share of R² - descriptive, not a weighting scheme by itself, (5) Pareto-optimal weights balancing validity and adverse impact (De Corte et al. 2007).

### Illustration (researcher's own calculation, using Sackett 2022 ρs)
Composite validity of cognitive (.31) + conscientiousness-overall (.19), standardized, equal weights vs optimal regression weights, for assumed predictor intercorrelation r:

| r(cog, consc) | Equal weights | Optimal weights |
|---|---|---|
| .00 | .354 | .364 |
| .10 | .337 | .349 |
| .20 | .323 | .336 |

Equal weighting loses only ~.01 validity vs optimal. (Assumed r values are illustrative; cognitive-conscientiousness correlations are typically near zero.)

### Inferences
- 40/40/20 is a defensible **rational** weight scheme *if* documented via job analysis (why personality matters as much as intelligence for this job; why speed matters half as much). Without that document it is an undocumented policy choice.
- If the personality module is generic Big Five ("Saya orang yang teratur"), expected validity is ~.19 for conscientiousness and ~.10 or lower for other traits. Putting 40% on an average of all personality scales would dilute validity; weight should go to job-relevant, ideally work-contextualized scales (.25).
- Speed/accuracy has incremental evidence mainly for clerical/routine/rule-compliance jobs; 20% is plausible for those, weak for others. The "number wrong" (error) component may matter more than raw speed for compliance criteria.
- Regression weights should not be estimated from a small local sample (they overfit); unit/rational weights + later empirical check is the lower-risk path.

### Gaps
- No modern (post-2022 range-restriction re-analysis) meta-analytic validity estimate for perceptual speed tests specifically; older clerical validity generalization (Pearlman, Schmidt & Hunter 1980) not retrieved.
- Intercorrelation matrix from Sackett et al. (2022) Table 1 not extracted in detail.

---

## 4. Putting modules on a common scale before weighting

### Takeaway
Weights apply to *variance*, not to labels. A weighted sum of raw scores on different metrics (percent correct 0-100, IRT theta roughly -3..+3, Likert sum e.g. 50-250) produces **effective weights** that are dominated by whichever module has the largest SD. Standard practice is to convert each module to a norm-referenced standard score (z, T = 50+10z, or stanine/percentile-normalized) from the same reference group before weighting.

### Cited Findings
- **[V] Mosier (1943) composite reliability** and weighting theory: reliability of a weighted composite depends on weights, component reliabilities, *dispersions (variances)* and intercorrelations: ρ_XX = [wᵀ(r∘s) + wᵀSw − wᵀs] / wᵀSw, where S is the covariance matrix, s the vector of variances, r the reliabilities. — [Mosier 1943, Psychometrika 8:161-168 (IDEAS)](https://ideas.repec.org/a/spr/psycho/v8y1943i3p161-168.html); [psychmeta `composite_rel_matrix` documentation](https://rdrr.io/github/jadahlke/psychmeta/man/composite_rel_matrix.html)
- **[V]** Example of an operational multi-test composite that standardizes subtests before combining and documents composite reliability — [Stanford ROAR technical manual: composite scores](https://roar.stanford.edu/technical/intro-composite-scores.html); [ROAR composite reliability](https://roar.stanford.edu/technical/reliability-composite.html)
- **[V] CPNS integration** rescales each component to proportion-of-maximum before weighting (SKD/maxSKD x 40% + SKB/maxSKB x 60%) - a percent-of-max scaling, not norm-based. — [tirto.id](https://tirto.id/cara-perhitungan-skd-skb-cpns-2021-jadwal-syarat-dokumen-ujian-glD1)
- **[T]** Effective (contributing) weight of component i in a composite = w_i·Cov(X_i, C)/Var(C); with uncorrelated components it is proportional to w_i²·SD_i². A component with twice the SD gets four times the variance contribution for the same nominal weight (standard result, e.g., Wang & Stanley 1970, *Review of Educational Research*).

### Inferences
- Concrete failure mode for the draft: if Kecerdasan is reported as a 0-100 percent with SD ~ 15, Kepribadian as a converted 0-100 with SD ~ 8, and Kecermatan as 0-100 with SD ~ 20, the "20%" speed module could actually drive more of the rank order than the "40%" personality module. The nominal 40/40/20 is then false.
- Percent-of-maximum (CPNS style) only equalizes the *range*, not the SD; it is better than mixing theta with Likert sums, but still not equal effective weights.
- Theta from a CAT is on a different metric (mean 0) and can be negative; mixing it with a 0-100 percent without transformation is meaningless. Convert theta to a scaled score with a fixed linear transform (e.g., 50 + 10·θ, using the calibration-population mean/SD) before combining.
- Recommended pipeline: (1) score each module on its native metric (theta / scale sum / accuracy index), (2) convert to T-scores using a documented norm group (same population, ideally applicants for the same job family), (3) apply weights to T-scores, (4) optionally rescale composite to a reporting scale (e.g., 0-100 or T), (5) set the cut on that composite scale with a documented method. Then "61" must be redefined on that scale.

### Gaps
- No Indonesian-specific guideline found that mandates a particular conversion; HIMPSI ethics code was not retrieved in this session.

---

## 5. Score reporting, SEM-based banding, composite reliability, classification accuracy/consistency, confidence intervals

### Takeaway
A hard cut at 61.00 implies a precision the test does not have. Professional standards require reporting measurement error near the cut and estimating how consistently candidates would be classified; SEM-based bands are an accepted (though debated) way to treat scores within error as equivalent.

### Cited Findings
- **[V]** Composite reliability via Mosier (1943) formula (see Q4); weights that maximize composite reliability are proportional to a component's correlations with the other components and inversely proportional to its error variance. — [Mosier 1943 (IDEAS)](https://ideas.repec.org/a/spr/psycho/v8y1943i3p161-168.html)
- **[V]** psychmeta (R) implements composite reliability (`composite_rel_matrix`, `composite_rel_scalar`) - usable for computing battery reliability. — [rdocumentation psychmeta composite_rel_scalar](https://rdocumentation.org/packages/psychmeta/versions/2.3.4/topics/composite_rel_scalar)
- **[T] Standards 2014, Standard 2.14:** where cut scores are used, report SEM (conditional SEM) in the vicinity of the cut; **Standard 2.16:** when pass/fail decisions are made, estimate the percentage of test takers who would be classified the same way on two replications (classification consistency).
- **[T]** SEM = SD·√(1 − r_xx). 95% CI ≈ observed ± 1.96·SEM. Standard error of difference SED = SEM·√2; banding (Cascio, Outtz, Zedeck & Goldstein 1991, *Human Performance*) treats scores within ±1.96·SED of the top score as equivalent. Banding is permitted under SIOP Principles but contested (Schmidt 1991 critiques); in the US, banding with race-based selection within bands raised legal issues.
- **[T]** Classification accuracy/consistency for a single cut can be estimated from one administration with Livingston & Lewis (1995, *JEM*) or, with IRT, Rudner (2001/2005) / Lee (2010) methods.

### Inferences
- Worked example (researcher's calculation): composite on a 0-100 scale with SD = 10 and reliability .85 -> SEM = 10·√.15 ≈ 3.9; 95% CI ≈ ±7.6. A candidate scoring 59 and one scoring 63 are not reliably different. Report score ± SEM, and consider a "zona abu-abu / borderline" band (e.g., 61 ± 1 SEM) that triggers review or retest rather than automatic TMS.
- Composite reliability will typically be *higher* than individual module reliability (if components positively correlate), which helps the composite cut, but per-module floors inherit each module's lower reliability - another reason floors should be lenient.
- Minimum to compute and publish: per-module reliability (CAT: marginal reliability / conditional SEM; Likert: alpha/omega; speed: test-retest or split-half by time, since alpha is inflated for speeded tests), composite reliability (Mosier), SEM at 61, and a classification consistency index.

### Gaps
- Live-session verification of exact Standard numbers 2.14 / 2.16 not done.
- Split-half/alpha inflation for speeded tests is standard psychometric knowledge [T]; no source retrieved in-session.

---

## 6. Validation evidence required to call a battery "professional"; minimal viable validation plan

### Takeaway
"Professional" (Standards/SIOP/ITC) means a documented validity argument: job analysis -> content linkage -> reliability -> norms -> criterion and/or transported validity evidence -> fairness checks -> ongoing monitoring. A small organization usually cannot run a local criterion study with adequate power, so it relies on job analysis + validity generalization (meta-analytic evidence like Sackett 2022) + local reliability/norms/fairness data, and plans a later criterion check.

### Cited Findings
- **[V]** Sackett et al. (2022) show validity estimates vary across settings (SD ρ = .14 for cognitive, .15 for generic conscientiousness, .20 for integrity; lower 80% credibility values .13, .02, .05) - i.e., generic validity does not guarantee local validity for every job. — [Sackett et al. 2022 Table 3](https://www.gwern.net/doc/statistics/meta-analysis/2021-sackett.pdf)
- **[V]** Uniform Guidelines 1607.5 sets general standards for validity studies (content, criterion, construct) and the cutoff standard above. — [29 CFR 1607.5 (corada)](https://www.corada.com/documents/29-cfr-part-1607-uniform-guidelines-on-employee-selection-procedures/1607-5-general-standards-for-validity-studies)
- **[V]** SIOP Principles 2018 cover validity evidence sources (content, internal structure, relations to other variables/criteria), validity generalization/transport, fairness, and documentation. — [Cambridge record](https://resolve.cambridge.org/core/journals/industrial-and-organizational-psychology/article/principles-for-the-validation-and-use-of-personnel-selection-procedures/730C076329F88919D5C81C6E7D304FE2)
- **[T] Local criterion study size:** Schmidt, Hunter & Urry (1976, JAP) showed typical local studies were badly underpowered; detecting an observed r ≈ .20-.25 with 80-90% power needs roughly N = 150-250+. SIOP Principles require a power analysis/justification rather than a fixed N.
- **[T] Norming:** Standards 2014 Ch. 5 (e.g., Standard 5.9-5.10) require norms to be described (who, when, how sampled) and to be relevant to the intended population. European test-review practice (EFPA Test Review Model; Dutch COTAN) treats norm groups below ~200-300 as insufficient for high-stakes individual decisions. (Exact thresholds not re-verified.)
- **[T] ITC Guidelines:** ITC Guidelines on Test Use (2000/2013) and ITC Guidelines on Computer-Based and Internet-Delivered Testing (2005) cover test-taker information, security, unproctored testing, and score reporting - directly relevant to an online CAT battery ("psikotes daring").
- **[T] Fairness:** Standards 2014 Ch. 3 (Fairness) and SIOP 2018 call for checks of measurement bias (DIF at item level, e.g., Mantel-Haenszel or IRT-DIF) and predictive bias (Cleary regression model) when data allow, plus subgroup mean differences/adverse impact (e.g., four-fifths rule in UGESP).

### Minimal viable validation plan (synthesis for a small organization)
| Step | Mandatory vs recommended | Minimum deliverable |
|---|---|---|
| 1. Job analysis | Mandatory (basis for content validity & weights) | Task/KSAO list for target job(s); SME ratings of importance -> rationale for 40/40/20 (or revised weights) |
| 2. Content linkage | Mandatory | Matrix linking each module/scale to KSAOs |
| 3. Reliability | Mandatory | Per-module reliability + composite reliability + SEM at cut |
| 4. Norms | Mandatory if scores are norm-referenced (they must be, to combine - Q4) | Norm group description, N (aim >= 300 per relevant group), date; re-norm schedule |
| 5. Validity generalization / transport | Recommended when local study infeasible | Cite meta-analytic ρ (Sackett 2022) for comparable constructs + argument that the job and measures are similar |
| 6. Cut score study | Mandatory documentation (Std 5.21); method choice recommended | Panel (≈10-15 SMEs) or contrasting-groups data; impact data (expected pass rate); final memo |
| 7. Fairness | Recommended / legally driven | Pass rates and mean d by gender, region, education level; DIF on cognitive items once N allows (~200+ per group, [T]) |
| 8. Criterion follow-up | Recommended | After 6-12 months, correlate composite with supervisor ratings for hires (accept that N may be small; pool across cohorts) |
| 9. Monitoring | Recommended | Annual review: score drift, item exposure (CAT), pass rates, cheating flags, re-norming |

### Inferences
- The draft currently has none of the mandatory documentation items listed above for weights/cutoff; that is the core evidence gap.
- Using published meta-analytic validity is legitimate support only if the modules actually measure the same constructs as the meta-analyzed tests (e.g., a real general-reasoning test, a work-contextualized conscientiousness scale).

### Gaps
- Exact EFPA/COTAN norm-size thresholds and ITC guideline text not retrieved in-session.
- No Indonesian (HIMPSI) published standard for selection-test validation found in this session.

---

## 7. Rule-based penalties on raw scores from a derived indicator

### Takeaway
Rule-based adjustments are not forbidden, but they are a scoring rule that must be validated, documented, and disclosed like any other. The research record on the most common case - correcting personality scores for social desirability / faking indices - shows corrections generally do **not** recover "true" scores or improve validity. Flag-and-review is the more defensible practice than silent point deduction.

### Cited Findings
- **[T]** Ellingson, Sackett & Hough (1999, JAP 84:155-166): applying social-desirability corrections to personality scores of people instructed to fake did not bring their scores back to their honest-condition scores; corrections did not appreciably improve accuracy of hiring decisions.
- **[T]** Standards 2014 (Ch. 5-6) require that any procedure that transforms raw scores into reported scores (including adjustments) be documented with its rationale, and that test users be told how scores are derived; Ch. 8 (test-taker rights) supports informing test takers about how results will be used.
- **[T]** US Civil Rights Act 1991 §106 prohibits adjusting scores or using different cutoffs on the basis of race, color, religion, sex, or national origin ("race norming") - an example of a legally prohibited score adjustment. (Not applicable in Indonesia, but illustrates that adjustments are scrutinized.)
- **[V]** CPNS publicly documents all scoring rules including tie-breaks (higher SKD, then TKP-TIU-TWK order, then GPA, then age) — an example of transparent rule-based decision logic. — [tirto.id](https://tirto.id/cara-perhitungan-skd-skb-cpns-2021-jadwal-syarat-dokumen-ujian-glD1)
- **[V]** In Mount et al. (2008), "number wrong" on a speed test carried its own predictive validity for rules compliance - error counts can be a legitimate *separate* scored component rather than a hidden penalty. — [Univ. of Iowa record](https://iro.uiowa.edu/esploro/outputs/journalArticle/Incremental-validity-of-perceptual-speed-and/9984963208902771)

### Inferences
- If the draft applies a penalty (e.g., lie-scale / inconsistency index / speed-accuracy tradeoff -> deduct points), the defensible options are: (a) score the indicator as its own module/flag with documented validity, (b) use it as an invalidity flag that triggers review, retest, or "hasil tidak dapat diinterpretasi", rather than deducting points, (c) if deducting, document the rule, its empirical basis (does the indicator predict anything? false-flag rate?), and disclose in candidate instructions that such a rule exists.
- Formula-scoring for guessing (e.g., right − wrong/(k−1)) is a known, documented accuracy correction for speed/accuracy tests and is acceptable if announced in the instructions [T].

### Gaps
- No direct published guideline found in-session that specifically addresses "penalties from derived indicators"; the guidance above is extrapolated from Standards documentation requirements and the faking-correction literature.

---

## 8. Indonesian context: CPNS SKD, Polri/TNI psychological tests, published passing grades

### Takeaway
Indonesian government selection publishes cutoffs by regulation (CPNS: KepmenPANRB each year) and uses per-subtest floors plus weighted integration; the *numbers* are published but the **psychometric method used to set them is not publicly documented**. Polri's psychological test uses a 0-100 categorized scale where >= 61 = MS (Memenuhi Syarat) - almost certainly the origin of the draft's 61 / "Cukup".

### Cited Findings
- **[V] CPNS 2024 (KepmenPANRB No. 321/2024):** SKD = TWK (30 items, max 150), TIU (35 items, max 175), TKP (45 items, max 225); total max 550. Floors: TWK 65, TIU 80, TKP 166 (general and Kalimantan formations). Special groups: cum laude/diaspora cumulative >= 311 and TIU >= 85; disabilities / Papua cumulative >= 286 and TIU >= 60; disadvantaged regions cumulative >= 286. — [CNN Indonesia](https://www.cnnindonesia.com/edukasi/20240820153948-561-1135365/passing-grade-skd-cpns-2024-ini-target-untuk-lolos-seleksi/amp); [Kompas TV](https://www.kompas.tv/nasional/540653/kerap-ditanyakan-ini-passing-grade-resmi-skd-cpns-2024-lengkap-dari-twk-tiu-dan-tkp); [Okezone](https://economy.okezone.com/read/2024/08/05/320/3044349/nilai-ambang-batas-skd-cpns-2024-ini-rincian-lengkapnya?page=all)
- **[V] CPNS final score (PermenPANRB 27/2021, Pasal 48):** Nilai Akhir = (SKD/maxSKD x 40% + SKB/maxSKB x 60%) x 100; ties broken by SKD total, then TKP, TIU, TWK, then GPA, then age. — [tirto.id](https://tirto.id/cara-perhitungan-skd-skb-cpns-2021-jadwal-syarat-dokumen-ujian-glD1); [detik](https://finance.detik.com/cpns/d-5608035/aturan-seleksi-cpns-2021-formasi-sepi-peminat-bisa-diisi-pelamar-lain)
- **[V, secondary] Polri psychological test:** scale 0-100 with categories 0-40 Kurang Sekali, 41-60 Kurang, 61-80 Cukup, 81-100 Baik; MS = 61 and above, TMS = 60 and below; components: kecerdasan (umum, praktis, verbal, abstrak), kepribadian (prososial, pengendalian diri, penyesuaian diri, kepercayaan diri), minat, and sikap kerja (kecepatan, daya tahan, ketelitian). Basis reported as Peraturan Asisten Kapolri Bidang SDM No. 3/2017 tentang Pelaksanaan Tes Psikologi Calon Anggota Polri. — [Bisnis/Kabar24 2021 (SIPSS kisi-kisi)](https://kabar24.bisnis.com/read/20210107/16/1340192/mau-lolos-penerimaan-calon-perwira-sipss-polri-ini-kisi-kisinya); [Tribratanews Polda Kaltim reports on MS/TMS results](https://tribratanews.kaltim.polri.go.id/2017/05/hasil-tes-psikologi-serentak-582-casis-bintara-ptu-dan-57-casis-bintara-ti-di-kaltim-dan-kaltara-dinyatakan-ms). Primary regulation text and the Polri recruitment PDF could not be retrieved (403/404) - verify against the regulation.
- **[V]** No source found that publishes Polri's internal weighting of kecerdasan/kepribadian/sikap kerja (e.g., 40/40/20). — search in this session ([search results incl. tribratanews/idxchannel](https://www.idxchannel.com/milenomic/tips-lolos-psikotes-polri-rangkaian-tes-penerimaan-bintara-dan-trik-tes-psikologi)) returned none.

### Inferences
- The draft's structure (kecerdasan / kepribadian / kecermatan-sikap kerja; 61 = Cukup = MS) mirrors the Polri model. That gives face validity and familiarity for Indonesian users, which is acceptable, but Polri's 61 sits on Polri's own (non-public) norm-converted scale; copying the number without copying the conversion does not transfer its meaning.
- CPNS is a closer-to-best-practice template for *transparency*: cutoffs and weights published in regulation, per-subtest floors + weighted integration, explicit tie-breaks. The draft could adopt the same transparency (publish rules to candidates) even before full validation.
- Neither CPNS nor Polri publicly documents an Angoff/Bookmark/criterion study; "it's how the government does it" shows the format is customary in Indonesia, not that the numbers are psychometrically validated.

### Gaps
- KepmenPANRB 321/2024 and Polri regulation primary PDFs not retrieved (only news summaries).
- TNI psychological test scoring/cutoff documentation not found in this session.
- No public BKN technical report on how SKD floors were derived (e.g., item difficulty analysis, pass-rate targets) was found.

---

## Summary of what is missing from the draft (for the report writer)
1. **Mandatory:** written rationale + procedure for the 61.00 cut (Standards 5.21) and for 40/40/20 (job analysis). [V]
2. **Mandatory in practice:** modules standardized on a common norm-based metric before weighting; otherwise nominal weights ≠ effective weights. [V Mosier; T effective-weight theory]
3. **Mandatory:** reliability per module + composite reliability + SEM near the cut. [T Standards 2.14/2.16]
4. **Recommended:** per-module lenient floors (hybrid model, as CPNS does) instead of pure compensatory, decided via job analysis. [V CPNS; inference]
5. **Recommended:** cite Sackett et al. (2022) validity for construct-matched modules (cognitive .31, contextualized conscientiousness .25 / generic .19, integrity .31); plan local criterion follow-up. [V]
6. **Recommended:** fairness monitoring (subgroup pass rates, DIF). [T]
7. **Penalties:** convert to documented flags or separately scored components; disclose to candidates. [T/inference]
8. **Acceptable as-is (with documentation):** a compensatory weighted composite; near-equal weighting of cognitive and personality (equal weights lose ~.01 validity vs optimal in the illustration above); using a 0-100 reporting scale with Indonesian-familiar categories; a single composite cut. [V Bobko et al. 2007; researcher's calculation]
