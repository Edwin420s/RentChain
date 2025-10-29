// Utility functions for the ZuriRent application

export const formatAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }
  return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options })
}

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const calculateDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const difference = end.getTime() - start.getTime()
  return Math.ceil(difference / (1000 * 3600 * 24))
}

export const generateContractId = () => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `RC-${timestamp}-${random}`.toUpperCase()
}

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePhone = (phone) => {
  const re = /^\+?[\d\s-()]{10,}$/
  return re.test(phone)
}

export const calculateEscrowRelease = (agreement) => {
  const { depositAmount, startDate, endDate, penalties = 0 } = agreement
  const today = new Date()
  const end = new Date(endDate)
  
  if (today < end) {
    return { status: 'locked', amount: depositAmount }
  }
  
  // Calculate deductions based on agreement terms
  const deductions = penalties
  const releaseAmount = Math.max(0, depositAmount - deductions)
  
  return {
    status: 'ready',
    amount: releaseAmount,
    deductions: deductions
  }
}

export const getPaymentStatus = (dueDate, paidDate) => {
  const due = new Date(dueDate)
  const paid = paidDate ? new Date(paidDate) : null
  const today = new Date()
  
  if (paid) {
    return paid <= due ? 'paid' : 'paid_late'
  }
  
  return today > due ? 'overdue' : 'pending'
}

export const calculateLateFee = (rentAmount, daysLate, lateFeeRate = 0.05) => {
  const dailyLateFee = rentAmount * lateFeeRate
  return Math.min(dailyLateFee * daysLate, rentAmount * 0.5) // Cap at 50% of rent
}

export const generateInvoice = (agreement, payment) => {
  return {
    id: generateContractId(),
    date: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    items: [
      {
        description: `Rent for ${agreement.property.title}`,
        amount: agreement.rentAmount
      },
      {
        description: 'Security Deposit',
        amount: agreement.depositAmount
      }
    ],
    total: agreement.rentAmount + agreement.depositAmount,
    status: 'pending'
  }
}

// IPFS helper functions
export const uploadToIPFS = async (file) => {
  // Mock implementation - replace with actual IPFS upload
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`ipfs://Qm${Math.random().toString(36).substr(2, 44)}`)
    }, 1000)
  })
}

export const getIPFSGatewayURL = (ipfsHash) => {
  return `https://ipfs.io/ipfs/${ipfsHash.replace('ipfs://', '')}`
}

// Blockchain helper functions
export const weiToEther = (wei) => {
  return parseFloat(wei) / 1e18
}

export const etherToWei = (ether) => {
  return parseFloat(ether) * 1e18
}

// Local storage helpers
export const getLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

export const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error removing from localStorage:', error)
  }
}

// Date helpers
export const addMonths = (date, months) => {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

export const isDateInPast = (date) => {
  return new Date(date) < new Date()
}

export const isDateInFuture = (date) => {
  return new Date(date) > new Date()
}

// Number helpers
export const formatNumber = (number, decimals = 2) => {
  return parseFloat(number).toFixed(decimals)
}

export const formatPercentage = (number, decimals = 1) => {
  return `${formatNumber(number * 100, decimals)}%`
}

// String helpers
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const truncate = (str, length = 50) => {
  return str.length > length ? `${str.substring(0, length)}...` : str
}

// Array helpers
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key]
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {})
}

export const sortBy = (array, key, direction = 'asc') => {
  return array.sort((a, b) => {
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1
    return 0
  })
}

// Validation helpers
export const required = (value) => {
  return value !== null && value !== undefined && value !== ''
}

export const minLength = (value, length) => {
  return value && value.length >= length
}

export const maxLength = (value, length) => {
  return value && value.length <= length
}

export const isNumber = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value)
}

export const isPositive = (value) => {
  return isNumber(value) && parseFloat(value) > 0
}

// Export all helpers
export default {
  formatAddress,
  formatCurrency,
  formatDate,
  formatDateTime,
  calculateDaysBetween,
  generateContractId,
  validateEmail,
  validatePhone,
  calculateEscrowRelease,
  getPaymentStatus,
  calculateLateFee,
  generateInvoice,
  uploadToIPFS,
  getIPFSGatewayURL,
  weiToEther,
  etherToWei,
  getLocalStorage,
  setLocalStorage,
  removeLocalStorage,
  addMonths,
  isDateInPast,
  isDateInFuture,
  formatNumber,
  formatPercentage,
  capitalize,
  truncate,
  groupBy,
  sortBy,
  required,
  minLength,
  maxLength,
  isNumber,
  isPositive
}