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

export function formatPrice(amount) {
  return `${amount.toFixed(2)} ₺`;
}
