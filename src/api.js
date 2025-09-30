// Use empty string for development (proxied) or the env var for production
const API_URL = import.meta.env.VITE_API_URL || '';

console.log('API_URL configured as:', API_URL);

export default API_URL;