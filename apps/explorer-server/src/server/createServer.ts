import Fastify, { FastifyInstance } from 'fastify';
import { ObjectExplorerConfig } from '../types';
import { StorageProvider } from '../storage/StorageProvider';

import authPlugin from './plugins/auth.plugin';
import eventsPlugin from './plugins/events.plugin';
import storagePlugin from './plugins/storage.plugin';
import uiPlugin from './plugins/ui.plugin';

import { registerErrorHandler } from './errors/error-handler';
import healthRoute from './routes/health.route';

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
            {
                hasStorage: !!(
                    server as FastifyInstance & { storage?: StorageProvider }
                ).storage,
            },
            'storage plugin registration status'
        );
    });

    // Transform the auth property to match the expected structure
    const transformedAuth = config.auth
        ? {
              token: Buffer.from(
                  `${config.auth.username}:${config.auth.password}`
              ).toString('base64'),
          }
        : undefined;

    // Auth plugin only if admin mode
    if (config.mode === 'admin') {
        await server.register(authPlugin, { auth: transformedAuth });
    }

    // Register routes (routes that don't depend on storage are registered here)
    await server.register(healthRoute, { prefix: '/api' });
    // bucketsReadRoute and objectsReadRoute are now registered inside the storage plugin

    // Register the global error handler
    registerErrorHandler(server);

    return server;
}
