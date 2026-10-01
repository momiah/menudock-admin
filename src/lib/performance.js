import { toDate } from "./billing";

// Aggregate a restaurant's orders into headline performance + a weekly GMV/orders series.
// Orders are the docs the website writes to the top-level `orders` collection; totals are
// counted for paid orders (payment_status "paid"), falling back to all when none are marked.
export function summarise(orders, weeks = 12) {
  const paid = orders.filter((o) => o.payment_status === "paid");
  const counted = paid.length ? paid : orders;

  const gmv = counted.reduce((a, o) => a + (Number(o.total) || 0), 0);
  const count = counted.length;
  const aov = count ? gmv / count : 0;

  // Build `weeks` buckets ending this week.
  const now = new Date();
  const msWeek = 7 * 24 * 3600 * 1000;
  const startOfThisWeek = now.getTime() - ((now.getDay() + 6) % 7) * 24 * 3600 * 1000;
  const buckets = Array.from({ length: weeks }, (_, i) => ({
    label: "W" + (i + 1),
    start: startOfThisWeek - (weeks - 1 - i) * msWeek,
    revenue: 0,
    orders: 0,
  }));
  const firstStart = buckets[0].start;

  counted.forEach((o) => {
    const d = toDate(o.created || o.createdAt);
    if (!d) return;
    const idx = Math.floor((d.getTime() - firstStart) / msWeek);
    if (idx >= 0 && idx < weeks) {
      buckets[idx].revenue += Number(o.total) || 0;
      buckets[idx].orders += 1;
    }
  });

  return {
    gmv,
    count,
    aov,
    labels: buckets.map((b) => b.label),
    revenue: buckets.map((b) => Math.round(b.revenue)),
    ordersByWeek: buckets.map((b) => b.orders),
    hasTimeline: buckets.some((b) => b.orders > 0),
  };
}
