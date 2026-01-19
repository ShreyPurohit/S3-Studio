/**
 * Utility function to standardize API responses.
 */
export function createApiResponse<T>(
    status: 'success' | 'error',
    message: string,
    data?: T
): { status: string; message: string; data?: T } {
    return { status, message, data };
}
