import { FastifyPluginAsync } from 'fastify';
import { createApiResponse } from '../utils/api-response';

const objectsReadRoute: FastifyPluginAsync = async (fastify) => {
    // List objects: GET /objects?bucket=&prefix=
    fastify.get('/objects', async (request, reply) => {
        const bucket = (request.query as { bucket?: string }).bucket;
        const prefix = (request.query as { prefix?: string }).prefix;
        if (!bucket)
            return reply
                .status(400)
                .send(
                    createApiResponse('error', 'bucket query param required')
                );

        const storage = fastify.storage;
        if (!storage)
            return reply
                .status(500)
                .send(createApiResponse('error', 'storage not configured'));

        const groupedObjects: Record<string, string[]> = {};

        for await (const k of storage.listObjects(bucket, prefix)) {
            const parts = k.split('/');
            const folder = parts.slice(0, -1).join('/') + '/';
            const fileName = parts[parts.length - 1];

            if (!groupedObjects[folder]) {
                groupedObjects[folder] = [];
            }

            if (fileName) {
                groupedObjects[folder].push(fileName);
            }
        }

        return reply.send(
            createApiResponse('success', 'Objects retrieved', {
                bucket,
                objects: groupedObjects,
            })
        );
    });

    // Head metadata: GET /objects/metadata?bucket=&key=
    fastify.get('/objects/metadata', async (request, reply) => {
        const bucket = (request.query as { bucket?: string }).bucket;
        const key = (request.query as { key?: string }).key;
        if (!bucket || !key)
            return reply
                .status(400)
                .send(createApiResponse('error', 'bucket and key required'));

        const storage = fastify.storage;
        if (!storage)
            return reply
                .status(500)
                .send(createApiResponse('error', 'storage not configured'));

        const meta = await storage.headObject(bucket, key);
        if (!meta)
            return reply
                .status(404)
                .send(createApiResponse('error', 'not found'));

        return reply.send(
            createApiResponse('success', 'Metadata retrieved', {
                metadata: meta,
            })
        );
    });

    // Download object: GET /objects/download?bucket=&key=
    fastify.get('/objects/download', async (request, reply) => {
        const bucket = (request.query as { bucket?: string }).bucket;
        const key = (request.query as { key?: string }).key;
        if (!bucket || !key)
            return reply
                .status(400)
                .send(createApiResponse('error', 'bucket and key required'));

        const storage = fastify.storage;
        if (!storage)
            return reply
                .status(500)
                .send(createApiResponse('error', 'storage not configured'));

        const meta = await storage.headObject(bucket, key);
        if (!meta)
            return reply
                .status(404)
                .send(createApiResponse('error', 'not found'));

        const stream = await storage.getObjectStream(bucket, key);

        if (meta.contentType) reply.header('content-type', meta.contentType);
        if (meta.size) reply.header('content-length', String(meta.size));

        return reply.send(stream);
    });
};

export default objectsReadRoute;
