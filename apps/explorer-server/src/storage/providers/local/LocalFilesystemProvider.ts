import { StorageProvider, ObjectMetadata } from '../../StorageProvider';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

function sanitizeRoot(root: string) {
    return path.resolve(root);
}

export default class LocalFilesystemProvider implements StorageProvider {
    private root: string;

    constructor(rootDir: string) {
        this.root = sanitizeRoot(rootDir);
    }

    async *listBuckets(): AsyncIterable<string> {
        const dir = await fs.promises.opendir(this.root);
        for await (const dirent of dir) {
            if (dirent.isDirectory()) yield dirent.name;
        }
    }

    async createBucket(name: string): Promise<void> {
        const p = path.join(this.root, name);
        await fs.promises.mkdir(p, { recursive: true });
    }

    async deleteBucket(name: string): Promise<void> {
        const p = path.join(this.root, name);
        await fs.promises.rm(p, { recursive: true, force: true });
    }

    async *listObjects(bucket: string, prefix?: string): AsyncIterable<string> {
        const bucketPath = path.join(this.root, bucket, prefix ?? '');
        try {
            const dir = await fs.promises.opendir(bucketPath);
            for await (const dirent of dir) {
                if (dirent.isFile()) yield dirent.name;
            }
        } catch (err) {
            // ignore missing directories
            return;
        }
    }

    async headObject(
        bucket: string,
        key: string
    ): Promise<ObjectMetadata | null> {
        const p = path.join(this.root, bucket, key);
        try {
            const stat = await fs.promises.stat(p);
            return { size: stat.size, lastModified: stat.mtime };
        } catch (err) {
            return null;
        }
    }

    async getObjectStream(bucket: string, key: string): Promise<Readable> {
        const p = path.join(this.root, bucket, key);
        return fs.createReadStream(p);
    }

    async putObjectStream(
        bucket: string,
        key: string,
        stream: Readable
    ): Promise<void> {
        const p = path.join(this.root, bucket, key);
        await fs.promises.mkdir(path.dirname(p), { recursive: true });
        const dest = fs.createWriteStream(p);
        await new Promise<void>((resolve, reject) => {
            stream.pipe(dest);
            dest.on('finish', () => resolve());
            dest.on('error', reject);
            stream.on('error', reject);
        });
    }

    async deleteObject(bucket: string, key: string): Promise<void> {
        const p = path.join(this.root, bucket, key);
        await fs.promises.rm(p, { force: true });
    }
}
