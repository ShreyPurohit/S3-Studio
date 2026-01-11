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

    // UI plugin (serves static UI or placeholder)
    await server.register(uiPlugin, { mode: config.mode });

    // Check storage after all plugins are registered
    server.ready(() => {
        server.log.info(
            { hasStorage: !!(server as any).storage },
            'storage plugin registration status'
        );
    });

    // Auth plugin only if admin mode
    if (config.mode === 'admin') {
        await server.register(authPlugin, { auth: config.auth });
    }

    // Register routes (routes that don't depend on storage are registered here)
    await server.register(healthRoute, { prefix: '/api' });
    // bucketsReadRoute and objectsReadRoute are now registered inside the storage plugin

    return server;
}
