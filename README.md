# S3 Studio

> Developer-focused, Swagger-style viewer for object storage systems (inspired by AWS S3)

S3 Studio is a **read-only, secure-by-default UI** that allows developers to visually explore buckets and objects, inspect metadata, and download files. It provides an **explicit opt-in for mutations** (admin mode) with strong authentication.

**Works with any Node.js project** - no framework dependencies required. Just install and use!

## Features

- 🎯 **View-first design** - Read-only mode by default
- 🔒 **Secure by construction** - Mutating APIs only available in admin mode
- 📦 **Embedded UI** - Swagger-like experience, no separate deployment needed
- 🚀 **Streaming-first** - Handles large files efficiently without buffering
- 🔌 **Pluggable storage** - Abstract storage providers (currently supports local filesystem)
- ⚡ **Zero configuration** - Works out of the box with sensible defaults

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Modes of Operation](#modes-of-operation)
- [API Reference](#api-reference)
- [Development](#development)
- [Examples](#examples)

---

## Installation

S3 Studio works with **any Node.js project** and **any package manager**. Choose the one you prefer:

**With npm (most common):**

```bash
npm install s3-studio
```

**With yarn:**

```bash
yarn add s3-studio
```

**With pnpm:**

```bash
pnpm add s3-studio
```

> **Note:** The package works identically with any package manager. We use pnpm internally for development, but you can use npm, yarn, or pnpm - it doesn't matter!

### Requirements

- **Node.js >= 18.0.0** (that's it!)
- TypeScript (optional, for TypeScript projects)

**Note:** S3 Studio is framework-agnostic. It runs its own internal server (using Fastify internally), so you don't need to install Fastify, Express, or any other web framework in your project. It works with plain Node.js, Express apps, Next.js, NestJS, or any other Node.js project.

---

## Quick Start

> **Framework Independent:** S3 Studio works with any Node.js project - Express, Fastify, Koa, Next.js, NestJS, or plain Node.js. It runs its own internal server, so you don't need any specific framework installed.

### Basic Usage (View Mode)

```typescript
import { startObjectExplorer } from 's3-studio';

// Start in view mode (read-only)
await startObjectExplorer({
    port: 4570,
    mode: 'view',
    storage: {
        provider: 'local',
        rootDir: './data', // Path to your storage directory
    },
});

console.log('S3 Studio running at http://localhost:4570');
```

### Admin Mode (With Mutations)

```typescript
import { startObjectExplorer } from 's3-studio';

// Start in admin mode (with authentication)
await startObjectExplorer({
    port: 4570,
    mode: 'admin',
    storage: {
        provider: 'local',
        rootDir: './data',
    },
    auth: {
        token: 'your-secret-admin-token', // Required for admin mode
    },
});

console.log('S3 Studio (Admin) running at http://localhost:4570');
```

### Using with CommonJS

```javascript
const { startObjectExplorer } = require('s3-studio');

startObjectExplorer({
    port: 4570,
    mode: 'view',
    storage: {
        provider: 'local',
        rootDir: './data',
    },
});
```

---

## Configuration

### `ObjectExplorerConfig`

| Option             | Type                | Default       | Description                                     |
| ------------------ | ------------------- | ------------- | ----------------------------------------------- |
| `port`             | `number`            | `4570`        | Port number for the server                      |
| `host`             | `string`            | `'127.0.0.1'` | Host to bind to (defaults to localhost)         |
| `mode`             | `'view' \| 'admin'` | `'view'`      | Operation mode                                  |
| `storage`          | `object`            | **Required**  | Storage provider configuration                  |
| `storage.provider` | `'local'`           | **Required**  | Storage provider type                           |
| `storage.rootDir`  | `string`            | **Required**  | Root directory for local filesystem provider    |
| `auth`             | `object`            | -             | Authentication config (required for admin mode) |
| `auth.token`       | `string`            | -             | Admin token for authentication                  |

### Storage Structure

The local filesystem provider expects the following structure:

```
your-storage-root/
├── bucket1/
│   ├── file1.txt
│   ├── file2.jpg
│   └── folder/
│       └── nested-file.pdf
├── bucket2/
│   └── document.docx
└── bucket3/
    └── image.png
```

- **Buckets** = Top-level directories
- **Objects** = Files within bucket directories
- **Prefixes** = Subdirectories within buckets

---

## Modes of Operation

### View Mode (Default)

**No authentication required** - Safe for localhost development.

**Allowed actions:**

- ✅ List buckets
- ✅ Browse objects
- ✅ View metadata
- ✅ Download objects

**Disallowed actions:**

- ❌ Upload files
- ❌ Delete objects
- ❌ Create/delete buckets

### Admin Mode

**Requires authentication** - Use for production or when mutations are needed.

**All View Mode actions, plus:**

- ✅ Upload files
- ✅ Delete objects
- ✅ Create buckets
- ✅ Delete buckets

**Authentication:**

- All requests require `X-Admin-Token` header
- Token must match the configured `auth.token`

**Example request:**

```bash
curl -H "X-Admin-Token: your-secret-admin-token" \
     -X POST http://localhost:4570/api/buckets \
     -d '{"name": "my-bucket"}'
```

---

## API Reference

### `startObjectExplorer(config: ObjectExplorerConfig): Promise<ServerInstance>`

Starts the S3 Studio server and returns the server instance.

**Returns:** Promise that resolves to the server instance (Fastify instance internally, but you don't need to know this)

**Note:** The internal server uses Fastify, but this is an implementation detail. You don't need Fastify installed in your project.

**Example:**

```typescript
const server = await startObjectExplorer({
    port: 4570,
    mode: 'view',
    storage: {
        provider: 'local',
        rootDir: './data',
    },
});

// Server is now running
// You can access it at http://localhost:4570

// Graceful shutdown
process.on('SIGTERM', async () => {
    await server.close();
});
```

### API Endpoints

#### Read-Only Endpoints (Available in all modes)

- `GET /api/health` - Health check
- `GET /api/buckets` - List all buckets
- `GET /api/objects?bucket=<name>&prefix=<prefix>` - List objects in a bucket
- `GET /api/objects/metadata?bucket=<name>&key=<key>` - Get object metadata
- `GET /api/objects/download?bucket=<name>&key=<key>` - Download object

#### Mutating Endpoints (Admin mode only)

- `POST /api/objects/upload` - Upload object
- `DELETE /api/objects?bucket=<name>&key=<key>` - Delete object
- `POST /api/buckets` - Create bucket
- `DELETE /api/buckets?name=<name>` - Delete bucket

---

## Examples

### Example 1: Simple Express Project with npm

**Step 1:** Create a new Express project and install S3 Studio:

```bash
npm init -y
npm install express s3-studio
```

**Step 2:** Create `server.js`:

```javascript
import express from 'express';
import { startObjectExplorer } from 's3-studio';

const app = express();

// Your Express routes
app.get('/', (req, res) => {
    res.json({ message: 'My Express App' });
});

// Start S3 Studio on a separate port (runs its own server internally)
startObjectExplorer({
    port: 4570,
    mode: 'view',
    storage: {
        provider: 'local',
        rootDir: './data',
    },
}).then(() => {
    console.log('✅ S3 Studio running at http://localhost:4570');
});

// Start your Express app
app.listen(3000, () => {
    console.log('✅ Express app running at http://localhost:3000');
});
```

**That's it!** No Fastify needed, no pnpm needed - just npm and Express.

### Example 2: Simple Development Server

```typescript
import { startObjectExplorer } from 's3-studio';

async function main() {
    const server = await startObjectExplorer({
        port: 4570,
        storage: {
            provider: 'local',
            rootDir: process.env.STORAGE_ROOT || './data',
        },
    });

    console.log(`🚀 S3 Studio running at http://localhost:4570`);
}

main().catch(console.error);
```

### Example 3: Admin Mode with Environment Variables

```typescript
import { startObjectExplorer } from 's3-studio';

async function main() {
    const server = await startObjectExplorer({
        port: Number(process.env.PORT) || 4570,
        host: process.env.HOST || '127.0.0.1',
        mode: 'admin',
        storage: {
            provider: 'local',
            rootDir: process.env.STORAGE_ROOT || './data',
        },
        auth: {
            token: process.env.ADMIN_TOKEN || 'change-me-in-production',
        },
    });

    console.log(
        `🔐 S3 Studio (Admin) running at http://${server.server.address()}`
    );
}

main().catch(console.error);
```

### Example 4: Integration with Any Node.js App

S3 Studio runs independently on its own port, so it works alongside any Node.js application:

```typescript
import { startObjectExplorer } from 's3-studio';
import express from 'express'; // or any other framework

async function main() {
    // Start S3 Studio on a separate port
    // It runs its own server internally - no framework needed!
    await startObjectExplorer({
        port: 4570,
        mode: 'view',
        storage: {
            provider: 'local',
            rootDir: './data',
        },
    });

    // Your main application (Express, Fastify, Koa, or plain Node.js)
    const app = express();
    app.get('/api/my-endpoint', (req, res) => {
        res.json({ message: 'Hello from main app' });
    });

    app.listen(3000, () => {
        console.log('Main app: http://localhost:3000');
        console.log('S3 Studio: http://localhost:4570');
    });
}

main().catch(console.error);
```

**Key point:** S3 Studio doesn't require your app to use any specific framework. It runs its own server internally.

### Example 5: Graceful Shutdown

```typescript
import { startObjectExplorer } from 's3-studio';

async function main() {
    const server = await startObjectExplorer({
        port: 4570,
        storage: {
            provider: 'local',
            rootDir: './data',
        },
    });

    // Graceful shutdown
    const shutdown = async () => {
        console.log('Shutting down...');
        await server.close();
        process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
}

main().catch(console.error);
```

---

## Development

> **Note:** This section is for **contributors** who want to develop S3 Studio itself. If you're just using S3 Studio in your project, you don't need this - just install it via npm/yarn/pnpm!

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 10.0.0 (used for monorepo development, but the published package works with any package manager)

### Setup

1. **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd s3-studio
    ```

2. **Install dependencies:**

    ```bash
    pnpm install
    ```

    > Note: We use pnpm for development because it's great for monorepos, but the published package works with npm, yarn, or pnpm.

3. **Build the project:**
    ```bash
    pnpm build
    ```

### Development Scripts

| Command             | Description                                   |
| ------------------- | --------------------------------------------- |
| `pnpm dev`          | Start backend server in development mode      |
| `pnpm dev:ui`       | Start UI development server (with hot reload) |
| `pnpm build`        | Build both backend and frontend               |
| `pnpm build:server` | Build only the backend                        |
| `pnpm build:ui`     | Build only the frontend                       |
| `pnpm clean`        | Remove all build artifacts                    |
| `pnpm format`       | Format code with Prettier                     |
| `pnpm format:check` | Check code formatting                         |

### Project Structure

```
s3-studio/
├── apps/
│   ├── explorer-server/     # Backend server (Fastify)
│   │   ├── src/
│   │   │   ├── index.ts    # Public API entry point
│   │   │   ├── explorer.ts # Main implementation
│   │   │   ├── server/     # Server configuration
│   │   │   └── storage/    # Storage providers
│   │   └── dist/           # Compiled output
│   └── explorer-ui/        # Frontend UI (React + Vite)
│       ├── src/
│       └── dist/           # Built UI (embedded in server)
├── scripts/                # Build and utility scripts
├── package.json            # Root package configuration
└── README.md              # This file
```

### Running in Development

1. **Start the backend:**

    ```bash
    pnpm dev
    ```

    This starts the server at `http://localhost:4570` (default port).

2. **Start the UI (separate dev server):**

    ```bash
    pnpm dev:ui
    ```

    This starts the Vite dev server with hot reload at `http://localhost:5173`.

3. **Create a test data directory:**

    ```bash
    mkdir -p data/bucket1
    echo "Hello World" > data/bucket1/test.txt
    ```

4. **Set environment variables (optional):**
    ```bash
    export OBJECT_EXPLORER_ROOT=./data
    export PORT=4570
    ```

### Building for Production

```bash
# Build everything
pnpm build

# The built files will be in:
# - apps/explorer-server/dist/ (backend)
# - apps/explorer-server/dist/ui/ (embedded UI)
```

### Testing the Build

After building, you can test the production build:

```bash
# Start the built server
node apps/explorer-server/dist/index.js

# Or use the dev script which uses tsx
pnpm dev
```

---

## Security Considerations

1. **Default to View Mode**: The package defaults to read-only mode for safety.

2. **Localhost Binding**: By default, the server binds to `127.0.0.1` (localhost only).

3. **Admin Mode**:
    - Only enable admin mode when mutations are needed
    - Use a strong, randomly generated token
    - Never commit tokens to version control

4. **Path Traversal**: The local filesystem provider should be configured with a dedicated directory to prevent path traversal attacks.

5. **Production Deployment**:
    - Use environment variables for sensitive configuration
    - Consider using a reverse proxy (nginx, Caddy) for HTTPS
    - Implement rate limiting if exposing to the internet

---

## Troubleshooting

### Server won't start

- **Check port availability**: Ensure the port isn't already in use
- **Check storage path**: Verify the `rootDir` exists and is accessible
- **Check Node.js version**: Ensure you're using Node.js >= 18.0.0

### UI not loading

- **Check console**: Look for errors in the browser console
- **Check network tab**: Verify assets are being served correctly
- **Note**: The UI is pre-built and embedded in the package - no build step needed when using the published package

### Admin mode authentication failing

- **Check token**: Ensure the `X-Admin-Token` header matches the configured token
- **Check mode**: Verify the server was started with `mode: 'admin'`
- **Check header name**: Header must be exactly `X-Admin-Token` (case-sensitive)

---

## License

ISC

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.
