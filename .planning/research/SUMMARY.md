# Research Summary: Midnight White Belt Project

A synthesis of the Midnight ecosystem for the 2025 SDK update (v3.0.0).

## Key Findings

1.  **Tooling Versions**: We MUST use **Compact 0.28.0** and **midnight-js 3.0.0**. The **Proof Server** should be version **7.0.0+**.
2.  **Environment Needs**: Docker is a hard dependency for generating ZK proofs locally. Lace wallet must be in Preview mode.
3.  **No Ledger v6**: One of the most critical updates is the lack of support for Ledger v6.
4.  **Reference Pattern**: The project should follow the `example-zkloan` structure: a `contract/` directory for Compact source and a `frontend/` (or `cli/`) for client interactions.

## Actionable Strategy

- **Phase 1 (Setup)**: Focus on toolchain installation (`compact`, `docker`) and wallet setup.
- **Phase 2 (Hello World)**: Deploy a basic contract to ensure the full flow (Compiling -> Proving -> Submitting -> Indexing) works.
- **Phase 3 (Bootcamp Integration)**: Map the Milestone 1 & 2 requirements specifically to this structure.

## Confidence Level: High

The tools and versions have been verified against the user's "Important Midnight Updates" and the latest official documentation.

---
*Last updated: 2026-04-03*
