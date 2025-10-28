import { format, formatDistance, formatRelative, subDays, parseISO, isBefore, isAfter, addMonths, differenceInDays } from 'date-fns'

export const formatRentDate = (date) => {
  return format(new Date(date), 'MMMM do, yyyy')
}

export const formatShortDate = (date) => {
  return format(new Date(date), 'MMM dd, yyyy')
}

export const formatDateTime = (date) => {
  return format(new Date(date), 'MMM dd, yyyy hh:mm a')
}

export const formatTimeAgo = (date) => {
  return formatDistance(new Date(date), new Date(), { addSuffix: true })
}

export const formatRelativeTime = (date) => {
  return formatRelative(new Date(date), new Date())
}

export const isRentDue = (dueDate) => {
  return isBefore(new Date(dueDate), new Date())
}

export const isRentOverdue = (dueDate, gracePeriod = 5) => {
  const due = new Date(dueDate)
  const overdueDate = addDays(due, gracePeriod)
  return isBefore(overdueDate, new Date())
}

export const getDaysUntilDue = (dueDate) => {
  return differenceInDays(new Date(dueDate), new Date())
}

export const calculateNextPaymentDate = (startDate, frequency = 'monthly') => {
  const start = new Date(startDate)
  const now = new Date()
  
  if (frequency === 'monthly') {
    let nextDate = new Date(start)
    
    while (isBefore(nextDate, now)) {
      nextDate = addMonths(nextDate, 1)
    }
    
    return nextDate
  }
  
  // For weekly payments
  let nextDate = new Date(start)
  const weekInMs = 7 * 24 * 60 * 60 * 1000
  
  while (isBefore(nextDate, now)) {
    nextDate = new Date(nextDate.getTime() + weekInMs)
  }
  
  return nextDate
}

export const formatRentPeriod = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  return `${format(start, 'MMM dd, yyyy')} - ${format(end, 'MMM dd, yyyy')}`
}

export const getRemainingLeaseDays = (endDate) => {
  const end = new Date(endDate)
  const now = new Date()
  
  return Math.max(0, differenceInDays(end, now))
}

export const isLeaseExpiringSoon = (endDate, thresholdDays = 30) => {
  return getRemainingLeaseDays(endDate) <= thresholdDays
}

export const formatLeaseDuration = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const months = differenceInMonths(end, start)
  
  if (months === 1) return '1 month'
  if (months < 12) return `${months} months`
  
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  
  if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`
  return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`
}

export const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const now = new Date()
  
  if (isBefore(end, start)) {
    return 'End date must be after start date'
  }
  
  if (isBefore(start, now)) {
    return 'Start date must be in the future'
  }
  
  const minLeaseDays = 30
  if (differenceInDays(end, start) < minLeaseDays) {
    return `Lease must be at least ${minLeaseDays} days`
  }
  
  return null
}

export const parseUserDateInput = (dateString) => {
  try {
    return parseISO(dateString)
  } catch {
    return new Date(dateString)
  }
}

export const getMonthName = (date) => {
  return format(new Date(date), 'MMMM')
}

export const getYear = (date) => {
  return format(new Date(date), 'yyyy')
}

export const isWeekend = (date) => {
  const day = new Date(date).getDay()
  return day === 0 || day === 6
}

export const getBusinessDays = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  let count = 0
  
  for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
    if (!isWeekend(date)) count++
  }
  
  return count
}

export default {
  formatRentDate,
  formatShortDate,
  formatDateTime,
  formatTimeAgo,
  formatRelativeTime,
  isRentDue,
  isRentOverdue,
  getDaysUntilDue,
  calculateNextPaymentDate,
  formatRentPeriod,
  getRemainingLeaseDays,
  isLeaseExpiringSoon,
  formatLeaseDuration,
  validateDateRange,
  parseUserDateInput,
  getMonthName,
  getYear,
  isWeekend,
  getBusinessDays
}