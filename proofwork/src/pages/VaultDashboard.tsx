import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Lock, CheckCircle, Clock, Link as LinkIcon, FileDown, Vault } from 'lucide-react';
import { Icon } from '@iconify/react';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';
import CopyButton from '../components/CopyButton';
import StatusBadge from '../components/StatusBadge';
import ToastNotification from '../components/ToastNotification';
import { useApp } from '../context/DemoModeContext';
import clsx from 'clsx';

export default function VaultDashboard() {
  const { promises, updatePromise } = useApp();
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [flashingId, setFlashingId] = useState<string | null>(null);

  const sealedCount = promises.length;
  const fulfilledCount = promises.filter((p: any) => p.status === 'FULFILLED').length;
  const pendingCount = promises.filter((p: any) => p.status === 'PENDING').length;

  const handleMarkResolved = (id: string) => {
    updatePromise(id, { status: 'FULFILLED' });
    setFlashingId(id);
    setTimeout(() => setFlashingId(null), 1000);
    setToastMsg('Promise marked as FULFILLED ✓');
    setShowToast(true);
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setToastMsg(`Copied hash: ${hash.substring(0,10)}...`);
    setShowToast(true);
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col pt-32 font-sans text-white">
      <NavigationBar activeItem="vault" />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pb-24 flex flex-col lg:flex-row-reverse gap-12">
        {/* Sidebar (30%) */}
        <div className="lg:w-[30%]">
          <div className="sticky top-32 glass rounded-[2.5rem] p-8">
            <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
            <div className="flex flex-col gap-4 mb-8">
              <Link to="/#vault-demo" className="w-full bg-blueAccent text-navy font-bold py-4 rounded-full text-center hover:bg-blueAccent/90 transition-all shadow-[0_0_20px_rgba(122,160,255,0.2)]">
                Record New Promise
              </Link>
              <Link to="/#complaint-demo" className="w-full bg-red-500/10 text-red-500 border border-red-500/30 font-bold py-4 rounded-full text-center hover:bg-red-500 hover:text-white transition-all">
                File Anonymous Report
              </Link>
              <button className="w-full text-white/50 hover:text-white font-medium py-3 text-sm flex items-center justify-center gap-2 transition-colors">
                <FileDown className="w-4 h-4" /> Generate Export
              </button>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

            <h4 className="font-mono text-[10px] uppercase text-white/40 tracking-wider mb-6">Recent Activity</h4>
            <div className="space-y-6">
              {promises.slice(0, 3).map((p: any, i: number) => (
                <div key={i} className="relative pl-6">
                  {p.status === 'PENDING' && <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-blueAccent shadow-[0_0_10px_#7aa0ff]" />}
                  {p.status === 'FULFILLED' && <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-greenSuccess opacity-60" />}
                  {p.status === 'BROKEN' && <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-red-500 opacity-60" />}
                  {i < 2 && <div className="absolute left-[3px] top-4 w-px h-[calc(100%+8px)] bg-white/10" />}
                  <p className="text-sm text-white/90 font-medium mb-1 line-clamp-1">
                    {p.status === 'PENDING' ? 'Promise sealed' : p.status === 'FULFILLED' ? 'Promise fulfilled' : 'Promise broken'} &middot; {p.title}
                  </p>
                  <div className="flex items-center justify-between text-xs text-white/40">
                    <span className="font-mono">{new Date(p.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

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
              {sealedCount} sealed promises &middot; <CheckCircle className="w-4 h-4 text-greenSuccess" /> All verified on Midnight
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Lock, color: 'blueAccent', count: sealedCount, label: 'Sealed Promises' },
              { icon: CheckCircle, color: 'greenSuccess', count: fulfilledCount, label: 'Fulfilled' },
              { icon: Clock, color: 'amber-500', count: pendingCount, label: 'Pending Resolution' }
            ].map((stat, i) => (
              <div key={i} className="glass rounded-[2rem] p-8 relative overflow-hidden group">
                <div className={clsx(`absolute -right-6 -bottom-6 w-32 h-32 blur-[50px] group-hover:opacity-100 opacity-50 transition-all`, 
                  stat.color === 'blueAccent' && 'bg-blueAccent/10',
                  stat.color === 'greenSuccess' && 'bg-greenSuccess/10',
                  stat.color === 'amber-500' && 'bg-amber-500/10'
                )} />
                <stat.icon className={clsx(`w-8 h-8 mb-4`, 
                  stat.color === 'blueAccent' && 'text-blueAccent',
                  stat.color === 'greenSuccess' && 'text-greenSuccess',
                  stat.color === 'amber-500' && 'text-amber-500'
                )} />
                <div className="text-5xl font-bold mb-2">{stat.count}</div>
                <div className="font-mono text-[10px] uppercase text-white/50 tracking-wider mix-blend-screen">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Promise Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promises.length === 0 ? (
              <div className="glass rounded-[2.5rem] p-16 text-center col-span-1 md:col-span-2">
                <Icon icon="lucide:vault" className="text-6xl text-white/20 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-white/40 mb-2">Your vault is empty</h3>
                <p className="text-white/30 text-sm mb-8">
                  Seal your first workplace promise to get started
                </p>
                <Link to="/#vault-demo">
                  <button className="bg-blueAccent text-navy font-bold px-8 py-3 rounded-full hover:bg-blueAccent/90 transition-all">
                    Record First Promise
                  </button>
                </Link>
              </div>
            ) : (
              promises.map((p: any) => {
                const isFlashing = flashingId === p.id;
                
                return (
                  <div key={p.id} className={clsx(
                    "glass rounded-[2.5rem] p-8 flex flex-col relative group transition-all duration-300",
                    p.status === 'PENDING' && "hover:border-blueAccent/40 hover:-translate-y-1 hover:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)]",
                    p.status === 'FULFILLED' && "opacity-80 border-greenSuccess/10",
                    p.status === 'BROKEN' && "opacity-60 border-red-500/10 hover:opacity-100",
                    isFlashing && "!border-greenSuccess !bg-greenSuccess/10 shadow-[0_0_20px_rgba(77,214,160,0.4)]"
                  )}>
                    <StatusBadge 
                      status={p.status} 
                      className={clsx("absolute top-8 right-8 transition-transform duration-500", isFlashing && "scale-110")} 
                    />
                    <h3 className={clsx("text-xl md:text-2xl font-bold mb-4 pr-24 line-clamp-2", p.status !== 'PENDING' && 'text-white/80')}>{p.title}</h3>
                    
                    <div className="mb-6 flex-1">
                      <div className="text-white/40 text-xs font-mono uppercase mb-1">Condition</div>
                      <p className={clsx(p.status === 'PENDING' ? 'text-white/80' : 'text-white/50 line-through', "text-sm")}>{p.condition}</p>
                      
                      <div className={clsx("flex items-center gap-2 mt-3 text-sm", 
                        p.status === 'PENDING' && "text-amber-500/80",
                        p.status === 'FULFILLED' && "text-greenSuccess",
                        p.status === 'BROKEN' && "text-red-500"
                      )}>
                        {p.status === 'PENDING' && <Clock className="w-4 h-4" />}
                        {p.status === 'FULFILLED' && <CheckCircle className="w-4 h-4" />}
                        {p.status === 'BROKEN' && <span className="font-bold border border-red-500 rounded-full w-4 h-4 flex items-center justify-center text-[10px]">!</span>}
                        {p.status === 'PENDING' && p.deadline}
                        {p.status === 'FULFILLED' && `Completed`}
                        {p.status === 'BROKEN' && `Expired ${p.deadline}`}
                      </div>
                    </div>
                    
                    <div className="border-t border-white/10 pt-6">
                      <div className="text-white/40 text-[10px] font-mono uppercase mb-2">Cryptographic Record</div>
                      <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <LinkIcon className={clsx("w-4 h-4 shrink-0", 
                            p.status === 'PENDING' && "text-blueAccent",
                            p.status === 'FULFILLED' && "text-greenSuccess",
                            p.status === 'BROKEN' && "text-red-500/50"
                          )} />
                          <span className={clsx("font-mono text-sm truncate", p.status === 'PENDING' ? "text-white/70" : "text-white/40")}>
                            {(p.hash || p.id).substring(0, 16)}...
                          </span>
                        </div>
                        <CopyButton text={p.hash || p.id} />
                      </div>
                      
                      <div className={clsx("flex items-center gap-1 w-max px-2 py-1 rounded-md mb-6",
                        p.status === 'PENDING' ? "bg-teal-500/10 border border-teal-500/20" : 
                        p.status === 'FULFILLED' ? "bg-greenSuccess/5" : "bg-red-500/5"
                      )}>
                        <Lock className={clsx("w-3 h-3", 
                          p.status === 'PENDING' && "text-teal-400",
                          p.status === 'FULFILLED' && "text-greenSuccess/60",
                          p.status === 'BROKEN' && "text-red-500/60"
                        )} />
                        <span className={clsx("text-[10px] font-mono uppercase tracking-wider", 
                          p.status === 'PENDING' && "text-teal-400",
                          p.status === 'FULFILLED' && "text-greenSuccess/60",
                          p.status === 'BROKEN' && "text-red-500/60"
                        )}>
                          {p.status === 'PENDING' ? "Sealed on Midnight" : 
                           p.status === 'FULFILLED' ? "Verified & Sealed" : "Immutable Record"}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center mt-auto">
                        {p.status === 'PENDING' && (
                          <button 
                            onClick={() => handleMarkResolved(p.id)}
                            className="text-white/50 hover:text-white text-sm font-medium transition-colors cursor-pointer"
                          >
                            Mark Fulfilled
                          </button>
                        )}
                        {p.status !== 'PENDING' && <div />}
                        <Link 
                          to="/certificate" 
                          state={{ promise: p }}
                          className="px-4 py-2 border border-purpleAccent/50 text-purpleAccent rounded-full hover:bg-purpleAccent/10 transition-all font-medium text-xs sm:text-sm"
                        >
                          Generate ZK Proof
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      <Footer />
      <ToastNotification 
        show={showToast} 
        message={toastMsg} 
        onClose={() => setShowToast(false)} 
        type="success" 
      />
    </div>
  );
}
