import { useState, useEffect } from 'react'

export const useProperties = (filters = {}) => {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true)
        // Mock data - replace with actual API call
        const mockProperties = [
          {
            id: 1,
            title: 'Modern Apartment in Westlands',
            location: 'Westlands, Nairobi',
            price: 45000,
            image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
            bedrooms: 2,
            bathrooms: 2,
            amenities: ['wifi', 'parking'],
            description: 'Beautiful modern apartment with great amenities and security.',
            coordinates: { lat: -1.2633, lng: 36.8061 }
          },
          {
            id: 2,
            title: 'Cozy Studio near CBD',
            location: 'Nairobi CBD',
            price: 25000,
            image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
            bedrooms: 1,
            bathrooms: 1,
            amenities: ['wifi'],
            description: 'Perfect studio apartment for young professionals.',
            coordinates: { lat: -1.2864, lng: 36.8172 }
          }
        ]

        // Apply filters
        let filtered = mockProperties
        if (filters.location) {
          filtered = filtered.filter(p => 
            p.location.toLowerCase().includes(filters.location.toLowerCase())
          )
        }
        if (filters.minPrice) {
          filtered = filtered.filter(p => p.price >= parseInt(filters.minPrice))
        }
        if (filters.maxPrice) {
          filtered = filtered.filter(p => p.price <= parseInt(filters.maxPrice))
        }
        if (filters.propertyType) {
          filtered = filtered.filter(p => p.type === filters.propertyType)
        }

        setProperties(filtered)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [filters])

  const addProperty = async (propertyData) => {
    try {
      // In real app, this would upload to IPFS and call smart contract
      const newProperty = {
        id: Date.now(),
        ...propertyData,
        createdAt: new Date().toISOString()
      }
      setProperties(prev => [newProperty, ...prev])
      return newProperty
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const updateProperty = async (id, updates) => {
    try {
      setProperties(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const deleteProperty = async (id) => {
    try {
      setProperties(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  return {
    properties,
    loading,
    error,
    addProperty,
    updateProperty,
    deleteProperty
  }
}