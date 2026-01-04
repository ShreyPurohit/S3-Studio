import EventEmitter from 'events';
import { StorageProvider } from '../../storage/StorageProvider';

declare module 'fastify' {
    interface FastifyInstance {
        storage: StorageProvider;
        events: EventEmitter;
    }
}
