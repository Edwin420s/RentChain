import React, { createContext, useContext, useState, useEffect } from 'react'
import { useWallet } from './WalletContext'
import { ethers } from 'ethers'
import zkAuth from '../utils/zkAuth'

const ZkLoginContext = createContext()

export const useZkLogin = () => {
  const context = useContext(ZkLoginContext)
  if (!context) {
    throw new Error('useZkLogin must be used within a ZkLoginProvider')
  }
  return context
}

export const ZkLoginProvider = ({ children }) => {
  const { isConnected, account } = useWallet()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [proof, setProof] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [authToken, setAuthToken] = useState(null)

  // Check for existing authentication on mount
  useEffect(() => {
    checkExistingAuth()
  }, [])

  // Update authentication status when wallet changes
  useEffect(() => {
    if (!isConnected) {
      logout()
    }
  }, [isConnected, account])

  const checkExistingAuth = () => {
    const storedProof = zkAuth.retrieveStoredProof()
    if (storedProof && zkAuth.isAuthenticated()) {
      setIsAuthenticated(true)
      setProof(storedProof)
    }
  }

  const authenticate = async () => {
    if (!isConnected || !account) {
      setError('Please connect your wallet first')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      // Get provider and signer
      if (!window.ethereum) {
        throw new Error('MetaMask not found')
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      // Generate zero-knowledge proof
      const generatedProof = await zkAuth.generateProof(signer, account)

      // Verify proof locally
      const verification = await zkAuth.verifyProof(generatedProof, account)

      if (!verification.verified) {
        throw new Error('Proof verification failed')
      }

      // Create authentication token
      const token = zkAuth.createAuthToken(generatedProof)

      // Store proof securely
      zkAuth.storeProof(generatedProof)

      // Update state
      setProof(generatedProof)
      setAuthToken(token)
      setIsAuthenticated(true)

      // Track authentication event
      console.log('🔐 Zero-Knowledge Authentication Successful')
      
      // Send to backend for verification (in production)
      await sendProofToBackend(generatedProof, token)

      return true
    } catch (err) {
      console.error('Authentication error:', err)
      setError(err.message || 'Authentication failed')
      setIsAuthenticated(false)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const sendProofToBackend = async (proof, token) => {
    try {
      // In production, send proof to backend for verification
      const response = await fetch('/api/auth/zk-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commitment: proof.commitment,
          nullifier: proof.nullifier,
          publicInputs: proof.publicInputs,
          challengeHash: proof.challengeHash,
          token: token,
        }),
      })

      if (!response.ok) {
        console.warn('Backend verification failed, using local verification')
      }

      return response.ok
    } catch (error) {
      // Fallback to local verification in development
      console.warn('Backend not available, using local verification:', error)
      return true
    }
  }

  const logout = () => {
    zkAuth.clearStoredProof()
    setIsAuthenticated(false)
    setProof(null)
    setAuthToken(null)
    setError(null)
  }

  const verifyIdentity = async (additionalData = {}) => {
    if (!isAuthenticated || !proof) {
      throw new Error('Not authenticated')
    }

    try {
      // Generate identity commitment with additional data
      const identityCommitment = await zkAuth.generateIdentityCommitment(
        account,
        JSON.stringify(additionalData)
      )

      return {
        verified: true,
        commitment: identityCommitment.commitment,
        timestamp: identityCommitment.timestamp,
      }
    } catch (error) {
      console.error('Identity verification failed:', error)
      throw error
    }
  }

  const refreshAuthentication = async () => {
    // Check if current auth is still valid
    if (zkAuth.isAuthenticated()) {
      return true
    }

    // Re-authenticate if expired
    return await authenticate()
  }

  const value = {
    // State
    isAuthenticated,
    proof,
    authToken,
    isLoading,
    error,
    
    // Methods
    authenticate,
    logout,
    verifyIdentity,
    refreshAuthentication,
    
    // Helpers
    isAuthExpired: () => !zkAuth.isAuthenticated(),
  }

  return (
    <ZkLoginContext.Provider value={value}>
      {children}
    </ZkLoginContext.Provider>
  )
}
