const API_PREFIX = '/api';

export async function listBuckets(): Promise<string[]> {
    const res = await fetch(`${API_PREFIX}/buckets`);
    if (!res.ok) throw new Error('failed to list buckets');
    const data = await res.json();
    return data.buckets ?? [];
}

export async function listObjects(
    bucket: string,
    prefix?: string
): Promise<string[]> {
    const params = new URLSearchParams();
    params.set('bucket', bucket);
    if (prefix) params.set('prefix', prefix);
    const res = await fetch(`${API_PREFIX}/objects?${params.toString()}`);
    if (!res.ok) throw new Error('failed to list objects');
    const data = await res.json();
    return data.objects ?? [];
}

export function getDownloadUrl(bucket: string, key: string): string {
    const params = new URLSearchParams();
    params.set('bucket', bucket);
    params.set('key', key);
    return `${API_PREFIX}/objects/download?${params.toString()}`;
}
