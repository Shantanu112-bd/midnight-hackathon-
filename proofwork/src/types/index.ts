export type PromiseStatus = 'PENDING' | 'FULFILLED' | 'BROKEN';

export interface WorkPromise {
  id: string;
  title: string;
  condition: string;
  deadline: string;
  status: PromiseStatus;
  hash: string;
  managerAddress?: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  category: string;
  zkReceiptId: string;
  status: 'SUBMITTED' | 'ESCALATED' | 'RESOLVED';
  reportCount: number;
  filedAt: string;
}

export interface ExtractedPromise {
  description: string;
  condition: string;
  deadline: string;
  confidence: number;
}
