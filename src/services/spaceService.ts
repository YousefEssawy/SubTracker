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
import type { Space, SpaceInput, SpaceUpdate } from "@/models/space";
import { toSpace } from "@/models/mappers";

const getSpacesCollection = (userId: string) =>
  collection(db, "users", userId, "spaces");

const hasLinkedDocuments = async (
  userId: string,
  spaceId: string,
): Promise<boolean> => {
  const collectionsToCheck = ["transactions", "recurrences"] as const;
  for (const col of collectionsToCheck) {
    const ref = collection(db, "users", userId, col);
    const q = query(ref, where("spaceId", "==", spaceId), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) return true;
  }
  return false;
};

export const addSpace = async (
  userId: string,
  spaceData: SpaceInput,
): Promise<Space> => {
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
  });
  return toSpace(docRef.id, { ...spaceData, createdAt: now });
};

export const updateSpace = async (
  userId: string,
  spaceId: string,
  data: SpaceUpdate,
): Promise<void> => {
  const docRef = doc(db, "users", userId, "spaces", spaceId);
  const updateData: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };
  if (data.name !== undefined) updateData["name"] = data.name.trim();
  if (data.color !== undefined) updateData["color"] = data.color;
  if (data.icon !== undefined) updateData["icon"] = data.icon;
  await updateDoc(docRef, updateData);
};

export const deleteSpace = async (
  userId: string,
  spaceId: string,
): Promise<void> => {
  const hasLinks = await hasLinkedDocuments(userId, spaceId);
  if (hasLinks) {
    throw new Error(
      "Cannot delete this space — it has linked transactions or recurrences. Remove those first.",
    );
  }
  const docRef = doc(db, "users", userId, "spaces", spaceId);
  await deleteDoc(docRef);
};

export const subscribeToSpaces = (
  userId: string,
  callback: (spaces: Space[]) => void,
): (() => void) => {
  const spacesRef = getSpacesCollection(userId);
  const q = query(spacesRef, orderBy("createdAt", "asc"));
  return onSnapshot(q, (snapshot) => {
    const spaces = snapshot.docs.map((d) => toSpace(d.id, d.data()));
    callback(spaces);
  });
};
