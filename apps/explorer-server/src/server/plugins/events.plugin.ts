import { FastifyPluginAsync } from 'fastify';
import EventEmitter from 'events';

declare module 'fastify' {
    interface FastifyInstance {
        events: EventEmitter;
    }
}

const eventsPlugin: FastifyPluginAsync = async (fastify) => {
    const ee = new EventEmitter();
    fastify.decorate('events', ee);
};

export default eventsPlugin;
