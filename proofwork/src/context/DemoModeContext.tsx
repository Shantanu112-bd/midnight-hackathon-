import React, { createContext, useContext, useState } from 'react';
import { useMidnightWallet } from '../hooks/useMidnightWallet';

export interface AppContextType {
  demoMode: boolean
  toggleDemoMode: () => void
  promises: any[]
  addPromise: (data: any) => Promise<any>
  updatePromise: (id: string, updates: any) => void
  complaints: any[]
  setComplaints: React.Dispatch<React.SetStateAction<any[]>>
  addComplaint: (complaint: any) => any
  wallet: {
    isConnected: boolean
    isConnecting: boolean
    address: string | null
    balance: string | null
    status: string
    error: string | null
    isInstalled: boolean
    providers: any | null
    connect: () => Promise<void>
    disconnect: () => void
  }
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [demoMode, setDemoMode] = useState(false);
  const walletHook = useMidnightWallet();
  
  const defaultPromises = [
    {
      id: '1',
      title: 'Promotion to Senior Engineer',
      condition: 'Complete Project Atlas Phase 2 delivery and receive peer review score above 4.5/5',
      deadline: 'Sep 30, 2025',
      status: 'PENDING',
      hash: '0x7aa0...ff3c',
      managerAddress: 'mgr_0x4f...892',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: '2',
      title: '15% Annual Salary Increment',
      condition: 'Lead successful launch of the ProofWork MVP with zero critical bugs at launch',
      deadline: 'Nov 01, 2025',
      status: 'PENDING',
      hash: '0x3f2a...1b9c',
      managerAddress: 'mgr_0x4f...892',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
      id: '3',
      title: 'Conference Speaking Budget ($3,000)',
      condition: 'Submit 2 approved technical blog posts to the engineering blog by Q3',
      deadline: 'Dec 10, 2025',
      status: 'PENDING',
      hash: '0x8a1d...f3d2',
      managerAddress: 'mgr_0x4f...892',
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString()
    },
    {
      id: '4',
      title: 'Remote Work 3 Days Per Week',
      condition: 'Maintain team velocity KPIs for 3 consecutive sprints',
      deadline: 'Aug 30, 2025',
      status: 'FULFILLED',
      hash: '0x5bc4...a8e1',
      managerAddress: 'mgr_0x4f...892',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
    },
    {
      id: '5',
      title: 'Project Atlas Completion Bonus',
      condition: 'Deliver Phase 1 architecture and documentation by June 1, 2025',
      deadline: 'Jun 01, 2025',
      status: 'FULFILLED',
      hash: '0x9d3e...7f2a',
      managerAddress: 'mgr_0x4f...892',
      createdAt: new Date(Date.now() - 45 * 86400000).toISOString()
    },
    {
      id: '6',
      title: 'Flexible Work Hours Agreement',
      condition: 'Complete OSCP security certification and present findings to the team',
      deadline: 'Mar 15, 2025',
      status: 'BROKEN',
      hash: '0x7f9e...c5b3',
      managerAddress: 'mgr_0x4f...892',
      createdAt: new Date(Date.now() - 90 * 86400000).toISOString()
    }
  ];

  const defaultComplaints = [
    {
      id: 'c1',
      category: 'Broken Promise',
      zkReceiptId: 'zk_9f3a...2c1b',
      status: 'SUBMITTED',
      reportCount: 2,
      filedAt: new Date(Date.now() - 5 * 86400000).toISOString()
    }
  ];

  const [promises, setPromises] = useState(() => {
    try {
      const saved = localStorage.getItem('proofwork_promises');
      return saved ? JSON.parse(saved) : defaultPromises;
    } catch { return defaultPromises; }
  });

  const [complaints, setComplaints] = useState(() => {
    try {
      const saved = localStorage.getItem('proofwork_complaints');
      return saved ? JSON.parse(saved) : defaultComplaints;
    } catch { return defaultComplaints; }
  });

  const addPromise = async (data: any) => {
    const id = Date.now().toString();
    const mockHash = '0x' + Math.random().toString(16).slice(2,6) + '...' + Math.random().toString(16).slice(2,6);
    
    const newPromise = {
      id,
      title: data.title || 'Sealed Promise',
      condition: data.condition || '',
      deadline: data.deadline || 'TBD',
      status: 'PENDING',
      hash: mockHash,
      managerAddress: data.managerAddress || data.managerId || 'mgr_0x4f...892',
      createdAt: new Date().toISOString(),
      onChain: false,
      ...data
    };
    
    setPromises((prev: any[]) => {
      const updated = [newPromise, ...prev];
      localStorage.setItem('proofwork_promises', JSON.stringify(updated));
      return updated;
    });

    return newPromise;
  };

  const updatePromise = (id: string, updates: any) => {
    setPromises((prev: any[]) => {
      const updated = prev.map(p => p.id === id ? {...p, ...updates} : p);
      localStorage.setItem('proofwork_promises', JSON.stringify(updated));
      return updated;
    });
  };

  const addComplaint = (complaint: any) => {
    const newComplaint = {
      id: 'c' + Date.now().toString(),
      zkReceiptId: complaint.txId || complaint.zkReceiptId || 'zk_' + Math.random().toString(16).slice(2,6) + '...' + Math.random().toString(16).slice(2,6),
      status: 'SUBMITTED',
      reportCount: complaint.count || Math.floor(Math.random() * 2) + 1,
      filedAt: new Date().toISOString(),
      onChain: complaint.onChain || false,
      ...complaint
    };
    setComplaints((prev: any[]) => {
      const updated = [newComplaint, ...prev];
      localStorage.setItem('proofwork_complaints', JSON.stringify(updated));
      return updated;
    });
    return newComplaint;
  };

  return (
    <AppContext.Provider value={{
      demoMode,
      toggleDemoMode: () => setDemoMode((d: boolean) => !d),
      promises,
      addPromise,
      updatePromise,
      complaints,
      setComplaints,
      addComplaint,
      wallet: {
        isConnected: walletHook.isConnected,
        isConnecting: walletHook.isConnecting,
        address: walletHook.address,
        balance: walletHook.balance,
        status: walletHook.status,
        error: walletHook.error,
        isInstalled: walletHook.isInstalled,
        providers: walletHook.providers,
        connect: walletHook.connect,
        disconnect: walletHook.disconnect,
      }
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
