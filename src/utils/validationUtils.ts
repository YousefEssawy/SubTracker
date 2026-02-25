import { CURRENCIES } from "./currencies";
import type { CurrencyCode } from "@/models/common";

// ── Discriminated union result types ──────────────────────────────────────

export type ValidResult<T> = { valid: true; value: T };
export type InvalidResult = { valid: false; error: string };
export type ValidationResult<T> = ValidResult<T> | InvalidResult;

// ── Amount ────────────────────────────────────────────────────────────────

/**
 * Validates and normalises a transaction amount.
 * The caller MUST check `result.valid` before accessing `result.value`.
 */
export const validateAmount = (amount: unknown): ValidationResult<number> => {
  const num = parseFloat(String(amount));
  if (isNaN(num) || num <= 0) {
    return { valid: false, error: "Amount must be greater than 0." };
  }
  if (num > 999_999_999.99) {
    return { valid: false, error: "Amount cannot exceed 999,999,999.99." };
  }
  return { valid: true, value: Math.round(num * 100) / 100 };
};

// ── Required fields ───────────────────────────────────────────────────────

export type RequiredErrors = Record<string, string>;

export type RequiredResult =
  | { valid: true }
  | { valid: false; errors: RequiredErrors };

/**
 * Checks that all fields in the record are non-empty.
 */
export const validateRequired = (
  fields: Record<string, unknown>,
): RequiredResult => {
  const errors: RequiredErrors = {};
  for (const [key, value] of Object.entries(fields)) {
    const isEmpty =
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === "");
    if (isEmpty) {
      errors[key] = `${key} is required.`;
    }
  }
  return Object.keys(errors).length > 0
    ? { valid: false, errors }
    : { valid: true };
};

// ── Currency ──────────────────────────────────────────────────────────────

/**
 * Validates an ISO 4217 currency code against the supported list.
 */
export const validateCurrency = (
  code: unknown,
): ValidationResult<CurrencyCode> => {
  if (!code) return { valid: false, error: "Currency is required." };
  const found = CURRENCIES.find((c) => c.code === code);
  if (!found) {
    return {
      valid: false,
      error: `"${String(code)}" is not a supported currency.`,
    };
  }
  return { valid: true, value: found.code };
};

// ── Date ──────────────────────────────────────────────────────────────────

/**
 * Validates a date string in YYYY-MM-DD format.
 */
export const validateDate = (dateString: unknown): ValidationResult<string> => {
  if (!dateString) return { valid: false, error: "Date is required." };
  if (typeof dateString !== "string")
    return { valid: false, error: "Date must be a string." };
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return { valid: false, error: "Date must be in YYYY-MM-DD format." };
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return { valid: false, error: "Date is not a valid calendar date." };
  }
  return { valid: true, value: dateString };
};

// ── Tags ──────────────────────────────────────────────────────────────────

/**
 * Validates and sanitises a tag array.
 */
export const validateTags = (
  tags: unknown = [],
): ValidationResult<string[]> => {
  if (!Array.isArray(tags))
    return { valid: false, error: "Tags must be an array." };
  if (tags.length > 10)
    return { valid: false, error: "Maximum 10 tags allowed." };
  const sanitized = tags.map((t: unknown) => String(t).toLowerCase().trim());
  for (const tag of sanitized) {
    if (tag.length > 30) {
      return { valid: false, error: `Tag "${tag}" exceeds 30 characters.` };
    }
    if (tag.length === 0) {
      return { valid: false, error: "Tags cannot be empty strings." };
    }
  }
  return { valid: true, value: sanitized };
};
