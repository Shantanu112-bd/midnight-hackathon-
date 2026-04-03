import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useDemoMode } from '../context/DemoModeContext';
import clsx from 'clsx';

interface NavigationBarProps {
  activeItem?: 'vault' | 'complaint' | 'security' | 'landing' | 'manager' | 'settings';
}

export default function NavigationBar({ activeItem = 'landing' }: NavigationBarProps) {
  const { demoMode, toggleDemoMode } = useDemoMode();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6 transition-all duration-300">
      <div className="rounded-full px-8 py-3 flex items-center justify-between max-w-5xl w-full glass shadow-2xl">
        
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
            className={clsx(
              "transition-colors hover:text-white", 
              activeItem === 'vault' ? "text-white" : "text-white/70"
            )}
          >
            Promise Vault
          </Link>
          <a 
            href="/#complaint-demo" 
            onClick={(e) => {
              if (window.location.pathname !== '/') {
                e.preventDefault();
                navigate('/#complaint-demo');
              }
            }}
            className={clsx(
              "transition-colors hover:text-white", 
              activeItem === 'complaint' ? "text-white" : "text-white/70"
            )}
          >
            Anonymous Reporting
          </a>
          <Link 
            to="/certificate" 
            className={clsx(
              "transition-colors hover:text-white", 
              activeItem === 'security' ? "text-white" : "text-white/70"
            )}
          >
            Security
          </Link>
        </div>
        
        {/* Right: Actions */}
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-greenSuccess animate-pulse" />
            <span className="font-mono text-[10px] uppercase text-white/50 tracking-wider">
              Midnight Devnet
            </span>
          </div>

          <button 
            onClick={toggleDemoMode}
            className={clsx(
              "hidden md:block px-3 py-1 rounded-full font-mono text-[10px] uppercase font-bold tracking-widest border transition-all",
              demoMode ? "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20" : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10"
            )}
          >
            {demoMode ? "Demo Mode ON" : "Demo Mode OFF"}
          </button>
          
          <Link 
            to="/vault"
            className="hidden md:block px-6 py-2 bg-white text-navy font-semibold rounded-full hover:bg-limeAccent hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(204,255,0,0.4)]"
          >
            Launch Vault
          </Link>
        </div>
        
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-navy/90 backdrop-blur-lg border-t border-white/10 flex justify-around items-center p-4 z-50">
        <Link to="/vault" className={clsx("flex flex-col items-center gap-1", activeItem === 'vault' ? "text-white" : "text-white/50")}>
          <span className="text-[10px] uppercase font-bold">Vault</span>
        </Link>
        <a href="/#complaint-demo" onClick={(e) => { if (window.location.pathname !== '/') { e.preventDefault(); navigate('/#complaint-demo'); } }} className={clsx("flex flex-col items-center gap-1", activeItem === 'complaint' ? "text-white" : "text-white/50")}>
          <span className="text-[10px] uppercase font-bold">Report</span>
        </a>
        <Link to="/certificate" className={clsx("flex flex-col items-center gap-1", activeItem === 'security' ? "text-white" : "text-white/50")}>
          <span className="text-[10px] uppercase font-bold">Security</span>
        </Link>
        <button onClick={toggleDemoMode} className={clsx("flex flex-col items-center gap-1", demoMode ? "text-amber-500" : "text-white/50")}>
          <span className="text-[10px] uppercase font-bold text-center">Demo<br/>{demoMode ? 'ON' : 'OFF'}</span>
        </button>
      </div>
    </nav>
  );
}
