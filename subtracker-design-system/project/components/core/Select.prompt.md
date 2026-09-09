Labeled dropdown matching currency/category/space pickers throughout the finance forms.

```jsx
<Select label="Currency">
  <option value="EGP">E£ EGP</option>
  <option value="USD">$ USD</option>
</Select>
```

Same visual treatment as Input — `.select-field` reuses `.input-field`'s padding/border/focus ring with `appearance: none` and a pointer cursor.
