---
name: aimed
description: Local AI medical exam review — calm, precise, clinically grounded.
colors:
  surface-base: "oklch(1 0 0)"
  surface-sidebar: "oklch(0.985 0 0)"
  surface-muted: "oklch(0.97 0 0)"
  foreground-strong: "oklch(0.145 0 0)"
  foreground-primary: "oklch(0.205 0 0)"
  foreground-muted: "oklch(0.556 0 0)"
  border-default: "oklch(0.922 0 0)"
  interactive-accent: "oklch(0.48 0.10 264)"
  destructive: "oklch(0.577 0.245 27.325)"
  surface-base-dark: "oklch(0.145 0 0)"
  surface-card-dark: "oklch(0.205 0 0)"
  surface-muted-dark: "oklch(0.269 0 0)"
  foreground-strong-dark: "oklch(0.985 0 0)"
  foreground-muted-dark: "oklch(0.708 0 0)"
  interactive-accent-dark: "oklch(0.488 0.243 264.376)"
typography:
  title:
    fontFamily: "'Geist Variable', sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "'Geist Variable', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "normal"
  label:
    fontFamily: "'Geist Variable', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0.05em"
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.625rem"
  xl: "0.875rem"
  2xl: "1.125rem"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.foreground-primary}"
    textColor: "{colors.surface-base}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
  button-primary-hover:
    backgroundColor: "{colors.foreground-strong}"
    textColor: "{colors.surface-base}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground-primary}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
  button-ghost-hover:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.foreground-primary}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.foreground-primary}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
  input-default:
    backgroundColor: "{colors.surface-base}"
    textColor: "{colors.foreground-strong}"
    rounded: "{rounded.md}"
    padding: "0.375rem 0.75rem"
  nav-item-default:
    backgroundColor: "transparent"
    textColor: "{colors.foreground-primary}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.75rem"
  nav-item-active:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.foreground-strong}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.75rem"
  message-bubble-user:
    backgroundColor: "{colors.foreground-primary}"
    textColor: "{colors.surface-base}"
    rounded: "{rounded.2xl}"
  message-bubble-ai:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.foreground-strong}"
    rounded: "{rounded.2xl}"
---

# Design System: aimed

## 1. Overview

**Creative North Star: "The Clinical Notebook"**

aimed's design system draws from the discipline of a medical student's annotated notebook: organized, hierarchical, and immediately legible. Every surface earns its presence through function. Color is reserved the way a red pen is in margin notes — rare, meaningful, never decorative. Type scale and spatial rhythm do the work that color might do in lesser systems. The interface should vanish into the task; a student finishing a session should feel sharper, not impressed by the tool.

The dominant material is pure neutral — deep charcoal on clean white in light mode, a near-black surface stack in dark mode. A single cool accent (slate-blue, hue 264) marks interactive state. It appears in under 10% of any surface. Its scarcity makes it trustworthy. When it appears, it means something.

This system explicitly rejects generic medical-app sterility (WebMD's white-and-teal, Medscape's consumer-health aesthetic), SaaS dashboard clichés (hero metrics, gradient text, identical icon-grid cards), gamification (streaks, badges, bright primaries, playful illustrations), and startup landing-page energy. aimed is a study tool. It does not sell itself.

**Key Characteristics:**
- Flat-by-default: tonal layering creates depth, not shadows
- Single-family typography: Geist Variable throughout, hierarchy through scale and weight alone
- Restrained accent: one cool slate-blue (hue 264), ≤10% of any surface
- Information density: moderate — readable at speed, scannable under exam pressure
- Dark mode is a first-class mode, not an afterthought

## 2. Colors: The Notebook Palette

A near-chromatic-free system anchored by a neutral gray ramp, punctuated by one restrained cool accent. The palette reads like ink on paper: the text is the signal, the surface is the ground.

### Primary
- **Dense Graphite** (`oklch(0.205 0 0)`, approx `#282828`): The primary UI element color — button backgrounds, AI avatar badge, active markers in light mode. Dark enough to anchor interactive elements without competing with content.
- **Scholar Blue** (`oklch(0.48 0.10 264)`, approx `#5b6abf`): The sole chromatic accent. Used on interactive focus states and active affordances where a signal is required. In dark mode it appears as the sidebar's primary marker (`oklch(0.488 0.243 264.376)`). Never used decoratively.

### Neutral
- **Clean Canvas** (`oklch(1 0 0)`, `#ffffff`): The main working surface — chat area, forms, the primary content region.
- **Quiet Linen** (`oklch(0.985 0 0)`, approx `#fafafa`): The sidebar background in light mode. Barely distinct from Canvas; the `1px` border carries the separation.
- **Soft Ash** (`oklch(0.97 0 0)`, approx `#f5f5f5`): Secondary containers, hover backgrounds, AI message bubbles. The default resting state for non-interactive surfaces.
- **Deep Charcoal** (`oklch(0.145 0 0)`, approx `#1a1a1a`): Primary text. Headings, body copy, high-emphasis labels.
- **Pale Ink** (`oklch(0.556 0 0)`, approx `#808080`): Secondary text. Captions, timestamps, placeholder text, section category labels. Legible but clearly secondary.
- **Light Chalk** (`oklch(0.922 0 0)`, approx `#e8e8e8`): Borders and dividers. Hairline separations between regions. Never thicker than `1px` in content areas.

### Semantic
- **Clinical Red** (`oklch(0.577 0.245 27.325)`, approx `#c93a1e`): Destructive actions, error states, delete affordance. Never repurposed for emphasis or decoration. Brightens to `oklch(0.704 0.191 22.216)` in dark mode for contrast.

### Named Rules
**The Scarcity Rule.** Scholar Blue appears on ≤10% of any visible surface. It marks interactive affordance. The moment it appears on a heading, a decorative divider, or a background fill, it loses its signal value. Prohibited in those contexts.

**The No-Chroma Expansion Rule.** The neutral ramp does not gain hue over time. No "warm off-white" backgrounds, no "cool blue-gray" muted surfaces. The system is neutral. If the design feels cold, the fix is structure and spacing, not hue.

## 3. Typography

**Primary Font:** Geist Variable (with `sans-serif` fallback)

Geist Variable is the sole typeface throughout. No display/body split, no serif. Weight and size variation within a single family carry all hierarchy. This matches the notebook metaphor: one pen, different pressures.

**Character:** Clean and technical with humanist warmth. Slightly compressed at smaller sizes, open at display scale. Reads with authority on dense medical content without feeling clinical or sterile.

### Hierarchy
- **Title** (semibold 600, 1.125rem, line-height 1.4): Page headings, top-level section names. One per page region.
- **Body** (regular 400, 0.875rem, line-height 1.625): Chat messages, flashcard content, case narration. The dominant text size. Max line length: 65–75ch to prevent fatigue.
- **Label** (medium 500, 0.75rem, letter-spacing 0.05em, uppercase): Sidebar category headings, column headers ("SESSIONS", "STUDY"). Used sparingly; uppercase only in these navigation contexts.
- **Caption** (regular 400, 0.75rem): Timestamps, model status, secondary metadata. Always in Pale Ink.
- **UI text** (medium 500, 0.875rem): Button labels, nav item labels, dialog titles. Same size as body; weight carries the distinction.

### Named Rules
**The Single Voice Rule.** Geist Variable is the only typeface in the system. No serif display, no monospace body. If hierarchy feels insufficient, the fix is weight and size contrast — not a second family.

## 4. Elevation

aimed is flat by default. No shadows at rest. Depth is expressed through tonal layering: Clean Canvas sits above Soft Ash, which sits above Quiet Linen in light mode. Borders — always `1px oklch(0.922 0 0)` — handle vertical separation between regions.

The only shadow in the system appears on modal dialogs (Dialog component), provided by shadcn's default. It should not be replicated on any custom surface.

**The Flat-By-Default Rule.** No `box-shadow` on cards, list items, nav items, or input fields at rest. A shadow on a nav item or card is never intentional. Rewrite with a background-tint or nothing.

### Shadow Vocabulary
- **Modal lift** (`0 8px 32px oklch(0 0 0 / 0.12)`): Reserved for Dialog components only. Applied by shadcn; do not add manually to other surfaces.

## 5. Components

### Buttons

Restrained and functional. No uppercase, no wide letter-spacing, no oversized padding. Buttons look like they belong to a tool, not a marketing site.

- **Shape:** Gently curved (0.5rem radius, `rounded-md`)
- **Primary:** Dense Graphite background (`oklch(0.205 0 0)`), Clean Canvas text. Padding `0.5rem 1rem`. Height `2.25rem`.
- **Hover/Focus:** Darkens to Deep Charcoal (`oklch(0.145 0 0)`). Focus ring: 2px `oklch(0.708 0 0)`, 2px offset.
- **Ghost:** Transparent background, Dense Graphite text. On hover: Soft Ash fill.
- **Outline:** Transparent background, `1px border oklch(0.922 0 0)`. On hover: Soft Ash fill.
- **Icon-only:** Square `2.25rem × 2.25rem`, same radius. Used for send, stop, new-chat, delete actions.
- **Disabled:** `opacity: 0.5`, `cursor: not-allowed`. No color change.

### Inputs and Textareas

Stroked, not filled. The border signals the field boundary; the background is the page surface.

- **Style:** `1px border oklch(0.922 0 0)`, Clean Canvas background, 0.5rem radius. Geist 0.875rem regular.
- **Focus:** Border becomes `oklch(0.708 0 0)`, ring `oklch(0.708 0 0 / 0.25)` at 3px spread. No fill change.
- **Placeholder:** Pale Ink (`oklch(0.556 0 0)`).
- **Textarea:** Same as input but `resize: none`. Min-height 3.25rem, max-height 12rem.

### Cards and Containers

- **Corner Style:** Gently curved (0.625rem radius, `rounded-lg`)
- **Background:** Clean Canvas in light mode; Surface Card Dark (`oklch(0.205 0 0)`) in dark mode.
- **Shadow Strategy:** None. Separation comes from `1px border-default`.
- **Border:** Always present on light backgrounds. Never omitted.
- **Internal Padding:** `1.5rem` for content cards; `1rem` for compact cards.

### Navigation (Sidebar)

The sidebar is the primary navigation surface. Width: 14rem, persistent, never collapsed on desktop.

- **Container:** Quiet Linen background (`oklch(0.985 0 0)`) in light mode, separated from content by a `1px` right border.
- **Nav Items:** Rounded-md, `px-3 py-2`, Geist 0.875rem medium. Default: transparent, Dense Graphite. Hover: Soft Ash `oklch(0.97 0 0 / 0.6)`. Active: Soft Ash fill, Deep Charcoal text, font-medium.
- **Section Labels:** 0.75rem, uppercase, letter-spacing 0.05em, Pale Ink. Non-interactive; divide the nav into study and settings groups.
- **Brand mark:** BrainCircuit icon in Dense Graphite on Soft Ash fill, `2rem × 2rem`, rounded-lg. "aimed" in font-semibold below, "MedGemma review" in caption.

### Message Bubbles (Signature Component)

The primary interactive surface — Chat is the default landing page and most-used mode.

- **AI bubble:** Soft Ash background, Deep Charcoal text. `border-radius: 1.125rem 1.125rem 1.125rem 0.375rem` (top-left clipped). Max-width 80%.
- **User bubble:** Dense Graphite background, Clean Canvas text. `border-radius: 1.125rem 0.375rem 1.125rem 1.125rem` (top-right clipped). Max-width 80%.
- **The clipped corner** marks origin — AI clips top-left, user clips top-right. This asymmetry is intentional and specific to this component. Do not apply it elsewhere.
- **Streaming state:** Shows a pulsing "Thinking…" label in Pale Ink, 0.75rem italic, while generating. Same bubble shape as a normal AI bubble.
- **AI avatar:** `1.75rem` circle, Dense Graphite background, Clean Canvas "M". Appears on every AI message; no avatar for user messages.

### Badges and Chips

- **Style:** Rounded-full, `1px border border-default`, transparent background, Dense Graphite text, 0.75rem medium. Used for flashcard category labels and specialty tags.
- **No filled or colored variants.** Badge color is not used to encode semantic state. Categories use text labels, not color-coded chips.

## 6. Do's and Don'ts

### Do:
- **Do** use `oklch()` for all color values added to the system. The palette is OKLCH-native; hex values in this document are approximations for external tooling only.
- **Do** reach for structure — labels, spacing, dividers, weight contrast — before reaching for color. The neutral system is complete without the accent.
- **Do** use Scholar Blue (`oklch(0.48 0.10 264)`) only on interactive affordances: focus rings, active states, primary interactive signals. Hard ceiling at ≤10% of any surface.
- **Do** clip the origin corner on message bubbles (`rounded-tr-sm` for user, `rounded-tl-sm` for AI). This asymmetry is specific and intentional to that component.
- **Do** keep body text between 65–75ch line length. Dense medical content read wider than that causes fatigue under exam pressure.
- **Do** use the uppercase label style (0.75rem, letter-spacing 0.05em) only for non-interactive section category labels. Never on button text, never on headings.
- **Do** use Pale Ink (`oklch(0.556 0 0)`) for placeholder text, timestamps, captions, and status lines — anything clearly secondary to the content.
- **Do** respect `prefers-reduced-motion`. Any animation must have an immediate-state-change equivalent.

### Don't:
- **Don't** use `border-left` greater than `1px` as a colored accent stripe on cards, list items, or callouts. Prohibited. Use full borders, background tints, or nothing.
- **Don't** use gradient text (`background-clip: text` + gradient `background`). Use a solid color; emphasis via weight or size.
- **Don't** build to look like a generic medical app — white backgrounds with teal/cyan accents (hue 175–200). The accent is hue 264 (slate-blue). Any hue in the 175–200 range is prohibited as an accent color.
- **Don't** apply SaaS dashboard patterns: hero metrics (big number, small label, gradient accent), identical icon-grid cards, or animated stat counters. Explicitly rejected.
- **Don't** add gamification elements: streaks, badges, XP counters, star ratings, confetti. aimed is not a game.
- **Don't** use startup landing-page patterns inside the app: testimonials, pricing sections, hero sections, "AI-powered" marketing labels on every surface.
- **Don't** use glassmorphism (backdrop-blur + semi-transparent fills) as decoration. Flat is the default; blurs are not architectural.
- **Don't** use more than one typeface. Geist Variable is the system font. No serif display, no monospace body text.
- **Don't** nest cards inside cards. If content needs further grouping, use a section divider or spacing rhythm instead.
