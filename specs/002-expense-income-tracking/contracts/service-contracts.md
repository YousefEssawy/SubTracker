# Service Layer Contracts: Expense & Income Tracking System

**Branch**: `002-expense-income-tracking`  
**Date**: 2026-02-24

---

## Overview

This document defines the interface contracts for the service layer. Each service module provides async functions that the React context providers consume. All services follow the existing pattern established by `subscriptionService.js`.

---

## spaceService.js

```javascript
/**
 * Create a new space for the user.
 * @param {string} userId
 * @param {{ name: string, color: string, icon: string }} spaceData
 * @returns {Promise<{ id: string, name: string, color: string, icon: string, createdAt: string, updatedAt: string }>}
 * @throws {Error} if validation fails (empty name, invalid color/icon)
 */
export async function addSpace(userId, spaceData) {}

/**
 * Update an existing space's editable fields.
 * @param {string} userId
 * @param {string} spaceId
 * @param {{ name?: string, color?: string, icon?: string }} data
 * @returns {Promise<void>}
 * @throws {Error} if space not found
 */
export async function updateSpace(userId, spaceId, data) {}

/**
 * Delete a space if no transactions or recurrences reference it.
 * @param {string} userId
 * @param {string} spaceId
 * @returns {Promise<void>}
 * @throws {Error} if space has linked transactions or recurrences
 */
export async function deleteSpace(userId, spaceId) {}

/**
 * Subscribe to real-time updates of the user's spaces.
 * @param {string} userId
 * @param {(spaces: Array<Space>) => void} callback
 * @returns {() => void} unsubscribe function
 */
export function subscribeToSpaces(userId, callback) {}
```

---

## categoryService.js

```javascript
/**
 * Create a new category for the user.
 * @param {string} userId
 * @param {{ name: string, type: "Income" | "Expense" }} categoryData
 * @returns {Promise<{ id: string, name: string, type: string, createdAt: string, updatedAt: string }>}
 * @throws {Error} if validation fails (empty name, invalid type)
 */
export async function addCategory(userId, categoryData) {}

/**
 * Update an existing category's name. Type is immutable.
 * @param {string} userId
 * @param {string} categoryId
 * @param {{ name: string }} data
 * @returns {Promise<void>}
 */
export async function updateCategory(userId, categoryId, data) {}

/**
 * Delete a category if no transactions or recurrences reference it.
 * @param {string} userId
 * @param {string} categoryId
 * @returns {Promise<void>}
 * @throws {Error} if category has linked transactions or recurrences
 */
export async function deleteCategory(userId, categoryId) {}

/**
 * Subscribe to real-time updates of the user's categories.
 * @param {string} userId
 * @param {(categories: Array<Category>) => void} callback
 * @returns {() => void} unsubscribe function
 */
export function subscribeToCategories(userId, callback) {}
```

---

## transactionService.js

```javascript
/**
 * Create a new transaction.
 * @param {string} userId
 * @param {TransactionInput} transactionData
 * @returns {Promise<{ id: string, ...TransactionInput, createdAt: string, updatedAt: string }>}
 * @throws {Error} if validation fails (zero amount, type mismatch, invalid refs)
 *
 * TransactionInput: {
 *   spaceId: string,
 *   categoryId: string,
 *   type: "Income" | "Expense",
 *   amount: number,
 *   currency: string,
 *   transactionDate: string,
 *   notes?: string,
 *   tags?: string[],
 *   recurrenceId?: string
 * }
 */
export async function addTransaction(userId, transactionData) {}

/**
 * Update an existing transaction's editable fields.
 * @param {string} userId
 * @param {string} transactionId
 * @param {Partial<TransactionInput>} data
 * @returns {Promise<void>}
 * @throws {Error} if validation fails
 */
export async function updateTransaction(userId, transactionId, data) {}

/**
 * Get a single transaction by ID.
 * @param {string} userId
 * @param {string} transactionId
 * @returns {Promise<Transaction | null>}
 */
export async function getTransaction(userId, transactionId) {}

/**
 * Subscribe to real-time paginated transactions with filters.
 * @param {string} userId
 * @param {TransactionFilters} filters
 * @param {(transactions: Array<Transaction>) => void} callback
 * @returns {() => void} unsubscribe function
 *
 * TransactionFilters: {
 *   spaceId?: string,
 *   type?: "Income" | "Expense",
 *   currency?: string,
 *   tag?: string,
 *   dateRange?: { start: string, end: string },
 *   pageSize?: number,       // default: 10
 *   startAfterDoc?: DocumentSnapshot  // cursor for pagination
 * }
 */
export function subscribeToTransactions(userId, filters, callback) {}

/**
 * Subscribe to ALL transactions for balance computation (no pagination).
 * @param {string} userId
 * @param {BalanceFilters} filters
 * @param {(transactions: Array<Transaction>) => void} callback
 * @returns {() => void} unsubscribe function
 *
 * BalanceFilters: {
 *   spaceId?: string,
 *   currency?: string,
 *   dateRange?: { start: string, end: string }
 * }
 */
export function subscribeToAllTransactions(userId, filters, callback) {}

/**
 * Check if any transactions reference a given space or category.
 * @param {string} userId
 * @param {"spaceId" | "categoryId"} field
 * @param {string} value
 * @returns {Promise<boolean>}
 */
export async function hasLinkedTransactions(userId, field, value) {}
```

---

## recurrenceService.js (Phase 3)

```javascript
/**
 * Create a new recurrence.
 * @param {string} userId
 * @param {RecurrenceInput} recurrenceData
 * @returns {Promise<{ id: string, ...RecurrenceInput, isActive: boolean, nextExecutionDate: string }>}
 *
 * RecurrenceInput: {
 *   type: "Income" | "Expense",
 *   spaceId: string,
 *   categoryId: string,
 *   amount: number,
 *   currency: string,
 *   recurrencePattern: "Weekly" | "Monthly" | "Yearly" | "Custom",
 *   interval: number,
 *   startDate: string,
 *   endDate?: string
 * }
 */
export async function addRecurrence(userId, recurrenceData) {}

/**
 * Pause an active recurrence.
 * @param {string} userId
 * @param {string} recurrenceId
 * @returns {Promise<void>}
 */
export async function pauseRecurrence(userId, recurrenceId) {}

/**
 * Reactivate a paused recurrence. Recalculates nextExecutionDate.
 * @param {string} userId
 * @param {string} recurrenceId
 * @returns {Promise<void>}
 */
export async function reactivateRecurrence(userId, recurrenceId) {}

/**
 * Delete a recurrence. Previously generated transactions are NOT affected.
 * @param {string} userId
 * @param {string} recurrenceId
 * @returns {Promise<void>}
 */
export async function deleteRecurrence(userId, recurrenceId) {}

/**
 * Subscribe to real-time updates of the user's recurrences.
 * @param {string} userId
 * @param {(recurrences: Array<Recurrence>) => void} callback
 * @returns {() => void} unsubscribe function
 */
export function subscribeToRecurrences(userId, callback) {}

/**
 * Check if any recurrences reference a given space or category.
 * @param {string} userId
 * @param {"spaceId" | "categoryId"} field
 * @param {string} value
 * @returns {Promise<boolean>}
 */
export async function hasLinkedRecurrences(userId, field, value) {}

/**
 * Count retroactive transactions that would be generated for a start date.
 * Used to enforce the 12-transaction cap with user confirmation.
 * @param {string} startDate
 * @param {string} recurrencePattern
 * @param {number} interval
 * @returns {number} count of retroactive transactions
 */
export function countRetroactiveOccurrences(
  startDate,
  recurrencePattern,
  interval,
) {}
```

---

## storageService.js (Phase 2)

```javascript
/**
 * Upload a file attachment for a transaction.
 * @param {string} userId
 * @param {string} transactionId
 * @param {File} file - Browser File object
 * @returns {Promise<{ url: string, meta: { fileName: string, fileSize: number, contentType: string } }>}
 * @throws {Error} if file exceeds 5 MB or has invalid type
 */
export async function uploadAttachment(userId, transactionId, file) {}

/**
 * Delete a file attachment.
 * @param {string} userId
 * @param {string} transactionId
 * @returns {Promise<void>}
 */
export async function deleteAttachment(userId, transactionId) {}
```

---

## Context Provider Contracts

### SpaceContext

```javascript
// Value provided by <SpaceProvider>
{
  spaces: Space[],           // All user's spaces, real-time
  loading: boolean,          // True while initial load
  addSpace: (data) => Promise<void>,
  updateSpace: (id, data) => Promise<void>,
  deleteSpace: (id) => Promise<void>,  // throws if linked
  getSpaceById: (id) => Space | undefined,
}
```

### CategoryContext

```javascript
// Value provided by <CategoryProvider>
{
  categories: Category[],     // All user's categories, real-time
  loading: boolean,
  incomeCategories: Category[],   // Filtered by type
  expenseCategories: Category[],  // Filtered by type
  addCategory: (data) => Promise<void>,
  updateCategory: (id, data) => Promise<void>,
  deleteCategory: (id) => Promise<void>,  // throws if linked
  getCategoryById: (id) => Category | undefined,
}
```

### TransactionContext

```javascript
// Value provided by <TransactionProvider>
{
  transactions: Transaction[],    // Current page of transactions
  loading: boolean,
  filters: TransactionFilters,    // Current active filters
  setFilters: (filters) => void,
  balances: Map<string, { income: number, expense: number, balance: number }>,  // Keyed by currency
  pagination: {
    hasNext: boolean,
    hasPrev: boolean,
    goNext: () => void,
    goPrev: () => void,
    pageSize: number,
    setPageSize: (size) => void,
  },
  addTransaction: (data) => Promise<void>,
  updateTransaction: (id, data) => Promise<void>,
}
```
