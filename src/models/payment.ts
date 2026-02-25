import type { CurrencyCode, ISOString, DateString } from "./common";

/** A logged payment event from a subscription renewal */
export interface Payment {
  id: string;
  subscriptionId: string;
  subscriptionName: string;
  amount: number;
  currency: CurrencyCode;
  /** Date the payment was made, in YYYY-MM-DD format */
  paidDate: DateString;
  paymentMethod: string | null;
  createdAt: ISOString;
}
