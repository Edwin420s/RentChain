import React, { useState, useRef, useEffect } from 'react'
import { MapPin, Navigation } from 'lucide-react'

const MapView = ({ properties, onPropertySelect, center, zoom = 12 }) => {
  const mapRef = useRef(null)
  const [selectedProperty, setSelectedProperty] = useState(null)

  // Mock map implementation - in real app, integrate with Google Maps or Mapbox
  useEffect(() => {
    // Initialize map here
    console.log('Initializing map with properties:', properties.length)
  }, [properties])

  const handlePropertyClick = (property) => {
    setSelectedProperty(property)
    onPropertySelect(property)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Map Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-text">Property Locations</h3>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>{properties.length} properties</span>
          <button className="p-1 hover:bg-secondary rounded transition-colors">
            <Navigation className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapRef} className="h-96 bg-gray-100 relative">
        {/* Mock Map - Replace with actual map implementation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
            <div className="text-text font-semibold">Interactive Map</div>
            <div className="text-gray-600 text-sm mt-2">
              {properties.length} properties in this area
            </div>
          </div>
        </div>

        {/* Property Markers */}
        {properties.map((property, index) => (
          <div
            key={property.id}
            className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${20 + (index * 15) % 70}%`,
              top: `${30 + (index * 10) % 60}%`
            }}
            onClick={() => handlePropertyClick(property)}
          >
            <div className={`p-2 rounded-full shadow-lg transition-all ${
              selectedProperty?.id === property.id
                ? 'bg-primary text-white scale-110'
                : 'bg-white text-primary hover:scale-105'
            }`}>
              <MapPin className="h-4 w-4" />
            </div>
            {selectedProperty?.id === property.id && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white p-3 rounded-lg shadow-lg border border-gray-200 min-w-48">
                <div className="font-semibold text-text text-sm">
                  {property.title}
                </div>
                <div className="text-gray-600 text-xs mt-1">
                  ${property.price}/month
                </div>
                <div className="text-gray-500 text-xs">
                  {property.bedrooms} bed, {property.bathrooms} bath
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Map Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex space-x-2">
          <button className="bg-white border border-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-50 transition-colors">
            Zoom In
          </button>
          <button className="bg-white border border-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-50 transition-colors">
            Zoom Out
          </button>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded text-sm hover:bg-blue-800 transition-colors">
          Use My Location
        </button>
      </div>
    </div>
  )
}

export default MapView