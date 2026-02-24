# Implementation Plan: Mobile Design Refactor

**Branch**: `1-mobile-design-refactor` | **Date**: 2026-02-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/1-mobile-design-refactor/spec.md`

## Summary

The objective is to revamp the mobile responsiveness and overall application layout. We will transition from a bottom navigation bar to a responsive side menu (docked on desktop, slide-out on mobile) using Tailwind CSS. We will also implement a public landing page at the root route (`/`) that directs unauthenticated users to a new promotional page, while preserving the Dashboard as the default view for authenticated users.

## Technical Context

**Language/Version**: JavaScript (ES6+), React 19  
**Primary Dependencies**: React Router v7, Tailwind CSS v3.4.19, Framer Motion v12  
**Storage**: N/A (UI Refactor only)  
**Testing**: Manual Visual Testing  
**Target Platform**: Web browsers (Mobile-first, fully responsive > 320px)  
**Project Type**: React Web Application (Vite)  
**Performance Goals**: 60fps animations for the side menu, smooth responsive scaling.  
**Constraints**: Tailwind utility classes must be used strictly without custom CSS.  
**Scale/Scope**: Refactoring the main `Layout.jsx` wrapper and creating a new `PublicLandingPage.jsx`.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

No complex backend logic, scaling out, or new frameworks are being added. All changes conform to the existing project patterns (React, Tailwind, Framer Motion).

## Project Structure

### Documentation (this feature)

```text
specs/1-mobile-design-refactor/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── quickstart.md        # Phase 1 output
```

### Source Code (repository root)

```text
src/
├── components/
│   └── layout/
│       ├── Layout.jsx          # Will be refactored to remove bottom nav and add sidebar
│       └── Sidebar.jsx         # New component for side menu
├── pages/
│   └── LandingPage.jsx         # New public landing page
└── App.jsx                     # Route logic updates
```

**Structure Decision**: A single-project React application directory (`src/`). The existing components and pages directories will simply be augmented and refactored.

## Complexity Tracking

No violations found that require specific complexity tracking.
