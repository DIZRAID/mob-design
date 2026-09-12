/* =============================================================================
   mob-design — Tailwind preset
   -----------------------------------------------------------------------------
   PRINCIPLE: expose a SMALL surface.

   A design system fails the moment two people can express the same intent two
   different ways. Tailwind makes that easy to do by accident — ship a config
   with a hundred colour keys and `bg-gray-800` becomes a legitimate-looking way
   to write a card, right next to `bg-background-surface`. So this preset maps
   the SEMANTIC tier and nothing else: the roles a component is allowed to read.
   Primitives are deliberately unreachable from a class name. If you find
   yourself wanting `bg-gray-925`, you wanted `bg-background-surface`.

   Most scales here REPLACE Tailwind's rather than extend it. That is the point:
   stock `text-sm`, `shadow-xl` and `z-50` do not exist. Radius keys such as
   `rounded-lg` remain, but point to the system's named radius tokens. Only
   `maxWidth` extends, so `max-w-full` survives.

   Every colour, radius, size and duration is `var(--mob-*)`, never a literal.
   Tailwind and the raw CSS therefore read the same values at runtime, and
   theme switching (`<html data-mob-theme="light">`) keeps working through the
   utility classes — which it cannot do if you compile hex into the config.
   The one exception is `screens`: media-query conditions are evaluated before
   custom properties resolve, so those must be literal. Keep them in step with
   the `--mob-bp-*` tokens by hand.

   ---------------------------------------------------------------------------
   HOW TO EXTEND — in order of preference

   1. Reach a token this preset does not name with arbitrary-value syntax:

        <div class="bg-[var(--mob-bg-elevated)] text-[var(--mob-fg-on-accent)]">

      This is not a workaround; it is the supported path for the long tail.
      It costs one token name in review, cannot drift from the CSS, and keeps
      the class-name surface small for everyone else.

   2. Needed often enough to earn a name? Add the KEY here, still pointing at
      an existing `var(--mob-*)`. Adding a name is a system decision.

   3. Need a value the system does not have? Add it to css/tokens.css first —
      tier 1 if it is raw, tier 2 if it is a role, tier 3 if it is a measured
      component value — then name it here. A new literal that exists only in
      this file is a bug: nothing in the CSS, the JSON mirrors, or the design
      tool will know about it.

   ---------------------------------------------------------------------------
   NOTE ON `spacing`: keys are PIXELS, not Tailwind's 4px steps. `p-16` is 16px
   here, not 64px. That is a real hazard when porting a stock-Tailwind screen;
   it is worth it because the key then matches the token (`--mob-space-16`) and
   a reviewer can check a class against the handoff without arithmetic.

   This file is CommonJS on purpose — Tailwind loads presets with require().
   The root package.json is "type": "module", so tailwind/package.json pins
   this directory back to "type": "commonjs". Keep both.
   ============================================================================= */

// USAGE — tailwind.config.js
//
//   module.exports = {
//     // Use './mob-design/tailwind/preset.js' for an in-repo clone.
//     presets: [require('mob-design/tailwind/preset.js')],
//     content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
//   };
//
// Import the CSS too. The preset emits var() references, it does not define
// them, and css/base.css carries the focus contract and the reset:
//
//   import 'mob-design/css/mob.css';

const size = (k) => `var(--mob-size-${k})`;
const leading = (k) => `var(--mob-leading-${k})`;
const TRACK_TIGHT = 'var(--mob-tracking-tight)';
const TRACK_LABEL = 'var(--mob-tracking-label)';
const TRACK_NONE = 'var(--mob-tracking-normal)';

/* Type roles. One entry per role in css/base.css, and the single source for
   both `fontSize` below and the `.mob-*` utilities in the plugin — so
   `text-label` and `.mob-label` can never disagree about the triple.

   family / weight / color / transform mirror base.css exactly. A figure role
   sets no colour on purpose: a figure's colour carries the sign of the value,
   applied separately (`text-feedback-positive`, `data-mob-sign`). */
const ROLES = {
  'display-xl':    { fs: ['clamp(40px, 6.4vw, var(--mob-size-12xl))', leading('display'), TRACK_TIGHT], family: 'sans', weight: 600, color: 'primary' },
  'display-lg':    { fs: ['clamp(34px, 5vw, var(--mob-size-11xl))',   leading('display'), TRACK_TIGHT], family: 'sans', weight: 600, color: 'primary' },
  'display-md':    { fs: ['clamp(28px, 3.6vw, var(--mob-size-10xl))', leading('tight'),   TRACK_TIGHT], family: 'sans', weight: 600, color: 'primary' },
  'heading-xl':    { fs: ['clamp(24px, 2.6vw, var(--mob-size-9xl))',  leading('tight'),   TRACK_TIGHT], family: 'sans', weight: 600, color: 'primary' },
  'heading-lg':    { fs: [size('8xl'),  leading('tight'),   TRACK_TIGHT], family: 'sans', weight: 600, color: 'primary' },
  'heading-md':    { fs: [size('4xl'),  leading('snug'),    TRACK_TIGHT], family: 'sans', weight: 600, color: 'primary' },
  'heading-sm':    { fs: [size('2xl'),  leading('snug'),    TRACK_TIGHT], family: 'sans', weight: 600, color: 'primary' },
  'title':         { fs: [size('xl'),   leading('snug'),    TRACK_NONE],  family: 'sans', weight: 600, color: 'primary' },
  'figure-xl':     { fs: [size('7xl'),  leading('tight'),   TRACK_TIGHT], family: 'sans', weight: 600 },
  'figure-lg':     { fs: [size('6xl'),  leading('tight'),   TRACK_TIGHT], family: 'sans', weight: 600 },
  'figure-md':     { fs: [size('5xl'),  leading('tight'),   TRACK_TIGHT], family: 'sans', weight: 600 },
  'figure-sm':     { fs: [size('3xl'),  leading('tight'),   TRACK_NONE],  family: 'mono' },
  'body-lg':       { fs: [size('4xl'),  leading('relaxed'), TRACK_NONE],  family: 'sans', color: 'secondary' },
  'body':          { fs: [size('lg'),   leading('relaxed'), TRACK_NONE],  family: 'sans', color: 'secondary' },
  'body-sm':       { fs: [size('md'),   leading('normal'),  TRACK_NONE],  family: 'sans', color: 'muted' },
  'value':         { fs: [size('xl'),   leading('normal'),  TRACK_NONE],  family: 'mono', color: 'primary' },
  'value-sm':      { fs: [size('base'), leading('normal'),  TRACK_NONE],  family: 'mono', color: 'secondary' },
  'meta':          { fs: [size('xs'),   leading('snug'),    TRACK_NONE],  family: 'mono', color: 'label' },
  'meta-sm':       { fs: [size('2xs'),  leading('snug'),    TRACK_NONE],  family: 'mono', color: 'label' },
  'dim':           { fs: [size('3xs'),  leading('normal'),  TRACK_NONE],  family: 'mono', color: 'dim' },
  'label':         { fs: [size('3xs'),  leading('snug'),    TRACK_LABEL], family: 'mono', color: 'label', transform: 'uppercase' },
  'control-label': { fs: [size('sm'),   leading('flat'),    TRACK_NONE],  family: 'mono' },
};

const fontSize = Object.fromEntries(
  Object.entries(ROLES).map(([k, r]) => [k, [r.fs[0], { lineHeight: r.fs[1], letterSpacing: r.fs[2] }]])
);

/* Border roles get their own namespace as well as living under `colors`, so the
   class reads `border-default` rather than `border-border-default`. DEFAULT is
   set explicitly because replacing `colors` would otherwise leave a bare
   `border` falling back to currentColor. */
const borderColor = {
  DEFAULT: 'var(--mob-border-default)',
  subtle: 'var(--mob-border-subtle)',
  frame: 'var(--mob-border-frame)',
  default: 'var(--mob-border-default)',
  control: 'var(--mob-border-control)',
  strong: 'var(--mob-border-strong)',
};

module.exports = {
  darkMode: ['selector', '[data-mob-theme="dark"]'],

  theme: {
    /* --- Colour ----------------------------------------------------------
       Semantic roles only. Anything absent here is reachable as
       `bg-[var(--mob-*)]` — see HOW TO EXTEND above.                       */
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      inherit: 'inherit',

      background: {
        canvas: 'var(--mob-bg-canvas)',
        sunken: 'var(--mob-bg-sunken)',
        surface: 'var(--mob-bg-surface)',
        raised: 'var(--mob-bg-surface-raised)',
      },
      text: {
        primary: 'var(--mob-fg-primary)',
        secondary: 'var(--mob-fg-secondary)',
        muted: 'var(--mob-fg-muted)',
        label: 'var(--mob-fg-label)',
        dim: 'var(--mob-fg-dim)',
      },
      border: {
        subtle: 'var(--mob-border-subtle)',
        frame: 'var(--mob-border-frame)',
        default: 'var(--mob-border-default)',
        control: 'var(--mob-border-control)',
        strong: 'var(--mob-border-strong)',
      },
      accent: {
        DEFAULT: 'var(--mob-accent)',
        hover: 'var(--mob-accent-hover)',
        pressed: 'var(--mob-accent-pressed)',
        bright: 'var(--mob-accent-bright)',
        deep: 'var(--mob-accent-deep)',
        tint: 'var(--mob-accent-tint)',
      },
      feedback: {
        positive: 'var(--mob-positive)',
        negative: 'var(--mob-negative)',
        warning: 'var(--mob-warning)',
        info: 'var(--mob-info)',
      },
      /* Categorical ramp for charts, composition bars and entity accents.
         Assign by index, never by meaning — series-6 is not "the green one". */
      series: {
        1: 'var(--mob-series-1)',
        2: 'var(--mob-series-2)',
        3: 'var(--mob-series-3)',
        4: 'var(--mob-series-4)',
        5: 'var(--mob-series-5)',
        6: 'var(--mob-series-6)',
        7: 'var(--mob-series-7)',
        8: 'var(--mob-series-8)',
      },
    },

    borderColor,

    /* --- Shape -----------------------------------------------------------
       No DEFAULT: radius is keyed to control size, so a bare `rounded` would
       be a decision made by omission. Name the step.                       */
    borderRadius: {
      none: '0',
      '2xs': 'var(--mob-radius-2xs)',
      xs: 'var(--mob-radius-xs)',
      sm: 'var(--mob-radius-sm)',
      md: 'var(--mob-radius-md)',
      lg: 'var(--mob-radius-lg)',
      xl: 'var(--mob-radius-xl)',
      '2xl': 'var(--mob-radius-2xl)',
      '3xl': 'var(--mob-radius-3xl)',
      full: 'var(--mob-radius-full)',
    },

    /* --- Spacing (keys are PIXELS) ---------------------------------------
       `px` is the hairline: fuse segments with `gap-px` over a `bg-background-frame`
       parent instead of drawing borders between them.                      */
    spacing: {
      0: 'var(--mob-space-0)',
      px: 'var(--mob-hairline)',
      2: 'var(--mob-space-2)',
      3: 'var(--mob-space-3)',
      4: 'var(--mob-space-4)',
      6: 'var(--mob-space-6)',
      8: 'var(--mob-space-8)',
      10: 'var(--mob-space-10)',
      12: 'var(--mob-space-12)',
      14: 'var(--mob-space-14)',
      16: 'var(--mob-space-16)',
      20: 'var(--mob-space-20)',
      24: 'var(--mob-space-24)',
      32: 'var(--mob-space-32)',
      40: 'var(--mob-space-40)',
      48: 'var(--mob-space-48)',
      64: 'var(--mob-space-64)',
      80: 'var(--mob-space-80)',
      96: 'var(--mob-space-96)',
      128: 'var(--mob-space-128)',
    },

    /* --- Type ------------------------------------------------------------ */
    fontFamily: {
      mono: 'var(--mob-font-mono)',
      sans: 'var(--mob-font-sans)',
    },
    /* Keyed by ROLE, not by size, and each key carries its own line-height
       and tracking. `text-label` provides label metrics; use `.mob-label` for
       the complete uppercase/family/tone composition.                      */
    fontSize,

    /* --- Motion ----------------------------------------------------------
       Policy: transform and opacity only. There is no duration above 260ms
       and no easing with overshoot, so "no bounce" is enforced by the scale
       rather than by review.                                               */
    transitionDuration: {
      DEFAULT: 'var(--mob-duration-normal)',
      instant: 'var(--mob-duration-instant)',
      fast: 'var(--mob-duration-fast)',
      normal: 'var(--mob-duration-normal)',
      slow: 'var(--mob-duration-slow)',
      enter: 'var(--mob-duration-enter)',
    },
    transitionTimingFunction: {
      DEFAULT: 'var(--mob-ease-standard)',
      standard: 'var(--mob-ease-standard)',
      enter: 'var(--mob-ease-enter)',
      exit: 'var(--mob-ease-exit)',
    },

    /* --- Depth -----------------------------------------------------------
       No DEFAULT, and no `shadow-card`: a card gets depth from surface plus
       a 1px border. These exist for things that genuinely float, plus the
       focus ring and the active-state glow.                                */
    boxShadow: {
      none: 'none',
      sm: 'var(--mob-shadow-sm)',
      md: 'var(--mob-shadow-md)',
      lg: 'var(--mob-shadow-lg)',
      focus: 'var(--mob-focus-ring)',
      'focus-inset': 'var(--mob-focus-ring-inset)',
      glow: 'var(--mob-glow-accent)',
      'glow-positive': 'var(--mob-glow-positive)',
      'glow-negative': 'var(--mob-glow-negative)',
    },

    /* --- Layers ---------------------------------------------------------- */
    zIndex: {
      auto: 'auto',
      base: 'var(--mob-z-base)',
      raised: 'var(--mob-z-raised)',
      sticky: 'var(--mob-z-sticky)',
      dropdown: 'var(--mob-z-dropdown)',
      popover: 'var(--mob-z-popover)',
      'modal-backdrop': 'var(--mob-z-modal-backdrop)',
      modal: 'var(--mob-z-modal)',
      toast: 'var(--mob-z-toast)',
      tooltip: 'var(--mob-z-tooltip)',
    },

    /* --- Breakpoints -----------------------------------------------------
       The only literals in this file. A media-query condition is evaluated
       before custom properties resolve, so `var(--mob-bp-md)` cannot work
       here. Mirror of the --mob-bp-* tokens; change both together.         */
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },

    extend: {
      /* Extended, not replaced, so max-w-full and max-w-none survive. */
      maxWidth: {
        app: 'var(--mob-container-app)',
        content: 'var(--mob-container-content)',
        prose: 'var(--mob-container-prose)',
      },
    },
  },

  /* ---------------------------------------------------------------------
     Type-role utilities.

     css/base.css already ships `.mob-label`, `.mob-title` and the rest. This
     plugin generates the same classes from the ROLES table above so a project
     that builds its CSS through Tailwind gets the role vocabulary — and
     IntelliSense for it — without leaving the config. Both definitions read
     the same custom properties and emit the same declarations, so loading
     base.css as well is idempotent rather than conflicting.

     Roles are what Tailwind cannot express: a role is a size, a line-height,
     a tracking, a family, a weight and a tone that must move together. Tone
     helpers (`.mob-tone-*`), `.mob-nums` and `.mob-truncate` are deliberately
     NOT generated here — Tailwind already has `text-*`, `tabular-nums` and
     `truncate`, and a second spelling of an existing utility is exactly the
     ambiguity this preset exists to prevent.
     ------------------------------------------------------------------- */
  plugins: [
    function mobTypeRoles({ addComponents }) {
      const components = {};
      for (const [name, r] of Object.entries(ROLES)) {
        const rule = {
          fontFamily: `var(--mob-font-${r.family})`,
          fontSize: r.fs[0],
          lineHeight: r.fs[1],
          letterSpacing: r.fs[2],
        };
        if (r.weight) rule.fontWeight = 'var(--mob-weight-semibold)';
        if (r.color) rule.color = `var(--mob-fg-${r.color})`;
        if (r.transform) rule.textTransform = r.transform;
        components[`.mob-${name}`] = rule;
      }
      addComponents(components);
    },
  ],
};
