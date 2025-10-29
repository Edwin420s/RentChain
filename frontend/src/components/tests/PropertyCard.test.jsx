import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import PropertyCard from '../PropertyCard'

const mockProperty = {
  id: 1,
  title: 'Modern Apartment in Westlands',
  location: 'Westlands, Nairobi',
  price: 45000,
  image: 'test-image.jpg',
  bedrooms: 2,
  bathrooms: 2,
  amenities: ['wifi', 'parking'],
  description: 'Beautiful modern apartment with great amenities and security.'
}

const mockOnViewDetails = jest.fn()

describe('PropertyCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders property information correctly', () => {
    render(<PropertyCard property={mockProperty} onViewDetails={mockOnViewDetails} />)
    
    expect(screen.getByText('Modern Apartment in Westlands')).toBeInTheDocument()
    expect(screen.getByText('Westlands, Nairobi')).toBeInTheDocument()
    expect(screen.getByText('$45,000/month')).toBeInTheDocument()
    expect(screen.getByText('2 beds')).toBeInTheDocument()
    expect(screen.getByText('2 baths')).toBeInTheDocument()
  })

  it('calls onViewDetails when view details button is clicked', () => {
    render(<PropertyCard property={mockProperty} onViewDetails={mockOnViewDetails} />)
    
    const viewDetailsButton = screen.getByText('View Details')
    fireEvent.click(viewDetailsButton)
    
    expect(mockOnViewDetails).toHaveBeenCalledWith(mockProperty)
  })

  it('displays amenities icons when available', () => {
    render(<PropertyCard property={mockProperty} onViewDetails={mockOnViewDetails} />)
    
    // Should show wifi and parking icons
    expect(screen.getByTestId('wifi-icon')).toBeInTheDocument()
    expect(screen.getByTestId('car-icon')).toBeInTheDocument()
  })

  it('handles missing image gracefully', () => {
    const propertyWithoutImage = { ...mockProperty, image: null }
    
    render(<PropertyCard property={propertyWithoutImage} onViewDetails={mockOnViewDetails} />)
    
    const image = screen.getByAltText('Modern Apartment in Westlands')
    expect(image).toHaveAttribute('src', 'test-image.jpg')
  })

  it('applies correct styling for price badge', () => {
    render(<PropertyCard property={mockProperty} onViewDetails={mockOnViewDetails} />)
    
    const priceBadge = screen.getByText('KSh 45,000/month')
    expect(priceBadge).toHaveClass('bg-white')
  })
})