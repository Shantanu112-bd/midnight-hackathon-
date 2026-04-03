# Midnight White Belt Project

## What This Is

A developer-focused project aimed at mastering the Midnight network through the White Belt Bootcamp milestones. The project involves setting up a local Midnight development environment, creating and deploying privacy-preserving smart contracts using Compact, and integrating them with a frontend.

## Core Value

Mastery of privacy-preserving smart contract development and deployment on the Midnight network.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] **Environment Setup**: Install Midnight and run the local development environment.
- [ ] **Wallet Configuration**: Setup the Lace Midnight Preview wallet and obtain a development address.
- [ ] **Tooling Installation**: Install and update the Compact compiler to version 0.28.0.
- [ ] **Smart Contract Deployment**: Configure the deploy script and successfully deploy a smart contract to the local/preview network.
- [ ] **Wallet Funding**: Fund the development wallet using the `midnight-local` repository tools.
- [ ] **Frontend Integration**: Orchestrate the connection between the deployed smart contract and a user interface.

### Out of Scope

- **Ledger v6 Support**: Explicitly unsupported in the current Midnight SDK/tooling.
- **Production Mainnet Deployment**: Focus is on development and bootcamp milestones (Preview/Local).

## Context

- **Midnight Ecosystem**: A privacy-preserving blockchain platform utilizing Zero-Knowledge Proofs (ZKPs).
- **Core Dependencies**: 
    - `midnight-js`: 3.0.0
    - `wallet-sdk`: 1.0.0
    - `Compact`: 0.28.0
    - `Proof Server`: 7.0.0
- **Reference Project**: `example-zkloan` for structure and development patterns.
- **Remote Repo**: `https://github.com/Shantanu112-bd/midnight-hackathon-` for version control.

## Constraints

- **Technology**: Must utilize Compact for smart contracts and the latest Midnight SDKs.
- **Compatibility**: Ensure all tools match the "Important Midnight Updates" (SDK 3.0.0, etc.).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use `example-zkloan` structure | Recommended as a reference for robust Midnight applications. | — Pending |
| GSD Coarse Granularity | Sufficient for bootcamp milestones without over-complicating the roadmap. | — Pending |

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
*Last updated: 2026-04-03 after initial setup*
