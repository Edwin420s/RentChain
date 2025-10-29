import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useWeb3 } from '../hooks/useWeb3'
import { useContracts } from '../hooks/useContracts'
import { useLocalStorage } from '../hooks/useLocalStorage'

const AppContext = createContext()

// Initial state
const initialState = {
  user: null,
  properties: [],
  agreements: [],
  notifications: [],
  isLoading: false,
  filters: {
    priceRange: [0, 10000],
    location: '',
    propertyType: 'all',
    bedrooms: 'any'
  }
}

// Action types
const ACTION_TYPES = {
  SET_USER: 'SET_USER',
  SET_PROPERTIES: 'SET_PROPERTIES',
  SET_AGREEMENTS: 'SET_AGREEMENTS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  SET_LOADING: 'SET_LOADING',
  UPDATE_FILTERS: 'UPDATE_FILTERS',
  UPDATE_AGREEMENT: 'UPDATE_AGREEMENT',
  ADD_PROPERTY: 'ADD_PROPERTY'
}

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_USER:
      return { ...state, user: action.payload }
    
    case ACTION_TYPES.SET_PROPERTIES:
      return { ...state, properties: action.payload }
    
    case ACTION_TYPES.SET_AGREEMENTS:
      return { ...state, agreements: action.payload }
    
    case ACTION_TYPES.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications.slice(0, 49)] // Keep last 50
      }
    
    case ACTION_TYPES.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      }
    
    case ACTION_TYPES.SET_LOADING:
      return { ...state, isLoading: action.payload }
    
    case ACTION_TYPES.UPDATE_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      }
    
    case ACTION_TYPES.UPDATE_AGREEMENT:
      return {
        ...state,
        agreements: state.agreements.map(agreement =>
          agreement.id === action.payload.id
            ? { ...agreement, ...action.payload.updates }
            : agreement
        )
      }
    
    case ACTION_TYPES.ADD_PROPERTY:
      return {
        ...state,
        properties: [action.payload, ...state.properties]
      }
    
    default:
      return state
  }
}

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const [cachedData, setCachedData] = useLocalStorage('zurirent_cache', {})
  const { account, isConnected } = useWeb3()
  const { contracts, listenToAgreementEvents } = useContracts()

  // Load cached data on mount
  useEffect(() => {
    if (cachedData.properties) {
      dispatch({ type: ACTION_TYPES.SET_PROPERTIES, payload: cachedData.properties })
    }
    if (cachedData.agreements) {
      dispatch({ type: ACTION_TYPES.SET_AGREEMENTS, payload: cachedData.agreements })
    }
  }, [])

  // Cache data when it changes
  useEffect(() => {
    setCachedData({
      properties: state.properties,
      agreements: state.agreements,
      lastUpdated: new Date().toISOString()
    })
  }, [state.properties, state.agreements])

  // Listen to blockchain events
  useEffect(() => {
    if (!contracts.rentalAgreement) return

    const unsubscribe = listenToAgreementEvents((event) => {
      addNotification({
        id: Date.now(),
        type: 'blockchain',
        title: 'New Blockchain Event',
        message: `Agreement ${event.agreementId} created`,
        timestamp: new Date(),
        read: false
      })
    })

    return unsubscribe
  }, [contracts.rentalAgreement])

  // Actions
  const setUser = (user) => {
    dispatch({ type: ACTION_TYPES.SET_USER, payload: user })
  }

  const setProperties = (properties) => {
    dispatch({ type: ACTION_TYPES.SET_PROPERTIES, payload: properties })
  }

  const setAgreements = (agreements) => {
    dispatch({ type: ACTION_TYPES.SET_AGREEMENTS, payload: agreements })
  }

  const addNotification = (notification) => {
    dispatch({ type: ACTION_TYPES.ADD_NOTIFICATION, payload: notification })
  }

  const removeNotification = (notificationId) => {
    dispatch({ type: ACTION_TYPES.REMOVE_NOTIFICATION, payload: notificationId })
  }

  const setLoading = (isLoading) => {
    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: isLoading })
  }

  const updateFilters = (filters) => {
    dispatch({ type: ACTION_TYPES.UPDATE_FILTERS, payload: filters })
  }

  const updateAgreement = (agreementId, updates) => {
    dispatch({
      type: ACTION_TYPES.UPDATE_AGREEMENT,
      payload: { id: agreementId, updates }
    })
  }

  const addProperty = (property) => {
    dispatch({ type: ACTION_TYPES.ADD_PROPERTY, payload: property })
  }

  // Derived state
  const filteredProperties = state.properties.filter(property => {
    const { priceRange, location, propertyType, bedrooms } = state.filters
    
    // Price filter
    if (property.price < priceRange[0] || property.price > priceRange[1]) {
      return false
    }
    
    // Location filter
    if (location && !property.location.toLowerCase().includes(location.toLowerCase())) {
      return false
    }
    
    // Property type filter
    if (propertyType !== 'all' && property.type !== propertyType) {
      return false
    }
    
    // Bedrooms filter
    if (bedrooms !== 'any') {
      if (bedrooms === '4+' && property.bedrooms < 4) return false
      if (bedrooms !== '4+' && property.bedrooms !== parseInt(bedrooms)) return false
    }
    
    return true
  })

  const userAgreements = state.agreements.filter(agreement => 
    agreement.landlord === account || agreement.tenant === account
  )

  const unreadNotifications = state.notifications.filter(n => !n.read)

  const value = {
    // State
    ...state,
    filteredProperties,
    userAgreements,
    unreadNotifications,
    
    // Actions
    setUser,
    setProperties,
    setAgreements,
    addNotification,
    removeNotification,
    setLoading,
    updateFilters,
    updateAgreement,
    addProperty
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}