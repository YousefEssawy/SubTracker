import React from "react";

export interface CategoryFormProps {
  category?: { name: string; type: "Income" | "Expense" } | null;
  onSubmit?: (data: { name: string; type: "Income" | "Expense" }) => void;
  onClose: () => void;
}

export declare function CategoryForm(props: CategoryFormProps): JSX.Element;
