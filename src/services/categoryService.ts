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
import type {
  Category,
  CategoryInput,
  CategoryUpdate,
} from "@/models/category";
import { toCategory } from "@/models/mappers";

const getCategoriesCollection = (userId: string) =>
  collection(db, "users", userId, "categories");

const hasLinkedDocuments = async (
  userId: string,
  categoryId: string,
): Promise<boolean> => {
  const collectionsToCheck = ["transactions", "recurrences"] as const;
  for (const col of collectionsToCheck) {
    const ref = collection(db, "users", userId, col);
    const q = query(ref, where("categoryId", "==", categoryId), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) return true;
  }
  return false;
};

export const addCategory = async (
  userId: string,
  categoryData: CategoryInput,
): Promise<Category> => {
  if (!categoryData.name?.trim()) throw new Error("Category name is required.");
  if (!["Income", "Expense"].includes(categoryData.type)) {
    throw new Error('Category type must be "Income" or "Expense".');
  }

  const categoriesRef = getCategoriesCollection(userId);
  const now = new Date().toISOString();
  const docRef = await addDoc(categoriesRef, {
    name: categoryData.name.trim(),
    type: categoryData.type,
    icon: categoryData.icon,
    color: categoryData.color,
    createdAt: now,
  });
  return toCategory(docRef.id, { ...categoryData, createdAt: now });
};

export const updateCategory = async (
  userId: string,
  categoryId: string,
  data: CategoryUpdate,
): Promise<void> => {
  if (data.name !== undefined && !data.name.trim())
    throw new Error("Category name is required.");
  const docRef = doc(db, "users", userId, "categories", categoryId);
  const updateData: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };
  if (data.name !== undefined) updateData["name"] = data.name.trim();
  if (data.icon !== undefined) updateData["icon"] = data.icon;
  if (data.color !== undefined) updateData["color"] = data.color;
  await updateDoc(docRef, updateData);
};

export const deleteCategory = async (
  userId: string,
  categoryId: string,
): Promise<void> => {
  const hasLinks = await hasLinkedDocuments(userId, categoryId);
  if (hasLinks) {
    throw new Error(
      "Cannot delete this category — it has linked transactions or recurrences. Remove those first.",
    );
  }
  const docRef = doc(db, "users", userId, "categories", categoryId);
  await deleteDoc(docRef);
};

export const subscribeToCategories = (
  userId: string,
  callback: (categories: Category[]) => void,
): (() => void) => {
  const categoriesRef = getCategoriesCollection(userId);
  const q = query(categoriesRef, orderBy("createdAt", "asc"));
  return onSnapshot(q, (snapshot) => {
    const categories = snapshot.docs.map((d) => toCategory(d.id, d.data()));
    callback(categories);
  });
};
