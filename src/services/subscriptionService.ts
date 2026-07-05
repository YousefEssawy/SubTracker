import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  Subscription,
  SubscriptionInput,
  SubscriptionUpdate,
} from "@/models/subscription";
import { toSubscription } from "@/models/mappers";

const getSubsCollection = (userId: string) =>
  collection(db, "users", userId, "subscriptions");

export const addSubscription = async (
  userId: string,
  subscriptionData: SubscriptionInput,
): Promise<Subscription> => {
  const subsRef = getSubsCollection(userId);
  const now = new Date().toISOString();
  const docRef = await addDoc(subsRef, {
    ...subscriptionData,
    status: subscriptionData.status ?? "active",
    createdAt: now,
    updatedAt: now,
  });
  return toSubscription(docRef.id, {
    ...subscriptionData,
    createdAt: now,
    updatedAt: now,
  });
};

export const updateSubscription = async (
  userId: string,
  subscriptionId: string,
  data: SubscriptionUpdate,
): Promise<void> => {
  const docRef = doc(db, "users", userId, "subscriptions", subscriptionId);
  await updateDoc(docRef, {
    ...(data as Record<string, unknown>),
    updatedAt: new Date().toISOString(),
  });
};

export const deleteSubscription = async (
  userId: string,
  subscriptionId: string,
): Promise<void> => {
  const docRef = doc(db, "users", userId, "subscriptions", subscriptionId);
  await deleteDoc(docRef);
};

export const getSubscription = async (
  userId: string,
  subscriptionId: string,
): Promise<Subscription | null> => {
  const docRef = doc(db, "users", userId, "subscriptions", subscriptionId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return toSubscription(snap.id, snap.data());
};

export const subscribeToSubscriptions = (
  userId: string,
  callback: (subscriptions: Subscription[]) => void,
  onError?: (error: Error) => void,
): (() => void) => {
  const subsRef = getSubsCollection(userId);
  const q = query(subsRef, orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const subscriptions = snapshot.docs.map((d) =>
        toSubscription(d.id, d.data()),
      );
      callback(subscriptions);
    },
    onError,
  );
};
