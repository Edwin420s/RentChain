import React, { createContext, useContext, useState, useEffect } from 'react'

const WalletContext = createContext()

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

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        })
        setIsConnected(true)
        setAccount(accounts[0])
        setBalance('0.5')
        
        // Trigger callback after successful connection
        if (onWalletConnected) {
          onWalletConnected(accounts[0])
        }
      } catch (error) {
        console.error('Wallet connection error:', error)
      }
    } else {
      alert('Please install MetaMask!')
    }
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setAccount('')
    setBalance('0')
  }

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
        } else {
          disconnectWallet()
        }
      })
    }
  }, [])

  const value = {
    isConnected,
    account,
    balance,
    connectWallet,
    disconnectWallet,
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}