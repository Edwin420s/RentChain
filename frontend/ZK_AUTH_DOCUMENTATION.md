# Zero-Knowledge Authentication System - ZuriRent

## Overview

ZuriRent implements a complete **Zero-Knowledge Proof (ZKP) authentication system** that allows users to prove their identity and ownership of a wallet address without revealing their private keys. This system provides privacy-preserving authentication with cryptographic security.

## Architecture

### Components

1. **`zkAuth.js`** - Core cryptographic utility
2. **`ZkLoginContext.jsx`** - State management for authentication
3. **`ZkLoginButton.jsx`** - UI component for authentication
4. **`ZkAuthStatus.jsx`** - Display authentication status
5. **`zkAuthApi.js`** - Backend API integration

---

## How It Works

### 1. Challenge-Response Authentication

```
User → Request Authentication
  ↓
Generate Nonce (cryptographic random value)
  ↓
Create Challenge Message
  ↓
User Signs Message with MetaMask
  ↓
Generate Zero-Knowledge Proof
  ↓
Verify Proof Locally & On Backend
  ↓
Issue Authentication Token
```

### 2. Zero-Knowledge Proof Components

The system generates the following cryptographic components:

**Public Inputs** (can be shared):
- Wallet address
- Timestamp
- Domain name

**Private Proof Components**:
- **Commitment**: Hash of the signature
- **Nullifier**: Prevents replay attacks
- **Challenge Hash**: Verifies the challenge integrity

### 3. Security Features

✅ **No Private Key Exposure**: Users never expose their private keys
✅ **No Gas Fees**: Authentication is off-chain (message signing only)
✅ **Replay Attack Prevention**: Nullifiers ensure each proof is unique
✅ **Time-Limited Proofs**: Proofs expire after 24 hours
✅ **Challenge-Response**: Prevents man-in-the-middle attacks
✅ **Local Storage Encryption**: Proofs stored securely

---

## Usage Guide

### For Users

#### 1. Connect Wallet
```
Click "Connect Wallet" → MetaMask popup → Approve connection
```

#### 2. Zero-Knowledge Authentication
```
Click "zk Login" → Sign message in MetaMask → Authentication complete
```

**What happens:**
- You sign a message (no blockchain transaction)
- A zero-knowledge proof is generated
- Your identity is verified without revealing your private key
- Authentication token is created and stored

#### 3. Authentication Status
- ✅ **zk Verified**: Successfully authenticated
- ⏱️ **Expires in**: Time remaining for current session
- 🔄 **Re-authenticate**: Session expired, need to re-authenticate

### For Developers

#### Initialize zkLogin in Component

```javascript
import { useZkLogin } from '../context/ZkLoginContext'

function MyComponent() {
  const { 
    isAuthenticated, 
    authenticate, 
    logout, 
    proof 
  } = useZkLogin()

  const handleAuth = async () => {
    const success = await authenticate()
    if (success) {
      console.log('Authenticated!', proof)
    }
  }

  return (
    <div>
      {isAuthenticated ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <button onClick={handleAuth}>Authenticate</button>
      )}
    </div>
  )
}
```

#### Generate Proof Manually

```javascript
import zkAuth from '../utils/zkAuth'
import { ethers } from 'ethers'

// Get signer from wallet
const provider = new ethers.BrowserProvider(window.ethereum)
const signer = await provider.getSigner()
const address = await signer.getAddress()

// Generate proof
const proof = await zkAuth.generateProof(signer, address)

// Verify proof
const verification = await zkAuth.verifyProof(proof, address)
console.log('Verified:', verification.verified)
```

#### Create Authentication Token

```javascript
const token = zkAuth.createAuthToken(proof)

// Use token in API calls
fetch('/api/protected-route', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

---

## API Reference

### `zkAuth` Utility

#### Methods

**`generateNonce()`**
- Generates cryptographic nonce
- Returns: `string` (hex)

**`createChallenge(address, appName)`**
- Creates authentication challenge
- Parameters:
  - `address`: Wallet address
  - `appName`: Application name (default: 'ZuriRent')
- Returns: Challenge object

**`generateProof(signer, address)`**
- Generates zero-knowledge proof
- Parameters:
  - `signer`: Ethers.js signer
  - `address`: Wallet address
- Returns: `Promise<Proof>`

**`verifyProof(proof, expectedAddress)`**
- Verifies proof validity
- Returns: `Promise<{verified: boolean, address: string}>`

**`createAuthToken(proof)`**
- Creates JWT-like authentication token
- Returns: `string` (base64 encoded)

**`storeProof(proof)`**
- Stores proof in localStorage
- Returns: `boolean`

**`isAuthenticated()`**
- Checks if user has valid authentication
- Returns: `boolean`

### `ZkLoginContext` API

#### State

```javascript
{
  isAuthenticated: boolean,     // Authentication status
  proof: Object | null,          // Zero-knowledge proof
  authToken: string | null,      // Authentication token
  isLoading: boolean,            // Loading state
  error: string | null,          // Error message
}
```

#### Methods

**`authenticate()`**
- Initiates authentication flow
- Returns: `Promise<boolean>`

**`logout()`**
- Clears authentication
- Returns: `void`

**`verifyIdentity(additionalData)`**
- Verifies identity with additional data
- Returns: `Promise<Object>`

**`refreshAuthentication()`**
- Refreshes expired authentication
- Returns: `Promise<boolean>`

---

## Backend Integration

### Verification Endpoint

```javascript
// POST /api/auth/zk-verify
{
  "commitment": "0x...",
  "nullifier": "0x...",
  "publicInputs": {
    "address": "0x...",
    "timestamp": 1234567890,
    "domain": "ZuriRent"
  },
  "challengeHash": "0x..."
}

// Response
{
  "success": true,
  "verified": true,
  "token": "jwt_token_here"
}
```

### Registration Endpoint

```javascript
// POST /api/auth/zk-register
{
  "address": "0x...",
  "commitment": "0x...",
  "nullifier": "0x...",
  "publicInputs": {...}
}

// Response
{
  "success": true,
  "user": {
    "id": "user_123",
    "address": "0x...",
    "zkVerified": true
  }
}
```

### Protected Routes

```javascript
// Add authentication middleware
app.use('/api/protected', authenticateZkProof)

// Middleware implementation
async function authenticateZkProof(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  
  try {
    const decoded = zkAuth.verifyAuthToken(token)
    if (!decoded.valid) {
      return res.status(401).json({ error: 'Invalid token' })
    }
    
    req.user = decoded.payload
    next()
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' })
  }
}
```

---

## Security Considerations

### Best Practices

1. **Never Store Private Keys**: The system never accesses private keys
2. **Token Expiry**: Tokens expire after 24 hours
3. **HTTPS Only**: Always use HTTPS in production
4. **Rate Limiting**: Implement rate limiting on authentication endpoints
5. **Nullifier Tracking**: Backend should track nullifiers to prevent replay attacks

### Threat Model

**Protected Against:**
- ✅ Private key exposure
- ✅ Replay attacks (nullifiers)
- ✅ Man-in-the-middle attacks (signed challenges)
- ✅ Token theft (time-limited tokens)

**Not Protected Against:**
- ❌ Compromised wallet (user's responsibility)
- ❌ Malicious browser extensions
- ❌ Physical access to unlocked device

---

## Testing

### Unit Tests

```javascript
import zkAuth from '../utils/zkAuth'

describe('zkAuth', () => {
  it('should generate nonce', () => {
    const nonce = zkAuth.generateNonce()
    expect(nonce).toMatch(/^0x[a-fA-F0-9]{64}$/)
  })

  it('should create challenge', () => {
    const challenge = zkAuth.createChallenge('0x123...', 'TestApp')
    expect(challenge.domain.name).toBe('TestApp')
    expect(challenge.message.address).toBe('0x123...')
  })
})
```

### Integration Tests

Test the complete authentication flow in your app:
1. Connect wallet
2. Click zkLogin
3. Sign message in MetaMask
4. Verify proof is generated
5. Check localStorage for stored proof
6. Verify authentication status

---

## Troubleshooting

### Common Issues

**Issue**: "Please install MetaMask"
- **Solution**: Install MetaMask browser extension

**Issue**: "Signature verification failed"
- **Solution**: Check that the signing address matches the connected wallet

**Issue**: "Proof has expired"
- **Solution**: Re-authenticate (proofs last 24 hours)

**Issue**: "Backend verification failed"
- **Solution**: Check API endpoint is accessible and implementing verification correctly

---

## Future Enhancements

### Planned Features

1. **Multi-Signature Support**: Support for multi-sig wallets
2. **Biometric Authentication**: Add biometric verification layer
3. **Zero-Knowledge Identity**: Integrate with decentralized identity protocols
4. **Social Recovery**: Implement social recovery mechanisms
5. **Hardware Wallet Support**: Add support for Ledger/Trezor

### Integration Options

- **Polygon ID**: For decentralized identity
- **WorldCoin**: For proof of personhood
- **Sismo**: For privacy-preserving attestations
- **Aztec Network**: For advanced zk-SNARKs

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/Edwin420s/RentChain/issues
- Email: dev@zurirent.xyz
- Discord: [Community Server]

---

## License

MIT License - See LICENSE file for details

---

**Built with ❤️ for ZuriRent - Making rental housing transparent and secure**
