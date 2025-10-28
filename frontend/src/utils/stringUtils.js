export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const titleCase = (str) => {
  if (!str) return ''
  return str.replace(/\w\S*/g, txt => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  )
}

export const camelCase = (str) => {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
    index === 0 ? word.toLowerCase() : word.toUpperCase()
  ).replace(/\s+/g, '')
}

export const kebabCase = (str) => {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

export const snakeCase = (str) => {
  return str.replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase()
}

export const truncate = (str, length = 50, suffix = '...') => {
  if (!str) return ''
  if (str.length <= length) return str
  return str.substring(0, length - suffix.length) + suffix
}

export const trimWords = (str, wordCount = 10, suffix = '...') => {
  if (!str) return ''
  const words = str.split(' ')
  if (words.length <= wordCount) return str
  return words.slice(0, wordCount).join(' ') + suffix
}

export const stripHtml = (html) => {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

export const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export const generateId = (prefix = '') => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `${prefix}${timestamp}${random}`.toLowerCase()
}

export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 9 && cleaned.startsWith('7')) {
    return `+254${cleaned}`
  }
  if (cleaned.length === 10 && cleaned.startsWith('07')) {
    return `+254${cleaned.slice(1)}`
  }
  if (cleaned.length === 12 && cleaned.startsWith('254')) {
    return `+${cleaned}`
  }
  
  return phone
}

export const maskEmail = (email) => {
  const [local, domain] = email.split('@')
  if (local.length < 3) return email
  
  const maskedLocal = local.charAt(0) + '*'.repeat(local.length - 2) + local.charAt(local.length - 1)
  return `${maskedLocal}@${domain}`
}

export const maskWallet = (wallet) => {
  if (wallet.length < 10) return wallet
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
}

export const pluralize = (count, singular, plural = null) => {
  if (count === 1) return singular
  return plural || singular + 's'
}

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const generateSlug = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const containsEmoji = (str) => {
  const emojiRegex = /[\p{Emoji}]/gu
  return emojiRegex.test(str)
}

export const removeEmojis = (str) => {
  const emojiRegex = /[\p{Emoji}]/gu
  return str.replace(emojiRegex, '')
}

export const countWords = (str) => {
  if (!str) return 0
  return str.trim().split(/\s+/).length
}

export const countCharacters = (str) => {
  if (!str) return 0
  return str.length
}

export const isValidUrl = (str) => {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

export const extractDomain = (url) => {
  try {
    const domain = new URL(url).hostname
    return domain.replace('www.', '')
  } catch {
    return null
  }
}

export default {
  capitalize,
  titleCase,
  camelCase,
  kebabCase,
  snakeCase,
  truncate,
  trimWords,
  stripHtml,
  escapeRegex,
  generateId,
  formatPhoneNumber,
  maskEmail,
  maskWallet,
  pluralize,
  formatFileSize,
  generateSlug,
  containsEmoji,
  removeEmojis,
  countWords,
  countCharacters,
  isValidUrl,
  extractDomain
}
