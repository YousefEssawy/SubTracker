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

const getSpacesCollection = (userId) =>
  collection(db, "users", userId, "spaces");

/**
 * Check if any documents in a subcollection reference this spaceId.
 * Uses limit(1) for efficiency.
 */
const hasLinkedDocuments = async (userId, spaceId) => {
  const collectionsToCheck = ["transactions", "recurrences"];
  for (const col of collectionsToCheck) {
    const ref = collection(db, "users", userId, col);
    const q = query(ref, where("spaceId", "==", spaceId), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) return true;
  }
  return false;
};

export const addSpace = async (userId, spaceData) => {
  if (!spaceData.name?.trim()) throw new Error("Space name is required.");
  if (!spaceData.color) throw new Error("Space color is required.");
  if (!spaceData.icon) throw new Error("Space icon is required.");

  const spacesRef = getSpacesCollection(userId);
  const now = new Date().toISOString();
  const docRef = await addDoc(spacesRef, {
    name: spaceData.name.trim(),
    color: spaceData.color,
    icon: spaceData.icon,
    createdAt: now,
    updatedAt: now,
  });
  return { id: docRef.id, ...spaceData, createdAt: now, updatedAt: now };
};

export const updateSpace = async (userId, spaceId, data) => {
  const docRef = doc(db, "users", userId, "spaces", spaceId);
  const updateData = { updatedAt: new Date().toISOString() };
  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.color !== undefined) updateData.color = data.color;
  if (data.icon !== undefined) updateData.icon = data.icon;
  await updateDoc(docRef, updateData);
};

export const deleteSpace = async (userId, spaceId) => {
  const hasLinks = await hasLinkedDocuments(userId, spaceId);
  if (hasLinks) {
    throw new Error(
      "Cannot delete this space — it has linked transactions or recurrences. Remove those first.",
    );
  }
  const docRef = doc(db, "users", userId, "spaces", spaceId);
  await deleteDoc(docRef);
};

export const subscribeToSpaces = (userId, callback) => {
  const spacesRef = getSpacesCollection(userId);
  const q = query(spacesRef, orderBy("createdAt", "asc"));
  return onSnapshot(q, (snapshot) => {
    const spaces = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(spaces);
  });
};
