import React, { useState } from 'react'
import { Image } from 'lucide-react'

const ImageWithFallback = ({ 
  src, 
  alt, 
  fallbackSrc = '/images/placeholder-property.jpg',
  className = '',
  ...props 
}) => {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded flex items-center justify-center">
          <Image className="h-8 w-8 text-gray-400" />
        </div>
      )}
      
      <img
        src={hasError ? fallbackSrc : src}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        {...props}
      />
    </div>
  )
}

export default ImageWithFallback