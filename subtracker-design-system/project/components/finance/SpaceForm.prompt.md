Modal for creating or editing a "Space" — a context users group finances by (Personal, Freelance, Household, Travel…).

```jsx
<SpaceForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />
<SpaceForm space={existingSpace} onSubmit={handleUpdate} onClose={() => setEditing(null)} />
```

Icon picker is an emoji grid, color picker a fixed swatch row — both feed a live preview row at the bottom of the form before submit.
