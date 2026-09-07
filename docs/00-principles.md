# 00 — Principles

The constitution of mob-design. Everything else in this repository — tokens, base styles,
components — is an implementation of the twelve rules below. When a token and a rule disagree, the
rule is right and the token is a bug.

**The system in one paragraph.** Dark, near-black canvas. Depth comes from a surface change plus a
1px border, never from a drop shadow. Two type families with one job each: IBM Plex Mono with
tabular numerals for every number, control label and piece of metadata; system sans at 600 weight
and `-0.02em` tracking for headings from 14px up and for figures from 22px up — a 16px figure stays
mono, which is the deliberate crossover, not an oversight. Hairlines between fused segments are
1px *gaps* over a frame-coloured parent, not borders. Accent is scarce, action tones are muted at
rest, and saturation is spent only on hover. Compact controls, generous section spacing. Three
declared density zones — marketing, product, data — that move rhythm without ever moving control
geometry.

Provenance markers carry through from `css/tokens.css`: **[src]** = measured from the calibrated
handoff; **[drv]** = extended from a stated rule.

---

## 1. Hierarchy before decoration

Every screen has exactly one obvious focal point. Rank everything else below it, in this order:

1. primary action or key figure
2. page / section title
3. supporting content
4. secondary controls
5. metadata
6. ambient or decorative elements

**Why.** On a near-black canvas with a restrained palette there is no spare contrast to fix a flat
composition after the fact. If two unrelated elements land at equal weight, the reader has to do
the ranking work themselves, on every visit. Rank once, in the design.

**Failure mode.** Two 22px figures in one card, neither of which is the answer to the question the
user opened the card to ask.

---

## 2. The reference number is never the biggest number

Rank figures by **user intent**, not by magnitude, not by which value the backend considers
canonical. The figure the user came for is the largest; a figure they need only to interpret it is
demoted, even when it is numerically the biggest thing on screen.

Worked example [src] — the dashboard the tokens were measured from. The brief said the emphasis is
earnings, so:

| Figure | Role | Type role | Size |
|---|---|---|---:|
| Fees, PnL | what the user came for | `.mob-figure-md` (sans 600) | `--mob-size-5xl` 22px |
| Position value | reference: makes the above legible | `.mob-value-sm` (mono) | `--mob-size-base` 12.5px |

Position value is a larger *number* than fees by three orders of magnitude, and it is rendered
smaller than a chip label. That is the rule working.

The general ladder:

| Rank | Content | Type role |
|---:|---|---|
| 1 | the figure the brief names as the point | `.mob-figure-xl` / `-lg` / `-md` |
| 2 | section or column title | `.mob-title` |
| 3 | supporting values | `.mob-value` |
| 4 | reference values | `.mob-value-sm` |
| 5 | labels, meta, provenance | `.mob-label`, `.mob-meta`, `.mob-dim` |

**Why.** Size is read before content. Sizing by magnitude tells the user what is big; sizing by
intent tells them what to do. Only one of those is a design decision.

**How to apply it.** Before opening an editor, write one sentence: *"The user opened this screen to
find out ___."* That blank is rank 1. Everything else steps down. If the sentence is hard to write,
the screen has no hierarchy to design yet.

---

## 3. Minimal surface count

Four elevation steps. There is no fifth.

```
--mob-bg-canvas          #0a0b0d  [src]  the page
--mob-bg-sunken          #0e0f12  [src]  wells, alt panels, field interiors
--mob-bg-surface         #101114  [src]  cards, panels, fused segments
--mob-bg-surface-raised  #131417  [src]  chips, menus, things on top of a card
```

Everything else in the surface group is a **role**, not a new level: `--mob-bg-tile` (an inner tile
inside a card), `--mob-bg-hover`, `--mob-bg-active`, `--mob-bg-selected`, `--mob-bg-frame`,
`--mob-bg-overlay`, `--mob-bg-elevated`, `--mob-bg-disabled`. They alias greys that already exist in
the ramp. Adding a *role* is a normal day; adding a *level* is a system change.

**Why.** The neutral ramp between `--mob-gray-1000` and `--mob-gray-720` spans roughly twenty
luminance units in total. Four steps inside that band are already close to the discrimination
threshold. A fifth step is invisible to the user and merely doubles the number of hairline colours
that have to work against it.

---

## 4. Structure over decoration

Depth is expressed as **surface change + 1px border**. Not shadow, not blur, not a gradient.

```css
.mob-card {
  background: var(--mob-card-bg);                                /* --mob-bg-surface     */
  border: var(--mob-border-width) solid var(--mob-card-border);  /* --mob-border-default */
  border-radius: var(--mob-card-radius);                         /* --mob-radius-xl      */
}
```

Borders are a five-step vocabulary, each with a job:

| Token | Job |
|---|---|
| `--mob-border-subtle` | divider *inside* one surface |
| `--mob-border-frame` | seam between fused segments |
| `--mob-border-default` | boundary of a card or panel |
| `--mob-border-control` | chips, inputs, ghost controls |
| `--mob-border-strong` | selected / emphasised |

Fused segments get their seams from **1px gaps over a frame-coloured parent**, not from per-segment
borders [src]:

```css
.mob-segmented {
  background: var(--mob-bg-frame);              /* becomes the hairlines */
  border: var(--mob-border-width) solid var(--mob-border-default);
  border-radius: var(--mob-card-radius);
  display: flex; flex-wrap: wrap;
  gap: var(--mob-hairline);                     /* column AND row: a wrapped seam is a hairline too */
  overflow: hidden;
}
.mob-segmented__seg { background: var(--mob-card-bg); box-sizing: border-box; }
```

**Why.** Borders double at every adjacency, so a grid of bordered segments produces 2px seams in the
middle and 1px seams at the edge — a drift the eye reads as sloppiness. Gaps over a frame cannot
double. They also survive wrapping: the seam is correct whether the segments sit in one row or
three.

`--mob-shadow-sm/md/lg` exist for genuinely floating layers — menus, popovers, modals — because
those must separate from *unknown* content beneath them. A card is not a floating layer.

`--mob-glow-accent` [src] has exactly one sanctioned use: marking the single live value in a data
visualisation (in the handoff, the bin containing spot price). Glow on a container is decoration.

---

## 5. Contrast is structural

Get contrast from size, weight, luminance, spacing, opacity and placement — in that order of
preference — before reaching for a colour.

**Why.** The palette carries meaning (rule 6). Every hue spent on "making this section more
interesting" is a hue that can no longer mean *positive*, *negative* or *this entity*. Structural
contrast is unlimited and free; chromatic contrast is a fixed budget.

The text ramp is the structural tool, not a set of moods:

```
--mob-fg-primary    #e8eaed   values, headings, the answer
--mob-fg-secondary  #cfd3da   names, supporting values
--mob-fg-muted      #8f959e   meta on a raised surface
--mob-fg-label      #767c86   micro-labels, sub-lines
--mob-fg-dim        #5d636c   provenance, timestamps, "all-time"
```

Five steps of grey do more hierarchy work here than any accent will.

---

## 6. Colour carries meaning, not mood

Every hue in this system denotes something. Decorative colour is banned.

| Hue | Means | Tokens |
|---|---|---|
| Violet | the product's own action / brand | `--mob-accent`, `--mob-accent-bright` |
| Green | positive value, money in | `--mob-positive`, `--mob-affirm-*` |
| Red | negative value, destructive action | `--mob-negative`, `--mob-destroy-*` |
| Amber | warning [drv] | `--mob-warning` |
| Blue | information [drv] | `--mob-info` |
| Series 1–8 | *this specific entity*, stable across the app | `--mob-series-N`, `-tint`, `-glyph` |

Consequences that follow directly:

- A number that flips sign flips tone and changes nothing else. Bind it to the data:
  `<span data-mob-sign="negative">` or `.mob-tone-negative`.
- An entity keeps its series colour everywhere it appears — chart, composition bar, avatar tint,
  row accent. A colour that means "ETH" in one card and "series 1" in another means nothing.
- No hue may be chosen because a section looked plain. If the section looks plain, it has a
  hierarchy problem (rule 1), and colour will hide it rather than fix it.

**Why.** The reader learns the mapping in the first thirty seconds and then relies on it without
looking. One decorative green destroys that reflex permanently — after it, green has to be read
rather than recognised.

---

## 7. Intent must read without glowing

Action tones are **muted at rest**. Saturation is a hover reward.

```css
.mob-btn--affirm,
.mob-icon-btn--affirm {
  --mob-btn-bg:     var(--mob-affirm-bg);      /* #111a16 [src] */
  --mob-btn-fg:     var(--mob-affirm-fg);      /* #7fbfa2 [src] */
  --mob-btn-border: var(--mob-affirm-border);
}
.mob-btn--affirm:hover,
.mob-icon-btn--affirm:hover {
  --mob-btn-bg:     var(--mob-affirm-bg-hover);
  --mob-btn-fg:     var(--mob-affirm-fg-hover);
  --mob-btn-border: var(--mob-affirm-border-hover);
}
```

`.mob-btn--destroy` / `.mob-icon-btn--destroy` is the same construction in red, over
`--mob-destroy-*`. Both triplets are [src] — measured, not mixed by eye. Note that the variant sets
the button's own tokens rather than `color` and `background` directly: that is what lets a size
modifier, a loading state and a tone modifier compose without fighting each other.

**Why.** A dense surface shows many rows at once. If every row's "collect" button were
`--mob-positive` at full saturation, the page would read as a wall of alarms and the one row that
actually needs attention would have no way to stand out. Muting at rest keeps the page calm, keeps
the *meaning* legible (the green still says "money in" at a glance), and reserves saturation for the
row the pointer is on — which is, by definition, the only row the user is currently considering.

Need this treatment for a new semantic? Do not pick three colours by eye. Use the recipe in
`css/brand.css`:

```css
--tone-fg:     color-mix(in oklab, <hue> 62%, var(--mob-fg-secondary));
--tone-bg:     color-mix(in oklab, <hue> 11%, var(--mob-bg-canvas));
--tone-border: color-mix(in oklab, <hue> 20%, var(--mob-border-frame));
```

`--mob-warn-*` is that recipe already applied [drv].

---

## 8. Two families, one job each

| Family | Applies to | Rule |
|---|---|---|
| `--mob-font-mono` | every number, control label, tag, timestamp, address, metadata | always `tabular-nums` |
| `--mob-font-sans` | headings and hero figures **only** | always 600, always `--mob-tracking-tight` |

The boundary is a size, not a taste — and there are two of them, because headings and figures cross
over at different points. **Headings are sans from 14px up**: `.mob-title` at 14, `.mob-heading-sm`
at 14.5, everything above. A heading is never mono. **Figures are mono up to and including 16px and
sans from 22px up**: `.mob-figure-sm` is mono at exactly 16px, and `.mob-figure-md/-lg/-xl` are sans
600 at 22/23/27. Nothing in the system sits between 16 and 22 as a figure, and nothing should — that
gap is the line between a number in a layout and a number that *is* the layout. Prose longer than a
sentence or two moves to sans at 1.45+ leading (`.mob-body`), because mono at paragraph length is
slow to read.

**Why.** Tabular numerals make columns of figures comparable without alignment hacks, and mono
metadata gives the product surface its instrument-panel register. Sans 600 with negative tracking
gives the few large moments their weight. Mixing the jobs collapses both effects: a mono headline
reads as a terminal, a sans 11px label reads as a website.

---

## 9. Dense controls, spacious composition

Compact controls; generous space between sections.

```
--mob-control-h-sm  30px      --mob-section-gap  64px (product zone)
--mob-control-h-md  34px      --mob-stack-gap    14px [src]
--mob-control-h-lg  40px      --mob-grid-gap     20px [src]
--mob-chip-pad-y     3px [src]
--mob-chip-pad-x     8px [src]
```

**Why.** This combination is what makes a screen read as a product rather than as a dashboard
template. Padded controls plus tight sections produce a page of same-weight blocks with no rhythm;
compact controls plus generous sections let spacing communicate structure *before* a divider line is
needed. Reach for a divider only when spacing has already failed.

---

## 10. Density is declared, not improvised

A product legitimately needs three spacing temperaments. Declare which one a region is in; do not
let each screen invent its own.

```html
<section class="mob-section" data-mob-density="marketing">  <!-- hero, landing, empty states -->
<main    class="mob-main"    data-mob-density="product">    <!-- default app surfaces -->
<div     class="mob-stack"   data-mob-density="data">       <!-- tables, activity, dense grids -->
```

| Zone | `--mob-section-gap` | `--mob-stack-gap` | `--mob-grid-gap` | card padding |
|---|---:|---:|---:|---:|
| marketing | 128px | 24px | 32px | 24 / 24 |
| product | 64px | 14px | 20px | 15 / 16 [src] |
| data | 32px | 8px | 12px | 10 / 12 |

**Only rhythm and card padding move.** Control geometry, radius, type scale and colour do not: an M
button is the same 34px button in all three zones.

**Why.** Density is a property of the *content*, so it belongs to the container, not to the
component. Encoding it in the component instead produces `<Button size="md" dense>` and, three
months later, four subtly different buttons. Declaring it on the region also makes the decision
reviewable — you can see it in the markup instead of inferring it from padding.

---

## 11. Exactness is the brand

If two components serve the same function they share height, radius, padding, icon size, text style,
gap, hover behaviour and focus behaviour. **A 1px drift between two instances of the same control is
a bug**, not a detail.

Geometry moves as a set, per size step — never independently:

| Step | Height | Padding-x | Radius |
|---|---:|---:|---|
| S | `--mob-control-h-sm` 30px | `--mob-control-px-sm` 10px | `--mob-radius-sm` 8px |
| M | `--mob-control-h-md` 34px | `--mob-control-px-md` 15px [src] | `--mob-radius-md` 9px |
| L | `--mob-control-h-lg` 40px | `--mob-control-px-lg` 18px | `--mob-radius-lg` 10px |

Do not set an ad-hoc `height` on a control. Change its size step.

Off-scale measured values are legitimate — a card's 15px/16px padding is a real measurement from a
real dense surface, not a failure of the 4pt scale. They live in the component tier of `tokens.css`
(`--mob-card-pad-y`, `--mob-card-pad-x`) precisely so that *every* card reads the same token and two
cards can never drift apart.

**Why.** This system has no shadows, no gradients and almost no colour. Precision is the only thing
carrying the impression of quality. In a decorated system a 1px inconsistency hides under the
decoration; here it is the most visible thing on the screen.

---

## 12. One interaction language

Hover, press and focus behave the same way across a component class. The mechanisms are fixed:

```
hover   background / border / text-colour shift   --mob-duration-fast    120ms   .mob-transition-fast
press   transform: scale(var(--mob-press-scale))  --mob-duration-instant  80ms   .mob-press   /* .985 [src] */
enter   opacity + 4–8px translate                 --mob-duration-normal  160ms   .mob-enter .mob-enter--rise
```

Those classes in `css/components/motion.css` are the vocabulary; a component that needs one of these
behaviours composes the class rather than restating the timing. Animate `transform` and `opacity`
only. No bounce. Never combine lift + scale + glow.

Focus is not optional. `base.css` puts `--mob-focus-ring` on every `:focus-visible` element,
including ones a component author forgot. A component may *refine* the ring; it may not delete it.
The source prototype omitted keyboard focus entirely — this system does not, and that is a
deliberate departure, not an oversight to be tidied away.

`@media (prefers-reduced-motion: reduce)` is handled globally in `reset.css`. Individual components
do not opt out.

**Why.** Interaction is a language: if each card invents its own hover, the user has to test every
element to learn what is clickable. Consistent feedback means one lesson, learned once.

---

## How to decide

When two people disagree about a design, resolve it in this order. Stop at the first level that
gives an answer.

```
accessibility  >  hierarchy  >  consistency  >  density  >  taste
```

1. **Accessibility.** Contrast, visible focus, semantic elements, hit targets (`--mob-tap-target`,
   44px), colour never the sole status signal, reduced motion honoured. Non-negotiable — it does not
   trade against anything below it.
2. **Hierarchy.** Does the change make the rank-1 element easier to find? A prettier screen that
   buries the answer loses.
3. **Consistency.** Does an existing token or component already solve this? Reuse beats a better
   one-off, because the one-off becomes the second version of a thing that must now be maintained in
   two places.
4. **Density.** Does it fit the declared zone? Marketing air inside a data table is as wrong as
   table density in a hero.
5. **Taste.** Only here, and only when the four above are satisfied and silent. Most arguments never
   reach this level; the ones that do are cheap, because by then either answer is defensible.

If a screen keeps requiring values that are not in the system, that is not a licence to add them
ad hoc — it is evidence the system is incomplete. Fix it in `tokens.css`, with a provenance marker,
once.

---

## The canonical rule

**Do not reproduce this system by copying screenshots element by element. Reproduce the system of
constraints that causes every screen to look related.**

```
same typography logic
+ same spacing rhythm
+ same surface hierarchy
+ same component geometry
+ same interaction language
+ same restraint
= a coherent product
```

The measured dashboard is where the numbers came from; it is not the design. A screen built from
these constraints will belong to the system even if it shares no layout, no domain and no component
with anything in this repository. A screen traced from the dashboard, but built on invented values,
will not.
