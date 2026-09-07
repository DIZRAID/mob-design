# 11 — Figma

The design tool holds a *representation* of the system. `css/tokens.css` holds the system.

Everything in this document exists to keep those two from drifting. Drift is not a cosmetic problem
here: this system's identity lives in values a human eye cannot audit — a 9.5px label with 0.7px
tracking, a #17191d hairline against a #1c1e22 frame, a 15px/16px asymmetric card pad. Nobody
catches a 1px or a two-notch grey error in review. They only catch it six months later, as "the
product feels slightly off", which is unfixable because by then there are forty offences.

So: one source of truth, one mechanical mapping, and a checklist that runs before every publish.

---

## 1. Library file structure

Six pages. The order is a dependency order — a page may only consume things defined on a page above
it. That is the whole reason for the numbering.

```text
00 Cover
01 Foundations
02 Components
03 Patterns
04 Templates
05 Screens
```

| Page | Contains | Published? |
|---|---|---|
| **00 Cover** | Library name, version, owner, the `tokens.css` commit this file was last synced against, changelog, and one sentence: *Dark is canonical; Light is derived and uncalibrated.* | n/a |
| **01 Foundations** | Every value, drawn once, labelled with its CSS token name. Sections below. | ✓ styles + variables |
| **02 Components** | One component set per file in `css/components/`, per the import order in `css/mob.css` — `Button`, `Field`, `Choice`, `Chip`, `Card`, `Stat`, `Table`, `Nav`, `Overlay`, `Feedback`, `Data`. Nothing composite. | ✓ |
| **03 Patterns** | Recurring compositions of two or more components: page header, hero, data panel, segmented row, filter bar, form, and the empty/loading/error trio. | ✓ |
| **04 Templates** | Whole-page skeletons with placeholder content: app shell, marketing page, detail page, settings. Geometry only — `--mob-container-app` 1460, `--mob-rail-width` 288, `--mob-gutter-desktop` 26, the 34px `--mob-header-row-h` both columns open with. | ✗ |
| **05 Screens** | Real copy, real numbers, at real widths (1440 / 768 / 375). The only page where a one-off may appear — and it must leave as either a component change or a bug. | ✗ |

**01 Foundations** carries these boards, in this order:

1. **Colour** — the neutral ramp, violet, status hues, muted action tones, the eight series colours
   with their tint/glyph pairs, and the alpha ladder. Every swatch is annotated with its CSS token
   name and its `[src]` / `[drv]` marker. The ramp is printed as one continuous strip so the density
   between 1000 and 700 is visible as a design decision rather than looking like an accident.
2. **Typography** — all 22 type roles at real size, each labelled with its `base.css` class and its
   Figma text style name (§7). Set two specimens: one of numbers (to show tabular alignment), one of
   a heading over body copy (to show the mono/sans split doing its job).
3. **Spacing** — the scale as a ruler, then a density comparison: the same card drawn three times
   under Marketing / Product / Data modes, side by side. That board is the argument for the modes.
4. **Radius** — paired with control height, not shown alone. `SM 8 / 30px`, `MD 9 / 34px`,
   `LG 10 / 40px`. The point of the 8/9/10 triple is invisible unless you show the heights next to it.
5. **Borders** — the five steps in a column, each with its one job written next to it: subtle =
   divider inside one surface, frame = seam between fused segments, default = card boundary,
   control = chip/input/ghost, strong = selected. A designer who cannot name the job picks by eye.
6. **Elevation & focus** — the three effect styles, the three glows, the focus ring specimen. With
   the policy stated on the board: *depth is surface + 1px border; shadows are for floating layers
   only.*
7. **Motion** — the five durations as labelled bars, the three easing curves drawn, and the
   `--mob-press-scale` .985 shown as before/after. Plus the rule: transform and opacity only.
8. **Iconography** — the 16px (`--mob-control-icon`) and 20px (`--mob-control-icon-lg`) frames, one
   family, stroke weight fixed.

---

## 2. Variable collections

Six collections:

```text
Primitive / Color      1 mode
Semantic / Color       2 modes   Dark · Light
Spacing                3 modes   Marketing · Product · Data
Radius                 1 mode
Typography             1 mode
Motion                 1 mode
```

### 2.1 Why colour and spacing are separate collections

Because **modes are a per-collection axis**, and this system has two independent axes: theme
(dark/light) and density (marketing/product/data). They do not interact — the density zones move
rhythm and card padding only, never colour; the themes move colour only, never rhythm.

Put them in one collection and you must enumerate the product: `Dark · Marketing`, `Dark · Product`,
`Dark · Data`, `Light · Marketing`… six modes describing four facts. Add a breakpoint axis and it is
twelve. Keeping them apart means a marketing hero inside a dark app is one mode set on one frame and
one mode set on another, and neither knows the other exists.

> Mode counts are plan-limited in Figma. If you only get four modes per collection, spend Spacing's
> on the three density zones and set mobile rhythm by hand (§3.3); do not sacrifice a density zone.

### 2.2 Naming convention

| Rule | Why |
|---|---|
| Drop the `mob-` prefix inside Figma. | The collection name is the namespace. `Semantic/Color · Background/Canvas` is already unambiguous; `Mob Background/Canvas` is noise in every layer name. |
| Group with `/`, Title Case each segment. | `Background/Surface Raised`, not `bg-surface-raised`. Figma renders `/` as a folder; a designer scans folders, not kebab-case. |
| Keep numeric ramp members **verbatim** from the CSS. | `Gray/975`, `Gray/880`, `Gray/870`. Do not renumber to a tidy 100-step scale. The ramp is deliberately uneven and every rename breaks the CSS↔Figma lookup. |
| Size suffixes use the CSS suffix, upper-cased: `SM` `MD` `LG` `XL`. | A designer reading `Size = MD` and an engineer reading `--mob-control-h-md` must land on the same row without translating. |
| A variable is named for its **job**, never its value. | `Border/Frame`, not `Border/1C1E22`. When the value changes, a value-named token becomes a lie. |
| No abbreviations except the size suffixes. | `Background`, not `Bg`. Typing cost is paid once; reading cost is paid forever. |

### 2.3 The aliasing chain

Three tiers, one direction, exactly mirroring `tokens.css`:

```text
Primitive / Color · Gray/925          #101114        raw value, never used on a layer
        ↓  alias
Semantic / Color · Background/Surface                the only tier a designer picks from
        ↓  alias
Semantic / Color · Component/Card/Background         what the Card component's fill is bound to
```

The CSS says the same thing:

```css
--mob-gray-925: #101114;                 /* tier 1 — primitive  */
--mob-bg-surface: var(--mob-gray-925);   /* tier 2 — semantic   */
--mob-card-bg:   var(--mob-bg-surface);  /* tier 3 — component  */
```

Rules that make the chain worth having:

- **A layer fill is never a primitive.** If a designer can select `Gray/925` from the fill picker,
  they will, and the retheme breaks. Hide the primitive collection from the picker where the plan
  allows; where it does not, catch it in the publish checklist (§13).
- **A layer fill is never a raw hex.** Figma's *Selection colors* panel on a whole page should list
  variables and nothing else. One hex is one drift.
- **Component tokens exist only where the CSS has one.** Do not create `Component/Button/Background`
  because it feels symmetrical; the button reads `--mob-accent` directly. An extra indirection in
  Figma that the CSS does not have is a place for the two to disagree.

### 2.4 Primitive / Color — what to build

| Group | Members (verbatim from `tokens.css` tier 1) |
|---|---|
| `Gray/` | 1000, 975, 950, 925, 900, 880, 870, 850, 825, 800, 780, 760, 750, 720, 680, 560, 500, 440, 400, 300, 200, 100, 050, 000 |
| `Violet/` | 950, 900, 700, 600, 550, 500, 450, 400, 300 |
| `Green/` `Red/` `Amber/` `Blue/` | 400, 300, 950 each |
| `Series/` | 1–8, plus `Series/1 Tint` … `Series/8 Tint` and `Series/1 Glyph` … `Series/8 Glyph` |
| `Alpha/White/` | 04, 06, 08, 12, 16, 24, 40, 64, 80 |
| `Alpha/Black/` | 24, 40, 64, 80 |

The muted action tones (`--mob-affirm-*`, `--mob-destroy-*`) are declared in tier 1 in the CSS but
**redeclared per theme**, so in Figma they belong in `Semantic/Color` where the modes live (§4.6).
This is the one place the Figma structure deliberately differs from the CSS file layout; it is noted
here so nobody "fixes" it.

---

## 3. Modes

### 3.1 Dark canonical, Light opt-in

Dark is not the default because dark is fashionable. It is the default because it is the only mode
that was **measured**. Every dark value carries `[src]` provenance from a real calibrated surface;
the entire light mode is `[drv]` — a faithful role inversion, done by rule, never validated against
a screen.

Consequences for the library:

- The `Dark` mode is the **first** mode on `Semantic/Color`, so it is what a new frame inherits.
- Every component is drawn, reviewed and signed off in Dark. Light is checked, not designed.
- A component may not ship with a Light-only affordance. If something is only legible in Light, the
  component is wrong, not the theme.
- Two known Light gaps, carried honestly rather than papered over:
  - `--mob-series-1…8` are **not** re-tuned for Light. `Series/4` (#fbbf24) on white fails contrast
    for a 1px line. Charts on a light surface need their own pass before you ship one.
  - `--mob-scrim` is not redefined for Light, so it stays 64% black while `--mob-bg-overlay` drops
    to 48%. Pick one before shipping Light and fix it in `tokens.css` first.
- Composite values built with `var()` — `--mob-focus-ring`, `--mob-glow-positive`,
  `--mob-glow-negative`, `--mob-selection-bg` — re-resolve per theme automatically. In Figma this
  maps to **one** effect style whose colour is bound to a variable (§8). Do not build two.

### 3.2 Density zones are modes, not components

There is exactly one Card component. A marketing card and a data-grid card are the same component
with a different mode set on their parent frame.

```text
Spacing collection
  modes:  Marketing        Product (default)      Data
```

| Figma variable | `tokens.css` | Marketing | Product | Data |
|---|---|---:|---:|---:|
| `Rhythm/Section` | `--mob-section-gap` | 128 | 64 | 32 |
| `Rhythm/Stack` | `--mob-stack-gap` | 24 | 14 | 8 |
| `Rhythm/Grid` | `--mob-grid-gap` | 32 | 20 | 12 |
| `Component/Card/Pad Y` | `--mob-card-pad-y` | 24 | 15 | 10 |
| `Component/Card/Pad X` | `--mob-card-pad-x` | 24 | 16 | 12 |

Everything else in the collection is **identical in all three columns**, and that is the point:
control heights 30/34/40, control padding 10/15/18, `Component/Control/Gap` 6, every radius, every
icon size. Three identical mode columns next to five that differ is the rule made visible — *rhythm
moves, geometry never does.* An M button is the same button in a hero and in a table row.

If someone proposes a fourth zone, the question to ask is: does it move rhythm only? If it also
wants a shorter button, it is not a density zone, it is a second design system.

### 3.3 Mobile

`tokens.css` also overrides rhythm below 768px:

```css
@media (max-width: 767px) {
  :root { --mob-section-gap: 40px; --mob-card-pad-y: 14px; --mob-card-pad-x: 14px; }
  [data-mob-density='marketing'] { --mob-section-gap: 80px; }
}
```

That is a second axis on the same collection, which Figma cannot express. Two options, in order of
preference:

1. Add three more modes — `Marketing · Mobile`, `Product · Mobile`, `Data · Mobile` — flattening the
   product into six columns. Costs mode budget, costs no component duplication.
2. On plans capped at four modes: keep the three zones, and set the mobile rhythm by hand on the
   375px frames in **05 Screens**, with the override values written on the frame. Annotate it; an
   unlabelled hand-set 14px is indistinguishable from a mistake.

---

## 4. Semantic / Color — the complete mapping

Build the collection directly from these tables. **Dark** is the alias column: bind the Dark mode
value to that primitive, never to a hex. **Light** is a literal, because `tokens.css` declares light
mode as literals; if you want light primitives, add them to `tokens.css` first (§13).

### 4.1 Background

| `tokens.css` | Figma variable | Dark (alias) | Light (literal) |
|---|---|---|---|
| `--mob-bg-canvas` | `Background/Canvas` | `Gray/975` | `#f7f8fa` |
| `--mob-bg-sunken` | `Background/Sunken` | `Gray/950` | `#eef0f4` |
| `--mob-bg-surface` | `Background/Surface` | `Gray/925` | `#ffffff` |
| `--mob-bg-surface-raised` | `Background/Surface Raised` | `Gray/900` | `#f4f5f7` |
| `--mob-bg-tile` | `Background/Tile` | `Gray/870` | `#f0f1f4` |
| `--mob-bg-hover` | `Background/Hover` | `Gray/850` | `#eceef2` |
| `--mob-bg-active` | `Background/Active` | `Gray/880` | `#e4e7ec` |
| `--mob-bg-selected` | `Background/Selected` | `Gray/880` | `#e9e5ff` |
| `--mob-bg-frame` | `Background/Frame` | `Gray/800` | `#e3e5ea` |
| `--mob-bg-overlay` | `Background/Overlay` | `Alpha/Black/64` | `rgba(16,17,20,.48)` |
| `--mob-bg-elevated` | `Background/Elevated` | `Gray/900` | `#ffffff` |
| `--mob-bg-disabled` | `Background/Disabled` | `Gray/900` | `#f0f1f4` |

Four elevation steps — canvas, sunken, surface, raised — plus tile. A fifth background is a smell;
if a board needs one, the layout is doing with colour what it should do with a border.

### 4.2 Text

| `tokens.css` | Figma variable | Dark (alias) | Light (literal) |
|---|---|---|---|
| `--mob-fg-primary` | `Text/Primary` | `Gray/100` | `#14161a` |
| `--mob-fg-secondary` | `Text/Secondary` | `Gray/200` | `#34383f` |
| `--mob-fg-muted-hi` | `Text/Muted High` | `Gray/400` | `#565c66` |
| `--mob-fg-muted` | `Text/Muted` | `Gray/440` | `#646a74` |
| `--mob-fg-label` | `Text/Label` | `Gray/500` | `#767c86` |
| `--mob-fg-dim` | `Text/Dim` | `Gray/560` | `#949aa4` |
| `--mob-fg-disabled` | `Text/Disabled` | `Gray/560` | `#a9aeb7` |
| `--mob-fg-inverse` | `Text/Inverse` | `Gray/975` | `#ffffff` |
| `--mob-fg-on-accent` | `Text/On Accent` | `Gray/000` | `#ffffff` |
| `--mob-fg-link` | `Text/Link` | `Violet/400` | `#6339e0` |
| `--mob-fg-link-hover` | `Text/Link Hover` | `Violet/300` | `#4f27c9` |

`Text/Muted High` is not a typo for a level between primary and muted — it is muted text raised onto
a *lighter surface* (a chip), where `Text/Muted` would lose contrast. Pick it by surface, not by
importance.

### 4.3 Border

| `tokens.css` | Figma variable | Job | Dark (alias) | Light (literal) |
|---|---|---|---|---|
| `--mob-border-subtle` | `Border/Subtle` | divider inside one surface | `Gray/825` | `#eef0f3` |
| `--mob-border-frame` | `Border/Frame` | seam between fused segments | `Gray/800` | `#e3e5ea` |
| `--mob-border-default` | `Border/Default` | boundary of a card or panel | `Gray/780` | `#dcdfe5` |
| `--mob-border-control` | `Border/Control` | chips, inputs, ghost controls | `Gray/760` | `#cdd1d9` |
| `--mob-border-strong` | `Border/Strong` | selected / emphasised | `Gray/720` | `#b3b9c3` |
| `--mob-border-hover` | `Border/Hover` | strong border on hover | `Gray/680` | `#9aa1ac` |
| `--mob-border-dashed` | `Border/Dashed` | empty-state panel | `Gray/750` | `#cdd1d9` |

`Border/Frame` and `Background/Frame` are the same primitive on purpose: the frame colour is used as
a *fill* under 1px gaps far more often than it is used as a stroke (§10.2). Keep both variables —
one names a fill, one names a stroke, and a layer bound to the wrong one is a bug you want to be
able to see.

### 4.4 Accent

| `tokens.css` | Figma variable | Dark (alias) | Light (literal) |
|---|---|---|---|
| `--mob-accent` | `Accent/Base` | `Violet/500` | `#6339e0` |
| `--mob-accent-hover` | `Accent/Hover` | `Violet/450` | `#7248ef` |
| `--mob-accent-pressed` | `Accent/Pressed` | `Violet/550` | `#522ec2` |
| `--mob-accent-deep` | `Accent/Deep` | `Violet/700` | `#4a27b8` |
| `--mob-accent-bright` | `Accent/Bright` | `Violet/300` | `#7c5dfa` |
| `--mob-accent-soft` | `Accent/Soft` | `Violet/600` | `#6d4df0` |
| `--mob-accent-tint` | `Accent/Tint` | `Violet/950` | `#f0ecff` |
| `--mob-accent-tint-strong` | `Accent/Tint Strong` | `Violet/900` | `#e2daff` |

Swap these eight and the product is rebranded. Nothing else in the library should reference the
violet primitives directly — that is what makes `brand.css` work, and it only keeps working if Figma
obeys the same discipline.

Accent is scarce by policy. On any given screen it should appear on the primary action, the focus
ring, and at most one data emphasis. If a board has more violet than that, count again.

### 4.5 Feedback

| `tokens.css` | Figma variable | Dark (alias) | Light (literal) |
|---|---|---|---|
| `--mob-positive` | `Feedback/Positive` | `Green/400` | `#067a55` |
| `--mob-positive-raised` | `Feedback/Positive Raised` | `Green/300` | `#0a9268` |
| `--mob-positive-tint` | `Feedback/Positive Tint` | `Green/950` | `#e4f7f0` |
| `--mob-negative` | `Feedback/Negative` | `Red/400` | `#c2352f` |
| `--mob-negative-raised` | `Feedback/Negative Raised` | `Red/300` | `#d94b45` |
| `--mob-negative-tint` | `Feedback/Negative Tint` | `Red/950` | `#fdecea` |
| `--mob-warning` | `Feedback/Warning` | `Amber/400` | `#9a6400` |
| `--mob-warning-raised` | `Feedback/Warning Raised` | `Amber/300` | `#b87a05` |
| `--mob-warning-tint` | `Feedback/Warning Tint` | `Amber/950` | `#fdf3e0` |
| `--mob-info` | `Feedback/Info` | `Blue/400` | `#1256b8` |
| `--mob-info-raised` | `Feedback/Info Raised` | `Blue/300` | `#1a68d8` |
| `--mob-info-tint` | `Feedback/Info Tint` | `Blue/950` | `#e8f0fd` |

Positive and negative are `[src]`; warning and info are `[drv]` from the same 400 tier so they belong
to the family. Annotate the Foundations swatches with those markers — a designer proposing a change
should know which two were measured.

### 4.6 Tone — muted action colours

Declared in tier 1 in the CSS, mode-varying, so they live here in Figma. These are the calibrated
triplets for actions that must read as *money in* or *danger* without the row glowing.

| `tokens.css` | Figma variable | Dark | Light |
|---|---|---|---|
| `--mob-affirm-fg` | `Tone/Affirm/Foreground` | `#7fbfa2` | `#14664a` |
| `--mob-affirm-bg` | `Tone/Affirm/Background` | `#111a16` | `#edf8f3` |
| `--mob-affirm-border` | `Tone/Affirm/Border` | `#22332b` | `#c2e3d4` |
| `--mob-affirm-fg-hover` | `Tone/Affirm/Foreground Hover` | `#96d4b6` | `#0d5039` |
| `--mob-affirm-bg-hover` | `Tone/Affirm/Background Hover` | `#16221c` | `#e0f2ea` |
| `--mob-affirm-border-hover` | `Tone/Affirm/Border Hover` | `#2c4438` | `#a5d5c0` |
| `--mob-destroy-fg` | `Tone/Destroy/Foreground` | `#c08b8b` | `#9c3b38` |
| `--mob-destroy-bg` | `Tone/Destroy/Background` | `#1a1315` | `#fdf0ef` |
| `--mob-destroy-border` | `Tone/Destroy/Border` | `#35262a` | `#f0cfcd` |
| `--mob-destroy-fg-hover` | `Tone/Destroy/Foreground Hover` | `#dc9d9d` | `#7f2b28` |
| `--mob-destroy-bg-hover` | `Tone/Destroy/Background Hover` | `#221a1c` | `#fbe5e3` |
| `--mob-destroy-border-hover` | `Tone/Destroy/Border Hover` | `#483035` | `#e6b8b5` |
| `--mob-warn-fg` … `--mob-warn-border-hover` | `Tone/Warn/*` | derived by `brand.css` | — |

The `Tone/Warn/*` set exists only when `brand.css` is loaded and is computed by recipe, not measured.
If your product uses it, add the six variables with the computed values and mark them `[drv]` on the
Foundations board. Do not hand-pick a warning triplet by eye — use the recipe in `brand.css`:
`fg = hue 62% + secondary`, `bg = hue 11% + canvas`, `border = hue 20% + frame`.

Do not brighten these at rest. Saturation is spent on hover, and only on hover — that restraint is
what lets a table hold twenty of them without becoming a Christmas tree.

### 4.7 Series

The categorical ramp for charts, composition bars and entity marks. `Series/1–3` are `[src]`;
`Series/4–8` are `[drv]`, hue-spaced on the same luminance tier so no series out-shouts another.

| `tokens.css` | Figma variable | Value (both modes) |
|---|---|---|
| `--mob-series-1` | `Series/1/Base` | `#4f7bd6` |
| `--mob-series-2` | `Series/2/Base` | `#2dd4bf` |
| `--mob-series-3` | `Series/3/Base` | `#6d4df0` |
| `--mob-series-4` | `Series/4/Base` | `#fbbf24` |
| `--mob-series-5` | `Series/5/Base` | `#f87171` |
| `--mob-series-6` | `Series/6/Base` | `#34d399` |
| `--mob-series-7` | `Series/7/Base` | `#f0a3d0` |
| `--mob-series-8` | `Series/8/Base` | `#8f959e` |

Tint / glyph pairs, for avatars and inline entity marks — these **do** vary by mode:

| Figma variable | Dark tint | Dark glyph | Light tint | Light glyph |
|---|---|---|---|---|
| `Series/1/Tint` · `Series/1/Glyph` | `#1b2c4a` | `#9db8e8` | `#dfe9fb` | `#24549f` |
| `Series/2/Tint` · `Series/2/Glyph` | `#12403c` | `#7fe6d5` | `#d5f4ef` | `#0d6a5e` |
| `Series/3/Tint` · `Series/3/Glyph` | `#211a3d` | `#c4b5fd` | `#e5dffb` | `#4a27b8` |
| `Series/4/Tint` · `Series/4/Glyph` | `#2b1f06` | `#fcd34d` | `#fbeed0` | `#8a5a00` |
| `Series/5/Tint` · `Series/5/Glyph` | `#2a1416` | `#fca5a5` | `#fbdedd` | `#a83430` |
| `Series/6/Tint` · `Series/6/Glyph` | `#0d2a20` | `#6ee7b7` | `#d6f2e6` | `#0a6a4b` |
| `Series/7/Tint` · `Series/7/Glyph` | `#33162a` | `#f5bde0` | `#fbe0f0` | `#a3357a` |
| `Series/8/Tint` · `Series/8/Glyph` | `#212429` | `#b4bac2` | `#e8eaee` | `#4d535c` |

Series colours are assigned by **stable identity**, not by chart order — the same entity keeps the
same series index everywhere in the product, or the colour stops meaning anything.

### 4.8 Focus, selection, scrim

| `tokens.css` | Figma | Dark | Light |
|---|---|---|---|
| `--mob-focus-color` | `Focus/Color` (variable, alias) | `Accent/Bright` | `Accent/Bright` |
| `--mob-focus-ring` | `Focus/Ring` (**effect style**, §8) | — | — |
| `--mob-focus-ring-inset` | `Focus/Ring Inset` (**effect style**) | — | — |
| `--mob-scrim` | `Scrim` | `Alpha/Black/64` | *not redefined in CSS — see §3.1* |
| `--mob-selection-bg` | `Selection/Background` | `Accent/Base` @ 32% | `Accent/Base` @ 22% |

`color-mix(in srgb, X 32%, transparent)` is exactly *X at 32% alpha* — set the Figma variable to the
accent with opacity 32, do not eyeball a blended hex.

---

## 5. Component-tier variables

Only build these where `tokens.css` has one. Colour-valued component tokens go in `Semantic/Color`
under a `Component/` group; size-valued ones go in `Spacing` (so they sit on the density axis, where
most of them are deliberately invariant) or `Radius`.

| `tokens.css` | Figma collection · variable | Value |
|---|---|---:|
| `--mob-control-h-sm` `-md` `-lg` | `Spacing · Component/Control/Height SM · MD · LG` | 30 · 34 · 40 |
| `--mob-control-px-sm` `-md` `-lg` | `Spacing · Component/Control/Pad X SM · MD · LG` | 10 · **15** · 18 |
| `--mob-control-gap` | `Spacing · Component/Control/Gap` | 6 |
| `--mob-control-icon` · `-lg` | `Spacing · Component/Control/Icon · Icon LG` | 16 · 20 |
| `--mob-tap-target` | `Spacing · Component/Control/Tap Target` | 44 |
| `--mob-card-bg` | `Semantic/Color · Component/Card/Background` | → `Background/Surface` |
| `--mob-card-border` | `Semantic/Color · Component/Card/Border` | → `Border/Default` |
| `--mob-card-radius` | `Radius · Component/Card/Radius` | → `Radius/XL` (12) |
| `--mob-card-pad-y` · `-x` | `Spacing · Component/Card/Pad Y · Pad X` | 15 · 16 *(Product mode)* |
| `--mob-card-pad-y-sm` · `-x-sm` | `Spacing · Component/Card/Pad Y SM · Pad X SM` | 12 · 13 |
| `--mob-card-pad-y-lg` · `-x-lg` | `Spacing · Component/Card/Pad Y LG · Pad X LG` | 20 · 24 |
| `--mob-card-gap` | `Spacing · Component/Card/Gap` | 14 |
| `--mob-chip-bg` | `Semantic/Color · Component/Chip/Background` | → `Background/Surface Raised` |
| `--mob-chip-border` | `Semantic/Color · Component/Chip/Border` | → `Border/Control` |
| `--mob-chip-fg` | `Semantic/Color · Component/Chip/Foreground` | → `Text/Muted High` |
| `--mob-chip-pad-y` · `-x` | `Spacing · Component/Chip/Pad Y · Pad X` | 3 · 8 |
| `--mob-chip-radius` | `Radius · Component/Chip/Radius` | → `Radius/XS` (6) |
| `--mob-field-bg` · `-hover` | `Semantic/Color · Component/Field/Background · Background Hover` | → `Background/Sunken` · `Background/Surface` |
| `--mob-field-border` · `-hover` | `Semantic/Color · Component/Field/Border · Border Hover` | → `Border/Control` · `Border/Strong` |
| `--mob-field-h` | `Spacing · Component/Field/Height` | → `Component/Control/Height LG` (40) |
| `--mob-field-px` | `Spacing · Component/Field/Pad X` | 12 |
| `--mob-field-radius` | `Radius · Component/Field/Radius` | → `Radius/MD` (9) |
| `--mob-textarea-min-h` | `Spacing · Component/Field/Textarea Min Height` | 108 |
| `--mob-avatar-sm` `-md` `-lg` | `Spacing · Component/Avatar/SM · MD · LG` | 20 · 24 · 28 |
| `--mob-avatar-overlap` | `Spacing · Component/Avatar/Overlap` | −9 |
| `--mob-bar-h` · `--mob-bar-gap` | `Spacing · Component/Bar/Height · Gap` | 5 · 2 |
| `--mob-bar-radius` | `Radius · Component/Bar/Radius` | → `Radius/2XS` (3) |
| `--mob-meter-h` `-bin-h` `-gap` | `Spacing · Component/Meter/Height · Bin Height · Gap` | 22 · 15 · 3 |
| `--mob-spark-h` · `--mob-spark-stroke` | `Spacing · Component/Spark/Height · Stroke` | 46 · 1.6 |
| `--mob-spark-fill-from` · `-to` | gradient stop opacities, **not variables** | .28 → .02 |
| `--mob-modal-w` | `Spacing · Component/Overlay/Modal Width` | 520 |
| `--mob-popover-w` | `Spacing · Component/Overlay/Popover Width` | 260 |
| `--mob-tooltip-max-w` | `Spacing · Component/Overlay/Tooltip Max Width` | 240 |
| `--mob-toast-w` | `Spacing · Component/Overlay/Toast Width` | 340 |
| `--mob-menu-max-h` | `Spacing · Component/Overlay/Menu Max Height` | 288 |

The `--mob-control-px-md` of **15px** is `[src]` — a measured value from a real primary button, not a
rounded 16. Do not tidy it. Same for the card's asymmetric 15/16 pad and the mini card's 12/13.
These off-scale values are why tier 3 exists: parking them in a token means every card in the product
reads the same number, so two cards can never drift a pixel apart.

---

## 6. Spacing, Radius, Typography, Motion

### 6.1 Spacing · `Scale/` group

`0 · 2 · 3 · 4 · 6 · 8 · 10 · 12 · 14 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96 · 128`, named
`Scale/0` … `Scale/128` from `--mob-space-0` … `--mob-space-128`. Identical in all three density
modes.

Layout constants, also in `Spacing`, under `Layout/`:

| `tokens.css` | Figma | Value |
|---|---|---:|
| `--mob-container-app` | `Layout/Container App` | 1460 |
| `--mob-container-content` | `Layout/Container Content` | 1280 |
| `--mob-gutter-desktop` · `-tablet` · `-mobile` | `Layout/Gutter Desktop · Tablet · Mobile` | 26 · 20 · 16 |
| `--mob-rail-width` | `Layout/Rail Width` | 288 |
| `--mob-header-row-h` | `Layout/Header Row Height` | 34 |

`--mob-container-prose` (68ch) has no Figma equivalent — `ch` depends on the rendered font. Set prose
columns by eye at 1440 and write the CSS value on the frame.

Breakpoints (`--mob-bp-*`) are not variables; they are the widths of the frames on **05 Screens**.
Z-index (`--mob-z-*`) is not a variable either; layer order *is* the z-index. Document the stacking
order on the Overlay board so a designer placing a toast over a modal knows which wins.

### 6.2 Radius

| `tokens.css` | Figma | Value | Pairs with |
|---|---|---:|---|
| `--mob-radius-2xs` | `Radius/2XS` | 3 | bars, bins, sparkline caps |
| `--mob-radius-xs` | `Radius/XS` | 6 | chips, badges |
| `--mob-radius-sm` | `Radius/SM` | 8 | control 30px |
| `--mob-radius-md` | `Radius/MD` | 9 | control 34px |
| `--mob-radius-lg` | `Radius/LG` | 10 | control 40px, inner tiles |
| `--mob-radius-xl` | `Radius/XL` | 12 | cards, panels, modals |
| `--mob-radius-2xl` | `Radius/2XL` | 16 | marketing surfaces `[drv]` |
| `--mob-radius-3xl` | `Radius/3XL` | 24 | hero media `[drv]` |
| `--mob-radius-full` | `Radius/Full` | 999 | avatars, pills |

The 8/9/10 triple is not indecision. Radius tracks control height so an S and an L button read as the
same family rather than as two different shapes. A designer who "simplifies" all three to 8 breaks
that relationship at the L size, where 8px on a 40px control reads visibly squarer.

### 6.3 Typography

Numbers bind to font size / line height / letter spacing; strings bind to family and weight.

| `tokens.css` | Figma | Value |
|---|---|---|
| `--mob-font-mono` | `Font/Family Mono` (string) | `IBM Plex Mono` |
| `--mob-font-sans` | `Font/Family Sans` (string) | the platform UI sans — see note |
| `--mob-weight-regular` · `-medium` · `-semibold` | `Font/Weight Regular · Medium · Semibold` | 400 · 500 · 600 |
| `--mob-size-3xs` … `--mob-size-12xl` | `Size/3XS` … `Size/12XL` | 9.5 · 10 · 10.5 · 11.5 · 12 · 12.5 · 13 · 14 · 14.5 · 16 · 18 · 22 · 23 · 27 · 32 · 40 · 48 · 64 · 80 |
| `--mob-leading-display` | `Leading/Display` | 100% |
| `--mob-leading-tight` | `Leading/Tight` | 115% |
| `--mob-leading-snug` | `Leading/Snug` | 130% |
| `--mob-leading-normal` | `Leading/Normal` | 145% |
| `--mob-leading-relaxed` | `Leading/Relaxed` | 160% |
| `--mob-leading-flat` | `Leading/Flat` | 100% |
| `--mob-tracking-label` | `Tracking/Label` | 0.7px |
| `--mob-tracking-tight` | `Tracking/Tight` | −2% |
| `--mob-tracking-normal` | `Tracking/Normal` | 0 |

Notes that matter:

- **Keep the decimals.** 9.5, 10.5, 11.5, 12.5, 14.5. Rounding them to 10/11/12/13/14 destroys the
  density the whole system is calibrated around. Every step below 16px is `[src]`.
- `Leading/Display` and `Leading/Flat` are both 100%. Keep both so the CSS names round-trip; they
  mean different things (a display line box vs. a single-line control label).
- `--mob-font-sans` resolves to a *stack*, and the first entry differs per OS. Pick one concrete face
  for the library — the one your primary platform resolves to — and note the substitution on the
  Typography board. A Figma file cannot express a font stack; pretending otherwise makes every
  heading in the library subtly wrong on half the team's machines.
- Enable **tabular figures** on every mono style. In Figma that is the `tnum` OpenType feature in the
  type panel. It is the reason numbers in a column line up, and it is off by default.

### 6.4 Motion

| `tokens.css` | Figma | Value |
|---|---|---|
| `--mob-duration-instant` | `Duration/Instant` | 80 |
| `--mob-duration-fast` | `Duration/Fast` | 120 |
| `--mob-duration-normal` | `Duration/Normal` | 160 |
| `--mob-duration-slow` | `Duration/Slow` | 220 |
| `--mob-duration-enter` | `Duration/Enter` | 260 |
| `--mob-ease-standard` | `Ease/Standard` (string) | `cubic-bezier(.2,0,0,1)` |
| `--mob-ease-enter` | `Ease/Enter` (string) | `cubic-bezier(.16,1,.3,1)` |
| `--mob-ease-exit` | `Ease/Exit` (string) | `cubic-bezier(.4,0,1,1)` |
| `--mob-press-scale` | `Press/Scale` | 0.985 |

Figma prototype easing cannot be driven by a string variable, so the `Ease/*` variables are
documentation: a designer reads the value and types the same four numbers into the custom-bezier
field. Easings are `[drv]` — the source handoff specifies durations in prose and no curves at all.

`Press/Scale` is a prototype value, not a layer property. Do not build a `State = Pressed` variant
that is 1.5% smaller — the transform is applied at runtime and a scaled variant will fight it.

---

## 7. Text styles

**One text style per type role in `base.css`. No more, no fewer.** A style with no CSS class behind
it will get used, and then a screen exists that the code cannot reproduce.

Naming transform: drop `mob-`, split the family from the size suffix, upper-case the suffix, Title
Case the family. Where a family has sized siblings, the unsuffixed member is named `Base` so it does
not sit as a loose leaf beside its own folder.

| `base.css` class | Figma text style | Family | Size | Weight | Leading | Tracking | Default fill |
|---|---|---|---|---|---|---|---|
| `.mob-display-xl` | `Display/XL` | Sans | 80 † | 600 | 100% | −2% | `Text/Primary` |
| `.mob-display-lg` | `Display/LG` | Sans | 64 † | 600 | 100% | −2% | `Text/Primary` |
| `.mob-display-md` | `Display/MD` | Sans | 48 † | 600 | 115% | −2% | `Text/Primary` |
| `.mob-heading-xl` | `Heading/XL` | Sans | 40 † | 600 | 115% | −2% | `Text/Primary` |
| `.mob-heading-lg` | `Heading/LG` | Sans | 32 | 600 | 115% | −2% | `Text/Primary` |
| `.mob-heading-md` | `Heading/MD` | Sans | 18 | 600 | 130% | −2% | `Text/Primary` |
| `.mob-heading-sm` | `Heading/SM` | Sans | 14.5 | 600 | 130% | −2% | `Text/Primary` |
| `.mob-title` | `Title` | Sans | 14 | 600 | 130% | 0 | `Text/Primary` |
| `.mob-figure-xl` | `Figure/XL` | Sans | 27 | 600 | 115% | −2% | inherit ‡ |
| `.mob-figure-lg` | `Figure/LG` | Sans | 23 | 600 | 115% | −2% | inherit ‡ |
| `.mob-figure-md` | `Figure/MD` | Sans | 22 | 600 | 115% | −2% | inherit ‡ |
| `.mob-figure-sm` | `Figure/SM` | **Mono** | 16 | 400 | 115% | 0 | inherit ‡ |
| `.mob-body-lg` | `Body/LG` | Sans | 18 | 400 | 160% | 0 | `Text/Secondary` |
| `.mob-body` | `Body/Base` | Sans | 13 | 400 | 160% | 0 | `Text/Secondary` |
| `.mob-body-sm` | `Body/SM` | Sans | 12 | 400 | 145% | 0 | `Text/Muted` |
| `.mob-value` | `Value/Base` | Mono | 14 | 400 | 145% | 0 | `Text/Primary` |
| `.mob-value-sm` | `Value/SM` | Mono | 12.5 | 400 | 145% | 0 | `Text/Secondary` |
| `.mob-meta` | `Meta/Base` | Mono | 10.5 | 400 | 130% | 0 | `Text/Label` |
| `.mob-meta-sm` | `Meta/SM` | Mono | 10 | 400 | 130% | 0 | `Text/Label` |
| `.mob-dim` | `Dim` | Mono | 9.5 | 400 | 145% | 0 | `Text/Dim` |
| `.mob-label` | `Label` | Mono | 9.5 | 400 | 130% | 0.7px, UPPERCASE | `Text/Label` |
| `.mob-control-label` | `Control Label` | Mono | 11.5 | 400 | 100% | 0 | inherit ‡ |

† These four are `clamp()` in CSS. The Figma style holds the **desktop maximum**. The clamp minimums
are 40 / 34 / 28 / 24 — set them by hand on the 375px frames in 05 Screens, or add a
`Desktop · Mobile` mode pair to the Typography collection and bind the style's size to a variable, if
your plan's mode budget allows it. Never invent a `Display/XL Mobile` style: that breaks the
one-to-one and the next designer will not know which one the code applies.

‡ *inherit* means the role carries no colour of its own in `base.css` — it takes the tone applied at
the call site. In Figma, bind the fill to a variable from §4 explicitly on every instance. The
figures are the whole point of this: a value flips `Feedback/Positive` → `Feedback/Negative` on sign
and nothing else about it changes.

Two hard rules the styles cannot enforce, so put them on the Typography board in words:

- **Sans is applied by role, never by size.** Mono is the default. A metric up to and including 16px
  stays mono, and sans figures start at 22px (`Figure/MD`); a heading is never mono, at any size;
  body copy longer than a sentence moves to sans at 145%+ leading.
- **Colour is not part of a text style.** Figma styles can carry a fill; do not let them. Tone is a
  separate axis (`base.css` splits `.mob-tone-*` and `[data-mob-sign]` from the type roles for
  exactly this reason). A style that bakes in green needs a twin for red, and then a twin for muted,
  and you have 66 styles instead of 22.

---

## 8. Effect styles

Effects are not variables. Build them as styles, and bind their **colour** to a variable so they
follow the theme without duplication.

| `tokens.css` | Figma effect style | Build |
|---|---|---|
| `--mob-shadow-sm` | `Elevation/SM` | Drop shadow · X0 Y1 · Blur 2 · Spread 0 · colour `Effect/Shadow SM` |
| `--mob-shadow-md` | `Elevation/MD` | Drop shadow · X0 Y4 · Blur 16 · Spread 0 · colour `Effect/Shadow MD` |
| `--mob-shadow-lg` | `Elevation/LG` | Drop shadow · X0 Y16 · Blur 48 · Spread 0 · colour `Effect/Shadow LG` |
| `--mob-glow-accent` | `Glow/Accent` | Drop shadow · X0 Y0 · Blur 11 · colour `Accent/Bright` @ 50% |
| `--mob-glow-positive` | `Glow/Positive` | Drop shadow · X0 Y0 · Blur 11 · colour `Feedback/Positive` @ 40% |
| `--mob-glow-negative` | `Glow/Negative` | Drop shadow · X0 Y0 · Blur 11 · colour `Feedback/Negative` @ 40% |
| `--mob-focus-ring` | `Focus/Ring` | Two drop shadows, in this order: (1) X0 Y0 Blur 0 **Spread 2** colour `Background/Canvas`; (2) X0 Y0 Blur 0 **Spread 4** colour `Focus/Color` |
| `--mob-focus-ring-inset` | `Focus/Ring Inset` | Inner shadow · X0 Y0 Blur 0 Spread 1 · colour `Focus/Color` |

The shadow geometry is identical in Dark and Light — only the colour changes — so three colour
variables carry the whole theme difference:

| Figma variable | Dark | Light |
|---|---|---|
| `Effect/Shadow SM` | `Alpha/Black/40` | `rgba(16,17,20,.06)` |
| `Effect/Shadow MD` | `Alpha/Black/40` | `rgba(16,17,20,.08)` |
| `Effect/Shadow LG` | `Alpha/Black/64` | `rgba(16,17,20,.14)` |

Policy, printed on the Foundations board: **cards do not get shadows.** Depth comes from surface plus
a 1px border. `Elevation/*` is for things that genuinely float — menus, popovers, modals, toasts.
A drop shadow on a card is the single fastest way to make this system look like a different one.

The focus ring is one shared style. `base.css` applies it globally via `:focus-visible`, and a
component author *may refine it but may not delete it*. Mirror that in Figma: never build focus as a
per-component variant (§11).

---

## 9. Component properties

Use properties for genuine semantic difference. Six, and only these:

| Property | Type | Values | What it means |
|---|---|---|---|
| `Variant` | Variant | e.g. `Primary` `Secondary` `Ghost` `Affirm` `Destroy` | which token family the component reads |
| `Size` | Variant | `SM` `MD` `LG` | which geometry row: `Component/Control/Height *` + matching radius + pad |
| `State` | Variant | `Default` `Hover` `Pressed` `Selected` `Disabled` `Loading` `Error` — only those the matrix marks for that component | a token swap, never a geometry change |
| `Icon Leading` | Boolean + Instance swap | on / off | shows a 16px icon slot before the label |
| `Icon Trailing` | Boolean + Instance swap | on / off | shows a 16px icon slot after the label |
| `Label` | Text | — | the string |

**Never** create a variant for:

- **text length** — that is what `Label` plus auto-layout Hug is for;
- **layout width** — that is Fill vs Hug on the instance, not a property;
- **colour of a value** — a positive and a negative figure are the same component with a different
  fill variable, exactly as `[data-mob-sign]` does it in CSS;
- **focus** — one shared effect style (§8);
- **density** — a mode on the parent frame (§3.2).

Each of those is the same failure: encoding at build time something the consumer decides at use time.
The symptom is a component set with 200 variants that nobody can find anything in, and the cure is
always the same — move the decision out to the instance.

---

## 10. Auto-layout conventions

The goal is that a Figma frame and the CSS box produce the same pixels for the same reason. Where
that is true, a developer reading the file gets the implementation for free; where it is not, they
get a puzzle.

### 10.1 Mapping

| CSS | Figma |
|---|---|
| `display:flex; gap:N` | Auto layout, Gap N |
| `flex-wrap:wrap` | Auto layout → Wrap |
| `flex:1 1 Npx; min-width:Mpx` | Fill container, Min width M |
| `flex:0 1 auto` / intrinsic | Hug contents |
| `padding: A B` | Vertical padding A, Horizontal padding B — bound to variables, never typed |
| `align-items:stretch` | Align → Stretch on the child |
| `box-sizing:border-box` + `border:1px` | Stroke, **alignment: Inside** |
| `overflow:hidden` | Clip content |
| `text-overflow:ellipsis` (`.mob-truncate`) | Text → Truncate text, and the parent must allow shrink |

**Stroke alignment is always Inside.** CSS borders are inside the box under `border-box`. A Center or
Outside stroke makes the frame 1px larger than the code will render it, and in a fused layout that
error compounds at every seam.

### 10.2 The segmented card — the parallel worth naming

This is the structural signature of the system, and Figma reproduces it *exactly*, not by
approximation. Hairlines between fused segments are **1px gaps over a frame-coloured parent**, not
borders.

The CSS:

```css
.card {
  background: var(--mob-border-frame);   /* the parent IS the hairline colour */
  border: 1px solid var(--mob-border-default);
  border-radius: var(--mob-radius-xl);
  display: flex; flex-wrap: wrap;
  gap: 1px;                              /* the gaps ARE the hairlines */
  overflow: hidden;
  align-items: stretch;
}
.card > .segment {
  background: var(--mob-card-bg);        /* each segment repaints over the frame */
  box-sizing: border-box;
  min-width: 0;                          /* shrinkable, so the card never overflows */
}
```

The Figma frame:

```text
Card                      Auto layout · Horizontal · Wrap · Gap 1 · Clip content
                          Fill   → Border/Frame
                          Stroke → Border/Default, 1, Inside
                          Corner → Component/Card/Radius
  ├ Segment / Pool        Fill → Component/Card/Background · Fill container · Min width 252
  ├ Segment / Range       Fill → Component/Card/Background · Fill container · Min width 200
  ├ Segment / Metrics     Fill → Component/Card/Background · Fill container · Min width 250
  └ Segment / Actions     Fill → Component/Card/Background · Fill container · Min width 96
```

Same structure, same reason. The consequences are why it matters:

- **A segment never gets a stroke.** Add one and you get a 2px seam — the gap plus the stroke — and
  a developer who copies the stroke into `border` gets a doubled line at every junction.
- **The parent's fill is not decorative.** It is only ever visible in the 1px gaps. If someone
  changes it to `Background/Surface` "because it looked the same", every hairline in the product
  disappears and nobody can say why the card went flat.
- **A hairline *inside* a segment is a 1px frame, not a stroke either.** The vertical rule between
  the two metric columns is a 1px-wide layer, height Fill container, filled with `Border/Frame`.
  A horizontal rule inside one surface uses `Border/Subtle` — the two-notch difference between
  `#17191d` and `#1c1e22` is what tells the eye *inside this surface* from *between two surfaces*.
- **Every segment is shrinkable.** Min width, never fixed width. That is what keeps the row from
  overflowing a narrow column, and it is the difference between a design that survives a resize and
  one that only exists at 1440.

### 10.3 The rest

- **Icons** live in a 16px frame (`Component/Control/Icon`), 20px for `Icon LG`. Never scale an icon
  instance to a non-token size.
- **Absolute position** only for things genuinely out of flow: a badge on an avatar, a dropdown
  caret in a field. Never to nudge something into place.
- **Overlapping avatars** use the `Component/Avatar/Overlap` −9 value as a negative auto-layout gap,
  with a 2px stroke in the card background colour — the stroke is the cut-out, and it must be bound
  to the same variable as the surface behind it or the notch shows on hover.
- **Text layers are Auto width or Auto height**, never a hand-dragged box. A manually sized text
  frame is a lie about where the line will break.
- **Both columns of a two-column shell open with a 34px header row** (`Layout/Header Row Height`) so
  the first card in each starts on the same baseline. If you change one header, check the other.

---

## 11. States without a combinatorial explosion

The full states matrix, from the system spec:

| State | Button | Input | Card | Tabs | Menu item |
|---|:-:|:-:|:-:|:-:|:-:|
| Default | ✓ | ✓ | ✓ | ✓ | ✓ |
| Hover | ✓ | ✓ | ✓ | ✓ | ✓ |
| Focus | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pressed | ✓ | — | ✓ | ✓ | ✓ |
| Selected | — | — | ✓ | ✓ | ✓ |
| Disabled | ✓ | ✓ | optional | ✓ | ✓ |
| Loading | ✓ | optional | optional | — | — |
| Error | — | ✓ | optional | — | — |

Drawn naively, a Button is 5 variants × 3 sizes × 6 states = **90**. Four rules cut it to 35.

**Rule 1 — Focus is never a variant.** It is `Focus/Ring`, one effect style, applied in the prototype.
The CSS applies it globally from `:focus-visible`; a component cannot delete it, so a component
should not own it. This removes a whole state row from every set — 90 → 75 — and, more importantly,
removes the possibility of eleven components drifting into eleven different rings.

**Rule 2 — States are drawn at one size only.** Build the full `Variant × Size` grid at
`State = Default`, and a separate `Variant × State` grid at `Size = MD`. That is `V×S + V×St`
variants instead of `V×S×St`: for the Button, 15 + 25 sharing the five Default·MD cells = **35**,
rather than 75.

This is sound *because of the token contract*, not as a shortcut: Hover, Pressed, Selected and
Disabled change fill, stroke and text colour only. They never change height, padding or radius —
those come from the Size row and are invariant across states. Write that guarantee on the component
board, because it is the assumption the whole compression rests on. If a state ever needs to change
geometry, the state is wrong.

**Rule 3 — Loading and Error are not colour swaps, so they get different machinery.**

- *Loading* replaces content with a skeleton at `Background/Tile`, and **must not change the
  component's size** — a spinner that shrinks a button causes a layout shift, which the QA checklist
  fails. Build it as a `State = Loading` variant at MD only, with the label slot preserved at its
  Default width.
- *Error* on a field is a boolean property plus a message slot bound to `Feedback/Negative`, not a
  variant of every size. The field's own stroke swaps to `Feedback/Negative`; nothing else moves.

**Rule 4 — Prototype the transitions, do not draw them.** Hover and Pressed connect with Smart
Animate at `Duration/Fast` (120ms) and `Ease/Standard`. Pressed applies `Press/Scale` 0.985 as a
prototype transform. Transform and opacity only, no bounce — the same policy the CSS enforces, so
what a stakeholder sees in the prototype is what ships.

---

## 12. Naming layers and components

| Thing | Rule | Why |
|---|---|---|
| Component set | Singular, Title Case, matching the CSS file it implements: `Button` → `button.css`, `Field` → `field.css`, `Choice` → `choice.css`, `Chip`, `Card`, `Stat`, `Table`, `Nav`, `Overlay`, `Feedback`, `Data` → `dataviz.css`. | A developer looking for the Chip should find `components/chip.css` without a lookup table. |
| Component name | Never contains a size or variant. `Button`, not `Button / Primary / MD`. | Those are properties. A name that encodes a property means the property does not exist yet. |
| Property names | Title Case: `Variant`, `Size`, `State`, `Icon Leading`. | Consistent across every set, so muscle memory works. |
| Property values | The token's own vocabulary: `SM` `MD` `LG`, `Primary` `Ghost` `Destroy`. | `Size = MD` ↔ `--mob-control-h-md`, no translation. |
| Layer names | Describe the **role**: `Label`, `Icon Leading`, `Value`, `Hairline`, `Segment / Range`, `Skeleton`. | `Rectangle 42` and `#1c1e22 line` are both unsearchable, and the second one goes stale the moment the token changes. |
| Internal components | Prefix with `.` — `.Segment Base`, `.Ring`. | A dot-prefixed component is excluded from the published library, so consumers never instance a part. |
| Instances | Keep the component's name. | A renamed instance breaks find-and-replace and every automated audit. |
| Deprecated | Prefix `⚠︎ ` and keep for one release. | Deleting a component breaks files silently. Renaming it makes the breakage visible and dated. |

Do not add a `mob-` prefix to anything inside the file. The library is the namespace.

---

## 13. Keeping Figma and `tokens.css` in sync

### 13.1 Source of truth

**`css/tokens.css` is the source of truth. Always. No exception.**

Not because CSS is superior, but because it is the artefact that ships. A value that exists only in
Figma is not in the product — it is a proposal. Treating the design tool as authoritative means the
authoritative value is the one nobody can compile, and the first time the two disagree you have no
way to say which is wrong.

### 13.2 How a change flows

```text
1. Proposal            a designer or engineer proposes a value change, with a reason
2. tokens.css          the value is edited in the correct tier
                       — semantic changes go in tier 2, not by editing a primitive
                       — a new value gets a [drv] marker and the rule that derived it
                       — an [src] value is not changed without re-measuring; that is a
                         calibration change and needs its own note
3. Export              regenerate mob-design/tokens/ (the machine-readable exchange point)
4. Import              load into Figma with a variables-import plugin, into the matching
                       collection and mode
5. Publish             publish the library with a changelog entry naming the CSS token
                       that changed — not "updated card colour"
6. Propagate           every component bound to the alias updates automatically;
                       anything that does NOT update was bound to a raw hex — fix it
```

The `mob-design/tokens/` directory is the intended exchange point. If it is currently empty, the sync
is manual: build the collections from §4–§6 by hand and re-check them against `tokens.css` at each
publish. Generating that export is the single highest-leverage piece of tooling this system can have,
because it turns step 3–4 from a careful human transcription into a diff.

**Never** the reverse: do not change a value in Figma and ask an engineer to match it. File it
against `tokens.css`. A Figma-first change has no provenance marker, no review, and no record of
whether it was measured or guessed — which is precisely the failure mode the `[src]`/`[drv]`
distinction exists to prevent.

### 13.3 Publish checklist

Run before every library publish. Any unchecked box is a blocker, not a note.

**Variables**

- [ ] Every semantic variable in §4 exists, with both modes filled. An empty mode cell silently
      falls through and produces a dark colour on a light screen.
- [ ] Every Dark-mode value is an **alias to a primitive**, not a literal.
- [ ] No primitive has been renumbered. `Gray/975` is still `Gray/975`.
- [ ] Primitive count matches `tokens.css` tier 1. A primitive in Figma with no CSS counterpart is a
      value someone invented in the design tool.
- [ ] Component-tier variables exist only where the CSS has one.
- [ ] Spacing's three density columns are identical for every `Component/Control/*` and every radius.

**Layers**

- [ ] *Selection colors* on each published page lists variables only — zero raw hex.
- [ ] No detached instances on 01–04.
- [ ] No local text styles; every text layer uses one of the 22 shared styles.
- [ ] Every stroke is alignment Inside.
- [ ] No card has an effect style. Effects appear only on floating layers.
- [ ] Every fused-segment frame is filled `Border/Frame` with 1px gaps and unstroked children.

**Type**

- [ ] The 22 text styles map one-to-one to `base.css`. Count them.
- [ ] Tabular figures (`tnum`) on for every mono style.
- [ ] Decimal sizes intact — 9.5, 10.5, 11.5, 12.5, 14.5 — none rounded.

**Coherence with code**

- [ ] The 00 Cover records the `tokens.css` commit this publish was synced against.
- [ ] The changelog names changed CSS tokens.
- [ ] Anything deprecated is `⚠︎`-prefixed, not deleted.
- [ ] Known Light-mode gaps (§3.1: series colours, scrim) are still listed on the Cover, or fixed in
      `tokens.css` and removed from the list.

**Accessibility**, on any component that changed:

- [ ] Contrast checked in **both** modes, at the size the type role actually renders.
- [ ] `Focus/Ring` present in the prototype for every interactive element.
- [ ] Coarse-pointer hit target ≥ 44 (`Component/Control/Tap Target`) even where the painted control
      is 30.

### 13.4 The drift audit

Once a quarter, or after any large feature: open 05 Screens and list every value that is not a
variable. Each entry resolves exactly one of two ways —

1. it is a **missing token**, so it goes into `tokens.css` with a provenance marker and comes back
   as a variable; or
2. it is a **bug**, so it gets bound to the variable it should have used.

There is no third outcome. "It's fine, it's just this one screen" is how a design system dies — not
in one decision, but in forty of them.
