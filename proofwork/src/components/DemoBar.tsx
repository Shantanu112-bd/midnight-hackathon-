import React from 'react';
import { useApp } from '../context/DemoModeContext';

export function DemoBar() {
  const { demoMode, toggleDemoMode } = useApp();
  
  if (!demoMode) return null;
  
  return (
    <div className="fixed top-[88px] left-0 right-0 z-40 flex justify-center px-6">
      <div className="max-w-4xl w-full bg-amber-500/10 border border-amber-500/20 rounded-full px-6 py-2 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-amber-500 font-mono text-[11px] uppercase tracking-widest hidden sm:inline-block">
            Demo Mode Active — All blockchain calls use mock data
          </span>
          <span className="text-amber-500 font-mono text-[11px] uppercase tracking-widest sm:hidden">
            Demo Mode Active
          </span>
        </div>
        <button
          onClick={toggleDemoMode}
          className="text-amber-500/60 hover:text-amber-500 font-mono text-[10px] uppercase tracking-widest transition-colors"
        >
          Switch to Live →
        </button>
      </div>
    </div>
  );
}
