---
name: subtracker-design
description: Use this skill to generate well-branded interfaces and assets for SubTracker, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out
and create static HTML files for the user to view. If working on production code, you
can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to
build or design, ask some questions, and act as an expert designer who outputs HTML
artifacts _or_ production code, depending on the need.

Key things to remember about SubTracker specifically:
- Identity is clear/calm/trustworthy financial control, not decorative — restrained use
  of the indigo→pink gradient, glass surfaces reserved for floating/overlay chrome only.
- Full bilingual (EN/AR) + RTL support and full dark mode are core requirements for any
  new screen, not optional extras.
- Never invent a logo — `assets/logo/` has the three real files (light-mode, dark-mode,
  icon-only). Never invent new icons — use the Icon component (Heroicons v2 via CDN) for
  UI chrome, and plain emoji only for user-chosen category/space glyphs.
- Read `readme.md` in full before starting — it documents content tone, exact visual
  motifs (radius/shadow/motion specifics), and which components are faithful ports vs.
  intentional additions.
