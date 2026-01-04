# ObjectExplorer – Folder Structure & Module Responsibilities

This document explains the **complete folder structure** of the ObjectExplorer monorepo and the **responsibility of each directory and key files**. It should be used as a reference while implementing features and when using AI tools (Codex) to generate code.

---

## 1. Repository Root

```
object-explorer/
```

### Responsibility

- Monorepo root
- Shared configuration and tooling
- Entry point for builds, linting, and publishing

### Key Files

- `package.json` – Root scripts, devDependencies
- `pnpm-workspace.yaml` – Declares workspace packages
- `tsconfig.base.json` – Shared TypeScript configuration
- `.eslintrc.cjs` – Global linting rules
- `.prettierrc` – Code formatting rules
- `README.md` – Project overview and usage

---

## 2. apps/

```
apps/
```

### Responsibility

Contains **runnable applications**. Each app can be built, tested, and deployed independently.

---

## 3. apps/explorer-server/

```
apps/explorer-server/
```

### Responsibility

- Main backend server
- npm package entry point
- Hosts API and embedded UI

### Key Files

- `package.json` – Server-specific dependencies
- `tsconfig.json` – Server TS config

---

## 4. apps/explorer-server/src/

```
apps/explorer-server/src/
```

### Responsibility

Core backend source code.

---

## 5. src/index.ts

### Responsibility

- Public export surface
- Re-exports `startObjectExplorer`
- Ensures clean npm API

---

## 6. src/explorer.ts

### Responsibility

- Implements `startObjectExplorer()`
- Validates config
- Creates and starts Fastify server
- Returns server instance

---

## 7. src/server/

```
src/server/
```

### Responsibility

Fastify server composition and lifecycle.

---

## 8. server/createServer.ts

### Responsibility

- Fastify instance factory
- Registers plugins
- Registers routes based on mode (view/admin)
- Central place for server wiring

---

## 9. server/plugins/

```
server/plugins/
```

### Responsibility

Fastify plugins implementing cross-cutting concerns.

#### Files

- `storage.plugin.ts` – Injects StorageProvider
- `auth.plugin.ts` – Admin-mode authentication
- `events.plugin.ts` – EventEmitter setup
- `ui.plugin.ts` – Serves static UI assets

---

## 10. server/routes/

```
server/routes/
```

### Responsibility

HTTP API endpoints grouped by responsibility.

#### Files

- `health.route.ts` – Liveness/readiness checks
- `buckets.read.route.ts` – List buckets
- `objects.read.route.ts` – Browse and download objects
- `objects.mutate.route.ts` – Upload/delete (admin mode only)

---

## 11. server/errors/

```
server/errors/
```

### Responsibility

Centralized error handling.

#### Files

- `error-handler.ts` – Global Fastify error handler
- `error.types.ts` – Custom error definitions

---

## 12. server/types/

```
server/types/
```

### Responsibility

TypeScript module augmentation.

#### Files

- `fastify.d.ts` – Adds `storage` and `events` to FastifyInstance

---

## 13. src/storage/

```
src/storage/
```

### Responsibility

Storage abstraction layer.

---

## 14. storage/StorageProvider.ts

### Responsibility

- Defines the storage contract
- Enforces streaming-based operations
- Storage-agnostic interface

---

## 15. storage/providers/

```
storage/providers/
```

### Responsibility

Concrete storage implementations.

#### Subfolders

- `local/` – Local filesystem provider
- `s3/` – AWS S3 provider (future)

---

## 16. storage/providers/local/

```
storage/providers/local/
```

### Responsibility

Local filesystem-based object storage.

#### Files

- `LocalFilesystemProvider.ts` – Provider implementation
- `path.utils.ts` – Path sanitization and traversal protection

---

## 17. src/events/

```
src/events/
```

### Responsibility

Domain event definitions and typing.

#### Files

- `event.types.ts` – Event payload types
- `index.ts` – Event exports

---

## 18. src/config/

```
src/config/
```

### Responsibility

Configuration typing and validation.

#### Files

- `config.types.ts` – Config interfaces
- `validateConfig.ts` – Runtime validation

---

## 19. src/utils/

```
src/utils/
```

### Responsibility

Shared utility functions.

#### Files

- `streams.ts` – Stream helpers
- `security.ts` – Auth and safety utilities
- `logger.ts` – Logging helpers

---

## 20. apps/explorer-ui/

```
apps/explorer-ui/
```

### Responsibility

Frontend UI application.

- Built using Vite + React
- Outputs static assets
- Embedded into backend server

---

## 21. explorer-ui/src/

```
explorer-ui/src/
```

### Responsibility

UI source code.

#### Subfolders

- `api/` – Backend API client
- `components/` – Reusable UI components
- `pages/` – Page-level components
- `types/` – Shared UI types

---

## 22. packages/

```
packages/
```

### Responsibility

Reusable libraries shared across apps.

---

## 23. packages/shared-types/

```
packages/shared-types/
```

### Responsibility

Shared TypeScript types.

#### Files

- `storage.types.ts`
- `api.types.ts`
- `events.types.ts`

---

## 24. scripts/

```
scripts/
```

### Responsibility

Build and release automation.

#### Files

- `build-ui.ts` – Builds UI
- `copy-ui-assets.ts` – Copies UI into server
- `release.ts` – Publishing workflow

---

## 25. tests/

```
tests/
```

### Responsibility

Automated testing.

#### Subfolders

- `integration/` – API-level tests
- `storage/` – Storage provider tests

---

## 26. Architectural Summary

- Clean separation of concerns
- Secure-by-default backend
- Streaming-first design
- Extensible storage providers
- Scalable to multiple services

This structure is intentionally verbose to **optimize long-term maintainability and evaluator clarity**.
