import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./firebase";
import type { AttachmentMeta } from "@/models/transaction";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export interface UploadResult {
  url: string;
  meta: AttachmentMeta;
}

/**
 * Uploads an attachment file for a transaction to Firebase Storage.
 * Returns the download URL and typed AttachmentMeta.
 */
export const uploadAttachment = async (
  userId: string,
  transactionId: string,
  file: File,
): Promise<UploadResult> => {
  if (!(ALLOWED_TYPES as readonly string[]).includes(file.type)) {
    throw new Error(
      `Invalid file type "${file.type}". Allowed: JPEG, PNG, PDF.`,
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File size (${(file.size / 1024 / 1024).toFixed(1)} MB) exceeds the 5 MB limit.`,
    );
  }

  const storagePath = `users/${userId}/transactions/${transactionId}/attachment`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  const meta: AttachmentMeta = {
    name: file.name,
    size: file.size,
    type: file.type,
    storagePath,
  };

  return { url, meta };
};

/**
 * Deletes the attachment for a given transaction from Firebase Storage.
 */
export const deleteAttachment = async (
  userId: string,
  transactionId: string,
): Promise<void> => {
  const storagePath = `users/${userId}/transactions/${transactionId}/attachment`;
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
};
