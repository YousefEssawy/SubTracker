import React from "react";

export interface TransactionListItemProps {
  transaction: {
    type: "Income" | "Expense";
    amount: number;
    currency: string;
    transactionDate: string;
  };
  category?: { name: string; icon: string; color: string } | null;
  space?: { name: string; icon: string; color: string } | null;
  onClick?: () => void;
}

export declare function TransactionListItem(props: TransactionListItemProps): JSX.Element;
