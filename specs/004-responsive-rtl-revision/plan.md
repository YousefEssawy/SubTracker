# Implementation Plan: Responsive and RTL Revision

**Branch**: `004-responsive-rtl-revision` | **Date**: 2026-02-25 | **Spec**: [/specs/004-responsive-rtl-revision/spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-responsive-rtl-revision/spec.md`

## Summary

This feature involves a structural revision of the SubTracker UI to support flawless RTL (Arabic) mirroring and a high-quality mobile-first experience. Key technical improvements include implementing a mobile drawer navigation, transforming transaction tables into card layouts on small screens, and enabling native RTL support for Recharts.

## Technical Context

**Language/Version**: JavaScript (React 19+, ESM)
**Primary Dependencies**: Vite, TailwindCSS v3, Framer Motion, Recharts, React-i18next
**Storage**: N/A (UI-only revision, state via existing Context/Firebase)
**Testing**: Manual visual testing (Chrome DevTools Mobile + RTL toggle); ERROR: No automated UI testing framework detected (e.g. Vitest/Cypress)
**Target Platform**: Web (Responsive, 320px to Desktop)
**Project Type**: Web Application
**Performance Goals**: 60fps animations, sub-100ms layout shifts on language change
**Constraints**: 0% horizontal overflow at 360px viewport; Full RTL mirroring support
**Scale/Scope**: Dashboard, Transactions Table, Navigation Sidebar, Forms

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

1. **Mobile-First**: Architecture must prioritize mobile layout before enriching for desktop.
2. **Logical Properties**: CSS/Tailwind must use logical properties (`ms-`, `me-`, `inline-`) to ensure RTL compatibility.
3. **No Hardcoded Pixels**: Use relative units (rem, em) or Tailwind spacing scales.

## Project Structure

### Documentation (this feature)

```text
specs/004-responsive-rtl-revision/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (UI state entities)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (Component Props)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── components/          # Updated: Sidebar, Drawer, DataTable, Charts
├── styles/              # Updated: globals.scss (RTL overrides)
└── i18n.js              # Existing: Direction handling logic
```

**Structure Decision**: Standard React/Vite structure already in place. Focus on enhancing existing components in `src/components/` and `src/pages/`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| N/A       |            |                                      |
