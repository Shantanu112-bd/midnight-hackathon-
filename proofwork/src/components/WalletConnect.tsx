import React from 'react'
import { Icon } from '@iconify/react'
import { useWallet } from '../hooks/useWallet'

export function WalletConnect() {
  const { 
    isConnected, isConnecting, address, balance,
    error, isLaceInstalled, connectWallet, disconnectWallet 
  } = useWallet()

  const shortAddress = address 
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null

  // We removed the strict !isLaceInstalled blocker so users can 
  // attempt to connect and see a helpful error if it fails.

  if (isConnecting) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-full 
                      border border-white/10 bg-white/5
                      font-mono text-[11px] uppercase tracking-widest text-white/50">
        <Icon icon="lucide:loader-2" className="animate-spin text-sm" />
        Connecting...
      </div>
    )
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        {balance && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 
                          rounded-full bg-greenSuccess/10 border border-greenSuccess/20
                          font-mono text-[10px] text-greenSuccess">
            <div className="w-1.5 h-1.5 rounded-full bg-greenSuccess" />
            {parseFloat(balance).toFixed(2)} tDUST
          </div>
        )}
        <button
          onClick={disconnectWallet}
          title="Click to disconnect"
          className="flex items-center gap-2 px-4 py-2 rounded-full 
                     border border-blueAccent/30 bg-blueAccent/10
                     font-mono text-[11px] text-blueAccent
                     hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400
                     transition-all group"
        >
          <div className="w-2 h-2 rounded-full bg-blueAccent 
                          group-hover:bg-red-400 transition-colors" />
          <span className="group-hover:hidden">{shortAddress}</span>
          <span className="hidden group-hover:inline">Disconnect</span>
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={connectWallet}
        className="flex items-center gap-2 px-5 py-2 rounded-full
                   bg-white text-navy font-bold text-sm
                   hover:bg-limeAccent transition-all shadow-lg"
      >
        <Icon icon="lucide:wallet" className="text-sm" />
        Connect Lace
      </button>
      {error && (
        <span className="text-red-400 font-mono text-[9px] max-w-[200px] text-right">
          {error}
        </span>
      )}
    </div>
  )
}
