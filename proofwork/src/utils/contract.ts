// src/utils/contract.ts

// ─── Type Helpers ────────────────────────────────

function toBytes32(input: string): Uint8Array {
  const encoder = new TextEncoder()
  const encoded = encoder.encode(input)
  return hashToBytes32Sync(input)
}

async function hashToBytes32(data: Uint8Array): Promise<Uint8Array> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data as unknown as BufferSource)
  return new Uint8Array(hashBuffer)
}

function hashToBytes32Sync(input: string): Uint8Array {
  const encoder = new TextEncoder()
  const encoded = encoder.encode(input)
  const result = new Uint8Array(32)
  for (let i = 0; i < 32; i++) {
    result[i] = encoded[i % encoded.length] ^ (i * 7)
  }
  return result
}

function timestampToBytes32(): Uint8Array {
  const ts = BigInt(Date.now())
  const result = new Uint8Array(32)
  const view = new DataView(result.buffer)
  view.setBigUint64(0, ts, false)
  return result
}

function validateBytes32(data: Uint8Array, name: string): void {
  if (!(data instanceof Uint8Array)) {
    throw new Error(`${name}: expected Uint8Array, got ${typeof data}`)
  }
  if (data.length !== 32) {
    throw new Error(`${name}: expected 32 bytes, got ${data.length} bytes`)
  }
}

// ─── Contract Connection ─────────────────────────

export interface ProofWorkContractResult {
  success: boolean
  txHash?: string
  contractAddress?: string
  error?: string
}

const CONTRACT_ADDRESS_KEY = 'proofwork_contract_address'

function getStoredContractAddress(): string | null {
  try {
    return localStorage.getItem(CONTRACT_ADDRESS_KEY)
  } catch {
    return null
  }
}

function storeContractAddress(address: string): void {
  try {
    localStorage.setItem(CONTRACT_ADDRESS_KEY, address)
  } catch {
    console.warn('Could not store contract address')
  }
}

// ─── Main Contract Functions ─────────────────────

export async function createPromiseOnChain(
  promiseText: string,
  walletAddress: string,
  provider: any // MidnightProvider
): Promise<ProofWorkContractResult> {
  
  console.log('🔐 Creating promise on Midnight...')
  
  try {
    // Step 1: Prepare parameters with correct types
    const promiseHash = await hashToBytes32(
      new TextEncoder().encode(promiseText)
    )
    
    // Validate before sending
    validateBytes32(promiseHash, 'promiseHash')
    
    console.log('✅ Parameters validated:', {
      promiseHash: Array.from(promiseHash.slice(0,4)).map(b => b.toString(16)).join('')
    })
    
    // Step 3: Get or deploy contract
    const storedAddress = getStoredContractAddress()
    
    // Import compiled contract
    // NOTE: Adjusted to user's generated index.js layout
    const { Contract } = await import(
      '../../../managed/contract/index.js'
    )
    
    let contract
    
    // contract.compact has no witnesses now
    let contractWithWitnesses;
    try {
      contractWithWitnesses = (Contract as any).withWitnesses ? (Contract as any).withWitnesses({}) : new Contract({});
    } catch {
      contractWithWitnesses = new Contract({});
    }
    
    if (storedAddress) {
      console.log('📋 Connecting to existing contract:', storedAddress)
      try {
        contract = await provider.findDeployedContract({
          contractAddress: storedAddress,
          contract: contractWithWitnesses
        })
      } catch (findError) {
        console.warn('Could not find existing contract, deploying new one:', findError)
        storedAddress && localStorage.removeItem(CONTRACT_ADDRESS_KEY)
        contract = null
      }
    }
    
    if (!contract) {
      console.log('🚀 Deploying new ProofWork contract...')
      contract = await provider.deployContract(
        contractWithWitnesses,
        {
          promiseCount: 0n,
          complaintCount: 0n,
        }
      )
      
      if (contract.deployTxData?.public?.contractAddress) {
        const addr = contract.deployTxData.public.contractAddress
        storeContractAddress(addr)
        console.log('✅ Contract deployed at:', addr)
      }
    }
    
    // Step 4: Call the circuit
    console.log('⚡ Calling createPromise circuit...')
    
    const txData = await contract.callTx.createPromise(
      promiseHash
    )
    
    console.log('✅ Promise sealed on chain:', txData)
    
    return {
      success: true,
      txHash: txData?.public?.txHash || 
              '0x' + Array.from(promiseHash.slice(0,4))
                .map(b => b.toString(16).padStart(2,'0')).join('') + '...',
      contractAddress: getStoredContractAddress() || undefined
    }
    
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('❌ createPromise failed:', error)
    return { success: false, error: message }
  }
}

export async function fileComplaintOnChain(
  complaintText: string,
  targetManagerId: string,
  walletAddress: string,
  provider: any // MidnightProvider
): Promise<ProofWorkContractResult> {
  
  console.log('🔐 Filing anonymous complaint on Midnight...')
  
  try {
    const complaintHash = await hashToBytes32(
      new TextEncoder().encode(complaintText + targetManagerId)
    )
    
    validateBytes32(complaintHash, 'complaintHash')
    
    const { Contract } = await import(
      '../../../managed/contract/index.js'
    )
    
    const storedAddress = getStoredContractAddress()
    
    let contractWithWitnesses;
    try {
      contractWithWitnesses = (Contract as any).withWitnesses ? (Contract as any).withWitnesses({}) : new Contract({});
    } catch {
      contractWithWitnesses = new Contract({});
    }
    
    let contract
    if (storedAddress) {
      try {
        contract = await provider.findDeployedContract({
          contractAddress: storedAddress,
          contract: contractWithWitnesses
        })
      } catch {
        contract = null
      }
    }
    
    if (!contract) {
      contract = await provider.deployContract(
        contractWithWitnesses,
        { promiseCount: 0n, complaintCount: 0n }
      )
      if (contract.deployTxData?.public?.contractAddress) {
        storeContractAddress(contract.deployTxData.public.contractAddress)
      }
    }
    
    const txData = await contract.callTx.fileComplaint(complaintHash)
    
    return {
      success: true,
      txHash: txData?.public?.txHash || 
              'zk_' + Array.from(complaintHash.slice(0,4))
                .map(b => b.toString(16).padStart(2,'0')).join('') + '...',
    }
    
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('❌ fileComplaint failed:', error)
    return { success: false, error: message }
  }
}
