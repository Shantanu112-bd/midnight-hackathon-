import {
  type ContractProviders,
  deployContract,
  findDeployedContract,
} from '@midnight-ntwrk/midnight-js-contracts'
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id'
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider'
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider'
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider'
import type { DAppConnectorAPI, DAppConnectorWalletAPI } from '@midnight-ntwrk/dapp-connector-api'

// ─── Config ──────────────────────────────────────

export const NETWORK_CONFIG = {
  networkId: 'testnet' as const,
  nodeUrl: 'https://rpc.preprod.midnight.network',
  indexerUrl: 'https://indexer.preprod.midnight.network/api/v4/graphql',
  indexerWsUrl: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
  proofServerUrl: 'http://localhost:6300',
}

// Global initialization
setNetworkId(NETWORK_CONFIG.networkId)

// ─── Types & Declarations ─────────────────────────

declare global {
  interface Window {
    midnight?: {
       [key: string]: DAppConnectorAPI
    }
  }
}

// ─── Wait for Lace ───────────────────────────────

export async function waitForLace(
  timeoutMs = 5000
): Promise<DAppConnectorAPI | null> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const lace = window.midnight?.mnLace ?? (window as any).cardano?.lace ?? (window as any).lace
    if (lace) {
      return lace
    }
    await new Promise(r => setTimeout(r, 200))
  }
  return null
}

// ─── Provider Construction ────────────────────────

export interface ProofWorkProvider extends ContractProviders {
  address: string
  coinPublicKey: string
  rawApi: DAppConnectorWalletAPI // Added back for compatibility
}

export async function connectAndGetProvider(): Promise<ProofWorkProvider> {
  const lace = await waitForLace(8000)
  if (!lace) {
    throw new Error('Lace not found. Install from Chrome Web Store.')
  }

  console.log('📡 Requesting wallet ENABLE...')

  // Try enable with longer timeout and retry
  let connectorAPI: any = null
  let lastError: any = null

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`🔄 Connection attempt ${attempt}/3...`)
      
      // Race between enable() and a longer timeout
      connectorAPI = await Promise.race([
        lace.enable(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error(`Attempt ${attempt} timed out`)),
            30000  // 30 seconds per attempt
          )
        )
      ])
      
      console.log('✅ Lace enabled!')
      break
    } catch (err) {
      lastError = err
      console.warn(`Attempt ${attempt} failed:`, err)
      
      if (attempt < 3) {
        console.log('Waiting 2s before retry...')
        await new Promise(r => setTimeout(r, 2000))
      }
    }
  }

  if (!connectorAPI) {
    throw new Error(
      'Lace connection failed after 3 attempts: ' + String(lastError) +
      '\nTry: Click Lace extension icon → approve the connection manually'
    )
  }

  console.log('📡 Fetching wallet state...')
  const state = await connectorAPI.state()
  console.log('📡 Wallet state received:', { address: state.address })
  
  const zkConfigProvider = new FetchZkConfigProvider(
    window.location.origin + '/keys',
    fetch.bind(window)
  )

  const providers: ContractProviders = {
    privateStateProvider: {
      setContractAddress: () => {},
      set: async () => {},
      get: async () => null,
      remove: async () => {},
      clear: async () => {},
      setSigningKey: async () => {},
      getSigningKey: async () => null,
      removeSigningKey: async () => {},
      clearSigningKeys: async () => {},
      exportPrivateStates: async () => ({}) as any,
      importPrivateStates: async () => ({}) as any,
      exportSigningKeys: async () => ({}) as any,
      importSigningKeys: async () => ({}) as any,
    } as any,
    publicDataProvider: indexerPublicDataProvider(
      NETWORK_CONFIG.indexerUrl,
      NETWORK_CONFIG.indexerWsUrl
    ),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(
      NETWORK_CONFIG.proofServerUrl,
      zkConfigProvider
    ),
    walletProvider: {
      async balanceTx(tx: any) {
        return await connectorAPI.balanceAndProveTransaction(tx, [])
      }
    } as any,
    midnightProvider: {
      async submitTx(tx: any) {
        return await connectorAPI.submitTransaction(tx)
      }
    } as any,
  }

  return {
    ...providers,
    address: state.address,
    coinPublicKey: state.coinPublicKey,
    rawApi: connectorAPI
  }
}

// ─── Contract Helpers ─────────────────────────────

export async function loadProofWorkContract() {
  const mod = await import('../../managed/contract/index.js')
  const Contract = mod.Contract || mod.default
  if (!Contract) {
    throw new Error('Contract class not found in generated module')
  }
  return Contract
}

export async function deployOrFindContract(
  providers: ContractProviders,
  Contract: any
) {
  const storedAddress = localStorage.getItem('proofwork_contract_address')
  
  let contractInstance: any
  try {
    contractInstance = new Contract({})
  } catch (e) {
    contractInstance = Contract
  }

  if (storedAddress) {
    try {
      console.log('🔍 Checking for existing contract at:', storedAddress)
      return await findDeployedContract(providers, {
        contractAddress: storedAddress,
        compiledContract: Contract as any
      } as any)
    } catch (e) {
      console.warn('Existing contract not found or incompatible:', e)
      localStorage.removeItem('proofwork_contract_address')
    }
  }

  console.log('🚀 Deploying new contract...')
  const deployed = await deployContract(providers, {
    compiledContract: Contract as any,
    initialPrivateState: {},
    privateStateId: 'proofwork_private_state'
  } as any)
  
  const newAddr = deployed.deployTxData.public.contractAddress
  if (newAddr) {
    localStorage.setItem('proofwork_contract_address', newAddr)
  }
  
  return deployed
}

export async function textToBytes32(text: string): Promise<Uint8Array> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return new Uint8Array(hash)
}
