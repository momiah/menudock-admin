// Shared PLATFORM Firebase project — the same project the restaurant website and
// owner dashboard use. Config comes from REACT_APP_FIREBASE_* env (see .env.example);
// fallbacks keep local dev working.
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyD3ehzE8DkNklEK5f3X_mZvSm7ULTcqtdY",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "tacomonster-a73fa.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "tacomonster-a73fa",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "tacomonster-a73fa.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "772366282257",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:772366282257:web:260eea70453f26aefb4bb0",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
