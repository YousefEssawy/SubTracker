import { useTranslation } from "react-i18next";
import { HiOutlineArrowLeft, HiOutlineArrowRight } from "react-icons/hi2";

export interface PaginationProps {
  hasNext: boolean;
  hasPrev: boolean;
  goNext: () => void;
  goPrev: () => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  pageSizeOptions?: number[] | readonly number[];
}

const Pagination = ({
  hasNext,
  hasPrev,
  goNext,
  goPrev,
  pageSize,
  setPageSize,
  pageSizeOptions = [10, 25, 50],
}: PaginationProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between px-1 py-3 border-t border-gray-200 dark:border-gray-800">
      {/* Page size selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {t("finance.pagination.rows", "Rows:")}
        </span>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          {pageSizeOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={goPrev}
          disabled={!hasPrev}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <HiOutlineArrowLeft className="w-4 h-4 rtl:-scale-x-100" />
          {t("finance.pagination.prev", "Prev")}
        </button>
        <button
          onClick={goNext}
          disabled={!hasNext}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {t("finance.pagination.next", "Next")}
          <HiOutlineArrowRight className="w-4 h-4 rtl:-scale-x-100" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
