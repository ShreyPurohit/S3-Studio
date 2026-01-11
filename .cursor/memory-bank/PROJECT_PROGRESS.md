# ObjectExplorer – Project Progress Tracker

This document tracks all development tasks, organized by category. Use checkboxes to mark completion status.

---

## 1. Core Infrastructure & Setup

### Monorepo & Tooling

- [x] Set up pnpm workspace configuration
- [x] Configure TypeScript with strict mode
- [x] Set up project structure (apps/explorer-server, apps/explorer-ui)
- [ ] Add ESLint configuration
- [ ] Add Prettier configuration
- [ ] Set up shared TypeScript base config (tsconfig.base.json)

### Package Configuration

- [x] Root package.json with workspace setup
- [x] explorer-server package.json
- [x] explorer-ui package.json
- [ ] Configure package build scripts
- [ ] Set up UI build and embedding scripts

---

## 2. Backend Core

### Entry Point & Public API

- [x] Implement `startObjectExplorer()` function
- [x] Create public API entry point (`src/index.ts`)
- [x] Define `ObjectExplorerConfig` interface
- [x] Create dev entry point (`src/dev.ts`)
- [ ] Add configuration validation (`config/validateConfig.ts`)
- [ ] Create config types module (`config/config.types.ts`)

### Server Factory

- [x] Implement `createServer()` factory function
- [x] Set up Fastify instance with logger
- [x] Implement mode-based plugin registration (view/admin)
- [ ] Add centralized error handler (`server/errors/error-handler.ts`)
- [ ] Create custom error types (`server/errors/error.types.ts`)
- [ ] Implement proper error normalization

---

## 3. Plugin System

### Storage Plugin

- [x] Implement storage plugin (`server/plugins/storage.plugin.ts`)
- [x] Inject StorageProvider into Fastify instance
- [x] Support local provider initialization
- [x] Add TypeScript module augmentation for `fastify.storage`

### Events Plugin

- [x] Implement events plugin (`server/plugins/events.plugin.ts`)
- [x] Inject EventEmitter into Fastify instance
- [x] Add TypeScript module augmentation for `fastify.events`
- [ ] Integrate event emission in mutating operations

### Auth Plugin

- [x] Implement auth plugin (`server/plugins/auth.plugin.ts`)
- [x] Add token-based authentication for admin mode
- [x] Enforce authentication globally in admin mode
- [ ] Add audit logging for authenticated actions

### UI Plugin

- [x] Implement UI plugin (`server/plugins/ui.plugin.ts`)
- [ ] Serve static UI assets (currently placeholder)
- [ ] Embed built UI into server package
- [ ] Configure UI to detect mode (view/admin)

---

## 4. Storage Provider Abstraction

### StorageProvider Interface

- [x] Define `StorageProvider` interface
- [x] Define `ObjectMetadata` interface
- [x] Ensure stream-based operations
- [x] Ensure AsyncIterable for listings

### LocalFilesystemProvider

- [x] Implement `LocalFilesystemProvider` class
- [x] Implement `listBuckets()` with AsyncIterable
- [x] Implement `createBucket()`
- [x] Implement `deleteBucket()`
- [x] Implement `listObjects()` with AsyncIterable
- [x] Implement `headObject()`
- [x] Implement `getObjectStream()` with streaming
- [x] Implement `putObjectStream()` with streaming
- [ ] **CRITICAL: Add path traversal protection**
    - [ ] Validate all paths stay within root directory
    - [ ] Sanitize bucket names, keys, and prefixes
    - [ ] Prevent `..` and symlink escapes
    - [ ] Filter hidden/system files
- [ ] Use `pipeline()` instead of `pipe()` for uploads (requirement 16.3)
- [ ] Add proper error handling for all operations
- [ ] Create path utilities module (`path.utils.ts`)

### Future Providers

- [ ] S3StorageProvider (future)
- [ ] MinIO provider (optional, future)

---

## 5. API Routes

### Read-Only Routes (Always Available)

- [x] `GET /api/health` - Health check endpoint
- [x] `GET /api/buckets` - List all buckets
- [x] `GET /api/objects` - List objects (with bucket & prefix params)
- [x] `GET /api/objects/metadata` - Get object metadata
- [x] `GET /api/objects/download` - Download object with streaming
- [ ] Add proper TypeScript schemas (remove `any` types)
- [ ] Add request/response validation
- [ ] Add proper error responses

### Mutating Routes (Admin Mode Only)

- [ ] `POST /api/objects/upload` - Upload object
- [ ] `DELETE /api/objects` - Delete object
- [ ] `POST /api/buckets` - Create bucket
- [ ] `DELETE /api/buckets` - Delete bucket
- [ ] Conditionally register mutating routes based on mode
- [ ] Emit events for all mutating operations
- [ ] Add confirmation/validation for destructive actions

### Route Organization

- [x] Separate route files by responsibility
- [x] Group read routes separately
- [ ] Create `objects.mutate.route.ts` for mutating object operations
- [ ] Create `buckets.mutate.route.ts` for mutating bucket operations

---

## 6. Event System

### Event Definitions

- [ ] Create event types module (`events/event.types.ts`)
- [ ] Define `bucket:created` event payload
- [ ] Define `bucket:deleted` event payload
- [ ] Define `object:uploaded` event payload
- [ ] Define `object:deleted` event payload

### Event Emission

- [ ] Emit `bucket:created` in createBucket operations
- [ ] Emit `bucket:deleted` in deleteBucket operations
- [ ] Emit `object:uploaded` in putObjectStream operations
- [ ] Emit `object:deleted` in deleteObject operations
- [ ] Integrate event emission in storage provider or routes

### Future Event Features

- [ ] Server-Sent Events (SSE) for UI updates
- [ ] Audit logging via events
- [ ] Worker thread integration (future)

---

## 7. Security Implementation

### Path Traversal Protection

- [ ] Implement path sanitization utilities
- [ ] Validate bucket names (no `..`, no absolute paths)
- [ ] Validate object keys (no `..`, no absolute paths)
- [ ] Validate prefixes (no `..`, no absolute paths)
- [ ] Check resolved paths stay within root directory
- [ ] Handle symlink protection
- [ ] Filter hidden/system files in listings

### Authentication & Authorization

- [x] Admin mode requires explicit opt-in
- [x] Token-based authentication for admin mode
- [x] Global authentication enforcement in admin mode
- [ ] Add authentication error handling
- [ ] Add token validation utilities

### Security Best Practices

- [x] View mode is default
- [x] Mutating routes not registered in view mode (structure ready, routes missing)
- [x] Server binds to localhost by default
- [ ] Add rate limiting (future)
- [ ] Add CORS configuration if needed

---

## 8. Frontend UI

### UI Setup

- [x] Set up Vite + React + TypeScript
- [x] Configure Vite proxy for API
- [x] Create basic App component
- [x] Set up API client (`api/client.ts`)

### UI Features (View Mode)

- [x] Display list of buckets
- [x] Display list of objects in selected bucket
- [x] Download functionality
- [ ] File-system-like tree view
- [ ] Metadata details panel
- [ ] Mode indicator (View/Admin)
- [ ] Loading states and error handling
- [ ] Better styling and UX

### UI Features (Admin Mode)

- [ ] Detect mode from API/config
- [ ] Show mutation controls (upload, delete)
- [ ] Upload file interface
- [ ] Delete confirmation dialogs
- [ ] Create bucket interface
- [ ] Delete bucket interface
- [ ] Admin mode indicator

### UI Build & Integration

- [ ] Build UI as static assets
- [ ] Create script to copy UI assets to server
- [ ] Update UI plugin to serve static assets
- [ ] Embed UI in npm package
- [ ] Test UI integration with backend

---

## 9. TypeScript & Code Quality

### Type Safety

- [x] Enable TypeScript strict mode
- [ ] Remove all `any` type usage
- [ ] Add proper Fastify request/response types
- [ ] Add typed route schemas
- [ ] Create shared types package (`packages/shared-types/`)
    - [ ] `storage.types.ts`
    - [ ] `api.types.ts`
    - [ ] `events.types.ts`

### Code Quality

- [ ] Add ESLint rules
- [ ] Add Prettier formatting
- [ ] Fix all linting errors
- [ ] Add JSDoc comments for public APIs
- [ ] Ensure no synchronous I/O in request lifecycle

---

## 10. Testing

### Test Setup

- [ ] Set up Vitest or Jest
- [ ] Configure test environment
- [ ] Create test utilities and mocks

### Unit Tests

- [ ] Test LocalFilesystemProvider
- [ ] Test path traversal protection
- [ ] Test storage operations
- [ ] Test plugin registration

### Integration Tests

- [ ] Test API routes (read operations)
- [ ] Test API routes (mutating operations)
- [ ] Test authentication flow
- [ ] Test mode-based route registration
- [ ] Test event emission

### Mock Providers

- [ ] Create mock StorageProvider for testing
- [ ] Use mocks in API route tests

---

## 11. NPM Package Distribution ⚠️ CRITICAL

**Goal**: Publish as a single npm package `object-explorer` with embedded UI (Swagger UI style)

### Package Configuration

- [ ] **Rename package from "explorer-server" to "object-explorer"**
- [ ] Configure `package.json` with correct name, version, description
- [ ] Set `main` entry point to compiled `dist/index.js`
- [ ] Add `types` entry point to `dist/index.d.ts`
- [ ] Configure `exports` field for ESM/CJS compatibility
- [ ] Add `files` field to include only necessary files
- [ ] Set proper `engines` field (Node.js LTS)
- [ ] Add repository, keywords, author, license fields
- [ ] Configure `bin` field if CLI needed (optional)

### TypeScript Build Configuration

- [x] Configure `tsconfig.json` with `outDir: "./dist"`
- [ ] Add `declaration: true` for TypeScript definitions
- [ ] Configure `declarationMap: true` for source maps
- [ ] Set up proper module resolution (ESM/CJS)
- [ ] Test TypeScript compilation produces correct output

### UI Build & Embedding

- [ ] Configure Vite build to output static assets
- [ ] Set Vite `base` path for embedded serving
- [ ] Build UI to a specific directory (e.g., `dist/ui/` or `dist/public/`)
- [ ] Create build script: `build:ui` in explorer-ui
- [ ] Create script to copy UI assets to server package
- [ ] Update UI plugin to serve from embedded location
- [ ] Test UI loads correctly when embedded

### Build Scripts

- [ ] Create `build` script in explorer-server package.json
    - [ ] Compile TypeScript (`tsc`)
    - [ ] Build UI (`pnpm --filter @object-explorer/ui build`)
    - [ ] Copy UI assets to dist/
- [ ] Create `build:server` script (TypeScript only)
- [ ] Create `build:ui` script (UI only)
- [ ] Create `build:all` script at root (builds everything)
- [ ] Add `prepublishOnly` script for pre-publish checks
- [ ] Add `clean` script to remove dist/ folders

### File Inclusion/Exclusion

- [ ] Create `.npmignore` file
    - [ ] Exclude `src/` (source files)
    - [ ] Exclude `apps/explorer-ui/` (UI source)
    - [ ] Exclude `node_modules/`
    - [ ] Exclude test files
    - [ ] Exclude dev scripts
    - [ ] Include only `dist/`, `package.json`, `README.md`, `LICENSE`
- [ ] Or use `files` field in package.json (preferred)
- [ ] Test `npm pack` produces correct file list

### Package Structure (Final)

```
object-explorer/
├── package.json
├── README.md
├── LICENSE
├── dist/
│   ├── index.js          # Main entry point
│   ├── index.d.ts        # TypeScript definitions
│   ├── explorer.js
│   ├── server/
│   ├── storage/
│   └── ui/               # Embedded UI assets
│       ├── index.html
│       ├── assets/
│       └── ...
└── node_modules/
```

### Single Entry Point

- [x] Public API in `src/index.ts` exports `startObjectExplorer`
- [ ] Ensure compiled `dist/index.js` exports correctly
- [ ] Test import: `import { startObjectExplorer } from 'object-explorer'`
- [ ] Verify default export works
- [ ] Test TypeScript types are available

### Clean Shutdown

- [ ] Implement graceful shutdown in `startObjectExplorer`
- [ ] Handle SIGTERM/SIGINT signals
- [ ] Close Fastify server properly
- [ ] Clean up resources (storage connections, etc.)
- [ ] Return Promise that resolves on shutdown

### Package Publishing

- [ ] Test local installation: `npm install ./apps/explorer-server`
- [ ] Test in a fresh project (create test project)
- [ ] Verify all dependencies are listed correctly
- [ ] Check package size (should be reasonable)
- [ ] Test `npm publish --dry-run`
- [ ] Set up versioning strategy (semver)
- [ ] Configure npm registry (if private)

### Monorepo Publishing Strategy

- [ ] Decide: Publish from monorepo root or apps/explorer-server?
- [ ] If from root: Configure workspace publishing
- [ ] If from apps/explorer-server: Ensure it's self-contained
- [ ] Handle workspace dependencies correctly
- [ ] Ensure UI is bundled (not a dependency)

### Documentation

- [ ] Write comprehensive README.md
    - [ ] Installation instructions
    - [ ] Quick start example
    - [ ] Configuration options
    - [ ] API documentation
    - [ ] Examples for view and admin modes
- [ ] Add LICENSE file
- [ ] Document package exports
- [ ] Add changelog (CHANGELOG.md)
- [ ] Create usage examples in README

### Testing Package

- [ ] Create test project outside monorepo
- [ ] Install package: `npm install object-explorer`
- [ ] Test basic usage (view mode)
- [ ] Test admin mode
- [ ] Verify UI loads and works
- [ ] Test all API endpoints
- [ ] Verify TypeScript types work
- [ ] Test in different Node.js versions

---

## 12. Roadmap Items

### Phase 1 (Current Focus - Core MVP)

- [x] Fastify server bootstrap
- [x] Local filesystem storage provider (basic)
- [x] UI basic viewer (basic)
- [ ] Admin mode security (partial)
- [ ] **NPM package configuration and build** ⚠️ CRITICAL
- [ ] UI embedding into package
- [ ] Event streaming (SSE) - pending

### Phase 2 (Future Enhancements)

- [ ] S3 provider implementation
- [ ] Comprehensive testing
- [ ] Advanced features and optimizations
- [ ] Extended documentation and examples

---

## 13. Critical Issues to Resolve

### High Priority

1. [ ] **NPM Package Configuration** - Package not configured for publishing (name, entry points, build)
2. [ ] **Path traversal vulnerability** - Security risk in LocalFilesystemProvider
3. [ ] **Missing mutating routes** - Core admin mode functionality incomplete
4. [ ] **Events not emitted** - Audit trail missing
5. [ ] **UI not embedded** - Not production-ready (must be bundled in npm package)
6. [ ] **Type safety issues** - `any` usage violates requirements

### Medium Priority

6. [ ] Error handling not centralized
7. [ ] Configuration validation missing
8. [ ] Streaming uses `pipe()` instead of `pipeline()`
9. [ ] UI doesn't adapt to mode

### Low Priority

10. [ ] Missing test suite
11. [ ] Documentation incomplete (README needs npm package usage)
12. [ ] Build scripts not configured (critical for npm package)

---

## Progress Summary

**Overall Completion: ~60-65%**

- ✅ **Completed**: Core infrastructure, plugin system, read-only routes, storage providers (local + S3), UI (embedded), NPM package configuration
- ⚠️ **Partial**: Storage provider (missing security), auth plugin (missing audit)
- ❌ **Missing**: Mutating routes, event integration, security fixes, error handling

---

## Notes

- Last Updated: [Current Date]
- Focus Areas: S3 support added, security fixes, mutating routes, event system integration
- Next Sprint: Path traversal protection → Mutating routes → Event emission → Build scripts
