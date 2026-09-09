import React from "react";

export interface PaginationProps {
  hasNext: boolean;
  hasPrev: boolean;
  goNext: () => void;
  goPrev: () => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  /** @default [10, 25, 50] */
  pageSizeOptions?: number[];
}

export declare function Pagination(props: PaginationProps): JSX.Element;
