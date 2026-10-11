# Personality module (Likert 90 items + Forced-Choice 63 pairs) for employee/civil-service selection: design, scoring, interpretation, and draft-spec critique

Scope note: about 20 tool calls. Several well-known figures could not be re-verified in this session (paywalls or unreadable PDFs). They sit in **Gaps** and are marked "recall, verify" so the report writer does not present them as confirmed. Everything under **Cited Findings** was seen in a fetched source or search result during this session.

Draft spec under review:
- (A) Likert: 4 points (STS/TS/S/SS), 90 items, 6 aspects x 15 items. Aspects: Prososial, Pengambilan Keputusan, Penyesuaian Diri, Kepercayaan Diri, Stabilitas Emosi, Motif Berprestasi. Item weights 1-4, reversed for unfavorable items.
- (B) Forced-choice: 63 pairs ("pick the statement most like you"). Scores accumulate into Dominansi, Integritas, Kepemimpinan.
- The module counts for 40% of a final pass/fail score with a passing grade of 61/100.

---

## Q1. Scoring Likert inventories: reverse-keying, scale scores, norms, reliability, 4-point scale

### Takeaway
The draft's 1-4 weighting with reversal for unfavorable items is standard CTT (classical test theory) sum scoring and is fine. What is missing is the rest of the chain: a norm group, a conversion to standard scores (T-scores or stanines), reliability evidence per aspect, and a decision on how to treat the missing midpoint. A raw sum of 15 items (range 15-60) cannot be interpreted until it is compared to a norm group.

### Cited Findings
- Faking in real applicant samples raises means and **lowers SDs and reliability coefficients** (Salgado 2016, summarized in Martínez & Salgado 2021). Reliability and norms computed on non-applicant samples (students, incumbents) therefore do not carry over to applicant data. — [Martínez & Salgado 2021, Frontiers in Psychology 12:732241](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.732241/pdf)
- The same meta-analysis reports average reliability for quasi-ipsative FC inventories as r_xx = 0.71 (SD 0.11, range 0.49-0.87). This is a realistic benchmark for short personality scales. — [Martínez & Salgado 2021](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.732241/pdf)

### Inferences
- **Reverse-keying (scoring for unfavorable items)**: score = 5 - raw. Store the raw response and the key, not only the scored value, so a wrong key can be fixed later. A balanced key (about half favorable and half unfavorable per aspect, e.g., 7-8/7-8 out of 15) partly controls acquiescence (the tendency to agree with everything). The spec does not state the proportion, so it should be specified.
- **Scale score**: the sum of 15 items (15-60), or the mean (1-4). Then convert to a norm score:
  - z = (X - M_norm) / SD_norm
  - T = 50 + 10z
  - Stanine = round(2z + 5), clipped to 1-9. Alternatively, use percentile cut-offs of 4-7-12-17-20-17-12-7-4%.
  - Norms must come from an **applicant sample** for the same position and context (for example, CPNS/PPPK or a company), because applicant means are higher (see Q4).
- **Expected reliability for 15 items**: by the Spearman-Brown formula, if the average inter-item correlation is 0.20-0.25, alpha for k=15 is about 0.79-0.83. If it is 0.15, alpha is about 0.73. Target alpha/omega ≥ 0.70 for group use and ≥ 0.80 if each aspect is used for individual decisions. Report **McDonald's omega** together with alpha, because alpha assumes tau-equivalence. Also report the SEM (standard error of measurement) = SD x sqrt(1 - r_xx). With r_xx = 0.75 and SD_T = 10, SEM is about 5 T-points, so the 95% CI is about ±10 T-points around a person's score. This is very wide, so a hard cut-off near the mean will misclassify many people.
- **4-point scale without a midpoint**:
  - Pros: removes the "aman di tengah" (safe middle) option, and 4 categories are enough for reasonable variance.
  - Cons: it forces undecided respondents to pick a direction, which adds noise. It slightly lowers the variance per item compared with 5-7 points. A no-midpoint scale does **not** reduce faking.
  - For a 15-item sum score the difference in reliability between 4 and 5 points is generally small. That is a general psychometric claim and is not verified in this session (see Gaps).
- **Item analysis before deployment**: pilot test (N ≥ 300 per form is reasonable for CFA), corrected item-total r ≥ 0.30, a CFA to check that the 6 aspects separate, and DIF (differential item functioning) checks by gender and region.

### Gaps
- No primary source was fetched in this session on the reliability of 4-point vs 5-point Likert scales. (Recall, verify: there are studies such as Lozano, García-Cueto & Muñiz 2008 suggesting 4-7 categories are optimal.)
- No technical manual for any Indonesian inventory was found that reports 15-item scale reliability.

---

## Q2. Turning trait scores into pass/fail or 0-100: cutoffs, profiles, banding, risks of a single composite

### Takeaway
Personality has no "correct answer," and trait-performance relationships are modest (operational r about 0.1-0.2 for most traits; see Q6). Reducing the 9 dimensions to one 0-100 number with a cut-off of 61, at a 40% weight, gives personality decision weight far beyond its predictive validity and hides the profile. The defensible options are:
1. Job-analysis-based minimum cutoffs on a few relevant scales (screen-out of extreme low scores only).
2. A compensatory composite with weights justified by validity evidence.
3. A competency-based profile-fit score, validated locally.

### Cited Findings
- Morgeson, Campion, Dipboye, Hollenbeck, Murphy & Schmitt (2007, *Personnel Psychology* 60(3):683-729) list five concerns:
  1. Validity coefficients are low in absolute terms.
  2. Faking and social desirability lower data quality.
  3. Constructs are too broad.
  4. Too little job analysis is done before deploying personality tests.
  5. Criterion contamination inflates validity estimates.

  They recommended reconsidering published self-report personality tests in selection. **Contested**: Ones, Dilchert, Viswesvaran & Judge (2007), and Tett & Christiansen (2007) published rebuttals in the same journal issue. — [Morgeson et al. 2007](https://pure.ul.ie/en/publications/reconsidering-the-use-of-personality-tests-in-personnel-selection/); [Purdue copy](https://webapps.krannert.purdue.edu/sites/Home/DirectoryApi/Files/e5f05d74-f907-42aa-9d4b-3ff5aa51c7c9/Download)
- Sackett et al. (2022) showed that earlier meta-analyses over-corrected for range restriction. Revised operational validities fall by about 0.10-0.20 for several predictors. New estimates:
  - Structured interview: r = 0.42
  - Job knowledge: 0.40
  - Empirically-keyed biodata: 0.38
  - Work sample: 0.33
  - Cognitive ability: 0.31
  - Interests (fit-based): 0.24

  "Contextualized" personality items ("at work") had clearly higher validity than general (context-free) personality items. — [HumRRO summary of Sackett et al. 2022](https://www.humrro.org/blog/is-cognitive-ability-the-best-predictor-of-job-performance-new-research-says-its-time-to-think-again/); [SIOP TIP](https://www.siop.org/tip-article/is-cognitive-ability-the-best-predictor-of-job-performance)

### Inferences
- **The 0-100 mapping is arbitrary.** A score of "61/100" means nothing psychometrically unless it is defined, for example as a percentile of an applicant norm group, or as a linear rescaling of a composite T-score. Spell out the mapping. A suggested approach:
  - Compute T-scores per aspect from the norm group.
  - Compute a composite with weights.
  - Rescale to 0-100, for example: score = clip((T_comp - 20) x 100/60, 0, 100).
  - Choose the cut-off from the desired selection ratio or from minimum-standards evidence (for example, a modified-Angoff by an SME panel). **Do not** pick "61" a priori.
- **Composite vs profile.**
  - The 6 aspects (and the FC dimensions) are distinct constructs. Averaging them lets a very low Stabilitas Emosi be offset by a high Prososial. Sometimes that is intended (compensatory), but for a "red flag" trait it usually is not.
  - Recommendation: a **hybrid**. Use a non-compensatory screen-out only for extremes (for example, T < 30 on Stabilitas Emosi or Integritas, combined with a validity-scale flag, triggering a psychologist review rather than automatic rejection). Use a compensatory composite for the rest.
- **Ideal profile / profile similarity** (for example, distance D² or profile correlation against a "benchmark" profile of high performers):
  - It needs a job-specific benchmark from a sample of incumbents with good performance ratings.
  - It is unstable with small samples.
  - It rewards similarity to the existing group, which risks homogeneity and adverse impact.
  - It is only appropriate if local validation exists.
- **Banding**: because the SEM is about 5 T-points, scores within ±1.96 x SED (standard error of the difference) are not meaningfully different. Using bands (for example, stanine or "Baik/Cukup/Kurang") is more honest than an exact rank of 0-100 values.
- **Weight 40%**: personality's predictive validity is far below cognitive ability or structured interviews (Sackett 2022). Giving it 40% of the final score is hard to justify on validity grounds, unless the other 60% is also low-validity. Personality as an **additional screen** or a **tie-breaker / interview input** is easier to defend.

### Gaps
- No public SIOP or BKN document was found in this session on how to set personality cut-offs for civil service. The "61" passing grade appears to be borrowed from the SKD/SKB model, and its psychometric basis is unknown.
- Sackett 2022 per-trait figures could not be verified directly (the paper was not accessible). Recall, verify: conscientiousness about 0.19, emotional stability about 0.09-0.12, agreeableness about 0.10, extraversion about 0.09-0.11, openness about 0.04; contextualized conscientiousness higher.

---

## Q3. Forced-choice pairs: ipsative vs normative, Thurstonian IRT, MUPP, design requirements

### Takeaway
The FC section as specified (63 pairs, pick one, accumulate "points" into 3 dimensions) produces **fully ipsative scores**. With only 3 dimensions and classical counting, the scores always sum to a constant: one dimension rises only when another falls. That makes between-applicant comparison and ranking (the core of selection) psychometrically invalid. The scores also cannot be added to a 0-100 composite as if they were normative. Fixes:
- Use an IRT model (Thurstonian IRT, or MUPP / GGUM-RANK), **plus** more dimensions and/or a mix of positively and negatively keyed pairs; or
- Move to a quasi-ipsative format; or
- Report the FC results only as an intra-individual profile (ranking within the person), never as a pass/fail input.

### Cited Findings
- Traditional FC scoring produces ipsative data. All individuals have the same total score, which "distorts individual profiles, construct validity, criterion-related validity, and reliability estimates." — [Brown & Maydeu-Olivares 2011/2013 "How IRT can solve problems of ipsative data in forced-choice questionnaires" (core.ac.uk)](https://core.ac.uk/works/4511491); [Kent repository](https://kar.kent.ac.uk/30530/)
- Brown & Maydeu-Olivares (2011, *Educational and Psychological Measurement*) introduced the Thurstonian IRT model, based on Thurstone's law of comparative judgment. It estimates normative trait scores from FC responses. These are normal-ogive models with structured loadings, uniquenesses and local dependencies, and can be estimated in SEM software such as Mplus. The 2012 *Behavior Research Methods* paper provides a fitting tutorial. — [UB repository](https://dipositint.ub.edu/dspace/handle/2445/42579); [Brown & Maydeu-Olivares 2012 BRM (StatModel)](https://www.StatModel.com/download/Brown%20&%20Maydeu-Olivares%202012%20BRM.pdf); [DOI 10.3758/s13428-012-0217-x](https://www.doi.org/10.3758/S13428-012-0217-X)
- **Design is critical.** Blocks of only equally keyed items (needed to balance social desirability) do **not** give accurate trait scores when measuring up to 5 traits. With about 30 traits, equally keyed blocks become nearly non-ipsative and accurate. — [Schulte et al. / "Can High-Dimensional Questionnaires Resolve the Ipsativity Issue…" (PMC10621689)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10621689/)
- Simulations of 5 traits found about 20 triplets or 15 quads give enough precision. Pairs carry the least information per block. Number of traits, test length, the proportion of Likert items, and the proportion of opposite-keyed pairs all affect recovery. — [Frontiers 2017 simulation, fpsyg.2017.00806](https://frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2017.00806/text); [Integration of FC and Likert (PMC5435816)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5435816/)
- Validity by format: across 9 occupational groups, **quasi-ipsative** FC had substantially higher operational validity and validity generalization than **ipsative** FC. — [Salgado, Anderson & Tauriz 2015, *J Occup Organ Psychol* (Brunel repository)](https://bura.brunel.ac.uk/handle/2438/10407)
- Martínez & Salgado (2021) summarize three conclusions:
  1. Quasi-ipsative FC is the most valid FC format (and better than single-stimulus).
  2. Quasi-ipsative FC conscientiousness is the best personality predictor.
  3. **IRT does not always win** for predictive validity: Fisher et al. (2019, k=11, N=611) found CTT scoring of a quasi-ipsative FC test had predictive validity 0.38 vs 0 for IRT scoring. Another study likewise found CTT more effective than two IRT methods.

  **Contested** / mixed evidence. — [Martínez & Salgado 2021](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.732241/pdf)

### Inferences
- **Concrete problem with the spec**: 63 pairs × 1 point = 63 points distributed across Dominansi + Integritas + Kepemimpinan, so D + I + K = 63 for everyone.
  - With k = 3, the expected average correlation between ipsative scales is -1/(k-1) = **-0.50**, an artifact of the format and not a real relationship (the classic ipsativity property; Clemans 1966, cited in Martínez & Salgado 2021).
  - Consequence: someone who picks "integrity" statements is automatically "low dominance/leadership." Cronbach's alpha for ipsative scales is not interpretable either.
  - If each pair pits Integritas against Dominansi, the test effectively measures a **relative preference** ("honest vs dominant"), not the level of each trait.
- **Conceptual problem**: Dominansi and Kepemimpinan overlap heavily (dominance/assertiveness is a facet of extraversion that predicts leader emergence). Pitting them against each other in FC pairs produces responses that are hard to interpret.
- **Minimum options if FC is kept**:
  1. Add dimensions (for example, 6-10 traits), mix in a proportion of opposite-keyed pairs, and score with Thurstonian IRT (R package `thurstonianIRT`, Mplus, or lavaan). This needs a calibration sample, which is roughly several hundred respondents for a moderate model (recall, verify).
  2. Or use a **quasi-ipsative** format, for example "rate each statement 1-4 and then pick the one most like you," so totals are not fixed.
  3. Or treat FC only as a **qualitative intra-individual profile** for the psychologist's interview and leave it out of the numeric score.
- **Social-desirability matching** of each pair (both statements must be equally desirable, rated by an independent panel) is a prerequisite for FC to have any faking resistance. Without matching, applicants simply pick the "good-looking" statement.
- **MUPP / Zinnes-Griggs**: these are ideal-point (unfolding) models for pairs (Stark, Chernyshenko & Drasgow 2005; used in TAPAS, the US Army). Not fetched in this session; see Gaps.

### Gaps
- MUPP and the Zinnes-Griggs model (Stark et al. 2005; Morillo et al. 2016) were not fetched. Recall, verify: MUPP uses a GGUM ideal-point model per statement; TAPAS is a CAT forced-choice used by the US Army.
- Wiernik & Ones on ipsativity was not found in this session.
- No published minimum N for calibrating Thurstonian IRT was confirmed; it depends on model size.

---

## Q4. Faking / socially desirable responding in high-stakes selection; validity indicators

### Takeaway
Applicants consistently score higher than non-applicants, especially on **conscientiousness and emotional stability**: d about 0.3-0.45 in real applicant samples, and 0.5-0.7+ in instructed-faking studies. Stabilitas Emosi, Motif Berprestasi, and Pengambilan Keputusan in the draft are the most vulnerable. A properly designed FC format reduces faking clearly (d about 0.06 overall), but only when pairs are matched for desirability and scored normatively. The draft needs response-quality indicators (validity indicators), and norms must come from applicants.

### Cited Findings
- Birkeland et al. (2006, *IJSA*), 33 studies comparing applicants vs non-applicants: d = 0.11 for extraversion, **0.44** for emotional stability, **0.45** for conscientiousness, 0.13 for openness. In some jobs (e.g., sales) the ranking shifted, meaning applicants inflate the traits they see as job-relevant. Direct Big Five measures showed larger differences than indirect measures. — [Birkeland et al. 2006 (USF Digital Commons)](https://digitalcommons.usf.edu/psy_facpub/2324)
- Martínez & Salgado (2021) summarize prior meta-analyses:
  - Viswesvaran & Ones (1999): instructed faking d = 0.50 between-subjects and 0.70 within-subjects.
  - Birkeland: average d = 0.30 in applicant samples.
  - Hooper (2007): 0.53.
  - Salgado (2016): 0.70. Salgado (2016) also found faking **reduces SDs and reliability**.

  — [Martínez & Salgado 2021](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.732241/pdf)
- Cao & Drasgow (2019, *J Applied Psychology*):
  - Overall score inflation for FC was **d = 0.06**, much lower than for single-stimulus measures.
  - By trait: conscientiousness 0.23, agreeableness 0.19, extraversion 0.16.
  - The **PICK** format (d = 0.05) and **multidimensional** blocks (d = 0.03) resisted faking better than the MOLE format (0.37) and unidimensional blocks (0.13).
  - FC is most resistant when statements are **balanced for social desirability** and scored **normatively**.
  - Laboratory studies show larger effects than field studies.

  — [Cao & Drasgow 2019 (Illinois)](https://experts.illinois.edu/en/publications/does-forcing-reduce-faking-a-meta-analytic-review-of-forced-choic/); [PDF (gwern)](https://www.Gwern.net/doc/psychology/personality/2019-cao.pdf); figures via [Martínez & Salgado 2021](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.732241/pdf)
- Martínez & Salgado (2021), their own meta-analysis:
  - FC is resistant to faking. Faking is larger in experiments than in real selection ("partly a laboratory phenomenon").
  - For conscientiousness, quasi-ipsative δ = 0.49 vs ipsative δ = 1.27.
  - Other factors in applicant designs were nearly zero: ES −0.14 (ipsative) / −0.17 (normative) / 0.29 (quasi-ipsative); extraversion −0.27 / −0.01; openness 0.05 / −0.18; agreeableness −0.23 / 0.06.
  - Overall FC observed d ranged −0.23 to 0.36.
  - Earlier primary studies: Christiansen et al. 2005, FC d = 0.26 vs single-stimulus d = 0.96.

  — [Martínez & Salgado 2021](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.732241/pdf)
- **Contested**: Martínez & Salgado criticize Cao & Drasgow (2019) for misclassifying some FC formats and for artifacts in the primary studies. The two meta-analyses differ on which format is most faking-resistant (quasi-ipsative vs PICK/multidimensional). — [Martínez & Salgado 2021](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.732241/pdf)

### Inferences
- **Indicators to log in the online module** (cheap to implement, high value):
  1. **Inconsistency index**: 8-10 pairs of near-identical items (or an item and its reversed twin) placed far apart. Flag when the summed |difference| exceeds a threshold based on norms.
  2. **Infrequency / attention-check items**: for example, "Saya pernah bertemu presiden setiap minggu" (I have met the president every week). Agreeing is a flag.
  3. **Impression management / lie scale**: items describing behavior that is "too perfect" (e.g., "Saya tidak pernah marah sedikit pun," I have never been even slightly angry). Use a high score as a **flag for review, not as a score correction**. Statistical "correction" for social desirability generally does not improve validity (recall, verify: Ones, Viswesvaran & Reiss 1996).
  4. **Response time**: per-item time < about 1-2 seconds, or a total completion time far below the norm, suggests careless responding.
  5. **Straightlining / long-string**: the longest run of identical answers. With 4 points and mixed keying, a long run of "SS" is a strong signal.
  6. **Extreme response proportion**: share of SS+STS answers.
- **Norms**: because applicant means are higher by about 0.3-0.45 SD on the traits most relevant to the draft, norms from students or incumbents would make most applicants look "high." Norms must be applicant norms, by position.
- **"Faking-good" items in the draft**: Kepercayaan Diri, Stabilitas Emosi and Motif Berprestasi items with obvious content ("Saya selalu tenang di bawah tekanan," I am always calm under pressure) will push scores toward the ceiling. Use **frame-of-reference** ("di tempat kerja," at work) and items with less obvious desirability.

### Gaps
- No Indonesian study quantifying applicant faking (e.g., CPNS vs research setting) was found in this session.
- Response-time thresholds have no clear meta-analytic source in this session.

---

## Q5. Integrity tests and leadership/dominance measurement

### Takeaway
Integrity tests do predict counterproductive work behavior (CWB). Estimates range from moderate (Van Iddekinge et al. 2012: corrected 0.32 for CWB, 0.15 for performance) to strong (Ones et al. 1993; Sackett 2022 puts integrity at about 0.31 for performance). This is an **open dispute**. "Integritas" can be measured by self-report, but only with a validated scale (overt or personality-based), not 21-ish FC choices pitted against dominance. Dominance and leadership are better measured as normative traits (e.g., extraversion-assertiveness, a leadership self-efficacy scale) or through behavioral methods (assessment center/SJT).

### Cited Findings
- Ones, Viswesvaran & Schmidt (1993): 665 validity coefficients, N = 576,460. Integrity test validity is substantial for job performance and for CWB (theft, disciplinary problems, absenteeism). — [Van Iddekinge et al. summary / Gettysburg](https://cupola.gettysburg.edu/mgmtfac/4); [QIC-WD umbrella summary](https://www.qic-wd.org/sites/default/files/Integrity%20Tests%20Umbrella%20Summary%20040120.pdf)
- Van Iddekinge, Roth, Raymark & Odle-Dusseau (2012, *J Applied Psychology*): 104 studies (134 samples) meeting professional standards. Observed / criterion-corrected validities:
  - Job performance: 0.12 / 0.15
  - Training performance: 0.13 / 0.16
  - **CWB: 0.26 / 0.32**
  - Turnover: 0.07 / 0.09

  This conflicts with Ones et al.'s estimates. A follow-up debate followed ("On Reconciling Conflicting Meta-Analytic Findings…"). — [Updated meta-analysis summary](https://academicnewsletter.sufe.edu.cn/info/371115); [Reconciling paper](https://academicnewsletter.sufe.edu.cn/info/371132); [QIC-WD](https://www.qic-wd.org/sites/default/files/Integrity%20Tests%20Umbrella%20Summary%20040120.pdf)
- Sackett et al. (2022) estimate integrity test validity at **0.31** for job performance (cited in a secondary source; not verified directly). — [search result citing Sackett et al. 2022](https://master-hr.com/insights/insights-from-sackett-et-al-2023/)

### Inferences
- **Overt vs personality-based**:
  - Overt tests ask directly about attitudes toward and admissions of theft or rule-breaking. They are more face-valid and easier to fake.
  - Personality-based tests measure conscientiousness, agreeableness and emotional stability (HEXACO: Honesty-Humility). Ones et al. treat both as valid. The evidence comes from **commercial instruments** developed and validated over years. A new item set does not inherit that validity.
- **Integritas in FC pairs**: placing "integrity" statements opposite "dominance/leadership" statements produces a trade-off score. It is not equivalent to an integrity test. To measure integrity, use:
  - a separate normative scale (Likert, about 15-20 items, Honesty-Humility style: sincerity, fairness, greed-avoidance, modesty);
  - validated against a criterion (CWB, disciplinary records), or at least for convergence with HEXACO-H.
- **Leadership/dominance**: dominance is a component of extraversion (assertiveness), which is related to leader emergence. Self-reported "leadership" items have high face desirability and are easy to fake. Assessment centers or situational judgment tests (SJTs) are better.

### Gaps
- Judge et al. (2002) on Big Five and leadership (recall, verify: extraversion ρ ≈ 0.31 with leadership, the strongest) was not fetched.
- No validated Indonesian integrity test with criterion validity data was found.

---

## Q6. Mapping the six aspects to Big Five/HEXACO and their criterion validity

### Takeaway
The six aspects map loosely as follows:
- Stabilitas Emosi ≈ Neuroticism (reversed).
- Motif Berprestasi ≈ Conscientiousness-achievement striving.
- Prososial ≈ Agreeableness (+ HEXACO Honesty-Humility).
- Kepercayaan Diri ≈ low Neuroticism plus Extraversion-assertiveness (self-efficacy / core self-evaluation).
- Penyesuaian Diri ≈ Openness/adaptability plus emotional stability.
- Pengambilan Keputusan is **not a personality trait**. It is a competency or an ability (judgment), better measured by an SJT or a cognitive test.

There is overlap: Stabilitas Emosi, Kepercayaan Diri, and Penyesuaian Diri likely load on the same factor (low Neuroticism), so a CFA may not separate them. Among Big Five traits, conscientiousness is the most consistent predictor of performance. The others are weak and job-dependent.

### Cited Findings
- Sackett et al. (2022): validity estimates fall after correcting the range-restriction over-correction. Contextualized personality ("at work") items are much stronger than general items. — [HumRRO](https://www.humrro.org/blog/is-cognitive-ability-the-best-predictor-of-job-performance-new-research-says-its-time-to-think-again/)
- Quasi-ipsative FC conscientiousness is the best personality predictor of job and academic performance across all occupational categories (Salgado & Tauriz 2014; Salgado et al. 2015). — [Martínez & Salgado 2021](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.732241/pdf); [Salgado et al. 2015](https://bura.brunel.ac.uk/handle/2438/10407)
- Morgeson et al. (2007): personality constructs are too broad and often used without job analysis. — [Morgeson et al. 2007](https://pure.ul.ie/en/publications/reconsidering-the-use-of-personality-tests-in-personnel-selection/)

### Inferences
- **Practical implications for the draft**:
  - Motif Berprestasi (conscientiousness-like) deserves the most weight if the aim is predicting performance.
  - Stabilitas Emosi has modest validity but is relevant for screening extremes in public-service roles under stress.
  - Prososial is relevant to public service (pelayanan publik) and CWB (via agreeableness/honesty).
  - Pengambilan Keputusan as a self-report item set ("Saya cepat mengambil keputusan," I make decisions quickly) measures **self-perception** or decisiveness, not decision quality. Rename it (e.g., "Ketegasan/Decisiveness") or move it to an SJT.
- **Contextualize the items** ("Dalam pekerjaan, saya…", At work, I...) to raise validity (Sackett 2022).
- **Missing**: the draft has no aspect clearly equivalent to **conscientiousness-dependability/orderliness** (keteraturan, kepatuhan aturan, tanggung jawab), which is the best predictor and highly relevant to civil servants (ASN). Consider an aspect such as "Tanggung Jawab/Keteraturan" or merging it into Motif Berprestasi.

### Gaps
- Barrick & Mount (1991) / Barrick, Mount & Judge (2001) and Sackett 2022 per-trait figures were not verified (recall, verify: Barrick-Mount 2001 conscientiousness ρ ≈ 0.27 overall and emotional stability ρ ≈ 0.13 before the Sackett correction; after Sackett 2022 about 0.19 and about 0.1).
- No mapping study between Indonesian "aspek" (as used in local psychological reports) and the Big Five was found.

---

## Q7. Legal/ethical aspects, adverse impact, and adaptation (ITC)

### Takeaway
Personality tests generally have small subgroup differences (gender and ethnicity), so adverse impact is lower than for cognitive tests. Still, every item must be checked for DIF and every cut-off monitored by group (e.g., the 4/5 rule). Adapting foreign items into Indonesian must follow the ITC Guidelines for Translating and Adapting Tests (2nd ed., 2017): forward/back translation, review, pilot, and equivalence testing, plus local norms. Ethically (HIMPSI), the personality test result is psychological data that should be interpreted by a psychologist, not just printed as a number.

### Cited Findings
- Hough & Oswald (2008, *Industrial and Organizational Psychology* 1(3):272-290) reviewed personality testing in I-O psychology, including its role in reducing adverse impact. Meta-analyses found little evidence of adverse impact against women (Hough et al. 2001) or minorities (Foldes et al. 2008). Hough et al. (2001) found women slightly lower on extraversion (d = −0.09). — [Hough & Oswald 2008 (Cambridge)](https://www.cambridge.org/core/journals/industrial-and-organizational-psychology/article/personality-testing-and-industrialorganizational-psychology-reflections-progress-and-prospects/F8B34E49D1E8F69F0C8F958922D29EE6); [RePEc](https://ideas.repec.org/a/cup/inorps/v1y2008i03p272-290_00.html); [UMN: gender & ethnic group differences on personality scales](https://experts.umn.edu/en/publications/gender-and-ethnic-group-differences-on-personality-scales-in-sele/)
- The HIMPSI Psychology Code of Ethics has 14 chapters and 80 articles, and governs psychologists and psychology scientists in Indonesia, including the use of assessment instruments. — [Kode Etik RPS document (Bina Darma)](https://psikologi.binadarma.ac.id/document/1709450652_RPS%20KODE%20ETIK%202024.pdf); [Insania journal, UIN Antasari](https://jurnal.uin-antasari.ac.id/index.php/insania/article/download/18185/4810/52274)
- Literature on keeping psychological tests confidential and on psychologists' professionalism in assessment. — [Jurnal Ekspresi UMK: "Menjaga Kerahasiaan Alat Tes"](https://jurnal.umk.ac.id/index.php/ekspresi/article/view/16958)

### Inferences
- **Adverse impact monitoring**: log pass rates by gender, age group, and region, and apply the 4/5 rule (a group's selection ratio < 80% of the highest group's is a flag). Run a DIF analysis (Mantel-Haenszel or logistic regression) after the pilot.
- **Item adaptation**: if items are taken from IPIP/BFI/HEXACO (public domain), follow the ITC 2017 steps. Avoid idioms. Check that concepts such as "dominan" and "percaya diri" carry the same social desirability in Indonesian culture. Collectivist cultures may judge assertive statements more negatively, which changes how FC pairs balance.
- **Ethics and transparency**: inform participants about the purpose, use of data, retention period, and who sees the results (informed consent). Do not label a person as "tidak lulus kepribadian" (failed personality) without review by a psychologist when a validity flag appears.

### Gaps
- The ITC Guidelines (2017) text and any HIMPSI rule specifically about **computer-scored / automatically interpreted personality results** were not fetched. Recall, verify: the HIMPSI Code of Ethics (2010) chapter on assessment says only competent psychologists may interpret psychological tests, and test materials must be kept confidential. Check the latest HIMPSI document directly.
- No Indonesian regulation (e.g., KemenPAN-RB/BKN) specifically on the validity of personality tests in CASN selection was found.

---

## Q8. Indonesian context: instruments in use and local practice

### Takeaway
Indonesian selection practice relies heavily on **PAPI Kostick** (90 FC pairs, ipsative, 20 needs/roles), **EPPS** (ipsative FC), MMPI-2 (clinical, not for normal selection), DISC (often misused for selection), and local inventories. Several (PAPI, EPPS) are **ipsative**, so they share the comparison problem from Q3. There are some local validation studies of PAPI (CFA, item revision), but published Indonesian norms and criterion validity are scarce.

### Cited Findings
- There is a systematic review of PAPI Kostick implementation in Indonesia (Jurnal Psikologi UM, journal3.um.ac.id). The full text could not be read (403 error). — [Implementasi Alat Tes PAPI Kostick (Review Sistematis)](https://journal3.um.ac.id/index.php/psi/article/view/1900)
- An Indonesian study revised PAPI Kostick items and ran a CFA. Reported fit was good on all dimensions (RMSEA < 0.08), and the revised version had adequate construct validity. This was a search-result snippet; the exact source of the snippet could not be confirmed. — [search result; possibly Insania UIN Antasari](https://jurnal.uin-antasari.ac.id/index.php/insania/article/download/18185/4810/52274)
- PAPI Kostick is widely used for worker selection and placement. — [ibid.](https://journal3.um.ac.id/index.php/psi/article/view/1900)

### Inferences
- The draft's FC format (63 pairs, accumulation) looks like it imitates PAPI/EPPS. That means it inherits the ipsativity problem, which in local practice is usually "solved" by having a psychologist interpret the profile, not by ranking applicants. If the module is meant to rank automatically, that assumption no longer holds.
- MMPI-2 is a clinical instrument. Using it to select normal workers is a misuse (outside its intended use) and it needs a psychologist. It should not be imitated in an automated module.
- DISC is a typology for team development, not selection. It has no criterion validity evidence for performance.

### Gaps
- Published Indonesian norms for PAPI or EPPS, and criterion-validity studies (PAPI score vs performance), were not found in this session.
- Locally developed inventories used by BKN or other government agencies were not identified. Recall, verify: Indonesian psychological bureaus commonly use instruments such as "Tes Kepribadian" or adapted "IST + PAPI + EPPS" batteries, but this is not documented here.

---

## Consolidated critique of the draft (for the report writer)

| # | Issue in draft | Why it matters | Fix |
|---|---|---|---|
| 1 | FC 63 pairs → accumulated D/I/K scores | Fully ipsative. D+I+K = 63, inter-scale r ≈ −0.5 by construction. Invalid for ranking people. | Thurstonian IRT with more traits and mixed keying, or quasi-ipsative, or drop FC from the numeric score |
| 2 | Integritas pitted against Dominansi/Kepemimpinan | Measures a trade-off, not an integrity level | Separate normative integrity scale (HEXACO-H style) |
| 3 | Dominansi vs Kepemimpinan | Overlapping constructs | Merge, or define them distinctly |
| 4 | Pengambilan Keputusan as a personality aspect | It is a competency/ability; self-report captures self-perception | Rename to "Ketegasan," or move to an SJT |
| 5 | Stabilitas Emosi / Kepercayaan Diri / Penyesuaian Diri | Likely one factor (low N) | Check with CFA; merge if not separable |
| 6 | No conscientiousness-dependability aspect | Strongest predictor is missing | Add "Tanggung Jawab/Keteraturan" |
| 7 | 0-100 score with passing grade 61 | Arbitrary, no norm/validity basis | Applicant norms → T → composite → empirical cut-off or banding |
| 8 | 40% weight | Exceeds personality's modest validity | Lower the weight, or use as screen-out of extremes plus interview input |
| 9 | No validity indicators | Applicant faking d ≈ 0.3-0.45 on C/ES | Inconsistency, infrequency, IM, response time, long-string |
| 10 | No norms/reliability plan | Raw scores cannot be interpreted | Pilot, applicant norms, alpha/omega, SEM, DIF |
| 11 | Generic (non-contextualized) items | Lower validity (Sackett 2022) | Use an "at work" frame of reference |
| 12 | Automated pass/fail without a psychologist | HIMPSI ethics and the risk of mislabeling | Validity flags → psychologist review |
