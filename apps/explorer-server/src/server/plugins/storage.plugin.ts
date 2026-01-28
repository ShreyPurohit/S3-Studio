import { FastifyPluginAsync } from 'fastify';
import { StorageProvider } from '../../storage/StorageProvider';
import LocalFilesystemProvider from '../../storage/providers/local/LocalFilesystemProvider';
import S3StorageProvider from '../../storage/providers/s3/S3StorageProvider';
import { StorageConfig } from '../../types';

// Import routes to register them in the same context
import bucketsReadRoute from '../routes/buckets.read.route';
import objectsReadRoute from '../routes/objects.read.route';

declare module 'fastify' {
    interface FastifyInstance {
        storage: StorageProvider;
    }
}

const storagePlugin: FastifyPluginAsync<{
    storage: StorageConfig;
}> = async (fastify, opts) => {
    // Minimal registration - only local provider for now
    fastify.log.info({ storageOptions: opts }, 'storage plugin options');
    if (!opts || !opts.storage) {
        throw new Error('storage plugin options missing');
    }
    if (opts.storage.provider === 'local') {
        if (!opts.storage.rootDir)
            throw new Error('storage.rootDir is required for local provider');
        const provider = new LocalFilesystemProvider(opts.storage.rootDir);
        fastify.decorate('storage', provider);

        // Register routes in the same plugin context so they can access the storage
        console.log(
            '🔧 Registering storage-related routes for local provider...'
        );
        await fastify.register(bucketsReadRoute, { prefix: '/api' });
        await fastify.register(objectsReadRoute, { prefix: '/api' });

        fastify.log.info(
            { root: opts.storage.rootDir },
            'local storage provider initialized'
        );
    } else if (opts.storage.provider === 's3') {
        const { region, accessKeyId, secretAccessKey, endpoint } = opts.storage;
        if (!region || !accessKeyId || !secretAccessKey) {
            throw new Error(
                'region, accessKeyId, and secretAccessKey are required for S3 provider'
            );
        }

        try {
            const provider = new S3StorageProvider({
                region,
                accessKeyId,
                secretAccessKey,
                endpoint,
            });
            fastify.decorate('storage', provider);

            // Register routes in the same plugin context so they can access the storage
            await fastify.register(bucketsReadRoute, { prefix: '/api' });
            await fastify.register(objectsReadRoute, { prefix: '/api' });

            fastify.log.info(
                { region, endpoint },
                'S3 storage provider initialized'
            );
        } catch (error) {
            console.error(
                '❌ Failed to initialize S3 storage provider:',
                error
            );
            throw error;
        }
    } else {
        throw new Error(
            `Unsupported storage provider: ${opts.storage.provider}`
        );
    }
};

export default storagePlugin;
