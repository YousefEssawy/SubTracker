import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSpaces } from "@/contexts/SpaceContext";
import { useViewport } from "@/contexts/ViewportContext";
import { CURRENCIES } from "@/utils/currencies";
import { HiOutlineXMark, HiOutlineFunnel } from "react-icons/hi2";
import type { TransactionFilters } from "@/utils/balanceUtils";
import type { CurrencyCode } from "@/models";

interface TypeButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  color: string;
}

const TypeButton = ({ label, active, onClick, color }: TypeButtonProps) => (
  <button
    onClick={onClick}
    className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
      active
        ? `${color} text-white`
        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
    }`}
  >
    {label}
  </button>
);

type Filters = TransactionFilters;

interface FilterBarProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
}

const FilterBar = ({ filters, setFilters }: FilterBarProps) => {
  const { spaces } = useSpaces();
  const { isMobile } = useViewport();
  const { t } = useTranslation();
  const [showMore, setShowMore] = useState(false);

  const hasActiveFilters =
    filters.spaceId ||
    filters.type ||
    filters.currency ||
    filters.tag ||
    filters.dateRange?.start ||
    filters.dateRange?.end;

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters({ ...filters, [key]: value });
  };

  const updateDateRange = (field: "start" | "end", value: string) => {
    const current = filters.dateRange || {};
    const next = { ...current, [field]: value || undefined };
    // Remove the dateRange key entirely if both are empty
    if (!next.start && !next.end) {
      const { dateRange: _dr, ...rest } = filters;
      setFilters(rest as Filters);
    } else {
      setFilters({ ...filters, dateRange: next });
    }
  };

  const clearAll = () => setFilters({});

  const expandedFilters = (
    <>
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">
            {t("finance.transactions.space", "Space")}
          </label>
          <select
            value={filters.spaceId || ""}
            onChange={(e) => updateFilter("spaceId", e.target.value || undefined)}
            className="select-field text-sm py-2"
          >
            <option value="">
              {t("finance.filters.allSpaces", "All Spaces")}
            </option>
            {spaces.map((s) => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">
            {t("finance.transactions.currency", "Currency")}
          </label>
          <select
            value={filters.currency || ""}
            onChange={(e) =>
              updateFilter(
                "currency",
                (e.target.value as CurrencyCode) || undefined,
              )
            }
            className="select-field text-sm py-2"
          >
            <option value="">
              {t("finance.filters.allCurrencies", "All Currencies")}
            </option>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.symbol} {c.code}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 mt-3">
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            {t("finance.filters.tag", "Tag")}
          </label>
          <input
            type="text"
            value={filters.tag || ""}
            onChange={(e) => updateFilter("tag", e.target.value || undefined)}
            placeholder={t("finance.filters.tagPlaceholder", "Filter by tag…")}
            className="input-field text-sm py-2"
          />
        </div>

        <div className="min-w-[140px]">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            {t("finance.filters.from", "From")}
          </label>
          <input
            type="date"
            value={filters.dateRange?.start || ""}
            onChange={(e) => updateDateRange("start", e.target.value)}
            className="input-field text-sm py-2"
          />
        </div>
        <div className="min-w-[140px]">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            {t("finance.filters.to", "To")}
          </label>
          <input
            type="date"
            value={filters.dateRange?.end || ""}
            onChange={(e) => updateDateRange("end", e.target.value)}
            className="input-field text-sm py-2"
          />
        </div>
      </div>
    </>
  );

  return (
    <div className="glass-card p-4 mb-4">
      {/* Primary row */}
      <div className="flex flex-wrap items-center gap-3">
        <HiOutlineFunnel className="w-4 h-4 text-gray-400 flex-shrink-0" />

        {/* Type toggle */}
        <div className="flex gap-1.5">
          <TypeButton
            label={t("finance.filters.all", "All")}
            active={!filters.type}
            onClick={() => updateFilter("type", undefined)}
            color="bg-primary"
          />
          <TypeButton
            label={t("finance.categories.income", "Income")}
            active={filters.type === "Income"}
            onClick={() => updateFilter("type", "Income")}
            color="bg-success"
          />
          <TypeButton
            label={t("finance.categories.expense", "Expense")}
            active={filters.type === "Expense"}
            onClick={() => updateFilter("type", "Expense")}
            color="bg-danger"
          />
        </div>

        {/* Toggle more filters */}
        <button
          onClick={() => setShowMore(!showMore)}
          className="text-xs text-primary hover:underline ml-auto"
        >
          {showMore
            ? t("finance.filters.less", "Less ▲")
            : t("finance.filters.more", "More ▼")}
        </button>

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <HiOutlineXMark className="w-3.5 h-3.5" />{" "}
            {t("finance.filters.clear", "Clear")}
          </button>
        )}
      </div>

      {!isMobile && showMore && expandedFilters}

      {/* Mobile filters as sheet */}
      {isMobile && showMore && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowMore(false)}
          />
          <div className="sheet-panel">
            <div className="flex items-center justify-between mb-2">
              <p className="font-display text-base font-semibold text-gray-900 dark:text-white">
                {t("finance.filters.more", "More Filters")}
              </p>
              <button
                onClick={() => setShowMore(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <HiOutlineXMark className="h-5 w-5" />
              </button>
            </div>
            {expandedFilters}
          </div>
        </>
      )}

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          {filters.spaceId &&
            (() => {
              const space = spaces.find((s) => s.id === filters.spaceId);
              return space ? (
                <span
                  key="space"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                >
                  <span style={{ color: space.color }}>{space.icon}</span>{" "}
                  {space.name}
                  <button
                    onClick={() => updateFilter("spaceId", undefined)}
                    className="hover:opacity-70"
                  >
                    <HiOutlineXMark className="w-3 h-3" />
                  </button>
                </span>
              ) : null;
            })()}
          {filters.type && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {filters.type}
              <button
                onClick={() => updateFilter("type", undefined)}
                className="hover:opacity-70"
              >
                <HiOutlineXMark className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.currency && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {filters.currency}
              <button
                onClick={() => updateFilter("currency", undefined)}
                className="hover:opacity-70"
              >
                <HiOutlineXMark className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.tag && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              #{filters.tag}
              <button
                onClick={() => updateFilter("tag", undefined)}
                className="hover:opacity-70"
              >
                <HiOutlineXMark className="w-3 h-3" />
              </button>
            </span>
          )}
          {(filters.dateRange?.start || filters.dateRange?.end) && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              📅 {filters.dateRange?.start || "…"} →{" "}
              {filters.dateRange?.end || "…"}
              <button
                onClick={() => {
                  const { dateRange: _dr2, ...rest } = filters;
                  setFilters(rest as Filters);
                }}
                className="hover:opacity-70"
              >
                <HiOutlineXMark className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
