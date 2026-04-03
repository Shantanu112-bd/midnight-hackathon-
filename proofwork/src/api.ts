export interface PromiseData {
  hasPromise: boolean;
  promise: {
    description: string;
    condition: string;
    reward: string;
    deadline: string;
    promiserRole: string;
    confidence: number;
  } | null;
  rawText: string;
  warningMessage: string | null;
}

const BASE_URL = 'http://localhost:3001';

export async function extractPromise(transcript: string): Promise<PromiseData> {
  try {
    const res = await fetch(`${BASE_URL}/api/extract-promise`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, managerAddress: 'mgr_0x1' }),
    });
    if (!res.ok) throw new Error('Failed to extract promise from AI engine.');
    const data = await res.json();
    if (!data.success) throw new Error('API failed to extract promise.');
    return data.extractedData;
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message || 'Network error while contacting AI API.');
  }
}

export async function createPromise(transcript: string, managerAddress: string): Promise<{ txId: string; promiseHash: string }> {
  try {
    const res = await fetch(`${BASE_URL}/api/create-promise`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, managerAddress, employeeAddress: 'emp_0x1a2b3c4d' }),
    });
    if (!res.ok) throw new Error('Failed to seal promise on blockchain.');
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to seal promise.');
    return { txId: data.contractTxId, promiseHash: data.promiseHash || '0xunknown' };
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message || 'Network error while sealing promise.');
  }
}

export async function fileComplaint(text: string, managerId: string): Promise<{ txId: string; count: number }> {
  try {
    const res = await fetch(`${BASE_URL}/api/file-complaint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ complaintText: text, category: 'general', targetManagerId: managerId, employeeCredential: 'mock' }),
    });
    if (!res.ok) throw new Error('Failed to file anonymous report.');
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to file report.');
    return { txId: data.txId, count: data.count };
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message || 'Network error while filing report.');
  }
}
