import fastifyStatic from '@fastify/static';
import { FastifyPluginAsync } from 'fastify';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

/**
 * Resolves the UI directory path.
 * In production (compiled), UI is at dist/ui relative to the compiled server code.
 * When running from node_modules (installed package), the UI is in the same directory
 * as the compiled server code.
 *
 * Uses import.meta.url which is available in ESM modules (type: "module").
 */
function getUIPath(): string {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    // When running from built package (in node_modules), UI is alongside the server code
    // When running from local build, UI is two levels up
    const possiblePaths = [
        join(__dirname, 'ui'), // node_modules package structure
        join(__dirname, '../../ui'), // local build structure
    ];

    for (const path of possiblePaths) {
        if (existsSync(path)) {
            return path;
        }
    }

    // Fallback - assume node_modules structure
    return join(__dirname, 'ui');
}

const uiPath = getUIPath();

const uiPlugin: FastifyPluginAsync<{ mode?: string }> = async (
    fastify,
    opts
) => {
    // Check if UI directory exists before attempting to register
    if (!existsSync(uiPath)) {
        fastify.log.warn(
            { uiPath },
            'UI directory not found, serving placeholder. Run "pnpm build" to build the UI.'
        );

        fastify.get('/', async (_request, reply) => {
            return reply.type('text/html').send(
                `<html>
                    <head>
                        <title>S3 Studio</title>
                        <style>
                            body { font-family: system-ui, sans-serif; padding: 2rem; max-width: 600px; margin: 0 auto; }
                            h1 { color: #333; }
                            code { background: #f5f5f5; padding: 0.2em 0.4em; border-radius: 3px; }
                        </style>
                    </head>
                    <body>
                        <h1>S3 Studio UI</h1>
                        <p><strong>Mode:</strong> ${opts.mode ?? 'view'}</p>
                        <p><em>UI is not built. Run <code>pnpm build</code> to build the UI.</em></p>
                    </body>
                </html>`
            );
        });
        return;
    }

    // Register static file serving for embedded UI
    try {
        await fastify.register(fastifyStatic, {
            root: uiPath,
            prefix: '/', // Serve from root
            // Don't serve index.html automatically, we'll handle it
            index: false,
        });

        // Serve index.html for root path
        fastify.get('/', async (_request, reply) => {
            return reply.sendFile('index.html', uiPath);
        });

        fastify.log.info({ uiPath }, 'UI static files registered successfully');
    } catch (err: unknown) {
        const error = err as Error & { code?: string };
        fastify.log.error(
            { uiPath, error: error.message, code: error.code },
            'Failed to register UI static files'
        );

        // Fallback to placeholder on registration error
        fastify.get('/', async (_request, reply) => {
            return reply.type('text/html').send(
                `<html>
                    <body>
                        <h1>S3 Studio UI</h1>
                        <p>Mode: ${opts.mode ?? 'view'}</p>
                        <p><em>Error loading UI: ${error.message}</em></p>
                    </body>
                </html>`
            );
        });
    }
};

export default uiPlugin;
