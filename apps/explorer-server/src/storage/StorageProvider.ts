import { Readable } from 'stream';

export interface ObjectMetadata {
    size: number;
    contentType?: string;
    lastModified?: Date;
}

export interface StorageProvider {
    listBuckets(): AsyncIterable<string>;
    createBucket(name: string): Promise<void>;
    deleteBucket(name: string): Promise<void>;

    listObjects(bucket: string, prefix?: string): AsyncIterable<string>;
    headObject(bucket: string, key: string): Promise<ObjectMetadata | null>;
    getObjectStream(bucket: string, key: string): Promise<Readable>;
    putObjectStream(
        bucket: string,
        key: string,
        stream: Readable
    ): Promise<void>;
    deleteObject(bucket: string, key: string): Promise<void>;
}
