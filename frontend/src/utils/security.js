// Security utilities for RentChain

export const sanitizeHTML = (html) => {
  const temp = document.createElement('div')
  temp.textContent = html
  return temp.innerHTML
}

export const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export const validateInput = (input, type = 'text') => {
  const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\+?[\d\s-()]{10,}$/,
    wallet: /^0x[a-fA-F0-9]{40}$/,
    url: /^https?:\/\/[^\s$.?#].[^\s]*$/,
    number: /^-?\d*\.?\d+$/,
    text: /^[\w\s\-.,!?@#$%^&*()+=:;'"<>[\]{}|\\/]{1,1000}$/
  }

  const pattern = patterns[type] || patterns.text
  return pattern.test(input.trim())
}

export const detectXSS = (input) => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<\s*iframe/gi,
    /<\s*form/gi,
    /<\s*meta/gi,
    /<\s*object/gi,
    /<\s*embed/gi,
    /<\s*applet/gi,
    /<\s*style/gi,
    /<\s*link/gi
  ]

  return xssPatterns.some(pattern => pattern.test(input))
}

export const generateCSRFToken = () => {
  return 'csrf_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

export const validateCSRFToken = (token) => {
  if (!token) return false
  
  // Check if token is recent (within 24 hours)
  const timestamp = parseInt(token.split('_').pop(), 36)
  const age = Date.now() - timestamp
  
  return age < 24 * 60 * 60 * 1000 // 24 hours
}

export const hashString = async (str) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export const generateSecureRandom = (length = 32) => {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export const encryptData = async (data, key) => {
  const encoder = new TextEncoder()
  const encoded = encoder.encode(data)
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  )
  
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    cryptoKey,
    encoded
  )
  
  return {
    iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''),
    data: Array.from(new Uint8Array(encrypted)).map(b => b.toString(16).padStart(2, '0')).join('')
  }
}

export const decryptData = async (encryptedData, key) => {
  const encoder = new TextEncoder()
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  )
  
  const iv = new Uint8Array(encryptedData.iv.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))
  const data = new Uint8Array(encryptedData.data.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))
  
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    cryptoKey,
    data
  )
  
  return new TextDecoder().decode(decrypted)
}

export const validateFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']) => {
  return allowedTypes.includes(file.type)
}

export const validateFileSize = (file, maxSize = 10 * 1024 * 1024) => { // 10MB default
  return file.size <= maxSize
}

export const scanFileForMalware = async (file) => {
  // In a real application, this would integrate with a malware scanning service
  // For demonstration, we'll do basic checks
  
  const suspiciousPatterns = [
    /\.exe$/i,
    /\.bat$/i,
    /\.cmd$/i,
    /\.scr$/i,
    /\.pif$/i,
    /\.com$/i
  ]
  
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(file.name))
  
  if (isSuspicious) {
    throw new Error('File type not allowed for security reasons')
  }
  
  return true
}

export const createSecurityHeaders = () => {
  return {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.rentchain.xyz wss://api.rentchain.xyz;",
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), location=()'
  }
}

export const rateLimit = (fn, limit, interval) => {
  let lastCall = 0
  let calls = 0
  
  return function(...args) {
    const now = Date.now()
    
    if (now - lastCall > interval) {
      calls = 0
      lastCall = now
    }
    
    if (calls >= limit) {
      throw new Error('Rate limit exceeded. Please try again later.')
    }
    
    calls++
    return fn.apply(this, args)
  }
}

export const auditLog = (action, details) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    details,
    userAgent: navigator.userAgent,
    url: window.location.href
  }
  
  // In a real app, send to your logging service
  console.log('🔒 Security Audit:', logEntry)
  
  // Store locally for debugging
  const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]')
  logs.push(logEntry)
  localStorage.setItem('audit_logs', JSON.stringify(logs.slice(-100))) // Keep last 100 entries
}

export default {
  sanitizeHTML,
  escapeRegex,
  validateInput,
  detectXSS,
  generateCSRFToken,
  validateCSRFToken,
  hashString,
  generateSecureRandom,
  encryptData,
  decryptData,
  validateFileType,
  validateFileSize,
  scanFileForMalware,
  createSecurityHeaders,
  rateLimit,
  auditLog
}