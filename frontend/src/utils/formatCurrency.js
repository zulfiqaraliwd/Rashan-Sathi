/**
 * Format an amount as PKR currency
 * Example: 1500 → "Rs. 1,500"
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'Rs. 0';
  return `Rs. ${Number(amount).toLocaleString('en-PK')}`;
};

/**
 * Short format — 1500 → "1.5k"
 */
export const formatCurrencyShort = (amount) => {
  if (amount >= 1000000) return `Rs. ${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `Rs. ${(amount / 1000).toFixed(1)}k`;
  return `Rs. ${amount}`;
};

export default formatCurrency;