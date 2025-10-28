import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'

export const useWeb3 = () => {
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [account, setAccount] = useState('')
  const [chainId, setChainId] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Initialize provider
  useEffect(() => {
    if (window.ethereum) {
      const web3Provider = new ethers.BrowserProvider(window.ethereum)
      setProvider(web3Provider)
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      
      // Listen for chain changes
      window.ethereum.on('chainChanged', handleChainChanged)
      
      // Check if already connected
      checkConnection()
    }
  }, [])

  const checkConnection = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts'
        })
        if (accounts.length > 0) {
          await handleAccountsChanged(accounts)
        }
      }
    } catch (err) {
      console.error('Error checking connection:', err)
    }
  }

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      // User disconnected
      setAccount('')
      setSigner(null)
      setIsConnected(false)
    } else {
      setAccount(accounts[0])
      if (provider) {
        const newSigner = await provider.getSigner()
        setSigner(newSigner)
      }
      setIsConnected(true)
    }
  }

  const handleChainChanged = (chainId) => {
    setChainId(chainId)
    window.location.reload() // Recommended by MetaMask
  }

  const connectWallet = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask')
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      await handleAccountsChanged(accounts)
      
      // Get chain ID
      const chainId = await window.ethereum.request({
        method: 'eth_chainId'
      })
      setChainId(chainId)

    } catch (err) {
      setError(err.message)
      console.error('Error connecting wallet:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWallet = () => {
    setAccount('')
    setSigner(null)
    setIsConnected(false)
    setError('')
  }

  const switchNetwork = async (chainId) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ethers.toQuantity(chainId) }]
      })
    } catch (err) {
      // This error code indicates that the chain has not been added to MetaMask
      if (err.code === 4902) {
        await addNetwork(chainId)
      } else {
        setError(err.message)
      }
    }
  }

  const addNetwork = async (chainId) => {
    // Add network configuration based on chainId
    const networkConfig = getNetworkConfig(chainId)
    if (networkConfig) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [networkConfig]
        })
      } catch (err) {
        setError(err.message)
      }
    }
  }

  const getNetworkConfig = (chainId) => {
    const networks = {
      534351: { // Scroll Sepolia
        chainId: '0x8274F',
        chainName: 'Scroll Sepolia',
        rpcUrls: ['https://sepolia-rpc.scroll.io'],
        blockExplorerUrls: ['https://sepolia-blockscout.scroll.io'],
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18
        }
      },
      534352: { // Scroll Mainnet
        chainId: '0x82750',
        chainName: 'Scroll',
        rpcUrls: ['https://rpc.scroll.io'],
        blockExplorerUrls: ['https://scrollscan.com'],
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18
        }
      }
    }
    return networks[chainId]
  }

  const signMessage = async (message) => {
    if (!signer) throw new Error('No signer available')
    return await signer.signMessage(message)
  }

  const sendTransaction = async (transaction) => {
    if (!signer) throw new Error('No signer available')
    return await signer.sendTransaction(transaction)
  }

  const getBalance = async (address = account) => {
    if (!provider || !address) return '0'
    const balance = await provider.getBalance(address)
    return ethers.formatEther(balance)
  }

  return {
    // State
    provider,
    signer,
    account,
    chainId,
    isConnected,
    isLoading,
    error,
    
    // Methods
    connectWallet,
    disconnectWallet,
    switchNetwork,
    signMessage,
    sendTransaction,
    getBalance
  }
}