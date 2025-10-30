/**
 * Contract ABIs and Configuration
 * 
 * This module exports contract ABIs and configuration utilities
 */

// Import ABIs
import RentChainMainABI from './RentChainMain.json';
import PropertyRegistryABI from './PropertyRegistry.json';
import RentAgreementABI from './RentAgreement.json';
import EscrowManagerABI from './EscrowManager.json';
import PaymentProcessorABI from './PaymentProcessor.json';
import UserRegistryABI from './UserRegistry.json';
import DisputeResolutionABI from './DisputeResolution.json';
import ReviewSystemABI from './ReviewSystem.json';
import RentChainTokenABI from './RentChainToken.json';

// Export individual ABIs
export {
  RentChainMainABI,
  PropertyRegistryABI,
  RentAgreementABI,
  EscrowManagerABI,
  PaymentProcessorABI,
  UserRegistryABI,
  DisputeResolutionABI,
  ReviewSystemABI,
  RentChainTokenABI
};

// Export all ABIs as an object
export const CONTRACT_ABIS = {
  RentChainMain: RentChainMainABI,
  PropertyRegistry: PropertyRegistryABI,
  RentAgreement: RentAgreementABI,
  EscrowManager: EscrowManagerABI,
  PaymentProcessor: PaymentProcessorABI,
  UserRegistry: UserRegistryABI,
  DisputeResolution: DisputeResolutionABI,
  ReviewSystem: ReviewSystemABI,
  RentChainToken: RentChainTokenABI
};

// Re-export configuration utilities
export * from './config';
