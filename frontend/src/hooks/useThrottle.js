import { useRef, useCallback } from 'react'

export const useThrottle = (callback, delay) => {
  const lastCall = useRef(0)

  return useCallback((...args) => {
    const now = Date.now()
    if (now - lastCall.current >= delay) {
      lastCall.current = now
      callback(...args)
    }
  }, [callback, delay])
}