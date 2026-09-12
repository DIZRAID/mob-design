# 06 — Accessibility

This is a list of things to do, not a list of standards to cite. Every item is a concrete
requirement against the tokens and components this system actually ships. Where the calibrated
palette does not clear a threshold, that is stated with the number rather than hidden.

The overall shape of the answer: **this system is high-contrast where it matters and deliberately
low-contrast where it does not**, and the whole thing only holds together if you respect which is
which.

---

## 1. Contrast — the measured numbers

All ratios below are WCAG 2.x relative-luminance ratios computed on the dark-theme token pairs.
"Range" means: measured against every surface in the ramp, from `--mob-bg-canvas` (`#0a0b0d`) at the
light end of the range to `--mob-bg-hover` (`#15171a`) at the dark end.

### Body-safe roles — ≥ 4.5:1 on every surface

| Token | Value | Range | Notes |
|---|---|---|---|
| `--mob-fg-primary` | `#e8eaed` | **14.90 – 16.34** | Any size, any surface |
| `--mob-fg-secondary` | `#cfd3da` | **11.96 – 13.11** | Any size, any surface |
| `--mob-fg-muted-hi` | `#9aa0a8` | **6.81 – 7.47** | Body-safe. Use on raised surfaces (chips) |
| `--mob-fg-muted` | `#8f959e` | **5.95 – 6.53** | Body-safe. The floor for real prose |
| `--mob-fg-link` | `#a78bfa` | **6.60 – 7.23** | |
| `--mob-fg-link-hover` / `--mob-accent-bright` | `#c4b5fd` | **9.73 – 10.66** | The accent tone that is safe as text |
| `--mob-positive` | `#34d399` | **9.34 – 10.24** | |
| `--mob-negative` | `#f87171` | **6.49 – 7.12** | |
| `--mob-warning` | `#fbbf24` | **10.76 – 11.79** | |
| `--mob-info` | `#60a5fa` | **7.06 – 7.74** | |
| `--mob-affirm-fg` | `#7fbfa2` | **8.45 – 9.26** | 8.35 on its own `--mob-affirm-bg` |
| `--mob-destroy-fg` | `#c08b8b` | **6.25 – 6.85** | 6.37 on its own `--mob-destroy-bg` |
| entity glyph on its tint | — | **6.94 – 11.19** | All eight `--mob-series-N-glyph` / `-tint` pairs |

The muted action tones are the quiet surprise here: they were desaturated to keep the row from
glowing, and they still land at 6–9:1. Muted is not the same as low-contrast.

### Metadata-only roles — below body-text contrast, on purpose

| Token | Value | Range | Verdict |
|---|---|---|---|
| `--mob-fg-label` | `#767c86` | **4.27 – 4.69** | Clears 4.5:1 on `--mob-bg-canvas` (4.69) and `--mob-bg-sunken` (4.56); misses it on `--mob-bg-surface` (4.49), `--mob-bg-surface-raised` (4.38), `--mob-bg-tile` (4.34) and `--mob-bg-hover` (4.27). |
| `--mob-fg-dim` / `--mob-fg-disabled` | `#5d636c` | **2.96 – 3.25** | Below 4.5:1 everywhere. Below 3:1 on hovered surfaces. |

**The honest note.** These two roles are below body-text contrast by design, and no amount of
tuning fixes that without changing what the system looks like. A dense screen where every tone is
AA-legible has no hierarchy left — the eye has nowhere to rest and nothing to skip. The trade is
only defensible while nothing essential lives in these tones.

So the rule is absolute rather than approximate:

> `--mob-fg-label` and `--mob-fg-dim` may never carry information a user must read to use the
> screen. They carry restatements, units, separators and category titles whose content is already
> obvious from context.

They are the tones behind `.mob-label`, `.mob-meta`, `.mob-meta-sm` and `.mob-dim` — micro-labels
like `PORTFOLIO VALUE`, sub-lines like `uncollected` and `all-time`, unit suffixes, and the `·`
between two facts. In the worked example, `uncollected` sits in `--mob-fg-dim` under a `$0.2194`
that sits in `--mob-positive` at 9.8:1. Delete the word and the screen still works. That is the
test.

**The test, in full:** delete every element painted `--mob-fg-label` or `--mob-fg-dim`. If the
screen still answers the question it exists to answer, the tones are used correctly. If it does
not, promote the offender to `--mob-fg-muted` (6.0+) and take the visual hit — the hierarchy is
worth less than the sentence.

**The worst pair in the system** is `--mob-fg-dim` on `--mob-bg-hover`: **2.96:1**. That is a dim
caption inside a hovered row. If a row carries dim text, its hover must not push the background
further from it — use `--mob-bg-hover` and stop there, and never combine a dim caption with a
darker hover surface.

If your product has to certify AA rather than argue the trade, do not re-tune these two roles by
hand: `css/a11y.css` already ships measured replacements for both. See "The AA layer" at the end of
this section.

### The accent-fill exception

The measured primary button is white 13px/500 on `--mob-accent` (`#7c5dfa`). `[src]`

| Pair | Ratio |
|---|---|
| `#ffffff` on `--mob-accent` `#7c5dfa` (rest) | **4.37** |
| `#ffffff` on `--mob-accent-hover` `#8b70ff` (hover) | **3.58** |
| `#ffffff` on `--mob-accent-pressed` `#6b4ce8` | 5.49 |
| `--mob-fg-inverse` `#0a0b0d` on `--mob-accent` (rest) | 4.50 |
| `--mob-fg-inverse` on `--mob-accent-hover` | 5.49 |

At rest it is 3% short of 4.5:1, and hover makes it worse — because hover brightens the fill while
the label stays white. 13px/500 does not qualify as large text, so there is no exemption to hide
behind. There are two positions. Pick one, apply it product-wide, and write down which:

1. **Ship as measured and record the exception.** Defensible for a product with no compliance
   obligation: the gap is inside the noise floor of most viewing conditions, the target is a large
   solid fill, and the focus ring on it is 10:1. But it is an exception, not compliance.
2. **Opt into `css/a11y.css`.** It repoints `--mob-accent` to `#7a5bf5` (white at **4.52:1**) and
   `--mob-accent-hover` to `#6f4fe8` (**5.30:1**), so hover now helps instead of hurting. Both are
   measured. Do not derive your own darker violet and do not flip the label to
   `--mob-fg-inverse` — the layer exists so this decision is made once, with numbers, for everyone.

Whichever you pick, `--mob-fg-on-accent` stays white — lightening the label is not an option
available to you.

Independent of the choice: **never use `--mob-accent` as text on a dark surface.** It is 4.11–4.50:1
and drops below AA on every surface above the canvas. Accent text, links, the focus ring and the
active data mark all use `--mob-accent-bright` (9.73–10.66:1). The semantic layer already does this
— `--mob-focus-color` and `--mob-fg-link-hover` both resolve to the bright tone. Do not "fix" them
to the brand hex.

### Non-text contrast — borders, marks and data

UI component boundaries and meaningful graphics want 3:1. The 1px borders in this system do not get
close:

| Token | vs `--mob-bg-surface` |
|---|---|
| `--mob-border-subtle` | 1.07 |
| `--mob-border-frame` | 1.13 |
| `--mob-border-default` | 1.16 |
| `--mob-border-control` | 1.24 |
| `--mob-border-strong` | 1.37 |
| `--mob-border-hover` | 1.58 |

That is intentional and it is fine, **on one condition**: in this system a border is a structural
seam, never the sole indicator of a control's extent or state. Every control also carries a fill
distinct from its parent — `--mob-chip-bg` on the canvas, `--mob-field-bg` inside a card,
`--mob-affirm-bg` on the card surface — and it is the fill that makes the boundary findable. State
is likewise carried by the fill and the foreground, not by the hairline alone.

**Where a border *is* the only affordance, it fails and you must fix it.** The two cases:

- A ghost / outlined control sitting directly on the canvas with a transparent fill.
- The dashed empty-state panel (`--mob-border-dashed`, 1.30:1 on canvas).

Fixes, in order of preference: give it a fill one step off its parent (`--mob-bg-surface-raised` on
the canvas); or, if it must stay transparent, opt into `css/a11y.css`, which raises
`--mob-field-border` from `#23262b` (**1.37:1**) to `#5e6164` (**3.08:1**). Do not raise it by eye
and do not repoint `--mob-border-control` wholesale — the layer lifts the *field* token deliberately,
so that fields and ghost controls clear the bar while chip and card borders stay calibrated. Those
separate surfaces that are already distinguishable, which 1.4.11 does not cover. The structural
border greys will never clear 3:1; they are 20 units of luminance apart from the surfaces they sit
on, which is the whole point of the ramp.

**Data marks.** Against `--mob-bg-surface`: `--mob-series-2` 10.14, `--mob-series-4` 11.31,
`--mob-series-6` 9.82, `--mob-series-7` 9.76, `--mob-series-5` 6.83, `--mob-series-8` 6.26,
`--mob-series-1` 4.62, `--mob-series-3` 3.57. All clear 3:1. `--mob-accent-deep` (`#5b3fd6`, the
inactive-bin tone) is **2.81** and does not — which is correct for what it is, a background scale
rather than information. The information in that component is which bin is active
(`--mob-accent-bright`, 10.23:1), the 22px vs 15px height difference, and the min / status / max
text under the row. If a chart of yours puts real values in that tone, switch it to
`--mob-series-3`. If you need the inactive bins themselves to clear 3:1 — because the bin geometry
*is* the information — `css/a11y.css` raises `--mob-accent-deep` to `#6247d8` (**3.07:1**), the
smallest lift that gets there.

**Series against each other is the real problem.** The ramp is hue-spaced on a single luminance
tier by design, so no two members are separable by luminance: the best-separated pair is
`--mob-series-2` vs `--mob-series-3` at **2.84:1**, the worst is `--mob-series-6` vs
`--mob-series-7` at **1.01:1**. Nothing in this ramp is safe for a viewer with a colour vision
deficiency on hue alone. Adjacent segments must therefore be separated structurally:

- Stacked and composition bars use `--mob-bar-gap` (2px) over a frame-coloured parent. **That gap is
  an accessibility feature, not a styling choice** — do not close it to make the bar look solid.
- Every series carries a text label: direct on the mark where it fits, otherwise a legend in the
  same order with the value printed as text. In the worked example each asset prints its own share
  (`59.7%`, `39.9%`, `0.4%`) next to its name, so the bar is a summary of something already
  readable.
- Line series get distinct dash patterns or markers, not just distinct hues.

### Light mode

Same shape, and the same two roles are the exceptions: `--mob-fg-label` (`#767c86`) is 4.20:1 on
`--mob-bg-surface` and 3.95:1 on canvas; `--mob-fg-dim` (`#949aa4`) is 2.83 / 2.66. Metadata-only
applies identically.

Note what was *not* ported: the light-mode status tones were re-picked, not inverted. A naive port
of `--mob-green-400` (`#34d399`) onto white would have been about 1.5:1. `--mob-positive` in light
mode is `#067a55` at 5.35:1, `--mob-negative` `#c2352f` at 5.46:1, `--mob-warning` `#9a6400` at
5.00:1. If you extend the light palette, re-measure — do not lighten or darken by feel.

### The AA layer — `css/a11y.css`

Everything above diagnoses. `css/a11y.css` is the remedy, and it is the *only* sanctioned one: the
six values below, each replaced with a measured one, nothing else touched. It is an opt-in override,
so it is inert until you set the attribute — and because it is just a scope, you can harden a single
region rather than the whole product.

```html
<html data-mob-a11y="AA">          <!-- or scope it: <section data-mob-a11y="AA"> -->
```

Load it after `tokens.css`. Backgrounds measured: canvas `#0a0b0d`, surface `#101114`, raised
`#131417`.

| Token | Default | Ratio | Needs | Replacement | Ratio |
|---|---|---:|---:|---|---:|
| `--mob-accent` (white label on the fill) | `#7c5dfa` | 4.37 | 4.5 | `#7a5bf5` | **4.52** |
| `--mob-accent-hover` | `#8b70ff` | 3.58 | 4.5 | `#6f4fe8` | **5.30** |
| `--mob-fg-label` | `#767c86` | 4.49 | 4.5 | `#797f88` | **4.56** |
| `--mob-fg-dim` | `#5d636c` | 3.12 | 4.5 | `#797e85` | **4.62** |
| `--mob-accent-deep` (non-text mark) | `#5b3fd6` | 2.81 | 3.0 | `#6247d8` | **3.07** |
| `--mob-field-border` (sole control identifier) | `#23262b` | 1.37 | 3.0 | `#5e6164` | **3.08** |

`--mob-accent-pressed` and `--mob-field-border-hover` move with them so the states stay ordered.
Light mode gets its own block, but those are consistency nudges rather than fixes: it was already
comfortably above every threshold.

Three properties worth understanding before you argue about it:

- **The brand does not visibly change.** dE76 between `#7c5dfa` and `#7a5bf5` is **1.70**, under the
  ~2.3 threshold at which a colour difference becomes noticeable. That is why the replacement is not
  `--mob-accent-soft` (`#6d4df0`), which clears the ratio comfortably but is a visibly different
  purple — it would read as a rebrand rather than a fix.
- **The primary button's hover inverts.** It darkens instead of lightening, because "lighter" and
  "higher contrast with white" are mutually exclusive. It reads fine. It is not what the prototype
  did, and that is worth saying out loud in a design review rather than discovering in one.
- **Chip and card borders stay calibrated.** Only `--mob-field-border` is lifted, because only there
  is the border the sole identifier of a control.

What the layer does not do: make 9.5px metadata comfortable (it makes it legible — if a value
matters, give it a real type size, not a fixed hue), or check reading order, keyboard path and
accessible names. It also ships a `forced-colors: active` block that stops the system painting at
all and hands the rendering to the OS; the system survives that because its meaning is carried by
structure and text.

---

## 2. The focus contract

**Why it exists.** The prototype had no keyboard focus treatment at all — it set no ring, and its
buttons carried hover and active states only. That is the single largest gap the handoff left, and
it is the reason this system does not treat focus as a per-component decision.

`base.css` ships a global contract:

```css
:focus-visible {
  outline: none;
  box-shadow: var(--mob-focus-ring);
  border-radius: var(--mob-radius-sm);
}
```

```css
--mob-focus-color: var(--mob-accent-bright);
--mob-focus-ring: 0 0 0 2px var(--mob-bg-canvas), 0 0 0 4px var(--mob-focus-color);
--mob-focus-ring-inset: inset 0 0 0 1px var(--mob-focus-color);
```

The ring is two rings: a 2px canvas-coloured spacer so the accent never touches the control's own
border — if it did, it would read as a border-colour change rather than as a focus indicator — then
2px of `--mob-accent-bright`, which is 10.2–10.7:1 against every surface in the system.

**Rules:**

- **Never remove focus without a replacement.** `reset.css` sets `:focus { outline: none }` *only*
  because `base.css` guarantees the `:focus-visible` ring that follows. Those two rules ship
  together; do not copy one without the other.
- **`:focus-visible`, not `:focus`.** A mouse click on a button should not leave a ring behind.
- **A custom control gets the ring for free** — but only if it is focusable. A `div` with
  `role="button"` needs `tabindex="0"` and a keydown handler for Enter and Space. If you find
  yourself writing all of that, use a `<button>`.
- **Use `--mob-focus-ring-inset` where the ring cannot paint outside the box.** A segment inside an
  `overflow: hidden` parent (the fused card pattern clips its segments), a full-bleed table row, an
  input inside a scroll container.

**Three gotchas that will bite you:**

1. **The global rule also sets `border-radius: var(--mob-radius-sm)`.** That is a sensible default for
   an unstyled control and a deformation for anything else, so a component with its own radius must
   restate it inside its own `:focus-visible` rule. The shipped components do:

   ```css
   .mob-card--interactive:focus-visible {
     outline: none;
     border-radius: var(--mob-card-radius);     /* or the ring cuts the corners */
     box-shadow: var(--mob-focus-ring);
   }
   ```

   `overlay.css` goes further and cancels the base rule outright on `.mob-popover`, `.mob-menu`,
   `.mob-modal` and `.mob-drawer`: a panel is a focus *landing spot*, not a control, so it takes no
   ring — and the 8px radius would otherwise deform a 12px modal. The controls inside the panel keep
   every ring they have. Copy that reasoning, not just the rule: **a container that receives focus
   programmatically does not get a focus ring; a thing you can operate always does.**

2. **`box-shadow` is one property, so focus overwrites a resting shadow.** A component with a glow at
   rest loses it the moment it is focused, unless it re-declares both:

   ```css
   .active-bin:focus-visible { box-shadow: var(--mob-glow-accent), var(--mob-focus-ring); }
   ```

3. **A clipped parent eats the ring.** `--mob-focus-ring` paints 4px outside the box; a fused
   `.mob-segmented` frame is `overflow: hidden`, so an outward ring on a segment is simply cut off.
   That is what `--mob-focus-ring-inset` is for, and it is why
   `.mob-segmented__seg--interactive:focus-visible` uses it. Check any focusable element whose
   ancestor clips: table cells in a scroller, list rows in a rounded card, tabs in a trough.

**Focus order follows DOM order.** Never use `order:` or `grid-area` to visually reorder
interactive content — the tab order will not follow, and a keyboard user will traverse your screen
in an order nobody designed. The dashboard's rail-then-column layout is DOM-ordered the way it
reads; keep that property when you rearrange columns responsively.

**Ship a skip link** as the first focusable element on any shell with a navigation rail. Without
one, a keyboard user walks ~20 rail links before reaching the content, on every page, every time.

---

## 3. Semantic HTML

**Buttons are buttons, links are links.** The test:

- Does it change the URL, and should the back button undo it? → `<a href>`.
- Does it perform an action? → `<button type="button">`.

A `<div onclick>` has no focus, no Enter or Space, no role, and is announced as nothing. A
`<span role="button" tabindex="0">` is the same element with three times the code and one forgotten
keydown handler.

- **`type="button"` explicitly** inside a form. The default is `submit`, and a Claim button inside a
  form will submit it.
- **Never `<a>` without an `href`** for an action — it is not focusable and not activatable.
- **Never a `<button>` that navigates** when an `href` would do; you lose middle-click, open in new
  tab, copy link, and the back button.

**Headings.** One `<h1>` per page, no skipped levels. The type role and the heading level are
independent axes: `.mob-title` is a size, applied to whatever level the document outline requires. A
section opener styled `.mob-label` (9.5px uppercase) is still an `<h2>` if it opens a section.

**Landmarks.** `<header>`, `<nav>`, `<main>`, `<aside>` for a rail, `<footer>`. Jumping by landmark
is the assistive-technology equivalent of glancing at the layout; without them there is no glance.
If there are two `<nav>`s, name them (`aria-label="Primary"` / `"Portfolio"`).

**Lists are lists.** A rail of cards or a stack of positions is a `<ul>` of `<li>`s, so the count is
announced up front — "list, 12 items" is genuinely useful orientation.

**Tables are tables.** Real `<table>`, `<thead>`, `<th scope="col">`, `<caption>`. A grid of divs
with `role="table"` is a re-implementation of something the browser already does correctly, and you
will get the row/column relationships wrong.

---

## 4. Forms and labelling

**Every control has a `<label for>`.** No exceptions.

**A placeholder is never a label.** Four independent reasons:

- It disappears the moment the user types, so the question is gone exactly when they need to check
  their answer against it.
- It renders at `--mob-fg-label` or dimmer — under 4.5:1 (see §1).
- Browser autofill overwrites it, so the field ends up filled with no visible name.
- Translation and voice-control tools frequently skip it, so "click the email field" fails.

If the design has no room for a visible label, reconsider the layout first; if it genuinely has
none, use `.mob-sr-only` — it is already in `base.css`:

```html
<label for="addr" class="mob-sr-only">Token address</label>
<input id="addr" placeholder="0x… or ENS name" aria-describedby="addr-hint">
<p id="addr-hint" class="mob-meta">Paste a contract address to open a ladder.</p>
```

- **Helper text via `aria-describedby`**, not `title`. `title` does not appear on touch and does not
  appear on keyboard focus in most browsers.
- **Errors:** `aria-invalid="true"` on the control, the message in an element referenced by
  `aria-describedby`, and `role="alert"` (or a pre-mounted assertive live region) so it is
  announced. The red border is not the error — it is the decoration on the error.
- **Required:** the `required` attribute plus the word in the label. A red asterisk alone is both a
  colour-only signal and an unexplained glyph.
- **Group radios and checkboxes** in a `<fieldset>` with a `<legend>`, so the question is announced
  with each option instead of once at the top.
- **`autocomplete` tokens** on anything a browser can fill.
- **Do not disable the submit button as your only validation feedback.** A permanently disabled
  button that never says why is a dead end with no exit. Leave it enabled, validate on submit, and
  move focus to the first error.

---

## 5. Keyboard support, per overlay type

| Overlay | Escape | Focus on open | Trap | Focus on close | Outside click | Arrows |
|---|---|---|---|---|---|---|
| Dropdown / action menu | closes | first item, or the selected one | no (Tab closes it) | back to trigger | closes | roving tabindex; Up/Down, Home/End, type-ahead |
| Select / combobox | closes and reverts | selected option | no | trigger | closes | Up/Down moves, Enter commits |
| Popover (non-modal) | closes | first focusable | no | trigger | closes | normal Tab |
| Tooltip | hides | **never takes focus** | — | — | — | must also show on trigger *focus*, not only hover |
| Modal / dialog | closes if dismissible | first focusable, or the dialog | **yes** | the element that opened it | only if dismissible | Tab cycles inside |
| Destructive confirm | closes (= cancel) | the **cancel** action | yes | trigger | **no** — backdrop click must not dismiss | Tab cycles |
| Bottom sheet (mobile modal) | closes | as modal | yes | trigger | as modal | — |
| Toast | dismisses the focused toast | **never steals focus** | no | — | — | reachable in tab order after main content |

**Restore focus to the exact element that opened the overlay.** Not "somewhere sensible" — the
element. This is the most commonly skipped step in the whole document and its failure mode is the
worst: focus resets to `<body>` and the user is silently teleported to the top of the page.

If the opener no longer exists — the Close confirm removed the row that held the button — move focus
to the container the row lived in, and announce the removal in a live region so the user knows why
the thing they were on is gone.

**Trap focus only in modals.** Trapping a non-modal popover means Tab can never leave it, which is a
worse bug than no trap at all.

**Prefer `<dialog>` with `showModal()`.** It gives you the trap, the inert background, Escape, and
top-layer stacking for free, all of which are easy to get wrong by hand. If you build your own, mark
the background `inert` while the dialog is open.

**Roving tabindex in menus and tab lists.** Exactly one item has `tabindex="0"`, every other has
`tabindex="-1"`, and arrow keys move which one. A twelve-item menu is then one Tab stop, not twelve.
`--mob-menu-max-h` (288px) is roughly nine items before it scrolls, so add type-ahead for anything
longer.

**Tabs.** Left/Right moves in a horizontal tab list, Up/Down in a vertical one; Home/End jump to the
ends; the panel is the next Tab stop after the list. Choose an activation mode and be consistent:
*automatic* (selection follows focus) is fine when panels are already loaded; *manual* (Enter or
Space activates) is required when switching triggers a fetch, or arrowing through five tabs fires
five requests.

**Every action reachable by mouse is reachable by keyboard.** An action that only exists in a hover
menu, a right-click menu, or a drag gesture needs a keyboard-reachable equivalent — usually in the
`···` overflow menu.

---

## 6. ARIA the components expect

**In this system the ARIA attribute *is* the styling hook.** The component stylesheets select on
`[aria-selected='true']`, `[aria-current='page']`, `[aria-sort='ascending']`, `[aria-pressed='true']`,
`[aria-invalid='true']`, `[aria-disabled='true']` and `[aria-busy='true']` rather than on a parallel
set of `--active` / `--selected` classes. That is deliberate, and it is the strongest guarantee in
this document: **a missing attribute is a missing visual state.** You cannot forget the ARIA and
still have the design look right, and the painted state and the announced state cannot drift apart,
because there is only one of them.

Two consequences:

- There is deliberately no `.mob-tab--active` and no `.mob-navlink--current`; neither matches a
  rule, and adding one to your own stylesheet re-creates exactly the drift this avoids. If you
  find yourself wanting one, the attribute is missing.
- When you extend a component, select on the attribute for anything a user needs announced, and use
  a `data-mob-*` attribute only for states with no ARIA equivalent (`data-mob-state` on overlays,
  `data-mob-loading`, `data-mob-leaving`).


| Attribute | Where | Must track |
|---|---|---|
| `aria-current="page"` | the nav item for the current route | one per nav |
| `aria-current="step"` / `"true"` | stepper / breadcrumb leaf | |
| `aria-selected` | each `.mob-tab` inside `role="tablist"` | the visual selected state, always |
| `aria-sort="ascending" \| "descending" \| "none"` | the sorted `<th>` | exactly one column at a time |
| `aria-expanded` | any trigger that opens a menu, popover or disclosure | `true` while open |
| `aria-haspopup="menu" \| "dialog" \| "listbox"` | the same trigger | must match what actually opens |
| `aria-controls` | trigger → the panel's `id` | |
| `aria-pressed` | toggle buttons that stay on: a filter chip, a pin | not for a button that just fires |
| `aria-checked` | custom checkbox / radio / `role="switch"` | |
| `aria-disabled` | a control that must stay focusable to explain why it is unavailable | prefer real `disabled` otherwise |
| `aria-busy="true"` | a region refreshing in place | |
| `aria-live="polite"` | toasts, optimistic-update results | |
| `role="alert"` | blocking errors only | rare — it interrupts |
| `aria-label` / `aria-labelledby` | icon-only controls, dialogs, duplicate landmarks | |

Two of these have a shipped non-colour treatment you should not remove: the sortable `<th>` draws its
direction glyph from `[aria-sort]` in `::before`/`::after`, and `.mob-navlink[aria-current='page']`
changes background as well as tone. Both are the second signal required by §8 — they exist because
the attribute drove them, not because someone remembered.

Prefer `<th aria-sort="…"><button>Label</button></th>`: the sort state belongs to the header cell,
the *action* belongs to a real button inside it, and a keyboard user can then reach and press it.

### Live regions, concretely

- **Mount the region before the message.** Injecting a `<div aria-live>` and its text in the same
  frame announces nothing in several screen readers. Mount one empty polite region at app start and
  write into it.
- **Never put a live region inside something conditionally rendered.** It gets unmounted and
  remounted, and the next message is lost.
- **Announce the result of an optimistic update.** The worked example: pressing Claim writes the new
  fees figure immediately. Sighted users see the number change; nobody else gets anything unless the
  polite region says `Fees claimed, $0.2194`. On failure, the toast must state what failed, and the
  undo inside it must be a real focusable `<button>` — an undo that lives only in a toast that
  disappears in five seconds and cannot be reached by keyboard is not an undo. Either the toast
  persists while it holds an action, or the undo also exists somewhere permanent.
- **A polling timestamp is not a live region.** "updated 3s ago" changes every second; announcing it
  makes the page unusable. Put it in a plain element, and announce the *data* change instead,
  throttled to something a person can follow.

---

## 7. Icon-only buttons

Every icon-only control needs an accessible name. Both of these are correct:

```html
<button class="mob-icon-btn" type="button" aria-label="More actions for NUDES / USDG">
  <svg aria-hidden="true" focusable="false" width="16" height="16">…</svg>
</button>

<button class="mob-icon-btn" type="button">
  <svg aria-hidden="true" focusable="false" width="16" height="16">…</svg>
  <span class="mob-sr-only">More actions for NUDES / USDG</span>
</button>
```

- **`aria-hidden="true" focusable="false"` on the `svg`, always.** Otherwise the icon is announced as
  "graphic" alongside the label, and in some browsers becomes its own tab stop.
- **The name must disambiguate the row.** The `···` overflow button is the canonical case: on a list
  of thirty positions, thirty buttons named "More actions" are thirty identical announcements and no
  way to tell them apart. Include the entity.
- **Name it the way a person would say it.** "More actions", not "ellipsis", not "kebab icon", not
  "three dots". Do not include the word "button" — the role is announced already.
- **A tooltip is not a name** unless it is wired up with `aria-labelledby`. `title` is a last
  resort: it does not appear on touch and usually does not appear on keyboard focus.
- **Never ship an icon-only destructive action.** Close, Delete, Withdraw: the label is the last
  guard before an irreversible act. This is also why the muted destroy tone works at all — the word
  carries the meaning, so the colour is free to be quiet.

---

## 8. Colour is never the only signal

Go through every place this system uses colour semantically and check the second signal exists:

| Place | Colour signal | Required second signal |
|---|---|---|
| Signed value (`[data-mob-sign]`) | `--mob-positive` / `--mob-negative` | The explicit `+` or `−` in the text. The source design already prints `+$616.35` — keep the sign when you reformat for width. Use a real `-` or `−` character, not a CSS-injected glyph, so it is announced. |
| PnL sub-line | green / red percentage | Same sign character |
| Range status | `--mob-accent-bright` "Above · sold" vs `--mob-positive` "In range" | The words. **Never reduce this to a coloured dot.** If space forces a dot, it carries a `.mob-sr-only` label *and* a shape difference (filled vs hollow). |
| Composition bar | series hue per segment | A legend in the same order with each share printed as text, plus `--mob-bar-gap` between segments |
| Range bins | active bin brighter + `--mob-glow-accent` | The **height** difference (`--mob-meter-h` 22px vs `--mob-meter-bin-h` 15px) plus the min / status / max text under the row. Keep the height difference — it is the non-colour channel. |
| Toast variant | info / success / warning / error tint | An icon per variant **and** the first word of the message: "Saved" vs "Couldn't save" |
| Form error | `--mob-negative` border | Message text, `aria-invalid`, and an icon |
| Required field | red asterisk | The word "required" in the label or helper |
| Muted action tones | `affirm` green / `destroy` red | The labels "Claim" and "Close" already carry it — which is exactly why the tones can be muted |
| Disabled | `--mob-fg-disabled` | The `disabled` / `aria-disabled` attribute so it is announced, plus a reason nearby if it is not obvious |
| Chart series | the 8-hue ramp | Direct labels where they fit, otherwise a legend plus distinct dash or marker per line (see §1: no two series separate by luminance) |
| Loading | shimmer | Text or `aria-busy` — see `docs/05-motion.md` §6 |

**The test:** switch the display to greyscale (macOS: Accessibility → Display → Colour Filters →
Greyscale). Ask the screen its question again. Anything you can no longer answer was a colour-only
signal.

---

## 9. Touch targets

`--mob-tap-target: 44px` is the floor. The painted control heights are deliberately below it —
`--mob-control-h-sm` 30px, `-md` 34px, `-lg` 40px — because density is the product.

The system reaches 44px in several ways, and which one is correct depends on whether growing
the painted box would damage the layout:

| Strategy | Where | Mechanism |
|---|---|---|
| Invisible overlay | `base.css`: `.mob-btn`, `.mob-icon-btn`, `.mob-tab` | A centred transparent `::after` at min 44×44 extends the hit area beyond the painted box. The button still *looks* 30px. |
| Raise the component row | `overlay.css`: `.mob-menu__item`; `chip.css`: interactive chips | The real layout box reaches 44px, preserving each component's loading pseudo-element and preventing overlapping targets. |
| Raise the row height | `nav.css`: `--mob-navlink-h` and `--mob-sidebar-item-h` become `--mob-tap-target`; breadcrumb links gain vertical padding | A nav row has empty space to spare, so growing it costs nothing and avoids overlap entirely. |
| Raise the minimum | `choice.css`: `.mob-checkbox`, `.mob-radio`, `.mob-toggle` get `min-block-size: var(--mob-tap-target)` | The control is the label row; the box grows, the glyph does not. |

All three are inside `@media (pointer: coarse)`, which is the point: on a mouse nothing changes and
the density survives. Never solve this with a global `min-height`.

**Use the overlay only where the painted box must stay small.** It is the strategy with a side
effect (below); if the component has room to grow on touch, grow it.

One thing remains the author's job:

**1. Pitch, not just size.** The overlays are centred on their control and will overlap. Two 30px
buttons stacked with `--mob-control-gap` (6px) have a 36px pitch, so their 44px targets overlap by
8px, and in the overlap the element later in the DOM wins. In the worked example that means the
bottom edge of Claim's target sits inside Close's. **A destructive action must have clear space:**
on coarse pointers either raise the stack gap so the pitch reaches 44px, or reorder so nothing
non-destructive shares an overlap with Close.

The floor applies to pointer targets, not to a text link inside a running paragraph.

---

## 10. Motion

Covered in `docs/05-motion.md`. The accessibility-relevant half, restated because it is the part
that gets forgotten:

- `reset.css` clamps every animation and transition globally under
  `prefers-reduced-motion: reduce`. No component opts out, no author has to remember.
- **You still owe:** never encode meaning in motion alone; never let an animation be the thing that
  reveals content; zero your `animation-delay`s under reduced motion; gate scroll-linked and
  rAF-driven animation in JavaScript, because CSS has no duration there to clamp.
- A spinner under reduced motion is a static glyph. Pair every one with text or `aria-busy`.

---

## 11. Manual test script

Ten minutes per screen, no tools beyond a browser and the OS. Run it before you call a screen done —
it is the hands-on companion to the accessibility section of `docs/12-qa-checklist.md`.

1. **Unplug the mouse.** Tab from the address bar through the entire screen. Every stop is visible
   (there is a ring). The order matches the reading order. You can reach and operate every action.
   Wherever you get stuck is a bug you just found.
2. **Open each overlay from the keyboard.** Escape closes it. Focus went *into* it on open. Focus
   came back to the trigger on close.
3. **Run the destructive path from the keyboard.** The confirm traps focus and starts on Cancel.
   Cancel restores focus to the button. Confirm removes the row and focus lands on something real —
   not on `<body>` — and the removal is announced.
4. **Turn on reduce motion and reload.** Nothing is invisible. Nothing is stuck at `opacity: 0`.
   Every state change still reads. Every spinner still says what it is doing.
5. **Zoom to 200%, then to 400% at a 1280px window.** No horizontal page scroll, no clipped text, no
   overlapping segments. The fused card pattern has per-segment `min-width`s — at 400% those
   segments must wrap onto new lines, not overflow the card.
6. **Greyscale the display.** Ask the screen its question again. Is positive still distinguishable
   from negative? Is the chart still readable? Can you still tell which bin is active?
7. **Turn on the screen reader** (VoiceOver ⌘F5, or NVDA) and read the page top to bottom once.
   Listen for: an unlabelled button, "clickable" announced on a `div`, a skipped heading level, a
   number read without its sign, a decorative graphic being announced, thirty identical "More
   actions".
8. **Perform an optimistic action.** Was the result announced, or only painted?
9. **Resize to 375px and tap every control with a thumb**, not with a mouse cursor pretending to be
   one. Anything you miss twice is under-sized or under-spaced.
10. **Force an error** (block the network in devtools). The message is announced, the retry is
    focusable, and the screen does not sit in a permanent skeleton.

---

## 12. What this system does not do for you

The token layer guarantees contrast where it can, `a11y.css` closes the pairs it cannot,
`base.css` guarantees a focus ring and a hit-target floor, and `reset.css` guarantees reduced-motion
compliance. Everything after that is authorship:

- Correct elements (`<button>`, `<a>`, `<table>`, `<label>`).
- Names on things that have no visible text.
- Keeping the ARIA state in sync with the painted state.
- Focus management across open, close and destroy.
- A second signal wherever colour carries meaning.
- Keeping `--mob-fg-label` and `--mob-fg-dim` free of anything essential.

No stylesheet can check those. The ten-step script in §11 can.
