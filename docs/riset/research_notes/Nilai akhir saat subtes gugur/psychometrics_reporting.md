# Psychometric conventions: compensatory composite + per-subtest minimum, and how to report a failed result

Case under study: weighted composite 60/20/20, pass ≥ 61. Composite = 74.5, but one subtest raw ≤ 40, which disqualifies. What should the "final score" show?

## Q1. Definitions: compensatory vs conjunctive (multiple cutoff / multiple hurdle) vs hybrid

### Takeaway
The main standards (SIOP Principles 2018; AERA/APA/NCME Standards 2014) treat compensatory and noncompensatory/conjunctive rules as two different decision rules. SIOP explicitly approves hybrids (a hurdle on one predictor, a compensatory rule on the rest). Both documents require the rule to be justified and documented, and the 2014 Standards also require it to be communicated to test takers.

### Cited Findings
- SIOP Principles (5th ed., 2018), "Multiple hurdles versus compensatory models" (p. 32): "the testing professional must decide whether candidates are required to score above a specific level on each of several assessments (multiple hurdles) or achieve a specific total score across all assessments (compensatory model). There are no absolutes regarding which model should be implemented, and, at times, hybrid approaches are possible (e.g., a hurdle may be most appropriate for one predictor, while a compensatory model may be best for other predictors within the overall selection procedure). The rationale and supporting evidence should be presented for the model recommended for assessment scoring and interpretation." It continues: "the method of combining test scores might influence the overall reliability of the entire selection process and the subgroup passing rates (Sackett & Roth, 1996)." — [SIOP Principles 2018 (APA-hosted PDF)](https://www.apa.org/ed/accreditation/personnel-selection-procedures.pdf)
- AERA/APA/NCME Standards (2014), Ch. 11 intro (p. 175): "In some cases, high scores on some tests are permitted to offset (i.e., compensate for) low scores on other tests, so that an additive combination is appropriate. In other cases, a conjunctive decision model requiring acceptable performance on each test in an examination series is used. The type of pass-fail decision model appropriate for a credentialing program should be carefully considered, and the conceptual and/or empirical basis for the decision model should be articulated." — [Standards 2014 open-access PDF](https://www.testingstandards.net/uploads/7/6/6/4/76643089/standards_2014edition.pdf)
- Standards 2014, Ch. 12 "Weighted and Composite Scoring": "Under a noncompensatory decision rule, the student has to achieve a determined level of performance on each test; under a compensatory decision rule, the student may only have to achieve a certain total composite score based on a combination of scores across tests. For a high-stakes decision ... the rules used to combine scores across tests should be established with a clear understanding of the associated implications ... passing rates and classification error rates will differ depending on the rules for combining test results." The same section warns that "Nominal weights may sometimes be misleading because the variance of the composite is also determined by the variances and covariances of the individual component scores. As a result, the 'effective weight' of each component may not reflect the nominal weighting." — [Standards 2014](https://www.testingstandards.net/uploads/7/6/6/4/76643089/standards_2014edition.pdf)
- Standard 1.14: "Where composite scores are developed, the basis and rationale for arriving at the composites should be given ... the basis for combining scores and for how scores are combined (e.g., differential weighting versus simple summation) should be specified." — [Standards 2014](https://www.testingstandards.net/uploads/7/6/6/4/76643089/standards_2014edition.pdf)
- Standard 11.15: "Rules and procedures that are used to combine scores on different parts of an assessment or scores from multiple assessments to determine the overall outcome of a credentialing test should be reported to test takers, preferably before the test is administered." Comment: "candidates should be informed of the intention of weighting (e.g., test A contributes 25% and test B contributes 75% to the total score)." — [Standards 2014](https://www.testingstandards.net/uploads/7/6/6/4/76643089/standards_2014edition.pdf)
- Standard 5.21: "When proposed score interpretations involve one or more cut scores, the rationale and procedures used for establishing cut scores should be documented clearly." — [Standards 2014](https://www.testingstandards.net/uploads/7/6/6/4/76643089/standards_2014edition.pdf)
- Trade-off (secondary summary): compensatory systems "often preserve more information" and give higher expected criterion performance; multiple-hurdle systems lower administration cost. The vignette cites Sackett & Roth (1996) and Ock & Oswald (2018). — [personnelSelectionUtility vignette (CRAN)](https://erised.las.iastate.edu/CRAN/web/packages/personnelSelectionUtility/vignettes/compensatory-vs-multiple-hurdle-simulation.html)
- In medical licensing OSCEs, a conjunctive standard (a minimum number of stations passed on top of the aggregate pass mark) is usually justified as preventing "excessive degrees of compensation." Critics note these hurdles are often "arbitrary and fixed." — Homer & Russell 2021, [White Rose eprint](https://eprints.whiterose.ac.uk/168283); [Ottawa conference abstract](https://ottawa.arinex.one/talks/assessing-a-dynamic-method-of-setting-the-conjunctive-standard-for-a-major-licensing-osce)

### Inferences
- The system in this case (composite ≥ 61 plus a floor on each subtest) is the hybrid SIOP describes. It is legitimate only if the floor has a documented rationale (Std 5.21, SIOP p. 32) and is announced to candidates in advance (Std 11.15).
- Std 12 says nominal weights are not effective weights. The 60/20/20 weights should be checked against the actual subtest variances. (Inference; this was not computed.)

### Gaps
- The textbook primary texts (Cascio & Aguinis; Gatewood, Feild & Barrick; Guion) were not fetched; they are paywalled. The pressbooks HR text that summarizes them returned 403. Their definitions are standard, but I have no exact quotes from them.

## Q2. In hybrid models, is the composite itself changed when a hurdle fails, or is the decision kept separate?

### Takeaway
No source I found tells you to cap, zero, or rewrite the composite when a hurdle fails. Both standards frame the hurdle as part of the decision rule ("overall outcome", "pass-fail decision model"), not as a transformation of the score. The clearest real example, Indonesia's CPNS SKD announcements, prints the full unaltered total next to a "TL" (not passed) status.

### Cited Findings
- The Standards distinguish the score from "the rules used to combine scores ... to determine the overall outcome" (Std 11.15) and from "the type of pass-fail decision model" (Ch. 11). The outcome is treated as a separate classification. — [Standards 2014](https://www.testingstandards.net/uploads/7/6/6/4/76643089/standards_2014edition.pdf)
- SIOP describes hurdles as a requirement to "score above a specific level on each of several assessments." The scores themselves stay as they are; the model governs the decision. — [SIOP 2018](https://www.apa.org/ed/accreditation/personnel-selection-procedures.pdf)
- **CPNS SKD 2023, verified from the official PDF.** Each row lists TWK, TIU, TKP, Total and a "Keterangan" (status) column. Example: "GENTA HARAMAIN ... 90 65 193 348 TL". TIU 65 is below the TIU floor of 80, so the candidate failed, yet the total of 348 is printed unchanged. The same candidate is listed *below* a P/L candidate with a lower total (SILVA YUSALIM, total 322, P/L). So the failed hurdle changes the status and the ranking, but not the score. Legend: "Kode 'TL' adalah peserta yang tidak memenuhi nilai ambang batas SKD." — [ISI Padangpanjang, Pengumuman Hasil SKD CPNS TA 2023](https://www.isi-padangpanjang.ac.id/wp-content/uploads/2017/02/ISI-Padangpanjang-Pengumuman-Hasil-SKD-CPNS-TA-2023.pdf)
- SKD floors: TWK 65, TIU 80, TKP 166 (KepMenPAN-RB 321/2024, unchanged from the previous year). Max total 550. Passing the floors is necessary but not sufficient: the candidate must also rank within 3× the number of positions. — [Kompas TV](https://www.kompas.tv/ekonomi/545778/berapa-jumlah-soal-dan-nilai-ambang-batas-tes-skd-cpns-2024-ini-penjelasannya); [Setkab](https://setkab.go.id/bkn-lulus-passing-grade-skd-pelamar-cpns-belum-tentu-lolos-melaju-ke-skb)
- Washington naturopathic licensure: a minimum of 75 on each component, and the board "will consider passing scores under a compensatory model case by case." This is another example of the decision rule sitting on top of reported component scores. — [WAC 246-836-030](https://lawfilesext.leg.wa.gov/Law/WAC/WAC%20246%20%20TITLE/WAC%20246%20-836%20%20CHAPTER/WAC%20246%20-836%20-030.htm)

### Inferences
- **Option comparison.** Each option below is my inference from the standards cited; none is quoted from them.
  - **Show the composite as-is plus a "not passed" status naming the failed criterion.** This fits the standards best. The score keeps its meaning (Std 6.10: "what scores represent"), the decision is reported as a separate, precisely labelled category (Std 8.7), and it matches CPNS practice. Risk: the candidate sees 74.5 ≥ 61 and is confused. Mitigate with explicit wording, e.g. "74.5 meets the composite threshold, BUT subtest X is below its minimum, so the result is Not Passed."
  - **Cap the composite (e.g., to 60).** This produces a number that is not a weighted average of the subtest scores, so it no longer represents performance. That conflicts with Std 1.14 (the composite's basis must be specified) and Std 6.10. It also destroys ranking information among failing candidates. Only defensible if the capping rule is documented and disclosed as part of the scoring rule (Std 11.15), and even then it mixes score with decision.
  - **Zero it.** Worst for interpretability. It conveys no information about actual performance and implies total failure. It also violates the spirit of Std 8.7 against unnecessarily stigmatizing labels.
  - **Hide it.** Acceptable for some high-security pass/fail credentialing programs (Standards Ch. 11 notes many such tests "report results as simply 'pass' or 'fail'"). But it removes useful feedback, which is the opposite of what a practice platform needs.

### Gaps
- I found no explicit statement in SIOP or the Standards that says "do not alter the composite when a hurdle fails." The recommendation is inferred from how they define scores versus decision rules, and from CPNS practice.
- The SSCASN individual result screen design was not verified, only the published announcement tables.

## Q3. Score-report guidance: clarity, separating score from decision, showing the failed criterion

### Takeaway
The guidance converges on four requirements: describe in simple language what the score means, label categories precisely and without stigma, tell failing candidates where they were weak (with care about subscore reliability), and lead with a summary of the key result.

### Cited Findings
- Std 6.10: "interpretations should describe in simple language what the test covers, what scores represent, the precision/reliability of the scores, and how scores are intended to be used." Comment: "Reports and feedback should be designed to support valid interpretations and use, and minimize potential negative consequences." — [Standards 2014](https://www.testingstandards.net/uploads/7/6/6/4/76643089/standards_2014edition.pdf)
- Std 8.7: "When score reporting assigns scores of individual test takers into categories, the labels assigned to the categories should be chosen to reflect intended inferences and should be described precisely." Comment: avoid "labels with unnecessarily stigmatizing implications ... 'basic,' 'proficient,' and 'advanced' would carry less stigmatizing interpretations than terms such as 'poor' or 'unsatisfactory.'" — [Standards 2014](https://www.testingstandards.net/uploads/7/6/6/4/76643089/standards_2014edition.pdf)
- Std 8.8: when scores are used to make decisions, "the test taker should have timely access to a copy of any report of test scores and test interpretation" unless waived. — [Standards 2014](https://www.testingstandards.net/uploads/7/6/6/4/76643089/standards_2014edition.pdf)
- Standards Ch. 11: "Candidates who fail may profit from information about the areas in which their performance was especially weak. This is the reason that subscores are sometimes provided. Subscores are often based on relatively small numbers of items and can be much less reliable than the total score ... the decision to provide subscores to candidates should be made carefully, and information should be provided to facilitate proper interpretation." — [Standards 2014](https://www.testingstandards.net/uploads/7/6/6/4/76643089/standards_2014edition.pdf)
- SIOP 2018, "Candidate feedback" (p. 37–38): "Feedback should be provided in clear language that is understandable by candidates receiving the feedback, and feedback information should not violate the security of the test or its scoring." — [SIOP 2018](https://www.apa.org/ed/accreditation/personnel-selection-procedures.pdf)
- The Hambleton & Zenisky (2013) review framework asks, among other things, "Is a highlight or summary section included to communicate the key score information?" and "Are concrete examples provided for the use of the test score information?" Its categories include scores and performance levels, language, design, and interpretive guides. — Roduta Roberts & Gotch (2019), [Frontiers in Education 4:20](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2019.00020/full)
- NBOME's COMLEX score report notes that subscores based on fewer items are less reliable than the total. — [COMLEX Level 2-CE Score Report](https://www.nbome.org/app/uploads/2026/03/COMLEX-Level-2-CE-Score-Report.pdf) (described in search snippet; not fetched in full)

### Inferences
- A defensible report layout: (1) a summary line with the decision first ("Not Passed: Subtest X below its minimum"); (2) the composite 74.5 shown against its threshold 61 (met); (3) a per-subtest row showing the failed one against its floor (≤ 40 vs required > 40); (4) a one-line explanation of the rule ("you must meet the composite AND every subtest minimum"). This applies Std 6.10, 8.7, Ch. 11, and H&Z's summary-section criterion.
- Use non-stigmatizing labels ("Belum memenuhi syarat minimum" rather than "Gagal"), per Std 8.7.

### Gaps
- The ITC Guidelines (e.g., on test use / score reporting) were not fetched, so there are no ITC quotes.
- Hambleton & Zenisky's original 2013 chapter (APA Handbook of Testing and Assessment) was not accessed; only the secondary description above.

## Q4. Other high-stakes systems that show a total but fail on a subscore minimum

### Takeaway
This pattern is common. The total or overall score is reported unaltered, a minimum per component is applied as a separate rule, and the outcome is communicated as a status.

### Cited Findings
- CPNS SKD (Indonesia): total printed, status TL when any subtest is under its threshold (see Q2). — [ISI Padangpanjang 2023 PDF](https://www.isi-padangpanjang.ac.id/wp-content/uploads/2017/02/ISI-Padangpanjang-Pengumuman-Hasil-SKD-CPNS-TA-2023.pdf)
- IELTS for UK visas: several routes require "a minimum of 5.5 in each of the four components." The IELTS Test Report Form shows the overall band and every component band; the receiving body applies its own component floors. — [IELTS UK](https://www.ielts.org/uk). University and visa rules elsewhere often specify an overall score plus "no band lower than 5.5" (from blog sources, lower reliability). — [PW](https://www.pw.live/study-abroad/ielts/exams/ielts-score-for-different-countries)
- Licensure: California requires a scaled minimum of 75 on each USMLE part ([MBC](https://www.mbc.ca.gov/About/Meetings/Material/30168/brd-AgendaItem21-20100429.pdf)). Washington naturopathy requires a minimum of 75 per component ([WAC](https://lawfilesext.leg.wa.gov/Law/WAC/WAC%20246%20%20TITLE/WAC%20246%20-836%20%20CHAPTER/WAC%20246%20-836%20-030.htm)). The Louisiana bar moved to purely compensatory grading (650/900) ([LSU Law](https://law.lsu.edu/news/?p=443)). UK PLAB OSCE uses aggregate plus minimum stations passed ([White Rose](https://eprints.whiterose.ac.uk/168283)).

### Inferences
- In none of these did I see the overall/total score altered because a component failed. The status carries the failure. (This is an inference from the examples; I did not exhaustively survey every system.)

### Gaps
- The IELTS claim that the TRF shows all bands is from general knowledge; I did not fetch a TRF sample. The UK per-component rule figures come from the search snippet of the official page.

## Q5. Practice platform (test-prep): feedback design that helps learners

### Takeaway
For learning, feedback should name the gap against the goal and say what to do next ("where to next"). It should focus attention on the task, not on the self. That argues for showing the real composite, flagging the bottleneck subtest explicitly, and giving a concrete next action, not a punitive zero.

### Cited Findings
- Hattie & Timperley (2007), "The Power of Feedback," *Review of Educational Research* 77(1), 81–112. Feedback answers three questions: Where am I going? (feed-up), How am I going? (feed-back), Where to next? (feed-forward). It operates at task, process, self-regulation, and self levels. — [Frontiers 2021 summary](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2021.645758/pdf); [Univ. Melbourne repository](https://minerva-access.unimelb.edu.au/server/api/core/bitstreams/0404624b-b435-500d-ac1f-7ae15d2c2236/content)
- Hattie et al. (2021, Frontiers in Education, with Turnitin; 3,204 essays): "where to next" feedback produced the largest gains from first to final submission, and should be scaffolded with goal and progress feedback. Caveat: co-authored with a commercial vendor. — [Frontiers 2021](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2021.645758/pdf)
- Kluger & DeNisi (1996) meta-analysis: 607 effect sizes, 23,663 observations, mean d = .41, but more than one-third of feedback interventions *decreased* performance. Effectiveness drops as feedback shifts attention toward the self (meta-task) and away from the task. — [Kluger & DeNisi abstract (HUJI)](https://pluto.huji.ac.il/%7Emskluger/files/Download/Kluger%20&%20%20DeNisi%20abstract.doc); [Albany PDF](https://albany.edu/faculty/ts460/pad634/Files/2361-KlugerDeNisiFeedbackcapHighlighted.pdf)
- SIOP notes test-prep features: "practice materials, performance feedback, retest opportunities." — [SIOP 2018](https://www.apa.org/ed/accreditation/personnel-selection-procedures.pdf)

### Inferences
- **Recommended for the practice platform** (inference): show the real composite (74.5), because hiding or zeroing it removes the "How am I going?" signal. Pair it with a dominant status ("Tidak Memenuhi Syarat — Subtes X di bawah batas minimum"), so the result mirrors the real exam's rule and the learner isn't falsely reassured. Then name the bottleneck with numbers: "Subtes X: 38, minimum 41, short by 3 points." Finish with a next-step action, such as a link to a drill for subtest X. That covers feed-up (the rule), feed-back (the real numbers), and feed-forward (the action).
- Zeroing or capping is a self-level, punitive signal. It risks the negative effects Kluger & DeNisi describe, and it hides genuine progress in the other subtests.
- The Standards caution that subscores are less reliable than the total. Where a subtest has few items, show a margin or "close to the threshold" wording rather than overstating precision (Std 6.10 on precision).

### Gaps
- I found no empirical study that directly compares "show composite + fail status" against "capped/zeroed composite" for learner motivation or performance. The recommendation is an extrapolation from general feedback research.
- Shute (2008) "Focus on Formative Feedback" and the ITC guidelines were not fetched.
