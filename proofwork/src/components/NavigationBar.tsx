import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';
import { Icon } from '@iconify/react';
import { useApp } from '../context/DemoModeContext';
import clsx from 'clsx';
import { WalletConnect } from './WalletConnect';


interface NavigationBarProps {
  activeItem?: 'vault' | 'complaint' | 'security' | 'landing' | 'manager' | 'settings';
}

export default function NavigationBar({ activeItem = 'landing' }: NavigationBarProps) {
  const { demoMode, toggleDemoMode, wallet } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleComplaintClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById('complaint-demo');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/', { state: { scrollTo: 'complaint' } });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6 transition-all duration-300">
      <div className="rounded-full px-6 md:px-8 py-3 flex items-center justify-between max-w-5xl w-full glass shadow-2xl relative">
        
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-limeAccent rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-navy" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white group-hover:text-limeAccent transition-colors">
            ProofWork
          </span>
        </Link>
        
        {/* Center: Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link 
            to="/vault" 
            className={`transition-colors hover:text-white ${
              location.pathname === '/vault' ? 'text-white' : 'text-white/70'
            }`}
          >
            Promise Vault
          </Link>
          <button 
            type="button"
            onClick={handleComplaintClick}
            className={`transition-colors hover:text-white ${
              activeItem === 'complaint' ? 'text-white' : 'text-white/70'
            }`}
          >
            Anonymous Reporting
          </button>
          <Link 
            to="/certificate" 
            className={`transition-colors hover:text-white ${
              location.pathname === '/certificate' ? 'text-white' : 'text-white/70'
            }`}
          >
            Security
          </Link>
        </div>
        
        {/* Right: Actions */}
        <div className="flex items-center gap-3 md:gap-6">

          <div className="hidden lg:flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse bg-greenSuccess`} />
            <span className="font-mono text-[10px] uppercase text-white/50 tracking-wider">
              Midnight Preprod
            </span>
          </div>

          <button
            onClick={toggleDemoMode}
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest transition-all border ${
              demoMode 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' 
                : 'bg-white/5 border-white/10 text-white/40'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${demoMode ? 'bg-amber-500' : 'bg-white/30'}`} />
            {demoMode ? 'Demo Mode ON' : 'Live Mode'}
          </button>
          
          <div className="hidden md:block">
            <WalletConnect />
          </div>

          {/* Mobile hamburger toggle */}
          <button
            className="md:hidden text-white ml-2 flex items-center justify-center w-8 h-8 rounded-full border border-white/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Dropdown menu when open */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-4 right-4 mt-2 glass rounded-2xl p-4 flex flex-col gap-3 md:hidden">
            <Link to="/vault" onClick={() => setMobileMenuOpen(false)} 
              className="text-sm font-medium py-3 px-4 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5">
              Promise Vault
            </Link>
            <button onClick={handleComplaintClick}
              className="text-left text-sm font-medium py-3 px-4 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5">
              Anonymous Reporting
            </button>
            <Link to="/manager" onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium py-3 px-4 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5">
              Manager Dashboard
            </Link>
            <Link to="/settings" onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium py-3 px-4 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5">
              Settings
            </Link>
            
            <div className="h-px bg-white/10 my-1" />
            
            <button onClick={() => { toggleDemoMode(); setMobileMenuOpen(false); }}
              className="text-left text-sm font-medium py-3 px-4 hover:bg-white/5 rounded-xl flex items-center justify-between">
              <span className={demoMode ? "text-amber-500" : "text-white/50"}>Demo Mode</span>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${demoMode ? 'bg-amber-500' : 'bg-white/20'}`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0 transition-transform ${demoMode ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
