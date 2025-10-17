export function getFeeRate(price) {
  if (price >= 50000 && price <= 300000) return 0.16;
  if (price >= 301000 && price <= 600000) return 0.15;
  if (price >= 601000 && price <= 900000) return 0.14;
  if (price >= 901000 && price <= 1200000) return 0.12;
  if (price >= 1201000) return 0.1;
  return 0;
}