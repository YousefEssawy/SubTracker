Freeform tag entry for transactions — press Enter or `,` to commit a chip, Backspace on empty input deletes the last one.

```jsx
<TagInput tags={tags} onChange={setTags} maxTags={10} maxLength={30} />
```

Enforces `maxTags` and `maxLength`, lowercases input, and blocks duplicates — shows an inline red error message rather than a toast for these validation failures.
