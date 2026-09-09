import React from "react";

export interface FilterBarProps {
  spaces?: { id: string; name: string; icon: string }[];
  filters: { type?: "Income" | "Expense"; spaceId?: string; tag?: string };
  setFilters: (filters: any) => void;
}

export declare function FilterBar(props: FilterBarProps): JSX.Element;
