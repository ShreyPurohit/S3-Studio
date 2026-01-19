const API_PREFIX = '/api';

export async function listBuckets(): Promise<string[]> {
    const res = await fetch(`${API_PREFIX}/buckets`);
    if (!res.ok) throw new Error('failed to list buckets');
    const data = await res.json();
    if (data.status === 'error') throw new Error(data.message);
    return data.data?.buckets ?? [];
}

export async function listObjects(
    bucket: string,
    prefix?: string
): Promise<{ bucket: string; objects: Record<string, string[]> }> {
    const params = new URLSearchParams();
    params.set('bucket', bucket);
    if (prefix) params.set('prefix', prefix);
    const res = await fetch(`${API_PREFIX}/objects?${params.toString()}`);
    if (!res.ok) throw new Error('failed to list objects');
    const data = await res.json();
    if (data.status === 'error') throw new Error(data.message);
    return data.data; // Extract the actual data from the wrapper
}

export function getDownloadUrl(bucket: string, key: string): string {
    const params = new URLSearchParams();
    params.set('bucket', bucket);
    params.set('key', key);
    return `${API_PREFIX}/objects/download?${params.toString()}`;
}
