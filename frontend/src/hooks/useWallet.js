import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

export const useWallet = () => {
  const [account, setAccount] = useState('')
  const [balance, setBalance] = useState('0')
  const [chainId, setChainId] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [provider, setProvider] = useState(null)

  useEffect(() => {
    checkConnection()
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          await handleAccountsChanged(accounts)
        }
      } catch (error) {
        console.error('Error checking connection:', error)
      }
    }
  }

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      setIsConnected(false)
      setAccount('')
      setBalance('0')
    } else {
      setAccount(accounts[0])
      await getBalance(accounts[0])
      setIsConnected(true)
    }
  }

  const handleChainChanged = (chainId) => {
    setChainId(chainId)
    window.location.reload()
  }

  const getBalance = async (address) => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const balance = await provider.getBalance(address)
        setBalance(ethers.formatEther(balance))
      } catch (error) {
        console.error('Error getting balance:', error)
      }
    }
  }

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        })
        await handleAccountsChanged(accounts)
        return accounts[0]
      } catch (error) {
        console.error('Error connecting wallet:', error)
        throw error
      }
    } else {
      throw new Error('Please install MetaMask')
    }
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setAccount('')
    setBalance('0')
    setProvider(null)
  }

  const switchNetwork = async (chainId) => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chainId.toString(16)}` }]
        })
      } catch (error) {
        console.error('Error switching network:', error)
        throw error
      }
    }
  }

  return {
    account,
    balance,
    chainId,
    isConnected,
    provider,
    connectWallet,
    disconnectWallet,
    switchNetwork
  }
}