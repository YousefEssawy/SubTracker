import type { CurrencyCode, ISOString, DateString } from "./common";

/** Whether a transaction is income or an expense */
export type TransactionType = "Income" | "Expense";

/** Typed metadata for a file attachment on a Transaction */
export interface AttachmentMeta {
  /** Original filename as uploaded by the user */
  name: string;
  /** File size in bytes */
  size: number;
  /** MIME type, e.g. "image/jpeg" or "application/pdf" */
  type: string;
  /** Firebase Storage path — present after successful upload */
  storagePath?: string;
}

/** A single financial transaction (income or expense) */
export interface Transaction {
  id: string;
  spaceId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  currency: CurrencyCode;
  /** Transaction date in YYYY-MM-DD format */
  transactionDate: DateString;
  notes: string | null;
  tags: string[];
  attachmentUrl: string | null;
  attachmentMeta: AttachmentMeta | null;
  recurrenceId: string | null;
  createdAt: ISOString;
  updatedAt: ISOString;
}

/**
 * Payload for creating a new transaction.
 * Server-generated fields are excluded.
 */
export type TransactionInput = Omit<
  Transaction,
  "id" | "createdAt" | "updatedAt"
>;

/**
 * Payload for updating an existing transaction.
 * All fields are optional.
 */
export type TransactionUpdate = Partial<TransactionInput>;
