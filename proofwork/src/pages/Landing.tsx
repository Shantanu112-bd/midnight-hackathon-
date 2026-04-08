import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Lock, ArrowRight, Signature, EyeOff, BarChart3, ShieldCheck, 
  Loader2, CheckCircle2, Ghost, AlertTriangle, ShieldOff, 
  UserCircle, CheckCircle, Verified, Shield, X 
} from 'lucide-react';
import { Icon } from '@iconify/react';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';
import CopyButton from '../components/CopyButton';
import ToastNotification from '../components/ToastNotification';
import StatusBadge from '../components/StatusBadge';
import { extractAndCreatePromise, fileComplaint } from '../hooks/useApi';
import { useApp } from '../context/DemoModeContext';
import clsx from 'clsx';

function OnboardingModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const next = () => {
    if (step < 3) setStep(step + 1);
    else onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-navy/80 backdrop-blur-sm animate-fade-in-up">
      <div className="glass rounded-[2rem] p-8 md:p-12 max-w-lg w-full relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white">
          <X className="w-6 h-6" />
        </button>
        <div className="w-16 h-16 bg-limeAccent/20 text-limeAccent rounded-full flex items-center justify-center mb-6">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Welcome to ProofWork</h2>
        
        <div className="min-h-[120px] mb-8">
          {step === 1 && (
            <div className="animate-fade-in-up">
              <h3 className="text-xl font-bold mb-2">Step 1 — Record Promises</h3>
              <p className="text-white/60">Upload your review transcripts and use AI to extract actionable promises. They'll be sealed securely on the Midnight blockchain.</p>
            </div>
          )}
          {step === 2 && (
            <div className="animate-fade-in-up">
              <h3 className="text-xl font-bold mb-2">Step 2 — File Anonymously</h3>
              <p className="text-white/60">Report broken promises safely. Zero-knowledge proofs verify your employee status without revealing your identity.</p>
            </div>
          )}
          {step === 3 && (
            <div className="animate-fade-in-up">
              <h3 className="text-xl font-bold mb-2">Step 3 — Generate Proof</h3>
              <p className="text-white/60">Generate cryptographic receipts for any interaction to maintain a verifiable history of organizational trust.</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-8">
          {[1,2,3].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full ${step >= s ? 'bg-limeAccent' : 'bg-white/10'}`} />
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button onClick={onClose} className="px-6 py-3 border border-white/20 text-white rounded-full hover:bg-white/5 font-medium transition-colors">
            Skip
          </button>
          <button 
            onClick={step === 3 ? onClose : next}
            className="flex-1 bg-limeAccent text-navy font-bold py-3 rounded-full hover:bg-limeAccent/90 transition-transform"
          >
            {step === 3 ? 'Connect Wallet' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('proofwork_onboarded'));
  const dismissOnboarding = () => {
    localStorage.setItem('proofwork_onboarded', 'true');
    setShowOnboarding(false);
  };

  const { addPromise, addComplaint, complaints, wallet } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handle scrolling when coming from other pages (via state or hash)
    const scrollToTarget = () => {
      let targetId = null;
      if (location.state?.scrollTo === 'complaint') targetId = 'complaint-demo';
      else if (location.hash === '#vault-demo') targetId = 'vault-demo';
      else if (location.hash === '#complaint-demo') targetId = 'complaint-demo';

      if (targetId) {
        setTimeout(() => {
          document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    };
    scrollToTarget();
  }, [location]);
  
  const scrollToSection = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Vault Demo State
  const [vaultStep, setVaultStep] = useState<1 | 2 | 3>(1);
  const [transcript, setTranscript] = useState('');
  const [managerId, setManagerId] = useState('');
  const [loadingPromise, setLoadingPromise] = useState(false);
  const [extractedPromise, setExtractedPromise] = useState<any>(null);
  const [txHash, setTxHash] = useState('');
  const [toastData, setToastData] = useState<{show: boolean, msg: string, type: 'success' | 'info' | 'error'}>({show: false, msg: '', type: 'success'});
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [sealing, setSealing] = useState(false);

  // Complaint Demo State
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);
  const [complaintText, setComplaintText] = useState('');
  const [complaintManagerId, setComplaintManagerId] = useState('');
  const [complaintLoading, setComplaintLoading] = useState(false);

  const handleSeal = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!transcript) return;
    setLoadingPromise(true);
    setToastData({ show: true, msg: 'Extracting and sealing on Midnight...', type: 'info' });
    
    try {
      const result = await extractAndCreatePromise(
        transcript,
        managerId || 'mgr_unknown',
        wallet.address || 'emp_demo_user'
      );
      
      const newPromise = addPromise({
        title: result.extractedData?.promise?.description || 'Sealed Promise',
        condition: result.extractedData?.promise?.condition || '',
        deadline: result.extractedData?.promise?.deadline || 'TBD',
        hash: result.contractTxId
      });
      setExtractedPromise(result.extractedData?.promise);
      setTxHash(result.contractTxId);
      setVaultStep(3);
      setToastData({ show: true, msg: `✓ Promise sealed`, type: 'success' });
    } catch (err: any) {
      setToastData({ show: true, msg: err.message || 'Failed to seal', type: 'error' });
    } finally {
      setLoadingPromise(false);
    }
  };

  const handleFileComplaint = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!complaintText) return;
    setComplaintLoading(true);
    try {
      const res = await fileComplaint(complaintText, 'general', complaintManagerId || 'mgr_demo');
      addComplaint({
        category: 'Broken Promise',
        managerId: complaintManagerId || 'mgr_demo',
        description: complaintText
      });
      setTxHash(res.txId || '');
      setComplaintSubmitted(true);
      setToastData({ show: true, msg: `Report filed`, type: 'success' });
    } catch(err: any) {
      setToastData({ show: true, msg: err.message || 'Failed to file report', type: 'error' });
    } finally {
      setComplaintLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col pt-32">
      {showOnboarding && <OnboardingModal onClose={dismissOnboarding} />}
      <NavigationBar activeItem="landing" />

      {/* HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center -mt-32 overflow-hidden bg-grid">
        <div id="star-field-1" className="absolute w-px h-px bg-transparent animate-stars-anim opacity-30 z-0" />
        <div id="star-field-2" className="absolute w-[2px] h-[2px] bg-transparent animate-stars-anim-mid opacity-30 z-0" />
        
        <div className="relative z-10 text-center max-w-4xl px-4 flex flex-col items-center">
          <div className="glass px-4 py-2 rounded-full inline-flex items-center gap-2 text-blueAccent mb-8 font-medium">
            <Lock className="w-4 h-4" />
            Built on Midnight Network
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-[-0.06em] leading-[0.9] mb-8">
            Workplace Truth,<br />
            <span className="bg-gradient-to-r from-white to-limeAccent bg-clip-text text-transparent italic">Proven.</span>
          </h1>
          
          <p className="text-white/60 text-lg md:text-2xl max-w-2xl font-light mb-12">
            The privacy-first accountability protocol. Seal professional promises and file anonymous reports powered by Zero-Knowledge Proofs.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link 
              to="/vault"
              className="w-full sm:w-auto bg-blueAccent text-navy font-bold px-8 py-4 rounded-full flex items-center justify-center gap-3 transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(122,160,255,0.4)]"
            >
              Start Recording Promises <ArrowRight className="w-5 h-5" />
            </Link>
            <button 
              onClick={(e) => scrollToSection(e, 'vault-demo')}
              className="w-full sm:w-auto border border-white/20 text-white font-medium px-8 py-4 rounded-full hover:bg-white/5 transition-all text-center"
            >
              See How It Works
            </button>
          </div>

          <div className="mt-24 grid grid-cols-2 md:flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale group hover:grayscale-0 transition-all duration-500">
            {['Midnight Network Secured', 'Zero-Knowledge Verified', 'Enterprise Ready'].map((badge, i) => (
              <div key={i} className="flex items-center gap-2 font-mono text-[11px] uppercase">
                <Shield className="w-4 h-4" />
                {badge}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES BENTO GRID */}
      <section className="py-32 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Card 1 */}
          <div className="md:col-span-2 glass rounded-[2.5rem] p-10 group hover:border-blueAccent/40 transition-all relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blueAccent/10 blur-[80px] group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
            <Signature className="w-10 h-10 text-blueAccent mb-6" />
            <h3 className="text-3xl font-bold mb-4">Seal Promises</h3>
            <p className="text-white/50 text-lg leading-relaxed mb-8">
              Convert verbal commitments into immutable blockchain records. Both parties cryptographically sign, establishing a verifiable history.
            </p>
            <span className="px-4 py-1.5 bg-blueAccent/10 text-blueAccent rounded-full text-xs font-mono uppercase inline-block">Immutable Verification</span>
          </div>

          {/* Card 2 */}
          <div className="md:col-span-1 glass rounded-[2.5rem] p-10 hover:border-purpleAccent/40 transition-all flex flex-col justify-between">
            <div>
              <EyeOff className="w-10 h-10 text-purpleAccent mb-6" />
              <h3 className="text-3xl font-bold mb-4 text-balance">Stay Anonymous</h3>
              <p className="text-white/50 mb-8">ZK Proofs verify your status without revealing your identity.</p>
            </div>
            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <div className="w-12 h-12 rounded-full border border-purpleAccent/20 bg-purpleAccent/10 flex items-center justify-center text-xs text-purpleAccent font-mono">Me</div>
              <div className="flex-1 flex justify-center relative">
                <div className="w-full border-t border-dashed border-white/20 absolute top-1/2 -translate-y-1/2" />
                <div className="w-3 h-3 bg-purpleAccent rounded-full relative z-10 shadow-[0_0_10px_#b07cff]" />
              </div>
              <div className="w-12 h-12 rounded-full border border-white/20 bg-white/5 flex items-center justify-center"><Icon icon="lucide:database" className="text-white/40" /></div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="md:col-span-1 glass rounded-[2.5rem] p-10 hover:border-greenSuccess/40 transition-all">
            <BarChart3 className="w-10 h-10 text-greenSuccess mb-6" />
            <div className="space-y-4 mb-8">
              <div className="h-2 w-[87%] bg-greenSuccess rounded-full" />
              <div className="h-2 w-[42%] bg-blueAccent rounded-full" />
            </div>
            <p className="text-white/50 font-medium">Real-time cryptographic auditing of organizational trust.</p>
          </div>

          {/* Card 4 */}
          <div className="md:col-span-2 md:col-start-3 glass rounded-[2.5rem] p-10 border-limeAccent/20 bg-limeAccent/[0.02] hover:border-limeAccent/40 transition-all flex items-center gap-8">
            <div className="relative w-32 h-32 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="45" className="stroke-white/5 fill-none" strokeWidth="10" />
                <circle cx="50" cy="50" r="45" className="stroke-limeAccent fill-none" strokeWidth="10" strokeDasharray="282.7" strokeDashoffset="36" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">87</span>
                <span className="text-[10px] font-mono text-limeAccent uppercase">Trust Score</span>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold mb-4">Manager Insights</h3>
              <p className="text-white/50 leading-relaxed mb-4">
                Managers build verifiable reputations through consecutive fulfilled promises, visible to the whole organization.
              </p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-greenSuccess/10 text-greenSuccess text-xs rounded-full border border-greenSuccess/20">
                <Icon icon="lucide:trending-up" /> +12% improvement
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* PROMISE VAULT DEMO */}
      <section id="vault-demo" className="py-32 bg-obsidian/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 w-full flex flex-col lg:flex-row gap-12">
          
          {/* Left Form */}
          <div className="lg:w-[55%]">
            <div className="inline-flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-blueAccent/10 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-blueAccent" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold">Seal a New Promise</h2>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-4">
              {[
                { s: 1, label: 'Paste Transcript' },
                { s: 2, label: 'AI Extraction' },
                { s: 3, label: 'Secure Seal' }
              ].map((step, idx) => (
                <React.Fragment key={step.s}>
                  <div className={clsx(
                    "flex items-center gap-3 shrink-0 transition-colors",
                    vaultStep === step.s ? "text-white" : vaultStep > step.s ? "text-greenSuccess" : "text-white/40"
                  )}>
                    <div className={clsx(
                      "w-8 h-8 rounded-full border flex items-center justify-center font-mono text-sm transition-colors",
                      vaultStep === step.s ? "bg-blueAccent text-navy border-blueAccent" : 
                      vaultStep > step.s ? "bg-greenSuccess/20 border-greenSuccess" : 
                      "border-white/10"
                    )}>
                      {vaultStep > step.s ? <CheckCircle className="w-4 h-4" /> : step.s}
                    </div>
                    <span className="font-semibold text-sm">{step.label}</span>
                  </div>
                  {idx < 2 && <div className={clsx("w-8 h-px shrink-0 transition-colors", vaultStep > step.s ? "bg-greenSuccess" : "bg-white/10")} />}
                </React.Fragment>
              ))}
            </div>

            {/* Content area */}
            <div className="min-h-[400px]">
              {vaultStep === 1 && (
                <div className="space-y-6 animate-fade-in-up">
                  <textarea 
                    rows={8}
                    className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white placeholder-white/30 focus:border-blueAccent outline-none transition-colors resize-none"
                    placeholder="Paste meeting notes or conversation transcript here..."
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="Enter Manager ID (e.g. @sarah_j)"
                      className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 outline-none focus:border-blueAccent transition-colors"
                      value={managerId}
                      onChange={(e) => setManagerId(e.target.value)}
                    />
                    <input 
                      type="text" 
                      value={wallet.isConnected 
                        ? `${wallet.address?.slice(0,6)}...${wallet.address?.slice(-4)}` 
                        : 'emp_0x1a2b...3c4d (connect wallet)'
                      }
                      disabled
                      className={`w-full rounded-full px-6 py-4 cursor-not-allowed ${
                        wallet.isConnected 
                          ? 'bg-greenSuccess/5 border border-greenSuccess/20 text-greenSuccess' 
                          : 'bg-white/[0.02] border border-white/5 text-white/30'
                      }`}
                    />
                  </div>
                  {!wallet.isConnected && (
                    <p className="text-xs text-amber-500/70 font-mono mt-2">
                      ⚠ Connect Lace wallet to seal promises on-chain. 
                      Demo mode works without wallet.
                    </p>
                  )}
                  <button 
                    type="button"
                    onClick={handleSeal}
                    disabled={!transcript || loadingPromise}
                    className="w-full bg-blueAccent text-navy font-bold py-5 rounded-full hover:bg-blueAccent/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:pointer-events-none flex items-center justify-center gap-2"
                  >
                    {loadingPromise ? <><Loader2 className="w-5 h-5 animate-spin" /> Extracting & Sealing...</> : "Extract & Seal Promise"}
                  </button>
                  <p className="text-center text-white/30 text-xs font-mono">
                    Analysis happens entirely client-side/secure enclave. Transcript is never retained.
                  </p>
                </div>
              )}

              {vaultStep === 2 && extractedPromise && (
                <div className="glass rounded-[2rem] p-8 border-blueAccent/30 relative animate-fade-in-up">
                  <div className="absolute top-0 right-0 px-4 py-1.5 bg-greenSuccess text-navy font-bold text-sm rounded-tr-[2rem] rounded-bl-xl flex items-center gap-2">
                    {isDemoMode && <span className="bg-navy/20 px-2 py-0.5 rounded text-[10px] uppercase font-mono">Demo</span>}
                    {Math.round(extractedPromise.confidence * 100)}% Confidence
                  </div>
                  
                  <div className="text-blueAccent font-mono text-[10px] uppercase tracking-widest mb-4">Extracted Promise {isDemoMode ? '(Demo)' : ''}</div>
                  <h3 className="text-3xl font-bold mb-8">{extractedPromise.description}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <div>
                      <div className="text-white/40 text-xs mb-1 uppercase font-mono tracking-wider">Condition</div>
                      <div className="bg-white/5 px-4 py-3 rounded-xl border border-white/5">{extractedPromise.condition}</div>
                    </div>
                    <div>
                      <div className="text-white/40 text-xs mb-1 uppercase font-mono tracking-wider">Deadline</div>
                      <div className="bg-white/5 px-4 py-3 rounded-xl border border-white/5">{extractedPromise.deadline}</div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={handleSeal}
                      disabled={sealing}
                      className="flex-1 bg-blueAccent text-navy font-bold py-4 rounded-full hover:bg-blueAccent/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:pointer-events-none flex items-center justify-center gap-2"
                    >
                      {sealing ? <><Loader2 className="w-5 h-5 animate-spin" /> Sealing on Midnight...</> : "Seal on Midnight ✓"}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setVaultStep(1)}
                      className="px-8 py-4 border border-white/20 rounded-full hover:bg-white/5 transition-all font-medium"
                    >
                      Edit Details
                    </button>
                  </div>
                </div>
              )}

              {vaultStep === 3 && (
                <div className="flex flex-col items-center justify-center text-center py-8 animate-fade-in-up">
                  <div className="w-24 h-24 bg-greenSuccess/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="text-6xl text-greenSuccess" />
                  </div>
                  <h3 className="text-4xl font-bold mb-8">Promise Sealed</h3>
                  
                  <div className="glass p-6 rounded-3xl inline-flex flex-col items-center mb-10 min-w-[300px]">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1 w-max bg-teal-500/10 px-2 py-1 rounded-md border border-teal-500/20">
                        <Lock className="w-3 h-3 text-teal-400" />
                        <span className="text-[10px] font-mono uppercase text-teal-400 tracking-wider">Sealed on Midnight {isDemoMode && '(Demo)'}</span>
                      </div>
                    </div>
                    <div className="text-white/40 font-mono text-[10px] uppercase tracking-widest mb-3">Transaction Hash</div>
                    <div className="flex items-center gap-3 bg-black/40 rounded-full border border-white/10 px-4 py-2">
                      <span className="font-mono text-blueAccent text-sm">{txHash || '0x4f...8a'}</span>
                      <CopyButton text={txHash || '0x4f...8a'} />
                    </div>
                  </div>

                  <div className="flex gap-4 w-full justify-center">
                    <Link 
                      to="/certificate"
                      className="px-8 py-4 border border-purpleAccent text-purpleAccent rounded-full hover:bg-purpleAccent/10 transition-all font-bold"
                    >
                      Generate ZK Proof
                    </Link>
                    <a 
                      href={`https://explorer.testnet.midnight.network/transaction/${txHash || '0x4f...8a'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-4 text-white/60 hover:text-white transition-colors flex items-center gap-2"
                    >
                      View on Explorer <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right State Panel */}
          <div className="lg:w-[45%]">
            <div className="glass rounded-[2.5rem] p-8 lg:p-10 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">Your Promise Vault</h3>
                <div className="px-3 py-1 bg-white/10 border border-white/10 rounded-full text-xs font-mono">
                  {vaultStep === 3 ? '4 Sealed' : '3 Sealed'}
                </div>
              </div>

              <div className="space-y-4 flex-1">
                {/* Static card 1 */}
                <div className="glass p-5 rounded-2xl flex items-start justify-between border-white/5 opacity-60">
                  <div>
                    <h4 className="font-bold text-lg mb-1">Promotion to Lead</h4>
                    <p className="text-white/40 text-sm">Q3 Performance Review</p>
                  </div>
                  <StatusBadge status="PENDING" />
                </div>
                {/* Static card 2 */}
                <div className="glass p-5 rounded-2xl flex items-start justify-between border-greenSuccess/20 bg-greenSuccess/5">
                  <div>
                    <h4 className="font-bold text-lg mb-1">Project Atlas Bonus</h4>
                    <p className="text-greenSuccess/60 text-sm flex items-center gap-2"><CheckCircle className="w-3 h-3"/> Verified on-chain</p>
                  </div>
                  <StatusBadge status="FULFILLED" />
                </div>
                
                {/* Animated card when step 3 */}
                {vaultStep === 3 && extractedPromise && (
                  <div className="glass p-5 rounded-2xl flex items-start justify-between border-blueAccent/40 bg-blueAccent/5 animate-fade-in-up">
                    <div className="pr-4">
                      <h4 className="font-bold text-lg mb-1">{extractedPromise.description}</h4>
                      <p className="text-blueAccent/80 text-sm truncate max-w-[200px]">{extractedPromise.condition}</p>
                    </div>
                    <StatusBadge status="PENDING" />
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-purpleAccent/20 text-purpleAccent shrink-0">
                  <Icon icon="lucide:sparkles" className="w-5 h-5" />
                </div>
                <p className="text-sm text-white/60 leading-relaxed">
                  Each sealed record generates a ZK Certificate that proves the agreement exists without revealing its sensitive contents.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ANONYMOUS COMPLAINT DEMO */}
      <section id="complaint-demo" className="py-32 px-6 max-w-7xl mx-auto w-full">
        {/* Trust Banner */}
        <div className="glass bg-charcoal rounded-[2.5rem] p-10 mb-16 flex items-center justify-between group overflow-hidden relative">
          <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-blueAccent/5 to-transparent pointer-events-none" />
          
          <div className="lg:w-1/2 relative z-10">
            <div className="w-20 h-20 bg-blueAccent/20 text-blueAccent rounded-full flex items-center justify-center mb-6">
              <Shield className="w-10 h-10" />
            </div>
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Your identity is mathematically hidden</h3>
            <p className="text-white/60 text-lg mb-8 leading-relaxed">
              When you file an anonymous report, we generate a Zero-Knowledge Proof verifying you are an active employee. 
              The blockchain verifies the proof, but the cryptography makes it impossible to trace back to you.
            </p>
            <Link to="/certificate" className="text-blueAccent font-bold hover:underline flex items-center gap-2">
              How ZK Proofs work <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="hidden lg:flex w-1/2 justify-end items-center relative z-10 opacity-70 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <UserCircle className="w-12 h-12 text-white/50" />
                <span className="font-mono text-xs uppercase tracking-widest text-white/50">YOU</span>
              </div>
              <div className="w-16 border-t-2 border-dashed border-white/20 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-navy p-1">
                  <EyeOff className="w-5 h-5 text-red-400" />
                </div>
              </div>
              <div className="glass p-4 rounded-xl border-blueAccent/30 relative animate-float">
                <div className="absolute -inset-2 bg-blueAccent/20 blur-xl -z-10 rounded-full" />
                <Icon icon="lucide:fingerprint" className="w-10 h-10 text-blueAccent" />
              </div>
              <div className="w-16 border-t-2 border-dashed border-blueAccent/30 relative overflow-hidden">
                <div className="w-2 h-2 bg-blueAccent rounded-full absolute top-[-3px] animate-[slide_2s_linear_infinite]" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <Icon icon="lucide:database" className="w-12 h-12 text-white/80" />
                <span className="font-mono text-xs uppercase tracking-widest text-white/80">CHAIN</span>
              </div>
            </div>
          </div>
        </div>

        {!complaintSubmitted ? (
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Form */}
            <div className="lg:w-[60%]">
              <div className="flex items-center gap-3 mb-8">
                <Ghost className="w-8 h-8 text-red-400" />
                <h2 className="text-3xl font-bold">File Anonymous Report</h2>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white/50 font-mono text-xs uppercase tracking-widest mb-2">Category</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-400/50 appearance-none text-white transition-colors">
                      <option className="bg-charcoal">Broken Promise</option>
                      <option className="bg-charcoal">Policy Violation</option>
                      <option className="bg-charcoal">Harassment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/50 font-mono text-xs uppercase tracking-widest mb-2">Target Person / Manager</label>
                    <input 
                      type="text" 
                      placeholder="@username"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-400/50 text-white transition-colors"
                      value={complaintManagerId}
                      onChange={e => setComplaintManagerId(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/50 font-mono text-xs uppercase tracking-widest mb-2">Report Details</label>
                  <textarea 
                    rows={6}
                    placeholder="Provide specific details about the incident or broken promise..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-red-400/50 resize-none transition-colors"
                    value={complaintText}
                    onChange={e => setComplaintText(e.target.value)}
                  />
                </div>

                <div className="glass rounded-3xl p-6 flex justify-between items-center border border-white/5 hover:border-red-500/20 transition-colors">
                  <div className="flex gap-4">
                    <div className="bg-red-500/10 p-3 rounded-full text-red-500 shrink-0 self-start">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Escalate to HR immediately if verified</h4>
                      <p className="text-sm text-white/50">Automatically triggers investigation if threshold is met.</p>
                    </div>
                  </div>
                  <div className="w-12 h-6 rounded-full bg-red-500 relative cursor-pointer ml-4 shrink-0 transition-colors">
                    <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 right-0.5 shadow-md" />
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={handleFileComplaint}
                  disabled={!complaintText || complaintLoading}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-5 rounded-full flex justify-center items-center gap-3 transition-colors disabled:opacity-70 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  {complaintLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldOff className="w-5 h-5" />}
                  {complaintLoading ? "Submitting via ZK proof..." : "Submit Anonymously — Zero Knowledge Protected"}
                </button>
              </div>
            </div>

            {/* Protection Panel */}
            <div className="lg:w-[40%]">
              <div className="glass rounded-[2.5rem] p-10 h-full">
                <h3 className="text-xl font-bold mb-8">Threshold Protection</h3>
                
                <div className="flex gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-purpleAccent flex items-center justify-center text-navy shadow-[0_0_15px_#b07cff]">
                    <Icon icon="lucide:user" className="w-6 h-6" />
                  </div>
                  <div className="w-14 h-14 rounded-full bg-purpleAccent flex items-center justify-center text-navy shadow-[0_0_15px_#b07cff]">
                    <Icon icon="lucide:user" className="w-6 h-6" />
                  </div>
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center text-white/20">
                    <Icon icon="lucide:user" className="w-6 h-6" />
                  </div>
                </div>

                <div className="flex justify-between items-end mb-2">
                  <span className="font-mono text-sm tracking-widest text-amber-500 uppercase font-bold">{complaints?.length || 2} of 3 Reports</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full mb-8 overflow-hidden relative">
                  <div className="absolute top-0 left-0 h-full bg-amber-500 transition-all duration-500" style={{ width: `${Math.min(((complaints?.length || 2) / 3) * 100, 100)}%` }} />
                </div>

                <p className="text-white/60 text-sm leading-relaxed mb-10">
                  Reports are held securely on-chain. Management is only notified if <strong className="text-white">3 unique employees</strong> file reports against the same individual, preventing retaliation for isolated incidents.
                </p>

                <div className="space-y-4">
                  {[
                    "Your name is never recorded",
                    "Department/Role hidden via ZKP",
                    "Timestamp obfuscation prevents correlation"
                  ].map((text, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="bg-greenSuccess/10 p-1 rounded mt-0.5"><CheckCircle className="w-3 h-3 text-greenSuccess" /></div>
                      <span className="text-sm font-medium text-white/80">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto text-center animate-fade-in-up py-16">
            <svg viewBox="0 0 52 52" className="w-24 h-24 mx-auto mb-8">
              <circle cx="26" cy="26" r="25" fill="none" stroke="#4dd6a0" strokeWidth="2" opacity="0.2"/>
              <path fill="none" stroke="#4dd6a0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" 
                d="M14 27l8 8 16-16" className="animate-draw-check"/>
            </svg>
            <h2 className="text-4xl font-bold mb-10">Report Filed Anonymously</h2>
            
            <div className="glass p-8 rounded-[2rem] border-purpleAccent/30 mb-10 text-left relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-purpleAccent" />
              <div className="flex items-center gap-2 mb-6 group w-max relative">
                <Verified className="w-5 h-5 text-purpleAccent" />
                <span className="font-mono text-xs uppercase tracking-widest text-purpleAccent font-bold border-b border-dashed border-purpleAccent/50 cursor-pointer">ZK Proof Receipt</span>
                
                {/* TOOLTIP */}
                <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-navy border border-purpleAccent/30 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <p className="text-xs text-white/80 font-sans normal-case tracking-normal">
                    <strong className="text-purpleAccent block mb-1">What is Zero-Knowledge?</strong>
                    A cryptographic method that lets you prove something is true (like "I am an employee here") without revealing any other data (like your name or role).
                  </p>
                </div>
              </div>
              
              <div className="space-y-4 font-mono text-sm">
                <div className="flex justify-between border-b border-white/5 pb-3">
                  <span className="text-white/50">Receipt ID</span>
                  <div className="flex items-center gap-2">
                    <span className="text-purpleAccent">zkp_7f3a...8f6a</span>
                    <CopyButton text="zkp_7f3a9c2b1e4d8f6a" />
                  </div>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-3">
                  <span className="text-white/50">Timestamp</span>
                  <span className="text-white">{new Date().toISOString()}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-3">
                  <span className="text-white/50">Target Status</span>
                  <span className="text-amber-500 font-bold">2 of 3 Threshold</span>
                </div>
              </div>
              <p className="mt-6 text-xs text-white/40 block">Save this receipt ID securely. It is the only way to check the status of your anonymous report.</p>
            </div>

            <button 
              onClick={() => {
                setComplaintSubmitted(false);
                setComplaintText('');
                setComplaintManagerId('');
              }}
              className="text-blueAccent font-bold flex items-center justify-center gap-2 mx-auto hover:underline"
            >
               Return to Safety Portal
            </button>
          </div>
        )}
      </section>

      {/* FEATURES ROW */}
      <section className="py-32 px-6 max-w-7xl mx-auto w-full border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Shield, color: 'border-limeAccent', text: 'limeAccent', title: 'End-to-End Privacy', desc: 'Contents of promises and reports are completely hidden from public view using advanced cryptography.' },
            { icon: Lock, color: 'border-blueAccent', text: 'blueAccent', title: 'Cryptographic Proof', desc: 'Math replaces trust. Once a promise is sealed, neither party can secretly alter or deny the agreement.' },
            { icon: CheckCircle2, color: 'border-purpleAccent', text: 'purpleAccent', title: 'Enterprise Ready', desc: 'Designed to integrate with existing HR systems while preserving decentralized zero-knowledge guarantees.' }
          ].map((feature, i) => (
            <div key={i} className="glass rounded-[2.5rem] p-10 relative overflow-hidden group">
              <div className={`absolute top-0 left-0 w-full h-1 bg-${feature.text}`} />
              <div className={`w-12 h-12 rounded-xl bg-${feature.text}/10 flex items-center justify-center mb-6`}>
                <feature.icon className={`w-6 h-6 text-${feature.text}`} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-white/50 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
      <ToastNotification 
        show={toastData.show} 
        message={toastData.msg} 
        type={toastData.type === 'error' ? 'info' : 'success'} // Fallback gracefully if we only have success/info in toast
        onClose={() => setToastData(t => ({ ...t, show: false }))} 
      />
    </div>
  );
}
