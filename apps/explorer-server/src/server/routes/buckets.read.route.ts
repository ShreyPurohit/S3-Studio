import { FastifyPluginAsync } from 'fastify';

const bucketsReadRoute: FastifyPluginAsync = async (fastify) => {
    fastify.get('/buckets', async (request, reply) => {
        const storage = (fastify as any).storage;
        console.log('🔍 Route checking storage:', {
            hasStorage: !!storage,
            storageType: typeof storage,
        });
        fastify.log.info(
            { hasStorage: !!storage },
            'checking storage in route'
        );
        if (!storage) {
            fastify.log.error('storage not available on fastify instance');
            return reply.status(500).send({ error: 'storage not configured' });
        }
        const buckets: string[] = [];
        for await (const b of storage.listBuckets()) {
            buckets.push(b);
        }
        return { buckets };
    });
};

export default bucketsReadRoute;
