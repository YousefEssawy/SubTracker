import React from "react";

export interface CurrencyBalance {
  balance: number;
  income: number;
  expense: number;
}

export interface BalanceCardProps {
  /** @default "summary" */
  variant?: "summary" | "contextual";
  balances?: Record<string, CurrencyBalance>;
}

export declare function BalanceCard(props: BalanceCardProps): JSX.Element;
