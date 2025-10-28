export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePhone = (phone) => {
  const re = /^\+?[\d\s-()]{10,}$/
  return re.test(phone)
}

export const validateWalletAddress = (address) => {
  const re = /^0x[a-fA-F0-9]{40}$/
  return re.test(address)
}

export const validatePrice = (price) => {
  return !isNaN(price) && parseFloat(price) > 0
}

export const validatePropertyForm = (data) => {
  const errors = {}

  if (!data.title?.trim()) {
    errors.title = 'Property title is required'
  }

  if (!data.description?.trim()) {
    errors.description = 'Description is required'
  }

  if (!data.location?.trim()) {
    errors.location = 'Location is required'
  }

  if (!validatePrice(data.price)) {
    errors.price = 'Valid price is required'
  }

  if (!data.bedrooms || data.bedrooms < 0) {
    errors.bedrooms = 'Valid number of bedrooms is required'
  }

  if (!data.bathrooms || data.bathrooms < 0) {
    errors.bathrooms = 'Valid number of bathrooms is required'
  }

  if (!data.propertyType) {
    errors.propertyType = 'Property type is required'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validateRentalAgreement = (data) => {
  const errors = {}

  if (!data.tenantAddress || !validateWalletAddress(data.tenantAddress)) {
    errors.tenantAddress = 'Valid tenant wallet address is required'
  }

  if (!validatePrice(data.rentAmount)) {
    errors.rentAmount = 'Valid rent amount is required'
  }

  if (!validatePrice(data.depositAmount)) {
    errors.depositAmount = 'Valid deposit amount is required'
  }

  if (!data.startDate || new Date(data.startDate) <= new Date()) {
    errors.startDate = 'Start date must be in the future'
  }

  if (!data.endDate || new Date(data.endDate) <= new Date(data.startDate)) {
    errors.endDate = 'End date must be after start date'
  }

  if (!data.duration || data.duration < 1) {
    errors.duration = 'Valid duration is required'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validatePayment = (data) => {
  const errors = {}

  if (!validatePrice(data.amount)) {
    errors.amount = 'Valid payment amount is required'
  }

  if (!data.paymentMethod) {
    errors.paymentMethod = 'Payment method is required'
  }

  if (data.paymentMethod === 'crypto' && !validateWalletAddress(data.walletAddress)) {
    errors.walletAddress = 'Valid wallet address is required for crypto payments'
  }

  if (data.paymentMethod === 'mpesa' && !validatePhone(data.phoneNumber)) {
    errors.phoneNumber = 'Valid phone number is required for M-Pesa'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

export const validateFile = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    maxFiles = 5
  } = options

  const errors = []

  if (file.size > maxSize) {
    errors.push(`File size must be less than ${maxSize / 1024 / 1024}MB`)
  }

  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validatePassword = (password) => {
  const errors = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateForm = (data, schema) => {
  const errors = {}

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field]
    
    for (const rule of rules) {
      const error = rule(value, data)
      if (error) {
        errors[field] = error
        break
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Common validation rules
export const rules = {
  required: (message = 'This field is required') => 
    (value) => !value ? message : null,
  
  email: (message = 'Valid email is required') =>
    (value) => value && !validateEmail(value) ? message : null,
  
  minLength: (min, message = `Must be at least ${min} characters`) =>
    (value) => value && value.length < min ? message : null,
  
  maxLength: (max, message = `Must be less than ${max} characters`) =>
    (value) => value && value.length > max ? message : null,
  
  number: (message = 'Must be a valid number') =>
    (value) => value && isNaN(Number(value)) ? message : null,
  
  min: (min, message = `Must be at least ${min}`) =>
    (value) => value && Number(value) < min ? message : null,
  
  max: (max, message = `Must be less than ${max}`) =>
    (value) => value && Number(value) > max ? message : null
}