# 12 — QA checklist

The gate a screen passes before it ships.

This document exists so that "does this look right?" stops being a matter of opinion. Every item
below is written to be marked **pass** or **fail** by someone who did not design the screen, using
a measurement rather than a feeling. If two people can read an item and reach different verdicts,
the item is badly written — file that against this document.

Two rules govern how the gate is used:

1. **A finding cites a rule.** If you cannot name the token, the state, or the section that a screen
   violates, you have found a taste disagreement (drop it) or a gap in the system (file it against
   the system, not the screen). See §10.
2. **A state exists when it is reachable in the built screen.** A frame in a design file is not a
   state. If a reviewer cannot get the interface into the state, it does not ship.

---

## 1. Required states matrix

Every interactive component is reviewed against this matrix before it is accepted into a screen.
The mobb specification shipped this as five columns; this system ships eighteen components, so the
matrix is extended to all of them.

**● required** · **○ optional** — design it only if the product uses that behaviour · **— not
applicable** — do not design it; reaching for it means you picked the wrong component.

| Component | Default | Hover | Focus-visible | Pressed | Selected | Disabled | Loading | Error | Empty |
|---|---|---|---|---|---|---|---|---|---|
| Button | ● | ● | ● | ● | —ᵃ | ● | ●ᵇ | — | — |
| Icon button | ● | ● | ● | ● | ○ | ● | ○ | — | — |
| Input | ● | ● | ● | —ᶜ | — | ● | ○ | ● | ●ᵈ |
| Textarea | ● | ● | ● | —ᶜ | — | ● | ○ | ● | ●ᵈ |
| Select | ● | ● | ● | ○ᵉ | ● | ● | ○ | ● | ●ᶠ |
| Checkbox | ● | ● | ● | ○ | ●ᵍ | ● | — | ○ʰ | — |
| Radio | ● | ● | ● | ○ | ● | ● | — | ○ʰ | — |
| Toggle | ● | ● | ● | ○ | ● | ● | ●ⁱ | ○ʰ | — |
| Tab | ● | ● | ● | ○ | ● | ○ | —ʲ | —ʲ | —ʲ |
| Chip | ● | ○ᵏ | ○ᵏ | ○ᵏ | ○ | ○ | — | — | — |
| Card | ● | ○ˡ | ○ˡ | ○ˡ | ○ | ○ | ●ᵐ | ●ᵐ | ●ᵐ |
| Segmented card | ● | ○ˡ | ○ˡ | — | ○ | — | ●ᵐ | ●ᵐ | ○ |
| List row | ● | ● | ○ˡ | ○ | ○ | ○ | ●ᵐ | ○ | ●ⁿ |
| Table row | ● | ● | ○ˡ | ○ | ○ | ○ | ●ᵐ | ○ | ●ⁿ |
| Menu item | ● | ●ᵒ | ●ᵒ | ○ | ● | ● | ○ | — | ○ |
| Modal | ● | — | ●ᵖ | — | — | — | ● | ●ʳ | ○ |
| Toast | ● | ●ˢ | ●ˢ | — | — | — | ○ | ● | — |
| Meter | ● | ○ᵗ | ○ᵗ | — | ●ᵘ | — | ●ᵛ | ○ | ●ʷ |

### Footnotes

**ᵃ Button has no Selected.** A control that persists an on/off appearance is a toggle, a tab, or a
selectable chip. "Selected button" is how a product ends up with three components that look alike
and behave differently.

**ᵇ Button Loading preserves width.** The label is replaced in place; the box does not resize. A
button that shrinks under a spinner moves everything after it in the row.

**ᶜ Fields have no Pressed.** Pointer-down on a field resolves to focus. A separate pressed skin
would flash for 80ms and communicate nothing.

**ᵈ Empty on a field is the placeholder rendering**, and it is required because that is the state the
field spends most of its life in. Placeholder is `--mob-fg-dim`; it is never a substitute for the
label.

**ᵉ Open is a separate state from pressed** on a select trigger and must be designed with the menu:
trigger border moves to `--mob-border-strong`, menu sits at `--mob-z-dropdown`.

**ᶠ Select Empty covers two different things** — no value chosen (placeholder) and no options to
choose. Both need copy. A select that opens onto nothing is a dead end.

**ᵍ Checkbox Selected includes indeterminate** wherever the product has parent/child selection.
Indeterminate is a third visual, not a dimmed check.

**ʰ Error on checkbox / radio / toggle is optional** because validation normally lives on the group,
not the control. Where it does land on the control it is a border tone *plus* a message — never
colour alone.

**ⁱ Toggle Loading is required when the toggle commits to a server.** Without a pending state the
switch flips, the request fails, the switch flips back, and the interface looks broken.

**ʲ Loading, Error and Empty belong to a tab's panel, not to the tab.** A spinner on the tab tells
the user the wrong thing is busy.

**ᵏ A chip is a control only when it filters, toggles or removes.** A status chip is text: no hover,
no focus, no `cursor: pointer`. Interactive chips are marked `data-mob-interactive` (base.css uses
that attribute to grant them the mobile hit-target floor).

**ˡ Hover, focus and pressed become required the moment the whole surface is clickable** — and then
the surface must be a real `<button>` or `<a href>`, not a `<div>` with a click handler.

**ᵐ Required for any card, row set or region that renders fetched data.** A static card is exempt.
See §9.

**ⁿ Empty for a list or table is a property of the collection.** It is checked once at the list
level and it replaces the rows; it never renders as one blank row.

**ᵒ In an open menu, pointer hover and keyboard focus produce the same highlight, and only one item
carries it at a time.** Two highlights in one open menu is a defect visible in a screenshot.

**ᵖ Modal focus is a contract, not a ring:** focus moves into the dialog on open, is trapped while
open, and returns to the trigger on close.

**ʳ Modal errors render inline in the dialog.** A second modal, or a toast that outlives the dialog,
loses the message.

**ˢ Toast hover pauses the auto-dismiss timer**, and a toast carrying an action is focusable.
Otherwise the toast vanishes while the user is reaching for it.

**ᵗ Meter hover / focus are required only if a segment carries a value that is not readable
elsewhere on the screen.**

**ᵘ Meter Selected is the active segment.** Worked example, from the dashboard the tokens were
measured on: the bin containing spot renders at full `--mob-meter-h` in `--mob-accent-bright` with
`--mob-glow-accent`; inactive bins are `--mob-meter-bin-h` in `--mob-accent-deep`.

**ᵛ Meter Loading holds its height** (`--mob-meter-h`, `--mob-bar-h`, `--mob-spark-h`) so arriving
data does not push the rows below it.

**ʷ Meter Empty renders the track, not nothing.** Zero is a value; a meter at 0 that draws nothing is
indistinguishable from a broken meter.

---

## 2. Foundations

- [ ] **No colour literal outside the token layer.** Run over the screen's sources; expect zero hits.
      ```bash
      grep -rnE '#[0-9a-fA-F]{3,8}\b|\brgba?\(' src/ \
        --include='*.css' --include='*.scss' --include='*.ts*' --include='*.vue' --include='*.svelte' \
        | grep -v 'tokens.css\|brand.css\|a11y.css'
      ```
      The three excluded files are the token layer: `tokens.css` declares the palette, `brand.css`
      re-derives the accent family from one hex, and `a11y.css` swaps the values that miss a
      contrast threshold. Literals belong in those three and nowhere else.
- [ ] **Every colour a component reads is semantic or component tier**, never a `--mob-gray-*`,
      `--mob-violet-*` or other primitive. Primitives are the palette's private storage; a component
      that reads one cannot be rethemed by redefining the semantic block.
- [ ] **Distinct background colours in the screen ≤ 5** (canvas, sunken, surface, surface-raised /
      tile, hover). A sixth surface is a finding: depth in this system comes from four elevation
      steps plus a 1px border, and a fifth background means someone invented a level.
      ```js
      new Set([...document.querySelectorAll('body *')].map(e => getComputedStyle(e).backgroundColor))
      ```
- [ ] **Every border resolves to one of the five border tokens, chosen by job**, not by eye:
      `--mob-border-subtle` divides inside one surface · `--mob-border-frame` is the seam between
      fused segments · `--mob-border-default` is the boundary of a card or panel ·
      `--mob-border-control` is chips, inputs and ghost controls · `--mob-border-strong` is selected
      or emphasised. Two adjacent elements at the same level using different border tokens is a fail.
- [ ] **Hairlines between fused segments are 1px gaps over a `--mob-bg-frame` parent, not borders.**
      Test: the seam is exactly 1px at every zoom level and does not double where two segments meet.
      A doubled 2px seam means someone used `border` on both sides.
- [ ] **Every text size is a step on the scale.** Expect an empty result, except elements carrying a
      `.mob-display-*` or `.mob-heading-xl` class, which are fluid `clamp()` by design.
      ```js
      const ok = new Set(['9.5px','10px','10.5px','11.5px','12px','12.5px','13px','14px','14.5px',
                          '16px','18px','22px','23px','27px','32px','40px','48px','64px','80px']);
      [...document.querySelectorAll('body *')]
        .filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()))
        .filter(e => !ok.has(getComputedStyle(e).fontSize));
      ```
- [ ] **Type is applied by role class, not by ad-hoc `font-size`.** Every text node's nearest styled
      ancestor carries a role (`.mob-title`, `.mob-value`, `.mob-label`, `.mob-body`, `.mob-figure-*`,
      `.mob-heading-*`, …). A screen that needs a size the roles do not have is a system decision, not
      a screen decision.
- [ ] **The dual-family split holds.** Sans (`--mob-font-sans`, weight 600, `--mob-tracking-tight`)
      appears only on headings from 14px up and on figures from 22px up. Every number, control label,
      tag, timestamp and piece of metadata is mono — including the 16px figure, which is
      `.mob-figure-sm` and stays mono. A metric set in sans below 22px is a fail; body copy set in
      mono at paragraph length is a fail.
      ```js
      [...document.querySelectorAll('body *')].filter(e => {
        const s = getComputedStyle(e);
        return !s.fontFamily.includes('Plex') && parseFloat(s.fontSize) < 22 &&
               [...e.childNodes].some(n => n.nodeType === 3 && /\d/.test(n.textContent));
      });
      ```
      Read the hits rather than counting them: sans prose that happens to contain a digit ("3 open
      positions" in a `.mob-body`) is legitimate and will show up here. What you are looking for is a
      *figure* — a value on its own, in sans, below 22px.
- [ ] **Every spacing value is on the scale or is a named component token.** Legal off-scale values
      and their reason: `13px`/`15px` (`--mob-card-pad-*`, `--mob-control-px-md`), `18px`
      (`--mob-control-px-lg`), `-9px` (`--mob-avatar-overlap`), `1px` (hairline gaps), `5px`
      (`--mob-bar-h`). Anything else is arbitrary.
      ```js
      const ok = new Set(['0px','1px','2px','3px','4px','5px','6px','8px','10px','12px','13px','14px',
                          '15px','16px','18px','20px','24px','32px','40px','48px','64px','80px','96px','128px']);
      const props = ['marginTop','marginBottom','paddingTop','paddingBottom','paddingLeft','paddingRight',
                     'rowGap','columnGap'];
      [...document.querySelectorAll('body *')].filter(e => {
        const s = getComputedStyle(e);
        return props.some(p => s[p] && s[p] !== 'normal' && !ok.has(s[p]));
      });
      ```
- [ ] **Radius tracks control height, not taste.** S=`--mob-radius-sm` (8px), M=`--mob-radius-md`
      (9px), L=`--mob-radius-lg` (10px), chips=`--mob-radius-xs` (6px), cards and modals=
      `--mob-radius-xl` (12px), data marks=`--mob-radius-2xs` (3px). A control that sets its own
      radius is a fail — change its size step instead.
- [ ] **No shadow on a card.** The only legal `box-shadow` values in a product screen are
      `--mob-shadow-md`/`--mob-shadow-lg` on overlays (menu, popover, modal, toast),
      `--mob-focus-ring` on `:focus-visible`, and `--mob-glow-*` on an active data mark.
      ```js
      [...document.querySelectorAll('body *')]
        .map(e => [getComputedStyle(e).boxShadow, e]).filter(([s]) => s !== 'none');
      ```
- [ ] **Accent is scarce.** Count the elements painted `--mob-accent` / `--mob-accent-bright` in one
      viewport. More than one primary action, plus at most one active data mark, means the accent has
      stopped meaning "act here".
- [ ] **Action tones are muted at rest.** Affirmative and destructive controls use the calibrated
      `--mob-affirm-*` / `--mob-destroy-*` triplets, not `--mob-positive` / `--mob-negative` as fills.
      Saturation appears on hover only. A row of buttons that glows at rest is a fail.

---

## 3. Layout

- [ ] **One container, one gutter.** Width is `--mob-container-app` (product) or
      `--mob-container-content` (marketing); horizontal padding is `--mob-gutter-desktop` /
      `-tablet` / `-mobile`. No section sets its own horizontal padding.
- [ ] **Section rhythm comes from `--mob-section-gap`**, and the value moves because a density zone
      is declared, not because a section overrode it. Every region is inside exactly one
      `data-mob-density` of `marketing` | `product` | `data`.
- [ ] **Control geometry did not move with density.** An M button is 34px tall in all three zones.
      If a dense region shrank its buttons, the zone rule was misused.
- [ ] **Columns share a baseline.** Where two columns sit side by side, each opens with a
      `--mob-header-row-h` (34px) header row and the first card in each column has the same `top`.
      ```js
      document.querySelectorAll('[data-col] > :nth-child(2)') // substitute your selectors
      ```
      Measure `getBoundingClientRect().top` for the first card in each column; the values must be
      equal. Unequal by 3px is the classic symptom of one header carrying a stray margin.
- [ ] **No one-off gutters.** Grid and stack gaps are `--mob-grid-gap` / `--mob-stack-gap` /
      `--mob-card-gap`. A single `gap: 18px` inside an otherwise 20px grid is a fail even though
      nobody will notice it in isolation — the point of the rule is that nobody notices any of them.
- [ ] **Every flex or grid child that holds text has `min-width: 0`.** Without it the child refuses
      to shrink and pushes the row wider than its container. This is the single most common cause of
      the next item failing.
- [ ] **No horizontal body scroll at any tested width.**
      ```js
      document.documentElement.scrollWidth <= document.documentElement.clientWidth
      // if false, find the offender:
      [...document.querySelectorAll('body *')]
        .filter(e => e.getBoundingClientRect().right > document.documentElement.clientWidth + 1);
      ```
- [ ] **Mobile hierarchy is intact.** At 375px, the first three blocks in reading order are the same
      three the desktop screen leads with. Reordering for convenience of the CSS is a fail: the
      screen now teaches a different priority on phones than on desktop.
- [ ] **Sticky elements declare `--mob-z-sticky`** and nothing in the screen uses an arbitrary
      z-index. Any `z-index` not drawn from `--mob-z-*` is a finding.

---

## 4. Components

- [ ] **Repeated controls are identical to the pixel.** Collect the rendered height of every instance
      of a component class; the set must contain one value per size step and nothing else.
      ```js
      const heights = sel => [...new Set([...document.querySelectorAll(sel)]
        .map(e => e.getBoundingClientRect().height.toFixed(2)))];
      heights('.mob-btn');       // ⊂ ["30.00","34.00","40.00"]
      heights('.mob-icon-btn');
      heights('.mob-tab');
      ```
      Two buttons that differ by 1px is an explicit anti-pattern in this system, not a rounding
      detail: exact repetition is what makes the surface read as one product.
- [ ] **Every required state from §1 is present and reachable** for every component on the screen.
      Reachable means a reviewer can produce it — disable the control, cut the network, empty the
      collection, tab to it.
- [ ] **Loading causes no layout shift.** Skeletons (`--mob-bg-tile`) match final geometry. Test:
      record the container's box while loading and after data arrives.
      ```js
      const box = () => document.querySelector('#region').getBoundingClientRect();
      // before data, then after: height and top must be unchanged
      ```
      A centred spinner that replaces a whole region is legal only where the region's final geometry
      is genuinely unknown.
- [ ] **One icon family, one stroke language.** Icon boxes are 16 / 20 / 24 only
      (`--mob-control-icon`, `--mob-control-icon-lg`). No mixed outline and filled styles unless
      filled *is* the selected state. Mixed families are visible at a glance and are never a
      deliberate choice.
- [ ] **Icons inherit `currentColor`** except where a data series colour is the information.
- [ ] **Buttons are `<button>`, links are `<a href>`.** Expect an empty result.
      ```js
      [...document.querySelectorAll('[onclick],[role="button"]')]
        .filter(e => !['BUTTON','A','INPUT'].includes(e.tagName));
      ```
- [ ] **One primary action per action group.** Two accent-filled buttons in one row is a fail: the
      screen has stopped telling the user what to do next.
- [ ] **Disabled does not resemble a secondary action.** Disabled is `--mob-bg-disabled` +
      `--mob-fg-disabled` with `cursor: not-allowed`; it must not read as a ghost button that simply
      does nothing when clicked.
- [ ] **No component sets `font-family`, `letter-spacing` or `font-weight` directly.** Those come
      from the role classes in base.css. A component that restates them will drift when a role changes.
- [ ] **Segments of a fused card shrink rather than overflow** — every segment is
      `box-sizing: border-box` with a `flex` basis *and* a `min-width`, and the frame background shows
      through as the 1px seam whether the segments sit in one row or wrap onto two.

---

## 5. Content

- [ ] **Sentence case everywhere except `.mob-label`.** Uppercase is reserved for the micro-label role
      (`--mob-size-3xs` + `--mob-tracking-label`). Uppercase anywhere else is a fail — excessive
      uppercase is on the anti-pattern list because it destroys the density the type scale buys.
- [ ] **Button labels name the resulting action.** "Claim fees", "Close position", "Copy address" —
      not "OK", "Submit", "Click here", "Learn more about…". Test: read the label out of context; if
      you cannot say what will happen, it fails.
- [ ] **No filler.** "Please", "kindly", "simply", "just", "exciting", "seamlessly" appear nowhere.
- [ ] **Every number is mono and tabular.** `font-variant-numeric: tabular-nums` is inherited from
      `body`; a component that resets `font-family` on a number breaks column alignment in every
      table below it.
- [ ] **One compact-format convention product-wide.** Either `$24.8K` / `$3.21M` or `$24,800.00`,
      never both in one screen, and never both for the same quantity in two places.
- [ ] **Precision is consistent down a column.** `$4,800.09` and `$3,206.85` may share a column;
      `$4,800.09` and `$3,206.8` may not.
- [ ] **Signs are explicit and consistent** on every delta: `+4.82%` / `−1.36%`, using the minus sign
      `−` (U+2212), not a hyphen — a hyphen in tabular figures is visibly narrower and breaks the
      column.
- [ ] **Tone comes from `[data-mob-sign]` or a `.mob-tone-*` class, never from a hardcoded colour**,
      and a sign character or icon always accompanies the colour. See §8 for why.
- [ ] **Every truncation has a full-value affordance.** `.mob-truncate` and any shortened address or
      hash (`7xQp…91Md`) must be accompanied by at least one of: a `title` attribute, a copy control,
      or a detail view that shows the whole value. A truncated identifier with no way to recover it
      is a data-loss bug wearing a design costume.
- [ ] **Relative time carries an absolute.** "updated 3s ago" has the exact timestamp in a `title` or
      tooltip; the relative form alone is unusable the moment the user looks away.
- [ ] **Empty and error copy is specific.** It names what is missing and what to do about it. "No
      open positions / Paste a token address to open your first ladder" passes; "Nothing here" fails.
- [ ] **Chips and badges carry a word or a short phrase, never a sentence.**

---

## 6. Motion

- [ ] **Every transition duration is a token.** Interaction feedback is ≤ 220ms; only an enter
      animation may reach `--mob-duration-enter` (260ms).
      ```js
      const ok = new Set(['0s','0.08s','0.12s','0.16s','0.22s','0.26s']);
      [...document.querySelectorAll('body *')]
        .map(e => [getComputedStyle(e).transitionDuration, e])
        .filter(([d]) => d.split(', ').some(v => !ok.has(v)));
      ```
- [ ] **Only `transform`, `opacity` and colour properties animate.** Anything transitioning `width`,
      `height`, `top`, `left`, `margin`, `padding` or `all` is a fail — those animate on the layout
      thread and drop frames on exactly the dense screens this system is built for. `all` fails even
      when it currently looks fine, because it silently starts animating layout the next time a
      property is added.
      ```js
      [...document.querySelectorAll('body *')]
        .map(e => [getComputedStyle(e).transitionProperty, e])
        .filter(([p]) => /\b(all|width|height|top|left|right|bottom|margin|padding|font-size)\b/.test(p));
      ```
- [ ] **Press is `scale(var(--mob-press-scale))` — 0.985 — and nothing else.** No card scales to 1.05;
      no element lifts, scales and glows at once.
- [ ] **No layout shift on hover.** Hover changes surface, border colour, text colour, or a 1–2px
      translate. A hover that changes border-width, padding or font-size moves the rest of the row and
      is a fail.
      ```js
      // hover the element, then compare:
      const before = el.getBoundingClientRect(); /* dispatch mouseover */ const after = el.getBoundingClientRect();
      ```
- [ ] **Hover language is consistent by component class.** Every card in the screen hovers the same
      way. Per-card bespoke hover effects are an explicit anti-pattern.
- [ ] **Nothing decorative blocks input.** The screen is clickable during any enter animation; no
      element covers content with `pointer-events` left on; there is no splash sequence.
- [ ] **Reduced motion is honoured, verified by emulation, not by reading CSS.** Turn on
      `prefers-reduced-motion: reduce` in DevTools and reload: nothing moves. reset.css neutralises
      CSS transitions globally, so the realistic failure is a JavaScript animation (a spring library,
      a scroll-driven tween) that never consults the media query.
      ```js
      matchMedia('(prefers-reduced-motion: reduce)').matches // must gate every JS animation
      ```
- [ ] **Overlays enter with opacity + a 4–8px translate and exit faster than they enter**
      (`--mob-ease-enter` in, `--mob-ease-exit` out). An overlay that exits on the enter curve feels
      sticky.

---

## 7. Accessibility

Contrast ratios below are measured against `--mob-bg-surface` (#101114), the worst realistic case for
text on a card. Values against `--mob-bg-canvas` are marginally higher.

| Token | Ratio on surface | Legal for |
|---|---:|---|
| `--mob-fg-primary` | 15.7 | anything |
| `--mob-fg-secondary` | 12.6 | anything |
| `--mob-fg-muted-hi` | 7.2 | anything |
| `--mob-fg-muted` | 6.3 | anything |
| `--mob-fg-label` | 4.49 | labels and short metadata — see note |
| `--mob-fg-dim` | 3.1 | **not body text** — see note |
| `--mob-positive` | 9.8 | anything |
| `--mob-negative` | 6.8 | anything |
| `--mob-accent-bright` | 10.2 | anything, and the focus ring |
| `--mob-fg-link` | 6.9 | anything |
| `--mob-accent` as text | 4.3 | **fails AA as normal text on a card** |

- [ ] **Body and data text is ≥ 4.5:1.** In practice: any token above `--mob-fg-label`.
- [ ] **`--mob-fg-dim` carries no unique information.** At 3.1:1 it is below AA at every size this
      system uses it at. It is legal for supplementary text whose content is available elsewhere on
      the screen (a repeated unit, a decorative sub-line). Putting the only copy of a fact in dim
      text is a fail.
- [ ] **`--mob-fg-label` is not used for sentences.** It lands at 4.49:1 on `--mob-bg-surface` — it
      clears AA on the canvas and misses it by a hair on a card. That is fine for the uppercase
      micro-label and short metadata it was measured for, and not fine for a paragraph.
- [ ] **If the project certifies AA, the hardening comes from `css/a11y.css`, not from this screen.**
      The layer replaces every failing token with a measured value — `--mob-fg-label` `#797f88`
      (4.56), `--mob-fg-dim` `#797e85` (4.62), plus the accent and border values noted below — on
      `data-mob-a11y="AA"`. Check the attribute is present and the file is loaded after `tokens.css`.
      A screen that re-picks any of these greys locally is a fail: it is a second copy of a decision
      that already has one canonical answer.
- [ ] **Known deviation, logged not ignored: `--mob-fg-on-accent` (white) on `--mob-accent` measures
      4.37:1**, below AA for normal text, and 3.58:1 on `--mob-accent-hover`. The source system was
      calibrated this way. There is exactly one conforming route and it is not a local edit: load
      `css/a11y.css` and set `data-mob-a11y="AA"`, which swaps the accent for `#7a5bf5` (**4.52:1**)
      and hover for `#6f4fe8` (**5.30:1**). A screen that fixes this with its own hex, or by flipping
      the label to `--mob-fg-inverse`, is a fail even though it measures — the point is that the
      product answers this once. Shipping the calibrated default is allowed only as a recorded,
      deliberate exception.
- [ ] **Non-text contrast ≥ 3:1 for anything that carries meaning** — focus ring, selected borders,
      meter fills that are the only source of a value. Structural borders (`--mob-border-*`, all
      between 1.1 and 1.7 against their surfaces) are exempt because they carry no information; if a
      border is the *only* thing distinguishing two states, it is no longer structural and must meet
      3:1. The two known cases have a canonical answer in `a11y.css`: `--mob-field-border` rises from
      1.37:1 to `#5e6164` (**3.08:1**), and `--mob-accent-deep` — the inactive meter bin — from
      2.81:1 to `#6247d8` (**3.07:1**).
- [ ] **Colour is never the only signal.** Every positive/negative value carries a sign character;
      every status carries a word; every series carries a label or a legend. Test: screenshot the
      screen, desaturate it, and confirm every state is still readable.
- [ ] **Tab from the top of the document reaches every interactive element, in visual order**, and
      leaves. No trap except an open modal. Screenshot each stop.
- [ ] **Focus is visible on every stop.** base.css guarantees `--mob-focus-ring` on `:focus-visible`;
      the realistic failure is a component that set `outline: none` or overwrote `box-shadow` in its
      own rule. Any focused element rendering neither an outline nor a ring is a fail.
- [ ] **Escape closes every overlay**; Enter and Space activate every control that looks like a
      button; arrow keys move within a menu, tab list and radio group.
- [ ] **Focus returns to the trigger** when a modal, menu or popover closes.
- [ ] **Semantics.** One `<h1>`; heading levels not skipped; lists are `<ul>`/`<ol>`; tables use
      `<th scope>`; landmarks (`<header>`, `<nav>`, `<main>`) present.
- [ ] **Every form control has a programmatic label** (a `<label for>`, `aria-label`, or
      `aria-labelledby`), and every icon-only control has `.mob-sr-only` text or `aria-label`. A
      tooltip is not a label.
      ```js
      [...document.querySelectorAll('input,select,textarea')]
        .filter(e => !e.labels?.length && !e.getAttribute('aria-label') && !e.getAttribute('aria-labelledby'));
      ```
- [ ] **Live regions are used for events, not for polling.** Toasts are `role="status"` /
      `aria-live="polite"`; validation and failures are `role="alert"`. A polling counter such as
      "updated 3s ago" must **not** be live — it would be announced every few seconds and make the
      screen unusable with a screen reader.
      ```js
      [...document.querySelectorAll('[aria-live],[role="status"],[role="alert"]')]
      ```
- [ ] **Touch targets ≥ 44×44 at `pointer: coarse`.** base.css grants the floor to `.mob-btn`,
      `.mob-icon-btn`, `.mob-tab`, `.mob-menu-item` and `.mob-chip[data-mob-interactive]`. Anything
      interactive outside that list needs its own, without changing its painted size.
- [ ] **200% browser zoom loses no content and introduces no horizontal scroll.**
- [ ] **A destructive action confirms before executing**, and the confirmation names what will be
      destroyed. The confirm button carries the destructive tone; the cancel is the default focus.

---

## 8. Responsive

- [ ] **Checked at three widths: 375, 768, 1440.** Screenshot each. A screen reviewed at one width
      has not been reviewed.
- [ ] **Also checked above `--mob-container-app` (1460px)** — content centres, gutters hold, nothing
      stretches to fill.
- [ ] **Nothing is clipped.** No `overflow: hidden` cutting a descender, a focus ring, or a glow.
      Focus rings are 4px outside the box: a container that clips them makes the keyboard path
      invisible.
- [ ] **Tables scroll rather than squash.** A wide table lives in an `overflow-x: auto` wrapper with a
      visible scroll cue; row height, column widths and type size are unchanged by the wrapper.
      Shrinking a table's font to make it fit is a fail — it breaks the type scale to hide a layout
      problem.
- [ ] **Fused segments wrap cleanly.** When a segmented card wraps, the 1px gap becomes a horizontal
      hairline in the frame colour automatically. Confirm it does, and that no segment lost its
      `min-width`.
- [ ] **Side-by-side blocks become vertical flow, not tiny two-column cards.**
- [ ] **The primary action is reachable without scrolling on mobile**, and expands to available width
      where it is the only action.
- [ ] **Display type is fluid, not stepped.** `.mob-display-*` and `.mob-heading-xl` use `clamp()`;
      there is no abrupt size jump at a breakpoint.
- [ ] **Nothing renders below 9.5px on any width.** The scale bottoms out at `--mob-size-3xs`; going
      below it is not "denser", it is unreadable.
- [ ] **Hover-only affordances have a touch equivalent.** Anything revealed on hover — a row's action
      buttons, a tooltip carrying a value — is reachable on a touch device.

---

## 9. Data states

Every region that renders fetched data ships five designed states. "Designed" means a token-level
specification exists and the state is reachable; a browser default, a blank area, or an unstyled
error string is a fail.

| State | Requirement | Fail looks like |
|---|---|---|
| **Empty** | Dashed `--mob-border-dashed` panel at `--mob-radius-lg`/`-xl`, a title, one line of explanation, one action. | A blank region, or a spinner that never resolves. |
| **Loading** | Skeleton at `--mob-bg-tile` matching final geometry, including height. | Content jumping when data arrives. |
| **Error** | Inline, in `--mob-negative`, with a retry control, in the region that failed. | A toast alone — it disappears and takes the recovery path with it. |
| **Partial** | Render what arrived; mark what did not, per field. | The whole region failing because one field is missing. |
| **Stale** | Show the age; dim to `--mob-fg-muted` or show a refreshing indicator without blocking interaction. | Silently showing old numbers as if current. |

- [ ] All five exist for every data region on the screen.
- [ ] **Zero is not empty.** A value of `$0.00`, a meter at 0, and a list of 0 items rendered as "0"
      are all *data*. The empty state is for "we have nothing to show", not for "the answer is zero" —
      conflating them tells the user the product is broken when it is working.
- [ ] **Negative values flip tone, and nothing else about them changes** — same size, same font, same
      position. Tone comes from `[data-mob-sign]`.
- [ ] **Optimistic updates have a defined failure path.** If a value updates before the server
      confirms, there is a revert and a message. Silent divergence between the screen and the server
      is the worst failure this checklist can catch.
- [ ] **Poll-driven values do not shift layout when they change.** Tabular numerals make this free;
      verify that a number growing from `$9.99` to `$10.00` moves nothing.
- [ ] **The empty state's action is the real action**, not a link to documentation.

---

## 10. Reviewing someone else's screen

### Order of checks

Run these in order. The first four find defects nobody can argue with, in about ten minutes, and they
find *different* defects from the token audit — a screen can be perfectly tokenised and still be
unusable.

1. **Zoom out to 50% and squint.** Is the largest thing on the screen the most important thing? Is
   the accent where the next action is? This is the only judgement call in the review, and it is
   first because everything after it is cheaper to fix than a wrong hierarchy.
2. **Tab through it, from the top.** The keyboard path is the fastest way to find missing states,
   fake buttons, and focus that has been styled away. Screenshot every stop.
3. **Resize to 375px.** Second-fastest source of real bugs: overflow, clipped content, squashed
   tables, lost hierarchy.
4. **Enable reduced motion and reload.** One media query, one reload, catches every JS animation that
   ignores the OS.
5. **Cut the network, then throttle it.** Produces the error and loading states without asking the
   author to build a switch.
6. **Then run the token audits** in §2–§6. These are mechanical; save them for last because a console
   snippet cannot tell you the screen is confusing.

### How to report a finding

Report against the system, never against your taste. Use this shape:

```text
[Group] <what you observed>
Rule:     <section of this doc, token name>
Where:    <selector, or screenshot region>
Expected: <token value>   Actual: <measured value>
Severity: blocker | fix-before-ship | follow-up
```

Worked example:

```text
[Layout] Section gap between the header and the positions grid is 28px.
Rule:     12-qa §3, --mob-section-gap (64px in the product density zone)
Where:    main > section.positions
Expected: 64px   Actual: 28px
Severity: fix-before-ship
```

The same observation reported badly — *"the spacing feels cramped up top"* — is unactionable, invites
a debate about taste, and will be relitigated on the next screen.

### Severity

| Severity | Definition | Ships? |
|---|---|---|
| **Blocker** | Unusable or inaccessible: no keyboard path, focus invisible, body text below 4.5:1, a destructive action with no confirmation, data loss, or a state that cannot be exited. | No. |
| **Fix-before-ship** | A visible system violation: wrong token, missing required state, layout shift, a repeated control that differs from its twin. | No. |
| **Follow-up** | Consistent with the system and improvable. Copy that could be sharper, a state that could be richer. | Yes. |

**Pass condition:** the screen ships when every blocker and every fix-before-ship item is closed.
Follow-ups are logged, not gated.

### When you cannot cite a rule

Two honest outcomes, and only two:

- **It is taste.** Drop it. A review that mixes taste with rules teaches authors to argue with the
  rules.
- **It is a gap in the system.** File it against the system: propose the token, the state, or the
  role, with the case for it. The trigger is repetition — if three screens have needed the same
  value that this system does not have, the system is incomplete and this document is the wrong
  place to fix it.

A rule you disagree with is changed in the system document, with an argument, once — not waived in
a review, quietly, per screen.
