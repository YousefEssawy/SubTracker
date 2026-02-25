import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type User,
  type Unsubscribe,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<User> => {
  const result = await signInWithPopup(auth, googleProvider);
  await ensureUserProfile(result.user);
  return result.user;
};

export const signInWithEmail = async (
  email: string,
  password: string,
): Promise<User> => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string,
): Promise<User> => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName });
  await ensureUserProfile(result.user);
  return result.user;
};

export const logOut = async (): Promise<void> => {
  await signOut(auth);
};

export const onAuthChange = (
  callback: (user: User | null) => void,
): Unsubscribe => {
  return onAuthStateChanged(auth, callback);
};

const ensureUserProfile = async (user: User): Promise<void> => {
  const profileRef = doc(db, "users", user.uid);
  const profileSnap = await getDoc(profileRef);
  if (!profileSnap.exists()) {
    await setDoc(profileRef, {
      displayName: user.displayName ?? "",
      email: user.email,
      preferredCurrency: "EGP",
      reminderDays: 3,
      theme: "light",
      createdAt: new Date().toISOString(),
    });
  }
};
