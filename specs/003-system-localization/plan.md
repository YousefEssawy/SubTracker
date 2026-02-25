# Implementation Plan: System Localization Revision

**Branch**: `003-system-localization` | **Date**: 2026-02-25 | **Spec**: [/specs/003-system-localization/spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-system-localization/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

This feature involves a comprehensive audit and revision of the Arabic and English localization for the SubTracker system. The goal is to ensure professional, naturally phrased Arabic text, consistent English terminology (using "Income" and "Expense"), and accurate dynamic formatting for dates and currencies. Implementation will leverage `react-i18next` with a focus on simplified Arabic pluralization (3 forms) and English fallback for missing keys.

**Language/Version**: JavaScript (React 19+, ESM)
**Primary Dependencies**: Vite, TailwindCSS v3, i18next v25+, react-i18next v16+, date-fns
**Storage**: LocalStorage (for locale persistence), Firebase (for user profile sync if applicable)
**Testing**: Manual visual review, `i18next-parser` for coverage checks
**Target Platform**: Web (Responsive)
**Project Type**: Web Application
**Performance Goals**: Instant language switching (<100ms)
**Constraints**: 100% string coverage in `ar.json` and `en.json`
**Scale/Scope**: ~15-20 screens, hundreds of translation keys

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

1. **Test-First (Localization Coverage)**: Automated scripts (e.g., `i18next-parser`) should be used to detect missing keys before manual review.
2. **Standard Terminology**: Core financial terms must strictly adhere to "Income" and "Expense" as per project guidelines.
3. **Professional Arabic**: All Arabic text MUST be reviewed by a native speaker for natural phrasing, avoiding literal translations.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── locales/
│   ├── ar/
│   │   └── translation.json  # Updated: Professional Arabic review
│   └── en/
│       └── translation.json  # Updated: Terminology consistency (Income/Expense)
├── components/               # Updated: Hardcoded strings removal
├── pages/                    # Updated: Dynamic date/currency formatting
└── i18n.js                  # Existing: i18next configuration
```

**Structure Decision**: Standard React/Vite structure with centralized `locales/` directory for i18next resources.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| N/A       |            |                                      |
