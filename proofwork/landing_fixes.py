import re

with open("src/pages/Landing.tsx", "r") as f:
    content = f.read()

# 1. Imports
content = content.replace("import React, { useState } from 'react';", "import React, { useState, useRef, useEffect } from 'react';")
content = content.replace("import { Link } from 'react-router-dom';", "import { Link, useNavigate, useLocation } from 'react-router-dom';")
content = content.replace(
    "import { useApi } from '../hooks/useApi';\nimport clsx from 'clsx';",
    "import { useApi } from '../hooks/useApi';\nimport { useApp } from '../context/DemoModeContext';\nimport clsx from 'clsx';"
)

# 2. Hooks and setup
hooks_setup = """export default function Landing() {
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('proofwork_onboarded'));
  const dismissOnboarding = () => {
    localStorage.setItem('proofwork_onboarded', 'true');
    setShowOnboarding(false);
  };

  const { extractPromiseData, sealPromise, submitComplaint } = useApi();
  const { addPromise, demoMode } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const vaultRef = useRef<HTMLElement>(null);
  const complaintRef = useRef<HTMLElement>(null);

  const scrollToVault = () => vaultRef.current?.scrollIntoView({ behavior: 'smooth' });
  const scrollToComplaint = () => complaintRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    if (location.state?.scrollTo === 'vault') {
      setTimeout(() => scrollToVault(), 100);
    } else if (location.state?.scrollTo === 'complaint') {
      setTimeout(() => scrollToComplaint(), 100);
    }
  }, [location.state]);"""

content = re.sub(
    r"export default function Landing\(\) \{[\s\S]*?const \{ extractPromiseData, sealPromise, submitComplaint \} = useApi\(\);",
    hooks_setup,
    content
)

# 3. Replace handleExtractPromise
handle_extract = """// Mock helpers
  function getMockPromise(transcript = '') {
    const text = transcript.toLowerCase();
    const hasIncrement = text.includes('salary') || text.includes('increment') || text.includes('raise');
    const hasPromotion = text.includes('promot') || text.includes('senior') || text.includes('lead');
    return {
      description: hasPromotion ? 'Promotion to Senior Engineer' : hasIncrement ? '15% Salary Increment' : 'Performance-based promotion',
      condition: 'Complete all assigned deliverables',
      deadline: 'September 30, 2025',
      confidence: 0.94
    };
  }

  function generateMockTxHash() {
    const chars = '0123456789abcdef';
    const start = Array.from({length: 4}, () => chars[Math.floor(Math.random()*16)]).join('');
    const end = Array.from({length: 4}, () => chars[Math.floor(Math.random()*16)]).join('');
    return `0x${start}...${end}`;
  }

  const handleExtractPromise = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!transcript.trim()) {
      alert('Please paste a meeting transcript first');
      return;
    }
    setLoadingPromise(true);
    try {
      const response = await fetch('http://localhost:3001/api/create-promise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          managerAddress: managerId || 'mgr_0x4f...892',
          employeeAddress: 'emp_0x1a2b...3c4d'
        })
      });
      if (response.ok) {
        const data = await response.json();
        setExtractedPromise(data.extractedData?.promise || getMockPromise(transcript));
        setTxHash(data.contractTxId || generateMockTxHash());
      } else {
        throw new Error('API error');
      }
    } catch (error) {
      setExtractedPromise(getMockPromise(transcript));
      setTxHash(generateMockTxHash());
    } finally {
      setLoadingPromise(false);
      setVaultStep(2);
    }
  };

  const handleSealPromise = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setLoadingPromise(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const newPromise = addPromise({
      title: extractedPromise?.description || 'Sealed Promise',
      condition: extractedPromise?.condition || 'Conditions agreed upon',
      deadline: extractedPromise?.deadline || 'TBD',
    });
    setTxHash(newPromise.hash);
    setLoadingPromise(false);
    setVaultStep(3);
    setToastData({ show: true, msg: `Promise sealed · TX: ${newPromise.hash}`, type: 'success' });
    setTimeout(() => setToastData(prev => ({ ...prev, show: false })), 4000);
  };"""

content = re.sub(
    r"const handleExtractPromise = async \(\) => \{[\s\S]*?const handleSealPromise = async \(\) => \{[\s\S]*?setToastData\(\{ show: true, msg: `✓ Promise sealed · TX: \$\{\(res.txId \|\| ''\)\.substring\(0,10\)\}\.\.\.`, type: 'success' \}\);\n  \};",
    handle_extract,
    content
)

# 4. handleFileComplaint
handle_complaint = """function generateZkId() {
    const chars = '0123456789abcdef';
    const part1 = Array.from({length: 4}, () => chars[Math.floor(Math.random()*16)]).join('');
    const part2 = Array.from({length: 4}, () => chars[Math.floor(Math.random()*16)]).join('');
    return `zk_${part1}...${part2}`;
  }

  const [complaintCategory, setComplaintCategory] = useState('Broken Promise');
  const [complaintEscalate, setComplaintEscalate] = useState(false);
  const [zkReceiptId, setZkReceiptId] = useState('');
  const [reportCount, setReportCount] = useState(2);

  const handleFileComplaint = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!complaintText.trim()) {
      alert('Please describe what happened');
      return;
    }
    setComplaintLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/file-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaintText: complaintText,
          category: complaintCategory,
          targetManagerId: complaintManagerId || 'unknown',
          escalate: complaintEscalate
        })
      });
      if (response.ok) {
        const data = await response.json();
        setZkReceiptId(data.txId || generateZkId());
        setReportCount(data.count || 2);
      } else {
        throw new Error('API error');
      }
    } catch {
      setZkReceiptId(generateZkId());
      setReportCount(2);
    } finally {
      setComplaintLoading(false);
      setComplaintSubmitted(true);
    }
  };"""

content = re.sub(
    r"const handleFileComplaint = async \(\) => \{[\s\S]*?setToastData\(\{ show: true, msg: `Report filed \$\{res\.isDemo \? '\(Demo\)' : ''\}`, type: 'success' \}\);\n  \};",
    handle_complaint,
    content
)

# Replace 'section id="vault-demo"' with ref
content = content.replace('<section id="vault-demo"', '<section id="vault-demo" ref={vaultRef}')
content = content.replace('<section id="complaint-demo"', '<section id="complaint-demo" ref={complaintRef}')

# Hero Links
content = content.replace('<a \n              href="#vault-demo"', '<button \n              onClick={scrollToVault}')
content = content.replace('See How It Works\n            </a>', 'See How It Works\n            </button>')

# Step 1 extract button type
content = content.replace('onClick={handleExtractPromise}', 'type="button" onClick={handleExtractPromise}')
content = content.replace('onClick={handleSealPromise}', 'type="button" onClick={handleSealPromise}')
content = content.replace('onClick={handleFileComplaint}', 'type="button" onClick={handleFileComplaint}')

# Complaint form inputs
content = content.replace('value={complaintManagerId}', 'type="text" value={complaintManagerId}')
content = content.replace('onChange={e => setComplaintManagerId(e.target.value)}', 'onChange={e => setComplaintManagerId(e.target.value)}')
content = content.replace('value={complaintText}', 'value={complaintText}')
content = content.replace('onChange={e => setComplaintText(e.target.value)}', 'onChange={e => setComplaintText(e.target.value)}')

# Generate ZK Proof button in vault step 3
zk_proof_button = """<button 
                      type="button"
                      onClick={() => navigate('/certificate', {
                        state: {
                          promiseHash: txHash,
                          extractedPromise,
                          issuedDate: new Date().toISOString()
                        }
                      })}
                      className="px-8 py-4 border border-purpleAccent text-purpleAccent rounded-full hover:bg-purpleAccent/10 transition-all font-bold"
                    >
                      Generate ZK Proof
                    </button>"""
content = re.sub(r'<Link \n                      to="/certificate"[\s\S]*?Generate ZK Proof\n                    </Link>', zk_proof_button, content)

# Complaint categories
content = content.replace('select className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-400/50 appearance-none text-white transition-colors"', 'select value={complaintCategory} onChange={e => setComplaintCategory(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-400/50 appearance-none text-white transition-colors"')

# Escalation Toggle
escalate_toggle = """<button 
                    type="button"
                    onClick={() => setComplaintEscalate(!complaintEscalate)}
                    className={`w-12 h-6 rounded-full relative cursor-pointer shrink-0 ml-4 transition-colors ${
                      complaintEscalate ? 'bg-red-500' : 'bg-white/10'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 shadow-md transition-all ${
                      complaintEscalate ? 'right-0.5' : 'left-0.5'
                    }`} />
                  </button>"""
content = re.sub(r'<div className="w-12 h-6 rounded-full bg-red-500 relative cursor-pointer ml-4 shrink-0 transition-colors">[\s\S]*?</div>', escalate_toggle, content)

# ZK Receipt ID render
content = content.replace('zkp_7f3a...8f6a', '{zkReceiptId}')
content = content.replace('CopyButton text="zkp_7f3a9c2b1e4d8f6a"', 'CopyButton text={zkReceiptId}')
content = content.replace('2 of 3 Threshold', '{reportCount} of 3 Reports')
content = content.replace('2 of 3 Reports', '{reportCount} of 3 Reports')

# Toast rendering change (since toastData was modified to allow for string passing and showToast flag):
content = content.replace('show={toastData.show} \n        message={toastData.msg}', 'show={toastData.show} \n        message={toastData.msg}')

# Fix Toast animation in CSS
with open("src/index.css", "a") as f:
    f.write('''
@layer utilities {
  .animate-slide-up {
    animation: slide-up 0.3s ease-out forwards;
  }
}

@keyframes slide-up {
  from { transform: translateY(100px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@media print {
  nav, footer, .no-print { display: none !important; }
  body { background: white !important; color: black !important; }
  #certificate-card { 
    border: 2px solid #333 !important;
    border-radius: 8px !important;
    padding: 2rem !important;
  }
}
''')

# Write back
with open("src/pages/Landing.tsx", "w") as f:
    f.write(content)

