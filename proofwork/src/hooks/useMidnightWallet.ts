import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  connectAndGetProvider, 
  type ProofWorkProvider 
} from '../midnight'

export type WalletStatus = 
  | 'not_installed'
  | 'not_connected'
  | 'connecting'
  | 'connected'
  | 'error'

export interface WalletState {
  status: WalletStatus
  address: string | null
  balance: string | null
  error: string | null
  proofWorkProvider: ProofWorkProvider | null
}

export function useMidnightWallet() {
  const [state, setState] = useState<WalletState>({
    status: 'not_installed',
    address: null,
    balance: null,
    error: null,
    proofWorkProvider: null,
  })

  const mountedRef = useRef(true)

  const safe = useCallback(
    (update: Partial<WalletState>) => {
      if (mountedRef.current) setState(prev => ({ ...prev, ...update }))
    },
    []
  )

  const handleConnect = useCallback(async () => {
    const lace = window.midnight?.mnLace ?? (window as any).cardano?.lace ?? (window as any).lace
    if (!lace) {
      safe({ 
        status: 'not_installed',
        error: 'Lace wallet not found. Install from Chrome Web Store.'
      })
      return
    }

    safe({ status: 'connecting', error: null })

    try {
      console.log('🔄 Connecting to Midnight via Lace...')
      
      const proofWorkProvider = await connectAndGetProvider()
      
      console.log('✅ ProofWork provider ready')
      console.log('Address:', proofWorkProvider.address)

      // Get balance if possible
      let balance = '0'
      try {
        const api = proofWorkProvider.rawApi
        const balanceData = await (api as any).getBalance?.()
        balance = balanceData?.tDust || balanceData?.midnight || '0'
      } catch {
        // Balance is optional
      }

      localStorage.setItem('proofwork_wallet_connected', 'true')

      safe({
        status: 'connected',
        address: proofWorkProvider.address || 'mn1connected',
        balance,
        error: null,
        proofWorkProvider,
      })
      console.log('✅ Connection process finished successfully')

    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error)
      console.error('❌ Wallet connection failed:', msg)
      
      localStorage.removeItem('proofwork_wallet_connected')
      
      safe({
        status: 'error',
        error: msg,
        proofWorkProvider: null,
      })
    }
  }, [safe])

  const disconnect = useCallback(() => {
    localStorage.removeItem('proofwork_wallet_connected')
    safe({
      status: 'not_connected',
      address: null,
      balance: null,
      error: null,
      proofWorkProvider: null,
    })
  }, [safe])

  // Check if Lace is installed
  useEffect(() => {
    mountedRef.current = true
    let attempts = 0
    const maxAttempts = 10 // 5 seconds total

    const check = async () => {
      if (!mountedRef.current) return
      
      const lace = window.midnight?.mnLace ?? (window as any).cardano?.lace ?? (window as any).lace
      
      console.log('🔍 Wallet Check:', {
        midnight: !!window.midnight,
        midnightKeys: window.midnight ? Object.keys(window.midnight) : [],
        cardano: !!(window as any).cardano,
        cardanoKeys: (window as any).cardano ? Object.keys((window as any).cardano) : [],
        lace: !!lace
      })
      
      if (lace) {
        console.log('✅ Midnight wallet detected')
        const wasConnected = localStorage.getItem('proofwork_wallet_connected')
        safe({ 
          status: 'not_connected'
        })
        
        if (wasConnected === 'true') {
          console.log('💡 Wallet previously connected. Click "Connect" to link again.')
        }
        return true // Found
      }
      
      attempts++
      if (attempts < maxAttempts) {
        setTimeout(check, 500)
      } else {
        console.warn('⚠️ Midnight wallet not detected after 5s')
        safe({ status: 'not_installed' })
      }
      return false
    }
    
    check()
    
    return () => { mountedRef.current = false }
  }, [handleConnect, safe])

  return {
    ...state,
    isInstalled: 
      state.status !== 'not_installed' || 
      !!(window.midnight?.mnLace ?? (window as any).cardano?.lace ?? (window as any).lace),
    isConnected: state.status === 'connected',
    isConnecting: state.status === 'connecting',
    // Expose the full provider object for contract calls
    providers: state.proofWorkProvider || null,
    connect: handleConnect,
    disconnect,
  }
}
