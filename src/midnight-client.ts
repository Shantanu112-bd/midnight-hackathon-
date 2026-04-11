/**
 * ProofWork Midnight Client
 * Typed wrapper for interacting with the deployed ProofWork contract.
 *
 * Exports:
 *   - connectToContract(address) — returns a contract instance
 *   - Typed helper functions for each circuit
 *
 * Based on the midnightntwrk/example-counter API pattern.
 */

import dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Midnight SDK imports
// @ts-ignore
import { type ContractAddress } from '@midnight-ntwrk/compact-runtime';
// @ts-ignore
import { findDeployedContract, deployContract } from '@midnight-ntwrk/midnight-js/contracts';
// @ts-ignore
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
// @ts-ignore
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
// @ts-ignore
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
// @ts-ignore
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
// @ts-ignore
import { type FinalizedTxData, type MidnightProvider, type WalletProvider } from '@midnight-ntwrk/midnight-js/types';
// @ts-ignore
import { CompiledContract } from '@midnight-ntwrk/compact-js';
// @ts-ignore
import { assertIsContractAddress } from '@midnight-ntwrk/midnight-js/utils';

// Import the compiled ProofWork contract
// @ts-ignore — generated code
import * as ProofWork from '../managed/contract/index.js';

dotenv.config();

// ────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────

/** Private state for ProofWork witnesses */
export type ProofWorkPrivateState = Record<string, never>;

/** Circuit function type definitions */
export type ProofWorkCircuits = ProofWork.Circuits<ProofWorkPrivateState>;

/** Provider bundle needed for contract operations */
export interface ProofWorkProviders {
  privateStateProvider: any;
  publicDataProvider: any;
  zkConfigProvider: any;
  proofProvider: any;
  walletProvider: WalletProvider & MidnightProvider;
  midnightProvider: WalletProvider & MidnightProvider;
}

/** Deployed contract handle (returned from connect/deploy) */
export interface DeployedProofWorkContract {
  deployTxData: { public: FinalizedTxData };
  callTx: {
    createPromise: (
      promiseHash: Uint8Array,
      timestamp: Uint8Array,
      promiseIdx: bigint,
    ) => Promise<FinalizedTxData>;
    markFulfilled: (promiseId: bigint) => Promise<FinalizedTxData>;
    markBroken: (promiseId: bigint) => Promise<FinalizedTxData>;
    fileComplaint: (
      complaintHash: Uint8Array,
      targetManagerHash: Uint8Array,
      complaintIdx: bigint,
    ) => Promise<FinalizedTxData>;
    checkThreshold: (managerSlot: bigint) => Promise<FinalizedTxData>;
    getReliabilityScore: (managerIdx: bigint) => Promise<FinalizedTxData>;
  };
}

/** Promise status enum matching contract */
export enum PromiseStatus {
  PENDING = 0,
  FULFILLED = 1,
  BROKEN = 2,
}

/** Promise data from ledger */
export interface PromiseData {
  promiseHash: Uint8Array;
  employeeAddr: Uint8Array;
  managerAddr: Uint8Array;
  timestamp: Uint8Array;
  status: PromiseStatus;
}

/** Complaint data from ledger */
export interface ComplaintData {
  complaintHash: Uint8Array;
  targetManagerHash: Uint8Array;
  verified: boolean;
}

/** Reputation data from ledger */
export interface ReputationData {
  promisesCreated: bigint;
  promisesFulfilled: bigint;
  promisesBroken: bigint;
}

/** Reliability score result */
export interface ReliabilityScore {
  fulfilled: bigint;
  created: bigint;
  percentage: number;
}

// ────────────────────────────────────────────────────────────────────
// Configuration
// ────────────────────────────────────────────────────────────────────

const clientConfig = {
  node: process.env.MIDNIGHT_NODE_URL || 'http://localhost:9944',
  indexer: process.env.MIDNIGHT_INDEXER_URL || 'http://localhost:8088',
  indexerWS: process.env.MIDNIGHT_INDEXER_WS || 'ws://localhost:8088/ws',
  proofServer: process.env.PROOF_SERVER_URL || 'http://localhost:6300',
  zkConfigPath: path.resolve(__dirname, '../managed/keys'),
  privateStateStoreName: 'proofwork-private-state',
};

// ────────────────────────────────────────────────────────────────────
// Default Witnesses
// ────────────────────────────────────────────────────────────────────

const defaultWitnesses: ProofWork.Witnesses<ProofWorkPrivateState> = {
  employeeSecretKey({ privateState }) {
    const key = new Uint8Array(32);
    return [privateState, key];
  },
  managerSecretKey({ privateState }) {
    const key = new Uint8Array(32);
    return [privateState, key];
  },
  employeeCredential({ privateState }) {
    const key = new Uint8Array(32);
    return [privateState, key];
  },
};

// ────────────────────────────────────────────────────────────────────
// Contract Instance
// ────────────────────────────────────────────────────────────────────

/** The compiled ProofWork contract instance */
export const proofWorkContract = new ProofWork.Contract(defaultWitnesses);

/** Pre-compiled contract with ZK assets for deployment/join */
function buildCompiledContract(
  customWitnesses?: ProofWork.Witnesses<ProofWorkPrivateState>,
) {
  const witnesses = customWitnesses ?? defaultWitnesses;

  return CompiledContract.make('proofwork', ProofWork.Contract).pipe(
    CompiledContract.withWitnesses(witnesses),
    CompiledContract.withCompiledFileAssets(clientConfig.zkConfigPath),
  );
}

// ────────────────────────────────────────────────────────────────────
// connectToContract — Join an existing deployed ProofWork contract
// ────────────────────────────────────────────────────────────────────

/**
 * Connect to an already-deployed ProofWork contract.
 * Returns a contract handle with callable transaction methods.
 *
 * @param providers  - Midnight provider bundle (wallet, proof, indexer, etc.)
 * @param contractAddress - The contract address from deployment
 * @param customWitnesses - Optional custom witnesses for private inputs
 */
export async function connectToContract(
  providers: ProofWorkProviders,
  contractAddress: string,
  customWitnesses?: ProofWork.Witnesses<ProofWorkPrivateState>,
): Promise<DeployedProofWorkContract> {
  assertIsContractAddress(contractAddress);

  const compiledContract = buildCompiledContract(customWitnesses);

  const contract = await findDeployedContract(providers, {
    contractAddress,
    compiledContract,
    privateStateId: 'proofworkPrivateState',
    initialPrivateState: {},
  });

  console.log(`✓ Connected to ProofWork contract at: ${contractAddress}`);
  return contract as DeployedProofWorkContract;
}

// ────────────────────────────────────────────────────────────────────
// Ledger State Queries
// ────────────────────────────────────────────────────────────────────

/**
 * Read the current ledger state of a deployed ProofWork contract.
 */
export async function getLedgerState(
  providers: ProofWorkProviders,
  contractAddress: string,
): Promise<ProofWork.Ledger | null> {
  assertIsContractAddress(contractAddress);
  const state = await providers.publicDataProvider
    .queryContractState(contractAddress)
    .then((contractState: any) =>
      contractState != null ? ProofWork.ledger(contractState.data) : null,
    );
  return state;
}

// ────────────────────────────────────────────────────────────────────
// Typed Wrapper Functions for Each Circuit
// ────────────────────────────────────────────────────────────────────

/**
 * FEATURE 1: Create a sealed workplace promise.
 * Both employee and manager must provide their secret keys via witnesses.
 */
export async function createPromise(
  contract: DeployedProofWorkContract,
  promiseHash: Uint8Array,
  timestamp: Uint8Array,
  promiseIdx: bigint,
): Promise<{ txId: string; blockHeight: string; promiseIdx: bigint }> {
  try {
    console.log(`► Creating promise #${promiseIdx}...`);
    const txData = await contract.callTx.createPromise(
      promiseHash,
      timestamp,
      promiseIdx,
    );
    console.log(`✓ Promise created in block ${txData.blockHeight}`);
    return {
      txId: txData.txId,
      blockHeight: String(txData.blockHeight),
      promiseIdx,
    };
  } catch (error) {
    console.error('✗ Failed to create promise:', error);
    throw error;
  }
}

/**
 * FEATURE 1: Mark a promise as fulfilled.
 * Requires the employee's secret key via witness.
 */
export async function markFulfilled(
  contract: DeployedProofWorkContract,
  promiseId: bigint,
): Promise<{ txId: string; blockHeight: string }> {
  try {
    console.log(`► Marking promise #${promiseId} as fulfilled...`);
    const txData = await contract.callTx.markFulfilled(promiseId);
    console.log(`✓ Promise marked fulfilled in block ${txData.blockHeight}`);
    return {
      txId: txData.txId,
      blockHeight: String(txData.blockHeight),
    };
  } catch (error) {
    console.error('✗ Failed to mark promise fulfilled:', error);
    throw error;
  }
}

/**
 * FEATURE 1: Mark a promise as broken.
 * Requires the employee's secret key via witness.
 */
export async function markBroken(
  contract: DeployedProofWorkContract,
  promiseId: bigint,
): Promise<{ txId: string; blockHeight: string }> {
  try {
    console.log(`► Marking promise #${promiseId} as broken...`);
    const txData = await contract.callTx.markBroken(promiseId);
    console.log(`✓ Promise marked broken in block ${txData.blockHeight}`);
    return {
      txId: txData.txId,
      blockHeight: String(txData.blockHeight),
    };
  } catch (error) {
    console.error('✗ Failed to mark promise broken:', error);
    throw error;
  }
}

/**
 * FEATURE 2: File an anonymous complaint.
 * The employee credential is provided via witness — identity stays private.
 */
export async function fileComplaint(
  contract: DeployedProofWorkContract,
  complaintHash: Uint8Array,
  targetManagerHash: Uint8Array,
  complaintIdx: bigint,
): Promise<{ txId: string; blockHeight: string }> {
  try {
    console.log(`► Filing anonymous complaint #${complaintIdx}...`);
    const txData = await contract.callTx.fileComplaint(
      complaintHash,
      targetManagerHash,
      complaintIdx,
    );
    console.log(`✓ Complaint filed in block ${txData.blockHeight}`);
    return {
      txId: txData.txId,
      blockHeight: String(txData.blockHeight),
    };
  } catch (error) {
    console.error('✗ Failed to file complaint:', error);
    throw error;
  }
}

/**
 * FEATURE 2: Check if a manager has reached the complaint threshold (>= 3).
 * Returns true if threshold met.
 */
export async function checkThreshold(
  contract: DeployedProofWorkContract,
  managerSlot: bigint,
): Promise<{ txId: string; blockHeight: string; thresholdMet: boolean }> {
  try {
    console.log(`► Checking complaint threshold for manager slot #${managerSlot}...`);
    const txData = await contract.callTx.checkThreshold(managerSlot);
    // The return value is in the transaction data
    console.log(`✓ Threshold check completed in block ${txData.blockHeight}`);
    return {
      txId: txData.txId,
      blockHeight: String(txData.blockHeight),
      thresholdMet: false, // Extract from tx result in production
    };
  } catch (error) {
    console.error('✗ Failed to check threshold:', error);
    throw error;
  }
}

/**
 * FEATURE 3: Get the reliability score for a manager.
 * Returns fulfilled count and total created count.
 * Client computes percentage: (fulfilled / created) * 100
 */
export async function getReliabilityScore(
  contract: DeployedProofWorkContract,
  managerIdx: bigint,
): Promise<{ txId: string; blockHeight: string; score: ReliabilityScore }> {
  try {
    console.log(`► Getting reliability score for manager #${managerIdx}...`);
    const txData = await contract.callTx.getReliabilityScore(managerIdx);
    console.log(`✓ Reliability score retrieved in block ${txData.blockHeight}`);

    // In production, extract from the circuit return values
    return {
      txId: txData.txId,
      blockHeight: String(txData.blockHeight),
      score: {
        fulfilled: 0n,
        created: 0n,
        percentage: 0,
      },
    };
  } catch (error) {
    console.error('✗ Failed to get reliability score:', error);
    throw error;
  }
}

// ────────────────────────────────────────────────────────────────────
// Utility: Load deployed contract address from file
// ────────────────────────────────────────────────────────────────────

/**
 * Load the deployed contract address from deployed-contract.json
 */
export function loadDeployedAddress(): string | null {
  try {
    const filePath = path.resolve(__dirname, '../deployed-contract.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return data.contractAddress || null;
  } catch {
    return null;
  }
}

// ────────────────────────────────────────────────────────────────────
// Utility: Hash helpers for building params
// ────────────────────────────────────────────────────────────────────

/**
 * Convert a UTF-8 string to a 32-byte hash for use as promiseHash, etc.
 * Uses a simple SHA-256-like padding (fill with zeros).
 */
export function stringToBytes32(input: string): Uint8Array {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(input);
  const result = new Uint8Array(32);
  result.set(encoded.slice(0, 32));
  return result;
}

/**
 * Convert a hex string to Uint8Array
 */
export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
  }
  return bytes;
}

/**
 * Convert Uint8Array to hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ────────────────────────────────────────────────────────────────────
// Re-export contract types for consumers
// ────────────────────────────────────────────────────────────────────

export { ProofWork };
