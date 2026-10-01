// MenuDock money model: 5% platform fee + £129/mo retainer + £300 one-time setup fee.
// A restaurant may override any of these via its `billing` field.
export const BILLING_DEFAULTS = {
  platformFeePercent: 5,
  monthlyRetainer: 129,
  setupFee: 300,
  currency: "GBP",
};

// Accepts a Firestore Timestamp, epoch ms/seconds, ISO string, or Date.
export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "object" && typeof value.toDate === "function") return value.toDate();
  if (typeof value === "object" && typeof value.seconds === "number") return new Date(value.seconds * 1000);
  if (typeof value === "number") return new Date(value < 1e12 ? value * 1000 : value);
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

// Whole calendar months the restaurant has been active, inclusive of the current month.
export function monthsActive(createdAt) {
  const d = toDate(createdAt);
  if (!d) return 1;
  const now = new Date();
  const months = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
  return Math.max(0, months) + 1;
}

// What MenuDock has earned from a restaurant: setup (once) + retainer × months + fee% × GMV.
export function earnings(restaurant, gmv) {
  const b = { ...BILLING_DEFAULTS, ...(restaurant.billing || {}) };
  const months = monthsActive(restaurant.createdAt);
  const fee = gmv * (b.platformFeePercent / 100);
  const retainer = b.monthlyRetainer * months;
  const setup = b.setupFee;
  return { fee, retainer, setup, months, total: setup + retainer + fee, config: b };
}
