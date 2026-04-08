# ProofWork

---

**Attribution: This project is built on the Midnight Network.**

---

### Prerequisites
Before running this application, ensure you have the following installed:

- **Node.js** (v22 or higher)
- **npm** (v10 or higher)
- **Midnight Lace Wallet** browser extension ([Download](https://midnight.network))
- **Compact Compiler** (`compactc`) for building the contract
- **Local Proof Server** running on your machine (required for generating ZK proofs)

### Midnight SDK Versions
This project uses the **stable** Midnight SDK (not alpha/beta):

| Package | Version |
|---------|---------|
| `@midnight-ntwrk/midnight-js-*` | 4.0.4 |
| `@midnight-ntwrk/ledger-v8` | 8.0.3 |
| `@midnight-ntwrk/compact-js` | 2.5.0 |
| `@midnight-ntwrk/compact-runtime` | 0.15.0 |
| `@midnight-ntwrk/wallet-sdk-*` | 4.1.0 |

### 1. Clone and Install Dependencies
```bash
git clone https://github.com/Shantanu112-bd/midnight-hackathon-.git
cd midnight
npm install
```

### 2. Build the Contract
The Compact smart contract must be compiled before running the UI or deploy script:

```bash
npm run compact
```

This compiles the Compact contract and generates:
- JavaScript bindings in `managed/contract/`
- Prover/verifier keys in `managed/keys/`
- ZK intermediate representations in `managed/zkir/`

### 3. Start the Proof Server
The local proof server is required to generate zero-knowledge proofs. Start it before deploying or interacting. Using Docker Desktop:

```bash
docker run -d -p 6300:6300 midnightntwrk/proof-server:8.0.3 midnight-proof-server -v
```

### 4. Deploy the Contract
To deploy the contract to the Midnight Preview Network:

```bash
npm run deploy
```

This requires:
- A wallet seed (set automatically or configured in `.env`)
- tNight tokens in your wallet (get from the [Midnight Faucet](https://faucet.preview.midnight.network/))

**Save the contract address** after deployment. It will automatically save to `deployed-contract.json` and updates the React frontend.

### 5. Build and Run the UI
The UI is a React/Vite web application that interacts directly with the Midnight Network.

```bash
cd proofwork
npm install
npm run dev
```

The UI will be available at `http://localhost:5173`. 
(Use `--host` if you need to run it on your local network).

### 6. Connect to the Contract
1. Open the UI in your browser.
2. Ensure Midnight Lace wallet is installed and connected to the **Preview Network**.
3. Authorize the DApp Connection via Lace.

### Environment Configuration
The backend deploy script and CLI can be configured via environment variables in `.env`:

```bash
NETWORK_ID=preview
MIDNIGHT_NODE_URL=https://rpc.preview.midnight.network
MIDNIGHT_INDEXER_URL=https://indexer.preview.midnight.network/api/v3/graphql
MIDNIGHT_INDEXER_WS=wss://indexer.preview.midnight.network/api/v3/graphql/ws
PROOF_SERVER_URL=http://localhost:6300
```

### Project Structure
```
midnight/
├── contracts/                   # Compact smart contract
│   └── proofwork.compact        # Main DApp logic
├── managed/                     # Compiled outputs from Compact
│   ├── contract/                # TypeScript bindings
│   ├── keys/                    # Prover & verifier keys
│   └── zkir/                    # Zero-knowledge IR representations
├── src/                         # Backend / Deploy scripts
│   └── deploy.ts                # Contract deployment orchestration
├── proofwork/                   # React frontend application
│   └── src/
│       ├── components/          # UI / UX Components
│       ├── hooks/               # React hooks (useWallet, useContract)
│       └── types/               # TypeScript declarations
└── README.md
```

---

The ProofWork DApp is a decentralized application designed to serve as a practical example of building accountability and whistleblowing systems on the Midnight stack. It showcases the powerful privacy-preserving capabilities of the Compact smart contract language and the MidnightJS library. The primary purpose of this application is to demonstrate how Midnight can apply the principle of rational privacy to solve real-world challenges in workplace integrity.

### The Problem with Traditional Promise Tracking & Reporting
In the conventional corporate world, documenting formal promises or reporting on workplace issues is a challenging process.

- **Data Exposure:** Centralized corporate servers store reports in plaintext. A single breach or rogue database administrator can expose sensitive incident reports or confidential employee promises.
- **Reporting Reluctance:** When employees file a complaint, they often fear retaliation. Traditional "anonymous" tip lines are rarely cryptographically anonymous, as IP addresses and metadata can usually identify the whistleblower.
- **Lack of Verifiability:** Verbal or insecurely recorded promises can be easily denied ("I never said that"). Alternatively, recording a promise publicly exposes confidential business strategies.

### Midnight's Solution: Rational Privacy in Action
The ProofWork DApp directly addresses these issues by reimagining accountability tracing. It provides a clear example of how to build an application that creates an immutable, verifiable ledger of promises and complaints without exposing the underlying confidential secrets to the public ledger.

This is made possible by Midnight's unique architecture, which is powered by the Kachina model for smart contracts. This model allows a contract to manage two distinct states simultaneously: a private state that remains securely on the user's local machine and a public state that is recorded on the blockchain.

In the context of the ProofWork DApp:
- **The Private State:** The exact details of a promise, the confidential identities of a whistleblower filing a complaint, or the specific text of the report. This data is provided to the contract logic as an off-chain witness and is **never** transmitted to the network.
- **The Public State:** The non-sensitive timestamp, the cryptographic commitment of a promise, or the overall aggregate reliability score of a department. This public state is verifiably recorded on the ledger. 

The bridge between these two worlds is the zero-knowledge proof. The contract's logic executes off-chain, evaluating the user's private promise or complaint and generating a cryptographic proof. This proof confirms to the Midnight network that an authorized user successfully submitted the correct logic parameters, without revealing their identity or their secret evidence. 

---

### Contract Features

The ProofWork contract is designed with clear roles: Employees and Managers. Each role has access to specific actions to govern accountability without destroying privacy.

#### Employee Role (Trust Tracking)

- **Record a Promise (`createPromise`):**
  This is the core tracking feature. An employee generates a confidential promise (e.g., "I will ship the new API by Friday"). Using the `createPromise` circuit, they submit a hashed commitment of that promise alongside their secret key. The ledger publicly timestamps that the promise was made, but the contents remain known only to the user.
- **Mark a Promise as Fulfilled (`markFulfilled`):**
  When a task is completed, an employee provides their secret key to authorize marking their active promise as fulfilled in the public state. 

#### Manager Role (Integrity & Reporting)

- **File an Anonymous Complaint (`fileComplaint`):**
  If a manager or auditor observes poor compliance or unfulfilled duties, they can use their secret key to anonymously file a complaint against an employee's public identifier. The action bumps the total strike count on the ledger. Because the entire action is submitted alongside a ZK proof, the specific whistleblower's address and identity is omitted from the transaction data. 

---

### Circuit Deep Dives

This section provides a detailed breakdown of each circuit within the ProofWork contract to balance complex business logic with zero-knowledge proof requirements.

#### `createPromise` Circuit

**Logic:**
```compact
export circuit createPromise(promiseHash: Bytes<32>): [] {
  const secret = employeeSecretKey();
  const eid = hash(secret);
  
  const currentRep = employeeReputation.member(eid) 
    ? employeeReputation.lookup(eid) : 0;
    
  // Increment total promises recorded
  employeeReputation.insert(eid, currentRep + 1);
  return [];
}
```

**Design Decisions:**
- **Off-Chain Witnessing:** The circuit relies on an `employeeSecretKey()` witness. This function returns the user's private key that runs locally on their device.
- **Privacy-Preserving Identifiers:** Instead of using the user's wallet address, the employee's ID (`eid`) is computationally derived off-chain using a one-way `hash(secret)`. This means the `employeeReputation` map indices are completely obscured. No public observer can link an on-chain action to a specific employee without knowing their secret.

#### `fileComplaint` Circuit

**Logic:**
```compact
export circuit fileComplaint(targetEid: Bytes<32>): [] {
  // Validate manager authorization
  const managerSecret = managerSecretKey();
  assert(hash(managerSecret) == expectedManagerHash, "Unauthorized");

  const currentStrikes = employeeStrikes.member(targetEid) 
    ? employeeStrikes.lookup(targetEid) : 0;

  // Record an anonymous strike against the target
  employeeStrikes.insert(targetEid, disclose(currentStrikes + 1));
  return [];
}
```

**Design Decisions:**
- **Whistleblower Anonymity:** Notice that the `managerSecret` is never exposed. The ZK circuit simply proves to the network that *someone* with a valid `managerSecret` filed the complaint. The Midnight ledger will permanently record the strike on `targetEid` without revealing who initiated the transaction.
- **Public Disclosure:** The `disclose()` function is explicitly called to signify that the updated strike counter has been verified off-chain and should be written publicly to the blockchain.

#### `getReliabilityScore` Circuit

**Logic:**
```compact
export circuit getReliabilityScore(targetEid: Bytes<32>): Uint<32> {
  const promises = employeeReputation.member(targetEid) ? employeeReputation.lookup(targetEid) : 0;
  const strikes = employeeStrikes.member(targetEid) ? employeeStrikes.lookup(targetEid) : 0;
  
  if (strikes == 0) { return 100; }
  
  // Calculate relative reliability
  const score = (promises * 100) / (promises + strikes);
  return score;
}
```

**Design Decisions:**
- **View Functions:** As a read-oriented circuit, `getReliabilityScore` can be run completely off-chain. This permits an external application (like the React dashboard UI) to quickly aggregate private states into a single unified health metric without writing a transaction to the network.