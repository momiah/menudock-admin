// Public-site facts in one place, so pricing and links change in one edit.
export const PRICING = {
  setupFee: 300, // one-off
  monthly: 129,
  deliveryAddOn: 20, // Delivery Service add-on, per month (£149 total)
  orderFeePercent: 5,
};

// A live demo restaurant (the restaurant website template) customers can try.
export const DEMO_URL = process.env.REACT_APP_DEMO_URL || "https://menudock-platform.web.app";
