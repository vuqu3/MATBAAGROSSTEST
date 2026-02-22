// Shipping constants and utilities
export const FREE_SHIPPING_THRESHOLD = 1500; // 1500 TL

// Mock shipping cost calculation based on desi
// In a real application, this would fetch from database or API
export function calculateShippingCost(totalDesi: number): number {
  // Basic shipping cost calculation based on desi ranges
  if (totalDesi <= 1) return 25;
  if (totalDesi <= 3) return 35;
  if (totalDesi <= 5) return 45;
  if (totalDesi <= 10) return 65;
  if (totalDesi <= 20) return 85;
  if (totalDesi <= 30) return 105;
  if (totalDesi <= 50) return 145;
  if (totalDesi <= 100) return 195;
  return 250; // Default for very large packages
}

// Calculate remaining amount for free shipping
export function calculateRemainingForFreeShipping(subtotal: number): number {
  return Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
}
