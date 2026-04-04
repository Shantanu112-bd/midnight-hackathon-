const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

// 1. Imports
if (!code.includes('useApp')) {
  code = code.replace(
    "import { useApi } from '../hooks/useApi';",
    "import { useApi } from '../hooks/useApi';\nimport { useApp } from '../context/DemoModeContext';\nimport { useNavigate, useLocation } from 'react-router-dom';\nimport { useRef, useEffect } from 'react';"
  );
}

// 2. State & Hooks
if (!code.includes('addPromise')) {
  const stateInjection = `
  const { addPromise } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const vaultRef = useRef<HTMLElement>(null);
  const complaintRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (location.state?.scrollTo === 'vault') {
      setTimeout(() => vaultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else if (location.state?.scrollTo === 'complaint') {
      setTimeout(() => complaintRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [location.state]);

  const scrollToVault = () => vaultRef.current?.scrollIntoView({ behavior: 'smooth' });
  const scrollToComplaint = () => complaintRef.current?.scrollIntoView({ behavior: 'smooth' });
`;

  code = code.replace(
    "const [complaintLoading, setComplaintLoading] = useState(false);",
    "const [complaintLoading, setComplaintLoading] = useState(false);\n  const [complaintCategory, setComplaintCategory] = useState('Broken Promise');\n  const [complaintEscalate, setComplaintEscalate] = useState(false);\n  const [zkReceiptId, setZkReceiptId] = useState('');\n  const [reportCount, setReportCount] = useState(2);\n" + stateInjection
  );
}

// 3. Handlers
code = code.replace(
  /const handleExtractPromise = async \(\) => {/g,
  "const handleExtractPromise = async (e?: any) => {\n    if (e) e.preventDefault();"
);

code = code.replace(
  /const handleSealPromise = async \(\) => {/g,
  "const handleSealPromise = async (e?: any) => {\n    if (e) e.preventDefault();"
);

if (!code.includes('newPromise = addPromise')) {
  code = code.replace(
    /setTxHash\(res\.txId \|\| ''\);\n\s*setVaultStep\(3\);/m,
    `    const newPromise = addPromise({
      title: extractedPromise?.description || 'Sealed Promise',
      condition: extractedPromise?.condition || 'Conditions agreed upon',
      deadline: extractedPromise?.deadline || 'TBD',
    });
    setTxHash(newPromise.hash || res.txId || '');
    setVaultStep(3);`
  );
}

code = code.replace(
  /const handleFileComplaint = async \(\) => {/g,
  "const handleFileComplaint = async (e?: any) => {\n    if (e) e.preventDefault();"
);

// 4. Update the <a href="#vault-demo"> to button
code = code.replace(
  /<a\s+href="#vault-demo"\s+className="border border-white\/20 text-white font-medium px-8 py-4 rounded-full hover:bg-white\/5 transition-all"\s*>\s*See How It Works\s*<\/a>/,
  '<button type="button" onClick={scrollToComplaint} className="border border-white/20 text-white font-medium px-8 py-4 rounded-full hover:bg-white/5 transition-all">See How It Works</button>'
);

code = code.replace(
  /<Link\s+to="\/vault"\s+className="bg-blueAccent text-navy font-bold px-8 py-4 rounded-full flex items-center gap-3 transition-all hover:scale-105 hover:shadow-\[0_0_40px_rgba\(122,160,255,0\.4\)\]"\s*>\s*Start Recording Promises <ArrowRight className="w-5 h-5" \/>\s*<\/Link>/,
  '<button type="button" onClick={scrollToVault} className="bg-blueAccent text-navy font-bold px-8 py-4 rounded-full flex items-center gap-3 transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(122,160,255,0.4)]">Start Recording Promises <ArrowRight className="w-5 h-5" /></button>'
);

// Refs for scroll
code = code.replace('id="vault-demo"', 'id="vault-demo" ref={vaultRef}');
code = code.replace('id="complaint-demo"', 'id="complaint-demo" ref={complaintRef}');

// 5. Update Extract Promise button (type="button" instead of onClick, though we added e.preventDefault earlier)
code = code.replace(
  /<button\s+onClick=\{handleExtractPromise\}/g,
  '<button type="button" onClick={handleExtractPromise}'
);
code = code.replace(
  /<button\s+onClick=\{handleSealPromise\}/g,
  '<button type="button" onClick={handleSealPromise}'
);
code = code.replace(
  /<button\s+onClick=\{handleFileComplaint\}/g,
  '<button type="button" onClick={handleFileComplaint}'
);

// 6. Generate ZK Proof Link -> Button
code = code.replace(
  /<Link\s+to="\/certificate"\s+className="px-8 py-4 border border-purpleAccent text-purpleAccent rounded-full hover:bg-purpleAccent\/10 transition-all font-bold"\s*>\s*Generate ZK Proof\s*<\/Link>/,
  `<button 
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
  </button>`
);

// Complaint toggles
code = code.replace(
  /onChange=\{e => setComplaintManagerId\(e\.target\.value\)\}/g,
  "onChange={e => setComplaintManagerId(e.target.value)}"
);
code = code.replace(
  /<select className="w-full bg-white\/5 border border-white\/10/,
  '<select value={complaintCategory} onChange={e => setComplaintCategory(e.target.value)} className="w-full bg-white/5 border border-white/10'
);

code = code.replace(
  /<div className="w-12 h-6 rounded-full bg-red-500 relative cursor-pointer ml-4 shrink-0 transition-colors">\s*<div className="w-5 h-5 rounded-full bg-white absolute top-0\.5 right-0\.5 shadow-md" \/>\s*<\/div>/,
  `<button
    type="button"
    onClick={() => setComplaintEscalate(!complaintEscalate)}
    className={"w-12 h-6 rounded-full relative cursor-pointer ml-4 shrink-0 transition-colors " + (complaintEscalate ? "bg-red-500" : "bg-white/10")}
  >
    <div className={"w-5 h-5 rounded-full bg-white absolute top-0.5 shadow-md transition-all " + (complaintEscalate ? "right-0.5" : "left-0.5")} />
  </button>`
);

code = code.replace(
  /<span className="text-purpleAccent">zkp_7f3a\.\.\.8f6a<\/span>/,
  '<span className="text-purpleAccent">{zkReceiptId || "zkp_7f3a...8f6a"}</span>'
);

code = code.replace(
  /<span className="text-amber-500 font-bold">2 of 3 Threshold<\/span>/,
  '<span className="text-amber-500 font-bold">{reportCount} of 3 Threshold</span>'
);

fs.writeFileSync('src/pages/Landing.tsx', code);
console.log('Landing.tsx patched successfully');
