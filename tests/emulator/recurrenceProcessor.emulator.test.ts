import {
  setupTestEnvironment,
  teardownTestEnvironment,
  clearAllData,
  seedDocument,
  authedAs,
  PROJECT_ID,
} from "./setup";
import { buildRecurrenceDocument } from "../../functions/shared/recurrenceDocument.js";
import {
  processDueRecurrences,
  db,
} from "../../functions/recurrenceProcessor.js";

describe("Recurrence Processor — emulator integration", () => {
  beforeAll(async () => {
    process.env.FIRESTORE_EMULATOR_HOST =
      process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
    process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || PROJECT_ID;
    await setupTestEnvironment();
  });

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  beforeEach(async () => {
    await clearAllData();
  });

  it("processes a due recurrence seeded through the writer's document builder", async () => {
    const userId = "alice";
    const recId = "rec_due_writer_shape";

    const recurrenceInput = {
      type: "Expense" as const,
      spaceId: "space_personal",
      categoryId: "cat_utilities",
      amount: 45.5,
      currency: "USD" as const,
      pattern: "monthly" as const,
      interval: 1,
      startDate: "2026-01-15",
      endDate: null,
      status: "active" as const,
    };

    const built = buildRecurrenceDocument(recurrenceInput);
    const originalNextDate = built.nextDate; // "2026-02-15"

    await seedDocument(`users/${userId}/recurrences/${recId}`, {
      ...built,
      createdAt: "2026-01-15T00:00:00.000Z",
    });

    const today = "2026-02-15";
    await processDueRecurrences(db, today);

    const alice = authedAs(userId);
    const txSnap = await alice
      .firestore()
      .collection(`users/${userId}/transactions`)
      .get();

    expect(txSnap.docs.length).toBe(1);
    const txn = txSnap.docs[0].data();

    expect(txn.transactionDate).toBe(originalNextDate);
    expect(txn.recurrenceId).toBe(recId);
    expect(txn.spaceId).toBe(recurrenceInput.spaceId);
    expect(txn.categoryId).toBe(recurrenceInput.categoryId);
    expect(txn.amount).toBe(recurrenceInput.amount);
    expect(txn.currency).toBe(recurrenceInput.currency);
    expect(txn.type).toBe(recurrenceInput.type);
    expect(txn.notes).toBeNull();
    expect(txn.tags).toEqual([]);
    expect(txn.attachmentUrl).toBeNull();
    expect(txn.attachmentMeta).toBeNull();

    // The recurrence's nextDate must advance by one monthly interval (2026-02-15 -> 2026-03-15)
    const recSnap = await alice
      .firestore()
      .doc(`users/${userId}/recurrences/${recId}`)
      .get();
    expect(recSnap.exists).toBe(true);
    expect(recSnap.data()?.nextDate).toBe("2026-03-15");
    expect(recSnap.data()?.status).toBe("active");

    // Assert user isolation: no transactions appear under another user
    const bob = authedAs("bob");
    const bobTxSnap = await bob
      .firestore()
      .collection("users/bob/transactions")
      .get();
    expect(bobTxSnap.docs.length).toBe(0);
  });

  it("does not pick up or generate transactions for legacy document schema", async () => {
    const userId = "alice";

    // Deliberately bypasses the builder because the writer is structurally
    // incapable of producing a legacy shape.
    await seedDocument(`users/${userId}/recurrences/rec_legacy`, {
      isActive: true,
      nextExecutionDate: "2026-01-01",
      pattern: "Monthly",
      interval: 1,
      type: "Expense",
      spaceId: "space_main",
      categoryId: "cat_streaming",
      amount: 19.99,
      currency: "USD",
      startDate: "2025-12-01",
      createdAt: "2025-12-01T00:00:00.000Z",
    });

    await processDueRecurrences(db, "2026-02-01");

    const alice = authedAs(userId);
    const txSnap = await alice
      .firestore()
      .collection(`users/${userId}/transactions`)
      .get();
    expect(txSnap.docs.length).toBe(0);

    const recSnap = await alice
      .firestore()
      .doc(`users/${userId}/recurrences/rec_legacy`)
      .get();
    expect(recSnap.exists).toBe(true);
    expect(recSnap.data()?.nextExecutionDate).toBe("2026-01-01");
    expect(recSnap.data()?.isActive).toBe(true);
  });

  it("does not process a recurrence whose nextDate is in the future", async () => {
    const userId = "alice";
    const recurrenceInput = {
      type: "Expense" as const,
      spaceId: "space_personal",
      categoryId: "cat_utilities",
      amount: 100,
      currency: "USD" as const,
      pattern: "monthly" as const,
      interval: 1,
      startDate: "2026-02-01",
      endDate: null,
      status: "active" as const,
    };

    const built = buildRecurrenceDocument(recurrenceInput);
    // built.nextDate will be "2026-03-01"
    await seedDocument(`users/${userId}/recurrences/rec_future`, {
      ...built,
      createdAt: "2026-02-01T00:00:00.000Z",
    });

    // Run processor with today earlier than nextDate
    await processDueRecurrences(db, "2026-02-15");

    const alice = authedAs(userId);
    const txSnap = await alice
      .firestore()
      .collection(`users/${userId}/transactions`)
      .get();
    expect(txSnap.docs.length).toBe(0);

    const recSnap = await alice
      .firestore()
      .doc(`users/${userId}/recurrences/rec_future`)
      .get();
    expect(recSnap.data()?.nextDate).toBe(built.nextDate);
    expect(recSnap.data()?.status).toBe("active");
  });

  it("does not generate transactions for a paused recurrence even if nextDate is past-due", async () => {
    const userId = "alice";
    const recurrenceInput = {
      type: "Expense" as const,
      spaceId: "space_personal",
      categoryId: "cat_utilities",
      amount: 75,
      currency: "USD" as const,
      pattern: "monthly" as const,
      interval: 1,
      startDate: "2026-01-01",
      endDate: null,
      status: "paused" as const,
    };

    const built = buildRecurrenceDocument(recurrenceInput);
    // built.nextDate is "2026-02-01", status is "paused"
    await seedDocument(`users/${userId}/recurrences/rec_paused`, {
      ...built,
      createdAt: "2026-01-01T00:00:00.000Z",
    });

    await processDueRecurrences(db, "2026-02-15");

    const alice = authedAs(userId);
    const txSnap = await alice
      .firestore()
      .collection(`users/${userId}/transactions`)
      .get();
    expect(txSnap.docs.length).toBe(0);

    const recSnap = await alice
      .firestore()
      .doc(`users/${userId}/recurrences/rec_paused`)
      .get();
    expect(recSnap.data()?.nextDate).toBe(built.nextDate);
    expect(recSnap.data()?.status).toBe("paused");
  });

  it("produces exactly one transaction when run twice over the same data (re-read guard)", async () => {
    const userId = "alice";
    const recurrenceInput = {
      type: "Expense" as const,
      spaceId: "space_personal",
      categoryId: "cat_utilities",
      amount: 120,
      currency: "USD" as const,
      pattern: "weekly" as const,
      interval: 1,
      startDate: "2026-02-01",
      endDate: null,
      status: "active" as const,
    };

    const built = buildRecurrenceDocument(recurrenceInput);
    // built.nextDate is "2026-02-08"
    await seedDocument(`users/${userId}/recurrences/rec_idempotent`, {
      ...built,
      createdAt: "2026-02-01T00:00:00.000Z",
    });

    const today = "2026-02-08";
    // First execution
    await processDueRecurrences(db, today);

    // Second execution with identical date
    await processDueRecurrences(db, today);

    const alice = authedAs(userId);
    const txSnap = await alice
      .firestore()
      .collection(`users/${userId}/transactions`)
      .get();
    expect(txSnap.docs.length).toBe(1);

    const recSnap = await alice
      .firestore()
      .doc(`users/${userId}/recurrences/rec_idempotent`)
      .get();
    // Advanced exactly once to "2026-02-15"
    expect(recSnap.data()?.nextDate).toBe("2026-02-15");
  });

  it("pauses the recurrence when the advanced date exceeds endDate", async () => {
    const userId = "alice";
    const recurrenceInput = {
      type: "Expense" as const,
      spaceId: "space_personal",
      categoryId: "cat_utilities",
      amount: 30,
      currency: "USD" as const,
      pattern: "monthly" as const,
      interval: 1,
      startDate: "2026-01-01",
      endDate: "2026-02-15", // Next occurrence on 2026-02-01 is within endDate, but next after (2026-03-01) exceeds it
      status: "active" as const,
    };

    const built = buildRecurrenceDocument(recurrenceInput);
    // built.nextDate is "2026-02-01"
    await seedDocument(`users/${userId}/recurrences/rec_end_date`, {
      ...built,
      createdAt: "2026-01-01T00:00:00.000Z",
    });

    await processDueRecurrences(db, "2026-02-01");

    const alice = authedAs(userId);
    const txSnap = await alice
      .firestore()
      .collection(`users/${userId}/transactions`)
      .get();
    expect(txSnap.docs.length).toBe(1);
    expect(txSnap.docs[0].data().transactionDate).toBe("2026-02-01");

    const recSnap = await alice
      .firestore()
      .doc(`users/${userId}/recurrences/rec_end_date`)
      .get();
    expect(recSnap.data()?.status).toBe("paused");
  });
});
