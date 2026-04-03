import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';
import { Icon } from '@iconify/react';

export default function Footer() {
  return (
    <footer className="bg-obsidian border-t border-white/5 relative overflow-hidden pt-32 pb-12">
      {/* Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] text-[20vw] font-bold tracking-tighter pointer-events-none select-none w-full text-center">
        PROOFWORK
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* CTA Section */}
        <div className="flex flex-col items-center text-center mb-32">
          <h2 className="text-4xl md:text-6xl font-bold mb-10">Ready to restore workplace trust?</h2>
          <Link 
            to="/vault"
            className="group relative overflow-hidden bg-limeAccent text-navy font-bold rounded-full px-10 py-5 text-lg transition-transform hover:scale-105"
          >
            {/* Slide up overlay trick */}
            <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]" />
            <span className="relative z-10 flex items-center gap-3">
              Launch Your Secure Vault <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>

        {/* 4-col Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-20 border-t border-white/5 pt-20">
          
          {/* Brand Col */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 inline-flex">
              <div className="w-8 h-8 bg-limeAccent rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-navy" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">ProofWork</span>
            </Link>
            <p className="text-white/50 text-sm max-w-sm mb-8 leading-relaxed">
              The privacy-first workplace accountability dApp on the Midnight blockchain. 
              Cryptographic guarantees for professional promises.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                <Icon icon="simple-icons:x" className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                <Icon icon="simple-icons:github" className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                <Icon icon="simple-icons:linkedin" className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-mono text-[10px] uppercase text-white/40 mb-6 tracking-wider">Product</h4>
            <ul className="space-y-4 text-sm text-white/70">
              <li><Link to="/vault" className="hover:text-white transition-colors">Promise Vault</Link></li>
              <li><a href="/#complaint-demo" className="hover:text-white transition-colors">Anonymous Reporting</a></li>
              <li><Link to="/manager" className="hover:text-white transition-colors">Manager Dashboard</Link></li>
              <li><Link to="/certificate" className="hover:text-white transition-colors">ZK Certificates</Link></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-mono text-[10px] uppercase text-white/40 mb-6 tracking-wider">Legal & Auth</h4>
            <ul className="space-y-4 text-sm text-white/70">
              <li><Link to="/settings" className="hover:text-white transition-colors">Profile & Settings</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Smart Contract Audit</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 text-xs text-white/40 gap-4">
          <p>© {new Date().getFullYear()} ProofWork. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-limeAccent" />
            <span>Secured by Midnight Network</span>
          </div>
          <p className="flex items-center gap-1">Made for a <span className="text-white/60">transparent future</span>.</p>
        </div>

      </div>
    </footer>
  );
}
