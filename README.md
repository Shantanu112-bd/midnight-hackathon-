# ProofWork: Workplace Truth, Proven 🛡️

ProofWork is a privacy-first workplace accountability protocol built on the Midnight Network. It completely redesigns how workplace promises (promotions, raises, flexible work) are recorded, verified, and audited by using Zero-Knowledge (ZK) cryptography.

## 🚀 Features

- **The Promise Vault:** Managers can commit to organizational promises cryptographically via transparent Zero-Knowledge circuits. Employees gain an immutable and tamper-proof record of exactly what was agreed upon.
- **Anonymous Reporting:** Whistleblowing and complaint filing are protected entirely by ZK rollups. This proves an employee belongs to the organization (or a specific department) without revealing their personal identity.
- **Smart Workflows:** Powered by Claude/Gemini, transcripts and audio notes are automatically parsed and structured into on-chain `promises`.
- **Manager's Dashboard:** "Trust Scores" aggregated transparently across fulfilled vs broken promises mapped over Midnight Network.

## 🛠 Project Structure

- `api/` - Backend Node.js express server parsing promises using AI.
- `contracts/proofwork.compact` - Smart contract outlining the Promise state transition (creation, fulfillment, and threshold conditions).
- `proofwork/` - High-fidelity React/Vite Frontend using Tailwind CSS. Full SPA structure.

## ⚙️ Quick Start

### 1. Compile the ZK Contract (Compact)
Compile the `proofwork.compact` file using Compact version 0.28:
```bash
npm run compact
```
*(Optionally setup your seed in `.env` and run `npm run deploy` if communicating with a live Midnight Devnet node)*

### 2. Run the Node Backend API
Spin up the backend Express service connecting to our AI extraction layer:
```bash
npm run start
```
The API should now be running cleanly on `http://localhost:3001`.

### 3. Start the Frontend
In a separate terminal, transition into the frontend module to launch the complete React App.
```bash
cd proofwork
npm i
npm run dev
```

(Or, if building for production output):
```bash
npm run build
```
Navigate to `http://localhost:5173` to explore the complete interactive dashboard. Note: The app defaults gracefully into a rich "Demo Mode" fallback if your local Midnight mock node isn't syncing properly, guaranteeing full flow demonstration without friction!

## 🛡 Validated Demo Workflows

1. **Manager Flow:** Visit `/manager` to view the Trust Score widget and track recent commitments vs breakage graphs.
2. **Commitment Flow:** On the homepage, copy a transcript into the 'Extract Promise' input module, test the frontend's built-in simulation load states, and seal the agreement into your Vault.
3. **Whistleblower Flow:** Use the "Submit Anonymously" ZK modal directly from the frontpage. Receive your verified `ZK proof ID` returned explicitly upon transaction commit.