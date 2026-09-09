import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  runTransaction,
  deleteField,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  Recurrence,
  RecurrenceInput,
  RecurrencePattern,
  RecurrenceUpdate,
} from "@/models/recurrence";
import { toRecurrence } from "@/models/mappers";
import { advanceDate } from "../../functions/shared/recurrenceDates.js";

// Shared document builder lives in functions/ so firebase-tools includes it in the deploy archive.
// A frontend import reaching into functions/ avoids build steps and duplicated code.
import { buildRecurrenceDocument } from "../../functions/shared/recurrenceDocument.js";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Bounds the advance loop to prevent infinite spins on corrupted or ancient data.
// Matches the rationale of the Cloud Function processor's backlog cap.
const MAX_ADVANCE_ITERATIONS = 500;

const colRef = (userId: string) =>
  collection(db, "users", userId, "recurrences");

const getCanonicalRecurrenceUpdates = (
  id: string,
  raw: Record<string, unknown>,
  overrides: Partial<Recurrence> = {},
): Record<string, unknown> => {
  const normalized = toRecurrence(id, raw);
  const updates: Record<string, unknown> = {
    spaceId: overrides.spaceId ?? normalized.spaceId,
    categoryId: overrides.categoryId ?? normalized.categoryId,
    type: overrides.type ?? normalized.type,
    amount:
      overrides.amount !== undefined
        ? Math.round(overrides.amount * 100) / 100
        : normalized.amount,
    currency: overrides.currency ?? normalized.currency,
    pattern: overrides.pattern ?? normalized.pattern,
    interval: overrides.interval ?? normalized.interval,
    startDate: overrides.startDate ?? normalized.startDate,
    endDate:
      overrides.endDate !== undefined ? overrides.endDate : normalized.endDate,
    nextDate: overrides.nextDate ?? normalized.nextDate,
    status: overrides.status ?? normalized.status,
    updatedAt: serverTimestamp(),
  };
  if ("isActive" in raw || raw["isActive"] !== undefined) {
    updates["isActive"] = deleteField();
  }
  if ("nextExecutionDate" in raw || raw["nextExecutionDate"] !== undefined) {
    updates["nextExecutionDate"] = deleteField();
  }
  return updates;
};

export { buildRecurrenceDocument };

export const addRecurrence = async (
  userId: string,
  data: RecurrenceInput,
): Promise<Recurrence> => {
  const docData = {
    ...buildRecurrenceDocument(data),
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
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) {
      throw new Error("Recurrence not found");
    }
    const raw = snap.data();
    const updates = getCanonicalRecurrenceUpdates(snap.id, raw, {
      status: "paused",
    });
    tx.update(ref, updates);
  });
};

export const reactivateRecurrence = async (
  userId: string,
  recurrenceId: string,
  pattern: string,
  interval: number,
): Promise<void> => {
  const ref = doc(db, "users", userId, "recurrences", recurrenceId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) {
      throw new Error("Recurrence not found");
    }
    const raw = snap.data();
    const normalized = toRecurrence(snap.id, raw);
    if (normalized.status === "completed") {
      throw new Error("Cannot reactivate a completed recurrence");
    }

    const anchor = normalized.nextDate;
    if (typeof anchor !== "string" || !DATE_REGEX.test(anchor)) {
      throw new Error(
        `Cannot reactivate recurrence: invalid or missing anchor date "${anchor}". Expected YYYY-MM-DD.`,
      );
    }
    const parsedAnchor = new Date(anchor + "T00:00:00Z");
    if (
      Number.isNaN(parsedAnchor.getTime()) ||
      parsedAnchor.toISOString().slice(0, 10) !== anchor
    ) {
      throw new Error(
        `Cannot reactivate recurrence: invalid anchor date "${anchor}". Expected YYYY-MM-DD.`,
      );
    }

    const effectivePattern = (
      pattern || normalized.pattern
    ).toLowerCase() as RecurrencePattern;
    const effectiveInterval = interval || normalized.interval;

    const today = new Date().toISOString().slice(0, 10);
    let cursor = anchor;
    let iterations = 0;

    // Skipped periods elapsed while paused are deliberately not back-filled or billed.
    // Advancing past them until strictly in the future preserves the recurrence's own period day.
    while (cursor <= today) {
      if (iterations >= MAX_ADVANCE_ITERATIONS) {
        throw new Error(
          `Cannot reactivate recurrence: anchor is too far in the past (exceeded ${MAX_ADVANCE_ITERATIONS} iterations).`,
        );
      }
      cursor = advanceDate(cursor, effectivePattern, effectiveInterval);
      iterations++;
    }

    const nextDate = cursor;
    const updates = getCanonicalRecurrenceUpdates(snap.id, raw, {
      status: "active",
      nextDate,
      pattern: effectivePattern,
      interval: effectiveInterval,
    });
    tx.update(ref, updates);
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
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) {
      throw new Error("Recurrence not found");
    }
    const raw = snap.data();
    const updates = getCanonicalRecurrenceUpdates(snap.id, raw, data);
    tx.update(ref, updates);
  });
};

export const subscribeToRecurrences = (
  userId: string,
  callback: (recurrences: Recurrence[]) => void,
  onError?: (error: Error) => void,
): (() => void) => {
  const q = query(colRef(userId), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const recurrences = snap.docs.map((d) => toRecurrence(d.id, d.data()));
      callback(recurrences);
    },
    onError,
  );
};
