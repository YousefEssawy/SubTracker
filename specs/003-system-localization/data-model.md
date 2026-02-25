# UI Data Model: System Localization

## Locale Configuration

- **currentLanguage**: `'en' | 'ar'` (stored in `localStorage`).
- **direction**: `'ltr' | 'rtl'` (derived from `currentLanguage`).
- **fallbackLanguage**: `'en'`.

## Entities Mapping

- **TranslationKey**:
  - `id`: string (e.g., `sidebar.dashboard`).
  - `en`: string (English value).
  - `ar`: string (Arabic value).
- **Formatters**:
  - `date`: `(date: Date, locale: string) => string`.
  - `currency`: `(amount: number, currency: string, locale: string) => string`.

## Validation Rules

- All `translation.json` files must be valid UTF-8 JSON.
- Every key present in `en.json` SHOULD be present in `ar.json`.
- Values must not contain hardcoded HTML unless explicitly required by the UI component.
