import { PRICING } from "./config";

// Monthly cost of the same orders on a marketplace vs MenuDock. Pure, so the
// calculator and the tests share it.
export function savings({ monthlySales, commissionPercent, delivery = false }) {
  const sales = Math.max(0, Number(monthlySales) || 0);
  const rate = Math.min(100, Math.max(0, Number(commissionPercent) || 0));
  const marketplace = sales * (rate / 100);
  const monthly = PRICING.monthly + (delivery ? PRICING.deliveryAddOn : 0);
  const menudock = sales * (PRICING.orderFeePercent / 100) + monthly;
  const perMonth = marketplace - menudock;
  return {
    marketplace: Math.round(marketplace),
    menudock: Math.round(menudock),
    perMonth: Math.round(perMonth),
    perYear: Math.round(perMonth * 12),
  };
}

export const gbp = (n) =>
  `${n < 0 ? "−" : ""}£${Math.abs(Math.round(n)).toLocaleString("en-GB")}`;
