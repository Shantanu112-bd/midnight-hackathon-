# Requirements: Midnight White Belt Project

**Defined:** 2026-04-03
**Core Value:** Mastery of privacy-preserving smart contract development and deployment on the Midnight network.

## v1 Requirements

Requirements for completing White Belt Milestones 1 & 2.

### Environment Setup (SETUP)

- [ ] **SETUP-01**: Install and update **Compact** toolchain to version **0.28.0**.
- [ ] **SETUP-02**: Install and configure the **Lace Midnight Preview** browser wallet.
- [ ] **SETUP-03**: Ensure **Docker Desktop** is installed and running for the Proof Server.
- [ ] **SETUP-04**: Clone and install dependencies for the reference `midnight-local-dev` environment.

### Wallet & Funding (FUND)

- [ ] **FUND-01**: Successfully obtain the development wallet address from Lace.
- [ ] **FUND-02**: Use the `midnight-local` funder tool to deposit development tokens into the Lace wallet.
- [ ] **FUND-03**: Verify the updated balance within the Lace wallet interface.

### Smart Contract Deployment (DEPLOY)

- [ ] **DEPLOY-01**: Compile a `.compact` smart contract using the Compact compiler to generate managed artifacts (ZKIR, TypeScript bindings).
- [ ] **DEPLOY-02**: Configure the deployment script with correct RPC endpoints for the local/preview network.
- [ ] **DEPLOY-03**: Successfully execute the deployment and receive a contract address.

### Frontend Integration (UI)

- [ ] **UI-01**: Establish a connection between the web/CLI frontend and the Midnight SDK (version 3.0.0).
- [ ] **UI-02**: Implement a function to fetch and display the current state of the deployed contract.
- [ ] **UI-03**: Implement a button/action to trigger a private state-changing transaction (e.g., `increment`) and successfully prove/submit it.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Ledger v6 Support | Explicitly unsupported in the latest SDK. |
| Mainnet Deployment | Risk/complexity too high for bootcamp milestones. |
| Multi-Contract Orchestration | Focus on single contract mastery first. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SETUP-01 | Phase 1 | Pending |
| SETUP-02 | Phase 1 | Pending |
| SETUP-03 | Phase 1 | Pending |
| SETUP-04 | Phase 1 | Pending |
| FUND-01 | Phase 1 | Pending |
| FUND-02 | Phase 1 | Pending |
| FUND-03 | Phase 1 | Pending |
| DEPLOY-01 | Phase 2 | Pending |
| DEPLOY-02 | Phase 2 | Pending |
| DEPLOY-03 | Phase 2 | Pending |
| UI-01 | Phase 2 | Pending |
| UI-02 | Phase 2 | Pending |
| UI-03 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-03*
*Last updated: 2026-04-03 after initial definition*
