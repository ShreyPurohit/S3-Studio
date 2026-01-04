import { FastifyPluginAsync } from 'fastify';
import { StorageProvider } from '../../storage/StorageProvider';
import LocalFilesystemProvider from '../../storage/providers/local/LocalFilesystemProvider';

declare module 'fastify' {
    interface FastifyInstance {
        storage: StorageProvider;
    }
}

const storagePlugin: FastifyPluginAsync<{
    storage: { provider: string; rootDir?: string };
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
        fastify.log.info(
            { root: opts.storage.rootDir },
            'local storage provider initialized'
        );
    } else {
        throw new Error('Unsupported storage provider');
    }
};

export default storagePlugin;
