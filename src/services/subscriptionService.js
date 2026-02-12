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

const getSubsCollection = (userId) =>
  collection(db, "users", userId, "subscriptions");

export const addSubscription = async (userId, subscriptionData) => {
  const subsRef = getSubsCollection(userId);
  const docRef = await addDoc(subsRef, {
    ...subscriptionData,
    status: subscriptionData.status || "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return { id: docRef.id, ...subscriptionData };
};

export const updateSubscription = async (userId, subscriptionId, data) => {
  const docRef = doc(db, "users", userId, "subscriptions", subscriptionId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteSubscription = async (userId, subscriptionId) => {
  const docRef = doc(db, "users", userId, "subscriptions", subscriptionId);
  await deleteDoc(docRef);
};

export const getSubscription = async (userId, subscriptionId) => {
  const docRef = doc(db, "users", userId, "subscriptions", subscriptionId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }
  return null;
};

export const subscribeToSubscriptions = (userId, callback) => {
  const subsRef = getSubsCollection(userId);
  const q = query(subsRef, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const subscriptions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(subscriptions);
  });
};
