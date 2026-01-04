import Fastify, { FastifyInstance } from 'fastify';
import { ObjectExplorerConfig } from '../explorer';

import authPlugin from './plugins/auth.plugin';
import eventsPlugin from './plugins/events.plugin';
import storagePlugin from './plugins/storage.plugin';
import uiPlugin from './plugins/ui.plugin';

import bucketsReadRoute from './routes/buckets.read.route';
import healthRoute from './routes/health.route';
import objectsReadRoute from './routes/objects.read.route';

export default async function createServer(
    config: ObjectExplorerConfig
): Promise<FastifyInstance> {
    const server = Fastify({ logger: true });

    // register common plugins
    await server.register(eventsPlugin);
    await server.register(storagePlugin, { storage: config.storage });
    server.log.info(
        { hasStorage: !!(server as any).storage },
        'storage plugin registration status'
    );

    // UI plugin (serves static UI or placeholder)
    await server.register(uiPlugin, { mode: config.mode });

    // Auth plugin only if admin mode
    if (config.mode === 'admin') {
        await server.register(authPlugin, { auth: config.auth });
    }

    // Register routes
    await server.register(healthRoute, { prefix: '/api' });
    await server.register(bucketsReadRoute, { prefix: '/api' });
    await server.register(objectsReadRoute, { prefix: '/api' });

    return server;
}
