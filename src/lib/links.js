// Build the public app links for a restaurant from its record.
const PLATFORM = process.env.REACT_APP_PLATFORM_DOMAIN || "menudock.app";

export function websiteUrl(r) {
  if (r.domains && r.domains.length) return `https://${r.domains[0]}`;
  if (r.website) return r.website;
  return `https://${r.slug}.${PLATFORM}`;
}
export function loyaltyUrl(r) {
  return `https://${r.slug}.loyalty.${PLATFORM}`;
}
export function dashboardUrl(r) {
  return `https://dashboard.${PLATFORM}/?restaurant=${r.slug}`;
}
