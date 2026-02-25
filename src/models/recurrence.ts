import type { CurrencyCode, ISOString, DateString } from "./common";
import type { TransactionType } from "./transaction";

/** Whether the recurrence rule is active or paused */
export type RecurrenceStatus = "active" | "paused";

/**
 * The base frequency unit for a recurrence rule.
 * Combined with `interval` for "every N units" patterns.
 */
export type RecurrencePattern = "daily" | "weekly" | "monthly" | "yearly";

/** A rule for automatically generating periodic transactions */
export interface Recurrence {
  id: string;
  spaceId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  currency: CurrencyCode;
  /** The base frequency unit */
  pattern: RecurrencePattern;
  /**
   * Cycle multiplier.
   * e.g. pattern="weekly" + interval=2 means "every 2 weeks".
   * Must be >= 1.
   */
  interval: number;
  startDate: DateString;
  /** End date in YYYY-MM-DD format. Null means no end date (runs indefinitely). */
  endDate: DateString | null;
  /** The next scheduled generation date in YYYY-MM-DD format */
  nextDate: DateString;
  status: RecurrenceStatus;
  createdAt: ISOString;
}

/**
 * Payload for creating a new recurrence rule.
 * Server-generated fields (id, createdAt, nextDate) are excluded.
 */
export type RecurrenceInput = Omit<Recurrence, "id" | "createdAt" | "nextDate">;

/** Payload for updating an existing recurrence rule. All fields optional. */
export type RecurrenceUpdate = Partial<RecurrenceInput>;
