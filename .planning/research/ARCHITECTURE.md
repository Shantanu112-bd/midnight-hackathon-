# ARCHITECTURE.md

Midnight Application Architecture Pattern (based on `example-zkloan`).

## High-Level Structure

```
├── contract/            # Smart contract logic
│   ├── src/             # .compact source files
│   └── managed/         # Generated bindings, keys, and ZKIR
├── frontend/            # React/CLI application
│   ├── src/api.ts       # SDK interaction layer
│   └── src/index.ts     # Main entry point
└── docker/              # Proof Server configuration
```

## Data Flow

1. **Contract Compilation**: `compact` compiles `.compact` files into ZKIR and TypeScript bindings.
2. **Proving**: When a user initiates a `callTx`, the `midnight-js` SDK sends the witness data to the **Proof Server**.
3. **Transaction Submission**: The generated proof and public inputs are submitted to the **Midnight Node**.
4. **State Indexing**: The **Indexer** monitors the chain and provides state updates to the frontend.

## Integration Layer

The `midnight-js` SDK acts as the bridge between the frontend and the proving/transaction services. Configuration usually involves setting the RPC endpoints for the Node, Indexer, and Proof Server.

---
*Last updated: 2026-04-03*
