export const formatCurrency = (amount, currency = 'KES', locale = 'en-KE') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export const formatCrypto = (amount, decimals = 4) => {
  return `${parseFloat(amount).toFixed(decimals)}`
}

export const formatPercentage = (value, decimals = 1) => {
  return `${(value * 100).toFixed(decimals)}%`
}

export const calculateTotalRent = (monthlyRent, months, deposit = 0) => {
  return monthlyRent * months + deposit
}

export const calculateMonthlyPayment = (totalAmount, months) => {
  return totalAmount / months
}

export const calculateLateFee = (rentAmount, daysLate, lateFeeRate = 0.05) => {
  const dailyLateFee = rentAmount * lateFeeRate
  return Math.min(dailyLateFee * daysLate, rentAmount * 0.5) // Cap at 50% of rent
}

export const calculateSecurityDeposit = (monthlyRent, depositMonths = 1) => {
  return monthlyRent * depositMonths
}

export const calculatePlatformFee = (amount, feePercentage = 0.02) => {
  return amount * feePercentage
}

export const calculateNetAmount = (amount, fees = 0) => {
  return amount - fees
}

export const formatAmountWithSymbol = (amount, currency) => {
  const symbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    KES: 'KSh'
  }
  
  const symbol = symbols[currency] || currency
  return `${symbol}${formatCurrency(amount, currency).replace(/[^\d.,]/g, '')}`
}

export const convertCurrency = (amount, fromCurrency, toCurrency, rates) => {
  if (!rates[fromCurrency] || !rates[toCurrency]) {
    throw new Error('Conversion rates not available')
  }
  
  const amountInUSD = amount / rates[fromCurrency]
  return amountInUSD * rates[toCurrency]
}

export const validateAmount = (amount, min = 0, max = 1000000) => {
  if (isNaN(amount) || amount < min || amount > max) {
    return false
  }
  return true
}

export const formatAmountRange = (minAmount, maxAmount, currency = 'KES') => {
  if (minAmount === maxAmount) {
    return formatCurrency(minAmount, currency)
  }
  return `${formatCurrency(minAmount, currency)} - ${formatCurrency(maxAmount, currency)}`
}

export const calculateCompoundInterest = (principal, rate, time) => {
  return principal * Math.pow(1 + rate, time) - principal
}

export const calculateSimpleInterest = (principal, rate, time) => {
  return principal * rate * time
}

export const formatLargeNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export const parseCurrencyInput = (input) => {
  // Remove any non-digit characters except decimal point
  const cleaned = input.replace(/[^\d.]/g, '')
  
  // Parse as float
  const parsed = parseFloat(cleaned)
  
  return isNaN(parsed) ? 0 : parsed
}

export const formatCurrencyInput = (value) => {
  if (!value) return ''
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value)
}

export const calculateRentToIncomeRatio = (rent, income) => {
  if (!income || income === 0) return 0
  return rent / income
}

export const isRentAffordable = (rent, income, maxRatio = 0.3) => {
  return calculateRentToIncomeRatio(rent, income) <= maxRatio
}

export default {
  formatCurrency,
  formatCrypto,
  formatPercentage,
  calculateTotalRent,
  calculateMonthlyPayment,
  calculateLateFee,
  calculateSecurityDeposit,
  calculatePlatformFee,
  calculateNetAmount,
  formatAmountWithSymbol,
  convertCurrency,
  validateAmount,
  formatAmountRange,
  calculateCompoundInterest,
  calculateSimpleInterest,
  formatLargeNumber,
  parseCurrencyInput,
  formatCurrencyInput,
  calculateRentToIncomeRatio,
  isRentAffordable
}