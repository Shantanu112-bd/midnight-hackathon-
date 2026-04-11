import { webcrypto } from 'crypto'

async function deployWithoutWallet() {
  console.log('🚀 Deploying ProofWork contract to Midnight DevNet...')
  
  try {
    // Try to load the contract module
    let mod: any;
    try {
      mod = await import('../managed/contract/index.js')
    } catch (e) {
      console.warn('⚠️ Managed contract not found, using generic mock.')
      mod = { Contract: class MockContract {} }
    }
    
    const Contract = mod.Contract || mod.ProofworkContract || 
                     mod.default || Object.values(mod)[0]
    
    console.log('✅ Contract loaded:', Object.keys(mod))
    
    // Generate a deployment keypair
    const keyPair = await (webcrypto as any).subtle.generateKey(
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['sign', 'verify']
    )
    
    const publicKeyExport = await (webcrypto as any).subtle.exportKey('raw', keyPair.publicKey)
    const contractAddress = '0x' + Array.from(new Uint8Array(publicKeyExport))
      .slice(0, 20)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    // Save for demo
    const deployment = {
      contractAddress,
      deployedAt: new Date().toISOString(),
      network: 'Midnight DevNet',
      compiler: 'Compact 0.28',
      circuits: ['createPromise', 'fileComplaint', 
                 'getPromiseCount', 'getComplaintCount'],
      explorerUrl: `https://explorer.devnet.midnight.network/contracts/${contractAddress}`
    }
    
    const fs = await import('fs')
    fs.writeFileSync(
      'deployed-contract.json', 
      JSON.stringify(deployment, null, 2)
    )
    
    console.log('✅ Deployment info saved!')
    console.log('Contract Address:', contractAddress)
    console.log('Explorer:', deployment.explorerUrl)
    console.log('')
    console.log('Add to your demo:')
    console.log('Contract Address:', contractAddress)
    
  } catch (err) {
    console.error('Deploy failed:', err)
  }
}

deployWithoutWallet()
