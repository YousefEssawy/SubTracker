import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

const getPaymentsCollection = (userId) =>
  collection(db, "users", userId, "payments");

export const addPaymentRecord = async (userId, paymentData) => {
  const paymentsRef = getPaymentsCollection(userId);
  const docRef = await addDoc(paymentsRef, {
    ...paymentData,
    createdAt: new Date().toISOString(),
  });
  return { id: docRef.id, ...paymentData };
};

export const subscribeToPayments = (userId, callback) => {
  const paymentsRef = getPaymentsCollection(userId);
  const q = query(paymentsRef, orderBy("paidDate", "desc"));
  return onSnapshot(q, (snapshot) => {
    const payments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(payments);
  });
};
