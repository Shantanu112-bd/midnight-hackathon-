# Roadmap: Midnight White Belt Project

## Overview

A structured journey to master Midnight's privacy-preserving smart contract development. We begin by setting up the core toolchain (Compact, Docker), move to wallet configuration and funding on the local development network, and conclude by deploying a smart contract and integrating it with a client application.

## Phases

- [ ] **Phase 1: Toolchain & Infrastructure** - Install Compact 0.28.0 and setup the local Midnight node environment.
- [ ] **Phase 2: Wallet & Token Acquisition** - Configure Lace Midnight Preview and fund the wallet using the local faucet.
- [ ] **Phase 3: Deployment & Client Integration** - Compile/Deploy a contract and establish a connection with the Midnight SDK v3.0.0.

## Phase Details

### Phase 1: Toolchain & Infrastructure
**Goal**: Establish a functional development environment for Midnight and Compact.
**Depends on**: Nothing
**Requirements**: SETUP-01, SETUP-03, SETUP-04
**Success Criteria**:
  1. `compact --version` returns 0.28.0.
  2. Docker is running the Proof Server on port 6300.
  3. Local node/indexer services are successfully started.
**Plans**: 2 plans

Plans:
- [ ] 01-01: Install Compact and update shell PATH.
- [ ] 01-02: Setup Docker-based infrastructure (Proof Server and Local Dev Node).

### Phase 2: Wallet & Token Acquisition
**Goal**: Initialize the user's development wallet and secure testing funds.
**Depends on**: Phase 1
**Requirements**: SETUP-02, FUND-01, FUND-02, FUND-03
**Success Criteria**:
  1. Lace Midnight Preview wallet is installed and in the correct network mode.
  2. Wallet has a non-zero balance of development tokens.
**Plans**: 1 plan

Plans:
- [ ] 02-01: Lace wallet setup and funding via `midnight-local`.

### Phase 3: Deployment & Client Integration
**Goal**: Deploy the privacy-preserving logic and interact with it from a client application.
**Depends on**: Phase 2
**Requirements**: DEPLOY-01, DEPLOY-02, DEPLOY-03, UI-01, UI-02, UI-03
**Success Criteria**:
  1. Contract is compiled to managed artifacts.
  2. Deployment script completes with a valid contract address.
  3. Frontend triggers and proves a private transaction.
**Plans**: 2 plans

Plans:
- [ ] 03-01: Smart contract compilation and deployment flow.
- [ ] 03-02: SDK integration and frontend transaction orchestration.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Toolchain & Infrastructure | 0/2 | Not started | - |
| 2. Wallet & Token Acquisition | 0/1 | Not started | - |
| 3. Deployment & Client Integration | 0/2 | Not started | - |

---
*Roadmap defined: 2026-04-03*
*Last updated: 2026-04-03 after initial initialization*
