import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineXMark } from "react-icons/hi2";

const TagInput = ({ tags = [], onChange, maxTags = 10, maxLength = 30 }) => {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const addTag = (raw) => {
    const tag = raw.toLowerCase().trim();
    if (!tag) return;

    if (tag.length > maxLength) {
      setError(
        t("finance.tags.tooLong", "Tag cannot exceed {{max}} characters.", {
          max: maxLength,
        }),
      );
      return;
    }
    if (tags.length >= maxTags) {
      setError(
        t("finance.tags.maxTags", "Maximum {{max}} tags allowed.", {
          max: maxTags,
        }),
      );
      return;
    }
    if (tags.includes(tag)) {
      setError(t("finance.tags.alreadyExists", "Tag already exists."));
      return;
    }

    setError("");
    onChange([...tags, tag]);
    setInput("");
  };

  const removeTag = (tag) => {
    onChange(tags.filter((tg) => tg !== tag));
    setError("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
    // Remove last tag on backspace when input is empty
    if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div>
      {/* Tag chips */}
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-red-500 transition-colors"
            >
              <HiOutlineXMark className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError("");
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            tags.length >= maxTags
              ? t("finance.tags.maxReached", "Max tags reached")
              : t("finance.tags.placeholder", "Type a tag and press Enter…")
          }
          disabled={tags.length >= maxTags}
          maxLength={maxLength}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm disabled:opacity-50"
        />
        <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
          {tags.length}/{maxTags}
        </span>
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default TagInput;
