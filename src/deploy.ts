// @ts-nocheck
/**
 * ProofWork Deployment Script
 * Deploys the ProofWork Compact contract to Midnight testnet.
 *
 * Based on the midnightntwrk/example-counter deployment pattern (SDK v4).
 * Uses: @midnight-ntwrk/midnight-js, wallet-sdk-facade, compact-js
 *
 * Environment Variables:
 *   MIDNIGHT_NODE_URL     - Node URL (default: https://rpc.testnet.midnight.network)
 *   MIDNIGHT_INDEXER_URL  - Indexer HTTP URL (default: https://indexer.testnet.midnight.network/graphql)
 *   MIDNIGHT_INDEXER_WS   - Indexer WebSocket URL (default: wss://indexer.testnet.midnight.network/graphql/ws)
 *   PROOF_SERVER_URL      - Proof server URL (default: http://localhost:6300)
 *   WALLET_SEED           - 64-char hex wallet seed (generates random if not set)
 *   NETWORK_ID            - Network ID (default: unset, uses SDK default)
 */

import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { Buffer } from 'buffer';
import * as Rx from 'rxjs';
import WebSocket from 'ws';

// Required for GraphQL subscriptions (wallet sync) to work in Node.js
// @ts-expect-error: Needed to enable WebSocket usage through apollo
globalThis.WebSocket = WebSocket;

// Midnight SDK imports — modern v4 API
import { deployContract } from '@midnight-ntwrk/midnight-js/contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { getNetworkId, setNetworkId } from '@midnight-ntwrk/midnight-js/network-id';
import { toHex } from '@midnight-ntwrk/midnight-js/utils';
import { CompiledContract } from '@midnight-ntwrk/compact-js';

// Wallet SDK
import { WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { HDWallet, Roles, generateRandomSeed } from '@midnight-ntwrk/wallet-sdk-hd';
import { ShieldedWallet } from '@midnight-ntwrk/wallet-sdk-shielded';
import { DustWallet } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import {
  createKeystore,
  InMemoryTransactionHistoryStorage,
  PublicKey,
  UnshieldedWallet,
} from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';

// Ledger
import * as ledger from '@midnight-ntwrk/ledger-v8';
import { unshieldedToken } from '@midnight-ntwrk/ledger-v8';

// Import the compiled ProofWork contract
import * as ProofWork from '../managed/contract/index.js';

dotenv.config();

// Must be called before any wallet or contract operation
setNetworkId(process.env.NETWORK_ID || 'preview');

// ────────────────────────────────────────────────────────────────────
// ESM __dirname equivalent
// ────────────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ────────────────────────────────────────────────────────────────────
// Configuration
// ────────────────────────────────────────────────────────────────────

const config = {
  node: process.env.MIDNIGHT_NODE_URL || 'https://rpc.preview.midnight.network',
  indexer: process.env.MIDNIGHT_INDEXER_URL || 'https://indexer.preview.midnight.network/api/v3/graphql',
  indexerWS: process.env.MIDNIGHT_INDEXER_WS || 'wss://indexer.preview.midnight.network/api/v3/graphql/ws',
  proofServer: process.env.PROOF_SERVER_URL || 'http://localhost:6300',
  zkConfigPath: path.resolve(__dirname, '../managed'),
  privateStateStoreName: 'proofwork-private-state',
};

// ────────────────────────────────────────────────────────────────────
// Private State for ProofWork witnesses
// ────────────────────────────────────────────────────────────────────

const witnesses = {
  employeeSecretKey({ privateState }) {
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
// Compiled Contract (pre-built at module load)
// ────────────────────────────────────────────────────────────────────

const proofworkCompiledContract = CompiledContract.make('proofwork', ProofWork.Contract).pipe(
  CompiledContract.withWitnesses(witnesses),
  CompiledContract.withCompiledFileAssets(config.zkConfigPath),
);

// ────────────────────────────────────────────────────────────────────
// Animated status helper
// ────────────────────────────────────────────────────────────────────

async function withStatus(message, fn) {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  const interval = setInterval(() => {
    process.stdout.write(`\r  ${frames[i++ % frames.length]} ${message}`);
  }, 80);
  try {
    const result = await fn();
    clearInterval(interval);
    process.stdout.write(`\r  ✓ ${message}\n`);
    return result;
  } catch (e) {
    clearInterval(interval);
    process.stdout.write(`\r  ✗ ${message}\n`);
    throw e;
  }
}

// ────────────────────────────────────────────────────────────────────
// HD Key Derivation
// ────────────────────────────────────────────────────────────────────

function deriveKeysFromSeed(seed) {
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
// Wallet Setup (matches official example-counter pattern)
// ────────────────────────────────────────────────────────────────────

async function buildWallet(seed) {
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
    shielded: (cfg) => ShieldedWallet(cfg).startWithSecretKeys(shieldedSecretKeys),
    unshielded: (cfg) =>
      UnshieldedWallet(cfg).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore)),
    dust: (cfg) =>
      DustWallet(cfg).startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust),
  });

  await wallet.start(shieldedSecretKeys, dustSecretKey);

  return { wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore };
}

// ────────────────────────────────────────────────────────────────────
// Wallet + Midnight Provider (bridges wallet-sdk to midnight-js)
// ────────────────────────────────────────────────────────────────────

async function createWalletAndMidnightProvider(ctx) {
  const state = await Rx.firstValueFrom(
    ctx.wallet.state().pipe(Rx.filter((s) => s.isSynced)),
  );

  return {
    getCoinPublicKey() {
      return state.shielded.coinPublicKey.toHexString();
    },
    getEncryptionPublicKey() {
      return state.shielded.encryptionPublicKey.toHexString();
    },
    async balanceTx(tx, ttl) {
      const recipe = await ctx.wallet.balanceUnboundTransaction(
        tx,
        {
          shieldedSecretKeys: ctx.shieldedSecretKeys,
          dustSecretKey: ctx.dustSecretKey,
        },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );

      // Sign intents with correct proof marker (workaround for wallet SDK bug)
      const signFn = (payload) => ctx.unshieldedKeystore.signData(payload);
      signTransactionIntents(recipe.baseTransaction, signFn, 'proof');
      if (recipe.balancingTransaction) {
        signTransactionIntents(recipe.balancingTransaction, signFn, 'pre-proof');
      }

      return ctx.wallet.finalizeRecipe(recipe);
    },
    submitTx(tx) {
      return ctx.wallet.submitTransaction(tx);
    },
  };
}

/**
 * Sign all unshielded offers in a transaction's intents.
 * Workaround for wallet SDK bug where signRecipe hardcodes 'pre-proof'.
 */
function signTransactionIntents(tx, signFn, proofMarker) {
  if (!tx.intents || tx.intents.size === 0) return;

  for (const segment of tx.intents.keys()) {
    const intent = tx.intents.get(segment);
    if (!intent) continue;

    const cloned = ledger.Intent.deserialize(
      'signature', proofMarker, 'pre-binding', intent.serialize(),
    );

    const sigData = cloned.signatureData(segment);
    const signature = signFn(sigData);

    if (cloned.fallibleUnshieldedOffer) {
      const sigs = cloned.fallibleUnshieldedOffer.inputs.map(
        (_, i) => cloned.fallibleUnshieldedOffer.signatures.at(i) ?? signature,
      );
      cloned.fallibleUnshieldedOffer = cloned.fallibleUnshieldedOffer.addSignatures(sigs);
    }

    if (cloned.guaranteedUnshieldedOffer) {
      const sigs = cloned.guaranteedUnshieldedOffer.inputs.map(
        (_, i) => cloned.guaranteedUnshieldedOffer.signatures.at(i) ?? signature,
      );
      cloned.guaranteedUnshieldedOffer = cloned.guaranteedUnshieldedOffer.addSignatures(sigs);
    }

    tx.intents.set(segment, cloned);
  }
}

// ────────────────────────────────────────────────────────────────────
// Provider Configuration
// ────────────────────────────────────────────────────────────────────

async function createProviders(walletCtx) {
  const walletAndMidnightProvider = await createWalletAndMidnightProvider(walletCtx);
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
// Wait for wallet funds
// ────────────────────────────────────────────────────────────────────

async function waitForFunds(wallet) {
  return Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(10_000),
      Rx.filter((state) => state.isSynced),
      Rx.map((s) => s.unshielded.balances[unshieldedToken().raw] ?? 0n),
      Rx.filter((balance) => balance > 0n),
    ),
  );
}

/**
 * Register unshielded NIGHT UTXOs for dust generation.
 * NIGHT tokens on Preprod/Testnet generate DUST over time, but only after
 * the UTXOs have been explicitly designated for dust generation.
 */
async function registerForDustGeneration(wallet, unshieldedKeystore) {
  const state = await Rx.firstValueFrom(wallet.state().pipe(Rx.filter((s) => s.isSynced)));

  // Already have dust?
  if (state.dust.availableCoins.length > 0) {
    const dustBal = state.dust.balance(new Date());
    console.log(`  ✓ Dust tokens already available (${dustBal.toLocaleString()} DUST)`);
    return;
  }

  // Register unregistered NIGHT UTXOs
  const nightUtxos = state.unshielded.availableCoins.filter(
    (coin) => coin.meta?.registeredForDustGeneration !== true,
  );

  if (nightUtxos.length > 0) {
    await withStatus(`Registering ${nightUtxos.length} NIGHT UTXO(s) for dust generation`, async () => {
      const recipe = await wallet.registerNightUtxosForDustGeneration(
        nightUtxos,
        unshieldedKeystore.getPublicKey(),
        (payload) => unshieldedKeystore.signData(payload),
      );
      const finalized = await wallet.finalizeRecipe(recipe);
      await wallet.submitTransaction(finalized);
    });
  }

  // Wait for dust to actually generate
  await withStatus('Waiting for dust tokens to generate', () =>
    Rx.firstValueFrom(
      wallet.state().pipe(
        Rx.throttleTime(5_000),
        Rx.filter((s) => s.isSynced),
        Rx.filter((s) => s.dust.balance(new Date()) > 0n),
      ),
    ),
  );
}

// ────────────────────────────────────────────────────────────────────
// Main Deployment
// ────────────────────────────────────────────────────────────────────

async function deployProofWorkContract() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║       ProofWork Contract Deployment                 ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');

  // 1. Get or generate wallet seed
  let seed = process.env.WALLET_SEED;
  if (!seed) {
    seed = toHex(Buffer.from(generateRandomSeed()));
    console.log('┌─────────────────────────────────────────────────────┐');
    console.log('│  ⚠  New Wallet Seed — SAVE THIS before continuing  │');
    console.log('├─────────────────────────────────────────────────────┤');
    console.log(`│  ${seed}`);
    console.log('└─────────────────────────────────────────────────────┘');
    console.log('');
  }

  // 2. Build wallet
  const walletCtx = await withStatus('Building wallet', () => buildWallet(seed));

  // Show unshielded address for funding
  const DIV = '──────────────────────────────────────────────────────────────';
  console.log(`\n${DIV}`);
  console.log(`  Unshielded Address (send tNight here):`);
  console.log(`  ${walletCtx.unshieldedKeystore.getBech32Address()}`);
  console.log(`\n  Fund your wallet with tNight from the faucet:`);
  console.log(`  https://faucet.preprod.midnight.network/`);
  console.log(`${DIV}\n`);

  // 3. Wait for sync
  const syncedState = await withStatus('Syncing with network', () =>
    Rx.firstValueFrom(
      walletCtx.wallet.state().pipe(
        Rx.throttleTime(5_000),
        Rx.filter((s) => s.isSynced),
      ),
    ),
  );

  // 4. Check balance
  const balance = syncedState.unshielded.balances[unshieldedToken().raw] ?? 0n;
  console.log(`  Balance: ${balance.toLocaleString()} tNight`);

  if (balance === 0n) {
    console.log('  Waiting for incoming tokens (send tNight to the address above)...');
    const funded = await waitForFunds(walletCtx.wallet);
    console.log(`  ✓ Funded: ${funded.toLocaleString()} tNight\n`);
  }

  // 5. Register for dust generation (needed for tx fees)
  await registerForDustGeneration(walletCtx.wallet, walletCtx.unshieldedKeystore);

  // 6. Configure providers
  const providers = await createProviders(walletCtx);

  return { providers, walletCtx, config };
}

async function main() {
  const { providers, config } = await deployProofWorkContract();

  const deployedContract = await withStatus('Deploying ProofWork contract', () =>
    deployContract(providers, {
      compiledContract: proofworkCompiledContract,
      privateStateId: 'proofworkPrivateState',
      initialPrivateState: {},
    }),
  );

  const contractAddress = deployedContract.deployTxData.public.contractAddress;

  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  ✓ DEPLOYMENT SUCCESSFUL                           ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`  Contract Address: ${contractAddress}`);
  console.log(`  Block Height:     ${deployedContract.deployTxData.public.blockHeight}`);
  console.log(`  TX ID:            ${deployedContract.deployTxData.public.txId}`);
  console.log('');

  // 8. Save contract address
  const deployInfo = {
    contractAddress,
    blockHeight: String(deployedContract.deployTxData.public.blockHeight),
    txId: deployedContract.deployTxData.public.txId,
    deployedAt: new Date().toISOString(),
    network: process.env.NETWORK_ID || 'testnet',
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

// Execute the main deployment flow
main()
  .then((address) => {
    console.log(`\n✓ Done. Contract address: ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Deployment failed:', error);
    process.exit(1);
  });
