import React from 'react'
import { MapPin, Bed, Bath, Wifi, Car } from 'lucide-react'

const PropertyCard = ({ property, onViewDetails }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Property Image */}
      <div className="relative h-48 bg-gray-200">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full text-sm font-medium text-text">
          KSh {property.price.toLocaleString('en-KE')}/month
        </div>
      </div>

      {/* Property Details */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-text mb-2">{property.title}</h3>
        
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>

        {/* Amenities */}
        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Bed className="h-4 w-4" />
            <span>{property.bedrooms} beds</span>
          </div>
          <div className="flex items-center space-x-1">
            <Bath className="h-4 w-4" />
            <span>{property.bathrooms} baths</span>
          </div>
        </div>

        {/* Additional Features */}
        <div className="flex items-center space-x-4 mb-4">
          {property.amenities.includes('wifi') && (
            <Wifi className="h-4 w-4 text-gray-500" />
          )}
          {property.amenities.includes('parking') && (
            <Car className="h-4 w-4 text-gray-500" />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={onViewDetails}
            className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors font-medium text-sm"
          >
            View Details
          </button>
          <button className="bg-secondary text-text py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm">
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default PropertyCard