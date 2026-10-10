# Pola Gambar — rules, key verification, taxonomy, generator

Sources: `hi/p100-07..10.png` (PDF `1_5015182875738244109.pdf`, pages 7–10), `hi/bin-27..29.png` (KECERDASAN PAKET 3 BINTARA, p.27–29), `hi/akp-22..25.png` (KECERDASAN PAKET 3-AKPOL). I also checked the embedded images with `pdfimages`. They are no sharper than the page renders (96–160 ppi), so very fine details (items Bintara 97/98) are at the edge of what can be read.

## 1. Item-by-item

### Paket 100 (keyed)
| # | Rule | My answer | Published key | Agrees? |
|---|---|---|---|---|
| 26 | 3×3. In every row col3 = col1, and col2 = col1 with colours inverted. Row 3: col3 = col1 = black square with white top-left notch | d | d | yes. Defect: row 3 col 2 is drawn as a white square with a black **top-right** notch. That is not the inverse of col 1 (the inverse would be a black top-left notch, which is option a). The key is still reachable through col3 = col1. |
| 27 | Number of sides +1: ¾-circle (3 edges: 2 straight + 1 arc) → diamond (4) → pentagon (5) → hexagon (6) | c | c | yes |
| 28 | 3×3. Row 3 = row 1 (dot position) overlaid on row 2 (line). Col 3: dot top-left + diagonal "/" | e | e | yes |
| 31 | 3×3 by column. Row 3 = row 1 (×) overlaid on row 2 (○), so col 3 has ⊗ in all four quadrants. Row-wise, col2 ⊆ col3 | d | d | yes. Defect: row 3 col 1 shows its × at bottom-right. The overlay rule says top-right (row 1 col 1 has × at top-right). |
| 32 | Three nested layers. The shape order rotates by one each frame (△○□ → ○□△ → □△○ → △○□). The fill pattern alternates (B/W/B ↔ W/B/W) | d (triangle outline, black circle, white square) | d | yes |
| 33 | The note's height level (0 = bottom edge … 6 = top edge) goes 0,6,1,5,2,4,3: two tracks converging, with steps +6,−5,+4,−3,+2,−1, so next is ±0 → level 3 (middle cell) | d | d | yes, but weak: the answer looks the same as figure 7 (the "+0" step). Medium confidence. |
| 35 | The geometry rotates exactly 135° clockwise per frame (lone dot TL→R→BL→T; the hollow end of the line BR→L→TR→B). By strict rotation, frame 5 = lone dot at **BR**, line from centre to **TL**. **No option matches that.** Key b = lone dot TL, line centre–BR, filled dot at BR. That is the geometry of frame 1, and it fits only the weaker rule "filled dot walks TL→C→TR→C→BR". | b by elimination only | b | **Flawed item.** The key is defensible only under the filled-dot-walk rule, which frame 1 breaks (there the filled dot is the unconnected one). |
| 36 | 3×3. col3 = col1 ∪ col2 (overlay). Row 3: "/" ∪ empty = "/" | b | b | yes |

### Bintara (unkeyed; items #93–100)
| # | Rule | Answer | Confidence |
|---|---|---|---|
| 93 | Prohibition signs : hazard-warning triangles (radiation, toxic, biohazard, …) | C (high voltage) | high |
| 94 | COVID prevention (mask, distancing, sanitiser, stay home) : COVID symptoms (fever, ?, sore throat, lungs) | D (coughing head in the same purple/red symptom style) | high |
| 95 | People/facility signs : package-handling symbols (this side up, dispose, keep dry, …) | B (fragile glass) | high |
| 96 | Find the pure rotation; the other options are mirror images. Chirality test: with the arrow pointing forward, the parallel line must sit clockwise of it and the big oval anticlockwise. Only B (≈180°) passes. A, C, D, E are mirrored. | B | medium-high |
| 97 | Same task. B and E have mirrored outlines. A has a rotated outline but a mirrored slash. **C (~120°) and D (~240°) both pass** the outline and slash tests. Overlaying the rotated stimulus fits C best. D seems to differ only in the hook glyph, which cannot be resolved at this resolution. | C | low-medium (possibly two answers, or a hook-glyph trap) |
| 98 | Same task with an X and dots. E = 180° rotation (checked by rotating the stimulus image and overlaying). A ≈ 90° CCW, but its two central dots are shifted. C has the hollow dot right but the dots rearranged. B has the same orientation with dots moved. D is a diagonal mirror. | E | medium (A is a near-miss) |
| 99 | A→B: the middle circle is cut along "\" and its halves offset. The inner eye is turned inside-out and rotated 90° (eye → hourglass). Apply to C: split the middle square along "\" (D splits along "/"), and ")(" → horizontal "()" oval (C keeps it vertical; A/B keep the crescents) | E | medium |
| 100 | The top element moves to the bottom and is completed (arch → full ring; triangle → diamond). The bottom element flips vertically and moves up. Answer = narrow-top trapezoid at the top plus diamond at the bottom. A and E both fit; E matches the B-frame layout (top-aligned). **Letters are broken:** C E F H → B D E G is −1, so K M N P → J L M O, but every option prints L M N P. | E | low; item flawed |

### AKPOL (unkeyed; items on akp-22..24 are #92–97; #98–100 are strip-ordering and out of scope)
| # | Rule | Answer | Confidence |
|---|---|---|---|
| 92 | col3 = col1 − col2 (subtraction). Row 3: 4 triangles − (▲ top-left, ▶ bottom-right) = ▲ bottom-left + ▶ top-right | D (A has the right pieces stacked wrongly) | high |
| 93 | col3 = col1's shape as an outline. The band toggles between col1 and col3 (no band ↔ band). Row 3: col1 is an outline barrel with no band → col3 = outline barrel with a black band | E | medium-high |
| 94 | Row-wise Latin square: frame {diamond, pentagon-arrow, slanted trapezoid} × inner {drop, cloud, cross}. Row 3 still needs diamond + cross. Columns are *not* Latin (col 2 repeats pentagon and drop) | B | medium-high (C = column-rule distractor) |
| 95 | Rows 1 and 3: col3 = invert(col1) overlaid on invert(col2). Row 2 cannot satisfy this with "?" in col1, so the composite must be "?": invert(col2) over invert(col3) = black notched square, white arrows, black arch | D | low-medium; the row rule is inconsistent across rows |
| 96 | A black square walks clockwise around the 8 perimeter cells in reading order (TL, TC, TR, **?**, BR, BC, BC, BL, ML). ? = middle-right | B | medium-high. Defect: BC appears twice (r2c3 and r3c1). |
| 97 | col1 = col2 ∪ col3 (overlay). Row 2: crescent ∪ (black square with white cross) = black square, white cross, black crescent | D | high |

## 2. Transcription check: soal.json vs PDF
**soal.json items 26–37 are not transcriptions of the PDF.** They are original replacement items produced by `scripts/inject-spasial.js` (synthetic shapes, satellites, `::` analogies). Concrete mismatches:
- Content: none of the 11 pola_gambar SVGs depicts the PDF figure with the same number.
- Type: PDF #30, #34 and #37 are "urutkan potongan gambar" (strip ordering). In soal.json they are `pola_gambar`. Only #29 stayed `susun_gambar`.
- Keys differ from the PDF: 28 (repo b / PDF e), 31 (a / d), 32 (c / d), 35 (e / b). Items 26, 27, 33 and 36 share a letter by coincidence.

If the site is meant to carry the PDF items, these are wrong. If the replacement was intentional, the keys are self-consistent apart from these defects (rendered and checked visually):
- **q31: options C and D render identically** (solid square with white circle). "180° rotation" of a square looks like no rotation, so two options are the same picture.
- **q30: solid-in-solid.** In frame 2 the inner pentagon is invisible inside a solid square. Options D/E show the inner hexagon poking through the triangle's edges, so the swap cannot be seen.
- **q36:** the rotation amount is not determined by the example (a circle inside shows no rotation; the "setengah irisan" wording is muddled). Option C is a solid-on-solid blob that looks like a heptagon.
- q37 option E: the inner pentagon outline overlaps the diamond edges (minor).

## 3. Taxonomy and solving formula
| Family | Fast check for the student | How distractors are built (one broken layer each) |
|---|---|---|
| (a) Sequence with rotation k·θ (+ fill alternation, + count) | Measure θ between frames 1→2 and 2→3, taken modulo the shape's symmetry (triangle 120, square 90, pentagon 72, hexagon 60, rhombus 180). Then check fill parity (period 2) and the count difference. The answer is frame3 + θ. | rotation stopped (= frame 3), overshoot (+2θ), reversed direction, wrong fill, count ±1 |
| (b) Satellite orbit | Track the satellite index on the 8-point compass (0 = top, clockwise). Step k is constant. Separately check topology swap or fill parity and the count | satellite did not move, moved backwards, jumped 2k; no swap; count ±1 |
| (c) 3×3 matrix with a row operator | Split each cell into primitives (dots, lines). Test col3 against OR / XOR / A−B / A∩B on rows 1–2. Pick the one operator that fits both rows and apply it to row 3. Also check for a Latin-square pattern (each attribute appears once per row) | wrong operator (OR↔XOR: the shared element kept or dropped); one primitive missing from col1; one missing from col2; one extra primitive |
| (d) Position walk | Number the perimeter cells clockwise and read the frames in reading order or snake order. The step is constant | off by one step, reversed walk, wrong reading order |
| (e) Analogy A:B = C:? | List what changed A→B layer by layer: inner/outer swap, fill inversion, rotation (mod symmetry), satellite shift, count. Apply exactly those to C. For "find the rotated copy" items, run a chirality test (mirror images flip the clockwise order of the landmarks) | each distractor omits exactly one layer, or applies it in the opposite direction |
| (f) Quantity progression | Count elements; look for an arithmetic difference (sides 3,4,5 → 6; dots 1,2,3 → 4) or converging tracks (Paket #33) | ±1 count, right count in the wrong place |

Paragraph 2 of the pembahasan works because each distractor fails exactly one named layer: "Opsi X gugur karena <that layer>".

## 4. Generator (`analysis/gen-pola.ts`)
- Run with `npx tsx gen-pola.ts --check` (I used psiko-cat's local `node_modules/.bin/tsx`; `npx tsx` from another dir may download it). Write samples with `--seed N --start-id N --out DIR`. Uses Node stdlib only.
- State: `Fig {outer, inner, outerSolid, rot, sat(0..7), count}`; the matrix family uses `Set<Prim>` over 9 primitives. Rendering uses `<defs>` masters (`o-*`/`i-*`) plus `<use transform="rotate()">`, the classes `.box/.solid/.outline`, viewBox 850×450 (matrix 850×530), and the same layout as `inject-spasial.js` (labels A–E; `pilihan` a–e). The SVG is self-contained, with no script and no external refs.
- Rotation is canonicalised modulo the shape's symmetry, both in the state key and in the rendered `rotate()`. Visually identical states therefore produce identical SVG strings, and the duplicate-option bug in repo q31 cannot happen.
- Families: `sequence-rotation`, `satellite-orbit`, `matrix-overlay` (OR / XOR), `analogy` (3–4 of the layers swap / invert / rotate / satellite / count).
- Asserted for every item (300 seeds × 4 families in `--check`):
  1. The 5 options have distinct state keys and distinct SVG strings.
  2. Each distractor differs from the answer in exactly 1 layer.
  3. Uniqueness: every alternative rule in a brute-forced grid that reproduces the visible stimulus predicts the same answer (analogy: 2×2×8×8×4 transforms; matrix: 7 operators). For analogies, the rotation is pinned exactly: lcm(symmetry of A's shapes) must be divisible by the symmetry of each of C's shapes.
  4. Every active layer is observable in the stimulus, and every omission yields a distinct option.
  5. SVG sanity, the 2-paragraph rule (paragraph 2 names all 5 letters), determinism, and the answer letter covers a–e.
- Mutation test: making one distractor break 2 layers makes `--check` fail with an AssertionError.
- Legibility fixes made after looking at the renders: hexagon/45° steps were dropped (they rotate "invisibly"), the analogy θ was limited to 90/180/270, inner radius < outer inradius (no poke-through), and solid/outline are always complementary (no solid-in-solid).
- Outputs: `analysis/sample-pola.json` (ids 901–904, seed 3), `analysis/preview-pola.html`, `analysis/pola-svg/*.svg` plus `.png` renders (checked visually).

### Limits
- Only regular polygons, rhombus and circle. There are no reflections (mirror) and no "find the rotated copy" items. Bintara 96–98 need asymmetric free-form figures and a reflection layer.
- No position-walk (d), Latin-square, subtraction or nesting-cycle (Paket #32) families yet.
- The pembahasan is template-generated Indonesian. It is correct but formulaic; a human should do a style pass.
- The uniqueness check covers the generator's own rule space, not every rule a creative student might invent.

## 5. What a Codex CLI task needs to scale this
1. A spec per new family: the state fields, the rule f(state), an alternative-rule grid for the uniqueness brute force, and an ordered list of distractor candidates (one layer each). Add it to `FAMILIES`, and keep the `assemble()` invariants untouched.
2. Acceptance: `--check` must pass at 300 seeds per family; then render PNGs with `qlmanage -t -s 1000` and inspect them. Codex cannot view images, so a human or Claude must do the visual pass, or Codex must at least add bounding-box assertions (dots inside the box; inner shape inside the outer inradius).
3. Batch mode: loop seeds and write N items per family to a JSON file. A separate, reviewed step merges them into soal.json with fresh ids. Never write to soal.json directly, never commit (Codex sandbox constraint), and never use the network.
4. Suggested next families: position walk, Latin square (attribute × attribute), subtraction matrix, nesting-cycle, and a mirror/rotation odd-one-out (needs reflection in the state model plus a chirality-based key).
