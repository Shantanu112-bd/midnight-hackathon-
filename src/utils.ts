/**
 * ProofWork — Shared utility functions
 * These are the non-SDK-dependent functions used by the API server.
 * Extracted from midnight-client.ts so the server can run without
 * the Midnight SDK packages installed (needed for mock/demo mode).
 */

import * as path from 'path';
import * as fs from 'fs';
import { createHash } from 'crypto';

// ────────────────────────────────────────────────────────────────────
// Load deployed contract address
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
// Byte/Hex conversion utilities
// ────────────────────────────────────────────────────────────────────

/**
 * Convert a UTF-8 string to a 32-byte array (zero-padded or truncated).
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

/**
 * SHA-256 hash a string and return the hex digest.
 */
export function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf-8').digest('hex');
}
