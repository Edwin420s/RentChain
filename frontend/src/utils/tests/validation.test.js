import {
  validateEmail,
  validatePhone,
  validateWalletAddress,
  validatePropertyForm,
  validateRentalAgreement,
  sanitizeHTML
} from '../validation'

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('validates correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
    })

    it('rejects invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('@domain.com')).toBe(false)
      expect(validateEmail('user@')).toBe(false)
    })
  })

  describe('validatePhone', () => {
    it('validates correct phone numbers', () => {
      expect(validatePhone('+254712345678')).toBe(true)
      expect(validatePhone('0712345678')).toBe(true)
      expect(validatePhone('(254) 712-345-678')).toBe(true)
    })

    it('rejects invalid phone numbers', () => {
      expect(validatePhone('123')).toBe(false)
      expect(validatePhone('abc')).toBe(false)
    })
  })

  describe('validateWalletAddress', () => {
    it('validates correct wallet addresses', () => {
      expect(validateWalletAddress('0x742d35Cc6634C0532925a3b8D4C9e7a7a8b5f1e1')).toBe(true)
    })

    it('rejects invalid wallet addresses', () => {
      expect(validateWalletAddress('0xinvalid')).toBe(false)
      expect(validateWalletAddress('742d35Cc6634C0532925a3b8D4C9e7a7a8b5f1e1')).toBe(false)
      expect(validateWalletAddress('')).toBe(false)
    })
  })

  describe('validatePropertyForm', () => {
    it('validates correct property data', () => {
      const validData = {
        title: 'Modern Apartment',
        description: 'Beautiful apartment',
        location: 'Nairobi',
        price: 45000,
        bedrooms: 2,
        bathrooms: 1,
        propertyType: 'apartment'
      }

      const result = validatePropertyForm(validData)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })

    it('returns errors for invalid property data', () => {
      const invalidData = {
        title: '',
        description: '',
        location: '',
        price: -100,
        bedrooms: -1,
        bathrooms: -1,
        propertyType: ''
      }

      const result = validatePropertyForm(invalidData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveProperty('title')
      expect(result.errors).toHaveProperty('description')
      expect(result.errors).toHaveProperty('location')
      expect(result.errors).toHaveProperty('price')
    })
  })

  describe('sanitizeHTML', () => {
    it('escapes HTML characters', () => {
      const input = '<script>alert("xss")</script>'
      const sanitized = sanitizeHTML(input)
      
      expect(sanitized).not.toContain('<script>')
      expect(sanitized).toContain('&lt;script&gt;')
    })

    it('handles normal text correctly', () => {
      const input = 'Normal text without HTML'
      const sanitized = sanitizeHTML(input)
      
      expect(sanitized).toBe(input)
    })
  })
})