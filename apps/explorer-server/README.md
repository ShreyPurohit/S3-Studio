# explorer-server (ObjectExplorer)

This folder contains the backend server for ObjectExplorer.

Quick start (development):

1. Install dependencies in this workspace:

```powershell
pnpm install
```

2. Run the dev runner (uses `pnpm dlx` to run TypeScript directly):

```powershell
pnpm dlx tsx src/dev.ts
```

The server will start on `127.0.0.1:4567` by default and serve a minimal UI at `/` and API at `/api`.

Environment variables:

- `OBJECT_EXPLORER_ROOT` — path to local storage root (default `./data`).
- `PORT` — port to listen on.
