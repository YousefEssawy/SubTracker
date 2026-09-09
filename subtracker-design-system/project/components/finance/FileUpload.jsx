import React, { useState } from "react";
import { Icon } from "../core/Icon.jsx";

const ALLOWED = ["image/jpeg", "image/png", "application/pdf"];
const MAX_SIZE = 5 * 1024 * 1024;

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

/**
 * FileUpload — drag/drop or click-to-upload receipt/attachment field.
 * Ported from src/components/finance/FileUpload.tsx.
 */
export function FileUpload({ file, onFileSelect, onRemove }) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const inputRef = React.useRef(null);

  const validateAndSet = (f) => {
    setError("");
    if (!ALLOWED.includes(f.type)) return setError("Only JPEG, PNG, and PDF files are allowed.");
    if (f.size > MAX_SIZE) return setError(`File exceeds 5 MB limit (${formatSize(f.size)}).`);
    onFileSelect(f);
  };

  if (file) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", background: "var(--surface-sunken)" }}>
        <div style={{ color: "var(--brand-primary-500)" }}>
          <Icon name={file.type?.startsWith("image/") ? "photo" : "document-text"} size={24} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</p>
          <p style={{ margin: 0, fontSize: 11, color: "var(--text-tertiary)" }}>{formatSize(file.size)}</p>
        </div>
        <button onClick={onRemove} style={{ padding: 4, borderRadius: "var(--radius-sm)", border: "none", background: "none", color: "var(--text-tertiary)", cursor: "pointer" }}>
          <Icon name="x-mark" size={16} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) validateAndSet(f); }}
        onClick={() => inputRef.current?.click()}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: 24, borderRadius: "var(--radius-md)", cursor: "pointer",
          border: `2px dashed ${dragOver ? "var(--brand-primary-500)" : "var(--border-default)"}`,
          background: dragOver ? "var(--brand-primary-050)" : "transparent",
        }}
      >
        <Icon name="cloud-arrow-up" size={32} style={{ marginBottom: 8, opacity: dragOver ? 1 : 0.5 }} />
        <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)" }}>
          <span style={{ color: "var(--brand-primary-500)", fontWeight: 500 }}>Click to upload</span> or drag and drop
        </p>
        <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--text-tertiary)" }}>JPEG, PNG or PDF up to 5 MB</p>
      </div>
      <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => e.target.files[0] && validateAndSet(e.target.files[0])} style={{ display: "none" }} />
      {error && <p style={{ marginTop: 8, fontSize: 11, color: "var(--danger-500)" }}>{error}</p>}
    </div>
  );
}
