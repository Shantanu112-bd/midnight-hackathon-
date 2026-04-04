import { useState, useEffect, useCallback } from 'react'

export interface WalletState {
  isConnected: boolean
  isConnecting: boolean
  address: string | null
  balance: string | null
  error: string | null
}

declare global {
  interface Window {
    midnight?: {
      mnLace?: {
        enable: () => Promise<MidnightAPI>
        isEnabled: () => Promise<boolean>
      }
    }
  }
}

interface MidnightAPI {
  getAddress: () => Promise<string>
  getBalance: () => Promise<{ tDust: string }>
  signTransaction: (tx: unknown) => Promise<unknown>
}

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    isConnecting: false,
    address: null,
    balance: null,
    error: null
  })
  const [api, setApi] = useState<MidnightAPI | null>(null)

  const [isLaceInstalledState, setIsLaceInstalledState] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const checkInjection = () => {
      if (typeof window !== 'undefined' && !!window.midnight?.mnLace) {
        setIsLaceInstalledState(true);
        if (interval) clearInterval(interval);
        return true;
      }
      return false;
    };

    if (!checkInjection()) {
      interval = setInterval(checkInjection, 250);
      setTimeout(() => clearInterval(interval), 5000);
    }
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      if (!isLaceInstalledState) return
      try {
        const enabled = await window.midnight!.mnLace!.isEnabled()
        if (enabled) await connectWallet()
      } catch {
        // Not previously connected, that's fine
      }
    }
    checkConnection()
  }, [isLaceInstalledState])

  const connectWallet = useCallback(async () => {
    const w = window as any;
    const hasMidnightStr = typeof w.midnight !== 'undefined';
    
    // Find the Lace provider. It might be named mnLace, lace, or even a UUID injected by the extension.
    let laceProvider = w.midnight?.mnLace || w.midnight?.lace;
    
    // Fallback: If midnight exists but not under standard names, just try to grab the first object in window.midnight
    if (!laceProvider && hasMidnightStr && typeof w.midnight === 'object') {
      const keys = Object.keys(w.midnight);
      if (keys.length > 0) {
        laceProvider = w.midnight[keys[0]];
      }
    }
    
    const hasMnLace = !!laceProvider;
    const hasCardano = typeof w.cardano !== 'undefined';

    if (!hasMnLace) {
      const keys = hasMidnightStr ? Object.keys(w.midnight).join(',') : 'none';
      const diag = `midnightObj:${hasMidnightStr}, cardanoObj:${hasCardano} (keys: ${keys})`;
      setWalletState(prev => ({
        ...prev,
        error: `Lace missing (${diag}). Ensure Lace is unlocked, Beta Features->Midnight is ON, and DApp connector is enabled.`
      }))
      return
    }

    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }))

    try {
      let walletApi;
      if (typeof laceProvider.connect === 'function') {
        walletApi = await laceProvider.connect('preprod') // Midnight uses connect(network)
      } else if (typeof laceProvider.enable === 'function') {
        walletApi = await laceProvider.enable() // Cardano fallback
      } else {
        // Deep property dump including prototype chain
        let allProps = new Set<string>();
        for (let obj = laceProvider; obj; obj = Object.getPrototypeOf(obj)) {
          Object.getOwnPropertyNames(obj).forEach(p => allProps.add(p));
        }
        throw new Error(`laceProvider has no connect/enable! Props: ${Array.from(allProps).join(', ')}`);
      }

      setApi(walletApi)

      let address = 'unknown_address'
      let returnedAddr: any = null;
      if (typeof walletApi.getAddress === 'function') {
        returnedAddr = await walletApi.getAddress()
      } else if (typeof walletApi.getUnshieldedAddress === 'function') {
        returnedAddr = await walletApi.getUnshieldedAddress()
      } else if (typeof walletApi.getShieldedAddresses === 'function') {
        const addrs = await walletApi.getShieldedAddresses()
        if (addrs && addrs.length > 0) returnedAddr = addrs[0]
      }

      if (typeof returnedAddr === 'string') {
        address = returnedAddr;
      } else if (returnedAddr && typeof returnedAddr === 'object') {
        address = returnedAddr.unshieldedAddress || returnedAddr.shieldedAddress || returnedAddr.address || JSON.stringify(returnedAddr);
      }

      let balance = null
      if (typeof walletApi.getBalance === 'function') {
        const bData = await walletApi.getBalance()
        balance = bData?.tDust || bData?.coin || null
      }

      setWalletState({
        isConnected: true,
        isConnecting: false,
        address,
        balance,
        error: null
      })

      localStorage.setItem('proofwork_wallet_connected', 'true')
      localStorage.setItem('proofwork_wallet_address', address)
      console.log('✅ Wallet connected:', address)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Connection rejected'
      setWalletState({
        isConnected: false,
        isConnecting: false,
        address: null,
        balance: null,
        error: message
      })
    }
  }, [])

  const disconnectWallet = useCallback(() => {
    setApi(null)
    setWalletState({
      isConnected: false,
      isConnecting: false,
      address: null,
      balance: null,
      error: null
    })
    localStorage.removeItem('proofwork_wallet_connected')
    localStorage.removeItem('proofwork_wallet_address')
  }, [])

  return {
    ...walletState,
    api,
    isLaceInstalled: isLaceInstalledState,
    connectWallet,
    disconnectWallet
  }
}
