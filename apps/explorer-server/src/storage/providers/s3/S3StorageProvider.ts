import { StorageProvider, ObjectMetadata } from '../../StorageProvider';
import {
    S3Client,
    ListBucketsCommand,
    CreateBucketCommand,
    DeleteBucketCommand,
    ListObjectsV2Command,
    HeadObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';

export interface S3Config {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    // Optional: custom endpoint for MinIO, LocalStack, etc.
    endpoint?: string;
}

export default class S3StorageProvider implements StorageProvider {
    private s3Client: S3Client;
    private config: S3Config;

    constructor(config: S3Config) {
        this.config = config;
        console.log('🔧 Initializing S3 client with config:', {
            region: config.region,
            hasAccessKey: !!config.accessKeyId,
            hasSecretKey: !!config.secretAccessKey,
            endpoint: config.endpoint,
        });

        try {
            this.s3Client = new S3Client({
                region: config.region,
                credentials: {
                    accessKeyId: config.accessKeyId,
                    secretAccessKey: config.secretAccessKey,
                },
                ...(config.endpoint && {
                    endpoint: config.endpoint,
                    forcePathStyle: true, // Required for MinIO
                }),
            });
            console.log('✅ S3 client initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize S3 client:', error);
            throw error;
        }
    }

    async *listBuckets(): AsyncIterable<string> {
        try {
            console.log('📦 Listing S3 buckets...');
            const command = new ListBucketsCommand({});
            const response = await this.s3Client.send(command);
            console.log('📦 S3 listBuckets response:', {
                bucketCount: response.Buckets?.length || 0,
            });

            if (response.Buckets) {
                for (const bucket of response.Buckets) {
                    if (bucket.Name) {
                        console.log('📦 Found bucket:', bucket.Name);
                        yield bucket.Name;
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error listing S3 buckets:', error);
            throw error; // Re-throw so the API returns the error
        }
    }

    async createBucket(name: string): Promise<void> {
        const region = this.s3Client.config.region as string;
        const command = new CreateBucketCommand({
            Bucket: name,
            // Only add LocationConstraint for regions other than us-east-1
            ...(region !== 'us-east-1' && {
                CreateBucketConfiguration: {
                    LocationConstraint: region as any, // AWS SDK types are complex, using any for now
                },
            }),
        });

        await this.s3Client.send(command);
    }

    async deleteBucket(name: string): Promise<void> {
        const command = new DeleteBucketCommand({
            Bucket: name,
        });

        await this.s3Client.send(command);
    }

    async *listObjects(bucket: string, prefix?: string): AsyncIterable<string> {
        try {
            let continuationToken: string | undefined;

            do {
                const command = new ListObjectsV2Command({
                    Bucket: bucket,
                    Prefix: prefix,
                    ContinuationToken: continuationToken,
                });

                const response = await this.s3Client.send(command);

                if (response.Contents) {
                    for (const object of response.Contents) {
                        if (object.Key) {
                            yield object.Key;
                        }
                    }
                }

                continuationToken = response.NextContinuationToken;
            } while (continuationToken);
        } catch (error) {
            console.error('Error listing objects:', error);
            // Don't yield anything on error
        }
    }

    async headObject(
        bucket: string,
        key: string
    ): Promise<ObjectMetadata | null> {
        try {
            const command = new HeadObjectCommand({
                Bucket: bucket,
                Key: key,
            });

            const response = await this.s3Client.send(command);

            return {
                size: response.ContentLength || 0,
                contentType: response.ContentType,
                lastModified: response.LastModified,
            };
        } catch (error: any) {
            if (
                error.name === 'NotFound' ||
                error.$metadata?.httpStatusCode === 404
            ) {
                return null;
            }
            throw error;
        }
    }

    async getObjectStream(bucket: string, key: string): Promise<Readable> {
        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: key,
        });

        const response = await this.s3Client.send(command);

        if (!response.Body) {
            throw new Error('No body in S3 response');
        }

        // Convert the S3 stream to a Node.js Readable stream
        return response.Body as Readable;
    }

    async putObjectStream(
        bucket: string,
        key: string,
        stream: Readable
    ): Promise<void> {
        // Convert stream to buffer for S3 upload
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
            chunks.push(Buffer.from(chunk));
        }
        const buffer = Buffer.concat(chunks);

        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
        });

        await this.s3Client.send(command);
    }

    async deleteObject(bucket: string, key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
        });

        await this.s3Client.send(command);
    }
}
