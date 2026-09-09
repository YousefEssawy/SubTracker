import {
  setupTestEnvironment,
  teardownTestEnvironment,
  clearAllData,
  authedAs,
  unauthed,
  assertSucceeds,
  assertFails,
} from "./setup";

describe("Firestore security rules — ownership isolation", () => {
  beforeAll(async () => {
    await setupTestEnvironment();
  });

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  beforeEach(async () => {
    await clearAllData();
  });

  const transactionData = {
    amount: 199.99,
    currency: "EGP",
    category: "Subscriptions",
    description: "Cloud Server",
    transactionDate: "2026-03-01",
    type: "expense",
    createdAt: "2026-03-01T10:00:00.000Z",
  };

  it("allows the owner to write and read their own transaction document", async () => {
    const alice = authedAs("alice");
    const aliceDoc = alice.firestore().doc("users/alice/transactions/tx_1");

    await assertSucceeds(aliceDoc.set(transactionData));
    const snapshot = await assertSucceeds(aliceDoc.get());

    expect(snapshot.exists).toBe(true);
    expect(snapshot.data()?.amount).toBe(199.99);
    expect(snapshot.data()?.currency).toBe("EGP");
  });

  it("denies a different authenticated user from reading or writing owner transaction document", async () => {
    const alice = authedAs("alice");
    const bob = authedAs("bob");

    const aliceDoc = alice.firestore().doc("users/alice/transactions/tx_1");
    const bobAccessingAliceDoc = bob
      .firestore()
      .doc("users/alice/transactions/tx_1");

    // Alice seeds her own document
    await assertSucceeds(aliceDoc.set(transactionData));

    // Bob cannot read Alice's document
    await assertFails(bobAccessingAliceDoc.get());

    // Bob cannot write or overwrite Alice's document
    await assertFails(
      bobAccessingAliceDoc.set({
        ...transactionData,
        amount: 500,
      })
    );
  });

  it("denies an unauthenticated caller from reading or writing transaction document", async () => {
    const alice = authedAs("alice");
    const unauthenticatedUser = unauthed();

    const aliceDoc = alice.firestore().doc("users/alice/transactions/tx_1");
    const unauthedAccessingAliceDoc = unauthenticatedUser
      .firestore()
      .doc("users/alice/transactions/tx_1");

    // Alice seeds her own document
    await assertSucceeds(aliceDoc.set(transactionData));

    // Unauthenticated caller cannot read Alice's document
    await assertFails(unauthedAccessingAliceDoc.get());

    // Unauthenticated caller cannot write to Alice's document
    await assertFails(
      unauthedAccessingAliceDoc.set({
        ...transactionData,
        amount: 500,
      })
    );
  });
});
