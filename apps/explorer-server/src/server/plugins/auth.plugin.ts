import { FastifyPluginAsync } from 'fastify';

const authPlugin: FastifyPluginAsync<{ auth?: { token?: string } }> = async (
    fastify,
    opts
) => {
    // simple global preHandler to enforce admin token if provided
    fastify.addHook('onRequest', async (request, reply) => {
        const expected = opts.auth?.token;
        if (!expected) {
            // no configured token — deny by default in admin mode
            reply.status(401).send({ error: 'admin auth not configured' });
            return;
        }

        const provided = request.headers['x-admin-token'];
        if (provided !== expected) {
            reply.status(401).send({ error: 'invalid admin token' });
            return;
        }
    });
};

export default authPlugin;
