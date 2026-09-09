Drag-and-drop (or click) attachment field for transaction receipts — JPEG/PNG/PDF up to 5MB.

```jsx
<FileUpload file={file} onFileSelect={setFile} onRemove={() => setFile(null)} />
```

Shows a dashed dropzone when empty (highlights on drag-over), and a compact file-info row with Replace/Remove once a file is selected. Validates type and size client-side with an inline error message.
