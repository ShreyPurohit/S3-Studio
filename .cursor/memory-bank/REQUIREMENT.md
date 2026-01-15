# ObjectExplorer – Requirements & Design Document

## 1. Purpose

ObjectExplorer is a **developer-focused, Swagger-style viewer for object storage systems** (inspired by AWS S3). It provides a **read-only, secure-by-default UI** that allows developers to visually explore buckets and objects, inspect metadata, and download files, with **explicit opt-in for mutations** (admin mode).

The tool is designed as an **npm package** that can be embedded into any Node.js application and exposes its own server and UI on a configurable port.

---

## 2. Core Design Principles

1. **View-first, mutation-guarded**
    - Read-only mode by default
    - Mutations require explicit admin mode

2. **Security by construction**
    - Mutating APIs do not exist unless enabled
    - Strong authentication for admin mode
    - Auditability for all destructive actions

3. **Streaming-first architecture**
    - No buffering of large files
    - All uploads/downloads use Node.js streams

4. **Pluggable & extensible**
    - Storage providers are abstracted
    - Future providers can be added without API changes

5. **Developer productivity**
    - Zero/low configuration
    - Embedded UI
    - Swagger-like experience

---

## 3. Technology Stack (Finalized)

### Monorepo & Tooling

- **pnpm** (package manager + workspaces)
- Monorepo structure

### Backend

- **Node.js (LTS)**
- **TypeScript**
- **Fastify** (HTTP server)
- Node.js Streams
- EventEmitter

### Frontend (UI)

- **Vite**
- **React + TypeScript**
- Static build embedded into backend

### Development Tooling

- ESLint
- Prettier
- TypeScript strict mode
- Vitest / Jest (later phase)

---

## 4. Package Distribution

- Published as a **single npm package**: `object-explorer`
- UI bundled inside the package (Swagger UI style)
- Public API exposed via a single entry function

Example usage:

```ts
import { startObjectExplorer } from 'object-explorer';

startObjectExplorer({
    port: 4570,
    mode: 'view',
    storage: {
        provider: 'local',
        rootDir: '/data',
    },
});
```

---

## 5. Modes of Operation

### 5.1 View Mode (Default)

- No authentication required (localhost only)
- Allowed actions:
    - List buckets
    - Browse objects
    - View metadata
    - Download objects

- Disallowed actions:
    - Upload
    - Delete
    - Create buckets

### 5.2 Admin Mode (Explicit Opt-In)

- Requires authentication
- Mutating APIs are registered only in this mode
- Audit logging enabled
- UI exposes mutation controls

---

## 6. Public API (Node.js)

### Entry Function

```ts
startObjectExplorer(config: ObjectExplorerConfig): Promise<FastifyInstance>
```

### Key Configuration Options

- `port`
- `mode: 'view' | 'admin'`
- `storage` (provider configuration)
- `auth` (admin mode only)
- `logging`
- `ui` (read-only, title)

---

## 7. Backend Architecture

### Core Components

- Fastify server factory (`createServer`)
- Storage plugin (dependency injection)
- Event system plugin (EventEmitter)
- Auth plugin (admin mode only)
- UI static serving plugin
- Route modules (read vs mutate)

### Key Architectural Decisions

- Plugin-based Fastify setup
- Mode-based route registration
- No global state
- Test-friendly dependency injection

---

## 8. Storage Provider Abstraction

### StorageProvider Interface

Key characteristics:

- Stream-based uploads/downloads
- AsyncIterable for listings
- Storage-agnostic

Supported operations:

- listBuckets
- createBucket
- deleteBucket
- listObjects
- headObject
- getObjectStream
- putObjectStream
- deleteObject

### Planned Providers

1. LocalFilesystemStorageProvider (first implementation)
2. S3StorageProvider (later)
3. MinIO (optional)

---

## 9. Backend API Endpoints

### Read-Only Endpoints (Always Available)

- `GET /api/health`
- `GET /api/buckets`
- `GET /api/objects`
- `GET /api/objects/metadata`
- `GET /api/objects/download`

### Mutating Endpoints (Admin Mode Only)

- `POST /api/objects/upload`
- `DELETE /api/objects`
- `POST /api/buckets`
- `DELETE /api/buckets`

Mutating endpoints are **not registered** in view mode.

---

## 10. UI Requirements (MVP)

### UI Characteristics

- File-system–like tree view
- Bucket → folder → file navigation
- Metadata details panel
- Download support
- Clear mode indicator (View / Admin)

### UI Restrictions

- No mutation controls in view mode
- Destructive actions require confirmation in admin mode

---

## 11. Security Requirements

- View-only by default
- Admin mode requires explicit config
- Authentication enforced globally in admin mode
- Mutating routes not exposed unless enabled
- Localhost-only binding by default

---

## 12. Event System

- Internal EventEmitter

- Events emitted for:
    - bucket:created
    - bucket:deleted
    - object:uploaded
    - object:deleted

- Future use:
    - SSE for UI updates
    - Audit logging
    - Worker threads

---

## 13. Non-Goals (Explicit)

- Not an S3-compatible API
- No global replication
- No multi-region support
- No public exposure
- No attempt to replace AWS S3

---

## 14. Roadmap (High-Level)

1. Fastify server bootstrap (DONE – design)
2. Local filesystem storage provider
3. UI basic viewer
4. Admin mode security
5. Event streaming (SSE)
6. S3 provider
7. Tests & packaging
8. Documentation & examples

---

## 15. Evaluation Positioning

This project demonstrates:

- Advanced Node.js internals
- Secure-by-default architecture
- Stream-based design
- Plugin & tooling mindset
- Real-world developer experience design

---

## 16. Implementation Rules & Engineering Guidelines

This section defines **non-negotiable implementation rules** to ensure consistency, security, and evaluation-grade quality.

### 16.1 General Engineering Rules

- TypeScript **strict mode enabled**
- No usage of `any`
- No synchronous filesystem or network calls in request lifecycle
- All I/O must be async and/or stream-based
- No global mutable state
- All side effects must be injected via plugins or constructors

---

### 16.2 Storage Provider Rules

- Providers must implement the `StorageProvider` interface
- Providers **must not** know about HTTP, Fastify, or UI
- All object operations must be stream-based
- Object listings must return `AsyncIterable`

#### Filesystem Provider Specific Rules

- Root directory must be sandboxed
- Prevent path traversal (`..`, symlinks outside root)
- Prefixes map to folders
- Buckets map to top-level directories
- Hidden/system files must be ignored

---

### 16.3 Streaming Rules

- Never load full files into memory
- Downloads must use `pipeline()`
- Uploads must accept `Readable` streams
- Metadata operations must not trigger full reads

---

### 16.4 Security Rules

- View mode is default and immutable at runtime
- Mutating routes must not be registered in view mode
- Admin mode must enforce authentication globally
- Destructive actions must emit audit events
- Server binds to localhost by default

---

### 16.5 Backend API Rules

- Routes must be grouped by responsibility
- Read and mutate routes must be in separate modules
- No direct access to storage outside Fastify context
- All errors must be normalized and centrally handled

---

### 16.6 UI Integration Rules

- UI must be static (no runtime server)
- UI must communicate only via public APIs
- UI must not assume a specific storage provider
- UI must adapt to mode (view/admin)

---

### 16.7 Event System Rules

- All mutating operations emit events
- Event names must be namespaced (`object:*`, `bucket:*`)
- Event system must be storage-agnostic

---

### 16.8 Testing Rules (Phase-wise)

- Unit tests for storage providers
- Integration tests for API routes
- Mock providers used for API testing
- No real cloud calls in test suite

---

### 16.9 Packaging Rules

- No build-time assumptions about consumer environment
- UI assets bundled in package
- Single public entry point
- Clean shutdown supported

---

### 16.10 Performance Rules

- No unnecessary JSON serialization
- Large listings should support pagination
- Avoid blocking the event loop
- Prepare architecture for worker threads
