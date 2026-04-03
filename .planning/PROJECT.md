# ProofWork: Midnight dApp

## What This Is

A privacy-preserving dApp built on the Midnight network that integrates AI extraction capabilities. It features an Express REST API backend, a Midnight client for blockchain interactions, and smart contracts written in Compact.

## Core Value

Secure and private data extraction and verification on-chain using Midnight's ZK-proof system.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] **Infrastructure Setup**: Create `/contracts`, `/src`, and `/api` directories.
- [ ] **Core Logic**: Implement `ai-extractor.ts`, `midnight-client.ts`, and `deploy.ts`.
- [ ] **REST API**: Develop a simple Express API in `/api/server.ts`.
- [ ] **Dependency Management**: Configure `package.json` with Midnight SDK 3.0.0, Anthropic SDK, and TypeScript tools.
- [ ] **Environment Configuration**: Setup `.env.example` with required RPC and API keys.
- [ ] **TypeScript Configuration**: Create a `tsconfig.json` for Node.js development.

### Out of Scope

- **Frontend UI**: Initial focus is on backend, API, and contract logic.
- **Mainnet Deployment**: Development focused on Preview/Local tests.

## Context

- **Midnight SDK**: ^3.0.0 compatible.
- **AI Integration**: Anthropic SDK.
- **Backend Framework**: Express.js with TypeScript.
- **Remote Repo**: `https://github.com/Shantanu112-bd/midnight-hackathon-`

## Constraints

- **Tech Stack**: Compact, Node.js, TypeScript.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| ProofWork Structure | Prescribed structure for API + AI + Midnight integration. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-03 after ProofWork redefinition*

