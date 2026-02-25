import type { ISOString } from "./common";

/** Whether a finance category applies to income or expenses */
export type FinanceCategoryType = "Income" | "Expense";

/** A user-defined or default category for grouping transactions */
export interface Category {
  id: string;
  name: string;
  type: FinanceCategoryType;
  icon: string;
  color: string;
  createdAt: ISOString;
}

/** Payload for creating a new category. Server-generated fields excluded. */
export type CategoryInput = Omit<Category, "id" | "createdAt">;

/** Payload for updating an existing category. All fields optional. */
export type CategoryUpdate = Partial<CategoryInput>;
