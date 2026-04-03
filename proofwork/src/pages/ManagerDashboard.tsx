import React, { useEffect, useState } from 'react';
import { ShieldAlert, TrendingUp, Banknote, Home, GraduationCap, XOctagon, CheckCircle2, Clock, FileSignature } from 'lucide-react';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';
import StatusBadge from '../components/StatusBadge';

export default function ManagerDashboard() {
  const [offset, setOffset] = useState(282.7);

  useEffect(() => {
    // Animate score ring on mount
    const timer = setTimeout(() => {
      setOffset(36.75); // 87% score
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-navy flex flex-col pt-32">
      <NavigationBar activeItem="manager" />

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 pb-24 border-white/5">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <div className="px-3 py-1 bg-purpleAccent/10 text-purpleAccent rounded-full font-mono text-[10px] uppercase font-bold tracking-widest inline-flex border border-purpleAccent/20 mb-4">
              Manager Profile
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">Dashboard</h1>
            <p className="text-white/50 text-lg">Your on-chain reputation and active commitments.</p>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-3 border border-white/20 text-white rounded-full hover:bg-white/5 transition-colors font-medium">
              Export Report
            </button>
            <button className="px-6 py-3 bg-blueAccent text-navy rounded-full hover:bg-blueAccent/90 transition-colors font-bold shadow-[0_0_20px_rgba(122,160,255,0.2)]">
              New Promise
            </button>
          </div>
        </div>

        {/* 12-col Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COL (4) */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            
            {/* Trust Score Card */}
            <div className="glass rounded-[2.5rem] p-10 flex flex-col items-center text-center group hover:border-greenSuccess/30 transition-colors relative overflow-visible">
              <div className="absolute top-0 left-0 w-48 h-48 bg-greenSuccess/10 blur-[80px] group-hover:opacity-100 opacity-50 transition-opacity rounded-full pointer-events-none" />
              
              <div className="relative mb-8 cursor-help group/tooltip">
                <h3 className="text-xl font-bold tracking-tight">Trust Score</h3>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-charcoal border border-white/10 rounded-xl text-[10px] font-mono text-white/70 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all shadow-xl z-10">
                  Calculated based on ratio of total fulfilled promises vs active/broken on the Midnight blockchain.
                </div>
              </div>

              <div className="relative w-48 h-48 shrink-0 mb-10">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(77,214,160,0.5)]">
                  <circle cx="50" cy="50" r="45" className="stroke-white/5 fill-none" strokeWidth="6" />
                  <circle 
                    cx="50" cy="50" r="45" 
                    className="stroke-greenSuccess fill-none transition-all duration-[1.5s] ease-[cubic-bezier(0.22,1,0.36,1)]" 
                    strokeWidth="6" 
                    strokeDasharray="282.7" 
                    strokeDashoffset={offset} 
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-6xl font-bold text-white tracking-tighter">87</span>
                  <span className="text-white/40 font-mono text-sm mt-1">/ 100</span>
                </div>
              </div>

              {/* Sparkline */}
              <div className="w-full pt-8 border-t border-white/5">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-sm font-medium text-white/50">6 Mo Trajectory</span>
                  <span className="bg-greenSuccess/10 text-greenSuccess px-2 py-0.5 rounded-full text-[10px] font-mono border border-greenSuccess/20">+4 pts</span>
                </div>
                <div className="w-full h-12 relative overflow-hidden">
                  <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
                    <defs>
                      <linearGradient id="sparkGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#4dd6a0" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#4dd6a0" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,28 L15,25 L30,26 L45,20 L60,18 L75,12 L90,8 L100,5 L100,30 L0,30 Z" fill="url(#sparkGradient)" />
                    <path d="M0,28 L15,25 L30,26 L45,20 L60,18 L75,12 L90,8 L100,5" stroke="#4dd6a0" strokeWidth="2.5" fill="none" />
                  </svg>
                </div>
              </div>

              <div className="mt-8 px-4 py-2 bg-purpleAccent/5 border border-purpleAccent/10 rounded-xl text-xs font-mono uppercase text-purpleAccent/80">
                Confidential Computation
              </div>
            </div>
            
          </div>

          {/* RIGHT COL (8) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Promise Fulfillment Card */}
            <div className="glass rounded-[2.5rem] p-8 md:p-10">
              <h3 className="text-2xl font-bold mb-8">Promise Fulfillment</h3>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                  <FileSignature className="w-6 h-6 text-white/60 mb-3" />
                  <div className="text-3xl font-bold mb-1">12</div>
                  <div className="text-xs font-mono uppercase text-white/50">Total Created</div>
                </div>
                <div className="bg-greenSuccess/5 border border-greenSuccess/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                  <CheckCircle2 className="w-6 h-6 text-greenSuccess mb-3" />
                  <div className="text-3xl font-bold text-greenSuccess mb-1">10</div>
                  <div className="text-xs font-mono uppercase text-greenSuccess/70">Fulfilled</div>
                </div>
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                  <Clock className="w-6 h-6 text-amber-500 mb-3" />
                  <div className="text-3xl font-bold text-amber-500 mb-1">1</div>
                  <div className="text-xs font-mono uppercase text-amber-500/70">Pending</div>
                </div>
                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                  <XOctagon className="w-6 h-6 text-red-500 mb-3" />
                  <div className="text-3xl font-bold text-red-500 mb-1">1</div>
                  <div className="text-xs font-mono uppercase text-red-500/70">Broken</div>
                </div>
              </div>

              {/* Bar Charts */}
              <div className="pt-6 border-t border-white/5 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-white/70">Fulfilled</div>
                  <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-greenSuccess shadow-[0_0_10px_#4dd6a0] rounded-full w-[83%]" />
                  </div>
                  <div className="w-12 text-right font-mono text-sm text-greenSuccess">83%</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-white/70">Pending</div>
                  <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full w-[8%]" />
                  </div>
                  <div className="w-12 text-right font-mono text-sm text-amber-500">8%</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-white/70">Broken</div>
                  <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full w-[8%]" />
                  </div>
                  <div className="w-12 text-right font-mono text-sm text-red-500">8%</div>
                </div>
              </div>
            </div>

            {/* Active Promises List */}
            <div className="glass rounded-[2.5rem] p-8 md:p-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <h3 className="text-2xl font-bold">Active Promises</h3>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-mono border border-white/10">5</div>
                </div>
                <a href="#" className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors">
                  View Archive <span className="text-lg leading-none">&rarr;</span>
                </a>
              </div>

              <div className="space-y-4">
                {[
                  { title: 'Promotion to Senior Developer', icon: TrendingUp, deadline: 'Sep 30, 2025', condition: 'Complete Q3 Deliverables', empName: 'Sarah Jenkins', mgrId: 'mgr_0x1122...', empId: 'emp_0x3344...' },
                  { title: '15% Salary Increment', icon: Banknote, deadline: 'Oct 15, 2025', condition: 'Finalize Security Audit', empName: 'Marcus Chen', mgrId: 'mgr_0x1122...', empId: 'emp_0x5566...' },
                  { title: 'Remote Work Authorization', icon: Home, deadline: 'Nov 01, 2025', condition: '3 consecutive sprints with no bugs', empName: 'Elena Rodriguez', mgrId: 'mgr_0x1122...', empId: 'emp_0x7788...' },
                  { title: 'Conference Budget ($3,000)', icon: GraduationCap, deadline: 'Dec 15, 2025', condition: '2 blog posts published', empName: 'David Kim', mgrId: 'mgr_0x1122...', empId: 'emp_0x99aa...' },
                  { title: 'Role Transfer to Security', icon: ShieldAlert, deadline: 'Jan 01, 2026', condition: 'Complete OSCP certification', empName: 'Aisha Patel', mgrId: 'mgr_0x1122...', empId: 'emp_0xbbcc...' }
                ].map((item, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 group hover:bg-white/[0.04] hover:border-blueAccent/30 transition-all cursor-pointer">
                    <div className="flex items-start justify-between mb-4 gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-blueAccent/10 text-blueAccent flex items-center justify-center shrink-0">
                          <item.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{item.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-white/40 font-mono tracking-wider mt-1">
                            <Clock className="w-3 h-3" /> {item.deadline}
                          </div>
                        </div>
                      </div>
                      <StatusBadge status="PENDING" className="shrink-0" />
                    </div>
                    
                    <div className="mb-5 pl-16">
                      <div className="bg-charcoal px-4 py-3 rounded-xl text-sm text-white/70 border border-white/5">
                        <span className="text-white/30 font-mono uppercase text-[10px] mr-2">Condition</span>
                        {item.condition}
                      </div>
                    </div>

                    {/* Reveal Parties Block */}
                    <div className="relative overflow-hidden h-[48px] rounded-xl border border-white/5 ml-16 bg-black/20">
                      {/* Default state */}
                      <div className="absolute inset-0 flex items-center justify-center gap-4 font-mono text-xs text-white/40 transition-transform duration-300 group-hover:-translate-y-full px-4">
                        <span className="truncate">{item.mgrId}</span>
                        <div className="w-8 border-t border-dashed border-white/20" />
                        <span className="truncate">{item.empId}</span>
                      </div>
                      
                      {/* Hover state */}
                      <div className="absolute inset-0 bg-blueAccent/10 flex items-center justify-center gap-4 transition-transform duration-300 translate-y-full group-hover:translate-y-0 px-4">
                        <div className="flex items-center gap-2 text-white">
                          <div className="w-6 h-6 rounded-full bg-blueAccent/20 flex items-center justify-center text-[10px] font-bold text-blueAccent border border-blueAccent/30">Me</div>
                        </div>
                        <div className="flex-1 border-t border-dashed border-blueAccent/30" />
                        <div className="flex items-center gap-2 text-white font-medium text-sm">
                          {item.empName} <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center"><UserCircle className="w-4 h-4 text-white/60" /></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
