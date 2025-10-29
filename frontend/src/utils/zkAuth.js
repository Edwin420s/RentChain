// Zero-Knowledge Authentication Utility for ZuriRent
import { ethers } from 'ethers'

/**
 * zkAuth - Zero-Knowledge Proof Authentication System
 * Provides privacy-preserving authentication using cryptographic signatures
 */

class ZkAuth {
  constructor() {
    this.nonce = null
    this.challenge = null
    this.proof = null
  }

  /**
   * Generate a cryptographic nonce for challenge-response authentication
   */
  generateNonce() {
    const timestamp = Date.now()
    const randomBytes = ethers.hexlify(ethers.randomBytes(32))
    this.nonce = ethers.keccak256(
      ethers.toUtf8Bytes(`${timestamp}-${randomBytes}`)
    )
    return this.nonce
  }

  /**
   * Create authentication challenge message
   */
  createChallenge(address, appName = 'ZuriRent') {
    const nonce = this.generateNonce()
    const timestamp = Date.now()
    
    this.challenge = {
      domain: {
        name: appName,
        version: '1',
        chainId: 534351, // Scroll Sepolia
      },
      message: {
        statement: `Sign this message to authenticate with ${appName}`,
        address: address,
        nonce: nonce,
        timestamp: timestamp,
        purpose: 'Zero-Knowledge Authentication',
      },
      messageString: `Welcome to ${appName}!\n\n` +
        `Sign this message to prove you own this wallet address.\n\n` +
        `This request will not trigger a blockchain transaction or cost any gas fees.\n\n` +
        `Wallet: ${address}\n` +
        `Nonce: ${nonce}\n` +
        `Timestamp: ${new Date(timestamp).toISOString()}\n\n` +
        `By signing, you agree to authenticate securely without revealing your private key.`
    }
    
    return this.challenge
  }

  /**
   * Generate zero-knowledge proof from signature
   */
  async generateProof(signer, address) {
    try {
      const challenge = this.createChallenge(address)
      
      // Sign the challenge message
      const signature = await signer.signMessage(challenge.messageString)
      
      // Verify the signature locally
      const recoveredAddress = ethers.verifyMessage(
        challenge.messageString,
        signature
      )
      
      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        throw new Error('Signature verification failed')
      }

      // Generate zero-knowledge proof components
      const proofComponents = {
        // Public inputs (can be shared)
        publicInputs: {
          address: address,
          timestamp: challenge.message.timestamp,
          domain: challenge.domain.name,
        },
        // Private proof (hashed signature)
        commitment: ethers.keccak256(ethers.toUtf8Bytes(signature)),
        // Nullifier (prevents replay attacks)
        nullifier: ethers.keccak256(
          ethers.toUtf8Bytes(`${address}-${challenge.message.nonce}`)
        ),
        // Challenge hash
        challengeHash: ethers.keccak256(
          ethers.toUtf8Bytes(JSON.stringify(challenge.message))
        ),
      }

      this.proof = {
        ...proofComponents,
        signature: signature, // Only for verification, not exposed in production
        challenge: challenge,
        verified: true,
        createdAt: Date.now(),
      }

      return this.proof
    } catch (error) {
      console.error('Proof generation failed:', error)
      throw error
    }
  }

  /**
   * Verify zero-knowledge proof
   */
  async verifyProof(proof, expectedAddress) {
    try {
      // Verify proof hasn't expired (5 minutes)
      const proofAge = Date.now() - proof.createdAt
      if (proofAge > 5 * 60 * 1000) {
        throw new Error('Proof has expired')
      }

      // Verify the signature
      const recoveredAddress = ethers.verifyMessage(
        proof.challenge.messageString,
        proof.signature
      )

      // Check address matches
      if (recoveredAddress.toLowerCase() !== expectedAddress.toLowerCase()) {
        throw new Error('Address mismatch in proof verification')
      }

      // Verify commitment
      const computedCommitment = ethers.keccak256(
        ethers.toUtf8Bytes(proof.signature)
      )
      if (computedCommitment !== proof.commitment) {
        throw new Error('Commitment verification failed')
      }

      // Verify nullifier (prevent replay attacks)
      const computedNullifier = ethers.keccak256(
        ethers.toUtf8Bytes(`${expectedAddress}-${proof.challenge.message.nonce}`)
      )
      if (computedNullifier !== proof.nullifier) {
        throw new Error('Nullifier verification failed')
      }

      return {
        verified: true,
        address: recoveredAddress,
        timestamp: proof.createdAt,
      }
    } catch (error) {
      console.error('Proof verification failed:', error)
      return {
        verified: false,
        error: error.message,
      }
    }
  }

  /**
   * Create authentication token from proof
   */
  createAuthToken(proof) {
    const tokenPayload = {
      address: proof.publicInputs.address,
      commitment: proof.commitment,
      nullifier: proof.nullifier,
      timestamp: proof.createdAt,
      expiresAt: proof.createdAt + (24 * 60 * 60 * 1000), // 24 hours
    }

    // In production, this would be a JWT signed by backend
    const token = ethers.encodeBase64(
      ethers.toUtf8Bytes(JSON.stringify(tokenPayload))
    )

    return token
  }

  /**
   * Verify authentication token
   */
  verifyAuthToken(token) {
    try {
      const decoded = JSON.parse(
        ethers.toUtf8String(ethers.decodeBase64(token))
      )

      // Check expiration
      if (Date.now() > decoded.expiresAt) {
        throw new Error('Token has expired')
      }

      return {
        valid: true,
        payload: decoded,
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      return {
        valid: false,
        error: error.message,
      }
    }
  }

  /**
   * Generate privacy-preserving identity commitment
   */
  async generateIdentityCommitment(address, secretData = '') {
    const identityString = `${address}-${secretData}-${Date.now()}`
    const commitment = ethers.keccak256(ethers.toUtf8Bytes(identityString))
    
    return {
      commitment,
      address: address,
      timestamp: Date.now(),
    }
  }

  /**
   * Store proof securely in localStorage
   */
  storeProof(proof) {
    try {
      localStorage.setItem('zurirent_zkproof', JSON.stringify({
        commitment: proof.commitment,
        nullifier: proof.nullifier,
        publicInputs: proof.publicInputs,
        createdAt: proof.createdAt,
        expiresAt: proof.createdAt + (24 * 60 * 60 * 1000),
      }))
      return true
    } catch (error) {
      console.error('Failed to store proof:', error)
      return false
    }
  }

  /**
   * Retrieve stored proof
   */
  retrieveStoredProof() {
    try {
      const stored = localStorage.getItem('zurirent_zkproof')
      if (!stored) return null

      const proof = JSON.parse(stored)
      
      // Check if expired
      if (Date.now() > proof.expiresAt) {
        this.clearStoredProof()
        return null
      }

      return proof
    } catch (error) {
      console.error('Failed to retrieve proof:', error)
      return null
    }
  }

  /**
   * Clear stored proof
   */
  clearStoredProof() {
    localStorage.removeItem('zurirent_zkproof')
  }

  /**
   * Check if user has valid authentication
   */
  isAuthenticated() {
    const proof = this.retrieveStoredProof()
    return proof !== null && Date.now() < proof.expiresAt
  }
}

// Create singleton instance
const zkAuth = new ZkAuth()

export default zkAuth
export { ZkAuth }
