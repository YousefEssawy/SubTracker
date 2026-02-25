import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  query,
  orderBy,
  onSnapshot,
  where,
  limit,
  getDocs,
  startAfter,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";
import { CURRENCIES } from "@/utils/currencies";
import type {
  Transaction,
  TransactionInput,
  TransactionUpdate,
} from "@/models/transaction";
import type { TransactionFilters } from "@/utils/balanceUtils";
import { toTransaction } from "@/models/mappers";

const getTxCollection = (userId: string) =>
  collection(db, "users", userId, "transactions");

// ── Validation ────────────────────────────────────────────────────────────────

const validateTxData = (data: TransactionInput): string[] => {
  const errors: string[] = [];
  if (!data.amount || data.amount <= 0) errors.push("Amount must be > 0.");
  if (data.amount > 999_999_999.99)
    errors.push("Amount cannot exceed 999,999,999.99.");
  if (!data.spaceId) errors.push("Space is required.");
  if (!data.categoryId) errors.push("Category is required.");
  if (!["Income", "Expense"].includes(data.type))
    errors.push("Type must be Income or Expense.");
  if (!data.currency || !CURRENCIES.find((c) => c.code === data.currency))
    errors.push("A valid currency is required.");
  if (
    !data.transactionDate ||
    !/^\d{4}-\d{2}-\d{2}$/.test(data.transactionDate)
  )
    errors.push("Transaction date must be in YYYY-MM-DD format.");
  return errors;
};

// ── Internal helpers ──────────────────────────────────────────────────────────

const buildQuery = (userId: string, filters: TransactionFilters = {}) => {
  const ref = getTxCollection(userId);
  const constraints = [];

  if (filters.spaceId)
    constraints.push(where("spaceId", "==", filters.spaceId));
  if (filters.type) constraints.push(where("type", "==", filters.type));
  if (filters.currency)
    constraints.push(where("currency", "==", filters.currency));
  if (filters.tag)
    constraints.push(
      where("tags", "array-contains", filters.tag.toLowerCase().trim()),
    );
  if (filters.dateRange?.start)
    constraints.push(where("transactionDate", ">=", filters.dateRange.start));
  if (filters.dateRange?.end)
    constraints.push(where("transactionDate", "<=", filters.dateRange.end));

  constraints.push(orderBy("transactionDate", "desc"));
  return query(ref, ...constraints);
};

// ── Exported service functions ────────────────────────────────────────────────

export const addTransaction = async (
  userId: string,
  data: TransactionInput,
): Promise<Transaction> => {
  const errors = validateTxData(data);
  if (errors.length) throw new Error(errors.join(" "));

  const amount = Math.round(data.amount * 100) / 100;
  const now = new Date().toISOString();

  const docRef = await addDoc(getTxCollection(userId), {
    spaceId: data.spaceId,
    categoryId: data.categoryId,
    type: data.type,
    amount,
    currency: data.currency,
    transactionDate: data.transactionDate,
    notes: data.notes?.trim() ?? null,
    tags: Array.isArray(data.tags)
      ? data.tags.map((t) => t.toLowerCase().trim()).filter(Boolean)
      : [],
    attachmentUrl: data.attachmentUrl ?? null,
    attachmentMeta: data.attachmentMeta ?? null,
    recurrenceId: data.recurrenceId ?? null,
    createdAt: now,
    updatedAt: now,
  });

  return toTransaction(docRef.id, {
    ...data,
    amount,
    createdAt: now,
    updatedAt: now,
  });
};

export const updateTransaction = async (
  userId: string,
  transactionId: string,
  data: TransactionUpdate,
): Promise<void> => {
  const docRef = doc(db, "users", userId, "transactions", transactionId);
  const updateData: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (data.spaceId !== undefined) updateData["spaceId"] = data.spaceId;
  if (data.categoryId !== undefined) updateData["categoryId"] = data.categoryId;
  if (data.type !== undefined) updateData["type"] = data.type;
  if (data.currency !== undefined) updateData["currency"] = data.currency;
  if (data.transactionDate !== undefined)
    updateData["transactionDate"] = data.transactionDate;
  if (data.notes !== undefined)
    updateData["notes"] = data.notes?.trim() ?? null;
  if (data.attachmentUrl !== undefined)
    updateData["attachmentUrl"] = data.attachmentUrl;
  if (data.attachmentMeta !== undefined)
    updateData["attachmentMeta"] = data.attachmentMeta;

  if (data.amount !== undefined) {
    const amount = Math.round(data.amount * 100) / 100;
    if (isNaN(amount) || amount <= 0) throw new Error("Amount must be > 0.");
    updateData["amount"] = amount;
  }

  if (data.tags !== undefined) {
    updateData["tags"] = Array.isArray(data.tags)
      ? data.tags.map((t) => t.toLowerCase().trim()).filter(Boolean)
      : [];
  }

  await updateDoc(docRef, updateData);
};

export const getTransaction = async (
  userId: string,
  transactionId: string,
): Promise<Transaction | null> => {
  const docRef = doc(db, "users", userId, "transactions", transactionId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return toTransaction(snap.id, snap.data());
};

export const subscribeToTransactions = (
  userId: string,
  filters: TransactionFilters = {},
  callback: (
    transactions: Transaction[],
    rawDocs: QueryDocumentSnapshot<DocumentData>[],
  ) => void,
): (() => void) => {
  const baseQuery = buildQuery(userId, filters);
  const pageSize = filters.pageSize ?? 10;

  let q = query(baseQuery, limit(pageSize));
  if (filters.startAfterDoc) {
    q = query(
      baseQuery,
      startAfter(filters.startAfterDoc as QueryDocumentSnapshot<DocumentData>),
      limit(pageSize),
    );
  }

  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map((d) =>
      toTransaction(d.id, d.data()),
    );
    callback(transactions, snapshot.docs);
  });
};

export const subscribeToAllTransactions = (
  userId: string,
  filters: TransactionFilters = {},
  callback: (transactions: Transaction[]) => void,
): (() => void) => {
  const q = buildQuery(userId, filters);
  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map((d) =>
      toTransaction(d.id, d.data()),
    );
    callback(transactions);
  });
};

export const hasLinkedTransactions = async (
  userId: string,
  field: string,
  value: string,
): Promise<boolean> => {
  const ref = getTxCollection(userId);
  const q = query(ref, where(field, "==", value), limit(1));
  const snap = await getDocs(q);
  return !snap.empty;
};
