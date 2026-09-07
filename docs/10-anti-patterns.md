# 10 — Anti-patterns

Things that will look defensible in isolation and wrong in this system. Each entry says **why it
breaks mob-design specifically** — not why it is generically bad taste — and what to do instead. A
rule without a reason gets ignored the first time it is inconvenient.

Read `00-principles.md` first; every entry here is a principle failing.

---

## Colour

### Rainbow gradients

**Why it breaks.** Colour denotes meaning here (principle 6): violet = action, green = positive,
red = negative, series 1–8 = *this entity*. A gradient sprays four unowned hues across a surface and
the reader can no longer tell a meaningful colour from a decorative one.
**Instead.** Structural contrast — size, weight, luminance, spacing. If a surface needs to feel
special, give it `--mob-radius-2xl` and marketing density, not a gradient.

### Five shades of accent used decoratively

**Why it breaks.** The accent family (`--mob-accent`, `-hover`, `-pressed`, `-deep`, `-bright`) is a
*state* ladder for one action, not a palette. Spending `--mob-accent-deep` on a decorative divider
means the pressed state of a button is now also the colour of a line that does nothing.
**Instead.** One accent per view, on the one primary action. `--mob-accent-tint` /
`--mob-accent-tint-strong` exist for entity tints (avatar backgrounds), not for panels.

### Colour as the only status signal

**Why it breaks.** Fails accessibility, which sits above everything else in the decision order. It
also fails in this system's own terms: `--mob-positive` and `--mob-negative` sit on the same
luminance tier, so a red figure and a green figure are *identical* in greyscale and to a large share
of colour-blind readers.
**Instead.** Pair the tone with a sign, a word or an icon — `+$0.2195` / `−1.36%`, `In range` /
`Above · sold`. Colour confirms the signal; it never carries it alone.

### Hardcoded hex in a component

**Why it breaks.** The whole retheme contract is "redefine the semantic tier, keep the primitives".
One literal `#101114` in a component silently opts that component out of light mode, out of
`brand.css`, and out of every future palette change — and it will be found by a user, not by you.
**Instead.** Components read tier-2 (semantic) or tier-3 (component) tokens only. Never a primitive
directly, never a literal.

```bash
# runs clean, or the change does not land
grep -nE '#[0-9a-fA-F]{3,8}\b' css/components/*.css
```

---

## Surface, depth and shape

### A fifth background level

**Why it breaks.** The four steps live inside a ~20-unit luminance band on a near-black canvas
(principle 3). A fifth is below the discrimination threshold — invisible to the user, but it doubles
the hairline colours that must work against it.
**Instead.** Add a *role* alias to an existing grey (`--mob-bg-tile` is one), or ask whether the
block needs a surface at all. Most nested blocks need spacing, not a background.

### Heavy shadows on all cards

**Why it breaks.** Depth in this system is surface + 1px border. A drop shadow on a card claims the
card is floating above the page, which it is not, and on a `#0a0b0d` canvas a black shadow is
invisible anyway — it only muddies the border it sits under.
**Instead.** `--mob-bg-surface` + `--mob-border-default`. `--mob-shadow-md` / `-lg` are reserved for
things that genuinely float over unknown content: menus, popovers, modals, toasts.

### Excessive glassmorphism / excessive blur

**Why it breaks.** `backdrop-filter` on a dark, low-contrast palette turns a 1px `#1e2024` border
into mush and drags whatever is underneath into the text's contrast calculation — so the same label
passes contrast over one scroll position and fails over the next.
**Instead.** An opaque surface. Blur is acceptable only behind a full-screen scrim
(`--mob-bg-overlay`), where nothing has to stay readable.

### Giant 32px radii everywhere

**Why it breaks.** Radius is keyed to control size, not to taste — 8/9/10 for S/M/L controls, 12 for
cards. That tracking is what makes an S button and an L button read as the same family. A 32px
radius on a 34px-tall control makes it a pill, which in this system means something else.
**Instead.** The scale, unchanged: `--mob-radius-xs` 6 (chips) · `sm` 8 · `md` 9 · `lg` 10 · `xl` 12
(cards). `2xl` 16 and `3xl` 24 are [drv], for marketing surfaces and hero media only.

### A new radius value

**Why it breaks.** Every radius already has an owner. An 11px card next to a 12px card is exactly
the kind of 1px drift principle 11 calls a bug — visible precisely because there is no decoration to
hide it.
**Instead.** Pick the nearest existing step. If none fits, that is a system decision: add it to
`tokens.css` with a provenance marker, and state what owns it.

### Every element inside a pill

**Why it breaks.** `--mob-radius-full` is a signal — it marks compact, self-contained metadata.
Applying it to cards, rows and buttons spends the signal and leaves nothing to mark chips with.
**Instead.** Pills for chips, tags and counts. Rectangles with the control radius for everything a
user acts on.

### Decorative borders around every nested block

**Why it breaks.** The border vocabulary is five steps with five jobs
(`subtle` / `frame` / `default` / `control` / `strong`). Boxing every nested element inside a card
uses `default` where `subtle` — or nothing — belongs, and produces the grid-heavy enterprise look
the system exists to avoid.
**Instead.** Separate nested content with `--mob-stack-gap` first, then a single
`border-top: 1px solid var(--mob-border-subtle)` if a seam is genuinely needed.

### Borders where hairlines belong

**Why it breaks.** Bordering each segment of a fused card doubles every internal seam to 2px while
the outer seam stays 1px. Wrapping makes it worse, because which seams double changes with the
breakpoint.
**Instead.** 1px `gap` over a `--mob-bg-frame` parent, segments painted `--mob-bg-surface`. See
principle 4 for the exact block.

---

## Typography

### Mono body paragraphs

**Why it breaks.** `<body>` defaults to `--mob-font-mono` because a product surface is mostly
numbers and metadata — not because prose should be monospaced. At paragraph length mono is
measurably slower to read and the uniform advance width destroys word shape.
**Instead.** `.mob-body` / `.mob-body-lg` — sans, 1.45–1.6 leading — for anything longer than a
sentence or two.

### Sans numbers below 22px

**Why it breaks.** The mono/sans boundary is a size, not a preference (principle 8). Below the hero
sizes sans loses `tabular-nums`, so a column of figures stops aligning and a live-updating value
visibly jitters as digits change width.
**Instead.** Mono up to and including 16px, always. Sans 600 starts at 22px, for hero figures only
(`.mob-figure-md/-lg/-xl`); `.mob-figure-sm` stays mono at 16px on purpose, and there is no figure
role between the two.

### Thin, low-contrast body copy

**Why it breaks.** The grey ramp bottoms out at `--mob-fg-dim` #5d636c for a reason: it is for
timestamps and provenance, at 9.5–10.5px, in short bursts. Setting a paragraph in it fails contrast
and makes the whole page look like it is loading.
**Instead.** `--mob-fg-secondary` for body copy, `--mob-fg-muted` for supporting copy. Reserve
`--mob-fg-label` and `--mob-fg-dim` for labels and metadata.

### Excessive uppercase text

**Why it breaks.** Uppercase plus `--mob-tracking-label` (0.7px) is the system's micro-label — 9.5px,
`.mob-label`, one line, titling a data block. Uppercasing a heading or a button borrows that signal
and slows reading, since uppercase strips the word shapes the eye uses to scan.
**Instead.** Uppercase only at `.mob-label`. Headings are sentence case in sans 600.

### More than three type sizes in one compact card

**Why it breaks.** A card at `--mob-card-pad-y` 15px has room for a label, a figure and a sub-line.
A fourth size does not add hierarchy at that scale — it adds noise, and the sizes are close enough
(9.5 / 10.5 / 12 / 12.5) that the extra step reads as an accident.
**Instead.** Label + figure + sub. If the content genuinely needs a fourth level, it needs a
different container.

### Excessive centred copy

**Why it breaks.** Centred text has a ragged left edge, and this system leans on strong vertical
axes — a card's content edge is a structural line, not a suggestion. Centring breaks the axis that
makes a dense column scannable.
**Instead.** Left-align by default. Centring is for a hero headline and an empty state, and only for
one to two lines.

---

## Motion and interaction

### A card that lifts on hover

**Why it breaks.** Translating a card moves the content of every neighbouring card in the reader's
peripheral vision, and in a fused segmented card it opens a visible crack in the 1px hairline grid.
The lift also implies a shadow the system does not have.
**Instead.** Change the surface: `--mob-bg-surface` → `--mob-bg-hover`, or step the border to
`--mob-border-hover`. Cheap, composited, and it never disturbs a neighbour.

### Dramatic 1.05–1.10 card scaling

**Why it breaks.** Scaling a card blurs its 1px border and its text for the duration of the
animation, and this system's whole quality signal is that 1px edges are crisp.
**Instead.** `--mob-press-scale` (.985) [src] on press, for controls only. Never on a container.

### Layout shifts on hover

**Why it breaks.** Any hover that changes size, padding or border-*width* re-flows the row and can
move the target out from under the pointer — which on a dense list means the user clicks the wrong
row. It also breaks the 1px seam alignment across a wrapped card.
**Instead.** Animate `transform` and `opacity` only; change border *colour*, never width. Reserve
the space a hover-revealed action will occupy.

### Every card with its own hover effect

**Why it breaks.** Hover is a language (principle 12). If each component answers differently, the
user has to probe the page to learn what is interactive instead of learning the rule once.
**Instead.** One mechanism per component class, at `--mob-duration-fast`, consistently applied.

### Animated gradients behind body text

**Why it breaks.** Contrast becomes a function of time — the same text passes and fails as the
animation cycles — and it repaints continuously behind content the user is trying to read.
**Instead.** Nothing behind body text. Ambient treatment belongs in marketing zones, away from
anything that must be read.

### Removing the focus outline

**Why it breaks.** `base.css` guarantees `--mob-focus-ring` on every `:focus-visible` element,
including ones a component author forgot; `reset.css` drops the default ring *only* because that
replacement is guaranteed to follow. A component that clears `box-shadow` on focus removes the last
line of defence.
**Instead.** Refine the ring — `--mob-focus-ring-inset` where an outer ring would be clipped — but
never delete it.

---

## Components and information design

### A variant created for a one-off visual requirement

**Why it breaks.** Variants encode *semantics* — `primary`, `danger`, `selected`. A variant that
encodes "the one on the settings page that is narrower" turns a component API into a list of
screens, and every future change has to be applied N times.
**Instead.** Compose it: pass the layout in, or set a component token on the instance. If the same
one-off appears three times, it was a semantic after all — name it and add it properly.

### Random 1px differences between same-size controls

**Why it breaks.** With no shadows, gradients or decoration to hide behind, a 1px discrepancy is the
most visible thing on the screen. It reads as carelessness applied to the whole product, because the
user cannot tell which parts you *were* careful about.
**Instead.** Never set an ad-hoc `height` on a control — change its size step. Height, padding and
radius move together: `--mob-control-h-md` / `--mob-control-px-md` / `--mob-radius-md`.

### Unrelated icon families

**Why it breaks.** Icons sit next to labels at `--mob-control-gap` 6px and inherit text colour. Two
families means two stroke weights and two optical sizes side by side at 16px, where the difference
is impossible to unsee and impossible to fix with spacing.
**Instead.** One family, one stroke language, `--mob-control-icon` (16px) in controls,
`--mob-control-icon-lg` (20px) standalone. Mixed outline/filled only to express a selected state.

### A toast carrying information the user must act on later

**Why it breaks.** Toasts live at `--mob-z-toast` for a few seconds and then are gone forever, with
no history. Anything actionable inside one is lost to anyone who looked away, switched tabs, or uses
a screen reader that announced it mid-sentence.
**Instead.** Toasts confirm what already happened ("Position closed"). Anything the user must act on
belongs in the surface it concerns — an inline error with a retry, a banner, a row state.

### Breadcrumbs in a shallow app

**Why it breaks.** Breadcrumbs at `.mob-meta` size consume a full 34px header row to say what the
page title already says. In a two-level app they are furniture, and this system's header row is
load-bearing: both columns of the reference layout open with a `--mob-header-row-h` row so their
first cards share a baseline.
**Instead.** Breadcrumbs only at three or more real levels of hierarchy. Otherwise a back link with
context, or nothing.

### Dashboard-template density on marketing sections

**Why it breaks.** Density is declared per region (principle 10). Product density inside a hero
gives a headline 14px of air where it needs 128px, and the composition collapses into a settings
page.
**Instead.** `data-mob-density="marketing"` on the section and let the tokens move. Never hand-tune
spacing to fake a zone.

### Arbitrary z-index values

**Why it breaks.** A `z-index: 999999` in one component wins today and loses next month when someone
else writes `9999999`. The stack becomes unauditable.
**Instead.** The `--mob-z-*` ladder — `base` · `raised` · `sticky` · `dropdown` · `popover` ·
`modal-backdrop` · `modal` · `toast` · `tooltip`. If a layer has no rung, that is a system decision.

---

## Review pass

Fast checks that catch most of the above before anything ships:

- [ ] `grep -nE '#[0-9a-fA-F]{3,8}\b' css/components/*.css` returns nothing
- [ ] no `box-shadow` on a card; shadows only on floating layers
- [ ] no `z-index` literal outside the `--mob-z-*` ladder
- [ ] every numeral up to and including 16px is mono and `tabular-nums`
- [ ] every status has a non-colour signal
- [ ] every interactive element has a visible `:focus-visible` ring
- [ ] repeated controls measure identically — same height, padding, radius, gap
- [ ] hover changes colour or surface, never size or position
- [ ] each region declares `data-mob-density`; no hand-tuned section spacing
