export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePhone = (phone) => {
  const re = /^\+?[\d\s-()]{10,}$/
  return re.test(phone)
}

export const validatePrice = (price) => {
  return !isNaN(price) && parseFloat(price) > 0
}

export const validateAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export const validatePropertyForm = (data) => {
  const errors = {}

  if (!data.title?.trim()) {
    errors.title = 'Property title is required'
  }

  if (!data.location?.trim()) {
    errors.location = 'Location is required'
  }

  if (!validatePrice(data.price)) {
    errors.price = 'Valid price is required'
  }

  if (!data.bedrooms || data.bedrooms < 0) {
    errors.bedrooms = 'Number of bedrooms is required'
  }

  if (!data.bathrooms || data.bathrooms < 0) {
    errors.bathrooms = 'Number of bathrooms is required'
  }

  if (!data.propertyType) {
    errors.propertyType = 'Property type is required'
  }

  if (!data.description?.trim()) {
    errors.description = 'Description is required'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validateRentalAgreement = (data) => {
  const errors = {}

  if (!data.startDate || new Date(data.startDate) <= new Date()) {
    errors.startDate = 'Start date must be in the future'
  }

  if (!data.endDate || new Date(data.endDate) <= new Date(data.startDate)) {
    errors.endDate = 'End date must be after start date'
  }

  if (!data.rentAmount || data.rentAmount <= 0) {
    errors.rentAmount = 'Valid rent amount is required'
  }

  if (!data.depositAmount || data.depositAmount < 0) {
    errors.depositAmount = 'Valid deposit amount is required'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}