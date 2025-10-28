import React from 'react'

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary',
  text = '',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  const colorClasses = {
    primary: 'text-primary',
    white: 'text-white',
    gray: 'text-gray-400'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        <div
          className={`animate-spin rounded-full border-b-2 border-current ${sizeClasses[size]} ${colorClasses[color]}`}
        ></div>
      </div>
      {text && (
        <p className="mt-2 text-sm text-gray-600">{text}</p>
      )}
    </div>
  )
}

export const PageLoader = ({ message = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-secondary">
    <LoadingSpinner size="lg" text={message} />
  </div>
)

export const ButtonLoader = ({ text = 'Processing...' }) => (
  <div className="flex items-center space-x-2">
    <LoadingSpinner size="sm" color="white" />
    <span>{text}</span>
  </div>
)

export const CardLoader = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
    <div className="flex space-x-4">
      <div className="rounded-full bg-gray-200 h-12 w-12"></div>
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  </div>
)

export const TableLoader = ({ rows = 5, columns = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4 animate-pulse">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div
            key={colIndex}
            className="h-4 bg-gray-200 rounded flex-1"
            style={{
              maxWidth: colIndex === 0 ? '100px' : 
                       colIndex === columns - 1 ? '80px' : 'auto'
            }}
          ></div>
        ))}
      </div>
    ))}
  </div>
)

export default LoadingSpinner