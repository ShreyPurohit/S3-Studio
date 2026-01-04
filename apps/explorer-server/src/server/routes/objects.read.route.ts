import { FastifyPluginAsync } from 'fastify';
import { pipeline } from 'stream';
import { promisify } from 'util';

const pump = promisify(pipeline);

const objectsReadRoute: FastifyPluginAsync = async (fastify) => {
    // List objects: GET /objects?bucket=&prefix=
    fastify.get('/objects', async (request, reply) => {
        const bucket = (request.query as any).bucket as string | undefined;
        const prefix = (request.query as any).prefix as string | undefined;
        if (!bucket)
            return reply
                .status(400)
                .send({ error: 'bucket query param required' });

        const storage = (fastify as any).storage;
        if (!storage)
            return reply.status(500).send({ error: 'storage not configured' });

        const items: string[] = [];
        for await (const k of storage.listObjects(bucket, prefix)) {
            items.push(k);
        }
        return { bucket, objects: items };
    });

    // Head metadata: GET /objects/metadata?bucket=&key=
    fastify.get('/objects/metadata', async (request, reply) => {
        const bucket = (request.query as any).bucket as string | undefined;
        const key = (request.query as any).key as string | undefined;
        if (!bucket || !key)
            return reply.status(400).send({ error: 'bucket and key required' });
        const storage = (fastify as any).storage;
        if (!storage)
            return reply.status(500).send({ error: 'storage not configured' });

        const meta = await storage.headObject(bucket, key);
        if (!meta) return reply.status(404).send({ error: 'not found' });
        return { metadata: meta };
    });

    // Download object: GET /objects/download?bucket=&key=
    fastify.get('/objects/download', async (request, reply) => {
        const bucket = (request.query as any).bucket as string | undefined;
        const key = (request.query as any).key as string | undefined;
        if (!bucket || !key)
            return reply.status(400).send({ error: 'bucket and key required' });
        const storage = (fastify as any).storage;
        if (!storage)
            return reply.status(500).send({ error: 'storage not configured' });

        const meta = await storage.headObject(bucket, key);
        if (!meta) return reply.status(404).send({ error: 'not found' });

        const stream = await storage.getObjectStream(bucket, key);

        if (meta.contentType) reply.header('content-type', meta.contentType);
        if (meta.size) reply.header('content-length', String(meta.size));

        return reply.send(stream);
    });
};

export default objectsReadRoute;
