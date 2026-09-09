Modal for creating or editing an Income or Expense category.

```jsx
<CategoryForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />
<CategoryForm category={{ name: "Rent", type: "Expense" }} onSubmit={handleUpdate} onClose={close} />
```

Type is a two-way toggle only at creation — once saved, type is immutable (shown as a read-only badge with an explanatory caption on edit) since transactions already reference it.
