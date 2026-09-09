import React, { useState } from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * TagInput — freeform tag entry with chips, enforcing max count/length.
 * Ported from src/components/finance/TagInput.tsx (react-i18next strings
 * hardcoded to English).
 */
export function TagInput({ tags = [], onChange, maxTags = 10, maxLength = 30 }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const addTag = (raw) => {
    const tag = raw.toLowerCase().trim();
    if (!tag) return;
    if (tag.length > maxLength) return setError(`Tag cannot exceed ${maxLength} characters.`);
    if (tags.length >= maxTags) return setError(`Maximum ${maxTags} tags allowed.`);
    if (tags.includes(tag)) return setError("Tag already exists.");
    setError("");
    onChange([...tags, tag]);
    setInput("");
  };

  const removeTag = (tag) => {
    onChange(tags.filter((t) => t !== tag));
    setError("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && tags.length > 0) removeTag(tags[tags.length - 1]);
  };

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
        {tags.map((tag) => (
          <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "0.25rem 0.65rem", borderRadius: "var(--radius-pill)", fontSize: 12, fontWeight: 500, background: "var(--brand-primary-050)", color: "var(--brand-primary-600)" }}>
            #{tag}
            <button onClick={() => removeTag(tag)} style={{ border: "none", background: "none", cursor: "pointer", padding: 0, display: "flex", color: "inherit", opacity: 0.7 }}>
              <Icon name="x-mark" size={12} />
            </button>
          </span>
        ))}
      </div>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(""); }}
          onKeyDown={handleKeyDown}
          placeholder={tags.length >= maxTags ? "Max tags reached" : "Type a tag and press Enter…"}
          disabled={tags.length >= maxTags}
          maxLength={maxLength}
          className="input-field"
          style={{ paddingRight: 56, fontSize: 14 }}
        />
        <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "var(--text-tertiary)" }}>
          {tags.length}/{maxTags}
        </span>
      </div>
      {error && <p style={{ marginTop: 4, fontSize: 11, color: "var(--danger-500)" }}>{error}</p>}
    </div>
  );
}
