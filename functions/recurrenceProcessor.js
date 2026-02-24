const { onSchedule } = require("firebase-functions/v2/scheduler");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { initializeApp } = require("firebase-admin/app");

initializeApp();
const db = getFirestore();

/**
 * Calculate the next execution date given a pattern + interval.
 */
function advanceDate(dateStr, pattern, interval) {
  const d = new Date(dateStr + "T00:00:00Z");
  switch (pattern) {
    case "Weekly":
      d.setUTCDate(d.getUTCDate() + 7 * interval);
      break;
    case "Monthly":
      d.setUTCMonth(d.getUTCMonth() + interval);
      break;
    case "Yearly":
      d.setUTCFullYear(d.getUTCFullYear() + interval);
      break;
    case "Custom":
      d.setUTCDate(d.getUTCDate() + interval);
      break;
    default:
      d.setUTCMonth(d.getUTCMonth() + interval);
  }
  return d.toISOString().slice(0, 10);
}

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
      const rec = recDoc.data();
      try {
        // 1. Create a transaction
        await db
          .collection("users")
          .doc(userId)
          .collection("transactions")
          .add({
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

        // 2. Advance nextExecutionDate
        const nextDate = advanceDate(
          rec.nextExecutionDate,
          rec.pattern,
          rec.interval || 1,
        );

        // 3. If endDate exists and nextDate exceeds it, deactivate
        if (rec.endDate && nextDate > rec.endDate) {
          await recDoc.ref.update({
            isActive: false,
            updatedAt: FieldValue.serverTimestamp(),
          });
          console.log(
            `Recurrence ${recDoc.id} for user ${userId} ended (past endDate).`,
          );
        } else {
          await recDoc.ref.update({
            nextExecutionDate: nextDate,
            updatedAt: FieldValue.serverTimestamp(),
          });
          console.log(
            `Processed recurrence ${recDoc.id} for user ${userId}. Next: ${nextDate}`,
          );
        }
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
