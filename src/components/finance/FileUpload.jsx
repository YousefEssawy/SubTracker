import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  HiOutlineCloudArrowUp,
  HiOutlineDocumentText,
  HiOutlinePhoto,
  HiOutlineXMark,
} from "react-icons/hi2";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const typeIcon = (contentType) => {
  if (contentType?.startsWith("image/"))
    return <HiOutlinePhoto className="w-6 h-6" />;
  return <HiOutlineDocumentText className="w-6 h-6" />;
};

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const FileUpload = ({ file, existingMeta, onFileSelect, onRemove }) => {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const validateAndSet = (selectedFile) => {
    setError("");
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError(
        t(
          "finance.fileUpload.invalidType",
          "Only JPEG, PNG, and PDF files are allowed.",
        ),
      );
      return;
    }
    if (selectedFile.size > MAX_SIZE) {
      setError(
        t(
          "finance.fileUpload.tooLarge",
          "File exceeds 5 MB limit ({{size}}).",
          {
            size: formatSize(selectedFile.size),
          },
        ),
      );
      return;
    }
    onFileSelect(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSet(dropped);
  };

  const handleChange = (e) => {
    const selected = e.target.files[0];
    if (selected) validateAndSet(selected);
  };

  // Selected file preview
  const displayFile =
    file ||
    (existingMeta
      ? {
          name: existingMeta.fileName,
          size: existingMeta.fileSize,
          type: existingMeta.contentType,
        }
      : null);

  return (
    <div>
      {displayFile ? (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="text-primary">{typeIcon(displayFile.type)}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
              {displayFile.name}
            </p>
            <p className="text-xs text-gray-400">
              {formatSize(displayFile.size)}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs text-primary hover:underline"
            >
              {t("finance.fileUpload.replace", "Replace")}
            </button>
            <button
              type="button"
              onClick={() => {
                onRemove();
                setError("");
              }}
              className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <HiOutlineXMark className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800"
          }`}
        >
          <HiOutlineCloudArrowUp
            className={`w-8 h-8 mb-2 ${dragOver ? "text-primary" : "text-gray-400"}`}
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="text-primary font-medium">
              {t("finance.fileUpload.clickToUpload", "Click to upload")}
            </span>{" "}
            {t("finance.fileUpload.orDragDrop", "or drag and drop")}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {t("finance.fileUpload.fileTypes", "JPEG, PNG or PDF up to 5 MB")}
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={handleChange}
        className="hidden"
      />

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default FileUpload;
