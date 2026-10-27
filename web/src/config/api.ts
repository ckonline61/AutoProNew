import axios from 'axios';
import { normalizeCatalogItem } from './catalog';

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    'https://auto-pro-backend-403346240734.asia-south1.run.app/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => {
    const path = response.config.url?.split('?')[0] || '';
    if (['/services', '/services/categories', '/spare-parts', '/used-cars'].includes(path) && Array.isArray(response.data?.data)) {
      response.data.data = response.data.data.map((item: Record<string, unknown>) => normalizeCatalogItem(path, item));
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
