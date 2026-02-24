import { CURRENCIES } from "./currencies";

/**
 * Validates and normalises a transaction amount.
 * Returns { valid: true, value } or { valid: false, error }.
 */
export const validateAmount = (amount) => {
  const num = parseFloat(amount);
  if (isNaN(num) || num <= 0) {
    return { valid: false, error: "Amount must be greater than 0." };
  }
  if (num > 999_999_999.99) {
    return { valid: false, error: "Amount cannot exceed 999,999,999.99." };
  }
  return { valid: true, value: Math.round(num * 100) / 100 };
};

/**
 * Checks that all required fields in the object are non-empty.
 * fields: { fieldName: value }
 * Returns { valid: true } or { valid: false, errors: { fieldName: errorMsg } }
 */
export const validateRequired = (fields) => {
  const errors = {};
  for (const [key, value] of Object.entries(fields)) {
    const isEmpty =
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === "");
    if (isEmpty) {
      errors[key] = `${key} is required.`;
    }
  }
  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }
  return { valid: true };
};

/**
 * Validates an ISO 4217 currency code against the supported list.
 * Returns { valid: true } or { valid: false, error }.
 */
export const validateCurrency = (code) => {
  if (!code) return { valid: false, error: "Currency is required." };
  const found = CURRENCIES.find((c) => c.code === code);
  if (!found) {
    return { valid: false, error: `"${code}" is not a supported currency.` };
  }
  return { valid: true };
};

/**
 * Validates a date string in YYYY-MM-DD format.
 * Returns { valid: true } or { valid: false, error }.
 */
export const validateDate = (dateString) => {
  if (!dateString) return { valid: false, error: "Date is required." };
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return { valid: false, error: "Date must be in YYYY-MM-DD format." };
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return { valid: false, error: "Date is not a valid calendar date." };
  }
  return { valid: true };
};

/**
 * Validates a tag array.
 * Returns { valid: true, value: sanitizedTags } or { valid: false, error }.
 */
export const validateTags = (tags = []) => {
  if (!Array.isArray(tags))
    return { valid: false, error: "Tags must be an array." };
  if (tags.length > 10)
    return { valid: false, error: "Maximum 10 tags allowed." };
  const sanitized = tags.map((t) => t.toLowerCase().trim());
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
