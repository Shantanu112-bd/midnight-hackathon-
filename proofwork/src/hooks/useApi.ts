import { useDemoMode } from '../context/DemoModeContext';
import { extractPromise, createPromise as apiCreatePromise, fileComplaint as apiFileComplaint } from '../api';

export function useApi() {
  const { demoMode } = useDemoMode();

  const extractPromiseData = async (transcript: string, managerAddress: string) => {
    if (demoMode) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const txId = '0x' + Math.random().toString(16).slice(2, 10);
      return {
        success: true,
        isDemo: true,
        extractedData: {
          hasPromise: true,
          promise: {
            description: '15% salary increment',
            condition: 'Complete Project Atlas',
            deadline: 'September 30, 2025',
            confidence: 0.94
          }
        },
        contractTxId: txId,
        promiseHash: '0xmockhash123'
      };
    }

    try {
      const data = await extractPromise(transcript);
      // We don't have txId until we Seal. But for the Landing page flow, 
      // extractPromiseData used to return contractTxId if it was in one step.
      // We'll update Landing to use createPromise for the Seal step.
      return {
        success: true,
        isDemo: false,
        extractedData: data,
        contractTxId: '', // To be filled by createPromise
        promiseHash: ''
      };
    } catch (err: any) {
      return { success: false, error: err.message, isDemo: false };
    }
  };

  const sealPromise = async (transcript: string, managerAddress: string) => {
    if (demoMode) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
        success: true,
        isDemo: true,
        txId: '0x' + Math.random().toString(16).slice(2, 10),
        promiseHash: '0x' + Math.random().toString(16).slice(2, 64)
      };
    }
    
    try {
      const { txId, promiseHash } = await apiCreatePromise(transcript, managerAddress);
      return { success: true, isDemo: false, txId, promiseHash };
    } catch(err: any) {
      return { success: false, error: err.message, isDemo: false };
    }
  };

  const submitComplaint = async (complaintText: string, category: string, targetManagerId: string) => {
    if (demoMode) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
        success: true,
        isDemo: true,
        txId: '0x' + Math.random().toString(16).slice(2, 10),
        count: 2
      };
    }

    try {
      const res = await apiFileComplaint(complaintText, targetManagerId);
      return {
        success: true,
        isDemo: false,
        txId: res.txId,
        count: res.count
      };
    } catch (err: any) {
      return { success: false, error: err.message, isDemo: false };
    }
  };

  return { extractPromiseData, sealPromise, submitComplaint };
}
