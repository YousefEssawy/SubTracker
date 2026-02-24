import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  calculateNextExecutionDate,
  toDateInputValue,
} from "@/utils/dateUtils";

const colRef = (userId) => collection(db, "users", userId, "recurrences");

/**
 * Create a new recurrence rule.
 */
export const addRecurrence = async (userId, data) => {
  const nextExec = calculateNextExecutionDate(
    data.startDate,
    data.pattern,
    data.interval,
  );
  const docData = {
    type: data.type,
    spaceId: data.spaceId,
    categoryId: data.categoryId,
    amount: Math.round(data.amount * 100) / 100,
    currency: data.currency,
    pattern: data.pattern,
    interval: data.interval || 1,
    startDate: data.startDate,
    endDate: data.endDate || null,
    nextExecutionDate: toDateInputValue(nextExec),
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(colRef(userId), docData);
  return { id: ref.id, ...docData };
};

/**
 * Pause a recurrence — stop generating transactions.
 */
export const pauseRecurrence = async (userId, recurrenceId) => {
  const ref = doc(db, "users", userId, "recurrences", recurrenceId);
  await updateDoc(ref, { isActive: false, updatedAt: serverTimestamp() });
};

/**
 * Reactivate a paused recurrence and recalculate next execution date.
 */
export const reactivateRecurrence = async (
  userId,
  recurrenceId,
  pattern,
  interval,
) => {
  const ref = doc(db, "users", userId, "recurrences", recurrenceId);
  const nextExec = calculateNextExecutionDate(new Date(), pattern, interval);
  await updateDoc(ref, {
    isActive: true,
    nextExecutionDate: toDateInputValue(nextExec),
    updatedAt: serverTimestamp(),
  });
};

/**
 * Delete a recurrence — existing generated transactions are preserved.
 */
export const deleteRecurrence = async (userId, recurrenceId) => {
  const ref = doc(db, "users", userId, "recurrences", recurrenceId);
  await deleteDoc(ref);
};

/**
 * Subscribe to all recurrences for the given user.
 */
export const subscribeToRecurrences = (userId, callback) => {
  const q = query(colRef(userId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(items);
  });
};
