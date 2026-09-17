# Graded photo set

Regenerate with `python images/graded/grade.py` (Pillow + numpy). Sources
in `images/` are never modified; `interior-original.jpg`,
`coffee-original.jpg` and `pastries-original.jpg` are untouched copies.

## The grade: "Golden Hour Trattoria"

One look across the set, tuned to sit beside the untouched hero
`images/exterior.jpg` (sunny, saturated blue, warm light):

- slight warm white balance (R x1.025, B x0.965)
- gentle film S-curve (28% toward smoothstep) with a 1% black lift, so
  shadows stay open and nothing is crushed
- split tone: faint teal in the shadows, gold in the highlights
- vibrance +22% (weak colours pushed more than already-rich ones),
  saturation +3%
- 11% soft vignette, unsharp mask after resize
- no perspective or rotation correction was needed: verticals in both
  real photos were already upright

Outputs are JPEG, under 350,000 bytes, long side 1600 max. Crops from a
1200 px source are kept at native pixels (never upscaled), so use them at
or below the sizes listed.

| Output | Source | Real or stock | Crop (source px) | Grade |
|---|---|---|---|---|
| `interior.jpg` 853x870 | `images/interior.jpg` | Real Cafe Roma interior | (275,30)-(1128,900): removes the bin and bin bag bottom-left and a stranger's arm at the right edge | base |
| `interior-mirrors.jpg` 620x510 | `images/interior.jpg` | Real | (285,60)-(905,570): teal wall, arched gold mirrors, cornice, pendants | base |
| `interior-counter.jpg` 457x465 | `images/interior.jpg` | Real | (655,280)-(1112,745): counter, flowers, blackboard menu; arm cropped out | base |
| `interior-lights.jpg` 580x310 | `images/interior.jpg` | Real | (620,40)-(1200,350): pendant bulbs and autumn garland | base, vignette 14% |
| `coffee.jpg` 1200x900 | `images/coffee.jpg` | Stock, already live on the site | none | base, a touch warmer, vignette 16%, contrast 24% |
| `pastries.jpg` 1200x900 | `images/pastries.jpg` | Stock, already live on the site | none | base, warmth and split tone eased, vignette 5% so the white background stays white, gamma 1.03 |
| `exterior-front.jpg` 1300x1269 | `images/google/owner/exterior-1.jpg` | Real, owner-uploaded, approved | (350,40)-(2160,1807): blue frontage, lemon trees, pavement tables; neighbours' signage dropped | base, vibrance 18%, vignette 9%; 1300 px with a 0.6 px pre-blur is the largest that fits 350 KB at q78 (dense foliage and shadow detail) |

Not used, on purpose: `images/google/customer/*` (no permission),
`images/google/owner/food-*.jpg` and `coffee-1.jpg` (agency stock, unknown
licence). `images/exterior.jpg` stays as the hero, ungraded.
