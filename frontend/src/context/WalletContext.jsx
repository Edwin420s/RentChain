import React, { createContext, useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'

const WalletContext = createContext()

const SCROLL_SEPOLIA_CHAIN_ID = '0x8274F' // 534351 in hex

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

export const WalletProvider = ({ children, onWalletConnected }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState('')
  const [balance, setBalance] = useState('0')
  const [chainId, setChainId] = useState('')
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false)
  const [provider, setProvider] = useState(null)

  useEffect(() => {
    if (window.ethereum && window.ethereum.isMetaMask !== false) {
      const web3Provider = new ethers.BrowserProvider(window.ethereum)
      setProvider(web3Provider)
      
      // Check if already connected
      checkConnection()
      
      // Listen for account changes - check if method exists
      if (typeof window.ethereum.on === 'function') {
        window.ethereum.on('accountsChanged', handleAccountsChanged)
        window.ethereum.on('chainChanged', handleChainChanged)
      }
      
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
          window.ethereum.removeListener('chainChanged', handleChainChanged)
        }
      }
    }
  }, [])

  const checkConnection = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' })
        
        if (accounts.length > 0) {
          setAccount(accounts[0])
          setIsConnected(true)
          setChainId(currentChainId)
          setIsCorrectNetwork(currentChainId === SCROLL_SEPOLIA_CHAIN_ID)
          
          // Get balance
          if (provider) {
            const bal = await provider.getBalance(accounts[0])
            setBalance(ethers.formatEther(bal))
          }
          
          if (onWalletConnected) {
            onWalletConnected(accounts[0])
          }
        }
      }
    } catch (error) {
      console.error('Error checking connection:', error)
    }
  }

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet()
    } else {
      setAccount(accounts[0])
      setIsConnected(true)
      updateBalance(accounts[0])
      
      if (onWalletConnected) {
        onWalletConnected(accounts[0])
      }
    }
  }

  const handleChainChanged = (newChainId) => {
    setChainId(newChainId)
    setIsCorrectNetwork(newChainId === SCROLL_SEPOLIA_CHAIN_ID)
    window.location.reload() // Recommended by MetaMask
  }

  const updateBalance = async (address) => {
    try {
      if (provider && address) {
        const bal = await provider.getBalance(address)
        setBalance(ethers.formatEther(bal))
      }
    } catch (error) {
      console.error('Error updating balance:', error)
    }
  }

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to use this application!')
      return
    }

    // Check if it's an Ethereum wallet (not Cardano)
    if (window.ethereum.isMetaMask === false || typeof window.ethereum.request !== 'function') {
      alert('Please install MetaMask or an Ethereum-compatible wallet to use this application!')
      return
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })
      
      // Get chain ID
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' })
      
      setAccount(accounts[0])
      setIsConnected(true)
      setChainId(currentChainId)
      setIsCorrectNetwork(currentChainId === SCROLL_SEPOLIA_CHAIN_ID)
      
      // Update balance
      await updateBalance(accounts[0])
      
      // Switch to Scroll Sepolia if not on it
      if (currentChainId !== SCROLL_SEPOLIA_CHAIN_ID) {
        await switchToScrollSepolia()
      }
      
      // Trigger callback
      if (onWalletConnected) {
        onWalletConnected(accounts[0])
      }
    } catch (error) {
      console.error('Wallet connection error:', error)
      alert('Failed to connect wallet. Please try again.')
    }
  }

  const switchToScrollSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SCROLL_SEPOLIA_CHAIN_ID }],
      })
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: SCROLL_SEPOLIA_CHAIN_ID,
                chainName: 'Scroll Sepolia',
                nativeCurrency: {
                  name: 'Ether',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://sepolia-rpc.scroll.io'],
                blockExplorerUrls: ['https://sepolia.scrollscan.dev'],
              },
            ],
          })
        } catch (addError) {
          console.error('Error adding Scroll Sepolia network:', addError)
          alert('Failed to add Scroll Sepolia network. Please add it manually.')
        }
      } else {
        console.error('Error switching network:', switchError)
      }
    }
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setAccount('')
    setBalance('0')
    setChainId('')
    setIsCorrectNetwork(false)
  }

  const value = {
    isConnected,
    account,
    balance,
    chainId,
    isCorrectNetwork,
    provider,
    connectWallet,
    disconnectWallet,
    switchToScrollSepolia,
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}