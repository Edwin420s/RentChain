import { useState, useEffect } from 'react'

export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { enableHighAccuracy = true, timeout = 10000, maximumAge = 600000 } = options

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      return
    }

    const getLocation = () => {
      setIsLoading(true)
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
          setError('')
          setIsLoading(false)
        },
        (error) => {
          setError(getErrorMessage(error))
          setIsLoading(false)
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge
        }
      )
    }

    getLocation()
  }, [enableHighAccuracy, timeout, maximumAge])

  const getErrorMessage = (error) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Location access denied by user.'
      case error.POSITION_UNAVAILABLE:
        return 'Location information is unavailable.'
      case error.TIMEOUT:
        return 'Location request timed out.'
      default:
        return 'An unknown error occurred while getting location.'
    }
  }

  const refreshLocation = () => {
    if (!navigator.geolocation) return

    setIsLoading(true)
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
        setError('')
        setIsLoading(false)
      },
      (error) => {
        setError(getErrorMessage(error))
        setIsLoading(false)
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge
      }
    )
  }

  return {
    location,
    error,
    isLoading,
    refreshLocation
  }
}