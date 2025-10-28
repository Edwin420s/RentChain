import '@testing-library/jest-dom'

// Mock window.ethereum
Object.defineProperty(window, 'ethereum', {
  value: {
    request: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
    selectedAddress: null,
    chainId: '0x1'
  },
  writable: true
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock scrollTo
window.scrollTo = jest.fn()

// Suppress console errors during tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// Global test utilities
global.testUtils = {
  createMockProperty: (overrides = {}) => ({
    id: 1,
    title: 'Modern Apartment in Westlands',
    location: 'Westlands, Nairobi',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
    bedrooms: 2,
    bathrooms: 2,
    amenities: ['wifi', 'parking'],
    description: 'Beautiful modern apartment with great amenities and security.',
    ...overrides
  }),
  
  createMockUser: (overrides = {}) => ({
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    wallet: '0x742d35Cc6634C0532925a3b8D4C9e7a7a8b5f1e1',
    role: 'tenant',
    ...overrides
  }),

  createMockAgreement: (overrides = {}) => ({
    id: 1,
    landlord: '0xLandlordAddress',
    tenant: '0xTenantAddress',
    rentAmount: '45000',
    depositAmount: '45000',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    status: 'active',
    ...overrides
  }),

  waitForLoading: () => new Promise(resolve => setTimeout(resolve, 0))
}