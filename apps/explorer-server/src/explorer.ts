import { FastifyInstance } from 'fastify';
import createServer from './server/createServer';

export type Mode = 'view' | 'admin' | 'user';

export interface ObjectExplorerConfig {
    port?: number;
    host?: string; // defaults to localhost
    mode?: Mode;
    storage:
        | {
              provider: 'local';
              rootDir: string;
          }
        | {
              provider: 's3';
              region: string;
              accessKeyId: string;
              secretAccessKey: string;
              endpoint?: string;
          };
    auth?: {
        token?: string;
    };
}

export async function startObjectExplorer(
    config: ObjectExplorerConfig
): Promise<FastifyInstance> {
    // Adjust the mode property to ensure compatibility with the expected type
    const adjustedConfig: import('./types').ObjectExplorerConfig = {
        ...config,
        mode:
            config.mode === 'admin' || config.mode === 'user'
                ? config.mode
                : 'user', // Ensure only 'admin' or 'user' values are used
        auth: config.auth,
    };

    const server = await createServer(adjustedConfig);

    const host = config.host ?? '127.0.0.1';
    const port = config.port ?? 4570;

    await server.listen({ port, host });
    return server;
}

export default startObjectExplorer;
