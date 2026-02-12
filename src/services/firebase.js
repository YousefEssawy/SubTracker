import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBPT2o13zlt1-lSAUs2V-MDqiA5xpmwM40",
  authDomain: "subtraker-3dca8.firebaseapp.com",
  projectId: "subtraker-3dca8",
  storageBucket: "subtraker-3dca8.firebasestorage.app",
  messagingSenderId: "311670475091",
  appId: "1:311670475091:web:f3f86fe90fd2bf2fc379a6",
  measurementId: "G-41XD9Z6MT4",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
