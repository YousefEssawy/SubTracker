import { toRecurrence } from "../mappers";
import type { DocumentData } from "firebase/firestore";

describe("toRecurrence", () => {
  it("maps a canonical document with isLegacySchema === false and unchanged fields", () => {
    const canonicalDoc: DocumentData = {
      spaceId: "space-123",
      categoryId: "cat-456",
      type: "Expense",
      amount: 49.99,
      currency: "USD",
      pattern: "monthly",
      interval: 1,
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      nextDate: "2025-03-01",
      status: "active",
      createdAt: "2025-01-01T12:00:00.000Z",
    };

    const result = toRecurrence("rec-1", canonicalDoc);

    expect(result.id).toBe("rec-1");
    expect(result.spaceId).toBe("space-123");
    expect(result.categoryId).toBe("cat-456");
    expect(result.type).toBe("Expense");
    expect(result.amount).toBe(49.99);
    expect(result.currency).toBe("USD");
    expect(result.pattern).toBe("monthly");
    expect(result.interval).toBe(1);
    expect(result.startDate).toBe("2025-01-01");
    expect(result.endDate).toBe("2025-12-31");
    expect(result.nextDate).toBe("2025-03-01");
    expect(result.status).toBe("active");
    expect(result.createdAt).toBe("2025-01-01T12:00:00.000Z");
    expect(result.isLegacySchema).toBe(false);
  });

  it("maps a stored 'completed' status to 'completed' with isLegacySchema === false", () => {
    const completedDoc: DocumentData = {
      spaceId: "space-123",
      categoryId: "cat-456",
      type: "Expense",
      amount: 30,
      currency: "USD",
      pattern: "monthly",
      interval: 1,
      startDate: "2025-01-01",
      endDate: "2025-02-15",
      nextDate: "2025-02-01",
      status: "completed",
      createdAt: "2025-01-01T12:00:00.000Z",
    };

    const result = toRecurrence("rec-completed", completedDoc);

    expect(result.id).toBe("rec-completed");
    expect(result.status).toBe("completed");
    expect(result.nextDate).toBe("2025-02-01");
    expect(result.endDate).toBe("2025-02-15");
    expect(result.isLegacySchema).toBe(false);
  });

  it("normalises a legacy active document with isLegacySchema === true", () => {
    const legacyActiveDoc: DocumentData = {
      spaceId: "space-789",
      categoryId: "cat-101",
      type: "Income",
      amount: 1200,
      currency: "EUR",
      isActive: true,
      nextExecutionDate: "2025-03-01",
      pattern: "Monthly",
      interval: 2,
      startDate: "2025-01-01",
      endDate: null,
      createdAt: "2025-01-01T00:00:00.000Z",
    };

    const result = toRecurrence("rec-2", legacyActiveDoc);

    expect(result.id).toBe("rec-2");
    expect(result.status).toBe("active");
    expect(result.nextDate).toBe("2025-03-01");
    expect(result.pattern).toBe("monthly");
    expect(result.isLegacySchema).toBe(true);
    expect(result.interval).toBe(2);
  });

  it("normalises a legacy paused document with status: 'paused'", () => {
    const legacyPausedDoc: DocumentData = {
      spaceId: "space-1",
      categoryId: "cat-1",
      type: "Expense",
      amount: 25,
      currency: "USD",
      isActive: false,
      nextExecutionDate: "2025-04-15",
      pattern: "Weekly",
      interval: 1,
      startDate: "2025-01-01",
    };

    const result = toRecurrence("rec-3", legacyPausedDoc);

    expect(result.status).toBe("paused");
    expect(result.nextDate).toBe("2025-04-15");
    expect(result.pattern).toBe("weekly");
    expect(result.isLegacySchema).toBe(true);
  });

  it("maps a legacy document with isActive: false to 'paused' and never to 'completed'", () => {
    const legacyPausedWithEndDate: DocumentData = {
      spaceId: "space-1",
      categoryId: "cat-1",
      type: "Expense",
      amount: 25,
      currency: "USD",
      isActive: false,
      nextExecutionDate: "2025-04-15",
      pattern: "Weekly",
      interval: 1,
      startDate: "2025-01-01",
      endDate: "2025-02-01",
    };

    const result = toRecurrence(
      "rec-legacy-paused-never-completed",
      legacyPausedWithEndDate,
    );

    expect(result.status).toBe("paused");
    expect(result.status).not.toBe("completed");
    expect(result.isLegacySchema).toBe(true);
  });

  it("does not throw on an empty document and flags isLegacySchema === true", () => {
    expect(() => {
      const result = toRecurrence("rec-empty", {});
      expect(result.id).toBe("rec-empty");
      expect(result.status).toBe("active");
      expect(result.pattern).toBe("monthly");
      expect(result.interval).toBe(1);
      expect(result.nextDate).toBe("");
      expect(result.isLegacySchema).toBe(true);
    }).not.toThrow();
  });

  it("treats a hybrid document carrying both schemas as canonical", () => {
    const hybridDoc: DocumentData = {
      spaceId: "space-hybrid",
      categoryId: "cat-hybrid",
      type: "Expense",
      amount: 99,
      currency: "EGP",
      isActive: false,
      nextExecutionDate: "2025-01-01",
      status: "active",
      nextDate: "2025-05-01",
      pattern: "yearly",
      interval: 1,
      startDate: "2025-01-01",
      endDate: null,
      createdAt: "2025-01-01T00:00:00.000Z",
    };

    const result = toRecurrence("rec-hybrid", hybridDoc);

    expect(result.id).toBe("rec-hybrid");
    expect(result.status).toBe("active");
    expect(result.nextDate).toBe("2025-05-01");
    expect(result.pattern).toBe("yearly");
    expect(result.isLegacySchema).toBe(false);
  });

  it("maps backlogTruncated when present on a paused document", () => {
    const truncatedDoc: DocumentData = {
      spaceId: "space-123",
      categoryId: "cat-456",
      type: "Expense",
      amount: 50,
      currency: "USD",
      pattern: "daily",
      interval: 1,
      startDate: "2024-01-01",
      endDate: null,
      nextDate: "2025-05-15",
      status: "paused",
      backlogTruncated: true,
      createdAt: "2024-01-01T00:00:00.000Z",
    };

    const result = toRecurrence("rec-truncated", truncatedDoc);

    expect(result.id).toBe("rec-truncated");
    expect(result.status).toBe("paused");
    expect(result.backlogTruncated).toBe(true);
    expect(result.isLegacySchema).toBe(false);
  });

  it("leaves backlogTruncated undefined when omitted", () => {
    const normalDoc: DocumentData = {
      spaceId: "space-123",
      categoryId: "cat-456",
      type: "Expense",
      amount: 50,
      currency: "USD",
      pattern: "daily",
      interval: 1,
      startDate: "2024-01-01",
      endDate: null,
      nextDate: "2025-05-15",
      status: "active",
      createdAt: "2024-01-01T00:00:00.000Z",
    };

    const result = toRecurrence("rec-normal", normalDoc);

    expect(result.backlogTruncated).toBeUndefined();
  });
});
