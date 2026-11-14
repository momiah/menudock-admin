// Admin authentication. The console is MenuDock-internal, so access requires an
// `admin: true` custom claim on the Firebase Auth user (set with the Admin SDK), OR
// — as a fallback for setups without claims — an `admins/{uid}` doc in Firestore.
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (next) => {
      setUser(next);
      if (!next) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setLoading(true);
      let admin = false;
      try {
        const token = await next.getIdTokenResult();
        admin = token.claims.admin === true;
        if (!admin) {
          const snap = await getDoc(doc(db, "admins", next.uid));
          admin = snap.exists();
        }
      } catch (e) {
        admin = false;
      }
      setIsAdmin(admin);
      setLoading(false);
    });
  }, []);

  const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const signOutUser = () => signOut(auth);
  // Firebase emails a link to choose a new password (it says nothing about
  // whether the address has an account).
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signIn, signOutUser, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
