import React, { useState } from 'react'
import SearchBar from '../components/SearchBar'
import PropertyCard from '../components/PropertyCard'

const SearchPage = ({ onPropertySelect }) => {
  const [properties, setProperties] = useState([
    {
      id: 1,
      title: 'Modern Apartment in Westlands',
      location: 'Westlands, Nairobi',
      price: 45000,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
      bedrooms: 2,
      bathrooms: 2,
      amenities: ['wifi', 'parking'],
      description: 'Beautiful modern apartment with great amenities and security.'
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
      description: 'Perfect studio apartment for young professionals.'
    },
    {
      id: 3,
      title: 'Spacious Family House',
      location: 'Kilimani, Nairobi',
      price: 80000,
      image: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=400',
      bedrooms: 3,
      bathrooms: 3,
      amenities: ['wifi', 'parking'],
      description: 'Large family home with garden and parking space.'
    }
  ])

  const handleSearch = (filters) => {
    // Filter properties based on search criteria
  }

  const handleViewDetails = (property) => {
    onPropertySelect(property)
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Section */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Results Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-text">
              Available Properties
            </h2>
            <div className="text-gray-600">
              {properties.length} properties found
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(property => (
              <PropertyCard
                key={property.id}
                property={property}
                onViewDetails={() => handleViewDetails(property)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchPage