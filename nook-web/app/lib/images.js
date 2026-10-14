// Pictures uploaded through the admin site live on the API server and are stored
// in the DB as '/uploads/<file>'. Built-in pictures are '/assets/...' on this site.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';

export const isUploaded = (url) => url?.startsWith('/uploads/');

export const imageSrc = (url) => (isUploaded(url) ? `${API_URL}${url}` : url);
