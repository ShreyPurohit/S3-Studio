// Shared types for the backend

/**
 * Standard API Response structure
 */
export interface ApiResponse<T = unknown> {
    status: 'success' | 'error';
    message: string;
    data?: T;
}

/**
 * Health Check Response
 */
export interface HealthResponse {
    ok: boolean;
}

/**
 * Bucket Information
 */
export interface Bucket {
    name: string;
    createdAt: string; // ISO date string
}

/**
 * Object Information
 */
export interface ObjectInfo {
    name: string;
    size: number; // in bytes
    lastModified: string; // ISO date string
    isFolder: boolean;
}

/**
 * Storage Configuration
 */
export interface StorageConfig {
    provider: 'local' | 's3';
    rootDir?: string; // For local provider
    region?: string; // For S3 provider
    accessKeyId?: string; // For S3 provider
    secretAccessKey?: string; // For S3 provider
    endpoint?: string; // Optional: custom endpoint for S3
    options?: Record<string, unknown>; // Additional options
}

/**
 * Explorer Configuration
 */
export interface ObjectExplorerConfig {
    mode: 'admin' | 'user';
    storage: StorageConfig;
    auth?: {
        token?: string;
    };
}

/**
 * Auth Configuration
 */
export interface AuthConfig {
    token: string;
}
