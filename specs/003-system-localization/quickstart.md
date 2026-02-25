# Localization Quickstart Guide

## Setup

1. **Install Dependencies**:

   ```bash
   npm install i18next react-i18next i18next-browser-languagedetector
   ```

2. **Run Coverage Check**:
   Use a script or simple `grep` to find any hardcoded strings in `src/`.

## Translation Workflow

### Adding a new string

1. Add the key to `src/locales/en/translation.json`.
2. Add the Arabic translation to `src/locales/ar/translation.json`.
3. Use the `useTranslation` hook in your component:
   ```javascript
   const { t } = useTranslation();
   return <h1>{t("page.title")}</h1>;
   ```

## Testing Localization

### Visual Review

1. Switch language via the Header toggle.
2. Verify all labels and text on the page update instantly.
3. Check for text truncation or layout breaks in Arabic (RTL).

### Pluralization Test

Verify counts (0, 1, 2, 5, 11) to ensure the correct Arabic plural form is selected.
