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

/**
 * Compute total payment amount (deposit + platform commission).
 * Used by both artist booking and Guest Spot deposit payment dialogs.
 * @param depositDollars - Deposit amount in dollars
 * @param feePercent - Platform fee as percentage (e.g. 5 for 5%), or null
 * @returns Total in dollars, rounded to 2 decimal places
 */
export function computeTotalPaymentAmount(
  depositDollars: number,
  feePercent: number | null
): number {
  if (!depositDollars || feePercent == null) {
    return Math.round(depositDollars * 100) / 100;
  }
  const feeDecimal = feePercent / 100;
  const commission = Math.round(depositDollars * feeDecimal * 100) / 100;
  return Math.round((depositDollars + commission) * 100) / 100;
}

