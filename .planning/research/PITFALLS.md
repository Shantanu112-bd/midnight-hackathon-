# PITFALLS.md

Common mistakes and gotchas when developing on the new Midnight SDK.

## Critical Issues

- **Ledger v6 Support**: **Warning**: Ledger v6 is no longer supported. Attempting to use it will result in connection failures.
- **Docker Requirement**: The Proof Server *must* be running via Docker on port 6300 before any transactions can be successfully proven.
- **PATH Issues**: The `compact` installer automatically updates the PATH, but a terminal restart or manual `source ~/.zshrc` is required.
- **Compiler Mismatch**: Ensure the generated files in `managed/` match the `compact` version used (0.28.0). Use `compact update` to stay current.

## SDK Gotchas

- **Async Proving**: Generating ZK proofs can take several seconds. Ensure the UI provides adequate feedback (loading states).
- **Wallet Connection**: Lace wallet must be in the correct mode (Preview/Local) to interact with development nodes.

---
*Last updated: 2026-04-03*
