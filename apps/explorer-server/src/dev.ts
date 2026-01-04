import { startObjectExplorer } from './explorer';

const root = process.env.OBJECT_EXPLORER_ROOT ?? './data';

startObjectExplorer({
    port: Number(process.env.PORT ?? 4567),
    mode: 'view',
    storage: { provider: 'local', rootDir: root },
})
    .then(() => console.log('ObjectExplorer running'))
    .catch((err) => {
        console.error('Failed to start ObjectExplorer', err);
        process.exit(1);
    });
