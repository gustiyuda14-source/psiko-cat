# Susun Potongan Gambar: findings

## 1. Sources scanned

| Source | Item | Pieces | Cut style | Published key |
|---|---|---|---|---|
| p100-08 (1_5015…pdf p8) | 29 bat | 4 | uneven vertical slices of a solid silhouette, gaps between them, no frames | a `2-4-3-1` |
| p100-08 | 30 fork+spoon in ring | 4 | curved/tilted slices of an icon (arcs of the ring) | c `3-2-1-4` |
| p100-10 | 34 sailing ship | 6 | uneven vertical slices of a silhouette, some pieces tiny (5, 3) | d `5-2-4-1-6-3` |
| p100-10 | 37 witch on broom | 5 | uneven vertical slices of a silhouette | b `3-1-5-2-4` |
| kd-11 (SOAL KECERMATAN p11) item 22 = akp-25 item 100 | portrait | 6 | equal framed vertical strips, line art | none published |
| akp-24 item 98 | cake + piping bag | 5 | equal framed vertical strips | none published |
| akp-25 item 99 | cup + teapot | 5 | equal framed vertical strips | none published |

There are no susun items in bin-25…29 or akp-23 (those are syllogisms, scheduling logic, symbol analogies and matrices). p100-07 and p100-09 are matrix items. The task brief says akp-25 holds item 98 (cake). In fact akp-25 holds items 99 (teapot) and 100 (portrait); the cake is item 98 on akp-24.

## 2. Key verification

**Convention:** the answer lists the piece labels in the left-to-right order in which the pieces appear in the finished picture. Labels 1..n are the positions of the pieces as they are displayed, already shuffled.

**Method:** I cut each piece out of the page render (or from the PDF's embedded image for the p100 items) and pasted them side by side in the order each candidate option gives (`scratchpad/crops/re_*.png`). For the framed strips I also scored each pair of strips by how well one strip's right-edge pixels match the other's left-edge pixels (`scratchpad/edges2.py`).

| Item | Result |
|---|---|
| 29 bat | Key **a 2-4-3-1 is correct.** It is the only option with both visible joins: the white notches at the 2/4 cut form the eye/ear area, and the 3/1 cut joins the wing body. |
| 30 fork/spoon | Key **c 3-2-1-4 is correct.** The ring arcs run 3 (left arc) → 2 (fork + bottom arc) → 1 (spoon + top arc) → 4 (right arc). Option a 3-2-4-1 is a swap of the last two pieces. These pieces are curved, not vertical strips, so the picture can't be rebuilt by placing them side by side. I checked this one by eye only. |
| 34 ship | Key **d 5-2-4-1-6-3 is correct.** The rebuilt ship is coherent. Option a (5-2-1-4-6-3) shows a doubled hull. **Option e `2-4-1-6-2-5` is malformed:** piece 2 appears twice and piece 3 is missing. |
| 37 witch | Key **b 3-1-5-2-4 is correct.** Broom bristles (3) → stick (1) → hair (5) → hat and face (2) → broom handle tip (4). |
| portrait (kd22 / akp100) | No key published. **Correct answer is D `1-5-2-4-3-6`.** The rebuilt face and hair are coherent, and D is the clear best edge match (161 against ≥ 268 for every other option). **Option A `1-2-5-2-4-6` is malformed** (2 twice, 3 missing). |
| cake (akp98) | No key published. **Correct answer is E `2-1-3-5-4`.** Nozzle → bag → bag tip on the cake → frosting → right side of the cake; the rebuilt picture is coherent. |
| teapot (akp99) | No key published. **Correct answer is C `5-2-4-3-1`** (cup with spoon on a saucer, teapot behind it with its handle on the right). The edge-match score alone wrongly preferred D, so I confirmed C by rebuilding the picture. Lesson: blank-to-blank edges match well by pixels, so a visual check is still needed. |

**Problem in the repo** (`psiko-cat/soal.json`, id 29, tipe susun_gambar): four triangles from a square cut along both diagonals, key c `1-2-3-4`, justified as "clockwise". This is not a left-to-right sequence. The pieces are already drawn in their final orientation, so every option lists the same square, and **d `4-3-2-1` (counter-clockwise) is just as valid.** The item is ambiguous and should be replaced or redesigned. Nothing in the repo was changed.

## 3. Construction rules (reverse-engineered)

**Cut styles**
- **A. Framed equal strips** (AKPOL/KD style): a line drawing cut into n equal vertical strips, each framed and labelled 1..n under it. The strips keep their original size, are not rotated, and keep their vertical alignment.
- **B. Silhouette slices** (p100 style): a solid black silhouette cut vertically at uneven x positions. There are no frames, pieces are spaced apart, and a slice can be tiny (ship pieces 3 and 5). The cut edges are straight vertical lines, but the outline inside a slice is irregular (wings, sails).
- **C. Curved/tilted slices** (item 30): an icon cut along slanted or curved lines. Again no rotation, only a horizontal shift.
- **No piece is ever rotated or flipped** in any source. The vertical position is always kept, so the horizon/baseline stays aligned and only the horizontal order is scrambled.

**Piece count:** 4–6 (4 four times, 5 three times, 6 three times).

**Shuffle:** the first and last pieces sometimes stay in place (portrait: 1 and 6 fixed), which makes the item easier. Otherwise the shuffle looks random.

**Distractors seen in the sources** (key → distractor):
- One adjacent swap (near miss): ship 5-2-4-1 → 5-2-1-4; cake E → C; portrait D → B; q29 2-4-3-1 → 2-4-1-3.
- Swap the two end pieces: q30 3-2-1-4 → 4-2-1-3; q37 3-1-5-2-4 → 4-1-5-2-3.
- Cyclic shift, which keeps n−2 joins correct: q37 → 1-5-2-4-3.
- The "lazy" option: identity 1-2-…-n (portrait C) or its reverse (teapot E).
- Moving one piece to a new position: teapot C 5-2-4-3-1 → D 5-1-2-4-3.
- Distractors often share the key's first piece, so the student can't answer from the first piece alone.
- **Defect pattern:** 2 of the 7 items have a non-permutation option (a repeated piece). The generator asserts this never happens.

**How a student should solve it**
1. Find the edge pieces. The leftmost piece's left edge and the rightmost piece's right edge show the outside of the picture (empty background or a natural outline, not a cut).
2. Find the anchor piece: the one holding the most distinctive feature (face, eye, lid knob, house). Rebuild its two neighbours first.
3. Check that edges continue. Every line or mass that touches a cut edge must continue at the same height on the next piece: horizon/ground line, saucer, cake base, hull, broom stick.
4. Check the baseline. Ground lines and saucer bottoms must line up across all pieces.
5. Eliminate options. Look for the first join an option gets wrong. A wrong first or last piece usually rules out two or three options at once.

**Difficulty levers** (easy → hard)
- Piece count, 4 → 6.
- Few, strong cues (one bold curve) → many weak cues (fine line art, hair).
- How many blank edges: strips that are mostly empty (portrait 1 and 6, cake 2) give no edge information.
- Fixed ends (easy) → full derangement (hard).
- Equal framed strips → uneven unframed slices → curved cuts.
- How strong the distractors are: lazy identity (weak) → one adjacent swap or cyclic shift (strong).

## 4. Generator: `gen-susun.ts`

Run: `node_modules/.bin/tsx gen-susun.ts --seed 42 --count 3 --start-id 1001 --out sample-susun.json --preview preview-susun.html [--svgdir dir]` and `… --check`. I ran the repo's local `tsx` binary directly because `npx tsx` from the scratchpad would look for the package outside the repo. It needs no dependencies.

**Picture:** a procedural black-and-white scene, 480×260. Every strip boundary sits on a knot of a Catmull-Rom ridge line (the hill line). All n+1 knot heights are chosen at least 16px apart, so each cut has its own height. The ridge, filled with grey below it, crosses every strip. On top of it:
- a house and a tree, each straddling a different internal boundary (anchor features);
- a sun and two birds.

The house's base sits under the ridge across its whole footprint, so it doesn't float.

**Cutting:**
- One `<clipPath>` rect (the strip width) and one `<g id=…-scene>` live in `<defs>`.
- Each displayed strip is `<g clip-path><use href="#scene" x="-k*sw"/></g>`, plus a `.box` frame and a `.text-label` number under it.
- CSS classes follow the RULES doc: `.box`, `.solid`, `.ridge`/`.line` (outline style), `.text-label`.
- The output is one pure SVG with a `viewBox`, no scripts and no external references.
- **All ids are prefixed `sg<id>-`.** This matters: the pembahasan page puts many SVGs into one HTML document through `dangerouslySetInnerHTML`, and unprefixed ids like `clip` from different items would collide.

**Shuffle:** seeded mulberry32. The shuffle can't be the identity or the reverse, and at most one piece may stay in its own position.

**Options:** the key plus four distinct distractors, built from the patterns above: one adjacent swap, a cyclic shift, swapping the end pieces, and identity or reverse. If any of those coincide, it falls back to another adjacent swap, then a random permutation. The five options are shuffled, so the correct letter is random.

**Pembahasan** (two paragraphs separated by `<br>`, the same as soal.json):
- Paragraph 1 states the ridge-continuity rule, names the anchor joins (which pieces the house and tree are split across), and gives the order.
- Paragraph 2 eliminates each wrong option by naming its first broken join. Any permutation other than the key has at least one, because the chain is unique.

**`--check`** (500 seeds, all pass) asserts:
- the options are labelled a–e, are all distinct, and each is a valid permutation of 1..n;
- exactly one option equals the true order, and `kunci` points to it;
- the answer maps back to the original strip order;
- **uniqueness:** an edge-match graph (right edge of i joins left edge of j when their heights differ by less than 16px) contains exactly the true chain and no other edge;
- the spline passes through its knots;
- SVG: tags are balanced, a `viewBox` is present, there is no `<script>`, `on*=`, `javascript:` or external `href`/`url()`, and every `#ref` points to an id that exists;
- the pembahasan has two paragraphs, names the correct option and eliminates 4 options;
- the same seed always gives the same output;
- three negative tests confirm the SVG checker catches bad input.

**Visual check:** the preview's "disusun sesuai kunci" picture is rebuilt *from the published key's labels*, so a wrong key would show up as a scrambled picture. I rendered it with qlmanage (`analysis/png/contact.png`). All three samples rebuild cleanly.

## 5. Known limits
- There is one scene template (hills, house, tree, sun, birds). The variety is in the ridge shape, piece count, object positions and pine vs. round tree. It is easy to tell these apart from the real items' pictures; more templates (ship on waves, city skyline, a road with a car) would be the next step.
- The house straddling a boundary covers the ridge at that cut. That join is then identified by the two house halves, which is unique because there is only one house. The automated uniqueness check is based on ridge heights only, so it is valid mathematically, but at that one join the visual cue is the house rather than the line.
- Only framed equal strips (style A) are generated. Uneven unframed slices (style B) are a small change: random cut x positions with a minimum width, plus a `--frameless` flag. Curved cuts (style C) need clipPath paths shared by neighbouring pieces. Both are left out for now.
- Every item uses the 16px minimum gap. A difficulty setting could lower it to about 8px, or add a second, weaker line instead of the ridge.
- The tag-balance check is not a full XML parse. Attribute values containing `>` would confuse it, but the generator never writes them.
- I haven't rendered the items inside the actual app. qlmanage (WebKit) shows that `<use>` and `clipPath` work. The app inserts the SVG inline, which supports both.

## 6. What a Codex CLI image-generation task would need to make realistic variants
1. **Image spec per item:**
   - an original monochrome line-art or silhouette subject (no copyrighted or real-person likeness), 4:3 or 16:9, a plain white background;
   - **at least one continuous structure crossing the full width** (horizon, table edge, road, hull), plus one or two distinctive anchor objects placed across the planned cut positions;
   - no text in the image.
2. **Deterministic cutting downstream, not by the model:** the generator takes the raster (PNG/WebP), cuts it into strips with the same clipPath/`<use>` technique (an embedded `data:` image inside `<defs>`), and keeps every option, key and pembahasan step from `gen-susun.ts`.
3. **Automated uniqueness gate for rasters:**
   - match left/right edge pixel columns (as `edges2.py` does): the true chain must have a clearly lower total than every other permutation by a margin (for example 20%);
   - reject images where any cut edge is almost blank, since blank-to-blank joins fooled the metric on the teapot;
   - still review each item by eye with a rebuilt-from-key preview.
4. **Budget and size:** keep each image ≤ 60–100 KB (soal.json inlines the SVG; data URIs count toward page weight). Use 1-bit or greyscale PNG, about 600px wide.
5. **Provenance:** keep the prompt and seed per item so it can be regenerated. Never put source-PDF pictures into the prompt as image input; describe the scene in text only.
