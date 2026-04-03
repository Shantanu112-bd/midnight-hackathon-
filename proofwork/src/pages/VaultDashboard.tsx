import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Lock, CheckCircle, Clock, Link as LinkIcon, FileDown } from 'lucide-react';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';
import CopyButton from '../components/CopyButton';
import StatusBadge from '../components/StatusBadge';
import ToastNotification from '../components/ToastNotification';

export default function VaultDashboard() {
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setToastMsg(`Copied hash: ${hash.substring(0,10)}...`);
    setShowToast(true);
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col pt-32">
      <NavigationBar activeItem="vault" />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pb-24 flex flex-col lg:flex-row gap-12">
        {/* Main Content (70%) */}
        <div className="lg:w-[70%]">
          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blueAccent/10 rounded-2xl flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-blueAccent" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">Your Promise Vault</h1>
            </div>
            <p className="text-white/50 text-lg flex items-center gap-2">
              3 sealed promises &middot; <CheckCircle className="w-4 h-4 text-greenSuccess" /> All verified on Midnight
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Lock, color: 'blueAccent', count: '3', label: 'Sealed Promises' },
              { icon: CheckCircle, color: 'greenSuccess', count: '2', label: 'Fulfilled' },
              { icon: Clock, color: 'amber-500', count: '1', label: 'Pending Resolution' }
            ].map((stat, i) => (
              <div key={i} className="glass rounded-[2rem] p-8 relative overflow-hidden group">
                <div className={`absolute -right-6 -bottom-6 w-32 h-32 blur-[50px] bg-${stat.color}/10 group-hover:opacity-100 opacity-50 transition-all`} />
                <stat.icon className={`w-8 h-8 text-${stat.color} mb-4`} />
                <div className="text-5xl font-bold mb-2">{stat.count}</div>
                <div className="font-mono text-[10px] uppercase text-white/50 tracking-wider mix-blend-screen">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Promise Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card 1 */}
            <div className="glass rounded-[2.5rem] p-8 flex flex-col hover:border-blueAccent/40 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-all duration-300 relative group">
              <StatusBadge status="PENDING" className="absolute top-8 right-8" />
              <h3 className="text-2xl font-bold mb-4 pr-24">15% Salary Increment</h3>
              <div className="mb-6 flex-1">
                <div className="text-white/40 text-xs font-mono uppercase mb-1">Condition</div>
                <p className="text-white/80">Complete Project Atlas with full deployment</p>
                <div className="flex items-center gap-2 mt-3 text-sm text-amber-500/80">
                  <Clock className="w-4 h-4" /> Sep 30
                </div>
              </div>
              <div className="border-t border-white/10 pt-6">
                <div className="text-white/40 text-[10px] font-mono uppercase mb-2">Cryptographic Record</div>
                <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <LinkIcon className="w-4 h-4 text-blueAccent shrink-0" />
                    <span className="font-mono text-sm text-white/70 truncate">0x3f2a9c...1b9c</span>
                  </div>
                  <CopyButton text="0x3f2a9c2b1e4d8f6a3f2a9c2b1e4d8f6a" />
                </div>
                <div className="flex items-center gap-1 w-max bg-teal-500/10 px-2 py-1 rounded-md border border-teal-500/20 mb-6">
                  <Lock className="w-3 h-3 text-teal-400" />
                  <span className="text-[10px] font-mono uppercase text-teal-400 tracking-wider">Sealed on Midnight</span>
                </div>
                <div className="flex items-center gap-4 mt-auto">
                  <button className="text-white/50 hover:text-white text-sm font-medium transition-colors">Mark Resolved</button>
                  <Link to="/certificate" className="ml-auto px-4 py-2 border border-purpleAccent/50 text-purpleAccent rounded-full hover:bg-purpleAccent/10 transition-all font-medium text-sm">
                    Generate ZK Proof
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="glass rounded-[2.5rem] p-8 flex flex-col hover:border-blueAccent/40 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-all duration-300 relative group">
              <StatusBadge status="PENDING" className="absolute top-8 right-8" />
              <h3 className="text-2xl font-bold mb-4 pr-24">Promotion to Lead Engineer</h3>
              <div className="mb-6 flex-1">
                <div className="text-white/40 text-xs font-mono uppercase mb-1">Condition</div>
                <p className="text-white/80">Q3 Performance Review score {'>'} 4.5</p>
                <div className="flex items-center gap-2 mt-3 text-sm text-amber-500/80">
                  <Clock className="w-4 h-4" /> Aug 15
                </div>
              </div>
              <div className="border-t border-white/10 pt-6">
                <div className="text-white/40 text-[10px] font-mono uppercase mb-2">Cryptographic Record</div>
                <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <LinkIcon className="w-4 h-4 text-purpleAccent shrink-0" />
                    <span className="font-mono text-sm text-white/70 truncate">0x8a1df3...d2c4</span>
                  </div>
                  <CopyButton text="0x8a1df3d2c4e5f6a78a1df3d2c4e5f6a7" />
                </div>
                <div className="flex items-center gap-1 w-max bg-teal-500/10 px-2 py-1 rounded-md border border-teal-500/20 mb-6">
                  <Lock className="w-3 h-3 text-teal-400" />
                  <span className="text-[10px] font-mono uppercase text-teal-400 tracking-wider">Sealed on Midnight</span>
                </div>
                <div className="flex items-center gap-4 mt-auto">
                  <button className="text-white/50 hover:text-white text-sm font-medium transition-colors">Mark Resolved</button>
                  <Link to="/certificate" className="ml-auto px-4 py-2 border border-purpleAccent/50 text-purpleAccent rounded-full hover:bg-purpleAccent/10 transition-all font-medium text-sm">
                    Generate ZK Proof
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 3 (Fulfilled) */}
            <div className="glass rounded-[2.5rem] p-8 flex flex-col relative group opacity-80 border-greenSuccess/10">
              <StatusBadge status="FULFILLED" className="absolute top-8 right-8" />
              <h3 className="text-2xl font-bold mb-4 pr-24 text-white/80">Project Atlas Bonus</h3>
              <div className="mb-6 flex-1">
                <div className="text-white/40 text-xs font-mono uppercase mb-1">Condition</div>
                <p className="text-white/50 line-through">Deliver core modules by target date</p>
                <div className="flex items-center gap-2 mt-3 text-sm text-greenSuccess">
                  <CheckCircle className="w-4 h-4" /> Completed Jun 02
                </div>
              </div>
              <div className="border-t border-white/10 pt-6">
                <div className="text-white/40 text-[10px] font-mono uppercase mb-2">Cryptographic Record</div>
                <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <LinkIcon className="w-4 h-4 text-greenSuccess shrink-0" />
                    <span className="font-mono text-sm text-white/50 truncate">0x5bc4a8...e1f2</span>
                  </div>
                  <CopyButton text="0x5bc4a8e1f2a3b4c55bc4a8e1f2a3b4c5" />
                </div>
                <div className="flex items-center gap-2 w-max bg-greenSuccess/5 px-2 py-1 rounded-md">
                  <Lock className="w-3 h-3 text-greenSuccess/60" />
                  <span className="text-[10px] font-mono uppercase text-greenSuccess/60">Verified & Sealed</span>
                </div>
              </div>
            </div>

            {/* Card 4 (Broken) */}
            <div className="glass rounded-[2.5rem] p-8 flex flex-col relative group opacity-60 border-red-500/10 hover:opacity-100 transition-opacity">
              <StatusBadge status="BROKEN" className="absolute top-8 right-8" />
              <h3 className="text-2xl font-bold mb-4 pr-24 text-white/80">Flexible Work Agreement</h3>
              <div className="mb-6 flex-1">
                <div className="text-white/40 text-xs font-mono uppercase mb-1">Condition</div>
                <p className="text-white/50 line-through">Allowed unconditionally after probation</p>
                <div className="flex items-center gap-2 mt-3 text-sm text-red-500">
                  <div className="w-4 h-4 rounded-full border-2 border-red-500 flex items-center justify-center">
                    <div className="w-2 h-0.5 bg-red-500 -rotate-45 absolute" />
                    <div className="w-2 h-0.5 bg-red-500 rotate-45 absolute" />
                  </div>
                  Expired Dec 01
                </div>
              </div>
              <div className="border-t border-white/10 pt-6">
                <div className="text-white/40 text-[10px] font-mono uppercase mb-2">Cryptographic Record</div>
                <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <LinkIcon className="w-4 h-4 text-red-500/50 shrink-0" />
                    <span className="font-mono text-sm text-white/40 truncate">0x7f9ec5...b3a1</span>
                  </div>
                  <CopyButton text="0x7f9ec5b3a1d2e3f47f9ec5b3a1d2e3f4" />
                </div>
                <div className="flex items-center gap-2 w-max bg-red-500/5 px-2 py-1 rounded-md">
                  <Lock className="w-3 h-3 text-red-500/60" />
                  <span className="text-[10px] font-mono uppercase text-red-500/60">Immutable Record</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Sidebar (30%) */}
        <div className="lg:w-[30%]">
          <div className="sticky top-32 glass rounded-[2.5rem] p-8">
            <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
            <div className="flex flex-col gap-4 mb-8">
              <a href="/#vault-demo" className="w-full bg-blueAccent text-navy font-bold py-4 rounded-full text-center hover:bg-blueAccent/90 transition-all shadow-[0_0_20px_rgba(122,160,255,0.2)]">
                Record New Promise
              </a>
              <a href="/#complaint-demo" className="w-full bg-red-500/10 text-red-500 border border-red-500/30 font-bold py-4 rounded-full text-center hover:bg-red-500 hover:text-white transition-all">
                File Anonymous Report
              </a>
              <button className="w-full text-white/50 hover:text-white font-medium py-3 text-sm flex items-center justify-center gap-2 transition-colors">
                <FileDown className="w-4 h-4" /> Generate Export
              </button>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

            <h4 className="font-mono text-[10px] uppercase text-white/40 tracking-wider mb-6">Recent Activity</h4>
            <div className="space-y-6">
              
              <div className="relative pl-6">
                <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-blueAccent shadow-[0_0_10px_#7aa0ff]" />
                <div className="absolute left-[3px] top-4 w-px h-[calc(100%+8px)] bg-white/10" />
                <p className="text-sm text-white/90 font-medium mb-1 line-clamp-1">Promise sealed &middot; 15% Salary Increment</p>
                <div className="flex items-center justify-between text-xs text-white/40">
                  2 hours ago <span className="bg-blueAccent/10 text-blueAccent px-2 py-0.5 rounded-full border border-blueAccent/20">New</span>
                </div>
              </div>

              <div className="relative pl-6">
                <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-purpleAccent opacity-60" />
                <div className="absolute left-[3px] top-4 w-px h-[calc(100%+8px)] bg-white/10" />
                <p className="text-sm text-white/70 font-medium mb-1 line-clamp-1">ZK Proof generated &middot; <span className="font-mono text-xs">0x8a1d...f3d2</span></p>
                <div className="text-xs text-white/40">1 day ago</div>
              </div>

              <div className="relative pl-6">
                <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-greenSuccess opacity-60" />
                <p className="text-sm text-white/70 font-medium mb-1 line-clamp-1">Promise fulfilled &middot; Project Atlas Bonus</p>
                <div className="text-xs text-white/40">3 days ago</div>
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
      <ToastNotification show={showToast} message={toastMsg} onClose={() => setShowToast(false)} type="info" />
    </div>
  );
}
