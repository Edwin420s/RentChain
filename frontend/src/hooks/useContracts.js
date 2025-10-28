import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { useWeb3 } from './useWeb3'

// Mock ABI - Replace with actual contract ABIs
const RENTAL_AGREEMENT_ABI = [
  "function createAgreement(address tenant, uint256 rent, uint256 deposit, uint256 duration) external",
  "function payRent(uint256 agreementId) external payable",
  "function releaseDeposit(uint256 agreementId) external",
  "function getAgreement(uint256 agreementId) external view returns (tuple)",
  "event AgreementCreated(uint256 indexed agreementId, address indexed landlord, address indexed tenant)",
  "event RentPaid(uint256 indexed agreementId, address payer, uint256 amount)"
]

const PROPERTY_REGISTRY_ABI = [
  "function registerProperty(string memory ipfsHash, uint256 price, string memory location) external",
  "function getProperty(uint256 propertyId) external view returns (tuple)",
  "event PropertyRegistered(uint256 indexed propertyId, address indexed owner, string ipfsHash)"
]

export const useContracts = () => {
  const { provider, signer, account, isConnected } = useWeb3()
  const [contracts, setContracts] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Contract addresses - Replace with actual deployed addresses
  const CONTRACT_ADDRESSES = {
    rentalAgreement: '0x...',
    propertyRegistry: '0x...',
    escrowManager: '0x...'
  }

  // Initialize contracts when signer is available
  useEffect(() => {
    if (signer && isConnected) {
      initializeContracts()
    }
  }, [signer, isConnected])

  const initializeContracts = useCallback(async () => {
    try {
      setIsLoading(true)
      
      const rentalAgreement = new ethers.Contract(
        CONTRACT_ADDRESSES.rentalAgreement,
        RENTAL_AGREEMENT_ABI,
        signer
      )

      const propertyRegistry = new ethers.Contract(
        CONTRACT_ADDRESSES.propertyRegistry,
        PROPERTY_REGISTRY_ABI,
        signer
      )

      setContracts({
        rentalAgreement,
        propertyRegistry
      })

    } catch (err) {
      setError('Failed to initialize contracts: ' + err.message)
      console.error('Contract initialization error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [signer, isConnected])

  // Contract methods
  const createRentalAgreement = useCallback(async (tenant, rent, deposit, duration) => {
    if (!contracts.rentalAgreement) throw new Error('Contract not initialized')
    
    try {
      setIsLoading(true)
      const tx = await contracts.rentalAgreement.createAgreement(
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
  }, [contracts.rentalAgreement])

  const payRent = useCallback(async (agreementId, amount) => {
    if (!contracts.rentalAgreement) throw new Error('Contract not initialized')
    
    try {
      setIsLoading(true)
      const tx = await contracts.rentalAgreement.payRent(agreementId, {
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
  }, [contracts.rentalAgreement])

  const registerProperty = useCallback(async (ipfsHash, price, location) => {
    if (!contracts.propertyRegistry) throw new Error('Contract not initialized')
    
    try {
      setIsLoading(true)
      const tx = await contracts.propertyRegistry.registerProperty(
        ipfsHash,
        ethers.parseEther(price.toString()),
        location
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
    if (!contracts.rentalAgreement) throw new Error('Contract not initialized')
    
    try {
      const agreement = await contracts.rentalAgreement.getAgreement(agreementId)
      return {
        id: agreementId,
        landlord: agreement.landlord,
        tenant: agreement.tenant,
        rentAmount: ethers.formatEther(agreement.rentAmount),
        depositAmount: ethers.formatEther(agreement.depositAmount),
        startDate: new Date(agreement.startDate * 1000),
        endDate: new Date(agreement.endDate * 1000),
        status: agreement.status
      }
    } catch (err) {
      setError('Failed to get agreement: ' + err.message)
      throw err
    }
  }, [contracts.rentalAgreement])

  // Event listeners
  const listenToAgreementEvents = useCallback((callback) => {
    if (!contracts.rentalAgreement) return
    
    contracts.rentalAgreement.on('AgreementCreated', (agreementId, landlord, tenant) => {
      callback({
        type: 'AgreementCreated',
        agreementId: agreementId.toString(),
        landlord,
        tenant
      })
    })

    contracts.rentalAgreement.on('RentPaid', (agreementId, payer, amount) => {
      callback({
        type: 'RentPaid',
        agreementId: agreementId.toString(),
        payer,
        amount: ethers.formatEther(amount)
      })
    })

    // Cleanup function
    return () => {
      contracts.rentalAgreement.removeAllListeners('AgreementCreated')
      contracts.rentalAgreement.removeAllListeners('RentPaid')
    }
  }, [contracts.rentalAgreement])

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
    listenToAgreementEvents
  }
}