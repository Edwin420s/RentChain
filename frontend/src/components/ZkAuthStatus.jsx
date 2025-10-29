import React from 'react'
import { Shield, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { useZkLogin } from '../context/ZkLoginContext'

const ZkAuthStatus = () => {
  const { isAuthenticated, proof, authToken, isAuthExpired } = useZkLogin()

  if (!isAuthenticated) {
    return null
  }

  const expired = isAuthExpired()
  const timeRemaining = proof ? Math.max(0, proof.expiresAt - Date.now()) : 0
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60))
  const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          expired ? 'bg-yellow-100' : 'bg-accent bg-opacity-10'
        }`}>
          {expired ? (
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          ) : (
            <Shield className="h-5 w-5 text-accent" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-text">
              {expired ? 'Authentication Expired' : 'Zero-Knowledge Verified'}
            </h3>
            {!expired && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent text-white">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-3">
            {expired 
              ? 'Your authentication session has expired. Please re-authenticate to continue.'
              : 'Your identity is verified using zero-knowledge proofs. Your private key remains secure.'
            }
          </p>

          <div className="space-y-2 text-xs">
            {/* Address */}
            {proof?.publicInputs?.address && (
              <div className="flex items-center justify-between py-1 border-t border-gray-100">
                <span className="text-gray-500">Address:</span>
                <span className="font-mono text-text">
                  {proof.publicInputs.address.slice(0, 10)}...{proof.publicInputs.address.slice(-8)}
                </span>
              </div>
            )}

            {/* Commitment */}
            {proof?.commitment && (
              <div className="flex items-center justify-between py-1 border-t border-gray-100">
                <span className="text-gray-500">Commitment:</span>
                <span className="font-mono text-text">
                  {proof.commitment.slice(0, 10)}...{proof.commitment.slice(-8)}
                </span>
              </div>
            )}

            {/* Time Remaining */}
            {!expired && (
              <div className="flex items-center justify-between py-1 border-t border-gray-100">
                <span className="text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Expires in:
                </span>
                <span className="font-medium text-text">
                  {hoursRemaining}h {minutesRemaining}m
                </span>
              </div>
            )}

            {/* Proof Validity */}
            <div className="flex items-center justify-between py-1 border-t border-gray-100">
              <span className="text-gray-500">Proof Status:</span>
              <span className={`flex items-center font-medium ${
                expired ? 'text-yellow-600' : 'text-accent'
              }`}>
                {expired ? (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    Expired
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Valid
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Technical Details (expandable) */}
          <details className="mt-3">
            <summary className="text-xs text-gray-500 cursor-pointer hover:text-primary">
              Show technical details
            </summary>
            <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono space-y-1">
              {proof?.nullifier && (
                <div>
                  <span className="text-gray-500">Nullifier: </span>
                  <span className="text-gray-700 break-all">{proof.nullifier}</span>
                </div>
              )}
              {proof?.challengeHash && (
                <div>
                  <span className="text-gray-500">Challenge: </span>
                  <span className="text-gray-700 break-all">{proof.challengeHash}</span>
                </div>
              )}
              {authToken && (
                <div>
                  <span className="text-gray-500">Token: </span>
                  <span className="text-gray-700 break-all">
                    {authToken.slice(0, 40)}...
                  </span>
                </div>
              )}
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}

export default ZkAuthStatus
