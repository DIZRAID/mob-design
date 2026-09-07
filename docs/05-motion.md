# 05 — Motion

Motion in mob-design is a confirmation mechanism, not an effect. It exists to answer three
questions and nothing else: *did my input land*, *where did this thing come from*, *what changed*.
Everything that does not answer one of those is decoration, and decoration on a screen full of
live numbers is noise.

The source handoff states the whole policy in one line: **transform/opacity only, 100–200ms, no
bounce, wrapped in `prefers-reduced-motion`.** [src] Everything below is that rule made specific.

---

## 1. The policy

| Rule | Why |
|---|---|
| Geometry changes are `transform` and `opacity` only | They run on the compositor. Layout properties re-run layout and paint every frame. |
| Nothing animates for longer than `--mob-duration-enter` (260ms) | Past ~250ms an interface stops feeling like it responded and starts feeling like it is thinking. |
| No overshoot, no bounce, no spring | Overshoot implies mass. A 30px button has no mass. It also moves the control past its target and back, under a cursor that is already moving. |
| One thing moves at a time | Two simultaneous animations in the same region read as a glitch, not as choreography. |
| Motion never gates input | An element is clickable at delay 0, mid-animation or not. |

### Which properties you may transition

```
transform            ✔  compositor-only
opacity              ✔  compositor-only
color                ✔  paint-only
background-color     ✔  paint-only
border-color         ✔  paint-only
fill / stroke        ✔  paint-only
box-shadow           ✔  paint-only, but expensive — see the note below
─────────────────────────────────────────────
width / height       ✘  layout
top/right/bottom/left✘  layout
margin / padding     ✘  layout
gap                  ✘  layout
font-size            ✘  layout
letter-spacing       ✘  layout
flex-basis           ✘  layout
grid-template-*      ✘  layout
```

"transform/opacity only" in the handoff is shorthand for *geometry*. The entire hover language of
this system is colour — `--mob-bg-hover`, `--mob-border-hover`, a step up the foreground ramp — and
those are paint-only, so they are fine to transition. The line is not "colour vs transform", it is
**never animate a property that triggers layout**.

Three reasons, in order of how badly they bite:

1. **It moves the hit target out from under the cursor.** A card that grows 4px on hover pushes its
   own edge past the pointer, un-hovers itself, shrinks, re-hovers. The user sees a flicker and
   cannot click. This is the failure mode that costs a click, not just a frame.
2. **It reflows everything after it.** A row that animates its height re-lays-out the column below
   it 60 times a second. On a dense surface — a position card with a 16-bin grid, a sparkline and a
   composition bar per row — that is the difference between a smooth screen and a stuttering one.
3. **It cannot be composited.** `transform` and `opacity` are handed to the GPU and cost nothing per
   frame. `height` runs style → layout → paint → composite on the main thread, competing with the
   polling loop that refreshes your numbers.

**`box-shadow` caveat.** It is paint-only, so transitioning it is legal, but a large blur radius
repaints the whole box each frame. For a shadow or glow that animates, put it on an absolutely
positioned pseudo-element and animate that element's `opacity` instead. The result is identical and
costs nothing.

**The one exception: disclosure height.** Expanding a details panel genuinely changes layout and
there is no transform that fakes it. If you must animate it, use `grid-template-rows: 0fr → 1fr`,
add `contain: layout paint` to the panel, cap it at `--mob-duration-normal`, and never do it on a
surface that holds live-updating numbers. Default position: disclosure is instant. It is a state
change, not a journey.

---

## 2. Duration tokens

| Token | Value | Use it for |
|---|---|---|
| `--mob-duration-instant` | `80ms` | Press and release. Anything that must feel like the physical moment of contact. |
| `--mob-duration-fast` | `120ms` | Hover on controls: buttons, chips, menu items, table rows, icon buttons. **Every exit**, including every overlay's. Tooltips both ways. |
| `--mob-duration-normal` | `160ms` | Overlay entry (`--mob-overlay-duration`), tab indicator settle, selection changes. |
| `--mob-duration-slow` | `220ms` | Longer in-place moves: the determinate progress fill travelling to a new value. |
| `--mob-duration-enter` | `260ms` | Toast entry, page and section reveal. The longest thing in the system, and also the base unit for ambient loops (§4.8). |

The upper end is deliberately short. The source specification proposed 140/220/360/420ms; the
calibrated handoff caps state changes at 200ms, so the ladder was compressed to fit inside that
band. `--mob-duration-slow` and `--mob-duration-enter` sit above 200ms because they apply to things
*arriving* or *travelling*, not to state changes — a toast that appears in 260ms still feels
instant, a button that recolours in 260ms feels sticky.

**Exits are one step faster than entries.** A user who dismissed something has already decided; the
animation is now in their way. Every overlay in `overlay.css` implements this by swapping two
variables on close rather than writing a second rule:

```css
/* open   */ --mob-overlay-duration: var(--mob-duration-normal);
             --mob-overlay-ease:     var(--mob-ease-enter);
/* closed */ --mob-overlay-duration: var(--mob-duration-fast);
             --mob-overlay-ease:     var(--mob-ease-exit);
```

Copy that pattern for anything new. One transition declaration, two states, no duplication to drift.

**Ambient loops are derived, not tokenised.** Nothing in the duration ladder is long enough for a
breathing skeleton, so the loops multiply the base unit rather than inventing a value:
`calc(var(--mob-duration-enter) * 5)` = 1300ms for the skeleton sweep, the chip pulse, the stat
pulse and the indeterminate progress sweep; `calc(var(--mob-duration-slow) * 3)` = 660ms for
spinners. Derive the same way if you need another loop — a raw `1200ms` in a component stylesheet is
a value nobody can retune later.

---

## 3. Easing tokens

| Token | Curve | Use it for |
|---|---|---|
| `--mob-ease-standard` | `cubic-bezier(.2, 0, 0, 1)` | Anything that stays on screen: hover, colour, tab indicator, in-place moves, press. |
| `--mob-ease-enter` | `cubic-bezier(.16, 1, .3, 1)` | Things arriving: overlays, toasts, page reveal. Sharp deceleration into rest. |
| `--mob-ease-exit` | `cubic-bezier(.4, 0, 1, 1)` | Things leaving: accelerate out and be gone. |

Easings are `[drv]` — the prototype declares durations in prose and no curves at all. They were
chosen to satisfy the stated constraint mechanically: **no control point exceeds 1 on the y axis, so
none of these curves can overshoot.** That is what "no bounce" means in practice, and it is why you
cannot substitute a spring or a `cubic-bezier(.68,-.55,.27,1.55)` and claim it is in-system.

`--mob-ease-exit` accelerates (it starts slow-ish and ends fast) which is correct for something
leaving the screen; using it on an entry makes the element slam into place.

---

## 4. Per-component motion

Most of this is already implemented in `css/components/`. What follows documents what those files
do and why, so you can extend them without inventing a second motion vocabulary. Where a recipe is
*not* shipped, it says so.

### 4.1 The transition every control carries

`.mob-btn`, `.mob-tab`, `.mob-chip[data-mob-interactive]` and the field controls all carry the same
four-line block. Learn it once:

```css
transition:
  background-color var(--mob-duration-fast)    var(--mob-ease-standard),
  border-color     var(--mob-duration-fast)    var(--mob-ease-standard),
  color            var(--mob-duration-fast)    var(--mob-ease-standard),
  transform        var(--mob-duration-instant) var(--mob-ease-standard);
```

Three paint properties at hover speed, one transform at press speed. Note what is **not** there:
no `all`, no `box-shadow` on controls (the focus ring must appear instantly — a ring that fades in
is a ring that is not there yet when the user starts reading), and nothing that touches layout.

`transition: all` is banned outright. It silently animates every property you add later, including
the layout ones, and the failure shows up months after the line was written.

### 4.2 Button press

```css
.mob-btn:active { transform: scale(var(--mob-press-scale)); }   /* .985 [src] */
```

`--mob-press-scale: .985` is `[src]` — measured off every button in the handoff, primary and muted
alike. It is the entire press language of the system: one value, every tone, every size. `.mob-tab`
uses the same value, which is why a tab feels like a control rather than a link.

**Width limit.** `.985` is a *ratio*, so the visible movement grows with the element. On a 90px
button it is a 1.4px inset — a press. On a 600px full-width control it is a 9px inset — a wobble.
Rule: press-scale applies to controls narrower than ~320px. Wider controls press by luminance
instead, swapping to `--mob-bg-active` at `--mob-duration-instant`. Same information, no rubber.

Never scale a card, a table row or a whole panel on press.

### 4.3 Card hover — surface or border, never a lift

```css
.mob-card--interactive {
  transition:
    background-color var(--mob-duration-fast)    var(--mob-ease-standard),
    border-color     var(--mob-duration-fast)    var(--mob-ease-standard),
    box-shadow       var(--mob-duration-fast)    var(--mob-ease-standard),
    transform        var(--mob-duration-instant) var(--mob-ease-standard);
}
.mob-card--interactive:hover {
  background: var(--mob-card-bg-hover);
  border-color: var(--mob-card-border-hover);
}
```

**No `translateY`, no shadow appearing, no scale.** Depth in this system comes from surface plus a
1px border; cards get no drop shadow (see `docs/01-foundations.md`). A lift needs a shadow to read
as a lift — without one, a card that rises 3px reads as a rendering fault. And a card that moves is
a card that moves out from under the cursor.

**A fused segment moves even less.** `.mob-segmented__seg--interactive` transitions
`background-color` only, because a segment shares a 1px seam with its neighbours: any transform on
one segment tears the hairline it shares with the next.

**When a card gets a hover state at all.** Only when the whole card is one target — hence the
explicit `--interactive` modifier rather than a hover on `.mob-card`. A card that contains its own
action buttons stays inert, because the user cannot otherwise tell which of the two things they are
about to activate. The worked example: the dashboard's position card carries Claim / Close / `···`
inside it, so only the buttons respond.

### 4.4 Overlays — one shared contract

`.mob-tooltip`, `.mob-popover`, `.mob-menu`, `.mob-modal`, `.mob-drawer` and `.mob-modal-backdrop`
share a single mechanism, driven by `data-mob-state`:

```css
.mob-popover {                      /* open */
  --mob-overlay-duration: var(--mob-duration-normal);
  --mob-overlay-ease:     var(--mob-ease-enter);
  opacity: 1; translate: none; scale: none; visibility: visible;
  transition:
    opacity    var(--mob-overlay-duration) var(--mob-overlay-ease),
    translate  var(--mob-overlay-duration) var(--mob-overlay-ease),
    scale      var(--mob-overlay-duration) var(--mob-overlay-ease),
    visibility 0s;
}
.mob-popover[data-mob-state='closed'] {
  --mob-overlay-duration: var(--mob-duration-fast);
  --mob-overlay-ease:     var(--mob-ease-exit);
  opacity: 0; visibility: hidden; pointer-events: none;
  transition: /* …same list… */ visibility 0s linear var(--mob-overlay-duration);
}
```

Five things in there are deliberate and worth copying:

1. **Individual `translate` / `scale` properties, not the `transform` shorthand.** A shorthand forces
   every component to restate the whole transform to change one part of it, and two rules touching
   `transform` overwrite each other. The individual properties compose.
2. **`--mob-overlay-shift: 4px`** is the entrance travel, inside the specification's 4–8px band. The
   direction comes from placement: `--mob-overlay-tx` / `--mob-overlay-ty` are set per side, so a
   panel anchored below enters from `-4px` (nearer its trigger) and one anchored above enters from
   `+4px`. That direction is the only thing telling the user which of three adjacent controls
   opened the panel.
3. **`--mob-overlay-flip`** is `1` normally and `-1` under `[dir='rtl']`, so every inline-axis
   entrance mirrors without a second animation.
4. **`visibility` is delayed on exit**, not on entry: `visibility 0s linear var(--mob-overlay-duration)`.
   Without the delay the panel is hidden on frame one and the fade-out is invisible. It is the one
   non-transform property transitioned here, and it costs no layout.
5. **The panel's geometry never animates.** Menus cap at `--mob-menu-max-h` and scroll inside;
   popovers are `--mob-popover-w`. Fixed geometry means an opening panel can never reflow the page
   behind it, and a panel whose contents are still loading keeps its box so nothing jumps when the
   data lands.

**A tooltip is a hint, not an event:** it overrides `--mob-overlay-duration` to
`--mob-duration-fast` in both directions. It arrives at control speed because it is a response to a
pointer, not an arrival.

**Native `<dialog>` and `[popover]`** put the element in the top layer and toggle `display`, which
a plain transition cannot animate. `overlay.css` restates the same entrance behind
`@supports (transition-behavior: allow-discrete)` using `display`/`overlay` with `allow-discrete`
plus `@starting-style`. Both paths produce identical motion; pick whichever you drive and do not
mix them on one element.

### 4.5 Modal, drawer, sheet

| Token | Value | Meaning |
|---|---|---|
| `--mob-modal-enter-y` | `8px` | Content rises 8px into place |
| `--mob-modal-enter-scale` | `.98` | Content scales from .98 to 1 |

- **Backdrop and dialog share `--mob-overlay-duration`,** so they land together. Staggering them
  makes the dialog look like it arrived late to its own appearance.
- **Never enter from a scale above 1.** A dialog that shrinks into place reads as a retreat. `.98` is
  the floor as well as the value — below `.96` it reads as a zoom and the animation becomes the
  subject.
- **Drawers translate 100% of their own width**, mirrored by `--mob-overlay-flip`, and hold
  `opacity: 1` throughout: a full-height panel sliding in does not also need to fade, and fading it
  makes the edge look soft.
- **`.mob-modal--sheet`** is the mobile bottom-sheet variant. This is the one place a large translate
  is allowed, because the sheet *is* the surface — nothing sits under the cursor to be displaced.

### 4.6 Tab indicator

```css
.mob-tab::before {                  /* always present, never inserted */
  opacity: 0;
  transition:
    opacity   var(--mob-duration-fast)   var(--mob-ease-standard),
    transform var(--mob-duration-normal) var(--mob-ease-standard);
}
.mob-tab[aria-selected='true']::before { opacity: 1; transform: none; }
```

- **Every tab owns an indicator, hidden rather than absent.** Selecting a tab is then a change of
  opacity and transform on something already in the DOM — never an insertion, which would relayout
  the strip, and never a JS measurement of positions to drive a single travelling element.
- **Two speeds on purpose:** opacity at `--mob-duration-fast` so the state reads immediately,
  transform at `--mob-duration-normal` so the shape settles behind it. The unselected rest state is a
  scale (`--mob-tab-bar-scale-rest` for the underline bar, `--mob-tab-indicator-scale-rest: .96` for
  the plate variants), so the indicator *grows* into place instead of appearing at full size.
- **The honest trade-off:** because each tab has its own indicator, switching tabs is a crossfade
  with a scale, not a slide from the old position to the new one. You lose the "where did I come
  from" cue that a single travelling bar gives. You gain a component that needs no layout reads, no
  resize observer and no JS at all, and that cannot desynchronise from `aria-selected`. If your
  product genuinely needs the travel, build it as a variant that positions one shared indicator with
  `translate` and `scale` — never with `left` and `width`.
- **Never animate `left` and `width`** to move an indicator, in either design.
- **The state is driven by `aria-selected`, not by a class.** That is the accessibility contract and
  the styling hook at once, so the two can never disagree — see `docs/06-accessibility.md` §6.
- `.mob-tabs--underline` puts no background on hover: tone alone separates the states, which is what
  stops five tabs from reading as five ghost buttons.

### 4.7 Toast

```css
.mob-toast { animation: mob-toast-in var(--mob-duration-enter) var(--mob-ease-enter) both; }
.mob-toast[data-mob-leaving] { animation: mob-toast-out var(--mob-duration-fast) var(--mob-ease-exit) forwards; }

@keyframes mob-toast-in  { from { opacity: 0; transform: translateX(calc(var(--mob-feedback-dir) * var(--mob-toast-enter-x))); } }
@keyframes mob-toast-out { to   { opacity: 0; transform: translateX(calc(var(--mob-feedback-dir) * var(--mob-toast-enter-x))); } }
```

- `--mob-toast-enter-x` is `--mob-space-8` (8px), the top of the 4–8px band — a toast comes from
  further away than a menu because it was not summoned by a click on a specific control.
- `--mob-feedback-dir` flips the axis for a left-anchored region and for RTL, so one keyframe pair
  serves every placement.
- **`forwards` on the exit, and remove the node after `animationend`.** Height cannot be animated, so
  a leaving toast fades in place and the stack closes when the node actually goes. If you need the
  survivors to slide up, transform them — do not let flow reflow them.
- **`--mob-toast-w` is fixed** so an arriving toast can never reflow the stack.
- The toast is the one component in this system that spends a `box-shadow` (`--mob-shadow-md`). It
  floats over unknown content and needs a separation a border cannot give it. Cards still may not.
- A toast carrying an action does not auto-dismiss on a timer a slow reader can lose. See
  `docs/06-accessibility.md` §6 for the announcement and focus rules.

### 4.8 Loading loops

| Loop | Where | Period | Mechanism |
|---|---|---|---|
| `mob-skeleton-sweep` | `.mob-skeleton::after` | `--mob-skeleton-sweep-duration` = `calc(--mob-duration-enter * 5)` = 1300ms | `translateX(-100% → 100%)` over a `--mob-skeleton-sheen` gradient |
| `mob-pulse` | the in-place loading tile in `chip.css`, `stat.css`, `choice.css`, `table.css` | 1300ms, `alternate` (`--mob-table-skeleton-cycle` in tables) | `opacity .45 → 1` |
| `mob-spin` | `.mob-spinner`; the spinners inside buttons, fields and menus | `--mob-spin-duration` = `calc(--mob-duration-slow * 3)` = 660ms (`--mob-btn-spinner-cycle` 640ms in buttons, `--mob-spinner-duration` in fields, `--mob-menu-spinner-duration` in menus) | `rotate(1turn)`, linear |
| `mob-progress-slide` | `.mob-progress--indeterminate` | `--mob-progress-duration` = 1300ms | `translateX` sweep across a dimmed fill |
| `mob-nav-pending` | pending nav items | `--mob-nav-pending-cycle` | `opacity 1 → .3 → 1` |
| `mob-tabs-loading` | tab strip loading bar | `--mob-tabs-loading-cycle` | `translateX(-100% → 500%)` on a 20%-wide bar |

**Why one name and four call sites.** `@keyframes` names are global, so `mob-pulse` and `mob-spin`
are each declared **once**, in `motion.css`, and `chip.css`, `stat.css`, `choice.css`, `table.css`,
`button.css`, `field.css` and `overlay.css` all reference them. That is a real dependency:
`motion.css` must be in the bundle or every in-place loading state silently stops animating. What
each call site *does* own is its own duration token, so a table can breathe more slowly than a chip
without either file redefining the loop. The exceptions are listed in `02-components.md` §Keyframes:
`nav.css` declares `mob-nav-pending` and `mob-tabs-loading`, and `feedback.css` declares
`mob-toast-in`, `mob-toast-out` and `mob-progress-slide`. There are no per-component `-pulse` or
`-spin` variants.

Rules that hold across all of them:

- **Transform or opacity only, always.** The skeleton sweeps with `transform`, never with
  `background-position` — background-position repaints the whole box every frame, and on a grid of
  forty skeleton cells that is the difference between 60fps and 30.
- **Skeleton tone is `--mob-skeleton-bg` = `--mob-bg-tile`** (`#141518`, the measured skeleton
  colour `[src]`), with `--mob-skeleton-sheen` at 6% of `--mob-fg-primary`. Do not raise the sheen:
  on a near-black canvas a brighter sweep pulls the eye harder than the real content will once it
  lands.
- **Geometry must match what replaces it, exactly** — same height, same radius, same gaps.
  `--mob-skeleton-text-h` (9px) and `--mob-skeleton-title-h` (14px) are the *ink bands* of the type
  roles they stand in for, not the line boxes, which is why they look right in a stack. A skeleton
  2px off the row it replaces produces a visible jump on swap, and the loading state has then caused
  the layout shift it existed to prevent.
- **A live number is not replaced by a skeleton on refresh.** `.mob-stat` skeletons the value on
  first load only; on a poll it keeps the stale figure and marks the block `aria-busy`. A stale
  number is a better read than a pulsing block.
- **Every loop degrades to a correct static state.** `reset.css` clamps iteration count to 1, so the
  skeleton sweep parks off-screen and leaves a plain tile, the pulse settles, and the indeterminate
  progress bar keeps its dimmed fill — still legibly "in progress". These fallbacks are designed,
  not accidental; do not "fix" them back on.
- **Do not show a skeleton for a load that usually finishes fast.** Under roughly 200ms it is a
  flash. Delay mounting by ~150ms, or show nothing.

### 4.9 Page reveal — a recipe, not a shipped component

No component owns this; write it once in your app shell and use it sparingly.

```css
@keyframes mob-reveal {
  from { opacity: 0; translate: 0 6px; }
  to   { opacity: 1; translate: none; }
}
.reveal {
  animation: mob-reveal var(--mob-duration-enter) var(--mob-ease-enter) both;
  animation-delay: calc(min(var(--i, 0), 5) * 40ms);   /* HARD CAP: 5 steps */
}
```

```html
<section class="reveal" style="--i: 0">…</section>
<section class="reveal" style="--i: 1">…</section>
```

- **The cap is the point.** 40ms × 12 cards puts the last card 480ms behind the first, by which time
  the user is already clicking something. `min(var(--i), 5)` caps total stagger at 200ms no matter
  how many children there are.
- **Reveal regions, not rows.** The rail, the column header, the first screenful of cards. Never
  every row of a table — a staggered table cannot be read while it assembles, and a table is the
  thing people scan fastest.
- **Reveal once, on first paint.** Not on route change within the same shell, not on data refresh,
  never on scroll. Content that re-animates every time it is polled is unusable.
- **Nothing waits for it.** Elements are focusable and clickable at delay 0. No splash screen, no
  overlay that blocks input while the page assembles.
- Use `animation-delay`, not `transition-delay` — §6 explains why that distinction matters under
  reduced motion.

---

## 5. Hover language

Hover has one job: tell the user what is interactive *before* they commit. That makes consistency
functional, not aesthetic.

### Allowed mechanisms

| Mechanism | Tokens | Where |
|---|---|---|
| Background shift | `--mob-bg-hover`, `--mob-bg-active` | Rows, menu items, ghost controls, whole-card targets |
| Border contrast | `--mob-border-control` → `--mob-border-hover` / `--mob-border-strong` | Chips, inputs, outlined controls |
| Text contrast | one step up the ramp: `--mob-fg-label` → `--mob-fg-muted`, `--mob-fg-muted` → `--mob-fg-secondary` | Icon buttons, links, overflow controls, quiet actions |
| Tone step | a full `affirm` / `destroy` triplet moving to its `-hover` members | Muted action buttons |
| Icon movement | 1–2px `translate` on the glyph only | Chevrons, external-link marks, "next" affordances |
| Small translate | ≤2px, `transform` only | List-row disclosure marks. **Never on cards.** |
| Controlled glow | `--mob-glow-accent`, `--mob-glow-positive`, `--mob-glow-negative` | At most one element per screen |

### Not allowed

- **Scale on hover.** Scale is the press vocabulary (`--mob-press-scale`). Using it for hover
  destroys the distinction between "you are over this" and "you activated this".
- **Rotation** of anything except a disclosure chevron toggling open/closed.
- **Hue change.** A green control does not become a violet control on hover. Tone tokens move within
  their family: `--mob-affirm-fg` → `--mob-affirm-fg-hover`, never `--mob-affirm-fg` → `--mob-accent`.
- **A shadow appearing from nothing.** There were no shadows at rest; there are none on hover.
- **More than two mechanisms at once.**

On the two-mechanism cap: the measured action buttons move three properties on hover —
`--mob-affirm-fg` → `-fg-hover`, `--mob-affirm-bg` → `-bg-hover`, `--mob-affirm-border` →
`-border-hover`. That counts as **one** mechanism, because all three move together to one named
triplet within one tone family. Adding a 2px translate would be the second. Adding a glow would be
the third, and that is where a control stops reading as a control and starts reading as an
animation.

### Saturation is spent on hover, not at rest

This is the calibrated rule the muted tones exist to serve. `--mob-affirm-fg` (`#7fbfa2`) and
`--mob-destroy-fg` (`#c08b8b`) let "collect money" and "destructive" read at rest without the row
glowing; the saturated members (`#96d4b6`, `#dc9d9d`) only ever appear under the cursor, one row at
a time. Corollary, and it is a hard rule: **never use a `-hover` token as a resting value.** The
moment a `-hover` colour is static somewhere on the page, hover stops being distinguishable from
rest across the whole product.

### Hover behaviour belongs to the component class, never to the instance

Every `.mob-btn` with the destroy tone hovers identically on every screen. If one instance needs a
different hover, it is a different component: give it a variant, put the variant in the component
stylesheet, and let every future instance of it match.

The cost of per-instance hover is not that it looks untidy. It is that the user cannot learn the
interface. Hover is how someone tests what is clickable before they commit; if the test returns a
different answer each time, they stop running it and start guessing.

### Gate hover on a hover-capable pointer

```css
@media (hover: hover) {
  .mob-btn:hover { /* … */ }
}
```

On touch, an ungated `:hover` sticks after the tap — the control stays lit until something else is
tapped, which reads as "still loading" or "still selected". Every hover rule in a component
stylesheet belongs inside this query.

---

## 6. The reduced-motion contract

### What `reset.css` already does, globally

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}
```

This is deliberately blunt and deliberately global: it uses `!important` on the universal selector
so **no component can opt out and no author has to remember it.** State changes still happen — a
hover still recolours, a menu still opens, a toast still appears — they just arrive without a tween.
Infinite animations (the shimmer) run once and stop.

The duration is `.01ms` rather than `0` on purpose: `transitionend` and `animationend` still fire,
so any JavaScript sequencing that waits on them completes instead of hanging.

### What the author still owes

`reset.css` removes the *movement*. It cannot remove a dependency on movement. Four things remain
your job:

**1. Never encode meaning in motion alone.**
If the only signal that a value refreshed is a flash, a reduced-motion user gets no signal at all —
and neither does anyone who blinked or looked away. Pair it with something persistent: the changed
number itself, a tone change, and an announcement (`docs/06-accessibility.md` §8). The same applies
to a shake for an invalid field: the shake is the garnish, `aria-invalid` plus a message is the
signal.

**2. Never rely on an animation to reveal content.**
Anything sitting at `opacity: 0` in CSS and brought to `1` by an animation is a bet that the
animation runs. If it is JS-driven and the handler does not fire, the content is invisible forever.
Write the element's final visible state into the CSS and let the animation interpolate *toward*
something that is already true.

**3. Zero your reveal delays.** The reset clamps `animation-duration`, not `animation-delay`. A
reveal with `both` fill and a 200ms delay still leaves the element invisible for 200ms under
reduced motion. Patch it narrowly, in your app stylesheet — `[drv]`:

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-delay: 0ms !important; }
}
```

Scope it to `animation-delay` only. Do **not** add `transition-delay` to that rule: tooltip and
menu open-delays are intent detection, not motion, and zeroing them makes tooltips fire on every
accidental pass. This is why reveal staggers must use `animation-delay` and not a transition.

**4. Gate anything the CSS clamp cannot reach, in JavaScript.**
Scroll-linked animations have no duration to clamp. A `requestAnimationFrame` loop ignores CSS
entirely. Parallax, scroll-driven progress marks, counters that tick up to their value, canvas
charts that draw themselves in — all of these need the explicit check:

```js
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
if (!reduce.matches) { startTheAnimation(); }
reduce.addEventListener('change', e => e.matches && stopAndSettle());
```

`stopAndSettle()` must land on the final state, not the current frame.

**And: motion is not a loading state.** A spinner is a static glyph under reduced motion. Pair every
spinner with text (`Claiming…`) or a control marked `aria-busy`, so progress is legible when nothing
is spinning.

---

## 7. Anti-patterns

Motion-specific. The product-wide list is in `docs/10-anti-patterns.md`.

| Don't | Because |
|---|---|
| Animate `height`, `width`, `margin` or `gap` | Layout thrash, and the target moves under the cursor |
| Lift a card on hover | Depth here is surface + border; a lift with no shadow reads as a glitch |
| Scale on hover | Scale is the press vocabulary; overloading it erases the distinction |
| Use a spring or an overshoot curve | Implies mass a 30px control does not have |
| Stagger a table | The one thing users scan fastest becomes unreadable while it assembles |
| Re-run the page reveal on data refresh | The screen never settles |
| Animate a `-hover` token into a resting position | Hover stops being distinguishable, product-wide |
| Move a shared tab indicator with `left` / `width` | Layout animation on the one strip users navigate fastest — use `translate` + `scale` |
| Give one instance of a component a special hover | The user can no longer learn what is clickable |
| Block input during an entry animation | Motion is confirmation, never a gate |
| Ship a skeleton whose geometry differs from the content | Causes the layout shift it exists to prevent |
| Add `transition: all` | Silently animates layout properties you did not intend, including ones added later |

---

## 8. Checklist

Run this alongside the motion section of `docs/12-qa-checklist.md`.

- [ ] No transition or keyframe touches a layout property.
- [ ] Every duration is a `--mob-duration-*` token; every curve is a `--mob-ease-*` token.
- [ ] Exits are faster than entries.
- [ ] Press uses `--mob-press-scale` on controls under ~320px, and luminance above that.
- [ ] Hover rules are inside `@media (hover: hover)`.
- [ ] Hover behaviour is identical for every instance of the component class.
- [ ] At most two hover mechanisms; at most one glow on the screen.
- [ ] Page stagger is capped at 5 steps / 200ms and covers regions, not rows.
- [ ] Skeleton geometry matches the real content exactly.
- [ ] With reduced motion on: nothing is invisible, nothing is stuck at `opacity: 0`, every state
      change still reads, every spinner has a text companion.
- [ ] Nothing on the screen animates without a user action or a data change causing it.
