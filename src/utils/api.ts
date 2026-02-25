/**
 * Returns the base API URL with no trailing slash, preventing double-slash URLs
 * when concatenated with /api/... paths.
 */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');
