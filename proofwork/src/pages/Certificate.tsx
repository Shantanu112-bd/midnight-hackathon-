import React, { useEffect, useState } from 'react';
import { BadgeCheck, Users, ExternalLink, Download, Link as LinkIcon, ShieldCheck, Check, EyeOff, X } from 'lucide-react';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';
import CopyButton from '../components/CopyButton';

export default function Certificate() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-navy flex flex-col pt-32">
      <NavigationBar activeItem="security" />

      <main className={`flex-1 flex flex-col items-center justify-center py-32 px-6 w-full max-w-4xl mx-auto transition-opacity duration-1000 ${mounted ? 'opacity-100 animate-fade-in-up' : 'opacity-0'}`}>
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mb-6 group relative">
            <BadgeCheck className="w-8 h-8 text-purpleAccent" />
            
            {/* TOOLTIP */}
            <div className="absolute top-full mt-2 w-64 p-3 bg-navy border border-purpleAccent/30 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <p className="text-xs text-white/80 font-sans normal-case tracking-normal text-left">
                <strong className="text-purpleAccent block mb-1">What is Zero-Knowledge?</strong>
                A cryptographic method that lets you prove something is true without revealing any other underlying data.
              </p>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 border-b border-dashed border-white/20 pb-1 inline-block hover:border-purpleAccent/50 transition-colors cursor-help">
            Zero-Knowledge Proof Certificate
          </h1>
          <p className="text-white/50 text-lg max-w-lg">
            This certificate proves the promise existed without revealing its contents.
          </p>
        </div>

        {/* Certificate Card */}
        <div className="glass rounded-[2.5rem] p-8 md:p-12 w-full relative overflow-hidden mb-8 border-purpleAccent/20">
          
          {/* Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[30deg] pointer-events-none opacity-[0.03] select-none">
            <span className="text-5xl md:text-6xl font-bold whitespace-nowrap">PROOFWORK CERTIFICATE</span>
          </div>

          <div className="relative z-10 font-mono text-sm space-y-1">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 border-b border-white/5 hover:bg-white/[0.02] px-3 -mx-3 rounded-lg transition-colors gap-2">
              <span className="text-white/40 tracking-widest font-bold">CERTIFICATE ID</span>
              <div className="flex items-center gap-3">
                <span className="text-purpleAccent font-bold">zkp_7f3a9c2b1e4d8f6a</span>
                <CopyButton text="zkp_7f3a9c2b1e4d8f6a" />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 border-b border-white/5 hover:bg-white/[0.02] px-3 -mx-3 rounded-lg transition-colors gap-2">
              <span className="text-white/40 tracking-widest font-bold">PROMISE HASH</span>
              <div className="flex items-center gap-3">
                <span className="text-white/80">0x8f3a9c...2b1c</span>
                <CopyButton text="0x8f3a9c2b1e4d8f6a" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 border-b border-white/5 hover:bg-white/[0.02] px-3 -mx-3 rounded-lg transition-colors gap-2">
              <span className="text-white/40 tracking-widest font-bold">ISSUED</span>
              <span className="text-white/80">2025-05-14 14:22:18 UTC</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 border-b border-white/5 hover:bg-white/[0.02] px-3 -mx-3 rounded-lg transition-colors gap-2">
              <span className="text-white/40 tracking-widest font-bold">PARTIES</span>
              <div className="flex items-center gap-2 text-white/80">
                <Users className="w-4 h-4 text-white/40" /> 2 parties verified
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 border-b border-white/5 hover:bg-white/[0.02] px-3 -mx-3 rounded-lg transition-colors gap-2">
              <span className="text-white/40 tracking-widest font-bold">NETWORK</span>
              <div className="flex items-center gap-2 text-white/80">
                <div className="w-2 h-2 rounded-full bg-limeAccent" /> Midnight Devnet
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 hover:bg-white/[0.02] px-3 -mx-3 rounded-lg transition-colors gap-2">
              <span className="text-white/40 tracking-widest font-bold">STATUS</span>
              <div className="bg-greenSuccess/10 text-greenSuccess px-3 py-1 rounded-full flex items-center gap-2 border border-greenSuccess/20 pointer-events-none">
                <Check className="w-4 h-4" /> VALID
              </div>
            </div>
          </div>
          
          {/* Gradient Separator */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-10 relative z-10" />

          {/* Guarantee Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
            {/* Left */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="w-6 h-6 text-greenSuccess" />
                <h3 className="font-bold text-lg">What This Proves</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "A promise was made and sealed before May 14, 2025",
                  "Both parties cryptographically signed it",
                  "The contents have not been altered"
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-greenSuccess shrink-0" />
                    <span className="text-white/80 text-sm leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right */}
            <div>
              <div className="flex items-center gap-3 mb-6 opacity-60">
                <EyeOff className="w-6 h-6 text-white/50" />
                <h3 className="font-bold text-lg text-white/50">What It Does NOT Reveal</h3>
              </div>
              <ul className="space-y-4 opacity-60">
                {[
                  "The full text of the promise",
                  "Either party's identity",
                  "Any other agreements"
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <X className="w-5 h-5 text-white/30 shrink-0 mt-0.5" />
                    <span className="text-white/50 text-sm leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto">
          <button className="w-full sm:w-auto bg-blueAccent text-navy font-bold px-8 py-4 rounded-full flex items-center justify-center gap-2 hover:bg-blueAccent/90 transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(122,160,255,0.4)]">
            <Download className="w-5 h-5" /> Download Certificate PDF
          </button>
          <button className="w-full sm:w-auto px-8 py-4 border border-white/20 rounded-full flex items-center justify-center gap-2 hover:bg-white/5 transition-all font-medium">
            <LinkIcon className="w-5 h-5" /> Copy Shareable Link
          </button>
        </div>
        
        <a href="#" className="mt-8 font-mono uppercase text-xs tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-2">
          Verifiable on Midnight Explorer <ExternalLink className="w-3 h-3" />
        </a>

      </main>

      <Footer />
    </div>
  );
}
