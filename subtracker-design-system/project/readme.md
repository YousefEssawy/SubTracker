# SubTracker Design System

SubTracker is a personal subscription & expense tracker: a single web app (React + Vite,
Firebase backend) where users log subscriptions and everyday income/expenses, see a
dashboard of their burn rate and upcoming renewals, and manage that money across
"Spaces" (Personal, Household, Freelance…), Categories, and recurring transactions.
Identity: **clear, calm, trustworthy** — not a decorative consumer brand, meant to feel
like financial control (clarity + focus on the numbers), with a modern touch (glass
cards, soft shadows, gradient accents). Bilingual (Arabic/English) with full RTL support
and a complete dark mode are core product requirements, not add-ons.

There is currently **one product surface**: the SubTracker web app itself (marketing
landing page + authenticated app share one React codebase and one design language).

## Sources

- **GitHub repo:** [YousefEssawy/SubTracker](https://github.com/YousefEssawy/SubTracker) @ `development` —
  primary source of truth for this design system. Explore `src/pages/`, `src/components/`,
  and especially `design_system/` (the app's own token/preview docs) for anything not
  covered here.
- **Attached codebase:** a local mount of the same repository (`SubTracker/`), used
  side-by-side with GitHub during research.
- No Figma file was attached to this project.

If you have access to the repo, `design_system/README.md`, `design_system/tokens.css`,
and `design_system/motion-spec.md` are worth reading directly — this design system
ports their content into a compiler-friendly structure but the source docs have some
color (literally — the source README is written in Arabic) and detail that didn't
make it over verbatim.

## Index

- `styles.css` — root stylesheet, `@import`s everything below. Link only this file.
- `tokens/` — colors, typography, spacing, radius, shadow, motion, fonts, shared component classes (`.glass-card`, `.btn-primary`, …).
- `guidelines/` — foundation specimen cards (also visible in the Design System tab).
- `assets/logo/` — the three real SubTracker logo files (light-mode, dark-mode, icon-only).
- `components/core/` — Button, Input, Select, Badge, Card, Icon (**intentional additions**, see below).
- `components/ui/` — RenewalDial, ConfirmDialog, Pagination (ported 1:1 from the source).
- `components/finance/` — BalanceCard, TransactionListItem, TagInput, FileUpload, FilterBar, SpaceForm, CategoryForm, RecurrenceForm.
- `components/layout/` — Sidebar, Header, BottomTabBar, AuthShell, Layout.
- `ui_kits/subtracker-app/` — click-through recreation of the real app (login → dashboard → subscriptions → transactions → settings).
- `SKILL.md` — portable skill file for using this design system in Claude Code.

## Components

Every component below is a plain `.jsx` + `.d.ts` pair under `components/<group>/`, with
a `.prompt.md` usage note and a `@dsCard`-tagged HTML demo in the same directory.

**Core** (`components/core/`) — `Button`, `Input`, `Select`, `Badge`, `Card`, `Icon`.
**Finance UI** (`components/ui/`) — `RenewalDial`, `ConfirmDialog`, `Pagination`.
**Finance** (`components/finance/`) — `BalanceCard`, `TransactionListItem`, `TagInput`, `FileUpload`, `FilterBar`, `SpaceForm`, `CategoryForm`, `RecurrenceForm`.
**Layout** (`components/layout/`) — `Sidebar`, `Header`, `BottomTabBar`, `AuthShell`, `Layout`.

### Intentional additions

The source codebase has **no dedicated Button/Input/Select/Badge/Card React
components** — it applies shared CSS classes (`.btn-primary`, `.input-field`,
`.glass-card`, etc, defined once in `src/styles/globals.scss`) directly to native
`<button>`/`<input>`/`<div>` elements everywhere. Rather than force every consumer to
remember and hand-apply those class names, `components/core/` wraps each one as a thin
React component using the exact same classes/tokens. Everything in `components/ui/`,
`components/finance/`, and `components/layout/` is a faithful port of a real
`.tsx` file from `src/components/` — nothing there was invented.

`Icon` is also an intentional addition: the app consumes icons via the `react-icons/hi2`
npm package (Heroicons v2 outline), which has no bundled local SVG/font asset to copy.
`Icon` links the same glyph set live from a CDN — see **Iconography** below.

## Content Fundamentals

**Voice:** direct, second-person, reassuring — never cutesy. Landing copy leads with the
problem ("Stop Losing Money to Forgotten Subs") and resolves it with agency ("Take back
control of your financial life"). In-app copy is plain and functional: field labels are
nouns ("Subscription Name", "Renewal Date"), not conversational prompts.

**Casing:** Title Case for headings and nav labels ("Upcoming Renewals", "How to Use"),
sentence case for body copy, descriptions and helper text. Section eyebrow tags are
UPPERCASE with wide letter-spacing ("ABOUT SUBTRACKER", "SIMPLE AS 1-2-3").

**Pronouns:** "you/your" throughout — the product speaks directly to the user's money
("your true monthly burn rate", "your financial life"). The developer is credited by
name in the footer ("Built by Yousef Essawy"), a small personal-project touch that's
part of the brand's honesty.

**Numbers as first-class content.** Money is never decorative — amounts always use
`.figure` (tabular-nums, monospace) so digits align in lists and don't jiggle on
count-up. Stats lead with the number, then the context: "$248 / avg monthly spend",
not "You spend an average of $248 a month."

**Emoji:** used functionally, not decoratively — as literal category/space icons
(🎬 Streaming, 🤖 AI Subscription, 🏠 Household) chosen by the user from a fixed picker,
and occasionally as one-off flourishes in copy ("No upcoming renewals 🎉"). Never used
as bullet markers, emphasis, or UI chrome.

**Bilingual by design, not by translation-bolt-on.** Every user-facing string in the
app runs through i18next with parallel `en`/`ar` keys (see `src/locales/`). Arabic
copy is native, warmer/more colloquial in tone where natural (design_system/README.md
itself is written in Egyptian-inflected Arabic for the dev team) — not a literal
translation of the English.

**Example copy pairs (EN → tone equivalent, not literal translation):**
- "Stop Losing Money to Forgotten Subs" — punchy, loss-aversion framing for the hero.
- "Calm, clear control over every dollar that leaves your account." — the brand's
  thesis statement, used verbatim on the login screen.
- "No credit card required." — plain, trust-building, no exclamation point.
- Error/empty states are matter-of-fact: "No subscriptions yet", "This action cannot be
  undone." — never apologetic ("Oops!") or jokey.

## Visual Foundations

**Colors.** Indigo `#6366F1` (primary) and Pink `#EC4899` (accent) form the identity
gradient (`135deg, primary → accent`), used sparingly for CTAs, the logo mark, and
`.gradient-text` headline accents — never as a full-page wash. Semantic colors are a
strict traffic-light system: success green `#10B981` (income, active), warning amber
`#F59E0B` (renewing soon), danger red `#EF4444` (expense, overdue, destructive). Neutrals
are a slate scale (`--ink-900`…`--ink-000`) — no pure black, no warm grays.

**Type.** Inter for English/numbers, Cairo for Arabic (auto-switches on `html[lang="ar"]`),
Space Grotesk for display/headline moments, IBM Plex Mono (via `.figure`) for every
money amount. Arabic body copy always uses relaxed line-height (1.65) vs English's 1.5 —
Arabic script needs the extra breathing room.

**Backgrounds.** Flat, calm surfaces — no photography, no illustrations, no repeating
textures or patterns. The one recurring background touch is a very soft dual radial
gradient wash (indigo top-left, pink top-right, ~6-8% opacity) behind the whole app,
plus the identity gradient used full-strength only inside CTA panels and the auth brand
panel. This restraint is deliberate: the brand is about clarity on your numbers, not
visual noise competing for attention.

**Glassmorphism, used precisely.** `.glass-card` (translucent fill + `blur(16px)` +
soft border) appears specifically on floating/overlaid surfaces — the mobile bottom tab
bar, the mobile filter sheet, the mobile nav drawer — anything that hovers over content
rather than sitting inline in the page flow. Regular in-flow cards (dashboard stat
cards, list containers) use a **solid** surface with a plain `.shadow-card`, not blur —
don't apply glass/blur to ordinary page content, it's reserved for overlay chrome.

**Animation.** Three durations only — 140ms (micro: hover/toggle/tap), 220ms (default:
most enter/exit), 380ms (modals/sheets/page transitions) — and two eases: a **gentle
bounce** (`cubic-bezier(0.34,1.56,0.64,1)`) for movement that should feel alive (sheets
sliding in, the sidebar collapsing, tab-bar pill sliding between tabs), and a **plain
deceleration** (`cubic-bezier(0.16,1,0.3,1)`) for simple appear/dismiss where bounce
would feel frivolous (desktop modals, page fades, theme switching). Lists stagger in at
30ms/row (capped at 10 rows). Dashboard numbers count up from 0 on mount/change — the
currency symbol and unit suffix never animate, only the digits. `prefers-reduced-motion`
always keeps opacity fades but drops every transform/count-up.

**Hover states:** color shift, not scale — links/nav items go to a tinted background
(`primary/10`) plus stronger text color; primary buttons get `brightness(1.05)`.
**Press states:** `scale(0.98)` on buttons, `scale(0.9→1)` on tab-bar icon taps — a
quick, subtle shrink, never a color flash.

**Borders & shadows.** Cards use a hairline border (`--ink-200` light / `--ink-800`
dark) *plus* a soft two-layer shadow in light mode; **dark mode drops the shadow
entirely** and relies on the border alone for separation (shadows read as muddy on dark
surfaces). No colored left-border accent cards anywhere — a motif this brand
deliberately avoids.

**Corner radii** are a strict 5-step scale: 8px (chips/small buttons) · 12px (inputs,
list rows) · 16px (cards) · 24px (modals, hero/auth panels) · pill (buttons, badges,
the nav rail's active-item background). Never an arbitrary radius outside this scale.

**Transparency/blur** is reserved for: floating overlay chrome (glass-card contexts
above), modal backdrops (`black/50` + slight blur), and the sticky header/nav
(`bg-white/80` + blur) — i.e. anything stacked in front of scrolling content that needs
to stay legible without fully blocking what's beneath it.

**Layout rules.** Fixed 64px header, fixed-width sidebar (260px expanded / 72px
collapsed) that only the icons persist through during the collapse transition. Mobile
(<768px) stacks: forms and tables go single-column/`flex-col`, sidebar becomes a
slide-out drawer, and desktop's persistent sidebar is replaced by a floating bottom
tab bar. RTL is a first-class layout mode, not a mirrored afterthought — logical
properties (`ms-`/`me-`/`ps-`/`pe-`/`start-`/`end-`) throughout, directional icons
(arrows) flip via `rtl:-scale-x-100`.

## Iconography

The app uses **Heroicons v2 (outline style, 24px, 1.8 stroke)** exclusively, consumed
via the `react-icons/hi2` npm package — there is no local icon font, sprite sheet, or
bundled SVG folder in the source repo to copy (react-icons resolves glyphs from its own
package at build time, not from repo assets). Per the CDN-substitution guidance, this
design system's `Icon` component (`components/core/Icon.jsx`) links the equivalent
glyphs live from jsDelivr's mirror of the heroicons npm package
(`cdn.jsdelivr.net/npm/heroicons@2.1.5/24/outline/<name>.svg`) — same stroke weight and
style as the source, just fetched from a CDN instead of a bundled dependency.

Category and Space icons are a different, deliberate exception: those are **plain
emoji** (🎬 🤖 ☁️ 🏠 💼 …), chosen by users from a fixed picker grid
(`src/utils/categories.ts`, `src/utils/spaceDefaults.ts`) — a lightweight way to let
users personalize without a full custom-icon-upload feature. Never mix the two systems:
navigation/action iconography is always Heroicons, category/space badges are always
emoji.

## Fonts

Inter, Cairo, Space Grotesk, and IBM Plex Mono are loaded exactly as the source app
loads them: a single Google Fonts `@import` (see `tokens/fonts.css`), not self-hosted
binaries. All four are genuine existing families — **no substitution was needed**. If
you'd rather self-host for production, download the four families from
fonts.google.com and swap the `@import` for local `@font-face` rules.

## Dark Mode

Every semantic token in `tokens/colors.css` has a light (default, under `:root`) and
dark (under `html.dark`) value — surfaces, borders, and text colors all repaint;
`.dark` is a plain class toggle on `<html>`, matching the source app's Tailwind
`darkMode:"class"` convention (no `prefers-color-scheme` auto-detection is used by the
product; it's an explicit user toggle in the header/settings).

## Caveats

- No Figma file was attached — all values are lifted directly from the app's own
  `design_system/tokens.css`, `tailwind.config.js`, and component source, which is the
  ground truth for a live product.
- Components are simplified ports (no framer-motion, react-i18next, or Firebase
  dependencies) — visual fidelity is preserved, but production wiring (real animation
  library, real translations, real auth/data) is intentionally left out, per component
  guidance to keep design-system components self-contained (React only).
- The UI kit demonstrates English/LTR only; the tokens and component styles fully
  support Arabic/RTL (see Visual Foundations) but the click-through demo itself doesn't
  swap copy/direction live.

**This is a first pass — please iterate with me.** Flag anything that doesn't match
the live app, ask for more UI kit screens (Categories, Spaces, Recurrences,
Transaction/Subscription forms, History, About/How-To, the full Landing Page), or tell
me if you'd like real font binaries self-hosted instead of the CDN import.
