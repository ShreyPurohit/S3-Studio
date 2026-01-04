import { FastifyPluginAsync } from 'fastify';

const uiPlugin: FastifyPluginAsync<{ mode?: string }> = async (
    fastify,
    opts
) => {
    fastify.get('/', async (request, reply) => {
        reply
            .type('text/html')
            .send(
                `<html><body><h1>ObjectExplorer UI</h1><p>Mode: ${opts.mode ?? 'view'}</p></body></html>`
            );
    });
};

export default uiPlugin;
