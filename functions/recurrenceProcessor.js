import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";
import { advanceDate } from "./shared/recurrenceDates.js";

if (!getApps().length) {
  initializeApp();
}
const db = getFirestore();

// Firestore transactions permit at most 500 writes.
// Emitting 499 transactions (499 tx.set calls) plus 1 final tx.update (+1)
// on the recurrence document equals 500 writes, fitting exactly within
// the 500-write limit. 500 occurrences would require 501 writes and fail.
const MAX_BACKLOG_WRITES = 499;

/**
 * Core processing logic for due recurrences.
 * Queries active recurrences with nextDate <= today across all users via collection group,
 * creates transactions for each elapsed period up to the backlog cap,
 * and advances nextDate (or pauses if backlog exceeds cap, or completes if past endDate).
 *
 * @param {import("firebase-admin/firestore").Firestore} [firestore=db]
 * @param {string} [today=new Date().toISOString().slice(0, 10)]
 */
async function processDueRecurrences(
  firestore = db,
  today = new Date().toISOString().slice(0, 10),
) {
  const targetDb = firestore || db;
  const targetToday = today || new Date().toISOString().slice(0, 10);

  const recSnap = await targetDb
    .collectionGroup("recurrences")
    .where("status", "==", "active")
    .where("nextDate", "<=", targetToday)
    .get();

  for (const recDoc of recSnap.docs) {
    const userId = recDoc.ref.parent?.parent?.id;
    if (!userId) {
      console.error(
        `Error processing recurrence ${recDoc.id}: could not derive owning user id.`,
      );
      continue;
    }

    try {
      await targetDb.runTransaction(async (tx) => {
        // Re-read inside the transaction so a concurrent run that already
        // processed this recurrence is detected instead of duplicating it.
        const freshSnap = await tx.get(recDoc.ref);
        if (!freshSnap.exists) return;
        const rec = freshSnap.data();
        if (!rec || rec.status !== "active" || rec.nextDate > targetToday) return;

        // If nextDate is already beyond endDate, complete immediately without generating transactions.
        if (rec.endDate && rec.nextDate > rec.endDate) {
          tx.update(recDoc.ref, {
            status: "completed",
            updatedAt: FieldValue.serverTimestamp(),
          });
          return;
        }

        const interval = typeof rec.interval === "number" ? rec.interval : 1;
        let cursor = rec.nextDate;
        let count = 0;
        let isTruncated = false;
        let isCompleted = false;

        while (cursor <= targetToday) {
          if (count >= MAX_BACKLOG_WRITES) {
            isTruncated = true;
            console.error(
              `Backlog cap reached for recurrence ${recDoc.id} for user ${userId}. Halting generation.`,
            );
            break;
          }

          const txnRef = targetDb
            .collection("users")
            .doc(userId)
            .collection("transactions")
            .doc();

          tx.set(txnRef, {
            type: rec.type,
            spaceId: rec.spaceId,
            categoryId: rec.categoryId,
            amount: rec.amount,
            currency: rec.currency,
            transactionDate: cursor,
            recurrenceId: recDoc.id,
            notes: null,
            tags: [],
            attachmentUrl: null,
            attachmentMeta: null,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });

          count++;

          const nextDate = advanceDate(cursor, rec.pattern, interval);
          if (rec.endDate && nextDate > rec.endDate) {
            isCompleted = true;
            cursor = nextDate;
            break;
          }

          cursor = nextDate;
        }

        if (isTruncated) {
          tx.update(recDoc.ref, {
            nextDate: cursor,
            status: "paused",
            backlogTruncated: true,
            updatedAt: FieldValue.serverTimestamp(),
          });
        } else if (isCompleted) {
          tx.update(recDoc.ref, {
            status: "completed",
            updatedAt: FieldValue.serverTimestamp(),
          });
        } else {
          tx.update(recDoc.ref, {
            nextDate: cursor,
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      });
      console.log(`Processed recurrence ${recDoc.id} for user ${userId}.`);
    } catch (err) {
      console.error(
        `Error processing recurrence ${recDoc.id} for user ${userId}:`,
        err,
      );
    }
  }

  console.log("Daily recurrence processing complete.");
}

/**
 * Scheduled function — runs daily at midnight UTC.
 * Finds active recurrences whose nextDate <= today,
 * creates a transaction for each, and advances the date.
 */
const processRecurrences = onSchedule("every day 00:00", async () => {
  await processDueRecurrences(db);
});

export { processRecurrences, processDueRecurrences, db };
