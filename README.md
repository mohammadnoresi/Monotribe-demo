# MonoTribe Research Prototype

This repository contains the disposable MonoTribe research prototype.

The prototype exists to communicate the MonoTribe concept, support concept validation, and help run early user interviews with realistic but fictional scenarios.

Important boundaries:

- Most product data and behavior will be static or fictional.
- This is not production architecture.
- This repository should not be treated as the foundation of the future production application.
- If the concept is validated, the production MonoTribe application may be designed and rebuilt separately from scratch.

## Technology

- React
- Vite
- TypeScript

No backend, database, authentication, analytics, payment, or production deployment infrastructure is included.

## Development

Install dependencies:

```bash
pnpm install
```

Run the local development server:

```bash
pnpm run dev
```

Validate the project:

```bash
pnpm run typecheck
pnpm run build
git diff --check
```

## Prototype Data

The fake community data foundation lives in `src/data/community/`. It defines the primary demo user, fictional members, graph relationships, reusable interview scenarios, avatar assignments, and graph-ready selectors for future prototype screens.

See `docs/prototype-data.md` for the data purpose, relationship semantics, and the planned Excel workbook schema.
