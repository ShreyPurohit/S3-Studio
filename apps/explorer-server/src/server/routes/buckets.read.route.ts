import { FastifyPluginAsync } from 'fastify';
import { createApiResponse } from '../utils/api-response';

const bucketsReadRoute: FastifyPluginAsync = async (fastify) => {
    fastify.get('/buckets', async (request, reply) => {
        const storage = fastify.storage;
        if (!storage) {
            fastify.log.error('storage not available on fastify instance');
            return reply
                .status(500)
                .send(createApiResponse('error', 'storage not configured'));
        }
        const buckets: string[] = [];
        for await (const b of storage.listBuckets()) {
            buckets.push(b);
        }
        return reply.send(
            createApiResponse('success', 'Buckets retrieved', { buckets })
        );
    });
};

export default bucketsReadRoute;
