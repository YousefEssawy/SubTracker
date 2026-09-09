import type { CurrencyCode, ISOString, DateString } from "./common";
import type { TransactionType } from "./transaction";

/**
 * Whether the recurrence rule is active, paused, or completed.
 * - "active": currently in effect and generating transactions on schedule.
 * - "paused": suspended by user choice or safety stop; always reversible.
 * - "completed": has run past its end date and will never generate again; terminal.
 */
export type RecurrenceStatus = "active" | "paused" | "completed";

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
  /**
   * True when the document was written by the pre-migration client and
   * has been normalised on read.
   */
  isLegacySchema: boolean;
  createdAt: ISOString;
}

/**
 * Payload for creating a new recurrence rule.
 * Server-generated fields (id, createdAt, nextDate, isLegacySchema) are excluded.
 */
export type RecurrenceInput = Omit<
  Recurrence,
  "id" | "createdAt" | "nextDate" | "isLegacySchema"
>;

/** Payload for updating an existing recurrence rule. All fields optional. */
export type RecurrenceUpdate = Partial<RecurrenceInput>;
