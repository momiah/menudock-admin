export const gbp = (n) => "£" + Math.round(Number(n) || 0).toLocaleString("en-GB");
export const gbp2 = (n) => "£" + (Number(n) || 0).toFixed(2);
export const num = (n) => (Number(n) || 0).toLocaleString("en-GB");

export const STATUS_LABELS = { active: "Active", pending: "Onboarding", paused: "Paused" };
