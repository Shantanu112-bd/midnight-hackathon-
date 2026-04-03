# STACK.md

The standard 2025 stack for building on Midnight network.

## Primary Toolchain

| Tool | Version | Description |
|------|---------|-------------|
| **Compact** | 0.28.0 | Smart contract language for private state. |
| **midnight-js** | 3.0.0 | SDK for interacting with the Midnight network. |
| **wallet-sdk** | 1.0.0 | SDK for Midnight wallet (Lace) integration. |
| **Proof Server** | 7.0.0+ | Proving service for ZK transactions. |

## Development Environment

- **Node.js Runtime**: Bun (v1.0+), NPM, or Yarn.
- **Containerization**: Docker Desktop (required for Proof Server 8.0.3/7.0.0).
- **Wallet**: Lace Midnight Preview (v6.0+ recommended, **No Ledger v6 support**).
- **Network**: Local Development Node (using `midnight-local-dev`).

## Recommended UI Stack

- **Framework**: React.js or Next.js (App Router recommended).
- **Styling**: Tailwind CSS or Vanilla CSS for fast prototyping.
- **Language**: TypeScript (required for SDK compatibility).

---
*Last updated: 2026-04-03*
