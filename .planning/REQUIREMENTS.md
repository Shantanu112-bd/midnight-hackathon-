# Requirements: ProofWork Midnight dApp

**Defined:** 2026-04-03
**Core Value:** Secure and private data extraction and verification on-chain using Midnight's ZK-proof system.

## v1 Requirements

### Project Structure (STRUC)

- [ ] **STRUC-01**: Create `/contracts` directory for .compact files.
- [ ] **STRUC-02**: Create `/src` directory for core logic.
- [ ] **STRUC-03**: Create `/api` directory for Express REST API.

### Core Logic (CORE)

- [ ] **CORE-01**: Implement `src/ai-extractor.ts` using Anthropic SDK.
- [ ] **CORE-02**: Implement `src/midnight-client.ts` for blockchain interactions.
- [ ] **CORE-03**: Implement `src/deploy.ts` for contract deployment.

### API (API)

- [ ] **API-01**: Implement `api/server.ts` with Express and CORS.
- [ ] **API-02**: Integrate core logic with the REST endpoints.

### Configuration (CONF)

- [ ] **CONF-01**: Configure `package.json` with Midnight SDK ^3.0.0 and other dependencies.
- [ ] **CONF-02**: Setup `.env.example` with RPC and AI key placeholders.
- [ ] **CONF-03**: Setup `tsconfig.json` for Node.js TypeScript.

## Out of Scope

- **Frontend UI**: Initial focus is on the backend ecosystem.
- **Ledger v6 Support**: Unsupported as per Midnight updates.

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| STRUC-01 | Phase 1 | Pending |
| STRUC-02 | Phase 1 | Pending |
| STRUC-03 | Phase 1 | Pending |
| CONF-01 | Phase 1 | Pending |
| CONF-02 | Phase 1 | Pending |
| CONF-03 | Phase 1 | Pending |
| CORE-01 | Phase 1 | Pending |
| CORE-02 | Phase 1 | Pending |
| CORE-03 | Phase 2 | Pending |
| API-01 | Phase 2 | Pending |
| API-02 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0 ✓

---
*Last updated: 2026-04-03 after ProofWork redefinition*
