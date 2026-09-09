import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

// ESLint environment split by location:
// - Browser code (`src/`): SPA client application running in the browser with React plugins enabled.
// - Node code (`functions/`, `scripts/`, `tests/`, root config files): Cloud Functions, utility scripts,
//   emulator tests, and repository build/tooling configuration files running on Node.js without React plugins.
// - Test files (`**/*.test.*`, `**/__tests__/**`): Layers Vitest globals on top of the base environment
//   (Browser or Node) where each test file resides.

export default defineConfig([
  // subtracker-design-system is a generated design-system export (reference
  // sources + guideline pages), not app code — it is not built or linted.
  globalIgnores(["dist", "subtracker-design-system"]),

  // ---------------------------------------------------------------------------
  // 1. Browser code (src/)
  // ---------------------------------------------------------------------------
  {
    files: ["src/**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { varsIgnorePattern: "^[A-Z_]" },
      ],
      // Downgraded to warnings: the codebase has pre-existing `any` casts and
      // context files that intentionally export hooks alongside providers.
      // Tracked as follow-up cleanup rather than blocking CI on this pass.
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-refresh/only-export-components": "warn",
    },
  },

  // ---------------------------------------------------------------------------
  // 2. Node code (functions/, scripts/, tests/, and root configs)
  // ---------------------------------------------------------------------------
  {
    files: ["functions/**/*.js", "scripts/**/*.js", "tests/**/*.js", "*.js"],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
    },
  },
  {
    files: [
      "functions/**/*.{ts,tsx}",
      "scripts/**/*.{ts,tsx}",
      "tests/**/*.{ts,tsx}",
      "*.ts",
    ],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { varsIgnorePattern: "^[A-Z_]" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  // ---------------------------------------------------------------------------
  // 3. Test files (Vitest globals overlay)
  // ---------------------------------------------------------------------------
  {
    files: ["**/*.test.{js,jsx,ts,tsx}", "**/__tests__/**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.vitest,
      },
    },
  },
]);
