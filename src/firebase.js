// Shared PLATFORM Firebase project — the same project the restaurant website and
// owner dashboard use. Config comes from REACT_APP_FIREBASE_* env (see .env.example);
// fallbacks keep local dev working.
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAm1bPTxm9csx2HYISUm35xlwUahGKxg8Q",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "menudock-platform.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "menudock-platform",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "menudock-platform.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "824146300662",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:824146300662:web:9b55170f16fd98bb62e6d7",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
