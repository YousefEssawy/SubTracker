# Spec 08 — Attachment lifecycle and transaction deletion (W7)

> **You cannot run shell commands in this environment.** Do not attempt `npm`, `git`, `firebase`, `tsc`, or any test runner — the attempt is auto-denied and aborts your run with no output. Write files only. The orchestrator runs all gates and reports results back to you.

## Context

**Resolves:** F8 (uploaded files are orphaned; there is no way to delete a transaction at all), F41 (attachments are uploaded, stored, and never displayed anywhere), and the duplicated upload constants in F26.

A user can attach a JPEG, PNG, or PDF receipt to a transaction. The file uploads to Firebase Storage, the download URL and metadata are saved on the transaction document — and then **nothing in the application ever renders it**. `grep` for `attachmentUrl` across `src/pages/` and `src/components/` matches only the form page. `TransactionDetailPage` shows amount, date, space, category, tags, and notes; the attachment is absent. The only evidence a user ever sees again is the filename-and-size chip inside the edit form.

Two further halves are missing:
- **Removing an attachment** clears the Firestore pointer but never deletes the Storage object. `deleteAttachment` exists in `storageService.ts` and has zero callers.
- **Deleting a transaction** is impossible. `transactionService.ts` has no delete function and no page offers the action, unlike categories, spaces, subscriptions, and recurrences which all have one.

The net effect is a feature that only ever accumulates storage cost.

## Scope

**Modify:**
- `src/pages/TransactionDetailPage.tsx`
- `src/pages/TransactionFormPage.tsx`
- `src/services/transactionService.ts`
- `src/services/storageService.ts`
- `src/components/finance/FileUpload.tsx`
- `src/contexts/TransactionContext.tsx`

**Create:**
- `src/utils/attachments.ts` — single source for the upload policy constants
- `src/utils/__tests__/attachments.test.ts`
- `src/services/__tests__/transactionService.delete.test.ts`

**Must NOT be touched:**
- `src/components/ui/ConfirmDialog.tsx` — spec 12 rewrites it; consume it as it is today
- `storage.rules` — spec 05
- `src/pages/TransactionsPage.tsx`, `src/components/finance/TransactionListItem.tsx` — the list stays as it is
- Anything under `functions/` or `shared/`

**Out of scope:** modal accessibility (spec 12), translating existing hardcoded strings (spec 11), the transaction list's own delete affordance.

## Existing code

### `src/services/storageService.ts` — complete
```ts
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";
import type { AttachmentMeta } from "@/models/transaction";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export interface UploadResult { url: string; meta: AttachmentMeta; }

export const uploadAttachment = async (
  userId: string, transactionId: string, file: File,
): Promise<UploadResult> => {
  if (!(ALLOWED_TYPES as readonly string[]).includes(file.type)) {
    throw new Error(`Invalid file type "${file.type}". Allowed: JPEG, PNG, PDF.`);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(1)} MB) exceeds the 5 MB limit.`);
  }

  const storagePath = `users/${userId}/transactions/${transactionId}/attachment`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  const meta: AttachmentMeta = { name: file.name, size: file.size, type: file.type, storagePath };
  return { url, meta };
};

export const deleteAttachment = async (userId: string, transactionId: string): Promise<void> => {
  const storagePath = `users/${userId}/transactions/${transactionId}/attachment`;
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
};
```
Note `deleteAttachment` **reconstructs** the path rather than using the stored `meta.storagePath`.

### `src/components/finance/FileUpload.tsx:11-12` — the duplicate constants
```tsx
const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
```
Same values, different names, second copy. Its `formatSize` helper is also worth sharing:
```tsx
const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};
```

### `src/models/transaction.ts` — the metadata shape
```ts
export interface AttachmentMeta {
  name: string;
  size: number;
  type: string;
  storagePath?: string;
}
```
And on `Transaction`: `attachmentUrl: string | null; attachmentMeta: AttachmentMeta | null;`

### `src/pages/TransactionFormPage.tsx:198-202` — remove that removes nothing
```tsx
const handleRemoveAttachment = () => {
  setAttachmentFile(null);
  setExistingAttachmentMeta(null);
  setExistingAttachmentUrl(null);
};
```
And the submit path that writes the null pointer:
```tsx
const data: TransactionInput = {
  type, spaceId, categoryId,
  amount: parseFloat(amount),
  currency: currency as CurrencyCode,
  transactionDate,
  notes: notes.trim() || null,
  tags,
  attachmentUrl: _existingAttachmentUrl,      // ← note the misleading underscore (F34, spec 10)
  attachmentMeta: existingAttachmentMeta,
  recurrenceId: null,
};

if (isEditMode && txId) {
  if (attachmentFile) {
    const { url, meta } = await uploadAttachment(user.uid, txId, attachmentFile);
    data.attachmentUrl = url;
    data.attachmentMeta = meta;
  }
  await updateTransaction(txId, data);
  toast.success(t("finance.transactions.updated", "Transaction updated!"));
} else {
  const result = await addTransaction(data);
  txId = result?.id;
  if (attachmentFile && txId) {
    try {
      const { url, meta } = await uploadAttachment(user.uid, txId, attachmentFile);
      await updateTransaction(txId, { attachmentUrl: url, attachmentMeta: meta });
    } catch {
      toast.error(t("finance.transactions.attachmentError",
        "Transaction saved but attachment upload failed. You can attach it later."));
    }
  }
  toast.success(t("finance.transactions.added", "Transaction added!"));
}
```

### `src/pages/TransactionDetailPage.tsx` — where the attachment must appear
```tsx
{/* Details */}
<div className="space-y-3">
  {[
    { label: t("finance.transactions.date", "Date"), value: formatDate(transaction.transactionDate) },
    { label: t("finance.transactions.space", "Space"), value: space ? `${space.icon} ${space.name}` : "—" },
    { label: t("finance.transactions.category", "Category"), value: category?.name || "—" },
  ].map(({ label, value }) => (
    <div key={label} className="flex justify-between items-center text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-gray-800 dark:text-gray-200">{value}</span>
    </div>
  ))}
</div>

{/* Tags */}
{transaction.tags && transaction.tags.length > 0 && (
  <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
    <p className="text-xs text-gray-400 mb-2">{t("finance.transactions.tags", "Tags")}</p>
    <div className="flex flex-wrap gap-2">
      {transaction.tags.map((tag: string) => (
        <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium">
          #{tag}
        </span>
      ))}
    </div>
  </div>
)}

{/* Notes */}
{transaction.notes && (
  <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
    <p className="text-xs text-gray-400 mb-1">{t("finance.transactions.notes", "Notes")}</p>
    <p className="text-sm text-gray-700 dark:text-gray-300">{transaction.notes}</p>
  </div>
)}
```
The page header already has a Back button and an Edit button:
```tsx
<button onClick={() => navigate(`/transactions/${id}/edit`)}
  className="flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80 transition-opacity">
  <HiOutlinePencil className="w-4 h-4" />
  {t("finance.transactions.edit", "Edit")}
</button>
```

### The delete pattern every other entity follows — `src/services/categoryService.ts:77-89`
```ts
export const deleteCategory = async (userId: string, categoryId: string): Promise<void> => {
  const hasLinks = await hasLinkedDocuments(userId, categoryId);
  if (hasLinks) throw new Error("Cannot delete this category — …");
  const docRef = doc(db, "users", userId, "categories", categoryId);
  await deleteDoc(docRef);
};
```

### The shared confirm dialog, as it exists today — `src/components/ui/ConfirmDialog.tsx`
```tsx
export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning";
}
```
Used correctly by `SubscriptionsPage.tsx:431-440`:
```tsx
<ConfirmDialog
  isOpen={!!deleteTarget}
  onClose={() => setDeleteTarget(null)}
  onConfirm={handleDelete}
  title={t("subscriptions.deleteTitle")}
  message={t("subscriptions.deleteMessage")}
  confirmText={t("subscriptions.delete")}
  cancelText={t("subscriptions.cancel")}
  variant="danger"
/>
```

### Context mutator pattern — `src/contexts/TransactionContext.tsx`
```tsx
const updateTransaction = useCallback(async (id: string, data: TransactionUpdate) => {
  if (!user) throw new Error("Not authenticated");
  await updateTransactionSvc(user.uid, id, data);
}, [user]);
```

## Requirements

1. **Create `src/utils/attachments.ts`** as the single source for the upload policy: `ALLOWED_ATTACHMENT_TYPES` (the three MIME types), `MAX_ATTACHMENT_SIZE` (5 MB in bytes), `MAX_ATTACHMENT_SIZE_LABEL` (`"5 MB"`), a `formatFileSize(bytes)` helper moved from `FileUpload`, and `attachmentStoragePath(userId, transactionId)` returning the canonical path string.

2. **`storageService.ts` and `FileUpload.tsx` both import from `src/utils/attachments.ts`.** Neither declares its own copy of the types, the size limit, the size formatter, or the path template. After this change the string `5 * 1024 * 1024` appears exactly once in `src/`.

3. **`deleteAttachment` accepts an explicit storage path.** Change the signature to `deleteAttachment(storagePath: string): Promise<void>`. Callers pass `attachmentMeta.storagePath` when present, falling back to `attachmentStoragePath(userId, transactionId)` when it is absent (older documents may lack it — `AttachmentMeta.storagePath` is optional). Reconstructing the path inside the service is the current bug; the caller knows the truth.

4. **`deleteAttachment` treats a missing object as success.** Firebase Storage throws `storage/object-not-found` when the file is already gone. Catch that specific code and resolve; rethrow anything else. Deleting a transaction whose file was already removed must not fail.

5. **Removing an attachment in the form deletes the Storage object.** `handleRemoveAttachment` becomes async: when an existing attachment is present (not a newly-picked local `File`), call `deleteAttachment`, then clear the local state. If the Storage delete fails, show a `toast.error` and **still** clear the pointer — an orphaned file is better than a transaction stuck pointing at a file the user asked to remove. Say so in a comment.

6. **Replacing an attachment deletes the old object.** In edit mode, when `attachmentFile` is set and an existing attachment already exists at a *different* storage path, delete the old object after the new upload succeeds. Note that the current path template is deterministic per transaction, so a replacement usually overwrites in place and no delete is needed — implement the delete only for the case where the stored `meta.storagePath` differs from the computed path, and add a comment explaining why it is usually a no-op.

7. **Add `deleteTransaction(userId, transactionId)` to `src/services/transactionService.ts`.** It must read the transaction first, delete the Storage object if `attachmentUrl` is set, then `deleteDoc` the document. Order matters: if the Storage delete throws something other than not-found, abort and do **not** delete the document, so the user can retry rather than being left with an orphan and no reference to it.

8. **Expose `deleteTransaction(id)` on `TransactionContext`** with the `if (!user) throw new Error("Not authenticated")` guard, wrapped in `useCallback`, added to `TransactionContextValue`. If spec 07 has landed, call `refreshBalances()` after a successful delete.

9. **`TransactionDetailPage` renders the attachment.** Add a section, styled to match the Tags and Notes sections (`pt-2 border-t border-gray-100 dark:border-gray-800`), shown only when `transaction.attachmentUrl` is set:
   - when `attachmentMeta.type` starts with `image/`: an `<img>` thumbnail linking to the full file, `max-h-64`, `object-contain`, with `alt` set to the file name
   - otherwise: a download link with the document icon, the file name, and the formatted size
   - every link opens in a new tab with `target="_blank" rel="noopener noreferrer"`, matching `AboutPage.tsx:94-95`
   - when `attachmentMeta` is null but `attachmentUrl` is set (possible for older documents), fall back to a plain "View attachment" link

10. **`TransactionDetailPage` gains a Delete action** beside the existing Edit button, using the shared `ConfirmDialog` with `variant="danger"`. On confirm it calls the context's `deleteTransaction`, shows a success toast, and navigates to `/transactions`. On failure it shows an error toast and stays on the page.

11. **All new user-visible strings use `t()` with an English default**, and every new key is added to **both** `src/locales/en/translation.json` and `src/locales/ar/translation.json` in the same change, under the existing `finance.transactions` path. Arabic values must be real translations, not English text.

12. **The image thumbnail must not break the page when the URL 404s.** Add an `onError` handler that swaps to the download-link presentation.

## Conventions to follow

- **Translation calls:** `t("finance.transactions.attachment", "Attachment")` — key path then English default.
- **Icons** come from `react-icons/hi2` and are already imported per-file; the detail page uses `HiOutlineArrowLeft` and `HiOutlinePencil`. Use `HiOutlineTrash` for delete and `HiOutlineDocumentText` / `HiOutlinePhoto` for attachment types, matching `FileUpload.tsx:3-8`.
- **Tailwind classes carry light and dark variants**, e.g. `text-gray-700 dark:text-gray-300`. Match the surrounding sections exactly.
- **RTL-aware icons** use the `rtl:-scale-x-100` modifier where directional — see `TransactionDetailPage.tsx:58`.
- **Service functions** take `userId` first and return typed promises.
- **Context mutators** use `useCallback` with the auth guard.
- **Toasts** are `toast.success(...)` / `toast.error(...)` from `react-hot-toast`, imported as `import toast from "react-hot-toast"`.

## Tests required

**`src/utils/__tests__/attachments.test.ts`**
- `formatFileSize` for bytes, KB, and MB boundaries (`1023`, `1024`, `1048576`)
- `attachmentStoragePath` returns `users/<uid>/transactions/<txid>/attachment`
- `ALLOWED_ATTACHMENT_TYPES` contains exactly the three MIME types

**`src/services/__tests__/transactionService.delete.test.ts`** — mock `firebase/firestore` and `./storageService`:
- deleting a transaction with an attachment calls `deleteAttachment` with the stored `meta.storagePath`, then `deleteDoc`
- deleting a transaction with an attachment but **no** `storagePath` falls back to the computed path
- deleting a transaction with no attachment does not call `deleteAttachment`
- a `storage/object-not-found` error still results in the document being deleted
- any other Storage error aborts and leaves `deleteDoc` **uncalled** — the Requirement 7 regression test

## Definition of done

```
npm run lint
npm run test
npm run build
```

The orchestrator cannot exercise real Firebase Storage — attachment rendering and upload/delete against a live bucket will not be verified, and the review will say so.

## Constraints

- **No new dependencies without asking first.** No lightbox library, no image viewer, no file-type detection package.
- **No reformatting of untouched lines.**
- **No refactors beyond the listed files.** Do not restructure `ConfirmDialog` (spec 12), do not rename `_existingAttachmentUrl` (spec 10 owns F34), do not touch the transactions list.
- **Do not add a delete button to `TransactionListItem` or `TransactionsPage`** — the detail page is the only entry point in this spec.
- Do not change the storage path template.

## Report back

1. The implementation.
2. Your approach — particularly the delete ordering in Requirement 7 and how you handled the "already gone" case.
3. Anything skipped, blocked, or decided differently. **Specifically: (a) whether Requirement 6's replacement-delete is ever reachable given the deterministic path, and (b) whether `refreshBalances` existed on the context when you got here, i.e. whether spec 07 had landed.**
