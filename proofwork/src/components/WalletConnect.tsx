import React from 'react'
import { Icon } from '@iconify/react'
import { useApp } from '../context/DemoModeContext'

export function WalletConnect() {
  const { wallet } = useApp()

  // Not installed
  if (!wallet.isInstalled) {
    return (
      <a
        href="https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 rounded-full
                   border border-amber-500/30 bg-amber-500/10
                   text-amber-500 font-mono text-[11px] uppercase tracking-widest
                   hover:bg-amber-500/20 transition-all"
      >
        <Icon icon="lucide:download" className="text-sm" />
        Install Lace
      </a>
    )
  }

  // Connecting or syncing
  if (wallet.isConnecting) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-full
                      border border-blueAccent/20 bg-blueAccent/5
                      font-mono text-[11px] text-blueAccent/70">
        <Icon icon="lucide:loader-2" className="animate-spin text-sm" />
        {wallet.status === 'syncing' ? wallet.error : 'Connecting...'}
      </div>
    )
  }

  // Connected
  if (wallet.isConnected && wallet.address) {
    const short = `${wallet.address.slice(0,6)}...${wallet.address.slice(-4)}`
    return (
      <div className="flex items-center gap-2">
        {wallet.balance && (
          <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5
                           rounded-full bg-greenSuccess/10 border border-greenSuccess/20
                           font-mono text-[10px] text-greenSuccess">
            <span className="w-1.5 h-1.5 rounded-full bg-greenSuccess" />
            {parseFloat(wallet.balance).toFixed(1)} tDUST
          </span>
        )}
        <button
          onClick={wallet.disconnect}
          title="Click to disconnect"
          className="flex items-center gap-2 px-4 py-2 rounded-full
                     border border-blueAccent/30 bg-blueAccent/10
                     font-mono text-[11px] text-blueAccent
                     hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400
                     transition-all group"
        >
          <span className="w-2 h-2 rounded-full bg-blueAccent
                           group-hover:bg-red-400 transition-colors" />
          <span className="group-hover:hidden">{short}</span>
          <span className="hidden group-hover:inline text-[10px]">Disconnect</span>
        </button>
      </div>
    )
  }

  // Error state
  if (wallet.status === 'error') {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={wallet.connect}
          className="flex items-center gap-2 px-4 py-2 rounded-full
                     border border-red-500/30 bg-red-500/10
                     font-mono text-[11px] text-red-400
                     hover:bg-red-500/20 transition-all"
        >
          <Icon icon="lucide:refresh-cw" className="text-sm" />
          Retry Connect
        </button>
        <span className="text-red-400/60 font-mono text-[9px] max-w-[180px] text-right">
          {wallet.error}
        </span>
      </div>
    )
  }

  // Default: not connected
  return (
    <button
      onClick={wallet.connect}
      className="flex items-center gap-2 px-5 py-2 rounded-full
                 bg-white text-navy font-bold text-sm
                 hover:bg-limeAccent transition-all shadow-lg"
    >
      <Icon icon="lucide:wallet" className="text-sm" />
      Connect Lace
    </button>
  )
}
