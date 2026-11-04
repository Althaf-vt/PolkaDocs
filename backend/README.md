# PolkaDocs Backend

NestJS backend application for PolkaDocs, built with Clean Architecture.

## Documentation

Full architectural specifications, folder conventions, and engineering rules are located in the `docs/` directory at the project root:

- [Project Documentation (V1)](../docs/PolkaDocs-documentation-v1.md) — Architecture, layers, database schema, API design, and configuration.
- [Module List (V1)](../docs/PolkaDocs-module-list-v1.md) — Functional modules and implementation scope.

## Getting Started

### Environment Configuration

Copy `.env.example` to `.env` or inject configuration via Doppler:

```bash
cp .env.example .env
```

### Scripts

- `npm run build` — Compile TypeScript
- `npm run start:dev` — Start development server with file watch
- `npm run test` — Run unit tests
- `npm run test:e2e` — Run end-to-end tests
