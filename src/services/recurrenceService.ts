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
import type {
  Recurrence,
  RecurrenceInput,
  RecurrenceUpdate,
} from "@/models/recurrence";
import { toRecurrence } from "@/models/mappers";
import {
  calculateNextExecutionDate,
  toDateInputValue,
} from "@/utils/dateUtils";

const colRef = (userId: string) =>
  collection(db, "users", userId, "recurrences");

export const addRecurrence = async (
  userId: string,
  data: RecurrenceInput,
): Promise<Recurrence> => {
  const nextExec = calculateNextExecutionDate(
    data.startDate,
    data.pattern,
    data.interval,
  );
  const nextDate = toDateInputValue(nextExec);
  const docData = {
    type: data.type,
    spaceId: data.spaceId,
    categoryId: data.categoryId,
    amount: Math.round(data.amount * 100) / 100,
    currency: data.currency,
    pattern: data.pattern,
    interval: data.interval ?? 1,
    startDate: data.startDate,
    endDate: data.endDate ?? null,
    nextDate,
    status: data.status ?? "active",
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(colRef(userId), docData);
  return toRecurrence(ref.id, {
    ...docData,
    createdAt: new Date().toISOString(),
  });
};

export const pauseRecurrence = async (
  userId: string,
  recurrenceId: string,
): Promise<void> => {
  const ref = doc(db, "users", userId, "recurrences", recurrenceId);
  await updateDoc(ref, { status: "paused", updatedAt: serverTimestamp() });
};

export const reactivateRecurrence = async (
  userId: string,
  recurrenceId: string,
  pattern: string,
  interval: number,
): Promise<void> => {
  const ref = doc(db, "users", userId, "recurrences", recurrenceId);
  const nextExec = calculateNextExecutionDate(new Date(), pattern, interval);
  await updateDoc(ref, {
    status: "active",
    nextDate: toDateInputValue(nextExec),
    updatedAt: serverTimestamp(),
  });
};

export const deleteRecurrence = async (
  userId: string,
  recurrenceId: string,
): Promise<void> => {
  const ref = doc(db, "users", userId, "recurrences", recurrenceId);
  await deleteDoc(ref);
};

export const updateRecurrence = async (
  userId: string,
  recurrenceId: string,
  data: RecurrenceUpdate,
): Promise<void> => {
  const ref = doc(db, "users", userId, "recurrences", recurrenceId);
  await updateDoc(ref, {
    ...(data as Record<string, unknown>),
    updatedAt: serverTimestamp(),
  });
};

export const subscribeToRecurrences = (
  userId: string,
  callback: (recurrences: Recurrence[]) => void,
): (() => void) => {
  const q = query(colRef(userId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const recurrences = snap.docs.map((d) => toRecurrence(d.id, d.data()));
    callback(recurrences);
  });
};
