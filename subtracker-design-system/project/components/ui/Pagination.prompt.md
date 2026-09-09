Row-count selector plus prev/next controls, for any paginated table (history, transactions).

```jsx
<Pagination
  hasPrev={page > 0}
  hasNext={hasMore}
  goPrev={() => setPage(p => p - 1)}
  goNext={() => setPage(p => p + 1)}
  pageSize={pageSize}
  setPageSize={setPageSize}
/>
```

Arrow icons flip automatically under RTL in the source app (`rtl:-scale-x-100`) — mirror that in production if you reuse this outside LTR-only contexts.
