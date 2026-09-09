import { reactivateRecurrence } from "../recurrenceService";

const mockTx = {
  get: vi.fn(),
  update: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn((_db, ...parts) => ({
    id: parts[parts.length - 1],
    path: parts.join("/"),
  })),
  onSnapshot: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(() => "SERVER_TIMESTAMP"),
  runTransaction: vi.fn(async (_db, callback) => callback(mockTx)),
  deleteField: vi.fn(() => "DELETE_FIELD"),
  getFirestore: vi.fn(() => ({})),
}));

vi.mock("../firebase", () => ({
  db: {},
}));

const makeDocSnapshot = (
  id: string,
  data: Record<string, unknown> | undefined,
  exists = true,
) => ({
  id,
  exists: () => exists,
  data: () => data,
});

describe("reactivateRecurrence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resumes on the 1st of a future month when paused and resumed mid-month with anchor on the 1st", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-17T12:00:00.000Z"));

    const storedDoc = {
      spaceId: "space-main",
      categoryId: "cat-rent",
      type: "Expense",
      amount: 1200,
      currency: "USD",
      pattern: "monthly",
      interval: 1,
      startDate: "2026-01-01",
      endDate: null,
      nextDate: "2026-01-01",
      status: "paused",
    };

    mockTx.get.mockResolvedValueOnce(makeDocSnapshot("rec-rent", storedDoc));

    await reactivateRecurrence("user-1", "rec-rent", "monthly", 1);

    expect(mockTx.update).toHaveBeenCalledTimes(1);
    const updates = mockTx.update.mock.calls[0][1];
    expect(updates.status).toBe("active");
    expect(updates.nextDate).toBe("2026-04-01");
    expect(updates.pattern).toBe("monthly");
    expect(updates.interval).toBe(1);
  });

  it("guarantees the resulting date is strictly in the future even when resumed on the anchor day itself", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-01T08:00:00.000Z"));

    const storedDoc = {
      spaceId: "space-1",
      categoryId: "cat-1",
      type: "Expense",
      amount: 50,
      currency: "USD",
      pattern: "monthly",
      interval: 1,
      startDate: "2026-02-01",
      nextDate: "2026-03-01",
      status: "paused",
    };

    mockTx.get.mockResolvedValueOnce(makeDocSnapshot("rec-today", storedDoc));

    await reactivateRecurrence("user-1", "rec-today", "monthly", 1);

    const updates = mockTx.update.mock.calls[0][1];
    expect(updates.nextDate > "2026-03-01").toBe(true);
    expect(updates.nextDate).toBe("2026-04-01");
  });

  it("guarantees the resulting date is strictly in the future for a daily recurrence", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-17T12:00:00.000Z"));

    const storedDoc = {
      spaceId: "space-1",
      categoryId: "cat-1",
      type: "Expense",
      amount: 10,
      currency: "USD",
      pattern: "daily",
      interval: 1,
      startDate: "2026-03-01",
      nextDate: "2026-03-10",
      status: "paused",
    };

    mockTx.get.mockResolvedValueOnce(makeDocSnapshot("rec-daily", storedDoc));

    await reactivateRecurrence("user-1", "rec-daily", "daily", 1);

    const updates = mockTx.update.mock.calls[0][1];
    expect(updates.nextDate > "2026-03-17").toBe(true);
    expect(updates.nextDate).toBe("2026-03-18");
  });

  it("produces no Transactions and no back-fill writes across elapsed periods — only the single recurrence update", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-17T12:00:00.000Z"));

    const storedDoc = {
      spaceId: "space-1",
      categoryId: "cat-1",
      type: "Expense",
      amount: 100,
      currency: "USD",
      pattern: "monthly",
      interval: 1,
      startDate: "2025-09-01",
      nextDate: "2025-10-01",
      status: "paused",
    };

    mockTx.get.mockResolvedValueOnce(makeDocSnapshot("rec-multi-elapsed", storedDoc));

    await reactivateRecurrence("user-1", "rec-multi-elapsed", "monthly", 1);

    expect(mockTx.set).not.toHaveBeenCalled();
    expect(mockTx.delete).not.toHaveBeenCalled();
    expect(mockTx.update).toHaveBeenCalledTimes(1);

    const updates = mockTx.update.mock.calls[0][1];
    expect(updates.status).toBe("active");
    expect(updates.nextDate).toBe("2026-04-01");
  });

  it("refuses to reactivate a completed Recurrence", async () => {
    const storedDoc = {
      spaceId: "space-1",
      categoryId: "cat-1",
      type: "Expense",
      amount: 100,
      currency: "USD",
      pattern: "monthly",
      interval: 1,
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      nextDate: "2025-12-01",
      status: "completed",
    };

    mockTx.get.mockResolvedValueOnce(makeDocSnapshot("rec-comp", storedDoc));

    await expect(
      reactivateRecurrence("user-1", "rec-comp", "monthly", 1),
    ).rejects.toThrow("Cannot reactivate a completed recurrence");

    expect(mockTx.update).not.toHaveBeenCalled();
  });

  it("refuses an empty anchor date rather than writing a bad date", async () => {
    const storedDoc = {
      spaceId: "space-1",
      categoryId: "cat-1",
      type: "Expense",
      amount: 50,
      currency: "USD",
      pattern: "monthly",
      interval: 1,
      status: "paused",
      nextDate: "",
    };

    mockTx.get.mockResolvedValueOnce(makeDocSnapshot("rec-empty-anchor", storedDoc));

    await expect(
      reactivateRecurrence("user-1", "rec-empty-anchor", "monthly", 1),
    ).rejects.toThrow(/invalid or missing anchor date/i);

    expect(mockTx.update).not.toHaveBeenCalled();
  });

  it("refuses a malformed anchor date format rather than writing a bad date", async () => {
    const storedDoc = {
      spaceId: "space-1",
      categoryId: "cat-1",
      type: "Expense",
      amount: 50,
      currency: "USD",
      pattern: "monthly",
      interval: 1,
      status: "paused",
      nextDate: "not-a-date",
    };

    mockTx.get.mockResolvedValueOnce(makeDocSnapshot("rec-bad-anchor", storedDoc));

    await expect(
      reactivateRecurrence("user-1", "rec-bad-anchor", "monthly", 1),
    ).rejects.toThrow(/invalid or missing anchor date/i);

    expect(mockTx.update).not.toHaveBeenCalled();
  });

  it("refuses an invalid calendar anchor date (e.g. Feb 31) rather than writing a bad date", async () => {
    const storedDoc = {
      spaceId: "space-1",
      categoryId: "cat-1",
      type: "Expense",
      amount: 50,
      currency: "USD",
      pattern: "monthly",
      interval: 1,
      status: "paused",
      nextDate: "2026-02-31",
    };

    mockTx.get.mockResolvedValueOnce(makeDocSnapshot("rec-invalid-calendar", storedDoc));

    await expect(
      reactivateRecurrence("user-1", "rec-invalid-calendar", "monthly", 1),
    ).rejects.toThrow(/invalid anchor date/i);

    expect(mockTx.update).not.toHaveBeenCalled();
  });

  it("resolves its anchor from nextExecutionDate on a legacy-shaped document and canonicalises fields", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-17T12:00:00.000Z"));

    const legacyDoc = {
      spaceId: "space-legacy",
      categoryId: "cat-legacy",
      type: "Expense",
      amount: 85,
      currency: "EUR",
      isActive: false,
      nextExecutionDate: "2026-01-01",
      pattern: "Monthly",
      interval: 1,
      startDate: "2025-12-01",
      createdAt: "2025-12-01T00:00:00.000Z",
    };

    mockTx.get.mockResolvedValueOnce(makeDocSnapshot("rec-legacy", legacyDoc));

    await reactivateRecurrence("user-1", "rec-legacy", "monthly", 1);

    expect(mockTx.update).toHaveBeenCalledTimes(1);
    const updates = mockTx.update.mock.calls[0][1];
    expect(updates.status).toBe("active");
    expect(updates.nextDate).toBe("2026-04-01");
    expect(updates.pattern).toBe("monthly");
    expect(updates.interval).toBe(1);
    expect(updates.isActive).toBe("DELETE_FIELD");
    expect(updates.nextExecutionDate).toBe("DELETE_FIELD");
  });

  it("bounds the advance loop and throws when iterations exceed maximum bound", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-17T12:00:00.000Z"));

    const ancientDoc = {
      spaceId: "space-1",
      categoryId: "cat-1",
      type: "Expense",
      amount: 10,
      currency: "USD",
      pattern: "daily",
      interval: 1,
      startDate: "2020-01-01",
      nextDate: "2020-01-01",
      status: "paused",
    };

    mockTx.get.mockResolvedValueOnce(makeDocSnapshot("rec-ancient", ancientDoc));

    await expect(
      reactivateRecurrence("user-1", "rec-ancient", "daily", 1),
    ).rejects.toThrow(/exceeded 500 iterations/i);

    expect(mockTx.update).not.toHaveBeenCalled();
  });

  it("throws when the recurrence document does not exist", async () => {
    mockTx.get.mockResolvedValueOnce(
      makeDocSnapshot("rec-missing", undefined, false),
    );

    await expect(
      reactivateRecurrence("user-1", "rec-missing", "monthly", 1),
    ).rejects.toThrow("Recurrence not found");

    expect(mockTx.update).not.toHaveBeenCalled();
  });

  it("preserves an anchor that is already strictly in the future", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-17T12:00:00.000Z"));

    const futureDoc = {
      spaceId: "space-1",
      categoryId: "cat-1",
      type: "Expense",
      amount: 200,
      currency: "USD",
      pattern: "monthly",
      interval: 1,
      startDate: "2026-05-01",
      nextDate: "2026-05-01",
      status: "paused",
    };

    mockTx.get.mockResolvedValueOnce(makeDocSnapshot("rec-future", futureDoc));

    await reactivateRecurrence("user-1", "rec-future", "monthly", 1);

    const updates = mockTx.update.mock.calls[0][1];
    expect(updates.nextDate).toBe("2026-05-01");
    expect(updates.status).toBe("active");
  });
});
