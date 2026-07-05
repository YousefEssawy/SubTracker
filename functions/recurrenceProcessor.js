const { onSchedule } = require("firebase-functions/v2/scheduler");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { initializeApp } = require("firebase-admin/app");
const { advanceDate } = require("./dateLogic");

initializeApp();
const db = getFirestore();

/**
 * Scheduled function — runs daily at midnight UTC.
 * Finds active recurrences whose nextExecutionDate <= today,
 * creates a transaction for each, and advances the date.
 */
const processRecurrences = onSchedule("every day 00:00", async () => {
  const today = new Date().toISOString().slice(0, 10);

  // Get all users (walk root → users collection)
  const usersSnap = await db.collection("users").listDocuments();

  for (const userDoc of usersSnap) {
    const userId = userDoc.id;
    const recSnap = await db
      .collection("users")
      .doc(userId)
      .collection("recurrences")
      .where("isActive", "==", true)
      .where("nextExecutionDate", "<=", today)
      .get();

    for (const recDoc of recSnap.docs) {
      try {
        await db.runTransaction(async (tx) => {
          // Re-read inside the transaction so a concurrent run that already
          // processed this recurrence is detected instead of duplicating it.
          const freshSnap = await tx.get(recDoc.ref);
          if (!freshSnap.exists) return;
          const rec = freshSnap.data();
          if (!rec.isActive || rec.nextExecutionDate > today) return;

          const interval = typeof rec.interval === "number" ? rec.interval : 1;
          const nextDate = advanceDate(rec.nextExecutionDate, rec.pattern, interval);

          const txnRef = db
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
            transactionDate: rec.nextExecutionDate,
            recurrenceId: recDoc.id,
            notes: null,
            tags: [],
            attachmentUrl: null,
            attachmentMeta: null,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });

          if (rec.endDate && nextDate > rec.endDate) {
            tx.update(recDoc.ref, {
              isActive: false,
              updatedAt: FieldValue.serverTimestamp(),
            });
          } else {
            tx.update(recDoc.ref, {
              nextExecutionDate: nextDate,
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
  }

  console.log("Daily recurrence processing complete.");
});

module.exports = { processRecurrences };
