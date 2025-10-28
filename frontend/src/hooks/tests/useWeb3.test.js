import { renderHook, act } from '@testing-library/react'
import { useWeb3 } from '../useWeb3'

// Mock ethers
jest.mock('ethers', () => ({
  BrowserProvider: jest.fn().mockImplementation(() => ({
    getSigner: jest.fn().mockResolvedValue({
      getAddress: jest.fn().mockResolvedValue('0x742d35Cc6634C0532925a3b8D4C9e7a7a8b5f1e1')
    })
  })),
  toQuantity: jest.fn().mockReturnValue('0x1')
}))

describe('useWeb3', () => {
  beforeEach(() => {
    // Reset window.ethereum mock
    window.ethereum = {
      request: jest.fn(),
      on: jest.fn(),
      removeListener: jest.fn(),
      selectedAddress: null,
      chainId: '0x1'
    }
  })

  it('initializes with disconnected state', () => {
    const { result } = renderHook(() => useWeb3())
    
    expect(result.current.isConnected).toBe(false)
    expect(result.current.account).toBe('')
    expect(result.current.isLoading).toBe(false)
  })

  it('handles successful wallet connection', async () => {
    const mockAccounts = ['0x742d35Cc6634C0532925a3b8D4C9e7a7a8b5f1e1']
    window.ethereum.request.mockResolvedValue(mockAccounts)
    
    const { result } = renderHook(() => useWeb3())
    
    await act(async () => {
      await result.current.connectWallet()
    })
    
    expect(result.current.isConnected).toBe(true)
    expect(result.current.account).toBe(mockAccounts[0])
    expect(result.current.isLoading).toBe(false)
  })

  it('handles wallet connection error', async () => {
    const errorMessage = 'User rejected the request'
    window.ethereum.request.mockRejectedValue(new Error(errorMessage))
    
    const { result } = renderHook(() => useWeb3())
    
    await act(async () => {
      await result.current.connectWallet()
    })
    
    expect(result.current.isConnected).toBe(false)
    expect(result.current.error).toBe(errorMessage)
    expect(result.current.isLoading).toBe(false)
  })

  it('handles missing ethereum provider', async () => {
    delete window.ethereum
    
    const { result } = renderHook(() => useWeb3())
    
    await act(async () => {
      await result.current.connectWallet()
    })
    
    expect(result.current.error).toBe('Please install MetaMask')
  })

  it('disconnects wallet correctly', async () => {
    const mockAccounts = ['0x742d35Cc6634C0532925a3b8D4C9e7a7a8b5f1e1']
    window.ethereum.request.mockResolvedValue(mockAccounts)
    
    const { result } = renderHook(() => useWeb3())
    
    // First connect
    await act(async () => {
      await result.current.connectWallet()
    })
    
    // Then disconnect
    act(() => {
      result.current.disconnectWallet()
    })
    
    expect(result.current.isConnected).toBe(false)
    expect(result.current.account).toBe('')
  })
})