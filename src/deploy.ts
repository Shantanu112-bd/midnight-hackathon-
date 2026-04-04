// @ts-nocheck
/**
 * ProofWork Deployment Script
 * Deploys the ProofWork Compact contract to Midnight devnet.
 *
 * Based on the midnightntwrk/example-counter deployment pattern.
 * Uses: @midnight-ntwrk/midnight-js-contracts, wallet-sdk-facade, compact-js
 *
 * Environment Variables:
 *   MIDNIGHT_NODE_URL     - WebSocket-capable node URL (default: http://localhost:9944)
 *   MIDNIGHT_INDEXER_URL  - Indexer HTTP URL (default: http://localhost:8088)
 *   MIDNIGHT_INDEXER_WS   - Indexer WebSocket URL (default: ws://localhost:8088/ws)
 *   PROOF_SERVER_URL      - Proof server URL (default: http://localhost:6300)
 *   WALLET_SEED           - 64-char hex wallet seed (generates random if not set)
 *   NETWORK_ID            - Network ID (default: unset, uses SDK default)
 */

import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Midnight SDK imports
// @ts-ignore — types may not resolve without full SDK installation
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
// @ts-ignore
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
// @ts-ignore
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
// @ts-ignore
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
// @ts-ignore
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
// @ts-ignore
import { WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
// @ts-ignore
import { HDWallet, Roles, generateRandomSeed } from '@midnight-ntwrk/wallet-sdk-hd';
// @ts-ignore
import { ShieldedWallet } from '@midnight-ntwrk/wallet-sdk-shielded';
// @ts-ignore
import { DustWallet } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
// @ts-ignore
import {
  createKeystore,
  InMemoryTransactionHistoryStorage,
  PublicKey,
  UnshieldedWallet,
} from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
// @ts-ignore
import * as ledger from '@midnight-ntwrk/ledger-v8';
// @ts-ignore
import { getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
// @ts-ignore
import { CompiledContract } from '@midnight-ntwrk/compact-js';

// Import the compiled ProofWork contract
// @ts-ignore — generated code
import * as ProofWork from '../managed/contract/index.js';

import { Buffer } from 'buffer';
import * as Rx from 'rxjs';

dotenv.config();

// ────────────────────────────────────────────────────────────────────
// Configuration
// ────────────────────────────────────────────────────────────────────

interface DeployConfig {
  node: string;
  indexer: string;
  indexerWS: string;
  proofServer: string;
  zkConfigPath: string;
  privateStateStoreName: string;
}

const config: DeployConfig = {
  node: process.env.MIDNIGHT_NODE_URL || 'http://localhost:9944',
  indexer: process.env.MIDNIGHT_INDEXER_URL || 'http://localhost:8088',
  indexerWS: process.env.MIDNIGHT_INDEXER_WS || 'ws://localhost:8088/ws',
  proofServer: process.env.PROOF_SERVER_URL || 'http://localhost:6300',
  zkConfigPath: path.resolve(__dirname, '../managed/keys'),
  privateStateStoreName: 'proofwork-private-state',
};

// ────────────────────────────────────────────────────────────────────
// Private State for ProofWork witnesses
// ────────────────────────────────────────────────────────────────────

type ProofWorkPrivateState = Record<string, never>;

const witnesses: ProofWork.Witnesses<ProofWorkPrivateState> = {
  employeeSecretKey({ privateState }) {
    // In production, this would come from the user's secure keystore
    const defaultKey = new Uint8Array(32);
    return [privateState, defaultKey];
  },
  managerSecretKey({ privateState }) {
    const defaultKey = new Uint8Array(32);
    return [privateState, defaultKey];
  },
  employeeCredential({ privateState }) {
    const defaultKey = new Uint8Array(32);
    return [privateState, defaultKey];
  },
};

// ────────────────────────────────────────────────────────────────────
// HD Key Derivation
// ────────────────────────────────────────────────────────────────────

function deriveKeysFromSeed(seed: string) {
  const hdWallet = HDWallet.fromSeed(Buffer.from(seed, 'hex'));
  if (hdWallet.type !== 'seedOk') {
    throw new Error('Failed to initialize HDWallet from seed');
  }

  const derivationResult = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);

  if (derivationResult.type !== 'keysDerived') {
    throw new Error('Failed to derive keys');
  }

  hdWallet.hdWallet.clear();
  return derivationResult.keys;
}

// ────────────────────────────────────────────────────────────────────
// Wallet Setup
// ────────────────────────────────────────────────────────────────────

async function buildWallet(seed: string) {
  const keys = deriveKeysFromSeed(seed);
  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], getNetworkId());

  const walletConfig = {
    networkId: getNetworkId(),
    indexerClientConnection: {
      indexerHttpUrl: config.indexer,
      indexerWsUrl: config.indexerWS,
    },
    txHistoryStorage: new InMemoryTransactionHistoryStorage(),
    provingServerUrl: new URL(config.proofServer),
    relayURL: new URL(config.node.replace(/^http/, 'ws')),
    costParameters: {
      additionalFeeOverhead: 300_000_000_000_000n,
      feeBlocksMargin: 5,
    },
  };

  const wallet = await WalletFacade.init({
    configuration: walletConfig,
    shielded: (cfg: any) => ShieldedWallet(cfg).startWithSecretKeys(shieldedSecretKeys),
    unshielded: (cfg: any) =>
      UnshieldedWallet(cfg).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore)),
    dust: (cfg: any) =>
      DustWallet(cfg).startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust),
  });

  await wallet.start(shieldedSecretKeys, dustSecretKey);

  return { wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore };
}

// ────────────────────────────────────────────────────────────────────
// Provider Configuration
// ────────────────────────────────────────────────────────────────────

async function createProviders(walletCtx: any) {
  const state = await Rx.firstValueFrom(
    walletCtx.wallet.state().pipe(Rx.filter((s: any) => s.isSynced)),
  );

  const walletAndMidnightProvider = {
    getCoinPublicKey: () => state.shielded.coinPublicKey.toHexString(),
    getEncryptionPublicKey: () => state.shielded.encryptionPublicKey.toHexString(),
    async balanceTx(tx: any, ttl?: Date) {
      const recipe = await walletCtx.wallet.balanceUnboundTransaction(
        tx,
        {
          shieldedSecretKeys: walletCtx.shieldedSecretKeys,
          dustSecretKey: walletCtx.dustSecretKey,
        },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      return walletCtx.wallet.finalizeRecipe(recipe);
    },
    submitTx(tx: any) {
      return walletCtx.wallet.submitTransaction(tx);
    },
  };

  const zkConfigProvider = new NodeZkConfigProvider(config.zkConfigPath);
  const accountId = walletAndMidnightProvider.getCoinPublicKey();
  const storagePassword = `${Buffer.from(accountId, 'hex').toString('base64')}!`;

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: config.privateStateStoreName,
      accountId,
      privateStoragePasswordProvider: () => storagePassword,
    }),
    publicDataProvider: indexerPublicDataProvider(config.indexer, config.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(config.proofServer, zkConfigProvider),
    walletProvider: walletAndMidnightProvider,
    midnightProvider: walletAndMidnightProvider,
  };
}

// ────────────────────────────────────────────────────────────────────
// Pre-compile Contract
// ────────────────────────────────────────────────────────────────────

function buildCompiledContract() {
  const proofWorkContract = new ProofWork.Contract(witnesses);

  return CompiledContract.make('proofwork', proofWorkContract).pipe(
    CompiledContract.withVacantWitnesses,
    CompiledContract.withCompiledFileAssets(config.zkConfigPath),
  );
}

// ────────────────────────────────────────────────────────────────────
// Main Deployment
// ────────────────────────────────────────────────────────────────────

async function deployProofWorkContract(): Promise<string> {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║       ProofWork Contract Deployment                 ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');

  // 1. Get or generate wallet seed
  let seed = process.env.WALLET_SEED;
  if (!seed) {
    seed = Buffer.from(generateRandomSeed()).toString('hex');
    console.log('⚠  No WALLET_SEED found in .env — generated fresh seed:');
    console.log(`   ${seed}`);
    console.log('   Save this seed to restore your wallet later.\n');
  }

  // 2. Build wallet
  console.log('► Building wallet...');
  const walletCtx = await buildWallet(seed);
  console.log('✓ Wallet initialized\n');

  // 3. Wait for sync
  console.log('► Syncing with network...');
  await Rx.firstValueFrom(
    walletCtx.wallet.state().pipe(Rx.filter((s: any) => s.isSynced)),
  );
  console.log('✓ Wallet synced\n');

  // 4. Configure providers
  console.log('► Configuring providers...');
  const providers = await createProviders(walletCtx);
  console.log('✓ Providers configured\n');

  // 5. Build compiled contract
  const compiledContract = buildCompiledContract();

  // 6. Deploy
  console.log('► Deploying ProofWork contract...');
  console.log(`  Node:         ${config.node}`);
  console.log(`  Indexer:      ${config.indexer}`);
  console.log(`  Proof Server: ${config.proofServer}`);
  console.log('');

  const deployedContract = await deployContract(providers, {
    compiledContract,
    privateStateId: 'proofworkPrivateState',
    initialPrivateState: {},
  });

  const contractAddress = deployedContract.deployTxData.public.contractAddress;

  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  ✓ DEPLOYMENT SUCCESSFUL                           ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`  Contract Address: ${contractAddress}`);
  console.log(`  Block Height:     ${deployedContract.deployTxData.public.blockHeight}`);
  console.log(`  TX ID:            ${deployedContract.deployTxData.public.txId}`);
  console.log('');

  // 7. Save contract address
  const deployInfo = {
    contractAddress,
    blockHeight: String(deployedContract.deployTxData.public.blockHeight),
    txId: deployedContract.deployTxData.public.txId,
    deployedAt: new Date().toISOString(),
    network: process.env.NETWORK_ID || 'devnet',
    nodeUrl: config.node,
  };

  const outputPath = path.resolve(__dirname, '../deployed-contract.json');
  fs.writeFileSync(outputPath, JSON.stringify(deployInfo, null, 2));
  console.log(`✓ Contract info saved to ${outputPath}`);

  return contractAddress;
}

// ────────────────────────────────────────────────────────────────────
// Entry Point
// ────────────────────────────────────────────────────────────────────

if (require.main === module) {
  deployProofWorkContract()
    .then((address) => {
      console.log(`\n✓ Done. Contract address: ${address}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Deployment failed:', error);
      process.exit(1);
    });
}

export { deployProofWorkContract, buildWallet, createProviders, buildCompiledContract, config };
