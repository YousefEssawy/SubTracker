import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Payment } from "@/models/payment";
import { toPayment } from "@/models/mappers";

const getPaymentsCollection = (userId: string) =>
  collection(db, "users", userId, "payments");

export const addPaymentRecord = async (
  userId: string,
  paymentData: Omit<Payment, "id" | "createdAt">,
): Promise<Payment> => {
  const paymentsRef = getPaymentsCollection(userId);
  const now = new Date().toISOString();
  const docRef = await addDoc(paymentsRef, {
    ...paymentData,
    createdAt: now,
  });
  return toPayment(docRef.id, { ...paymentData, createdAt: now });
};

export const subscribeToPayments = (
  userId: string,
  callback: (payments: Payment[]) => void,
): (() => void) => {
  const paymentsRef = getPaymentsCollection(userId);
  const q = query(paymentsRef, orderBy("paidDate", "desc"));
  return onSnapshot(q, (snapshot) => {
    const payments = snapshot.docs.map((d) => toPayment(d.id, d.data()));
    callback(payments);
  });
};
