const formatAddress = (address) => {
  if (!address || address.length < 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

const formatAmount = (amount, currency = 'USDT') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const generatePaymentReference = (propertyId) => {
  const timestamp = Date.now();
  return `RENT-${propertyId}-${timestamp}`;
};

const validateEthereumAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

module.exports = {
  formatAddress,
  formatAmount,
  formatDate,
  generatePaymentReference,
  validateEthereumAddress
};