# 01 — Foundations

Every value in this document is in `css/tokens.css`. If you need a number that is not here, you have
found either a gap in the system or a mistake in the screen. Both are worth raising; neither is
worth solving with a literal.

Provenance is marked throughout:

| Marker | Meaning |
|---|---|
| `[src]` | Measured verbatim from the calibrated handoff (`Dashboard.dc.html` / `README.md`). Do not change it to a rounder number — the rounder number is what the calibration rejected. |
| `[drv]` | Derived. Extends the source by a stated rule, into territory the handoff never covered (light mode, marketing type sizes, warning/info hues, series 4–8). Judgement is allowed here; changing a `[src]` value is a system decision. |

The distinction matters when you are tempted to "fix" something. A `[drv]` value that reads wrong at
your hue or on your surface is a bug you may fix locally. A `[src]` value that reads wrong is a
signal that your composition is wrong.

---

## 1. Token architecture

### 1.1 Three tiers, one direction

```
  TIER 1  primitives     raw values, no meaning        --mob-gray-925: #101114
     │                                                 --mob-violet-500: #7c5dfa
     ▼    (references nothing)

  TIER 2  semantic       roles, no raw values          --mob-bg-surface: var(--mob-gray-925)
     │                                                 --mob-accent: var(--mob-violet-500)
     ▼    (references tier 1 only)

  TIER 3  component      calibrated, off-scale values  --mob-card-bg: var(--mob-bg-surface)
                                                       --mob-card-pad-y: 15px
          (references tier 2, or carries a measured literal)

  ┌──────────────────────────────────────────────────────────────┐
  │  A COMPONENT MAY READ TIER 2 AND TIER 3. NOTHING ELSE.       │
  └──────────────────────────────────────────────────────────────┘
```

The arrow never reverses. A semantic token never reads a component token; a primitive never reads
anything.

**Why components may not read tier 1.** Retheming works by redefining tier 2 in place — swap eight
declarations and the product is rebranded, with every component following automatically. A component
that reaches past tier 2 to `--mob-violet-500` is invisible to that swap, so it stays violet in an
orange product and nobody notices until a customer does. The same argument applies with more force to
a literal hex inside a component stylesheet: it is a token that cannot be found by grep and cannot be
overridden by a theme. Treat one as a bug (see `docs/08-adoption.md`, "Hygiene").

**Why tier 3 exists at all.** A dense product surface produces measured values that do not land on
any spacing scale: card padding of `15px 16px`, chip padding of `3px 8px`, an avatar overlap of
`-9px`. There are two bad answers — round them to the scale and lose the calibration, or pollute the
public scale with a `--mob-space-15`. Tier 3 is the third answer: park the exact value behind a named
component token. This buys two things at once. The public scale stays legible (a designer reading
`--mob-space-*` sees a rhythm, not a junk drawer), and repetition stays *exact* — every card in the
product reads `--mob-card-pad-y`, so two cards can never drift 1px apart in a refactor.

### 1.2 What lives where

| Tier | Block in `tokens.css` | Contains | You edit it when |
|---|---|---|---|
| 1 | `:root` (top) | Neutral ramp, violet, status hues, muted action tones, series ramp, alpha ladder, type/space/radius/motion/layout/z scales | You are changing the palette or the scales themselves — a rare, system-wide decision |
| 2 | `:root, [data-mob-theme='dark']` and `[data-mob-theme='light']` | `--mob-bg-*`, `--mob-fg-*`, `--mob-border-*`, `--mob-accent-*`, feedback, focus, elevation | You are retheming, or adding a new role |
| 3 | `:root` (bottom) + `[data-mob-density='*']` | Control geometry, card/chip/field/avatar/data-mark/overlay tokens, section rhythm | You are calibrating one component family |

### 1.3 Naming

`--mob-<category>-<role>[-<modifier>]`. The prefix is not decoration: it makes the system's surface
area greppable inside a host app that has its own tokens, and it makes an accidental collision
impossible. Modifiers are states (`-hover`, `-pressed`), intensities (`-strong`, `-soft`, `-raised`,
`-dim`) or sizes (`-sm`, `-lg`). There is no `--mob-blue` for "the blue one"; there is
`--mob-info` for "the informational one".

---

## 2. Colour

### 2.1 The neutral ramp

Twenty-four steps, dark-native, numbered by lightness (1000 = darkest).

| Token | Hex | Prov. | Job |
|---|---|---|---|
| `--mob-gray-1000` | `#060708` | `[drv]` | Below-canvas, sunken wells |
| `--mob-gray-975` | `#0a0b0d` | `[src]` | Page canvas |
| `--mob-gray-950` | `#0e0f12` | `[src]` | Alt / sunken panel, field background |
| `--mob-gray-925` | `#101114` | `[src]` | **Card and segment surface** |
| `--mob-gray-900` | `#131417` | `[src]` | Chip surface, elevated overlay, disabled |
| `--mob-gray-880` | `#141519` | `[src]` | Chip surface alt → active / selected |
| `--mob-gray-870` | `#141518` | `[src]` | Skeleton, inner tile |
| `--mob-gray-850` | `#15171a` | `[src]` | Hover surface |
| `--mob-gray-825` | `#17191d` | `[src]` | In-card hairline |
| `--mob-gray-800` | `#1c1e22` | `[src]` | Segment frame / seam |
| `--mob-gray-780` | `#1e2024` | `[src]` | Card border |
| `--mob-gray-760` | `#23262b` | `[src]` | Control + chip border |
| `--mob-gray-750` | `#24262b` | `[src]` | Dashed empty-state border |
| `--mob-gray-720` | `#2a2d33` | `[src]` | Strong border |
| `--mob-gray-680` | `#33373e` | `[drv]` | Strong border, hover |
| `--mob-gray-560` | `#5d636c` | `[src]` | Dim text |
| `--mob-gray-500` | `#767c86` | `[src]` | Label text |
| `--mob-gray-440` | `#8f959e` | `[src]` | Muted text |
| `--mob-gray-400` | `#9aa0a8` | `[src]` | Muted text, raised (on chips) |
| `--mob-gray-300` | `#b4bac2` | `[drv]` | — |
| `--mob-gray-200` | `#cfd3da` | `[src]` | Secondary text |
| `--mob-gray-100` | `#e8eaed` | `[src]` | Primary text |
| `--mob-gray-050` | `#f4f5f7` | `[drv]` | Light-mode canvas |
| `--mob-gray-000` | `#ffffff` | — | On-accent text |

**Why the ramp is dense between 1000 and 680 and sparse above it.** Fifteen of the twenty-four steps
live in the `#06`–`#33` band. That is not an accident of extraction; it is the whole look. On a
near-black canvas the entire structural language — surface separation, seams, borders, hover — has to
happen inside a luminance range of roughly 20 units, because anything brighter stops reading as
"structure" and starts reading as "content". Above `#33` the ramp jumps straight to text, where you
only need five well-separated steps.

The practical consequence: **do not "simplify" the dark end.** Collapsing `#17191d`, `#1c1e22` and
`#1e2024` into one grey looks like a cleanup in the token file and destroys the border hierarchy in
the product. Those three values are a divider, a seam and an edge, and the design depends on a reader
being able to tell them apart without being able to name them.

### 2.2 Surfaces

Four elevation steps plus their state variants. A fifth background is a smell — it usually means a
section wanted emphasis and reached for a surface instead of for spacing.

| Token | Resolves to | Use |
|---|---|---|
| `--mob-bg-canvas` | `#0a0b0d` | The page. Nothing else. |
| `--mob-bg-sunken` | `#0e0f12` | Wells that sit *below* the canvas: input fields, code blocks, an alt panel inside a card. |
| `--mob-bg-surface` | `#101114` | Cards, panels, segments. The default object surface. |
| `--mob-bg-surface-raised` | `#131417` | Chips and badges sitting on a surface. |
| `--mob-bg-tile` | `#141518` | Inner tiles and skeleton blocks inside a card. |
| `--mob-bg-elevated` | `#131417` | Menus, popovers, modals — things over the page. |
| `--mob-bg-hover` | `#15171a` | Hover on any surface. |
| `--mob-bg-active` / `--mob-bg-selected` | `#141519` | Pressed / selected. Selected is deliberately *not* hover — it must survive the pointer leaving. |
| `--mob-bg-disabled` | `#131417` | Disabled control fill (pair with `--mob-fg-disabled`). |
| `--mob-bg-frame` | `#1c1e22` | The parent behind fused segments. See §7. |
| `--mob-bg-overlay` | `rgba(0,0,0,.64)` | Modal scrim. |

Note that `--mob-bg-hover` (`#15171a`) is *brighter* than `--mob-bg-active` (`#141519`). Hover lifts,
press settles. Reversing them makes a button feel like it bounces.

### 2.3 Text roles

| Token | Resolves to | Use |
|---|---|---|
| `--mob-fg-primary` | `#e8eaed` | Headings, hero figures, the number a row exists to show |
| `--mob-fg-secondary` | `#cfd3da` | Body copy, entity names, reference values |
| `--mob-fg-muted-hi` | `#9aa0a8` | Muted text on a *raised* surface (chip labels) — one step brighter to survive the brighter background |
| `--mob-fg-muted` | `#8f959e` | Muted text on a card: sub-lines, secondary metadata |
| `--mob-fg-label` | `#767c86` | Micro-labels, timestamps, axis min/max |
| `--mob-fg-dim` | `#5d636c` | The quietest tier: "uncollected", "all-time", unit suffixes |
| `--mob-fg-disabled` | `#5d636c` | Disabled text |
| `--mob-fg-link` / `-hover` | `#a78bfa` / `#c4b5fd` | Inline links |
| `--mob-fg-on-accent` | `#ffffff` | Text on an accent fill |
| `--mob-fg-inverse` | `#0a0b0d` | Text on a light fill |

Apply these through the tone utilities in `base.css` (`.mob-tone-muted`, `.mob-tone-dim`, …) or
through `[data-mob-sign]` for signed numbers, rather than by setting `color` per element. The point of
`[data-mob-sign='positive'|'negative'|'neutral']` is that a value which flips sign flips tone in one
place — the component never branches on sign in both its markup and its stylesheet.

### 2.4 The border hierarchy — five steps, five different jobs

This is the part readers get wrong. All five are 1px and all five are nearly the same dark grey, so
the temptation is to pick one and move on. They are not interchangeable: they encode *what kind of
boundary* this is, and a reader parses the card's structure from that encoding without ever
consciously noticing it.

Ordered from quietest to loudest:

| Token | Hex | Contrast vs `--mob-bg-surface` | The boundary it means |
|---|---|---|---|
| `--mob-border-subtle` | `#17191d` | 1.07:1 | "Same block, next part" |
| `--mob-border-frame` | `#1c1e22` | 1.13:1 | "Two peers of one object" |
| `--mob-border-default` | `#1e2024` | 1.21:1 (vs canvas) | "The object ends here" |
| `--mob-border-control` | `#23262b` | 1.21:1 (vs raised) | "This is operable" |
| `--mob-border-strong` | `#2a2d33` | 1.37:1 | "This one" |

Plus two modifiers: `--mob-border-hover` (`#33373e`) for the hover step above strong, and
`--mob-border-dashed` (`#24262b`) for empty-state outlines.

**`--mob-border-subtle` — divider inside one surface.**
In the worked example, the Fees + PnL segment separates its two hero numbers from the "Value" footer
with `border-top: 1px solid var(--mob-border-subtle)`. Above and below the line is the same block of
content; the line only says "the footer starts here". It must be the quietest thing on the card,
because a louder line would suggest the footer is a separate object, which would compete with the
numbers the segment exists to show.

```css
.summary__footer {
  margin-top: var(--mob-space-12);
  padding-top: var(--mob-space-10);
  border-top: var(--mob-border-width) solid var(--mob-border-subtle);
}
```

**`--mob-border-frame` — seam between fused peers.**
The same segment splits FEES from PNL with a 1px vertical rule in `--mob-border-frame`, one step
louder than the footer divider. Why louder? Because these are two equal columns, not a block and its
footer — the seam has to carry "these are peers, side by side" rather than "this belongs to that".
The same token is the background of the segmented card itself, showing through the 1px gaps between
segments (§7). Same colour, same meaning, two techniques.

```css
.summary__seam { width: 1px; align-self: stretch; background: var(--mob-border-frame); }
```

**`--mob-border-default` — the boundary of a card or panel.**
One 1px border, on the outside of the object, against the canvas. This is where the card ends and the
page begins. It is the only border most cards have, and it is the reason the system needs no drop
shadow (§8).

```css
.card { background: var(--mob-bg-surface); border: 1px solid var(--mob-border-default); }
```

**`--mob-border-control` — chips, inputs, ghost buttons.**
A step louder than a card's boundary, and deliberately so. A card is a passive container; a control
is a thing you can press. The extra luminance is the affordance, and it is doing that work *at rest*,
without a fill, which is what lets ghost controls exist on this palette at all. Use it on anything
the user can operate that does not have a coloured fill.

```css
.chip { background: var(--mob-bg-surface-raised); border: 1px solid var(--mob-border-control); }
```

**`--mob-border-strong` — selected / emphasised.**
The loudest step, reserved for state, not for structure. A selected row, a focused-within field
group, the scrollbar thumb (`base.css` uses it there for exactly this reason — the thumb is the one
piece of chrome the user is meant to grab). If you use `--mob-border-strong` as an ordinary card
border, you have spent your only "this one" signal on every card, and selection has nothing left to
say.

**The failure mode to watch for.** If a card looks noisy, the usual cause is not too many borders but
borders at the wrong tier — an inner block given `--mob-border-default` when it is part of the card,
not an object on the canvas. Demote it to `--mob-border-subtle` and the noise disappears without
removing anything.

### 2.5 The accent family

The whole family sits on one hue. Bright members land on the Tailwind-400/300 luminance tier: legible
on near-black without glowing.

| Token | Resolves to | Use |
|---|---|---|
| `--mob-accent` | `#7c5dfa` `[src]` | Primary action **fill**. Not text. |
| `--mob-accent-hover` | `#8b70ff` `[src]` | Primary fill on hover |
| `--mob-accent-pressed` | `#6b4ce8` `[drv]` | Primary fill, pressed |
| `--mob-accent-deep` | `#5b3fd6` `[src]` | Inactive members of a series that has an active member (the inactive range bins) |
| `--mob-accent-soft` | `#6d4df0` `[src]` | Entity accent, composition-bar segment |
| `--mob-accent-bright` | `#c4b5fd` `[src]` | Accent **text**, glyphs, the active/current mark, the focus ring |
| `--mob-accent-tint` | `#211a3d` `[src]` | Avatar / badge tint fill |
| `--mob-accent-tint-strong` | `#2a1d4d` `[src]` | Tint fill, stronger |

**The rule that keeps this from going wrong: `--mob-accent` is a fill, `--mob-accent-bright` is a
text colour.** `#7c5dfa` on `--mob-bg-surface` is 4.32:1 — it fails AA for small text, and every text
size in this system below 18.66px is small text. `--mob-accent-bright` is 10.23:1. That is why
`.mob-tone-accent` in `base.css` maps to `--mob-accent-bright` and not to `--mob-accent`, and why the
active range bin and the "Above · sold" status both use the bright member.

Accent is scarce by policy: one accent fill per action group, no accent used to make a section
"more interesting". If a screen has two primary buttons, one of them is not primary.

**Rebranding.** Either redefine the eight `--mob-accent-*` tokens in tier 2, or load `css/brand.css`
after `tokens.css` and set `--mob-brand` once — the family is then derived in oklab so the
relationships that make the default violet work survive the hue change. The derivation is a good
approximation, not a substitute for judgement; overriding an individual `--mob-accent-*` afterwards
is a supported outcome, not a failure.

### 2.6 Status hues

| Role | Base | Raised | Tint | Prov. |
|---|---|---|---|---|
| Positive | `--mob-positive` `#34d399` | `--mob-positive-raised` `#6ee7b7` | `--mob-positive-tint` `#0d2a20` | base `[src]` |
| Negative | `--mob-negative` `#f87171` | `--mob-negative-raised` `#fca5a5` | `--mob-negative-tint` `#2a1416` | base `[src]` |
| Warning | `--mob-warning` `#fbbf24` | `--mob-warning-raised` `#fcd34d` | `--mob-warning-tint` `#2b1f06` | `[drv]` |
| Info | `--mob-info` `#60a5fa` | `--mob-info-raised` `#93c5fd` | `--mob-info-tint` `#0d1c33` | `[drv]` |

**All four bases sit on one luminance tier** (the Tailwind-400 tier: 9.8, 6.8, 11.3, 7.4 against
`--mob-bg-surface`). This is the property that makes them a family rather than four unrelated
colours. A warning at 400 does not out-shout a positive at 400; a status column of mixed tones reads
as one column. The moment you introduce a status colour from a different tier — a 500-tier red, say —
that row starts dominating the table for reasons that have nothing to do with its meaning.

If you add a fifth status, derive it on the same tier. Do not pick it by eye.

Status colour is never the only signal (`README` and the spec both require this): pair it with a
sign, a word, or an icon. A negative PnL is red *and* prefixed with `−`.

### 2.7 Muted action tones

Calibrated triplets for actions that must read as "money in" or "danger" without the row glowing.

| | Rest fg | Rest bg | Rest border | Hover fg | Hover bg | Hover border |
|---|---|---|---|---|---|---|
| Affirm | `#7fbfa2` | `#111a16` | `#22332b` | `#96d4b6` | `#16221c` | `#2c4438` |
| Destroy | `#c08b8b` | `#1a1315` | `#35262a` | `#dc9d9d` | `#221a1c` | `#483035` |

All twelve are `[src]`. Token names are `--mob-affirm-*` and `--mob-destroy-*`
(`-fg`, `-bg`, `-border`, and each with a `-hover` suffix).

**The idea.** A dense list can contain twenty destructive buttons. At full saturation the list becomes
a warning sign and the user stops reading it. These tones carry the intent at rest — you can tell the
green one takes money in and the red one takes something away — and spend the saturation only on
hover, where exactly one button at a time is lit. Muted is not the same as low-contrast: affirm-fg on
affirm-bg is 8.35:1, destroy-fg on destroy-bg is 6.37:1. Both clear AA comfortably.

**Extending the pattern.** When a new semantic needs the same treatment, build it with the recipe in
`css/brand.css` rather than picking three colours by eye:

```css
--tone-fg:     color-mix(in oklab, <hue> 62%, var(--mob-fg-secondary));
--tone-bg:     color-mix(in oklab, <hue> 11%, var(--mob-bg-canvas));
--tone-border: color-mix(in oklab, <hue> 20%, var(--mob-border-frame));
/* hover: +14% hue on fg and border, +4% on bg */
```

`brand.css` ships the worked result for warning as `--mob-warn-fg` / `-bg` / `-border` and their
`-hover` variants. The calibrated affirm/destroy triplets stay canonical — do not regenerate them
from the recipe, the recipe was fitted to them.

### 2.8 The series ramp

Eight categorical colours for charts, composition bars and entity accents.

| Token | Hex | Prov. | Tint / glyph pair |
|---|---|---|---|
| `--mob-series-1` | `#4f7bd6` | `[src]` | `#1b2c4a` / `#9db8e8` |
| `--mob-series-2` | `#2dd4bf` | `[src]` | `#12403c` / `#7fe6d5` |
| `--mob-series-3` | `#6d4df0` | `[src]` | `#211a3d` / `#c4b5fd` |
| `--mob-series-4` | `#fbbf24` | `[drv]` | `#2b1f06` / `#fcd34d` |
| `--mob-series-5` | `#f87171` | `[drv]` | `#2a1416` / `#fca5a5` |
| `--mob-series-6` | `#34d399` | `[drv]` | `#0d2a20` / `#6ee7b7` |
| `--mob-series-7` | `#f0a3d0` | `[drv]` | `#33162a` / `#f5bde0` |
| `--mob-series-8` | `#8f959e` | `[drv]` | `#212429` / `#b4bac2` |

Tint and glyph tokens are `--mob-series-N-tint` and `--mob-series-N-glyph`. Every glyph-on-tint pair
clears 6.9:1, so an entity avatar is readable at 20px without a border.

Rules:

- **Hue-spaced on one luminance tier.** Same argument as §2.6 — no series out-shouts another, so a
  chart reads as data rather than as a ranking.
- **Assign by stable identity, not by index.** Hash the entity id into `1..8`. If you assign by
  position in the current sort, an entity changes colour when the user filters, and the colour stops
  meaning anything.
- **Series 5 and 6 collide with negative and positive.** `--mob-series-5` is the same hex as
  `--mob-negative`, `--mob-series-6` as `--mob-positive`. In any view that also shows signed values,
  skip those two steps or you will have a red bar that does not mean "down".
- **Never colour-only.** Pair every series with a label or a glyph. The composition bar in the worked
  example is legible because each segment has a named row beneath it.

### 2.9 The alpha ladder

`--mob-white-04 / -06 / -08 / -12 / -16 / -24 / -40 / -64 / -80` and
`--mob-black-24 / -40 / -64 / -80`.

Prefer alpha over a new opaque grey **when the element sits on a surface you do not control**:

- scrims and overlays (`--mob-bg-overlay` is `--mob-black-64`);
- a divider drawn over an image, a gradient, or a series-coloured fill;
- a hover veil on a tinted element, where an opaque grey would erase the tint;
- borders inside a component that can be dropped onto canvas, surface *or* raised.

Prefer the opaque neutral ramp **when the surface underneath is known and fixed** — which is most of
the product. Two reasons: the opaque values are the calibrated ones, and stacked alphas compound. Two
`--mob-white-08` borders on top of each other are not `--mob-white-16`, and the drift is invisible in
review and obvious in a screenshot diff.

### 2.10 Contrast

Measured WCAG 2.x ratios against `--mob-bg-surface` (`#101114`). Ratios on `--mob-bg-canvas` are
0.2–0.7 higher; on `--mob-bg-surface-raised` they are ~0.3 lower, which is the worst case in the
system and the numbers to design against.

| Role | Hex | vs surface | vs raised | Verdict |
|---|---|---:|---:|---|
| `--mob-fg-primary` | `#e8eaed` | **15.66** | 15.28 | Body-safe. AAA. |
| `--mob-fg-secondary` | `#cfd3da` | **12.57** | 12.26 | Body-safe. AAA. |
| `--mob-fg-muted-hi` | `#9aa0a8` | **7.16** | 6.99 | Body-safe. AAA. |
| `--mob-fg-muted` | `#8f959e` | **6.26** | 6.11 | Body-safe. AA+. |
| `--mob-fg-label` | `#767c86` | **4.49** | 4.38 | **Metadata only.** |
| `--mob-fg-dim` | `#5d636c` | **3.12** | 3.04 | **Decorative tier. Never load-bearing.** |
| `--mob-fg-link` | `#a78bfa` | **6.94** | 6.77 | Body-safe. |
| `--mob-accent-bright` | `#c4b5fd` | **10.23** | 9.98 | Body-safe. Use this for accent text. |
| `--mob-accent` | `#7c5dfa` | **4.32** | 4.21 | **Fill only. Never text.** |
| `--mob-positive` | `#34d399` | **9.82** | 9.58 | Body-safe. |
| `--mob-negative` | `#f87171` | **6.83** | 6.66 | Body-safe. |
| `--mob-warning` | `#fbbf24` | **11.31** | 11.03 | Body-safe. |
| `--mob-info` | `#60a5fa` | **7.43** | 7.24 | Body-safe. |
| `--mob-fg-on-accent` on `--mob-accent` | `#ffffff` on `#7c5dfa` | **4.37** | — | See note below. |

Reading the verdicts:

- **Body-text-safe** — clears 4.5:1, so it may carry a sentence a user has to read at any size in the
  scale. Everything from `--mob-fg-muted` upward qualifies.
- **Metadata-only (`--mob-fg-label`, 4.49:1)** — 0.01 under AA, which is a rounding artefact, not a
  licence. Use it for what it was calibrated for: uppercase micro-labels, axis min/max, timestamps,
  `updated Ns ago`. These are all short, repeated, and recoverable from context. Do not set a
  paragraph, an error message, or a form helper line in it. If a label must be read carefully, it is
  not a label — promote it to `--mob-fg-muted`.
- **Decorative (`--mob-fg-dim`, 3.12:1)** — fails AA for text at every size this system uses. It is
  the "uncollected" / "all-time" / "100% USDG" tier: a suffix that qualifies a number the user is
  already reading. It must never be the sole carrier of information, never hold an action, and never
  appear in an error path.
- **White on the accent fill (4.37:1)** — the source's primary button, sans 13px/500 on `#7c5dfa`. It
  clears AA for large text (3:1) but sits 0.13 under AA for small text. This is a `[src]` value and
  the system ships it as measured. Do not lighten the label — it is already white.

Border contrast is a non-text concern and none of the five border steps approaches 3:1 against its
parent. That is intentional and correct: they are structure, not UI-component boundaries in the WCAG
sense. The affordance a control needs to be *identifiable* comes from its fill, its label and its
focus ring, not from its 1.2:1 border.

### 2.11 When the defaults must clear AA: `css/a11y.css`

Do not invent a fix for the numbers above. Every failure in §2.10 is already solved, once, with a
measured replacement, in `css/a11y.css`. It is an opt-in token override — load it after `tokens.css`
and set the attribute on any scope you like:

```html
<html data-mob-a11y="AA">
```

The canonical replacements. Backgrounds tested: canvas `#0a0b0d`, surface `#101114`, raised
`#131417`.

| Token | Default | Ratio | Needs | `a11y.css` | Ratio |
|---|---|---:|---:|---|---:|
| `--mob-accent` (white label on the fill) | `#7c5dfa` | 4.37 | 4.5 | `#7a5bf5` | **4.52** |
| `--mob-accent-hover` | `#8b70ff` | 3.58 | 4.5 | `#6f4fe8` | **5.30** |
| `--mob-fg-label` | `#767c86` | 4.49 | 4.5 | `#797f88` | **4.56** |
| `--mob-fg-dim` | `#5d636c` | 3.12 | 4.5 | `#797e85` | **4.62** |
| `--mob-accent-deep` (non-text mark) | `#5b3fd6` | 2.81 | 3.0 | `#6247d8` | **3.07** |
| `--mob-field-border` (sole control identifier) | `#23262b` | 1.37 | 3.0 | `#5e6164` | **3.08** |

Three things to understand before you reach for it:

- **The accent barely moves.** `#7a5bf5` is dE76 **1.70** from `#7c5dfa` — under the ~2.3 threshold
  at which a colour difference becomes noticeable. It was chosen over `--mob-accent-soft`
  (`#6d4df0`) for exactly that reason: the soft member is a visibly different purple and reads as a
  rebrand; this is the same violet, and it stops failing.
- **Hover inverts.** `--mob-accent-hover` now *darkens*, because "lighter" and "higher contrast with
  white" cannot both be true. It reads fine; it is not what the prototype did.
- **It raises `--mob-field-border`, not `--mob-border-control`.** The lift applies only where a
  border is the sole thing identifying an interactive control. `--mob-chip-border` and the card
  borders stay calibrated, because they separate surfaces that are already distinguishable — which
  1.4.11 does not cover.

`a11y.css` also carries a `forced-colors` block that hands painting back to the OS. What it cannot
do: make 9.5px type comfortable, or check that your content has a reading order, a keyboard path and
an accessible name. Contrast is the floor, not the goal.

---

## 3. Typography

### 3.1 The dual-family split

This is the identity of the system, and it is one rule with one exception.

```
MONO   IBM Plex Mono, tabular-nums     the DEFAULT (set on body)
       → every number, every control label, every tag, timestamp,
         address, unit, status string, piece of metadata

SANS   system UI, 600, -0.02em         applied BY ROLE
       → headings and section titles from 14px up, and figures from 22px up
```

`base.css` sets mono on `body` with `font-variant-numeric: tabular-nums`. Sans arrives only via a
type-role class. **The default is mono; you opt into sans.** That inversion is what makes the split
survive contact with a real codebase — a developer who forgets to apply a class gets a mono number,
which is right, rather than a sans number, which is wrong.

Why mono for numbers: tabular figures align in a column, so a stack of currency values scans as a
column of magnitudes rather than a ragged list. Why mono for control labels and metadata: it visually
separates *chrome* from *content* without spending a colour or a weight on the distinction. Why sans
for headings and hero figures: at 22px and up mono's fixed advance width starts to look mechanical
and the tracking goes slack; sans at 600/-0.02em stays dense and confident at any size.

**There are two crossovers, not one, and `base.css` is the authority on both.**

- **Headings are sans from 14px up.** `.mob-title` at 14, `.mob-heading-sm` at 14.5, and every step
  above them. A heading is never mono, at any size.
- **Figures are mono up to and including 16px, and sans from 22px up.** `.mob-figure-sm` is mono at
  exactly 16px — the source's own choice for a mini stat card — and `.mob-figure-md/-lg/-xl` are
  sans 600 at 22 / 23 / 27.

Nothing in the calibrated source sits between 16px and 22px as a figure, and nothing should: that
gap is the line between a number in a layout and a number that *is* the layout. State the rule this
way everywhere. "Sans at 16 and above" is the older, wrong phrasing — at exactly 16px, mono
still wins. `[drv]`

### 3.2 The scale

| Token | px | Prov. | Role in the system |
|---|---:|---|---|
| `--mob-size-3xs` | 9.5 | `[src]` | Uppercase micro-label; the dimmest sub-line |
| `--mob-size-2xs` | 10 | `[src]` | Metadata: sub-lines under a name, axis min/max, share % |
| `--mob-size-xs` | 10.5 | `[src]` | Chip text, footnotes, `updated Ns ago` |
| `--mob-size-sm` | 11.5 | `[src]` | Mono control label (action buttons) |
| `--mob-size-md` | 12 | `[src]` | Entity name in a list row; small body |
| `--mob-size-base` | 12.5 | `[src]` | Reference value line |
| `--mob-size-lg` | 13 | `[src]` | **Body default** (`body` font-size); sans control label |
| `--mob-size-xl` | 14 | `[src]` | Row value; section / column title (sans 600) |
| `--mob-size-2xl` | 14.5 | `[src]` | Card title (sans 600) |
| `--mob-size-3xl` | 16 | `[src]` | Small figure — the largest **mono** figure step |
| `--mob-size-4xl` | 18 | `[src]` | Card heading; large body |
| `--mob-size-5xl` | 22 | `[src]` | Segment hero figure |
| `--mob-size-6xl` | 23 | `[src]` | Card hero figure |
| `--mob-size-7xl` | 27 | `[src]` | Panel hero figure |
| `--mob-size-8xl` | 32 | `[drv]` | Section heading |
| `--mob-size-9xl` | 40 | `[drv]` | Page title (max of a clamp) |
| `--mob-size-10xl` | 48 | `[drv]` | Display, small |
| `--mob-size-11xl` | 64 | `[drv]` | Display, large |
| `--mob-size-12xl` | 80 | `[drv]` | Display, hero |

Everything at and below 27px is `[src]` — these are the measured values of a real high-density
product surface, not a rounded ideal. The half-pixel steps (9.5, 10.5, 11.5, 12.5, 14.5) are load-
bearing: at this density a 0.5px step is a visible tier, and rounding them to integers collapses two
tiers into one.

The scale is not a ratio series, and should not be regularised into one. Adjacent steps like
12 / 12.5 / 13 exist because a dense card genuinely needs three weights of "small text" in one place.
Steps from 32px up *are* a ratio series, because marketing type has no such constraint.

A source value of 11px (the spot readout in the worked example) has no step. Normalise to
`--mob-size-sm` (11.5) or `--mob-size-xs` (10.5); do not add an eleventh small step. `[drv]`

### 3.3 Weights, leading, tracking

Three weights, no more. `700+` is not in the system.

| Token | Value | Use |
|---|---:|---|
| `--mob-weight-regular` | 400 | Everything mono |
| `--mob-weight-medium` | 500 | Sans control labels (primary button) |
| `--mob-weight-semibold` | 600 | Every sans heading and figure, without exception |

| Token | Value | Use |
|---|---:|---|
| `--mob-leading-flat` | 1 | Single-line control labels, where any leading adds phantom height |
| `--mob-leading-display` | 1.0 | Display sizes (48px+) |
| `--mob-leading-tight` | 1.15 | Headings, hero figures |
| `--mob-leading-snug` | 1.3 | Card headings, micro-labels, metadata |
| `--mob-leading-normal` | 1.45 | Body default (`body`), small body |
| `--mob-leading-relaxed` | 1.6 | Prose set in sans |

| Token | Value | Prov. | Use |
|---|---:|---|---|
| `--mob-tracking-label` | `0.7px` | `[src]` | Uppercase micro-labels **only**. Uppercase at 9.5px is unreadable without it. |
| `--mob-tracking-tight` | `-0.02em` | `[src]` | Every sans heading and hero figure. Sans at 600 opens up as it scales; this closes it back. |
| `--mob-tracking-normal` | `0` | | Body copy, and any mono at any size — mono is already spaced by its metrics. |

Tracking is positive **only** on uppercase micro-labels and negative **only** on sans 600. There is
no third case.

### 3.4 The type-role classes

Use these instead of ad-hoc `font-size`. If a screen needs a size that is not here, the screen is
probably wrong — or the scale needs a new role, which is a system decision, not a screen decision.

| Class | Family | Size | Weight | Leading | Tracking | Default colour |
|---|---|---|---:|---|---|---|
| `.mob-display-xl` | sans | `clamp(40px, 6.4vw, 80px)` | 600 | 1.0 | tight | primary |
| `.mob-display-lg` | sans | `clamp(34px, 5vw, 64px)` | 600 | 1.0 | tight | primary |
| `.mob-display-md` | sans | `clamp(28px, 3.6vw, 48px)` | 600 | 1.15 | tight | primary |
| `.mob-heading-xl` | sans | `clamp(24px, 2.6vw, 40px)` | 600 | 1.15 | tight | primary |
| `.mob-heading-lg` | sans | 32 | 600 | 1.15 | tight | primary |
| `.mob-heading-md` | sans | 18 | 600 | 1.3 | tight | primary |
| `.mob-heading-sm` | sans | 14.5 | 600 | 1.3 | tight | primary |
| `.mob-title` | sans | 14 | 600 | 1.3 | inherited | primary |
| `.mob-figure-xl` | sans | 27 | 600 | 1.15 | tight | inherited |
| `.mob-figure-lg` | sans | 23 | 600 | 1.15 | tight | inherited |
| `.mob-figure-md` | sans | 22 | 600 | 1.15 | tight | inherited |
| `.mob-figure-sm` | **mono** | 16 | 400 | 1.15 | — | inherited |
| `.mob-body-lg` | sans | 18 | 400 | 1.6 | 0 | secondary |
| `.mob-body` | sans | 13 | 400 | 1.6 | 0 | secondary |
| `.mob-body-sm` | sans | 12 | 400 | 1.45 | 0 | muted |
| `.mob-value` | mono | 14 | 400 | inherited | — | primary |
| `.mob-value-sm` | mono | 12.5 | 400 | inherited | — | secondary |
| `.mob-meta` | mono | 10.5 | 400 | 1.3 | — | label |
| `.mob-meta-sm` | mono | 10 | 400 | 1.3 | — | label |
| `.mob-dim` | mono | 9.5 | 400 | inherited | — | dim |
| `.mob-label` | mono | 9.5 | 400 | 1.3 | 0.7px | label, **uppercase** |
| `.mob-control-label` | mono | 11.5 | 400 | 1 | — | inherited |

Notes on choosing between them:

- **`.mob-title` vs `.mob-heading-sm`.** `.mob-title` (14px) is the section/column title that opens a
  region — "Portfolio", "Open positions". `.mob-heading-sm` (14.5px) is the title *of an object* — an
  entity name inside a card. Half a pixel apart, different jobs, and the difference reads because the
  contexts never sit side by side. `.mob-title` does not set `letter-spacing`; it inherits. If it sits
  inside a mono-tracked container, set `--mob-tracking-tight` explicitly.
- **The figure classes carry no colour.** That is deliberate: a figure's tone is data-driven, so it
  comes from `[data-mob-sign]` or a `.mob-tone-*` class on the same element.
- **`.mob-meta` vs `.mob-dim`.** `.mob-meta` (10.5px, label tone) is metadata a user might read.
  `.mob-dim` (9.5px, dim tone) is a qualifier on something they are already reading. See the contrast
  verdicts in §2.10 before choosing `.mob-dim`.

### 3.5 Traps

- **No mono paragraphs.** Mono's fixed advance width destroys word-shape recognition; past a sentence
  or two it measurably slows reading. Anything longer moves to `.mob-body` (sans, 1.6 leading).
  Inline mono for a value, an address or a unit inside a sans sentence is correct and expected.
- **No sans numbers below 22px.** `.mob-figure-md` (22px) is the smallest sans figure the system has;
  16px is `.mob-figure-sm` and it is mono. Below that, sans loses the tabular alignment that makes a
  column of figures comparable, and its 600 weight at 12px turns to mud on a dark background. There
  is no exception to this.
- **No more than three type sizes in one compact card.** A card with four sizes has no hierarchy, it
  has a gradient. The worked example's densest card runs 9.5 (label) / 22 (figure) / 9.5 (sub) — two
  distinct sizes doing three jobs, because the label and the sub differ by *tone*, not by size. Reach
  for tone before you reach for another size.
- **Never centre long copy.** Centred text has a ragged left edge, and the left edge is what the eye
  returns to on every line. Centre a headline; never centre a paragraph.
- **No arbitrary bold inside body copy.** Emphasis inside a sans paragraph comes from
  `--mob-fg-primary` against the paragraph's `--mob-fg-secondary`, not from a weight jump. The system
  has no sans 700 to jump to.
- **Uppercase only at `--mob-size-3xs` with `--mob-tracking-label`.** Uppercase anywhere else in this
  system reads as shouting, and uppercase without the tracking is illegible at 9.5px.

---

## 4. Spacing

### 4.1 The public scale

```
0   2   3   4   6   8   10  12  14  16  20  24  32  40  48  64  80  96  128
```

Tokens are `--mob-space-<n>` where `<n>` is the pixel value: `--mob-space-14` is 14px. Naming by
pixels rather than by index means you never have to remember whether `space-4` is 4px or 16px.

It is a 4pt scale with three deliberate intrusions at the bottom — 2, 3, 6, 10, 14 — because a dense
surface needs finer control below 16px than a 4pt grid provides. A 2px gap between composition-bar
segments and a 3px chip inset are real, measured values; forcing them to 4px would visibly thicken
the bar. Above 16px the scale is strictly 4pt and then doubling, because at that size nobody can see
a 2px difference and precision there is false precision.

| Band | Steps | Typical use |
|---|---|---|
| Micro | 2, 3, 4, 6 | Gaps inside a control, bar gaps, chip insets, icon-to-label |
| Component | 8, 10, 12, 14, 16 | Padding inside a card, gaps between rows in a stack |
| Block | 20, 24, 32 | Gaps between cards, grid gutters |
| Section | 40, 48, 64, 80, 96, 128 | Rhythm between page sections |

### 4.2 Why component padding is not on this scale

Card padding in this system is `15px 16px`, not `16px 16px`. That 1px is measured, and it is the
difference between a card that looks square and a card that looks optically balanced once its border
and its first line's cap-height are accounted for.

Rather than add `--mob-space-15` (which every screen would then be free to use for anything), the
value lives in tier 3 as `--mob-card-pad-y`. The public scale stays a rhythm you can read; the
calibrated value stays exact and shared. The full set:

| Token | Value | Prov. |
|---|---:|---|
| `--mob-card-pad-y` / `--mob-card-pad-x` | 15 / 16 | `[src]` |
| `--mob-card-pad-y-sm` / `-x-sm` | 12 / 13 | `[src]` mini stat card |
| `--mob-card-pad-y-lg` / `-x-lg` | 20 / 24 | `[drv]` |
| `--mob-card-gap` | 14 | `[src]` vertical stack in a rail |
| `--mob-chip-pad-y` / `-pad-x` | 3 / 8 | `[src]` |
| `--mob-control-px-sm/md/lg` | 10 / 15 / 18 | `md` is `[src]` |
| `--mob-control-gap` | 6 | `[src]` icon-to-label, action stack |
| `--mob-field-px` | 12 | |
| `--mob-avatar-overlap` | −9 | `[src]` |

**The rule:** if a value is internal to one component family and does not land on the scale, it
becomes a tier-3 token. If it is spacing *between* things, it must come from the scale.

### 4.3 Density zones

One product legitimately needs three spacing temperaments. Rather than let each screen invent its
own, declare the zone and let the tokens move:

```html
<section data-mob-density="marketing">  <!-- hero, landing, empty states -->
<main    data-mob-density="product">    <!-- default app surfaces        -->
<div     data-mob-density="data">       <!-- tables, activity, dense grids -->
```

Exactly five tokens move. Nothing else does.

| Token | `marketing` | `product` (default) | `data` |
|---|---:|---:|---:|
| `--mob-section-gap` | 128 | 64 | 32 |
| `--mob-stack-gap` | 24 | 14 | 8 |
| `--mob-grid-gap` | 32 | 20 | 12 |
| `--mob-card-pad-y` | 24 | 15 `[src]` | 10 |
| `--mob-card-pad-x` | 24 | 16 `[src]` | 12 |

Below 768px the defaults tighten globally — `--mob-section-gap` drops to 40 (marketing to 80) and
card padding to 14/14 — because on a narrow viewport, large section gaps become scroll distance
rather than structure.

**What a density zone never touches: control geometry, radius, border colour, type scale, icon size,
motion.** An M button is the same 34px button with the same 9px radius in a hero and in a table. This
is the whole reason zones are safe to nest: a control dropped into a data zone does not silently
shrink, and a screenshot of one zone can be compared to another without a ruler. If you find yourself
wanting a smaller button in a data zone, the answer is the S size step, not the zone.

Zones nest. A `data` grid inside a `product` main inside a `marketing` page is fine and common — each
`data-mob-density` attribute redefines the five tokens for its subtree.

---

## 5. Layout and grid

### 5.1 Containers and gutters

| Token | Value | Prov. | Use |
|---|---:|---|---|
| `--mob-container-app` | 1460px | `[src]` | Dense product shell. Wide, because a two-column data layout needs the room. |
| `--mob-container-content` | 1280px | `[drv]` | Marketing and editorial pages |
| `--mob-container-prose` | 68ch | `[drv]` | A single column of running text. `ch`, not px, so the measure holds if the font changes. |
| `--mob-gutter-desktop` | 26px | `[src]` | ≥1024px |
| `--mob-gutter-tablet` | 20px | `[drv]` | 768–1023px |
| `--mob-gutter-mobile` | 16px | `[drv]` | <768px |

The app container is deliberately wider than the content container. A product shell earns its width —
more columns visible means less scrolling and fewer context switches. A marketing page does not:
past ~1280px a headline stops being scannable.

### 5.2 The rail + main shell

The canonical two-column product layout: a fixed-width rail of summary and a fluid main region.

```css
.shell {
  max-width: var(--mob-container-app);
  margin-inline: auto;
  padding-inline: var(--mob-gutter-desktop);
  display: flex;
  gap: var(--mob-grid-gap);
  align-items: flex-start;      /* columns size to content, not to each other */
}
.shell__rail { flex: 0 0 var(--mob-rail-width); }   /* 288px [src] */
.shell__main { flex: 1 1 0; min-width: 0; }         /* min-width:0 is not optional */
```

`--mob-rail-width` is `288px` `[src]`. `min-width: 0` on the fluid column is the single most common
omission in this layout: without it a flex child refuses to shrink below its content's intrinsic
width, and one long unbreakable string in a table pushes the whole page into horizontal scroll.

`align-items: flex-start` matters too — with the default `stretch`, a short rail would stretch to
match a long main column and its last card would grow, which is not what a summary rail means.

### 5.3 Grid

12 columns on desktop, 8 on tablet, 4 on mobile, with `--mob-grid-gap` as the gutter throughout.

| Breakpoint | Columns | Gutter source |
|---|---:|---|
| ≥1024px | 12 | `--mob-grid-gap` (20px in `product`) |
| 768–1023px | 8 | `--mob-grid-gap` |
| <768px | 4 | `--mob-grid-gap` |

The column count halves-ish rather than the content reflowing arbitrarily, so a block that spanned
6 of 12 (half) can span 4 of 8 (half) and 4 of 4 (full) by an obvious rule. Because the gutter reads
`--mob-grid-gap`, a `data` zone tightens its grid automatically without a second grid definition.

Alignment rules that keep a multi-column page from disintegrating:

- Major headings align to major content edges — a section title starts on the same x as the content
  below it, never indented into a card's padding.
- Cards do not introduce random internal left boundaries. Everything inside a card starts at the
  card's padding edge unless it is deliberately indented for hierarchy.
- Floating controls may break the grid only deliberately, and only one per view.

### 5.4 The column-header baseline device

Every column in a multi-column shell opens with a header row of the same fixed height,
`--mob-header-row-h` (**34px**, `[src]`), so the first card in each column starts on the same
baseline.

**Why it exists.** Columns have different headers: the rail's is a title plus a chip; the main
column's is a title, a chip, a spacer, a timestamp and a 34px-tall primary button. Left to
themselves, those two rows measure different heights and the first card in each column lands at a
different `y`. The eye reads that misalignment as sloppiness even when it cannot say why — it is the
single most visible defect in a two-column dashboard, and it is invisible in a component-level
review because each column is correct on its own.

Reserve the height with `min-height`, not `height`, so a header that wraps on a narrow viewport grows
instead of clipping. Then make the arithmetic below the row agree:

```css
.col__header { min-height: var(--mob-header-row-h); display: flex; align-items: center; }
```

In the worked example the two columns reach the same baseline by different routes: the rail's header
carries `margin-bottom: -3px` and is followed by the column's own `14px` flex gap (net 11px), while
the main column's header carries `margin-bottom: 11px` with no gap after it. Both resolve to 11px of
space under a 34px row. **If you change either header, re-check that the two numbers still agree** —
this is arithmetic, not a layout that self-corrects.

The generalisation: in any shell where columns own their headers, fix the header row height in a
token and make the space between header and first card resolve to the same value in every column.

---

## 6. Radius

| Token | Value | Prov. | Applies to |
|---|---:|---|---|
| `--mob-radius-2xs` | 3px | `[src]` | Bars, bins, sparkline caps, progress marks |
| `--mob-radius-xs` | 6px | `[src]` | Chips, badges |
| `--mob-radius-sm` | 8px | `[src]` | Control **S** (30px) |
| `--mob-radius-md` | 9px | `[src]` | Control **M** (34px), fields |
| `--mob-radius-lg` | 10px | `[src]` | Control **L** (40px), inner tiles |
| `--mob-radius-xl` | 12px | `[src]` | Cards, panels, modals |
| `--mob-radius-2xl` | 16px | `[drv]` | Marketing surfaces |
| `--mob-radius-3xl` | 24px | `[drv]` | Hero media |
| `--mob-radius-full` | 999px | | Avatars, dots, pills |

**The rule: radius tracks control height.** The 8 / 9 / 10 triple looks like a mistake in a token file
and is the reason an S and an L button read as the same family rather than as two different shapes.
Corner radius is perceived relative to the height it sits in — hold the radius constant across
heights and the small control looks rounder than the large one; scale it proportionally and the
large one looks like a different design language. A +1px step per size step is the compromise that
keeps the *apparent* roundness constant.

The consequence: **never set a radius independently of a size step.** If you write
`height: 36px; border-radius: 9px`, you have invented a size the system does not have and it will
read as a 1px-off duplicate of the M button — precisely the "random 1px differences between same-size
controls" the spec bans. Change the size step instead.

Cards use one dominant radius (`--mob-radius-xl`). Pills (`--mob-radius-full`) are for avatars, dots
and genuinely pill-shaped chips only — not for buttons. Do not mix sharp, rounded and pill cards in
one view without a semantic reason.

---

## 7. Borders and hairlines

Border width is `--mob-border-width` (1px) almost everywhere; `--mob-border-width-strong` (2px)
exists for the avatar cut-out ring and for nothing else so far.

### 7.1 The 1px-gap-over-a-frame technique

The seams between fused segments of one object are **1px gaps in a flex or grid container, over a
frame-coloured parent** — not borders on the segments.

```
  .segmented                                       .segmented__part  (× n)
  ├─ background: var(--mob-bg-frame)   #1c1e22     ├─ background: var(--mob-bg-surface)  #101114
  ├─ border: 1px solid var(--mob-border-default)   ├─ box-sizing: border-box
  ├─ border-radius: var(--mob-radius-xl)           ├─ flex: <grow> <shrink> <basis>
  ├─ display: flex; flex-wrap: wrap                └─ min-width: <floor>
  ├─ gap: 1px
  ├─ overflow: hidden
  └─ align-items: stretch


      outer border  (--mob-border-default)
      │
      ▼
     ┌──────────────────────────────────────────────────────────┐
     │  segment A          │  segment B        │  segment C     │
     │  bg-surface         █  bg-surface       █  bg-surface    │
     │                     █                   █                │
     │                     █                   █                │
     └──────────────────────────────────────────────────────────┘
                           ▲
                           1px flex gap. There is nothing drawn here —
                           the parent's --mob-bg-frame shows through.
                           row-gap does the same for the wrapped row below.
```

```css
.segmented {
  background: var(--mob-bg-frame);
  border: var(--mob-border-width) solid var(--mob-border-default);
  border-radius: var(--mob-radius-xl);
  display: flex;
  flex-wrap: wrap;
  gap: var(--mob-hairline);          /* 1px */
  overflow: hidden;
  align-items: stretch;
}
.segmented__part {
  box-sizing: border-box;
  background: var(--mob-bg-surface);
  padding: var(--mob-card-pad-y) var(--mob-card-pad-x);
}
```

### 7.2 Why gaps and not borders

Four reasons, all of which bite in production:

1. **No doubling.** Two adjacent segments each with a 1px border produce a 2px seam. Fixing that with
   `border-right: 0` on the last child, or with negative margins, is a rule you have to re-derive
   every time the segment order or count changes.
2. **Wrapping is free and correct.** `gap: 1px` gives you `row-gap: 1px` as well, so when segments
   wrap onto a second row the horizontal seam appears automatically, with exactly the same weight, in
   exactly the right place. A border-based seam gets the wrapped case wrong — the segment that was
   last in row 1 still has its right border, now against nothing.
3. **The outer radius stays clean.** `overflow: hidden` on the parent clips the segments' square
   corners to the parent's `--mob-radius-xl`. No segment needs to know it is first or last, and no
   segment needs its own corner radii.
4. **One seam colour, one place.** The seam is the parent's `background`. Changing it is one
   declaration, and it cannot drift between segments.

### 7.3 Requirements

The technique fails silently if any of these are missing:

- **Every segment sets an opaque `background`.** A transparent segment shows the frame colour across
  its whole area, which looks like a hover state stuck on.
- **Every segment sets `box-sizing: border-box`** — inherited from the reset, but a segment with its
  own padding and a percentage basis will overflow without it.
- **Every segment is shrinkable**: give it a `flex` basis *and* a `min-width` floor. This is what
  keeps a segmented card from overflowing a narrow column. `flex: 1 1 252px; min-width: 252px` reads
  as "prefer 252, never go below 252, take a share of the surplus"; a segment that must survive a
  narrow column takes a `min-width` below its basis (`flex: 2 1 240px; min-width: 200px`).
- **Do not put a border on a segment.** If an inner block inside a segment needs a boundary, it is a
  divider — use `--mob-border-subtle` (§2.4).

### 7.4 When a border is still the right answer

Use a real border for the *outside* of an object (`--mob-border-default`), for controls
(`--mob-border-control`), for a divider inside one block (`--mob-border-subtle`), and for a single
free-standing rule between two peers that are not in a gapped container — the vertical seam between
two columns inside one segment, drawn as `width: 1px; align-self: stretch; background:
var(--mob-border-frame)`. Note that even here it is a *background*, not a `border-left`: a stretched
div is centred in the flex gap and does not fight the segment's padding.

---

## 8. Elevation

**Depth in this system comes from surface plus a 1px border. Not from blur.**

| Token | Value | Allowed on |
|---|---|---|
| `--mob-shadow-sm` | `0 1px 2px rgba(0,0,0,.40)` | A sticky header once it has scrolled off the top |
| `--mob-shadow-md` | `0 4px 16px rgba(0,0,0,.40)` | Popovers, dropdowns, toasts |
| `--mob-shadow-lg` | `0 16px 48px rgba(0,0,0,.64)` | Modals |
| `--mob-glow-accent` | `0 0 11px` accent-bright @ 50% `[src]` | The single active/current mark in a data viz |
| `--mob-glow-positive` / `-negative` | `0 0 11px` @ 40% | The same mark, in a signed context |

**Why cards get no shadow.** On a `#0a0b0d` canvas a drop shadow has almost nothing to darken — you
get a smudge, not a lift, and stacking several of them turns the page grey. The 1px
`--mob-border-default` against the canvas does the separation job at a fraction of the visual cost,
and it stays crisp at any zoom. Shadows are therefore reserved for things that are genuinely *over*
the page in the z-stack, where the shadow is doing occlusion rather than decoration. If a card needs
more presence, it needs `--mob-bg-surface-raised` or more space around it, not a shadow.

**When the glow is allowed.** Exactly one case: marking the single current member of a series of
otherwise-identical marks. In the worked example, fifteen range bins are `--mob-accent-deep` at 15px
and the bin containing spot is `--mob-accent-bright` at full height with `--mob-glow-accent`. Three
signals — colour, height, glow — for one mark, because that mark is the answer to the question the
whole visualisation exists to answer.

That is the budget. **One glowing element per view.** A glow on a card, on a button, on a hover state,
or on more than one mark at a time is decoration, and decoration on a near-black canvas is the
fastest way to make a product look cheap. The spec's anti-pattern list bans exactly this.

The focus ring is not a glow. `--mob-focus-ring` is
`0 0 0 2px var(--mob-bg-canvas), 0 0 0 4px var(--mob-focus-color)` — two hard rings, no blur. The
inner canvas-coloured ring is a gap that separates the accent ring from the control's own border, so
the ring stays readable on a control that already has a `--mob-border-control` edge. The focus colour
is `--mob-accent-bright` (10.23:1 on surface), not `--mob-accent` (4.32:1), for the reason in §2.5.
`base.css` applies the ring to every `:focus-visible` globally; components may refine it, and may not
delete it.

---

## 9. Iconography

The source handoff ships **no icon set** — its glyphs are letters in tinted circles and a literal
`···`. Everything in this section is therefore `[drv]`, and the one thing that matters is
consistency, not the specific choice.

| Rule | Why |
|---|---|
| One family, product-wide | Mixed icon families are the single most legible sign of a design system that has stopped being maintained. Pick one and record the choice. |
| One stroke width across all sizes | Keep the stroke constant (do not scale it with the box). A constant stroke at 16 and at 24 reads as one family; a proportionally scaled stroke reads as two weights of icon. |
| No mixed outline/filled | Unless filled *is* the selected state, in which case it is a state, not a style. |
| Icons inherit `currentColor` | So a `.mob-tone-*` class or `[data-mob-sign]` colours the icon and its label together, and an icon can never drift out of sync with the text next to it. |

Boxes:

| Box | Token | Use |
|---:|---|---|
| 16 × 16 | `--mob-control-icon` | Default: inside buttons, fields, chips, menu rows |
| 20 × 20 | `--mob-control-icon-lg` | Large controls, standalone icon buttons |
| 24 × 24 | `--mob-control-icon-xl` | Standalone icon, not paired with a label: illustrative marks, empty states |

Nothing in the calibrated source needed the 24px box; `--mob-control-icon-xl` ships in tier 3 of
`tokens.css` anyway, so that a product which does need it reads one declaration instead of writing
`24px` into five component files. There is no fourth box. An icon that wants 32 or 40 is an
illustration, and an illustration is not sized off the control scale.

Gap from icon to label is `--mob-control-gap` (6px, `[src]`). Any icon that carries meaning on its
own needs a `.mob-sr-only` label or a tooltip; an icon button with neither is invisible to a screen
reader.

---

## 10. Motion

| Token | Value | Use |
|---|---:|---|
| `--mob-duration-instant` | 80ms | Press feedback |
| `--mob-duration-fast` | 120ms | Hover on a control |
| `--mob-duration-normal` | 160ms | Hover on a card, tone changes, most state transitions |
| `--mob-duration-slow` | 220ms | Popover / dropdown enter |
| `--mob-duration-enter` | 260ms | Modal enter |
| `--mob-ease-standard` | `cubic-bezier(.2, 0, 0, 1)` | Default. State changes both directions. |
| `--mob-ease-enter` | `cubic-bezier(.16, 1, .3, 1)` | Things arriving |
| `--mob-ease-exit` | `cubic-bezier(.4, 0, 1, 1)` | Things leaving |
| `--mob-press-scale` | `.985` `[src]` | The press state of every button |

Durations sit in the handoff's stated 100–200ms band for interaction, with two longer steps for
overlays. Easings are `[drv]` — the source declares durations in prose and no curves. All three
easings end flat (`…, 0, 1` / `…, .3, 1`), which is what makes a 120ms transition feel like it
arrives rather than like it stops.

### The transform/opacity-only policy

**Animate `transform` and `opacity`. Nothing else.**

Three reasons, in order of how often they bite:

1. **No layout shift.** Animating `width`, `height`, `padding`, `margin` or `top` moves everything
   after the element. On a dense surface that is a whole column twitching, and "layout shifts on
   hover" is on the spec's anti-pattern list for good reason.
2. **No jank.** `transform` and `opacity` are composited; the others force layout and paint on every
   frame. A dashboard with fifty animatable rows drops frames on the first hover.
3. **It forces restraint.** With only two properties available, "hover" becomes a 1–2px translate, a
   tone change or a border change — never a lift-plus-scale-plus-glow-plus-rotate. Colour and
   background changes are `transition`-able too and are the system's default hover mechanism; they
   are cheap because they do not trigger layout.

Press is `transform: scale(var(--mob-press-scale))` — `.985`, which is a 1.5% dent. It is felt more
than seen, which is the point. Dramatic 1.05–1.10 scaling is banned.

Reduced motion is handled **globally** in `reset.css`: under `prefers-reduced-motion: reduce`, all
animation and transition durations collapse to `0.01ms` and `scroll-behavior` becomes `auto`.
Components do not get to opt out, and you do not need to write the media query again in a component.
If a component's behaviour depends on a transition *completing* (a `transitionend` listener), it must
work when that transition takes 0.01ms.

---

## 11. Z-index

| Token | Value | Layer |
|---|---:|---|
| `--mob-z-base` | 0 | Normal flow |
| `--mob-z-raised` | 10 | An element lifted within its own container |
| `--mob-z-sticky` | 100 | Sticky headers, sticky table columns |
| `--mob-z-dropdown` | 200 | Select menus, comboboxes |
| `--mob-z-popover` | 300 | Popovers, context menus |
| `--mob-z-modal-backdrop` | 400 | Modal scrim |
| `--mob-z-modal` | 410 | Modal dialog |
| `--mob-z-toast` | 500 | Toasts — above a modal, because a toast may report the modal's outcome |
| `--mob-z-tooltip` | 600 | Tooltips — above everything, because they can be triggered from anything |

**No arbitrary values. Ever.** Not `9999`, not `z-index: 1` "just to fix this one thing". The ladder
has 100-unit gaps precisely so that a genuinely new layer can be inserted between two existing ones
by adding a token, which is a system decision someone reviews. A literal `z-index` in a component is
a decision nobody reviews, and it is the reason every mature codebase eventually contains a
`z-index: 999999`.

Two things worth knowing when the ladder appears not to work:

- Z-index only compares siblings within a stacking context. A `--mob-z-tooltip` inside a card that has
  `transform`, `filter`, `opacity < 1` or `will-change` will not escape that card. Portal the overlay
  to the document root instead of raising its number.
- The 10-unit gap between backdrop and modal (400 / 410) is the only place two layers are deliberately
  adjacent — they are one component and must stay glued.

---

## 12. Breakpoints and responsive posture

| Token | Value | Meaning |
|---|---:|---|
| `--mob-bp-sm` | 640px | Large phone |
| `--mob-bp-md` | 768px | Tablet — the layout's real hinge |
| `--mob-bp-lg` | 1024px | Small desktop |
| `--mob-bp-xl` | 1280px | Desktop |
| `--mob-bp-2xl` | 1536px | Wide desktop |

**Practical note:** CSS custom properties do not work inside media query conditions —
`@media (max-width: var(--mob-bp-md))` silently does nothing. `tokens.css` itself writes the literal
(`@media (max-width: 767px)`). The tokens exist to be consumed by JS, by a Tailwind config, and by
Figma; in CSS you write the literal, and these values are the canonical literals to write. Use
`767px` for "below md" so the two sides do not both match at exactly 768.

Breakpoints are named by size, not by device, and the layout should change where *it* breaks — a
container query or an intrinsic `flex-basis` floor is usually better than a breakpoint. The segmented
card in §7 reflows purely on its segments' `min-width` values and needs no media query at all; that
is the preferred posture.

### Desktop → tablet

- Reduce the gutter (`--mob-gutter-desktop` → `--mob-gutter-tablet`).
- Collapse multi-column sections; the rail moves above main, full width.
- Grid goes 12 → 8.
- Reduce display typography — the `clamp()` in the display and heading classes already does this
  continuously, so there is no jump to author.
- Preserve hierarchy. Reordering is fine; re-ranking is not.

### Tablet → mobile

- Side-by-side blocks become vertical flow. Grid goes 8 → 4.
- Primary actions expand to available width where that reads as the main action of the view.
- Complex navigation becomes a menu or drawer.
- Section rhythm tightens automatically (the `max-width: 767px` block in `tokens.css`).
- **Touch targets reach 44px** — `--mob-tap-target`. `base.css` enforces this under
  `@media (pointer: coarse)` with a centred `::after` pseudo-element on `.mob-btn`, `.mob-icon-btn`,
  `.mob-tab` and `.mob-menu-item`, so the *hit area* grows to 44px without the control's painted size
  changing. This is why a 30px S button is still legal on mobile: it looks 30px and it is 44px to a
  thumb.
- Avoid tiny two-column cards unless the content genuinely supports them. Two 10px numbers side by
  side on a 375px screen are two unreadable numbers.

### Type on mobile

Display and heading roles are already fluid via `clamp()` (§3.4), so they scale continuously and never
jump at a breakpoint. Do not add breakpoint-based `font-size` overrides on top of them — you will get
a step change in the middle of the clamp's range, which is worse than either approach alone. Every
size below 32px is fixed on purpose: at that density, scaling type down on mobile makes it illegible
rather than proportionate.
