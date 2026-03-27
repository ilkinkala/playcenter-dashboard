import { getSettings } from './storage';

// Get packages from settings (async - call from useEffect)
export async function getPackages() {
  const settings = await getSettings();
  return settings.packages;
}

// Get tolerance from settings (async - call from useEffect)
export async function getTolerance() {
  const settings = await getSettings();
  return settings.toleranceMinutes;
}

// Calculate prorated price for early pickup
export function calculateProratedPrice(packageMinutes, packagePrice, elapsedMinutes) {
  if (elapsedMinutes >= packageMinutes) return packagePrice;
  const pricePerMinute = packagePrice / packageMinutes;
  return Math.round(pricePerMinute * elapsedMinutes * 100) / 100;
}

// Calculate price for unlimited (Sinirsiz) mode
// Finds the smallest package that covers elapsed time, with tolerance
// Beyond the largest package: largest price + overtime at largest rate
export function calculateUnlimitedPrice(elapsedMinutes, packages, toleranceMinutes) {
  const sorted = [...packages].sort((a, b) => a.minutes - b.minutes);

  // Find the smallest package that covers the elapsed time (with tolerance)
  for (const pkg of sorted) {
    if (elapsedMinutes <= pkg.minutes + toleranceMinutes) {
      return {
        matchedPackage: pkg,
        finalPrice: pkg.price,
        overtimeMinutes: 0,
        overtimePrice: 0,
      };
    }
  }

  // Beyond largest package — charge largest price + overtime
  const largest = sorted[sorted.length - 1];
  const overtimeMin = elapsedMinutes - largest.minutes - toleranceMinutes;
  const billableOvertime = Math.max(0, overtimeMin);
  const perMinute = largest.price / largest.minutes;
  const overtimePrice = Math.round(perMinute * billableOvertime * 100) / 100;

  return {
    matchedPackage: largest,
    finalPrice: largest.price + overtimePrice,
    overtimeMinutes: billableOvertime,
    overtimePrice,
  };
}

export function formatPrice(amount) {
  return `${amount.toFixed(2)} ₺`;
}
