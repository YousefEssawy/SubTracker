import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./firebase";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Upload an attachment for a transaction.
 * @param {string} userId
 * @param {string} transactionId
 * @param {File} file - Browser File object
 * @returns {Promise<{ url: string, meta: { fileName: string, fileSize: number, contentType: string } }>}
 */
export const uploadAttachment = async (userId, transactionId, file) => {
  // Validate type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      `Invalid file type "${file.type}". Allowed: JPEG, PNG, PDF.`,
    );
  }
  // Validate size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File size (${(file.size / 1024 / 1024).toFixed(1)} MB) exceeds the 5 MB limit.`,
    );
  }

  const storagePath = `users/${userId}/transactions/${transactionId}/attachment`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  return {
    url,
    meta: {
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type,
    },
  };
};

/**
 * Delete an attachment for a transaction.
 * @param {string} userId
 * @param {string} transactionId
 * @returns {Promise<void>}
 */
export const deleteAttachment = async (userId, transactionId) => {
  const storagePath = `users/${userId}/transactions/${transactionId}/attachment`;
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
};
