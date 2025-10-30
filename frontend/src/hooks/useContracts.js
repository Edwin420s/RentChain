import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { useWeb3 } from './useWeb3'
import { 
  CONTRACT_ABIS, 
  getContractAddresses, 
  areContractsDeployed 
} from '../contracts'

export const useContracts = () => {
  const { provider, signer, account, isConnected } = useWeb3()
  const [contracts, setContracts] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Get contract addresses from configuration
  const CONTRACT_ADDRESSES = getContractAddresses()

  // Initialize contracts when signer is available
  useEffect(() => {
    if (signer && isConnected) {
      initializeContracts()
    }
  }, [signer, isConnected])

  const initializeContracts = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Check if contracts are deployed
      if (!areContractsDeployed()) {
        setError('Contracts not deployed. Please deploy contracts first.')
        setIsLoading(false)
        return
      }

      const initializedContracts = {}

      // Initialize all core contracts
      if (CONTRACT_ADDRESSES.RentChainMain) {
        initializedContracts.main = new ethers.Contract(
          CONTRACT_ADDRESSES.RentChainMain,
          CONTRACT_ABIS.RentChainMain,
          signer
        )
      }

      if (CONTRACT_ADDRESSES.PropertyRegistry) {
        initializedContracts.propertyRegistry = new ethers.Contract(
          CONTRACT_ADDRESSES.PropertyRegistry,
          CONTRACT_ABIS.PropertyRegistry,
          signer
        )
      }

      if (CONTRACT_ADDRESSES.RentAgreement) {
        initializedContracts.rentAgreement = new ethers.Contract(
          CONTRACT_ADDRESSES.RentAgreement,
          CONTRACT_ABIS.RentAgreement,
          signer
        )
      }

      if (CONTRACT_ADDRESSES.EscrowManager) {
        initializedContracts.escrow = new ethers.Contract(
          CONTRACT_ADDRESSES.EscrowManager,
          CONTRACT_ABIS.EscrowManager,
          signer
        )
      }

      if (CONTRACT_ADDRESSES.PaymentProcessor) {
        initializedContracts.payment = new ethers.Contract(
          CONTRACT_ADDRESSES.PaymentProcessor,
          CONTRACT_ABIS.PaymentProcessor,
          signer
        )
      }

      if (CONTRACT_ADDRESSES.UserRegistry) {
        initializedContracts.userRegistry = new ethers.Contract(
          CONTRACT_ADDRESSES.UserRegistry,
          CONTRACT_ABIS.UserRegistry,
          signer
        )
      }

      if (CONTRACT_ADDRESSES.DisputeResolution) {
        initializedContracts.dispute = new ethers.Contract(
          CONTRACT_ADDRESSES.DisputeResolution,
          CONTRACT_ABIS.DisputeResolution,
          signer
        )
      }

      if (CONTRACT_ADDRESSES.ReviewSystem) {
        initializedContracts.review = new ethers.Contract(
          CONTRACT_ADDRESSES.ReviewSystem,
          CONTRACT_ABIS.ReviewSystem,
          signer
        )
      }

      if (CONTRACT_ADDRESSES.RentChainToken) {
        initializedContracts.token = new ethers.Contract(
          CONTRACT_ADDRESSES.RentChainToken,
          CONTRACT_ABIS.RentChainToken,
          signer
        )
      }

      setContracts(initializedContracts)

    } catch (err) {
      setError('Failed to initialize contracts: ' + err.message)
      console.error('Contract initialization error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [signer, isConnected])

  // Contract methods
  const createRentalAgreement = useCallback(async (tenant, rent, deposit, duration) => {
    if (!contracts.rentAgreement) throw new Error('RentAgreement contract not initialized')
    
    try {
      setIsLoading(true)
      const tx = await contracts.rentAgreement.createAgreement(
        tenant,
        ethers.parseEther(rent.toString()),
        ethers.parseEther(deposit.toString()),
        duration
      )
      const receipt = await tx.wait()
      return receipt
    } catch (err) {
      setError('Failed to create agreement: ' + err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [contracts.rentAgreement])

  const payRent = useCallback(async (agreementId, amount) => {
    if (!contracts.payment) throw new Error('PaymentProcessor contract not initialized')
    
    try {
      setIsLoading(true)
      const tx = await contracts.payment.payRent(agreementId, {
        value: ethers.parseEther(amount.toString())
      })
      const receipt = await tx.wait()
      return receipt
    } catch (err) {
      setError('Failed to pay rent: ' + err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [contracts.payment])

  const registerProperty = useCallback(async (propertyData) => {
    if (!contracts.propertyRegistry) throw new Error('PropertyRegistry contract not initialized')
    
    try {
      setIsLoading(true)
      const tx = await contracts.propertyRegistry.registerProperty(
        propertyData.title,
        propertyData.description,
        propertyData.propertyType,
        propertyData.location,
        ethers.parseEther(propertyData.price.toString()),
        propertyData.images
      )
      const receipt = await tx.wait()
      return receipt
    } catch (err) {
      setError('Failed to register property: ' + err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [contracts.propertyRegistry])

  const getAgreement = useCallback(async (agreementId) => {
    if (!contracts.rentAgreement) throw new Error('RentAgreement contract not initialized')
    
    try {
      const agreement = await contracts.rentAgreement.getAgreement(agreementId)
      return agreement
    } catch (err) {
      setError('Failed to get agreement: ' + err.message)
      throw err
    }
  }, [contracts.rentAgreement])

  const getProperty = useCallback(async (propertyId) => {
    if (!contracts.propertyRegistry) throw new Error('PropertyRegistry contract not initialized')
    
    try {
      const property = await contracts.propertyRegistry.getProperty(propertyId)
      return property
    } catch (err) {
      setError('Failed to get property: ' + err.message)
      throw err
    }
  }, [contracts.propertyRegistry])

  const registerUser = useCallback(async (userData) => {
    if (!contracts.userRegistry) throw new Error('UserRegistry contract not initialized')
    
    try {
      setIsLoading(true)
      const tx = await contracts.userRegistry.registerUser(
        userData.name,
        userData.email,
        userData.userType
      )
      const receipt = await tx.wait()
      return receipt
    } catch (err) {
      setError('Failed to register user: ' + err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [contracts.userRegistry])

  // Event listeners
  const listenToAgreementEvents = useCallback((callback) => {
    if (!contracts.rentAgreement) return
    
    contracts.rentAgreement.on('AgreementCreated', (agreementId, landlord, tenant) => {
      callback({
        type: 'AgreementCreated',
        agreementId: agreementId.toString(),
        landlord,
        tenant
      })
    })

    contracts.rentAgreement.on('RentPaid', (agreementId, payer, amount) => {
      callback({
        type: 'RentPaid',
        agreementId: agreementId.toString(),
        payer,
        amount: ethers.formatEther(amount)
      })
    })

    // Cleanup function
    return () => {
      contracts.rentAgreement.removeAllListeners('AgreementCreated')
      contracts.rentAgreement.removeAllListeners('RentPaid')
    }
  }, [contracts.rentAgreement])

  return {
    // State
    contracts,
    isLoading,
    error,
    
    // Methods
    createRentalAgreement,
    payRent,
    registerProperty,
    getAgreement,
    getProperty,
    registerUser,
    listenToAgreementEvents,
    
    // Helper
    areContractsReady: () => Object.keys(contracts).length > 0
  }
}