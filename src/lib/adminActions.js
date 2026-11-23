// What the admin console can change on a restaurant. Status and fees are plain
// Firestore writes (the rules let admins change them, never owners); Stripe accounts
// and owner logins need the server (functions/platformAdmin.js in restaurant-site).
import { getFunctions, httpsCallable } from "firebase/functions";
import { collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import app, { db } from "../firebase";

// Stripe's costs, passed on to every restaurant on top of MenuDock's fee. Mirrors
// STRIPE_COVER_PERCENT / STRIPE_COVER_FIXED_PENCE in restaurant-site/functions/.env.
export const STRIPE_COVER = { percent: 1.75, fixedPence: 20 };
export const stripeCoverLabel = () => `${STRIPE_COVER.percent}% + ${STRIPE_COVER.fixedPence}p`;

const call = (name) => async (data) => (await httpsCallable(getFunctions(app, "us-central1"), name)(data)).data;

export const createStripeLink = (restaurantId) => call("adminStripeOnboardingLink")({ restaurantId });
export const refreshStripe = (restaurantId) => call("adminRefreshStripe")({ restaurantId });
export const createOwnerLogin = (restaurantId, email) => call("adminCreateOwnerLogin")({ restaurantId, email });

export const setStatus = (restaurantId, status) =>
  updateDoc(doc(db, "restaurants", restaurantId), { status, updatedAt: serverTimestamp() });

export const setBilling = (restaurantId, { platformFeePercent, monthlyRetainer, setupFee }) =>
  updateDoc(doc(db, "restaurants", restaurantId), {
    "billing.platformFeePercent": platformFeePercent,
    "billing.monthlyRetainer": monthlyRetainer,
    "billing.setupFee": setupFee,
    updatedAt: serverTimestamp(),
  });

export async function listOwners(restaurantId) {
  const snap = await getDocs(query(collection(db, "owners"), where("restaurantId", "==", restaurantId)));
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
}
