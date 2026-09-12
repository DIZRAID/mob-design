# 08 — Content style

Interface copy is a component with a size budget. A button label is 11.5px mono inside a 104px
column; a micro-label is 9.5px uppercase above a number. Copy that runs to a second line does not
"read a bit long" — it changes the geometry of the card. So the constraint is real, and the voice
falls out of it:

> **short · direct · product-oriented · specific · low on filler · consistent in capitalisation**

Every rule below has a reason. A rule without one gets ignored the first time it is inconvenient.

---

## 1. Capitalisation

| Case | Where | Why |
|---|---|---|
| **Sentence case** | Everything: headings, buttons, labels, menu items, tabs, empty states, errors, tooltips, table headers | One rule means nobody has to decide, so nothing drifts. It also reads faster — capitals are landmarks, and a line of them has none. |
| **Title case** | Proper nouns only: product names, feature names the product itself has named, third-party brands | `Robinhood Chain`, not `Robinhood chain` `[src]` |
| **ALL CAPS** | The micro-label role only — `.mob-label`, 9.5px, `--mob-tracking-label` | Uppercase at 9.5px with 0.7px tracking is a *texture* that says "this titles a number". Used on a sentence it becomes shouting, and the anti-pattern list bans it. |

Never capitalise a common noun to make it feel important. `New position` `[src]`, not
`New Position`. The distinction is: does the product have a thing called a Position with a capital
P that appears in its own navigation? Then it is a proper noun. Otherwise it is a word.

---

## 2. Button labels

A button label names the result of pressing it. The user should be able to predict the next screen
from the label alone.

| Good | Bad | What went wrong |
|---|---|---|
| `Connect wallet` | `Click here to proceed` | Names the mechanism instead of the outcome, and breaks on touch and in a screen reader. |
| `Create position` | `Get started` | Every button is a start. Which thing gets created? |
| `View details` | `More` | "More" of what, and does it navigate or expand? |
| `Try again` | `Please kindly select an option` | Filler, and it is not even an action. |
| `Copy address` | `Copy to clipboard` | The clipboard is plumbing. The address is the thing. |
| `Close position` | `Continue` | The destructive verb has been hidden behind a neutral one. |
| `Paste address` `[src]` | `Learn more about this exciting feature` | Marketing voice inside a product surface. |
| `Claim` `[src]` | `Claim your rewards now!` | Exclamation, second person, urgency the product has not earned. |

Rules:

- **Verb + object, three words maximum, ~24 characters.** `--mob-control-px-md` is 15px of padding
  each side; a fourth word pushes an M button past the width its neighbours were laid out for.
- **Drop the article.** `Close position`, not `Close the position`.
- **Drop the possessive.** `Copy address`, not `Copy your address`.
- **A verb alone is fine when the object is unmistakably the thing the button sits inside.** The
  handoff's `Claim` and `Close` `[src]` sit inside one position's card, so the object is the card.
  The same buttons in a toolbar above a list of positions would need the object.
- **The destructive verb appears in the destructive button.** See §6.
- **Loading does not change the label's meaning.** `Claim` → `Claiming…`, never `Claim` → `Please
  wait`. Reserve the wider label's width so the button does not resize mid-press.
- **Budget +30% for translation.** The control geometry cannot grow, so the English label has to
  leave room.

---

## 3. Labels versus helper text

| | Label | Helper text |
|---|---|---|
| Answers | "What is this?" | "What should I put in it, or what will it do?" |
| Form | Noun phrase. No colon, no period. | One sentence. Period. |
| Length | 1–3 words | ≤ 12 words |
| Type role | `.mob-label` (micro-label above a value) or the field's own label at `--mob-size-sm` | `.mob-meta` / `--mob-fg-muted` |
| Persistence | Always visible — it does not become a placeholder | Always visible; it is not an error slot |

```text
Label        Slippage tolerance
Field        [ 0.50            ] %
Helper       Your transaction reverts if the price moves more than this.
```

- **A placeholder is an example of a valid value, never the label.** `0.50`, not `Enter slippage`.
  A label that vanishes on focus is a label the user cannot check their answer against.
- **Helper text says what the value affects, or what format it takes — not what the field is.**
  "Enter your slippage tolerance" is the label restated with a verb glued on; it costs a line and
  adds nothing.
- **Helper text is not a warning slot.** When the message is conditional, it is an error or a
  warning and it gets the corresponding tone; the helper stays put underneath or is replaced by
  the error, not stacked below it.
- **Units live in the field, not the label.** `Slippage tolerance` with a `%` adornment beats
  `Slippage tolerance (%)`.

---

## 4. Errors

Three slots, in this order: **what happened · why · what to do next.** The third slot is the one
teams drop, and it is the only one the user needs.

| Slot | Rule |
|---|---|
| What happened | Name the operation that failed, in the user's words, past tense. |
| Why | One clause. Only if it is true, specific, and not an internal detail. |
| What next | An action they can take. If there is a button, the sentence names it. |

| Good | Bad |
|---|---|
| `Claim failed — the network rejected the transaction. Try again.` | `Something went wrong.` |
| `Couldn't load positions. Check your connection, then retry.` | `Error 500` |
| `That address isn't valid on this chain. Paste a chain address.` | `Invalid input` |
| `Not enough balance to close this position — you need $2.14 more in fees.` | `Insufficient funds` |
| `Session expired. Sign in to continue.` | `Oops! Uh oh, something broke 😬` |

- **Never blame the user.** "You entered an invalid address" → "That address isn't valid on this
  chain." The second one is also more specific, which is why it is more useful.
- **Never apologise instead of explaining.** "Sorry!" is not information.
- **A raw error code goes on a second line in `--mob-fg-dim`, never alone.** Support needs it; the
  user does not read it.
- **Placement follows scope.** A field error sits under its field. An operation error sits inline,
  where the operation was invoked. A toast is only for something that has already been handled and
  requires no follow-up — never for anything the user must remember or act on later, because a
  toast leaves.
- **An inline error keeps the retry next to it.** The handoff specifies exactly this: inline
  message in `--mob-negative` with a retry action `[src]`.

---

## 5. Empty states

Anatomy: **title · one line · one action.** Nothing else.

```text
No open positions                                     .mob-title / 13px 600  [src]
Paste a token address to open your first ladder.      .mob-body-sm / 10.5px --mob-fg-muted  [src]
[ Paste address ]                                     ghost button  [src]
```

There are three different empties and they must not share copy:

| Empty | Title | Line | Action |
|---|---|---|---|
| **Nothing yet** (first run) | Names what is missing | How to get the first one | The first step |
| **Nothing matches** (filters or search) | `No positions match these filters` | — | `Clear filters` |
| **Nothing left** (all done) | `All fees claimed` | When the next one is expected | none |

- **The title states the fact, not the feeling.** `No open positions`, not `Nothing here yet!`
- **The line is instruction, not consolation.** It tells them the next move.
- **The action is the first step, not a tour.** `Paste address` puts them one interaction from a
  non-empty state.
- **A filtered empty never suggests creating something.** They have data; they have hidden it.
  Offering "Create position" there is a misdiagnosis and it is annoying.

---

## 6. Destructive confirmation

**Confirm only what cannot be undone.** A confirmation on a reversible action teaches people to
dismiss confirmations, which is exactly the habit you need them not to have when the irreversible
one appears.

| Action | Treatment |
|---|---|
| Reversible, cheap (`Claim` `[src]`) | Do it. Optimistic update, undo or a retry on failure. No dialog. |
| Irreversible, bounded (`Close position` `[src]`) | Confirm once. Name the consequence. |
| Irreversible, high value (delete an account, wipe a workspace) | Confirm with a typed match of the object's name. |

The dialog names the consequence. It does not ask about feelings.

```text
Title      Close this position?
Body       Closing withdraws all liquidity and stops fee accrual.
           Unclaimed fees of $0.2194 are claimed to your wallet.
Cancel     Cancel
Confirm    Close position          ← .mob-btn--danger, verb repeated
```

| Good | Bad | Why |
|---|---|---|
| `Close position` | `Are you sure?` | "Sure" is not a fact. The user is being asked to confirm a consequence they have not been told. |
| `Delete 3 alerts` | `Yes` / `No` | The confirm button must be readable alone — that is where the eye lands. |
| `Cancel` | `No, take me back` | Chatty; and it is the low-emphasis button, so it should be the quietest word available. |
| `Closing withdraws all liquidity.` | `This action cannot be undone.` | Says *what* is lost, not just that something is. Keep the irreversibility line only if the consequence sentence does not already imply it. |

- **The confirm button carries the strong destructive variant** (`.mob-btn--danger`),
  muted at rest, saturating on hover — the intent reads without the dialog glowing.
- **Never make the destructive button the default focus target.** Focus goes to Cancel.
- **State the quantity.** `Delete 3 alerts` beats `Delete alerts`: it is a last chance to notice
  that the selection is wrong.

---

## 7. Loading and success

**Loading**

- **Prefer a skeleton to a word.** When the final geometry is known, a skeleton on `--mob-bg-tile`
  says "content, arriving" without a layout shift. Copy is for when the geometry is not known.
- **When copy is needed, name the operation.** `Claiming fees…` beats `Loading…`; `Signing 2 of 3`
  beats a spinner. The user is deciding whether to wait, and only the specific version helps.
- **Use the ellipsis character `…`**, not three periods.
- **Do not narrate steps the user did not ask about.** "Connecting to node…" is a log line.

**Success**

- **Success is silent when the result is visible.** If the FEES number just went to `$0.00` and
  the balance went up, a toast saying "Claimed!" is telling the user what they are looking at.
- **When the result is off-screen, state it with its value.** `Claimed $0.2194 in fees.` — not
  `Success!`, not `Done!`.
- **No exclamation marks.** Anywhere. A product that celebrates a routine operation has nothing
  left to say when something genuinely matters.
- **Undo, if it exists, lives in the success message** and stays as long as the undo window.

---

## 8. Tooltips

- **Supplemental only.** Nothing required to complete a task lives solely in a tooltip — tooltips
  do not exist on touch and are hostile to keyboard users.
- **Two lines maximum** inside `--mob-tooltip-max-w` (240px). A fragment takes no period; a
  sentence does.
- **No interactive content.** A link or a button inside a tooltip cannot be reached with a pointer
  before the tooltip closes.
- **Never restate the label.** A tooltip reading "Claim" on the Claim button is noise with a delay.

Three things that genuinely earn one:

| Case | Example |
|---|---|
| The exact value behind a rounded or truncated display (see `07-data-formatting.md`) | `+$0.21953104` on `+$0.2195` |
| A domain term the interface must use but cannot define inline | `Uncollected — fees earned but not yet withdrawn` |
| **Why a control is disabled** | `No fees to claim yet` |

The third is mandatory, not optional. A disabled control with no explanation is a dead end: the
user cannot tell whether it is broken, whether they lack permission, or whether they missed a step.

---

## 9. Numbers and units in prose

Rendering rules live in `07-data-formatting.md`. These are the sentence-level ones.

- **Numerals always, including below ten.** `1 ladder`, not `one ladder`. In a data product the
  digit is scanned, and the spelled form breaks that.
- **Never start a sentence with a numeral** — rewrite so it does not need to.
- **Pluralise from the count, always.** The prototype ships `1 ladder` in one place and
  `1 ladder · 1 rung` in another `[src]` — plural forms must come from the product's locale formatter, not by appending `s`, and it
  is the single most visible copy bug in the handoff. Take a plural function or an ICU message; a
  count and a noun are never concatenated by hand.
- **Prefer `1 rung` / `2 rungs` over `1 rung(s)`.** Parenthetical plurals are a note to the reader
  that nobody handled it.
- **Symbols in dense UI, words in prose.** `≥ $1,000` in a cell; "at least $1,000" in a sentence.
- **A unit is never separated from its number by a line break** — see `07-data-formatting.md` §11.
- **Percentages in prose keep their formatted precision.** `0.90%` `[src]`, not "about 1%".

---

## 10. Banned words

| Banned | Why | Instead |
|---|---|---|
| `Please` | Filler. It does not make a refusal kinder, and it costs a word in a control. | Drop it. |
| `Simply`, `just`, `easy` | Asserts the user's experience. When it isn't easy, it reads as an insult. | Drop it. |
| `Oops`, `Uh oh`, `Whoops` | Cute about a failure the user is paying for. | Name what failed. |
| `Something went wrong` | Says nothing and forecloses the sentence that would have. | Name the operation and the next step. |
| `Click here` | Names the mechanism, breaks on touch, useless out of context to a screen reader. | The action: `View details`. |
| `Learn more` | Unlabelled destination. | Name it: `Read the fee schedule`. |
| `Are you sure?` | Asks about a feeling instead of stating a consequence. | State what will happen. |
| `Invalid input` | Which input, and invalid how? | `That address isn't valid on this chain.` |
| `Sorry` | An apology in place of an explanation. | Explain. |
| `Delightful`, `seamless`, `powerful`, `exciting`, `revolutionary` | Marketing adjectives inside a product surface; unverifiable and self-congratulatory. | Delete, or state the fact underneath. |
| `Utilize`, `in order to`, `at this time` | Long forms of `use`, `to`, `now`. | The short form. |
| `Please wait` | Not information; also the moment the user most wants information. | Name the operation: `Claiming fees…` |
| `!` | Manufactured urgency. | A period. |

---

## 11. Where copy lives

Each copy role has one type role and one tone. If a piece of copy does not fit its role's budget,
the copy is wrong before the layout is.

| Copy role | Type role | Tone token | Budget |
|---|---|---|---|
| Micro-label above a value | `.mob-label` (9.5px, uppercase, 0.7px) | `--mob-fg-label` | 1–2 words |
| Control label | `.mob-control-label` (11.5px mono) | inherited from the control's tone | ≤ 3 words |
| Section / column title | `.mob-title` (14px sans 600) | `--mob-fg-primary` | ≤ 4 words |
| Value sub-line | `.mob-meta` / `.mob-dim` | `--mob-fg-label` / `--mob-fg-dim` | ≤ 4 words (`uncollected`, `1 ladder` `[src]`) |
| Metadata / timestamp | `.mob-meta` | `--mob-fg-label` | ≤ 4 words (`updated 3s ago` `[src]`) |
| Helper text | `.mob-body-sm` | `--mob-fg-muted` | 1 sentence |
| Inline error | `.mob-body-sm` | `--mob-negative` | 1–2 sentences |
| Empty-state title | `.mob-title` | `--mob-fg-primary` | ≤ 5 words |
| Empty-state line | `.mob-body-sm` | `--mob-fg-muted` | 1 sentence |
| Tooltip | `.mob-meta` | `--mob-fg-secondary` | ≤ 2 lines at 240px |

---

## 12. Checklist

- [ ] Sentence case everywhere except proper nouns and the uppercase micro-label role.
- [ ] Every button label names its outcome, in three words or fewer.
- [ ] No label is a mechanism (`Click`, `Submit`, `OK`) where an outcome would fit.
- [ ] Every field has a persistent label; no placeholder is doing a label's job.
- [ ] Every error says what happened and what to do next.
- [ ] The three empty states (nothing yet / nothing matches / nothing left) have different copy.
- [ ] Destructive dialogs name the consequence; the confirm button repeats the verb; focus is on Cancel.
- [ ] Reversible actions are not confirmed — they are undoable.
- [ ] No success toast for a result already visible on screen.
- [ ] Every disabled control explains itself.
- [ ] Every count is pluralised by a function, not by string concatenation.
- [ ] No banned words. No exclamation marks.
