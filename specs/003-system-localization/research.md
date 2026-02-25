# Research: System Localization Revision

## Arabic Pluralization Patterns

- **Decision**: Use `i18next`'s built-in support for simplified Arabic pluralization keys (3 forms: zero/one, few, many).
- **Rationale**: While standard Arabic has 6 forms, professional web apps often simplify to 3 forms (`_zero`/`_one`, `_few`, `_many`) for maintainability. Version 4+ of `i18next` handles this natively.
- **Alternatives**: Full 6-form pluralization was considered but rejected as "over-engineered" for this project's scope.

## Terminology Normalization

- **Decision**: Standardize on **"Income"** (English) / **"دخل"** (Arabic) and **"Expense"** (English) / **"مصروف"** (Arabic).
- **Rationale**: Aligns with the project mission to track recurring costs and income. Rejects synonyms like "Spend", "Spendings", or "Money Out" to ensure a consistent, professional interface.

## Date and Currency Formatting

- **Decision**: Use `Intl.DateTimeFormat` and `Intl.NumberFormat` in utility functions, passing the current `i18n.language` to ensure culture-aware formatting.
- **Rationale**: Native browser APIs are more performant and lightweight than libraries like `moment.js` or `luxon`, and they handle complex locales like Arabic flawlessly.
- **Pattern**:
  - English: `Feb 25, 2026` / `$100.00`
  - Arabic: `٢٥ فبراير ٢٠٢٦` / `١٠٠٫٠٠ ج.م.`

## Missing Key Fallback

- **Decision**: Configure `i18next` with `fallbackLng: 'en'`.
- **Rationale**: Ensures that if a key is missing in `ar.json`, the user sees the English text instead of a technical key name like `auth.login_error`.
