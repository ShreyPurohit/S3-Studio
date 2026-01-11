import { FastifyInstance } from 'fastify';
import createServer from './server/createServer';

export type Mode = 'view' | 'admin';

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
    const server = await createServer(config);

    const host = config.host ?? '127.0.0.1';
    const port = config.port ?? 4567;

    await server.listen({ port, host });
    return server;
}

export default startObjectExplorer;
