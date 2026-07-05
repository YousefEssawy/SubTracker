import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { CurrencyCode } from "@/models";

export interface UserSettings {
  preferredCurrency: CurrencyCode;
  reminderDays: number;
}

const getUserRef = (userId: string) => doc(db, "users", userId);

export const getUserSettings = async (
  userId: string,
): Promise<Partial<UserSettings> | null> => {
  const snap = await getDoc(getUserRef(userId));
  if (!snap.exists()) return null;
  return snap.data() as Partial<UserSettings>;
};

export const saveUserSettings = async (
  userId: string,
  settings: UserSettings,
): Promise<void> => {
  await setDoc(getUserRef(userId), settings, { merge: true });
};
