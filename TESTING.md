# Testing S3 Studio Locally

This guide shows how to test the `s3-studio` package locally before publishing using `pnpm link`.

## Method 1: Using `pnpm link` (Recommended)

### Step 1: Build the Package

First, make sure the package is built:

```bash
pnpm build
```

This will:

- Compile TypeScript to `apps/explorer-server/dist/`
- Build the UI to `apps/explorer-server/dist/ui/`
- Copy UI assets

### Step 2: Create a Link from the Package Root

From the `S3-Studio` root directory:

```bash
pnpm link --global
```

Or if you prefer a local link:

```bash
pnpm link
```

This creates a symlink that other projects can use.

### Step 3: Create a Test Project

Create a new directory for testing (outside the monorepo):

```bash
mkdir test-s3-studio
cd test-s3-studio
npm init -y
# or: pnpm init
```

### Step 4: Link the Package in Your Test Project

In your test project directory:

```bash
pnpm link --global s3-studio
```

Or if you used local link:

```bash
pnpm link s3-studio
```

### Step 5: Test the Package

Create a test file `test.js`:

```javascript
import { startObjectExplorer } from 's3-studio';

async function test() {
    const server = await startObjectExplorer({
        port: 4570,
        mode: 'view',
        storage: {
            provider: 'local',
            rootDir: './test-data',
        },
    });

    console.log('✅ S3 Studio running at http://localhost:4570');
}

test().catch(console.error);
```

Create test data:

```bash
mkdir -p test-data/bucket1
echo "Hello World" > test-data/bucket1/test.txt
```

Run it:

```bash
node test.js
```

### Step 6: Make Changes and Rebuild

When you make changes to the source code:

1. **Rebuild the package:**

    ```bash
    cd /path/to/S3-Studio
    pnpm build
    ```

2. **Restart your test project** - The changes will be reflected automatically!

### Step 7: Unlink When Done

When you're finished testing:

**In your test project:**

```bash
pnpm unlink s3-studio
```

**In the package root:**

```bash
pnpm unlink --global
```

---

## Method 2: Using `pnpm link` with Workspace (Alternative)

If you want to test within the monorepo itself:

### Step 1: Create a Test App in the Monorepo

Create `apps/test-app/package.json`:

```json
{
    "name": "test-app",
    "version": "1.0.0",
    "type": "module",
    "dependencies": {
        "s3-studio": "workspace:*"
    }
}
```

### Step 2: Install Dependencies

```bash
pnpm install
```

The workspace protocol (`workspace:*`) will automatically link to your local package.

### Step 3: Use It

Create `apps/test-app/test.js`:

```javascript
import { startObjectExplorer } from 's3-studio';

// ... same as above
```

---

## Method 3: Using `file:` Protocol (Simple Alternative)

In your test project's `package.json`:

```json
{
    "dependencies": {
        "s3-studio": "file:../S3-Studio"
    }
}
```

Then:

```bash
pnpm install
```

**Note:** You'll need to rebuild the package after changes and reinstall.

---

## Troubleshooting

### "Cannot find module 's3-studio'"

- Make sure you've built the package: `pnpm build`
- Make sure the link was created: `pnpm link --global`
- Check that `apps/explorer-server/dist/index.js` exists

### Changes not reflecting

- Rebuild the package: `pnpm build`
- Restart your test application
- If using `file:` protocol, reinstall: `pnpm install`

### Module resolution errors

- Make sure your test project has `"type": "module"` in `package.json` if using ESM
- Or use `.mjs` extension for ESM files
- Or use CommonJS with `.cjs` extension

---

## Quick Test Script

Here's a complete test script you can use:

```javascript
// test.js
import { startObjectExplorer } from 's3-studio';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

// Create test data if it doesn't exist
if (!existsSync('./test-data')) {
    mkdirSync('./test-data', { recursive: true });
    mkdirSync('./test-data/bucket1', { recursive: true });
    writeFileSync('./test-data/bucket1/test.txt', 'Hello from S3 Studio!');
    console.log('✅ Created test data');
}

// Start S3 Studio
startObjectExplorer({
    port: 4570,
    mode: 'view',
    storage: {
        provider: 'local',
        rootDir: './test-data',
    },
})
    .then(() => {
        console.log('✅ S3 Studio running at http://localhost:4570');
        console.log('📁 Test data in ./test-data');
        console.log('🌐 Open http://localhost:4570 in your browser');
    })
    .catch((err) => {
        console.error('❌ Error:', err);
        process.exit(1);
    });
```

Run it:

```bash
node test.js
```

---

## Best Practices

1. **Always build before linking** - Make sure `pnpm build` completes successfully
2. **Test in a separate directory** - Don't test within the monorepo to avoid confusion
3. **Use a simple test project** - Keep it minimal to focus on the package itself
4. **Test both ESM and CommonJS** - If your package supports both
5. **Clean up links** - Unlink when done to avoid conflicts

---

## Next Steps

Once local testing passes:

1. Test with `npm pack` to see what will be published
2. Test installing from the packed tarball
3. Consider publishing to a test registry (like `npm` with a scoped package)
4. Finally, publish to the public registry
