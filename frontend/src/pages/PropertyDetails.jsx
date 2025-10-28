import React, { useState } from 'react'
import { MapPin, Bed, Bath, Wifi, Car, Shield, Calendar } from 'lucide-react'
import { useWallet } from '../context/WalletContext'

const PropertyDetails = ({ property }) => {
  const { isConnected, connectWallet } = useWallet()
  const [selectedDuration, setSelectedDuration] = useState(12)

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text mb-4">Property Not Found</h2>
          <p className="text-gray-600">Please select a property from the search page.</p>
        </div>
      </div>
    )
  }

  const handleRentNow = () => {
    if (!isConnected) {
      connectWallet()
      return
    }
    // In a real app, this would initiate the rental agreement smart contract
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Property Images */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Image and Gallery */}
          <div>
            <div className="bg-gray-200 rounded-lg h-96 mb-4">
              <img
                src={property.image}
                alt={property.title}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>

          {/* Property Info and Booking */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-text mb-2">{property.title}</h1>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{property.location}</span>
              </div>
              <p className="text-gray-700">{property.description}</p>
            </div>

            {/* Amenities */}
            <div>
              <h3 className="text-lg font-semibold text-text mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Bed className="h-5 w-5 text-gray-500" />
                  <span>{property.bedrooms} Bedrooms</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Bath className="h-5 w-5 text-gray-500" />
                  <span>{property.bathrooms} Bathrooms</span>
                </div>
                {property.amenities.includes('wifi') && (
                  <div className="flex items-center space-x-2">
                    <Wifi className="h-5 w-5 text-gray-500" />
                    <span>WiFi</span>
                  </div>
                )}
                {property.amenities.includes('parking') && (
                  <div className="flex items-center space-x-2">
                    <Car className="h-5 w-5 text-gray-500" />
                    <span>Parking</span>
                  </div>
                )}
              </div>
            </div>

            {/* Rental Agreement */}
            <div className="bg-secondary p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-text mb-4">Rental Agreement</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Rental Duration (months)
                  </label>
                  <select
                    value={selectedDuration}
                    onChange={(e) => setSelectedDuration(parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value={6}>6 Months</option>
                    <option value={12}>12 Months</option>
                    <option value={24}>24 Months</option>
                  </select>
                </div>

                <div className="flex justify-between items-center py-3 border-t border-gray-300">
                  <span className="text-text">Monthly Rent</span>
                  <span className="text-xl font-bold text-text">${property.price}</span>
                </div>

                <div className="flex justify-between items-center py-3 border-t border-gray-300">
                  <span className="text-text">Security Deposit</span>
                  <span className="text-xl font-bold text-text">${property.price}</span>
                </div>

                <div className="flex justify-between items-center py-3 border-t border-gray-300 font-semibold">
                  <span className="text-text">Total Due Now</span>
                  <span className="text-xl font-bold text-primary">${property.price * 2}</span>
                </div>
              </div>

              <button
                onClick={handleRentNow}
                className="w-full bg-primary text-white py-4 px-6 rounded-lg hover:bg-blue-800 transition-colors font-semibold text-lg mt-4 flex items-center justify-center space-x-2"
              >
                <Shield className="h-5 w-5" />
                <span>
                  {isConnected ? 'Rent with Smart Contract' : 'Connect Wallet to Rent'}
                </span>
              </button>

              <div className="flex items-center space-x-2 mt-3 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Funds held in escrow until move-in confirmation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyDetails