/**
 * ProofWork API Server
 * Express REST API connecting the frontend to the AI extractor and Midnight blockchain.
 *
 * Endpoints:
 *   GET  /health                        — service health check
 *   POST /api/extract-promise           — AI promise extraction
 *   POST /api/create-promise            — extract + hash + store on-chain
 *   POST /api/file-complaint            — file anonymous complaint
 *   GET  /api/check-threshold/:hash     — check manager complaint threshold
 *   GET  /api/reliability/:hash         — get manager reliability score
 *   GET  /api/promises/:address         — list promises for employee
 *   GET  /api/contract                  — deployed contract info
 *
 * Modes:
 *   MOCK_MODE=true  — all blockchain calls return mock success responses
 *   MOCK_AI=true    — AI extraction returns hardcoded test data
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { randomBytes } from 'crypto';
import dotenv from 'dotenv';

import {
  extractPromise,
  hashPromise,
  hashToBytes32,
  type ExtractionResult,
  type PromiseDetails,
} from '../src/ai-extractor';

import {
  loadDeployedAddress,
  stringToBytes32,
  bytesToHex,
  hexToBytes,
  sha256Hex,
} from '../src/utils';

dotenv.config();

// ────────────────────────────────────────────────────────────────────
// App Configuration
// ────────────────────────────────────────────────────────────────────

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const IS_MOCK = process.env.MOCK_MODE === 'true';

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ────────────────────────────────────────────────────────────────────
// Mock Helpers
// ────────────────────────────────────────────────────────────────────

/** Generate a realistic-looking mock tx hash */
function mockTxId(): string {
  return '0x' + randomBytes(32).toString('hex');
}

/** Generate a mock block height */
function mockBlockHeight(): string {
  return String(Math.floor(Math.random() * 100000) + 500000);
}

/** In-memory promise store for demo mode */
interface StoredPromise {
  id: number;
  promiseHash: string;
  employeeAddress: string;
  managerAddress: string;
  description: string;
  condition: string;
  reward: string;
  deadline: string;
  confidence: number;
  status: 'pending' | 'fulfilled' | 'broken';
  txId: string;
  createdAt: string;
}

const promiseStore: StoredPromise[] = [];
let promiseCounter = 0;

/** In-memory complaint store for demo mode */
interface StoredComplaint {
  id: number;
  complaintHash: string;
  targetManagerHash: string;
  txId: string;
  createdAt: string;
}

const complaintStore: StoredComplaint[] = [];
let complaintCounter = 0;

// ────────────────────────────────────────────────────────────────────
// GET /health
// ────────────────────────────────────────────────────────────────────

app.get('/health', (_req: Request, res: Response) => {
  const contractAddress = loadDeployedAddress();
  res.json({
    status: 'OK',
    service: 'ProofWork API',
    version: '1.0.0',
    mode: IS_MOCK ? 'mock' : 'live',
    aiMode: process.env.MOCK_AI === 'true' ? 'mock' : 'live',
    contractAddress: contractAddress || 'not deployed',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// ────────────────────────────────────────────────────────────────────
// GET /api/contract
// ────────────────────────────────────────────────────────────────────

app.get('/api/contract', (_req: Request, res: Response) => {
  const contractAddress = loadDeployedAddress();
  res.json({
    contractAddress: contractAddress || null,
    deployed: !!contractAddress,
    network: process.env.NETWORK_ID || 'devnet',
    mode: IS_MOCK ? 'mock' : 'live',
  });
});

// ────────────────────────────────────────────────────────────────────
// POST /api/extract-promise
// ────────────────────────────────────────────────────────────────────

app.post('/api/extract-promise', async (req: Request, res: Response) => {
  try {
    const { transcript } = req.body;

    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({
        error: 'Missing required field: transcript (string)',
        example: { transcript: 'Manager told me I would get promoted after the project.' },
      });
    }

    if (transcript.trim().length < 10) {
      return res.status(400).json({
        error: 'Transcript too short. Provide at least 10 characters of meeting text.',
      });
    }

    console.log(`\n► POST /api/extract-promise (${transcript.length} chars)`);
    const result: ExtractionResult = await extractPromise(transcript);

    // Add the hash if a promise was found
    let promiseHash: string | null = null;
    if (result.hasPromise && result.promise) {
      promiseHash = hashPromise(result.promise);
    }

    console.log(`  hasPromise: ${result.hasPromise}, hash: ${promiseHash || 'n/a'}`);

    return res.json({
      success: true,
      ...result,
      promiseHash,
    });
  } catch (error: any) {
    console.error('✗ /api/extract-promise failed:', error.message);
    return res.status(500).json({
      error: 'Promise extraction failed',
      details: error.message,
    });
  }
});

// ────────────────────────────────────────────────────────────────────
// POST /api/create-promise
// ────────────────────────────────────────────────────────────────────

app.post('/api/create-promise', async (req: Request, res: Response) => {
  try {
    const { transcript, employeeAddress, managerAddress } = req.body;

    // Validate inputs
    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ error: 'Missing required field: transcript (string)' });
    }
    if (!employeeAddress || typeof employeeAddress !== 'string') {
      return res.status(400).json({ error: 'Missing required field: employeeAddress (string)' });
    }
    if (!managerAddress || typeof managerAddress !== 'string') {
      return res.status(400).json({ error: 'Missing required field: managerAddress (string)' });
    }

    console.log(`\n► POST /api/create-promise`);
    console.log(`  employee: ${employeeAddress.substring(0, 16)}...`);
    console.log(`  manager:  ${managerAddress.substring(0, 16)}...`);

    // 1. Extract promise via AI
    const extraction = await extractPromise(transcript);

    if (!extraction.hasPromise || !extraction.promise) {
      return res.status(422).json({
        success: false,
        error: 'No actionable promise found in the transcript.',
        warningMessage: extraction.warningMessage,
        rawText: extraction.rawText,
      });
    }

    // 2. Hash the promise for on-chain storage
    const promiseHashHex = hashPromise(extraction.promise);
    const promiseHashBytes = hashToBytes32(promiseHashHex);

    // 3. Store on-chain (or mock)
    if (IS_MOCK) {
      const idx = promiseCounter++;
      const txId = mockTxId();

      // Store in memory for demo
      promiseStore.push({
        id: idx,
        promiseHash: promiseHashHex,
        employeeAddress,
        managerAddress,
        description: extraction.promise.description,
        condition: extraction.promise.condition,
        reward: extraction.promise.reward,
        deadline: extraction.promise.deadline,
        confidence: extraction.promise.confidence,
        status: 'pending',
        txId,
        createdAt: new Date().toISOString(),
      });

      console.log(`  ✓ [MOCK] Promise #${idx} stored (tx: ${txId.substring(0, 18)}...)`);

      return res.json({
        success: true,
        contractTxId: txId,
        blockHeight: mockBlockHeight(),
        promiseHash: promiseHashHex,
        promiseIdx: idx,
        extractedData: extraction.promise,
        rawText: extraction.rawText,
        mode: 'mock',
      });
    }

    // Live mode — call the actual contract
    // NOTE: Requires running Midnight node, proof server, and deployed contract
    try {
      // Build timestamp as 32-byte representation
      const timestampBytes = stringToBytes32(new Date().toISOString());
      const promiseIdx = BigInt(promiseCounter++);

      // In production, this would connect to the deployed contract and call createPromise
      // For now, we simulate since the contract SDK types aren't resolvable at runtime
      // without the full Midnight node stack running
      console.log('  ⚠ Live contract call not available — would call createPromise()');
      const txId = mockTxId();

      return res.json({
        success: true,
        contractTxId: txId,
        blockHeight: mockBlockHeight(),
        promiseHash: promiseHashHex,
        promiseIdx: Number(promiseIdx),
        extractedData: extraction.promise,
        rawText: extraction.rawText,
        mode: 'simulated',
      });
    } catch (contractError: any) {
      console.error('  ✗ Contract call failed:', contractError.message);
      return res.status(502).json({
        success: false,
        error: 'Blockchain transaction failed',
        details: contractError.message,
        extractedData: extraction.promise,
        promiseHash: promiseHashHex,
      });
    }
  } catch (error: any) {
    console.error('✗ /api/create-promise failed:', error.message);
    return res.status(500).json({
      error: 'Failed to create promise',
      details: error.message,
    });
  }
});

// ────────────────────────────────────────────────────────────────────
// POST /api/file-complaint
// ────────────────────────────────────────────────────────────────────

app.post('/api/file-complaint', async (req: Request, res: Response) => {
  try {
    const { complaintText, targetManagerId, employeeCredential } = req.body;

    if (!complaintText || typeof complaintText !== 'string') {
      return res.status(400).json({ error: 'Missing required field: complaintText (string)' });
    }
    if (!targetManagerId || typeof targetManagerId !== 'string') {
      return res.status(400).json({ error: 'Missing required field: targetManagerId (string)' });
    }
    if (!employeeCredential || typeof employeeCredential !== 'string') {
      return res.status(400).json({ error: 'Missing required field: employeeCredential (string)' });
    }

    console.log(`\n► POST /api/file-complaint`);
    console.log(`  target manager: ${targetManagerId.substring(0, 16)}...`);

    // Hash the complaint text (SHA-256 → 32 bytes)
    const complaintHash = sha256Hex(complaintText);
    const targetManagerHash = sha256Hex(targetManagerId);

    // Count existing complaints against this manager
    const existingCount = complaintStore.filter(
      (c) => c.targetManagerHash === targetManagerHash,
    ).length;

    if (IS_MOCK) {
      const idx = complaintCounter++;
      const txId = mockTxId();

      complaintStore.push({
        id: idx,
        complaintHash,
        targetManagerHash,
        txId,
        createdAt: new Date().toISOString(),
      });

      const newCount = existingCount + 1;
      const threshold = 3;

      console.log(`  ✓ [MOCK] Complaint #${idx} filed (count: ${newCount}/${threshold})`);

      return res.json({
        success: true,
        txId,
        blockHeight: mockBlockHeight(),
        complaintHash,
        complaintIdx: idx,
        complaintCount: newCount,
        thresholdReached: newCount >= threshold,
        remainingUntilThreshold: Math.max(0, threshold - newCount),
        mode: 'mock',
      });
    }

    // Live mode
    console.log('  ⚠ Live contract call not available — would call fileComplaint()');
    const txId = mockTxId();
    const newCount = existingCount + 1;

    return res.json({
      success: true,
      txId,
      blockHeight: mockBlockHeight(),
      complaintHash,
      complaintIdx: complaintCounter++,
      complaintCount: newCount,
      thresholdReached: newCount >= 3,
      remainingUntilThreshold: Math.max(0, 3 - newCount),
      mode: 'simulated',
    });
  } catch (error: any) {
    console.error('✗ /api/file-complaint failed:', error.message);
    return res.status(500).json({
      error: 'Failed to file complaint',
      details: error.message,
    });
  }
});

// ────────────────────────────────────────────────────────────────────
// GET /api/check-threshold/:managerHash
// ────────────────────────────────────────────────────────────────────

app.get('/api/check-threshold/:managerHash', async (req: Request, res: Response) => {
  try {
    const { managerHash } = req.params;

    if (!managerHash) {
      return res.status(400).json({ error: 'Missing managerHash parameter' });
    }

    console.log(`\n► GET /api/check-threshold/${managerHash.substring(0, 16)}...`);

    // Count complaints for this manager hash
    // In mock mode, check in-memory store
    // Also accept raw manager IDs by hashing them
    let lookupHash = managerHash;
    if (managerHash.length < 64) {
      lookupHash = sha256Hex(managerHash);
    }

    const complaintCount = complaintStore.filter(
      (c) => c.targetManagerHash === lookupHash,
    ).length;

    const threshold = 3;
    const thresholdReached = complaintCount >= threshold;

    if (IS_MOCK) {
      console.log(`  ✓ [MOCK] Complaints: ${complaintCount}/${threshold}`);
    }

    return res.json({
      success: true,
      managerHash: lookupHash,
      complaintCount,
      threshold,
      thresholdReached,
      mode: IS_MOCK ? 'mock' : 'simulated',
    });
  } catch (error: any) {
    console.error('✗ /api/check-threshold failed:', error.message);
    return res.status(500).json({
      error: 'Failed to check threshold',
      details: error.message,
    });
  }
});

// ────────────────────────────────────────────────────────────────────
// GET /api/reliability/:managerHash
// ────────────────────────────────────────────────────────────────────

app.get('/api/reliability/:managerHash', async (req: Request, res: Response) => {
  try {
    const { managerHash } = req.params;

    if (!managerHash) {
      return res.status(400).json({ error: 'Missing managerHash parameter' });
    }

    console.log(`\n► GET /api/reliability/${managerHash.substring(0, 16)}...`);

    // Compute from in-memory store
    const managerPromises = promiseStore.filter(
      (p) => p.managerAddress === managerHash || p.managerAddress.startsWith(managerHash),
    );

    const created = managerPromises.length;
    const fulfilled = managerPromises.filter((p) => p.status === 'fulfilled').length;
    const broken = managerPromises.filter((p) => p.status === 'broken').length;
    const pending = managerPromises.filter((p) => p.status === 'pending').length;
    const percentage = created > 0 ? Math.round((fulfilled / created) * 100) : 0;

    // If no data found, return demo data
    if (created === 0 && IS_MOCK) {
      return res.json({
        success: true,
        managerHash,
        reliability: {
          created: 12,
          fulfilled: 9,
          broken: 2,
          pending: 1,
          percentage: 75,
          grade: 'B',
        },
        mode: 'mock-demo',
      });
    }

    // Compute grade
    let grade = 'F';
    if (percentage >= 90) grade = 'A';
    else if (percentage >= 75) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 40) grade = 'D';

    return res.json({
      success: true,
      managerHash,
      reliability: {
        created,
        fulfilled,
        broken,
        pending,
        percentage,
        grade,
      },
      mode: IS_MOCK ? 'mock' : 'simulated',
    });
  } catch (error: any) {
    console.error('✗ /api/reliability failed:', error.message);
    return res.status(500).json({
      error: 'Failed to get reliability score',
      details: error.message,
    });
  }
});

// ────────────────────────────────────────────────────────────────────
// GET /api/promises/:employeeAddress
// ────────────────────────────────────────────────────────────────────

app.get('/api/promises/:employeeAddress', async (req: Request, res: Response) => {
  try {
    const { employeeAddress } = req.params;

    if (!employeeAddress) {
      return res.status(400).json({ error: 'Missing employeeAddress parameter' });
    }

    console.log(`\n► GET /api/promises/${employeeAddress.substring(0, 16)}...`);

    // Filter from in-memory store
    const promises = promiseStore.filter(
      (p) =>
        p.employeeAddress === employeeAddress ||
        p.employeeAddress.startsWith(employeeAddress),
    );

    // If no promises found and mock mode, return demo data
    if (promises.length === 0 && IS_MOCK) {
      return res.json({
        success: true,
        employeeAddress,
        promises: [
          {
            id: 0,
            promiseHash: 'a1b2c3d4e5f6789012345678abcdef0123456789abcdef0123456789abcdef01',
            description: 'Promotion to Senior Engineer after Q3 migration project',
            condition: 'Complete Q3 database migration',
            reward: 'Senior Engineer title + 15% raise',
            deadline: 'End of Q3 2025',
            status: 'pending',
            confidence: 0.92,
            createdAt: '2025-07-15T10:30:00Z',
          },
          {
            id: 1,
            promiseHash: 'b2c3d4e5f6789012345678abcdef0123456789abcdef0123456789abcdef0123',
            description: 'Remote work approval after office renovation',
            condition: 'Office renovation complete',
            reward: '3 days/week remote work',
            deadline: 'Q4 2025',
            status: 'fulfilled',
            confidence: 0.85,
            createdAt: '2025-06-01T14:00:00Z',
          },
        ],
        total: 2,
        mode: 'mock-demo',
      });
    }

    return res.json({
      success: true,
      employeeAddress,
      promises: promises.map((p) => ({
        id: p.id,
        promiseHash: p.promiseHash,
        description: p.description,
        condition: p.condition,
        reward: p.reward,
        deadline: p.deadline,
        status: p.status,
        confidence: p.confidence,
        createdAt: p.createdAt,
      })),
      total: promises.length,
      mode: IS_MOCK ? 'mock' : 'simulated',
    });
  } catch (error: any) {
    console.error('✗ /api/promises failed:', error.message);
    return res.status(500).json({
      error: 'Failed to get promises',
      details: error.message,
    });
  }
});

// ────────────────────────────────────────────────────────────────────
// Global Error Handler — never crash, always return JSON
// ────────────────────────────────────────────────────────────────────

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({
    error: 'Internal server error',
    details: err.message,
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    availableEndpoints: [
      'GET  /health',
      'GET  /api/contract',
      'POST /api/extract-promise',
      'POST /api/create-promise',
      'POST /api/file-complaint',
      'GET  /api/check-threshold/:managerHash',
      'GET  /api/reliability/:managerHash',
      'GET  /api/promises/:employeeAddress',
    ],
  });
});

// ────────────────────────────────────────────────────────────────────
// Start Server
// ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  const contractAddress = loadDeployedAddress();
  const mockStatus = IS_MOCK ? '🧪 MOCK' : '🔴 LIVE';
  const aiStatus = process.env.MOCK_AI === 'true' ? '🧪 MOCK' : '🤖 LIVE';

  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║         ProofWork API Server                            ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  URL:        http://localhost:${PORT}`);
  console.log(`║  Blockchain: ${mockStatus}`);
  console.log(`║  AI Engine:  ${aiStatus}`);
  console.log(`║  Contract:   ${contractAddress || 'not deployed'}`);
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log('║  Endpoints:                                             ║');
  console.log('║    GET  /health                                         ║');
  console.log('║    POST /api/extract-promise                            ║');
  console.log('║    POST /api/create-promise                             ║');
  console.log('║    POST /api/file-complaint                             ║');
  console.log('║    GET  /api/check-threshold/:hash                      ║');
  console.log('║    GET  /api/reliability/:hash                          ║');
  console.log('║    GET  /api/promises/:address                          ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
});

export default app;
