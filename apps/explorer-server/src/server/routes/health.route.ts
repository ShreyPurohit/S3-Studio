import { FastifyPluginAsync } from 'fastify';
import { createApiResponse } from '../utils/api-response';

const healthRoute: FastifyPluginAsync = async (fastify) => {
    fastify.get('/health', async (_req, reply) => {
        reply.send(
            createApiResponse('success', 'Health check passed', { ok: true })
        );
    });
};

export default healthRoute;
