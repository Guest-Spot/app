/**
 * Convert cents to dollars
 * @param cents - Amount in cents
 * @returns Amount in dollars or null if input is null/undefined
 */
export function centsToDollars(cents: number | null | undefined): number | null {
  if (cents === null || cents === undefined) {
    return null;
  }
  return cents / 100;
}

/**
 * Convert dollars to cents
 * @param dollars - Amount in dollars
 * @returns Amount in cents (rounded) or null if input is null/undefined
 */
export function dollarsToCents(dollars: number | null | undefined): number | null {
  if (dollars === null || dollars === undefined) {
    return null;
  }
  return Math.round(dollars * 100);
}

