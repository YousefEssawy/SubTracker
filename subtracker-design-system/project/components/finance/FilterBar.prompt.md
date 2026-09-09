Filter toolbar sitting above the transactions list — Income/Expense/All toggle always visible, space/tag/date filters behind a "More" expander, active filters shown as removable chips.

```jsx
<FilterBar spaces={spaces} filters={filters} setFilters={setFilters} />
```

On mobile the source renders the expanded filters as a bottom sheet (`.sheet-panel`) instead of inline — this simplified port always renders inline; reintroduce that breakpoint behavior in production.
