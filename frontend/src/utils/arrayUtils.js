export const chunkArray = (array, size) => {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

export const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export const uniqueArray = (array, key = null) => {
  if (key) {
    const seen = new Set()
    return array.filter(item => {
      const value = item[key]
      if (seen.has(value)) {
        return false
      }
      seen.add(value)
      return true
    })
  }
  return [...new Set(array)]
}

export const sortByKey = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    let aValue = a[key]
    let bValue = b[key]

    // Handle nested keys
    if (key.includes('.')) {
      aValue = key.split('.').reduce((obj, k) => obj?.[k], a)
      bValue = key.split('.').reduce((obj, k) => obj?.[k], b)
    }

    if (aValue < bValue) return direction === 'asc' ? -1 : 1
    if (aValue > bValue) return direction === 'asc' ? 1 : -1
    return 0
  })
}

export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key]
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {})
}

export const flattenArray = (array) => {
  return array.reduce((flat, item) => {
    return flat.concat(Array.isArray(item) ? flattenArray(item) : item)
  }, [])
}

export const findDeep = (array, predicate, childrenKey = 'children') => {
  for (const item of array) {
    if (predicate(item)) {
      return item
    }
    if (item[childrenKey] && Array.isArray(item[childrenKey])) {
      const found = findDeep(item[childrenKey], predicate, childrenKey)
      if (found) return found
    }
  }
  return null
}

export const pluck = (array, key) => {
  return array.map(item => item[key])
}

export const maxBy = (array, key) => {
  return array.reduce((max, item) => {
    return item[key] > max[key] ? item : max
  }, array[0])
}

export const minBy = (array, key) => {
  return array.reduce((min, item) => {
    return item[key] < min[key] ? item : min
  }, array[0])
}

export const sumBy = (array, key) => {
  return array.reduce((sum, item) => sum + (item[key] || 0), 0)
}

export const averageBy = (array, key) => {
  if (array.length === 0) return 0
  return sumBy(array, key) / array.length
}

export const filterByRange = (array, key, min, max) => {
  return array.filter(item => {
    const value = item[key]
    return value >= min && value <= max
  })
}

export const searchArray = (array, query, keys = []) => {
  if (!query) return array

  const lowerQuery = query.toLowerCase()
  
  return array.filter(item => {
    if (keys.length === 0) {
      return Object.values(item).some(value => 
        String(value).toLowerCase().includes(lowerQuery)
      )
    }

    return keys.some(key => {
      const value = item[key]
      return String(value).toLowerCase().includes(lowerQuery)
    })
  })
}

export const paginateArray = (array, page, pageSize) => {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return {
    data: array.slice(start, end),
    pagination: {
      page,
      pageSize,
      total: array.length,
      totalPages: Math.ceil(array.length / pageSize),
      hasNext: end < array.length,
      hasPrev: page > 1
    }
  }
}

export const randomItem = (array) => {
  return array[Math.floor(Math.random() * array.length)]
}

export const removeItem = (array, predicate) => {
  const index = array.findIndex(predicate)
  if (index > -1) {
    return [...array.slice(0, index), ...array.slice(index + 1)]
  }
  return array
}

export const updateItem = (array, predicate, updates) => {
  return array.map(item => {
    if (predicate(item)) {
      return { ...item, ...updates }
    }
    return item
  })
}

export default {
  chunkArray,
  shuffleArray,
  uniqueArray,
  sortByKey,
  groupBy,
  flattenArray,
  findDeep,
  pluck,
  maxBy,
  minBy,
  sumBy,
  averageBy,
  filterByRange,
  searchArray,
  paginateArray,
  randomItem,
  removeItem,
  updateItem
}