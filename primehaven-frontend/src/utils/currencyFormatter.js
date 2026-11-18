/**
 * PrimeHaven Luxury Real Estate - Indian Currency Formatter
 * Formats numbers into Indian Numbering System (Crores, Lakhs, Thousands, or Full Rupees)
 */

export const formatIndianPrice = (price, options = { short: true }) => {
  if (price === null || price === undefined || isNaN(price)) {
    return 'Price Upon Request';
  }

  const num = Number(price);
  if (num === 0) return 'Price Upon Request';

  if (options.short) {
    if (num >= 10000000) {
      // 1 Crore = 10,000,000
      const cr = (num / 10000000).toFixed(2).replace(/\.00$/, '').replace(/(\.[1-9])0$/, '$1');
      return `₹${cr} Crore`;
    }
    if (num >= 100000) {
      // 1 Lakh = 100,000
      const lk = (num / 100000).toFixed(2).replace(/\.00$/, '').replace(/(\.[1-9])0$/, '$1');
      return `₹${lk} Lakh`;
    }
  }

  // Fallback to formatted Indian Rupees with ₹ symbol
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatIndianPriceFull = (price) => {
  if (price === null || price === undefined || isNaN(price)) {
    return 'Price Upon Request';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(price));
};

export default formatIndianPrice;

