# AGENTS.md

Guidance for human and AI contributors working in this repository.

## 1. Purpose

Paperclip is a control plane for AI-agent companies.
The current implementation target is V1 and is defined in `doc/SPEC-implementation.md`.

## 2. Read This First

Before making changes, read in this order:

1. `doc/GOAL.md`
2. `doc/PRODUCT.md`
3. `doc/SPEC-implementation.md`
4. `doc/DEVELOPING.md`
5. `doc/DATABASE.md`

`doc/SPEC.md` is long-horizon product context.
`doc/SPEC-implementation.md` is the concrete V1 build contract.

## 3. Repo Map

- `server/`: Express REST API and orchestration services
- `ui/`: React + Vite board UI
- `packages/db/`: Drizzle schema, migrations, DB clients
- `packages/shared/`: shared types, constants, validators, API path constants
- `packages/adapters/`: agent adapter implementations (Claude, Codex, Cursor, etc.)
- `packages/adapter-utils/`: shared adapter utilities
- `packages/plugins/`: plugin system packages
- `doc/`: operational and product docs

## 4. Dev Setup (Auto DB)

Use embedded PGlite in dev by leaving `DATABASE_URL` unset.

```sh
pnpm install
pnpm dev
```

This starts:

- API: `http://localhost:3100`
- UI: `http://localhost:3100` (served by API server in dev middleware mode)

Quick checks:

```sh
curl http://localhost:3100/api/health
curl http://localhost:3100/api/companies
```

Reset local dev DB:

```sh
rm -rf data/pglite
pnpm dev
```

## 5. Core Engineering Rules

1. **Keep changes company-scoped.**
   Every domain entity should be scoped to a company and company boundaries must be enforced in routes/services.

2. **Keep contracts synchronized.**
   If you change schema/API behavior, update all impacted layers:
   - `packages/db` schema and exports
   - `packages/shared` types/constants/validators
   - `server` routes/services
   - `ui` API clients and pages

3. **Preserve control-plane invariants.**
   - Single-assignee task model
   - Atomic issue checkout semantics
   - Approval gates for governed actions
   - Budget hard-stop auto-pause behavior
   - Activity logging for mutating actions

4. **Do not replace strategic docs wholesale unless asked.**
   Prefer additive updates. Keep `doc/SPEC.md` and `doc/SPEC-implementation.md` aligned.

5. **Keep plan docs dated and centralized.**
   New plan documents belong in `doc/plans/` and should use `YYYY-MM-DD-slug.md` filenames.

## 6. Database Change Workflow

When changing data model:

1. Edit `packages/db/src/schema/*.ts`
2. Ensure new tables are exported from `packages/db/src/schema/index.ts`
3. Generate migration:

```sh
pnpm db:generate
```

4. Validate compile:

```sh
pnpm -r typecheck
```

Notes:
- `packages/db/drizzle.config.ts` reads compiled schema from `dist/schema/*.js`
- `pnpm db:generate` compiles `packages/db` first

## 7. Commands Reference

### Build & Typecheck

```sh
pnpm build              # Build all packages
pnpm -r typecheck       # Type-check all packages
pnpm typecheck          # Type-check root only
```

### Testing

```sh
pnpm test:run           # Run all tests (non-watch mode)
pnpm test                # Run tests in watch mode

# Single test file (from root)
pnpm test -- src/__tests__/my-file.test.ts
npx vitest run src/__tests__/my-file.test.ts

# Single test in package
cd packages/my-package
npx vitest run src/__tests__/my-file.test.ts

# E2E tests
pnpm test:e2e           # Headless
pnpm test:e2e:headed     # Browser visible
```

### Database

```sh
pnpm db:generate         # Generate migration from schema changes
pnpm db:migrate          # Apply migrations
```

### Development

```sh
pnpm dev                 # Full dev (API + UI, watch mode)
pnpm dev:once            # Full dev without file watching
pnpm dev:server          # Server only
pnpm dev:ui              # UI only
```

## 8. Code Style Guidelines

### TypeScript

- **Use explicit types** for function parameters and return values
- **Avoid `any`** — use `unknown` when type is truly unknown
- **Prefer interfaces** over type aliases for object shapes
- **Use `readonly`** for immutable arrays/objects
- **Use optional chaining** (`?.`) and nullish coalescing (`??`) instead of manual null checks

### Imports

```typescript
// Local imports — relative paths
import { something } from './something';
import { something } from '../utils/something';

// Package imports — bare specifiers
import { something } from '@paperclipai/shared';
import { something } from 'drizzle-orm';

// Type-only imports
import type { SomeType } from './types';
```

### Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Files | kebab-case | `my-file.ts`, `my-util.ts` |
| Classes | PascalCase | `MyService`, `UserRepository` |
| Functions | camelCase | `createUser()`, `getCompanyById()` |
| Constants | SCREAMING_SNAKE | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| Types/Interfaces | PascalCase | `UserProps`, `CreateCompanyDto` |
| Enums | PascalCase (members too) | `IssueStatus.Open` |

### Error Handling

```typescript
// Always handle errors explicitly — never swallow
try {
  await doSomething();
} catch (error) {
  // Either handle or re-throw with context
  throw new AppError('Failed to do something', { cause: error });
}

// For expected errors, use result types or specific error classes
```

### Async/Await

- **Always use `async/await`** over raw Promises
- **Never forget `await`** — check every async call
- **Handle promise rejections** with try/catch at boundary layers

### Null Handling

```typescript
// Prefer optional chaining
const name = user?.profile?.name ?? 'Anonymous';

// Avoid manual null checks
if (user !== null && user !== undefined) { ... } // ❌
if (user) { ... }                                   // ✅ (when null/undefined are equivalent)
```

## 9. API and Auth Expectations

- Base path: `/api`
- Board access is treated as full-control operator context
- Agent access uses bearer API keys (`agent_api_keys`), hashed at rest
- Agent keys must not access other companies

When adding endpoints:

- apply company access checks
- enforce actor permissions (board vs agent)
- write activity log entries for mutations
- return consistent HTTP errors (`400/401/403/404/409/422/500`)

## 10. UI Expectations

- Keep routes and nav aligned with available API surface
- Use company selection context for company-scoped pages
- Surface failures clearly; do not silently ignore API errors

## 11. Definition of Done

A change is done when all are true:

1. Behavior matches `doc/SPEC-implementation.md`
2. Typecheck, tests, and build pass
3. Contracts are synced across db/shared/server/ui
4. Docs updated when behavior or commands change
