import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  where,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";

const getCategoriesCollection = (userId) =>
  collection(db, "users", userId, "categories");

/**
 * Check if any documents in a subcollection reference this categoryId.
 */
const hasLinkedDocuments = async (userId, categoryId) => {
  const collectionsToCheck = ["transactions", "recurrences"];
  for (const col of collectionsToCheck) {
    const ref = collection(db, "users", userId, col);
    const q = query(ref, where("categoryId", "==", categoryId), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) return true;
  }
  return false;
};

export const addCategory = async (userId, categoryData) => {
  if (!categoryData.name?.trim()) throw new Error("Category name is required.");
  if (!["Income", "Expense"].includes(categoryData.type)) {
    throw new Error('Category type must be "Income" or "Expense".');
  }

  const categoriesRef = getCategoriesCollection(userId);
  const now = new Date().toISOString();
  const docRef = await addDoc(categoriesRef, {
    name: categoryData.name.trim(),
    type: categoryData.type, // immutable — set once on creation
    createdAt: now,
    updatedAt: now,
  });
  return { id: docRef.id, ...categoryData, createdAt: now, updatedAt: now };
};

export const updateCategory = async (userId, categoryId, data) => {
  // Only name is updatable — type is immutable
  if (!data.name?.trim()) throw new Error("Category name is required.");
  const docRef = doc(db, "users", userId, "categories", categoryId);
  await updateDoc(docRef, {
    name: data.name.trim(),
    updatedAt: new Date().toISOString(),
  });
};

export const deleteCategory = async (userId, categoryId) => {
  const hasLinks = await hasLinkedDocuments(userId, categoryId);
  if (hasLinks) {
    throw new Error(
      "Cannot delete this category — it has linked transactions or recurrences. Remove those first.",
    );
  }
  const docRef = doc(db, "users", userId, "categories", categoryId);
  await deleteDoc(docRef);
};

export const subscribeToCategories = (userId, callback) => {
  const categoriesRef = getCategoriesCollection(userId);
  const q = query(categoriesRef, orderBy("createdAt", "asc"));
  return onSnapshot(q, (snapshot) => {
    const categories = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(categories);
  });
};
