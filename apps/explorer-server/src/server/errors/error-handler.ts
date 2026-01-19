import { FastifyInstance } from 'fastify';

/**
 * Registers a global error handler for the Fastify instance.
 */
export function registerErrorHandler(server: FastifyInstance): void {
    server.setErrorHandler((error, _request, reply) => {
        const { statusCode, message } = error as {
            statusCode?: number;
            message?: string;
        };
        const resolvedStatusCode = statusCode || 500;
        const resolvedMessage = message || 'Internal Server Error';

        server.log.error({ error }, 'Unhandled error occurred');

        reply.status(resolvedStatusCode).send({
            status: 'error',
            message: resolvedMessage,
        });
    });
}
